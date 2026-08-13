const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  const PORT = 3009;
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
  // Create a dummy zip file using adm-zip or just a simple text file, but our endpoint takes a zip and makes a 7z.
  // Actually, wait, the API accepts a text file and zips/7zs it?
  // Let's use `test_output/test.txt` and convert it to 7z.
  // In `Dropbox.tsx`, inputs to archive are 'zip' or '7z', but any file can technically be compressed if `formatOptions` allowed it. But `allFormats` requires `zip` or `7z`. Let's create a dummy zip file to test ZIP -> 7Z.
  
  const archiver = require('archiver');
  const dummyZipPath = path.join(testDir, 'dummy.zip');
  await new Promise((resolve) => {
    const output = fs.createWriteStream(dummyZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.pipe(output);
    archive.append('hello world', { name: 'hello.txt' });
    archive.finalize();
  });

  const FormData = require('form-data');
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

  const form = new FormData();
  form.append('files', fs.createReadStream(dummyZipPath), { filename: 'dummy.zip' });
  const formats = [{
    name: 'dummy.zip',
    target: '7z',
    type: 'archive'
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
    } else {
      console.log(`❌ Failed with status ${response.status}:`, resBody);
    }
  } catch (e) {
    console.log(`❌ Request Error:`, e.message);
  }

  server.kill();
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
