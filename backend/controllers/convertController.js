const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const mammoth = require("mammoth");

exports.convertFile = async (req, res) => {
  try {
    const file = req.file;
    const { targetFormat, section } = req.body;

    if (!file || !targetFormat || !section) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const inputPath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const outputPath = path.join("converted", `${baseName}_converted.${targetFormat.toLowerCase()}`);

    // Ensure output directory exists
    if (!fs.existsSync("converted")) {
      fs.mkdirSync("converted");
    }

    // Handle different conversion sections
    switch (section) {
      case "image":
        await sharp(inputPath).toFormat(targetFormat.toLowerCase()).toFile(outputPath);
        break;

      case "compressor":
        // Simple compression logic using sharp
        await sharp(inputPath)
          .jpeg({ quality: 40 }) // adjust quality as needed
          .toFile(outputPath);
        break;

      case "pdfs":
        if (targetFormat.toLowerCase().includes("pdf")) {
          // Convert image to PDF
          const pdfDoc = await PDFDocument.create();
          const imageBytes = fs.readFileSync(inputPath);
          let image;

          if (ext === ".png") {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            image = await pdfDoc.embedJpg(imageBytes);
          }

          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });

          const pdfBytes = await pdfDoc.save();
          fs.writeFileSync(outputPath, pdfBytes);
        }
        break;

      default:
        return res.status(400).json({ error: "Unsupported section" });
    }

    return res.status(200).json({ file: outputPath });

  } catch (error) {
    console.error("Conversion error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
