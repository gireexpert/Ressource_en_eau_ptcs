export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";import { supabaseAdmin } from "@/lib/supabase-admin";
async function countRows(table:string){const {count}=await supabaseAdmin.from(table).select("*",{count:"exact",head:true});return count||0;}
export async function GET(){const data={stations_pluvio:await countRows("stations_pluvio"),observations_pluvio:await countRows("observations_pluvio"),piezometres:await countRows("piezometres"),observations_piezo:await countRows("observations_piezo"),stations_limni:await countRows("stations_limni"),observations_limni:await countRows("observations_limni"),points_eau:await countRows("points_eau")};return NextResponse.json({ok:true,data});}
