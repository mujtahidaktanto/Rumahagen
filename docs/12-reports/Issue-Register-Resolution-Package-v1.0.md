# PAKET PENYELESAIAN ISSUE REGISTER
## Prompt Eksekusi + Pemetaan Sinkronisasi Dokumen
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Dasar:** `ISSUE-REGISTER-Konsolidasi-FINAL.md` v2.0 (32 isu, 13 Module Planning)
**Tujuan:** Menyediakan (1) rekomendasi cara menjalankan penyelesaian, (2) pemetaan file yang perlu disinkronkan per isu, dan (3) prompt siap pakai per Tier — agar penyelesaian Issue Register tidak menghasilkan drift baru antar dokumen.

---

# BAGIAN A — REKOMENDASI CARA MENJALANKAN

## A.1 Ringkasan Keputusan

**Jalankan dalam 4 batch terpisah, berurutan, dengan stop-and-sync di antaranya — bukan 1 perintah tunggal.**

```
Batch 1 (Teknis, GO sekarang)          Batch 2 (Butuh keputusan Anda)
┌─────────────────────────┐            ┌─────────────────────────┐
│ 5 perbaikan RLS         │            │ 7 isu diformat sebagai   │
│ T1-01,T1-02,T1-03,T1-04 │            │ OD-XX baru → Anda jawab  │
│ + T3-06                 │            │ → BARU dieksekusi        │
└──────────┬───────────────┘            └──────────┬───────────────┘
           │ update MP terkait                      │ update PRD/Authorization
           │ + Issue Register                        │ Spec/API Spec + MP terkait
           ▼                                          ▼
     STOP — verifikasi                          STOP — verifikasi
           │                                          │
           └──────────────┬───────────────────────────┘
                           ▼
                  Batch 3 (Editorial, GO kapan saja)
                  17 isu Tier 4 — 1 audit menyeluruh
                  Authorization Spec + citation fixes
                           │
                           ▼
                     STOP — verifikasi
                           │
                           ▼
                  Batch 4 (Sinkronisasi final)
                  Update CURRENT-PROJECT-STATE.md,
                  Issue Register → status CLOSED,
                  bump versi dokumen yang berubah
```

## A.2 Kenapa Bukan 1 Perintah

1. **7 dari 32 isu tidak punya jawaban benar yang bisa disimpulkan dari dokumen** (T2-01, T2-02, T3-01, T3-03, T3-05, T3-07, dan bagian keputusan gate T3-04) — AI dipaksa menjawab dalam 1 perintah besar akan **mengarang keputusan bisnis**, persis yang dihindari sepanjang 13 Module Planning ini.
2. **Perbaikan Tier 1 menyentuh file migration yang sama** yang mungkin juga tersentuh keputusan Tier 3 (mis. `0008_m03_listing.sql` kena T1-02 **dan** T3-06 **dan** T3-07) — kalau digabung sembarangan dalam 1 pass tanpa urutan jelas, berisiko conflict edit atau ada perbaikan yang tertimpa.
3. **Auditor/Owner butuh titik verifikasi** — konsisten prinsip `development-playbook.md` §21 (AI wajib berhenti & bertanya jika ada ambiguitas, bukan menyelesaikan sepihak).

## A.3 Kenapa Pola OD (Open Decision) Cocok untuk Tier 2 + Sebagian Tier 3

Proyek ini **sudah punya mekanisme ini** — pola `OD-02`, `OD-07`, `OD-11` di `document-governance-baseline-register.md`/`AI-CONTEXT-PACK.md`. Menggunakan pola yang sama untuk 7 isu Issue Register yang butuh keputusan Anda:
- **Konsisten** — tidak menciptakan proses governance baru, tim/AI Coding Assistant sudah familiar dengan format ini.
- **Traceable** — begitu dijawab, keputusan otomatis terhubung ke ADR/dokumen sumber lewat konvensi penomoran yang sudah ada.
- **Terpisah dari yang teknis** — 5 isu Tier 1/T3-06 **tidak** perlu jadi OD karena bukan keputusan bisnis, hanya bug yang jawabannya sudah jelas dari dokumen yang ada (kalau dipaksa jadi OD, itu over-process).

