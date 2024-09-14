import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { checkESConnection, createIndexIfNotExists, saveDocumentToES } from './elastic-search.js';

const PORT = process.env.PORT || 3000;
const app = express();

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 5;

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

    res.send(`Successfully uploaded ${req.files.length} file(s).`);
  } catch (error) {
    res.status(500).send(`Error uploading files: ${error.message}`);
  }
});

app.listen(PORT, async () => {
  await checkESConnection();
  await createIndexIfNotExists();
  console.log(`Server listening on ${PORT}`);
});