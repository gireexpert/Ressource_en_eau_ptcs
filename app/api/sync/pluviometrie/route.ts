export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { EPICOLLECT_SOURCES } from "@/services/epicollect/sources";
import { syncTable } from "@/services/epicollect/syncTable";
import { mapPluvioStation, mapPluvioObservation } from "@/services/mappers/pluviometrie";
export async function GET() {
  const results = [];
  results.push(await syncTable("pluviometrie","stations",EPICOLLECT_SOURCES.pluviometrie.stations,"stations_pluvio",mapPluvioStation));
  results.push(await syncTable("pluviometrie","releves",EPICOLLECT_SOURCES.pluviometrie.releves,"observations_pluvio",mapPluvioObservation));
  return NextResponse.json({ ok: true, results });
}