**Rekomendasi konkret:** Beri nomor **OD-12 sampai OD-18** untuk 7 isu ini (melanjutkan urutan OD-02/06/07/11 yang sudah ada), format identik dengan OD yang sudah ada di `document-governance-baseline-register.md`.

## A.4 Kenapa Tier 4 Dipisah Sendiri

17 isu editorial **hampir semua** (12 dari 17) berasal dari satu akar: pola generalisasi di `Authorization-Access-Control-Specification-v1.0.md`. Menyelesaikannya satu-per-satu di tengah Batch 1/2 hanya menambah noise. Lebih efisien: **satu audit menyeluruh** terhadap seluruh Authorization Spec §2 di satu sesi terpisah, dibandingkan Bagian tersebut baris demi baris terhadap RLS aktual + PRD Business Rule, lalu naikkan Authorization Spec ke v1.1 sekali jalan.

---

# BAGIAN B — PEMETAAN SINKRONISASI PER ISU

> Kolom **"Dokumen Input"** = wajib dibaca AI sebelum eksekusi. Kolom **"Dokumen Output"** = wajib diperbarui setelah isu resolved — **kegagalan update salah satu dari daftar ini berarti isu belum benar-benar closed**, meski file migration sudah diperbaiki.

## B.1 Tier 1 — Batch 1 (Teknis, tanpa keputusan Owner)

| Isu | Dokumen Input | Dokumen Output (wajib disinkronkan) |
|---|---|---|
| **T1-01** | `0009_m04_learning_center.sql`, `MP-04-LearningCenter...md` Bagian 25/51 | `0009_m04_learning_center.sql` (edit RLS), `MP-04-LearningCenter...md` (Bagian 25 status→"Diperbaiki", Bagian 45/46/48/49 update checklist), `ISSUE-REGISTER` (status T1-01→Closed) |
| **T1-02** | `0008_m03_listing.sql`, `SEO-Analytics-Specification-v1.1.md` §1.4/§3, `MP-03-Listing...md`, `MP-11-SEOAnalytics...md` | `0008_m03_listing.sql` (edit RLS), `MP-03-Listing...md` (Bagian 23/51), `MP-11-SEOAnalytics...md` (Bagian 45 — hapus dependency blocker), `ISSUE-REGISTER` |
| **T1-03** | `0010_m05_events.sql`, `MP-05-KalenderEvent...md`, `API-Specification-...v1.2.md` §11.2 | `0010_m05_events.sql` (edit RLS), **`API-Specification-...md`** (tambah endpoint `PUT /admin/events/{id}/approve`+`/reject` — **perubahan API Spec, naik versi**), `MP-05-KalenderEvent...md` (Bagian 19/20/51), `ISSUE-REGISTER` |
| **T1-04** | `0007_m12_organization.sql`, `MP-12-Organization...md` | `0007_m12_organization.sql` (edit RLS), `MP-12-Organization...md` (Bagian 25/51), `ISSUE-REGISTER` |
| **T3-06** *(technical, digabung Batch 1)* | `0008_m03_listing.sql`, `MP-03-Listing...md` Konflik #2, `MP-12-Organization...md` | `0008_m03_listing.sql` (edit RLS child table — **file sama dengan T1-02**, satu pass), `MP-03-Listing...md`, `MP-12-Organization...md` (Bagian 45), `ISSUE-REGISTER` |

> **Catatan penting:** T1-02 dan T3-06 **sama-sama menyentuh `0008_m03_listing.sql`** — wajib dikerjakan **dalam satu prompt/sesi yang sama** agar tidak ada edit yang saling menimpa. Prompt Batch 1 di Bagian C sudah menggabungkan keduanya.

## B.2 Tier 2 + Sebagian Tier 3 — Batch 2 (Butuh Keputusan Owner, format OD)

