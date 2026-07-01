-- PSORE V2.4 — vérification finale
select 'roles' as objet, count(*) as total from public.roles
union all select 'profils', count(*) from public.profils
union all select 'epicollect_sources', count(*) from public.epicollect_sources
union all select 'sync_log', count(*) from public.sync_log
union all select 'points_eau', count(*) from public.points_eau
union all select 'piezometres', count(*) from public.piezometres
union all select 'stations_pluvio', count(*) from public.stations_pluvio
union all select 'stations_limni', count(*) from public.stations_limni
union all select 'observations_piezo', count(*) from public.observations_piezo
union all select 'observations_pluvio', count(*) from public.observations_pluvio
union all select 'observations_limni', count(*) from public.observations_limni;

select nom_role, description from public.roles order by nom_role;
select module, type_source, libelle, actif, api_url from public.epicollect_sources order by module, type_source;
select table_name from information_schema.views where table_schema='public' and table_name in ('dashboard_global','v_points_eau_dashboard','v_points_eau_public','v_points_eau_cartographie','v_pluviometrie_dashboard','v_piezometrie_dashboard','v_limnimetrie_dashboard','v_carte_points','v_dashboard_institutionnel_resume') order by table_name;
select schemaname, tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename, policyname;
