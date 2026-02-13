import * as React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DateTime } from "luxon";
import { WeightEntry } from "../types";

const lineSelections = [
  [true, true, true],
  [true, false, false],
  [false, true, false],
  [false, false, true],
] as const;

function useLineSelection() {
  const [lineSelectionIndex, setLineSelectionIndex] = React.useState(0);
  const [showWeightTotal, showLean, showFat] = lineSelections[lineSelectionIndex];
  return {
    showWeightTotal,
    showLean,
    showFat,
    onClick: () => setLineSelectionIndex((i) => (i + 1) % lineSelections.length),
  };
}

export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const anyFatEntries = entries.some((entry) => entry.fatPercent !== undefined);
  const { showWeightTotal, showLean, showFat, onClick } = useLineSelection();
  if (entries.length < 2) return null;

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
  const firstDate = sortedEntries[0].dateTime;
  const lastDate = sortedEntries[sortedEntries.length - 1].dateTime;
  const monthsSpan = lastDate.diff(firstDate, "months").months;

  // Time range options
  const rangeOptions = [
    { label: "All", months: null },
    { label: "Last 12 months", months: 12 },
    { label: "Last 6 months", months: 6 },
    { label: "Last 3 months", months: 3 },
  ];
  // Only show buttons for ranges that make sense
  const visibleOptions = rangeOptions.filter((opt) => {
    if (opt.months === null) return true;
    return monthsSpan >= opt.months - 0.5;
  });

  const [selectedRange, setSelectedRange] = React.useState<string>("All");

  // Filter entries based on selected range
  let filteredEntries = entries;
  if (selectedRange !== "All") {
    const months = visibleOptions.find((o) => o.label === selectedRange)?.months;
    if (months) {
      const cutoff = lastDate.minus({ months });
      filteredEntries = entries.filter((e) => e.dateTime >= cutoff);
    }
  }

  const chartData = filteredEntries
    .map(({ dateTime, weightTotal, fatPercent }) => ({
      dateTime: dateTime.toMillis(),
      weightTotal,
      lean: fatPercent ? weightTotal * ((100 - fatPercent) / 100) : undefined,
      fat: fatPercent ? weightTotal * (fatPercent / 100) : undefined,
    }))
    .sort((a, b) => a.dateTime - b.dateTime);

  return (
    <div className="chart-container">
      {visibleOptions.length > 1 && (
        <div className="weightchart-button-group">
          {visibleOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSelectedRange(opt.label)}
              style={{
                fontWeight: selectedRange === opt.label ? "bold" : undefined,
                background: selectedRange === opt.label ? "#eee" : undefined,
                borderRadius: 4,
                border: "1px solid #ccc",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
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
      </ResponsiveContainer>
    </div>
  );
}
