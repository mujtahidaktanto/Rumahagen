# PAKET PROMPT — Konsolidasi Riwayat Versi Dokumen (v0.1 → Terkini)

> Tujuan: kamu upload **semua versi historis** satu jenis dokumen (mis. seluruh
> `PRD-...v1.0.md`, `v1.1.md`, `v1.2.md`, `v1.3.md`), lalu AI menggabungkannya jadi
> **1 file final** yang (a) memuat isi versi TERKINI sebagai basis, (b) mendeteksi
> jika ada keputusan/isi di versi lama yang **hilang/tidak terbawa** ke versi baru
> tanpa alasan jelas, (c) melaporkan temuan itu, dan (d) opsional menyisipkan
> **riwayat versi ringkas** (changelog internal) di header dokumen final.

> **Cara pakai:** Jalankan **1 jenis dokumen per sesi**, berurutan sesuai Bagian 1
> (urutan ada alasannya — dokumen governance dulu, baru desain, baru tracking).
> Salin **Prompt Generik** di Bagian 0, isi bagian `[...]` sesuai jenis dokumen dari
> tabel Bagian 1, lalu upload seluruh versi file jenis itu di sesi yang sama.

---

# Bagian 0 — Prompt Generik (Master Template)

```
Anda bertindak sebagai auditor & integrator dokumen untuk proyek Platform Web Real
Estate Agency, menjalankan konsolidasi riwayat versi mengikuti prinsip
Engineering Alignment Framework §8.3 (Transparansi Penuh) dan §23 (Synchronization
Rules).

DOKUMEN: [NAMA_JENIS_DOKUMEN] — seluruh versi historis terlampir: [DAFTAR_VERSI]

TUGAS:

1. IDENTIFIKASI VERSI TERKINI
   Tentukan versi mana yang PALING BARU berdasarkan nomor versi eksplisit di
   header/nama file DAN tanggal "Last Updated" — bukan diasumsikan dari nomor
   file terbesar saja (nomor file bisa salah urut karena penamaan sistem upload).
   Jika ada konflik antara nomor versi dan tanggal (mis. v1.3 tertanggal lebih
   lama dari v1.2), LAPORKAN sebagai temuan, jangan pilih sepihak.

2. GUNAKAN VERSI TERKINI SEBAGAI BASIS
   Versi terkini adalah source of truth utama untuk isi dokumen final — JANGAN
   mencampur/rata-rata isi dari beberapa versi, JANGAN "memperbaiki" isi versi
   terkini berdasarkan versi lama kecuali temuan poin 3 mengharuskan.

3. AUDIT KEHILANGAN INFORMASI (bagian terpenting)
   Bandingkan versi terkini terhadap SEMUA versi sebelumnya. Untuk setiap
   keputusan, field, baris tabel, klausa, atau bagian yang ADA di versi lama
   TAPI TIDAK ADA di versi terkini:
   - Cek dulu apakah itu memang SENGAJA dihapus/digantikan (biasanya ada jejak
     di `decision-log.md`/ADR/changelog internal dokumen itu sendiri yang
     menjelaskan kenapa).
   - Jika ADA jejak resmi penghapusannya → catat sebagai "Perubahan Disengaja",
     TIDAK perlu dikembalikan.
   - Jika TIDAK ADA jejak resmi → catat sebagai "Kemungkinan Hilang Tidak
     Disengaja" — JANGAN otomatis dikembalikan ke dokumen final, laporkan dulu
     untuk saya putuskan.

4. RIWAYAT VERSI RINGKAS (opsional, tambahkan jika dokumen belum punya ini)
   Jika dokumen belum memiliki tabel "Riwayat Versi"/"Version History" di
   headernya, susun satu berdasarkan seluruh versi yang saya upload (nomor
   versi, tanggal, ringkasan 1 baris perubahan utama) dan sisipkan di header
   dokumen final. Jika sudah ada, cukup verifikasi kelengkapannya terhadap
   versi yang saya upload — lengkapi baris yang hilang, JANGAN menghapus baris
   yang sudah ada.

5. OUTPUT
   - **File final**: isi PERSIS versi terkini + (jika ada) riwayat versi yang
     dilengkapi — TIDAK ADA isi baru yang dikarang, TIDAK ADA parafrase ulang
     konten yang sudah ada.
   - **Laporan Audit** (terpisah, di awal jawaban Anda sebelum file): tabel
     berisi seluruh temuan poin 3 (Disengaja vs Kemungkinan Hilang Tidak
     Disengaja), dan temuan poin 1 (jika ada konflik nomor versi/tanggal).

ATURAN KERAS:
- JANGAN mengarang isi yang tidak ada di salah satu versi yang saya upload.
- JANGAN menghapus riwayat/versi lama dari laporan audit meski sudah digantikan.
- JANGAN memutuskan sendiri bahwa sesuatu "pasti sengaja dihapus" tanpa jejak
  resmi (decision-log/ADR/changelog) — jika ragu, laporkan sebagai temuan.
- Jika versi yang saya upload ternyata tidak lengkap (ada gap nomor versi,
  mis. saya upload v1.0, v1.2, v1.4 tapi tidak v1.1/v1.3), sebutkan eksplisit
  gap ini — jangan diam-diam mengisi asumsi apa yang berubah di versi yang hilang.
```