| Isu → OD Baru | Pertanyaan yang Perlu Dijawab | Dokumen Input | Dokumen Output setelah dijawab |
|---|---|---|---|
| **OD-12** (T2-01) | Apakah Manager bisa akses menu "Kelola Kursus" (M04) langsung, atau perlu approval? | `PRD-...v1.2.md` Modul 4 (Business Rule vs Acceptance Criteria) | `PRD-...md` (revisi salah satu bagian, naik versi), `Authorization-Access-Control-Spec...md` §2.5 (jika berubah), `MP-04-LearningCenter...md` Bagian 26/42 |
| **OD-13** (T2-02) | Sama untuk M05 — apakah Manager publish event langsung atau perlu approval? | `PRD-...v1.2.md` Modul 5 | `PRD-...md` (revisi), `MP-05-KalenderEvent...md` Bagian 26/42 |
| **OD-14** (T3-01) | Bagaimana mekanisme bootstrap akun Superadmin pertama? (seed manual? script terpisah?) | `0003_m01_auth.sql`, `MP-01-Authentication...md` Bagian 44/46 | Kemungkinan **file baru** (`seed-superadmin.sql` atau dokumentasi prosedur), `MP-01-Authentication...md` Bagian 48, `development-playbook.md` (tambah langkah Sprint S0 jika perlu) |
| **OD-15** (T3-03) | Definisi cakupan "wilayah eksklusif" proyek developer — per kota? radius? | `PRD-...v1.2.md` Modul 6, `ERD-...v1.3.md` §2.12 (`is_exclusive_by_region`) | `PRD-...md` (klarifikasi Modul 6), kemungkinan **`ERD-...md`** (field tambahan jika perlu, naik versi ke v1.4), `0006_m06_developer.sql` (jika field baru), `MP-06-DirektoriDeveloper...md` |
| **OD-16** (T3-04) | Apakah perlu endpoint CRUD akun internal generik (Admin/Manager/Instructor baru), atau cukup yang sudah ada? | `PRD-...v1.2.md` Modul 9, `API-Specification-...v1.2.md` | Jika ya: **`API-Specification-...md`** (tambah endpoint, naik versi), `MP-09-AdminPanel...md` Bagian 19/46 |
| **OD-17** (T3-05) | Apakah Developer Partner memang sengaja dapat akses AI Assistant (M13)? | `PRD-...v1.2.md` Modul 13 vs `Authorization-Access-Control-Spec...md` §2.14 | `Authorization-Access-Control-Spec...md` §2.14 (koreksi) **atau** `0015_m13_ai_assistant.sql` (tambah exclusion RLS jika jawabannya "tidak"), `MP-13-AIAssistant...md` |
| **OD-18** (T3-07) | Amenity management dipertahankan Superadmin-only, atau dilonggarkan ke Manager/Admin? | `0008_m03_listing.sql`, `Authorization-Access-Control-Spec...md` §2.4 | Salah satu dari keduanya (mengikuti jawaban), `MP-03-Listing...md` Bagian 26/51 |

## B.3 Tier 4 — Batch 3 (Editorial, satu audit menyeluruh)

| Cakupan | Dokumen Input | Dokumen Output |
|---|---|---|
| 12 isu pola generalisasi Authorization Spec (T4-01 s.d. T4-16 relevan) | `Authorization-Access-Control-Specification-v1.0.md` **seluruh §2**, RLS **seluruh 15 file migration**, PRD Business Rule tiap modul | `Authorization-Access-Control-Specification-v1.1.md` (dokumen baru, naik versi, revisi menyeluruh — **bukan** tambal 12 baris terpisah) |
| Sisa isu editorial (kutipan section salah nomor, SSO Apple, istilah "Verified", dll.) | Dokumen sumber masing-masing (lihat detail di `ISSUE-REGISTER` Tier 4) | `PRD-...md`, `Functional-Specification-...md`, `User-Flow-...md`, komentar migration `0005`/`0011` (masing-masing sesuai isu) |
| Seluruh 13 MP yang mereferensikan Authorization Spec | Seluruh `MP-*.md` | Update sitasi versi Authorization Spec dari v1.0 → v1.1 di header "Dokumen Acuan" |

## B.4 Dokumen yang SELALU Terdampak (Lintas Seluruh Batch)

