import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateTime } from "luxon";

import { WeightEntry } from "../types";

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
  const { showWeightTotal, showLean, showFat, onClick } = useLineSelection();
  if (entries.length < 2) return null;
  const chartData = entries
    .map(({ dateTime, weightTotal, fatPercent }) => ({
      dateTime: dateTime.toMillis(),
      weightTotal,
      lean: weightTotal * ((100 - fatPercent) / 100),
      fat: weightTotal * (fatPercent / 100),
    }))
    .sort((a, b) => a.dateTime - b.dateTime);
  return (
    <section>
      <LineChart
        width={500}
        height={250}
        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
        data={chartData}
        onClick={onClick}
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
        {showLean && (
          <Line
            name="Lean weight"
            dataKey="lean"
            stroke="#00cc00"
            animationDuration={500}
          />
        )}
        {showFat && (
          <Line
            name="Fat weight"
            dataKey="fat"
            stroke="#0000cc"
            animationDuration={500}
          />
        )}
        <Legend />
        <Tooltip
          labelFormatter={(millis: number) =>
            DateTime.fromMillis(millis).toFormat("d LLL")
          }
        />
      </LineChart>
    </section>
  );
};