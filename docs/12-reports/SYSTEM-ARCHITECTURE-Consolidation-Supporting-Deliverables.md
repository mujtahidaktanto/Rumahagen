# Dokumen Pendukung Konsolidasi SYSTEM-ARCHITECTURE.md — 9 Agustus 2026

> Tiga output berikut adalah **teks siap-tempel**, bukan file yang menimpa dokumen asli Anda — silakan salin bagian relevan ke file governance Anda sendiri. Mengikuti pola yang sama dengan `ADR-Consolidation-Supporting-Deliverables.md` (5 Agustus 2026).

---

## 1. Entry Baru untuk `CHANGELOG.md`

```markdown
## [0.7.3] - 2026-08-09

### Fixed
- **SYSTEM-ARCHITECTURE.md — konflik penomoran versi:** 3 dari 9 snapshot revisi dokumen
  (diupload sebagai `__6_`, `__7_`, `__8_`) ternyata seluruhnya berlabel **"Versi 1.6"
  dan tanggal "3 Agustus 2026" yang identik**, padahal isinya berbeda secara substantif
  dan berurutan kronologis (Modul 12/13 → detail trigger Postgres & AI connection →
  promosi status Baseline + ADR-046 + resolusi OD-02/06/07). Ditemukan lewat audit
  konsolidasi 9 snapshot menjadi 1 file master. Diberi identifier PATCH retroaktif
  1.6.0/1.6.1/1.6.2 di tabel Riwayat Versi internal dokumen untuk membedakan ketiganya;
  file kanonik final setara **1.6.2**.

### Changed
- **SYSTEM-ARCHITECTURE.md** — nomor versi publik **TIDAK dinaikkan** (tetap "1.6") untuk
  menghindari membuat usang rujukan eksplisit di `project-manifest.md` dan
  `Module-Dependency-Matrix-RUMAHAGEN-v1.0.md`; hanya konten
  dikonsolidasikan menjadi satu file kanonik dan ditambahkan Bagian "Riwayat Versi" baru.
- **Aturan penomoran baru ditetapkan** (dicatat di Riwayat Versi dokumen ini sendiri):
  revisi konten pada tanggal yang sama wajib memakai identifier PATCH eksplisit
  (`1.6.1`, `1.6.2`, dst.) — bukan menuliskan ulang angka minor yang sama untuk isi
  yang berbeda. Berlaku untuk seluruh dokumen versi mayor.minor.PATCH ke depan, bukan
  hanya SYSTEM-ARCHITECTURE.md.

### Process Improvement
- **Tidak ditemukan kehilangan konten** pada audit — seluruh 8 diff berurutan (v1.0→1.6.2)
  nihil penghapusan murni tanpa penggantian. Namun ditemukan 2 gap sinkronisasi internal
  yang **belum diperbaiki** (di luar cakupan siklus ini): (a) Daftar Isi dokumen tidak
  mencantumkan Bagian 23–24 sejak v1.5, meski kedua bagian tsb tetap aktif di badan
  dokumen; (b) ADR-046 disebut di header status dokumen tapi tidak punya baris di ADR
  Cross-Reference Matrix (Bagian 24). Direkomendasikan sebagai task perbaikan terpisah.
```

---

## 2. Catatan Pembaruan untuk `project-manifest.md`

> **Tidak perlu mengubah field versi `SYSTEM-ARCHITECTURE.md`** di Bagian 15 (Baseline Status) — tetap `v1.6 (Baseline)`, tidak ada perubahan nilai. Yang perlu ditambahkan adalah **catatan peristiwa konsolidasi** (mengikuti pola Bagian 14A untuk ADR), agar histori audit tetap tercatat meski nomor versi tidak berubah.

Tambahkan section baru setelah Bagian 14A (atau sebagai 14B):

```markdown
## 14B. Document Version Matrix — Konsolidasi SYSTEM-ARCHITECTURE.md (9 Agustus 2026)

> Berbeda dari siklus 14A (ADR, 5 Agustus): siklus ini murni **audit integritas
> penomoran versi**, bukan perubahan isi/keputusan arsitektur. Nomor versi publik
> `SYSTEM-ARCHITECTURE.md` **tidak berubah** — tetap v1.6.

| Document | Versi Sebelumnya | Versi Saat Ini | Jenis Perubahan | Pemicu |
|---|---|---|---|---|
| SYSTEM-ARCHITECTURE.md | 1.6 (3 snapshot berbeda isi, semua berlabel "1.6" identik — ambigu) | **1.6 (tidak berubah nilai; 1 file kanonik, setara 1.6.2 internal)** | Konsolidasi 9 snapshot (v1.0–v1.6) jadi 1 file master; Bagian "Riwayat Versi" baru ditambahkan; identifier PATCH retroaktif 1.6.0/1.6.1/1.6.2 diberikan ke 3 snapshot yang sebelumnya tidak terbedakan | Audit konsolidasi (non-ADR, non-OD) |
| project-manifest.md (dokumen ini) | (versi sebelumnya) | **(naik satu PATCH)** | Mencatat peristiwa konsolidasi SYSTEM-ARCHITECTURE.md — redaksional, tidak ada rujukan versi yang berubah nilainya | Konsolidasi SYSTEM-ARCHITECTURE.md |

**Catatan governance terbuka (belum diperbaiki, di luar cakupan siklus ini):**
- Daftar Isi `SYSTEM-ARCHITECTURE.md` tidak mencantumkan Bagian 23 (Open Questions) & 24 (ADR Cross-Reference Matrix) sejak v1.5, meski kedua bagian tetap ada di badan dokumen.
- `ADR-046` (soft-delete 8 tabel) disebut di header status `SYSTEM-ARCHITECTURE.md` sebagai bagian dari "sinkron penuh", namun tidak punya baris resmi di ADR Cross-Reference Matrix Bagian 24 — matriks berhenti di ADR-028.
```