| Dokumen | Kapan Diupdate |
|---|---|
| `ISSUE-REGISTER-Konsolidasi-FINAL.md` | Setelah **setiap** isu selesai — pindahkan ke status "Closed", catat tanggal & referensi commit/versi dokumen baru |
| `CURRENT-PROJECT-STATE.md` | Setelah **setiap Batch** selesai (bukan per-isu) — ringkas apa yang berubah |
| `CHANGELOG.md` / `decision-log.md` | Setiap dokumen sumber naik versi (PRD, ERD, Authorization Spec, API Spec) |
| `document-governance-baseline-register.md` | Jika ada dokumen yang naik versi Baseline baru |

---

# BAGIAN C — PROMPT SIAP PAKAI

> Format mengikuti konvensi proyek (`development-playbook.md` §21 — 6 elemen wajib: Module, Scope, Acceptance Criteria, Reference Documents, Out of Scope, ADR Status Check) dan `TASK-TEMPLATE-v1.1.md`.

## C.1 PROMPT BATCH 1 — Perbaikan Teknis (Tier 1 + T3-06)

```
TASK: Perbaikan RLS — Issue Register Batch 1 (Tier 1 + T3-06)

Module: Lintas M03, M04, M05, M12 (perbaikan migration, bukan modul baru)

Scope:
Perbaiki 5 isu RLS berikut, PERSIS sesuai "Aksi" yang sudah ditentukan di
ISSUE-REGISTER-Konsolidasi-FINAL.md (Bagian Tier 1 + T3-06). Jangan mengubah
keputusan/logic bisnis apa pun di luar yang eksplisit tercantum:

1. T1-01 — 0009_m04_learning_center.sql: tambah ownership check ke
   quiz_questions_manage, quiz_options_manage, enrollments_own, quiz_attempts_own
2. T1-02 — 0008_m03_listing.sql: ubah listings_select_public agar mengizinkan
   status IN ('published','sold','rented'), bukan hanya 'published'
3. T1-03 — 0010_m05_events.sql: pisahkan events_manage — submitter tidak boleh
   ubah kolom status ke 'published'/'rejected', hanya all-scope yang boleh
4. T1-04 — 0007_m12_organization.sql: tambah verifikasi Leader aktif ke
   org_invitations_insert untuk initiated_by_type='leader_invite'
5. T3-06 — 0008_m03_listing.sql (SATU PASS dengan T1-02): tambah klausa
   Organization Leader ke listing_photos_manage, listing_videos_manage,
   listing_amenities_manage (pola sama listings_update_own_or_org_leader)

Acceptance Criteria:
- [ ] Kelima RLS policy diperbaiki persis sesuai kolom "Aksi" di Issue Register
- [ ] T1-03 memerlukan endpoint baru — laporkan sebagai temuan terpisah, JANGAN
      menambahkannya sendiri ke API Specification (itu perubahan dokumen sumber,
      di luar scope task teknis ini — lihat Out of Scope)
- [ ] Setiap MP terkait (MP-03, MP-04, MP-05, MP-12, MP-11) diupdate: status isu
      di Bagian 51/45/46 berubah dari "ditemukan" menjadi "Diperbaiki [tanggal],
      lihat migration [file] versi terbaru"
- [ ] ISSUE-REGISTER-Konsolidasi-FINAL.md diupdate: T1-01, T1-02, T1-03, T1-04,
      T3-06 berstatus Closed dengan tanggal
- [ ] Tidak ada perubahan pada tabel/kolom/data selain yang eksplisit disebutkan

Reference Documents:
- ISSUE-REGISTER-Konsolidasi-FINAL.md (Tier 1 detail table, wajib dibaca utuh)
- 0007_m12_organization.sql, 0008_m03_listing.sql, 0009_m04_learning_center.sql,
  0010_m05_events.sql (isi lengkap, bukan hanya potongan)
- MP-03-Listing-Module-Planning-v1_0.md, MP-04-LearningCenter-...md,
  MP-05-KalenderEvent-...md, MP-12-Organization-...md, MP-11-SEOAnalytics-...md

Out of Scope:
- JANGAN menambah endpoint API baru (T1-03 butuh ini, tapi itu perubahan
  dokumen sumber API Specification — laporkan sebagai rekomendasi, bukan
  dieksekusi di task ini)
- JANGAN menyentuh 7 isu Batch 2 (OD-12 s.d. OD-18) — itu butuh keputusan Owner
- JANGAN menyentuh isu Tier 4 (editorial)
- JANGAN mengeksekusi migration ke database live — ini hanya edit file .sql

ADR Status Check:
Tidak ada ADR yang perlu direvisi — kelima perbaikan ini adalah koreksi
implementasi RLS agar sesuai keputusan yang SUDAH Approved di ADR-005/024/026/027,
bukan keputusan arsitektur baru.
```

