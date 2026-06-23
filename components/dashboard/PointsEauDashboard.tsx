"use client";

import { useEffect, useMemo, useState } from "react";
import Kpi from "@/components/Kpi";
import LeafletMap from "@/components/map/LeafletMap";
import MiniBarChart from "@/components/dashboard/MiniBarChart";

type Api = any;
const selectFields = [
  ["commune", "Commune"],
  ["village", "Village"],
  ["type_infrastructure", "Type"],
  ["statut_fonctionnalite", "Fonctionnalité"],
  ["equipement", "Équipement"],
  ["organe_gestion", "Organe de gestion"],
  ["priorite_rehabilitation", "Priorité"],
];
const filterMap: Record<string, string> = {
  commune: "communes",
  village: "villages",
  type_infrastructure: "types",
  statut_fonctionnalite: "fonctionnalites",
  equipement: "equipements",
  organe_gestion: "organes",
  priorite_rehabilitation: "priorites",
};
function val(v: any) { return v === null || v === undefined || v === "" ? "--" : String(v); }

export default function PointsEauDashboard() {
  const [json, setJson] = useState<Api | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && v !== "all" && p.set(k, v));
    return p.toString();
  }, [filters]);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/points-eau${qs ? `?${qs}` : ""}`).then((r) => r.json()).then(setJson).finally(() => setLoading(false));
  }, [qs]);
  const stats = json?.stats || {};
  const data = json?.data || [];
  return (
    <>
      <div className="filters-panel panel">
        <div>
          <h2>Filtres dynamiques</h2>
          <p className="muted">Les données privées sont masquées dans l’interface publique. Source : {json?.source || "chargement"}</p>
        </div>
        <div className="filters-grid">
          {selectFields.map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <select className="input" value={filters[key] || "all"} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}>
                <option value="all">Tous</option>
                {(json?.filters?.[filterMap[key]] || []).map((x: string) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="quick-actions">
          <button className="btn btn-soft" onClick={() => setFilters({})}>Réinitialiser</button>
          <a className="btn btn-primary" href="/api/export/csv?module=points_eau">Exporter CSV</a>
          <a className="btn btn-soft" href="/api/export/xlsx?module=points_eau">Exporter Excel</a>
        </div>
      </div>

      <div className="grid-4" style={{ marginTop: 18 }}>
        <Kpi label="Points d’eau" value={val(stats.total)} hint="Inventaire consolidé" />
        <Kpi label="Forages" value={val(stats.forages)} hint="Ouvrages motorisés ou PMH" />
        <Kpi label="Puits" value={val(stats.puits)} hint="Traditionnels / améliorés" />
        <Kpi label="Taux fonctionnalité" value={`${val(stats.taux_fonctionnalite)}%`} hint="Hors non renseignés" />
        <Kpi label="Non fonctionnels" value={val(stats.non_fonctionnels)} hint="Priorité technique" />
        <Kpi label="À réhabiliter" value={val(stats.a_rehabiliter)} hint="Score ou besoin renseigné" />
        <Kpi label="Sans GPS" value={val(stats.sans_gps)} hint="Qualité des données" />
        <Kpi label="Alertes qualité" value={val(stats.alertes_qualite)} hint="pH / odeur / anomalies" />
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <MiniBarChart title="Points d’eau par commune" data={(json?.charts?.communes || []).slice(0, 8)} />
        <MiniBarChart title="État de fonctionnalité" data={json?.charts?.fonctionnalite || []} />
        <MiniBarChart title="Type d’équipement" data={(json?.charts?.equipements || []).slice(0, 8)} />
        <MiniBarChart title="Priorité de réhabilitation" data={json?.charts?.priorites || []} />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Cartographie thématique — Points d’eau</h2>
        <p className="muted">Couches : type, fonctionnalité, besoin de réhabilitation, équipement, organe de gestion, qualité de l’eau et qualité des données.</p>
        <LeafletMap module="points_eau" />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Tableau détaillé</h2>
        {loading && <p className="muted">Chargement des données...</p>}
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Commune</th><th>Village</th><th>Type</th><th>Fonctionnalité</th><th>Équipement</th><th>Organe</th><th>pH</th><th>Priorité</th><th>Recommandation</th></tr></thead>
            <tbody>
              {data.slice(0, 200).map((r: any, i: number) => (
                <tr key={r.id || i}>
                  <td>{val(r.code_pe)}</td><td>{val(r.commune)}</td><td>{val(r.village)}</td><td>{val(r.type_infrastructure)}</td><td>{val(r.statut_fonctionnalite)}</td><td>{val(r.equipement)}</td><td>{val(r.organe_gestion)}</td><td>{val(r.ph)}</td><td><span className={`priority priority-${val(r.priorite_rehabilitation).toLowerCase().replace("é", "e")}`}>{val(r.priorite_rehabilitation)}</span></td><td>{val(r.recommandation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