Juga perbarui baris **Review Schedule** (Bagian 15/16) untuk `SYSTEM-ARCHITECTURE.md` jika Anda ingin memicu review khusus untuk 2 gap di atas — opsional, tidak wajib untuk siklus ini.

## 3. Catatan Pembaruan untuk `document-governance-baseline-register.md`

Tambahkan poin baru di Governance Notes (mengikuti format poin 15/18/19 yang sudah ada):

```markdown
20. **(Baru) 9 Agustus 2026 — Audit konsolidasi penomoran versi `SYSTEM-ARCHITECTURE.md`,
    tidak ada perubahan nilai versi.** Ditemukan 3 dari 9 snapshot revisi dokumen
    (isi berbeda secara berurutan kronologis: penambahan Modul 12/13 → detail teknis
    trigger Postgres & AI connection → promosi status Baseline+ADR-046+OD-02/06/07)
    seluruhnya berlabel **"Versi 1.6" dan tanggal "3 Agustus 2026" identik** — pelanggaran
    prinsip penomoran dokumen ini sendiri (Bagian 6, status **Baseline** semestinya
    merujuk **satu** file tunggal, bukan beberapa kandidat bersaing dengan label sama).
    **Resolusi yang diambil:** nomor versi publik dipertahankan v1.6 (menghindari membuat
    usang rujukan eksternal di `project-manifest.md`/`Module-Dependency-Matrix.md`);
    3 snapshot diberi identifier PATCH retroaktif (1.6.0/1.6.1/1.6.2) di tabel Riwayat
    Versi internal dokumen sendiri; file kanonik tunggal (setara 1.6.2) ditetapkan sebagai
    **satu-satunya rujukan v1.6 yang sah** ke depan — 9 snapshot lama direkomendasikan
    diarsipkan, tidak lagi dokumen aktif (konsisten rekomendasi poin sebelumnya soal
    penamaan file, lihat `ADR-Consolidation-Supporting-Deliverables.md` §4). **Aturan
    baku baru:** revisi konten pada tanggal yang sama wajib memakai identifier PATCH
    eksplisit di field Versi header dokumen manapun, tidak hanya SYSTEM-ARCHITECTURE.md
    — dicatat di sini sebagai konvensi lintas-dokumen mulai siklus ini.
    **Temuan belum diperbaiki (tercatat, bukan diselesaikan sepihak, EAF §8.3):** Daftar
    Isi dokumen tidak mencantumkan Bagian 23–24 sejak v1.5 (konten tetap ada di badan);
    ADR-046 tidak terdaftar di ADR Cross-Reference Matrix Bagian 24.
```

Tambahkan/perbarui baris di tabel Bagian 10 (Baseline Register) untuk `SYSTEM-ARCHITECTURE.md`:

| Dokumen | Versi | Status | Tanggal Baseline Terakhir | Catatan |
|---|---|---|---|---|
| `SYSTEM-ARCHITECTURE.md` | 1.6 | Baseline | 4 Agustus 2026 (tidak berubah) | **9 Agustus 2026:** dikonsolidasi dari 3 snapshot berlabel identik menjadi 1 file kanonik (setara 1.6.2 internal); 9 snapshot lama (v1.0–v1.6) diarsipkan. Nilai versi publik tidak berubah. |

---

## 4. Rekomendasi Tambahan (opsional, tidak wajib dieksekusi sekarang)

1. **`Module-Dependency-Matrix-RUMAHAGEN-v1.0.md`** mengutip `SYSTEM-ARCHITECTURE.md` sebagai **"v1.6, upload `__8_`"** — begitu file kanonik final ini Anda upload ulang ke project dengan nama tetap (mis. `SYSTEM-ARCHITECTURE-v1.6-FINAL.md`), pertimbangkan memperbarui kutipan MDM tsb agar tidak lagi menyebut nomor upload `__8_` yang kini sudah tidak relevan (9 snapshot lama akan diarsipkan).
2. Terapkan aturan penomoran PATCH baru (poin 3 di atas) secara retroaktif ke dokumen lain yang diketahui punya pola serupa (multi-snapshot per hari) — `architecture-decision-records.md` sudah pernah mengalami kasus mirip (9 snapshot, dikonsolidasi 5 Agustus), meski di kasus itu solusinya adalah kenaikan versi minor (1.0→1.1), bukan PATCH, karena hanya ada 1 file per versi (bukan 3 file berlabel sama).

---

*File ini adalah alat operasional pendukung konsolidasi — bukan bagian dari dokumen sumber proyek.*
