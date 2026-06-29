export const dynamic = "force-dynamic";
import DashboardShell from "@/components/DashboardShell";
import Kpi from "@/components/Kpi";
import LeafletMap from "@/components/map/LeafletMap";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import { ROLE_ADMIN, ROLE_DNH, ROLE_SUPER_ADMIN } from "@/lib/permissions";

export default function Dashboard() {
  const stats: any = {};
  return (
    <RequireAuth allowedRoles={[ROLE_DNH, ROLE_ADMIN, ROLE_SUPER_ADMIN]}>
      <DashboardShell title="Dashboard global" subtitle="Vue synthétique du suivi des ressources en eau et de l’inventaire des points d’eau">
        <div className="grid-4">
          <Kpi label="Pluviomètres" value="10" hint="Réseau Koulikoro" />
          <Kpi label="Piézomètres" value="20" hint="Suivi journalier" />
          <Kpi label="Stations limnimétriques" value="--" hint="Matin / soir" />
          <Kpi label="Points d’eau" value={String(stats.total || "540")} hint="Inventaire V2_3" />
          <Kpi label="Forages" value={String(stats.forages || "--")} hint="Points d’eau" />
          <Kpi label="Puits" value={String(stats.puits || "--")} hint="Points d’eau" />
          <Kpi label="Non fonctionnels" value={String(stats.non_fonctionnels || "--")} hint="Priorité terrain" />
          <Kpi label="À réhabiliter" value={String(stats.a_rehabiliter || "--")} hint="Score prioritaire" />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="panel" style={{ gridColumn: "span 2" }}><h2>Carte générale PSORE</h2><LeafletMap /></div>
          <div className="panel"><h2>Accès rapides</h2><div className="quick-list"><Link href="/points-eau">🚰 Dashboard Points d’eau</Link><Link href="/cartographie">🗺️ Cartographie thématique</Link><Link href="/pluviometrie">🌧️ Pluviométrie</Link><Link href="/piezometrie">💧 Piézométrie</Link><Link href="/limnimetrie">🌊 Limnimétrie</Link><Link href="/mon-compte">👤 Mon compte</Link></div></div>
        </div>
        <div className="panel" style={{ marginTop: 18 }}><h2>Résumé Points d’eau</h2><table className="table"><tbody><tr><td>Communes couvertes</td><td>{stats.communes || "4"}</td></tr><tr><td>Villages couverts</td><td>{stats.villages || "116"}</td></tr><tr><td>Points sans GPS</td><td>{stats.sans_gps || "--"}</td></tr><tr><td>Alertes qualité eau</td><td>{stats.alertes_qualite || "--"}</td></tr></tbody></table></div>
      </DashboardShell>
    </RequireAuth>
  );
}
