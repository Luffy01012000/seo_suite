import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/blog";

const allowedRoles: ProfileRole[] = ["admin", "editor"];

export async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null as ProfileRole | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? null) as ProfileRole | null;

  return { user, role };
}

export async function requireEditorUser() {
  const { user, role } = await getCurrentUserRole();

  if (!user) {
    redirect(`/login?next=/admin`);
  }

  if (!role || !allowedRoles.includes(role)) {
    redirect("/");
  }

  return { user, role };
}
