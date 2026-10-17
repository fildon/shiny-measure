import type { DateTime } from "luxon";

import type { WeightEntry } from "./types";

export const TREND_WINDOW_DAYS = 7;

/**
 * Mean weight of the entries in the trend window ending at `at`.
 * Falls back to the latest earlier entry if the window is empty.
 *
 * @param entries sorted oldest first
 */
export const trendAt = (
  entries: WeightEntry[],
  at: DateTime
): number | undefined => {
  const windowStart = at.minus({ days: TREND_WINDOW_DAYS });
  const inWindow = entries.filter(
    ({ dateTime }) => dateTime <= at && dateTime > windowStart
  );
  if (inWindow.length > 0) {
    return (
      inWindow.reduce((sum, entry) => sum + entry.weightTotal, 0) /
      inWindow.length
    );
  }
  const earlier = entries.filter(({ dateTime }) => dateTime <= at);
  return earlier[earlier.length - 1]?.weightTotal;
};

export const leanMass = ({ weightTotal, fatPercent }: WeightEntry) =>
  fatPercent === undefined ? undefined : weightTotal * (1 - fatPercent / 100);

export const fatMass = ({ weightTotal, fatPercent }: WeightEntry) =>
  fatPercent === undefined ? undefined : weightTotal * (fatPercent / 100);
