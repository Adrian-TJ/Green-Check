"use client";

import { useState } from "react";
import { Box, Paper, Stack, Button, Typography } from "@mui/material";
import Image from "next/image";
import QRCodeDisplay from "@/components/QRCodeDisplay";

type DocumentType = "luz" | "agua" | "gas" | "transporte";

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "luz", label: "Luz" },
  { value: "agua", label: "Agua" },
  { value: "gas", label: "Gas" },
  { value: "transporte", label: "Transporte" },
];

export default function ResourceRegister() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("luz");

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
          Selecciona el tipo de documento y escanea el código QR
        </Typography>

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

        <Box display="flex" justifyContent="center" mb={4} sx={{ p: 2 }}>
          <QRCodeDisplay documentType={selectedDocType} />
        </Box>

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
