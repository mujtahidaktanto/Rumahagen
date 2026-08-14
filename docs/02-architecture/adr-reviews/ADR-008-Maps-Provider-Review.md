# Architecture Review Board — Sesi Resolusi ADR-008: Maps Provider

**Platform:** RUMAHAGEN (Web — Next.js 15, TypeScript, Tailwind, shadcn/ui, Supabase, PostgreSQL, Bolt.new, Vercel)

**Peserta Board:** CTO, Principal Software Architect, Enterprise Solution Architect, Senior Backend Architect, Senior Frontend Architect, Cloud Architect, DevOps Architect, Database Architect, Security Architect, AI Development Architect, Technical Lead

**Tanggal Sesi:** 30 Juli 2026

> ⚠️ **CATATAN REVISI (lihat Bagian "ADR-008 v2 — Revisi" di akhir dokumen):** Keputusan awal di bawah ini (Google Maps Platform) telah **digantikan (superseded)** oleh keputusan v2 pada tanggal yang sama, setelah kriteria prioritas proyek berubah menjadi budget-friendly, adopsi luas di komunitas developer Indonesia, dan Bolt-friendliness. Konten Tahap 1–10 di bawah **dipertahankan sebagai jejak audit (audit trail)** sesuai praktik ADR — bukan dihapus. Rujuk ke Bagian Revisi untuk keputusan yang berlaku saat ini.

---

## Tahap 1 — Mengapa Keputusan Ini Penting

ADR-008 bukan sekadar "pilih vendor peta". Ini adalah satu-satunya baris di *Official Technology Stack* (`technology-decisions.md` §4.29) yang masih berstatus **"Condong Dipilih, Belum Final"** — semua ADR lain yang lebih besar (Backend, Search, Job Queue) sudah Approved. ADR-008 adalah gap terakhir sebelum stack teknologi platform bisa dinyatakan 100% locked.

Empat alasan konkret mengapa ini kritikal:

1. **Memblokir dua modul secara langsung** — Form lokasi listing (Modul 3, Sprint S4) dan peta proyek developer (Modul 6, Sprint S9) tidak bisa diimplementasikan penuh tanpa keputusan final, karena keduanya membutuhkan integrasi Autocomplete, Geocoding, dan rendering peta yang API-nya berbeda antar provider.
2. **Hierarki dokumen belum sinkron** — `PROJECT-CONSTITUTION.md` dan `API-Specification-v1.1.md` §13/§9.1 (dokumen berhierarki lebih tinggi) masih mencatat provider sebagai "belum final (Google Maps Platform atau Mapbox)", sementara `technology-decisions.md` sudah condong ke Google Maps. Ini pelanggaran governance hierarchy yang harus ditutup.
3. **Berdampak langsung ke biaya operasional berulang** — baik Google Maps Platform maupun Mapbox memakai model harga per-request setelah kuota gratis, dan volume request akan tumbuh linear dengan jumlah listing aktif × traffic pencarian.
4. **Menentukan pilihan library React** — `dependency-manifest.md` mencatat pemilihan wrapper React (`@vis.gl/react-google-maps` vs `@react-google-maps/api` vs `react-map-gl`) sepenuhnya bergantung pada resolusi ADR-008 ini terlebih dahulu.

Ini juga preseden governance — bagaimana kita menyelesaikan gap "keputusan teknis condong tapi menunggu konfirmasi bisnis" akan menjadi pola untuk ADR serupa di masa depan (misalnya payment gateway di ADR-011/012).

---

## Tahap 2 — Identifikasi Seluruh Alternatif Realistis

| # | Alternatif | Ringkasan |
|---|---|---|
| A | **Google Maps Platform** | Kandidat tentatif saat ini di `technology-decisions.md` |
| B | **Mapbox** | Alternatif sah yang tercatat eksplisit di ADR-008, belum dieksplorasi mendalam |
| C | **OpenStreetMap + Leaflet (self-hosted tiles / Nominatim)** | Open-source, tanpa biaya per-request langsung |
| D | **Hybrid: OSM/Leaflet untuk rendering peta + Google Places API hanya untuk Autocomplete/Geocoding** | Kombinasi untuk menekan biaya |
| E | **HERE Maps / TomTom** | Vendor pihak ketiga lain dengan cakupan Asia Tenggara |

Opsi E disingkirkan cepat: dokumentasi dan komunitas developer untuk HERE/TomTom di ekosistem Indonesia jauh lebih tipis dibanding Google/Mapbox, dan tidak tercatat sebagai alternatif di ADR-008 asli — memperkenalkannya sekarang berarti menambah *unknown unknowns* tanpa alasan kuat. Board sepakat fokus ke A, B, C, D.

---

## Tahap 3 — Perbandingan Alternatif

**Backend & kebutuhan server-side (Senior Backend Architect):** Kebutuhan server-side jelas dari API Spec §9.1 — reverse geocoding & distance matrix dipanggil server-side dengan API key rahasia. Google Geocoding API dan Distance Matrix API matang dan terdokumentasi baik. Mapbox Matrix API memiliki limit request lebih ketat di tier gratis/entry. Nominatim (OSM) untuk geocoding Indonesia punya akurasi jalan/POI yang jauh di bawah Google untuk alamat non-standar (gang, kompleks perumahan) — risiko tinggi untuk use case form listing.

**Frontend & Autocomplete (Senior Frontend Architect):** Google Places Autocomplete adalah standar de facto dengan cakupan alamat Indonesia yang matang (termasuk nama kompleks perumahan, bukan cuma jalan resmi). Mapbox Search Box API sudah membaik tapi cakupan data Indonesia historically lebih tipis. Untuk rendering pin peta murni, semua opsi sama-sama capable — bukan pembeda kuat.

**Database (Database Architect):** ERD sudah menetapkan `listings.latitude`/`longitude` sebagai `DECIMAL(10,7)` generik — provider-agnostic sepenuhnya di level skema. Tidak ada dampak ERD dari pilihan manapun.

