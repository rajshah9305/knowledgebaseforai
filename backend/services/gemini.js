import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function answerQuestion(question, context) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  
  const prompt = `Based on the following context, answer the question. If the answer is not in the context, say "I cannot find this information in the provided context."

Context: ${context}

Question: ${question}

Answer:`;

  const result = await model.generateContent(prompt);
  return {
    answer: result.response.text(),
    score: 0.8 // Default confidence score
  };
}

export async function generateResponse(message, relevantChunks) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  
  const context = relevantChunks.map(chunk => chunk.content).join('\n\n');
  
  const prompt = `You are a helpful AI assistant. Answer the user's question based on the provided context from their documents. If you cannot find the answer in the context, say so clearly.

Context from documents:
${context}

User question: ${message}

Please provide a clear, helpful answer based on the context above:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}