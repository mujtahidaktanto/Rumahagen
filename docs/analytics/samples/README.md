# Contoh export Dashboard Analytics

Contoh format export (Excel dan PDF) untuk Dashboard Analytics Admin. Semua angka adalah DATA CONTOH,
bukan data nyata RumahAgen, dan cocok dengan data ilustrasi di wireframe `M09-Dashboard-Analytics`.
Rentang contoh: 27 Agu - 25 Sep 2026 (30 hari), pembanding 28 Jul - 26 Agu 2026.
Definisi angka mengikuti `../METRIC_DEFINITIONS_v1.md` (v1.1).

- `RumahAgen_Dashboard_Analytics_Contoh.xlsx`: 10 sheet, total dan perubahan berupa rumus.
- `RumahAgen_Dashboard_Analytics_Contoh.pdf`: 5 halaman, logo di header halaman pertama, tanpa footer.
- `generate_sample.js`: pembangkit kedua file (Node, butuh paket `exceljs`). Menulis `report.html`;
  PDF dicetak dari HTML itu dengan Edge/Chrome headless (`--print-to-pdf`). Logo dibaca dari
  `rumahagen-logo.png` di folder yang sama (salin dari `docs/design/wireframes-v2/assets/`).

Ini bukan implementasi route export. Route `/api/admin/reports/export` belum dibuat.
