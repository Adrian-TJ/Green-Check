"use client";

import { Box, Container, Typography, Paper, Grid, Alert } from "@mui/material";
import NatureIcon from "@mui/icons-material/Nature";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import Co2Icon from "@mui/icons-material/Co2";
import { useResources } from "@/modules/resources/hooks/useResources";
import { ResourceChart } from "@/modules/resources/components/ResourceChart";
import { ResourceMetricCard } from "@/modules/resources/components/ResourceMetricCard";
import type { ResourceChartData } from "@/modules/resources/models/Resource";

export default function EnvironmentPage() {
  const { resources, isLoading, error } = useResources();

  // Calculate CO2 emissions based on electricity and transport
  // Electricity: ~0.5 kg CO2 per kWh (average)
  // Transport: ~0.12 kg CO2 per km (average car)
  const calculateCO2Data = (): ResourceChartData[] => {
    if (!resources?.luz || !resources?.transporte) return [];

    const maxLength = Math.max(
      resources.luz.length,
      resources.transporte.length
    );
    const co2Data: ResourceChartData[] = [];

    for (let i = 0; i < maxLength; i++) {
      const luzData = resources.luz[i];
      const transporteData = resources.transporte[i];

      if (luzData && transporteData) {
        const co2FromElectricity = luzData.consumption * 0.5; // kg CO2
        const co2FromTransport = transporteData.consumption * 0.12; // kg CO2
        const totalCO2 = co2FromElectricity + co2FromTransport;

        co2Data.push({
          date: luzData.date,
          consumption: Math.round(totalCO2 * 100) / 100, // Round to 2 decimals
        });
      }
    }

    return co2Data;
  };

  const co2Data = calculateCO2Data();

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: 1.5, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NatureIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" color="primary">
              Medio Ambiente
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "1rem" }}
            >
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

      {/* Metric Cards */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <ResourceMetricCard
            title="Electricidad"
            data={resources?.luz || []}
            color="#FFC107"
            unit="kWh"
            icon={<BoltIcon />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <ResourceMetricCard
            title="Agua"
            data={resources?.agua || []}
            color="#2196F3"
            unit="m³"
            icon={<WaterDropIcon />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <ResourceMetricCard
            title="Gas"
            data={resources?.gas || []}
            color="#FF5722"
            unit="m³"
            icon={<LocalFireDepartmentIcon />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <ResourceMetricCard
            title="Transporte"
            data={resources?.transporte || []}
            color="#4CAF50"
            unit="km"
            icon={<DirectionsCarIcon />}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <ResourceMetricCard
            title="CO₂"
            data={co2Data}
            color="#9C27B0"
            unit="kg"
            icon={<Co2Icon />}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
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
