import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { getEmbeddings } from './embeddings.js';
import 'dotenv/config';

const pineconeApiKey = process.env.PINECONE_API_KEY || 'placeholder_pinecone_key';
const pineconeIndexName = process.env.PINECONE_INDEX || 'omnicustomer-index';

export const pineconeClient = new Pinecone({
  apiKey: pineconeApiKey,
});

export async function getPineconeStore() {
  console.log(`[Pinecone] Initializing connection to vector index: ${pineconeIndexName}`);
  
  const pineconeIndex = pineconeClient.Index(pineconeIndexName);
  
  const vectorStore = await PineconeStore.fromExistingIndex(getEmbeddings(), {
    pineconeIndex,
    textKey: 'text',
  });
  
  return vectorStore;
}
