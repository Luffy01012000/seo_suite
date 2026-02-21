import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRole = getServiceRoleKey();

  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
