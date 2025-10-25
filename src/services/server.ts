import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import https from "https";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const app = express();
const PORT = process.env.NEXT_PUBLIC_OCR_SERVER_PORT || 3002;

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(process.cwd(), "localhost+3-key.pem")),
  cert: fs.readFileSync(path.join(process.cwd(), "localhost+3.pem")),
};

// Configure CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// Configure multer for in-memory file uploads (no disk storage)
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "OCR Server is running" });
});

/**
 * Preprocess image to improve OCR accuracy
 * This is especially important for photos from mobile cameras
 */
async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      // Automatically rotate based on EXIF orientation data
      .rotate()
      // Convert to grayscale for better text detection
      .grayscale()
      // Increase resolution for better character recognition
      .resize({
        width: 2000,
        fit: "inside",
        withoutEnlargement: false,
      })
      // Normalize the image to improve contrast
      .normalize()
      // Sharpen to enhance edges and text
      .sharpen({
        sigma: 1.5,
        m1: 0.5,
        m2: 0.5,
      })
      // Increase contrast
      .linear(1.2, -(128 * 1.2) + 128)
      // Apply threshold to create binary image (better for text)
      .threshold(128, {
        grayscale: false,
      })
      // Remove noise
      .median(3)
      // Output as PNG for lossless quality
      .png()
      .toBuffer();
  } catch (error) {
    console.error("Image preprocessing error:", error);
    // Return original buffer if preprocessing fails
    return buffer;
  }
}

// OCR upload endpoint
app.post(
  "/api/ocr-upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadId = req.body.uploadId;
      if (!uploadId) {
        return res.status(400).json({ error: "Upload ID is required" });
      }

      console.log(
        `Processing file: ${req.file.originalname} for upload ID: ${uploadId}`
      );

      // Preprocess the image for better OCR accuracy
      console.log("Preprocessing image for better OCR accuracy...");
      const preprocessedBuffer = await preprocessImage(req.file.buffer);
      console.log("Image preprocessing completed");

      // Perform OCR using Tesseract.js directly from buffer (no file storage)
      const result = await Tesseract.recognize(
        preprocessedBuffer, // Use preprocessed buffer
        "spa", // Language (can be extended to support multiple languages)
        {
          logger: (m) => {
            if (m.status === "recognizing text") {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      const extractedText = result.data.text;
      const confidence = result.data.confidence;

      console.log(`OCR completed with confidence: ${confidence}%`);
      console.log(
        `Extracted text preview: ${extractedText.substring(0, 100)}...`
      );

      // Return the OCR results
      res.json({
        success: true,
        uploadId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedText,
        confidence,
        wordCount: extractedText.trim().split(/\s+/).length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({
        error: "Failed to process image",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Start the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS OCR Server running on https://localhost:${PORT}`);
  console.log(`Health check: https://localhost:${PORT}/health`);
  console.log(`Processing images in memory (no disk storage)`);
  console.log(`Using SSL certificates: localhost+3.pem`);
});

export default app;
