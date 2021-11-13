import * as React from "react";

import { useModal } from "./modal";

import type { WeightEntry } from "../types";

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
  const [entryToDelete, setEntryToDelete] = React.useState<
    WeightEntry["dateTime"] | undefined
  >(undefined);
  const { Modal } = useModal();
  return (
    <section>
      <h2>Past Entries</h2>
      <table>
        <thead>
          <tr>
            <th>Date time</th>
            <th style={{ textAlign: "right" }}>Weight (kg)</th>
            <th style={{ textAlign: "right" }}>Body fat (%)</th>
            <th style={{ textAlign: "right" }}>Lean (kg)</th>
            <th style={{ textAlign: "right" }}>Fat (kg)</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map(embellishEntry).map((entry) => (
              <tr key={entry.dateTime.toMillis()}>
                <td>{entry.dateTime.toFormat("d LLL")}</td>
                <td style={{ textAlign: "right" }}>{entry.weightTotal}</td>
                <td style={{ textAlign: "right" }}>{entry.fatPercent}</td>
                <td style={{ textAlign: "right" }}>{entry.leanTotal}</td>
                <td style={{ textAlign: "right" }}>{entry.fatTotal}</td>
                <td>
                  <button onClick={() => setEntryToDelete(entry.dateTime)}>
                    X
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
      <Modal isOpen={!!entryToDelete}>
        <p style={{ margin: "15px" }}>
          Are you sure you want to delete this entry? This cannot be undone.
        </p>
        <div style={{ textAlign: "right", padding: "0 20px 20px" }}>
          <button
            style={{ backgroundColor: "lightgrey" }}
            onClick={() => setEntryToDelete(undefined)}
          >
            Cancel
          </button>
          <button
            style={{
              marginLeft: "5px",
              backgroundColor: "palevioletred",
              fontWeight: "bold",
            }}
            onClick={() => {
              if (entryToDelete) deleteWeightEntry(entryToDelete);
              setEntryToDelete(undefined);
            }}
          >
            Delete entry
          </button>
        </div>
      </Modal>
    </section>
  );
};
