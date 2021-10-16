import * as React from "react";
import { render } from "react-dom";
import { DateTime } from "luxon";

type Kilograms = number;
type Percentage = number;

interface WeightEntry {
  dateTime: DateTime;
  weight: Kilograms;
  bodyFat: Percentage;
}

const useBodyWeightEntries = () => {
  const [weightEntries, setWeightEntries] = React.useState<WeightEntry[]>([]);

  const recordWeightEntry = (newEntry: WeightEntry) => {
    setWeightEntries((oldEntries) => [...oldEntries, newEntry]);
  };

  return { recordWeightEntry, weightEntries };
};

const DecimalInput = (
  props: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "inputMode" | "pattern" | "spellCheck" | "onChange"
  > & { onChange: (newValue: number) => void }
) => {
  const { onChange, ...others } = props;

  const onChangeValidation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    const numericValue = Number(newValue);

    if (!isNaN(numericValue)) onChange(numericValue);

    // TODO visual indication of invalid inputs

    /**
     * TODO
     * At present it is impossible to input a decimal number because validation
     * is happening after/during every change event i.e. every key press.
     * As such "2." is invalid and gets ignored. Recommend changing paradigm to
     * one in which the controlled input is text only, and validation just
     * annotates the input. Forcing to number should only happen at the point of
     * form submission.
     */
  };

  // https://design-system.service.gov.uk/components/text-input/
  return (
    <input
      type="text"
      spellCheck={false}
      onChange={onChangeValidation}
      {...others}
    ></input>
  );
};

const WeightEntryForm = ({
  recordWeightEntry,
}: {
  recordWeightEntry: (newWeightEntry: WeightEntry) => unknown;
}) => {
  const [weight, setWeight] = React.useState(0);
  const [bodyFat, setBodyFat] = React.useState(0);
  const onSubmit = () => {
    if (weight !== undefined && bodyFat !== undefined) {
      recordWeightEntry({ weight, bodyFat, dateTime: DateTime.now() });
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="weight">Weight:</label>
      <DecimalInput
        id="weight"
        name="weight"
        value={weight}
        onChange={setWeight}
      ></DecimalInput>
      <label htmlFor="bodyFat">Body fat:</label>
      <DecimalInput
        id="bodyFat"
        name="bodyFat"
        value={bodyFat}
        onChange={setBodyFat}
      ></DecimalInput>
      <input type="submit" value="submit" />
    </form>
  );
};

const TestInput = () => {
  const { recordWeightEntry, weightEntries } = useBodyWeightEntries();

  return (
    <>
      <WeightEntryForm recordWeightEntry={recordWeightEntry} />
      {weightEntries.map(({ dateTime, weight, bodyFat }) => (
        <div key={dateTime.toMillis()}>
          <span>{dateTime.toISO()}</span>
          <span>{weight}</span>
          <span>{bodyFat}</span>
        </div>
      ))}
    </>
  );
};

render(<TestInput />, document.getElementById("root"));
