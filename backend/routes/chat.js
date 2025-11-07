import express from 'express';
import { generateEmbedding } from '../services/embeddings.js';
import { answerQuestion } from '../services/qa.js';
import { getChunksForSearch } from '../db.js';

const router = express.Router();

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, documentIds } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const relevantChunks = await searchChunksSemantic(message, documentIds);

    if (relevantChunks.length === 0) {
      return res.json({
        response: 'I could not find any relevant information in your documents for that question.',
        sources: [],
        contextUsed: 0
      });
    }

    const answer = await craftAnswer(message, relevantChunks);

    res.json({
      response: answer.text,
      sources: answer.sources,
      contextUsed: relevantChunks.length
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

/**
 * Search for relevant chunks using semantic search with embeddings (Phase 2)
 */
async function searchChunksSemantic(query, documentIds = null) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const rawChunks = await getChunksForSearch(documentIds);

    const scoredChunks = rawChunks
      .map(chunk => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .filter(chunk => chunk.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8);

    return scoredChunks;
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function craftAnswer(question, chunks) {
  let bestAnswer = {
    score: 0,
    text: 'I could not find a confident answer in your documents.',
    chunk: null
  };

  for (const chunk of chunks.slice(0, 5)) {
    const qaResult = await answerQuestion(question, chunk.content);
    if (qaResult?.score > bestAnswer.score) {
      bestAnswer = {
        score: qaResult.score,
        text: qaResult.answer,
        chunk
      };
    }
  }

  const sources = chunks.map(chunk => ({
    filename: chunk.filename || 'Unknown document',
    documentId: chunk.document_id,
    chunkIndex: chunk.chunk_index,
    preview: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '…' : '')
  }));

  const responseText = bestAnswer.score > 0.1
    ? bestAnswer.text
    : 'I could not find a confident answer in your documents.';

  return {
    text: responseText,
    sources
  };
}

export { router as chatRouter };

