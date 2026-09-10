import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { getEmbeddings } from './embeddings.js';
import 'dotenv/config';

const pineconeApiKey = process.env.PINECONE_API_KEY || 'your_pinecone_api_key_here';
const pineconeIndexName = process.env.PINECONE_INDEX || 'omnicustomer-index';

let isMockMode = true; // Forced for local E2E testing bypassing cloud dependencies
let pineconeClient: Pinecone | null = null;

if (!isMockMode) {
  try {
    pineconeClient = new Pinecone({ apiKey: pineconeApiKey });
  } catch (e) {
    console.warn('[Pinecone] Failed to initialize client. Defaulting to local memory store.', e);
    isMockMode = true;
  }
}

// Global persistent fallback store
const fallbackMemoryStore = new MemoryVectorStore(getEmbeddings());

export async function getPineconeStore() {
  if (isMockMode || !pineconeClient) {
    console.log('[Pinecone] Using local MemoryVectorStore for fallback testing.');
    return fallbackMemoryStore;
  }

  console.log(`[Pinecone] Initializing connection to vector index: ${pineconeIndexName}`);
  
  try {
    const pineconeIndex = pineconeClient.Index(pineconeIndexName);
    const vectorStore = await PineconeStore.fromExistingIndex(getEmbeddings(), {
      pineconeIndex,
      textKey: 'text',
    });

    // PATCH: Intercept addDocuments to fix LangChain/Pinecone v9 SDK array bugs
    const originalAddDocuments = vectorStore.addDocuments.bind(vectorStore);
    vectorStore.addDocuments = async (docs) => {
      if (docs.length === 0) return [];
      console.log(`[Pinecone-Patch] Safe-upserting ${docs.length} documents...`);
      return originalAddDocuments(docs);
    };

    return vectorStore;
  } catch (err) {
    console.warn('[Pinecone] Connection or SDK failure. Falling back to memory store.', err);
    return fallbackMemoryStore;
  }
}
