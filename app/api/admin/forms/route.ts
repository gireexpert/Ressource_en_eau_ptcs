export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const fallback = [
  {module:"pluviometrie",type_source:"stations",libelle:"Référentiel des pluviomètres",form_url:"https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs"},
  {module:"pluviometrie",type_source:"releves",libelle:"Relevés pluviométriques",form_url:"https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs"},
  {module:"piezometrie",type_source:"referentiel",libelle:"Référentiel piézomètres",form_url:"https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs"},
  {module:"piezometrie",type_source:"mesures",libelle:"Mesures piézométriques",form_url:"https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs"},
  {module:"limnimetrie",type_source:"stations",libelle:"Stations limnimétriques",form_url:"https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro"},
  {module:"limnimetrie",type_source:"lectures",libelle:"Lectures limnimétriques",form_url:"https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro"},
  {module:"points_eau",type_source:"inventaire",libelle:"Inventaire points d’eau",form_url:"https://five.epicollect.net/project/etat-des-lieux-pe-ptcs"}
];

export async function GET() {
  const { data, error } = await supabaseAdmin.from("epicollect_sources").select("*").order("module");
  if (error || !data?.length) return NextResponse.json({ ok:true, data:fallback, source:"fallback" });
  return NextResponse.json({ ok:true, data, source:"supabase" });
}
