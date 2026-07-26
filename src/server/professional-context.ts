import "server-only";

import type { PoolClient } from "pg";

import { createClient } from "@/lib/supabase/server";

import { getDatabaseConfig, getDatabasePool } from "./database";

type ProfessionalRole = "owner" | "nutritionist" | "assistant" | "auditor";

export type ProfessionalContext =
  | {
      status: "ready";
      databaseUrl: string;
      organizationId: string;
      organizationName: string;
      profileId: string;
      professionalProfileId: string;
      role: ProfessionalRole;
      source: "supabase_session" | "development_fallback";
    }
  | { status: "not_configured"; missing: string[] }
  | { status: "auth_required" }
  | { status: "forbidden" };

type MembershipRow = {
  organization_id: string;
  organization_name: string;
  role: "owner" | "nutritionist" | "assistant" | "auditor" | "client";
  professional_profile_id: string | null;
};

const professionalRoles: ProfessionalRole[] = ["owner", "nutritionist", "assistant", "auditor"];

export async function getProfessionalContext(): Promise<ProfessionalContext> {
  const databaseConfig = getDatabaseConfig();

  if (databaseConfig.status !== "ready") {
    return databaseConfig;
  }

  if (hasSupabaseBrowserConfig()) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      return resolveProfessionalContextForProfile(databaseConfig.databaseUrl, user.id);
    }
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.NUTRI_OLI_ALLOW_DEV_AUTH_BYPASS !== "true"
  ) {
    return { status: "auth_required" };
  }

  return {
    status: "ready",
    databaseUrl: databaseConfig.databaseUrl,
    organizationId: databaseConfig.organizationId,
    organizationName: "Consulta Demo Nutri-Oli",
    profileId: databaseConfig.profileId,
    professionalProfileId: databaseConfig.professionalProfileId,
    role: "owner",
    source: "development_fallback"
  };
}

export async function withProfessionalTransaction<T>(
  callback: (
    client: PoolClient,
    context: Extract<ProfessionalContext, { status: "ready" }>
  ) => Promise<T>
): Promise<T | Exclude<ProfessionalContext, { status: "ready" }>> {
  const context = await getProfessionalContext();

  if (context.status !== "ready") {
    return context;
  }

  const pool = getDatabasePool(context.databaseUrl);
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("set local role authenticated");
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [context.profileId]);
    const result = await callback(client, context);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function resolveProfessionalContextForProfile(
  databaseUrl: string,
  profileId: string
): Promise<ProfessionalContext> {
  const pool = getDatabasePool(databaseUrl);
  const result = await pool.query<MembershipRow>(
    `select
      om.organization_id,
      o.name as organization_name,
      om.role,
      pp.id as professional_profile_id
    from public.organization_members om
    join public.organizations o on o.id = om.organization_id
    left join public.professional_profiles pp
      on pp.organization_id = om.organization_id
      and pp.profile_id = om.profile_id
    where om.profile_id = $1
    order by
      case om.role
        when 'owner' then 1
        when 'nutritionist' then 2
        when 'assistant' then 3
        when 'auditor' then 4
        else 5
      end
    limit 1`,
    [profileId]
  );
  const membership = result.rows[0];

  if (!membership || !isProfessionalRole(membership.role)) {
    return { status: "forbidden" };
  }

  if (membership.role !== "assistant" && !membership.professional_profile_id) {
    return { status: "forbidden" };
  }

  return {
    status: "ready",
    databaseUrl,
    organizationId: membership.organization_id,
    organizationName: membership.organization_name,
    profileId,
    professionalProfileId: membership.professional_profile_id ?? profileId,
    role: membership.role,
    source: "supabase_session"
  };
}

function hasSupabaseBrowserConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function isProfessionalRole(role: MembershipRow["role"]): role is ProfessionalRole {
  return professionalRoles.includes(role as ProfessionalRole);
}
