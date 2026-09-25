// supabase/seed/wilayah/load.mjs
// Memuat wilayah Kepmendagri 2025 lewat PostgREST (service role) tanpa psql: upsert per `code` (idempoten, id baris lama dipertahankan).
// Pemakaian (Node 20+), dari folder ini:
//   node load.mjs --dry-run     # cek CSV saja (keutuhan induk-anak, jumlah), tanpa jaringan
//   node load.mjs               # muat ke database
// Kredensial: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dari environment, atau dari apps/web/.env.local. Kunci tidak pernah dicetak.
// Alternatif tanpa Node: load.sql (psql). Aturan transformasi: README.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--dry-run");

function parseCsv(name) {
  const text = fs.readFileSync(path.join(dir, name), "utf8").replace(/\r/g, "");
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const cells = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ",") { cells.push(cur); cur = ""; } else cur += ch;
    }
    cells.push(cur); rows.push(cells);
  }
  const head = rows.shift();
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const provinces = parseCsv("provinces.csv"), cities = parseCsv("cities.csv"), districts = parseCsv("districts.csv"), villages = parseCsv("villages.csv");

// Keutuhan: setiap anak punya induk, kode unik, panjang kode sesuai tingkat.
function check(label, rows, len, parentKey, parents) {
  const seen = new Set();
  for (const r of rows) {
    if (r.code.length !== len || !/^\d+$/.test(r.code)) throw new Error(`${label}: kode tidak valid ${r.code}`);
    if (seen.has(r.code)) throw new Error(`${label}: kode ganda ${r.code}`);
    seen.add(r.code);
    if (parentKey && !parents.has(r[parentKey])) throw new Error(`${label}: induk tidak ada untuk ${r.code} (${r[parentKey]})`);
    if (!r.name) throw new Error(`${label}: nama kosong ${r.code}`);
  }
  return seen;
}
const pSet = check("provinsi", provinces, 2);
const cSet = check("kab/kota", cities, 4, "province_code", pSet);
for (const c of cities) if (!c.code.startsWith(c.province_code)) throw new Error("kab/kota bukan turunan provinsi: " + c.code);
const dSet = check("kecamatan", districts, 6, "city_code", cSet);
for (const d of districts) if (!d.code.startsWith(d.city_code)) throw new Error("kecamatan bukan turunan kab/kota: " + d.code);
check("desa", villages, 10, "district_code", dSet);
for (const v of villages) { if (!v.code.startsWith(v.district_code)) throw new Error("desa bukan turunan kecamatan: " + v.code); if (v.postal_code && !/^\d{5}$/.test(v.postal_code)) throw new Error("kode pos: " + v.code); }
console.log(`CSV valid: provinsi ${provinces.length}, kab/kota ${cities.length}, kecamatan ${districts.length}, desa ${villages.length} (berkode pos ${villages.filter((v) => v.postal_code).length})`);
if (dry) process.exit(0);

// Kredensial
function loadEnv() {
  const env = { ...process.env };
  const f = path.resolve(dir, "../../../apps/web/.env.local");
  if ((!env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) && fs.existsSync(f)) {
    for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) { const m = /^([A-Z0-9_]+)=(.*)$/.exec(l); if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
  }
  return env;
}
const env = loadEnv();
const base = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak tersedia");
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function upsert(table, rows) {
  const res = await fetch(`${base}/rest/v1/${table}?on_conflict=code`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${(await res.text()).slice(0, 300)}`);
}
async function idMap(table) {
  const map = new Map();
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${base}/rest/v1/${table}?select=id,code&order=code`, { headers: { ...H, Range: `${from}-${from + 999}` } });
    if (!res.ok) throw new Error(`${table} (peta id): ${res.status}`);
    const page = await res.json(); for (const r of page) map.set(r.code, r.id);
    if (page.length < 1000) break;
  }
  return map;
}
async function count(table) {
  const res = await fetch(`${base}/rest/v1/${table}?select=id`, { method: "HEAD", headers: { ...H, Prefer: "count=exact", Range: "0-0" } });
  return Number((res.headers.get("content-range") || "").split("/")[1]);
}
async function batches(table, rows, size) {
  for (let i = 0; i < rows.length; i += size) { await upsert(table, rows.slice(i, i + size)); if ((i / size) % 10 === 0) console.log(`  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`); }
}

console.log("provinsi…"); await upsert("ref_provinces", provinces);
const pMap = await idMap("ref_provinces");
console.log("kab/kota…"); await batches("ref_cities", cities.map((c) => ({ province_id: pMap.get(c.province_code), code: c.code, name: c.name, type: c.type })), 500);
const cMap = await idMap("ref_cities");
console.log("kecamatan…"); await batches("ref_districts", districts.map((d) => ({ city_id: cMap.get(d.city_code), code: d.code, name: d.name })), 1000);
const dMap = await idMap("ref_districts");
console.log("desa/kelurahan…"); await batches("ref_villages", villages.map((v) => ({ district_id: dMap.get(v.district_code), code: v.code, name: v.name, postal_code: v.postal_code || null })), 2000);
console.log("selesai. jumlah di database:", { provinsi: await count("ref_provinces"), kota: await count("ref_cities"), kecamatan: await count("ref_districts"), desa: await count("ref_villages") });
