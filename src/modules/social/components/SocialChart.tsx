import { Paper, Typography, CircularProgress} from "@mui/material";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";
interface Series {
  label: string;
  data: number[];
  color?: string;
}
interface ChartProps {
  title: string;
  xLabels?: string[];
  series: Series[];
  chartType?: "line" | "bar" | "pie";
  height?: number;
  isLoading?: boolean;
}
export function SocialChart({
  title,
  xLabels = [],
  series,
  chartType = "line",
  height = 300,
  isLoading,
}: ChartProps) {
  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 2,
          height,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <CircularProgress />{" "}
      </Paper>
    );
  }
  if (!series || series.length === 0 || series[0].data.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          height,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <Typography color="text.secondary">
          No hay datos disponibles
        </Typography>{" "}
      </Paper>
    );
  }
  return (
    <Paper sx={{ p: 2, height }}>
      {" "}
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        {" "}
        {title}{" "}
      </Typography>{" "}
      {chartType === "line" && (
        <LineChart
          xAxis={[{ data: xLabels, scaleType: "point" }]}
          series={series.map((s) => ({
            data: s.data,
            label: s.label,
            color: s.color || undefined,
          }))}
          margin={{ top: 10, right: 40, bottom: 20, left: 30 }}
          height={height - 40}
          slotProps={{
            legend: {
              position: { vertical: "bottom", horizontal: "middle" },
              direction: "row",
            },
          }}
        />
      )}{" "}
      {chartType === "bar" && (
        <BarChart
          xAxis={[{ data: xLabels, scaleType: "band" }]}
          series={series.map((s) => ({
            data: s.data,
            label: s.label,
            color: s.color || undefined,
          }))}
          height={height - 40}
        />
      )}{" "}
      {chartType === "pie" && (
        <PieChart
          series={[
            {
              data: series.map((s, i) => ({
                id: i,
                value: s.data[0],
                label: s.label,
              })),
            },
          ]}
          width={height - 40}
          height={height - 40}
        />
      )}{" "}
    </Paper>
  );
}
