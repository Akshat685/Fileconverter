const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  const PORT = 3008;
  // Start server
  const server = spawn('node', ['server.js'], { env: { ...process.env, PORT } });
  
  let serverReady = false;
  server.stdout.on('data', data => {
    const msg = data.toString();
    console.log(`[Server] ${msg.trim()}`);
    if (msg.includes('Server running on')) {
      serverReady = true;
    }
  });
  
  server.stderr.on('data', data => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  // Wait for server to start
  for (let i = 0; i < 20; i++) {
    if (serverReady) break;
    await sleep(500);
  }
  
  if (!serverReady) {
    console.error('Server failed to start in time.');
    server.kill();
    process.exit(1);
  }

  const testDir = path.join(__dirname, 'test_output');
  const imgPath = path.join(__dirname, 'node_modules', 'jpegtran-bin', 'test', 'fixtures', 'test.jpg');
  const mp4Path = path.join(testDir, 'test.mp4');
  const mp3Path = path.join(testDir, 'test.mp3');
  const pdfPath = path.join(__dirname, 'node_modules', 'pdf-parse', 'test', 'data', '01-valid.pdf');

  // We need form-data to send files
  const FormData = require('form-data');
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(err => {
    // fallback if node-fetch is not installed, use native fetch if node 18+
    return globalThis.fetch(...args);
  });

  const tests = [
    { file: imgPath, originalName: 'test.jpg', type: 'image', target: 'png' },
    { file: imgPath, originalName: 'test_compress.jpg', type: 'compressor', target: 'jpg', quality: 50 },
    { file: mp4Path, originalName: 'test.mp4', type: 'video', target: 'avi' },
    { file: mp3Path, originalName: 'test.mp3', type: 'audio', target: 'wav' },
    { file: pdfPath, originalName: 'test_pdf.pdf', type: 'pdfs', target: 'png' }, // pdf to image
    { file: pdfPath, originalName: 'test_doc.pdf', type: 'document', target: 'txt' } // Document conversion
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    console.log(`\n--- Testing ${t.type} conversion (${t.originalName} -> ${t.target}) ---`);
    const form = new FormData();
    if (!fs.existsSync(t.file)) {
      console.error(`Test file missing: ${t.file}`);
      failed++;
      continue;
    }
    
    form.append('files', fs.createReadStream(t.file), { filename: t.originalName });
    
    const formats = [{
      name: t.originalName,
      target: t.target,
      type: t.type,
      quality: t.quality
    }];
    
    form.append('formats', JSON.stringify(formats));

    try {
      const response = await fetch(`http://localhost:${PORT}/api/convert`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders ? form.getHeaders() : {}
      });

      const resBody = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success:`, resBody);
        passed++;
      } else {
        console.log(`❌ Failed with status ${response.status}:`, resBody);
        failed++;
      }
    } catch (e) {
      console.log(`❌ Request Error:`, e.message);
      failed++;
    }
  }

  console.log(`\n--- Test Summary ---`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  server.kill();
}

runTests().catch(err => {
  console.error("Fatal error during tests:", err);
  process.exit(1);
});
