import { Card, Container } from "@mui/material";
import { WeightEntry } from "../types";
import { LineChart } from "@mui/x-charts";

export const WeightChart = ({ entries }: { entries: WeightEntry[] }) => {
  const anyFatEntries = entries.some((entry) => entry.fatPercent !== undefined);
  if (entries.length < 2) return null;
  const chartData = entries
    .map(({ dateTime, weightTotal, fatPercent }) => ({
      dateTime: dateTime.toMillis(),
      weightTotal,
      lean: fatPercent ? weightTotal * ((100 - fatPercent) / 100) : undefined,
      fat: fatPercent ? weightTotal * (fatPercent / 100) : undefined,
    }))
    .sort((a, b) => a.dateTime - b.dateTime);
  return (
    <Card sx={{ padding: "16px" }}>
      <LineChart
        width={500}
        height={250}
        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
        series={["weightTotal", "lean", "fat"].map((dataKey) => ({
          dataKey,
          label: dataKey,
        }))}
        dataset={chartData}
      ></LineChart>
    </Card>
  );
};
