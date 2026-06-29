export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

const REQUIRED_ROLES = [
  { nom_role: "Super administrateur", description: "Accès total : administration, utilisateurs, sécurité et paramétrage" },
  { nom_role: "Administrateur PTCS", description: "Gestion complète de la plateforme" },
  { nom_role: "DNH/DRHK", description: "Consultation, validation et export" },
  { nom_role: "Collecteur", description: "Consultation autorisée et appui terrain" },
  { nom_role: "Observateur", description: "Consultation simple des données autorisées" },
  { nom_role: "Public", description: "Accès limité" },
];

function errorJson(error: string, status = 500, details?: unknown) {
  return NextResponse.json({ ok: false, error, details }, { status });
}

async function ensureRoles() {
  const { data, error } = await supabaseAdmin
    .from("roles")
    .upsert(REQUIRED_ROLES, { onConflict: "nom_role" })
    .select("id,nom_role,description");

  if (error) {
    throw new Error(
      `Impossible de créer/mettre à jour les rôles. Vérifiez que database/schema.sql a bien créé la table public.roles avec les colonnes id, nom_role, description. Détail : ${error.message}`
    );
  }

  const superRole = (data || []).find((r: any) => r.nom_role === "Super administrateur");
  if (superRole?.id) return superRole;

  const { data: fetched, error: fetchError } = await supabaseAdmin
    .from("roles")
    .select("id,nom_role")
    .eq("nom_role", "Super administrateur")
    .maybeSingle();

  if (fetchError || !fetched?.id) {
    throw new Error(`Rôle Super administrateur introuvable après initialisation. ${fetchError?.message || ""}`);
  }
  return fetched;
}

async function findAuthUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  return data?.users?.find((u: any) => String(u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

export async function GET(req: NextRequest) {
  const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
  if (bootstrapSecret && req.nextUrl.searchParams.get("secret") !== bootstrapSecret) {
    return errorJson("Secret bootstrap invalide.", 401);
  }

  if (!hasSupabaseAdminEnv()) {
    return errorJson(
      "Variables Supabase manquantes dans Vercel : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY.",
      500
    );
  }

  const email = process.env.ADMIN_EMAIL || "gireexpert@gmail.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return errorJson("ADMIN_PASSWORD manquant dans les variables Vercel.", 400);
  }
  if (String(password).length < 8) {
    return errorJson("ADMIN_PASSWORD doit contenir au moins 8 caractères.", 400);
  }

  try {
    const superRole = await ensureRoles();

    let adminUser = await findAuthUserByEmail(email);
    if (!adminUser) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "Super administrateur" },
      });
      if (created.error) throw new Error(created.error.message);
      adminUser = created.data.user;
    } else {
      const updated = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
        password,
        email_confirm: true,
        user_metadata: { ...(adminUser.user_metadata || {}), role: "Super administrateur" },
      });
      if (updated.error) throw new Error(updated.error.message);
      adminUser = updated.data.user || adminUser;
    }

    if (!adminUser?.id) throw new Error("Utilisateur administrateur introuvable après création/mise à jour.");

    const { error: profileError } = await supabaseAdmin.from("profils").upsert(
      {
        id: adminUser.id,
        email,
        role_id: superRole.id,
        actif: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      throw new Error(
        `Impossible de créer/mettre à jour le profil administrateur. Vérifiez que database/schema.sql a créé public.profils. Détail : ${profileError.message}`
      );
    }

    return NextResponse.json({
      ok: true,
      email,
      role: "Super administrateur",
      roles_initialises: REQUIRED_ROLES.map((r) => r.nom_role),
      message: "Super administrateur créé/confirmé, mot de passe synchronisé et rôle attribué.",
    });
  } catch (error: any) {
    return errorJson(error.message || "Erreur bootstrap inconnue.", 500);
  }
}
