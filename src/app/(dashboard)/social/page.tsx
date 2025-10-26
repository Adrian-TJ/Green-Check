"use client";
import { Container, Paper, Box, Typography, Alert, Grid } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { useSocial } from "@/modules/social/hooks/useSocial";
import { SocialChart } from "@/modules/social/components/SocialChart";
import GenderLeadershipPie from "@/modules/social/components/GenderLeadershipPie";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

// Definir el tipo para los datos sociales
interface SocialData {
  date: string;
  men: number;
  women: number;
  men_in_leadership?: number;
  women_in_leadership?: number;
  training_hours: number;
  satisfaction_rate: number;
  insured?: number;
  uninsured?: number;
}

export default function SocialPage() {
  const { social, isLoading, error } = useSocial();

  // Convertir los datos al tipo esperado por GenderLeadershipPie
  const genderData: SocialData[] =
    social?.map((item) => ({
      date: item.date,
      men: item.men,
      women: item.women,
      men_in_leadership: item.men_in_leadership,
      women_in_leadership: item.women_in_leadership,
      training_hours: item.training_hours,
      satisfaction_rate: item.satisfaction_rate,
      insured: item.insured_employees,
      uninsured: item.uninsured_employees,
    })) || [];

  const dates = social?.map((d) => d.date) || [];

  const genderSeries = [
    {
      label: "Hombres",
      data: social?.map((d) => d.men) || [],
      color: "#42A5F5",
    },
    {
      label: "Mujeres",
      data: social?.map((d) => d.women) || [],
      color: "#EC407A",
    },
  ];

  const leadershipSeries = [
    {
      label: "Hombres",
      data: social?.map((d) => d.men_in_leadership) || [],
      color: "#1976D2",
    },
    {
      label: "Mujeres",
      data: social?.map((d) => d.women_in_leadership) || [],
      color: "#C2185B",
    },
  ];

  const trainingSeries = [
    {
      label: "Horas Capacitación",
      data: social?.map((d) => d.training_hours) || [],
      color: "#FFA726",
    },
  ];

  const satisfactionSeries = [
    {
      label: "Satisfacción",
      data: social?.map((d) => d.satisfaction_rate) || [],
      color: "#66BB6A",
    },
  ];

  // Obtener datos del seguro del último periodo disponible
  const latestData =
    social && social.length > 0 ? social[social.length - 1] : null;
  const insuredValue = latestData?.insured_employees || 0;
  const uninsuredValue = latestData?.uninsured_employees || 0;
  const totalInsured = insuredValue + uninsuredValue;

  // Datos para el gráfico de pie del seguro
  const insurancePieData = [
    {
      id: 0,
      value: insuredValue,
      label: `Con Seguro: ${insuredValue} (${
        totalInsured > 0 ? ((insuredValue / totalInsured) * 100).toFixed(1) : 0
      }%)`,
      color: "#4CAF50",
    },
    {
      id: 1,
      value: uninsuredValue,
      label: `Sin Seguro: ${uninsuredValue} (${
        totalInsured > 0
          ? ((uninsuredValue / totalInsured) * 100).toFixed(1)
          : 0
      }%)`,
      color: "#F44336",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: 1.5, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <GroupsIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" color="primary">
              Impacto Social
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              Monitoreo histórico de indicadores sociales
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Error al cargar los datos sociales.
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Nuevo gráfico de pie para género y liderazgo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GenderLeadershipPie data={genderData} isLoading={isLoading} />
        </Grid>

        {/* Gráfico de pie para seguro médico */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{ p: 2, height: 530, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Empleados con Seguro vs Sin Seguro
            </Typography>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Typography>Cargando...</Typography>
              </Box>
            ) : !latestData ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Typography color="text.secondary">
                  No hay datos disponibles
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <PieChart
                  series={[
                    {
                      data: insurancePieData,
                      innerRadius: 60, // mayor radio interior
                      outerRadius: 120, // mayor radio exterior
                    },
                  ]}
                  width={380}
                  height={360} // más alto
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "middle" },
                      padding: 0,
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 300, display: "flex", flexDirection: "column" }}>
            <BarChart
              xAxis={[
                {
                  data: dates,
                  scaleType: "band",
                  label: "Períodos",
                },
              ]}
              series={trainingSeries.map((series) => ({
                data: series.data,
                label: series.label,
                color: series.color,
              }))}
              height={250}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SocialChart
            title="Satisfacción del Personal"
            xLabels={dates}
            series={satisfactionSeries}
            chartType="line"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

//<Grid size={{ xs: 12, md: 6 }}>
//size={{ xs: 12, md: 6 }}
