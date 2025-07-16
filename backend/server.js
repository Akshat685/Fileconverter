require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const cors = require('cors');
const libre = require('libreoffice-convert');
const { fromPath } = require('pdf2pic');
const tmp = require('tmp');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 5000;

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`ImageMagick error: ${stderr}`);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

app.use(cors());

const allFormats = [
  'bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg',
  'pdf', 'doc', 'docx', 'html', 'odt', 'ppt', 'pptx', 'rtf', 'txt', 'xlsx',
  'mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'm4v', 'mmf', '3g2',
  'mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', '3gp', 'mpg', 'ogv',
  'zip', '7z',
  'epub', 'mobi', 'azw3', 'fb2', 'lit', 'lrf', 'pdb', 'tcr',
];

const supportedFormats = {
   image: {
    raster: ['jpeg','jpg','png','webp','tiff','gif'],
    vector: ['svg','bmp','ico','eps','tga','wbmp'],
    compressor: ['jpg','png'],
    pdf: ['pdf'],
  },
  pdfs: {
    document: ['doc', 'docx', 'html', 'odt', 'ppt', 'pptx', 'rtf', 'txt', 'xlsx', 'pdf'],
    compressor: ['pdf'],
    ebook: ['azw3', 'epub', 'fb2', 'lit', 'lrf', 'mobi', 'pdb', 'tcr'],
    pdf_ebook: ['azw3', 'epub', 'fb2', 'lit', 'lrf', 'mobi', 'pdb', 'tcr'],
    pdf_to_image: ['jpg', 'png', 'gif'],
  },
  audio: {
    audio: ['aac', 'aiff', 'flac', 'm4v', 'mmf', 'ogg', 'opus', 'wav', 'wma', '3g2'],
  },
  video: {
    audio: ['aac', 'aiff', 'flac', 'm4v', 'mmf', 'mp3', 'ogg', 'opus', 'wav', 'wma', '3g2'],
    device: ['android', 'blackberry', 'ipad', 'iphone', 'ipod', 'playstation', 'psp', 'wii', 'xbox'],
    video: ['3g2', '3gp', 'avi', 'flv', 'mkv', 'mov', 'mpg', 'ogv', 'webm', 'wmv'],
    compressor: ['mp4'],
    webservice: ['dailymotion', 'facebook', 'instagram', 'telegram', 'twitch', 'twitter', 'viber', 'vimeo', 'whatsapp', 'youtube'],
  },
  document: ['docx', 'pdf', 'txt', 'rtf', 'odt'],
  archive: ['zip', '7z'],
  ebook: ['epub', 'mobi', 'pdf', 'azw3'],
};

