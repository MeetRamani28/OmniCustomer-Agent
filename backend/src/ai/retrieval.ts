import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { InMemoryStore } from "@langchain/core/stores";
import { ParentDocumentRetriever } from "@langchain/classic/retrievers/parent_document";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbeddings } from "./embeddings.js";
import { Document } from "@langchain/core/documents";
import db from "../db/sqlite.js";

const vectorstore = new MemoryVectorStore(getEmbeddings());
const docstore = new InMemoryStore();

const parentSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 200,
});

const childSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 50,
});

export const retriever = new ParentDocumentRetriever({
  vectorstore,
  docstore,
  parentSplitter,
  childSplitter,
});

export function initKeywordSearch() {
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
      id UNINDEXED,
      content,
      tokenize='porter'
    );
  `);
  console.log("[RAG] Keyword Search (FTS5) initialized.");
}

export async function hybridSearch(query: string) {
  console.log(`[RAG] Executing Hybrid Search for: "${query}"`);

  const vectorResults = await retriever.invoke(query);

  const keywordStmt = db.prepare(`
    SELECT id, content FROM docs_fts 
    WHERE docs_fts MATCH ? 
    ORDER BY rank LIMIT 5
  `);

  const safeQuery = query.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const keywordResults = safeQuery ? keywordStmt.all(safeQuery) : [];

  return {
    vectorDocs: vectorResults,
    keywordDocs: keywordResults,
  };
}

export async function ingestDocuments(docs: Document[]) {
  console.log(`[RAG] Ingesting ${docs.length} parent documents...`);
  await retriever.addDocuments(docs);

  const insertStmt = db.prepare(
    "INSERT INTO docs_fts (id, content) VALUES (?, ?)",
  );
  const transaction = db.transaction((docsToInsert: Document[]) => {
    for (const doc of docsToInsert) {
      const id = doc.metadata?.id || Math.random().toString(36).substring(7);
      insertStmt.run(id, doc.pageContent);
    }
  });
  transaction(docs);

  console.log("[RAG] Ingestion complete across Vector & Keyword stores.");
}
