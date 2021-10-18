import * as React from "react";
import { DateTime } from "luxon";

import type { WeightEntry } from "./types";

type ValidInput = {
  state: "valid";
  value: string;
  parsedValue: number;
};

type InvalidInput = {
  state: "invalid";
  value: string;
  errorMessages: string[];
};

type ControlledInput = ValidInput | InvalidInput;

type Validator = (unparsedNumber: string) => number | string[];

const useControlledInput = (validator: Validator) => {
  const [state, setState] = React.useState<ControlledInput>({
    state: "invalid",
    value: "",
    errorMessages: [],
  });
  const onChange = ({ target: { value } }: { target: { value: string } }) => {
    const validationResult = validator(value);

    if (typeof validationResult === "number") {
      setState({
        state: "valid",
        value,
        parsedValue: validationResult,
      });
    } else {
      setState({
        state: "invalid",
        value,
        errorMessages: validationResult,
      });
    }
  };

  return {
    state,
    onChange,
  };
};

export const WeightForm = ({
  recordWeightEntry,
}: {
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const { state: weightState, onChange: onChangeWeight } = useControlledInput(
    (value) => {
      if (value.length === 0) return ["Value required"];
      const numericValue = Number(value);
      if (isNaN(numericValue)) return ["Must be a number"];
      if (numericValue <= 0) return ["Must be greater than zero"];
      return numericValue;
    }
  );
  const { state: bodyFatState, onChange: onChangeBodyFat } = useControlledInput(
    (value) => {
      if (value.length === 0) return ["Value required"];
      const numericValue = Number(value);
      if (isNaN(numericValue)) return ["Must be a number"];
      if (numericValue <= 0) return ["Must be greater than zero"];
      if (numericValue > 100) return ["Must be less than 100"];
      return numericValue;
    }
  );

  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (weightState.state === "valid" && bodyFatState.state === "valid") {
      recordWeightEntry({
        dateTime: DateTime.now(),
        weight: weightState.parsedValue,
        bodyFat: bodyFatState.parsedValue,
      });
    }
  };

  // TODO inputs should have standalone labels
  return (
    <form onSubmit={onSubmit}>
      {weightState.state === "invalid" && (
        <span>{weightState.errorMessages}</span>
      )}
      <label htmlFor="weight">Weight (kg)</label>
      <input
        id="weight"
        type="text"
        spellCheck={false}
        value={weightState.value}
        onChange={onChangeWeight}
        enterKeyHint="next"
      ></input>
      {bodyFatState.state === "invalid" && (
        <span>{bodyFatState.errorMessages}</span>
      )}
      <label htmlFor="bodyFat">Body Fat (%)</label>
      <input
        id="bodyFat"
        type="text"
        spellCheck={false}
        value={bodyFatState.value}
        onChange={onChangeBodyFat}
        enterKeyHint="done"
      ></input>
      <input type="submit"></input>
    </form>
  );
};