const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');
fsPromises.mkdir(uploadsDir, { recursive: true });
fsPromises.mkdir(convertedDir, { recursive: true });

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = allFormats.map(ext => `.${ext}`);
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Supported types: ${allFormats.join(', ')}`), false);
    }
  },
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.post('/api/convert', upload.array('files', 5), async (req, res) => {
  console.log('Received /api/convert request with files:', req.files?.map(f => f.originalname));
  let tempFiles = req.files ? req.files.map(f => f.path) : [];
  try {
    const files = req.files;
    let formats;

    try {
      formats = JSON.parse(req.body.formats || '[]');
      console.log('Parsed formats:', formats);
    } catch (parseError) {
      console.error('Error parsing formats:', parseError);
      return res.status(400).json({ error: 'Invalid formats data. Please provide valid JSON.' });
    }

    if (!files || files.length === 0) {
      console.error('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    if (files.length > 5) {
      console.error('Too many files uploaded');
      return res.status(400).json({ error: 'Maximum 5 files allowed.' });
    }

    if (files.length !== formats.length) {
      console.error(`Mismatch between files (${files.length}) and formats (${formats.length})`);
      return res.status(400).json({
        error: `Mismatch between files and formats. Files: ${files.length}, Formats: ${formats.length}`,
      });
    }

    const outputFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formatInfo = formats[i];
      const inputExt = path.extname(file.originalname).toLowerCase().slice(1) || 'unknown';
      const outputExt = formatInfo.target.toLowerCase();
      const subSection = formatInfo.subSection;

      console.log(`Processing file: ${file.originalname}, type: ${formatInfo.type}, subSection: ${subSection}, inputExt: ${inputExt}, target: ${outputExt}`);

      if (!Object.keys(supportedFormats).includes(formatInfo.type)) {
        throw new Error(`Unsupported conversion type: ${formatInfo.type}. Supported types: ${Object.keys(supportedFormats).join(', ')}`);
      }

      if (!supportedFormats[formatInfo.type][subSection]?.includes(outputExt)) {
        throw new Error(`Unsupported output format: ${outputExt} for type ${formatInfo.type}.${subSection}. Supported formats: ${supportedFormats[formatInfo.type][subSection]?.join(', ')}`);
      }

      if (!allFormats.includes(inputExt)) {
        throw new Error(`Unsupported input format: ${inputExt}. Supported formats: ${allFormats.join(', ')}`);
      }

      const inputPath = file.path;
      const outputPath = path.join(
        convertedDir,
        `${path.basename(file.filename, path.extname(file.filename))}_${Date.now()}.${outputExt}`
      );

      try {
        await fsPromises.access(inputPath);
      } catch {
        throw new Error(`Input file not found: ${file.originalname}`);
      }

      switch (formatInfo.type) {
        case 'image':
          await convertImage(inputPath, outputPath, outputExt, subSection);
          break;
        case 'pdfs':
          await convertPdf(inputPath, outputPath, outputExt, subSection);
          break;
        case 'audio':
          await convertAudio(inputPath, outputPath, outputExt);
          break;
        case 'video':
          await convertVideo(inputPath, outputPath, outputExt, subSection);
          break;
        case 'document':
          await convertDocument(inputPath, outputPath, outputExt);
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

      outputFiles.push({
        path: outputPath,
        name: path.basename(outputPath),
      });
      tempFiles.push(outputPath);
    }

    res.json({
      files: outputFiles.map(file => ({
        name: file.name,
        path: `/converted/${file.name}`,
      })),
    });
  } catch (error) {
    console.error('Conversion error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Conversion failed.' });
  } finally {
    await cleanupFiles(tempFiles.filter(file => file.startsWith(uploadsDir)));
  }
});

app.get('/converted/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(convertedDir, filename);

  console.log(`Serving file: ${filePath}`);
  try {
    await fsPromises.access(filePath);
    res.download(filePath, filename, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send converted file.' });
      } else {
        console.log(`File sent successfully: ${filePath}`);
        await cleanupFiles([filePath]);
      }
    });
  } catch (err) {
    console.error('File not found:', filePath, err);
    res.status(404).json({ error: 'Converted file not found.' });
  }
});

app.delete('/api/delete/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(convertedDir, filename);

  try {
    await cleanupFiles([filePath]);
    res.status(200).json({ message: `File ${filename} deleted successfully.` });
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    res.status(500).json({ error: `Failed to delete file ${filename}.` });
  }
});

async function convertImage(inputPath, outputPath, format, subSection) {
  const inputExt = path.extname(inputPath).slice(1).toLowerCase();
  format = format.toLowerCase(); // Normalize

  if (subSection === 'compressor') {
    if (['jpg', 'jpeg'].includes(format)) {
      return sharp(inputPath).jpeg({ quality: 50 }).toFile(outputPath);
    } else if (format === 'png') {
      return sharp(inputPath).png({ compressionLevel: 9 }).toFile(outputPath);
    }
    throw new Error(`Unsupported compressor format: ${format}`);
  }

  if (subSection === 'pdf') {
    return sharp(inputPath).toFormat('pdf').toFile(outputPath);
  }

  // Use ImageMagick for any format sharp doesn't support
  const useImageMagick = ['bmp', 'ico', 'svg', 'eps', 'tga', 'wbmp'].includes(format);

  if (useImageMagick) {
    return execPromise(`magick convert "${inputPath}" "${outputPath}"`);
  }

  // Use sharp for all supported raster image conversions
  try {
    return sharp(inputPath).toFormat(format).toFile(outputPath);
  } catch (err) {
    console.warn(`Sharp failed for format ${format}. Falling back to ImageMagick...`);
    return execPromise(`magick convert "${inputPath}" "${outputPath}"`);
  }
}





async function convertPdf(inputPath, outputPath, format, subSection) {
  if (subSection == 'compressor') {
    // compress PDF via Ghostscript
    return execPromise(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH \
   -sOutputFile="${outputPath}" "${inputPath}"`);
  }

  if (subSection == 'pdf_to_image') {
    const converter = fromPath(inputPath,{format,width:600,height:600,saveFilename:path.parse(outputPath).name,savePath:path.dirname(outputPath)});
    return converter(1); // first page
  }

  if (['document','ebook','pdf_ebook'].includes(subSection)) {
    const buffer = await fsPromises.readFile(inputPath);
    return new Promise((resolve, reject)=>{
      tmp.dir({unsafeCleanup:true},(err,tmpPath,cleanup)=>{
        if(err) return reject(err);
        libre.convert(buffer,'.'+format,{tmpDir:tmpPath},(e,buf)=>{
          cleanup();
          if(e) return reject(e);
          fsPromises.writeFile(outputPath,buf).then(resolve).catch(reject);
        });
      });
    });
  }

  throw new Error(`Unsupported PDF subsection: ${subSection}`);
}


