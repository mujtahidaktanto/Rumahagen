// lib/analytics/agent-export.ts
// Export mandiri "Statistik Saya" ke Excel dan PDF. Memakai primitif yang
// sama dengan export Dashboard Analytics Admin (xlsx.ts, pdf.ts): tanpa
// dependency baru, logo dari public/assets/rumahagen-logo.png.
// Cakupan organisasi tidak memuat learning/DBR (sudah disaring di DB), jadi
// builder ini tidak perlu menyaring ulang.

import { PDFDocument, StandardFonts, type PDFImage } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import type { AgentStats } from "./agent-stats";
import { enumerateDays } from "./period";
import { packWorkbook, serial, type Cell, type SheetDef, type StyleKey } from "./xlsx";
import { A4, Doc, GRAY, M, NAVY, chartCard, formatDelta, formatValue } from "./pdf";

const LEAD_STATUS_LABEL: Record<string, string> = { new: "Baru", contacted: "Dihubungi", converted: "Menjadi transaksi", lost: "Batal" };
const LISTING_STATUS_LABEL: Record<string, string> = { draft: "Draft", published: "Terbit", pending_review: "Menunggu review", archived: "Diarsipkan", rejected: "Ditolak" };
const BENCH_LABEL: Record<string, string> = { views: "Dilihat", leads: "Lead", conversion: "Konversi lead per tayangan" };

const BAND_FILL = [0, 1, 2, 3]; // sel tambahan pita identitas setelah kolom A (kolom B-E)
const title = (d: AgentStats): string => (d.scope === "own" ? "Statistik Saya" : "Statistik Organisasi");
const rangeText = (d: AgentStats): string =>
  `Rentang ${d.range.from} s.d. ${d.range.to} (${d.range.days} hari)` + (d.previous ? `  |  Pembanding ${d.previous.from} s.d. ${d.previous.to}` : "  |  Tanpa pembanding");
const statusLabel = (map: Record<string, string>, k: string): string => map[k] ?? k;

// ------------------------------------------------------------------ Excel

