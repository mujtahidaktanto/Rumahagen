const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const N = 30;
const END = new Date(Date.UTC(2026, 8, 25));
const day = (d, k) => new Date(d.getTime() + k * 86400000);
const DAYS = Array.from({ length: N }, (_, i) => day(END, -(N - 1 - i)));
const PDAYS = Array.from({ length: N }, (_, i) => day(DAYS[0], -(N - i)));
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fd = (d) => `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const fs2 = (d) => `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}`;
const RANGE = `${fd(DAYS[0])} – ${fd(DAYS[N - 1])} (${N} hari)`;
const PRANGE = `${fd(PDAYS[0])} – ${fd(PDAYS[N - 1])}`;

const rnd = (i, seed) => { const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
const flow = (base, trend, seed, scale = 1) => Array.from({ length: N }, (_, i) => Math.max(0, base * scale * (1 + 0.18 * Math.sin(i * 0.9 + seed) + 0.12 * (rnd(i, seed) - 0.5)) * (1 + trend * (i / N))));
const stock = (start, growth, seed) => Array.from({ length: N }, (_, i) => start + growth * i + (rnd(i, seed) - 0.5) * growth * 3);
const series = (kind, base, trend, seed, fmt) => {
  const cur = kind === 'flow' ? flow(base, trend, seed) : stock(base, trend, seed);
  const prev = kind === 'flow' ? flow(base, trend * 0.4, seed + 7, 0.9) : stock(base - trend * N, trend, seed + 7);
  const r = fmt === 'pct' ? (v) => Math.round(v * 100) / 100 : Math.round;
  return [cur.map(r), prev.map(r)];
};
const DEF = {
  Pengguna: [['Agen Aktif', 'stock', 1720, 4.2, 1, 'int'], ['Agen Baru', 'flow', 14, 0.25, 2, 'int']],
  Marketplace: [['Listing Baru (dipublikasikan)', 'flow', 38, 0.2, 3, 'int'], ['Lead Total', 'flow', 120, 0.3, 4, 'int'], ['Lead Unik', 'flow', 88, 0.28, 5, 'int'],
    ['Refresh Listing', 'flow', 210, 0.15, 6, 'int'], ['Proyek Developer Baru', 'flow', 1.4, 0.1, 7, 'int'], ['Klaim Proyek Disetujui', 'flow', 3.2, 0.2, 8, 'int'],
    ['Konversi Pengunjung ke Lead (%)', 'stock', 3.1, 0.012, 18, 'pct']],
  Organisasi: [['Organisasi Baru', 'flow', 2.1, 0.15, 9, 'int'], ['Organisasi Aktif', 'stock', 196, 0.6, 10, 'int']],
  Learning: [['Pendaftar Learning (pendaftaran)', 'flow', 26, 0.2, 11, 'int'], ['Pendaftar Learning (pengguna unik)', 'flow', 19, 0.2, 12, 'int'],
    ['Menyelesaikan Learning (qualifying)', 'flow', 11, 0.22, 13, 'int'], ['Learning Points Diterbitkan', 'flow', 480, 0.2, 27, 'int'], ['Sertifikat Diterbitkan', 'flow', 5.5, 0.25, 28, 'int']],
  Komersial: [['GMV Gross (Rp)', 'flow', 11200000, 0.3, 19, 'rp'], ['Subscriber Aktif', 'stock', 280, 1.1, 15, 'int'], ['Pembeli Add-on (unik)', 'flow', 7, 0.2, 16, 'int'], ['MRR (Rp)', 'stock', 128000000, 420000, 17, 'rp']],
  Aktivitas: [['DAU', 'stock', 310, 1.4, 22, 'int'], ['WAU', 'stock', 880, 2.3, 23, 'int'], ['MAU', 'stock', 1720, 4.2, 24, 'int']],
  Risiko: [['Listing Ditolak Moderasi', 'flow', 4.2, -0.05, 25, 'int'], ['Banding Penghargaan Masuk', 'flow', 0.9, 0.1, 26, 'int']],
};
const DATA = {};
for (const g of Object.keys(DEF)) DATA[g] = DEF[g].map((d) => { const [c, p] = series(d[1], d[2], d[3], d[4], d[5]); return { nm: d[0], kind: d[1], fmt: d[5], cur: c, prev: p }; });
const gm = DATA.Komersial[0];
const netC = gm.cur.map((v) => Math.round(v * 0.964)), netP = gm.prev.map((v) => Math.round(v * 0.964));
const subC = netC.map((v) => Math.round(v * 0.649)), subP = netP.map((v) => Math.round(v * 0.649));
DATA.Komersial.push(
  { nm: 'Nilai Transaksi Net (Rp)', kind: 'flow', fmt: 'rp', cur: netC, prev: netP },
  { nm: 'Pendapatan Langganan (Rp)', kind: 'flow', fmt: 'rp', cur: subC, prev: subP },
  { nm: 'Pendapatan Add-on (Rp)', kind: 'flow', fmt: 'rp', cur: netC.map((v, i) => v - subC[i]), prev: netP.map((v, i) => v - subP[i]) });
const sum = (a) => a.reduce((x, y) => x + y, 0);
const stat = (it) => { const v = it.kind === 'flow' ? sum(it.cur) : it.cur[N - 1]; const p = it.kind === 'flow' ? sum(it.prev) : it.prev[N - 1]; return { v, p, d: p ? v / p - 1 : 0 }; };

// ---------------- EXCEL ----------------
const FMT = { int: '#,##0', pct: '0.00', rp: '"Rp" #,##0' };
const A = 'Arial';
const F = (o = {}) => ({ name: A, size: 10, ...o });
const wb = new ExcelJS.Workbook(); wb.creator = 'RumahAgen';
const HEAD = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
const bd = { style: 'thin', color: { argb: 'FFD0D7E2' } }; const BOX = { top: bd, bottom: bd, left: bd, right: bd };
const BLUE = 'FF0000FF', GREEN = 'FF008000';
const ref = {};
const colL = (n) => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const setv = (ws, addr, v, o = {}) => { const c = ws.getCell(addr); c.value = v; c.font = F(o.font); if (o.fmt) c.numFmt = o.fmt; if (o.border) c.border = BOX; return c; };
const title = (ws, t, sub) => {
  setv(ws, 'A1', t, { font: { size: 14, bold: true } }); setv(ws, 'A2', sub, { font: { color: { argb: 'FF666666' } } });
  setv(ws, 'A3', 'DATA CONTOH untuk uji format export. Angka ilustrasi, bukan data nyata RumahAgen.', { font: { bold: true, color: { argb: 'FFB45309' } } });
};
const head = (ws, row, labels) => labels.forEach((t, i) => { const c = ws.getCell(row, 1 + i); c.value = t; c.font = F({ bold: true, color: { argb: 'FFFFFFFF' } }); c.fill = HEAD; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; c.border = BOX; });

function groupSheet(name, judul, note) {
  const ws = wb.addWorksheet(name, { views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 7 }] });
  title(ws, judul, `Rentang ${RANGE}  |  Pembanding ${PRANGE}`);
  setv(ws, 'A4', note, { font: { size: 9, color: { argb: 'FF666666' } } });
  const items = DATA[name];
  setv(ws, 'A6', 'Ringkasan periode', { font: { bold: true, size: 11 } });
  head(ws, 7, ['Metrik', 'Periode ini', 'Periode sebelumnya', 'Perubahan']);
  const r0 = 8 + items.length + 3, p0 = r0 + N + 3;
  setv(ws, `A${r0 - 1}`, 'Data harian, periode ini', { font: { bold: true, size: 11 } });
  head(ws, r0, ['Tanggal', ...items.map((i) => i.nm)]);
  setv(ws, `A${p0 - 1}`, 'Data harian, periode pembanding', { font: { bold: true, size: 11 } });
  head(ws, p0, ['Tanggal', ...items.map((i) => i.nm)]);
  DAYS.forEach((d, k) => setv(ws, `A${r0 + 1 + k}`, d, { fmt: 'dd mmm yyyy' }));
  PDAYS.forEach((d, k) => setv(ws, `A${p0 + 1 + k}`, d, { fmt: 'dd mmm yyyy' }));
  items.forEach((it, j) => {
    const col = colL(2 + j);
    for (let k = 0; k < N; k++) { setv(ws, `${col}${r0 + 1 + k}`, it.cur[k], { fmt: FMT[it.fmt], font: { color: { argb: BLUE } } }); setv(ws, `${col}${p0 + 1 + k}`, it.prev[k], { fmt: FMT[it.fmt], font: { color: { argb: BLUE } } }); }
    const rr = 8 + j, s = stat(it);
    setv(ws, `A${rr}`, it.nm + (it.kind === 'flow' ? ' (total)' : ' (posisi akhir)'), { border: true });
    const fc = it.kind === 'flow' ? `SUM(${col}${r0 + 1}:${col}${r0 + N})` : `${col}${r0 + N}`;
    const fp = it.kind === 'flow' ? `SUM(${col}${p0 + 1}:${col}${p0 + N})` : `${col}${p0 + N}`;
    setv(ws, `B${rr}`, { formula: fc, result: s.v }, { fmt: FMT[it.fmt], border: true });
    setv(ws, `C${rr}`, { formula: fp, result: s.p }, { fmt: FMT[it.fmt], border: true });
    setv(ws, `D${rr}`, { formula: `IF(C${rr}=0,"",B${rr}/C${rr}-1)`, result: s.d }, { fmt: '+0.0%;-0.0%;0.0%', border: true });
    ref[`${name}|${it.nm}`] = { sheet: name, cur: `B${rr}`, prev: `C${rr}`, dl: `D${rr}`, fmt: it.fmt, ...s, r0, col };
  });
  ws.getColumn(1).width = 44; for (let j = 0; j < items.length; j++) ws.getColumn(2 + j).width = 20;
  return { ws, r0, after: p0 + N + 3 };
}
const wsSum = wb.addWorksheet('Ringkasan', { views: [{ showGridLines: false }] });
const P = groupSheet('Pengguna', 'Pengguna & Agen', 'Agen aktif = minimal 1 aktivitas bermakna (login, buat/ubah/refresh listing, terima lead) dalam 30 hari. Staf, akun uji, dan terhapus dikeluarkan.');
let row = P.after;
setv(P.ws, `A${row}`, 'Total pengguna per role (posisi akhir)', { font: { bold: true, size: 11 } }); head(P.ws, row + 1, ['Role', 'Jumlah', 'Porsi']);
const roles = [['Agent', 2418], ['Buyer', 132], ['Instructor', 46], ['Developer Partner', 18]];
const rtot = sum(roles.map((r) => r[1]));
roles.forEach(([nm, v], i) => { const rr = row + 2 + i; setv(P.ws, `A${rr}`, nm); setv(P.ws, `B${rr}`, v, { fmt: '#,##0', font: { color: { argb: BLUE } } }); setv(P.ws, `C${rr}`, { formula: `B${rr}/SUM($B$${row + 2}:$B$${row + 1 + roles.length})`, result: v / rtot }, { fmt: '0.0%' }); });
const rt = row + 2 + roles.length; const AGEN_ROW = row + 2;
setv(P.ws, `A${rt}`, 'Total pengguna (tanpa staf)', { font: { bold: true } }); setv(P.ws, `B${rt}`, { formula: `SUM(B${row + 2}:B${rt - 1})`, result: rtot }, { fmt: '#,##0' });
setv(P.ws, `A${rt + 1}`, 'Staf internal (dilaporkan terpisah)'); setv(P.ws, `B${rt + 1}`, 9, { font: { color: { argb: BLUE } } });
setv(P.ws, `A${rt + 3}`, 'Agen dormant (>90 hari)'); setv(P.ws, `B${rt + 3}`, 214, { fmt: '#,##0', font: { color: { argb: BLUE } } });
setv(P.ws, `A${rt + 4}`, 'Agen suspended saat ini (stok, tanpa tren)'); setv(P.ws, `B${rt + 4}`, 37, { font: { color: { argb: BLUE } } }); const SUSP_ROW = rt + 4;

const M = groupSheet('Marketplace', 'Marketplace', 'Lead = klik CTA WhatsApp; lead unik didedup per pengunjung per listing per hari. Klik pemilik listing dan bot dikeluarkan.');
setv(M.ws, `A${M.after}`, 'Indikator kesehatan marketplace', { font: { bold: true, size: 11 } });
[['Listing aktif (porsi)', 0.78, '0%'], ['Listing kedaluwarsa (porsi)', 0.22, '0%'], ['Lead per listing aktif', 3.4, '0.0'], ['Waktu ke lead pertama, median (hari)', 2.3, '0.0']].forEach(([l, v, f], i) => { setv(M.ws, `A${M.after + 1 + i}`, l); setv(M.ws, `B${M.after + 1 + i}`, v, { fmt: f, font: { color: { argb: BLUE } } }); });
groupSheet('Organisasi', 'Organisasi', 'Organisasi aktif = status active, tidak dalam penutupan, tidak suspended. Tren penutupan tidak ditampilkan.');
const Lr = groupSheet('Learning', 'Learning RumahAgen', 'Menyelesaikan = completion qualifying. Completion rate dihitung per kohort pendaftaran.');
setv(Lr.ws, `A${Lr.after}`, 'Completion rate (kohort)'); setv(Lr.ws, `B${Lr.after}`, 0.624, { fmt: '0.0%', font: { color: { argb: BLUE } } });
const K = groupSheet('Komersial', 'Komersial', 'Transaksi sukses = settlement/capture terverifikasi. Net = gross dikurangi refund dan chargeback. Tanggal transaksi = paid_at. Free membership tidak dihitung subscriber.');
const kr = K.after; setv(K.ws, `A${kr}`, 'Indikator unit economics', { font: { bold: true, size: 11 } });
const gmR = ref['Komersial|GMV Gross (Rp)'], netR = ref['Komersial|Nilai Transaksi Net (Rp)'], addR = ref['Komersial|Pendapatan Add-on (Rp)'], mrrR = ref['Komersial|MRR (Rp)'];
const krow = [['ARR (MRR x 12)', { formula: `${mrrR.cur}*12`, result: mrrR.v * 12 }, '"Rp" #,##0', false],
  ['Refund rate (refund + chargeback / gross)', { formula: `1-${netR.cur}/${gmR.cur}`, result: 1 - netR.v / gmR.v }, '0.0%', false],
  ['Porsi pendapatan add-on', { formula: `${addR.cur}/${netR.cur}`, result: addR.v / netR.v }, '0.0%', false],
  ['ARPU pengguna berbayar (Rp)', 475000, '"Rp" #,##0', true], ['ARPU semua agen aktif (Rp)', 82000, '"Rp" #,##0', true], ['Churn langganan (masa tenggang 7 hari)', 0.032, '0.0%', true]];
krow.forEach(([l, v, f, inp], i) => { setv(K.ws, `A${kr + 1 + i}`, l); setv(K.ws, `B${kr + 1 + i}`, v, { fmt: f, font: inp ? { color: { argb: BLUE } } : {} }); });
const Ak = groupSheet('Aktivitas', 'Aktivitas & Retensi', 'DAU/WAU/MAU dihitung dari agen aktif. Stickiness = rata-rata DAU / MAU akhir.');
const dauR = ref['Aktivitas|DAU'], mauR = ref['Aktivitas|MAU'];
const dau = DATA.Aktivitas[0].cur, mau = DATA.Aktivitas[2].cur;
setv(Ak.ws, `A${Ak.after}`, 'Stickiness (rata-rata DAU / MAU akhir)');
setv(Ak.ws, `B${Ak.after}`, { formula: `AVERAGE(B${Ak.r0 + 1}:B${Ak.r0 + N})/D${Ak.r0 + N}`, result: (sum(dau) / N) / mau[N - 1] }, { fmt: '0.0%' });
setv(Ak.ws, `A${Ak.after + 1}`, 'Churn agen bulanan (aktif menjadi dormant >90 hari)'); setv(Ak.ws, `B${Ak.after + 1}`, 0.041, { fmt: '0.0%', font: { color: { argb: BLUE } } });
const Rk = groupSheet('Risiko', 'Kualitas & Risiko', 'Suspended hanya sebagai rasio saat ini; tren suspended dan penutupan organisasi tidak ditampilkan.');
setv(Rk.ws, `A${Rk.after}`, 'Rasio agen suspended (saat ini)'); setv(Rk.ws, `B${Rk.after}`, { formula: `Pengguna!B${SUSP_ROW}/Pengguna!B${AGEN_ROW}`, result: 37 / 2418 }, { fmt: '0.0%', font: { color: { argb: GREEN } } });
setv(Rk.ws, `A${Rk.after + 1}`, 'Kasus rekonsiliasi terbuka (saat ini)'); setv(Rk.ws, `B${Rk.after + 1}`, 7, { font: { color: { argb: BLUE } } });
setv(Rk.ws, `A${Rk.after + 2}`, 'Banding menunggu keputusan (saat ini)'); setv(Rk.ws, `B${Rk.after + 2}`, 3, { font: { color: { argb: BLUE } } });

const wf = wb.addWorksheet('Funnel_Kohort', { views: [{ showGridLines: false }] });
title(wf, 'Funnel Aktivasi & Retensi Kohort', 'Kohort daftar bulan lalu, jendela 30 hari sejak tanggal daftar. Retensi = agen aktif.');
head(wf, 5, ['Tahap', 'Jumlah agen', '% dari pendaftar']);
const fun = [['Daftar', 1000], ['Terverifikasi', 812], ['Listing pertama dipublikasikan', 574], ['Lead pertama', 341], ['Pembayaran pertama', 96]];
fun.forEach(([nm, v], i) => { setv(wf, `A${6 + i}`, nm); setv(wf, `B${6 + i}`, v, { fmt: '#,##0', font: { color: { argb: BLUE } } }); setv(wf, `C${6 + i}`, { formula: `B${6 + i}/$B$6`, result: v / 1000 }, { fmt: '0.0%' }); });
head(wf, 13, ['Kohort', 'M0', 'M1', 'M2', 'M3', 'M4', 'M5']);
const coh = [['Apr 2026', [1, .71, .62, .55, .51, .48]], ['Mei 2026', [1, .74, .64, .57, .52, null]], ['Jun 2026', [1, .76, .66, .59, null, null]], ['Jul 2026', [1, .78, .68, null, null, null]], ['Agu 2026', [1, .80, null, null, null, null]], ['Sep 2026', [1, null, null, null, null, null]]];
const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
coh.forEach(([nm, vals], i) => { setv(wf, `A${14 + i}`, nm); vals.forEach((v, j) => { if (v !== null) { const c = setv(wf, `${colL(2 + j)}${14 + i}`, v, { fmt: '0%', font: { color: { argb: BLUE } } }); c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${hex(255 - 150 * v)}${hex(255 - 110 * v)}FF` } }; } }); });
wf.getColumn(1).width = 34; for (let j = 2; j <= 7; j++) wf.getColumn(j).width = 14;

