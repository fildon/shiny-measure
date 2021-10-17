import { DateTime } from "luxon";
import type { WeightEntry } from "./types";

type SerializedWeightEntry = {
  /**
   * ISO formatted string
   */
  dateTime: string;
  bodyFat: number;
  weight: number;
};

const serializeEntry = (entry: WeightEntry): SerializedWeightEntry => ({
  ...entry,
  dateTime: entry.dateTime.toISO(),
});

const deserializeEntry = (entry: SerializedWeightEntry): WeightEntry => ({
  ...entry,
  dateTime: DateTime.fromISO(entry.dateTime),
});

const WEIGHT_ENTRIES = "weightentries";

export const buildStorageModule = ({
  getItem,
  setItem,
}: Pick<Storage, "getItem" | "setItem">) => {
  const getWeightEntries = (): WeightEntry[] => {
    const storedString = getItem(WEIGHT_ENTRIES);
    if (!storedString) return [];

    const parsed = JSON.parse(storedString) as SerializedWeightEntry[];

    return parsed
      .map(deserializeEntry)
      .sort((a, b) => b.dateTime.toMillis() - a.dateTime.toMillis());
  };

  const recordWeightEntry = (newEntry: WeightEntry): void => {
    const currentEntries = getWeightEntries();

    const newEntries = [...currentEntries, newEntry].map(serializeEntry);
    setItem(WEIGHT_ENTRIES, JSON.stringify(newEntries));
  };

  return {
    getWeightEntries,
    recordWeightEntry,
  };
};
