import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { WeightForm } from "./components/weightform";
import { WeightChart } from "./components/weightChart";
import type { WeightEntry } from "./types";
import { buildStorageModule } from "./storage";
import { PastEntries } from "./components/pastEntries";
import { Container, CssBaseline, Stack, Typography } from "@mui/material";

const App = () => {
  const { getWeightEntries, recordWeightEntry, deleteWeightEntry } = useMemo(
    () =>
      buildStorageModule({
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
      }),
    []
  );

  const [entries, setEntries] = useState<WeightEntry[]>(getWeightEntries());

  const deleteWeightEntryAndRefresh = (dateTime: WeightEntry["dateTime"]) => {
    deleteWeightEntry(dateTime);
    setEntries(getWeightEntries());
  };

  return (
    <>
      <CssBaseline />
      <Container>
        <Stack spacing={2}>
          <Typography variant="h1">Shiny Measure</Typography>
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
        </Stack>
      </Container>
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
