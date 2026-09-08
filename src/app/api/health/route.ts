import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ ok: true, storage: hasDatabase() ? "mongodb" : "memory", time: new Date().toISOString() });
}
