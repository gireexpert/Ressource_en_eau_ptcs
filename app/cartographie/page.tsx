export const dynamic = "force-dynamic";
import DashboardShell from "@/components/DashboardShell";
import LeafletMap from "@/components/map/LeafletMap";

export default function Page() {
  return (
    <DashboardShell title="Cartographie générale" subtitle="Carte publique limitée et détails complets après connexion autorisée">
      <div className="panel">
        <h2>Cartographie du dispositif PTCS</h2>
        <p className="muted">Par défaut, seuls les points d’eau sont affichés. Utilisez les filtres dynamiques pour afficher ou masquer les piézomètres, limnimètres, pluviomètres et points d’eau. Les détails publics sont limités à l’emplacement et au type d’ouvrage.</p>
        <LeafletMap />
      </div>
    </DashboardShell>
  );
}
