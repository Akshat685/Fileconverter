const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const archiver = require('archiver');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function createDummyPdf(outputPath) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 30;
  page.drawText('This is a test PDF document for conversion validation.', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  await fsPromises.writeFile(outputPath, pdfBytes);
  console.log(`Dummy PDF created at ${outputPath}`);
}

async function convertPdfToTextBasedDocument(inputPath, outputPath, format) {
  try {
    console.log(`Converting PDF to ${format.toUpperCase()} using pdf-parse: ${inputPath}`);
    const dataBuffer = await fsPromises.readFile(inputPath);
    let extractedText = '';
    try {
      const data = await pdfParse(dataBuffer);
      extractedText = data.text || '';
    } catch (parseErr) {
      console.warn(`pdf-parse failed: ${parseErr.message}`);
    }

    if (!extractedText.trim()) {
      throw new Error('No text content found in the PDF. This PDF may contain only images/scanned content.');
    }

    if (format === 'txt') {
      await fsPromises.writeFile(outputPath, extractedText);
    } else if (format === 'rtf') {
      const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}\n{\\*\\generator custom;}\n\\f0\\fs22 ${extractedText.replace(/\\/g, '\\\\').replace(/\\{/g, '\\\\{').replace(/\\}/g, '\\\\}').replace(/\n/g, '\\par\n')}\n}`;
      await fsPromises.writeFile(outputPath, rtfContent);
    } else if (format === 'odt') {
      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.append('application/vnd.oasis.opendocument.text', { name: 'mimetype', store: true });
        
        const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body>
    <office:text>
      ${extractedText.split('\n').map(line => `<text:p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text:p>`).join('')}
    </office:text>
  </office:body>
</office:document-content>`;
        
        archive.append(contentXml, { name: 'content.xml' });
        
        const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

        archive.append(manifestXml, { name: 'META-INF/manifest.xml' });
        archive.finalize();
      });
    }
    console.log(`PDF to ${format.toUpperCase()} conversion completed: ${outputPath}`);
    
    // Verify file exists and has size
    const stats = await fsPromises.stat(outputPath);
    if (stats.size === 0) {
      throw new Error(`Generated ${format.toUpperCase()} file is empty!`);
    } else {
      console.log(`Success: ${format.toUpperCase()} file size is ${stats.size} bytes.`);
    }

  } catch (err) {
    console.error(`PDF to ${format.toUpperCase()} conversion failed: ${err.message}`);
    throw new Error(`Failed to convert PDF to ${format.toUpperCase()}: ${err.message}`);
  }
}

async function convertPdfToDocx(inputPath, outputPath) {
  try {
    console.log(`Converting PDF to DOCX using pdf-parse: ${inputPath}`);
    const dataBuffer = await fsPromises.readFile(inputPath);
    let extractedText = '';
    try {
      const data = await pdfParse(dataBuffer);
      extractedText = data.text || '';
    } catch (parseErr) {
      console.warn(`pdf-parse failed: ${parseErr.message}`);
    }

    if (!extractedText.trim()) {
      throw new Error('No text content found in the PDF. This PDF may contain only images/scanned content.');
    }

    // Split text into paragraphs and create a proper DOCX document
    const paragraphs = extractedText.split(/\n+/).filter(line => line.trim()).map(line =>
      new Paragraph({
        children: [new TextRun({ text: line.trim(), size: 24 })],
        spacing: { after: 120 },
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun('(No text content found)')] })],
      }],
    });
    const buffer = await Packer.toBuffer(doc);
    await fsPromises.writeFile(outputPath, buffer);
    console.log(`PDF to DOCX conversion completed: ${outputPath}`);
    
    const stats = await fsPromises.stat(outputPath);
    console.log(`Success: DOCX file size is ${stats.size} bytes.`);
  } catch (err) {
    console.error(`PDF to DOCX conversion failed: ${err.message}`);
    throw new Error(`Failed to convert PDF to DOCX: ${err.message}`);
  }
}

async function runTests() {
  const testDir = path.join(__dirname, 'test_output');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  const inputPdf = path.join(__dirname, 'node_modules', 'pdf-parse', 'test', 'data', '01-valid.pdf');
  
  await convertPdfToTextBasedDocument(inputPdf, path.join(testDir, 'test.txt'), 'txt');
  await convertPdfToTextBasedDocument(inputPdf, path.join(testDir, 'test.rtf'), 'rtf');
  await convertPdfToTextBasedDocument(inputPdf, path.join(testDir, 'test.odt'), 'odt');
  await convertPdfToDocx(inputPdf, path.join(testDir, 'test.docx'));
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
