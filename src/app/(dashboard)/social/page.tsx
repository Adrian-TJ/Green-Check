"use client";
import { Container, Paper, Box, Typography, Alert, Grid } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { useSocial } from "@/modules/social/hooks/useSocial";
import { SocialChart } from "@/modules/social/components/SocialChart";
import { SocialMetricCard } from "@/modules/social/components/SocialMetricCard";
import GenderLeadershipPie from "@/modules/social/components/GenderLeadershipPie";
import { BarChart } from "@mui/x-charts/BarChart";
import { Gauge } from "@mui/x-charts/Gauge";

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

  // Calcular el porcentaje de empleados asegurados
  const insuredPercentage =
    totalInsured > 0 ? (insuredValue / totalInsured) * 100 : 0;

  // Obtener el estado del programa comunitario
  const hasCommunityProgram = latestData?.community_programs || false;

  // Prepare data for metric cards
  const totalEmployeesData =
    social?.map((item) => ({
      date: item.date,
      value: item.men + item.women,
    })) || [];

  const trainingHoursData =
    social?.map((item) => ({
      date: item.date,
      value: item.training_hours,
    })) || [];

  const satisfactionData =
    social?.map((item) => ({
      date: item.date,
      value: item.satisfaction_rate,
    })) || [];

  const insuredEmployeesData =
    social?.map((item) => ({
      date: item.date,
      value: item.insured_employees,
    })) || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 0, mb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper sx={{ p: 1.5, mb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <GroupsIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" color="primary">
              Impacto Social
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "1rem" }}
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

      {/* Metric Cards */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SocialMetricCard
            title="Total Empleados"
            data={totalEmployeesData}
            color="#42A5F5"
            icon={<PeopleIcon />}
            isLoading={isLoading}
            reverseColors={true}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SocialMetricCard
            title="Horas de Capacitación"
            data={trainingHoursData}
            color="#FFA726"
            unit="hrs"
            icon={<SchoolIcon />}
            isLoading={isLoading}
            reverseColors={true}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SocialMetricCard
            title="Satisfacción"
            data={satisfactionData}
            color="#66BB6A"
            unit="%"
            icon={<SentimentSatisfiedAltIcon />}
            isLoading={isLoading}
            reverseColors={true}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SocialMetricCard
            title="Empleados Asegurados"
            data={insuredEmployeesData}
            color="#4CAF50"
            icon={<HealthAndSafetyIcon />}
            isLoading={isLoading}
            reverseColors={true}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Nuevo gráfico de pie para género y liderazgo */}
        <Grid size={{ xs: 12, md: 5 }}>
          <GenderLeadershipPie data={genderData} isLoading={isLoading} />
        </Grid>

        {/* Gauge chart para empleados asegurados */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2, height: 300, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" mt={0} fontWeight={600} mb={1}>
              Empleados con Seguro Médico
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
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  gap: 1,
                }}
              >
                <Gauge
                  width={200}
                  height={180}
                  value={insuredPercentage}
                  valueMin={0}
                  valueMax={100}
                  text={({ value }) => `${value?.toFixed(1)}%`}
                  sx={{
                    "& .MuiGauge-valueArc": {
                      fill:
                        insuredPercentage >= 80
                          ? "#4CAF50"
                          : insuredPercentage >= 50
                          ? "#FFA726"
                          : "#F44336",
                    },
                  }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {insuredValue} de {totalInsured} empleados con seguro
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Community Program Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, height: 300, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" fontWeight={600} mb={1}>
              Programa Comunitario
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
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  gap: 2,
                }}
              >
                {hasCommunityProgram ? (
                  <CheckCircleIcon sx={{ fontSize: 120, color: "#4CAF50" }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 120, color: "#F44336" }} />
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  {hasCommunityProgram
                    ? "Se realizó un programa comunitario este mes"
                    : "No se realizó programa comunitario este mes"}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{ p: 2, height: 300, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" fontWeight={600} mb={1}>
              Horas de Capacitación
            </Typography>
            <BarChart
              xAxis={[
                {
                  data: dates,
                  scaleType: "band",
                },
              ]}
              series={trainingSeries.map((series) => ({
                data: series.data,
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
            series={satisfactionSeries.map((series) => ({
              ...series,
              data: series.data.map((value) => value * 100),
            }))}
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
