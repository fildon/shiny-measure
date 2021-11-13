import "@testing-library/jest-dom";
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { WeightForm } from "./weightform";

describe("<WeightForm />", () => {
  it("displays submission input", () => {
    const mockRecordWeightEntry = jest.fn();
    render(<WeightForm recordWeightEntry={mockRecordWeightEntry} />);

    expect(screen.getByText("Record entry")).toBeInTheDocument();
  });
});
