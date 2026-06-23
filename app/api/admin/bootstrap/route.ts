export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
  if (bootstrapSecret && req.nextUrl.searchParams.get("secret") !== bootstrapSecret) {
    return NextResponse.json(
      { ok: false, error: "Secret bootstrap invalide." },
      { status: 401 }
    );
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Variables Supabase manquantes dans Vercel : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 }
    );
  }

  const email = process.env.ADMIN_EMAIL || "gireexpert@gmail.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD manquant dans les variables Vercel." },
      { status: 400 }
    );
  }

  const creation = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (
    creation.error &&
    !creation.error.message.toLowerCase().includes("already") &&
    !creation.error.message.toLowerCase().includes("registered") &&
    !creation.error.message.toLowerCase().includes("exists")
  ) {
    return NextResponse.json(
      { ok: false, error: creation.error.message },
      { status: 500 }
    );
  }

  const { data: listeUtilisateurs, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    return NextResponse.json(
      { ok: false, error: listError.message },
      { status: 500 }
    );
  }

  const adminUser = listeUtilisateurs?.users?.find(
    (u: any) => u.email === email
  );

  if (!adminUser) {
    return NextResponse.json(
      { ok: false, error: "Utilisateur administrateur introuvable." },
      { status: 500 }
    );
  }

  // Si le compte existait déjà, on force la mise à jour du mot de passe ADMIN_PASSWORD.
  // Cela évite l’erreur "Invalid login credentials" après changement des variables Vercel.
  const passwordUpdate = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
    password,
    email_confirm: true,
  });
  if (passwordUpdate.error) {
    return NextResponse.json(
      { ok: false, error: passwordUpdate.error.message },
      { status: 500 }
    );
  }

  const { data: role, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("nom_role", "Administrateur PTCS")
    .single();

  if (roleError || !role?.id) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Rôle Administrateur PTCS introuvable. Exécuter database/schema.sql puis database/seed.sql dans Supabase.",
        details: roleError?.message,
      },
      { status: 500 }
    );
  }

  const { error } = await supabaseAdmin.from("profils").upsert(
    {
      id: adminUser.id,
      email,
      role_id: role.id,
      actif: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    email,
    message: "Administrateur créé/confirmé et rôle attribué.",
  });
}
