"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function Upload() {
  const params = useParams();
  const searchParams = useSearchParams();
  const uploadId = params.id as string;
  const documentType = searchParams.get("type") || "luz";
  const { user, isAuthenticated } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [qrValidation, setQrValidation] = useState<{
    valid: boolean;
    loading: boolean;
    error?: string;
  }>({ valid: false, loading: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypeLabels: Record<string, { label: string }> = {
    luz: { label: "Luz" },
    agua: { label: "Agua" },
    gas: { label: "Gas" },
    transporte: { label: "transporte" },
  };

  // Validate QR code on mount
  useEffect(() => {
    const validateQRCode = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

        const response = await fetch(`${API_URL}/api/qr-validate/${uploadId}`);
        const data = await response.json();

        if (data.valid) {
          setQrValidation({ valid: true, loading: false });
        } else {
          setQrValidation({
            valid: false,
            loading: false,
            error: data.error || "Invalid QR code",
          });
        }
      } catch (err) {
        console.error("QR validation error:", err);
        setQrValidation({
          valid: false,
          loading: false,
          error: "Failed to validate QR code",
        });
      }
    };

    if (uploadId) {
      validateQRCode();
    }
  }, [uploadId]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadMessage("");
    setExtractedText("");
    setOcrConfidence(null);
    setParsedData(null);

    // Generate image preview
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploadId", uploadId);
      formData.append("documentType", documentType);

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
      setParsedData(data.parsedData);
      setUploadStatus("success");
      setUploadMessage(
        `File "${selectedFile.name}" processed successfully! Extracted ${data.wordCount} words.`
      );

      // Extract consumption from parsed data based on document type
      let consumption = 0;
      if (data.parsedData) {
        if (
          data.parsedData.documentType === "luz" &&
          data.parsedData.consumoActual !== undefined
        ) {
          consumption = data.parsedData.consumoActual;
        } else if (
          data.parsedData.documentType === "agua" &&
          data.parsedData.ultimaLectura !== undefined
        ) {
          consumption = data.parsedData.ultimaLectura;
        } else if (
          data.parsedData.documentType === "gas" &&
          data.parsedData.consumo !== undefined
        ) {
          consumption = data.parsedData.consumo;
        } else if (
          data.parsedData.documentType === "transporte" &&
          data.parsedData.consumo !== undefined
        ) {
          consumption = data.parsedData.consumo;
        }
      }

      // Save resource to database if user is authenticated and has a Pyme
      if (isAuthenticated && user?.pyme?.id && consumption > 0) {
        try {
          console.log(
            `Saving resource: ${documentType}, consumption: ${consumption}, pymeId: ${user.pyme.id}`
          );

          const saveResponse = await fetch(`${API_URL}/api/save-resource`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pymeId: user.pyme.id,
              documentType,
              consumption,
              parsedData: data.parsedData,
            }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log("Resource saved successfully:", saveResult);
          } else {
            const errorData = await saveResponse.json();
            console.error("Failed to save resource:", errorData);
          }
        } catch (saveError) {
          console.error("Error saving resource to database:", saveError);
          // Continue even if saving fails - user still gets OCR results
        }
      } else {
        if (!isAuthenticated) {
          console.log("User not authenticated - skipping resource save");
        } else if (!user?.pyme?.id) {
          console.log("User has no Pyme - skipping resource save");
        } else if (consumption === 0) {
          console.log("No consumption data extracted - skipping resource save");
        }
      }

      // Mark submission as complete to show final screen
      setTimeout(() => {
        setSubmissionComplete(true);
      }, 500);

      // Keep the file selected to show the preview
      // setSelectedFile(null); // Commented out so user can see the file details
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage("Upload failed. Please try again.");
      console.error("Upload error:", error);

      // Mark submission as complete to show error screen
      setTimeout(() => {
        setSubmissionComplete(true);
      }, 500);
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

  // Show submission complete screen
  if (submissionComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 p-4">
        <div className="w-full max-w-2xl">
          {uploadStatus === "success" ? (
            <div className="rounded-3xl bg-white p-12 shadow-2xl dark:bg-zinc-900 text-center">
              {/* Success Animation */}
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <svg
                  className="h-12 w-12 text-green-600 dark:text-green-400"
                  fill="none"
                  strokeWidth="3"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                Recibido Correctamente!
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                Tu recibo de{" "}
                {documentTypeLabels[documentType]?.label.toLowerCase() ||
                  "document"}{" "}
                ha sido procesado y enviado.
              </p>

              {/* Document Info */}
              {selectedFile && (
                <div className="mb-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-6 space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                      <img
                        src={imagePreview}
                        alt="Uploaded document preview"
                        className="w-full h-auto max-h-96 object-contain bg-white dark:bg-zinc-900"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 shadow-2xl dark:bg-zinc-900 text-center">
              {/* Error Animation */}
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
                <svg
                  className="h-12 w-12 text-red-600 dark:text-red-400"
                  fill="none"
                  strokeWidth="3"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                Fallo en el Envío
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                No pudimos procesar tu recibo de{" "}
                {documentTypeLabels[documentType]?.label.toLowerCase() ||
                  "document"}
                .
              </p>

              {/* Error Details */}
              <div className="mb-8 rounded-2xl bg-red-50 dark:bg-red-950/20 p-6">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  {uploadMessage || "An error occurred during processing"}
                </p>
              </div>

              {/* Error icon */}
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">
                  Porfavor intenta de nuevo con un nuevo código QR.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {documentTypeLabels[documentType]?.label || "Document"}
            </span>
            <span className="text-blue-400 dark:text-blue-500">•</span>
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

        {/* QR Validation Status */}
        {qrValidation.loading && (
          <div className="w-full rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Validating QR code...
              </p>
            </div>
          </div>
        )}

        {!qrValidation.loading && !qrValidation.valid && (
          <div className="w-full rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
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
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-400">
                  Invalid QR Code
                </p>
                <p className="text-xs text-red-700 dark:text-red-500">
                  {qrValidation.error ||
                    "This QR code is not valid or has already been used."}
                </p>
              </div>
            </div>
          </div>
        )}

        {qrValidation.valid && (
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
                {/* Image Preview */}
                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                    <img
                      src={imagePreview}
                      alt="Uploaded document preview"
                      className="w-full h-auto max-h-96 object-contain bg-white dark:bg-zinc-900"
                    />
                  </div>
                )}

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

            {parsedData && parsedData.documentType === "luz" && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  ⚡ Parsed Bill Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Billing Period */}
                  {parsedData.periodo && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Periodo Facturado
                      </p>
                      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {parsedData.periodo}
                      </p>
                    </div>
                  )}

                  {/* Current Consumption */}
                  {parsedData.consumoActual !== undefined && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Consumo Actual
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {parsedData.consumoActual} kWh
                      </p>
                    </div>
                  )}

                  {/* Previous Consumption */}
                  {parsedData.consumoAnterior !== undefined && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Consumo Anterior
                      </p>
                      <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                        {parsedData.consumoAnterior} kWh
                      </p>
                    </div>
                  )}

                  {/* Consumption Difference */}
                  {parsedData.consumoDiferencia !== undefined && (
                    <div
                      className={`rounded-lg border p-4 ${
                        parsedData.consumoDiferencia > 0
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                          : parsedData.consumoDiferencia < 0
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-1 ${
                          parsedData.consumoDiferencia > 0
                            ? "text-red-600 dark:text-red-400"
                            : parsedData.consumoDiferencia < 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        Diferencia de Consumo
                      </p>
                      <p
                        className={`text-base font-semibold ${
                          parsedData.consumoDiferencia > 0
                            ? "text-red-700 dark:text-red-300"
                            : parsedData.consumoDiferencia < 0
                            ? "text-green-700 dark:text-green-300"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {parsedData.consumoDiferencia > 0 ? "+" : ""}
                        {parsedData.consumoDiferencia} kWh
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {parsedData && parsedData.documentType === "agua" && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  💧 Parsed Water Bill Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Billing Month */}
                  {parsedData.mesFacturado && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Mes Facturado
                      </p>
                      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {parsedData.mesFacturado}
                      </p>
                    </div>
                  )}

                  {/* Previous Reading */}
                  {parsedData.lecturaAnterior !== undefined && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Lectura Anterior
                      </p>
                      <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                        {parsedData.lecturaAnterior} m³
                      </p>
                    </div>
                  )}

                  {/* Last Reading */}
                  {parsedData.ultimaLectura !== undefined && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Última Lectura
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {parsedData.ultimaLectura} m³
                      </p>
                    </div>
                  )}

                  {/* Water Consumption */}
                  {parsedData.consumo !== undefined && (
                    <div
                      className={`rounded-lg border p-4 ${
                        parsedData.consumo > 0
                          ? "border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/20"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-1 ${
                          parsedData.consumo > 0
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        Consumo de Agua
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          parsedData.consumo > 0
                            ? "text-cyan-700 dark:text-cyan-300"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {parsedData.consumo} m³
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {parsedData && parsedData.documentType === "gas" && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  🔥 Parsed Gas Bill Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Reading Date */}
                  {parsedData.fechaActual && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Fecha de Lectura
                      </p>
                      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {parsedData.fechaActual}
                      </p>
                    </div>
                  )}

                  {/* Previous Reading */}
                  {parsedData.lecturaAnterior !== undefined && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        Lectura Anterior
                      </p>
                      <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                        {parsedData.lecturaAnterior} m³
                      </p>
                    </div>
                  )}

                  {/* Current Reading */}
                  {parsedData.lecturaActual !== undefined && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                      <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                        Lectura Actual
                      </p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {parsedData.lecturaActual} m³
                      </p>
                    </div>
                  )}

                  {/* Gas Consumption */}
                  {parsedData.consumo !== undefined && (
                    <div
                      className={`rounded-lg border p-4 ${
                        parsedData.consumo > 0
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-1 ${
                          parsedData.consumo > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        Consumo de Gas
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          parsedData.consumo > 0
                            ? "text-red-700 dark:text-red-300"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {parsedData.consumo} m³
                      </p>
                    </div>
                  )}
                </div>
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
        )}
      </main>
    </div>
  );
}
