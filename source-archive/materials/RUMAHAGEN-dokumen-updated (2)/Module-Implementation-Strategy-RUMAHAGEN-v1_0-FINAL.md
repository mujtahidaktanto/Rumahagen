# MODULE IMPLEMENTATION STRATEGY (MIS)
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Technical Lead / Project Manager / Engineering Manager / Scrum Architect (peran gabungan)
**Tujuan:** Acuan utama sebelum Module Planning dan implementasi di Bolt.new — menentukan **urutan implementasi** yang paling aman, efisien, dan minim rework. **Bukan** dokumen task/sprint/backlog.
**Dibangun di atas:** `Module-Dependency-Matrix-RUMAHAGEN-v1.0.md` (MDM, Approved) — seluruh keputusan urutan di dokumen ini **mengikuti**, tidak mengubah, dependency yang sudah ditetapkan MDM.

### Dokumen Acuan
| # | Dokumen | Peran |
|---|---|---|
| 1 | `Module-Dependency-Matrix-...v1.0.md` | Sumber kebenaran dependency, critical path, layer |
| 2 | `Technical-Specification-...v1.0.md` | Technical brief per modul, cross-cutting concerns |
| 3 | Database Schema (ERD v1.3 §2A, migration fisik) | Kesiapan skema per modul |
| 4 | `PRD-RUMAHAGEN-v1.2.md` | Prioritas bisnis, fase roadmap resmi |
| 5 | `SYSTEM-ARCHITECTURE.md` | Batasan arsitektur, AI Development Notes §22 |
| 6 | `technology-decisions.md` | Stack final, AI Coding Rules §7, Future Evaluation §8 |

---

## Riwayat Versi

> Tabel ini disusun pada siklus konsolidasi ini (10 Agustus 2026). Hanya **1 versi** diupload untuk audit ini — tidak ada snapshot historis lain untuk dibandingkan, sehingga tabel ini berisi 1 baris saja. Tidak ditemukan referensi versi usang ke dokumen lain (mis. kutipan nomor upload) di dalam dokumen ini.

| Versi | Tanggal | Ringkasan |
|---|---|---|
| 1.0 | 6 Agu 2026 | Rilis awal (satu-satunya versi yang diupload untuk audit ini) — strategi urutan implementasi 13 modul, dibangun di atas `Module-Dependency-Matrix-...v1.0.md`. |

---

# 1. EXECUTIVE SUMMARY

Proyek terdiri dari **13 modul bisnis** di atas arsitektur **monolith Next.js tunggal** (`apps/web`, ADR-001 — bukan microservices), dikembangkan oleh **satu Owner dengan bantuan AI Coding Assistant** (model proyek solo, `PROJECT-CONSTITUTION.md`). Karena seluruh backend adalah Route Handler in-process di satu aplikasi, **risiko integrasi antar-modul rendah secara infrastruktur**, tetapi **risiko rework tinggi jika urutan pembangunan salah** — modul yang dibangun sebelum dependency-nya siap akan memerlukan refactor ulang service/repository layer.

**Rekomendasi inti:**
- Mulai dari **2 modul Foundation** (M10 RBAC, M01 Auth) — non-negotiable, tidak ada jalan pintas.
- **MVP dapat dicapai dengan 6 modul** (M10, M01, M02, M03, M09-dasar, M11-fondasi) — selaras Fase 1 PRD.
- **M12 (Organization) dan M13 (AI Assistant) berstatus Document-Ready tapi Implementation-Blocked** — direkomendasikan **No-Go** sampai gate governance dibuka eksplisit, terlepas dari kesiapan dokumen.
- **M03 (Listing) adalah modul dengan risiko rework tertinggi jika salah urutan** — 5+ modul hilir bergantung padanya.
- Bolt.new/AI Coding Assistant **wajib bekerja per-modul sesuai urutan Bagian 3**, bukan lintas modul sekaligus, untuk menjaga traceability dan menghindari context-switching yang memicu drift arsitektur.

---

# 2. MODULE CLASSIFICATION

