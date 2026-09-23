# RumahAgen Wireframe v2 — Salinan Ekspor dari Claude Design

Ini adalah **salinan cadangan/arsip** dari wireframe interaktif yang sedang dikerjakan di
Claude Design (Artifact "Design" — canvas dengan artboard hidup, state loading/empty/error,
dan komponen interaktif nyata). Wireframe ini menggantikan pendekatan lama di
`docs/design/wireframes/` (WF-00–WF-11, PNG statis) karena divalidasi langsung terhadap
skema Supabase live (`jawywzavznjekxxlhwqo`, migration #0001–#0115), bukan cuma dokumen spesifikasi.

**Kanvas hidup (sumber kebenaran, bisa diedit & diklik interaktif):**
https://claude.ai/artifact/E2exTSy32okUjjacqMqB2Q

## ⚠️ Keterbatasan penting

File `.dc.html` di folder ini **bukan halaman web statis biasa** — ini format "Design
Component" milik Claude (pakai custom element `<x-dc>`, script runtime `support.js`, dan
placeholder `{{ }}` yang cuma di-render oleh editor Claude Design). Kalau dibuka langsung di
browser (double-click / `file://`), **file ini TIDAK akan tampil dengan benar** — tidak ada
mesin templating, `support.js` tidak akan ditemukan, dan gambar logo (`/_blob/...`) tidak akan
resolve (itu URL internal ke asset store Artifact, bukan URL publik).

**Kegunaan folder ini**: cadangan versi/riwayat source code yang bisa di-diff lewat git,
dan referensi kode kalau canvas hidup di atas tidak bisa diakses. Untuk melihat/klik-klik
wireframe sungguhan, selalu buka link canvas di atas.

## Struktur

Aturan penamaan: **`<Platform>/<Persona>/<KodeModul>-<Nama-Layar>.dc.html`**
— lihat [`MODULES.md`](MODULES.md) untuk legenda lengkap kode modul (M01–M15) dan persona.

```
wireframes-v2/
├── README.md                   # file ini
├── MODULES.md                  # legenda kode modul M01–M15 + persona
├── tokens.css                  # design tokens tunggal (warna, tipografi, spacing, komponen)
├── Design-System.dc.html       # lembar referensi: palet warna, type scale, katalog status badge
├── assets/
│   └── rumahagen-logo.png      # logo asli (transparan), dipakai semua layar
├── Desktop/                    # 1440×900, breakpoint desktop
│   ├── 00-Publik/
│   │   ├── M11-Homepage.dc.html
│   │   ├── M11-Discovery.dc.html
│   │   ├── M11-Detail-Listing.dc.html
│   │   ├── M11-Detail-Agen-Desktop.dc.html
│   │   ├── M11-Detail-Organisasi-Desktop.dc.html
│   │   ├── M11-Detail-Developer-Project-Desktop.dc.html
│   │   ├── M11-Detail-Event-Desktop.dc.html
│   │   ├── M11-Detail-Learning-Desktop.dc.html
│   │   ├── M11-Detail-Learning-Session-Desktop.dc.html
│   │   ├── M11-Konten-Publik-Desktop.dc.html
│   │   ├── M11-Konten-Publik-Detail-Desktop.dc.html
│   │   ├── M11-Promo-Desktop.dc.html
│   │   ├── M11-Promo-Detail-Desktop.dc.html
│   │   ├── M01-Register-Desktop.dc.html
│   │   ├── M01-OTP-Desktop.dc.html
│   │   ├── M01-Login-Desktop.dc.html
│   │   └── M01-Recovery-Desktop.dc.html
│   ├── 01-Agent/
│   │   ├── M01-Akun-Dibatasi.dc.html
│   │   ├── M02-Profil-Saya.dc.html
│   │   ├── M03-Listing-Saya.dc.html
│   │   └── M08-Dashboard.dc.html
│   ├── 02-Admin/
│   │   └── M09-Direktori-Pengguna.dc.html
│   └── 03-Developer-Partner/   # kosong — menyusul Fase F
└── Mobile/                      # 390×844, breakpoint mobile — struktur cermin persis Desktop/
    └── (folder & nama file sama persis seperti Desktop/, isi disesuaikan breakpoint)
```

**Kenapa modul dulu baru fase, bukan sebaliknya**: kode fase (A–F) di tabel status di bawah
cuma urutan kerja saya membangunnya — begitu semua selesai, label itu tidak bermakna lagi buat
yang mencari layar tertentu. Kode modul (M01–M15) itu kosakata permanen proyek ini (dipakai di
permission, migration, audit) jadi itu yang dipakai sebagai struktur folder, bukan fase.

## Cara baca untuk AI coding agent / developer yang membangun app

1. Baca `MODULES.md` dulu — tahu modul mana yang sedang dikerjakan dari kode M-xx di nama file.
2. Baca `Design-System.dc.html` — token warna/tipografi/badge status WAJIB dipakai persis,
   jangan mengarang warna atau status baru.
