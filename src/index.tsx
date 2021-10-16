import * as React from "react";
import { render } from "react-dom";

import { WeightForm } from "./weightform";
import type { WeightEntry } from "./weightform";

const App = () => {
  const [entries, setEntries] = React.useState<WeightEntry[]>([]);

  const recordWeightEntry = (newEntry: WeightEntry) => {
    setEntries([...entries, newEntry]);
  };

  return (
    <>
      <WeightForm recordWeightEntry={recordWeightEntry} />
      {entries.map((entry) => (
        <div key={entry.dateTime.toMillis()}>
          <span>{entry.bodyFat}</span>
          <span>{entry.weight}</span>
          <span>{entry.dateTime.toLocaleString()}</span>
        </div>
      ))}
    </>
  );
};

render(<App />, document.getElementById("root"));