**Security (Security Architect):** `PROJECT-CONSTITUTION.md` Bagian 20 poin 5 mewajibkan pemisahan client-key (dibatasi domain/referrer) vs server-key (rahasia) — apa pun providernya. Google Cloud Console mendukung pembatasan API key per-API dan per-referrer/IP secara granular. Mapbox mendukung token scoping (public vs secret) serupa. OSM/Nominatim self-hosted menghapus risiko kebocoran key berbayar, tapi menambah risiko operasional lain (uptime tile server).

**Cloud & DevOps (Cloud Architect, DevOps Architect):** Google Maps dan Mapbox sama-sama SaaS murni — zero infrastruktur tambahan, selaras filosofi *serverless-first* (ADR-001: Route Handlers + Supabase, tanpa service terpisah). Opsi C (self-hosted OSM tiles) **bertentangan langsung** dengan arah arsitektur yang sudah dikunci. Opsi D (hybrid) menekan biaya tapi menggandakan kompleksitas integrasi.

**AI Friendliness (AI Development Architect):** Volume dokumentasi, contoh kode, dan komunitas untuk Google Maps Platform jauh lebih besar dibanding Mapbox atau Leaflet+Nominatim untuk konteks Indonesia. Ini relevan karena Bolt.new/AI Coding Assistant akan men-generate banyak kode integrasi — makin besar training data publik, makin rendah risiko halusinasi API.

**Developer Experience (Technical Lead):** Kurva belajar Google Maps API lebih landai karena dokumentasi resmi lengkap dengan playground interaktif. Mapbox GL JS punya DX modern tapi menambah satu tool/dashboard baru.

**Biaya (CTO — sintesis):**
- **Google Maps Platform:** free tier bulanan, lalu berbayar per-1000 request per API (Autocomplete, Geocoding, Distance Matrix dihitung terpisah) — perlu verifikasi harga real-time saat implementasi.
- **Mapbox:** free tier lebih generous untuk *map loads*, tapi Geocoding API terpisah dengan kuota lebih kecil.
- **OSM/Nominatim:** gratis untuk self-hosted, tapi *usage policy* publik melarang penggunaan volume tinggi tanpa self-hosting — self-hosting berarti biaya infrastruktur + maintenance menggantikan biaya API.

Kesimpulan Board: biaya bukan lagi "gratis vs berbayar" murni, melainkan trade-off "bayar API per-request terkelola" vs "bayar infrastruktur self-hosted + effort maintenance". Untuk platform tahap MVP dengan tim kecil, opsi kedua berisiko lebih mahal secara *total cost of ownership*.

---

## Tahap 4 — Tabel Perbandingan

| Kriteria | A. Google Maps | B. Mapbox | C. OSM+Leaflet (self-hosted) | D. Hybrid (OSM render + Google API) |
|---|---|---|---|---|
| Kesesuaian dengan PRD (Modul 3 & 6) | Excellent | Good | Fair | Good |
| Kesesuaian dengan ERD | Excellent | Excellent | Excellent | Excellent |
| Integrasi dengan Supabase | Good | Good | Good | Good |
| Integrasi dengan Bolt.new | Excellent | Fair | Poor | Fair |
| Integrasi dengan Vercel (serverless-first) | Excellent | Excellent | Poor | Fair |
| Skalabilitas | Excellent | Excellent | Fair | Good |
| Kompleksitas implementasi | Excellent (satu vendor) | Good | Poor (perlu infra tile server) | Poor (dua sistem terintegrasi) |
| Biaya (proyeksi MVP–growth) | Fair (per-request setelah kuota) | Good (map load quota lebih longgar) | Good (tanpa biaya API, tapi ada biaya infra) | Fair |
| Maintainability | Excellent | Good | Fair | Poor |
| Developer Experience | Excellent | Good | Fair | Fair |
| AI Friendliness | Excellent | Fair | Poor | Poor |
| Risiko Vendor Lock-in | Fair | Fair | Excellent (tidak lock-in) | Good |
| Kemudahan migrasi di masa depan | Good (jika provider-agnostic layer diterapkan) | Good | Fair | Poor |

---

## Tahap 5 — Rekomendasi CTO

**Rekomendasi: Google Maps Platform**, dengan syarat implementasi wajib **provider-agnostic** (abstraction layer), bukan hardcoded ke SDK Google.

**Alasan (bukan popularitas, tapi kebutuhan proyek):**

1. **Akurasi data Indonesia adalah kebutuhan fungsional, bukan preferensi.** PRD Modul 3 mengharuskan Autocomplete alamat yang mengenali kompleks perumahan, gang, dan kawasan informal — bukan cuma jalan resmi bergaya pos. Google Places API secara konsisten unggul di data POI/alamat Indonesia dibanding Mapbox maupun OSM/Nominatim. Ini satu-satunya kriteria di mana perbedaan kualitas benar-benar material terhadap pengalaman pengguna.
2. **Konsistensi dengan ADR-001 (serverless-first, tanpa service terpisah).** Opsi self-hosted (C, D) memaksa penambahan infrastruktur tile-server yang bertentangan langsung dengan keputusan arsitektural yang sudah dikunci.
3. **Satu vendor untuk seluruh kebutuhan (Autocomplete + Geocoding + Distance Matrix + Nearby).** Menyederhanakan manajemen API key, billing, dan rate-limit monitoring — selaras filosofi *minimize vendor sprawl* yang sudah dianut di ADR-009 (Storage Strategy).
4. **AI-friendliness bukan sekadar nice-to-have** — pengembangan sangat bergantung pada Bolt.new/AI Coding Assistant. Volume dokumentasi dan contoh kode publik Google Maps API menekan risiko kode ter-generate salah.
5. **Risiko biaya dapat dimitigasi, bukan dihindari sepenuhnya di provider manapun.** Kekhawatiran biaya bukan argumen untuk memilih provider lain (semua punya model serupa), melainkan argumen untuk menetapkan guardrail biaya.

