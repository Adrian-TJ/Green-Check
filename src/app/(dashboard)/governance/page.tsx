"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function GovernancePage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h3" color="primary">
            Gobernanza
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta sección muestra las prácticas de gobernanza corporativa de tu
          empresa.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Incluye código de ética, políticas anticorrupción, gestión de
          riesgos y transparencia organizacional.
        </Typography>
      </Paper>
    </Container>
  );
}
