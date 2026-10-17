import * as React from "react";
import { DateTime } from "luxon";

import type { WeightEntry } from "../types";
import { fatMass, leanMass, trendAt } from "../trend";
import { formatDay, formatShortDate } from "../format";

const rangeOptions = [
  { key: "all", label: "All", months: undefined },
  { key: "12", label: "1Y", months: 12 },
  { key: "6", label: "6M", months: 6 },
  { key: "3", label: "3M", months: 3 },
  { key: "1", label: "1M", months: 1 },
] as const;
type RangeKey = (typeof rangeOptions)[number]["key"];

type SeriesKey = "weight" | "lean" | "fat";
type SeriesSelection = Record<SeriesKey, boolean>;
const seriesOptions: { key: SeriesKey; label: string; color: string }[] = [
  { key: "weight", label: "Weight", color: "var(--trend)" },
  { key: "lean", label: "Lean", color: "var(--lean)" },
  { key: "fat", label: "Fat", color: "var(--fat)" },
];
const weightOnly: SeriesSelection = { weight: true, lean: false, fat: false };

interface Point {
  entry: WeightEntry;
  millis: number;
  weight: number;
  trend: number;
  lean?: number;
  fat?: number;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * Expects at least two entries, sorted oldest first.
 */
export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const [range, setRange] = React.useState<RangeKey>("3");
  const [series, setSeries] = React.useState<SeriesSelection>(weightOnly);
  const [hoverIndex, setHoverIndex] = React.useState<number>();
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();

  const firstDate = entries[0].dateTime;
  const lastDate = entries[entries.length - 1].dateTime;
  const monthsSpan = lastDate.diff(firstDate, "months").months;
  // Only offer ranges that the data actually covers
  const visibleRanges = rangeOptions.filter(
    (option) => option.months === undefined || monthsSpan >= option.months - 0.5
  );
  const activeRange =
    visibleRanges.find((option) => option.key === range) ?? rangeOptions[0];

  const anyFatEntries = entries.some((entry) => entry.fatPercent !== undefined);
  const shown = anyFatEntries ? series : weightOnly;

  const cutoff = activeRange.months
    ? lastDate.minus({ months: activeRange.months })
    : undefined;
  let inRange = cutoff
    ? entries.filter((entry) => entry.dateTime >= cutoff)
    : entries;
  if (inRange.length < 2) inRange = entries.slice(-2);

  const points: Point[] = inRange.map((entry) => ({
    entry,
    millis: entry.dateTime.toMillis(),
    weight: entry.weightTotal,
    trend: trendAt(entries, entry.dateTime) ?? entry.weightTotal,
    lean: leanMass(entry),
    fat: fatMass(entry),
  }));

  const toggleSeries = (key: SeriesKey) =>
    setSeries((current) => {
      const next = { ...current, [key]: !current[key] };
      // Always keep at least one line visible
      return Object.values(next).some(Boolean) ? next : current;
    });