**Syarat non-negosiabel dari Security Architect:** Implementasi wajib mempertahankan pemisahan ketat client-key (`GOOGLE_MAPS_API_KEY_CLIENT`, dibatasi domain/referrer, kuota rendah) vs server-key (`GOOGLE_MAPS_API_KEY_SERVER`, rahasia, tidak pernah ke bundle frontend) — sesuai `PROJECT-CONSTITUTION.md` Bagian 20 poin 5.

**Syarat teknis dari Principal Software Architect:** Integrasi wajib dibungkus dalam lapisan abstraksi (interface `MapsProvider`) agar migrasi ke Mapbox di masa depan tidak memerlukan rewrite besar — konsisten dengan pola *threshold-based migration* yang sudah dipakai di ADR-005 (Search) dan ADR-006 (Job Queue).

### ⚠️ Informasi yang Masih Diperlukan Sebelum Status Naik ke "Approved" Penuh

Board tidak memiliki wewenang untuk memfinalkan angka biaya — ini kebutuhan input dari tim bisnis:

- Estimasi volume listing aktif di 6–12 bulan pertama (menentukan volume request Autocomplete/Geocoding).
- Proyeksi traffic pencarian publik (menentukan volume Distance Matrix/Nearby Search, yang paling mahal per-request).
- Budget bulanan yang dapat dialokasikan untuk Maps API setelah kuota gratis terlampaui.

**Rekomendasi Board:** Keputusan teknis (provider = Google Maps Platform) dapat Approved sekarang karena tidak bergantung pada angka biaya spesifik — tapi ambang batas volume/biaya untuk trigger migrasi ke alternatif (mengikuti pola ADR-005/006) harus ditetapkan setelah tim bisnis memberi proyeksi volume. Sampai saat itu, gunakan ambang sementara yang konservatif (lihat ADR di Tahap 8).

---

## Tahap 6 — Dampak Keputusan

| Area | Dampak |
|---|---|
| **Architecture** | Menambah lapisan abstraksi `MapsProvider` (interface) di layer service backend, dipanggil dari Route Handlers (`POST/PUT /listings`, `/properties/nearby`, `/properties/map-bounds`). Tidak mengubah pola arsitektur ADR-001 (Route Handlers + Supabase). |
| **ERD** | Tidak ada perubahan. `listings.latitude`/`longitude` (DECIMAL(10,7)) sudah provider-agnostic. |
| **Database Schema** | Tidak ada tabel/kolom baru dibutuhkan untuk Maps itu sendiri. Opsional: tabel `system_configs` untuk menyimpan flag provider aktif jika ingin fitur toggle tanpa redeploy. |
| **API** | `API-Specification-v1.1.md` §9.1 perlu diubah dari "Google Maps Platform / Mapbox" (opsi ganda) menjadi Google Maps Platform sebagai keputusan final, dengan catatan interface abstraksi. Endpoint terkait tidak berubah kontraknya (tetap terima/kembalikan lat/lng generik). |
| **Folder Structure** | Tambahan modul `lib/services/maps/` berisi `maps-provider.interface.ts`, `google-maps-provider.ts`, dan slot kosong untuk `mapbox-provider.ts` (masa depan). Frontend: `components/maps/` untuk komponen peta yang membungkus SDK, agar penggantian provider tidak menyentuh komponen pemanggil. |
| **Security** | Wajib dua API key terpisah (client-restricted vs server-secret) di environment variables Vercel, dengan pembatasan domain/referrer pada client-key dikonfigurasi di Google Cloud Console. |
| **Performance** | Reverse geocoding & Distance Matrix dipanggil server-side (tidak membebani client, tidak expose key rahasia). Autocomplete client-side perlu debouncing untuk menekan jumlah request per pengetikan pengguna. |
| **Deployment** | Environment variables baru (`GOOGLE_MAPS_API_KEY_CLIENT`, `GOOGLE_MAPS_API_KEY_SERVER`) ditambahkan ke Vercel project settings (Production, Preview, Development terpisah). |
| **Maintenance** | Monitoring kuota/billing Google Cloud Console perlu ditambahkan ke checklist operasional rutin (terkait ambang migrasi Fase 2). |
| **Development Workflow** | `dependency-manifest.md` perlu memutuskan wrapper React final: `@vis.gl/react-google-maps` (wrapper resmi terbaru Google) direkomendasikan Board dibanding `@react-google-maps/api` (lebih lama, maintenance lebih lambat). Bolt.new/AI Coding Assistant dapat mulai implementasi Sprint S4/S9 tanpa blocker lagi. |

---

## Tahap 7 — Daftar Dokumen yang Harus Diperbarui

1. `PROJECT-CONSTITUTION.md` §4 — ubah status Maps provider dari "belum final" menjadi final (Google Maps Platform).
2. `API-Specification-RUMAHAGEN-v1.1.md` §13 & §9.1 — sinkronkan sebagai keputusan final, hapus frasa "Google Maps Platform / Mapbox" jadi provider tunggal + catatan interface abstraksi.
3. `technology-decisions.md` §4.29 — ubah header dari "⚠️ Status: Condong Dipilih, Belum Final" menjadi "✅ Approved", perbarui Bagian 9 Open Questions (hapus poin Maps Provider).
4. `architecture-decision-records.md` — update entri ADR-008 dari Status **OPEN** menjadi **Approved**, isi lengkap sesuai Tahap 8.
5. `decision-log.md` — tambahkan entri baru sesuai format Tahap 9.
6. `CHANGELOG.md` — catat perubahan status ADR-008.
7. `dependency-manifest.md` Bagian 9 — finalkan pilihan wrapper React (`@vis.gl/react-google-maps`).
8. `project-manifest.md` — hapus ADR-008 dari daftar Pending High/Medium risk, pindahkan ke daftar Resolved.
9. `document-governance-baseline-register.md` — update Baseline Register bila siklus sinkronisasi formal dijalankan (mengikuti pola ADR-001/005/006).

