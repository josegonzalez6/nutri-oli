import { describe, expect, it } from "vitest";

import { canAccessClinicalNotes, canMutateOrganization, canPublishDietPlan } from "./roles";

describe("application role rules", () => {
  it("keeps assistants and clients away from private clinical notes", () => {
    expect(canAccessClinicalNotes("assistant")).toBe(false);
    expect(canAccessClinicalNotes("client")).toBe(false);
    expect(canAccessClinicalNotes("nutritionist")).toBe(true);
  });

  it("reserves organization mutation for owners", () => {
    expect(canMutateOrganization("owner")).toBe(true);
    expect(canMutateOrganization("nutritionist")).toBe(false);
  });

  it("allows only clinical professionals to publish diet plans", () => {
    expect(canPublishDietPlan("owner")).toBe(true);
    expect(canPublishDietPlan("nutritionist")).toBe(true);
    expect(canPublishDietPlan("assistant")).toBe(false);
  });
});
