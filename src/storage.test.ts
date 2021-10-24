import { DateTime } from "luxon";
import { buildStorageModule } from "./storage";

/**
 * Simulates window.localStorage API
 */
const buildMockStorageDep = (): Pick<Storage, "getItem" | "setItem"> => {
  const internalStorage: Record<string, string | undefined> = {};

  return {
    getItem: (key: string) => internalStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      internalStorage[key] = value;
    },
  };
};

describe("Storage", () => {
  it("persists new entries", () => {
    const storage = buildStorageModule(buildMockStorageDep());

    const entries = storage.getWeightEntries();

    expect(entries).toHaveLength(0);

    const now = DateTime.now();

    storage.recordWeightEntry({
      dateTime: now,
      weightTotal: 1,
      fatPercent: 2,
    });

    const newEntries = storage.getWeightEntries();

    expect(newEntries).toHaveLength(1);
    expect(newEntries[0]).toEqual({
      dateTime: now,
      weightTotal: 1,
      fatPercent: 2,
    });
  });

  it("returns entries sorted by date", () => {
    const storage = buildStorageModule(buildMockStorageDep());

    const today = DateTime.now();
    const yesterday = DateTime.now().minus({ days: 1 });
    const lastWeek = DateTime.now().minus({ days: 7 });

    const todayEntry = { dateTime: today, weightTotal: 1, fatPercent: 2 };
    const yesterdayEntry = {
      dateTime: yesterday,
      weightTotal: 3,
      fatPercent: 4,
    };
    const lastWeekEntry = {
      dateTime: lastWeek,
      weightTotal: 5,
      fatPercent: 6,
    };

    // Add entries out of order
    storage.recordWeightEntry(yesterdayEntry);
    storage.recordWeightEntry(todayEntry);
    storage.recordWeightEntry(lastWeekEntry);

    const entries = storage.getWeightEntries();

    // Expect entries in descending order by date
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      dateTime: today,
      weightTotal: 1,
      fatPercent: 2,
    });
    expect(entries[1]).toEqual({
      dateTime: yesterday,
      weightTotal: 3,
      fatPercent: 4,
    });
    expect(entries[2]).toEqual({
      dateTime: lastWeek,
      weightTotal: 5,
      fatPercent: 6,
    });
  });
});