---

## Tahap 8 — Isi ADR

**Decision ID:** ADR-008

**Title:** Pemilihan Maps & Geocoding Provider untuk Fitur Lokasi Listing dan Peta Proyek Developer

**Status:** Approved

**Date:** 30 Juli 2026

**Owner:** Architecture Review Board (CTO, Principal Software Architect — nama individu TBD sesuai OD-06)

### Context
Fitur lokasi listing (Modul 3) dan peta proyek developer (Modul 6) membutuhkan empat kapabilitas: Autocomplete alamat (client-side), rendering pin peta (client-side), reverse geocoding (server-side), dan distance matrix ke fasilitas umum (server-side). `technology-decisions.md` §4.29 sebelumnya condong memilih Google Maps Platform namun status resminya tertahan OPEN karena PROJECT-CONSTITUTION.md dan API-Specification-v1.1.md (dokumen berhierarki lebih tinggi) masih mencatat provider sebagai "belum final", dan konfirmasi biaya bisnis per-request belum diterima.

### Decision
Platform menggunakan **Google Maps Platform** sebagai Maps & Geocoding provider untuk Fase 1 (Autocomplete via Places API, rendering peta via Maps JavaScript API, reverse geocoding via Geocoding API, distance matrix via Distance Matrix/Places Nearby API). Implementasi **wajib** dibungkus dalam interface abstraksi provider-agnostic (`MapsProvider`) di layer service backend dan komponen peta frontend, agar migrasi ke Mapbox (Fase 2, bila kriteria ambang biaya/volume terlampaui) tidak memerlukan rewrite besar. Wrapper React resmi yang dipakai: `@vis.gl/react-google-maps`.

### Rationale
- Akurasi data alamat/POI Indonesia (kompleks perumahan, gang, kawasan informal) secara konsisten lebih matang di Google Places API dibanding Mapbox atau OSM/Nominatim — ini kebutuhan fungsional langsung dari PRD Modul 3, bukan preferensi.
- Konsisten dengan filosofi serverless-first & minimize vendor sprawl yang sudah dikunci di ADR-001 (Backend Architecture) dan ADR-009 (Storage Strategy) — tidak menambah infrastruktur tile-server terpisah.
- Satu vendor untuk seluruh kebutuhan (Autocomplete, Geocoding, Distance Matrix, Nearby) menyederhanakan manajemen API key dan billing.
- Volume dokumentasi & contoh kode publik menekan risiko halusinasi kode saat implementasi via Bolt.new/AI Coding Assistant.
- Risiko vendor lock-in dimitigasi lewat lapisan abstraksi, bukan dihindari lewat pemilihan provider berbeda (semua provider punya risiko lock-in serupa pada level SDK).

### Alternatives Considered
- **Mapbox** — teknis viable, token scoping matang, tapi cakupan data alamat Indonesia lebih tipis dan Distance Matrix API punya kuota lebih ketat di tier awal. Tetap dicatat sebagai jalur migrasi Fase 2.
- **OpenStreetMap + Leaflet (self-hosted)** — ditolak karena bertentangan dengan keputusan serverless-first (ADR-001) dan akurasi data alamat informal Indonesia jauh di bawah Google.
- **Hybrid (OSM render + Google API untuk Autocomplete/Geocoding)** — ditolak karena menggandakan kompleksitas integrasi (dua sistem terpisah) tanpa penghematan biaya yang signifikan untuk terbukti sepadan di tahap MVP.
- **HERE Maps / TomTom** — disingkirkan di awal karena dokumentasi & komunitas developer untuk konteks Indonesia jauh lebih tipis, tidak tercatat di ADR-008 versi awal.

### Consequences
**Positif:** Modul 3 (Sprint S4) dan Modul 6 (Sprint S9) tidak lagi terblokir; satu vendor tunggal menyederhanakan operasional; jalur migrasi Fase 2 sudah disiapkan sejak awal.

**Negatif/Risiko:** Biaya per-request pasca-kuota-gratis perlu dipantau ketat; API key management (client vs server) menambah satu titik kegagalan keamanan yang wajib diaudit; ketergantungan pada satu vendor Google untuk empat kapabilitas sekaligus (mitigasi: lapisan abstraksi).

**Kriteria Ambang Migrasi ke Fase 2 (Mapbox) — sementara, menunggu proyeksi bisnis:** Jika biaya bulanan Maps API melampaui ambang budget yang ditetapkan tim bisnis, atau volume request bulanan melampaui proyeksi kuota gratis secara konsisten 3 bulan berturut-turut, evaluasi migrasi ke Mapbox dijalankan mengikuti pola ADR-005/ADR-006.

### Affected Documents
`PROJECT-CONSTITUTION.md` §4, `API-Specification-v1.1.md` §13 & §9.1, `technology-decisions.md` §4.29, `dependency-manifest.md` Bagian 9, `decision-log.md`, `CHANGELOG.md`, `project-manifest.md`.

### Review Date
Saat kriteria ambang migrasi Fase 2 di atas terlampaui, atau maksimal 6 bulan pasca go-live untuk evaluasi biaya aktual vs proyeksi.

---

## Tahap 9 — Perubahan ke Technology Decisions, Decision Log, Changelog

### `technology-decisions.md` §4.29
Ubah header dari:
`### 4.29 Google Maps Platform — Maps (⚠️ Status: Condong Dipilih, Belum Final — lihat ADR-008)`
menjadi:
`### 4.29 Google Maps Platform — Maps (✅ Status: Approved — lihat ADR-008)`

Hapus baris "Why Alternative Was Rejected: Belum ditolak secara final" dan ganti dengan ringkasan rationale final dari ADR-008. Hapus poin terkait dari Bagian 9 Open Questions.

### `decision-log.md`
Tambahkan entri baru dengan format identik pola ADR-036/ADR-037 yang sudah ada:

