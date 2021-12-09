import * as React from "react";
import { DateTime } from "luxon";

import type { WeightEntry } from "../types";

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
    setState({
      ...state,
      value,
    });
  };
  const onBlur = () => {
    const validationResult = validator(state.value);

    if (typeof validationResult === "number") {
      setState({
        ...state,
        state: "valid",
        parsedValue: validationResult,
      });
    } else {
      setState({
        ...state,
        state: "invalid",
        errorMessages: validationResult,
      });
    }
  };
  const clear = () =>
    setState({ state: "invalid", value: "", errorMessages: [] });

  return {
    state,
    onChange,
    onBlur,
    clear,
  };
};

export const WeightForm = ({
  recordWeightEntry,
}: {
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const {
    state: weightState,
    onChange: onChangeWeight,
    onBlur: onBlurWeight,
    clear: clearWeightInput,
  } = useControlledInput((value) => {
    if (value.length === 0) return ["Value required"];
    const numericValue = Number(value);
    if (isNaN(numericValue)) return ["Must be a number"];
    if (numericValue <= 0) return ["Must be greater than zero"];
    return numericValue;
  });
  const {
    state: bodyFatState,
    onChange: onChangeBodyFat,
    onBlur: onBlurBodyFat,
    clear: clearBodyFatInput,
  } = useControlledInput((value) => {
    if (value.length === 0) return ["Value required"];
    const numericValue = Number(value);
    if (isNaN(numericValue)) return ["Must be a number"];
    if (numericValue <= 0) return ["Must be greater than zero"];
    if (numericValue > 100) return ["Must be less than 100"];
    return numericValue;
  });

  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (weightState.state === "valid" && bodyFatState.state === "valid") {
      recordWeightEntry({
        dateTime: DateTime.now(),
        weightTotal: weightState.parsedValue,
        fatPercent: bodyFatState.parsedValue,
      });
      clearBodyFatInput();
      clearWeightInput();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Add a New Entry</h2>
      <fieldset>
        <label htmlFor="weight">Weight (kg)</label>
        <input
          id="weight"
          type="text"
          spellCheck={false}
          value={weightState.value}
          onChange={onChangeWeight}
          onBlur={onBlurWeight}
          autoComplete="off"
          enterKeyHint="next"
          aria-invalid={weightState.state === "invalid"}
          aria-describedby={
            weightState.state === "invalid" ? "weight-errors" : undefined
          }
        ></input>
        <ul id="weight-errors" aria-live="assertive" aria-atomic="true">
          {weightState.state === "invalid" &&
            weightState.errorMessages.length > 0 &&
            weightState.errorMessages.map((errorMessage) => (
              <li key={errorMessage}>{errorMessage}</li>
            ))}
        </ul>
      </fieldset>
      <fieldset>
        <label htmlFor="bodyFat">Body Fat (%)</label>
        <input
          id="bodyFat"
          type="text"
          spellCheck={false}
          value={bodyFatState.value}
          onChange={onChangeBodyFat}
          onBlur={onBlurBodyFat}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={bodyFatState.state === "invalid"}
          aria-describedby={
            bodyFatState.state === "invalid" ? "bodyfat-errors" : undefined
          }
        ></input>
        <ul id="bodyfat-errors" aria-live="assertive" aria-atomic="true">
          {bodyFatState.state === "invalid" &&
            bodyFatState.errorMessages.length > 0 &&
            bodyFatState.errorMessages.map((errorMessage) => (
              <li key={errorMessage}>{errorMessage}</li>
            ))}
        </ul>
      </fieldset>
      <input type="submit" value="Record entry" />
    </form>
  );
};
