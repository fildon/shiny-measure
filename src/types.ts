import type { DateTime } from "luxon";

type Kilograms = number;
type Percentage = number;

export interface WeightEntry {
  dateTime: DateTime;
  weight: Kilograms;
  bodyFat: Percentage;
}
