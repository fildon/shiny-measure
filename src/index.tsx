import * as React from "react";
import { render } from "react-dom";

import { WeightForm } from "./weightform";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./pastEntries";

const App = () => {
  const { getWeightEntries, recordWeightEntry } = React.useMemo(
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

  return (
    <>
      <h1>Shiny Measure</h1>
      <WeightForm
        recordWeightEntry={(newEntry: WeightEntry) => {
          recordWeightEntry(newEntry);
          setEntries(getWeightEntries());
        }}
      />
      <PastEntries entries={entries} />
    </>
  );
};

render(<App />, document.getElementById("root"));
