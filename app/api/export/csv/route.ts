export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pointsEauInventaire from "@/public/data/points-eau-inventaire.json";
import { supabaseAdmin, hasSupabaseAdminEnv } from "@/lib/supabase-admin";
import { toCsv } from "@/services/exports/csv";

const TABLES: Record<string, string[]> = {
  pluviometrie: ["v_pluviometrie_dashboard", "observations_pluvio"],
  piezometrie: ["v_piezometrie_dashboard", "observations_piezo"],
  limnimetrie: ["v_limnimetrie_dashboard", "observations_limni"],
  points_eau: ["v_points_eau_dashboard", "points_eau"],
};
const PRIVATE = new Set(["nom_repondant", "contact_repondant", "51_Nom_et_Prenom", "52_Contact_tlphoniqu"]);
function sanitize(rows: any[]) { return rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !PRIVATE.has(k)))); }
async function localPoints() { return pointsEauInventaire as any[]; }
async function readRows(module: string) {
  if (hasSupabaseAdminEnv()) {
    for (const table of TABLES[module] || []) {
      const { data, error } = await supabaseAdmin.from(table).select("*").limit(20000);
      if (!error && data?.length) return data;
    }
  }
  if (module === "points_eau") return localPoints();
  return [];
}
export async function GET(req: NextRequest) {
  const module = req.nextUrl.searchParams.get("module") || "pluviometrie";
  if (!TABLES[module]) return NextResponse.json({ ok: false, error: "Module invalide" }, { status: 400 });
  const rows = sanitize(await readRows(module));
  return new NextResponse(toCsv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${module}_PSORE_V2_3.csv"` } });
}
