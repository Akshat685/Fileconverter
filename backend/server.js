const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
const PORT = 5000;

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/api/convert", upload.array("files"), async (req, res) => {
  const formats = JSON.parse(req.body["formats[]"] || "[]");

  const zipPath = path.join(__dirname, "converted.zip");
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    res.download(zipPath, "converted_files.zip", () => {
      fs.unlinkSync(zipPath); // clean zip after sending
    });
  });

  archive.on("error", err => res.status(500).send({ error: err.message }));

  archive.pipe(output);

  // TODO: Use actual conversion logic here (mock only for now)
  req.files.forEach((file, i) => {
    const meta = formats[i];
    const convertedName = `${path.parse(file.originalname).name}_to_${meta.target}.${meta.target.toLowerCase()}`;
    archive.file(file.path, { name: convertedName });
  });

  archive.finalize();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
