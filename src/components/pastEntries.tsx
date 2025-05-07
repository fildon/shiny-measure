import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { WeightEntry } from "../types";
import { Button } from "./ui/button";
import { H2 } from "./ui/heading";

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
  const anyFatRecords = entries.some((entry) => entry.fatPercent !== undefined);
  return (
    <>
      <H2>Past Entries</H2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date time</TableHead>
            <TableHead style={{ textAlign: "right" }}>Weight (kg)</TableHead>
            {anyFatRecords && (
              <TableHead style={{ textAlign: "right" }}>Body fat (%)</TableHead>
            )}
            {anyFatRecords && (
              <TableHead style={{ textAlign: "right" }}>Lean (kg)</TableHead>
            )}
            {anyFatRecords && (
              <TableHead style={{ textAlign: "right" }}>Fat (kg)</TableHead>
            )}
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length > 0 ? (
            entries.map(embellishEntry).map((entry) => (
              <TableRow key={entry.dateTime.toMillis()}>
                <TableCell>{entry.dateTime.toFormat("d LLL")}</TableCell>
                <TableCell style={{ textAlign: "right" }}>
                  {entry.weightTotal}
                </TableCell>
                {anyFatRecords && (
                  <TableCell style={{ textAlign: "right" }}>
                    {entry.fatPercent}
                  </TableCell>
                )}
                {anyFatRecords && (
                  <TableCell style={{ textAlign: "right" }}>
                    {entry.leanTotal}
                  </TableCell>
                )}
                {anyFatRecords && (
                  <TableCell style={{ textAlign: "right" }}>
                    {entry.fatTotal}
                  </TableCell>
                )}
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">X</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                      </DialogHeader>
                      <p>
                        Are you sure you want to delete this entry? This cannot
                        be undone.
                      </p>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={() => {
                            deleteWeightEntry(entry.dateTime);
                          }}
                        >
                          Delete Entry
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
    </>
  );
};
