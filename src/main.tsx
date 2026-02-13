import * as React from "react";
import { createRoot } from "react-dom/client";

import { WeightForm } from "./components/weightform";
import { WeightChart } from "./components/weightChart";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./components/pastEntries";


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

  const [entries, setEntries] = React.useState<WeightEntry[]>(
    getWeightEntries()
  );

  const deleteWeightEntryAndRefresh = (dateTime: WeightEntry["dateTime"]) => {
    deleteWeightEntry(dateTime);
    setEntries(getWeightEntries());
  };

  return (
    <main>
      <h1>
        Shiny Measure
      </h1>
      <section className="card-section">
        <WeightForm
          recordWeightEntry={(newEntry: WeightEntry) => {
            recordWeightEntry(newEntry);
            setEntries(getWeightEntries());
          }}
        />
      </section>
      {/* Only display the chart if there are at least 2 data points */}
      {entries.length > 1 && (
        <section className="card-section">
          <WeightChart entries={entries} />
        </section>
      )}
      <section className="card-section">
        <PastEntries
          entries={entries}
          deleteWeightEntry={deleteWeightEntryAndRefresh}
        />
      </section>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
