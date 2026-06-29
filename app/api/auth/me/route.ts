export const dynamic="force-dynamic";export const revalidate=0;export const fetchCache="force-no-store";
import {NextRequest,NextResponse} from "next/server";import {supabaseAdmin} from "@/lib/supabase-admin";
function roleName(profil:any){const r=profil?.roles;return Array.isArray(r)?r[0]?.nom_role:r?.nom_role;}
export async function GET(req:NextRequest){
  const token=(req.headers.get("authorization")||"").replace("Bearer ","");
  if(!token)return NextResponse.json({ok:false,role:"Public"});
  const {data,error}=await supabaseAdmin.auth.getUser(token);
  if(error||!data.user)return NextResponse.json({ok:false,role:"Public"});
  const email=data.user.email||"";
  const {data:profil}=await supabaseAdmin.from("profils").select("id,email,nom,prenom,actif,roles(nom_role)").eq("id",data.user.id).maybeSingle();
  let role=roleName(profil)||"Public";
  if((!profil || role==="Public") && email.toLowerCase()===(process.env.ADMIN_EMAIL||"gireexpert@gmail.com").toLowerCase()){
    const {data:roleRow}=await supabaseAdmin.from("roles").select("id,nom_role").eq("nom_role","Super administrateur").maybeSingle();
    if(roleRow?.id){
      await supabaseAdmin.from("profils").upsert({id:data.user.id,email,role_id:roleRow.id,actif:true},{onConflict:"id"});
      role=roleRow.nom_role;
    }
  }
  return NextResponse.json({ok:true,user:{id:data.user.id,email},profil,role});
}
