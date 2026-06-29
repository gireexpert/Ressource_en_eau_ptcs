export async function fetchEpicollectEntries(url:string){
  if(!url) throw new Error("URL Epicollect manquante");
  const pages:any[]=[];
  let next:string|null=url;
  const seen=new Set<string>();
  for(let page=1; page<=200 && next && !seen.has(next); page++){
    seen.add(next);
    const u=new URL(next);
    if(!u.searchParams.has("per_page")) u.searchParams.set("per_page","1000");
    if(!u.searchParams.has("page") && page>1) u.searchParams.set("page",String(page));
    const r=await fetch(u.toString(),{cache:"no-store"});
    if(!r.ok) throw new Error(`Epicollect API error ${r.status}: ${r.statusText}`);
    const payload=await r.json();
    pages.push(payload);
    const entries=extractEntries(payload);
    const meta=payload?.meta||payload?.data?.meta||{};
    const links=payload?.links||payload?.data?.links||{};
    const nextFromPayload=links?.next||meta?.next_page_url||payload?.next_page_url||payload?.next;
    if(nextFromPayload){ next = String(nextFromPayload).startsWith("http") ? String(nextFromPayload) : new URL(String(nextFromPayload), u.origin).toString(); continue; }
    const current=Number(meta?.current_page||payload?.current_page||page);
    const last=Number(meta?.last_page||payload?.last_page||0);
    if(last && current<last){ u.searchParams.set("page", String(current+1)); next=u.toString(); continue; }
    if(entries.length>=1000){ u.searchParams.set("page", String(page+1)); next=u.toString(); continue; }
    next=null;
  }
  if(pages.length===1) return pages[0];
  return { data: pages.flatMap(extractEntries), pages: pages.length };
}
export function extractEntries(p:any):any[]{if(Array.isArray(p?.data?.entries))return p.data.entries;if(Array.isArray(p?.entries))return p.entries;if(Array.isArray(p?.data))return p.data;if(Array.isArray(p))return p;let out:any[]=[];function walk(v:any){if(!v||typeof v!=="object")return;if(Array.isArray(v)){if(v.some(x=>x&&typeof x==="object"&&(x.ec5_uuid||x.uuid||x.id||x.created_at||x.answers||x.title))){out.push(...v.filter(x=>x&&typeof x==="object"));return}v.forEach(walk);return}Object.values(v).forEach(walk)}walk(p);return out}
export function unwrapAnswer(v:any):any{if(v&&typeof v==="object"){if(v.answer!==undefined)return unwrapAnswer(v.answer);if(v.value!==undefined)return unwrapAnswer(v.value);if(v.name!==undefined)return unwrapAnswer(v.name)}return v}
export function norm(k:string){return String(k||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"")}
export function getValue(e:any,labels:string[]){const wanted=labels.map(norm);let res:any=null;function scan(v:any){if(res!==null||!v||typeof v!=="object")return;if(Array.isArray(v)){v.forEach(scan);return}for(const [k,val] of Object.entries(v)){if(wanted.includes(norm(k))){res=unwrapAnswer(val);return}scan(val)}}scan(e);return res}
export function safeNumber(v:any){if(v===null||v===undefined||v==="")return null;if(typeof v==="number")return Number.isFinite(v)?v:null;const m=String(v).replace(",",".").match(/-?\d+(\.\d+)?/);if(!m)return null;const n=Number(m[0]);return Number.isFinite(n)?n:null}
export function parseLocation(v:any){v=unwrapAnswer(v);if(!v)return{latitude:null,longitude:null};if(typeof v==="object"){let lat=safeNumber(v.latitude??v.lat??v.y??v.Latitude??v.LATITUDE),lon=safeNumber(v.longitude??v.lng??v.lon??v.x??v.Longitude??v.LONGITUDE);if(lat!==null&&lon!==null)return{latitude:lat,longitude:lon};if(Array.isArray(v.coordinates)&&v.coordinates.length>=2)return{latitude:safeNumber(v.coordinates[1]),longitude:safeNumber(v.coordinates[0])}}if(typeof v==="string"){const nums=v.replace(/[;|]/g," ").split(/[ ,]+/).map(Number).filter(n=>!Number.isNaN(n));if(nums.length>=2){const a=nums[0],b=nums[1];return Math.abs(a)<=25?{latitude:a,longitude:b}:{latitude:b,longitude:a}}}return{latitude:null,longitude:null}}
export function findLocation(e:any){let loc=parseLocation(getValue(e,["Coordonnées GPS","Coordonnees GPS","Coordonnées infrastructures","Coordonnees infrastructures","10_Coordonnes_infras","GPS","Geolocalisation","Géolocalisation","Localisation GPS","Point GPS","location","coordinates","Latitude Longitude"]));if(loc.latitude!==null&&loc.longitude!==null)return loc;loc={latitude:safeNumber(getValue(e,["Latitude","lat","Y","lat_10_Coordonnes_infras"])),longitude:safeNumber(getValue(e,["Longitude","long","lng","lon","X","long_10_Coordonnes_infras"]))};if(loc.latitude!==null&&loc.longitude!==null)return loc;let found:any={latitude:null,longitude:null};function walk(v:any){if(found.latitude!==null&&found.longitude!==null)return;if(!v||typeof v!=="object")return;const p=parseLocation(v);if(p.latitude!==null&&p.longitude!==null){found=p;return}Array.isArray(v)?v.forEach(walk):Object.values(v).forEach(walk)}walk(e);return found}
export function sourceId(e:any){return e?.ec5_uuid||e?.uuid||e?.id||e?._id||e?.created_at||JSON.stringify(e).slice(0,120)}