| Kategori | Modul | Karakteristik Penentu |
|---|---|---|
| **Foundation** | M10 (RBAC), M01 (Auth) | Tanpa dependency ke modul lain; seluruh modul lain bergantung langsung/tidak langsung padanya; kegagalan di sini menghentikan seluruh proyek |
| **Core Business** | M02 (Profil Agen), M03 (Listing), M06 (Direktori Developer), M07 (DBR Scoring) | Nilai jual utama platform (PRD §6); aggregate root transaksi; membentuk diferensiasi produk |
| **Supporting** | M04 (Learning Center), M05 (Kalender Event), M08 (Dashboard & Notifikasi), M12 (Organization) | Meningkatkan pengalaman/retensi tapi platform tetap fungsional tanpanya di rilis awal |
| **Integration** | M11 (SEO & Analytics), M13 (AI Assistant/BYOK) | Fungsi utamanya **mengintegrasikan sistem/pihak eksternal** (Google Search Console/GTM/GA4 untuk M11; provider AI eksternal untuk M13); minim UI sendiri, tinggi ketergantungan pihak ketiga |
| **Administration** | M09 (Admin Panel/CMS) | Operasional internal murni — moderasi, konfigurasi, laporan; konsumen lintas seluruh modul lain, bukan produsen nilai bagi end-user eksternal |

> Klasifikasi ini **tidak mengubah** urutan dependency MDM — murni pengelompokan fungsional untuk kebutuhan strategi rilis & alokasi sumber daya (Bagian 12).

---

# 3. RECOMMENDED DEVELOPMENT ORDER

| Urutan | Modul | Kategori | Prasyarat Wajib Selesai |
|---|---|---|---|
| 1 | **M10** — RBAC | Foundation | — |
| 2 | **M01** — Auth | Foundation | M10 |
| 3 | **M09** — Admin Panel (kerangka dasar) | Administration | M10 |
| 4 | **M02** — Profil Agen | Core Business | M01 |
| 5 | **M06** — Direktori Kerjasama Developer | Core Business | M01 |
| 6 | **M04** — Learning Center | Supporting | M01 |
| 7 | **M13** — AI Assistant (BYOK) *(kondisional, lihat Bagian 15)* | Integration | M01, M10 |
| 8 | **M03** — Manajemen Listing Properti | Core Business | M01, M02, M06, M10 |
| 9 | **M05** — Kalender Event | Supporting | M01, M04, M06 |
| 10 | **M07** — Sistem Scoring DBR | Core Business | M01, M03, M09 |
| 11 | **M11** — SEO & Analytics | Integration | M02, M03, M06 |
| 12 | **M12** — Organization *(kondisional, lihat Bagian 15)* | Supporting | M01, M03, M10 |
| 13 | **M08** — Dashboard & Notifikasi | Supporting | M03, M04, M05, M07, M10 |

---

# 4. DEPENDENCY JUSTIFICATION

