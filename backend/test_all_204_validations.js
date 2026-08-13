const path = require('path');

const inputs = {
  pdfs: ["pdf"],
  image: ["bmp", "eps", "gif", "ico", "png", "svg", "tga", "tiff", "wbmp", "webp", "jpg", "jpeg"],
  document: ["doc", "docx", "txt", "rtf", "odt", "html", "ppt", "pptx", "xlsx"],
  audio: ["mp3", "wav", "aac", "flac", "ogg", "opus", "wma", "aiff", "m4v", "mmf", "3g2"],
  video: ["mp4", "avi", "mov", "webm", "mkv", "flv", "wmv", "3gp", "mpg", "ogv"],
  archive: ["zip", "7z"],
  ebook: ["epub", "mobi", "azw3", "fb2", "lit", "lrf", "pdb", "tcr"]
};

const formatOptions = {
  image: ["GIF", "JPG", "PNG", "TIFF", "WEBP", "PDF"],
  pdfs: ["DOCX", "TXT", "RTF", "ODT", "JPG", "PNG", "GIF"],
  audio: ["FLAC", "OGG", "OPUS", "WAV"],
  video: ["AVI", "FLV"],
  document: ["DOCX", "PDF", "TXT", "RTF", "ODT"],
  archive: ["ZIP", "7Z"],
  ebook: ["EPUB", "MOBI", "PDF", "AZW3"]
};

const allFormats = [
  'bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg',
  'pdf', 'docx', 'txt', 'rtf', 'odt', 'doc', 'html', 'ppt', 'pptx', 'xlsx',
  'mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'm4v', 'mmf', '3g2',
  'mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', '3gp', 'mpg', 'ogv',
  'zip', '7z',
  'epub', 'mobi', 'azw3', 'fb2', 'lit', 'lrf', 'pdb', 'tcr'
];

const supportedFormats = {
  image: ['bmp', 'eps', 'ico', 'svg', 'tga', 'wbmp', 'jpg', 'png', 'gif', 'tiff', 'webp', 'pdf'],
  compressor: ['jpg', 'png', 'svg', 'pdf'],
  pdfs: ['jpg', 'png', 'gif', 'docx', 'txt', 'rtf', 'odt'],
  audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'm4v', 'mmf', '3g2'],
  video: ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', '3gp', 'mpg', 'ogv'],
  document: ['docx', 'pdf', 'txt', 'rtf', 'odt'],
  archive: ['zip', '7z'],
  ebook: ['epub', 'mobi', 'azw3', 'pdf'],
};

let passed = 0;
let failed = 0;
const errors = [];

for (const [section, exts] of Object.entries(inputs)) {
  const targets = formatOptions[section];
  for (const ext of exts) {
    for (const target of targets) {
      if (ext.toUpperCase() !== target.toUpperCase()) {
         const inputExt = ext.toLowerCase();
         const outputExt = target.toLowerCase();
         const conversionType = section;

         try {
           if (!allFormats.includes(inputExt)) {
             throw new Error(`Unsupported input format: ${inputExt}.`);
           }
           if (!Object.keys(supportedFormats).includes(conversionType)) {
             throw new Error(`Unsupported conversion type: ${conversionType}.`);
           }
           if (!supportedFormats[conversionType].includes(outputExt)) {
             throw new Error(`Unsupported output format: ${outputExt} for type ${conversionType}.`);
           }
           passed++;
         } catch (e) {
           failed++;
           errors.push(`${ext.toUpperCase()} to ${target.toUpperCase()}: ${e.message}`);
         }
      }
    }
  }
}

console.log(`Validation Test Results:`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) {
  console.log(`\nFailed Combinations:`);
  errors.forEach(e => console.log(e));
}
