const express = require("express");
const multer = require("multer");
const path = require("path");
const { convertFile } = require("../controllers/convertController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/convert", upload.single("file"), convertFile);

module.exports = router;
