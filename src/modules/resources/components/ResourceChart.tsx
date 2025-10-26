"use client";

import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import type { ResourceChartData } from "../models/Resource";

interface ResourceChartProps {
  title: string;
  data: ResourceChartData[];
  color: string;
  unit: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function ResourceChart({
  title,
  data,
  color,
  unit,
  icon,
  isLoading,
}: ResourceChartProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  // Format dates for display
  const dates = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
  });

  const consumptions = data.map((item) => item.consumption);

  // Calculate statistics
  const latestConsumption = consumptions[consumptions.length - 1];
  const firstConsumption = consumptions[0];
  const percentageChange = ((latestConsumption - firstConsumption) / firstConsumption) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {icon && <Box sx={{ color }}>{icon}</Box>}
        <Box flex={1}>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consumo histórico bimestral
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="h6" color={color}>
            {latestConsumption.toFixed(2)} {unit}
          </Typography>
          <Typography
            variant="body2"
            color={percentageChange < 0 ? "success.main" : "error.main"}
          >
            {percentageChange > 0 ? "+" : ""}
            {percentageChange.toFixed(1)}% vs inicio
          </Typography>
        </Box>
      </Box>

      <LineChart
        xAxis={[
          {
            data: dates,
            scaleType: "point",
          },
        ]}
        series={[
          {
            data: consumptions,
            label: `Consumo (${unit})`,
            color: color,
            curve: "natural",
          },
        ]}
        height={300}
        margin={{ top: 20, right: 20, bottom: 50, left: 80 }}
        sx={{
          "& .MuiLineElement-root": {
            strokeWidth: 3,
          },
          "& .MuiMarkElement-root": {
            fill: color,
            stroke: "#fff",
            strokeWidth: 2,
          },
        }}
      />
    </Paper>
  );
}
