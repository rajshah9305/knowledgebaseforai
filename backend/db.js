import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'knowledgebase.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { documents: [], chunks: [] });

await db.read();
db.data = db.data || { documents: [], chunks: [] };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function createDocument(document) {
  await db.read();
  const existingIndex = db.data.documents.findIndex((doc) => doc.id === document.id);
  if (existingIndex >= 0) {
    db.data.documents.splice(existingIndex, 1);
  }
  db.data.documents.unshift({ ...document });
  await db.write();
}

export async function markDocumentProcessed(id, processed = true, error = null) {
  await db.read();
  const document = db.data.documents.find((doc) => doc.id === id);
  if (!document) return;

  document.processed = processed;
  document.error = error;
  await db.write();
}

export async function insertChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return;
  }

  await db.read();
  for (const chunk of chunks) {
    const existingIndex = db.data.chunks.findIndex((row) => row.id === chunk.id);
    if (existingIndex >= 0) {
      db.data.chunks.splice(existingIndex, 1, { ...chunk });
    } else {
      db.data.chunks.push({ ...chunk });
    }
  }
  await db.write();
}

export async function listDocuments() {
  await db.read();
  const sorted = [...db.data.documents].sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
  return sorted.map((doc) => ({
    ...doc,
    processed: Boolean(doc.processed)
  }));
}

export async function getDocumentById(id) {
  await db.read();
  const document = db.data.documents.find((doc) => doc.id === id);
  if (!document) return null;

  const chunks = db.data.chunks
    .filter((chunk) => chunk.document_id === id)
    .sort((a, b) => a.chunk_index - b.chunk_index)
    .map(formatChunkRow);

  return {
    document: {
      ...document,
      processed: Boolean(document.processed)
    },
    chunks
  };
}

export async function deleteDocumentById(id) {
  await db.read();
  const index = db.data.documents.findIndex((doc) => doc.id === id);
  if (index === -1) {
    return { filePath: null, deleted: false };
  }

  const [document] = db.data.documents.splice(index, 1);
  db.data.chunks = db.data.chunks.filter((chunk) => chunk.document_id !== id);
  await db.write();

  return { filePath: document.file_path || null, deleted: true };
}

export async function getChunksForSearch(documentIds = null) {
  await db.read();
  const filtered = Array.isArray(documentIds) && documentIds.length > 0
    ? db.data.chunks.filter((chunk) => documentIds.includes(chunk.document_id))
    : db.data.chunks;

  return filtered.map(formatChunkRow);
}

function formatChunkRow(row) {
  const embedding = Array.isArray(row.embedding) ? row.embedding : JSON.parse(row.embedding);
  return {
    ...clone(row),
    embedding,
    filename: row.filename ?? null,
    metadata: {
      start_char: row.start_char ?? null,
      end_char: row.end_char ?? null,
      filename: row.filename ?? null
    }
  };
}

export default db;

