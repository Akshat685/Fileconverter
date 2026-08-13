const fs = require('fs');
const archiver = require('archiver');

async function createOdt(text, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', function() {
      console.log('ODT created successfully. Bytes:', archive.pointer());
      resolve();
    });

    archive.on('error', function(err) {
      reject(err);
    });

    archive.pipe(output);

    // mimetype must be first and uncompressed
    archive.append('application/vnd.oasis.opendocument.text', { name: 'mimetype', store: true });
    
    const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body>
    <office:text>
      ${text.split('\n').map(line => `<text:p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text:p>`).join('')}
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

createOdt('Hello world!\nThis is a test document.\nTesting ODT generation without libreoffice.', 'test.odt').catch(console.error);
