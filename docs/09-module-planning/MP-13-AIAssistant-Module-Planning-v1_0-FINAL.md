# MODULE PLANNING
## MP-13 — AI Assistant Integration (BYOK)
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 13 (AI Assistant Integration, BYOK) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.
**Status Gate:** ✅ **TERBUKA** — dikonfirmasi eksplisit oleh Owner pada 6 Agustus 2026, menggantikan status Hold yang tercatat sebelumnya di `PROJECT-CONSTITUTION.md` §24 poin 10 dan `development-playbook.md` Golden Rule 40 (kedua dokumen mensyaratkan "paket sinkronisasi PRD/ERD/API Spec dieksekusi **dan** disahkan" — syarat dokumen terpenuhi 5 Agustus, dan gate kode dinyatakan terbuka eksplisit oleh Owner 6 Agustus). **`CURRENT-PROJECT-STATE.md` wajib diperbarui mencerminkan keputusan ini** (lihat Bagian 52).

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.41-2.42 + migration `0015`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (10 Agustus 2026) berdasarkan 3 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit. **Ini adalah Module Planning terakhir dari 13 modul yang dikonsolidasi.**
>
> **⚠️ Konflik penomoran** (pola konsisten di seluruh 13 modul): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 1 ambiguitas minor: cakupan role Developer Partner untuk AI Assistant ambigu antara REQ-M13-005/User Flow (5 role, tidak termasuk DevPartner) vs Authorization Spec §2.14 (DevPartner=`own`). Modul dinilai "paling sedikit konfliknya" dari 5 MP yang sudah disusun saat itu. |
| 1.0b | 6 Agu 2026 | Ambiguitas **Resolved** (**OD-21 Opsi A**) — Owner memutuskan Developer Partner disertakan (mengikuti Authorization Spec §2.14 yang sudah benar sejak awal). PRD REQ-M13-005 & User Flow direvisi menambahkan Developer Partner sebagai role ke-6. Tidak ada perubahan RLS. |
| 1.0c | 6 Agu 2026 | Referensi Authorization Spec naik ke v1.1 (audit Issue Register Batch 3). **Versi terkini** — basis dokumen final di bawah. |

---

## ✅ Catatan Verifikasi Silang (10 Agustus 2026, siklus konsolidasi ini)

> Klaim OD-21 diverifikasi terhadap `PRD-RUMAHAGEN-v1.3-FINAL.md` REQ-M13-005 — **TERBUKTI BENAR**: *"Terbuka untuk seluruh role internal berakun (Superadmin, Manager, Admin, Instructor, Agen) dan Developer Partner (resolusi OD-21, 6 Agustus 2026...)"*.
>
> **Catatan penting soal pola sistemik proyek:** OD-21 berasal dari sesi kerja **Batch 2** (keputusan Owner OD-16 s.d. OD-22), **bukan** dari `TASK-HOTFIX-20260806-001` (Tier 1, T1-01 s.d. T1-04) yang terbukti gagal 100% di seluruh 4 itemnya (lihat audit MP-03/04/05/12 sebelumnya). Pola yang muncul: **regresi yang ditemukan sejauh ini seluruhnya berasal dari hotfix Tier 1**, sementara keputusan Batch 2 yang sudah diverifikasi (OD-19/MP-06, OD-21/MP-13 di sini) **konsisten bersih**.
>
> **MP-13 adalah modul terakhir dari 13 Module Planning — konsolidasi seluruh modul planning proyek ini selesai.**

---

# 1. Executive Summary

Modul 13 adalah integrasi AI Assistant model **BYOK** (Bring Your Own Key) — agen/staf internal menghubungkan API key pribadi ke 4 provider terkurasi (Gemini, Groq, Mistral, GitHub Models), chat lewat UI custom tanpa redirect keluar aplikasi, **tanpa satu pun baris riwayat percakapan tersimpan di server** (REQ-M13-003, dikonfirmasi tegas di ERD, migration, dan Technical Spec). Hanya 2 entity: `ai_providers` (referensi), `agent_ai_connections` (koneksi terenkripsi). Bergantung **M01 dan M10 saja** — **tidak bergantung M12**, dua inisiatif independen (Technical Spec §M13, eksplisit). Migration `0015` **sudah ditulis lengkap**, termasuk pengecualian keamanan yang disengaja: **tidak ada bypass Superadmin** untuk `agent_ai_connections` (satu-satunya modul dengan pola ini di seluruh proyek). Modul ini **paling bersih** dari konflik dokumentasi dibanding 4 modul sebelumnya — hanya 1 ambiguitas minor ditemukan (cakupan role Developer Partner, Bagian 51). Go/No-Go: ✅ **GO** (gate dikonfirmasi terbuka 6 Agustus 2026).

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 13 sebagai rujukan tunggal — scope fungsional, kontrak API, aturan bisnis (khususnya batasan privasi PII yang sangat ketat), matriks permission, dan kriteria selesai.

---

# 3. Scope

- Tabel `ai_providers`, `agent_ai_connections` (ERD v1.3 §2.41-2.42) beserta RLS ketat tanpa bypass.
- Endpoint `GET /ai-providers`, `POST /ai-connections`, `POST /ai-connections/{id}/test`, `DELETE /ai-connections/{id}`, `GET /agents/me/ai-connections`, `POST /ai-assistant/chat` (API Spec §5B).
- Layar: Kelola Koneksi AI Provider, Chat AI Assistant (UI Spec §6).
- Wizard koneksi API key (test call sebelum simpan).
- Proksi chat server-side (API key tidak pernah ke client).
- Enkripsi `encrypted_api_key` at-rest.

