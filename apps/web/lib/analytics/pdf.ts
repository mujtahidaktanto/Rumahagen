// lib/analytics/pdf.ts
// Generator PDF export Dashboard Analytics. Pakai `pdf-lib` -- satu-satunya
// library PDF yang disetujui proyek ini (lihat lib/dbr/pdf.ts). Grafik
// digambar sebagai garis vektor, bukan gambar. Logo dari public/assets/
// rumahagen-logo.png (file yang sama dengan PDF DBR dan klaim).

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { GROUP_LABELS, GROUP_NOTES, GROUP_ORDER, type Dashboard, type SeriesResult, type Unit } from "./dashboard";

export const A4: [number, number] = [595.28, 841.89];
export const M = 40;
export const NAVY = rgb(0.122, 0.227, 0.373);
const BLUE = rgb(0.145, 0.388, 0.922);
export const GRAY = rgb(0.4, 0.4, 0.4);
const LINE = rgb(0.816, 0.843, 0.886);
const INK = rgb(0.1, 0.12, 0.16);

const SUMMARY_KEYS = ["agents_active_30d", "agents_new", "listings_new", "leads_unique", "net_value", "mrr_idr"];

// WinAnsi (Helvetica standar) tidak memuat karakter di atas Latin-1.
const clean = (s: string): string => s.replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^ -ÿ]/g, "?");

const group3 = (n: number): string => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export function formatValue(unit: Unit, v: number | null): string {
  if (v === null || !Number.isFinite(v)) return "-";
  if (unit === "pct") return `${v.toFixed(1).replace(".", ",")}%`;
  if (unit === "days") return `${v.toFixed(1).replace(".", ",")} hari`;
  if (unit === "idr") {
    const a = Math.abs(v);
    if (a >= 1e9) return `Rp ${(v / 1e9).toFixed(2).replace(".", ",")} M`;
    if (a >= 1e6) return `Rp ${group3(v / 1e6)} jt`;
    return `Rp ${group3(v)}`;
  }
  return group3(v);
}
export const formatDelta = (d: number | null): string => (d === null ? "-" : `${d >= 0 ? "+" : "-"}${Math.abs(d).toFixed(1).replace(".", ",")}%`);