| Urutan | Modul | Alasan Teknis Posisi Ini |
|---|---|---|
| 1–2 | M10 → M01 | MDM Layer 0–1: tanpa RBAC, penerbitan `role_id` saat registrasi (M01) tidak punya target; tanpa Auth, seluruh middleware `auth.middleware → rbac.middleware` (SYSTEM-ARCHITECTURE §8) tidak dapat diuji end-to-end. Membalik urutan ini akan memaksa hard-code role sementara yang pasti di-rework. |
| 3 | M09 (kerangka) | Hanya bergantung M10 (MDM Bagian 3), dan **wajib** tersedia sebelum M07 (butuh `dbr_config`) serta menjadi tempat approval registrasi M01 berjalan penuh (Admin approve agen). Dibangun sebagai kerangka dulu (bukan seluruh fitur) agar tidak memblokir modul Core Business. |
| 4–5 | M02, M06 | Keduanya hanya bergantung M01 (MDM Layer 2), dapat dibangun **paralel** secara teori, tapi diurutkan M02 dulu karena M03 butuh M02 untuk WA default — menjaga urutan linear mengurangi context-switching AI Coding Assistant (Bagian 13). M06 sebelum M03 karena M03 butuh `developer_project_id` (FK, ERD v1.3) untuk listing kategori Primary. |
| 6 | M04 | Independen (Layer 2), tidak diperlukan modul manapun sebelum M05 — aman dibangun di titik manapun sebelum M05, ditempatkan di sini untuk isi jeda sebelum M03 (modul terberat) dimulai. |
| 7 | M13 | Paling terisolasi di seluruh graph (MDM Bagian 4) — hanya butuh M01+M10, tidak dibutuhkan modul manapun. Aman dibangun kapan saja setelah Foundation; ditempatkan di sini sebagai **early win** kompleksitas rendah sebelum masuk ke M03 yang berat (lihat Bagian 8). Kondisional pada gate governance (Bagian 15). |
| 8 | M03 | **Titik kritis tertinggi** (MDM §5 Critical Path) — butuh M01, M02, M06, M10 seluruhnya selesai. Ini modul paling mahal di-rework jika dependency-nya belum solid, karena M03 adalah aggregate root yang direferensikan 5+ modul hilir (M07, M08, M11, M12). |
| 9 | M05 | Butuh M04 (kelas live) dan M06 (event launching proyek) — keduanya baru selesai di urutan 5–6. |
| 10 | M07 | Butuh M03 (auto-fill harga, opsional tapi disarankan sudah ada) dan M09 (`dbr_config` final) — ditempatkan setelah M03 agar fitur auto-fill dapat diuji nyata, bukan mock. |
| 11 | M11 | Butuh M02, M03, M06 sebagai sumber halaman publik yang di-SEO-kan — tidak mungkin dibangun sebelum ketiganya punya data nyata untuk diuji sitemap/meta tag. |
| 12 | M12 | Butuh M03 (kepemilikan ganda listing) — ditempatkan setelah M03 solid karena M12 memodifikasi kolom `listings.organization_id`/`listing_context` (ERD v1.3), berisiko rework skema jika M03 belum stabil. |
| 13 | M08 | Sink node MDM — butuh M03, M04, M05, M07 **seluruhnya** selesai untuk agregasi bermakna. Membangun M08 lebih awal berarti membangun UI agregasi terhadap data yang belum ada (dummy data), risiko rework tinggi saat modul sumber berubah bentuk data. |

---

# 5. CRITICAL PATH

Diwarisi langsung dari MDM Bagian 5 (tidak diubah):

```
M10 (RBAC) → M01 (Auth) → M06 (Direktori Developer) → M03 (Listing) → M07 (DBR Scoring) → M08 (Dashboard)
                                                              ↑
                                                  M09 (Admin Panel) — jalur paralel wajib
```

**Implikasi strategi implementasi:**
- **Jangan mengalokasikan waktu ke modul Supporting/Integration (M04, M05, M08, M11, M12, M13) sebelum jalur kritis ini solid** — modul-modul tersebut tidak mempercepat penyelesaian jalur kritis, hanya menambah paralelisme semu jika fondasinya belum kokoh.
- **Panjang jalur kritis (6 modul) menentukan waktu minimum sebelum M08 dapat mulai dibangun secara valid** — tidak dapat dipercepat dengan menambah "tenaga" AI Coding Assistant karena sifatnya sekuensial (ketergantungan data/skema), bukan paralel.
- M09 sebagai jalur paralel wajib berarti **kerangka Admin Panel harus sudah berjalan sebelum M07 dimulai**, bukan sebelum M08 — beri jeda realistis di urutan 3 (Bagian 3).

---

# 6. PARALLEL DEVELOPMENT STRATEGY

| Batch | Modul Paralel | Catatan Strategi |
|---|---|---|
| **Batch 0** | M10 | Tidak dapat diparalelkan — single point of start |
| **Batch 1** | M01, M09 (kerangka) | Dapat dikerjakan 2 "jalur" berbeda jika ada 2 sesi AI Coding Assistant terpisah, namun **tetap wajib satu review terpadu** sebelum lanjut (menghindari drift skema `roles`/`permissions`) |
| **Batch 2** | M02, M04, M06, M13 | **Titik paralelisme tertinggi** — 4 modul independen. Kandidat terbaik untuk mempercepat timeline total jika kapasitas memungkinkan (mis. 2 sesi Bolt.new berbeda mengerjakan M02+M06 dan M04+M13 secara terpisah) |
| **Batch 3** | M03, M05 | M03 jauh lebih berat (15 REQ, hub kritis) — jika kapasitas terbatas, **prioritaskan M03 murni**, tunda M05 ke Batch berikutnya tanpa risiko blocking apa pun |
| **Batch 4** | M07, M11, M12 | Ketiganya independen satu sama lain setelah M03 selesai — aman diparalelkan penuh |
| **Batch 5** | M08 | Tidak dapat dimulai sebelum Batch 4 (M07) dan Batch 3 (M05) selesai — titik konvergensi akhir |

