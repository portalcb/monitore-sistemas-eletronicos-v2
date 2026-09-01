import { NextResponse } from "next/server";
import { roleForEmail, supabaseConfig } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const { email, token } = await request.json(); const normalized = String(email || "").trim().toLowerCase();
  if (!roleForEmail(normalized)) return NextResponse.json({ error: "E-mail não autorizado." }, { status: 403 });
  const { url, anon } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/verify`, { method: "POST", headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: normalized, token: String(token || "").trim(), type: "email" }) });
  if (!response.ok) return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 401 });
  const session = await response.json(); const result = NextResponse.json({ ok: true, role: roleForEmail(normalized) });
  result.cookies.set("monitore_admin_token", session.access_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: session.expires_in || 3600 });
  return result;
}

