export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminEnv } from "@/lib/supabase-admin";

type Row = Record<string, any>;
const CFG: Record<string, { view: string; table: string; label: string; valueKey: string; dateKey: string; module: string }> = {
  pluviometrie: { view: "v_pluviometrie_dashboard", table: "observations_pluvio", label: "Pluviométrie", valueKey: "pluie_24h_mm", dateKey: "date_observation", module: "pluviometrie" },
  piezometrie: { view: "v_piezometrie_dashboard", table: "observations_piezo", label: "Piézométrie", valueKey: "niveau_statique", dateKey: "date_observation", module: "piezometrie" },
  limnimetrie: { view: "v_limnimetrie_dashboard", table: "observations_limni", label: "Limnimétrie", valueKey: "hauteur_eau", dateKey: "date_observation", module: "limnimetrie" },
};
function text(v: any) { return String(v ?? "").trim(); }
function num(v: any) { const raw = String(v ?? "").trim(); if (!raw) return null; const n = Number(raw); return Number.isFinite(n) ? n : null; }
function counts(rows: Row[], key: string) { const m = new Map<string, number>(); rows.forEach((r) => { const k = text(r[key]) || "Non renseigné"; m.set(k, (m.get(k) || 0) + 1); }); return Array.from(m.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value); }
function avg(rows: Row[], key: string) { const xs = rows.map((r) => num(r[key])).filter((x): x is number => x !== null); return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null; }
function byDate(rows: Row[], dateKey: string, valueKey: string) { const m = new Map<string, { n: number; sum: number }>(); rows.forEach((r) => { const d = text(r[dateKey]).slice(0, 10) || "Non daté"; const v = num(r[valueKey]); const old = m.get(d) || { n: 0, sum: 0 }; if (v !== null) { old.n += 1; old.sum += v; } else old.n += 1; m.set(d, old); }); return Array.from(m.entries()).map(([label, v]) => ({ label, value: v.n ? Math.round((v.sum / v.n) * 100) / 100 : 0 })).slice(-20); }

export async function GET(req: NextRequest) {
  const moduleName = req.nextUrl.searchParams.get("module") || "pluviometrie";
  const cfg = CFG[moduleName];
  if (!cfg) return NextResponse.json({ ok: false, error: "Module invalide" }, { status: 400 });
  let rows: Row[] = [];
  let source = "Supabase";
  if (hasSupabaseAdminEnv()) {
    let res = await supabaseAdmin.from(cfg.view).select("*").limit(10000);
    if (res.error || !res.data?.length) res = await supabaseAdmin.from(cfg.table).select("*").limit(10000);
    rows = res.data || [];
    if (res.error) source = `Supabase (${res.error.message})`;
  } else source = "En attente configuration Supabase";
  const commune = req.nextUrl.searchParams.get("commune");
  const site = req.nextUrl.searchParams.get("site");
  if (commune && commune !== "all") rows = rows.filter((r) => text(r.commune) === commune);
  if (site && site !== "all") rows = rows.filter((r) => text(r.code_site || r.code_station || r.code_piezo) === site);
  const values = rows.map((r) => num(r[cfg.valueKey])).filter((x): x is number => x !== null);
  const latest = [...rows].sort((a, b) => text(b[cfg.dateKey]).localeCompare(text(a[cfg.dateKey]))).slice(0, 500);
  return NextResponse.json({
    ok: true,
    source,
    module: cfg.module,
    label: cfg.label,
    stats: {
      observations: rows.length,
      sites: new Set(rows.map((r) => text(r.code_site || r.code_station || r.code_piezo || r.station_id || r.piezometre_id)).filter(Boolean)).size,
      moyenne: avg(rows, cfg.valueKey),
      minimum: values.length ? Math.min(...values) : null,
      maximum: values.length ? Math.max(...values) : null,
      alertes: rows.filter((r) => r.alerte_valeur || r.alerte_gps || r.alerte_donnee).length,
    },
    charts: {
      communes: counts(rows, "commune"),
      sites: counts(rows, "code_site"),
      evolution: byDate(rows, cfg.dateKey, cfg.valueKey),
    },
    filters: {
      communes: counts(rows, "commune").map((x) => x.label),
      sites: counts(rows, "code_site").map((x) => x.label),
    },
    data: latest,
  });
}