> **Batasan realistis solo-AI-assisted model:** `PROJECT-CONSTITUTION.md` menetapkan model proyek **Owner tunggal** — "paralel" di sini berarti *dependency-wise aman dikerjakan tanpa urutan wajib*, bukan rekomendasi literal menjalankan banyak sesi Bolt.new bersamaan tanpa supervisi. Owner tetap perlu me-review setiap output sebelum lanjut ke modul berikutnya (lihat Bagian 13).

---

# 7. SPRINT GROUP RECOMMENDATION

> Pengelompokan **strategis** (bukan sprint detail/backlog) — untuk membantu Owner membagi "putaran kerja" implementasi.

| Grup | Modul | Fokus Grup | Exit Criteria |
|---|---|---|---|
| **Grup A — Fondasi & Identitas** | M10, M01, M09 (kerangka) | RBAC berjalan, autentikasi penuh (register/login/OTP/OAuth), Admin Panel bisa approve user | Agen baru bisa registrasi → Admin approve → login berhasil dengan role benar |
| **Grup B — Profil & Katalog Dasar** | M02, M06, M04 | Profil agen tayang, katalog developer tayang, Learning Center dasar berjalan | Agen punya profil publik; proyek developer tampil; kursus bisa di-enroll |
| **Grup C — Transaksi Inti** | M03 | Listing CRUD + pencarian penuh | Listing bisa dibuat, dimoderasi, dicari publik, CTA WhatsApp tercatat sebagai lead |
| **Grup D — Nilai Tambah Fase 2** | M07, M05, M11 | Kalkulator DBR, kalender event, SEO fondasi aktif | Simulasi DBR tersimpan; event bisa RSVP; halaman publik terindeks (sitemap valid) |
| **Grup E — Kolaborasi & Ekstensi** *(kondisional)* | M12, M13 | Organization Management, AI Assistant BYOK | **Hanya dimulai setelah gate governance dibuka** (Bagian 15) |
| **Grup F — Agregasi & Penutup** | M08 | Dashboard & notifikasi lintas modul | Ringkasan dashboard akurat merefleksikan data Grup B–D |

---

# 8. MVP STRATEGY

Selaras penuh dengan `PRD-RUMAHAGEN-v1.2.md` Bagian 6 (Saran Fase Pengembangan):

| Komponen MVP | Modul | Alasan Wajib Ada di MVP |
|---|---|---|
| Identitas & Akses | M10, M01 | Tanpa ini tidak ada "platform" — hard requirement |
| Operasional Dasar | M09 (dasar), M10 (RBAC dasar: Superadmin/Admin/Agen) | Agen tidak bisa posting tanpa approval; PRD eksplisit mensyaratkan ini di Fase 1 |
| Transaksi Inti | M02, M03 (dasar) | Nilai inti platform — agen bisa daftar, isi profil, posting listing |
| Visibilitas | M11 (fondasi SEO: SSR/SSG, slug, meta tag, sitemap, GTM/GA4 dasar) | **PRD eksplisit melarang menambal SEO belakangan** — fondasi rendering wajib sejak awal, bukan retrofit |

**Modul yang SENGAJA di luar MVP** (bukan berarti tidak penting, melainkan sesuai urutan nilai vs kompleksitas):
- M06, M07 (Fase 2) — nilai jual diferensiasi, tapi platform sudah bisa dipakai tanpanya
- M04, M05 (Fase 3) — engagement/retensi, bukan transaksi inti
- M08, M12, M13 (Fase 4/kondisional) — agregasi dan ekstensi, wajar paling akhir

