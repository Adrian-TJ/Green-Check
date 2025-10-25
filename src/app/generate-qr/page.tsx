"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

type DocumentType = "luz" | "agua" | "gas" | "gasolina";

export default function GenerateQR() {
  const [uploadUrl, setUploadUrl] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("luz");

  useEffect(() => {
    generateNewQR();
  }, [selectedDocType]);

  const generateNewQR = () => {
    const id = crypto.randomUUID();
    setUniqueId(id);

    const baseUrl = window.location.origin;
    setUploadUrl(`${baseUrl}/upload/${id}?type=${selectedDocType}`);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "upload-qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: "luz", label: "Luz" },
    { value: "agua", label: "Agua" },
    { value: "gas", label: "Gas" },
    { value: "gasolina", label: "Gasolina" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Generate QR Code
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Select document type and scan the QR code
          </p>
        </div>

        {/* Document Type Tabs */}
        <div className="w-full max-w-2xl">
          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {documentTypes.map((docType) => (
              <button
                key={docType.value}
                onClick={() => setSelectedDocType(docType.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedDocType === docType.value
                    ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <span>{docType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {uploadUrl && (
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
            <div className="rounded-xl bg-white p-6">
              <QRCodeSVG id="qr-code" value={uploadUrl} size={256} level="H" />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleDownloadQR}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Download QR Code
              </button>

              <a
                href={`/upload/${uniqueId}?type=${selectedDocType}`}
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-6 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10"
              >
                Go to Upload Page
              </a>

              <button
                onClick={() => {
                  generateNewQR();
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-6 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10"
              >
                <svg
                  className="h-5 w-5"
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
                Generate New QR Code
              </button>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800 w-full">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Document Type:{" "}
                  {
                    documentTypes.find((d) => d.value === selectedDocType)
                      ?.label
                  }
                </p>
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Upload ID:
              </p>
              <p className="font-mono text-sm break-all text-zinc-600 dark:text-zinc-400">
                {uniqueId}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 mt-3">
                URL:
              </p>
              <p className="font-mono text-xs break-all text-zinc-600 dark:text-zinc-400">
                {uploadUrl}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