  const geometry = width > 0 ? buildGeometry(points, shown, width) : undefined;

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!geometry) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    let nearest = 0;
    points.forEach((point, index) => {
      if (
        Math.abs(geometry.x(point.millis) - pointerX) <
        Math.abs(geometry.x(points[nearest].millis) - pointerX)
      ) {
        nearest = index;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex !== undefined ? points[hoverIndex] : undefined;

  return (
    <>
      <div className="chart-controls">
        <div className="toggle-group" role="group" aria-label="Lines shown">
          {seriesOptions.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              className="series-toggle"
              style={{ "--series-color": color } as React.CSSProperties}
              aria-pressed={shown[key]}
              disabled={key !== "weight" && !anyFatEntries}
              onClick={() => toggleSeries(key)}
            >
              {label}
            </button>
          ))}
          {!anyFatEntries && (
            <span className="toggle-hint">
              Add body fat to see lean and fat
            </span>
          )}
        </div>
        {visibleRanges.length > 1 && (
          <div className="toggle-group" role="group" aria-label="Time range">
            {visibleRanges.map((option) => (
              <button
                key={option.key}
                type="button"
                className="range-toggle"
                aria-pressed={option.key === activeRange.key}
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        className="chart"
        ref={wrapRef}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={() => setHoverIndex(undefined)}
      >
        {geometry && (
          <svg
            // Remount on range/line changes so the lines draw in again
            key={`${activeRange.key}-${shown.weight}-${shown.lean}-${shown.fat}`}
            viewBox={`0 0 ${width} ${geometry.height}`}
            height={geometry.height}
            role="img"
            aria-label={`Weight trend from ${formatShortDate(
              points[0].entry.dateTime
            )} to ${formatShortDate(points[points.length - 1].entry.dateTime)}`}
          >
            <ChartBody
              points={points}
              shown={shown}
              geometry={geometry}
              width={width}
            />
            {hovered && (
              <HoverMarkers point={hovered} shown={shown} geometry={geometry} />
            )}
          </svg>
        )}
        {hovered && geometry && (
          <Tooltip
            point={hovered}
            shown={shown}
            left={geometry.x(hovered.millis)}
            flip={geometry.x(hovered.millis) > width / 2}
          />
        )}
      </div>
    </>
  );
}

type Geometry = ReturnType<typeof buildGeometry>;

function buildGeometry(points: Point[], shown: SeriesSelection, width: number) {
  const height = width < 480 ? 220 : 270;
  const margin = { left: 30, right: 50, top: 20, bottom: 24 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const values: number[] = [];
  points.forEach((point) => {
    if (shown.weight) values.push(point.weight, point.trend);
    if (shown.lean && point.lean !== undefined) values.push(point.lean);
    if (shown.fat && point.fat !== undefined) values.push(point.fat);
  });
  const padding = Math.max(
    0.3,
    (Math.max(...values) - Math.min(...values)) * 0.12
  );
  const low = Math.min(...values) - padding;
  const high = Math.max(...values) + padding;

  // Aim for two or three faint gridlines at round values
  const rawStep = (high - low) / 2.5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((multiple) => multiple * magnitude)
      .find((candidate) => candidate >= rawStep) ?? rawStep;
  const gridValues: number[] = [];
  for (let value = Math.ceil(low / step) * step; value <= high; value += step) {
    gridValues.push(value);
  }

  const start = points[0].millis;
  const end = points[points.length - 1].millis;
  const x = (millis: number) =>
    margin.left + ((millis - start) / (end - start)) * innerWidth;
  const y = (value: number) =>
    margin.top + (1 - (value - low) / (high - low)) * innerHeight;

  const ticks: { millis: number; label: string }[] = [];
  const weekly = end - start < 50 * 24 * 60 * 60 * 1000;
  let tick = DateTime.fromMillis(start)
    .startOf(weekly ? "week" : "month")
    .plus(weekly ? { weeks: 1 } : { months: 1 });
  while (tick.toMillis() <= end) {
    ticks.push({
      millis: tick.toMillis(),
      label: tick.toFormat(weekly ? "d LLL" : "LLL").toUpperCase(),
    });
    tick = tick.plus(weekly ? { weeks: 1 } : { months: 1 });
  }
  const tickEvery = Math.max(
    1,
    Math.ceil(ticks.length / Math.floor(innerWidth / 56))
  );
  const visibleTicks = ticks.filter((t, index) => {
    const tickX = x(t.millis);
    return (
      index % tickEvery === 0 &&
      tickX > margin.left + 14 &&
      tickX < width - margin.right - 14
    );
  });

  return {
    height,
    margin,
    innerHeight,
    gridValues,
    visibleTicks,
    x,
    y,
  };
}

function linePath(
  points: Point[],
  value: (point: Point) => number | undefined,
  geometry: Geometry
) {
  return points
    .flatMap((point) => {
      const v = value(point);
      return v === undefined ? [] : [[geometry.x(point.millis), geometry.y(v)]];
    })
    .map(
      ([px, py], index) =>
        `${index ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`
    )
    .join("");
}

function ChartBody({
  points,
  shown,
  geometry,
  width,
}: {
  points: Point[];
  shown: SeriesSelection;
  geometry: Geometry;
  width: number;
}) {
  const { x, y, margin, innerHeight, height } = geometry;
  const first = points[0];
  const last = points[points.length - 1];
  const trendPath = linePath(points, (point) => point.trend, geometry);

  // Annotate the low point unless it's at the very end or the start
  const body = points.slice(0, -2);
  const lowest =
    body.length > 2
      ? body.reduce((min, point) => (point.trend < min.trend ? point : min))
      : undefined;
  const showLow =
    lowest &&
    lowest.trend < last.trend - 0.15 &&
    lowest.trend < first.trend - 0.15;

  return (
    <>
      <defs>
        <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="area-stop-top" />
          <stop offset="1" className="area-stop-bottom" />
        </linearGradient>
      </defs>
      {geometry.gridValues.map((value) => (
        <g key={value}>
          <line
            className="grid-line"
            x1={margin.left}
            x2={width - margin.right}
            y1={y(value)}
            y2={y(value)}
          />
          <text
            className="chart-label"
            x={margin.left - 6}
            y={y(value) + 3.5}
            textAnchor="end"
          >
            {+value.toFixed(1)}
          </text>
        </g>
      ))}
      {geometry.visibleTicks.map(({ millis, label }) => (
        <text
          key={millis}
          className="chart-label"
          x={x(millis)}
          y={height - 6}
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
      {shown.weight && (
        <>
          <line
            className="reference-line"
            x1={margin.left}
            x2={width - margin.right}
            y1={y(first.trend)}
            y2={y(first.trend)}
          />
          <text
            className="chart-label"
            x={margin.left + 2}
            y={y(first.trend) - 6}
          >
            START {first.trend.toFixed(1)}
          </text>
          <path
            className="trend-area"
            d={`${trendPath}L${x(last.millis)},${margin.top + innerHeight}L${x(
              first.millis
            )},${margin.top + innerHeight}Z`}
          />
          {points.map((point) => (
            <circle
              key={point.millis}
              className="raw-dot"
              cx={x(point.millis)}
              cy={y(point.weight)}
              r={width < 480 ? 2 : 2.4}
            />
          ))}
          <path className="trend-line" pathLength={1} d={trendPath} />
          {showLow && lowest && (
            <>
              <line
                className="annotation-tick"
                x1={x(lowest.millis)}
                x2={x(lowest.millis)}
                y1={y(lowest.trend) + 4}
                y2={y(lowest.trend) + 13}
              />
              <text
                className="chart-label strong"
                x={Math.min(
                  Math.max(x(lowest.millis), margin.left + 24),
                  width - margin.right - 24
                )}
                y={y(lowest.trend) + 24}
                textAnchor="middle"
              >
                LOW {lowest.trend.toFixed(1)}
              </text>
            </>
          )}
          <circle
            className="end-dot"
            cx={x(last.millis)}
            cy={y(last.trend)}
            r={4.5}
          />
          <text
            className="end-value"
            x={x(last.millis) + 9}
            y={y(last.trend) + 2}
          >
            {last.trend.toFixed(1)}
          </text>
          <text
            className="chart-label small"
            x={x(last.millis) + 9}
            y={y(last.trend) + 14}
          >
            7-DAY
          </text>
        </>
      )}
      {shown.lean && (
        <path
          className="lean-line"
          pathLength={1}
          d={linePath(points, (point) => point.lean, geometry)}
        />
      )}
      {shown.fat && (
        <path
          className="fat-line"
          pathLength={1}
          d={linePath(points, (point) => point.fat, geometry)}
        />
      )}
    </>
  );
}

function HoverMarkers({
  point,
  shown,
  geometry,
}: {
  point: Point;
  shown: SeriesSelection;
  geometry: Geometry;
}) {
  const { x, y, margin, innerHeight } = geometry;
  const px = x(point.millis);
  const markers: { value: number | undefined; color: string }[] = [];
  if (shown.weight) {
    markers.push({ value: point.weight, color: "var(--fg)" });
    markers.push({ value: point.trend, color: "var(--trend)" });
  }
  if (shown.lean) markers.push({ value: point.lean, color: "var(--lean)" });
  if (shown.fat) markers.push({ value: point.fat, color: "var(--fat)" });

  return (
    <g>
      <line
        className="hover-line"
        x1={px}
        x2={px}
        y1={margin.top}
        y2={margin.top + innerHeight}
      />
      {markers.map(
        ({ value, color }) =>
          value !== undefined && (
            <circle
              key={color}
              className="hover-dot"
              cx={px}
              cy={y(value)}
              r={4.5}
              style={{ fill: color }}
            />
          )
      )}
    </g>
  );
}

function Tooltip({
  point,
  shown,
  left,
  flip,
}: {
  point: Point;
  shown: SeriesSelection;
  left: number;
  flip: boolean;
}) {
  const { entry } = point;
  return (
    <div
      className={`chart-tooltip${flip ? " flip" : ""}`}
      style={{ left }}
      aria-hidden="true"
    >
      <span className="tooltip-date">
        {formatDay(entry.dateTime)} · {entry.dateTime.toFormat("HH:mm")}
      </span>
      {shown.weight && (
        <>
          <TooltipRow label="Weighed" value={`${point.weight.toFixed(1)} kg`} />
          <TooltipRow
            label="7-day avg"
            color="var(--trend)"
            value={`${point.trend.toFixed(1)} kg`}
          />
        </>
      )}
      {entry.fatPercent !== undefined && (
        <>
          {shown.lean && point.lean !== undefined && (
            <TooltipRow
              label="Lean"
              color="var(--lean)"
              value={`${point.lean.toFixed(1)} kg`}
            />
          )}
          {shown.fat && point.fat !== undefined && (
            <TooltipRow
              label="Fat"
              color="var(--fat)"
              value={`${point.fat.toFixed(1)} kg`}
            />
          )}
          <TooltipRow
            label="Body fat"
            value={`${entry.fatPercent.toFixed(1)}%`}
          />
        </>
      )}
    </div>
  );
}

const TooltipRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <span className="tooltip-row">
    <span
      className={color ? "swatch" : undefined}
      style={color ? ({ "--swatch": color } as React.CSSProperties) : undefined}
    >
      {label}
    </span>
    <b>{value}</b>
  </span>
);
