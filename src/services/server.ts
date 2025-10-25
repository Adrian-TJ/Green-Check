import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import https from "https";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

let s3: S3Client | undefined = undefined;
if (AWS_ACCESS_KEY_ID && AWS_SECRET_KEY && BUCKET_REGION) {
  s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    },
    region: BUCKET_REGION,
  });
} else {
  console.warn(
    "AWS S3 client not created: set AWS_ACCESS_KEY_ID, AWS_SECRET_KEY and BUCKET_REGION to enable S3."
  );
}

type DocumentType = "luz" | "agua" | "gas" | "gasolina";

interface ParsedDocumentData {
  documentType: DocumentType;
  [key: string]: any;
}

const app = express();
const PORT = process.env.NEXT_PUBLIC_OCR_SERVER_PORT;

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

/**
 * Parse electricity bill (Luz)
 * Extract relevant information from electricity bill text
 */
function parseLuzDocument(text: string): ParsedDocumentData {
  const parsedData: ParsedDocumentData = {
    documentType: "luz",
    rawText: text,
  };

  // Extract billing period (PERIODO FACTURADO)
  // Handle cases where dates might be on next line or with extra text in between
  const periodoMatch = text.match(
    /PERIODO\s+FACTURADO[:\s]*(?:.*?\n)?.*?(\d{1,2}\s+\w+\s?\d{2,4})\s*-\s*(\d{1,2}\s+\w+\s?\d{2,4})/i
  );
  if (periodoMatch) {
    parsedData.periodoInicio = periodoMatch[1].trim();
    parsedData.periodoFin = periodoMatch[2].trim();
    parsedData.periodo = `${periodoMatch[1].trim()} - ${periodoMatch[2].trim()}`;
    console.log(`Periodo facturado: ${parsedData.periodo}`);
  }

  // Extract energy consumption (Energía kWh)
  // Pattern matches: "Energía (kWh)" followed by current and previous consumption
  const energiaMatch = text.match(/Energ[ií]a\s*\(kWh\)\s+(\d+)\s+(\d+)/i);
  if (energiaMatch) {
    parsedData.consumoActual = parseInt(energiaMatch[1], 10);
    parsedData.consumoAnterior = parseInt(energiaMatch[2], 10);
    parsedData.consumoDiferencia =
      parsedData.consumoActual - parsedData.consumoAnterior;
    console.log(`Consumo actual: ${parsedData.consumoActual} kWh`);
    console.log(`Consumo anterior: ${parsedData.consumoAnterior} kWh`);
    console.log(`Diferencia: ${parsedData.consumoDiferencia} kWh`);
  }

  return parsedData;
}

/**
 * Parse water bill (Agua)
 * Extract relevant information from water bill text
 */
function parseAguaDocument(text: string): ParsedDocumentData {
  const parsedData: ParsedDocumentData = {
    documentType: "agua",
    rawText: text,
  };

  // Extract billing month (MES FACTURADO)
  // Pattern matches: "MES FACTURADO" followed by month/year (e.g., "OCT/2023")
  const mesFacturadoMatch = text.match(
    /MES\s+FACTURADO[:\s]+([A-Z]{3}\/\d{4})/i
  );
  if (mesFacturadoMatch) {
    parsedData.mesFacturado = mesFacturadoMatch[1].trim();
    console.log(`Mes facturado: ${parsedData.mesFacturado}`);
  }

  // Extract LECTURA ANTERIOR (previous reading)
  const lecturaAnteriorMatch = text.match(/LECTURA\s+ANTERIOR[:\s]+(\d+)/i);
  if (lecturaAnteriorMatch) {
    parsedData.lecturaAnterior = parseInt(lecturaAnteriorMatch[1], 10);
    console.log(`Lectura anterior: ${parsedData.lecturaAnterior}`);
  }

  // Extract ULTIMA LECTURA (last reading)
  const ultimaLecturaMatch = text.match(/ULTIMA\s+LECTURA[:\s+]+(\d+)/i);
  if (ultimaLecturaMatch) {
    parsedData.ultimaLectura = parseInt(ultimaLecturaMatch[1], 10);
    console.log(`Ultima lectura: ${parsedData.ultimaLectura}`);
  }

  // Calculate consumption if both readings are available
  if (parsedData.ultimaLectura && parsedData.lecturaAnterior) {
    parsedData.consumo = parsedData.ultimaLectura - parsedData.lecturaAnterior;
    console.log(`Consumo: ${parsedData.consumo} m³`);
  }

  return parsedData;
}

/**
 * Parse gas bill (Gas)
 * Extract relevant information from gas bill text
 */
function parseGasDocument(text: string): ParsedDocumentData {
  // TODO: Implement gas bill parsing logic
  // Extract: account number, period, consumption, amount, due date, etc.
  return {
    documentType: "gas",
    rawText: text,
    // Add parsed fields here
  };
}

/**
 * Parse gasoline receipt (Gasolina)
 * Extract relevant information from gasoline receipt text
 */
function parseGasolinaDocument(text: string): ParsedDocumentData {
  // TODO: Implement gasoline receipt parsing logic
  // Extract: station name, date, liters, price per liter, total amount, etc.
  return {
    documentType: "gasolina",
    rawText: text,
    // Add parsed fields here
  };
}

/**
 * Route extracted text to appropriate parser based on document type
 */
function parseDocument(
  text: string,
  documentType: DocumentType
): ParsedDocumentData {
  console.log(`Parsing document of type: ${documentType}`);

  switch (documentType) {
    case "luz":
      return parseLuzDocument(text);
    case "agua":
      return parseAguaDocument(text);
    case "gas":
      return parseGasDocument(text);
    case "gasolina":
      return parseGasolinaDocument(text);
    default:
      return {
        documentType,
        rawText: text,
      };
  }
}

// OCR upload endpoint
app.post(
  "/api/ocr-upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res
          .status(400)
          .json({ error: "No file uploaded or file is empty" });
      }
      console.log("File size:", req.file.buffer.length);

      const uploadId = req.body.uploadId;
      if (!uploadId) {
        return res.status(400).json({ error: "Upload ID is required" });
      }

      const documentType = req.body.documentType as DocumentType;
      if (
        !documentType ||
        !["luz", "agua", "gas", "gasolina"].includes(documentType)
      ) {
        return res.status(400).json({
          error: "Valid document type is required (luz, agua, gas, gasolina)",
        });
      }

      console.log(
        `Processing ${documentType} document: ${req.file.originalname} for upload ID: ${uploadId}`
      );

      
      const params = {
        Bucket: BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      let command: PutObjectCommand | undefined = undefined;
      if (req.file && req.file.buffer) {
        command = new PutObjectCommand(params);
        await s3?.send(command)
        console.log("File uploaded successfully");
      }

      console.log(req.file.buffer)
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

      // Parse the extracted text based on document type
      const parsedData = parseDocument(extractedText, documentType);
      console.log(`Document parsed successfully`);

      // Return the OCR results
      res.json({
        success: true,
        uploadId,
        documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedText,
        parsedData,
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
