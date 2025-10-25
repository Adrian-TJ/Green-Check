"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function Upload() {
  const params = useParams();
  const uploadId = params.id as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadMessage("");
    setExtractedText("");
    setOcrConfidence(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadMessage("");
    setIsProcessing(true);
    setExtractedText("");
    setOcrConfidence(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploadId", uploadId);

      // Send to Express OCR API
      const API_URL =
        process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";
      console.log("Uploading to OCR API at:", API_URL);
      const response = await fetch(`${API_URL}/api/ocr-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("OCR Result:", data);

      setExtractedText(data.extractedText);
      setOcrConfidence(data.confidence);
      setUploadStatus("success");
      setUploadMessage(
        `File "${selectedFile.name}" processed successfully! Extracted ${data.wordCount} words.`
      );

      // Keep the file selected to show the preview
      // setSelectedFile(null); // Commented out so user can see the file details
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
            Upload Your File
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Drag and drop a file or click to browse
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 dark:bg-blue-950/20">
            <svg
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
              ID: {uploadId.slice(0, 8)}...
            </span>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
                  : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept="image/*"
              capture="environment"
            />

            <svg
              className="h-16 w-16 text-zinc-400 dark:text-zinc-500"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div className="text-center">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {isDragging
                  ? "Drop your file here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Any file type supported
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setUploadStatus("idle");
                      setUploadMessage("");
                    }}
                    className="ml-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploadStatus === "uploading" || isProcessing}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {uploadStatus === "uploading" || isProcessing ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isProcessing ? "Processing OCR..." : "Uploading..."}
                  </>
                ) : (
                  "Upload & Extract Text"
                )}
              </button>
            </div>
          )}

          {uploadMessage && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                uploadStatus === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400"
              }`}
            >
              <p className="text-sm font-medium">{uploadMessage}</p>
            </div>
          )}

          {extractedText && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Extracted Text
                </h3>
                {ocrConfidence !== null && (
                  <span
                    className={`text-sm font-medium ${
                      ocrConfidence > 80
                        ? "text-green-600 dark:text-green-400"
                        : ocrConfidence > 60
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {ocrConfidence.toFixed(1)}% confidence
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 font-mono max-h-96 overflow-y-auto">
                  {extractedText}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                  alert("Text copied to clipboard!");
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>

        <a
          href="/generate-qr"
          className="flex h-12 items-center justify-center rounded-full border border-solid border-black/8 px-6 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-white/10"
        >
          Back to QR Generator
        </a>
      </main>
    </div>
  );
}