## C.2 PROMPT BATCH 2 — Formalisasi Open Decision (Tier 2 + Sebagian Tier 3)

```
TASK: Formalisasi OD-12 s.d. OD-18 — Issue Register Batch 2

Module: Governance (bukan modul kode)

Scope:
Buat 7 entri Open Decision baru (OD-12 s.d. OD-18) mengikuti format PERSIS
sama dengan OD-02/OD-06/OD-07/OD-11 yang sudah ada di
document-governance-baseline-register.md. Setiap entri wajib berisi:
- Pertanyaan spesifik yang perlu dijawab Owner (lihat Bagian B.2 dokumen
  "PAKET PENYELESAIAN ISSUE REGISTER" untuk daftar pertanyaan per OD)
- Konteks singkat (2-3 kalimat) kenapa ini jadi Open Decision
- Opsi yang tersedia (jika applicable, mis. OD-18 punya 2 opsi jelas)
- Dampak ke dokumen apa saja jika masing-masing opsi dipilih

JANGAN menjawab pertanyaan-pertanyaan ini sendiri. Task ini HANYA menyusun
pertanyaannya dengan rapi untuk direview Owner — bukan menyelesaikan isunya.

Setelah OD-12 s.d. OD-18 dijawab Owner (di sesi terpisah, terpisah dari task
ini), BARU jalankan cascading update berikut per OD (lihat Bagian B.2 kolom
"Dokumen Output" untuk detail lengkap per OD):
- OD-12/13: revisi PRD Modul 4/5 (pilih salah satu dari Business Rule vs
  Acceptance Criteria sebagai yang berlaku, hapus/perbaiki yang lain)
- OD-14: dokumentasikan mekanisme bootstrap Superadmin yang dipilih
- OD-15: klarifikasi PRD Modul 6 + kemungkinan field baru ERD
- OD-16: keputusan tambah/tidak tambah endpoint CRUD akun internal
- OD-17: koreksi Authorization Spec §2.14 ATAU tambah RLS exclusion
- OD-18: pertahankan/longgarkan RLS amenities_manage

Acceptance Criteria:
- [ ] 7 entri OD baru tersusun rapi, siap direview Owner dalam satu sesi
- [ ] Setelah dijawab: setiap dokumen di kolom "Dokumen Output" Bagian B.2
      diupdate SESUAI jawaban Owner, tidak diasumsikan sendiri
- [ ] Setiap MP terkait (MP-04, MP-05, MP-01, MP-06, MP-09, MP-13, MP-03)
      diupdate mencerminkan keputusan final
- [ ] Dokumen yang naik versi (PRD, ERD, API Spec, Authorization Spec)
      dicatat di CHANGELOG.md dan document-governance-baseline-register.md
- [ ] ISSUE-REGISTER-Konsolidasi-FINAL.md: T2-01, T2-02, T3-01, T3-03, T3-04,
      T3-05, T3-07 berstatus Closed dengan referensi OD-12 s.d. OD-18

Reference Documents:
- ISSUE-REGISTER-Konsolidasi-FINAL.md (Tier 2 + T3-01/03/04/05/07)
- document-governance-baseline-register.md (format OD-02/06/07/11 sebagai
  template struktur)
- PRD-RUMAHAGEN-v1.2.md (Modul 4, 5, 6, 9, 13)
- MP-01, MP-03, MP-04, MP-05, MP-06, MP-09, MP-13 (Module Planning terkait)

Out of Scope:
- JANGAN menjawab pertanyaan OD sendiri
- JANGAN eksekusi cascading update SEBELUM Owner menjawab
- JANGAN menyentuh Batch 1 (sudah selesai terpisah) atau Batch 3 (editorial)

ADR Status Check:
OD-15 berpotensi memerlukan ADR baru jika jawabannya menambah field/logic baru
ke skema (bukan sekadar klarifikasi) — tandai eksplisit jika ini terjadi,
jangan buat ADR sendiri tanpa persetujuan Owner.
```

