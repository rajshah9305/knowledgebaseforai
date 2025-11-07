import { pipeline } from '@xenova/transformers';

async function warmUp() {
  console.log('📦 Downloading embedding model (all-MiniLM-L6-v2)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  await embedder('Hello world', { pooling: 'mean', normalize: true });

  console.log('📦 Downloading QA model (distilbert-base-cased-distilled-squad)...');
  const qa = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
  await qa('What is the capital of France?', 'France has Paris as its capital city.');

  console.log('✅ Models downloaded and cached.');
}

warmUp().catch((error) => {
  console.error('❌ Failed to download models:', error);
  process.exit(1);
});