```
## ADR-008 — Maps Provider Diselesaikan
Date: 2026-07-30
Status: Approved
Category: Architecture, Integration, Cost
Related Documents: technology-decisions.md §4.29, API-Specification-v1.1.md §9.1/§13
Problem: [ringkas Context di Tahap 8]
Decision: [ringkas Decision di Tahap 8]
Reason: [ringkas Rationale di Tahap 8]
Consequences: [ringkas Consequences di Tahap 8]
Future Review: [ringkas kriteria ambang migrasi Fase 2]
```

### `CHANGELOG.md`
```
## [Unreleased] — 2026-07-30
### Decided
- ADR-008 (Maps Provider) resolved: Google Maps Platform Approved sebagai
  MVP Fase 1, migrasi terjadwal ke Mapbox Fase 2 berdasarkan kriteria ambang
  biaya/volume. Modul 3 (Sprint S4) dan Modul 6 (Sprint S9) tidak lagi
  terblokir oleh Open Decision teknis ini.
```

---

## Tahap 10 — Keputusan Akhir

# ✅ APPROVED WITH NOTES

**Catatan wajib ditindaklanjuti sebelum implementasi Sprint S4/S9 dimulai:**

1. Tim bisnis wajib memberi proyeksi volume listing/traffic untuk menetapkan angka konkret ambang migrasi Fase 2 (saat ini masih kualitatif — "3 bulan berturut-turut melampaui kuota").
2. Lapisan abstraksi `MapsProvider` bersifat **non-negosiabel**, bukan opsional — ini syarat teknis Approval, bukan saran.
3. Pemisahan client-key/server-key wajib diverifikasi Security Architect sebelum merge ke `main` pada implementasi pertama.
4. Owner individu ADR ini masih terisi peran (bukan nama), konsisten dengan gap governance OD-06 yang sudah tercatat sebelumnya — tidak menghalangi Approval teknis ini, tapi tetap perlu ditutup terpisah.

---
---

# ADR-008 v2 — Revisi (Budget-Friendly, Populer di Indonesia, Bolt-Friendly)

**Status Sesi:** Re-review terfokus Architecture Review Board (bukan sesi Open Decision baru — melanjutkan ADR-008 yang sama)

**Alasan Revisi:** Prioritas proyek berubah dari "akurasi data Indonesia adalah kriteria dominan" menjadi tiga kriteria baru yang lebih diutamakan pemilik proyek: **(1) budget-friendly**, **(2) banyak dipakai developer Indonesia**, **(3) bolt-friendly (mudah di-generate AI Coding Assistant)**. Ini bukan pembatalan analisis v1 — melainkan re-weighting kriteria yang sah dan konsisten dengan mekanisme "kriteria ambang migrasi" yang sudah dipakai di ADR-005/006.

## Kandidat yang Dipertimbangkan Ulang

| Kandidat | Rendering Peta | Geocoding/Autocomplete | Catatan |
|---|---|---|---|
| **Leaflet + OpenStreetMap (tiles gratis)** | `react-leaflet` — ~2,5 juta unduhan mingguan, dokumentasi sangat matang, sangat banyak tutorial berbahasa Indonesia (Laravel, WebGIS kampus, dsb.) | Perlu provider geocoding terpisah (lihat di bawah) | Rendering 100% gratis, tanpa API key |
| **Mapbox / MapLibre GL JS** | Bagus, ~600rb unduhan mingguan, free tier 50.000 map load/bulan | Geocoding $0,75/1000 (85% lebih murah dari Google) | Tetap butuh kartu kredit & billing setup |
| **Google Maps Platform (keputusan v1)** | Excellent tapi berbayar penuh setelah kuota | $5/1000 request | Sudah dianalisis di Tahap 1–10 di atas |

## Analisis Geocoding/Autocomplete (Pelengkap Leaflet+OSM)

Karena Leaflet hanya menangani rendering, dibutuhkan provider geocoding terpisah. Tiga opsi berbasis data OpenStreetMap yang **tidak memerlukan self-hosting** (sehingga tidak lagi bertentangan dengan filosofi serverless-first ADR-001 — ini mengoreksi alasan penolakan OSM di v1):

| Provider | Free Tier | Kompatibilitas |
|---|---|---|
| **LocationIQ** | 5.000 request/hari gratis | API kompatibel-Nominatim, tinggal ganti base URL |
| **Geoapify** | Free tier + satu-satunya opsi batch geocoding gratis yang layak | Cocok untuk auto-fill kota/kecamatan saat pin lokasi |
| **Nominatim publik (openstreetmap.org)** | Gratis tanpa API key | Dibatasi 1 request/detik — hanya cocok dev/testing, **bukan untuk produksi** |

## Tabel Perbandingan (Kriteria Baru)

| Kriteria | Leaflet + OSM + LocationIQ | Mapbox | Google Maps (v1) |
|---|---|---|---|
| Budget-friendly | **Excellent** (rendering gratis penuh, geocoding gratis s.d. 5.000/hari) | Good (free tier ada, tapi wajib kartu kredit) | Fair (paling mahal per-request) |
| Populer di kalangan developer Indonesia | **Excellent** (dominan di tutorial/blog/skripsi berbahasa Indonesia, WebGIS kampus, banyak proyek Laravel/Next.js lokal) | Fair (dipakai tapi jauh lebih jarang di konten Indonesia) | Good (populer tapi mahal jadi banyak dihindari proyek kecil) |
| Bolt-friendly (AI code generation) | **Excellent** (API sederhana, pola konsisten, dokumentasi jernih, `react-leaflet` sangat umum di training data) | Good | Excellent |
| Akurasi data alamat Indonesia | Fair–Good (tergantung kelengkapan data OSM per wilayah; kompleks perumahan baru kadang belum lengkap) | Good | Excellent |
| Konsistensi dgn serverless-first (ADR-001) | **Excellent** (tiles & geocoding sepenuhnya hosted pihak ketiga, tanpa infra tambahan) | Excellent | Excellent |