---

# 4. Out of Scope

- **Riwayat/penyimpanan percakapan dalam bentuk apa pun** — secara eksplisit **dilarang** (REQ-M13-003, Golden Rule 40: "dilarang menambahkan tabel/kolom penyimpanan riwayat chat tanpa ADR baru yang men-supersede ADR-028").
- **Provider AI di luar 4 yang dikurasi** (Gemini, Groq, Mistral, GitHub Models) — penambahan provider baru (termasuk OpenAI/Anthropic API langsung) memerlukan ADR baru (Golden Rule 40).
- **Organization-scoped AI** — modul ini **berdiri independen dari M12**, tidak menyentuh entitas `organizations` (PRD Modul 13, catatan dasar ADR).
- **Infrastruktur cache/Redis baru** — rate limiting wajib reuse `rate_limit_log` (ADR-018, Golden Rule 40), bukan infrastruktur baru.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Memberi agen/staf internal akses ke AI assistant pilihan sendiri langsung di dalam platform tanpa perlu berbagi API key ke pihak platform atau keluar aplikasi ke web chat vendor (yang secara teknis tidak mengizinkan di-iframe karena `X-Frame-Options`/CSP).

---

# 6. Business Value

- Meningkatkan produktivitas kerja agen (draft deskripsi listing, dsb.) tanpa context-switching keluar aplikasi.
- Model BYOK menghilangkan beban biaya API AI dari platform ke user — platform tidak menanggung biaya pemakaian (REQ-M13-009).
- Privasi maksimal — tidak ada risiko kebocoran data percakapan karena memang tidak pernah disimpan.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01, M10** — MDM Bagian 3: baris M13 bertanda ● hanya di kolom M01 dan M10. |
| **Dibutuhkan Oleh** | **Tidak ada** — MDM Bagian 4 (Dependency Graph): "M13 (AI Assistant) adalah modul paling terisolasi — hanya bergantung M01/M10, tidak dibutuhkan modul mana pun." Sink node murni. |
| **Circular Dependency** | Tidak ditemukan — tidak relevan karena tidak ada modul hilir. |
| **Independensi dari M12** | Ditegaskan eksplisit di 3 dokumen (PRD, Technical Spec, MIS) — kedua modul "baru" (M12/M13) **tidak saling bergantung**, hanya kebetulan sama-sama baru ditambahkan di v1.2 dan sama-sama pernah berstatus gate Hold. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Integration** |
| Urutan Implementasi (MIS §3) | **#7 dari 13** (kondisional pada gate — **kini terpenuhi**) |
| Layer (MIS §13) | **Layer 2 — Core Domain (independen satu sama lain)** |
| Prioritas (MIS §14) | **P3 — sebelumnya "Implementation-Blocked"** |
| Batch Paralel (MIS §6) | **Batch 2** — bersama M02, M04, M06 |
| Alasan Posisi (MIS §4) | "Paling terisolasi di seluruh graph — hanya butuh M01+M10, tidak dibutuhkan modul manapun. Aman dibangun kapan saja setelah Foundation; ditempatkan di sini sebagai **early win** kompleksitas rendah sebelum masuk ke M03 yang berat." |
| Risiko (MIS §11.1, §11.3) | Tercatat **ganda** — "Menengah-Tinggi" (bergantung stabilitas provider eksternal di luar kendali; enkripsi API key harus benar sejak awal) **dan** "Low Risk... dari sisi arsitektur internal" (tidak ada tabel riwayat, tidak dibutuhkan modul lain — kegagalan di sini tidak menghentikan modul lain) |
| Go/No-Go (MIS §15, **direvisi**) | **Sebelumnya:** 🛑 NO-GO (Hold). **Kini:** ✅ **GO** — gate dikonfirmasi terbuka Owner 6 Agustus 2026. |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Seluruh role internal berakun (Superadmin s.d. Agen) | Pengguna langsung fitur |
| Superadmin | Kurasi daftar `ai_providers` |
| Provider AI eksternal (Gemini/Groq/Mistral/GitHub Models) | Pihak ketiga yang diintegrasikan, di luar kendali kontraktual platform |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin | Kurasi `ai_providers` (`Manage`), plus pengguna biasa untuk koneksi sendiri (`own`, **tanpa bypass**) |
| Manager, Admin, Instructor, Agen | Pengguna — hubungkan, chat, putuskan koneksi milik sendiri |
| Developer Partner | Disertakan (OD-21 Resolved, Opsi A) | Buyer | `none` (tidak berubah) |
| Sistem (backend proxy) | Meneruskan request chat ke provider eksternal tanpa expose API key |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M13-01 | Sebagai staf internal, saya ingin menghubungkan API key AI provider pribadi saya, agar saya bisa chat AI di dalam platform. | REQ-M13-001 |
| US-M13-02 | Sebagai staf internal, saya ingin memilih dari daftar provider terkurasi Admin, agar saya tahu opsi yang didukung resmi. | REQ-M13-002 |
| US-M13-03 | Sebagai staf internal, saya ingin yakin percakapan saya tidak pernah disimpan, agar privasi saya terjaga. | REQ-M13-003 |
| US-M13-04 | Sebagai staf internal, saya ingin yakin tidak ada satu pun pihak lain (termasuk Superadmin) yang bisa melihat percakapan/koneksi saya, agar saya percaya menggunakan fitur ini. | REQ-M13-004 |
| US-M13-05 | Sebagai staf internal, saya ingin koneksi tersimpan persisten, agar saya tidak perlu menghubungkan ulang tiap sesi. | REQ-M13-007 |
| US-M13-06 | Sebagai staf internal, saya ingin tahu syarat pemakaian (biaya, limit) sebelum connect, agar saya membuat keputusan sadar. | REQ-M13-008 |
| US-M13-07 | Sebagai staf internal, saya ingin chat baru dan thread paralel per-provider, agar saya fleksibel berpindah tanpa kehilangan konteks sesi aktif. | REQ-M13-011 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M13-001 | BYOK, diproksi backend | In Scope |
| REQ-M13-002 | Daftar provider dikurasi Admin | In Scope |
| REQ-M13-003 | Riwayat tidak disimpan | In Scope (justru sebagai **larangan** implementasi) |
| REQ-M13-004 | Tidak ada akses Admin ke isi percakapan | In Scope |
| REQ-M13-005 | Terbuka untuk role internal berakun | In Scope, **dengan catatan cakupan** (Bagian 51) |
| REQ-M13-006 | Rate limiting reuse `rate_limit_log` | In Scope |
| REQ-M13-007 | Koneksi persisten terenkripsi | In Scope |
| REQ-M13-008 | UI syarat pemakaian sebelum connect | In Scope |
| REQ-M13-009 | Biaya tanggung jawab agen | In Scope (kebijakan, bukan fitur teknis) |
| REQ-M13-010 | Tidak ada klaim afiliasi resmi | In Scope (kebijakan konten UI) |
| REQ-M13-011 | Chat Baru + thread paralel per-provider | In Scope |
| REQ-M13-012 | Label pengingat permanen | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Rate limiting | Reuse `rate_limit_log` (ADR-018) — **tidak** boleh infrastruktur cache/Redis baru | REQ-M13-006, Golden Rule 40 |
| Enkripsi | `encrypted_api_key` at-rest wajib, pola sama `agent_verification_documents.file_url` | ERD v1.3 §2.42 |
| Persistensi koneksi | Tidak perlu re-connect tiap sesi — `status` tetap `active` sampai eksplisit diputuskan/invalid | REQ-M13-007 |
| Response time chat proxy | **Not Defined** — tergantung latensi provider eksternal, tidak ada SLA/timeout eksplisit terdokumentasi (Open Issue) | — |

