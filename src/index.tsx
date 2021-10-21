import * as React from "react";
import { render } from "react-dom";

import { WeightForm } from "./weightform";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";

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
      <section>
        <h2>Past Entries</h2>
        <table>
          <thead>
            <tr>
              <th>Date time</th>
              <th>Weight (kg)</th>
              <th>Body fat (%)</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <tr key={entry.dateTime.toMillis()}>
                  <td>{entry.dateTime.toFormat("d LLL")}</td>
                  <td>{entry.weight}</td>
                  <td>{entry.bodyFat}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No data recorded yet!</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

render(<App />, document.getElementById("root"));
