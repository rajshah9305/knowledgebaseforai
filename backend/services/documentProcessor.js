import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding } from './gemini.js';
import { insertChunks, markDocumentProcessed } from '../db.js';

/**
 * Process a document: extract text, chunk it, and store in database
 */
export async function processDocument(file, documentId) {
  try {
    console.log(`Processing document: ${file.originalname} (${documentId})`);

    // Extract text based on file type
    let extractedText = '';
    const fileExtension = path.extname(file.originalname).toLowerCase();

    switch (fileExtension) {
      case '.pdf':
        extractedText = await extractPDFText(file.path);
        break;
      case '.docx':
        extractedText = await extractDOCXText(file.path);
        break;
      case '.doc':
        throw new Error('DOC files are not supported. Please convert to DOCX before uploading.');
      case '.txt':
      case '.md':
      case '.csv':
        extractedText = await extractTextFile(file.path);
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
        extractedText = await extractImageText(file.path);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }

    // Chunk the text
    const chunks = chunkText(extractedText, documentId, file.originalname);
    console.log(`Generated ${chunks.length} chunks. Creating embeddings...`);

    const enrichedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await generateEmbedding(chunk.content);
        enrichedChunks.push({
          id: chunk.id,
          document_id: chunk.document_id,
          content: chunk.content,
          chunk_index: chunk.chunk_index,
          start_char: chunk.metadata.start_char,
          end_char: chunk.metadata.end_char,
          filename: file.originalname,
          embedding: JSON.stringify(embedding)
        });

        if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
          console.log(`Embeddings generated for ${i + 1}/${chunks.length} chunks`);
        }
      } catch (error) {
        console.error(`Failed to generate embedding for chunk ${i}:`, error);
      }
    }

    if (enrichedChunks.length === 0) {
      throw new Error('No embeddings were generated for the document chunks.');
    }

    await insertChunks(enrichedChunks);
    await markDocumentProcessed(documentId, true, null);

    console.log(`Document ${documentId} processed successfully. Stored ${enrichedChunks.length} chunks.`);
    return { success: true, chunksCount: enrichedChunks.length };
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await markDocumentProcessed(documentId, false, error.message);
    throw error;
  }
}

/**
 * Extract text from PDF
 */
async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Extract text from DOCX
 */
async function extractDOCXText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract DOCX text: ${error.message}`);
  }
}

/**
 * Extract text from plain text files
 */
async function extractTextFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Text file extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Extract text from images using Gemini Vision API
 */
async function extractImageText(filePath) {
  try {
    const result = await Tesseract.recognize(filePath, 'eng');
    return result.data.text;
  } catch (error) {
    console.error('Image extraction error:', error);
    throw new Error(`Failed to extract image text: ${error.message}`);
  }
}

/**
 * Chunk text into smaller pieces for better AI retrieval
 */
function chunkText(text, documentId, filename) {
  const chunks = [];
  const chunkSize = 1000; // characters per chunk
  const overlap = 200; // overlap between chunks
  
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkText = text.slice(startIndex, endIndex);
    
    // Try to break at sentence boundaries
    let actualEndIndex = endIndex;
    if (endIndex < text.length) {
      const lastPeriod = chunkText.lastIndexOf('.');
      const lastNewline = chunkText.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > chunkSize * 0.5) { // Only break if we're past halfway
        actualEndIndex = startIndex + breakPoint + 1;
      }
    }

    const finalChunkText = text.slice(startIndex, actualEndIndex).trim();
    
    if (finalChunkText.length > 0) {
      chunks.push({
        id: uuidv4(),
        document_id: documentId,
        content: finalChunkText,
        chunk_index: chunkIndex,
        metadata: {
          filename: filename,
          start_char: startIndex,
          end_char: actualEndIndex
        }
      });
      
      chunkIndex++;
    }

    // Move start index with overlap
    startIndex = actualEndIndex - overlap;
    if (startIndex < 0) startIndex = actualEndIndex;
  }

  return chunks;
}

