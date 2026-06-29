export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { EPICOLLECT_SOURCES } from "@/services/epicollect/sources";
import { syncTable } from "@/services/epicollect/syncTable";
import { mapPluvioStation, mapPluvioObservation } from "@/services/mappers/pluviometrie";
import { mapPiezometre, mapPiezoObservation } from "@/services/mappers/piezometrie";
import { mapLimniStation, mapLimniObservation } from "@/services/mappers/limnimetrie";
import { mapPointEau } from "@/services/mappers/points-eau";

export async function GET() {
  const results = [];

  results.push(await syncTable("pluviometrie", "stations", EPICOLLECT_SOURCES.pluviometrie.stations, "stations_pluvio", mapPluvioStation));
  results.push(await syncTable("pluviometrie", "releves", EPICOLLECT_SOURCES.pluviometrie.releves, "observations_pluvio", mapPluvioObservation));

  results.push(await syncTable("piezometrie", "referentiel", EPICOLLECT_SOURCES.piezometrie.referentiel, "piezometres", mapPiezometre));
  results.push(await syncTable("piezometrie", "mesures", EPICOLLECT_SOURCES.piezometrie.mesures, "observations_piezo", mapPiezoObservation));

  results.push(await syncTable("limnimetrie", "stations", EPICOLLECT_SOURCES.limnimetrie.stations, "stations_limni", mapLimniStation));
  results.push(await syncTable("limnimetrie", "lectures", EPICOLLECT_SOURCES.limnimetrie.lectures, "observations_limni", mapLimniObservation));

  results.push(await syncTable("points_eau", "inventaire", EPICOLLECT_SOURCES.pointsEau.inventaire, "points_eau", mapPointEau));

  return NextResponse.json({ ok: true, results });
}
