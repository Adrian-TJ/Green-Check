"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

export default function SocialPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h3" color="primary">
            Social
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta sección presenta las métricas relacionadas con el impacto
          social de tu empresa.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Incluye equidad de género, capacitación, satisfacción laboral,
          programas comunitarios y bienestar de empleados.
        </Typography>
      </Paper>
    </Container>
  );
}
