export const dynamic="force-dynamic";
export const revalidate=0;
export const fetchCache="force-no-store";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (expected && req.headers.get("authorization") !== expected) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const res = await fetch(`${req.nextUrl.origin}/api/sync/all`, { cache:"no-store" });
  return NextResponse.json({ ok:true, triggered:"sync/all", data: await res.json() });
}
