-- PSORE V2_4 — migration complète et réexécutable
-- À exécuter dans Supabase SQL Editor avant le premier /api/admin/bootstrap.

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  nom_role text unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.profils (
  id uuid primary key,
  nom text,
  prenom text,
  email text unique not null,
  telephone text,
  role_id uuid references public.roles(id),
  actif boolean default true,
  created_at timestamptz default now()
);

alter table public.roles add column if not exists nom_role text;
alter table public.roles add column if not exists description text;
alter table public.roles add column if not exists created_at timestamptz default now();
alter table public.profils add column if not exists nom text;
alter table public.profils add column if not exists prenom text;
alter table public.profils add column if not exists email text;
alter table public.profils add column if not exists telephone text;
alter table public.profils add column if not exists role_id uuid references public.roles(id);
alter table public.profils add column if not exists actif boolean default true;
alter table public.profils add column if not exists created_at timestamptz default now();

create unique index if not exists roles_nom_role_key on public.roles(nom_role);
create unique index if not exists profils_email_key on public.profils(email);

insert into public.roles (nom_role, description) values
('Super administrateur','Accès total : administration, utilisateurs, sécurité et paramétrage'),
('Administrateur PTCS','Gestion complète de la plateforme'),
('DNH/DRHK','Consultation, validation et export'),
('Collecteur','Collecte, synchronisation terrain et mise à jour autorisée'),
('Observateur','Consultation simple des données autorisées'),
('Public','Accès limité')
on conflict (nom_role) do update set description = excluded.description;

create table if not exists public.configuration (
  id uuid primary key default gen_random_uuid(),
  cle text unique,
  valeur text
);

insert into public.configuration (cle, valeur) values
('version_psore','V2_4'),
('nom_plateforme','PSORE – Plateforme de Suivi et d’Observation des Ressources en Eau'),
('organisation','PTCS – Enabel – DNH/DRHK'),
('domaine','eau-ptcs-mali.org')
on conflict (cle) do update set valeur = excluded.valeur;

create table if not exists public.regions (id uuid primary key default gen_random_uuid(), nom text unique not null);
create table if not exists public.cercles (id uuid primary key default gen_random_uuid(), region_id uuid references public.regions(id), nom text not null);
create table if not exists public.communes (id uuid primary key default gen_random_uuid(), cercle_id uuid references public.cercles(id), nom text not null);

insert into public.regions (nom) values ('Koulikoro') on conflict (nom) do nothing;

