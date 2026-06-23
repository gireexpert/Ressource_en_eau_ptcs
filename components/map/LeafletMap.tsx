"use client";
import { useEffect, useRef, useState } from "react";
declare global { interface Window { L: any } }

const moduleColors: Record<string, string> = { pluviometrie: "#0077B6", piezometrie: "#5B2A86", limnimetrie: "#48CAE4", points_eau: "#2D6A4F" };
const themes = [
  ["fonctionnalite", "Fonctionnalité"],
  ["type", "Type d’ouvrage"],
  ["rehabilitation", "Réhabilitation"],
  ["equipement", "Équipement"],
  ["organe", "Organe de gestion"],
  ["qualite", "Qualité eau"],
  ["donnees", "Qualité données"],
];

export default function LeafletMap({ module }: { module?: "pluviometrie" | "piezometrie" | "limnimetrie" | "points_eau" }) {
  const ref = useRef<HTMLDivElement>(null), mapRef = useRef<any>(null), layerRef = useRef<any>(null);
  const [status, setStatus] = useState("Chargement...");
  const [theme, setTheme] = useState("fonctionnalite");

  useEffect(() => {
    async function init() {
      if (!document.getElementById("leaflet-css")) { const l = document.createElement("link"); l.id = "leaflet-css"; l.rel = "stylesheet"; l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l); }
      if (!window.L) await new Promise<void>((resolve) => { const s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = () => resolve(); document.body.appendChild(s); });
      if (!ref.current || mapRef.current) return;
      const L = window.L;
      const map = L.map(ref.current).setView([12.86, -7.56], 8); mapRef.current = map;
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" });
      const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Tiles © Esri" });
      osm.addTo(map); L.control.layers({ OpenStreetMap: osm, Satellite: sat }, {}, { collapsed: true }).addTo(map);
      try { const b = await fetch("/data/admin-boundaries.geojson").then((r) => r.json()); L.geoJSON(b, { style: (f: any) => ({ color: f.properties.level === "Pays" ? "#5B2A86" : "#2D6A4F", weight: 2, fillOpacity: .05 }), onEachFeature: (f: any, l: any) => l.bindPopup(`${f.properties.level} : ${f.properties.name}`) }).addTo(map); } catch {}
    }
    init();
  }, []);

  useEffect(() => {
    async function loadPoints() {
      if (!window.L || !mapRef.current) return;
      const L = window.L, map = mapRef.current;
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      const url = module ? `/api/map/points?module=${module}&theme=${theme}` : `/api/map/points?theme=${theme}`;
      const j = await fetch(url).then((r) => r.json());
      const pts = (j.data || []).filter((p: any) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)));
      if (!pts.length || j.source === "fallback") { setStatus("Aucune donnée GPS réelle collectée pour le moment. Les points apparaîtront après synchronisation ou via le CSV V2_3."); return; }
      const g = L.featureGroup();
      pts.forEach((p: any) => {
        const color = p.couleur || moduleColors[p.module] || "#111827";
        const html = p.module === "points_eau"
          ? `<strong>Point d’eau</strong><br/><b>${p.code || ""}</b><br/>Commune : ${p.commune || "--"}<br/>Village : ${p.village || "--"}<br/>Type : ${p.type_infrastructure || "--"}<br/>Fonctionnalité : ${p.statut_fonctionnalite || "--"}<br/>Équipement : ${p.equipement || "--"}<br/>Organe : ${p.organe_gestion || "--"}<br/>Priorité : ${p.priorite_rehabilitation || "--"}<br/>pH : ${p.ph ?? "--"}<br/>Recommandation : ${p.recommandation || "--"}`
          : `<strong>${p.module}</strong><br/>${p.code || ""}<br/>${p.libelle || ""}`;
        L.circleMarker([Number(p.latitude), Number(p.longitude)], { radius: p.module === "points_eau" ? 7 : 8, color: "white", weight: 2, fillColor: color, fillOpacity: .95 }).bindPopup(html).addTo(g);
      });
      g.addTo(map); layerRef.current = g;
      try { map.fitBounds(g.getBounds().pad(.25)); } catch {}
      setStatus(`${pts.length} point(s) GPS affiché(s). Source : ${j.source}${module ? " • filtre module actif" : ""}${module === "points_eau" || !module ? ` • thème : ${themes.find((t) => t[0] === theme)?.[1]}` : ""}`);
    }
    loadPoints();
  }, [module, theme]);

  return <div>{(!module || module === "points_eau") && <div className="map-tools">{themes.map(([k, label]) => <button key={k} className={theme === k ? "btn btn-primary" : "btn btn-soft"} onClick={() => setTheme(k)}>{label}</button>)}</div>}<div ref={ref} className="map-real"></div><div className="notice-empty">{status}</div></div>;
}
