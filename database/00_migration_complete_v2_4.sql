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

-- Lot 3 — Synchronisation Epicollect5 complète
alter table public.sync_log add column if not exists fetched_count integer default 0;
alter table public.sync_log add column if not exists mapped_count integer default 0;
alter table public.sync_log add column if not exists skipped_count integer default 0;
alter table public.sync_log add column if not exists upserted_count integer default 0;
alter table public.sync_log add column if not exists page_count integer default 0;
alter table public.sync_log add column if not exists duration_ms integer default 0;
alter table public.sync_log add column if not exists api_url text;
alter table public.sync_log add column if not exists started_at timestamptz;
alter table public.sync_log add column if not exists finished_at timestamptz;

create index if not exists sync_log_module_date_idx on public.sync_log(module, date_sync desc);
create index if not exists epicollect_sources_module_type_idx on public.epicollect_sources(module, type_source);

-- Réapplique les URLs validées des 4 fiches Epicollect5.
insert into public.epicollect_sources (module,type_source,libelle,project_slug,api_url,form_url,actif) values
('pluviometrie','stations','Référentiel des pluviomètres','suivi-pluviometrique-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a047a461c0c4','https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs',true),
('pluviometrie','releves','Relevés pluviométriques','suivi-pluviometrique-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-pluviometrique-koulikoro-ptcs?form_ref=b08ac6bb9fcc46229ca70b7442315ff9_6a05a7178bf71','https://five.epicollect.net/project/suivi-pluviometrique-koulikoro-ptcs',true),
('piezometrie','referentiel','Référentiel piézomètres','suivi-piezo-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a047a461c0c4','https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs',true),
('piezometrie','mesures','Mesures piézométriques','suivi-piezo-koulikoro-ptcs','https://five.epicollect.net/api/export/entries/suivi-piezo-koulikoro-ptcs?form_ref=6144ed6ab3d646baa82de06e13b4f051_6a05a7178bf71','https://five.epicollect.net/project/suivi-piezo-koulikoro-ptcs',true),
('limnimetrie','stations','Stations limnimétriques','suivi-limnimetrique-ce-koulikoro','https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a047a461c0c4','https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro',true),
('limnimetrie','lectures','Lectures limnimétriques','suivi-limnimetrique-ce-koulikoro','https://five.epicollect.net/api/export/entries/suivi-limnimetrique-ce-koulikoro?form_ref=bd5f4213890945cfb0d4976cd8768332_6a05a7178bf71','https://five.epicollect.net/project/suivi-limnimetrique-ce-koulikoro',true),
('points_eau','inventaire','Inventaire points d’eau','etat-des-lieux-pe-ptcs','https://five.epicollect.net/api/export/entries/etat-des-lieux-pe-ptcs?form_ref=9365afaa5ef642ffb8ed24b8b51bf93a_5db097aea78d5','https://five.epicollect.net/project/etat-des-lieux-pe-ptcs',true)
on conflict (module,type_source) do update set
  libelle = excluded.libelle,
  project_slug = excluded.project_slug,
  api_url = excluded.api_url,
  form_url = excluded.form_url,
  actif = true;

-- PSORE V2_4 LOT4 — colonnes complémentaires du module Points d'eau
alter table public.points_eau add column if not exists created_at_source timestamptz;
alter table public.points_eau add column if not exists uploaded_at_source timestamptz;
alter table public.points_eau add column if not exists titre_source text;
alter table public.points_eau add column if not exists utm_northing numeric;
alter table public.points_eau add column if not exists utm_easting numeric;
alter table public.points_eau add column if not exists utm_zone text;
alter table public.points_eau add column if not exists date_realisation_puits text;
alter table public.points_eau add column if not exists hauteur_margelle numeric;
alter table public.points_eau add column if not exists diametre_cm numeric;
alter table public.points_eau add column if not exists commentaire_puits text;
alter table public.points_eau add column if not exists date_realisation_forage text;
alter table public.points_eau add column if not exists nombre_total_bornes numeric;
alter table public.points_eau add column if not exists nombre_bornes_fonctionnelles numeric;
alter table public.points_eau add column if not exists commentaire_gestion text;
alter table public.points_eau add column if not exists date_mesure date;
alter table public.points_eau add column if not exists commentaire_mesure text;
alter table public.points_eau add column if not exists commentaire_qualite text;
create index if not exists idx_points_eau_commune on public.points_eau(commune);
create index if not exists idx_points_eau_village on public.points_eau(village);
create index if not exists idx_points_eau_type on public.points_eau(type_infrastructure);
create index if not exists idx_points_eau_fonctionnalite on public.points_eau(fonctionnalite_forage);
create index if not exists idx_points_eau_gps on public.points_eau(latitude, longitude);
create or replace view dashboard_global as
select
  (select count(*) from stations_pluvio) as stations_pluvio,
  (select count(*) from observations_pluvio) as observations_pluvio,
  (select count(*) from piezometres) as piezometres,
  (select count(*) from observations_piezo) as observations_piezo,
  (select count(*) from stations_limni) as stations_limni,
  (select count(*) from observations_limni) as observations_limni,
  (select count(*) from points_eau) as points_eau,
  (select count(*) from points_eau where lower(coalesce(type_infrastructure,type_ouvrage,'')) like '%forage%') as points_eau_forages,
  (select count(*) from points_eau where lower(coalesce(type_infrastructure,type_ouvrage,'')) like '%puits%') as points_eau_puits,
  (select count(*) from points_eau where lower(coalesce(fonctionnalite_forage,etat,'')) like '%non fonctionnel%') as points_eau_non_fonctionnels,
  (select count(*) from points_eau where latitude is null or longitude is null) as points_eau_sans_gps;

