"use client";

import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { LineChart, areaElementClasses } from "@mui/x-charts/LineChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import type { ResourceChartData } from "../models/Resource";

interface ResourceChartProps {
  title: string;
  data: ResourceChartData[];
  color: string;
  unit: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  const { top, height, bottom } = useDrawingArea();
  const svgHeight = top + bottom + height;

  return (
    <defs>
      <linearGradient
        id={id}
        x1="0"
        x2="0"
        y1="0"
        y2={`${svgHeight}px`}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
      </linearGradient>
    </defs>
  );
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

  const gradientId = `area-gradient-${title.replace(/\s/g, "-")}`;

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
              area: true,
            },
          ]}
          margin={{ top: 4, right: 45, bottom: 1, left: 3 }}
          slotProps={{
            legend: {
              position: { vertical: "bottom", horizontal: "center" },
              direction: "row",
              padding: 0,
            },
          }}
          sx={{
            width: "100%",
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            [`& .${areaElementClasses.root}`]: {
              fill: `url(#${gradientId})`,
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
        >
          <AreaGradient color={color} id={gradientId} />
        </LineChart>
      </Box>
    </Paper>
  );
}