---

# Bagian 1 — Daftar Jenis Dokumen & Urutan Eksekusi

> Urutan berikut mengikuti dependency (dokumen governance dasar dulu, baru
> dokumen desain, baru dokumen tracking/meta) — sama seperti pola P1-P13
> sebelumnya. Jalankan berurutan, atau pilih yang paling mendesak dulu.

| # | Jenis Dokumen | `[NAMA_JENIS_DOKUMEN]` diisi | Catatan Khusus |
|---|---|---|---|
| 1 | Project Constitution | `PROJECT-CONSTITUTION.md` | — |
| 2 | Decision Log | `decision-log.md` | Lihat **Catatan A** di Bagian 2 — dokumen ini "living", bukan versi bercabang biasa. |
| 3 | Architecture Decision Records | `architecture-decision-records.md` | Lihat **Catatan A** — penomoran ADR independen dari decision-log.md, jangan disatukan. |
| 4 | PRD | `PRD-RUMAHAGEN.md` | — |
| 5 | Entity Mapping | `Entity-Mapping-RUMAHAGEN.md` | — |
| 6 | ERD (Skema Database) | `ERD-Skema-Database-RUMAHAGEN.md` | — |
| 7 | API Specification | `API-Specification-RUMAHAGEN.md` | — |
| 8 | User Flow | `User-Flow-RUMAHAGEN.md` | — |
| 9 | Authorization & Access Control Specification | `Authorization-Access-Control-Specification.md` | — |
| 10 | Functional Specification | `Functional-Specification-RUMAHAGEN.md` | — |
| 11 | UI Specification | `UI-Specification-RUMAHAGEN.md` | — |
| 12 | Technical Specification | `Technical-Specification-RUMAHAGEN.md` | — |
| 13 | Technology Decisions | `technology-decisions.md` | — |
| 14 | Dependency Manifest | `dependency-manifest.md` | — |
| 15 | System Architecture | `SYSTEM-ARCHITECTURE.md` | — |
| 16 | Development Playbook | `development-playbook.md` | — |
| 17 | Module Planning (×13) | `MP-01-...md` s.d. `MP-13-...md` | Lihat **Catatan B** — 1 sesi PER MODUL (13 sesi terpisah), pakai template sama. |
| 18 | Module Dependency Matrix | `Module-Dependency-Matrix-...md` | — |
| 19 | Module Implementation Strategy | `Module-Implementation-Strategy-...md` | — |
| 20 | Document Governance Baseline Register | `document-governance-baseline-register.md` | Lihat **Catatan A**. |
| 21 | Project Manifest | `project-manifest.md` | Lihat **Catatan A** — kerjakan **PALING TERAKHIR** (rangkum status seluruh dokumen lain). |
| 22 | Current Project State | `CURRENT-PROJECT-STATE.md` | Lihat **Catatan A** — kerjakan **PALING TERAKHIR**, setelah project-manifest. |
| 23 | Changelog | `CHANGELOG.md` | Lihat **Catatan C** — TIDAK dikonsolidasi seperti dokumen lain. |

---

# Bagian 2 — Catatan Khusus per Kategori