## Rekomendasi CTO (Revisi)

**Google Maps Platform digantikan oleh: Leaflet + React-Leaflet (rendering peta) + OpenStreetMap tiles (gratis) + LocationIQ (geocoding & reverse geocoding, Nominatim-compatible, 5.000 request/hari gratis).**

Objection utama terhadap OSM di v1 (bertentangan dengan serverless-first karena butuh self-hosted tile server) **tidak lagi berlaku** — LocationIQ/Geoapify adalah layanan SaaS hosted, bukan self-hosted, sehingga tetap selaras ADR-001. Risiko akurasi data alamat kompleks perumahan baru di beberapa wilayah **dimitigasi**, bukan dihilangkan total — ini trade-off yang secara sadar diterima demi budget & Bolt-friendliness sesuai prioritas baru pemilik proyek.

**Guardrail yang tetap dipertahankan dari v1 (tidak berubah):**
- Lapisan abstraksi `MapsProvider` tetap wajib — kini justru lebih berguna karena membuka jalur migrasi balik ke Google Maps Platform per-fitur (mis. hanya untuk Autocomplete) apabila akurasi OSM terbukti jadi masalah nyata pasca-launching, tanpa rewrite besar.
- `listings.latitude`/`longitude` di ERD tidak berubah — tetap provider-agnostic.
- Field `area_keyword` di form listing (freetext pelengkap kawasan) menjadi **mitigasi tambahan** untuk gap akurasi OSM — agen tetap bisa menulis nama kawasan spesifik secara manual, tidak sepenuhnya bergantung pada geocoding otomatis.

## Perubahan pada Tahap 6–9 (v1) Akibat Revisi

- **Folder Structure:** `lib/services/maps/google-maps-provider.ts` → diganti primary jadi `lib/services/maps/leaflet-osm-provider.ts` (rendering) + `lib/services/maps/locationiq-provider.ts` (geocoding). Slot `google-maps-provider.ts` dipertahankan sebagai fallback/migrasi masa depan (mengisi kontrak `MapsProvider` yang sama).
- **Dependency Manifest:** Tambahkan `leaflet`, `react-leaflet`, `@types/leaflet` sebagai dependency utama, menggantikan rencana `@vis.gl/react-google-maps`.
- **Environment Variables:** `GOOGLE_MAPS_API_KEY_CLIENT`/`_SERVER` → diganti `LOCATIONIQ_API_KEY` (server-side, untuk geocoding/reverse geocoding). Tidak perlu API key untuk rendering tiles OSM standar.
- **Security:** Ancaman kebocoran key jauh berkurang — tidak ada client-key untuk rendering peta (tiles OSM publik tanpa key). Hanya `LOCATIONIQ_API_KEY` yang perlu dijaga rahasia (server-side saja).
- **Affected Documents:** Sama seperti v1 (`PROJECT-CONSTITUTION.md` §4, `API-Specification-v1.1.md` §13 & §9.1, `technology-decisions.md` §4.29, `dependency-manifest.md` Bagian 9), plus tambahan revisi teks yang menyebut provider baru.

## Keputusan Akhir Revisi

# ✅ APPROVED WITH NOTES (v2 — menggantikan v1)

**Catatan wajib:**
1. Uji akurasi data OSM untuk 5–10 sampel alamat kompleks perumahan riil di wilayah prioritas MVP (mis. Jabodetabek) sebelum Sprint S4 dimulai — jika gap akurasi signifikan, evaluasi hybrid (OSM rendering + geocoding tetap OSM tapi field `area_keyword` diwajibkan, bukan opsional).
2. Pantau kuota harian LocationIQ (5.000 request/hari) sejak Sprint S0 — jika volume proyeksi bisnis mendekati batas ini, evaluasi upgrade ke tier berbayar LocationIQ (masih jauh lebih murah dari Google) atau Geoapify.
3. Guardrail lapisan abstraksi `MapsProvider` dari v1 tetap berlaku penuh — non-negosiabel.
4. Poin proyeksi volume bisnis dari tim bisnis (dicatat sebagai kebutuhan di v1) **masih relevan** untuk revisi ini — dipakai untuk memastikan 5.000 request/hari LocationIQ cukup, bukan lagi untuk estimasi biaya Google Maps.

---
---

# ADR-008 v3 — Revisi Minor (Implementation Readiness)

**Status Sesi:** Architecture Review terhadap ADR-008 v2 yang sudah Approved. **Keputusan utama TIDAK diubah** (Leaflet, OpenStreetMap, LocationIQ sebagai Primary Provider, abstraction layer, budget-friendly, Bolt.new-friendly, Next.js + Supabase tetap seperti v2). Lima improvement dievaluasi dan seluruhnya **ditambahkan** karena konsisten dengan keputusan utama dan dokumen proyek — tidak ada yang menggantikan Decision inti.

## 3.1 Approved Alternative Provider — Geoapify

**Keputusan:** Geoapify ditetapkan sebagai **Approved Alternative Provider** (failover), bukan Primary Provider. LocationIQ tetap Primary — tidak berubah.

**Alasan Teknis:**
- Sama-sama berbasis data OpenStreetMap seperti LocationIQ — profil akurasi konsisten, tidak menambah varians hasil geocoding antar provider.
- Satu-satunya opsi *free-tier batch geocoding* yang layak — berguna untuk kebutuhan masa depan seperti geocoding massal saat onboarding data developer project (Modul 6) tanpa membebani kuota harian LocationIQ.
- Berfungsi sebagai failover otomatis di dalam `MapsProvider` abstraction layer (sudah ada sejak v2) — jika LocationIQ mengembalikan error/timeout/kuota habis, request dialihkan ke Geoapify tanpa mengubah kontrak API internal.
- Tidak menambah library rendering baru — Geoapify hanya dipakai di layer geocoding server-side, tidak menyentuh Leaflet/OSM tiles.

