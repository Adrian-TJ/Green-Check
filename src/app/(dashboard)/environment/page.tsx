"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import NatureIcon from "@mui/icons-material/Nature";

export default function EnvironmentPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <NatureIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h3" color="primary">
            Medio Ambiente
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta sección muestra las métricas relacionadas con el impacto
          ambiental de tu empresa.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Incluye consumo de agua, energía, emisiones de gases y otros
          indicadores de sostenibilidad ambiental.
        </Typography>
      </Paper>
    </Container>
  );
}
