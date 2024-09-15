import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { addChromaDocument, createChromaCollectionIfNotExists } from './chroma.js';
import { chunkDocument } from './document.util.js';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3000;
const app = express();

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 5;
const CHUNK_SIZE = 1 * 1024; // 1 kb

// Multer storage location specification - 'data'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// File filter to allow only .txt files for now
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.txt') {
    return cb(new Error('Only .txt files are allowed!'), false);
  }
  cb(null, true);
};

// Multer instance that handles uploads
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILE_COUNT
  }
});

// If 'data' folder is not there it is created
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

app.post('/upload', upload.array('files', MAX_FILE_COUNT), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }

    req.files.forEach(file => {
      const uniqueFileProcessId = uuidv4();
      const filePath = path.join('data/', file.filename);
      const fileBuffer = fs.readFileSync(filePath);

      // Chunk the document
      const chunks = chunkDocument(fileBuffer, CHUNK_SIZE);

      const documents = chunks;
      const ids = Array.from({ length: chunks.length }, (_, index) => `${uniqueFileProcessId}-${index + 1}`);

      addChromaDocument(documents, ids);

      // Optionally, remove the original file after chunking
      fs.unlinkSync(filePath);
    });

    res.send(`Successfully uploaded ${req.files.length} file(s).`);
  } catch (error) {
    res.status(500).send(`Error uploading files: ${error.message}`);
  }
});

app.listen(PORT, async () => {
  await createChromaCollectionIfNotExists();
  console.log(`Server listening on ${PORT}`);
});