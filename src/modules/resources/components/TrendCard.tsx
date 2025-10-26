"use client";

import { Box, Paper, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

interface TrendCardProps {
  label: string;
  currentValue: number;
  previousValue: number;
  unit?: string;
  isLoading?: boolean;
}

export function TrendCard({
  label,
  currentValue,
  previousValue,
  unit = "pts",
  isLoading,
}: TrendCardProps) {
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

  // Calculate change
  const change = currentValue - previousValue;
  const percentageChange =
    previousValue !== 0 ? (change / previousValue) * 100 : 0;

  // Determine trend direction
  const trend =
    change > 0 ? "up" : change < 0 ? "down" : "neutral";

  // Get color based on trend
  const getColor = () => {
    if (trend === "up") return "success.main";
    if (trend === "down") return "error.main";
    return "text.secondary";
  };

  // Get icon based on trend
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUpIcon sx={{ fontSize: 40 }} />;
    if (trend === "down") return <TrendingDownIcon sx={{ fontSize: 40 }} />;
    return <TrendingFlatIcon sx={{ fontSize: 40 }} />;
  };

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
      }}
    >
      {/* Trend Icon */}
      <Box sx={{ color: getColor(), mb: 1 }}>
        {getTrendIcon()}
      </Box>

      {/* Change Value */}
      <Typography
        variant="h2"
        fontWeight={700}
        sx={{ color: getColor() }}
      >
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}
        <Typography
          component="span"
          variant="h6"
          sx={{ ml: 0.5, fontWeight: 400 }}
        >
          {unit}
        </Typography>
      </Typography>

      {/* Percentage Change */}
      <Typography
        variant="body1"
        fontWeight={600}
        sx={{ color: getColor(), mt: 0.5 }}
      >
        ({percentageChange > 0 ? "+" : ""}
        {percentageChange.toFixed(1)}%)
      </Typography>

      {/* Label */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, textAlign: "center" }}
      >
        {label}
      </Typography>
    </Paper>
  );
}
