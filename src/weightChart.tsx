import * as React from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { DateTime } from "luxon";

import { WeightEntry } from "./types";

export const WeightChart = ({ entries }: { entries: WeightEntry[] }) => {
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
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dateTime"
          domain={["auto", "auto"]}
          tickFormatter={(millis: number) => {
            return DateTime.fromMillis(millis).toFormat("d LLL");
          }}
          type="number"
        />
        <YAxis domain={["auto", "auto"]} unit="kg" />
        <Line name="Total weight" dataKey="weightTotal" stroke="#cc0000" />
        <Line name="Lean weight" dataKey="lean" stroke="#00cc00" />
        <Line name="Fat weight" dataKey="fat" stroke="#0000cc" />
        <Legend />
      </LineChart>
    </section>
  );
};
