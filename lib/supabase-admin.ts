import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

export function hasSupabaseAdminEnv() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getSupabaseAdminEnvStatus() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(supabaseUrl),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
  };
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://example.supabase.co",
  serviceRoleKey || "service-role-placeholder",
  { auth: { persistSession: false } }
);
