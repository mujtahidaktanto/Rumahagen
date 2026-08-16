# CURRENT PROJECT STATE
## Platform Web RUMAHAGEN

> **CATATAN PENGGUNAAN — WAJIB DIBACA AI CODING ASSISTANT DI SETIAP SESI**
> Dokumen ini adalah **satu-satunya sumber kebenaran tentang apa yang SUDAH ADA secara fisik** di proyek ini (kode, tabel, endpoint, komponen) — bukan apa yang direncanakan/didesain di dokumen governance. Jika sebuah item tercatat **"Belum dibuat"**, AI **dilarang** berasumsi item tersebut sudah ada, sudah sebagian jadi, atau bisa "diisi mengarang" — perlakukan sebagai benar-benar kosong. **(v0.1 rev. 6 Agustus)** Bedakan tegas antara **"source code ditulis"** (mis. file migration `.sql` sudah ada di repo) dan **"dieksekusi/live"** (mis. tabel benar-benar berdiri di database Supabase nyata) — keduanya dicatat terpisah di dokumen ini, jangan disamakan. Dokumen ini wajib **diperbarui di akhir setiap sesi development** yang mengubah kode nyata (bukan hanya dokumen).

---

# Project Information

| Field | Value |
|---|---|
| **Nama Project** | Platform Web RUMAHAGEN (nama brand final: **RUMAHAGEN**) |
| **Versi** | 0.1 (Pra-Development — belum ada aplikasi/endpoint yang berjalan; **migration SQL sudah ditulis lengkap tapi belum dieksekusi ke database live**, lihat *Existing Database*) |
| **Tanggal Update** | **11 Agustus 2026 (rev. 10 — Penetapan resmi nama brand/produk: RUMAHAGEN)**, naik dari rev. 9 (10 Agustus, audit konsolidasi 13 Module Planning selesai) — perubahan **murni redaksional/branding**: nama kerja generik "Real Estate Agency Platform"/placeholder `{nama_platform}` diganti final ke **RUMAHAGEN** di seluruh dokumen proyek, keputusan langsung Business Owner (`decision-log.md` **OD-26**). **Tidak ada perubahan kode, skema, atau status Sprint** pada rev. ini — status pengembangan fisik proyek tetap identik dengan rev. 9. |
| **Status** | 🟡 **Perencanaan & Dokumentasi Selesai — namun status "Migration Sudah Diperbaiki" dari rev. 3-8 TERBUKTI SEBAGIAN KELIRU pada verifikasi 9-10 Agustus, kini benar-benar dikoreksi.** Seluruh 28 ADR arsitektur/teknis tetap Approved/Approved With Notes. **⚠️ Koreksi kritis (rev. 9):** klaim "T1-01/T1-02/T1-03/T1-04/T3-06 Diperbaiki [2026-08-06]" yang tercatat di rev. 3 dan *Known Technical Debt* poin 11 (di bawah) **tidak pernah benar-benar tersimpan ke file migration** — ditemukan saat Owner mengupload ulang file migration untuk verifikasi independen (9-10 Agustus). Migration yang benar-benar berisi perbaikan kini ada sebagai file terpisah bersuffix **`-FIXED`** (`0007`/`0008`/`0009`/`0010-FIXED.sql`) — **file lama (belum diperbaiki) masih ada berdampingan di folder, belum diganti/di-rename**. Lihat *Perkembangan Baru* dan *Known Technical Debt* poin 15 untuk detail penuh & tindakan yang masih diperlukan. **Migration tetap belum pernah dieksekusi ke database live** (tidak berubah dari rev. 8). |
| **Development Phase** | **Pre-Phase 0, mendekati siap eksekusi — dengan catatan verifikasi tambahan.** Dokumen governance kini mencakup PRD **v1.3**, ERD **v1.4**, API Specification **v1.3** (naik dari v1.2/v1.3/v1.2 karena siklus OD-25, lihat *Perkembangan Baru*). **Migration SQL yang BENAR secara isi kini ada di file `-FIXED`**, bukan lagi di file bernomor tanpa suffix untuk keempat modul (M03/M04/M05/M12) — siapa pun yang membuka file lama tanpa memperhatikan ini akan mendapat versi bug. Sprint S0 (eksekusi fisik) **masih belum dijalankan**. |
| **Milestone Berikutnya** | **Sprint S0 — Foundation Infrastructure. Titik aman TETAP TERCAPAI, namun dengan syarat tambahan yang sebelumnya tidak diketahui:** sebelum eksekusi migration ke database, **file `-FIXED` wajib menggantikan file lama** (rename ke nama kanonik tanpa suffix) — bukan `0001`–`0015` apa adanya seperti tercatat di rev. 8, karena 4 dari 15 file itu ternyata masih berisi bug yang diklaim sudah hilang. Setelah rename: jalankan migration seperti rencana semula, lalu **`scripts/seed-superadmin.ts`** (OD-18). Detail langkah di *Next Recommended Module*. |

---

## Riwayat Versi (Version History)

> **Catatan audit (ditambahkan oleh siklus konsolidasi 10 Agustus 2026, dilengkapi setelahnya):** Dokumen ini sebelumnya tidak memiliki tabel Riwayat Versi eksplisit — hanya field `Tanggal Update` berantai. Tabel di bawah disusun murni dari isi setiap snapshot yang diaudit. **Rev.6** tidak pernah tersimpan sebagai file terpisah (langsung disusul rev.7 di hari yang sama) — barisnya diisi dari `CURRENT-PROJECT-STATE-rev6-Detail-Perubahan.md`, dokumen rekonstruksi bersumber `Authorization-Access-Control-Specification-v1.1-FINAL.md`, `CHANGELOG-v0_7_x.md`, dan `document-governance-baseline-register.md`, dikonfirmasi cocok dengan ringkasan yang sudah ada di badan dokumen ini sendiri (lihat *Perkembangan Baru*).

| Rev | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| v0.1 *(belum ada rev)* | 27 Jul 2026 | Dokumen baru. |
| v0.1 | 28 Jul 2026 | ADR-001 Approved — tidak ada lagi blocker Sprint S0. *(2 snapshot: __1_ dan __2_, hari sama.)* |
| v0.1 | 29 Jul 2026 | ADR-005 Approved. |
| v0.1 | 30 Jul 2026 | ADR-006 Approved. |
| v0.1 | 31 Jul 2026 | ADR-008 Approved. |
| v0.1 | 3 Agu 2026 | ADR-018 Approved — 25/25 ADR. *(2 snapshot: __6_ dan __7_, koreksi 1 baris catatan Board ADR-026.)* |
| v0.1 | 4 Agu 2026 | ADR-026/027/028 Approved — 28/28 ADR. Modul 12/13 ditambah ke cakupan (arsitektur), kode belum eligible. |
| rev. 1 *(implisit)* | 6 Agu 2026 | Paket sinkronisasi dokumen bisnis/data M12/13 dieksekusi (PRD v1.2, ERD v1.3, dll — 8 dokumen naik Baseline), migration SQL 15 file ditulis lengkap. Restrukturisasi: detail ADR dipadatkan, rujuk `architecture-decision-records.md` sebagai sumber tunggal (dijelaskan eksplisit di dokumen). |
| rev. 2 | 6 Agu 2026 | Gate kode Modul 13 dikonfirmasi terbuka. |
| rev. 3 | 6 Agu 2026 | Issue Register Batch 1 selesai — 5 bug RLS "diperbaiki" (klaim ini kemudian terbukti keliru, lihat rev. 9). |
| rev. 4 | 6 Agu 2026 | Issue Register Batch 2 — 7 Open Decision (OD-16 s.d. OD-22) dijawab & dieksekusi. |
| rev. 5 | 6 Agu 2026 | OD-23 dijawab — seluruh Tier 1-3 Issue Register Closed. |
| rev. 6 *(direkonstruksi — tidak ada file terpisah tersimpan)* | 6 Agu 2026 | Issue Register Batch 3 — audit menyeluruh 113 baris `PERM-XXX` vs RLS+PRD, 22 baris dikoreksi (12 diketahui + 10 temuan baru); `Authorization-Access-Control-Specification-v1.1.md` diterbitkan; 31/32 Issue Register Closed; `CHANGELOG.md` `0.7.0`. Tidak ada perubahan skema/RLS. *(Sumber: `CURRENT-PROJECT-STATE-rev6-Detail-Perubahan.md`, direkonstruksi dari `Authorization-Access-Control-Specification-v1.1-FINAL.md` §0 + `CHANGELOG-v0_7_x.md` + `document-governance-baseline-register.md` Governance Notes poin 20 — bukan file rev.6 primer, file aslinya memang tidak pernah tersimpan terpisah.)* |
| rev. 7 | 6 Agu 2026 | T4-06 (SSO Apple) selesai — Issue Register 32/32 isu Closed, TUNTAS. |
| rev. 8 | 7 Agu 2026 | Gate kode Modul 12 RESMI TERBUKA. *(2 snapshot identik: `updated-v8.md` dan `updated-v8__1_.md`.)* |
| **rev. 9** | 10 Agu 2026 | Regresi `TASK-HOTFIX-20260806-001` ditemukan & benar-benar diperbaiki (klaim rev.3 terbukti sebagian keliru); OD-25/ADR-047/ADR-029 dieksekusi; audit konsolidasi 13 Module Planning selesai. |
| **rev. 10** | 11 Agu 2026 | Penetapan resmi nama brand/produk **RUMAHAGEN** oleh Owner (`decision-log.md` OD-26; `document-governance-baseline-register.md` naik v1.11; `project-manifest.md` naik v1.28). Murni redaksional/branding — tidak ada perubahan kode/skema/status Sprint. **— VERSI TERKINI** |
---