**Definisi "Selesai" MVP:** agen dapat mendaftar → diverifikasi Admin → login → melengkapi profil → memposting listing → listing tampil di pencarian publik dengan meta tag SEO valid → calon pembeli dapat menemukan & menghubungi via WhatsApp CTA.

---

# 9. PHASE STRATEGY

| Fase | Cakupan Modul | Sumber | Gate Masuk Fase Berikutnya |
|---|---|---|---|
| **Fase 1 (MVP)** | M10, M01, M02, M03 (dasar), M09 (dasar), M11 (fondasi) | PRD §6 | MVP Strategy (Bagian 8) terpenuhi & diverifikasi manual |
| **Fase 2** | M06, M07 | PRD §6 — "nilai jual utama & diferensiasi" | M03 stabil di production (bukan sekadar "selesai coding") |
| **Fase 3** | M04, M05 | PRD §6 | M06 selesai (M05 butuh M06) |
| **Fase 4** | M08 (dashboard analitik lanjutan), gamifikasi, integrasi SLIK/BI Checking, payment/komisi otomatis (di luar cakupan 13 modul saat ini) | PRD §6 | M07, M05 selesai |
| **Fase 2-Lanjutan (paralel, kondisional)** | M12, M13 | Governance Register — Approved arsitektur, `PROJECT-CONSTITUTION.md` §24 poin 10 | **Gate eksplisit dari Owner** via `CURRENT-PROJECT-STATE.md` — tidak otomatis terbuka hanya karena dokumen Baseline |

> **Catatan penting:** PRD menempatkan M12/M13 sebagai requirement v1.2 tambahan **tanpa** slot fase eksplisit di Bagian 6 (roadmap asli PRD ditulis untuk 11 modul). Dokumen ini menetapkan M12/M13 sebagai **fase paralel kondisional**, bukan menyisipkannya ke Fase 2/3 baku, agar tidak keliru dibaca sebagai wajib menghambat M06/M07/M04/M05.

---

# 10. FEATURE ROLLOUT STRATEGY

| Prinsip Rollout | Penerapan |
|---|---|
| **Rilis berbasis kesiapan dependency, bukan kalender tetap** | Setiap modul dirilis begitu Exit Criteria Sprint Group-nya (Bagian 7) terpenuhi — tidak dipaksakan ke tanggal arbitrer, konsisten sifat solo-AI-assisted development |
| **Feature flag untuk modul Supporting/Integration** | M12, M13, M08 direkomendasikan di belakang *configurable placeholder*/flag (`system_configs`) selama masa stabilisasi awal, mengikuti pola yang sudah dipakai untuk Open Questions bisnis (SYSTEM-ARCHITECTURE §23) |
| **Rilis publik vs rilis internal terpisah** | Modul dengan halaman publik SSR/SSG (M02, M03, M06) memengaruhi SEO — rollout ke publik harus menunggu M11 fondasi aktif, meskipun modulnya sendiri sudah "selesai" secara fungsional |
| **Tidak ada rilis parsial untuk M12** | Leader keluar = Organization bubar otomatis (Technical Spec catatan M12) — fitur ini punya efek data permanen, wajib dirilis lengkap (bukan bertahap per-endpoint) begitu gate dibuka |
| **M13 dapat dirilis bertahap per-provider** | `ai_providers` adalah tabel referensi dikurasi Admin — provider baru dapat ditambah tanpa mengubah kode inti, cocok untuk rollout bertahap (mulai 1 provider, tambah berikutnya) |

---

# 11. RISK ANALYSIS

## 11.1 High Risk Module

| Modul | Risiko | Alasan |
|---|---|---|
| **M03 — Listing** | **Tertinggi** | Hub dependency terbanyak (5+ modul hilir); perubahan skema di sini beriak ke M07, M08, M11, M12; kompleksitas fungsional tertinggi (15 REQ, search, geocoding, lifecycle status) |
| **M12 — Organization** | Tinggi | Memodifikasi kolom tabel `listings` yang sudah ada (`organization_id`, `listing_origin` immutable via trigger Postgres); race-condition guard eksplisit disyaratkan (Technical Spec); status Implementation-Blocked menambah risiko *timing* — mulai sebelum gate resmi terbuka |
| **M13 — AI Assistant** | Menengah-Tinggi | Bergantung penuh pada ketersediaan/kestabilan provider eksternal (Gemini/Groq/Mistral/GitHub Models) di luar kendali tim; enkripsi API key at-rest wajib benar sejak awal — kesalahan di sini adalah insiden keamanan, bukan sekadar bug |

