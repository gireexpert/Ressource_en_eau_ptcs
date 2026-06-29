export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
export async function GET(){const {data,error}=await supabaseAdmin.from("profils").select("id,email,nom,prenom,telephone,actif,created_at,roles(nom_role)").order("created_at",{ascending:false});if(error)return NextResponse.json({ok:false,error:error.message},{status:500});const {data:roles}=await supabaseAdmin.from("roles").select("id,nom_role").order("nom_role");return NextResponse.json({ok:true,users:data||[],roles:roles||[]});}
