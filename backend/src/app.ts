import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { upload } from './middleware/upload.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  res.status(200).json({ 
    message: 'File securely uploaded', 
    filename: req.file.filename,
    path: req.file.path
  });
});

export default app;
