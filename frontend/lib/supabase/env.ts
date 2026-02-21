export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  if (missing.length > 0) {
    throw new Error(`Missing Supabase env vars: ${missing.join(", ")}`);
  }

  return {
    url: url!,
    publishableKey: publishableKey!,
  };
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing Supabase server key: SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  return key!;
}
