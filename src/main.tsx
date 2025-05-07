import * as React from "react";
import { createRoot } from "react-dom/client";

import { WeightForm } from "./components/weightform";
import { WeightChart } from "./components/weightChart";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./components/pastEntries";
import { Card } from "./components/ui/card";

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
    <main className="flex flex-col w-full items-center justify-between p-2">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Shiny Measure
      </h1>
      <Card className="p-4 my-2 flex w-full container flex-col items-center justify-between">
        <WeightForm
          recordWeightEntry={(newEntry: WeightEntry) => {
            recordWeightEntry(newEntry);
            setEntries(getWeightEntries());
          }}
        />
      </Card>
      {entries.length > 0 && (
        <Card className="p-4 my-2 flex w-full container flex-col items-center justify-between">
          <WeightChart entries={entries} />
        </Card>
      )}
      <Card className="p-4 my-2 flex w-full container flex-col items-center justify-between">
        <PastEntries
          entries={entries}
          deleteWeightEntry={deleteWeightEntryAndRefresh}
        />
      </Card>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
