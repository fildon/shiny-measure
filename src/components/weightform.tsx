import * as React from "react";
import { DateTime } from "luxon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { WeightEntry } from "../types";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { H2 } from "./ui/heading";

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

const Foo = () => {};

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <H2>Add a New Entry</H2>
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="bodyFat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Fat (%)</FormLabel>
              <FormControl>
                <Input placeholder="optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Button type="submit">Record entry</Button>
      </form>
    </Form>
  );
};
