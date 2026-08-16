# ADR-047 — Image Duplicate Detection untuk Listing Properti (Exact + Perceptual Hash)

| Field | Value |
|---|---|
| **Date** | 8 Agustus 2026 |
| **Status** | ✅ Approved |
| **Category** | Backend, Database |
| **Related Documents** | `technology-decisions.md` (§4.30), `dependency-manifest.md`, `ERD-Skema-Database-RUMAHAGEN-v1.4.md`, `decision-log.md` (OD-25) |
| **Owner/Approver** | Mujtahid Aktanto (Solo Project Owner, AI-Assisted) |

---

## Problem

Tidak ada mekanisme mendeteksi listing duplikat dari kemiripan foto antar-listing milik agen yang sama. Kompresi client-side (`browser-image-compression`, ADR-027) mengubah byte file sebelum upload, sehingga exact-hash saja tidak cukup menangkap re-upload foto yang sama.

## Decision

Tambahkan kolom `file_hash` (SHA-256) dan `photo_hash` (perceptual hash, 64-bit) di `listing_photos`, dihitung server-side saat upload menggunakan library **`image-hash`**. Saat agen submit listing untuk review, jalankan pengecekan terhadap foto milik listing aktif (`published`/`pending_review`) **milik `agent_id` yang sama saja**:

| Kondisi | Similarity | Hamming Distance | Aksi |
|---|---|---|---|
| Identik — `file_hash` exact match ATAU `photo_hash` HD=0 | 100% | HD = 0 | 🔴 **Blocking** — submit ditolak, pesan menyebutkan listing yang identik |
| Sangat mirip | 90–99% | HD 1–6 | 🟡 **Non-blocking warning** — submit tetap diizinkan |
| Cukup beda | <90% | HD > 6 | ⚪ Tidak di-flag |

## Reason

Menutup gap deteksi duplikat tanpa menambah vendor AI vision berbayar (selaras `technology-decisions.md` Bagian 2 — 10 prinsip pemilihan teknologi). Pemilihan `image-hash` (pure JavaScript, tanpa native binding) konsisten dengan preseden ADR-027 yang menghindari binary besar/cold-start lambat di lingkungan serverless Vercel.

## Alternatives Considered

- **Exact hash (SHA-256) saja** — ditolak, gagal menangkap file hasil kompresi ulang.
- **Vector embedding/CLIP via API pihak ketiga** — ditolak, menambah vendor berbayar tanpa kebutuhan mendesak.
- **`sharp` + `blockhash-core`** — ditolak sebagai pilihan utama; `sharp` bukan dependency yang sudah ada di proyek dan menambah native binding; `image-hash` memenuhi kebutuhan yang sama tanpa itu.

## Consequences

Submit listing bisa ditolak keras (blocking) untuk kasus foto identik — perlu pesan error yang jelas di UI agar agen paham cara mengatasi (ganti/hapus foto duplikat), bukan sekadar kode error generik. Perbandingan dibatasi ke `agent_id` yang sama sehingga tidak mengganggu penggunaan foto proyek Primary yang sah dipakai berulang oleh agen berbeda.

## Implementation Notes

- Hash dihitung di Route Handler saat `POST /listings/{id}/media`, bukan di client.
- Perbandingan dijalankan lagi saat submit listing untuk review (`PATCH /listings/{id}/status` → `pending_review`), bukan hanya saat upload foto individual — mencegah agen lolos deteksi dengan urutan upload berbeda.
- Pesan blocking wajib menyebutkan listing mana yang terdeteksi identik, agar agen bisa langsung verifikasi.
- Validasi tetap di server, konsisten `PROJECT-CONSTITUTION.md` Bagian 16.

## Future Review

Tinjau ulang threshold HD≤6 setelah data produksi tersedia (rasio false-positive/negative nyata); jika terlalu longgar/ketat, revisi lewat ADR baru — bukan diedit langsung di ADR ini.

---

## Referensi Silang

- **OD-25** — Open Decision terkait (Resolved, 8 Agustus 2026), lihat `decision-log.md` §11.
- **ADR-027** — preseden pemilihan library ringan tanpa native binding (`pdf-lib` vs Puppeteer).
- **ADR-046** — ADR terakhir sebelum ini (Perluasan Kebijakan Soft-Delete).

> ⚠️ **Catatan verifikasi nomor:** Nomor "047" digunakan berdasarkan ADR terakhir yang tercatat eksplisit di `decision-log.md` per sesi ini (ADR-046). Sebelum entri ini ditulis resmi ke `architecture-decision-records.md`, **cek ulang nomor ADR tertinggi di file aslinya** — jangan asumsikan 047 masih benar jika ada entri baru yang ditambahkan sejak sesi ini berlangsung.
