require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const archiver = require('archiver');
const cors = require('cors');
const libre = require('libreoffice-convert');
const { fromPath } = require('pdf2pic');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Supported formats for each type
const supportedFormats = {
  image: ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg', 'pdf', 'docx'],
  compressor: ['jpg', 'png', 'svg'],
  pdfs: ['docx', 'jpg', 'png', 'gif'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'],
  video: ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'],
  document: ['docx', 'pdf', 'txt', 'rtf', 'odt'],
  archive: ['zip', '7z'],
  ebook: ['epub', 'mobi', 'pdf', 'azw3'],
};

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.mp3', '.wav', '.aac', '.flac', '.ogg', '.opus', '.wma',
      '.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.wmv',
      '.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp', '.gif', '.ico', '.tga', '.tiff', '.wbmp',
      '.pdf', '.docx', '.txt', '.rtf', '.odt',
      '.zip', '.7z',
      '.epub', '.mobi', '.azw3',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`), false);
    }
  },
});

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');
fsPromises.mkdir(uploadsDir, { recursive: true });
fsPromises.mkdir(convertedDir, { recursive: true });

// Conversion route
app.post('/api/convert', upload.array('files', 5), async (req, res) => {
  console.log('Received /api/convert request');
  try {
    const files = req.files;
    let formats;

    try {
      formats = JSON.parse(req.body.formats || '[]');
    } catch (parseError) {
      console.error('Error parsing formats:', parseError);
      return res.status(400).json({ error: 'Invalid formats data' });
    }

    if (!files || files.length === 0) {
      console.error('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }
    if (files.length !== formats.length) {
      console.error(`Mismatch between files (${files.length}) and formats (${formats.length})`);
      return res.status(400).json({ 
        error: `Mismatch between files and formats. Files: ${files.length}, Formats: ${formats.length}` 
      });
    }

    const outputFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formatInfo = formats[i];
      const inputExt = path.extname(file.originalname).toLowerCase().slice(1) || 'unknown';
      const outputExt = formatInfo.target.toLowerCase().split(' ')[0];

      console.log(`Processing file: ${file.originalname}, type: ${formatInfo.type}, inputExt: ${inputExt}, target: ${outputExt}`);

      if (!Object.keys(supportedFormats).includes(formatInfo.type)) {
        throw new Error(`Unsupported conversion type: ${formatInfo.type}`);
      }
      if (!supportedFormats[formatInfo.type].includes(outputExt)) {
        throw new Error(`Unsupported output format: ${outputExt} for type ${formatInfo.type}`);
      }
      const allowedInputs = formatInfo.type === 'pdfs' 
        ? ['pdf'] 
        : formatInfo.type === 'document' 
          ? ['docx', 'pdf', 'txt', 'rtf', 'odt']
          : formatInfo.type === 'image' || formatInfo.type === 'compressor'
            ? ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg']
            : formatInfo.type === 'audio'
              ? ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma']
              : formatInfo.type === 'video'
                ? ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv']
                : formatInfo.type === 'archive'
                  ? ['zip', '7z']
                  : formatInfo.type === 'ebook'
                    ? ['epub', 'mobi', 'pdf', 'azw3']
                    : [];
      if (!allowedInputs.includes(inputExt)) {
        throw new Error(`Unsupported input format: ${inputExt} for type ${formatInfo.type}`);
      }

      const inputPath = file.path;
      const outputPath = path.join(
        convertedDir,
        `${path.basename(file.filename, path.extname(file.filename))}.${outputExt}`
      );

      switch (formatInfo.type) {
        case 'image':
        case 'compressor':
          await convertImage(inputPath, outputPath, outputExt);
          break;
        case 'pdfs':
          await convertPdf(inputPath, outputPath, outputExt);
          break;
        case 'document':
          await convertDocument(inputPath, outputPath, outputExt);
          break;
        case 'audio':
        case 'video':
          await convertMedia(inputPath, outputPath, outputExt);
          break;
        case 'archive':
          await convertArchive(inputPath, outputPath, outputExt);
          break;
        case 'ebook':
          await convertEbook(inputPath, outputPath, outputExt);
          break;
        default:
          throw new Error(`Unsupported conversion type: ${formatInfo.type}`);
      }
      outputFiles.push(outputPath);
    }

    // Create ZIP file
    const zipPath = path.join(convertedDir, `converted_${Date.now()}.zip`);
    await createZip(outputFiles, zipPath);

    // Send ZIP file
    res.download(zipPath, 'converted_files.zip', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send converted files' });
      }
      // Clean up
      await cleanupFiles([...files.map(f => f.path), ...outputFiles, zipPath]);
    });
  } catch (error) {
    console.error('Conversion error:', error.message);
    res.status(500).json({ error: error.message });
    await cleanupFiles(req.files ? req.files.map(f => f.path) : []);
  }
});

// Conversion functions
async function convertImage(inputPath, outputPath, format) {
  const imageFormats = ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'];
  
  if (imageFormats.includes(format)) {
    // Handle image-to-image conversion with sharp
    await sharp(inputPath)
      .toFormat(format)
      .toFile(outputPath);
    console.log(`Image conversion completed: ${outputPath}`);
  } else if (format === 'pdf' || format === 'docx') {
    // Handle image-to-PDF or image-to-DOCX conversion
    let tempPdfPath;
    try {
      if (format === 'pdf') {
        tempPdfPath = outputPath;
      } else {
        tempPdfPath = path.join(convertedDir, `temp_${Date.now()}.pdf`);
      }

      // Convert image to PDF using libreoffice-convert
      const imageBuffer = await fsPromises.readFile(inputPath);
      await new Promise((resolve, reject) => {
        libre.convert(imageBuffer, '.pdf', undefined, (err, pdfBuffer) => {
          if (err) return reject(new Error(`Image to PDF conversion failed: ${err.message}`));
          fsPromises.writeFile(tempPdfPath, pdfBuffer).then(resolve).catch(reject);
        });
      });

      if (format === 'docx') {
        // Convert temporary PDF to DOCX
        const pdfBuffer = await fsPromises.readFile(tempPdfPath);
        await new Promise((resolve, reject) => {
          libre.convert(pdfBuffer, '.docx', undefined, (err, docxBuffer) => {
            if (err) return reject(new Error(`PDF to DOCX conversion failed: ${err.message}`));
            fsPromises.writeFile(outputPath, docxBuffer).then(resolve).catch(reject);
          });
        });
        // Clean up temporary PDF
        await fsPromises.unlink(tempPdfPath);
      }
      console.log(`Image conversion to ${format} completed: ${outputPath}`);
    } catch (err) {
      if (tempPdfPath && format === 'docx') {
        try {
          await fsPromises.unlink(tempPdfPath);
        } catch (cleanupErr) {
          console.error(`Error cleaning up temporary PDF: ${cleanupErr.message}`);
        }
      }
      throw err;
    }
  } else {
    throw new Error(`Unsupported image output format: ${format}`);
  }
}

async function compressImage(inputPath, outputPath, format) {
  await sharp(inputPath)
    .toFormat(format)
    .jpeg({ quality: 80 })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Image compression completed: ${outputPath}`);
}

