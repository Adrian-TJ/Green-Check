"use client";

import { Box, Paper, Typography } from "@mui/material";

interface KPICardProps {
  title: string;
  value: number;
  color: string;
  unit: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  color,
  unit,
  icon,
  isLoading,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Cargando...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        height: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          backgroundColor: color,
        },
      }}
    >
      {/* Icon */}
      {icon && (
        <Box sx={{ color, fontSize: 40, mb: 1 }}>
          {icon}
        </Box>
      )}

      {/* Value */}
      <Typography variant="h3" fontWeight={700} color="text.primary">
        {value.toFixed(0)}
        <Typography
          component="span"
          variant="h6"
          color="text.secondary"
          sx={{ ml: 0.5, fontWeight: 400 }}
        >
          {unit}
        </Typography>
      </Typography>

      {/* Title */}
      <Typography
        variant="subtitle1"
        fontWeight={600}
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {title}
      </Typography>
    </Paper>
  );
}
