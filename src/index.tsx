import * as React from "react";
import { AxisOptions, Chart } from "react-charts";
import { render } from "react-dom";

type DailyStars = {
  date: Date;
  stars: number;
};

const generateData = (): DailyStars[] => {
  return [...new Array(10)].map((_v, i) => ({
    date: new Date(10000 * i),
    stars: Math.floor(100 * Math.random()),
  }));
};

const TestGraph = () => {
  const data = [
    { label: "React Charts", data: generateData() },
    { label: "React Query", data: generateData() },
  ];

  console.log(data);

  const primaryAxis = React.useMemo(
    (): AxisOptions<DailyStars> => ({ getValue: (datum) => datum.date }),
    []
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<DailyStars>[] => [{ getValue: (datum) => datum.stars }],
    []
  );

  return (
    <div style={{ height: 300, width: 600 }}>
      <Chart<DailyStars> options={{ data, primaryAxis, secondaryAxes }} />
    </div>
  );
};

render(<TestGraph />, document.getElementById("root"));
