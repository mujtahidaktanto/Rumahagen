# HASIL TASK P7 — UI Specification
## Komponen Blocking Error & Warning Banner Duplikat Foto — ADR-047 / OD-25

---

## 1. Perubahan — §4.2 Inventaris Komponen Komposit Kustom

**Tambahkan 2 baris baru** ke tabel (setelah baris `RegionCascadeSelect`, mengelompokkan
dengan komponen M03 lain):

```
| `ListingDuplicateBlockModal` | M03 | Modal blocking saat submit ditolak (409) karena foto identik terdeteksi — tampilkan listing yang identik + CTA aksi | Presentational (menerima data via props dari respons API, tidak fetch sendiri) |
| `ListingDuplicateWarningBanner` | M03 | Banner non-blocking di atas form saat submit berhasil namun ada `possible_duplicates` (similarity 90-99%) | Presentational |
```

---

## 2. Perubahan — §17 MP-03 Screen Detail, SCR-M03-01 (Form Listing)

**Tambahkan sub-bagian baru** setelah baris "Field terkunci (Primary tertaut developer)"
di deskripsi `SCR-M03-01`:

```
- **Deteksi duplikat foto saat submit review** (`ADR-047`, API Spec §2 `PATCH /listings/{id}/status`):

  **State: Blocking (409 — foto identik terdeteksi)**
  - **Trigger:** Response API `409 Conflict` dengan `error.code = DUPLICATE_PHOTO_DETECTED`.
  - **Komponen:** `ListingDuplicateBlockModal` (`Dialog` shadcn/ui sebagai basis).
  - **Isi pesan:** "Listing ini memiliki foto yang identik dengan listing **[matched_listing_title]** milik Anda. Foto duplikat harus diganti atau dihapus sebelum listing ini dapat diajukan untuk review." — tidak generik, menyebutkan judul listing yang identik langsung dari `error.details.matched_listing_title`.
  - **Visual:** foto yang terdeteksi identik ditandai border merah + badge "Terdeteksi Duplikat" langsung di galeri upload foto pada step Media (bukan hanya di dalam modal), agar agen langsung tahu foto mana yang bermasalah tanpa harus menebak.
  - **CTA:**
    - **"Lihat Listing Tsb"** — membuka listing yang terdeteksi identik (`matched_listing_id`) di tab baru, agar agen bisa membandingkan langsung.
    - **"Ganti/Hapus Foto"** — menutup modal, mengarahkan fokus ke foto bermasalah di step Media form (bukan sekadar menutup modal begitu saja).
  - **Perilaku submit:** submit **gagal total** — status listing tetap `draft`/tidak berubah, form tidak berpindah step.

  **State: Non-blocking Warning (200 — kemiripan 90-99%)**
  - **Trigger:** Response API `200 OK` dengan field `data.possible_duplicates[]` terisi (minimal 1 entri).
  - **Komponen:** `ListingDuplicateWarningBanner` (banner kuning, mengikuti token warna warning §2.2, ditempatkan sticky di atas form setelah submit berhasil, sebelum redirect ke halaman "Listing Saya").
  - **Isi pesan:** "Submit berhasil — namun beberapa foto pada listing ini terdeteksi mirip (90-99%) dengan listing **[listing_title]** milik Anda. Pastikan ini bukan duplikat yang tidak disengaja." — mengambil `listing_title` dan `similarity_percent` dari `data.possible_duplicates[]`; jika lebih dari 1 entri, tampilkan sebagai daftar ringkas (bukan hanya entri pertama).
  - **Perilaku submit:** submit **tetap berhasil** — status listing berubah ke `pending_review` seperti normal, banner murni informatif, tidak menghalangi navigasi.
  - **Dismissable:** ya, banner dapat ditutup manual oleh agen (ikon close), tidak muncul lagi setelah ditutup untuk sesi submit yang sama.
```

---

## 3. Nada Pesan (konsisten §8 poin 5 — "instruktif, bukan generik")

Kedua komponen mengikuti prinsip yang sudah berlaku di dokumen ini untuk empty
state/error: pesan **menyebutkan konteks spesifik** (nama listing, persentase
kemiripan) dan **memberi langkah lanjutan yang jelas** (CTA konkret), bukan pesan
generik seperti "Terjadi kesalahan" atau "Duplikat ditemukan" tanpa detail.

---

## 4. Yang TIDAK diubah (sesuai Out of Scope)

- Tidak ada implementasi komponen React fisik (`.tsx`) — ini murni spesifikasi.
- Tidak ada layar UI modul lain (M01-M02, M04-M13) yang disentuh.
- Template layout (§3, Template A-F) tidak diubah — kedua komponen baru ini
  adalah elemen di dalam Template D (Form Wizard) yang sudah ada untuk
  `SCR-M03-01`, bukan template baru.

---

## Ringkasan Perubahan (untuk changelog/commit message)

- `UI-Specification-RUMAHAGEN-v1.0.md`: +2 komponen di §4.2
  Inventaris Komponen (`ListingDuplicateBlockModal`, `ListingDuplicateWarningBanner`)
- `MP-03-Listing-Module-Planning-v1.0.md` §17 `SCR-M03-01`: +1 sub-bagian
  deskripsi state blocking & warning
- Rujukan: `ADR-047`, `OD-25`, `API-Specification-...v1.3.md` §2 (hasil P4)

> **Catatan:** perubahan ini menyentuh 2 dokumen (UI Spec §4.2 dan MP-03 §17) karena
> keduanya saling melengkapi — UI Spec mendaftarkan komponennya di inventaris global,
> MP-03 menjelaskan perilakunya di konteks layar spesifik. Ini konsisten pola yang
> sudah ada di dokumen (komponen lain seperti `ListingForm` juga terdaftar di kedua
> tempat). Jika kamu ingin ini dipisah jadi 2 task terpisah, beri tahu.

---

*File ini adalah output kerja task P7. Setelah disalin ke kedua dokumen, siap dipakai
sebagai Reference Document untuk task P8 (technology-decisions.md) berikutnya.*