title(wsSum, 'RumahAgen — Dashboard Analytics (Contoh Export)', `Rentang ${RANGE}  |  Pembanding ${PRANGE}  |  Data per ${fd(END)}  |  Definisi: Metric Definitions v1.1`);
setv(wsSum, 'A4', 'Diekspor oleh: Superadmin (contoh). Export dicatat di audit log.', { font: { size: 9, color: { argb: 'FF666666' } } });
head(wsSum, 6, ['Ringkasan', 'Periode ini', 'Periode sebelumnya', 'Perubahan']);
const KP = [['Pengguna', 'Agen Aktif'], ['Pengguna', 'Agen Baru'], ['Marketplace', 'Listing Baru (dipublikasikan)'], ['Marketplace', 'Lead Unik'], ['Komersial', 'Nilai Transaksi Net (Rp)'], ['Komersial', 'MRR (Rp)']];
KP.forEach(([g, nm], i) => {
  const r = ref[`${g}|${nm}`]; setv(wsSum, `A${7 + i}`, nm, { font: { bold: true }, border: true });
  setv(wsSum, `B${7 + i}`, { formula: `${g}!${r.cur}`, result: r.v }, { fmt: FMT[r.fmt], font: { color: { argb: GREEN } }, border: true });
  setv(wsSum, `C${7 + i}`, { formula: `${g}!${r.prev}`, result: r.p }, { fmt: FMT[r.fmt], font: { color: { argb: GREEN } }, border: true });
  setv(wsSum, `D${7 + i}`, { formula: `${g}!${r.dl}`, result: r.d }, { fmt: '+0.0%;-0.0%;0.0%', font: { color: { argb: GREEN } }, border: true });
});
setv(wsSum, 'A14', 'Kelompok metrik', { font: { bold: true, size: 11 } });
[['Pengguna', 'Agen aktif, agen baru, total per role, dormant, suspended'], ['Marketplace', 'Listing, lead, refresh, proyek, klaim, konversi, kesehatan marketplace'], ['Organisasi', 'Organisasi baru dan aktif'], ['Learning', 'Pendaftar, penyelesaian, poin, sertifikat'],
  ['Komersial', 'GMV, net, langganan vs add-on, subscriber, MRR/ARR, refund rate, ARPU, churn'], ['Aktivitas', 'DAU, WAU, MAU, stickiness, churn agen'], ['Risiko', 'Moderasi, banding, rekonsiliasi, rasio suspended'], ['Funnel_Kohort', 'Funnel aktivasi dan retensi kohort']]
  .forEach(([a, b], i) => { setv(wsSum, `A${15 + i}`, a, { font: { bold: true } }); setv(wsSum, `B${15 + i}`, b); });