async function convertDocument(inputPath, outputPath, format) {
  const supportedDocumentFormats = ['doc', 'docx', 'html', 'odt', 'ppt', 'pptx', 'rtf', 'txt', 'xlsx', 'pdf'];
  const inputExt = path.extname(inputPath).toLowerCase().slice(1);

  if (!supportedDocumentFormats.includes(format)) {
    throw new Error(`Unsupported output document format: ${format}`);
  }

  const buffer = await fsPromises.readFile(inputPath);
  await new Promise((resolve, reject) => {
    libre.soffice = process.env.LIBREOFFICE_PATH || 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
    tmp.dir({ unsafeCleanup: true }, (err, tempDir, cleanupCallback) => {
      if (err) return reject(new Error(`Failed to create temporary directory: ${err.message}`));
      libre.convert(buffer, `.${format}`, { tmpDir: tempDir }, (err, convertedBuf) => {
        if (err) {
          cleanupCallback();
          return reject(new Error(`Document conversion failed: ${err.message}`));
        }
        fsPromises.writeFile(outputPath, convertedBuf)
          .then(() => {
            cleanupCallback();
            resolve();
          })
          .catch((writeErr) => {
            cleanupCallback();
            reject(writeErr);
          });
      });
    });
  });
  console.log(`Document conversion completed: ${outputPath}`);
}

async function convertAudio(inputPath, outputPath, format) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(format)
      .on('end', () => {
        console.log(`Audio conversion completed: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Audio conversion error: ${err.message}`);
        reject(new Error(`Audio conversion failed: ${err.message}`));
      })
      .save(outputPath);
  });
}

