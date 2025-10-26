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

export default function GovernanceRegistryPage(): React.JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<DocumentType>("codigo_etica");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setMessage({ type: "error", text: "Solo se permiten imágenes (JPG/PNG)." });
      return;
    }

    // (Opcional) limitar tamaño a 10 MB por imagen
    const tooBig = imageFiles.find((f) => f.size > 10 * 1024 * 1024);
    if (tooBig) {
      setMessage({ type: "error", text: `La imagen "${tooBig.name}" supera 10 MB.` });
      return;
    }

    setFiles((prev) => [...prev, ...imageFiles]);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!isAuthenticated || !user?.pyme?.id || files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setMessage(null);

    // Usamos el proxy en Next: /api/ocr-upload (no llamar directo por IP/puerto)
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      // Si mantienes QR en el backend, reemplaza esto por el uploadId real
      formData.append("uploadId", `gov-${selectedType}-${Date.now()}-${i}`);
      formData.append("documentType", selectedType);

      try {
        const response = await fetch(`/api/ocr-upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          // Intenta leer el error legible del proxy/backend
          let detail = "";
          try {
            const errJson = await response.json();
            detail = errJson?.error || errJson?.message || "";
          } catch {
            // ignore
          }
          throw new Error(detail || "Upload failed");
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error: any) {
        setMessage({
          type: "error",
          text: `Error al subir "${files[i].name}"${error?.message ? `: ${error.message}` : ""}`,
        });
        setUploading(false);
        return;
      }
    }

    setMessage({ type: "success", text: "Imágenes subidas exitosamente" });
    setUploading(false);
    setFiles([]);
    setProgress(0);
  };

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
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
          Carga las imágenes de los documentos de gobernanza de tu PyME (JPG/PNG)
        </Typography>

        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Debes iniciar sesión para subir documentos
          </Alert>
        )}

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Stack direction="row" spacing={2} mb={3}>
          {docTypes.map((type) => {
            const active = selectedType === type.value;
            return (
              <Button
                key={type.value}
                variant={active ? "contained" : "outlined"}
                color={active ? "primary" : "inherit"}
                onClick={() => setSelectedType(type.value)}
                fullWidth
                disabled={uploading}
              >
                {type.label}
              </Button>
            );
          })}
        </Stack>

        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (uploading) return;
            handleFiles(e.dataTransfer.files);
          }}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            mb: 3,
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="body1" color="text.primary" mb={1}>
            Arrastra imágenes (JPG/PNG) aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tamaño máximo recomendado: 10&nbsp;MB por imagen
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {files.map((file, i) => (
              <Box
                key={`${file.name}-${i}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, mb: 1, bgcolor: "background.default", borderRadius: 1 }}
              >
                <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                  {file.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeFileAt(i)}
                  disabled={uploading}
                  aria-label={`Eliminar ${file.name}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {uploading && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 3 }}
            aria-label={`Progreso de subida: ${progress}%`}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpload}
          disabled={!isAuthenticated || !user?.pyme?.id || files.length === 0 || uploading}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? "Subiendo..." : `Subir ${files.length} Imagen(es)`}
        </Button>

        <Typography variant="caption" display="block" textAlign="center" mt={5} color="text.disabled">
          © Banorte. Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}
