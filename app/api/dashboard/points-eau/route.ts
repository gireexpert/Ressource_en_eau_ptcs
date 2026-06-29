export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pointsEauInventaire from "@/public/data/points-eau-inventaire.json";
import { supabaseAdmin, hasSupabaseAdminEnv } from "@/lib/supabase-admin";

type Row = Record<string, any>;

const PRIVATE_FIELDS = new Set(["nom_repondant", "contact_repondant", "51_Nom_et_Prenom", "52_Contact_tlphoniqu"]);

function asText(v: any) { return String(v ?? "").trim(); }
function asNumber(v: any) { const raw = String(v ?? "").trim(); if (!raw) return null; const n = Number(raw.replace(",", ".")); return Number.isFinite(n) ? n : null; }
function lower(v: any) { return asText(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function pick(row: Row, ...keys: string[]) { for (const k of keys) if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k]; return null; }

function normalize(row: Row): Row {
  const type = asText(pick(row, "type_infrastructure", "13_Type", "type_ouvrage"));
  const fonctionnalite = asText(pick(row, "statut_fonctionnalite", "fonctionnalite_forage", "24_Fonctionnalit_for", "etat")) || (type.toLowerCase() === "puits" ? "Non renseigné" : "Non renseigné");
  const organe = asText(pick(row, "organe_gestion", "29_Organe_de_Gestion"));
  const foncOrgane = asText(pick(row, "fonctionnalite_organe", "31_Fonctionnalit_de_"));
  const besoin = asText(pick(row, "besoin_rehabilitation", "49_Besoin_en_rhabili"));
  const probleme = asText(pick(row, "problemes", "48_Problmes_ou_dysfo"));
  const ph = asNumber(pick(row, "ph", "40_pH_"));
  const temperature = asNumber(pick(row, "temperature_c", "39_Temprature_C"));
  const conductivite = asNumber(pick(row, "conductivite", "41_Conductivit_lectr"));
  const tds = asNumber(pick(row, "tds", "43_TDS_"));
  const turbidite = asNumber(pick(row, "turbidite_ntu", "42_Turbidit_NTU"));
  const latitude = asNumber(pick(row, "latitude", "lat_10_Coordonnes_infras"));
  const longitude = asNumber(pick(row, "longitude", "long_10_Coordonnes_infras"));
  const equipement = asText(pick(row, "equipement", "equipement_forage", "25_Equipement", "17_Equipement")) || "Non renseigné";
  const hasProblem = Boolean(probleme && !["ras", "aucun", "neant", "néant"].includes(lower(probleme)));
  let score = 0;
  if (lower(fonctionnalite).includes("non fonctionnel")) score += 5;
  if (lower(fonctionnalite).includes("abandon")) score += 5;
  if (lower(fonctionnalite).includes("partiel")) score += 3;
  if (lower(foncOrgane).includes("non fonctionnel")) score += 3;
  if (lower(organe) === "non") score += 2;
  if (besoin) score += 3;
  if (hasProblem) score += 2;
  if (ph !== null && (ph < 6.5 || ph > 8.5)) score += 2;
  if (temperature !== null && temperature > 50) score += 2;
  if (latitude === null || longitude === null) score += 1;
  const priorite = score >= 8 ? "Élevée" : score >= 4 ? "Moyenne" : "Faible";
  return {
    id: asText(pick(row, "id", "ec5_uuid", "source_entry_id")),
    code_pe: asText(pick(row, "code_pe", "title", "ec5_uuid")),
    date_collecte: asText(pick(row, "date_collecte", "3_Date", "created_at")),
    commune: asText(pick(row, "commune", "6_Commune")) || "Non renseigné",
    village: asText(pick(row, "village", "7_Village")) || "Non renseigné",
    localite: asText(pick(row, "localite", "8_Localit_hameauQuar")),
    latitude,
    longitude,
    precision_gps: asNumber(pick(row, "precision_gps", "accuracy_10_Coordonnes_infras")),
    type_infrastructure: type || "Non renseigné",
    fonctionnalite_forage: fonctionnalite,
    statut_fonctionnalite: fonctionnalite,
    equipement,
    organe_gestion: organe || "Non renseigné",
    type_organe: asText(pick(row, "type_organe", "30_Type_dorgane")),
    fonctionnalite_organe: foncOrgane || "Non renseigné",
    niveau_eau: asNumber(pick(row, "niveau_eau", "35_Niveau_de_leau__N")),
    profondeur_ouvrage: asNumber(pick(row, "profondeur_ouvrage", "36_Profondeur_ouvrag", "profondeur")),
    temperature_c: temperature,
    ph,
    conductivite,
    turbidite_ntu: turbidite,
    tds,
    presence_odeur: asText(pick(row, "presence_odeur", "44_Prsence_dodeur")) || "Non renseigné",
    etat_apparent: asText(pick(row, "etat_apparent", "47_tat_apparent_de_l")),
    problemes: probleme,
    besoin_rehabilitation: besoin,
    recommandation: asText(pick(row, "recommandation", "53_Recommandation_pa")),
    score_priorite: score,
    priorite_rehabilitation: priorite,
    alerte_gps: latitude === null || longitude === null,
    alerte_temperature: temperature !== null && temperature > 50,
    alerte_ph: ph !== null && (ph < 6.5 || ph > 8.5),
    alerte_qualite_eau: (ph !== null && (ph < 6.5 || ph > 8.5)) || (temperature !== null && temperature > 50) || lower(pick(row, "presence_odeur", "44_Prsence_dodeur")).includes("oui"),
  };
}

function sanitize(row: Row) {
  return Object.fromEntries(Object.entries(row).filter(([k]) => !PRIVATE_FIELDS.has(k)));
}

function counts(rows: Row[], key: string) {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(asText(r[key]) || "Non renseigné", (map.get(asText(r[key]) || "Non renseigné") || 0) + 1));
  return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function avg(rows: Row[], key: string) {
  const nums = rows.map((r) => asNumber(r[key])).filter((n): n is number => n !== null);
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

async function readRows() {
  if (hasSupabaseAdminEnv()) {
    try {
      const { data, error } = await supabaseAdmin.from("v_points_eau_dashboard").select("*").limit(10000);
      if (!error && data && data.length) return { rows: data.map(normalize), source: "Supabase v_points_eau_dashboard" };
    } catch {}
  }
  return { rows: (pointsEauInventaire as Row[]).map(normalize), source: "CSV local V2_3" };
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  let { rows, source } = await readRows();
  const filters = ["commune", "village", "type_infrastructure", "statut_fonctionnalite", "equipement", "organe_gestion", "priorite_rehabilitation"];
  for (const f of filters) {
    const v = params.get(f);
    if (v && v !== "all") rows = rows.filter((r) => asText(r[f]) === v);
  }
  rows = rows.map(sanitize);
  const total = rows.length;
  const fonctionnels = rows.filter((r) => lower(r.statut_fonctionnalite).includes("fonctionnel") && !lower(r.statut_fonctionnalite).includes("non")).length;
  const nonFonctionnels = rows.filter((r) => lower(r.statut_fonctionnalite).includes("non fonctionnel")).length;
  const aRehabiliter = rows.filter((r) => r.besoin_rehabilitation || r.priorite_rehabilitation === "Élevée").length;
  const sansGps = rows.filter((r) => r.alerte_gps).length;
  const alertesQualite = rows.filter((r) => r.alerte_qualite_eau).length;
  return NextResponse.json({
    ok: true,
    source,
    stats: {
      total,
      forages: rows.filter((r) => lower(r.type_infrastructure).includes("forage")).length,
      puits: rows.filter((r) => lower(r.type_infrastructure).includes("puits")).length,
      fonctionnels,
      non_fonctionnels: nonFonctionnels,
      taux_fonctionnalite: total ? Math.round((fonctionnels / Math.max(1, total - rows.filter((r) => lower(r.statut_fonctionnalite).includes("non renseigne")).length)) * 100) : 0,
      a_rehabiliter: aRehabiliter,
      sans_gps: sansGps,
      communes: new Set(rows.map((r) => r.commune)).size,
      villages: new Set(rows.map((r) => r.village)).size,
      alertes_qualite: alertesQualite,
      ph_moyen: avg(rows, "ph"),
      conductivite_moyenne: avg(rows, "conductivite"),
      tds_moyen: avg(rows, "tds"),
    },
    charts: {
      communes: counts(rows, "commune"),
      fonctionnalite: counts(rows, "statut_fonctionnalite"),
      equipements: counts(rows, "equipement"),
      organes: counts(rows, "organe_gestion"),
      priorites: counts(rows, "priorite_rehabilitation"),
      odeur: counts(rows, "presence_odeur"),
    },
    filters: {
      communes: counts((await readRows()).rows, "commune").map((x) => x.label),
      villages: counts((await readRows()).rows, "village").map((x) => x.label),
      types: counts((await readRows()).rows, "type_infrastructure").map((x) => x.label),
      fonctionnalites: counts((await readRows()).rows, "statut_fonctionnalite").map((x) => x.label),
      equipements: counts((await readRows()).rows, "equipement").map((x) => x.label),
      organes: counts((await readRows()).rows, "organe_gestion").map((x) => x.label),
      priorites: counts((await readRows()).rows, "priorite_rehabilitation").map((x) => x.label),
    },
    data: rows.slice(0, 1000),
  });
}
