import * as React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { Paper } from "@mui/material";

// Interfaces para los datos
interface GenderDatum {
  label?: string;
  men: number;
  women: number;
  men_in_leadership?: number;
  women_in_leadership?: number;
}

interface ChartDatum {
  id: string;
  label: string;
  value: number;
  color: string;
}

type ViewType = "gender" | "leadership";

// Colores para hombres y mujeres
const genderColors = {
  men: "#42A5F5",
  women: "#EC407A",
  men_leadership: "#1976D2",
  women_leadership: "#C2185B",
};

const StyledText = styled("text")(({ theme }: { theme: Theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 14,
}));

interface PieCenterLabelProps {
  children: React.ReactNode;
}

function PieCenterLabel({ children }: PieCenterLabelProps): React.ReactElement {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

interface GenderLeadershipPieProps {
  data: GenderDatum[];
  isLoading?: boolean;
}

export default function GenderLeadershipPie({
  data,
  isLoading,
}: GenderLeadershipPieProps): React.ReactElement {
  const [view, setView] = React.useState<ViewType>("gender");

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  if (isLoading || !data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          height: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="text.secondary">
          {isLoading ? "Cargando..." : "No hay datos disponibles"}
        </Typography>
      </Paper>
    );
  }

  // Tomar el último dato disponible
  const latestData = data[data.length - 1];

  const totalGender = latestData.men + latestData.women;
  const totalLeadership =
    (latestData.men_in_leadership || 0) + (latestData.women_in_leadership || 0);

  // Datos para vista de género
  const genderData: ChartDatum[] = [
    {
      id: "men",
      label: "Hombres",
      value: latestData.men,
      color: genderColors.men,
    },
    {
      id: "women",
      label: "Mujeres",
      value: latestData.women,
      color: genderColors.women,
    },
  ];

  // Datos para vista de liderazgo
  const leadershipData: ChartDatum[] = [
    {
      id: "men-leaders",
      label: "Hombres Líderes",
      value: latestData.men_in_leadership || 0,
      color: genderColors.men_leadership,
    },
    {
      id: "women-leaders",
      label: "Mujeres Líderes",
      value: latestData.women_in_leadership || 0,
      color: genderColors.women_leadership,
    },
  ];

  const innerRadius = 40;
  const outerRadius = 80;

  return (
    <Paper
      sx={{
        width: "100%",
        p: 2,
        height: 300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Distribución de Género y Liderazgo
        </Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={view}
          exclusive
          onChange={handleViewChange}
        >
          <ToggleButton value="gender">Género</ToggleButton>
          <ToggleButton value="leadership">Liderazgo</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
        {view === "gender" ? (
          <PieChart
            series={[
              {
                innerRadius,
                outerRadius,
                data: genderData,
                valueFormatter: ({ value }) => {
                  const percentage = (value / totalGender) * 100;
                  return `${value} empleados (${percentage.toFixed(0)}%)`;
                },
                highlightScope: { fade: "global", highlight: "item" },
                highlighted: { additionalRadius: 2 },
                cornerRadius: 3,
              },
            ]}
            width={400}
            height={200}
            slotProps={{
              legend: {
                direction: "vertical",
                position: { vertical: "middle", horizontal: "end" },
              },
            }}
          >
            <PieCenterLabel>Género</PieCenterLabel>
          </PieChart>
        ) : (
          <PieChart
            series={[
              {
                innerRadius,
                outerRadius,
                data: leadershipData,
                valueFormatter: ({ value }) => {
                  const percentage =
                    totalLeadership > 0 ? (value / totalLeadership) * 100 : 0;
                  return `${value} líderes (${percentage.toFixed(0)}%)`;
                },
                highlightScope: { fade: "global", highlight: "item" },
                highlighted: { additionalRadius: 2 },
                cornerRadius: 3,
              },
            ]}
            width={400}
            height={200}
            slotProps={{
              legend: {
                direction: "vertical",
                position: { vertical: "middle", horizontal: "end" },
              },
            }}
          >
            <PieCenterLabel>Liderazgo</PieCenterLabel>
          </PieChart>
        )}
      </Box>
    </Paper>
  );
}