create or replace view v_points_eau_dashboard as
select
  id,
  source_entry_id,
  synced_at,
  coalesce(code_pe, titre_source, source_entry_id) as code_pe,
  created_at_source,
  uploaded_at_source,
  titre_source,
  enqueteur_initial,
  date_collecte,
  heure_collecte,
  coalesce(commune, c.nom) as commune,
  village,
  localite,
  latitude,
  longitude,
  precision_gps,
  utm_northing,
  utm_easting,
  utm_zone,
  photo_infrastructure,
  photo_emprise,
  coalesce(type_infrastructure, type_ouvrage) as type_infrastructure,
  type_puits,
  equipement_puits,
  date_realisation_puits,
  hauteur_margelle,
  diametre_cm,
  commentaire_puits,
  type_forage,
  coalesce(fonctionnalite_forage, etat, 'Non renseigné') as fonctionnalite_forage,
  case
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%non fonctionnel%' then 'Non fonctionnel'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%abandon%' then 'Abandonné'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%partiel%' then 'Fonctionnalité partielle'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%fonctionnel%' then 'Fonctionnel'
    else 'Non renseigné'
  end as statut_fonctionnalite,
  coalesce(equipement_forage, equipement_puits, 'Non renseigné') as equipement,
  equipement_forage,
  date_realisation_forage,
  nombre_total_bornes,
  nombre_bornes_fonctionnelles,
  coalesce(organe_gestion, 'Non renseigné') as organe_gestion,
  type_organe,
  coalesce(fonctionnalite_organe, 'Non renseigné') as fonctionnalite_organe,
  commentaire_gestion,
  date_mesure,
  niveau_eau,
  coalesce(profondeur_ouvrage, profondeur) as profondeur_ouvrage,
  commentaire_mesure,
  temperature_c,
  ph,
  conductivite,
  turbidite_ntu,
  tds,
  coalesce(presence_odeur, 'Non renseigné') as presence_odeur,
  commentaire_qualite,
  etat_apparent,
  problemes,
  besoin_rehabilitation,
  recommandation,
  (
    case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%non fonctionnel%' or lower(coalesce(fonctionnalite_forage, etat, '')) like '%abandon%' then 5 else 0 end +
    case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%partiel%' then 3 else 0 end +
    case when lower(coalesce(fonctionnalite_organe, '')) like '%non fonctionnel%' then 3 else 0 end +
    case when lower(coalesce(organe_gestion, '')) = 'non' then 2 else 0 end +
    case when besoin_rehabilitation is not null and besoin_rehabilitation <> '' then 3 else 0 end +
    case when problemes is not null and lower(problemes) not in ('ras','aucun','néant','neant') then 2 else 0 end +
    case when ph is not null and (ph < 6.5 or ph > 8.5) then 2 else 0 end +
    case when temperature_c is not null and temperature_c > 50 then 2 else 0 end +
    case when latitude is null or longitude is null then 1 else 0 end
  ) as score_priorite,
  case
    when (
      case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%non fonctionnel%' or lower(coalesce(fonctionnalite_forage, etat, '')) like '%abandon%' then 5 else 0 end +
      case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%partiel%' then 3 else 0 end +
      case when lower(coalesce(fonctionnalite_organe, '')) like '%non fonctionnel%' then 3 else 0 end +
      case when lower(coalesce(organe_gestion, '')) = 'non' then 2 else 0 end +
      case when besoin_rehabilitation is not null and besoin_rehabilitation <> '' then 3 else 0 end +
      case when problemes is not null and lower(problemes) not in ('ras','aucun','néant','neant') then 2 else 0 end +
      case when ph is not null and (ph < 6.5 or ph > 8.5) then 2 else 0 end +
      case when temperature_c is not null and temperature_c > 50 then 2 else 0 end +
      case when latitude is null or longitude is null then 1 else 0 end
    ) >= 8 then 'Élevée'
    when (
      case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%non fonctionnel%' or lower(coalesce(fonctionnalite_forage, etat, '')) like '%abandon%' then 5 else 0 end +
      case when lower(coalesce(fonctionnalite_forage, etat, '')) like '%partiel%' then 3 else 0 end +
      case when lower(coalesce(fonctionnalite_organe, '')) like '%non fonctionnel%' then 3 else 0 end +
      case when lower(coalesce(organe_gestion, '')) = 'non' then 2 else 0 end +
      case when besoin_rehabilitation is not null and besoin_rehabilitation <> '' then 3 else 0 end +
      case when problemes is not null and lower(problemes) not in ('ras','aucun','néant','neant') then 2 else 0 end +
      case when ph is not null and (ph < 6.5 or ph > 8.5) then 2 else 0 end +
      case when temperature_c is not null and temperature_c > 50 then 2 else 0 end +
      case when latitude is null or longitude is null then 1 else 0 end
    ) >= 4 then 'Moyenne'
    else 'Faible'
  end as priorite_rehabilitation,
  (latitude is null or longitude is null) as alerte_gps,
  (temperature_c is not null and temperature_c > 50) as alerte_temperature,
  (ph is not null and (ph < 6.5 or ph > 8.5)) as alerte_ph,
  ((ph is not null and (ph < 6.5 or ph > 8.5)) or (temperature_c is not null and temperature_c > 50) or lower(coalesce(presence_odeur,'')) like '%oui%') as alerte_qualite_eau,
  case
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%non fonctionnel%' then '#dc2626'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%abandon%' then '#111827'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%partiel%' then '#f97316'
    when lower(coalesce(fonctionnalite_forage, etat, '')) like '%fonctionnel%' then '#16a34a'
    else '#64748b'
  end as couleur_statut
