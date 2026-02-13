import * as React from "react";

import type { WeightEntry } from "../types";

const embellishEntry = (entry: WeightEntry) => ({
  ...entry,
  fatPercent: entry.fatPercent ?? "-",
  fatTotal: entry.fatPercent
    ? (entry.weightTotal * (entry.fatPercent / 100)).toFixed(2)
    : "-",
  leanTotal: entry.fatPercent
    ? (
      entry.weightTotal -
      entry.weightTotal * (entry.fatPercent / 100)
    ).toFixed(2)
    : "-",
});

export const PastEntries = ({
  entries,
  deleteWeightEntry,
}: {
  entries: WeightEntry[];
  deleteWeightEntry: (dateTime: WeightEntry["dateTime"]) => unknown;
}) => {
  const anyFatRecords = entries.some((entry) => entry.fatPercent !== undefined);
  return (
    <>
      <h2>Past Entries</h2>
      <table className="entries-table">
        <thead>
          <tr>
            <th>Date time</th>
            <th>Weight (kg)</th>
            {anyFatRecords && <th>Body fat (%)</th>}
            {anyFatRecords && <th>Lean (kg)</th>}
            {anyFatRecords && <th>Fat (kg)</th>}
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map(embellishEntry).map((entry) => (
              <tr key={entry.dateTime.toMillis()}>
                <td>{entry.dateTime.toFormat("d LLL")}</td>
                <td>{entry.weightTotal}</td>
                {anyFatRecords && <td>{entry.fatPercent}</td>}
                {anyFatRecords && <td>{entry.leanTotal}</td>}
                {anyFatRecords && <td>{entry.fatTotal}</td>}
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this entry? This cannot be undone.")) {
                        deleteWeightEntry(entry.dateTime);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No data recorded yet!</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};