## 11.2 High Complexity Module

| Modul | Kompleksitas | Alasan |
|---|---|---|
| **M03 — Listing** | Tertinggi | Search (FTS+pg_trgm), geocoding (MapsProvider abstraction + fallback 3 lapis), lifecycle status, media upload, moderasi — 4 sub-sistem teknis dalam satu modul |
| **M07 — DBR Scoring** | Menengah | Formula finansial presisi (anuitas, DBR%), enkripsi data sensitif, kontrak data ketat (`tenor_months` wajib bulan — kesalahan satuan berdampak langsung ke keputusan finansial pengguna) |
| **M10 — RBAC** | Menengah | Model permission dua-nilai (`granted_scope` own/all/none) + hard rule ownership terpisah di layer repository — mudah salah desain di awal, mahal diperbaiki karena semua modul bergantung padanya |

## 11.3 Low Risk Module

| Modul | Alasan |
|---|---|
| **M04 — Learning Center** | Independen (tidak ada modul lain bergantung untuk fungsi inti selain M02 read-only), CRUD standar tanpa integrasi eksternal kompleks |
| **M13 — AI Assistant** *(dari sisi arsitektur internal)* | Tidak ada tabel riwayat percakapan (mengurangi permukaan risiko data), tidak dibutuhkan modul manapun — kegagalan di sini tidak menghentikan modul lain |
| **M05 — Kalender Event** | CRUD standar, dependency jelas dan sempit (M04, M06) |

## 11.4 Risiko Lintas-Proyek

| Risiko | Mitigasi |
|---|---|
| **Rework akibat urutan implementasi salah** (mis. membangun M08 sebelum M03/M07 solid) | Patuhi urutan Bagian 3 secara ketat; jangan mulai modul hilir hanya karena "terlihat sederhana" jika dependency belum solid |
| **AI Coding Assistant menambah dependency di luar stack resmi** | `technology-decisions.md` §7 (AI Coding Rules) — wajib cek Bagian 3 sebelum menambah library apa pun |
| **AI Coding Assistant memulai coding M12/M13 karena status dokumen "Baseline"** | Wajib cek `CURRENT-PROJECT-STATE.md` sebelum memulai (lihat Bagian 15, Go/No-Go) |
| **Drift antara skema ERD dan migration fisik saat modul dibangun cepat via Bolt.new** | Setiap perubahan skema wajib disinkronkan ke ERD (SYSTEM-ARCHITECTURE §22 poin 7) sebelum lanjut modul berikutnya |

---

# 12. RESOURCE RECOMMENDATION

Selaras model proyek solo-AI-assisted (`PROJECT-CONSTITUTION.md` — Owner: Mujtahid Aktanto):

| Fase Kerja | Rekomendasi Alokasi Fokus |
|---|---|
| **Grup A (Fondasi)** | 100% fokus Owner + 1 sesi AI Coding Assistant — **tidak direkomendasikan paralel**, kesalahan di RBAC/Auth beriak ke seluruh proyek |
| **Grup B (Batch 2 MDM)** | Dapat memakai **hingga 2–3 sesi AI Coding Assistant paralel** (mis. Bolt.new terpisah per modul: M02, M06, M04) dengan review terpusat oleh Owner sebelum merge — titik efisiensi tertinggi proyek |
| **Grup C (M03)** | Kembali ke **fokus tunggal** — modul terlalu kritis untuk dipecah ke sesi paralel tanpa risiko konflik skema |
| **Grup D–F** | Paralel kembali dimungkinkan (M07/M11/M12 di Batch 4 MDM), tapi M08 tetap butuh fokus tunggal di akhir karena sifatnya integratif |
| **Review cadence** | Owner wajib review **setiap modul selesai** sebelum modul dependen berikutnya dimulai — bukan review batch di akhir, untuk mencegah rework berantai |