---

# 14. Business Rule

Dari PRD Modul 13:

1. **Bukan** pengulangan/konflik dengan "Modul Chat" yang ditolak di M12 — fitur berbeda total (chat AI pribadi, bukan chat antar-manusia Organization/Buyer).
2. `requires_expiry_warning` khusus bernilai `true` untuk `github_models` (PAT dapat punya masa berlaku).
3. **Satu user maksimal 1 koneksi aktif per provider** (boleh sambungkan multi-provider berbeda secara bersamaan) — ditegakkan `UNIQUE (user_id, provider_id) WHERE status='active'`.
4. **(ERD v1.3 §2.42, Authorization Spec §2.15 poin 5)** Tidak ada bypass Superadmin untuk `agent_ai_connections` — pengecualian sengaja dari pola bypass umum seluruh modul lain.
5. **(Technical Spec §M13)** API key **tidak pernah** dikirim ke response client setelah tersimpan — proxy chat sepenuhnya server-side.

---

# 15. Workflow Summary

**Alur 13.1 — Menghubungkan Provider (User Flow):** Buka "AI Assistant" → "Hubungkan Provider Baru" → pilih provider dari daftar aktif → sistem tampilkan syarat pemakaian (biaya, limit, link generate key) → user buka link resmi provider (di luar sistem) → generate API key sendiri → kembali, tempel API key → submit → sistem test call ringan → gagal → error, minta cek ulang; berhasil → API key tersimpan terenkripsi, koneksi `Active` → redirect Chat UI.

**Alur 13.2 — Chat (User Flow):** Buka "AI Assistant" → pilih provider terhubung → label permanen tampil ("Percakapan tidak disimpan...") → ketik & kirim → backend proxy ke provider (API key tidak pernah ke client) → tampilkan balasan di thread per-provider → ganti provider = klik tab lain (thread paralel, tidak reset); "Chat Baru" = reset thread aktif saja → tab ditutup/refresh → seluruh isi percakapan hilang permanen, tanpa recovery.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Aktor |
|---|---|---|---|
| SCR-M13-01 | Kelola Koneksi AI Provider | C (grid `AiConnectionCard`) | Seluruh role internal berakun |
| SCR-M13-02 | Chat AI Assistant | E (varian: kiri=daftar thread per-provider) | Seluruh role internal berakun |

---

# 17. Screen Detail

### SCR-M13-01 — Kelola Koneksi AI Provider (`/dashboard/ai-assistant/connections`)
- **Template:** C.
- **Komponen:** `AiConnectionCard` (UI Spec §4.2, Presentational) — kartu status koneksi + aksi.
- **Konten (Functional Spec §4.12):** daftar provider aktif dengan status koneksi.
- **Aksi:** "Hubungkan" (wizard: syarat pemakaian → tempel API key → test call → simpan terenkripsi), "Tes Ulang", "Putuskan Koneksi".

### SCR-M13-02 — Chat AI Assistant (`/dashboard/ai-assistant/chat`)
- **Template:** E.
- **Komponen:** `AiChatThread` (UI Spec §4.2, Smart) — panel percakapan + label pengingat permanen.
- **Input:** kotak pesan teks. Label permanen dekat input: *"Percakapan tidak disimpan — akan hilang saat ditutup/refresh"* (**tidak dapat disembunyikan**, REQ-M13-012).
- **Aksi:** "Kirim", "Chat Baru" (reset thread aktif), tab pindah provider (thread paralel, tidak reset — REQ-M13-011).
- **Output:** percakapan murni transient — tidak ada riwayat tersimpan di server (REQ-M13-003).

