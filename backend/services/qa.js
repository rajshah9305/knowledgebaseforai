import { pipeline } from '@xenova/transformers';

let qaPipelinePromise = null;

async function getQaPipeline() {
  if (!qaPipelinePromise) {
    qaPipelinePromise = pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
  }
  return qaPipelinePromise;
}

export async function answerQuestion(question, context) {
  const qa = await getQaPipeline();
  const trimmedContext = context.length > 4000 ? `${context.slice(0, 4000)}...` : context;
  const result = await qa(question, trimmedContext);
  return result;
}