## C.3 PROMPT BATCH 3 — Audit Menyeluruh Authorization Spec (Tier 4)

```
TASK: Audit Menyeluruh Authorization Spec — Issue Register Batch 3 (Tier 4)

Module: Governance/Dokumentasi (bukan modul kode)

Scope:
Authorization-Access-Control-Specification-v1.0.md §2 (seluruh 13 sub-bagian
modul) menunjukkan pola berulang: nilai own/all/none tidak selalu konsisten
dengan RLS aktual di migration ATAU Business Rule PRD. 12 dari 17 isu Tier 4
Issue Register berasal dari pola ini.

Lakukan audit baris-per-baris SELURUH §2 (bukan hanya 12 baris yang sudah
teridentifikasi) terhadap DUA sumber kebenaran:
1. RLS aktual di 15 file migration (0001-0015)
2. Business Rule eksplisit di PRD masing-masing modul

Untuk SETIAP baris PERM-XXX yang tidak konsisten dengan salah satu/kedua
sumber di atas, catat sebagai temuan baru (kemungkinan ada isu tambahan di
luar 12 yang sudah tercatat, terutama untuk M03/M05/M07/M08 yang belum
diaudit menyeluruh — hanya baris spesifik yang sudah ditemukan MP yang
tercatat di Issue Register).

Hasilkan Authorization-Access-Control-Specification-v1.1.md sebagai revisi
PENUH (bukan tambal 12 baris) — dokumen baru, bukan overwrite v1.0.

Sekaligus perbaiki isu editorial non-Authorization-Spec berikut (daftar
lengkap di ISSUE-REGISTER Tier 4):
- Migration 0005: perbaiki komentar "migration 0007"→"0008"
- Migration 0011: perbaiki komentar "§2.7"→"§2.8"
- PRD/Functional Spec/User Flow Modul 1: tandai SSO Apple sebagai belum
  diimplementasikan ATAU hapus referensinya (opsi mana yang dipilih perlu
  konfirmasi singkat ke Owner sebelum eksekusi — ini SATU-satunya bagian
  Batch 3 yang perlu izin satu kalimat, bukan full OD)
- PRD/Functional Spec/User Flow Modul 1: sinkronkan istilah "Verified" agar
  konsisten dengan 4 status database aktual

Acceptance Criteria:
- [ ] Authorization-Access-Control-Specification-v1.1.md diterbitkan,
      seluruh §2 sudah diverifikasi terhadap RLS + PRD
- [ ] Setiap isu editorial di atas diperbaiki di dokumen sumber masing-masing
- [ ] Seluruh 13 MP-*.md diupdate: sitasi "Authorization Spec v1.0" di header
      "Dokumen Acuan" naik menjadi "v1.1"
- [ ] ISSUE-REGISTER-Konsolidasi-FINAL.md: seluruh 17 isu Tier 4 berstatus
      Closed
- [ ] document-governance-baseline-register.md dicatat: Authorization Spec
      naik ke v1.1, status Baseline

Reference Documents:
- ISSUE-REGISTER-Konsolidasi-FINAL.md (Tier 4, daftar lengkap)
- Authorization-Access-Control-Specification-v1.0.md (seluruh isi)
- Seluruh 15 file migration 0001-0015
- PRD-RUMAHAGEN-v1.2.md (seluruh 13 modul, untuk cross-check
  Business Rule)

Out of Scope:
- JANGAN mengubah RLS migration apa pun di task ini (task ini murni
  dokumentasi — jika audit menemukan RLS yang perlu diubah, catat sebagai
  temuan baru untuk task teknis terpisah, jangan dieksekusi di sini)
- JANGAN menyentuh Batch 1/2

ADR Status Check:
Tidak ada ADR yang perlu direvisi — task ini murni menyelaraskan dokumentasi
permission dengan implementasi/keputusan yang sudah ada.
```