---

# 18. Navigation Flow

```
/dashboard/ai-assistant/connections ──► "Hubungkan" ──► Wizard (syarat → API key → test call)
     ├─ Test gagal ──► kembali ke form, tampilkan error
     └─ Test berhasil ──► koneksi Active ──► redirect /dashboard/ai-assistant/chat

/dashboard/ai-assistant/chat ──► pilih tab provider (thread paralel)
     ├─ "Chat Baru" ──► reset thread AKTIF saja (thread provider lain tetap)
     └─ tutup/refresh tab ──► seluruh isi percakapan hilang (tidak ada state persisten)
```
Sumber: User Flow Modul 13; Functional Spec §4.12.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /ai-providers` | Daftar provider aktif + syarat pemakaian |
| `POST /ai-connections` | Hubungkan API key (test call sebelum simpan) |
| `POST /ai-connections/{id}/test` | Tes ulang validitas |
| `DELETE /ai-connections/{id}` | Putuskan koneksi |
| `GET /agents/me/ai-connections` | Daftar koneksi milik user |
| `POST /ai-assistant/chat` | Proxy chat — API key tidak pernah ke client |

> **Tidak ada endpoint riwayat percakapan** — dinyatakan eksplisit di API Spec §5B sebagai **sengaja tidak ada**, bukan gap dokumentasi (berbeda dari beberapa gap yang ditemukan di modul lain sebelumnya).

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| GET | `/ai-providers` | Authenticated (seluruh role internal) | `M13_ai_assistant` / `view` (`PERM-M13-View-AiProvider`) | `all` (Superadmin: `Manage`; role lain: baca via label Auth generik, meski kolom Authorization Spec menyatakan `none` untuk non-Superadmin pada `PERM-M13-View-AiProvider` — lihat catatan) |
| POST | `/ai-connections` | Authenticated | `M13_ai_assistant` / `create` (`PERM-M13-Create-AgentAiConnection`) | `own`, **tanpa bypass siapa pun** |
| POST | `/ai-connections/{id}/test` | Authenticated (pemilik) | idem | `own` |
| DELETE | `/ai-connections/{id}` | Authenticated (pemilik) | `M13_ai_assistant` / `delete` (`PERM-M13-Delete-AgentAiConnection`) | `own` |
| GET | `/agents/me/ai-connections` | Authenticated | `M13_ai_assistant` / `view` (`PERM-M13-View-AgentAiConnection`) | `own` |
| POST | `/ai-assistant/chat` | Authenticated (pemilik koneksi) | — (tidak terdaftar PERM terpisah, memakai koneksi sebagai gerbang) | `own` |

> **Catatan ambiguitas kecil (bukan konflik signifikan):** Authorization Spec §2.14 menulis kolom Non-Superadmin `none` untuk `PERM-M13-View-AiProvider`/`Manage-AiProvider` (masuk akal — daftar provider dikelola Superadmin), namun `GET /ai-providers` di API Spec berlabel Auth **"Authenticated (seluruh role internal)"**, bukan Superadmin-only. Dibaca bersama: **View** (baca daftar untuk ditampilkan di wizard) terbuka untuk semua role internal via label Auth API Spec; **Manage** (tambah/ubah provider) tetap eksklusif Superadmin. Kolom `none` di Authorization Spec kemungkinan merujuk ke `Manage`, bukan `View` dasar — tidak cukup ambigu untuk dicatat sebagai Conflict formal di Bagian 51, hanya klarifikasi kecil di sini.

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /ai-connections` | `provider_id` | Wajib, FK valid `ai_providers`, `status='active'` |
| | `api_key` | Wajib, **wajib divalidasi via test call** sebelum simpan (bukan hanya format string) |
| `POST /ai-assistant/chat` | `connection_id` | Wajib, harus milik user yang request (`user_id=auth.uid()`, ditegakkan RLS `ai_connections_strict_own`) |
| | `message` | Wajib, teks — **tidak ada batas panjang eksplisit** di dokumen sumber (Open Issue) |
| Ownership | — | RLS `ai_connections_strict_own`: **hanya** `user_id = auth.uid()`, **sengaja tanpa** `auth_has_scope_all()`/`auth_is_superadmin()` (komentar eksplisit migration `0015`) |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Contoh spesifik (API Spec §5B):
```json
// POST /ai-assistant/chat — 200
{ "success": true, "data": { "reply": "...", "provider": "gemini" } }
// Tidak ada message_id/conversation_id persisten — murni request-response transient
```
Konsisten prinsip transient — response **tidak pernah** menyertakan identifier yang mengimplikasikan penyimpanan.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `ai_providers`, `agent_ai_connections` |
| Seed data | **4 baris `ai_providers`** di-seed langsung di migration: `gemini`, `groq`, `mistral`, `github_models` (dengan `setup_instructions_url` resmi masing-masing) |
| Index | `idx_ai_connections_one_active_per_provider` (UNIQUE partial, `WHERE status='active'`) |
| RLS | `ai_providers_select` (semua authenticated baca); `ai_providers_manage` (Superadmin only); **`ai_connections_strict_own`** (HANYA `user_id=auth.uid()`, **tanpa** klausa bypass apa pun — satu-satunya pola RLS "murni own" tanpa `OR auth_has_scope_all(...)` di seluruh migration yang diperiksa sejauh ini) |
| Trigger | `trg_agent_ai_connections_updated_at` |
| Soft-delete | **Tidak berlaku** — bukan bagian 8 tabel wajib soft-delete; disconnect memakai `status='disconnected'` (soft-state), bukan `deleted_at` |
| Riwayat percakapan | **Tidak ada tabel** — dikonfirmasi eksplisit di komentar migration `0015` baris pertama |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M13-AiProvider` | Root (reference) | `ai_providers` | REQ-M13-002, 008 |
| `ENT-M13-AgentAiConnection` | Root | `agent_ai_connections` | REQ-M13-001, 007 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0015_m13_ai_assistant.sql` | **Sudah ditulis** — 2 tabel + seed 4 provider + RLS ketat |
| Prasyarat | `0001` (helper), `0003` (`users`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| Kualitas RLS | **Tidak ditemukan gap** — konsisten penuh dengan REQ-M13-004 dan Authorization Spec §2.15 poin 5, bahkan disertai komentar eksplisit di source migration yang menjelaskan *mengapa* tidak memakai helper bypass standar (`auth_has_scope_all`/`auth_is_superadmin`) — kualitas dokumentasi kode **terbaik** dibanding migration modul lain yang diperiksa sejauh ini (MP-01 s.d. MP-04 menemukan berbagai gap/komentar salah rujuk). |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.14:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer |
|---|---|---|---|---|---|---|---|---|---|
| `PERM-M13-View-AiProvider` | `ENT-M13-AiProvider` | View | all | none | none | none | none | none | none |
| `PERM-M13-Manage-AiProvider` | `ENT-M13-AiProvider` | Manage | all | none | none | none | none | none | none |
| `PERM-M13-Create-AgentAiConnection` | `ENT-M13-AgentAiConnection` | Create | own | own | own | own | own | **own** | none |
| `PERM-M13-View-AgentAiConnection` | `ENT-M13-AgentAiConnection` | View | own | own | own | own | own | **own** | none |
| `PERM-M13-Delete-AgentAiConnection` | `ENT-M13-AgentAiConnection` | Delete | own | own | own | own | own | **own** | none |

> **Developer Partner mendapat `own` penuh** di tabel ini — sudah dikonfirmasi benar. **✅ Resolved [2026-08-06], OD-21 Opsi A** — Owner memilih Developer Partner disertakan, mengikuti Authorization Spec §2.14 (yang sudah benar sejak awal). `PRD-...v1.2.md` REQ-M13-005 dan `User-Flow-...v1.2.md` header Modul 13 direvisi menambahkan Developer Partner sebagai role ke-6. Tidak ada perubahan RLS (`ai_connections_strict_own` sudah role-agnostic sejak desain awal).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `ai_providers.code` | Ya | VARCHAR(50) | UNIQUE — 4 nilai seed: `gemini`,`groq`,`mistral`,`github_models` |
| `ai_providers.billing_type` | Ya (default) | Enum | `free_tier_ongoing`\|`paid_only`\|`trial_then_paid` — rilis awal seluruhnya `free_tier_ongoing` |
| `agent_ai_connections.encrypted_api_key` | Ya | VARCHAR(500) | Wajib terenkripsi at-rest |
| `agent_ai_connections.status` | Ya (default `active`) | Enum | `active`\|`disconnected`\|`invalid` |
| Constraint 1-aktif-per-provider | — | — | UNIQUE partial `(user_id, provider_id) WHERE status='active'` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Test call API key gagal (invalid/expired) | 400/422 (**kode pasti Not Defined**) | User Flow §13.1 ("Tampilkan error, minta cek ulang key") |
| Koneksi ke provider yang bukan milik user | 403/404 (ditegakkan RLS `ai_connections_strict_own`) | Migration `0015` |
| Chat dengan `connection_id` berstatus `disconnected`/`invalid` | **Not Defined** — apakah backend menolak proaktif sebelum proxy ke provider, atau membiarkan gagal di level provider | Open Issue |
| Rate limit terlampaui | 429 + `Retry-After` | REQ-M13-006, ADR-018 |
| Provider eksternal down/timeout saat chat | **Not Defined** — tidak ada kebijakan retry/fallback/pesan error spesifik terdokumentasi | Open Issue |

---

# 29. Notification

**Tidak ada notifikasi M13-spesifik eksplisit** di dokumen sumber untuk chat/koneksi normal. `AI-CONTEXT-PACK-v1.1.md` (dokumen turunan sebelumnya) mencatat "koneksi provider invalid/terputus" sebagai kandidat notifikasi M08 — namun ini **bukan** requirement eksplisit PRD/User Flow M13 sendiri, dicatat sebagai asumsi turunan, bukan dikonfirmasi.

---

# 30. Activity Log

**Secara sengaja minimal** — karena REQ-M13-003/004 melarang penyimpanan isi percakapan, audit log (jika ada) **hanya boleh mencatat metadata** (mis. "user X menghubungkan provider Y", "user X memutuskan koneksi Z") — **tidak pernah** isi pesan. Tidak ada requirement eksplisit yang mewajibkan audit log untuk aksi connect/disconnect di dokumen sumber manapun — Open Issue apakah ini perlu ditambahkan sebagai praktik keamanan baik meski tidak diwajibkan REQ tertentu.

---

# 31. Audit Trail

Sama seperti Bagian 30 — **jika** diimplementasikan, wajib metadata-only, tidak pernah menyentuh isi pesan chat (konsisten larangan absolut REQ-M13-003/004).

---

# 32. External Integration

| Provider | Fungsi | Catatan |
|---|---|---|
| Google Gemini | Chat AI | `billing_type: free_tier_ongoing` |
| Groq | Chat AI | idem |
| Mistral AI | Chat AI | idem |
| GitHub Models | Chat AI | `requires_expiry_warning: true` (PAT dapat expire) |

Seluruhnya **di luar kendali platform** — SLA, downtime, perubahan API pihak provider adalah risiko eksternal (MIS §11.1: "bergantung penuh pada ketersediaan/kestabilan provider eksternal di luar kendali tim").

---

# 33. AI Capability

**Modul ini ADALAH kapabilitas AI itu sendiri** — proksi chat server-side ke 4 LLM provider eksternal. Tidak ada AI capability internal (mis. tidak ada model in-house) — murni pass-through terenkripsi ke API resmi provider dengan API key milik user.

---

# 34. Performance Requirement

| Aspek | Target | Sumber |
|---|---|---|
| Rate limiting | Reuse `rate_limit_log` (ADR-018) — nilai spesifik untuk M13 (req/menit) **tidak dirinci** di luar kebijakan umum endpoint sensitif/authenticated | REQ-M13-006 |
| Response time chat | **Not Defined** — bergantung latensi provider eksternal | Open Issue |

---

# 35. Security Requirement

1. `encrypted_api_key` wajib enkripsi at-rest — pola sama dokumen legalitas (PROJECT-CONSTITUTION §10 poin 1).
2. API key **tidak pernah** dikirim ke client/response setelah tersimpan (Technical Spec §M13, "catatan implementasi krusial").
3. **Tidak ada bypass Superadmin** untuk `agent_ai_connections` — satu-satunya pengecualian sengaja dari pola bypass umum di seluruh proyek (REQ-M13-004).
4. Server-side environment variable untuk kredensial platform-level (jika ada) terpisah dari `encrypted_api_key` per-user yang tersimpan di database (bukan `.env`) — konsisten AI Context Pack §10 poin 5.
5. Riwayat percakapan **dilarang keras** disimpan dalam bentuk apa pun (termasuk log aplikasi/Sentry breadcrumb) — PII risk tertinggi jika dilanggar.

---

# 36. Accessibility Requirement

**Not Defined secara M13-spesifik.** Label pengingat permanen (REQ-M13-012) — perlu dipastikan terbaca oleh screen reader (tidak boleh hanya styling visual), namun tidak ada spesifikasi ARIA eksplisit di dokumen sumber.

---

# 37. Responsive Requirement

**Not Defined secara M13-spesifik.** SCR-M13-02 (Template E, varian "kiri=daftar thread per-provider") berpotensi kompleks di mobile (sidebar thread + chat area) — tidak ada breakdown responsif eksplisit.

---

# 38. SEO Impact (Jika relevan)

**Tidak relevan.** Seluruh layar M13 berada di `(dashboard)` — CSR, privat, tidak menjadi target SEO (konsisten pola dashboard modul lain, SYSTEM-ARCHITECTURE §6).

---

# 39. Configuration

**Tidak ada `system_configs` khusus M13** — daftar provider dikelola langsung via tabel `ai_providers` (CRUD Superadmin), bukan lewat `system_configs`.

---

# 40. Environment Variable

**Tidak ada environment variable server-level baru** untuk API key provider — model BYOK berarti API key **milik user**, disimpan terenkripsi di database (`encrypted_api_key`), **bukan** di `.env` server (berbeda fundamental dari `LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY` yang memang server-level). Kunci enkripsi untuk mengenkripsi `encrypted_api_key` itu sendiri kemungkinan perlu env var (mis. `ENCRYPTION_KEY`) — **tidak dirinci eksplisit namanya** di dokumen sumber manapun (Open Issue, konsisten pola sama untuk dokumen legalitas M01).

---

# 41. Feature Flag

**Tidak ada feature flag formal**, namun `ai_providers.status` (`active`/`inactive`) secara fungsional **adalah** mekanisme flag per-provider — Superadmin dapat menonaktifkan satu provider tanpa mengubah kode, mekanisme ini sudah built-in di skema.

---

# 42. Acceptance Criteria

Dari PRD Modul 13:

- [ ] User dapat memilih provider dari daftar aktif, mengikuti wizard onboarding, dan berhasil terhubung setelah test call sukses.
- [ ] Percakapan yang sudah berjalan hilang total begitu tab ditutup/direfresh — tidak ada baris riwayat tersimpan di database mana pun.
- [ ] User dapat memutus/menghubungkan ulang koneksi kapan saja tanpa mengulang seluruh wizard jika key masih valid.
- [ ] Percobaan akses isi percakapan lewat endpoint Admin manapun selalu gagal karena data tidak pernah eksis di server.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | User pilih Gemini, tempel API key valid, submit | Test call sukses, koneksi `Active`, redirect Chat UI |
| 2 | User tempel API key invalid | Test call gagal, error ditampilkan, tidak tersimpan |
| 3 | User kirim pesan chat, lalu refresh halaman | Pesan sebelumnya hilang total — tidak ada endpoint yang mengembalikan riwayat |
| 4 | **Superadmin mencoba mengakses `agent_ai_connections` milik user lain via endpoint apa pun** | **403/404** — tidak ada bypass, harus gagal total (test paling kritis modul ini) |
| 5 | User hubungkan 2 provider berbeda (Gemini + Groq) secara bersamaan | Berhasil, 2 baris `active` berbeda `provider_id` |
| 6 | User coba hubungkan provider yang sama 2x (koneksi pertama masih `active`) | Ditolak (UNIQUE partial constraint) — kemungkinan disarankan "Tes Ulang" alih-alih koneksi baru |
| 7 | User kirim pesan panjang tanpa batas jelas | **Perlu klarifikasi batas** — Open Issue Bagian 21 |

---

# 44. Edge Case

1. API key valid saat connect, tapi kadaluarsa/dicabut oleh user di provider setelahnya (terutama `github_models` dengan `requires_expiry_warning`) — chat berikutnya akan gagal di level provider; **Not Defined** bagaimana `status` berubah dari `active` ke `invalid` (apakah ada job pengecekan berkala, atau hanya reaktif saat chat gagal?).
2. User dengan `status='disconnected'` mencoba `POST /ai-assistant/chat` dengan `connection_id` lama — **Not Defined** apakah backend proaktif menolak sebelum request ke provider (Bagian 28).
3. Rate limit provider eksternal sendiri (bukan `rate_limit_log` platform) tercapai — respons error dari provider perlu diteruskan dengan jelas ke user, mekanismenya **tidak dirinci**.

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kesalahan implementasi RLS memberi bypass tidak sengaja (mis. developer menambahkan `OR auth_is_superadmin()` mengikuti pola modul lain tanpa sadar ini pengecualian) | **Pelanggaran privasi serius** — REQ-M13-004 secara eksplisit melarang ini | Test wajib #4 (Bagian 43) menjadi gate kualitas non-negotiable; review kode ekstra hati-hati pada baris RLS ini |
| Ketergantungan pada 4 provider eksternal di luar kendali platform | Downtime/perubahan API pihak ketiga memutus fitur tanpa platform bisa berbuat banyak | Test call sebelum simpan mengurangi risiko onboarding gagal; tidak ada mitigasi untuk downtime provider pasca-onboarding (diterima sebagai risiko inheren model BYOK) |
| Developer tergoda menambah logging/cache percakapan untuk debugging | Pelanggaran langsung ADR-028/REQ-M13-003 | Golden Rule 40 eksplisit melarang; tegaskan di code review checklist |

---

# 46. Known Limitation

1. ~~Cakupan role Developer Partner ambigu~~ **✅ Resolved [2026-08-06], OD-21 Opsi A** — Owner memilih Developer Partner disertakan, mengikuti Authorization Spec §2.14 (yang sudah benar sejak awal). `PRD-...v1.2.md` REQ-M13-005 dan `User-Flow-...v1.2.md` header Modul 13 direvisi menambahkan Developer Partner sebagai role ke-6. Tidak ada perubahan RLS (`ai_connections_strict_own` sudah role-agnostic sejak desain awal).
2. **Mekanisme deteksi API key expired/invalid pasca-onboarding** tidak dirinci (reaktif vs job berkala).
3. **Batas panjang pesan chat** tidak ditentukan.
4. **Nama environment variable untuk kunci enkripsi** `encrypted_api_key` tidak eksplisit.
5. **Kebijakan error provider eksternal down/timeout** tidak dirinci.

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M13 bergantung M01+M10 | ✅ Terpenuhi (MP-01, MP-10 sudah direncanakan) |
| MIS: M13 urutan #7, Batch 2 | ✅ Konsisten |
| **Gate governance (PROJECT-CONSTITUTION §24 poin 10, Golden Rule 40)** | ✅ **Terbuka — dikonfirmasi Owner 6 Agustus 2026** |
| Migration `0001`, `0003` (prasyarat `0015`) | ✅ Sudah ditulis |
| ERD v1.3 §2.41-2.42 Baseline | ✅ |
| Authorization Spec v1.1 §2.14/§2.15 Baseline | ✅ *(naik dari v1.0, audit Issue Register Batch 3)* |
| ADR-028 (Approved With Notes), ADR-017, ADR-018 | ✅ |

**Kesimpulan:** Seluruh dependency **dan** gate governance terpenuhi. Tidak ada blocker tersisa.

---

# 48. Definition of Ready

- [x] PRD Modul 13 Baseline (v1.2).
- [x] ERD §2.41-2.42 Baseline (v1.3).
- [x] Migration `0001`, `0003`, `0015` tertulis.
- [x] ADR-028 Approved With Notes.
- [x] **Gate governance terbuka** (dikonfirmasi Owner, 6 Agustus 2026).
- [ ] **Klarifikasi cakupan Developer Partner** (Bagian 51) — direkomendasikan diselesaikan sebelum layar diakses role tsb, non-blocking untuk role internal inti (Superadmin s.d. Agen).

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0015` dieksekusi sukses, 4 provider ter-seed, RLS terverifikasi **tanpa bypass** (test eksplisit Superadmin ditolak akses koneksi user lain).
- [ ] Unit test: enkripsi/dekripsi `encrypted_api_key`, constraint 1-aktif-per-provider.
- [ ] E2E test: alur connect → chat → refresh (verifikasi hilang) → disconnect (Playwright).
- [ ] **Code review khusus menegaskan tidak ada penyimpanan riwayat chat dalam bentuk apa pun** (termasuk log/cache/Sentry breadcrumb) — item wajib checklist, bukan asumsi.
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui — termasuk mencatat gate M13 kini terbuka.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | ADR |
|---|---|---|---|---|
| REQ-M13-001 | `ENT-M13-AgentAiConnection` | `POST /ai-connections` | `PERM-M13-Create-AgentAiConnection` | ADR-028 |
| REQ-M13-002 | `ENT-M13-AiProvider` | `GET /ai-providers` | `PERM-M13-View-AiProvider` | ADR-028 |
| REQ-M13-003 | — (larangan) | — | — | ADR-028 |
| REQ-M13-004 | `ENT-M13-AgentAiConnection` | Cross-cutting (RLS) | — | ADR-028 |
| REQ-M13-005 | `ENT-M13-AgentAiConnection` | Cross-cutting | 6 role (OD-21 Resolved) | — |
| REQ-M13-006 | — | Cross-cutting | — | ADR-018 |
| REQ-M13-007 | `ENT-M13-AgentAiConnection` | `POST/DELETE /ai-connections*` | `PERM-M13-*-AgentAiConnection` | — |
| REQ-M13-011, 012 | — | `POST /ai-assistant/chat` | — | — |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **REQ-M13-005** dan **header aktor User Flow Modul 13** sama-sama eksplisit membatasi cakupan modul ke **"seluruh role internal berakun (Superadmin, Manager, Admin, Instructor, Agen)"** — 5 role, **tidak menyebut** Developer Partner maupun Buyer. Namun **Authorization Spec §2.14** memberi `own` penuh (Create/View/Delete AgentAiConnection) kepada **Developer Partner** juga — hanya Buyer yang `none`. | PRD v1.2 REQ-M13-005, User Flow v1.2 (header Modul 13) vs Authorization Spec v1.0 §2.14 | **Tidak diresolusikan sepihak** — berbeda dari pola konflik "Authorization Spec keliru generalisasi" di modul-modul sebelumnya (di mana 3+ sumber lain kompak menolak), di sini **hanya 2 sumber** (PRD REQ + User Flow header) berhadapan dengan **1 sumber** (Authorization Spec), dan **tidak ada RLS/API Spec yang secara eksplisit mengecualikan Developer Partner** (RLS `ai_connections_strict_own` berlaku generik untuk `user_id` mana pun yang authenticated, tidak membedakan role; API Spec label "Authenticated" juga generik). Karena **RLS aktual tidak melarang** Developer Partner memakai fitur ini (tidak ada exclusion eksplisit), dan larangan di REQ-M13-005 bisa dibaca sebagai "role yang **dituju sebagai target utama**" bukan "role yang **dilarang eksplisit**", **tidak cukup bukti untuk mengklaim ini kontradiksi tegas**. Diformalkan sebagai **OD-21**. **Status: **✅ Resolved [2026-08-06], OD-21 Opsi A** — Owner memilih Developer Partner disertakan, mengikuti Authorization Spec §2.14 (yang sudah benar sejak awal). `PRD-...v1.2.md` REQ-M13-005 dan `User-Flow-...v1.2.md` header Modul 13 direvisi menambahkan Developer Partner sebagai role ke-6. Tidak ada perubahan RLS (`ai_connections_strict_own` sudah role-agnostic sejak desain awal).** |

**Catatan:** Modul ini adalah yang **paling sedikit konfliknya** di antara 5 Module Planning yang sudah disusun (MP-10, MP-01, MP-09, MP-02, MP-06, MP-04) — hanya 1 ambiguitas minor ditemukan, dan migration `0015` justru menunjukkan kualitas dokumentasi kode terbaik (komentar eksplisit menjelaskan keputusan desain RLS yang tidak lazim).

---

# 52. Recommendation

1. ~~Klarifikasi cakupan Developer Partner (Konflik #1) dari Owner~~ — **✅ Resolved [2026-08-06], OD-21 Opsi A** — Owner memilih Developer Partner disertakan, mengikuti Authorization Spec §2.14 (yang sudah benar sejak awal). `PRD-...v1.2.md` REQ-M13-005 dan `User-Flow-...v1.2.md` header Modul 13 direvisi menambahkan Developer Partner sebagai role ke-6. Tidak ada perubahan RLS (`ai_connections_strict_own` sudah role-agnostic sejak desain awal).
2. **Jadikan Test QA #4 (Bagian 43) — "Superadmin tidak bisa akses koneksi user lain" — sebagai gate kualitas wajib**, bukan test opsional, mengingat ini satu-satunya modul dengan pengecualian keamanan dari pola bypass umum proyek.
3. **Tegaskan di code review checklist**: dilarang keras menambah logging/cache/tabel riwayat chat dalam bentuk apa pun, sekecil apa pun alasannya (termasuk untuk debugging) — sejalan Golden Rule 40.
4. **M13 aman dibangun paralel dengan M02, M04, M06** (Batch 2 MIS) — kini tanpa syarat gate tambahan.
5. **Update `CURRENT-PROJECT-STATE.md`** mencatat: (a) gate M13 kini terbuka per keputusan Owner 6 Agustus 2026, (b) status M13 di tabel Overall Progress berubah dari "Skema: Baseline, Kode: Not Started — gate belum dikonfirmasi" menjadi "Skema: Baseline, Kode: Not Started — **gate terbuka, siap development**".
6. **Setelah M13 selesai (atau paralel dengannya)**, lanjutkan ke M03 (Listing) sesuai urutan MIS Bagian 3 urutan #8 — modul dengan risiko dan kompleksitas tertinggi proyek, wajib fokus tunggal (MIS §12).

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Status gate direvisi dari Hold menjadi Terbuka murni berdasarkan konfirmasi eksplisit Owner pada percakapan ini (6 Agustus 2026), sesuai mekanisme yang disyaratkan `PROJECT-CONSTITUTION.md` §24 poin 10 dan `development-playbook.md` Golden Rule 40.*