---

# 13. BOLT.NEW DEVELOPMENT STRATEGY

Mengacu `SYSTEM-ARCHITECTURE.md` §22 (AI Development Notes) dan `technology-decisions.md` §7 (AI Coding Rules) — keduanya eksplisit menyebut Bolt.new sebagai bagian toolchain resmi:

1. **Satu aplikasi, satu repository** (ADR-001) — Bolt.new **tidak** boleh diarahkan membuat service backend terpisah; seluruh modul baru = Route Handler baru di `apps/web/app/api/v1/{modul}/`, mengikuti konvensi `route.ts → service → repository → validation` (SYSTEM-ARCHITECTURE §6).
2. **Prompt per-modul, sesuai urutan Bagian 3** — jangan meminta Bolt.new membangun >1 modul dalam satu sesi/prompt besar; ini mempersulit review dan meningkatkan risiko drift dependency yang belum siap (mis. Bolt.new "membantu" membuat field baru di `listings` saat sebenarnya sedang mengerjakan M06).
3. **Sertakan konteks dependency eksplisit di setiap prompt** — sebutkan modul prasyarat yang sudah selesai (mis. "M01 dan M10 sudah ada, gunakan `auth.middleware`/`rbac.middleware` yang sudah dibangun, jangan buat ulang").
4. **Wajib cek `components/ui/` dan `lib/services/` yang sudah ada sebelum generate baru** — mencegah duplikasi komponen/logic (AI Coding Rules §7 poin 3–4).
5. **Setiap output Bolt.new untuk modul High Risk (M03, M12, M13) wajib direview manual sebelum lanjut** ke modul berikutnya — jangan chain-prompt otomatis untuk modul-modul ini.
6. **Modul Low/Menengah risiko (M04, M05, M13-internal) dapat memakai alur "generate → quick review → lanjut"** lebih cepat, mempercepat Batch paralel di Bagian 6.
7. **Migration SQL selalu direview manusia sebelum apply** — Bolt.new dapat men-generate draft migration, tapi eksekusi ke database wajib melalui review (konsisten `PROJECT-CONSTITUTION.md` §9, migration murni SQL bernomor urut, bukan ORM auto-sync).

---

# 14. AI PROMPTING STRATEGY

Berdasarkan `technology-decisions.md` §7 (AI Coding Rules) dan `SYSTEM-ARCHITECTURE.md` §22, diterjemahkan menjadi strategi prompting per modul:

| Prinsip Prompting | Penerapan Praktis |
|---|---|
| **Selalu nyatakan modul & urutan MDM di awal prompt** | "Kita sedang membangun M06 (Direktori Kerjasama Developer). M01 dan M10 sudah selesai. M06 TIDAK boleh mendahului skema M03." |
| **Kunci stack eksplisit, larang eksplorasi bebas** | Sertakan larangan eksplisit dari `technology-decisions.md` §6 (dilarang Redux, MUI, Formik, SWR, Axios, service Node.js terpisah, dsb.) di setiap prompt modul baru — jangan asumsikan AI mengingat batasan dari sesi sebelumnya |
| **Minta AI menandai area Open Question sebagai placeholder** | Untuk item Bagian B SYSTEM-ARCHITECTURE §23 (mis. threshold DBR final, model monetisasi) — instruksikan eksplisit: "implementasikan sebagai configurable placeholder, tandai `// TODO: menunggu keputusan bisnis`" |
| **Minta AI membaca `CURRENT-PROJECT-STATE.md` dulu (jika tersedia dalam konteks sesi)** | Terutama sebelum memulai M07 (butuh M09), M03 (butuh M02+M06), dan **wajib** sebelum M12/M13 |
| **Batasi cakupan satu prompt ke satu Route Handler group + service + repository + validation schema** | Konsisten pola 4 file per modul di SYSTEM-ARCHITECTURE §6 — mencegah AI menghasilkan perubahan lintas-modul yang tidak diminta |
| **Minta AI melaporkan konflik, bukan menyelesaikan sepihak** | Jika instruksi tampak bertentangan dengan ADR/Constitution, AI wajib berhenti dan bertanya (AI Coding Rules §7 poin 7) — tegaskan ini eksplisit di system prompt/instruksi sesi Bolt.new |
| **Untuk modul High Complexity (M03, M07)**, pecah prompt menjadi sub-tahap eksplisit | Mis. M03: (1) skema & CRUD dasar → review → (2) search/geocoding → review → (3) moderasi & lifecycle → review — bukan satu prompt raksasa |