export function buildAgentStatsWorkbook(d: AgentStats, opts: { exportedBy: string }): Buffer {
  const days = enumerateDays(d.range.from, d.range.to);
  const s = d.summary;

  // Ringkasan
  const sum: Cell[][] = [
    // Pita identitas RumahAgen (pengganti logo gambar): dua baris berwarna melintasi kolom A-E.
    [{ v: "RumahAgen", s: "brand" }, ...BAND_FILL.map(() => ({ v: null, s: "brand" as StyleKey }))],
    [{ v: title(d), s: "brandSub" }, ...BAND_FILL.map(() => ({ v: null, s: "brandSub" as StyleKey }))],
    [{ v: `${rangeText(d)}  |  Data per ${d.generated_at}`, s: "note" }],
    [{ v: `Diekspor oleh: ${opts.exportedBy}. Export ini dicatat di audit log.`, s: "note" }],
    [],
    [{ v: "Metrik", s: "header" }, { v: "Periode ini", s: "header" }, { v: "Periode sebelumnya", s: "header" }, { v: "Perubahan", s: "header" }],
  ];
  const first = sum.length + 1;
  d.series.forEach((sr, i) => {
    const r = first + i;
    sum.push([
      { v: `${sr.label} (total)`, s: "label" },
      { v: sr.value, s: "int" },
      { v: sr.previous_value, s: "int" },
      sr.delta_pct === null ? null : { f: `IF(C${r}=0,"",B${r}/C${r}-1)`, v: sr.delta_pct / 100, s: "delta" },
    ]);
  });
  for (const t of d.tiles) sum.push([{ v: t.label, s: "label" }, { v: t.value === null ? null : t.value / 100, s: "pct" }, null, null, { v: t.note ?? null, s: "note" }]);
  sum.push([]);
  sum.push([{ v: "Listing", s: "bold" }]);
  sum.push([{ v: "Listing terbit", s: "label" }, { v: s.active_listings, s: "int" }]);
  sum.push([{ v: "Listing terbit belum di-refresh > 7 hari", s: "label" }, { v: s.stale_listings, s: "int" }]);
  for (const [k, n] of Object.entries(s.listing_status)) sum.push([{ v: `Status: ${statusLabel(LISTING_STATUS_LABEL, k)}`, s: "label" }, { v: n, s: "int" }]);
  sum.push([]);
  sum.push([{ v: "Pipeline lead (periode ini)", s: "bold" }]);
  for (const [k, n] of Object.entries(s.lead_pipeline)) sum.push([{ v: statusLabel(LEAD_STATUS_LABEL, k), s: "label" }, { v: n, s: "int" }]);
  if (s.quota) {
    sum.push([]);
    sum.push([{ v: "Kuota refresh hari ini", s: "bold" }]);
    sum.push([{ v: "Terpakai", s: "label" }, { v: s.quota.used_today, s: "int" }]);
    sum.push([{ v: "Jatah harian", s: "label" }, { v: s.quota.has_pool ? s.quota.allowance : null, s: "int" }, { v: s.quota.has_pool ? null : "Belum ada kuota aktif", s: "note" }]);
  }
  if (s.learning) {
    sum.push([]);
    sum.push([{ v: "Learning", s: "bold" }]);
    sum.push([{ v: "Kursus berjalan", s: "label" }, { v: s.learning.courses_in_progress, s: "int" }]);
    sum.push([{ v: "Rata-rata progres (%)", s: "label" }, { v: s.learning.avg_progress_percent, s: "int" }]);
    sum.push([{ v: "Saldo poin", s: "label" }, { v: s.learning.points_balance, s: "int" }]);
    sum.push([{ v: "Sertifikat", s: "label" }, { v: s.learning.certificates_total, s: "int" }]);
    sum.push([{ v: "Penghargaan aktif", s: "label" }, { v: s.learning.awards_active, s: "int" }]);
  }
  if (s.dbr) {
    sum.push([]);
    sum.push([{ v: "Simulasi DBR (periode ini)", s: "bold" }]);
    sum.push([{ v: "Total simulasi", s: "label" }, { v: s.dbr.total, s: "int" }]);
    sum.push([{ v: "Layak", s: "label" }, { v: s.dbr.layak, s: "int" }]);
    sum.push([{ v: "Perlu review", s: "label" }, { v: s.dbr.perlu_review, s: "int" }]);
    sum.push([{ v: "Tidak layak", s: "label" }, { v: s.dbr.tidak_layak, s: "int" }]);
    sum.push([{ v: "Prospek tersimpan", s: "label" }, { v: s.dbr.saved_prospects, s: "int" }]);
    sum.push([{ v: "Dibagikan", s: "label" }, { v: s.dbr.shared, s: "int" }]);
  }
  if (d.benchmark) {
    sum.push([]);
    sum.push([{ v: "Perbandingan anonim", s: "bold" }]);
    if (d.benchmark.available) {
      sum.push([{ v: "Metrik", s: "header" }, { v: "Persentil Anda", s: "header" }]);
      for (const m of d.benchmark.metrics) sum.push([{ v: BENCH_LABEL[m.key] ?? m.key, s: "label" }, { v: m.percentile, s: "dec1" }]);
      sum.push([{ v: `Dibanding ${d.benchmark.sample_size} agen dengan listing terbit. Identitas agen lain tidak ditampilkan.`, s: "note" }]);
    } else {
      sum.push([{ v: `Belum tersedia: sampel ${d.benchmark.sample_size} agen, minimal ${d.benchmark.min_sample} agen.`, s: "note" }]);
    }
  }
  const sheets: SheetDef[] = [{ name: "Ringkasan", rows: sum, widths: [46, 18, 20, 14, 40] }];

  // Data harian
  const cols = d.series;
  const daily: Cell[][] = [[{ v: "Data harian", s: "title" }], [{ v: rangeText(d), s: "note" }], [], [{ v: "Tanggal", s: "header" }, ...cols.map((c) => ({ v: c.label, s: "header" as StyleKey }))]];
  const maps = cols.map((c) => new Map(c.current.map((p) => [p.day, p.value])));
  days.forEach((day) => daily.push([{ v: serial(day), s: "date" }, ...cols.map((_, j) => ({ v: maps[j]?.get(day) ?? 0, s: "int" as StyleKey }))]));
  sheets.push({ name: "Harian", rows: daily, widths: [16, ...cols.map(() => 20)], freezeRow: 4 });

  // Listing teratas
  const top: Cell[][] = [[{ v: "Listing teratas", s: "title" }], [{ v: rangeText(d), s: "note" }], [], [{ v: "Listing", s: "header" }, { v: "Status", s: "header" }, { v: "Dilihat", s: "header" }, { v: "Lead", s: "header" }]];
  for (const t of s.top_listings) top.push([{ v: t.title, s: "label" }, { v: statusLabel(LISTING_STATUS_LABEL, t.status), s: "default" }, { v: t.views, s: "int" }, { v: t.leads, s: "int" }]);
  if (!s.top_listings.length) top.push([{ v: "Belum ada tayangan atau lead pada periode ini.", s: "note" }]);
  sheets.push({ name: "Listing", rows: top, widths: [60, 20, 12, 12] });

  // Anggota (organisasi)
  if (s.members) {
    const mr: Cell[][] = [[{ v: "Anggota organisasi", s: "title" }], [{ v: rangeText(d), s: "note" }], [], [{ v: "Anggota", s: "header" }, { v: "Peran", s: "header" }, { v: "Listing terbit", s: "header" }, { v: "Dilihat", s: "header" }, { v: "Lead", s: "header" }, { v: "Refresh", s: "header" }]];
    for (const m of s.members) mr.push([{ v: m.name, s: "label" }, { v: m.is_leader ? "Pemimpin" : "Anggota", s: "default" }, { v: m.active_listings, s: "int" }, { v: m.views, s: "int" }, { v: m.leads, s: "int" }, { v: m.refresh, s: "int" }]);
    sheets.push({ name: "Anggota", rows: mr, widths: [36, 14, 16, 12, 12, 12] });
  }

  const nr: Cell[][] = [[{ v: "Catatan", s: "title" }], []];
  for (const n of d.notes) nr.push([{ v: n, s: "wrap" }]);
  sheets.push({ name: "Catatan", rows: nr, widths: [110] });

  return packWorkbook(sheets);
}

