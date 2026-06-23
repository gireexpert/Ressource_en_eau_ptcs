export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { EPICOLLECT_SOURCES } from "@/services/epicollect/sources";
import { syncTable } from "@/services/epicollect/syncTable";
import { mapPiezometre, mapPiezoObservation } from "@/services/mappers/piezometrie";
export async function GET() {
  const results = [];
  results.push(await syncTable("piezometrie","referentiel",EPICOLLECT_SOURCES.piezometrie.referentiel,"piezometres",mapPiezometre));
  results.push(await syncTable("piezometrie","mesures",EPICOLLECT_SOURCES.piezometrie.mesures,"observations_piezo",mapPiezoObservation));
  return NextResponse.json({ ok: true, results });
}