---

# 15. GO / NO-GO RECOMMENDATION

| Modul | Rekomendasi | Alasan |
|---|---|---|
| M10 — RBAC | ✅ **GO** | Foundation, dokumen Baseline, skema fisik ada, tidak ada blocker |
| M01 — Auth | ✅ **GO** | Foundation, bergantung M10 saja |
| M09 — Admin Panel (kerangka) | ✅ **GO** | Baseline, hanya bergantung M10 |
| M02 — Profil Agen | ✅ **GO** | Baseline, bergantung M01 saja |
| M06 — Direktori Developer | ✅ **GO** | Baseline, bergantung M01 |
| M04 — Learning Center | ✅ **GO** | Baseline, independen |
| M03 — Listing | ✅ **GO** *(setelah M02+M06 selesai)* | Baseline, skema fisik ada — **jangan mulai sebelum prasyarat Bagian 3 urutan 4–5 selesai**, risiko rework tertinggi jika dipaksakan lebih awal |
| M05 — Kalender Event | ✅ **GO** *(setelah M04+M06 selesai)* | Baseline, dependency sempit |
| M07 — DBR Scoring | ✅ **GO** *(setelah M03+M09 selesai)* | Baseline, kontrak data kritis (tenor bulan) — pastikan validasi Zod ketat sejak awal |
| M11 — SEO & Analytics | ✅ **GO** *(setelah M02+M03+M06 punya data nyata)* | Baseline, fondasi wajib ada sejak Fase 1 per PRD, tapi implementasi penuh perlu sumber data nyata untuk diuji |
| M08 — Dashboard & Notifikasi | ✅ **GO** *(hanya setelah M03, M04, M05, M07 selesai)* | Baseline, sink node — mulai lebih awal = pasti rework |
| **M12 — Organization** | 🛑 **NO-GO (Hold)** | **Approved secara arsitektur (ADR-026/027), namun kode belum boleh ditulis** — `PROJECT-CONSTITUTION.md` §24 poin 10 eksplisit memblokir, dan skema fisik migration **belum dieksekusi** (System Architecture §7). Status Baseline dokumen ≠ izin coding. Rekomendasi: tunda ke fase paralel kondisional sampai Owner mengonfirmasi gate terbuka via `CURRENT-PROJECT-STATE.md`. |
| **M13 — AI Assistant** | 🛑 **NO-GO (Hold)** | Blocker identik dengan M12 — Approved arsitektur (ADR-028), skema fisik belum dieksekusi, gate implementasi belum dibuka. Meski secara dependency modul ini paling ringan/terisolasi (Bagian 4 urutan 7), **kesiapan dependency teknis tidak menggantikan syarat governance eksplisit**. |

**Kesimpulan Go/No-Go keseluruhan:** **GO untuk memulai implementasi 11 dari 13 modul** mengikuti urutan Bagian 3, dimulai dari M10. **M12 dan M13 di-hold** — bukan karena masalah teknis/dependency (keduanya justru salah satu titik paling siap secara dokumen), melainkan murni **gate governance eksplisit** yang belum dibuka. Rekomendasi: verifikasi status gate ini di awal Grup B (Bagian 7) — jika sudah terbuka pada saat itu, M13 dapat langsung masuk urutan sesuai Bagian 3 (posisi 7); jika belum, lewati dan lanjut ke M03 tanpa menunggu.

---

*Module Implementation Strategy ini disusun murni berdasarkan Module Dependency Matrix yang sudah disetujui — tidak ada urutan yang bertentangan dengan dependency MDM, tidak ada task/sprint/backlog detail yang dibuat, dan seluruh rekomendasi Go/No-Go didasarkan pada status dependency + status governance yang terdokumentasi, bukan asumsi.*
