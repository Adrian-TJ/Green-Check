"use client";

import { useState } from "react";
import QRCodeDisplay from "@/components/QRCodeDisplay";

type DocumentType = "luz" | "agua" | "gas" | "transporte";

export default function GenerateQR() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("luz");

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: "luz", label: "Luz" },
    { value: "agua", label: "Agua" },
    { value: "gas", label: "Gas" },
    { value: "transporte", label: "Transporte" },
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

        <QRCodeDisplay documentType={selectedDocType} />
      </main>
    </div>
  );
}
