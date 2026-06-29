"use client";
import { useEffect, useState } from "react";

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  let out = "Psore_";
  for (let i = 0; i < 10; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function UserCreateForm() {
  const [roles, setRoles] = useState<any[]>([]), [email, setEmail] = useState(""), [roleId, setRoleId] = useState(""), [nom, setNom] = useState(""), [prenom, setPrenom] = useState(""), [password, setPassword] = useState(""), [mode, setMode] = useState("direct"), [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/users").then(r => r.json()).then(j => setRoles(j.roles || [])); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("Création...");
    const r = await fetch("/api/admin/users/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role_id: roleId, nom, prenom, password, mode }) });
    const j = await r.json(); setMsg(j.ok ? j.message : "Erreur : " + j.error);
  }
  async function copyPassword() { if (password) { await navigator.clipboard.writeText(password); setMsg("Mot de passe copié."); } }
  return <div className="panel"><h2>Ajouter un utilisateur</h2><p style={{color:"#64748b"}}>Création directe avec mot de passe généré/saisi, ou invitation classique si nécessaire.</p><form onSubmit={submit}>
    <input className="input" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} />
    <input className="input" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
    <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
    <select className="input" value={roleId} onChange={e => setRoleId(e.target.value)} required><option value="">Choisir le rôle</option>{roles.map(r => <option key={r.id} value={r.id}>{r.nom_role}</option>)}</select>
    <select className="input" value={mode} onChange={e => setMode(e.target.value)}><option value="direct">Créer avec mot de passe</option><option value="invite">Envoyer une invitation Supabase</option></select>
    {mode === "direct" && <div className="quick-actions" style={{alignItems:"center"}}><input className="input" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required={mode === "direct"} /><button type="button" className="btn btn-soft" onClick={() => setPassword(generatePassword())}>Générer</button><button type="button" className="btn btn-soft" onClick={copyPassword}>Copier</button></div>}
    <button className="btn btn-primary" style={{marginTop:14}}>{mode === "direct" ? "Créer l'utilisateur" : "Envoyer l'invitation"}</button>
  </form>{msg && <p><strong>{msg}</strong></p>}</div>;
}
