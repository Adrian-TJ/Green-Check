"use client";

import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface ESGScore {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

interface ESGGaugeCardProps {
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  isLoading?: boolean;
}

export function ESGGaugeCard({
  environmentScore,
  socialScore,
  governanceScore,
  isLoading,
}: ESGGaugeCardProps) {
  const [animatedScores, setAnimatedScores] = useState({
    environment: 0,
    social: 0,
    governance: 0,
  });

  // Animate scores on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores({
        environment: environmentScore,
        social: socialScore,
        governance: governanceScore,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [environmentScore, socialScore, governanceScore]);

  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
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

  // Check if we have valid data
  const hasData = environmentScore > 0 || socialScore > 0 || governanceScore > 0;

  if (!hasData) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No hay datos de ESG disponibles
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Scores: E={environmentScore}, S={socialScore}, G={governanceScore}
        </Typography>
      </Paper>
    );
  }

  const scores: ESGScore[] = [
    {
      label: "Medio Ambiente",
      value: animatedScores.environment,
      color: "#4CAF50",
    },
    {
      label: "Social",
      value: animatedScores.social,
      color: "#2196F3",
    },
    {
      label: "Gobernanza",
      value: animatedScores.governance,
      color: "#FF9800",
    },
  ];

  // Increased radius and reduced stroke width for better spacing
  const radius = 85;
  const strokeWidth = 12;
  const centerX = 120;
  const centerY = 120;
  const circumference = 2 * Math.PI * radius;

  // Calculate average ESG score
  const averageScore = Math.round(
    (animatedScores.environment +
      animatedScores.social +
      animatedScores.governance) /
      3
  );

  return (
    <Paper
      sx={{
        p: 3,
        height: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box mb={2}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Puntuaciones ESG
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Evaluación de sostenibilidad corporativa
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={3}
      >
        {/* Circular Gauge */}
        <Box
          sx={{
            position: "relative",
            width: 240,
            height: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
            {/* Background circles */}
            {scores.map((score, index) => {
              // Reduced gap between circles from 5 to 3 for tighter spacing
              const r = radius - index * (strokeWidth + 3);
              const c = 2 * Math.PI * r;
              return (
                <circle
                  key={`bg-${index}`}
                  cx={centerX}
                  cy={centerY}
                  r={r}
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth={strokeWidth}
                />
              );
            })}

            {/* Animated score circles */}
            {scores.map((score, index) => {
              // Reduced gap between circles from 5 to 3 for tighter spacing
              const r = radius - index * (strokeWidth + 3);
              const c = 2 * Math.PI * r;
              const offset = c - (score.value / 100) * c;

              return (
                <circle
                  key={`score-${index}`}
                  cx={centerX}
                  cy={centerY}
                  r={r}
                  fill="none"
                  stroke={score.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s ease-in-out",
                  }}
                />
              );
            })}
          </svg>

          {/* Center text - Average Score */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography variant="h3" fontWeight={700} color="primary">
              {averageScore}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              ESG
            </Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          {scores.map((score, index) => (
            <Box key={index}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: score.color,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {score.label}
                </Typography>
              </Box>
              <Box display="flex" alignItems="baseline" gap={0.5} ml={2.5}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {Math.round(score.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / 100 pts
                </Typography>
              </Box>
              {/* Progress bar */}
              <Box
                sx={{
                  ml: 2.5,
                  mt: 0.5,
                  height: 4,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${score.value}%`,
                    backgroundColor: score.color,
                    transition: "width 1s ease-in-out",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
