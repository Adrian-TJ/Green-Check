"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

type DocumentType = "codigo_etica" | "anti_corrupcion" | "gestion_riesgos";

const docTypes = [
  { value: "codigo_etica", label: "Código de Ética" },
  { value: "anti_corrupcion", label: "Anti Corrupción" },
  { value: "gestion_riesgos", label: "Gestión de Riesgos" },
] as const;

export default function GovernanceRegistryPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<DocumentType>("codigo_etica");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter((f) => f.type.includes("pdf"));
    if (pdfFiles.length === 0) {
      setMessage("Solo se permiten archivos PDF");
      return;
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!isAuthenticated || !user?.pyme?.id || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const API_URL = process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("uploadId", `gov-${selectedType}-${Date.now()}`);
      formData.append("documentType", selectedType);

      try {
        const response = await fetch(`${API_URL}/api/ocr-upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        setProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        setMessage(`Error al subir ${files[i].name}`);
        setUploading(false);
        return;
      }
    }

    setMessage("Archivos subidos exitosamente");
    setUploading(false);
    setFiles([]);
    setProgress(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={8} sx={{ width: "100%", maxWidth: 720, p: 5, borderRadius: 3 }}>
        <Box display="flex" justifyContent="center" mb={4}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={180}
            height={40}
          />
        </Box>

        <Typography variant="h5" color="primary" textAlign="center" mb={1}>
          Registro de Gobernanza
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          Carga los documentos de gobernanza de tu PyME
        </Typography>

        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Debes iniciar sesión para subir documentos
          </Alert>
        )}

        {message && (
          <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Stack direction="row" spacing={2} mb={3}>
          {docTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "primary" : "secondary"}
              onClick={() => setSelectedType(type.value)}
              fullWidth
            >
              {type.label}
            </Button>
          ))}
        </Stack>

        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            mb: 3,
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="body1" color="text.primary" mb={1}>
            Arrastra archivos PDF aquí o haz clic para seleccionar
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {files.map((file, i) => (
              <Box
                key={i}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, mb: 1, bgcolor: "background.default", borderRadius: 1 }}
              >
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {file.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  disabled={uploading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />}

        <Button
          variant="primary"
          fullWidth
          onClick={handleUpload}
          disabled={!isAuthenticated || !user?.pyme?.id || files.length === 0 || uploading}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? "Subiendo..." : `Subir ${files.length} Archivo(s)`}
        </Button>

        <Typography variant="caption" display="block" textAlign="center" mt={5} color="text.disabled">
          © Banorte. Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}