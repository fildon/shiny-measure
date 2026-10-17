import { DateTime } from "luxon";

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

/** e.g. "+0.2", "−1.6" (true minus sign), "0.0" */
export const formatChange = (change: number) => {
  const rounded = roundToTenth(change);
  if (rounded === 0) return "0.0";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(1)}`;
};

/** CSS class for colouring a weight change */
export const changeClass = (change: number) => {
  const rounded = roundToTenth(change);
  if (rounded < 0) return "down";
  if (rounded > 0) return "up";
  return "flat";
};

const withYearIfNeeded = (dateTime: DateTime, format: string) =>
  dateTime.year === DateTime.now().year ? format : `${format} yyyy`;

/** e.g. "Thu 16 Oct", with the year added when it isn't this year */
export const formatDay = (dateTime: DateTime) =>
  dateTime.toFormat(withYearIfNeeded(dateTime, "ccc d LLL"));

/** e.g. "16 Oct", with the year added when it isn't this year */
export const formatShortDate = (dateTime: DateTime) =>
  dateTime.toFormat(withYearIfNeeded(dateTime, "d LLL"));
