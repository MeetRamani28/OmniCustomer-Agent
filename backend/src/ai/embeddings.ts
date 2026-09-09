import { CohereEmbeddings } from "@langchain/cohere";
import "dotenv/config";

export const getEmbeddings = () => {
  if (!process.env.COHERE_API_KEY) {
    console.warn(
      "[AI Warning] COHERE_API_KEY is missing. Embeddings will fail.",
    );
  }

  return new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
    inputType: "search_document",
  });
};
