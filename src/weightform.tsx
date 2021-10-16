import * as React from "react";
import { DateTime } from "luxon";

type ValidInput = {
  state: "valid";
  value: string;
  parsedValue: number;
};

type InvalidInput = {
  state: "invalid";
  value: string;
  errorMessage?: string;
};

type ControlledInput = ValidInput | InvalidInput;

type FormState = {
  [entryId: string]: ControlledInput;
};

const FormContext = React.createContext<
  { state: FormState; dispatch: React.Dispatch<FormAction> } | undefined
>(undefined);

type FormAction =
  | { type: "entryEmpty"; entryId: string }
  | {
      type: "entryValidChange";
      entryId: string;
      value: string;
      parsedValue: number;
    }
  | {
      type: "entryInvalidChange";
      entryId: string;
      value: string;
      errorMessage: string;
    };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "entryValidChange": {
      return {
        ...state,
        [action.entryId]: {
          state: "valid",
          value: action.value,
          parsedValue: action.parsedValue,
        },
      };
    }
    case "entryInvalidChange": {
      return {
        ...state,
        [action.entryId]: {
          state: "invalid",
          value: action.value,
          errorMessage: action.errorMessage,
        },
      };
    }
    case "entryEmpty": {
      return {
        ...state,
        [action.entryId]: {
          state: "invalid",
          value: "",
        },
      };
    }
  }
};

const useFormState = () => {
  const context = React.useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  return context;
};

const useDecimalValidation = (entryId: string) => {
  const { state, dispatch } = useFormState();

  React.useEffect(() => {
    dispatch({ type: "entryEmpty", entryId });
  }, []);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(event.target.value);
    if (isNaN(numericValue)) {
      dispatch({
        type: "entryInvalidChange",
        entryId,
        value: event.target.value,
        errorMessage: "Value must be numeric with at most two decimal places",
      });
    } else {
      dispatch({
        type: "entryValidChange",
        entryId,
        value: event.target.value,
        parsedValue: numericValue,
      });
    }
  };

  return { value: state[entryId]?.value ?? "", onChange };
};

const DecimalInput = (
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "inputMode" | "pattern" | "spellCheck" | "onChange" | "value"
  > & { entryId: string }
) => {
  const { value, onChange } = useDecimalValidation(props.entryId);

  return (
    <input
      type="text"
      spellCheck={false}
      value={value}
      onChange={onChange}
      {...props}
    ></input>
  );
};

const isFormValid = (
  state: FormState
): state is { [entryId: string]: ValidInput } => {
  return Object.values(state).every((value) => value.state === "valid");
};

type Kilograms = number;
type Percentage = number;

export interface WeightEntry {
  dateTime: DateTime;
  weight: Kilograms;
  bodyFat: Percentage;
}

export const WeightForm = ({
  recordWeightEntry,
}: {
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const [state, dispatch] = React.useReducer(formReducer, {});

  // TODO derive input elements from input
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormValid(state)) {
      recordWeightEntry({
        dateTime: DateTime.now(),
        weight: state["weight"].parsedValue,
        bodyFat: state["bodyFat"].parsedValue,
      });
    }
  };

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      <form onSubmit={onSubmit}>
        <DecimalInput entryId="weight" />
        <DecimalInput entryId="bodyFat" />
        <input type="submit"></input>
      </form>
    </FormContext.Provider>
  );
};