from points_eau pe
left join communes c on pe.commune_id = c.id;

create or replace view v_pluviometrie_dashboard as
select
  o.id,
  o.date_observation,
  s.code_station as code_site,
  s.nom_station as nom_site,
  c.nom as commune,
  s.latitude,
  s.longitude,
  o.pluie_24h_mm as valeur_observee,
  o.pluie_24h_mm,
  o.cumul_mensuel_mm,
  o.observateur,
  o.photo_url,
  o.synced_at,
  case when o.pluie_24h_mm is null or o.pluie_24h_mm < 0 or o.pluie_24h_mm > 300 then true else false end as alerte_valeur,
  case when s.latitude is null or s.longitude is null then true else false end as alerte_gps
from observations_pluvio o
left join stations_pluvio s on o.station_id = s.id
left join communes c on s.commune_id = c.id;

create or replace view v_piezometrie_dashboard as
select
  o.id,
  o.date_observation,
  p.code_piezo as code_site,
  p.code_piezo as nom_site,
  c.nom as commune,
  p.latitude,
  p.longitude,
  o.niveau_statique as valeur_observee,
  o.niveau_statique,
  p.profondeur,
  p.aquifere,
  o.observateur,
  o.commentaire,
  o.photo_url,
  o.synced_at,
  case when o.niveau_statique is null or o.niveau_statique < 0 or (p.profondeur is not null and o.niveau_statique > p.profondeur) then true else false end as alerte_valeur,
  case when p.latitude is null or p.longitude is null then true else false end as alerte_gps
from observations_piezo o
left join piezometres p on o.piezometre_id = p.id
left join communes c on p.commune_id = c.id;

create or replace view v_limnimetrie_dashboard as
select
  o.id,
  o.date_observation,
  s.code_station as code_site,
  s.cours_eau as nom_site,
  c.nom as commune,
  s.latitude,
  s.longitude,
  o.hauteur_eau as valeur_observee,
  o.hauteur_eau,
  o.periode,
  o.commentaire,
  o.photo_url,
  o.synced_at,
  case when o.hauteur_eau is null or o.hauteur_eau < 0 then true else false end as alerte_valeur,
  case when s.latitude is null or s.longitude is null then true else false end as alerte_gps
from observations_limni o
left join stations_limni s on o.station_id = s.id
left join communes c on s.commune_id = c.id;

create or replace view v_carte_points as
select 'pluviometrie' as module, code_station as code, nom_station as libelle, latitude, longitude, synced_at, null::text as statut_fonctionnalite, null::text as type_infrastructure, null::text as commune, null::text as village, null::text as priorite_rehabilitation, null::text as equipement, null::text as organe_gestion, null::numeric as ph, null::numeric as conductivite, null::numeric as tds, false as alerte_qualite_eau, false as alerte_gps, '#7C3AED'::text as couleur from stations_pluvio where latitude is not null and longitude is not null
union all select 'piezometrie', code_piezo, code_piezo, latitude, longitude, synced_at, null, null, null, null, null, null, null, null, null, null, false, false, '#48CAE4' from piezometres where latitude is not null and longitude is not null
union all select 'limnimetrie', code_station, cours_eau, latitude, longitude, synced_at, null, null, null, null, null, null, null, null, null, null, false, false, '#16A34A' from stations_limni where latitude is not null and longitude is not null
union all select 'points_eau', code_pe, coalesce(localite, village, type_infrastructure), latitude, longitude, synced_at, statut_fonctionnalite, type_infrastructure, commune, village, priorite_rehabilitation, equipement, organe_gestion, ph, conductivite, tds, alerte_qualite_eau, alerte_gps, '#0077B6' from v_points_eau_dashboard where latitude is not null and longitude is not null;
