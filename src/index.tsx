import * as React from "react";
import { render } from "react-dom";

import { ModalProvider } from "./components/modal";
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
    <ModalProvider>
      <h1>Shiny Measure</h1>
      <WeightForm
        recordWeightEntry={(newEntry: WeightEntry) => {
          recordWeightEntry(newEntry);
          setEntries(getWeightEntries());
        }}
      />
      <WeightChart entries={entries} />
      <PastEntries
        entries={entries}
        deleteWeightEntry={deleteWeightEntryAndRefresh}
      />
    </ModalProvider>
  );
};

render(<App />, document.getElementById("root"));
