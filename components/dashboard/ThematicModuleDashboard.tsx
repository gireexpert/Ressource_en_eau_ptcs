"use client";

import { useEffect, useState } from "react";
import Kpi from "@/components/Kpi";
import LeafletMap from "@/components/map/LeafletMap";
import MiniBarChart from "@/components/dashboard/MiniBarChart";

type ModuleName = "pluviometrie" | "piezometrie" | "limnimetrie";
const moduleLabels: Record<ModuleName, string> = { pluviometrie: "Pluviométrie", piezometrie: "Piézométrie", limnimetrie: "Limnimétrie" };
function v(x: any) { return x === null || x === undefined || x === "" ? "--" : String(x); }

export default function ThematicModuleDashboard({ module }: { module: ModuleName }) {
  const [json, setJson] = useState<any>(null);
  const [commune, setCommune] = useState("all");
  useEffect(() => {
    const p = new URLSearchParams({ module });
    if (commune !== "all") p.set("commune", commune);
    fetch(`/api/dashboard/module?${p.toString()}`).then((r) => r.json()).then(setJson);
  }, [module, commune]);
  const stats = json?.stats || {};
  return (
    <>
      <div className="panel filters-panel">
        <div><h2>Analyse dynamique — {moduleLabels[module]}</h2><p className="muted">KPI, filtres, carte, graphique d’évolution, tableau et exports. Source : {json?.source || "chargement"}</p></div>
        <div className="filters-grid compact">
          <label><span>Commune</span><select className="input" value={commune} onChange={(e) => setCommune(e.target.value)}><option value="all">Toutes</option>{(json?.filters?.communes || []).map((c: string) => <option key={c} value={c}>{c}</option>)}</select></label>
        </div>
        <div className="quick-actions"><a className="btn btn-primary" href={`/api/export/csv?module=${module}`}>Exporter CSV</a><a className="btn btn-soft" href={`/api/export/xlsx?module=${module}`}>Exporter Excel</a></div>
      </div>
      <div className="grid-4" style={{ marginTop: 18 }}>
        <Kpi label="Observations" value={v(stats.observations)} hint="Données synchronisées" />
        <Kpi label="Sites" value={v(stats.sites)} hint="Stations / ouvrages" />
        <Kpi label="Moyenne" value={v(stats.moyenne)} hint="Valeur observée" />
        <Kpi label="Alertes" value={v(stats.alertes)} hint="Contrôle qualité" />
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <MiniBarChart title="Répartition par commune" data={(json?.charts?.communes || []).slice(0, 10)} />
        <MiniBarChart title="Évolution récente" data={(json?.charts?.evolution || []).slice(-12)} />
      </div>
      <div className="panel" style={{ marginTop: 18 }}><h2>Carte du module</h2><LeafletMap module={module} /></div>
      <div className="panel" style={{ marginTop: 18 }}><h2>Données récentes</h2><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Site</th><th>Commune</th><th>Valeur</th><th>Observateur</th><th>Commentaire</th></tr></thead><tbody>{(json?.data || []).slice(0, 100).map((r: any, i: number) => <tr key={r.id || i}><td>{v(r.date_observation)}</td><td>{v(r.code_site || r.code_station || r.code_piezo)}</td><td>{v(r.commune)}</td><td>{v(r.valeur_observee || r.pluie_24h_mm || r.niveau_statique || r.hauteur_eau)}</td><td>{v(r.observateur)}</td><td>{v(r.commentaire)}</td></tr>)}</tbody></table></div></div>
    </>
  );
}