setv(wsSum, 'A24', 'Legenda: biru = angka masukan contoh; hitam = rumus; hijau = tautan antar sheet.', { font: { size: 9, color: { argb: 'FF666666' } } });
wsSum.getColumn(1).width = 34; ['B', 'C', 'D'].forEach((c) => { wsSum.getColumn(c).width = 22; });

const wd = wb.addWorksheet('Definisi', { views: [{ showGridLines: false }] });
title(wd, 'Definisi Metrik (ringkas, v1.1)', 'Sumber lengkap: docs/analytics/METRIC_DEFINITIONS_v1.md');
head(wd, 5, ['Istilah', 'Definisi']);
[['Zona waktu', 'WIB; hari berganti 00:00 WIB; tanggal transaksi = paid_at'], ['Agen aktif', 'Minimal 1 aktivitas bermakna dalam 30 hari; staf, akun uji, terhapus dikeluarkan'], ['Lead', 'Klik CTA WhatsApp; lead unik didedup per pengunjung per listing per hari; klik pemilik dan bot dikeluarkan'],
  ['Transaksi sukses', 'settlement/capture dan verification_state = verified'], ['Net', 'Gross dikurangi refund dan chargeback'], ['MRR / ARR', 'Langganan tahunan dibagi 12; ARR = MRR x 12; free membership tidak dihitung'],
  ['Churn langganan', 'Berakhir tanpa perpanjangan setelah masa tenggang 7 hari'], ['Completion rate', 'Per kohort pendaftaran'], ['Batasan', 'Tren agen suspended dan organisasi ditutup tidak ditampilkan; take rate tidak dipakai']]
  .forEach(([a, b], i) => { setv(wd, `A${6 + i}`, a, { font: { bold: true } }); const c = setv(wd, `B${6 + i}`, b); c.alignment = { wrapText: true, vertical: 'top' }; });
