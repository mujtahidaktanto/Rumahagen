# Dokumen Pendukung Konsolidasi ADR — 5 Agustus 2026

> Tiga output tambahan sesuai Tugas 5-6 pada prompt konsolidasi: (1) entry CHANGELOG.md baru, (2) catatan pembaruan untuk project-manifest.md & document-governance-baseline-register.md, (3) rekomendasi penamaan file. Ini adalah **teks siap-tempel**, bukan file yang menimpa dokumen asli Anda — silakan salin bagian relevan ke file governance Anda sendiri.

---

## 1. Entry Baru untuk `CHANGELOG.md`

```markdown
## [0.2.2] - 2026-08-05

### Fixed
- **CRITICAL — architecture-decision-records.md:** Regresi status ADR-005 (Search Strategy)
  dan ADR-006 (Job Queue Strategy) yang sempat ter-*revert* keliru ke "OPEN" pada revisi
  30 Juli 2026 **ternyata belum benar-benar dipulihkan** oleh perbaikan 3 Agustus 2026 —
  perbaikan sebelumnya hanya menyentuh narasi ringkasan (Bagian 5/6/7/8, Governance Notes),
  bukan entri sumber otoritatif di Bagian 4, yang tetap berisi teks draf 27 Juli 2026 tanpa
  disadari selama ±6 hari (30 Juli – 4 Agustus 2026). Ditemukan melalui audit konfigurasi
  kata-per-kata terhadap 9 snapshot revisi dokumen saat proses konsolidasi. Entri Bagian 4
  dipulihkan penuh dari sumber terverifikasi (`architecture-decision-records__2_.md`/`__3_.md`),
  dikonfirmasi identik substansi dengan `decision-log.md` ADR-039/ADR-040 yang tidak pernah
  ikut ter-regresi.

### Changed
- **architecture-decision-records.md** naik dari v1.0 → **v1.1**, status **Draft → Baseline**
  (disinkronkan dengan deklarasi `project-manifest.md` 4 Agustus 2026 yang sebelumnya belum
  tercermin di field Status dokumen itu sendiri).
- Field `Dependencies` pada ADR-001 dan ADR-006 diperbarui redaksional — menghapus rujukan
  "masih OPEN" yang sudah usang terhadap ADR-005/006/018 yang senyatanya sudah Approved.
- Ditambahkan baris `Cross-reference: decision-log.md ADR-XXX` pada ADR-001/005/006/008/018
  untuk menyeragamkan gaya penulisan dengan ADR-026/027/028 (temuan Minor, non-blocking).

### Added
- Bagian baru **"1A. Revision History"** di `architecture-decision-records.md` — merangkum
  10 titik revisi dokumen (27 Juli – 5 Agustus 2026) dalam satu tabel di dalam dokumen itu
  sendiri, menggantikan kebutuhan menyimpan 9 file snapshot terpisah untuk konteks historis.
- Governance Notes poin 6 (root-cause analysis pemulihan regresi yang tidak tuntas) dan
  poin 7 (konsistensi gaya cross-reference) di `architecture-decision-records.md`.

### Process Improvement
- Direkomendasikan: setiap klaim "regresi telah dipulihkan" di masa depan wajib disertai
  verifikasi diff/checksum terhadap versi sumber pra-regresi pada level entri, bukan hanya
  pembaruan narasi ringkasan yang merujuknya — lihat Governance Notes poin 6.
```

---

## 2. Catatan Pembaruan untuk `project-manifest.md`

Baris berikut disarankan menggantikan/menambah rujukan `architecture-decision-records.md` yang ada saat ini:

| Field di project-manifest.md | Nilai Baru |
|---|---|
| Versi `architecture-decision-records.md` | v1.0 → **v1.1** (5 Agustus 2026) |
| Status | Baseline (dikonfirmasi ulang — sebelumnya field Status internal dokumen belum sinkron dengan deklarasi ini) |
| Catatan tambahan di §16 (Governance Notes) atau bagian setara | *"Konsolidasi 9 snapshot revisi (27 Jul–4 Ags 2026) menjadi 1 file master pada 5 Agustus 2026 — termasuk perbaikan tuntas regresi ADR-005/ADR-006 yang sempat 'dipulihkan' secara tidak lengkap pada revisi 3 Agustus (hanya narasi, bukan entri sumber). Lihat `architecture-decision-records.md` Bagian 1A (Revision History) dan Governance Notes poin 6."* |
| File aktif untuk diupload sesi berikutnya | `architecture-decision-records-v1.1.md` (tunggal) — 9 file `__1_` s.d. `__9_` tidak lagi aktif, disimpan sebagai arsip historis |

## 3. Catatan Pembaruan untuk `document-governance-baseline-register.md`

Tambahkan baris di tabel status dokumen (Bagian 10 atau bagian setara):

| Dokumen | Versi | Status | Tanggal Baseline Terakhir | Catatan |
|---|---|---|---|---|
| `architecture-decision-records.md` | 1.1 | Baseline | 5 Agustus 2026 | Naik dari 1.0 — konsolidasi + perbaikan regresi ADR-005/006. Snapshot lama (`__1_` s.d. `__9_`) diarsipkan, tidak lagi dokumen aktif. |

---

## 4. Rekomendasi Penamaan File (Tugas 6)

**Masalah yang ditemukan:** Penomoran upload otomatis (`__1_`, `__2_`, ... `__9_`) tidak mencerminkan urutan/isi dokumen kecuali dicek manual — terbukti dari sesi ini yang memerlukan audit kata-per-kata untuk menemukan regresi tersembunyi. Nama file semacam ini juga tidak menunjukkan versi resmi dokumen (yang tercatat di dalam dokumen itu sendiri, mis. "1.0", "1.1") maupun tanggal revisi.

**Rekomendasi:**

1. **Gunakan versi resmi dokumen di nama file**, bukan angka urut upload:
   `architecture-decision-records-v1.0.md`, `architecture-decision-records-v1.1.md`, dst. — konsisten dengan yang sudah dipakai file konsolidasi ini.
2. **Untuk dokumen living/snapshot harian** (seperti `CURRENT-PROJECT-STATE.md` yang memang berubah tiap sesi tanpa selalu naik versi formal), tambahkan tanggal ISO alih-alih nomor urut: `CURRENT-PROJECT-STATE-2026-08-04.md`.
3. **Setelah versi baru dianggap final**, arsipkan versi lama ke sub-folder terpisah (mis. `/archive/`) alih-alih membiarkannya menumpuk di folder upload utama — mengurangi risiko tanpa sadar mengupload versi lama di sesi berikutnya.
4. **Pertimbangkan menjalankan audit konsolidasi seperti sesi ini secara berkala** (mis. setiap kali sebuah dokumen mencapai 3-4 revisi berturut-turut) alih-alih menunggu menumpuk 9 versi — semakin lama regresi tersembunyi dibiarkan, semakin besar risiko dokumen lain (turunan) ikut merujuk isi yang salah.

Ini murni saran — keputusan konvensi penamaan tetap di tangan Anda.
