import { describe, expect, it } from "vitest";

import { addMinutes, weekdayLabel } from "./time";

describe("clients agenda time helpers", () => {
  it("adds service duration to appointment starts", () => {
    expect(addMinutes("2026-07-27T10:30:00+02:00", 45)).toBe("2026-07-27T09:15:00.000Z");
  });

  it("formats weekday labels from ISO weekday numbers", () => {
    expect(weekdayLabel(1)).toBe("Lunes");
    expect(weekdayLabel(9)).toBe("-");
  });
});