wd.getColumn(1).width = 24; wd.getColumn(2).width = 100;

// ---------------- HTML → PDF ----------------
const idn = (v, fmt) => {
  if (fmt === 'rp') { if (v >= 1e9) return 'Rp ' + (v / 1e9).toFixed(2).replace('.', ',') + ' M'; if (v >= 1e6) return 'Rp ' + Math.round(v / 1e6).toLocaleString('id-ID') + ' jt'; return 'Rp ' + Math.round(v).toLocaleString('id-ID'); }
  if (fmt === 'pct') return v.toFixed(2).replace('.', ',') + '%';
  return Math.round(v).toLocaleString('id-ID');
};
const dtxt = (d) => (d >= 0 ? '+' : '-') + Math.abs(d * 100).toFixed(1).replace('.', ',') + '%';
const spark = (it) => {
  const W = 300, H = 80, all = it.cur.concat(it.prev), lo = Math.min(...all), hi = Math.max(...all);
  const pt = (a) => a.map((v, i) => `${((i / (N - 1)) * W).toFixed(1)},${(H - 6 - ((v - lo) / ((hi - lo) || 1)) * (H - 12)).toFixed(1)}`);
  const c = pt(it.cur), p = pt(it.prev);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="64" preserveAspectRatio="none"><polygon points="${c.join(' ')} ${W},${H} 0,${H}" fill="#2563EB" opacity=".10"/><polyline points="${p.join(' ')}" fill="none" stroke="#9AA5B4" stroke-width="1.2" stroke-dasharray="4 3"/><polyline points="${c.join(' ')}" fill="none" stroke="#2563EB" stroke-width="1.8"/></svg>`;
};
const card = (it) => { const s = stat(it); return `<div class="card"><div class="ct">${it.nm}</div><div class="cv">${idn(s.v, it.fmt)} <span class="d ${s.d >= 0 ? 'up' : 'dn'}">${dtxt(s.d)}</span></div>${spark(it)}<div class="ax"><span>${fs2(DAYS[0])}</span><span>${fs2(DAYS[N - 1])}</span></div></div>`; };
const tbl = (rows, head2) => `<table><thead><tr>${head2.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const NAMES = { Pengguna: 'Pengguna & Agen', Marketplace: 'Marketplace', Organisasi: 'Organisasi', Learning: 'Learning RumahAgen', Komersial: 'Komersial', Aktivitas: 'Aktivitas & Retensi', Risiko: 'Kualitas & Risiko' };
const INFO = { Pengguna: 'Agen aktif = minimal 1 aktivitas bermakna dalam 30 hari. Staf, akun uji, dan terhapus dikeluarkan.', Marketplace: 'Lead = klik CTA WhatsApp; lead unik didedup per pengunjung per listing per hari.', Organisasi: 'Organisasi aktif = status active, tidak dalam penutupan, tidak suspended.', Learning: 'Menyelesaikan = completion qualifying. Completion rate per kohort pendaftaran.', Komersial: 'Transaksi sukses = settlement/capture terverifikasi. Net = gross dikurangi refund dan chargeback.', Aktivitas: 'DAU/WAU/MAU dari agen aktif. Stickiness = rata-rata DAU / MAU.', Risiko: 'Suspended hanya sebagai rasio saat ini; tren suspended dan penutupan organisasi tidak ditampilkan.' };
const EXTRA = { Pengguna: [['Agent', '2.418'], ['Buyer', '132'], ['Instructor', '46'], ['Developer Partner', '18'], ['Staf internal (terpisah)', '9'], ['Agen dormant (>90 hari)', '214'], ['Agen suspended saat ini (stok)', '37'], ['Rasio agen suspended', '1,5%']],
  Marketplace: [['Listing aktif vs kedaluwarsa', '78% / 22%'], ['Lead per listing aktif', '3,4'], ['Waktu ke lead pertama (median)', '2,3 hari']], Learning: [['Completion rate (kohort)', '62,4%']],
  Komersial: [['ARR (MRR x 12)', idn(mrrR.v * 12, 'rp')], ['Refund rate', ((1 - netR.v / gmR.v) * 100).toFixed(1).replace('.', ',') + '%'], ['Porsi pendapatan add-on', ((addR.v / netR.v) * 100).toFixed(1).replace('.', ',') + '%'], ['ARPU pengguna berbayar', 'Rp 475 rb'], ['ARPU semua agen aktif', 'Rp 82 rb'], ['Churn langganan (tenggang 7 hari)', '3,2%']],
  Aktivitas: [['Stickiness (DAU / MAU)', ((sum(dau) / N / mau[N - 1]) * 100).toFixed(1).replace('.', ',') + '%'], ['Churn agen bulanan', '4,1%']], Risiko: [['Kasus rekonsiliasi terbuka', '7'], ['Banding menunggu keputusan', '3']] };
const sections = Object.keys(NAMES).map((g) => `<section><h2>${NAMES[g]}</h2><p class="s">${INFO[g]}</p><div class="grid">${DATA[g].map(card).join('')}</div>${tbl(DATA[g].map((it) => { const s = stat(it); return [it.nm, idn(s.v, it.fmt), idn(s.p, it.fmt), dtxt(s.d)]; }), ['Metrik', 'Periode ini', 'Periode sebelumnya', 'Perubahan'])}${EXTRA[g] ? `<div class="gap"></div>${tbl(EXTRA[g], ['Indikator tambahan', 'Nilai'])}` : ''}</section>`).join('');
const cohT = `<table class="coh"><thead><tr><th>Kohort</th>${['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m) => `<th>${m}</th>`).join('')}</tr></thead><tbody>${coh.map(([nm, vals]) => `<tr><td>${nm}</td>${vals.map((v) => v === null ? '<td></td>' : `<td style="background:rgb(${Math.round(255 - 150 * v)},${Math.round(255 - 110 * v)},255);color:${v > 0.6 ? '#fff' : '#111'};text-align:center">${Math.round(v * 100)}%</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>RumahAgen Dashboard Analytics (Contoh)</title><style>
@page{size:A4;margin:14mm 14mm 16mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#1b2430;margin:0}
h1{font-size:22px;color:#1F3A5F;margin:0 0 2px}h2{font-size:14px;color:#1F3A5F;margin:14px 0 2px}.s{color:#555;margin:0 0 8px;font-size:9.5px}
.warn{background:#FFF4CE;color:#B45309;font-weight:bold;padding:6px 8px;margin:8px 0 10px;border-radius:3px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}.card{border:1px solid #D0D7E2;border-radius:5px;padding:7px 8px;break-inside:avoid}
.ct{font-weight:bold;font-size:9.5px;color:#1F3A5F}.cv{font-size:15px;font-weight:bold;margin:2px 0}.d{font-size:9px;font-weight:bold;border-radius:8px;padding:1px 5px}.up{background:#DCFCE7;color:#166534}.dn{background:#FEE2E2;color:#991B1B}
.ax{display:flex;justify-content:space-between;color:#777;font-size:8px}table{width:100%;border-collapse:collapse;margin-top:2px}th{background:#1F3A5F;color:#fff;text-align:left;padding:4px 6px;font-size:9px}
td{border:1px solid #D0D7E2;padding:3px 6px}td.n{text-align:right}tbody tr:nth-child(even){background:#F6F9FE}.gap{height:6px}section{break-inside:auto}.pb{break-before:page}
.hdr{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1F3A5F;padding-bottom:8px;margin-bottom:4px}.logo{width:200px;height:46px;overflow:hidden;flex:none}.logo img{width:263px;display:block}.flogo{width:90px;height:21px;overflow:hidden;flex:none;margin-right:8px}.flogo img{width:118px;display:block}.foot{align-items:center;position:fixed;bottom:0;left:0;right:0;font-size:8px;color:#777;display:flex;justify-content:space-between}</style></head><body>
<div class="hdr"><div class="logo"><img src="rumahagen-logo.png" alt="RumahAgen"></div><div><h1>Dashboard Analytics</h1><div class="s">Rentang: <b>${RANGE}</b> &nbsp;|&nbsp; Pembanding: ${PRANGE}<br>Diekspor oleh Superadmin (contoh) &nbsp;|&nbsp; Data per ${fd(END)}, 06:00 WIB</div></div></div>
<div class="warn">DATA CONTOH untuk menguji format export. Angka ilustrasi, bukan data nyata RumahAgen.</div>
<h2>Ringkasan</h2>${tbl(KP.map(([g, nm]) => { const r = ref[`${g}|${nm}`]; return [nm, idn(r.v, r.fmt), idn(r.p, r.fmt), dtxt(r.d)]; }), ['Metrik', 'Periode ini', 'Periode sebelumnya', 'Perubahan'])}
${sections}
<section class="pb"><h2>Funnel Aktivasi &amp; Retensi Kohort</h2><p class="s">Kohort daftar bulan lalu, jendela 30 hari sejak tanggal daftar.</p>
${tbl(fun.map(([a, b]) => [a, idn(b, 'int'), (b / 10).toFixed(1).replace('.', ',') + '%']), ['Tahap', 'Jumlah agen', '% dari pendaftar'])}<div class="gap"></div>${cohT}
<h2>Catatan</h2><p class="s">Tren agen suspended per hari dan organisasi ditutup per hari tidak ditampilkan (keputusan v1). Take rate tidak dipakai. Untuk metrik berbasis login, riwayat akurat hanya sejak snapshot harian berjalan. Definisi lengkap: docs/analytics/METRIC_DEFINITIONS_v1.md.</p></section></body></html>`;
fs.writeFileSync(path.join(OUT, 'report.html'), html);
wb.xlsx.writeFile(path.join(OUT, 'RumahAgen_Dashboard_Analytics_Contoh.xlsx')).then(() => console.log('xlsx ok'));
