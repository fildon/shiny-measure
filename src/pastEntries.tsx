import * as React from "react";

import type { WeightEntry } from "./types";

const embellishEntry = (entry: WeightEntry) => ({
  ...entry,
  fatTotal: (entry.weightTotal * (entry.fatPercent / 100)).toFixed(2),
  leanTotal: (
    entry.weightTotal -
    entry.weightTotal * (entry.fatPercent / 100)
  ).toFixed(2),
});

export const PastEntries = ({
  entries,
  deleteWeightEntry,
}: {
  entries: WeightEntry[];
  deleteWeightEntry: (dateTime: WeightEntry["dateTime"]) => unknown;
}) => {
  return (
    <section>
      <h2>Past Entries</h2>
      <table>
        <thead>
          <tr>
            <th>Date time</th>
            <th>Weight (kg)</th>
            <th>Body fat (%)</th>
            <th>Lean (kg)</th>
            <th>Fat (kg)</th>
            <th>Delete entry</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map(embellishEntry).map((entry) => (
              <tr key={entry.dateTime.toMillis()}>
                <td>{entry.dateTime.toFormat("d LLL")}</td>
                <td>{entry.weightTotal}</td>
                <td>{entry.fatPercent}</td>
                <td>{entry.leanTotal}</td>
                <td>{entry.fatTotal}</td>
                <td>
                  <button onClick={() => deleteWeightEntry(entry.dateTime)}>
                    X
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No data recorded yet!</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};