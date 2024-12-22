import { useState } from "react";
import type { WeightEntry } from "../types";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const embellishEntry = (entry: WeightEntry) => ({
  ...entry,
  fatPercent: entry.fatPercent ?? "-",
  fatTotal: entry.fatPercent
    ? (entry.weightTotal * (entry.fatPercent / 100)).toFixed(2)
    : "-",
  leanTotal: entry.fatPercent
    ? (
        entry.weightTotal -
        entry.weightTotal * (entry.fatPercent / 100)
      ).toFixed(2)
    : "-",
});

export const PastEntries = ({
  entries,
  deleteWeightEntry,
}: {
  entries: WeightEntry[];
  deleteWeightEntry: (dateTime: WeightEntry["dateTime"]) => unknown;
}) => {
  const [entryToDelete, setEntryToDelete] = useState<
    WeightEntry["dateTime"] | undefined
  >(undefined);
  const anyFatRecords = entries.some((entry) => entry.fatPercent !== undefined);
  return (
    <Card sx={{ padding: "16px" }}>
      <Typography variant="h2">Past Entries</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date time</TableCell>
              <TableCell align="right">Weight (kg)</TableCell>
              {anyFatRecords && (
                <TableCell align="right">Body fat (%)</TableCell>
              )}
              {anyFatRecords && <TableCell align="right">Lean (kg)</TableCell>}
              {anyFatRecords && <TableCell align="right">Fat (kg)</TableCell>}
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length > 0 ? (
              entries.map(embellishEntry).map((entry) => (
                <TableRow key={entry.dateTime.toMillis()}>
                  <TableCell>{entry.dateTime.toFormat("d LLL")}</TableCell>
                  <TableCell align="right">{entry.weightTotal}</TableCell>
                  {anyFatRecords && (
                    <TableCell align="right">{entry.fatPercent}</TableCell>
                  )}
                  {anyFatRecords && (
                    <TableCell align="right">{entry.leanTotal}</TableCell>
                  )}
                  {anyFatRecords && (
                    <TableCell align="right">{entry.fatTotal}</TableCell>
                  )}
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      size="large"
                      onClick={() => setEntryToDelete(entry.dateTime)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>No data recorded yet!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!entryToDelete}>
        <DialogTitle>Delete entry?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete this entry? This cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="info"
            onClick={() => setEntryToDelete(undefined)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (entryToDelete) deleteWeightEntry(entryToDelete);
              setEntryToDelete(undefined);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
