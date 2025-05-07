import * as React from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { DateTime } from "luxon";

import { WeightEntry } from "../types";
import { ChartContainer } from "./ui/chart";

const lineSelections = [
  [true, true, true],
  [true, false, false],
  [false, true, false],
  [false, false, true],
] as const;

const useLineSelection = () => {
  const [lineSelectionIndex, setLineSelectionIndex] = React.useState(0);

  const [showWeightTotal, showLean, showFat] =
    lineSelections[lineSelectionIndex];

  return {
    showWeightTotal,
    showLean,
    showFat,
    onClick: () =>
      setLineSelectionIndex((i) => (i + 1) % lineSelections.length),
  };
};

export const WeightChart = ({ entries }: { entries: WeightEntry[] }) => {
  const anyFatEntries = entries.some((entry) => entry.fatPercent !== undefined);
  const { showWeightTotal, showLean, showFat, onClick } = useLineSelection();
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
    <ChartContainer
      config={{
        desktop: {
          label: "Desktop",
          color: "#2563eb",
        },
        mobile: {
          label: "Mobile",
          color: "#60a5fa",
        },
      }}
      className="min-h-[200px] w-full"
    >
      <LineChart
        data={chartData}
        onClick={() => {
          anyFatEntries && onClick();
        }}
      >
        <CartesianGrid />
        <XAxis
          dataKey="dateTime"
          domain={["auto", "auto"]}
          tickFormatter={(millis: number) => {
            return DateTime.fromMillis(millis).toFormat("d LLL");
          }}
          type="number"
        />
        <YAxis domain={["auto", "auto"]} unit="kg" />
        {showWeightTotal && (
          <Line
            name="Total weight"
            dataKey="weightTotal"
            stroke="#cc0000"
            animationDuration={500}
          />
        )}
        {anyFatEntries && showLean && (
          <Line
            name="Lean weight"
            dataKey="lean"
            stroke="#00cc00"
            animationDuration={500}
          />
        )}
        {anyFatEntries && showFat && (
          <Line
            name="Fat weight"
            dataKey="fat"
            stroke="#0000cc"
            animationDuration={500}
          />
        )}
        <Legend />
      </LineChart>
    </ChartContainer>
  );
};
