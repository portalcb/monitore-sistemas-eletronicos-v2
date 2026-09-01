import { cookies } from "next/headers";

export const TECHNICAL_ADMIN = "balneariocamboriuparcerias@gmail.com";
export const CONTENT_ADMIN = "monitoresystem@hotmail.com";
export type AdminRole = "superadmin" | "content_admin";

export function roleForEmail(email?: string | null): AdminRole | null {
  const normalized = email?.trim().toLowerCase();
  if (normalized === TECHNICAL_ADMIN) return "superadmin";
  if (normalized === CONTENT_ADMIN) return "content_admin";
  return null;
}

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) throw new Error("Supabase não configurado no ambiente.");
  return { url: url.replace(/\/$/, ""), anon, service };
}

export async function getAdminSession() {
  const token = (await cookies()).get("monitore_admin_token")?.value;
  if (!token) return null;
  const { url, anon } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return null;
  const user = await response.json();
  const role = roleForEmail(user.email);
  return role ? { id: user.id as string, email: user.email as string, role } : null;
}

