import * as React from "react";
import { createRoot } from "react-dom/client";
import { DateTime } from "luxon";

import { WeightForm } from "./components/weightform";
import { WeightChart } from "./components/weightChart";
import { Summary } from "./components/summary";
import { Toast, type ToastMessage } from "./components/toast";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./components/pastEntries";
import { formatDay } from "./format";

const App = () => {
  const { getWeightEntries, recordWeightEntry, deleteWeightEntry } =
    React.useMemo(
      () =>
        buildStorageModule({
          getItem: (key) => window.localStorage.getItem(key),
          setItem: (key, value) => window.localStorage.setItem(key, value),
        }),
      []
    );

  // Storage returns newest first; the UI works oldest first
  const readEntries = () => [...getWeightEntries()].reverse();
  const [entries, setEntries] = React.useState<WeightEntry[]>(readEntries);
  const [highlighted, setHighlighted] = React.useState<number>();
  const [toast, setToast] = React.useState<ToastMessage>();
  const dismissToast = React.useCallback(() => setToast(undefined), []);

  const addEntry = (entry: WeightEntry) => {
    recordWeightEntry(entry);
    setEntries(readEntries());
    setHighlighted(entry.dateTime.toMillis());
  };

  const recordAndConfirm = (entry: WeightEntry) => {
    addEntry(entry);
    setToast({ id: Date.now(), text: `Saved ${entry.weightTotal.toFixed(1)} kg` });
  };

  const deleteWithUndo = (entry: WeightEntry) => {
    deleteWeightEntry(entry.dateTime);
    setEntries(readEntries());
    setToast({
      id: Date.now(),
      text: `Deleted ${formatDay(entry.dateTime)}`,
      undo: () => {
        addEntry(entry);
        setToast(undefined);
      },
    });
  };

  return (
    <main className="app">
      <header className="topbar">
        <h1>Shiny Measure</h1>
        <span>{DateTime.now().toFormat("ccc d LLL")}</span>
      </header>
      <Summary entries={entries} />
      <WeightForm
        latestEntry={entries[entries.length - 1]}
        recordWeightEntry={recordAndConfirm}
      />
      <section className="panel" aria-labelledby="trend-heading">
        <div className="panel-head">
          <h2 id="trend-heading">Trend</h2>
          <span className="meta">kg · 7-day average</span>
        </div>
        {/* A trend needs at least 2 data points */}
        {entries.length > 1 ? (
          <WeightChart entries={entries} />
        ) : (
          <p className="chart-empty">
            {entries.length === 1
              ? "One entry so far. Add another to see your trend."
              : "Your trend appears here once you have two entries."}
          </p>
        )}
      </section>
      <PastEntries
        entries={entries}
        highlighted={highlighted}
        deleteWeightEntry={deleteWithUndo}
      />
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
