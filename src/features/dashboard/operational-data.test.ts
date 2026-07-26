import { describe, expect, it } from "vitest";

import {
  appointmentStatusLabel,
  demoDashboardSnapshot,
  formatMadridTime,
  getDashboardStats,
  getNextAppointment,
  visibilityLabel
} from "./operational-data";

describe("dashboard operational data", () => {
  it("selects the earliest non-cancelled appointment", () => {
    expect(getNextAppointment(demoDashboardSnapshot)?.id).toBe("apt-demo-001");
  });

  it("computes attention stats from typed dashboard data", () => {
    const stats = getDashboardStats(demoDashboardSnapshot);

    expect(stats.nextAppointmentTime).toBe("10:30");
    expect(stats.pendingPlans).toBe(1);
    expect(stats.unreadMessages).toBe(1);
    expect(stats.consents).toBe(1);
    expect(stats.attentionItems).toBe(4);
  });

  it("formats status and visibility labels without exposing internal codes", () => {
    expect(appointmentStatusLabel("no_show")).toBe("No presentada");
    expect(visibilityLabel("professional_only")).toBe("Privado profesional");
    expect(formatMadridTime(null)).toBe("-");
  });
});
