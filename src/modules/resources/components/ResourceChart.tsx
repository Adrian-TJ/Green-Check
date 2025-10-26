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
      <Paper
        sx={{
          p: 1.5,
          height: 296,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 1.5,
          height: 296,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  // Format dates for display
  const dates = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("es-MX", {
      month: "short",
      year: "numeric",
    });
  });

  const consumptions = data.map((item) => item.consumption);

  // Calculate statistics
  const latestConsumption = consumptions[consumptions.length - 1];
  const firstConsumption = consumptions[0];
  const percentageChange =
    ((latestConsumption - firstConsumption) / firstConsumption) * 100;

  return (
    <Paper
      sx={{ p: 1.5, height: 296, display: "flex", flexDirection: "column" }}
    >
      {/* First Row - Title with Icon */}
      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
        {icon && <Box sx={{ color, fontSize: 20 }}>{icon}</Box>}
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      {/* Second Row - Metrics */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Box>
          <Typography variant="subtitle1" color={color} fontWeight={600}>
            {latestConsumption.toFixed(2)} {unit}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Consumo actual
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color={percentageChange < 0 ? "success.main" : "error.main"}
          >
            {percentageChange > 0 ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            vs inicio
          </Typography>
        </Box>
      </Box>

      {/* Chart - Takes remaining space */}
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={0}
      >
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
          margin={{ top: 4, right: 45, bottom: 1, left: 3 }}
          slotProps={{
            legend: {
              position: { vertical: "bottom", horizontal: "middle" },
              direction: "row",
              padding: 0,
            },
          }}
          sx={{
            width: "100%",
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            "& .MuiMarkElement-root": {
              fill: color,
              stroke: "#fff",
              strokeWidth: 2,
            },
            "& .MuiChartsLegend-root": {
              transform: "translateY(8px)",
            },
          }}
        />
      </Box>
    </Paper>
  );
}
