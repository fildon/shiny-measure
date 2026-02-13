import * as React from "react";
import { DateTime } from "luxon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { WeightEntry } from "../types";

import { z } from "zod";

const formSchema = z.object({
  weight: z
    .string()
    .min(1, "Value required")
    .refine(
      (value) => {
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue > 0;
      },
      { message: "Must be greater than zero" }
    ),
  bodyFat: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100;
      },
      { message: "Must be a number between 0 and 100" }
    ),
});

const Foo = () => { };

export const WeightForm = ({
  recordWeightEntry,
}: {
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: "",
      bodyFat: "",
    },
  });

  const onSubmit = ({ weight, bodyFat }: z.infer<typeof formSchema>) => {
    recordWeightEntry({
      dateTime: DateTime.now(),
      weightTotal: Number(weight),
      fatPercent: bodyFat ? Number(bodyFat) : undefined,
    });
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="weight-form">
      <h2>Add a New Entry</h2>
      <div className="weight-form-group">
        <label htmlFor="weight">Weight (kg)</label>
        <input
          id="weight"
          type="text"
          {...form.register('weight')}
        />
        {form.formState.errors.weight && (
          <span className="weight-form-error">{form.formState.errors.weight.message as string}</span>
        )}
      </div>
      <div className="weight-form-group">
        <label htmlFor="bodyFat">Body Fat (%)</label>
        <input
          id="bodyFat"
          type="text"
          placeholder="optional"
          {...form.register('bodyFat')}
        />
        {form.formState.errors.bodyFat && (
          <span className="weight-form-error">{form.formState.errors.bodyFat.message as string}</span>
        )}
      </div>
      <button type="submit">Record entry</button>
    </form>
  );
};