# ADR & Governance Snapshot

> Merangkum status **Architecture Decision Records** (`architecture-decision-records.md`, kini v1.1) per 3 Agustus 2026 — **tidak ada ADR baru yang disahkan pada siklus 4-6 Agustus**, seluruh pembaruan periode ini bersifat **eksekusi/dokumentasi turunan** (migration SQL, konsolidasi ADR, penerbitan MDM/MIS), bukan keputusan arsitektur baru. Rincian penuh setiap ADR tetap berada di dokumen sumber; bagian ini hanya mencatat status.

## Ringkasan (tidak berubah dari snapshot 4 Agustus — lihat detail lengkap 28 ADR di bawah)

Seluruh **28 ADR** di `architecture-decision-records.md` tetap **Approved/Approved With Notes** — **tidak ada ADR OPEN**. ADR-001 (Backend Architecture), ADR-005 (Search), ADR-006 (Job Queue), ADR-008 (Maps), ADR-018 (Caching) — Approved 27-31 Juli 2026. ADR-026/027 (Organization), ADR-028 (AI Assistant) — Approved/Approved With Notes 3 Agustus 2026. Tabel lengkap 28 ADR: lihat versi dokumen ini tanggal 4 Agustus (tidak diulang di sini karena tidak ada perubahan status).

## Perkembangan Baru Sejak 4 Agustus (bukan ADR baru — eksekusi dari ADR yang sudah Approved)

**(11 Agustus, rev. 10) Penetapan resmi nama brand/produk: RUMAHAGEN.** Business Owner mengunci nama brand final, menggantikan nama kerja generik "Platform Web Real Estate Agency"/"Real Estate Agency Platform" yang dipakai sejak dokumen pertama proyek, dan yang secara eksplisit tercatat sebagai placeholder belum final (`{nama_platform}`) di dokumen ini sejak snapshot pertama. Dicatat sebagai **OD-26** (`decision-log.md` §11, RESOLVED). **Cakupan:** isi dan nama file di ±84 dokumen proyek; deskripsi kategori bisnis "PropTech / Real Estate Agency SaaS" sengaja dipertahankan (mendeskripsikan vertikal industri, bukan nama brand). **Tidak ada dampak ke kode, skema, API, atau status Sprint** — murni keputusan administratif/branding, tidak memerlukan ADR arsitektur baru.

**(6 Agustus) Konsolidasi `architecture-decision-records.md` ke v1.1** — status internal Draft→Baseline disinkronkan penuh; regresi kecil pada ADR-005/ADR-006 diperbaiki di entri sumber (bukan sekadar narasi ringkasan). Tidak mengubah satu pun keputusan ADR yang sudah Approved.

**(5 Agustus) Paket sinkronisasi dokumen bisnis/data Modul 12/13 — DIEKSEKUSI PENUH.** Sebelumnya (snapshot 4 Agustus) dokumen ini mencatat paket ini sebagai **blocker** kode M12/M13. Kini:
- `PRD-RUMAHAGEN.md` naik v1.1 → **v1.2** (retrofit REQ-M0X-NNN + Modul 12/13 REQ penuh, 114 REQ-XXX terdaftar).
- `ERD-Skema-Database-RUMAHAGEN.md` naik ke **v1.3** — kini **mencantumkan** struktur `organizations`/`organization_members`/`organization_invitations`/`ai_providers`/`agent_ai_connections` secara formal (sebelumnya, di snapshot 4 Agustus, ERD baru naik ke "v1.2" hanya untuk soft-delete, struktur M12/13 belum tercantum — **kini sudah**).
- `API-Specification-...md` naik v1.1 → **v1.2** (endpoint group `/organizations/*`, `/ai-assistant/*` resmi terdaftar §5A/§5B).
- `User-Flow-...md` naik v1.1 → **v1.2**.
- **Baru dibuat**: `Entity-Mapping-RUMAHAGEN-v1.0.md` (44 entity terdaftar, termasuk `ENT-M12-*`/`ENT-M13-*`), `Authorization-Access-Control-Specification-v1.0.md`, `Functional-Specification-v1.0.md`, `UI-Specification-v1.0.md`, `Technical-Specification-v1.0.md`.
- **8 dokumen di atas dipromosikan ke status Baseline** pada 5 Agustus (`document-governance-baseline-register-v1.4.md` Governance Notes poin 18).

**(5 Agustus) Migration SQL — DITULIS LENGKAP untuk seluruh 15 modul, termasuk M12/M13.** `0001_extensions_helpers.sql` s.d. `0015_m13_ai_assistant.sql` (2.264 baris total) + `Database-Migration-Full-v1.0.sql` (versi konsolidasi, 1.132 baris) + `Database-Dictionary-Migration-Ready-v1.0.md` (penerjemahan ERD v1.3 → DDL PostgreSQL presisi). **Status: Draft, menunggu pengesahan Owner & eksekusi Sprint S0** — belum dijalankan ke instance Supabase manapun (lihat *Existing Database*).

