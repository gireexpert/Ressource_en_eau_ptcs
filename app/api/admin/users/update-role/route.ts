export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
export async function POST(req:NextRequest){const {user_id,role_id,actif}=await req.json();if(!user_id||!role_id)return NextResponse.json({ok:false,error:"user_id et role_id requis"},{status:400});const {error}=await supabaseAdmin.from("profils").update({role_id,actif:actif!==false}).eq("id",user_id);if(error)return NextResponse.json({ok:false,error:error.message},{status:500});return NextResponse.json({ok:true});}
