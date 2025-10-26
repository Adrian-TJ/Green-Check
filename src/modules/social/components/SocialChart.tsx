import { Paper, Typography, CircularProgress } from "@mui/material";
import {
  LineChart,
  BarChart,
  PieChart,
  areaElementClasses,
} from "@mui/x-charts";
import { useDrawingArea } from "@mui/x-charts/hooks";

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
        <Typography color="text.h6">No hay datos disponibles</Typography>{" "}
      </Paper>
    );
  }
  return (
    <Paper sx={{ p: 2, height }}>
      {" "}
      <Typography variant="h6" fontWeight={600} mb={1}>
        {" "}
        {title}{" "}
      </Typography>{" "}
      {chartType === "line" && (
        <LineChart
          xAxis={[{ data: xLabels, scaleType: "point" }]}
          series={series.map((s) => {
            const color = s.color || "#66BB6A";
            const gradientId = `gradient-${s.label.replace(/\s/g, "-")}`;
            return {
              data: s.data,
              color: color,
              area: true,
              curve: "natural",
            };
          })}
          margin={{ top: 10, right: 40, bottom: 20, left: 30 }}
          height={height - 70}
          yAxis={[{ min: 0, max: 100 }]}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            [`& .${areaElementClasses.root}`]: {
              fill: `url(#gradient-${
                series[0]?.label.replace(/\s/g, "-") || "default"
              })`,
            },
            "& .MuiMarkElement-root": {
              fill: series[0]?.color || "#66BB6A",
              stroke: "#fff",
              strokeWidth: 2,
            },
          }}
        >
          <AreaGradient
            color={series[0]?.color || "#66BB6A"}
            id={`gradient-${series[0]?.label.replace(/\s/g, "-") || "default"}`}
          />
        </LineChart>
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