**✅ (Baru, rev. 2 — 6 Agustus 2026) Gate implementasi kode Modul 13 (AI Assistant) — RESMI TERBUKA.** Owner menyatakan eksplisit dalam sesi kerja tanggal 6 Agustus 2026 bahwa gate Modul 13 terbuka, memenuhi syarat konfirmasi eksplisit yang disyaratkan `PROJECT-CONSTITUTION.md` §24 poin 10 dan `development-playbook.md` Golden Rule 40. **Module Planning `MP-13-AIAssistant-Module-Planning-v1.0.md` sudah diterbitkan** sebagai acuan implementasi. AI Coding Assistant **kini diizinkan** menulis migration/endpoint/komponen Modul 13, mengikuti urutan MIS (posisi #7) dan MP-13 sebagai spesifikasi resmi.

**✅ (Baru, rev. 3 — 6 Agustus 2026) Issue Register Batch 1 — 5 bug RLS diperbaiki (`TASK-HOTFIX-20260806-001`).** Sesuai `Issue-Register-Resolution-Package-v1_0.md` Bagian B.1, seluruh **4 isu Tier 1** dan **T3-06** dari `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0 telah diperbaiki di file migration (edit `.sql`, **belum dieksekusi** ke database live):
- **T1-01** (`0009_m04_learning_center.sql`) — ownership check ditambahkan ke `quiz_questions_manage`/`quiz_options_manage`; visibilitas Instructor ditambahkan ke `enrollments_own`/`quiz_attempts_own`.
- **T1-02** (`0008_m03_listing.sql`) — `listings_select_public` kini mengizinkan `status IN ('published','sold','rented')`, bukan hanya `'published'` (memenuhi requirement SEO Spec §1.4 & PRD Modul 3/11).
- **T1-03** (`0010_m05_events.sql`) — `events_manage` dipecah agar submitter tidak dapat mem-publish/reject event miliknya sendiri (bypass moderasi ditutup). **Gap terbuka:** endpoint approve/reject belum ada di API Specification — dicatat sebagai rekomendasi terpisah, belum dieksekusi.
- **T1-04** (`0007_m12_organization.sql`) — `org_invitations_insert` kini memverifikasi Leader aktif untuk `leader_invite`, menutup celah spoofing undangan Organization.
- **T3-06** (`0008_m03_listing.sql`, satu pass dengan T1-02) — klausa Organization Leader ditambahkan ke RLS child table listing (photos/videos/amenities).

Dokumen tersinkron: `ISSUE-REGISTER-Konsolidasi-FINAL.md` (5 isu → Closed), `MP-03`/`MP-04`/`MP-05`/`MP-12`/`MP-11-Module-Planning` (status Bagian 45/46/51), `CHANGELOG.md` (rilis `0.4.2`, PATCH). **Sisa Issue Register:** 2 Tier 2 + 9 Tier 3 (Batch 2, butuh keputusan Owner) dan 17 Tier 4 (Batch 3, editorial) masih terbuka.

**✅ (Baru, rev. 4 — 6 Agustus 2026) Issue Register Batch 2 — 7 Open Decision (OD-16 s.d. OD-22) dijawab & dieksekusi.** Sesuai `Issue-Register-Resolution-Package-v1_0.md` Bagian B.2, 2 Tier 2 + 5 Tier 3 dari `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0 diformalkan sebagai Open Decision (`OD-16-sampai-OD-22-Batch2-Keputusan-Owner.md`), dijawab Owner, dan dieksekusi sebagai revisi dokumen:
- **OD-16/OD-17** (T2-01/T2-02, kontradiksi PRD Modul 4 & 5 soal Manager) — keduanya dijawab Opsi A (Manager akses penuh), mengonfirmasi dugaan akar masalah sama. `PRD-...v1.2.md` Modul 4 & 5 Acceptance Criteria direvisi.
- **OD-18** (T3-01, bootstrap Superadmin) — dijawab Opsi B (script/CLI, direvisi dari draft awal Opsi A/SQL manual). `scripts/seed-superadmin.ts` + README dibuat, siap dijalankan saat Sprint S0.
- **OD-19** (T3-03, wilayah eksklusif developer) — dijawab Opsi A (per Kota). **Catatan proses:** draft awal Opsi B (per Kecamatan) dibatalkan setelah ditemukan `developer_projects` tidak punya kolom `district_id` — akan perlu migration/ADR baru. Owner mengonfirmasi ganti ke Opsi A, sehingga tidak ada perubahan skema.
- **OD-20** (T3-04, CRUD akun internal M09) — dijawab Opsi A. 4 endpoint baru ditambahkan ke `API-Specification-...v1.2.md` §10.4.
- **OD-21** (T3-05, cakupan AI Assistant M13) — dijawab Opsi A (Developer Partner disertakan). `PRD`/`User-Flow` Modul 13 direvisi; tidak ada perubahan RLS (sudah role-agnostic).
- **OD-22** (T3-07, kebijakan Amenity M03) — dijawab Opsi A (pertahankan Superadmin-only). `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi.

**Dampak governance:** `CHANGELOG.md` rilis `0.5.0` (MINOR — OD-20 genuine scope addition). `decision-log.md` §11 — 7 entri OD-16 s.d. OD-22 diregistrasi & langsung Resolved. `document-governance-baseline-register.md` naik ke v1.5 (Governance Notes poin 19). **7 Module Planning** disinkronkan: MP-04, MP-05, MP-01, MP-06, MP-09, MP-13, MP-03. **Tidak ada perubahan RLS/migration SQL pada Batch 2** — seluruh 7 OD diselesaikan lewat dokumen governance, bukan skema/kode.

**✅ (Baru, rev. 5 — 6 Agustus 2026) OD-23 dijawab & dieksekusi — kebijakan review Agen difinalkan, seluruh Tier 1-3 Issue Register kini Closed.** T3-02 (satu-satunya isu Tier 3 yang belum diformalkan) diformalkan sebagai OD-23 lalu langsung dijawab Owner dalam sesi yang sama:
- Bukti interaksi/lead (`listing_lead_id`) **dikonfirmasi tidak wajib**, konsisten desain skema/RLS sejak awal.
- **1 reviewer maksimal 1 review aktif per Agen** — submit kedua **me-replace** (upsert), berlaku untuk Buyer maupun Agen.
- **Fitur baru: self-review Agen** — Agen dapat submit review untuk profilnya sendiri, **auto-approved tanpa moderasi**, **ikut dihitung `aggregateRating`** publik.

**Perubahan skema nyata** (beda dari Batch 2 yang murni dokumen): `0005_m02_agent_profile.sql` mendapat 1 index UNIQUE baru + 2 RLS policy diubah/ditambah (`agent_reviews_insert_buyer` kondisional, `agent_reviews_update_own` baru). `PRD-...v1.2.md` Modul 2 dan `Authorization-Access-Control-Specification-v1.0.md` §2.3 direvisi. `CHANGELOG.md` rilis `0.6.0` (MINOR — genuine scope addition, fitur self-review baru). **Dengan ini, seluruh Tier 1 (4), Tier 2 (2), dan Tier 3 (7) di Issue Register Closed — hanya 17 Tier 4 (editorial, Batch 3) yang tersisa.**

**✅ (Baru, rev. 6 — 6 Agustus 2026) Issue Register Batch 3 — audit menyeluruh Authorization Spec selesai, 31/32 isu Closed.** Seluruh 113 baris `PERM-XXX` diperiksa terhadap RLS 15 migration + PRD Business Rule — **22 baris dikoreksi** (12 sudah teridentifikasi + 10 temuan baru). Dokumen baru **`Authorization-Access-Control-Specification-v1.1.md`** diterbitkan (Baseline, menggantikan v1.0). 4 isu editorial lain juga diperbaiki: komentar migration `0005`/`0011`, istilah "Verified"→"Active" (9 lokasi PRD+User Flow), endpoint CRUD `/admin/developer-projects` dilengkapi. T4-09/T4-10 ditutup sebagai Acknowledged. Seluruh 13 MP files disinkronkan ke sitasi v1.1. `CHANGELOG.md` rilis `0.7.0` (MINOR). **Tidak ada perubahan skema/RLS** — murni dokumentasi.

**✅ (Baru, rev. 7 — 6 Agustus 2026) T4-06 (SSO Apple) diselesaikan — Issue Register 100% Closed (32/32 isu).** Owner memilih **Opsi B**: referensi SSO Apple dipertahankan (tidak dihapus), ditandai eksplisit "belum diimplementasikan / roadmap masa depan" di PRD REQ-M01-002, Functional Spec §M01, User Flow Modul 1 (6 lokasi total). `MP-01` disinkronkan. `CHANGELOG.md` rilis `0.7.1` (PATCH). **Dengan ini, seluruh Issue Register — Tier 1 (4), Tier 2 (2), Tier 3 (7), dan Tier 4 (16) — tuntas Closed. Tidak ada satu pun item governance tersisa yang menghalangi Sprint S0.**

**🔴 (Baru, rev. 9 — 9-10 Agustus 2026) REGRESI `TASK-HOTFIX-20260806-001` — 4 bug RLS Tier 1 + T3-06 yang diklaim "Diperbaiki [2026-08-06]" (rev. 3 di atas) TERNYATA belum pernah benar-benar tereksekusi ke file migration. Kini benar-benar diperbaiki.**

**Kronologi temuan:** Saat audit konsolidasi 13 Module Planning (9-10 Agustus 2026) memverifikasi ulang file migration yang diupload Owner secara independen — bukan mengandalkan klaim status di dalam dokumen MP — ditemukan bahwa isi file **tidak cocok** dengan status "Diperbaiki" yang sudah tercatat sejak rev. 3 dokumen ini:

- **T1-01** (`0009_m04_learning_center.sql`) — klausa ownership `quiz_questions_manage`/`quiz_options_manage`/`enrollments_own`/`quiz_attempts_own` **tidak ada**, file identik versi pra-perbaikan.
- **T1-02 + T3-06** (`0008_m03_listing.sql`) — `listings_select_public` masih `status='published'` saja (sold/rented tetap 404 publik); klausa Organization Leader di 3 RLS child-table listing **tidak ada**.
- **T1-03** (`0010_m05_events.sql`) — `events_manage` masih 1 policy tunggal, belum dipecah 4 policy seperti diklaim.
- **T1-04** (`0007_m12_organization.sql`) — `org_invitations_insert` masih `WITH CHECK (agent_id=auth.uid() OR leader_id=auth.uid())` tanpa verifikasi keanggotaan Leader — celah spoofing yang diklaim tertutup ternyata masih terbuka.

Owner mengonfirmasi file yang diupload untuk verifikasi memang versi terbaru — bukan file usang yang salah diupload. **Root cause tidak diketahui pasti** (kemungkinan: perbaikan sempat ditulis di sesi kerja yang hasilnya tidak pernah disimpan ke file sumber) — dicatat sebagai fakta yang ditemukan, bukan spekulasi penyebab.

**Resolusi (9-10 Agustus 2026):** Atas instruksi Owner, keempat migration benar-benar diperbaiki persis sesuai spesifikasi yang **sudah dirumuskan sejak awal** di masing-masing MP §51 (Conflict Analysis) — kini tersimpan sebagai file terpisah:
`0007_m12_organization-FIXED.sql`, `0008_m03_listing-FIXED.sql`, `0009_m04_learning_center-FIXED.sql`, `0010_m05_events-FIXED.sql`.
**File lama (belum diperbaiki, bernama sama tanpa suffix) MASIH ADA di folder project, belum diganti** — lihat *Known Technical Debt* poin 15 untuk risiko dan tindakan yang diperlukan.

**Temuan terkait, ditemukan pada verifikasi yang sama:** `API-Specification-...md` (v1.2) juga ternyata kehilangan **4 endpoint `/admin/internal-users`** (OD-20, diklaim sudah ada) dan **3 endpoint `/admin/developer-projects{/id}`** (T4-11, diklaim sudah ada sejak audit v1.1) — keduanya **secara kebetulan ikut diperbaiki** saat API Specification dinaikkan ke v1.3 untuk kebutuhan OD-25 (lihat blok di bawah), bukan task terpisah. Kanonik sekarang: `API-Specification-RUMAHAGEN-v1.3-FINAL-FIXED.md`.

**Dokumen yang sudah disinkronkan terhadap temuan ini** (diverifikasi langsung, bukan diasumsikan): `MP-03`, `MP-04`, `MP-05`, `MP-12`, `MP-11` (masing-masing mencatat regresi + resolusi lengkap di §51/§45/§46), `document-governance-baseline-register.md` (naik ke v1.9, Governance Notes poin 27-31). **Belum disinkronkan:** *Known Technical Debt* poin 11 di dokumen ini (di bawah) masih menyatakan "RESOLVED, 6 Agustus" tanpa catatan regresi — **dikoreksi eksplisit di poin baru (15)**, entri asli **tidak diedit/dihapus** (konsisten aturan "history tidak boleh ditulis ulang").

---

**🟢 (Baru, rev. 9 — 8-9 Agustus 2026) OD-25/ADR-047/ADR-029 (Image Duplicate Detection untuk Listing) — diformalkan, dijawab Owner, dan dieksekusi.** Gap fitur baru (bukan Open Decision lama) — ditemukan dalam percakapan operasional, bukan proposal tertulis: tidak ada mekanisme deteksi listing duplikat dari kemiripan foto antar-listing milik agen yang sama. Diformalkan sebagai **OD-25** (`decision-log.md` §11), dijawab langsung Owner, disahkan sebagai `architecture-decision-records.md` **ADR-029** (Approved), disinkronkan ke `decision-log.md` sebagai **ADR-047**.

**Keputusan:** kolom `file_hash` (SHA-256) + `photo_hash` (perceptual hash 64-bit, library `image-hash`) ditambahkan ke `listing_photos`; deteksi dua-tingkat — **blocking** untuk foto identik (Hamming Distance=0), **non-blocking warning** untuk kemiripan 90-99% (HD 1-6) — dibatasi ke listing aktif milik `agent_id` yang sama.

**Dokumen naik versi:** `PRD-...md` **v1.2→v1.3** (Business Rule Modul 3), `ERD-Skema-Database-...md` **v1.3→v1.4** (kolom `file_hash`/`photo_hash`), `API-Specification-...md` **v1.2→v1.3** (kontrak `POST /listings/{id}/media` & `PATCH /listings/{id}/status`, **plus 2 regresi API Spec lain yang ikut ditemukan & diperbaiki di file yang sama, lihat blok TASK-HOTFIX di atas**). `document-governance-baseline-register.md` naik ke **v1.10** (Governance Notes poin 38) — sinkronisasi ini sempat terlewat dari Baseline Register sampai ditemukan saat audit konsolidasi terpisah.

---

**🟢 (Baru, rev. 9 — 9-10 Agustus 2026) Audit konsolidasi riwayat versi 13 Module Planning + `SYSTEM-ARCHITECTURE.md` + AI Development Blueprint — selesai penuh.** `document-governance-baseline-register.md` naik v1.7→v1.8→v1.9 (Governance Notes poin 22-37):
- **`SYSTEM-ARCHITECTURE.md`** — ditemukan 3 dari 9 snapshot revisi berlabel "v1.6"/"3 Agustus 2026" identik (pelanggaran prinsip satu-file-per-Baseline). Nomor versi publik dipertahankan v1.6; file kanonik tunggal ditetapkan, 9 snapshot lama direkomendasikan diarsipkan.
- **`AI-DEVELOPMENT-BLUEPRINT.md`/`development-playbook.md`** — file kanonik diupload ulang dengan nama eksplisit, rujukan `SYSTEM-ARCHITECTURE.md` disamakan ke nama kanonik. Nilai versi tidak berubah.
- **Module Dependency Matrix (MDM) & Module Implementation Strategy (MIS)** — diaudit; MDM punya 9 rujukan usang ke `SYSTEM-ARCHITECTURE.md` (sudah diperbaiki); MIS bersih, tidak ada temuan.
- **MP-01 s.d. MP-13** — seluruhnya diaudit ulang verifikasi-silang-ketat terhadap file sumber aktual (bukan mengandalkan klaim status internal MP). **Hasil: 7 dari 13 diverifikasi mengandung regresi** (persis 5 temuan di atas: migration `0007`/`0008`/`0009`/`0010` + API Specification) — seluruhnya sudah diperbaiki per blok TASK-HOTFIX di atas. MP-02 sempat hanya terverifikasi parsial di audit awal, **diaudit ulang standar penuh pada 10 Agustus — bersih, tidak ada regresi** (Governance Notes poin 37).
- **Kebijakan governance baru, berlaku sejak temuan ini:** setiap klaim "sudah diperbaiki [tanggal]" yang merujuk dokumen/file sumber lain **wajib diverifikasi silang terhadap file aktual** sebelum status Resolved dianggap sah — tidak lagi cukup mengandalkan narasi status di dalam dokumen MP itu sendiri.

---

**✅ (Baru, rev. 8 — 7 Agustus 2026) Gate implementasi kode Modul 12 (Organization) — RESMI TERBUKA.** Owner menyatakan eksplisit dalam sesi kerja tanggal 7 Agustus 2026 bahwa gate Modul 12 terbuka, memenuhi syarat konfirmasi eksplisit yang disyaratkan `PROJECT-CONSTITUTION.md` §24 poin 10 dan `development-playbook.md` Golden Rule 40 — mekanisme identik dengan pembukaan gate Modul 13 pada 6 Agustus 2026. Seluruh prasyarat teknis M12 sudah terpenuhi lebih dulu (§47 `MP-12-Organization-Module-Planning-v1.0.md`): PRD v1.2 Baseline, ERD §2.38-2.40 v1.3 Baseline, migration `0007` tertulis, ADR-026/ADR-027 Approved, RLS `org_invitations_insert` (Konflik #1) sudah diperbaiki 6 Agustus, dan T3-06 (RLS child-table listing) sudah diperbaiki 6 Agustus — **konfirmasi gate ini adalah satu-satunya item yang tersisa**, kini terpenuhi. `MP-12-Organization-Module-Planning-v1.0.md` §48 (Definition of Ready) diperbarui: baris "Konfirmasi eksplisit Owner: gate kode M12 terbuka" ditandai selesai. AI Coding Assistant **kini diizinkan** menulis migration/endpoint/komponen Modul 12, mengikuti urutan MIS (posisi #12/Batch 4) dan MP-12 sebagai spesifikasi resmi. **Dengan ini, tidak ada satu pun modul (dari 13) yang masih memiliki blocker governance tersisa** — M12 dan M13 kini setara statusnya dengan 11 modul lain: GO tanpa syarat gate tambahan.

---

## Keputusan yang Telah Selesai (Approved)

Tidak berubah dari 3 Agustus — seluruh **28 ADR** tetap Approved/Approved With Notes. Lihat `architecture-decision-records.md` v1.1 untuk daftar lengkap (tidak diduplikasi di sini untuk menghindari drift dua sumber — dokumen ADR adalah rujukan otoritatif satu-satunya untuk daftar ini).

## Open Decision yang Tersisa

**Tidak ada ADR yang berstatus OPEN.** Dua item bisnis murni tetap terbuka secara sengaja (bukan gap): model monetisasi, threshold DBR final — keduanya wajib tetap *configurable*, bukan blocker Sprint manapun.

---

# Overall Progress

> Kolom **Progress** mengukur *implementasi/eksekusi nyata*, bukan kelengkapan desain/dokumentasi. **(v0.1 rev. 6 Agustus)** Baris "Database Migration Scripts" dipisah eksplisit dari "Phase 0 — Foundation Infrastructure" karena keduanya kini berstatus berbeda: skrip **sudah ditulis** (source code ada), tapi **belum dieksekusi** (belum ada efek di database live) — sebelumnya kedua hal ini tercampur di satu baris "Not Started 0%" yang menyesatkan.

| Module | Status | Progress |
|---|---|---|
| Governance & Documentation (24+ dokumen: Constitution, PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2, SEO Spec v1.1, Entity Mapping v1.0, Authorization/Functional/UI/Technical Spec v1.0, System Architecture, Technology Decisions, Dependency Manifest, AI Dev Blueprint, AI Context Pack v1.1, Development Roadmap, Task Template v1.1, ADR v1.1, Module Dependency Matrix v1.0, Module Implementation Strategy v1.1, dsb.) | Completed | 100% |
| **(Baru) Database Migration Scripts** (15 file `.sql` + konsolidasi + Database Dictionary — mencakup seluruh 13 modul termasuk M12/M13) | **Written — Not Executed** (source code ada, database live belum ada) | 100% ditulis / **0% dieksekusi** |
| Phase 0 — Foundation Infrastructure (monorepo, CI/CD, inisialisasi project Supabase, eksekusi migration di atas) | Not Started | 0% |
| Modul 1 — Authentication | Not Started | 0% |
| Modul 2 (dasar) — Agent Profile Core | Not Started | 0% |
| Modul 9 + 10 (dasar) — Admin Panel & RBAC Enforcement | Not Started | 0% |
| Modul 3 — Listing Management | Not Started | 0% |
| Modul 11 — SEO Foundation Hardening | Not Started | 0% |
| Modul 2 (ext.) — Buyer Account & Agent Reviews | Not Started | 0% |
| Modul 8 — Dashboard & Notifikasi | Not Started | 0% |
| Modul 6 — Developer Directory | Not Started | 0% |
| Modul 7 — DBR Scoring Calculator | Not Started | 0% |
| Modul 4 — Learning Center | Not Started | 0% |
| Modul 5 — Kalender Event | Not Started | 0% |
| Phase 4 — Production Readiness & Launch | Not Started | 0% |
| **Modul 12 — Organization Management** | Skema: Baseline & migration ditulis. **Kode aplikasi: Not Started — gate TERBUKA (dikonfirmasi Owner 7 Agustus 2026), siap masuk Sprint sesuai MIS urutan #12/Batch 4. MP-12 tersedia sebagai spesifikasi implementasi.** | 0% (kode, siap mulai) |
| **Modul 13 — AI Assistant Integration** | Skema: Baseline & migration ditulis. **Kode aplikasi: Not Started — gate TERBUKA (dikonfirmasi Owner 6 Agustus 2026), siap masuk Sprint sesuai MIS urutan #7. MP-13 tersedia sebagai spesifikasi implementasi.** | 0% (kode, siap mulai) |

**Ringkasan:** 2 dari 17 baris selesai/tertulis penuh (dokumentasi 100%, migration SQL 100% ditulis). **Implementasi aplikasi (kode yang berjalan): tetap 0% secara keseluruhan** — tidak ada Route Handler, komponen, service, atau database live. Perbedaan dari snapshot 4 Agustus: migration SQL yang sebelumnya sepenuhnya "Belum dibuat" kini berstatus "Ditulis, belum dieksekusi" — sebuah kemajuan nyata pada lapisan source code, meski belum berefek pada sistem yang berjalan.

---

# Existing Database

**Migration SQL: SUDAH DITULIS LENGKAP (source code ada di repository).** **Database live: BELUM ADA** — belum ada project Supabase/PostgreSQL fisik yang diinisialisasi, belum ada satu migration pun yang **dijalankan**, sehingga belum ada satu tabel pun yang benar-benar berdiri di database manapun.

**(Baru, 6 Agustus) Rincian migration SQL yang sudah ditulis** (15 file bernomor urut + 1 file konsolidasi, seluruhnya di root repository dokumen sumber):

| File | Modul | Baris |
|---|---|---|
| `0001_extensions_helpers.sql` | Extensions & helper functions | 59 |
| `0002_m10_rbac_foundation.sql` | M10 — RBAC (`roles`/`permissions`/`role_permissions`) | 83 |
| `0003_m01_auth.sql` | M01 — Authentication (`users`, `agent_verification_documents`) | 86 |
| `0004_region_reference.sql` | Referensi Wilayah (`ref_provinces/cities/districts/villages`) | 59 |
| `0005_m02_agent_profile.sql` | M02 — Profil Agen | ~85 *(naik dari 70, UNIQUE constraint + RLS baru ditambahkan 6 Agustus — OD-23, kebijakan review & self-review Agen)* |
| `0006_m06_developer.sql` | M06 — Direktori Developer | 86 |
| `0007_m12_organization.sql` | **M12 — Organization** (dibangun sebelum M03 karena `listings.organization_id` mereferensikannya) | ~103 *(naik dari 98, RLS `org_invitations_insert` diperbaiki 6 Agustus — T1-04)* |
| `0008_m03_listing.sql` | M03 — Listing (tabel terbesar) | ~220 *(naik dari 198, RLS `listings_select_public`+3 child table diperbaiki 6 Agustus — T1-02, T3-06)* |
| `0009_m04_learning_center.sql` | M04 — Learning Center | ~155 *(naik dari 127, RLS `quiz_questions_manage`/`quiz_options_manage`/`enrollments_own`/`quiz_attempts_own` diperbaiki 6 Agustus — T1-01)* |
| `0010_m05_events.sql` | M05 — Kalender Event | ~65 *(naik dari 53, `events_manage` dipecah jadi 4 policy 6 Agustus — T1-03)* |
| `0011_m07_dbr.sql` | M07 — DBR Scoring | 49 |
| `0012_m08_notifications.sql` | M08 — Notifikasi | 22 |
| `0013_m09_admin.sql` | M09 — Admin/Sistem | 43 |
| `0014_m11_seo.sql` | M11 — SEO (`url_redirects`) | 47 |
| `0015_m13_ai_assistant.sql` | **M13 — AI Assistant** | 52 |
| `Database-Migration-Full-v1.0.sql` | Konsolidasi seluruh migration di atas dalam satu file | 1.132 |

**Status resmi (dari `Database-Dictionary-Migration-Ready-v1.0.md`):** **Draft — menunggu pengesahan Owner & eksekusi Sprint S0.** Migration ini adalah penerjemahan 1:1 dari ERD v1.3 ke DDL PostgreSQL presisi (tipe data, constraint, index, RLS-ready) — **tidak ada** entity/kolom/keputusan bisnis baru yang diperkenalkan di sini di luar yang sudah ada di ERD v1.3/Entity Mapping v1.0.

**(Baru, 6 Agustus) Issue Register Batch 1 — 5 bug RLS diperbaiki.** 4 file di atas (`0007`, `0008`, `0009`, `0010`) mengalami perbaikan **RLS policy saja** (`TASK-HOTFIX-20260806-001`, sumber `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0) — **tidak ada perubahan tabel/kolom/index**, status keseluruhan tetap Draft/belum dieksekusi. Detail lengkap di bagian *Perkembangan Baru* di atas dan `CHANGELOG.md` rilis `0.4.2`.

