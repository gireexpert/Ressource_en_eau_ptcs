# PSORE V1.1 consolidée

Cette version intègre les arbitrages validés :
- OpenStreetMap + satellite ;
- couches administratives Mali/Koulikoro ;
- points Epicollect dynamiques ;
- état vide clair avant enquête ;
- rapports globaux et par module ;
- exports PDF, Word, Excel, CSV ;
- rôles et droits consolidés ;
- création d’utilisateurs par invitation email ;
- synchronisation automatique toutes les 6 heures ;
- page publique avec statistiques agrégées ;
- alertes visuelles et préparation email.

## Scripts Supabase à exécuter

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/rls.sql`
4. `database/views.sql`
5. `database/alerts.sql`

## Tests

- `/api/health`
- `/api/admin/bootstrap`
- `/api/sync/all`
- `/api/cron/sync`
- `/api/alerts/check`
- `/cartographie`
- `/rapports`
- `/observatoire`
- `/admin/roles`

## PSORE V2_3 — Points d’eau et cartographie thématique

Cette version ajoute :

- un dashboard dynamique Points d’eau (`/points-eau`) ;
- une cartographie thématique enrichie (`/cartographie`) ;
- les exports CSV et Excel ;
- les vues SQL `v_points_eau_dashboard`, `v_pluviometrie_dashboard`, `v_piezometrie_dashboard`, `v_limnimetrie_dashboard` ;
- un fichier CSV local anonymisé de secours : `public/data/points-eau-inventaire.csv`.

Build vérifié :

```bash
npm install
npm run build
```
