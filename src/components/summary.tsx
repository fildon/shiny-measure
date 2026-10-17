import * as React from "react";

import type { WeightEntry } from "../types";
import { trendAt } from "../trend";
import {
  changeClass,
  formatChange,
  formatDay,
  formatShortDate,
} from "../format";

/** Animates a number towards each new value it is given */
function useCountUp(value: number | undefined) {
  const [shown, setShown] = React.useState(value);
  const previous = React.useRef(value);

  React.useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (
      value === undefined ||
      from === undefined ||
      from === value ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 600);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return shown;
}

/**
 * @param entries sorted oldest first
 */
export const Summary = ({ entries }: { entries: WeightEntry[] }) => {
  const latest = entries[entries.length - 1];
  const shownWeight = useCountUp(latest?.weightTotal);

  if (!latest || shownWeight === undefined) {
    return (
      <section className="summary" aria-live="polite">
        <div>
          <div className="label">Current weight</div>
          <p className="summary-empty">No entries yet</p>
        </div>
        <p className="lede">
          Record your first weigh-in below. Your trend appears after the
          second.
        </p>
      </section>
    );
  }

  const previous = entries[entries.length - 2];
  const first = entries[0];

  const previousIsRecent =
    previous && latest.dateTime.diff(previous.dateTime, "days").days < 6;
  const previousLong = previous
    ? previousIsRecent
      ? previous.dateTime.toFormat("cccc")
      : formatShortDate(previous.dateTime)
    : "";
  const previousShort = previous
    ? previousIsRecent
      ? previous.dateTime.toFormat("ccc")
      : formatShortDate(previous.dateTime)
    : "";

  const thirtyDaysAgo = latest.dateTime.minus({ days: 30 });
  const latestTrend = trendAt(entries, latest.dateTime);
  const earlierTrend = trendAt(entries, thirtyDaysAgo);
  const monthTrend =
    first.dateTime < thirtyDaysAgo &&
    latestTrend !== undefined &&
    earlierTrend !== undefined
      ? latestTrend - earlierTrend
      : undefined;

  const stats: { change: number; label: string }[] = [];
  if (previous) {
    stats.push({
      change: latest.weightTotal - previous.weightTotal,
      label: `Since ${previousShort}`,
    });
  }
  if (monthTrend !== undefined) {
    stats.push({ change: monthTrend, label: "30-day trend" });
  }
  if (entries.length > 2) {
    stats.push({
      change: latest.weightTotal - first.weightTotal,
      label: `Since ${formatShortDate(first.dateTime)}`,
    });
  }

  return (
    <section className="summary" aria-live="polite">
      <div>
        <div className="label">
          Current weight · {formatDay(latest.dateTime)}
          {latest.fatPercent !== undefined &&
            ` · ${latest.fatPercent.toFixed(1)}% fat`}
        </div>
        <div className="big-number">
          <span>{shownWeight.toFixed(1)}</span>
          <small>KG</small>
        </div>
      </div>
      {previous && (
        <Lede
          changeSincePrevious={latest.weightTotal - previous.weightTotal}
          previousLabel={previousLong}
          monthTrend={monthTrend}
        />
      )}
      {stats.length > 0 && (
        <div className="stats">
          {stats.map(({ change, label }) => (
            <div key={label}>
              <b className={changeClass(change)}>{formatChange(change)}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Lede = ({
  changeSincePrevious,
  previousLabel,
  monthTrend,
}: {
  changeSincePrevious: number;
  previousLabel: string;
  monthTrend: number | undefined;
}) => {
  const sincePrevious = Math.round(changeSincePrevious * 10) / 10;
  const previousPart =
    sincePrevious === 0 ? (
      <>the same as {previousLabel}</>
    ) : (
      <>
        <b>{Math.abs(sincePrevious).toFixed(1)}</b>{" "}
        {sincePrevious < 0 ? "lighter" : "heavier"} than {previousLabel}
      </>
    );

  if (monthTrend === undefined) {
    return <p className="lede">This weigh-in is {previousPart}.</p>;
  }

  const trend = Math.round(monthTrend * 10) / 10;
  return (
    <p className="lede">
      {trend === 0 ? (
        <>Flat over 30 days on the 7-day average</>
      ) : (
        <>
          {trend < 0 ? "Down" : "Up"} <b>{Math.abs(trend).toFixed(1)} kg</b>{" "}
          over 30 days on the 7-day average
        </>
      )}
      , and {previousPart}.
    </p>
  );
};
