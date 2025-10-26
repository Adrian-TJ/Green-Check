"use client";

import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import { AIInsight } from "../models/AIInsight";

interface AIInsightsCardProps {
  insights: AIInsight | null;
  isLoading: boolean;
  error?: any;
}

export function AIInsightsCard({ insights, isLoading, error }: AIInsightsCardProps) {
  if (error) {
    return (
      <Paper sx={{ p: 2, height: "100%" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AutoAwesomeIcon sx={{ color: "#9C27B0", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Análisis AI
          </Typography>
        </Box>
        <Alert severity="error">
          No se pudo generar el análisis. Verifica la configuración de la API.
        </Alert>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: "100%" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AutoAwesomeIcon sx={{ color: "#9C27B0", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Análisis AI
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={4}
          gap={2}
        >
          <CircularProgress size={40} sx={{ color: "#9C27B0" }} />
          <Typography variant="body2" color="text.secondary">
            Generando análisis inteligente...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!insights) {
    return (
      <Paper sx={{ p: 2, height: "100%" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AutoAwesomeIcon sx={{ color: "#9C27B0", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Análisis AI
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          No hay datos suficientes para generar un análisis.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <AutoAwesomeIcon sx={{ color: "#9C27B0", fontSize: 28 }} />
        <Typography variant="h6" fontWeight={600}>
          Análisis AI
        </Typography>
        <Chip
          label="Generado por IA"
          size="small"
          sx={{
            ml: "auto",
            bgcolor: "#F3E5F5",
            color: "#9C27B0",
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Summary */}
      <Box mb={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {insights.summary}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Key Points */}
      <Box mb={2}>
        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <LightbulbIcon sx={{ fontSize: 20, color: "#FF9800" }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Puntos Clave
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {insights.keyPoints.map((point, index) => (
            <Typography
              key={index}
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, lineHeight: 1.5 }}
            >
              {point}
            </Typography>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Recommendations */}
      <Box>
        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <TipsAndUpdatesIcon sx={{ fontSize: 20, color: "#4CAF50" }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Recomendaciones
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {insights.recommendations.map((rec, index) => (
            <Typography
              key={index}
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, lineHeight: 1.5 }}
            >
              {rec}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box mt="auto" pt={2}>
        <Typography variant="caption" color="text.secondary">
          Última actualización: {new Date(insights.generatedAt).toLocaleString("es-MX")}
        </Typography>
      </Box>
    </Paper>
  );
}
