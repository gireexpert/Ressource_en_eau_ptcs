export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { EPICOLLECT_SOURCES } from "@/services/epicollect/sources";
import { syncTable } from "@/services/epicollect/syncTable";
import { mapLimniStation, mapLimniObservation } from "@/services/mappers/limnimetrie";
export async function GET() {
  const results = [];
  results.push(await syncTable("limnimetrie","stations",EPICOLLECT_SOURCES.limnimetrie.stations,"stations_limni",mapLimniStation));
  results.push(await syncTable("limnimetrie","lectures",EPICOLLECT_SOURCES.limnimetrie.lectures,"observations_limni",mapLimniObservation));
  return NextResponse.json({ ok: true, results });
}