3. Untuk satu layar, **selalu bandingkan Desktop/ dan Mobile/ berdampingan** (nama file sama
   persis di kedua folder) — keduanya harus punya destinasi/fungsi yang identik, cuma tata
   letak yang beda (lihat breakpoint di `MODULES.md`).
4. Isi teks Indonesia di dalam `.dc.html` adalah **contoh/placeholder**, bukan salinan final —
   yang mengikat adalah struktur, state (loading/empty/error), dan field yang dipakai (semua
   sudah diverifikasi ke skema Supabase live, lihat komentar di dalam tiap file).
5. Setiap file yang belum ada = belum didesain sama sekali (bukan "sedang dikerjakan diam-diam") —
   cek tabel status di bawah sebelum asumsi sesuatu sudah final.

## Status pengerjaan (Fase A–F)

| Fase | File yang sudah ada | Status | Menyusul |
|---|---|---|---|
| **Foundation** | `Design-System.dc.html`, `tokens.css` | ✅ Selesai | — |
| **Fase A — Publik** | `00-Publik/M11-Homepage.dc.html`, `M11-Discovery.dc.html`, `M11-Detail-Listing.dc.html`, `M11-Detail-Agen-Desktop.dc.html`, `M11-Detail-Organisasi-Desktop.dc.html`, `M11-Detail-Developer-Project-Desktop.dc.html`, `M11-Detail-Event-Desktop.dc.html`, `M11-Detail-Learning-Desktop.dc.html`, `M11-Detail-Learning-Session-Desktop.dc.html`, `M11-Konten-Publik-Desktop.dc.html`, `M11-Konten-Publik-Detail-Desktop.dc.html`, `M11-Promo-Desktop.dc.html`, `M11-Promo-Detail-Desktop.dc.html`, `M01-Register-Desktop.dc.html`, `M01-OTP-Desktop.dc.html`, `M01-Login-Desktop.dc.html`, `M01-Recovery-Desktop.dc.html` (+ padanan Mobile) | ✅ Selesai — 10 dari 10 surface M11 spec §4.1 sudah punya wireframe | — |
| **Fase B — Agent core** | `01-Agent/M08-Dashboard.dc.html`, `01-Agent/M03-Listing-Saya.dc.html`, `01-Agent/M01-Akun-Dibatasi.dc.html`, `01-Agent/M02-Profil-Saya.dc.html` | 🟡 Sebagian | M03-Create-Listing-Wizard, M03-Listing-Detail, M12-Organisasi (dashboard/invite/create/close), M04-Pembelajaran, M05-Event |
| **Fase C — Agent fitur baru** | — | ⬜ Belum dimulai | M07-DBR-Calculator, M14-Komersial, M13-AI-Assistant-BYOK, M06-Klaim-Proyek — nol spec di STEP13, murni keputusan desain |
| **Fase D — Admin** | `02-Admin/M09-Direktori-Pengguna.dc.html` | 🟡 Sebagian | M03-Moderasi-Listing, M09-Permission-Matrix, M09-Internal-Staff, M07-Bank-Master, M13-Provider-Catalogue, M04-Learning-Economy-Config, M15-Award-Appeal, M11-SEO, M09-Banners, M09-Notification-Templates, M14-Komersial-Admin |
| **Fase E — Qualification/Award** | — | ⬜ Belum dimulai | M15-Title-Award-Presentation, M15-Evidence, M15-Evaluasi |
| **Fase F — Developer Partner** | — | ⬜ Belum dimulai — persona ke-3, belum punya shell nav sama sekali | M06-Developer-Profile, M06-Kelola-Proyek, M06-Marketing-Kit, M06-Review-Klaim, M05-Submit-Event |

## Prinsip desain (ringkas)

- **Tidak ada status/field karangan** — setiap badge status di `Design-System.dc.html` diselaraskan
  persis dengan CHECK constraint tabel Supabase live.
- **Material-inspired**, warna diturunkan dari logo RumahAgen (biru = kepercayaan, emas = kemitraan),
  font tunggal Plus Jakarta Sans.
- Setiap layar app-shell (Dashboard/Listing/Admin) punya state kosong/loading/error/sukses,
  target sentuh ≥44px, navigasi hide/show tidak terkunci.
- Nav rail Agent (8 item) dan nav publik (10 item) mengikuti kontrak resmi
  `STEP13-E_SUCCESSOR_INTEGRATED_UI_UX_SPECIFICATION §4` — lihat komentar di dalam masing-masing
  file `.dc.html` untuk rujukan pasal spesifik.

---
*Diekspor otomatis dari canvas Claude Design pada 2026-09-23. Untuk update terbaru, selalu
rujuk link canvas hidup di atas — folder ini bisa jadi ketinggalan kalau canvas terus diedit
tanpa export ulang.*