**Implementasi:** Interface `MapsProvider` menambah method `geocode()`/`reverseGeocode()` dengan strategi *fallback chain*: LocationIQ (primary) → Geoapify (secondary) → gagal total → trigger Offline/Manual Fallback (lihat 3.4).

## 3.2 Caching Strategy

**Keputusan:** Cache diimplementasikan di **PostgreSQL via Supabase** — tidak menambah Redis atau infrastruktur baru, konsisten dengan ADR-018 yang masih OPEN dan filosofi minimal-vendor ADR-001.

**Desain:**
| Kebutuhan | Strategi |
|---|---|
| **Geocoding** (alamat → koordinat) | Tabel baru `geocode_cache` (key: hash alamat ternormalisasi, value: hasil JSONB, provider, `expires_at`). Alamat jarang berubah koordinatnya — TTL panjang (mis. 90 hari). Dicek sebelum memanggil LocationIQ/Geoapify. |
| **Reverse Geocoding** (koordinat → alamat) | Tabel sama, key: koordinat dibulatkan ke 5 desimal (~1 meter presisi) — cukup untuk deduplikasi request pin lokasi yang berdekatan. |
| **Autocomplete** | **Tidak disimpan di database** (terlalu volatil, nilai reuse rendah per-keystroke). Mitigasi: debounce 300–500ms di client (`Senior Next.js Engineer`), dikombinasikan cache jangka pendek di edge via `fetch` cache/`unstable_cache` Next.js (revalidate singkat, mis. 60 detik) untuk query prefix populer (mis. nama kota besar yang sering diketik banyak agen). |

**Dampak biaya:** Alamat yang sering dicari ulang (kompleks perumahan populer, jalan utama) tidak lagi memanggil API berbayar berulang — langsung mengurangi konsumsi kuota harian LocationIQ/Geoapify.

**Perlu perubahan ERD:** Ya — tabel baru `geocode_cache` (lihat Bagian 9 di bawah).

## 3.3 Rate Limiting Strategy

**Keputusan:** Kebijakan rate limiting **scoped khusus endpoint Maps** (Autocomplete, Geocode, Reverse Geocode) diterapkan sebagai lapisan tambahan di atas kebijakan umum `PROJECT-CONSTITUTION.md` Bagian 20 poin 6 — **tanpa mendahului atau menggantikan resolusi ADR-018** (mekanisme rate-limiting lintas-platform masih OPEN).

**Alasan scope terbatas:** Endpoint Maps berbeda dari endpoint publik umum karena setiap request berpotensi membebani kuota berbayar pihak ketiga secara langsung — risiko abuse di sini punya dampak biaya nyata, bukan hanya beban server.

**Mekanisme interim (sampai ADR-018 final):**
- Tabel Postgres ringan `api_rate_limits` (key: IP/session + endpoint, counter, `window_start`) — bukan Redis, konsisten dengan status ADR-018 saat ini.
- Limit lebih ketat dari tier publik umum (60/menit/IP menurut `SYSTEM-ARCHITECTURE.md` §14): **Autocomplete 20/menit/IP, Geocode/Reverse Geocode 10/menit/IP.**
- Mass geocoding (mis. import massal listing) **wajib** melalui jalur admin/batch terautentikasi (role Admin/Superadmin) dengan limit terpisah — tidak melalui endpoint publik sama sekali.
- Bot/spam: **Turnstile/reCAPTCHA sengaja TIDAK ditambahkan** pada revisi ini — akan memperkenalkan vendor baru tanpa bukti kebutuhan nyata saat ini (melanggar aturan "jangan menambahkan library baru yang tidak diperlukan"). Dicatat sebagai opsi masa depan jika abuse terbukti terjadi pasca-launch.

**Catatan governance:** Bagian ini **tidak mengubah status ADR-018** — hanya menetapkan kebijakan sementara khusus Maps yang tetap kompatibel dengan mekanisme apa pun yang akhirnya dipilih ADR-018 (Redis atau tetap Postgres-based).

## 3.4 Offline / Manual Address Strategy

**Temuan kunci dari Architecture Review:** Sebagian besar fallback ini **sudah menjadi arsitektur inti**, bukan penambahan baru — `API-Specification-v1.1.md` Bagian 8 sudah menetapkan data wilayah administratif (provinsi/kota/kecamatan) **di-seed & di-host sendiri** di database internal (`ref_provinces`/`ref_cities`/`ref_districts`), bukan dipanggil dari API pihak ketiga. Artinya, kegagalan LocationIQ/Geoapify/OSM **tidak pernah memblokir** pengisian lokasi administratif listing.

**Keputusan — formalisasi fallback resmi 3 lapis:**
1. **Lapis Administratif (selalu tersedia):** `province_id`/`city_id`/`district_id` via cascading dropdown dari tabel `ref_*` internal — tidak terpengaruh sama sekali oleh status Geocoding API, karena tidak pernah bergantung padanya.
2. **Lapis Alamat Jalan (freetext, selalu tersedia):** Field `address` (`listings.address`, NOT NULL) tetap dapat diisi manual oleh agen tanpa Autocomplete — Autocomplete hanya kemudahan UX, bukan syarat wajib pengisian.
3. **Lapis Koordinat (fallback baru — UX tambahan):** Jika reverse geocoding gagal/timeout saat agen pin lokasi di peta, UI menyediakan **input manual latitude/longitude** di samping peta interaktif (`listings.latitude`/`longitude` sudah NULLABLE di ERD — tidak perlu perubahan skema), atau agen tetap bisa drag pin di peta Leaflet tanpa reverse geocoding (koordinat tersimpan langsung dari posisi pin, auto-fill kota/kecamatan bersifat opsional bukan wajib).

**UX degradation graceful:** Toast/notice halus ("Pencarian alamat otomatis sedang tidak tersedia — silakan isi manual") saat API gagal, bukan blocking error yang menghentikan proses input listing.

