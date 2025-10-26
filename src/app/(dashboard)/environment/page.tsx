"use client";

import { Box, Container, Typography, Paper, Grid, Alert } from "@mui/material";
import NatureIcon from "@mui/icons-material/Nature";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useResources } from "@/modules/resources/hooks/useResources";
import { ResourceChart } from "@/modules/resources/components/ResourceChart";

export default function EnvironmentPage() {
  const { resources, isLoading, error } = useResources();

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: 1.5, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NatureIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" color="primary">
              Medio Ambiente
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Monitoreo histórico de consumo de recursos
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Error al cargar los datos de recursos. Por favor, intenta de nuevo.
        </Alert>
      )}

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ResourceChart
            title="Consumo de Agua"
            data={resources?.agua || []}
            color="#2196F3"
            unit="m³"
            icon={<WaterDropIcon sx={{ fontSize: 32 }} />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ResourceChart
            title="Consumo de Electricidad"
            data={resources?.luz || []}
            color="#FFC107"
            unit="kWh"
            icon={<BoltIcon sx={{ fontSize: 32 }} />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ResourceChart
            title="Consumo de Gas"
            data={resources?.gas || []}
            color="#FF5722"
            unit="m³"
            icon={<LocalFireDepartmentIcon sx={{ fontSize: 32 }} />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ResourceChart
            title="Consumo de Transporte"
            data={resources?.transporte || []}
            color="#4CAF50"
            unit="km"
            icon={<DirectionsCarIcon sx={{ fontSize: 32 }} />}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
