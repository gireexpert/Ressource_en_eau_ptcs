export const dynamic="force-dynamic";export const revalidate=0;export const fetchCache="force-no-store";
import {NextRequest,NextResponse} from "next/server";import {supabaseAdmin} from "@/lib/supabase-admin";

export async function POST(req:NextRequest){
  const{email,role_id,nom,prenom,password,mode}=await req.json();
  if(!email||!role_id)return NextResponse.json({ok:false,error:"email et rôle requis"},{status:400});
  let userId="";
  if(mode==="invite"){
    const redirectTo=`${process.env.NEXT_PUBLIC_APP_URL||req.nextUrl.origin}/login`;
    const invited=await supabaseAdmin.auth.admin.inviteUserByEmail(email,{redirectTo});
    if(invited.error)return NextResponse.json({ok:false,error:invited.error.message},{status:500});
    userId=invited.data.user?.id||"";
  } else {
    if(!password || String(password).length<8)return NextResponse.json({ok:false,error:"Mot de passe requis : minimum 8 caractères."},{status:400});
    const created=await supabaseAdmin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nom:nom||"",prenom:prenom||""}});
    if(created.error && !created.error.message.toLowerCase().includes("already"))return NextResponse.json({ok:false,error:created.error.message},{status:500});
    if(created.data.user?.id) userId=created.data.user.id;
    if(!userId){const {data:liste}=await supabaseAdmin.auth.admin.listUsers();userId=liste?.users?.find((u:any)=>u.email===email)?.id||"";}
    if(userId && created.error?.message.toLowerCase().includes("already")){
      const upd=await supabaseAdmin.auth.admin.updateUserById(userId,{password,email_confirm:true,user_metadata:{nom:nom||"",prenom:prenom||""}});
      if(upd.error)return NextResponse.json({ok:false,error:upd.error.message},{status:500});
    }
  }
  if(userId){const{error}=await supabaseAdmin.from("profils").upsert({id:userId,email,nom:nom||null,prenom:prenom||null,role_id,actif:true},{onConflict:"id"});if(error)return NextResponse.json({ok:false,error:error.message},{status:500})}
  return NextResponse.json({ok:true,message:mode==="invite"?"Invitation envoyée.":"Utilisateur créé/confirmé. Communiquez le mot de passe de manière sécurisée."})
}