**Tidak perlu perubahan ERD** untuk poin ini — seluruh kolom pendukung sudah ada.

## 3.5 Scalability & Migration Strategy

**Keputusan:** Roadmap migrasi bertahap berbasis ambang volume, mengikuti pola *threshold-based migration* yang sudah dipakai ADR-005 (Search) dan ADR-006 (Job Queue) — bukan konsep baru, hanya diterapkan konsisten ke ADR-008.

| Tahap | Kondisi Pemicu | Konfigurasi Maps |
|---|---|---|
| **MVP** (saat ini) | Peluncuran awal, volume rendah | Leaflet+OSM (rendering) + LocationIQ (primary, free tier 5.000/hari) + Geoapify (failover) |
| **Growth** | Request geocoding >5.000/hari konsisten 30 hari, atau listing aktif >~10.000 | Upgrade LocationIQ ke tier berbayar (tetap jauh lebih murah dari Google), atau alihkan sebagian beban ke Geoapify batch tier |
| **Scale** | p95 latency geocoding memburuk signifikan, volume >100.000 request/bulan, atau feedback pengguna nyata soal akurasi alamat kompleks perumahan baru | Evaluasi migrasi **parsial** ke Mapbox Geocoding (khusus Autocomplete, UX-critical) — rendering tetap Leaflet/MapLibre, `MapsProvider` abstraction memungkinkan ini tanpa rewrite besar |
| **Enterprise** | Platform sudah scale besar/profitable, akurasi alamat jadi diferensiator kompetitif, atau butuh SLA komersial | Revisit **Google Maps Platform penuh** (opsi ADR-008 v1 asli) — abstraction layer yang disiapkan sejak awal justru dirancang untuk migrasi akhir ini |

**Prinsip inti:** Setiap tahap migrasi hanya mengganti implementasi di balik `MapsProvider` interface — kontrak API internal (`geocode()`, `reverseGeocode()`, render komponen peta) tidak berubah, sehingga tidak ada rewrite besar di titik manapun pada roadmap ini.

---

## 8. Document Synchronization Plan (Terbaru)

1. `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` — tambahkan tabel baru `geocode_cache` (Bagian 2, modul referensi lokasi) dan opsional `api_rate_limits` (jika tim memutuskan tidak menunggu ADR-018 untuk endpoint Maps).
2. `API-Specification-v1.1.md` §9.1 — tambahkan catatan fallback manual eksplisit (saat ini implisit) + dokumentasikan endpoint internal caching (tidak ada endpoint baru untuk publik, caching transparan di layer service).
3. `technology-decisions.md` §4.29 — tambahkan Geoapify sebagai Approved Alternative Provider, catatan caching Postgres-based, catatan rate-limit interim.
4. `SYSTEM-ARCHITECTURE.md` §14 (Security) & §15 (Performance) — tambahkan baris rate-limit khusus Maps endpoint & strategi cache geocoding.
5. `architecture-decision-records.md` — update entri ADR-008 dengan isi v3 (revisi minor, bukan status baru — tetap Approved).
6. `decision-log.md` — tambahkan entri revisi minor ADR-008.
7. `dependency-manifest.md` — **tidak ada perubahan** (tidak ada library baru ditambahkan).

## 9. Daftar Seluruh Dokumen yang Harus Diperbarui

- `ERD-Skema-Database-Real-Estate-Agency-v1.1.md` (tabel `geocode_cache` baru)
- `API-Specification-RUMAHAGEN-v1.1.md` §9.1
- `technology-decisions.md` §4.29
- `SYSTEM-ARCHITECTURE.md` §14 & §15
- `architecture-decision-records.md` (ADR-008)
- `decision-log.md`
- `CHANGELOG.md`
- `project-manifest.md`
- `CURRENT-PROJECT-STATE.md`
- `document-governance-baseline-register.md` (jika siklus sinkronisasi formal dijalankan)

## 10. Project Manifest Impact

ADR-008 tetap tercatat **Resolved/Approved** — revisi ini tidak mengubah status di `project-manifest.md`. Tambahan: satu item baru di *Pending Activities* jalur teknis — "Implementasi `geocode_cache` table & interim rate-limit table saat Database Schema Alignment (fisik) berjalan" — masuk kategori 🟢 Low risk (peningkatan kualitas, tidak memblokir sprint manapun).

## 11. Governance Baseline Impact

Revisi ini adalah **minor amendment** terhadap ADR yang sudah Approved (v2), bukan Open Decision baru — tidak memerlukan siklus Baseline Register penuh seperti ADR-001/005/006. Cukup dicatat sebagai versi ADR-008 bertambah (v2 → v3) di `document-governance-baseline-register.md` dengan tanggal revisi dan ringkasan lima penambahan.

## 12. Changelog Impact

```
## [Unreleased] — 2026-07-30 (lanjutan)
### Enhanced
- ADR-008 (Maps Provider) revisi minor v3: menambahkan Geoapify sebagai
  Approved Alternative Provider, caching strategy berbasis Postgres
  (tabel geocode_cache), rate-limiting scoped untuk endpoint Maps,
  formalisasi offline/manual address fallback (3 lapis), dan roadmap
  scalability MVP→Growth→Scale→Enterprise. Keputusan utama (LocationIQ
  Primary, Leaflet+OSM rendering) tidak berubah.
```

## 13. Current Project State Impact

`CURRENT-PROJECT-STATE.md` perlu diperbarui untuk mencatat: (a) ADR-008 kini di versi v3 dengan lima area implementasi tambahan yang wajib diperhatikan Bolt.new/AI Coding Assistant saat Sprint S4/S9 dieksekusi — terutama pembuatan tabel `geocode_cache` saat migration awal; (b) tidak ada perubahan pada daftar Open Decision — ADR-008 tetap Resolved; (c) tidak ada dependency baru ditambahkan ke `dependency-manifest.md`, sehingga tidak ada dampak ke audit dependency.