// ------------------------------------------------------------------ PDF

export async function buildAgentStatsPdf(d: AgentStats, opts: { exportedBy: string }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`RumahAgen - ${title(d)}`);
  pdf.setAuthor("RumahAgen");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const doc = new Doc(pdf, font, bold);

  let logo: PDFImage | null = null;
  try {
    logo = await pdf.embedPng(await fs.readFile(path.join(process.cwd(), "public", "assets", "rumahagen-logo.png")));
  } catch {
    logo = null; // logo tidak boleh menggagalkan export
  }
  let headerH = 40;
  if (logo) {
    const w = 170 / 0.76;
    const h = (logo.height / logo.width) * w;
    doc.page.drawImage(logo, { x: M, y: A4[1] - M - h + 4, width: w, height: h });
    headerH = 0.54 * h;
  }
  doc.text(title(d), M + 190, A4[1] - M - 14, 20, { bold: true, color: NAVY });
  doc.text(`Rentang: ${d.range.from} s.d. ${d.range.to} (${d.range.days} hari)`, M + 190, A4[1] - M - 30, 8.5, { color: GRAY });
  doc.text(d.previous ? `Pembanding: ${d.previous.from} s.d. ${d.previous.to}` : "Tanpa perbandingan periode", M + 190, A4[1] - M - 41, 8.5, { color: GRAY });
  doc.text(`Diekspor oleh ${opts.exportedBy} | Data per ${d.generated_at.slice(0, 16).replace("T", " ")} UTC`, M + 190, A4[1] - M - 52, 8, { color: GRAY });
  doc.y = A4[1] - M - Math.max(headerH, 58) - 12;
  doc.page.drawLine({ start: { x: M, y: doc.y + 4 }, end: { x: A4[0] - M, y: doc.y + 4 }, thickness: 1.5, color: NAVY });
  doc.y -= 8;

  const section = (t: string) => { doc.ensure(60); doc.text(t, M, doc.y - 10, 13, { bold: true, color: NAVY }); doc.y -= 20; };
  const s = d.summary;

  section("Ringkasan");
  doc.table(
    ["Metrik", "Periode ini", "Periode sebelumnya", "Perubahan"],
    [
      ...d.series.map((sr) => [sr.label, formatValue(sr.unit, sr.value), formatValue(sr.unit, sr.previous_value), formatDelta(sr.delta_pct)]),
      ...d.tiles.map((t) => [t.label, formatValue(t.unit, t.value), "-", "-"]),
    ],
    [190, 120, 120, 85],
    { size: 8.5 },
  );

  const cw = (A4[0] - 2 * M - 2 * 10) / 3, ch = 92;
  for (let i = 0; i < d.series.length; i += 3) {
    doc.ensure(ch + 8);
    d.series.slice(i, i + 3).forEach((sr, j) => chartCard(doc, sr, M + j * (cw + 10), doc.y, cw, ch));
    doc.y -= ch + 8;
  }

  section("Listing & Lead");
  doc.table(
    ["Indikator", "Nilai"],
    [
      ["Listing terbit", String(s.active_listings)],
      ["Listing terbit belum di-refresh > 7 hari", String(s.stale_listings)],
      ...Object.entries(s.lead_pipeline).map(([k, n]) => [`Lead: ${statusLabel(LEAD_STATUS_LABEL, k)}`, String(n)]),
    ],
    [340, 175],
  );
  if (s.top_listings.length) {
    doc.table(["Listing teratas", "Dilihat", "Lead"], s.top_listings.map((t) => [t.title, String(t.views), String(t.leads)]), [315, 100, 100]);
  }

  if (s.members) {
    section("Anggota Organisasi");
    doc.table(
      ["Anggota", "Terbit", "Dilihat", "Lead", "Refresh"],
      s.members.map((m) => [`${m.name}${m.is_leader ? " (pemimpin)" : ""}`, String(m.active_listings), String(m.views), String(m.leads), String(m.refresh)]),
      [215, 70, 80, 70, 80],
    );
  }
  if (s.quota) {
    section("Kuota");
    doc.table(["Indikator", "Nilai"], [["Refresh terpakai hari ini", String(s.quota.used_today)], ["Jatah harian", s.quota.has_pool ? String(s.quota.allowance) : "Belum ada kuota aktif"]], [340, 175]);
  }
  if (s.learning) {
    section("Learning");
    doc.table(
      ["Indikator", "Nilai"],
      [
        ["Kursus berjalan", String(s.learning.courses_in_progress)],
        ["Rata-rata progres", s.learning.avg_progress_percent === null ? "-" : `${s.learning.avg_progress_percent}%`],
        ["Saldo poin", String(s.learning.points_balance)],
        ["Sertifikat", String(s.learning.certificates_total)],
        ["Penghargaan aktif", String(s.learning.awards_active)],
      ],
      [340, 175],
    );
  }
  if (s.dbr) {
    section("Simulasi DBR");
    doc.table(
      ["Indikator", "Nilai"],
      [["Total simulasi", String(s.dbr.total)], ["Layak", String(s.dbr.layak)], ["Perlu review", String(s.dbr.perlu_review)], ["Tidak layak", String(s.dbr.tidak_layak)], ["Prospek tersimpan", String(s.dbr.saved_prospects)], ["Dibagikan", String(s.dbr.shared)]],
      [340, 175],
    );
  }
  if (d.benchmark) {
    section("Perbandingan Anonim");
    if (d.benchmark.available) {
      doc.table(["Metrik", "Persentil Anda"], d.benchmark.metrics.map((m) => [BENCH_LABEL[m.key] ?? m.key, m.percentile.toFixed(1).replace(".", ",")]), [340, 175]);
      doc.paragraph(`Dibanding ${d.benchmark.sample_size} agen dengan listing terbit. Identitas agen lain tidak ditampilkan.`, 8, GRAY);
    } else {
      doc.paragraph(`Belum tersedia: sampel ${d.benchmark.sample_size} agen, minimal ${d.benchmark.min_sample} agen.`, 8, GRAY);
    }
  }

  section("Catatan");
  for (const n of d.notes) doc.paragraph(n, 8, GRAY);

  return pdf.save();
}
