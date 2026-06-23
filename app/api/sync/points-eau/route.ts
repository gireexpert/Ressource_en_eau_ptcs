export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { EPICOLLECT_SOURCES } from "@/services/epicollect/sources";
import { syncTable } from "@/services/epicollect/syncTable";
import { mapPointEau } from "@/services/mappers/points-eau";
export async function GET() {
  const results = [];
  results.push(await syncTable("points_eau","inventaire",EPICOLLECT_SOURCES.pointsEau.inventaire,"points_eau",mapPointEau));
  return NextResponse.json({ ok: true, results });
}
