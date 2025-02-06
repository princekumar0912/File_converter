
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const pdfPoppler = require("pdf-poppler");
const authMiddleware = require("../middleware/AuthMiddleware");

const router = express.Router();

// Ensure the uploads  directory exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

//  PNG to PDF Converter Route
router.post("/png-to-pdf", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    console.log("Uploaded File:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pngFilePath = req.file.path;
    const pdfFilePath = pngFilePath.replace(".png", ".pdf");

    // Check if file exists
    if (!fs.existsSync(pngFilePath)) {
      return res.status(400).json({ message: "File does not exist" });
    }

    // Create a PDF Document
    const doc = new PDFDocument({ size: "A4" });
    const writeStream = fs.createWriteStream(pdfFilePath);
    doc.pipe(writeStream);
    doc.image(pngFilePath, 0, 0, { fit: [500, 500], align: "center", valign: "center" });
    doc.end();

    writeStream.on("finish", () => {
      res.json({
        message: "File converted successfully",
        pdfPath: pdfFilePath,
      });
      console.log("File converted:", pdfFilePath);
    });

    writeStream.on("error", (err) => {
      console.error("PDF Writing Error:", err);
      res.status(500).json({ message: "Error generating PDF", error: err });
    });

  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

//  PDF to PNG Converter Route
router.post("/pdf_to_png", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const outputDir = uploadDir; // Store output in the "converted" directory

  try {
    await convertPDF(inputPath, outputDir, "png");

    const outputFileName = `${path.basename(inputPath, ".pdf")}-1.png`;
    const outputFilePath = path.join(outputDir, outputFileName);

    res.json({
      message: "PDF converted to PNG",
      path: outputFilePath,
    });

    console.log("File converted:", outputFilePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(inputPath); // Delete uploaded file after conversion
  }
});

//  PDF to JPG Converter Route
router.post("/pdf_to_jpg", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const outputDir = uploadDir; // Store output in "converted" directory

  try {
    await convertPDF(inputPath, outputDir, "jpeg");

    const outputFileName = `${path.basename(inputPath, ".pdf")}-1.jpg`;
    const outputFilePath = path.join(outputDir, outputFileName);

    res.json({
      message: "PDF converted to JPG",
      path: outputFilePath,
    });

    console.log("File converted:", outputFilePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(inputPath); // Delete uploaded file after conversion
  }
});

//  Convert PDF Function
async function convertPDF(input, outputDir, format) {
  let opts = {
    format: format, // 'png' or 'jpeg'
    out_dir: outputDir, // Output directory
    out_prefix: path.basename(input, ".pdf"), // Filename without extension
    page: null, // Convert all pages
  };

  try {
    await pdfPoppler.convert(input, opts);
    console.log(`Conversion successful: ${input} → ${format}`);
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

module.exports = router;
