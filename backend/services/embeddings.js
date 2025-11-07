import { pipeline } from '@xenova/transformers';

let embeddingPipelinePromise = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipelinePromise;
}

function sanitizeText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

export async function generateEmbedding(text) {
  const cleanText = sanitizeText(text);
  if (!cleanText) {
    throw new Error('Text cannot be empty');
  }

  const extractor = await getEmbeddingPipeline();
  const result = await extractor(cleanText, { pooling: 'mean', normalize: true });
  const data = Array.isArray(result) ? result[0].data : result.data;
  return Array.from(data);
}

export async function generateEmbeddings(texts) {
  const extractor = await getEmbeddingPipeline();
  const embeddings = [];

  for (const text of texts) {
    const cleanText = sanitizeText(text);
    if (!cleanText) {
      embeddings.push(null);
      continue;
    }

    const result = await extractor(cleanText, { pooling: 'mean', normalize: true });
    const data = Array.isArray(result) ? result[0].data : result.data;
    embeddings.push(Array.from(data));
  }

  return embeddings;
}