**⚠️ Implikasi penting untuk urutan Sprint S0:** Karena `0007_m12_organization.sql` sengaja ditempatkan **sebelum** `0008_m03_listing.sql` (listing mereferensikan `organization_id`), **eksekusi migration mengasumsikan skema M12 valid lebih dulu dari M03** — ini murni kebutuhan **integritas skema database** (FK constraint), **bukan** berarti gate kode aplikasi M12 sudah terbuka lebih dulu dari M03. Jangan disalahartikan sebagai perubahan urutan implementasi aplikasi di `Module-Dependency-Matrix-...v1.0.md` (yang tetap menempatkan M03 jauh sebelum M12 dari sisi kode aplikasi).

**Prinsip desain data yang wajib diingat AI (tidak berubah):**
- PK selalu UUID, bukan auto-increment.
- Soft delete (`deleted_at`) untuk **8 tabel**: `listings`, `users`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` — **plus `organizations` juga sudah memakai pola ini di `0007_m12_organization.sql`** (dikonfirmasi di source migration, konsisten prinsip `ADR-046` diterapkan ke tabel baru).
- `agent_id`/`user_id` adalah **ownership boundary** hard-coded.
- Field lokasi selalu cascading, bukan freetext.
- `listings.search_vector` (generated column) + index GIN + `pg_trgm` — sudah tertulis di `0008_m03_listing.sql`, belum dieksekusi.
- `rate_limit_log`, `geocode_cache`, `api_rate_limits` — tabel infrastruktur, sudah tertulis di migration terkait, belum dieksekusi.

---

# Existing API

**Belum dibuat.** Belum ada Route Handler/service backend yang di-deploy atau dapat dipanggil. Tidak ada endpoint yang benar-benar hidup — **ini tidak berubah** oleh selesainya migration SQL (migration hanya skema database, bukan API layer).

> Kontrak **target** endpoint sudah didefinisikan lengkap di `API-Specification-RUMAHAGEN-v1.2.md` (kini termasuk §5A Organization API, §5B AI Assistant API). Pola implementasinya terkunci sebagai Route Handlers (`app/api/v1/**/route.ts`) menyusul ADR-001 — tidak ada opsi bercabang. Mekanisme search (ADR-005), job queue (ADR-006), Maps (ADR-008), dan rate limiting (ADR-018) seluruhnya terkunci, tidak berubah dari snapshot sebelumnya.

---

# Existing Components / Layouts / Hooks / Services / Utilities / Middleware / Authentication / Authorization / Folder Structure / Active Dependencies

**Seluruhnya tetap "Belum dibuat"** — tidak ada perubahan dari snapshot 4 Agustus pada lapisan-lapisan ini. Migration SQL dan sinkronisasi dokumen 5 Agustus **tidak** menyentuh area ini. Rujuk desain target di `SYSTEM-ARCHITECTURE.md` Bagian 6, 8, 10-13 dan `development-playbook.md` Bagian 7-13 — seluruhnya masih murni desain, belum ada implementasi.

---

# Pending Modules

Urutan implementasi **kini merujuk `Module-Implementation-Strategy-RUMAHAGEN-v1.1.md` Bagian 3** sebagai rujukan resmi (menggantikan tabel `DEVELOPMENT-ROADMAP.md`/`development-playbook.md` §23 yang sebagian sudah tidak sinkron — lihat *Known Technical Debt* poin 9):

1. Phase 0 — Foundation Infrastructure (**eksekusi** migration `0001`–`0015` yang sudah ditulis, monorepo, CI/CD)
2. Modul 10 — RBAC (Foundation)
3. Modul 1 — Authentication (Foundation)
4. Modul 9 — Admin Panel (kerangka dasar)
5. Modul 2 — Profil Agen
6. Modul 6 — Developer Directory
7. Modul 4 — Learning Center
8. Modul 13 — AI Assistant *(gate terbuka, tidak lagi kondisional — MP-13 tersedia)*
9. Modul 3 — Listing Management
10. Modul 5 — Kalender Event
11. Modul 7 — DBR Scoring Calculator
12. Modul 11 — SEO Foundation Hardening
13. Modul 12 — Organization Management *(gate terbuka, tidak lagi kondisional — MP-12 tersedia)*
14. Modul 8 — Dashboard & Notifikasi
15. Phase 4 — Production Readiness & Launch

---

# Known Technical Debt

**Belum ada technical debt kode** — wajar, belum ada kode aplikasi yang ditulis (migration SQL bukan "aplikasi", murni skema).

| # | Ketidaksinkronan | Dokumen Terdampak | Status |
|---|---|---|---|
| 1-7 | *(item lama, lihat versi dokumen 4 Agustus — status tidak berubah pada siklus ini: sebagian resolved, sebagian tetap open non-blocking)* | Berbagai | Tidak berubah |
| 8 | ~~Modul 12/13 Approved arsitektur, namun PRD/ERD/API Spec/User Flow/SEO Spec v1.1 belum direvisi untuk mencantumkan kedua modul ini.~~ | `PRD.md`, `ERD.md`, `API-Specification.md`, `User-Flow.md` | ✅ **RESOLVED, 5 Agustus 2026** — seluruh dokumen di atas naik versi (PRD v1.2, ERD v1.3, API Spec v1.2, User Flow v1.2) dan mencantumkan M12/M13 penuh. Lihat *ADR & Governance Snapshot*. |
| 9 | **(Baru, 6 Agustus)** `development-playbook.md` §23 (Development Order) memuat tabel urutan modul yang **sebagian berbeda** dari `Module-Dependency-Matrix-...v1.0.md`/`Module-Implementation-Strategy-...v1.1.md` — §23 masih mereferensikan `PRD-v1.1.md`, belum sepenuhnya sinkron dengan PRD v1.2/ADR-026-028. | `development-playbook.md` §23 | Open — **non-blocking**, MDM/MIS dipakai sebagai rujukan tunggal urutan modul (lihat *Pending Modules*) sampai §23 disinkronkan ulang secara resmi. |
| 10 | ~~Migration SQL untuk M12/M13 (`0007`, `0015`) sudah ditulis dan skema sudah Baseline, namun tidak ada pernyataan eksplisit di dokumen governance manapun bahwa ini otomatis membuka gate kode aplikasi M12/M13.~~ | `PROJECT-CONSTITUTION.md` §24 poin 10, dokumen ini | ✅ **RESOLVED** — M13 **RESOLVED 6 Agustus 2026**, M12 **RESOLVED 7 Agustus 2026** (rev. 8). Owner menyatakan eksplisit gate kedua modul terbuka secara terpisah (per aturan "tidak dapat diasumsikan otomatis antar-modul"). Lihat *Perkembangan Baru*. |
| 11 | ~~4 bug RLS Tier 1 (self-approval event, listing sold/rented ter-block, ownership bank soal Instructor hilang, spoofing leader invitation) + 1 gap Tier 3 (RLS child-table listing tidak konsisten dengan parent Org Leader)~~ | `0007`, `0008`, `0009`, `0010` (migration SQL) | ~~✅ RESOLVED, 6 Agustus 2026~~ **⚠️ KLAIM INI TERBUKTI KELIRU pada verifikasi 9-10 Agustus 2026** — perbaikan tidak pernah benar-benar tersimpan ke file. **Sekarang benar-benar RESOLVED, 10 Agustus 2026**, via file `-FIXED` — lihat poin 15 baru di bawah dan blok `TASK-HOTFIX-20260806-001` di *Perkembangan Baru*. Entri asli baris ini **tidak diedit**, dipertahankan sesuai aturan histori tidak ditulis ulang. |
| 12 | **(Baru, 6 Agustus)** Endpoint approve/reject event (M05) tidak ada di API Specification, ditemukan saat perbaikan T1-03 — RLS kini sudah membatasi transisi status ke all-scope, tapi belum ada kontrak API resmi untuk endpoint tsb. | `API-Specification-...v1.2.md` | **Open — non-blocking untuk Sprint S0/M05 coding awal**, tapi wajib ditambahkan sebelum M05 dianggap Definition of Done (lihat `MP-05-KalenderEvent-Module-Planning-v1_0.md` §46). |
| 13 | ~~2 kontradiksi internal PRD soal Manager (M04/M05) + 5 gap Tier 3 (bootstrap Superadmin, wilayah eksklusif developer, CRUD akun internal, cakupan AI Assistant DevPartner, kebijakan Amenity)~~ | `PRD-...v1.2.md`, `Authorization-Access-Control-Specification-v1.0.md`, `User-Flow-...v1.2.md`, `API-Specification-...v1.2.md` | ✅ **RESOLVED, 6 Agustus 2026** (Issue Register Batch 2, OD-16 s.d. OD-22) — lihat *Perkembangan Baru* dan `CHANGELOG.md` rilis `0.5.0`. |
| 14 | ~~T3-02 (MP-02) — bukti interaksi/lead sebelum submit review agen tidak ditegakkan di RLS~~ | `0005_m02_agent_profile.sql` | ✅ **RESOLVED, 6 Agustus 2026** (OD-23) — dikonfirmasi memang tidak wajib by design; ditambah kebijakan baru (1 review/agen + replace + self-review), lihat *Perkembangan Baru* dan `CHANGELOG.md` rilis `0.6.0`. |
| 15 | **(Baru, rev. 9)** File migration `-FIXED` (`0007`/`0008`/`0009`/`0010-FIXED.sql`) berisi perbaikan nyata untuk `TASK-HOTFIX-20260806-001`, namun **file lama tanpa suffix (versi bug) masih ada berdampingan** di folder project — belum di-rename/diganti ke nama kanonik. Risiko: siapa pun (manusia atau AI session lain) yang membuka file tanpa memperhatikan suffix akan memakai versi bug. | `0007_m12_organization.sql`, `0008_m03_listing.sql`, `0009_m04_learning_center.sql`, `0010_m05_events.sql` (dan pasangan `-FIXED` masing-masing) | **Open — wajib diselesaikan SEBELUM Sprint S0 mengeksekusi migration ke database.** Tindakan: rename file `-FIXED` → nama kanonik (tanpa suffix), pindahkan file lama ke folder arsip. Lihat *Next Recommended Module* langkah 4. |
| 16 | **(Baru, rev. 9)** Migration SQL (seluruh 15 file, termasuk yang sudah diperbaiki di poin 15) **belum pernah dieksekusi ke database live sepanjang proyek** — status ini tercatat sejak rev. 1 dan **belum berubah** sampai rev. 9. | Seluruh `0001`–`0015` | Open — bagian dari Sprint S0, bukan gap terpisah. Dicantumkan di sini agar tidak terselip di antara narasi "migration sudah ditulis lengkap" yang bisa disalahbaca sebagai "sudah live". |

---

# Open Decision (ADR) yang Tersisa

**Tidak ada ADR yang berstatus OPEN.** Tidak berubah dari snapshot sebelumnya.

---

# Readiness Snapshot (Governance)

**Baseline Readiness per dokumen (diperbarui 10 Agustus, rev. 9):**

| Dokumen | Status |
|---|---|
| PRD | **Ready** — **v1.3** *(naik dari v1.2, OD-25/ADR-047)*, Baseline, mencakup 13 modul + Business Rule deteksi duplikat foto |
| ERD | **Ready** — **v1.4** *(naik dari v1.3, OD-25/ADR-047)*, Baseline, mencakup kolom `file_hash`/`photo_hash` |
| Entity Mapping | **Ready** — v1.0, Baseline |
| API Specification | **Ready** — **v1.3-FINAL-FIXED** *(naik dari v1.2; gabungan OD-25 + pemulihan regresi OD-20 + T4-11, lihat *Perkembangan Baru*)* |
| Authorization & Access Control Specification | **Ready** — v1.1, Baseline |
| Functional / UI / Technical Specification | **Ready** — v1.0 masing-masing, Baseline |
| Technology Decisions | **Ready** — Baseline, tidak ada Open Decision arsitektur/teknis/administratif tersisa |
| System Architecture | **Ready** — Baseline (v1.6, konsolidasi penomoran snapshot selesai — lihat *Perkembangan Baru*) |
| **Database Migration (SQL)** | **⚠️ Ditulis, sebagian sempat regresi, kini diperbaiki — file `-FIXED` BELUM di-rename ke kanonik, BELUM dieksekusi ke live.** Lihat *Known Technical Debt* poin 15-16. |
| Module Dependency Matrix / Module Implementation Strategy | **Ready** — v1.0/v1.1, diaudit 10 Agustus (MDM 9 rujukan diperbaiki, MIS bersih) |
| `document-governance-baseline-register.md` | **Ready** — **v1.10**, Governance Notes poin 1-38 |
| `ISSUE-REGISTER-Konsolidasi-...md` | **Ready** — v2.0, 32/32 isu Closed (status closure diverifikasi ulang 9-10 Agustus, tidak berubah) |

**Kondisi GO WITH CONDITIONS — status per 10 Agustus 2026:** **Tetap 6 dari 6 kondisi resmi terpenuhi.** **Status proyek: GO — dengan satu syarat baru sebelum eksekusi migration:** file `-FIXED` wajib menggantikan file lama (poin 15) sebelum Sprint S0 menjalankan migration ke database. Ini **bukan blocker desain/keputusan** (murni housekeeping file), tapi wajib dilakukan agar migration yang dieksekusi adalah versi yang benar.

---

# Next Recommended Module

## Sprint S0 — Foundation Infrastructure (Eksekusi)

**Perubahan signifikan dari rekomendasi sebelumnya:** sebagian besar pekerjaan **desain** Sprint S0 (skema `roles`/`permissions`/`users`/region data, dst.) **sudah selesai dalam bentuk migration SQL tertulis**. **(Baru, rev. 9) Satu langkah wajib baru ditambahkan di posisi #1** — akibat regresi `TASK-HOTFIX-20260806-001` (lihat *Perkembangan Baru*), file migration yang benar untuk 4 modul kini berada di file bersuffix `-FIXED`, bukan file bernomor biasa:

1. **⚠️ WAJIB, BARU — Ganti file migration ke versi benar SEBELUM eksekusi apa pun:** rename `0007_m12_organization-FIXED.sql`→`0007_m12_organization.sql`, `0008_m03_listing-FIXED.sql`→`0008_m03_listing.sql`, `0009_m04_learning_center-FIXED.sql`→`0009_m04_learning_center.sql`, `0010_m05_events-FIXED.sql`→`0010_m05_events.sql` (timpa file lama). Pindahkan 4 file lama ke folder arsip, **jangan dihapus** (histori). 11 file migration lain (`0001`–`0006`, `0011`–`0015`) tidak terdampak regresi ini, tidak perlu diganti.
2. Inisialisasi monorepo (`apps/web`, `packages/shared-types`), Next.js + TypeScript.
3. Setup Tailwind + shadcn/ui, ESLint/Prettier/Husky.
4. CI pipeline (GitHub Actions).
5. **Buat project Supabase nyata**, lalu **jalankan `0001`–`0015` (versi HASIL langkah 1, bukan file lama) secara berurutan** — migration sudah ada, tinggal dieksekusi & diverifikasi terhadap `Database-Dictionary-Migration-Ready-v1.0.md`.
6. **Jalankan `scripts/seed-superadmin.ts`** (OD-18, Issue Register Batch 2) — segera setelah migration selesai, sebelum ada agen mendaftar. Perintah: `pnpm tsx scripts/seed-superadmin.ts --email <email> --name "<nama>"` (password diminta via prompt tersembunyi). Wajib set `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` di `.env.local` dulu — lihat `scripts/README-seed-superadmin.md`.
7. Skeleton route group + middleware skeleton.
8. Scaffold environment variables.

**Acceptance Criteria S0:** **file migration langkah 1 sudah diganti ke versi `-FIXED` sebelum langkah lain dimulai**; CI pipeline lolos pada commit kosong; **seluruh 15 file migration (versi benar) dapat dijalankan berurutan dari database kosong tanpa error**; seed data wilayah terverifikasi jumlahnya; **tabel `organizations`/`agent_ai_connections` berhasil dibuat sebagai bagian skema meski kode aplikasi M12/M13 belum ditulis** (skema boleh live, aplikasi belum); **`scripts/seed-superadmin.ts` berhasil dijalankan, satu akun Superadmin aktif terverifikasi bisa login.**

**Catatan gate M12/13 (diperbarui rev. 8):** eksekusi migration `0007`/`0015` di Sprint S0 tetap **wajib** murni untuk kebutuhan integritas FK skema. **Gate kode aplikasi (Route Handler/UI) untuk M12 dan M13 kini KEDUANYA TERBUKA** (M13 sejak 6 Agustus, M12 sejak 7 Agustus 2026) — tidak ada lagi modul yang menunggu konfirmasi Owner terpisah sebelum Sprint terkait dimulai. Implementasi tetap wajib mengikuti urutan `Module-Implementation-Strategy-...v1.1.md` Bagian 3 (M13 di Batch 2/posisi #7, M12 di Batch 4/posisi #12) — gate terbuka bukan izin untuk mengerjakan keduanya lebih awal dari urutan MIS.

---

# AI Session Rules

Tidak berubah dari snapshot sebelumnya (13 aturan + 1 dari rev sebelumnya), dengan **1 penambahan (rev. 9)**:

14. **(Baru, 6 Agustus) Migration SQL yang sudah tertulis (`0001`–`0015`) tidak boleh ditulis ulang/didesain ulang dari nol** — jika task menyentuh skema database, gunakan file yang sudah ada sebagai basis (edit/tambah migration bernomor berikutnya jika perlu perubahan), bukan membuat migration paralel yang tumpang tindih. Jika ditemukan perbedaan antara migration SQL yang sudah ada dan ERD v1.3/`Database-Dictionary-Migration-Ready-v1.0.md`, laporkan sebagai temuan — jangan diam-diam memilih salah satu sebagai benar.
15. **(Baru, rev. 9 — pelajaran dari `TASK-HOTFIX-20260806-001`) Klaim "sudah diperbaiki [tanggal]" di dokumen manapun (MP, Issue Register, dokumen ini sendiri) TIDAK BOLEH dipercaya begitu saja — wajib diverifikasi langsung terhadap isi file sumber sebelum diasumsikan benar**, terutama sebelum mengeksekusi migration ke database live atau membangun kode di atasnya. Regresi 9-10 Agustus (4 migration + API Specification) terjadi persis karena status "Diperbaiki" di dokumen tidak pernah dicek ulang terhadap file aktual selama beberapa hari. Jika AI Coding Assistant akan menggunakan sebuah file yang diklaim "sudah diperbaiki" sebagai basis kerja, baca isi file itu langsung — jangan hanya membaca narasi status di dokumen governance yang merujuknya.

---

*Dokumen ini adalah catatan status proyek yang hidup (living document) — wajib diupload ulang ke AI Coding Assistant di setiap sesi development baru, dan wajib diperbarui setiap kali ada perubahan nyata pada kode/skema/struktur proyek. Tidak ada informasi di dokumen ini yang dikarang — setiap bagian yang belum ada dicatat eksplisit sebagai "Belum dibuat", dan setiap bagian yang sudah ditulis-tapi-belum-dieksekusi dicatat eksplisit sebagai demikian, tidak disamakan dengan "selesai".*

---

# D6 GLOBAL BASELINE SYNCHRONIZATION OVERLAY
**Date:** 16 August 2026  
**Status:** FINAL GLOBAL AEP1–AEP4 SEMANTIC SYNCHRONIZATION — PASS WITH CONTROLLED RESIDUALS

## Purpose
This section records the post-AEP1–AEP4 global semantic baseline. It is authoritative for cross-domain synchronization status, while the underlying document remains authoritative for its own domain and source-of-truth role.

## Canonical AEP state
| AEP | Domain | Current gate | Canonical interpretation |
|---|---|---|---|
| AEP #1 | Monetization / Commercial + Payment | CONDITIONALLY COMPLETE | Semantic synchronization complete; OPEN-C01, MBR-COM evidence and selected engineering verification remain residuals; physical implementation remains downstream. |
| AEP #2 | Learning Economy | PASS WITH CONTROLLED RESIDUALS | Learning Economy semantic/downstream synchronization complete; MADCR-049 remains OPEN / RE-EVALUATION; automated test evidence remains unverified. |
| AEP #3 | Title / Awarding | SEMANTIC ARCHITECTURE COMPLETE / CONTROLLED OPEN ITEMS | Title/Awarding semantic state synchronized; OD-02…05 remain controlled downstream open items; OD-06 is CLOSED Option B. |
| AEP #4 | Learning Session | PASS WITH CONTROLLED RESIDUALS | Session semantic/downstream synchronization complete; OD-08, MADCR-049, MADCR-053/054 and other controlled residuals remain explicit. |

## Global authority map
- Commercial / Payment owns payment processing, verification and Commercial Entitlement.
- Learning Economy owns Learning Point transactions/provenance.
- Learning Session owns Session lifecycle and evaluation of participation evidence.
- RBAC owns authorization.
- Awarding owns qualification and Award Instance.
- Event Calendar remains integration/presentation context; Learning Session is semantic session authority.
- Provider systems remain infrastructure; provider events are evidence inputs, not RUMAHAGEN business outcomes.

## Canonical cross-domain invariants
1. Subscription ≠ Commercial Entitlement ≠ RBAC.
2. Learning Points ≠ Commercial Entitlement.
3. Course Enrollment ≠ Session Enrollment ≠ Event Registration.
4. Provider Session ID ≠ semantic Learning Session ID.
5. Provider participation ≠ Attendance Outcome ≠ Completion Outcome.
6. Completion ≠ Skill/Credential ≠ Title/Award Instance.
7. Payment Confirmed does not directly issue LP, Credential, or Award.
8. Purchased LP grant is idempotent against the confirmed Commercial transaction.
9. Learning/Session outcomes are evidence to Awarding where the applicable Awarding Path/Rule permits them.
10. Historical commercial, learning, session and awarding records must remain explainable after configuration/version changes.
11. Presentation preference does not mutate Award ownership/lifecycle.
12. Authorization does not equal qualification or commercial entitlement.

## Global implementation hold
The AEP consolidation is a semantic/governance synchronization gate. It does **not** by itself authorize:
- physical schema migration;
- production payment-provider activation;
- final provider-specific contracts/credentials;
- final RBAC permission IDs/scopes where governance remains open;
- automatic provider failover;
- final Learning Activity evidence contract under MADCR-049;
- unresolved Awarding physical cardinality/temporal/storage choices.

Implementation authorization remains subject to the applicable downstream/global gate.

## Stale-document rule
Older documents may contain pre-AEP wording. They remain historical evidence. They must not override the canonical state above. Examples include older M05 Event/live-session wording and older AEP3 OD-06 OPEN wording. These are controlled documentation deltas, not new architecture decisions.

## Residual control rule
Existing residuals are carried forward; none is silently closed by D6. A residual may be closed only by its owning governance/decision gate and must then propagate through the normal synchronization process.

## D6 gate
**PASS — GLOBAL AEP1–AEP4 SEMANTIC BASELINE SYNCHRONIZATION COMPLETE.**

## D6 Current Project State Addendum
Post-AEP4 global synchronization is complete at semantic/governance level. Project physical implementation status is unchanged by this step unless an independently authorized downstream implementation gate says otherwise.
