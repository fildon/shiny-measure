import * as React from "react";
import { render } from "react-dom";

import { WeightForm } from "./weightform";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./pastEntries";

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
    <>
      <h1>Shiny Measure</h1>
      <WeightForm
        recordWeightEntry={(newEntry: WeightEntry) => {
          recordWeightEntry(newEntry);
          setEntries(getWeightEntries());
        }}
      />
      <PastEntries
        entries={entries}
        deleteWeightEntry={deleteWeightEntryAndRefresh}
      />
    </>
  );
};

render(<App />, document.getElementById("root"));
