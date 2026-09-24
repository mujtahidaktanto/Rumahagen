// lib/analytics/xlsx.ts
// Pembangun file Excel (.xlsx) untuk export Dashboard Analytics, TANPA
// dependency baru -- package.json proyek ini sengaja tidak menambah library
// di luar manifest yang disetujui (lihat lib/api/csv.ts, lib/dbr/pdf.ts).
// Yang diimplementasi hanya yang dibutuhkan: satu ZIP (deflate dari
// node:zlib) berisi SpreadsheetML minimal dengan inline string, gaya sel
// sederhana, lebar kolom, dan formula (SUM/perubahan) beserta nilai cache
// supaya tetap terbaca di penampil yang tidak menghitung ulang.

import zlib from "node:zlib";
import { GROUP_LABELS, GROUP_NOTES, GROUP_ORDER, type Dashboard, type GroupId, type SeriesResult, type Tile, type Unit } from "./dashboard";
import { enumerateDays } from "./period";

// ------------------------------------------------------------------ ZIP

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = (CRC_TABLE[(c ^ (buf[i] as number)) & 0xff] as number) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files: { name: string; data: Buffer }[]): Buffer {
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const comp = zlib.deflateRawSync(f.data);
    const crc = crc32(f.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(dosTime, 10); lh.writeUInt16LE(dosDate, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(f.data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, name, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(dosTime, 12); ch.writeUInt16LE(dosDate, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(f.data.length, 24); ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);
    offset += lh.length + name.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

// ------------------------------------------------------------------ SpreadsheetML

export type StyleKey = "default" | "title" | "header" | "int" | "idr" | "pct" | "date" | "note" | "bold" | "warn" | "delta" | "dec1" | "wrap" | "label";
const STYLE_INDEX: Record<StyleKey, number> = { default: 0, title: 1, header: 2, int: 3, idr: 4, pct: 5, date: 6, note: 7, bold: 8, warn: 9, delta: 10, dec1: 11, wrap: 12, label: 13 };

type CellValue = string | number | null;
interface CellObj { v?: CellValue; f?: string; s?: StyleKey }
export type Cell = CellValue | CellObj;
export interface SheetDef { name: string; rows: Cell[][]; widths: number[]; freezeRow?: number }

const xmlEsc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

function colName(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) { const m = (x - 1) % 26; s = String.fromCharCode(65 + m) + s; x = Math.floor((x - 1) / 26); }
  return s;
}

function cellXml(ref: string, cell: Cell): string {
  if (cell === null || cell === undefined || cell === "") return "";
  const o: CellObj = typeof cell === "object" ? cell : { v: cell };
  const s = STYLE_INDEX[o.s ?? "default"];
  const sAttr = s ? ` s="${s}"` : "";
  const v = o.v ?? null;
  if (o.f !== undefined) {
    const f = xmlEsc(o.f);
    if (typeof v === "number") return `<c r="${ref}"${sAttr}><f>${f}</f><v>${v}</v></c>`;
    if (typeof v === "string") return `<c r="${ref}"${sAttr} t="str"><f>${f}</f><v>${xmlEsc(v)}</v></c>`;
    return `<c r="${ref}"${sAttr}><f>${f}</f></c>`;
  }
  if (v === null) return s ? `<c r="${ref}"${sAttr}/>` : "";
  if (typeof v === "number") return Number.isFinite(v) ? `<c r="${ref}"${sAttr}><v>${v}</v></c>` : "";
  return `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
}

function sheetXml(sh: SheetDef): string {
  const cols = sh.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");
  const rows = sh.rows.map((r, ri) => {
    const cells = r.map((c, ci) => cellXml(`${colName(ci + 1)}${ri + 1}`, c)).join("");
    return cells ? `<row r="${ri + 1}">${cells}</row>` : "";
  }).join("");
  const pane = sh.freezeRow ? `<sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane xSplit="1" ySplit="${sh.freezeRow}" topLeftCell="B${sh.freezeRow + 1}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>` : `<sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${pane}<cols>${cols}</cols><sheetData>${rows}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="5"><numFmt numFmtId="164" formatCode="&quot;Rp&quot; #,##0"/><numFmt numFmtId="165" formatCode="0.0%"/><numFmt numFmtId="166" formatCode="dd mmm yyyy"/><numFmt numFmtId="167" formatCode="+0.0%;-0.0%;0.0%"/><numFmt numFmtId="168" formatCode="0.0"/></numFmts>
<fonts count="6">
<font><sz val="10"/><name val="Arial"/></font>
<font><b/><sz val="14"/><name val="Arial"/></font>
<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
<font><sz val="9"/><color rgb="FF666666"/><name val="Arial"/></font>
<font><b/><sz val="10"/><name val="Arial"/></font>
<font><b/><sz val="10"/><color rgb="FFB45309"/><name val="Arial"/></font>
</fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3A5F"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF4CE"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD0D7E2"/></left><right style="thin"><color rgb="FFD0D7E2"/></right><top style="thin"><color rgb="FFD0D7E2"/></top><bottom style="thin"><color rgb="FFD0D7E2"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="14">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="5" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="167" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="168" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
</cellXfs>
</styleSheet>`;

export function packWorkbook(sheets: SheetDef[]): Buffer {
  const files: { name: string; data: Buffer }[] = [];
  const add = (name: string, xml: string) => files.push({ name, data: Buffer.from(xml, "utf8") });
  add("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`);
  add("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  add("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`);
  add("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  add("xl/styles.xml", STYLES_XML);
  sheets.forEach((s, i) => add(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s)));
  return zip(files);
}

// ------------------------------------------------------------------ isi workbook

export const serial = (d: string): number => Date.parse(`${d}T00:00:00Z`) / 86400000 + 25569; // serial Excel
const unitStyle = (u: Unit): StyleKey => (u === "idr" ? "idr" : u === "pct" ? "pct" : u === "days" ? "dec1" : "int");
const valueFor = (u: Unit, v: number | null): number | null => (v === null ? null : u === "pct" ? v / 100 : v);

const SUMMARY_KEYS = ["agents_active_30d", "agents_new", "listings_new", "leads_unique", "net_value", "mrr_idr"];

export function buildAnalyticsWorkbook(d: Dashboard, opts: { exportedBy: string }): Buffer {
  const days = enumerateDays(d.range.from, d.range.to);
  const prevDays = d.previous ? enumerateDays(d.previous.from, d.previous.to) : null;
  const rangeText = `Rentang ${d.range.from} s.d. ${d.range.to} (${d.range.days} hari)` + (d.previous ? `  |  Pembanding ${d.previous.from} s.d. ${d.previous.to}` : "  |  Tanpa pembanding");
  const addr = new Map<string, { sheet: string; cur: string; prev: string; dl: string; series: SeriesResult }>();
  const sheets: SheetDef[] = [];

  for (const g of GROUP_ORDER) {
    const list = d.series.filter((s) => s.group === g);
    const tiles = d.tiles.filter((t) => t.group === g);
    if (!list.length && !tiles.length) continue;
    const name = { pengguna: "Pengguna", marketplace: "Marketplace", organisasi: "Organisasi", learning: "Learning", komersial: "Komersial", aktivitas: "Aktivitas", risiko: "Risiko" }[g as GroupId];
    const rows: Cell[][] = [];
    rows.push([{ v: GROUP_LABELS[g], s: "title" }]);
    rows.push([{ v: rangeText, s: "note" }]);
    rows.push([{ v: GROUP_NOTES[g], s: "note" }]);
    rows.push([]);
    rows.push([{ v: "Ringkasan periode", s: "bold" }]);
    rows.push([{ v: "Metrik", s: "header" }, { v: "Periode ini", s: "header" }, { v: "Periode sebelumnya", s: "header" }, { v: "Perubahan", s: "header" }, { v: "Catatan", s: "header" }]);
    const sumStart = rows.length + 1;
    const dailyHeaderRow = sumStart + list.length + 1 + (tiles.length ? tiles.length + 2 : 0) + 1;
    const curFirst = dailyHeaderRow + 1;
    const curLast = curFirst + days.length - 1;
    const prevHeaderRow = curLast + 3;
    const prevFirst = prevHeaderRow + 1;
    const prevLast = prevFirst + (prevDays?.length ?? 0) - 1;

    list.forEach((s, j) => {
      const col = colName(2 + j);
      const st = unitStyle(s.unit);
      const summable = s.kind === "flow" && s.unit !== "pct";
      const r = sumStart + j;
      const cur: Cell = summable ? { f: `SUM(${col}${curFirst}:${col}${curLast})`, v: s.value ?? 0, s: st } : { v: valueFor(s.unit, s.value), s: st };
      const prv: Cell = s.previous_value === null && !s.previous ? null : summable && prevDays ? { f: `SUM(${col}${prevFirst}:${col}${prevLast})`, v: s.previous_value ?? 0, s: st } : { v: valueFor(s.unit, s.previous_value), s: st };
      const dl: Cell = s.delta_pct === null ? null : { f: `IF(C${r}=0,"",B${r}/C${r}-1)`, v: s.delta_pct / 100, s: "delta" };
      rows.push([{ v: s.label + (s.kind === "flow" ? " (total)" : " (posisi akhir)"), s: "label" }, cur, prv, dl, { v: s.note ?? null, s: "note" }]);
      addr.set(s.key, { sheet: name, cur: `B${r}`, prev: `C${r}`, dl: `D${r}`, series: s });
    });
    if (tiles.length) {
      rows.push([]);
      rows.push([{ v: "Indikator tambahan", s: "bold" }]);
      for (const t of tiles) rows.push([{ v: t.label, s: "label" }, { v: valueFor(t.unit, t.value), s: unitStyle(t.unit) }, null, null, { v: t.value === null ? `Belum tersedia. ${t.note ?? ""}`.trim() : t.note ?? null, s: "note" }]);
    }
    rows.push([]);
    rows.push([{ v: "Data harian, periode ini", s: "bold" }]);
    rows.push([{ v: "Tanggal", s: "header" }, ...list.map((s) => ({ v: s.label, s: "header" as StyleKey }))]);
    const curMaps = list.map((s) => new Map(s.current.map((p) => [p.day, p.value])));
    days.forEach((day) => rows.push([{ v: serial(day), s: "date" }, ...list.map((s, j) => { const v = curMaps[j]?.get(day); return v === undefined ? null : { v: valueFor(s.unit, v), s: unitStyle(s.unit) }; })]));
    if (prevDays) {
      rows.push([]);
      rows.push([{ v: "Data harian, periode pembanding", s: "bold" }]);
      rows.push([{ v: "Tanggal", s: "header" }, ...list.map((s) => ({ v: s.label, s: "header" as StyleKey }))]);
      const prevMaps = list.map((s) => new Map((s.previous ?? []).map((p, i) => [prevDays[i] ?? p.day, p.value])));
      prevDays.forEach((day) => rows.push([{ v: serial(day), s: "date" }, ...list.map((s, j) => { const v = prevMaps[j]?.get(day); return v === undefined ? null : { v: valueFor(s.unit, v), s: unitStyle(s.unit) }; })]));
    }
    // sanity: posisi baris hasil rakitan harus cocok dengan alamat yang dipakai rumus
    const headerAt = rows.findIndex((r) => r[0] && typeof r[0] === "object" && r[0].v === "Tanggal") + 1;
    if (headerAt !== dailyHeaderRow) throw new Error(`xlsx: baris header harian ${headerAt} != ${dailyHeaderRow} (${name})`);
    sheets.push({ name, rows, widths: Array.from({ length: Math.max(5, list.length + 1) }, (_, i) => (i === 0 ? 46 : i === 4 ? 40 : 22)), freezeRow: 6 });
  }

  // Funnel, kohort, peran
  const fr: Cell[][] = [[{ v: "Funnel Aktivasi & Retensi Kohort", s: "title" }], [{ v: rangeText, s: "note" }], []];
  if (d.funnel) {
    fr.push([{ v: `Funnel kohort daftar ${d.funnel.cohort_from} s.d. ${d.funnel.cohort_to}, jendela 30 hari sejak daftar (tiap tahap dihitung mandiri)`, s: "note" }]);
    fr.push([{ v: "Tahap", s: "header" }, { v: "Jumlah agen", s: "header" }, { v: "% dari pendaftar", s: "header" }]);
    const first = fr.length + 1;
    d.funnel.steps.forEach((st, i) => fr.push([{ v: st.label, s: "label" }, { v: st.count, s: "int" }, { f: `IF($B$${first}=0,"",B${first + i}/$B$${first})`, v: st.pct === null ? "" : st.pct / 100, s: "pct" }]));
    fr.push([{ v: "Waktu ke lead pertama, median (hari)", s: "label" }, { v: d.funnel.median_days_to_first_lead, s: "dec1" }]);
  } else fr.push([{ v: "Funnel belum tersedia.", s: "note" }]);
  fr.push([]);
  fr.push([{ v: "Retensi kohort bulanan (dari snapshot harian)", s: "bold" }]);
  fr.push([{ v: "Kohort", s: "header" }, { v: "Ukuran", s: "header" }, ...["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => ({ v: m, s: "header" as StyleKey }))]);
  for (const c of d.cohorts ?? []) fr.push([{ v: c.cohort, s: "label" }, { v: c.size, s: "int" }, ...c.retention.map((r) => ({ v: r === null ? null : r / 100, s: "pct" as StyleKey }))]);
  fr.push([]);
  fr.push([{ v: "Total pengguna per role (snapshot terakhir)", s: "bold" }]);
  if (d.roles) { fr.push([{ v: "Role", s: "header" }, { v: "Jumlah", s: "header" }]); for (const r of d.roles) fr.push([{ v: r.role, s: "label" }, { v: r.count, s: "int" }]); }
  else fr.push([{ v: "Belum ada snapshot harian.", s: "note" }]);
  sheets.push({ name: "Funnel_Kohort", rows: fr, widths: [44, 16, 12, 12, 12, 12, 12, 12] });

  // Definisi & catatan
  const dr: Cell[][] = [[{ v: `Definisi & Catatan (Metric Definitions ${d.definition_version})`, s: "title" }], [{ v: "Sumber lengkap: docs/analytics/METRIC_DEFINITIONS_v1.md", s: "note" }], []];
  dr.push([{ v: "Catatan umum", s: "bold" }]);
  for (const n of d.notes) dr.push([{ v: n, s: "wrap" }]);
  dr.push([]);
  dr.push([{ v: "Metrik yang belum bisa ditampilkan", s: "bold" }]);
  dr.push([{ v: "Metrik", s: "header" }, { v: "Alasan", s: "header" }]);
  for (const u of d.unavailable) dr.push([{ v: u.label, s: "label" }, { v: u.reason, s: "wrap" }]);
  dr.push([]);
  dr.push([{ v: "Catatan per metrik", s: "bold" }]);
  dr.push([{ v: "Metrik", s: "header" }, { v: "Catatan", s: "header" }]);
  for (const s of d.series) if (s.note) dr.push([{ v: s.label, s: "label" }, { v: s.note, s: "wrap" }]);
  sheets.push({ name: "Definisi", rows: dr, widths: [46, 110] });

  // Ringkasan (dibangun terakhir agar bisa merujuk sel sheet lain), ditaruh pertama
  const sr: Cell[][] = [[{ v: "RumahAgen - Dashboard Analytics", s: "title" }], [{ v: rangeText + `  |  Data per ${d.generated_at}  |  Definisi ${d.definition_version}`, s: "note" }],
    [{ v: `Diekspor oleh: ${opts.exportedBy}. Export ini dicatat di audit log.`, s: "note" }]];
  if (!d.snapshot.first_date) sr.push([{ v: "Belum ada snapshot harian: metrik stok (agen aktif, MRR, dst.) masih kosong.", s: "warn" }]);
  sr.push([]);
  sr.push([{ v: "Ringkasan", s: "header" }, { v: "Periode ini", s: "header" }, { v: "Periode sebelumnya", s: "header" }, { v: "Perubahan", s: "header" }]);
  for (const key of SUMMARY_KEYS) {
    const a = addr.get(key);
    if (!a) continue;
    const st = unitStyle(a.series.unit);
    sr.push([{ v: a.series.label, s: "label" }, { f: `${a.sheet}!${a.cur}`, v: valueFor(a.series.unit, a.series.value) as number, s: st },
      a.series.previous_value === null && !a.series.previous ? null : { f: `${a.sheet}!${a.prev}`, v: valueFor(a.series.unit, a.series.previous_value) as number, s: st },
      a.series.delta_pct === null ? null : { f: `${a.sheet}!${a.dl}`, v: a.series.delta_pct / 100, s: "delta" }]);
  }
  sr.push([]);
  sr.push([{ v: "Isi workbook", s: "bold" }]);
  for (const s of sheets) sr.push([{ v: s.name, s: "label" }]);
  sheets.unshift({ name: "Ringkasan", rows: sr, widths: [40, 22, 22, 14] });

  return packWorkbook(sheets);
}
