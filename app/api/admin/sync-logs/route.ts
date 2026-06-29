export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
export async function GET(){const {data,error}=await supabaseAdmin.from("sync_log").select("*").order("date_sync",{ascending:false}).limit(100);if(error)return NextResponse.json({ok:false,error:error.message},{status:500});return NextResponse.json({ok:true,data:data||[]});}
