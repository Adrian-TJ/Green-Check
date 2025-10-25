import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import https from "https";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DocumentType = "luz" | "agua" | "gas" | "transporte";

interface ParsedDocumentData {
  documentType: DocumentType;
  [key: string]: any;
}

interface QRCodeEntry {
  id: string;
  documentType: DocumentType;
  createdAt: Date;
  used: boolean;
  usedAt?: Date;
}

// In-memory storage for QR codes
const qrCodeStore = new Map<string, QRCodeEntry>();

// QR code expiration time (24 hours)
const QR_EXPIRATION_MS = 24 * 60 * 60 * 1000;

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
 * Cleanup expired and used QR codes
 */
function cleanupExpiredQRCodes() {
  const now = new Date();
  let cleanupCount = 0;

  qrCodeStore.forEach((entry, id) => {
    const ageMs = now.getTime() - entry.createdAt.getTime();

    // Delete if expired or used
    if (entry.used || ageMs > QR_EXPIRATION_MS) {
      qrCodeStore.delete(id);
      cleanupCount++;
    }
  });

  if (cleanupCount > 0) {
    console.log(`Cleaned up ${cleanupCount} expired/used QR codes`);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredQRCodes, 60 * 60 * 1000);

/**
 * Generate a new QR code
 */
app.post("/api/qr-generate", (req: Request, res: Response) => {
  try {
    const { documentType } = req.body;

    if (
      !documentType ||
      !["luz", "agua", "gas", "transporte"].includes(documentType)
    ) {
      return res.status(400).json({
        error: "Valid document type is required (luz, agua, gas, transporte)",
      });
    }

    // Generate unique ID
    const id = crypto.randomUUID();

    // Store QR code entry
    const entry: QRCodeEntry = {
      id,
      documentType,
      createdAt: new Date(),
      used: false,
    };

    qrCodeStore.set(id, entry);

    console.log(
      `Generated QR code: ${id} for ${documentType} (Total active: ${qrCodeStore.size})`
    );

    res.json({
      success: true,
      id,
      documentType,
      expiresIn: QR_EXPIRATION_MS,
      timestamp: entry.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("QR Generation Error:", error);
    res.status(500).json({
      error: "Failed to generate QR code",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Validate a QR code
 */
app.get("/api/qr-validate/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "QR code ID is required" });
    }

    const entry = qrCodeStore.get(id);

    if (!entry) {
      return res.status(404).json({
        valid: false,
        error: "QR code not found or expired",
      });
    }

    if (entry.used) {
      return res.status(400).json({
        valid: false,
        error: "QR code has already been used",
        usedAt: entry.usedAt,
      });
    }

    const now = new Date();
    const ageMs = now.getTime() - entry.createdAt.getTime();

    if (ageMs > QR_EXPIRATION_MS) {
      qrCodeStore.delete(id);
      return res.status(400).json({
        valid: false,
        error: "QR code has expired",
      });
    }

    res.json({
      valid: true,
      id: entry.id,
      documentType: entry.documentType,
      createdAt: entry.createdAt,
      expiresAt: new Date(entry.createdAt.getTime() + QR_EXPIRATION_MS),
    });
  } catch (error) {
    console.error("QR Validation Error:", error);
    res.status(500).json({
      error: "Failed to validate QR code",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
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
 * Parse luz date string to JavaScript Date
 * Handles formats like: "20 FEB20", "18 DIC19", "01 ENE 2020"
 */
function parseLuzDate(dateStr: string): Date | null {
  try {
    const monthMap: Record<string, number> = {
      ENE: 0,
      FEB: 1,
      MAR: 2,
      ABR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AGO: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DIC: 11,
    };

    // Match pattern: day month year (e.g., "20 FEB20" or "20 FEB 2020")
    const match = dateStr.trim().match(/(\d{1,2})\s+([A-Z]{3})\s?(\d{2,4})/i);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const monthStr = match[2].toUpperCase();
    let year = parseInt(match[3], 10);

    // Convert 2-digit year to 4-digit (assume 2000s for years < 50, 1900s for >= 50)
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    const month = monthMap[monthStr];
    if (month === undefined) return null;

    const date = new Date(year, month, day);
    console.log(`Parsed date "${dateStr}" to ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error(`Failed to parse date "${dateStr}":`, error);
    return null;
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

    // Parse the end date (periodoFin) to use as the billing date
    const billingDate = parseLuzDate(parsedData.periodoFin);
    if (billingDate) {
      parsedData.billingDate = billingDate;
      console.log(`Billing date extracted: ${billingDate.toISOString()}`);
    }
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
 * Parse Agua date string to JavaScript Date
 * Handles formats like: "OCT/2023", "ENE/2024"
 * Returns the last day of the specified month
 */
function parseAguaDate(dateStr: string): Date | null {
  try {
    const monthMap: Record<string, number> = {
      ENE: 0,
      FEB: 1,
      MAR: 2,
      ABR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AGO: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DIC: 11,
    };

    // Match pattern: month/year (e.g., "OCT/2023")
    const match = dateStr.trim().match(/([A-Z]{3})\/(\d{4})/i);
    if (!match) return null;

    const monthStr = match[1].toUpperCase();
    const year = parseInt(match[2], 10);

    const month = monthMap[monthStr];
    if (month === undefined) return null;

    // Get the first day of the month
    const date = new Date(year, month, 1);
    console.log(`Parsed agua date "${dateStr}" to ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error(`Failed to parse agua date "${dateStr}":`, error);
    return null;
  }
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

    // Parse the billing month to use as the billing date
    const billingDate = parseAguaDate(parsedData.mesFacturado);
    if (billingDate) {
      parsedData.billingDate = billingDate;
      console.log(`Billing date extracted: ${billingDate.toISOString()}`);
    }
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
  const parsedData: ParsedDocumentData = {
    documentType: "gas",
    rawText: text,
  };

  // Extract Actual reading and date
  // Pattern matches: "Actual" followed by reading number and date in parentheses
  const actualMatch = text.match(
    /Actual\s+(\d+)\s*\(\s*(\d{1,2}\w{3}\d{2})\s*\)/i
  );
  if (actualMatch) {
    parsedData.lecturaActual = parseInt(actualMatch[1], 10);
    parsedData.fechaActual = actualMatch[2].trim();
    console.log(`Lectura actual: ${parsedData.lecturaActual}`);
    console.log(`Fecha actual: ${parsedData.fechaActual}`);
  }

  // Extract Anterior/Anteror reading
  // Pattern matches: "Anterior" or "Anteror" followed by reading number
  const anteriorMatch = text.match(/Ante[rn]or\s+(\d+)/i);
  if (anteriorMatch) {
    parsedData.lecturaAnterior = parseInt(anteriorMatch[1], 10);
    console.log(`Lectura anterior: ${parsedData.lecturaAnterior}`);
  }

  // Calculate consumption if both readings are available
  if (parsedData.lecturaActual && parsedData.lecturaAnterior) {
    parsedData.consumo = parsedData.lecturaActual - parsedData.lecturaAnterior;
    console.log(`Consumo: ${parsedData.consumo} m³`);
  }

  return parsedData;
}

/**
 * Parse gasoline receipt (transporte)
 * Extract relevant information from gasoline receipt text
 */
function parsetransporteDocument(text: string): ParsedDocumentData {
  // TODO: Implement gasoline receipt parsing logic
  // Extract: station name, date, liters, price per liter, total amount, etc.
  return {
    documentType: "transporte",
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
    case "transporte":
      return parsetransporteDocument(text);
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
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadId = req.body.uploadId;
      if (!uploadId) {
        return res.status(400).json({ error: "Upload ID is required" });
      }

      // Validate QR code
      const qrEntry = qrCodeStore.get(uploadId);

      if (!qrEntry) {
        return res.status(404).json({
          error: "Invalid QR code",
          message: "QR code not found or has expired",
        });
      }

      if (qrEntry.used) {
        return res.status(400).json({
          error: "QR code already used",
          message: "This QR code has already been used",
          usedAt: qrEntry.usedAt,
        });
      }

      // Check if QR code is expired
      const now = new Date();
      const ageMs = now.getTime() - qrEntry.createdAt.getTime();
      if (ageMs > QR_EXPIRATION_MS) {
        qrCodeStore.delete(uploadId);
        return res.status(400).json({
          error: "QR code expired",
          message: "This QR code has expired",
        });
      }

      const documentType = qrEntry.documentType;

      console.log(
        `Processing ${documentType} document: ${req.file.originalname} for upload ID: ${uploadId}`
      );

      // Mark QR code as used immediately to prevent concurrent uploads
      qrEntry.used = true;
      qrEntry.usedAt = now;

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

      // Delete the QR code after successful processing
      qrCodeStore.delete(uploadId);
      console.log(
        `QR code ${uploadId} has been deleted after use (Remaining: ${qrCodeStore.size})`
      );

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

      // If there was an error, unmark the QR code as used so user can retry
      const uploadId = req.body.uploadId;
      if (uploadId) {
        const qrEntry = qrCodeStore.get(uploadId);
        if (qrEntry && qrEntry.used) {
          qrEntry.used = false;
          delete qrEntry.usedAt;
          console.log(`QR code ${uploadId} unmarked as used due to error`);
        }
      }

      res.status(500).json({
        error: "Failed to process image",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Save resource consumption data to database
 */
app.post("/api/save-resource", async (req: Request, res: Response) => {
  try {
    const { pymeId, documentType, consumption, parsedData } = req.body;

    // Validate required fields
    if (!pymeId || !documentType || consumption === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "pymeId, documentType, and consumption are required",
      });
    }

    // Validate Pyme exists
    const pyme = await prisma.pyme.findUnique({
      where: { id: pymeId },
    });

    if (!pyme) {
      return res.status(404).json({
        error: "Pyme not found",
        message: "The specified Pyme does not exist",
      });
    }

    // Map document types to resource types
    const documentTypeToResourceType: Record<string, string> = {
      luz: "LUZ",
      agua: "AGUA",
      gas: "GAS",
      transporte: "TRANSPORTE",
    };

    const resourceType = documentTypeToResourceType[documentType];

    if (!resourceType) {
      return res.status(400).json({
        error: "Invalid document type",
        message: "Document type must be one of: luz, agua, gas, transporte",
      });
    }

    // Determine the date to use
    let resourceDate = new Date(); // Default to now

    // If parsedData contains a billingDate, use that instead
    if (parsedData && parsedData.billingDate) {
      const billingDate = new Date(parsedData.billingDate);
      if (!isNaN(billingDate.getTime())) {
        resourceDate = billingDate;
        console.log(
          `Using billing date from parsed data: ${resourceDate.toISOString()}`
        );
      }
    }

    // Create resource name with type and date
    const formattedDate = `${
      resourceDate.getMonth() + 1
    }/${resourceDate.getDate()}/${resourceDate.getFullYear()}`;
    const resourceName = `Consumo de ${resourceType.toLowerCase()}`;

    // Create resource in database
    const resource = await prisma.resources.create({
      data: {
        name: resourceName,
        type: resourceType as any, // Cast to enum type
        consumption: parseFloat(consumption.toString()),
        pymeId,
        date: resourceDate, // Use the billing date from parsed data or current date
      },
    });

    console.log(
      `Resource saved: ${
        resource.id
      } - ${resourceName} (${consumption}) on ${resourceDate.toISOString()}`
    );

    res.json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Save Resource Error:", error);
    res.status(500).json({
      error: "Failed to save resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS OCR Server running on https://localhost:${PORT}`);
  console.log(`Health check: https://localhost:${PORT}/health`);
  console.log(`Processing images in memory (no disk storage)`);
  console.log(`Using SSL certificates: localhost+3.pem`);
});

export default app;
