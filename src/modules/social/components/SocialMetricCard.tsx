"use client";

import { Box, Paper, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

interface SocialMetricData {
  date: string;
  value: number;
}

interface SocialMetricCardProps {
  title: string;
  data: SocialMetricData[];
  color: string;
  unit?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  reverseColors?: boolean; // For metrics where increase is good (like satisfaction)
}

export function SocialMetricCard({
  title,
  data,
  color,
  unit = "",
  icon,
  isLoading,
  reverseColors = false,
}: SocialMetricCardProps) {
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

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon && <Box sx={{ color, fontSize: 24 }}>{icon}</Box>}
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  // Get current (most recent) and previous month values
  const currentValue = data[data.length - 1].value;
  const previousValue =
    data.length > 1 ? data[data.length - 2].value : currentValue;

  // Calculate change
  const change = currentValue - previousValue;
  const percentageChange =
    previousValue !== 0 ? (change / previousValue) * 100 : 0;

  // Determine trend
  const isIncrease = change > 0;
  const isDecrease = change < 0;
  const isEqual = change === 0;

  // Determine color based on reverseColors prop
  const getTrendColor = () => {
    if (isEqual) return "text.secondary";
    if (reverseColors) {
      return isIncrease ? "success.main" : "error.main";
    }
    return isIncrease ? "error.main" : "success.main";
  };

  const trendColor = getTrendColor();

  return (
    <Paper
      sx={{
        p: 2,
        height: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
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
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          {icon && <Box sx={{ color, fontSize: 24 }}>{icon}</Box>}
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.secondary"
          >
            {title}
          </Typography>
        </Box>
        {/* Trend Arrow */}
        {isIncrease && (
          <TrendingUpIcon sx={{ fontSize: 28, color: trendColor }} />
        )}
        {isDecrease && (
          <TrendingDownIcon sx={{ fontSize: 28, color: trendColor }} />
        )}
        {isEqual && (
          <TrendingFlatIcon sx={{ fontSize: 28, color: "text.secondary" }} />
        )}
      </Box>

      {/* Value */}
      <Box>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {currentValue.toLocaleString("es-MX")}
          {unit && (
            <Typography
              component="span"
              variant="body1"
              color="text.secondary"
              sx={{ ml: 0.5, fontWeight: 400 }}
            >
              {unit}
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Trend indicator */}
      <Box display="flex" alignItems="center" gap={0.5}>
        {isIncrease && (
          <>
            <Typography variant="body2" color={trendColor} fontWeight={600}>
              +{Math.abs(percentageChange).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs. mes anterior
            </Typography>
          </>
        )}
        {isDecrease && (
          <>
            <Typography variant="body2" color={trendColor} fontWeight={600}>
              -{Math.abs(percentageChange).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs. mes anterior
            </Typography>
          </>
        )}
        {isEqual && (
          <>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Sin cambios
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs. mes anterior
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
