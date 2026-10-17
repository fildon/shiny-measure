import * as React from "react";
import { DateTime } from "luxon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { WeightEntry } from "../types";
import { formatDay } from "../format";

/** Accepts "78.4" or "78,4" */
const parseDecimal = (value: string) => Number(value.trim().replace(",", "."));

const formSchema = z.object({
  weight: z
    .string()
    .min(1, "Enter your weight in kg.")
    .refine(
      (value) => {
        const numericValue = parseDecimal(value);
        return !isNaN(numericValue) && numericValue > 0;
      },
      { message: "Use a number like 78.4." }
    ),
  bodyFat: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value.trim() === "") return true;
        const numericValue = parseDecimal(value);
        return !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100;
      },
      { message: "Use a percentage from 0 to 100." }
    ),
});

export const WeightForm = ({
  latestEntry,
  recordWeightEntry,
}: {
  latestEntry: WeightEntry | undefined;
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: "",
      bodyFat: "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = ({ weight, bodyFat }: z.infer<typeof formSchema>) => {
    recordWeightEntry({
      dateTime: DateTime.now(),
      weightTotal: parseDecimal(weight),
      fatPercent: bodyFat?.trim() ? parseDecimal(bodyFat) : undefined,
    });
    form.reset();
  };

  return (
    <section className="panel" aria-labelledby="entry-heading">
      <div className="panel-head">
        <h2 id="entry-heading">New entry</h2>
        {latestEntry && (
          <span className="meta">Last: {formatDay(latestEntry.dateTime)}</span>
        )}
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="entry-form"
        noValidate
      >
        <div className={`field${errors.weight ? " invalid" : ""}`}>
          <label htmlFor="weight">Weight</label>
          <div className="input-wrap">
            <input
              id="weight"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={latestEntry?.weightTotal.toFixed(1) ?? "80.0"}
              aria-invalid={!!errors.weight}
              {...form.register("weight")}
            />
            <span className="suffix">KG</span>
          </div>
          {errors.weight && (
            <span className="field-error">{errors.weight.message}</span>
          )}
        </div>
        <div className={`field${errors.bodyFat ? " invalid" : ""}`}>
          <label htmlFor="bodyFat">Body fat · optional</label>
          <div className="input-wrap">
            <input
              id="bodyFat"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={latestEntry?.fatPercent?.toFixed(1) ?? "22.0"}
              aria-invalid={!!errors.bodyFat}
              {...form.register("bodyFat")}
            />
            <span className="suffix">%</span>
          </div>
          {errors.bodyFat && (
            <span className="field-error">{errors.bodyFat.message}</span>
          )}
        </div>
        <button type="submit" className="primary-button">
          Record
        </button>
      </form>
    </section>
  );
};
