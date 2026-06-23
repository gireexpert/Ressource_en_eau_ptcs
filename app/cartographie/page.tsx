export const dynamic = "force-dynamic";
import DashboardShell from "@/components/DashboardShell";
import LeafletMap from "@/components/map/LeafletMap";

export default function Page() {
  return (
    <DashboardShell title="Cartographie générale" subtitle="OpenStreetMap, satellite, limites administratives et couches thématiques PSORE">
      <div className="panel">
        <h2>Carte dynamique PSORE — V2_3</h2>
        <p className="muted">Couches : pluviométrie, piézométrie, limnimétrie et points d’eau. Pour les points d’eau : type, fonctionnalité, réhabilitation, équipement, organe de gestion, qualité de l’eau et qualité des données.</p>
        <LeafletMap />
      </div>
    </DashboardShell>
  );
}