## C.4 PROMPT BATCH 4 — Sinkronisasi Final

```
TASK: Sinkronisasi Final — Issue Register Closed

Module: Governance (bukan modul kode)

Scope:
Setelah Batch 1, 2, dan 3 selesai dan seluruh 32 isu berstatus Closed di
ISSUE-REGISTER-Konsolidasi-FINAL.md:

1. Update CURRENT-PROJECT-STATE.md — ringkas seluruh perubahan dari 3 batch
   (dokumen apa saja yang naik versi, migration apa saja yang diperbaiki)
2. Verifikasi SELURUH 13 MP-*.md konsisten satu sama lain — tidak ada MP yang
   masih mereferensikan versi dokumen lama (PRD v1.2 lama, Authorization Spec
   v1.0, dst.) setelah dokumen sumber naik versi
3. Terbitkan ISSUE-REGISTER-Konsolidasi-FINAL.md versi penutup — tandai
   seluruh 32 isu Closed dengan tanggal & referensi, ubah status dokumen dari
   "FINAL" menjadi "RESOLVED — siap Sprint S0"
4. Rekomendasikan ke Owner: titik ini adalah saat aman memulai eksekusi
   migration Sprint S0 (sesuai kesepakatan alur di awal proses)

Acceptance Criteria:
- [ ] CURRENT-PROJECT-STATE.md mencerminkan status akhir seluruh perbaikan
- [ ] Tidak ada MP yang mensitasi versi dokumen sumber yang sudah deprecated
- [ ] ISSUE-REGISTER berstatus RESOLVED, 32/32 isu Closed
- [ ] Rekomendasi eksplisit: GO untuk Sprint S0

Reference Documents:
- Seluruh dokumen yang diubah di Batch 1-3
- ISSUE-REGISTER-Konsolidasi-FINAL.md

Out of Scope:
- JANGAN mengeksekusi migration ke database live — itu Sprint S0, task
  terpisah di luar cakupan Issue Register

ADR Status Check:
Tidak relevan — task administratif penutup.
```

---

# BAGIAN D — RINGKASAN URUTAN EKSEKUSI

| Urutan | Batch | Butuh Owner? | Estimasi Kompleksitas |
|---|---|---|---|
| 1 | Batch 1 — Perbaikan Teknis (5 isu) | Tidak | Sedang — 4 file migration, cross-check 5 MP |
| 2a | Batch 2a — Formalisasi 7 OD | Tidak (hanya menyusun pertanyaan) | Rendah |
| 2b | **⏸ STOP — Owner jawab OD-12 s.d. OD-18** | **Ya, wajib** | — |
| 2c | Batch 2c — Cascading update pasca-jawaban | Tidak (mengeksekusi jawaban) | Tinggi — berpotensi 4 dokumen sumber naik versi |
| 3 | Batch 3 — Audit Authorization Spec (+ 1 konfirmasi kecil soal SSO Apple) | Sedikit (1 kalimat) | Sedang-Tinggi — audit menyeluruh 13 sub-bagian |
| 4 | Batch 4 — Sinkronisasi Final | Tidak | Rendah |

**Titik aman memulai Sprint S0:** setelah Batch 1 + Batch 2 selesai (Batch 3 editorial **tidak** blocking, bisa berjalan paralel dengan awal development jika perlu dipercepat — konsisten prinsip Tier 4 "tidak mendesak" di Issue Register).

---

*Paket ini disusun agar setiap batch punya cakupan jelas, dokumen sumber & turunan yang wajib disinkronkan eksplisit tercatat, dan tidak ada isu yang membutuhkan keputusan Owner diselesaikan sepihak oleh AI Coding Assistant.*
