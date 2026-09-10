import { InMemoryStore } from "@langchain/core/stores";
import { ParentDocumentRetriever } from "@langchain/classic/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getPineconeStore } from "./pinecone.js";
import { Document } from "@langchain/core/documents";

let retrieverInstance: ParentDocumentRetriever | null = null;

export async function initRetriever() {
  if (retrieverInstance) return retrieverInstance;

  console.log(
    "[Pinecone] Bootstrapping ParentDocumentRetriever for cloud search...",
  );
  const vectorstore = await getPineconeStore();

  const docstore = new InMemoryStore();

  const parentSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });

  const childSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });

  retrieverInstance = new ParentDocumentRetriever({
    vectorstore,
    docstore,
    parentSplitter,
    childSplitter,
  });

  return retrieverInstance;
}

export async function hybridSearch(query: string) {
  console.log(`[RAG] Executing Cloud Vector Search for: "${query}"`);

  const retriever = await initRetriever();
  const vectorResults = await retriever.invoke(query);

  return {
    vectorDocs: vectorResults,
    keywordDocs: [],
  };
}

export async function ingestDocuments(docs: Document[]) {
  console.log(
    `[RAG] Ingesting ${docs.length} parent documents into Pinecone...`,
  );

  const retriever = await initRetriever();
  await retriever.addDocuments(docs);

  console.log("[RAG] Pinecone Ingestion complete. Vector space updated.");
}
