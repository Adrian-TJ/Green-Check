"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import Image from "next/image";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { useAuth } from "@/modules/auth/hooks/useAuth";

type DocumentType = "luz" | "agua" | "gas" | "transporte";
type InputMode = "qr" | "manual";

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "luz", label: "Luz" },
  { value: "agua", label: "Agua" },
  { value: "gas", label: "Gas" },
  { value: "transporte", label: "Transporte" },
];

export default function ResourceRegister() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("luz");
  const [inputMode, setInputMode] = useState<InputMode>("qr");
  const [formData, setFormData] = useState({
    consumption: "",
    date: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: InputMode | null
  ) => {
    if (newMode !== null) {
      setInputMode(newMode);
      setMessage("");
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user?.pyme?.id) {
      setMessage("Debes iniciar sesión para registrar recursos");
      return;
    }

    if (!formData.consumption || !formData.date) {
      setMessage("Por favor completa los campos obligatorios");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

      const response = await fetch(`${API_URL}/api/save-resource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pymeId: user.pyme.id,
          documentType: selectedDocType,
          consumption: parseFloat(formData.consumption),
          parsedData: {
            billingDate: formData.date,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar el recurso");
      }

      const result = await response.json();
      console.log("Resource saved:", result);

      setMessage("Recurso registrado exitosamente");
      setFormData({
        consumption: "",
        date: new Date().toISOString().split("T")[0],
        invoiceNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error("Save resource error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al registrar el recurso. Por favor intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
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
      <Paper
        elevation={8}
        sx={{ width: "100%", maxWidth: 720, p: 5, borderRadius: 3 }}
      >
        <Box display="flex" justifyContent="center" mb={4}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={180}
            height={40}
          />
        </Box>

        <Typography variant="h5" color="primary" textAlign="center" mb={1}>
          Registro de Recursos Ambientales
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Selecciona el tipo de documento y el método de registro
        </Typography>

        {!isAuthenticated && inputMode === "manual" && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Debes iniciar sesión para registrar recursos manualmente
          </Alert>
        )}

        {message && (
          <Alert
            severity={message.includes("Error") ? "error" : "success"}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        {/* Input Mode Toggle */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={inputMode}
            exclusive
            onChange={handleInputModeChange}
            aria-label="input mode"
          >
            <ToggleButton value="qr" aria-label="qr code">
              <QrCodeScannerIcon sx={{ mr: 1 }} />
              Escanear QR
            </ToggleButton>
            <ToggleButton value="manual" aria-label="manual input">
              <EditIcon sx={{ mr: 1 }} />
              Registro Manual
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Document Type Buttons */}
        <Stack direction="row" spacing={2} mb={4}>
          {documentTypes.map((docType) => (
            <Button
              key={docType.value}
              variant={
                selectedDocType === docType.value ? "primary" : "secondary"
              }
              onClick={() => setSelectedDocType(docType.value)}
              fullWidth
            >
              {docType.label}
            </Button>
          ))}
        </Stack>

        {/* QR Code or Manual Form */}
        {inputMode === "qr" ? (
          <Box display="flex" justifyContent="center" mb={4} sx={{ p: 2 }}>
            <QRCodeDisplay documentType={selectedDocType} />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
            <Stack spacing={3}>
              <TextField
                label="Consumo"
                type="number"
                required
                fullWidth
                value={formData.consumption}
                onChange={(e) =>
                  handleFormChange("consumption", e.target.value)
                }
                helperText={
                  selectedDocType === "luz"
                    ? "Ingresa el consumo en kWh"
                    : selectedDocType === "agua"
                    ? "Ingresa el consumo en m³"
                    : selectedDocType === "gas"
                    ? "Ingresa el consumo en m³"
                    : "Ingresa el consumo en litros"
                }
              />

              <TextField
                label="Fecha"
                type="date"
                required
                fullWidth
                value={formData.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                disabled={!isAuthenticated || submitting}
                startIcon={<SendIcon />}
              >
                {submitting ? "Enviando..." : "Registrar Recurso"}
              </Button>
            </Stack>
          </Box>
        )}

        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          mt={5}
          color="text.disabled"
        >
          © Banorte. Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
}
