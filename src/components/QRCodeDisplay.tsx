"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the QR component with SSR disabled
const QRCodeSVG = dynamic(
  async () => (await import("qrcode.react")).QRCodeSVG,
  { ssr: false }
);

type DocumentType = "luz" | "agua" | "gas" | "transporte";
type ComponentSize = "small" | "medium" | "large";

interface QRCodeDisplayProps {
  documentType: DocumentType;
  size?: ComponentSize;
}

const documentTypeLabels: Record<DocumentType, string> = {
  luz: "Luz",
  agua: "Agua",
  gas: "Gas",
  transporte: "Transporte",
};

const sizeConfig = {
  small: {
    qrSize: 192,
    containerPadding: "p-2",
    qrPadding: "p-1",
    gap: "gap-2",
    buttonGap: "gap-1.5",
    buttonHeight: "h-7",
    buttonText: "text-xs",
    iconSize: "h-2.5 w-2.5",
    labelText: "text-xs",
    borderRadius: "rounded-md",
  },
  medium: {
    qrSize: 256,
    containerPadding: "p-3",
    qrPadding: "p-2",
    gap: "gap-3",
    buttonGap: "gap-2",
    buttonHeight: "h-8",
    buttonText: "text-sm",
    iconSize: "h-3 w-3",
    labelText: "text-sm",
    borderRadius: "rounded-lg",
  },
  large: {
    qrSize: 320,
    containerPadding: "p-6",
    qrPadding: "p-4",
    gap: "gap-4",
    buttonGap: "gap-3",
    buttonHeight: "h-10",
    buttonText: "text-base",
    iconSize: "h-4 w-4",
    labelText: "text-base",
    borderRadius: "rounded-xl",
  },
};

export default function QRCodeDisplay({
  documentType,
  size = "medium",
}: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [uniqueId, setUniqueId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const config = sizeConfig[size];

  // Ensure client-only rendering to avoid SSR/CSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate QR code from server when mounted or doc type changes
  useEffect(() => {
    if (!mounted) return;
    generateQRCode();
  }, [mounted, documentType]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

      const response = await fetch(`${API_URL}/api/qr-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      const data = await response.json();
      const baseUrl = window.location.origin;

      setUniqueId(data.id);
      setUploadUrl(`${baseUrl}/upload/${data.id}?type=${documentType}`);
      console.log(`Generated QR code: ${data.id} for ${documentType}`);
    } catch (err) {
      console.error("QR generation error:", err);
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQR = () => {
    generateQRCode();
  };

  // Avoid rendering anything that could differ during SSR vs CSR
  if (!mounted) return null;

  return (
    <div
      className={`flex flex-col items-center ${config.gap} ${config.borderRadius} bg-white ${config.containerPadding} inset-shadow-sm shadow-lg dark:bg-zinc-900`}
    >
      {error && (
        <div className="w-full rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div
        className={`${config.borderRadius} bg-white ${config.qrPadding} relative`}
      >
        {/* Only render QR once we have a deterministic URL */}
        {uploadUrl && !isGenerating && (
          <QRCodeSVG
            id="qr-code"
            value={uploadUrl}
            size={config.qrSize}
            level="H"
          />
        )}
        {isGenerating && (
          <div
            className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800`}
            style={{ width: config.qrSize, height: config.qrSize }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          </div>
        )}
      </div>

      <div className={`flex flex-col ${config.buttonGap} w-full`}>
        <a
          href={`/upload/${uniqueId}?type=${documentType}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex ${
            config.buttonHeight
          } w-full items-center justify-center ${config.buttonText} ${
            config.borderRadius
          } border border-solid border-black/8 px-3 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10 ${
            !uploadUrl || isGenerating ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          Go to Upload Page
        </a>

        <button
          onClick={handleRegenerateQR}
          disabled={isGenerating}
          className={`flex ${config.buttonHeight} w-full items-center justify-center gap-1 ${config.buttonText} ${config.borderRadius} border border-solid border-black/8 px-3 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg
            className={config.iconSize}
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isGenerating ? "Generating..." : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
