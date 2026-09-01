import { NextResponse } from "next/server";
import { readCms } from "@/lib/cms";
export async function GET() { return NextResponse.json(await readCms()); }