create table if not exists public.stations_pluvio (id uuid primary key default gen_random_uuid(), code_station text unique, nom_station text, commune_id uuid references public.communes(id), latitude numeric, longitude numeric, geom geography(Point,4326), altitude numeric, actif boolean default true, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.observations_pluvio (id uuid primary key default gen_random_uuid(), station_id uuid references public.stations_pluvio(id), date_observation date, pluie_24h_mm numeric, cumul_mensuel_mm numeric, observateur text, photo_url text, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.piezometres (id uuid primary key default gen_random_uuid(), code_piezo text unique, commune_id uuid references public.communes(id), latitude numeric, longitude numeric, geom geography(Point,4326), profondeur numeric, aquifere text, actif boolean default true, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.observations_piezo (id uuid primary key default gen_random_uuid(), piezometre_id uuid references public.piezometres(id), date_observation date, niveau_statique numeric, observateur text, commentaire text, photo_url text, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.stations_limni (id uuid primary key default gen_random_uuid(), code_station text unique, cours_eau text, commune_id uuid references public.communes(id), latitude numeric, longitude numeric, geom geography(Point,4326), actif boolean default true, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.observations_limni (id uuid primary key default gen_random_uuid(), station_id uuid references public.stations_limni(id), date_observation date, periode text, hauteur_eau numeric, commentaire text, photo_url text, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.points_eau (id uuid primary key default gen_random_uuid(), code_pe text unique, type_ouvrage text, commune_id uuid references public.communes(id), latitude numeric, longitude numeric, geom geography(Point,4326), profondeur numeric, etat text, source_entry_id text unique, synced_at timestamptz);
create table if not exists public.controles_points_eau (id uuid primary key default gen_random_uuid(), point_eau_id uuid references public.points_eau(id), date_visite date, fonctionnalite text, panne text, qualite_eau text, commentaire text, photo_url text, source_entry_id text unique, synced_at timestamptz);

alter table public.points_eau add column if not exists commune text;
alter table public.points_eau add column if not exists village text;
alter table public.points_eau add column if not exists localite text;
alter table public.points_eau add column if not exists precision_gps numeric;
alter table public.points_eau add column if not exists photo_infrastructure text;
alter table public.points_eau add column if not exists photo_emprise text;
alter table public.points_eau add column if not exists type_infrastructure text;
alter table public.points_eau add column if not exists type_puits text;
alter table public.points_eau add column if not exists equipement_puits text;
alter table public.points_eau add column if not exists type_forage text;
alter table public.points_eau add column if not exists fonctionnalite_forage text;
alter table public.points_eau add column if not exists equipement_forage text;
alter table public.points_eau add column if not exists organe_gestion text;
alter table public.points_eau add column if not exists type_organe text;
alter table public.points_eau add column if not exists fonctionnalite_organe text;
alter table public.points_eau add column if not exists niveau_eau numeric;
alter table public.points_eau add column if not exists profondeur_ouvrage numeric;
alter table public.points_eau add column if not exists temperature_c numeric;
alter table public.points_eau add column if not exists ph numeric;
alter table public.points_eau add column if not exists conductivite numeric;
alter table public.points_eau add column if not exists turbidite_ntu numeric;
alter table public.points_eau add column if not exists tds numeric;
alter table public.points_eau add column if not exists presence_odeur text;
alter table public.points_eau add column if not exists etat_apparent text;
alter table public.points_eau add column if not exists problemes text;
alter table public.points_eau add column if not exists besoin_rehabilitation text;
alter table public.points_eau add column if not exists nom_repondant text;
alter table public.points_eau add column if not exists contact_repondant text;
alter table public.points_eau add column if not exists recommandation text;

create table if not exists public.epicollect_sources (id uuid primary key default gen_random_uuid(), module text not null, type_source text not null, libelle text not null, project_slug text not null, api_url text not null, form_url text not null, actif boolean default true, created_at timestamptz default now(), unique(module,type_source));
create table if not exists public.sync_log (id uuid primary key default gen_random_uuid(), module text, source text, nb_enregistrements integer, statut text, message text, date_sync timestamptz default now());
create table if not exists public.alertes (id uuid primary key default gen_random_uuid(), module text, niveau text, message text, statut text default 'ouverte', created_at timestamptz default now());

insert into public.epicollect_sources (module,type_source,libelle,project_slug,api_url,form_url) values
('pluviometrie','stations','Référentiel des pluviomètres','suivi-pluviometrique-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a047a461c0c4','https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs'),
('pluviometrie','releves','Relevés pluviométriques','suivi-pluviometrique-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a05a7178bf71','https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs'),
('piezometrie','referentiel','Référentiel piézomètres','suivi-piezo-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a047a461c0c4','https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs'),
('piezometrie','mesures','Mesures piézométriques','suivi-piezo-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a05a7178bf71','https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs'),
('limnimetrie','stations','Stations limnimétriques','suivi-limnimetrique-ce-koulikoro','https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a047a461c0c4','https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro'),
('limnimetrie','lectures','Lectures limnimétriques','suivi-limnimetrique-ce-koulikoro','https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a05a7178bf71','https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro'),
('points_eau','inventaire','Inventaire points d’eau','etat-des-lieux-pe-ptcs','https://five.epicollect.net/api/export/entries/etat-des-lieux-pe-ptcs?form_ref=9365afaa5ef642ffb8ed24b8b51bf93a_5db097aea78d5','https://five.epicollect.net/project/etat-des-lieux-pe-ptcs')
on conflict (module,type_source) do update set libelle=excluded.libelle, api_url=excluded.api_url, form_url=excluded.form_url, actif=true;
