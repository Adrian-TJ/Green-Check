"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h3" color="primary">
            Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Bienvenido al panel principal de GreenCheck. Aquí podrás visualizar
          un resumen de las métricas ambientales, sociales y de gobernanza de
          tu PyME.
        </Typography>
      </Paper>
    </Container>
  );
}
