"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type DocumentType = "codigo_etica" | "anti_corrupcion" | "gestion_riesgos";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DocumentInfo {
  exists: boolean;
  fileName?: string;
  uploadDate?: string;
}

const docTypes = [
  {
    value: "codigo_etica" as DocumentType,
    label: "Código de Ética",
    description: "Analiza tus principios y valores organizacionales",
  },
  {
    value: "anti_corrupcion" as DocumentType,
    label: "Anti Corrupción",
    description: "Revisa tus políticas de prevención de corrupción",
  },
  {
    value: "gestion_riesgos" as DocumentType,
    label: "Gestión de Riesgos",
    description: "Evalúa tu marco de gestión de riesgos",
  },
];

export default function GovernanceChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docInfo, setDocInfo] = useState<Record<DocumentType, DocumentInfo>>({
    codigo_etica: { exists: false },
    anti_corrupcion: { exists: false },
    gestion_riesgos: { exists: false },
  });
  const [checkingDocs, setCheckingDocs] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_OCR_API_URL || "https://localhost:3002";

  // Check which documents exist
  useEffect(() => {
    if (!isAuthenticated || !user?.pyme?.id) return;

    const checkDocuments = async () => {
      setCheckingDocs(true);
      const results: Record<DocumentType, DocumentInfo> = {
        codigo_etica: { exists: false },
        anti_corrupcion: { exists: false },
        gestion_riesgos: { exists: false },
      };

      const pymeId = user.pyme?.id;
      if (!pymeId) {
        setCheckingDocs(false);
        return;
      }

      for (const docType of docTypes) {
        try {
          const response = await fetch(
            `${API_URL}/api/governance-document?documentType=${docType.value}&pymeId=${pymeId}`
          );
          if (response.ok) {
            const data = await response.json();
            results[docType.value] = data;
          }
        } catch (error) {
          console.error(`Error checking ${docType.value}:`, error);
        }
      }

      setDocInfo(results);
      setCheckingDocs(false);
    };

    checkDocuments();
  }, [isAuthenticated, user, API_URL]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDocumentSelect = async (docType: DocumentType) => {
    if (!docInfo[docType].exists || !user?.pyme?.id) return;

    setSelectedDoc(docType);
    setMessages([]);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/governance-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Dame un resumen inicial de este documento y sus principales puntos.",
          documentType: docType,
          pymeId: user.pyme.id,
          isInitial: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze document");

      const data = await response.json();
      setMessages([
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setError("Error al cargar el documento. Intenta de nuevo.");
      setSelectedDoc(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !selectedDoc || !user?.pyme?.id) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/governance-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          documentType: selectedDoc,
          pymeId: user.pyme.id,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setError("Error al enviar mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
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
        <Paper elevation={8} sx={{ maxWidth: 420, p: 5, borderRadius: 3 }}>
          <Typography variant="h5" color="primary" textAlign="center" mb={2}>
            Acceso Restringido
          </Typography>
          <Alert severity="warning">
            Debes iniciar sesión para acceder al análisis de documentos de gobernanza.
          </Alert>
        </Paper>
      </Box>
    );
  }

  // Document Selection View
  if (!selectedDoc) {
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
        <Paper elevation={8} sx={{ width: "100%", maxWidth: 900, p: 5, borderRadius: 3 }}>
          <Box display="flex" justifyContent="center" mb={4}>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
              alt="Banorte logo"
              width={180}
              height={40}
            />
          </Box>

          <Typography variant="h5" color="primary" textAlign="center" mb={1}>
            Análisis de Gobernanza con IA
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
            Selecciona un documento para obtener insights y recomendaciones
          </Typography>

          {checkingDocs ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {docTypes.map((doc) => (
                <Card
                  key={doc.value}
                  elevation={2}
                  sx={{
                    opacity: docInfo[doc.value].exists ? 1 : 0.5,
                    transition: "all 0.2s",
                  }}
                >
                  <CardActionArea
                    onClick={() => handleDocumentSelect(doc.value)}
                    disabled={!docInfo[doc.value].exists}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <DescriptionIcon
                          color={docInfo[doc.value].exists ? "primary" : "disabled"}
                          sx={{ fontSize: 40 }}
                        />
                        <Box flex={1}>
                          <Typography variant="h6" color="primary">
                            {doc.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doc.description}
                          </Typography>
                          {docInfo[doc.value].exists && docInfo[doc.value].fileName && (
                            <Typography variant="caption" color="success.main" display="block" mt={0.5}>
                              ✓ Documento disponible: {docInfo[doc.value].fileName}
                            </Typography>
                          )}
                          {!docInfo[doc.value].exists && (
                            <Typography variant="caption" color="error.main" display="block" mt={0.5}>
                              ✗ No has subido este documento aún
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          )}

          <Typography variant="caption" display="block" textAlign="center" mt={5} color="text.disabled">
            © Banorte. Todos los derechos reservados.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Chat View
  const selectedDocInfo = docTypes.find((d) => d.value === selectedDoc);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => setSelectedDoc(null)}>
            <ArrowBackIcon />
          </IconButton>
          <DescriptionIcon color="primary" />
          <Box flex={1}>
            <Typography variant="h6" color="primary">
              {selectedDocInfo?.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {docInfo[selectedDoc]?.fileName}
            </Typography>
          </Box>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Logo_de_Banorte.svg"
            alt="Banorte logo"
            width={120}
            height={30}
          />
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          maxWidth: 900,
          mx: "auto",
          width: "100%",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: message.role === "user" ? "row-reverse" : "row",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: message.role === "user" ? "primary.main" : "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {message.role === "user" ? (
                <PersonIcon sx={{ color: "white" }} />
              ) : (
                <SmartToyIcon sx={{ color: "white" }} />
              )}
            </Box>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: "70%",
                bgcolor: message.role === "user" ? "primary.light" : "background.paper",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  color: message.role === "user" ? "white" : "text.primary",
                }}
              >
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                color={message.role === "user" ? "white" : "text.secondary"}
                display="block"
                mt={1}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box display="flex" gap={2} mb={3}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SmartToyIcon sx={{ color: "white" }} />
            </Box>
            <Paper elevation={1} sx={{ p: 2 }}>
              <CircularProgress size={20} />
            </Paper>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ maxWidth: 900, mx: "auto", display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu pregunta sobre el documento..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            disabled={loading}
            multiline
            maxRows={4}
          />
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            sx={{ minWidth: 100 }}
            endIcon={<SendIcon />}
          >
            Enviar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}