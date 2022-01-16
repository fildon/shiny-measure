import { DateTime } from "luxon";
import type { WeightEntry } from "./types";

type SerializedWeightEntry = {
  /**
   * ISO formatted string
   */
  dateTime: string;
  bodyFat?: number;
  weight: number;
};

const serializeEntry = (entry: WeightEntry): SerializedWeightEntry => ({
  bodyFat: entry.fatPercent,
  weight: entry.weightTotal,
  dateTime: entry.dateTime.toISO(),
});

const deserializeEntry = (entry: SerializedWeightEntry): WeightEntry => ({
  fatPercent: entry.bodyFat,
  weightTotal: entry.weight,
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

  const deleteWeightEntry = (
    dateTimeToDelete: WeightEntry["dateTime"]
  ): void => {
    const entries = getWeightEntries();

    setItem(WEIGHT_ENTRIES, "");

    entries
      .filter(
        ({ dateTime }) => dateTime.toMillis() !== dateTimeToDelete.toMillis()
      )
      .forEach(recordWeightEntry);
  };

  return {
    getWeightEntries,
    deleteWeightEntry,
    recordWeightEntry,
  };
};
