"use client";

import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { ResourceChart } from "@/modules/resources/components/ResourceChart";
import { ESGGaugeCard } from "@/modules/resources/components/ESGGaugeCard";
import { useESG } from "@/modules/esg/hooks/useESG";
import { KPICard } from "@/modules/resources/components/KPICard";
import { TrendCard } from "@/modules/resources/components/TrendCard";
import { useESGInsights } from "@/modules/ai/hooks/useESGInsights";
import { AIInsightsCard } from "@/modules/ai/components/AIInsightsCard";

export default function DashboardPage() {
  /**
   * DATA FETCHING
   * useESG hook fetches and combines all three pillar scores:
   * - environmentScores: Resource consumption reduction scores (0-100)
   * - socialScores: Equity, training, satisfaction, benefits scores (0-100)
   * - governanceScores: Ethics code + anti-corruption compliance (0-100)
   * - esgScores: Calculated average of E+S+G for dates where all three exist
   */
  const {
    esgScores,
    environmentScores,
    socialScores,
    governanceScores,
    isLoading,
  } = useESG();

  // AI Insights Hook - automatically fetches insights when ESG data is available
  const {
    insights,
    isLoading: insightsLoading,
    error: insightsError,
  } = useESGInsights(esgScores);

  /**
   * PILLAR SCORE CALCULATION (Latest Values)
   * Extract the most recent score for each pillar to display in gauge card
   * - Environment: Calculated from resource consumption vs baseline (agua, luz, gas, transporte)
   * - Social: Weighted average of equity, training, satisfaction, benefits
   * - Governance: Binary scoring (50pts each for ethics code + anti-corruption)
   */
  const latestEnvironmentScore =
    environmentScores?.[environmentScores.length - 1]?.score ?? 0;
  const latestSocialScore = socialScores?.[socialScores.length - 1]?.score ?? 0;
  const latestGovernanceScore =
    governanceScores?.[governanceScores.length - 1]?.score ?? 0;

  /**
   * ESG SCORE TREND CALCULATION
   * Extract current and previous total ESG scores for TrendCard
   */
  const currentESGScore = esgScores?.[esgScores.length - 1]?.esgScore ?? 0;
  const previousESGScore = esgScores?.[esgScores.length - 2]?.esgScore ?? 0;

  /**
   * CHART DATA PREPARATION (Full Historical Data)
   * Transform scores into chart-compatible format with date and consumption fields
   * - ESG: Average of all three pillars (calculated in useESG hook)
   * - Individual pillars: Direct score values from services
   */
  const esgChartData =
    esgScores?.map((score) => ({
      date: score.date,
      consumption: score.esgScore, // Average: (E + S + G) / 3
    })) || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: 1.5, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" color="primary">
              Puntuación ESG
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              Monitoreo histórico de Environment, Social y Governance
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ESG Gauge and Charts */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ESGGaugeCard
            environmentScore={latestEnvironmentScore}
            socialScore={latestSocialScore}
            governanceScore={latestGovernanceScore}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ResourceChart
            title="Puntuación ESG Total"
            data={esgChartData}
            color="#9C27B0"
            unit="puntos"
            icon={<AssessmentIcon sx={{ fontSize: 32 }} />}
            isLoading={isLoading}
            height={400}
          />
        </Grid>
      </Grid>
      {/* AI Insights Section - 2x3 Grid Layout */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {/* Left Column - 2 items stacked */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <KPICard
                title="Interes"
                value={
                  16 -
                  (3 *
                    (latestEnvironmentScore +
                      latestSocialScore +
                      latestGovernanceScore)) /
                    300
                }
                color=""
                unit="%"
                isLoading={isLoading}
              />
            </Grid>
            <Grid size={12}>
              <TrendCard
                label="Puntuación ESG"
                currentValue={currentESGScore}
                previousValue={previousESGScore}
                unit="pts"
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - AI Insights spanning both rows */}
        <Grid size={{ xs: 12, md: 10 }}>
          <AIInsightsCard
            insights={insights}
            isLoading={insightsLoading}
            error={insightsError}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
