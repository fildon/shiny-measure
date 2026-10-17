import * as React from "react";
import { Trash2 } from "lucide-react";

import type { WeightEntry } from "../types";
import { fatMass, leanMass } from "../trend";
import { changeClass, formatChange, formatDay } from "../format";

const MONTHS_PER_PAGE = 3;

interface Month {
  key: string;
  label: string;
  average: number;
  /** Newest first, each with the entry recorded before it */
  rows: { entry: WeightEntry; previous?: WeightEntry }[];
}

/**
 * @param entries sorted oldest first
 * @returns months newest first
 */
const groupByMonth = (entries: WeightEntry[]): Month[] => {
  const months = new Map<string, Month>();
  entries.forEach((entry, index) => {
    const key = entry.dateTime.toFormat("yyyy-MM");
    const month = months.get(key) ?? {
      key,
      label: entry.dateTime.toFormat("LLLL yyyy"),
      average: 0,
      rows: [],
    };
    month.rows.unshift({ entry, previous: entries[index - 1] });
    months.set(key, month);
  });
  return [...months.values()].reverse().map((month) => ({
    ...month,
    average:
      month.rows.reduce((sum, { entry }) => sum + entry.weightTotal, 0) /
      month.rows.length,
  }));
};

/**
 * @param entries sorted oldest first
 */
export const PastEntries = ({
  entries,
  highlighted,
  deleteWeightEntry,
}: {
  entries: WeightEntry[];
  /** Millis of an entry to briefly highlight, e.g. one just added */
  highlighted?: number;
  deleteWeightEntry: (entry: WeightEntry) => unknown;
}) => {
  const [monthsShown, setMonthsShown] = React.useState(MONTHS_PER_PAGE);
  const months = groupByMonth(entries);

  return (
    <section className="panel" aria-labelledby="history-heading">
      <div className="panel-head">
        <h2 id="history-heading">History</h2>
        {entries.length > 0 && (
          <span className="meta">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="empty-note">Your weigh-ins will be listed here.</p>
      ) : (
        <div>
          {months.slice(0, monthsShown).map((month) => (
            <section className="month" key={month.key}>
              <h3>
                {month.label}
                <span>AVG {month.average.toFixed(1)} KG</span>
              </h3>
              <ul>
                {month.rows.map(({ entry, previous }) => (
                  <HistoryRow
                    key={entry.dateTime.toMillis()}
                    entry={entry}
                    previous={previous}
                    highlighted={entry.dateTime.toMillis() === highlighted}
                    onDelete={() => deleteWeightEntry(entry)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      {months.length > monthsShown && (
        <button
          type="button"
          className="ghost-button"
          onClick={() => setMonthsShown((shown) => shown + MONTHS_PER_PAGE)}
        >
          Show older entries
        </button>
      )}
    </section>
  );
};

const HistoryRow = ({
  entry,
  previous,
  highlighted,
  onDelete,
}: {
  entry: WeightEntry;
  previous?: WeightEntry;
  highlighted: boolean;
  onDelete: () => void;
}) => {
  const lean = leanMass(entry);
  const fat = fatMass(entry);
  const change = previous && entry.weightTotal - previous.weightTotal;

  return (
    <li className={`history-row${highlighted ? " highlighted" : ""}`}>
      <span className="history-date">{formatDay(entry.dateTime)}</span>
      {entry.fatPercent !== undefined && lean !== undefined && fat !== undefined && (
        <span className="history-detail">
          {entry.fatPercent.toFixed(1)}% fat · {lean.toFixed(1)} lean ·{" "}
          {fat.toFixed(1)} fat
        </span>
      )}
      <span className="history-weight">
        {entry.weightTotal.toFixed(1)}
        <small>KG</small>
      </span>
      {change === undefined ? (
        <span className="history-change flat">First</span>
      ) : (
        <span className={`history-change ${changeClass(change)}`}>
          {formatChange(change)}
        </span>
      )}
      <button
        type="button"
        className="icon-button"
        aria-label={`Delete entry from ${formatDay(entry.dateTime)}`}
        onClick={onDelete}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  );
};
