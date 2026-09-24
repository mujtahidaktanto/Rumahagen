# Legenda Kode Modul (M01–M15)

Kode ini **bukan buatan wireframe** — ini kosakata resmi yang sudah dipakai di seluruh proyek:
nama permission (`m03.listing.create`), komentar setiap file migration Supabase, dan semua
laporan audit di `audit/`. Nama file wireframe selalu diawali kode modul ini supaya bisa
dilacak balik ke migration/permission/API yang sesuai tanpa tebak-tebak.

| Kode | Modul | Migration kunci | Permission prefix |
|---|---|---|---|
| **M01** | Identity & Authentication (register/OTP/login/sesi) | `0002`, `0096` | `m01.*` |
| **M02** | Agent Profile & Review | `0029`–`0030`, `0092` | `m02.*` |
| **M03** | Listing (properti, media, leads, refresh, kuota) | `0018`, `0047`, `0086` | `m03.*` |
| **M04** | Learning (Session + Catalog + Economy/LP + Partnership) | `0021`–`0025`, `0056`–`0063`, `0109` | `m04.*` |
| **M05** | Event (kalender, registrasi, guest) | `0031`–`0032`, `0088` | `m05.*` |
| **M06** | Developer / Project / Marketing Kit / Claim | `0033`–`0035` | `m06.*` |
| **M07** | DBR / KPR (kalkulator, Bank Master) | `0008`, `0052`, `0089`, `0099` | `m07.*` |
| **M08** | Dashboard / Notification | `0036` | `m08.*` |
| **M09** | Admin Console (config, audit, permission matrix, staff, moderasi) | `0011`–`0014`, `0103`–`0108` | `m09.*` |
| **M10** | Authorization (RBAC/Permission/RLS — mayoritas backend, UI-nya ada di M09 Permission Matrix) | `0001`–`0010` | `m10.*` |
| **M11** | Public Discovery / SEO (homepage, pencarian, konten statis, promo) | `0037`, `0051`, `0097` | `m11.*` |
| **M12** | Organization (member, invitation, closure) | `0005`, `0050`, `0110`–`0113` | `m12.*` |
| **M13** | Provider Catalogue / BYOK / AI Assistant | `0015`–`0016`, `0080` | `m13.*` |
| **M14** | Commercial (subscription, entitlement, kuota, pembayaran) | `0019`, `0071`–`0079` | `m14.*` |
| **M15** | Qualification / Award / Title | `0026`, `0064`–`0070`, `0098` | `m15.*` |

## Persona (level folder pertama di dalam Desktop/ dan Mobile/)

| Folder | Siapa | Shell navigasi |
|---|---|---|
| `00-Publik` | Pengunjung anonim + agent yang belum login | Header 10-item + footer (§4.1 STEP13-E) |
| `01-Agent` | Role `agent` yang sudah login | Sidebar/drawer 8-item + Context Switcher (§4.2 STEP13-E) |
| `02-Admin` | Role `admin`/`superadmin`/`manager` | Sidebar capability-driven (§4.3 STEP13-E) |
| `03-Developer-Partner` | Role `developer_partner` | Sidebar 7 tujuan (Dashboard, Proyek Saya, Marketing Kit, Klaim Masuk, Event, Hasil Kemitraan, Profil Developer), bisa disembunyikan; tanpa Context Switcher (organisasi hanya untuk Agent). Lihat `SOURCE-Developer-Partner.md` |
| `04-Instructor` | Role `instructor` | Shell 5 item (Dashboard, Sesi Saya, Event, Notifikasi, Profil) — Fase G ✅ |
| `06-Bersama` | Semua role | Pusat Notifikasi (satu layar; tombol Kembali menyesuaikan persona) — Fase G ✅ |
| `05-Buyer` | Role `buyer` | Tidak dibuat (keputusan 2026-09-24): Buyer = Publik/Agent |

Satu modul bisa muncul di lebih dari satu persona kalau memang perilakunya beda — misalnya
**M03 Listing** muncul di `00-Publik` (halaman Detail publik), `01-Agent` (kelola listing sendiri),
dan `02-Admin` (moderasi). Itu wajar, bukan duplikasi keliru.
