import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { upload } from './middleware/upload.js';
import { ingestDocuments } from './ai/retrieval.js';
import { Document } from '@langchain/core/documents';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Admin API: Dynamic Knowledge Base Ingestion
// ---------------------------------------------------------------------------
// Secure endpoint for administrators to upload .txt or .md files. The RAG 
// engine chunks these documents and upserts them into the Pinecone Cloud Index.

app.post('/api/upload', upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = path.resolve(req.file.path);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Strict validation to prevent malformed binary ingestion
    if (fileExtension !== '.txt' && fileExtension !== '.md') {
      fs.unlinkSync(filePath);
      res.status(400).json({ error: 'Only .txt and .md files are securely supported for RAG ingestion.' });
      return;
    }

    // Read the raw text from the uploaded document
    const rawText = fs.readFileSync(filePath, 'utf-8');

    // Construct the LangChain Document with rich metadata
    const doc = new Document({
      pageContent: rawText,
      metadata: {
        source: req.file.originalname,
        ingestedAt: new Date().toISOString(),
      },
    });

    // Execute the distributed Pinecone insertion pipeline
    await ingestDocuments([doc]);

    // Safely wipe the local temporary file after successful cloud upload
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Knowledge base successfully expanded in Pinecone.',
      filename: req.file.originalname,
    });

  } catch (error: any) {
    console.error('[Ingestion Route] Critical failure during document processing:', error);
    res.status(500).json({ error: 'Internal Server Error during Pinecone ingestion.' });
  }
});

export default app;
