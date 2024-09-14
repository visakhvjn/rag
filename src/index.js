import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const app = express();

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
  fileFilter: fileFilter
});

// If 'data' folder is not there it is created
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    res.send(`File ${req.file.originalname} uploaded successfully.`);
  } catch (error) {
    res.status(500).send(`Error uploading file: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});