async function convertVideo(inputPath, outputPath, format, subSection) {
  if (subSection === 'compressor') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .addOption('-crf', '28')
        .toFormat('mp4')
        .on('end', () => {
          console.log(`Video compression completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Video compression error: ${err.message}`);
          reject(new Error(`Video compression failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } else if (subSection === 'audio') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .toFormat(format)
        .on('end', () => {
          console.log(`Video to audio conversion completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Video to audio conversion error: ${err.message}`);
          reject(new Error(`Video to audio conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } else if (subSection === 'device') {
    const devicePresets = {
      android: ['-vf', 'scale=1280:720', '-b:v', '2M'],
      blackberry: ['-vf', 'scale=480:320', '-b:v', '1M'],
      ipad: ['-vf', 'scale=1024:768', '-b:v', '3M'],
      iphone: ['-vf', 'scale=960:540', '-b:v', '2M'],
      ipod: ['-vf', 'scale=480:320', '-b:v', '1M'],
      playstation: ['-vf', 'scale=1280:720', '-b:v', '3M'],
      psp: ['-vf', 'scale=320:240', '-b:v', '500k'],
      wii: ['-vf', 'scale=640:480', '-b:v', '1.5M'],
      xbox: ['-vf', 'scale=1280:720', '-b:v', '3M'],
    };
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .addOptions(devicePresets[format] || ['-vf', 'scale=1280:720', '-b:v', '2M'])
        .toFormat('mp4')
        .on('end', () => {
          console.log(`Video device conversion completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Video device conversion error: ${err.message}`);
          reject(new Error(`Video device conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } else if (subSection === 'webservice') {
    const webservicePresets = {
      dailymotion: ['-vf', 'scale=1280:720', '-b:v', '2M'],
      facebook: ['-vf', 'scale=1280:720', '-b:v', '2M'],
      instagram: ['-vf', 'scale=1080:1080', '-b:v', '1.5M'],
      telegram: ['-vf', 'scale=854:480', '-b:v', '1M'],
      twitch: ['-vf', 'scale=1280:720', '-b:v', '3M'],
      twitter: ['-vf', 'scale=1280:720', '-b:v', '1.5M'],
      viber: ['-vf', 'scale=854:480', '-b:v', '1M'],
      vimeo: ['-vf', 'scale=1280:720', '-b:v', '2M'],
      whatsapp: ['-vf', 'scale=854:480', '-b:v', '1M'],
      youtube: ['-vf', 'scale=1920:1080', '-b:v', '4M'],
    };
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .addOptions(webservicePresets[format] || ['-vf', 'scale=1280:720', '-b:v', '2M'])
        .toFormat('mp4')
        .on('end', () => {
          console.log(`Video webservice conversion completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Video webservice conversion error: ${err.message}`);
          reject(new Error(`Video webservice conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } else {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(format)
        .on('end', () => {
          console.log(`Video conversion completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Video conversion error: ${err.message}`);
          reject(new Error(`Video conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }
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
          reject(new Error(`Archive conversion failed: ${err.message}`));
        });
    });
  } else {
    throw new Error(`Unsupported archive format: ${format}`);
  }
}

async function convertEbook(inputPath, outputPath, format) {
  const supportedEbookFormats = ['epub', 'mobi', 'azw3', 'fb2', 'lit', 'lrf', 'pdb', 'tcr', 'pdf'];
  if (!supportedEbookFormats.includes(format)) {
    throw new Error(`Unsupported ebook format: ${format}`);
  }
  return new Promise((resolve, reject) => {
    exec(`ebook-convert "${inputPath}" "${outputPath}"`, (err) => {
      if (err) {
        console.error(`Ebook conversion error: ${err.message}`);
        return reject(new Error(`Ebook conversion failed: ${err.message}`));
      }
      console.log(`Ebook conversion completed: ${outputPath}`);
      resolve();
    });
  });
}

async function cleanupFiles(filePaths) {
  const maxRetries = 3;
  const retryDelay = 1000;

  for (const filePath of filePaths) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await fsPromises.access(filePath);
        await fsPromises.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
        break;
      } catch (err) {
        if (err.code === 'EPERM') {
          attempts++;
          console.warn(`EPERM error on attempt ${attempts} for ${filePath}. Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          if (attempts === maxRetries) {
            console.error(`Failed to delete file ${filePath} after ${maxRetries} attempts: ${err.message}`);
          }
        } else {
          console.error(`Error deleting file ${filePath}: ${err.message}`);
          break;
        }
      }
    }
  }
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});