async function convertPdf(inputPath, outputPath, format) {
  if (format === 'jpg' || format === 'png' || format === 'gif') {
    // Convert PDF to image using pdf2pic
    const outputOptions = {
      density: 100,
      format: format,
      width: 600,
      height: 600,
    };
    const convert = fromPath(inputPath, outputOptions);
    await convert.bulk(-1, { outputPath });
    console.log(`PDF to ${format} conversion completed: ${outputPath}`);
  } else if (format === 'docx') {
    // Convert PDF to DOCX using libreoffice-convert
    const pdfBuffer = await fsPromises.readFile(inputPath);
    await new Promise((resolve, reject) => {
      libre.convert(pdfBuffer, '.docx', undefined, (err, docxBuffer) => {
        if (err) return reject(new Error(`PDF to DOCX conversion failed: ${err.message}`));
        fsPromises.writeFile(outputPath, docxBuffer).then(resolve).catch(reject);
      });
    });
    console.log(`PDF to DOCX conversion completed: ${outputPath}`);
  } else {
    throw new Error(`Unsupported PDF output format: ${format}`);
  }
}

async function convertDocument(inputPath, outputPath, format) {
  const inputExt = path.extname(inputPath).toLowerCase().slice(1);
  const supportedDocumentFormats = ['docx', 'pdf', 'txt', 'rtf', 'odt'];

  if (!supportedDocumentFormats.includes(inputExt)) {
    throw new Error(`Unsupported input document format: ${inputExt}`);
  }
  if (!supportedDocumentFormats.includes(format)) {
    throw new Error(`Unsupported output document format: ${format}`);
  }

  const buffer = await fsPromises.readFile(inputPath);
  await new Promise((resolve, reject) => {
    libre.convert(buffer, `.${format}`, undefined, (err, convertedBuf) => {
      if (err) return reject(new Error(`Document conversion failed: ${err.message}`));
      fsPromises.writeFile(outputPath, convertedBuf).then(resolve).catch(reject);
    });
  });
  console.log(`Document conversion completed: ${outputPath}`);
}

async function convertMedia(inputPath, outputPath, format) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(format)
      .on('end', () => {
        console.log(`Media conversion completed: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Media conversion error: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}

async function convertArchive(inputPath, outputPath, format) {
  const sevenZip = require('node-7z');
  if (format === 'zip' || format === '7z') {
    return new Promise((resolve, reject) => {
      sevenZip.add(outputPath, inputPath, { $raw: { '-t': format } })
        .on('end', () => {
          console.log(`Archive conversion completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Archive conversion error: ${err.message}`);
          reject(err);
        });
    });
  } else {
    throw new Error('Unsupported archive format');
  }
}

async function convertEbook(inputPath, outputPath, format) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec(`ebook-convert "${inputPath}" "${outputPath}"`, (err) => {
      if (err) {
        console.error(`Ebook conversion error: ${err.message}`);
        return reject(err);
      }
      console.log(`Ebook conversion completed: ${outputPath}`);
      resolve();
    });
  });
}

async function createZip(filePaths, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`ZIP file created: ${zipPath}`);
      resolve();
    });
    archive.on('error', (err) => {
      console.error(`ZIP creation error: ${err.message}`);
      reject(err);
    });

    archive.pipe(output);
    filePaths.forEach(filePath => {
      archive.file(filePath, { name: path.basename(filePath) });
    });
    archive.finalize();
  });
}

async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fsPromises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});