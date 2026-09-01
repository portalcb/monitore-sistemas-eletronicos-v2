import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { readCms, writeCms } from "@/lib/cms";
export async function GET() { const session = await getAdminSession(); if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 }); return NextResponse.json({ content: await readCms(), session }); }
export async function PUT(request: Request) { const session = await getAdminSession(); if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 }); const content = await request.json(); const saved = { ...content, updatedAt: new Date().toISOString(), updatedBy: session.email }; await writeCms(saved); return NextResponse.json({ ok: true, content: saved }); }

