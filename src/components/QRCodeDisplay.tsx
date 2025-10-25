"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the QR component with SSR disabled
const QRCodeSVG = dynamic(
  async () => (await import("qrcode.react")).QRCodeSVG,
  { ssr: false }
);

type DocumentType = "luz" | "agua" | "gas" | "gasolina";
type ComponentSize = "small" | "medium" | "large";

interface QRCodeDisplayProps {
  documentType: DocumentType;
  size?: ComponentSize;
}

const documentTypeLabels: Record<DocumentType, string> = {
  luz: "Luz",
  agua: "Agua",
  gas: "Gas",
  gasolina: "Gasolina",
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

  const config = sizeConfig[size];

  // Ensure client-only rendering to avoid SSR/CSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate a fresh URL whenever we're mounted or the doc type changes
  useEffect(() => {
    if (!mounted) return;

    // All browser-only APIs live here
    const id = crypto.randomUUID();
    const baseUrl = window.location.origin;

    setUniqueId(id);
    setUploadUrl(`${baseUrl}/upload/${id}?type=${documentType}`);
  }, [mounted, documentType]);

  const handleRegenerateQR = () => {
    // Client-only regeneration
    const id = crypto.randomUUID();
    const baseUrl = window.location.origin;
    setUniqueId(id);
    setUploadUrl(`${baseUrl}/upload/${id}?type=${documentType}`);
  };

  // Avoid rendering anything that could differ during SSR vs CSR
  if (!mounted) return null;

  return (
    <div
      className={`flex flex-col items-center ${config.gap} ${config.borderRadius} bg-white ${config.containerPadding} shadow-md dark:bg-zinc-900`}
    >
      <div className={`${config.borderRadius} bg-white ${config.qrPadding}`}>
        {/* Only render QR once we have a deterministic URL */}
        {uploadUrl && (
          <QRCodeSVG
            id="qr-code"
            value={uploadUrl}
            size={config.qrSize}
            level="H"
          />
        )}
      </div>

      <div className={`flex flex-col ${config.buttonGap} w-full`}>
        <a
          href={`/upload/${uniqueId}?type=${documentType}`}
          className={`flex ${config.buttonHeight} w-full items-center justify-center ${config.buttonText} ${config.borderRadius} border border-solid border-black/8 px-3 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10`}
        >
          Go to Upload Page
        </a>

        <button
          onClick={handleRegenerateQR}
          className={`flex ${config.buttonHeight} w-full items-center justify-center gap-1 ${config.buttonText} ${config.borderRadius} border border-solid border-black/8 px-3 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10`}
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
          Regenerate
        </button>
      </div>
    </div>
  );
}