export class Doc {
  page: PDFPage;
  y: number;
  constructor(readonly doc: PDFDocument, readonly font: PDFFont, readonly bold: PDFFont) {
    this.page = doc.addPage(A4);
    this.y = A4[1] - M;
  }
  ensure(h: number): void {
    if (this.y - h < M + 10) { this.page = this.doc.addPage(A4); this.y = A4[1] - M; }
  }
  text(t: string, x: number, y: number, size = 9, opts: { bold?: boolean; color?: ReturnType<typeof rgb> } = {}): void {
    this.page.drawText(clean(t), { x, y, size, font: opts.bold ? this.bold : this.font, color: opts.color ?? INK });
  }
  width(t: string, size: number, bold = false): number {
    return (bold ? this.bold : this.font).widthOfTextAtSize(clean(t), size);
  }
  wrap(t: string, size: number, maxW: number): string[] {
    const words = clean(t).split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (this.font.widthOfTextAtSize(next, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  fit(t: string, size: number, maxW: number, bold = false): string {
    let s = clean(t);
    const f = bold ? this.bold : this.font;
    while (s.length > 1 && f.widthOfTextAtSize(s, size) > maxW) s = s.slice(0, -1);
    return s;
  }
  paragraph(t: string, size = 8, color = GRAY, maxW = A4[0] - 2 * M): void {
    for (const l of this.wrap(t, size, maxW)) { this.ensure(size + 3); this.text(l, M, this.y, size, { color }); this.y -= size + 3; }
  }
  table(head: string[], rows: string[][], widths: number[], opts: { size?: number } = {}): void {
    const size = opts.size ?? 8;
    const rh = size + 8;
    this.ensure(rh * 2);
    let x = M;
    this.page.drawRectangle({ x: M, y: this.y - rh + 2, width: widths.reduce((a, b) => a + b, 0), height: rh, color: NAVY });
    head.forEach((h, i) => { this.text(this.fit(h, size, (widths[i] ?? 60) - 8, true), x + 4, this.y - rh + 2 + (rh - size) / 2 + 1, size, { bold: true, color: rgb(1, 1, 1) }); x += widths[i] ?? 60; });
    this.y -= rh;
    rows.forEach((r, ri) => {
      this.ensure(rh);
      if (ri % 2 === 1) this.page.drawRectangle({ x: M, y: this.y - rh + 2, width: widths.reduce((a, b) => a + b, 0), height: rh, color: rgb(0.965, 0.976, 0.996) });
      let cx = M;
      r.forEach((c, i) => {
        const w = widths[i] ?? 60;
        const t = this.fit(c, size, w - 8);
        this.text(t, i === 0 ? cx + 4 : cx + w - 4 - this.width(t, size), this.y - rh + 2 + (rh - size) / 2 + 1, size);
        cx += w;
      });
      this.page.drawLine({ start: { x: M, y: this.y - rh + 2 }, end: { x: M + widths.reduce((a, b) => a + b, 0), y: this.y - rh + 2 }, thickness: 0.4, color: LINE });
      this.y -= rh;
    });
    this.y -= 6;
  }
}

function polyline(d: Doc, pts: number[], x: number, y: number, w: number, h: number, lo: number, hi: number, color: ReturnType<typeof rgb>, dashed = false): void {
  const n = pts.length;
  if (n < 2) return;
  const px = (i: number) => x + (i / (n - 1)) * w;
  const py = (v: number) => y + 3 + ((v - lo) / (hi - lo || 1)) * (h - 6);
  for (let i = 1; i < n; i++) {
    d.page.drawLine({ start: { x: px(i - 1), y: py(pts[i - 1] as number) }, end: { x: px(i), y: py(pts[i] as number) }, thickness: dashed ? 0.9 : 1.4, color, ...(dashed ? { dashArray: [3, 2] } : {}) });
  }
}

export function chartCard(d: Doc, s: SeriesResult, x: number, top: number, w: number, h: number): void {
  d.page.drawRectangle({ x, y: top - h, width: w, height: h, borderColor: LINE, borderWidth: 0.8 });
  d.text(d.fit(s.label, 8, w - 12, true), x + 6, top - 12, 8, { bold: true, color: NAVY });
  d.text(formatValue(s.unit, s.value), x + 6, top - 28, 13, { bold: true });
  if (s.delta_pct !== null) {
    const t = formatDelta(s.delta_pct);
    d.text(t, x + w - 6 - d.width(t, 8, true), top - 27, 8, { bold: true, color: s.delta_pct >= 0 ? rgb(0.09, 0.4, 0.2) : rgb(0.6, 0.1, 0.1) });
  }
  const cur = s.current.map((p) => p.value);
  const prev = s.previous?.map((p) => p.value) ?? [];
  if (cur.length < 2) { d.text("Belum ada data", x + 6, top - 52, 8, { color: GRAY }); return; }
  const all = cur.concat(prev);
  const lo = Math.min(...all), hi = Math.max(...all);
  const ch = h - 46;
  if (prev.length > 1) polyline(d, prev, x + 6, top - h + 4, w - 12, ch, lo, hi, rgb(0.6, 0.65, 0.72), true);
  polyline(d, cur, x + 6, top - h + 4, w - 12, ch, lo, hi, BLUE);
  const a = s.current[0]?.day.slice(5) ?? "", b = s.current[s.current.length - 1]?.day.slice(5) ?? "";
  d.text(a, x + 6, top - h + 3, 6.5, { color: GRAY });
  d.text(b, x + w - 6 - d.width(b, 6.5), top - h + 3, 6.5, { color: GRAY });
}

export async function buildAnalyticsPdf(data: Dashboard, opts: { exportedBy: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("RumahAgen - Dashboard Analytics");
  pdf.setAuthor("RumahAgen");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const d = new Doc(pdf, font, bold);

  let logo: PDFImage | null = null;
  try {
    logo = await pdf.embedPng(await fs.readFile(path.join(process.cwd(), "public", "assets", "rumahagen-logo.png")));
  } catch {
    logo = null; // logo tidak boleh menggagalkan export
  }
  // Gambar logo punya margin putih lebar; konten logo menempati ~76% lebar
  // dan ~54% tinggi bagian atas. Skala supaya konten ~170pt lebar.
  let headerH = 40;
  if (logo) {
    const w = 170 / 0.76;
    const h = (logo.height / logo.width) * w;
    d.page.drawImage(logo, { x: M, y: A4[1] - M - h + 4, width: w, height: h });
    headerH = 0.54 * h;
  }
  d.text("Dashboard Analytics", M + 190, A4[1] - M - 14, 20, { bold: true, color: NAVY });
  d.text(`Rentang: ${data.range.from} s.d. ${data.range.to} (${data.range.days} hari)`, M + 190, A4[1] - M - 30, 8.5, { color: GRAY });
  d.text(data.previous ? `Pembanding: ${data.previous.from} s.d. ${data.previous.to}` : "Tanpa perbandingan periode", M + 190, A4[1] - M - 41, 8.5, { color: GRAY });
  d.text(`Diekspor oleh ${opts.exportedBy} | Data per ${data.generated_at.slice(0, 16).replace("T", " ")} UTC | Definisi ${data.definition_version}`, M + 190, A4[1] - M - 52, 8, { color: GRAY });
  d.y = A4[1] - M - Math.max(headerH, 58) - 12;
  d.page.drawLine({ start: { x: M, y: d.y + 4 }, end: { x: A4[0] - M, y: d.y + 4 }, thickness: 1.5, color: NAVY });
  d.y -= 8;

  if (!data.snapshot.first_date) {
    d.page.drawRectangle({ x: M, y: d.y - 20, width: A4[0] - 2 * M, height: 20, color: rgb(1, 0.957, 0.808) });
    d.text("Belum ada snapshot harian: metrik stok (agen aktif, MRR, dst.) masih kosong.", M + 6, d.y - 13, 8.5, { bold: true, color: rgb(0.706, 0.325, 0.035) });
    d.y -= 30;
  }

  d.text("Ringkasan", M, d.y - 10, 13, { bold: true, color: NAVY });
  d.y -= 20;
  const sumRows: string[][] = [];
  for (const key of SUMMARY_KEYS) {
    const s = data.series.find((x) => x.key === key);
    if (s) sumRows.push([s.label, formatValue(s.unit, s.value), formatValue(s.unit, s.previous_value), formatDelta(s.delta_pct)]);
  }
  d.table(["Metrik", "Periode ini", "Periode sebelumnya", "Perubahan"], sumRows, [190, 120, 120, 85], { size: 8.5 });

  for (const g of GROUP_ORDER) {
    const list = data.series.filter((s) => s.group === g);
    const tiles = data.tiles.filter((t) => t.group === g);
    if (!list.length && !tiles.length) continue;
    d.ensure(120);
    d.text(GROUP_LABELS[g], M, d.y - 10, 13, { bold: true, color: NAVY });
    d.y -= 18;
    d.paragraph(GROUP_NOTES[g], 8, GRAY);
    d.y -= 4;
    const cw = (A4[0] - 2 * M - 2 * 10) / 3, ch = 92;
    for (let i = 0; i < list.length; i += 3) {
      d.ensure(ch + 8);
      list.slice(i, i + 3).forEach((s, j) => chartCard(d, s, M + j * (cw + 10), d.y, cw, ch));
      d.y -= ch + 8;
    }
    if (list.length) d.table(["Metrik", "Periode ini", "Periode sebelumnya", "Perubahan"], list.map((s) => [s.label, formatValue(s.unit, s.value), formatValue(s.unit, s.previous_value), formatDelta(s.delta_pct)]), [190, 120, 120, 85]);
    if (tiles.length) d.table(["Indikator tambahan", "Nilai"], tiles.map((t) => [t.label, formatValue(t.unit, t.value)]), [340, 175]);
  }

  d.page = pdf.addPage(A4);
  d.y = A4[1] - M;
  d.text("Funnel Aktivasi & Retensi Kohort", M, d.y - 10, 13, { bold: true, color: NAVY });
  d.y -= 20;
  if (data.funnel) {
    d.paragraph(`Kohort daftar ${data.funnel.cohort_from} s.d. ${data.funnel.cohort_to}, jendela 30 hari sejak daftar. Tiap tahap dihitung mandiri.`, 8);
    d.y -= 2;
    for (const st of data.funnel.steps) {
      d.ensure(28);
      d.text(st.label, M, d.y - 8, 8.5);
      const t = `${group3(st.count)}${st.pct === null ? "" : ` | ${st.pct.toFixed(1).replace(".", ",")}%`}`;
      d.text(t, A4[0] - M - d.width(t, 8.5, true), d.y - 8, 8.5, { bold: true });
      d.page.drawRectangle({ x: M, y: d.y - 20, width: A4[0] - 2 * M, height: 7, color: rgb(0.93, 0.95, 0.98) });
      d.page.drawRectangle({ x: M, y: d.y - 20, width: (A4[0] - 2 * M) * Math.min(1, (st.pct ?? 0) / 100), height: 7, color: BLUE });
      d.y -= 28;
    }
    if (data.funnel.median_days_to_first_lead !== null) d.paragraph(`Waktu ke lead pertama (median): ${formatValue("days", data.funnel.median_days_to_first_lead)}`, 8.5, INK);
  } else d.paragraph("Funnel belum tersedia.", 8.5);
  d.y -= 8;
  d.text("Retensi kohort bulanan", M, d.y - 10, 11, { bold: true, color: NAVY });
  d.y -= 20;
  const cohRows = (data.cohorts ?? []).map((c) => [c.cohort, c.size === null ? "-" : group3(c.size), ...c.retention.map((r) => (r === null ? "" : `${r.toFixed(0)}%`))]);
  d.table(["Kohort", "Ukuran", "M0", "M1", "M2", "M3", "M4", "M5"], cohRows, [90, 65, 60, 60, 60, 60, 60, 60]);
  if (data.roles) {
    d.text("Total pengguna per role (snapshot terakhir)", M, d.y - 10, 11, { bold: true, color: NAVY });
    d.y -= 20;
    d.table(["Role", "Jumlah"], data.roles.map((r) => [r.role, group3(r.count)]), [340, 175]);
  }
  d.text("Catatan", M, d.y - 10, 11, { bold: true, color: NAVY });
  d.y -= 20;
  for (const n of data.notes) d.paragraph(n, 8, INK);
  d.y -= 4;
  d.text("Belum bisa ditampilkan", M, d.y - 10, 10, { bold: true, color: NAVY });
  d.y -= 18;
  for (const u of data.unavailable) d.paragraph(`${u.label}: ${u.reason}`, 8, INK);

  return pdf.save();
}
