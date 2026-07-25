export const organizationRoles = [
  "owner",
  "nutritionist",
  "assistant",
  "auditor",
  "client"
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

export function canAccessClinicalNotes(role: OrganizationRole): boolean {
  return role === "owner" || role === "nutritionist" || role === "auditor";
}

export function canMutateOrganization(role: OrganizationRole): boolean {
  return role === "owner";
}

export function canPublishDietPlan(role: OrganizationRole): boolean {
  return role === "owner" || role === "nutritionist";
}
