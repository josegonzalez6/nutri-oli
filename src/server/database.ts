import "server-only";

import { Pool } from "pg";

let pool: Pool | null = null;

export type DatabaseConfig =
  | {
      status: "ready";
      databaseUrl: string;
      organizationId: string;
      profileId: string;
      professionalProfileId: string;
    }
  | {
      status: "not_configured";
      missing: string[];
    };

const demoOrganizationId = "00000000-0000-4000-8000-000000000001";
const demoProfileId = "00000000-0000-4000-8000-000000000010";
const demoProfessionalProfileId = "00000000-0000-4000-8000-000000000020";

export function getDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.NUTRI_OLI_DATABASE_URL;
  const organizationId =
    process.env.NUTRI_OLI_ORGANIZATION_ID ?? developmentFallback(demoOrganizationId);
  const profileId = process.env.NUTRI_OLI_PROFILE_ID ?? developmentFallback(demoProfileId);
  const professionalProfileId =
    process.env.NUTRI_OLI_PROFESSIONAL_PROFILE_ID ?? developmentFallback(demoProfessionalProfileId);

  const requiredEnvVars: Array<[string, string | undefined]> = [
    ["NUTRI_OLI_DATABASE_URL", databaseUrl],
    ["NUTRI_OLI_ORGANIZATION_ID", organizationId],
    ["NUTRI_OLI_PROFILE_ID", profileId],
    ["NUTRI_OLI_PROFESSIONAL_PROFILE_ID", professionalProfileId]
  ];
  const missing = requiredEnvVars.flatMap(([key, value]) => (value ? [] : [key]));

  if (
    missing.length > 0 ||
    !databaseUrl ||
    !organizationId ||
    !profileId ||
    !professionalProfileId
  ) {
    return { status: "not_configured", missing };
  }

  return {
    status: "ready",
    databaseUrl,
    organizationId,
    profileId,
    professionalProfileId
  };
}

export function getDatabasePool(databaseUrl: string): Pool {
  pool ??= new Pool({
    connectionString: databaseUrl,
    max: 4
  });

  return pool;
}

function developmentFallback(value: string): string | undefined {
  return process.env.NODE_ENV === "production" ? undefined : value;
}
