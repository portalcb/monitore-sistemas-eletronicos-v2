import { NextResponse } from "next/server";
import { roleForEmail, supabaseConfig } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const { email } = await request.json(); const normalized = String(email || "").trim().toLowerCase();
  if (!roleForEmail(normalized)) return NextResponse.json({ error: "E-mail não autorizado." }, { status: 403 });
  const { url, anon } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/otp`, { method: "POST", headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: normalized, create_user: true }) });
  if (!response.ok) return NextResponse.json({ error: "Não foi possível enviar o código de acesso." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