### Catatan A — Dokumen "Living Document" (bukan versi bercabang biasa)
`decision-log.md`, `architecture-decision-records.md`, `document-governance-baseline-register.md`,
`project-manifest.md`, `CURRENT-PROJECT-STATE.md` **tidak punya versi historis
terpisah dalam arti "v1.0 lalu dibuang saat v1.1 keluar"** — dokumen ini terus
tumbuh (append-only), setiap revisi menambah baris/section baru, bukan
menggantikan seluruh isi. **Jika kamu upload beberapa snapshot dokumen jenis
ini**, tambahkan baris berikut ke prompt generik sebelum menjalankannya:

```
CATATAN TAMBAHAN: Dokumen ini bersifat APPEND-ONLY (living document) — snapshot
lama BUKAN "versi usang yang digantikan", melainkan potongan riwayat yang
seharusnya SEMUA sudah tercakup di snapshot terbaru secara kumulatif. Tugas
Anda BUKAN mencari isi yang "sengaja dihapus" (poin 3 di atas tidak berlaku
dengan cara yang sama) — melainkan memverifikasi bahwa setiap entri/baris yang
ada di snapshot LAMA benar-benar MASIH ADA (bukan hilang) di snapshot TERBARU.
Jika ada entri di snapshot lama yang hilang di snapshot terbaru, ini KEMUNGKINAN
BESAR adalah bug/regresi (bukan perubahan disengaja) — laporkan sebagai temuan
prioritas tinggi.
```

### Catatan B — Module Planning (13 file)
Untuk `MP-01` s.d. `MP-13`, jalankan **prompt generik yang sama 13 kali**,
satu modul per sesi (upload seluruh versi historis `MP-0X-...md` khusus modul
itu di tiap sesi). Jangan gabungkan beberapa modul planning berbeda dalam satu
sesi — isinya tidak saling berkaitan sebagai "versi dari dokumen yang sama".

### Catatan C — CHANGELOG.md (khusus, JANGAN pakai prompt generik)
`CHANGELOG.md` **sudah berupa riwayat lengkap by design** (setiap rilis adalah
entri permanen, format Keep a Changelog) — mengonsolidasinya seperti dokumen
lain akan salah paham tujuannya. Jika kamu punya beberapa file `CHANGELOG-vX.md`
yang tampak seperti "versi berbeda", kemungkinan besar itu adalah **snapshot
pada titik waktu berbeda dari file yang sama yang terus bertambah** — gunakan
prompt berikut sebagai gantinya:

```
Anda bertindak sebagai auditor CHANGELOG.md. Saya lampirkan beberapa snapshot
CHANGELOG.md dari titik waktu berbeda. TUGAS: verifikasi bahwa snapshot PALING
BARU memuat SELURUH entri rilis yang ada di snapshot-snapshot lebih lama secara
utuh (tidak ada entri rilis yang hilang/terpotong) — CHANGELOG tidak boleh
kehilangan riwayat (Aturan Wajib #1 dokumen ini: history tidak boleh dihapus).
Jika ditemukan entri rilis yang ada di snapshot lama tapi hilang di snapshot
terbaru, laporkan sebagai temuan KRITIS (bukan minor) — ini pelanggaran aturan
eksplisit dokumen itu sendiri. Output: laporan temuan + file final (snapshot
terbaru, dilengkapi entri yang hilang jika ditemukan, ditempatkan di posisi
kronologis yang benar).
```

---

# Bagian 3 — Setelah Semua Selesai

Setelah 23 sesi (atau sebanyak yang relevan) selesai, disarankan **1 sesi
penutup** memakai `Prompt-Drift-Detection-Audit-ADR.md` (sudah dibuat
sebelumnya) — tapi diperluas ke seluruh dokumen, bukan hanya
`architecture-decision-records.md` — untuk memastikan hasil konsolidasi
23 dokumen ini saling konsisten satu sama lain (nomor versi yang saling
dirujuk, status Baseline, dst.), bukan hanya benar secara internal
masing-masing.

---

*Paket prompt ini adalah alat operasional, bukan bagian dari dokumen sumber
proyek. Disimpan untuk dipakai berulang setiap kali diperlukan konsolidasi
riwayat versi.*
