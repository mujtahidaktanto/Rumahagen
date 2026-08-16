# ERD & Skema Database — Platform Web RUMAHAGEN

**Dokumen pendamping:** PRD-RUMAHAGEN.md v1.2, Entity-Mapping-RUMAHAGEN.md v1.0, User-Flow-RUMAHAGEN.md
**Versi:** 1.4 (naik dari 1.3 — penambahan kolom deteksi duplikat foto di `listing_photos`, ADR-047/OD-25)
**Tanggal:** 8 Agustus 2026 — kolom `file_hash`/`photo_hash` ditambahkan ke `ENT-M03-ListingPhoto` sesuai `ADR-047` (Image Duplicate Detection); tidak ada tabel/kolom lain yang diubah pada siklus ini
**Status:** ✅ Baseline (BERLAKU) — status tidak berubah, hanya versi konten naik; mengikuti pola siklus sebelumnya di mana penambahan field konsisten tidak menurunkan status Baseline selama tidak mengubah keputusan yang sudah disahkan

> **Catatan Revisi v1.3 (siklus Engineering Alignment, 5 Agustus 2026):** Perubahan **MINOR** (Bab 5 `document-governance-baseline-register.md`) — aditif, tidak mengubah keputusan v1.2 yang sudah ada. Rincian:
> 1. **Retrofit `ENT-XXX`** — setiap tabel kini mencantumkan Entity ID resmi, mereferensikan `Entity-Mapping-...v1.0.md` (satu-satunya sumber pendaftaran entity, EAF Bab 18.3) — ERD tidak lagi mendefinisikan entity secara independen.
> 2. **5 tabel baru** untuk Modul 12 (`organizations`, `organization_members`, `organization_invitations`) dan Modul 13 (`ai_providers`, `agent_ai_connections`) — dasar `ADR-026`/`027`/`028` (=`ADR-043`/`044`/`045`).
> 3. **Perluasan aditif** `listings` (+`organization_id`, +`listing_context`) dan `audit_logs` (+`organization_id`) — kolom baru, tidak mengubah kolom existing.
> 4. **Soft-delete `organizations`** diterapkan mengikuti **prinsip** `ADR-046`/OD-07 yang sudah Approved (entitas ber-FK + tampil publik) — bukan keputusan arsitektur baru, murni penerapan konsisten prinsip existing ke tabel baru.
> 5. **Database Schema (fisik) digabung** ke dokumen ini (Bagian 2A) sesuai keputusan Owner — bukan file/dokumen migrasi terpisah.
> 6. **Tidak ada kolom/tabel v1.2 yang diubah maknanya** — seluruh perubahan v1.1/v1.2 (soft-delete 8 tabel, seed role 7, migrasi `city`→`city_id`) dipertahankan utuh sebagai riwayat di bawah.

> **Catatan Revisi v1.2 (dipertahankan sebagai riwayat):** (1) Kebijakan soft-delete diperluas dari 3 menjadi 8 tabel — `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners` ditambahkan (lihat Bagian 4 poin 3, `decision-log.md` `ADR-046`); (2) Klarifikasi eksplisit: Guest **bukan** baris fisik tabel `roles` — seed role final 7 baris (lihat Bagian 2.28).

> **Catatan Revisi v1.1:** (1) Tambah role `buyer` ke seed data `roles`; (2) `role_permissions` untuk `role_id = agent` ditegaskan hanya mengenal `granted_scope` = `all`/`own`/`none` (tidak ada level "scoped tim/wilayah"); (3) `developer_projects.city` (freetext) dimigrasi menjadi `city_id` (FK → `ref_cities`); (4) tabel baru `agent_reviews` ditambahkan untuk mendukung fitur review/rating agen yang diaktifkan di Fase 1.

Diagram visual ERD tersedia terpisah di file `ERD-Diagram.mermaid`. Dokumen ini berisi data dictionary lengkap (tabel, field, tipe data, constraint, relasi) per modul.

---

## 1. Daftar Entitas per Modul

| Modul | Entitas/Tabel |
|---|---|
| M1 — Auth & Registrasi | `users`, `agent_verification_documents` |
| M2 — Profil Agen | `agent_profiles`, `agent_reviews` |
| M3 — Listing | `listings`, `listing_photos`, `listing_videos`, `amenities`, `listing_amenities`, `listing_price_history`, `listing_leads`, `listing_views` |
| M4 — Learning Center | `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates` |
| M5 — Kalender Event | `events`, `event_registrations` |
| M6 — Katalog Developer | `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims` |
| M7 — Scoring DBR | `dbr_simulations`, `dbr_config` |
| M8 — Dashboard & Notifikasi | `notifications` |
| M9 — Admin/Sistem | `system_configs`, `audit_logs` |
| M10 — Role & Hak Akses (RBAC) | `roles`, `permissions`, `role_permissions` |
| Referensi Wilayah Indonesia | `ref_provinces`, `ref_cities`, `ref_districts`, `ref_villages` |
| M11 — SEO & Analytics | `url_redirects` (konfigurasi GTM/GA4/GSC memakai `system_configs` yang sudah ada) |
| M12 — Organization Management System **(baru, v1.3)** | `organizations`, `organization_members`, `organization_invitations` (+ perluasan aditif `listings.organization_id`/`listing_context`, `audit_logs.organization_id`) |
| M13 — AI Assistant Integration **(baru, v1.3)** | `ai_providers`, `agent_ai_connections` |

---

## 2. Data Dictionary Detail

### 2.1 `users` (Modul 1 — tabel induk semua role)  
> **Entity ID:** `ENT-M01-User`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| phone | VARCHAR(20) | UNIQUE | |
| password_hash | VARCHAR(255) | NOT NULL | |
| role_id | UUID/BIGINT | FK → roles.id, NOT NULL | Merujuk ke tabel `roles` (superadmin/manager/admin/agent/instructor/developer_partner) agar mendukung role kustom (Modul 10) |
| status | ENUM | NOT NULL, default `pending_review` | `pending_review`, `active`, `suspended`, `rejected` |
| email_verified_at | TIMESTAMP | NULLABLE | |
| last_login_at | TIMESTAMP | NULLABLE | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

### 2.2 `agent_verification_documents` (Modul 1)  
> **Entity ID:** `ENT-M01-AgentVerificationDocument`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| user_id | UUID/BIGINT | FK → users.id | |
| doc_type | ENUM | NOT NULL | `ktp`, `npwp`, `sertifikasi_rei`, `lainnya` |
| file_url | VARCHAR(500) | NOT NULL | |
| encrypted | BOOLEAN | default true | Data sensitif wajib terenkripsi |
| review_status | ENUM | default `pending` | `pending`, `approved`, `rejected` |
| reviewed_by | UUID/BIGINT | FK → users.id, NULLABLE | Admin yang review |
| rejection_reason | TEXT | NULLABLE | |
| created_at | TIMESTAMP | | |

### 2.3 `agent_profiles` (Modul 2)  
> **Entity ID:** `ENT-M02-AgentProfile`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| user_id | UUID/BIGINT | FK → users.id, UNIQUE | 1:1 dengan users |
| full_name | VARCHAR(150) | NOT NULL | |
| avatar_url | VARCHAR(500) | NULLABLE | |
| bio | TEXT | NULLABLE | |
| specialization | ENUM/ARRAY | NULLABLE | `residensial`, `komersial`, `tanah`, `sewa` |
| coverage_area | VARCHAR(255) | NULLABLE | Area operasional (multi-kota, disimpan JSON/array) |
| office_name | VARCHAR(150) | NULLABLE | Nama kantor/brokerage |
| license_number | VARCHAR(50) | NULLABLE | |
| whatsapp_number | VARCHAR(20) | NOT NULL | Default untuk CTA listing |
| contact_visibility | ENUM | default `public` | `public`, `hidden` |
| public_slug | VARCHAR(150) | UNIQUE | Untuk URL profil publik |
| total_listings_sold | INT | default 0 | Dihitung otomatis (trigger/cron dari `listings`) |
| total_listings_rented | INT | default 0 | |
| created_at / updated_at | TIMESTAMP | | |

> Badge & sertifikat agen **tidak disimpan sebagai field terpisah** di sini — ditampilkan via query relasi ke `certificates` (Modul 4) berdasarkan `user_id`.

### 2.3b `agent_reviews` (Modul 2 — **baru, v1.1**, resolusi konflik #7)  
> **Entity ID:** `ENT-M02-AgentReview`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | Agen yang direview |
| buyer_id | UUID/BIGINT | FK → users.id, NULLABLE | Diisi jika reviewer adalah akun `buyer` terdaftar |
| listing_lead_id | UUID/BIGINT | FK → listing_leads.id, NULLABLE | Opsional — mengaitkan review ke lead/inquiry spesifik sebagai bukti interaksi nyata |
| reviewer_name | VARCHAR(150) | NULLABLE | Dipakai jika reviewer bukan akun `buyer` terdaftar (mis. isi manual saat submit) |
| rating | SMALLINT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | |
| comment | TEXT | NULLABLE | |
| status | ENUM | NOT NULL, default `pending` | `pending`, `approved`, `rejected` — wajib dimoderasi sebelum tampil publik |
| moderated_by | UUID/BIGINT | FK → users.id, NULLABLE | Admin/Manager/Superadmin yang memoderasi |
| moderated_at | TIMESTAMP | NULLABLE | |
| created_at | TIMESTAMP | NOT NULL | |

> `agent_profiles` **tidak** menyimpan `aggregateRating` sebagai field terdenormalisasi di rilis awal — dihitung on-the-fly dari `AVG(rating) WHERE status = 'approved'` saat render halaman profil publik (volume review per agen relatif kecil di Fase 1, belum perlu denormalisasi). Structured data `aggregateRating` (SEO Spec Bagian 3) hanya disertakan jika minimal 1 baris `approved` ada untuk agen tsb.

---

### 2.4 `listings` (Modul 3 — tabel inti)  
> **Entity ID:** `ENT-M03-Listing`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | Ownership per-agen |
| developer_project_id | UUID/BIGINT | FK → developer_projects.id, NULLABLE | Terisi jika kategori Primary & tertaut proyek |
| organization_id | UUID/BIGINT | FK → organizations.id, NULLABLE | **(v1.3, baru)** Terisi jika listing berkonteks Organization (`ENT-M12-Organization`); NULL = Personal Listing murni. Lihat REQ-M12-014 |
| listing_context | ENUM | NOT NULL, default `personal` | **(v1.3, baru)** `personal`, `organization` — menentukan tampilan kepemilikan ganda personal/organization (REQ-M12-014); saat Organization bubar/agen keluar, kolom ini di-reset ke `personal` dan `organization_id` di-null-kan, status listing turun ke `draft` (REQ-M12-015) |
| category | ENUM | NOT NULL | `primary`, `secondary` |
| transaction_type | ENUM | NOT NULL | `sale`, `rent` |
| title | VARCHAR(200) | NOT NULL | |
| slug | VARCHAR(220) | UNIQUE, NOT NULL | Auto-generate dari `title` + short ID saat dibuat; tidak berubah otomatis saat `title` diedit (lihat SEO Spec 1.2) |
| meta_title | VARCHAR(70) | NULLABLE | Override manual; jika kosong, di-generate dari template saat response API (lihat SEO Spec 2.1) |
| meta_description | VARCHAR(160) | NULLABLE | Override manual; idem seperti `meta_title` |
| description | TEXT | NULLABLE | |
| property_type | ENUM | NOT NULL | `rumah`, `apartemen`, `ruko`, `tanah`, `gudang`, `kavling`, `lainnya` |
| price | DECIMAL(18,2) | NOT NULL | |
| price_unit | ENUM | NULLABLE | `total`, `per_bulan`, `per_tahun` (relevan utk sewa) |
| is_negotiable | BOOLEAN | default false | |
| address | VARCHAR(500) | NOT NULL | Jalan & nomor (freetext) |
| province_id | UUID/BIGINT | FK → ref_provinces.id, NOT NULL | Dipilih dari database referensi wilayah, bukan isi bebas |
| city_id | UUID/BIGINT | FK → ref_cities.id, NOT NULL | Opsi mengikuti `province_id` terpilih (cascading) |
| district_id | UUID/BIGINT | FK → ref_districts.id, NOT NULL | Opsi mengikuti `city_id` terpilih (cascading) |
| area_keyword | VARCHAR(20) | NULLABLE | Nama wilayah/kawasan freetext pelengkap (mis. "BSD City") — keyword tambahan untuk pencarian, bukan pengganti data administratif |
| latitude | DECIMAL(10,7) | NULLABLE | |
| longitude | DECIMAL(10,7) | NULLABLE | |
| land_area | DECIMAL(10,2) | NULLABLE | m² |
| building_area | DECIMAL(10,2) | NULLABLE | m² |
| bedrooms | SMALLINT | NULLABLE | |
| bathrooms | SMALLINT | NULLABLE | |
| floors | SMALLINT | NULLABLE | |
| carport_capacity | SMALLINT | NULLABLE | |
| electrical_power | INT | NULLABLE | Watt |
| water_source | ENUM | NULLABLE | `pdam`, `sumur`, `lainnya` |
| furnishing | ENUM | NULLABLE | `unfurnished`, `semi_furnished`, `fully_furnished` |
| year_built | SMALLINT | NULLABLE | |
| certificate_type | ENUM | NULLABLE | `shm`, `hgb`, `girik`, `ppjb`, `strata_title`, `lainnya` |
| certificate_transferred | BOOLEAN | NULLABLE | Sudah balik nama atau belum |
| imb_status | ENUM | NULLABLE | `ada`, `tidak_ada`, `dalam_proses` |
| dispute_free_declared | BOOLEAN | default false | Pernyataan agen bebas sengketa |
| whatsapp_number | VARCHAR(20) | NOT NULL | Override dari agent_profiles jika diisi |
| status | ENUM | NOT NULL, default `draft` | `draft`, `pending_review`, `published`, `sold`, `rented`, `expired`, `rejected` |
| rejection_reason | TEXT | NULLABLE | |
| view_count | INT | default 0 | |
| cta_click_count | INT | default 0 | Denormalized counter dari `listing_leads` |
| published_at | TIMESTAMP | NULLABLE | |
| expired_at | TIMESTAMP | NULLABLE | |
| sold_or_rented_at | TIMESTAMP | NULLABLE | |
| created_at / updated_at | TIMESTAMP | | |

### 2.5 `listing_photos`  
> **Entity ID:** `ENT-M03-ListingPhoto`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| listing_id | UUID/BIGINT | FK → listings.id | |
| url | VARCHAR(500) | NOT NULL | |
| alt_text | VARCHAR(150) | NULLABLE | Auto-terisi dari template (`"{title} - foto {n}"`), dapat ditimpa agen — untuk SEO gambar (lihat SEO Spec 2.4) |
| is_cover | BOOLEAN | default false | |
| sort_order | SMALLINT | default 0 | |
| file_hash | VARCHAR(64) | NULLABLE | **(v1.4, baru)** SHA-256 hex digest file foto mentah, dihitung server-side saat upload — dipakai untuk deteksi duplikat exact-match (`ADR-047`, `OD-25`) |
| photo_hash | VARCHAR(64) | NULLABLE | **(v1.4, baru)** Perceptual hash (64-bit) via library `image-hash`, dihitung server-side saat upload — dipakai untuk deteksi kemiripan foto toleran kompresi/resize (`ADR-047`, `OD-25`); dibandingkan sebagai Hamming Distance, bukan exact-match |

### 2.6 `listing_videos`  
> **Entity ID:** `ENT-M03-ListingVideo`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| listing_id | UUID/BIGINT | FK → listings.id |
| url | VARCHAR(500) | NOT NULL |
| type | ENUM | `video`, `virtual_tour` |

### 2.7 `amenities` (master) & `listing_amenities` (pivot)  
> **Entity ID:** `ENT-M03-Amenity` (amenities) / `ENT-M03-ListingAmenity` (listing_amenities, association)
```
amenities: id (PK), name (VARCHAR, e.g. "Kolam Renang", "Keamanan 24 Jam")
listing_amenities: listing_id (FK), amenity_id (FK)  -- composite PK
```

### 2.8 `listing_price_history`  
> **Entity ID:** `ENT-M03-ListingPriceHistory`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| listing_id | UUID/BIGINT | FK → listings.id |
| old_price | DECIMAL(18,2) | |
| new_price | DECIMAL(18,2) | |
| changed_at | TIMESTAMP | |

### 2.9 `listing_leads` (pencatatan klik CTA WhatsApp)  
> **Entity ID:** `ENT-M03-ListingLead`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| listing_id | UUID/BIGINT | FK → listings.id | |
| agent_id | UUID/BIGINT | FK → users.id | Denormalized untuk query cepat dashboard |
| source | ENUM | default `whatsapp_cta` | |
| ip_address | VARCHAR(45) | NULLABLE | |
| user_agent | VARCHAR(255) | NULLABLE | |
| created_at | TIMESTAMP | | |

### 2.10 `listing_views` (opsional, analitik traffic)  
> **Entity ID:** `ENT-M03-ListingView`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| listing_id | UUID/BIGINT | FK → listings.id |
| viewed_at | TIMESTAMP | |

---

### 2.11 `developer_partners` (Modul 6)  
> **Entity ID:** `ENT-M06-DeveloperPartner`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| company_name | VARCHAR(200) | NOT NULL |
| pic_name | VARCHAR(150) | NULLABLE |
| pic_contact | VARCHAR(50) | NULLABLE |
| user_id | UUID/BIGINT | FK → users.id, NULLABLE (jika partner punya login) |
| status | ENUM | `active`, `inactive` |
| created_at | TIMESTAMP | |

### 2.12 `developer_projects`  
> **Entity ID:** `ENT-M06-DeveloperProject`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| developer_id | UUID/BIGINT | FK → developer_partners.id | |
| name | VARCHAR(200) | NOT NULL | |
| slug | VARCHAR(220) | UNIQUE, NOT NULL | Sama seperti `listings.slug` — dipakai di URL `/developer/{slug}` |
| meta_title | VARCHAR(70) | NULLABLE | |
| meta_description | VARCHAR(160) | NULLABLE | |
| location | VARCHAR(255) | | Freetext detail lokasi (nama kawasan/jalan) |
| city_id | UUID/BIGINT | FK → ref_cities.id, NOT NULL | **(v1.1)** Menggantikan kolom `city` (freetext) sebelumnya — kini konsisten dengan `listings.city_id`, memakai database referensi wilayah yang sama agar filter lokasi lintas listing & proyek developer dapat digabung |
| property_type | ENUM | | Sama seperti listings.property_type |
| price_min | DECIMAL(18,2) | | |
| price_max | DECIMAL(18,2) | | |
| unit_availability | INT | | Jumlah unit tersedia |
| commission_scheme | VARCHAR(255) | | Deskripsi/persentase komisi |
| is_exclusive_by_region | BOOLEAN | default false | |
| status | ENUM | `active`, `coming_soon`, `sold_out`, `inactive` | |
| created_at / updated_at | TIMESTAMP | | |

### 2.13 `developer_project_media`  
> **Entity ID:** `ENT-M06-DeveloperProjectMedia`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| project_id | UUID/BIGINT | FK → developer_projects.id |
| type | ENUM | `photo`, `video`, `brochure`, `price_list` |
| url | VARCHAR(500) | NOT NULL |

### 2.14 `agent_project_claims`  
> **Entity ID:** `ENT-M06-AgentProjectClaim`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| agent_id | UUID/BIGINT | FK → users.id | |
| project_id | UUID/BIGINT | FK → developer_projects.id | |
| claimed_at | TIMESTAMP | | |
| UNIQUE | (agent_id, project_id) | | Agen tidak bisa klaim proyek yang sama 2x |

---

### 2.15 `courses` (Modul 4)  
> **Entity ID:** `ENT-M04-Course`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| title | VARCHAR(200) | NOT NULL |
| category | ENUM | `sales_skill`, `legal_regulasi`, `produk_developer`, `financial_kpr`, `lainnya` |
| description | TEXT | |
| prerequisite_course_id | UUID/BIGINT | FK → courses.id, NULLABLE |
| passing_grade | SMALLINT | default 70 |
| status | ENUM | `draft`, `published`, `archived` |
| created_by | UUID/BIGINT | FK → users.id |
| created_at / updated_at | TIMESTAMP | |

### 2.16 `course_lessons`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| course_id | UUID/BIGINT | FK → courses.id |
| title | VARCHAR(200) | |
| content_type | ENUM | `video`, `pdf`, `slide` |
| content_url | VARCHAR(500) | |
| sort_order | SMALLINT | |

### 2.17 `quizzes`, `quiz_questions`, `quiz_options`
```
quizzes: id (PK), course_id (FK → courses.id), title

quiz_questions: id (PK), quiz_id (FK → quizzes.id), question_text, question_type (single_choice/multi_choice)

quiz_options: id (PK), question_id (FK → quiz_questions.id), option_text, is_correct (BOOLEAN)
```

### 2.18 `enrollments`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| agent_id | UUID/BIGINT | FK → users.id | |
| course_id | UUID/BIGINT | FK → courses.id | |
| status | ENUM | `in_progress`, `completed` | |
| progress_percent | SMALLINT | default 0 | |
| enrolled_at | TIMESTAMP | | |
| completed_at | TIMESTAMP | NULLABLE | |
| UNIQUE | (agent_id, course_id) | | |

### 2.19 `quiz_attempts`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| enrollment_id | UUID/BIGINT | FK → enrollments.id |
| quiz_id | UUID/BIGINT | FK → quizzes.id |
| score | DECIMAL(5,2) | |
| passed | BOOLEAN | |
| attempted_at | TIMESTAMP | |

### 2.20 `certificates`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| agent_id | UUID/BIGINT | FK → users.id |
| course_id | UUID/BIGINT | FK → courses.id |
| certificate_url | VARCHAR(500) | |
| issued_at | TIMESTAMP | |
| UNIQUE | (agent_id, course_id) | |

---

### 2.21 `events` (Modul 5)  
> **Entity ID:** `ENT-M05-Event`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| title | VARCHAR(200) | NOT NULL | |
| category | ENUM | `training`, `launching_proyek`, `open_house`, `gathering` | |
| description | TEXT | | |
| is_online | BOOLEAN | default false | |
| location | VARCHAR(255) | NULLABLE | |
| meeting_link | VARCHAR(500) | NULLABLE | |
| host | VARCHAR(150) | NULLABLE | |
| quota | INT | NULLABLE | NULL = tanpa batas |
| related_course_id | UUID/BIGINT | FK → courses.id, NULLABLE | Jika event = kelas live |
| related_project_id | UUID/BIGINT | FK → developer_projects.id, NULLABLE | Jika event = launching proyek |
| submitted_by | UUID/BIGINT | FK → users.id, NULLABLE | Developer partner pengaju |
| status | ENUM | `pending_approval`, `published`, `rejected`, `cancelled` | |
| start_at | TIMESTAMP | NOT NULL | |
| end_at | TIMESTAMP | NULLABLE | |
| created_at / updated_at | TIMESTAMP | | |

### 2.22 `event_registrations`  
> **Entity ID:** `ENT-M05-EventRegistration`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| event_id | UUID/BIGINT | FK → events.id |
| agent_id | UUID/BIGINT | FK → users.id |
| status | ENUM | `registered`, `waitlist`, `attended`, `cancelled` |
| registered_at | TIMESTAMP | |
| UNIQUE | (event_id, agent_id) | |

---

### 2.23 `dbr_simulations` (Modul 7)  
> **Entity ID:** `ENT-M07-DbrSimulation`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| agent_id | UUID/BIGINT | FK → users.id | |
| listing_id | UUID/BIGINT | FK → listings.id, NULLABLE | Jika simulasi dibuka dari listing |
| prospect_name | VARCHAR(150) | NULLABLE | |
| prospect_phone | VARCHAR(20) | NULLABLE | |
| net_income | DECIMAL(18,2) | NOT NULL | *(data sensitif — akses terbatas agen pemilik & admin)* |
| existing_installments | DECIMAL(18,2) | default 0 | *(data sensitif)* |
| property_price | DECIMAL(18,2) | NOT NULL | |
| down_payment | DECIMAL(18,2) | NOT NULL | |
| loan_amount | DECIMAL(18,2) | NOT NULL | Computed: property_price - down_payment |
| tenor_months | SMALLINT | NOT NULL | |
| interest_rate_annual | DECIMAL(5,2) | NOT NULL | |
| monthly_installment | DECIMAL(18,2) | NOT NULL | Hasil kalkulasi anuitas |
| dbr_percent | DECIMAL(5,2) | NOT NULL | |
| eligibility_status | ENUM | NOT NULL | `layak`, `perlu_review`, `tidak_layak` |
| pdf_export_url | VARCHAR(500) | NULLABLE | |
| created_at | TIMESTAMP | | |

### 2.24 `dbr_config` (parameter global, dikelola Admin — Modul 9)  
> **Entity ID:** `ENT-M07-DbrConfig`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| dbr_threshold_percent | DECIMAL(5,2) | default 35.00 |
| default_interest_rate | DECIMAL(5,2) | default 8.50 |
| updated_by | UUID/BIGINT | FK → users.id |
| updated_at | TIMESTAMP | |

---

### 2.25 `notifications` (Modul 8)  
> **Entity ID:** `ENT-M08-Notification`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| user_id | UUID/BIGINT | FK → users.id | Penerima |
| type | ENUM | `approval_status`, `event_reminder`, `listing_expiring`, `certificate_issued`, `lead_new`, `lainnya` | |
| title | VARCHAR(200) | | |
| message | TEXT | | |
| related_entity_type | VARCHAR(50) | NULLABLE | mis. `listing`, `event`, `course` |
| related_entity_id | UUID/BIGINT | NULLABLE | |
| is_read | BOOLEAN | default false | |
| created_at | TIMESTAMP | | |

---

### 2.26 `system_configs` (Modul 9)  
> **Entity ID:** `ENT-M09-SystemConfig`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| config_key | VARCHAR(100) | UNIQUE | mis. `listing_expiry_days`, `max_active_listing_per_tier` |
| config_value | VARCHAR(255) | | |
| updated_by | UUID/BIGINT | FK → users.id | |
| updated_at | TIMESTAMP | | |

### 2.27 `audit_logs`  
> **Entity ID:** `ENT-M09-AuditLog`
| Field | Tipe | Constraint |
|---|---|---|
| id | UUID/BIGINT | PK |
| user_id | UUID/BIGINT | FK → users.id |
| action | VARCHAR(100) | mis. `approve_listing`, `reject_agent` |
| entity_type | VARCHAR(50) | **(v1.3)** kini juga menerima `organization`, `organization_member`, `organization_invitation` untuk mendukung Organization Activity Log (REQ-M12-017) |
| entity_id | UUID/BIGINT | |
| organization_id | UUID/BIGINT | **(v1.3, baru)** FK → organizations.id, NULLABLE — diisi jika aksi terjadi dalam konteks Organization; mendukung Activity Timeline per-Organization tanpa tabel log terpisah (`Architecture-Evolution-Proposal-...` §7) |
| old_value | JSON | NULLABLE |
| new_value | JSON | NULLABLE |
| created_at | TIMESTAMP | |

---

### 2.28 `roles` (Modul 10)  
> **Entity ID:** `ENT-M10-Role`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| code | VARCHAR(50) | UNIQUE, NOT NULL | `superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer` (**v1.1** — ditambahkan sebagai role formal untuk akun ringan pencari properti, selaras API Specification §1.1), atau kode role kustom |
| name | VARCHAR(100) | NOT NULL | Nama tampilan |
| is_system_role | BOOLEAN | default true | `true` untuk 4 role inti + 2 role eksternal bawaan; `false` untuk role kustom buatan Superadmin |
| is_protected | BOOLEAN | default false | `true` khusus untuk `superadmin` — mencegah role ini dihapus/di-nonaktifkan |
| created_at / updated_at | TIMESTAMP | | |

> **Klarifikasi seed role final (v1.2, OD-02, resolved 4 Agustus 2026):** tabel ini di-seed dengan **7 baris fisik** — `superadmin`, `manager`, `admin`, `instructor`, `agent`, `developer_partner`, `buyer`. **Guest eksplisit BUKAN baris tabel ini** — direpresentasikan murni sebagai state tidak-login (`users` tanpa sesi aktif, tanpa `role_id`), konsisten dengan desain kolom `code` di atas yang sejak v1.1 tidak pernah mencantumkan `guest`. Ini menutup drift penghitungan "7 vs 8" yang sebelumnya tercatat di beberapa dokumen turunan — lihat `decision-log.md` §11 OD-02 dan `PROJECT-CONSTITUTION.md` §3.1.

### 2.29 `permissions` (Modul 10)  
> **Entity ID:** `ENT-M10-Permission`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| module_code | VARCHAR(50) | NOT NULL | mis. `M1_registration`, `M3_listing`, `M7_dbr` |
| action_code | VARCHAR(50) | NOT NULL | mis. `create`, `read`, `update`, `delete`, `approve` |
| scope_type | ENUM | default `own` | `all` (global — dipakai Superadmin/Manager/Admin), `own` (data milik sendiri — dipakai Agen), `none`. **(v1.1)** Hanya 3 nilai ini yang valid — tidak ada level "scoped per tim/wilayah"; akses Manager selalu `all` (global) tanpa pengecualian, selaras PRD Modul 10 |
| description | VARCHAR(255) | | Deskripsi human-readable, mis. "Approve registrasi agen baru" |
| UNIQUE | (module_code, action_code) | | Satu baris permission per kombinasi modul+aksi |

### 2.30 `role_permissions` (pivot, Modul 10)  
> **Entity ID:** `ENT-M10-RolePermission`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| role_id | UUID/BIGINT | FK → roles.id | |
| permission_id | UUID/BIGINT | FK → permissions.id | |
| granted_scope | ENUM | `all`, `own`, `none` | Override scope default dari `permissions.scope_type` — inilah yang diedit lewat Permission Matrix Editor. **(v1.1)** Baris dengan `role_id = manager` untuk modul yang relevan (M2/M3/M7/M8) selalu di-set `all` — tidak pernah dikonfigurasi ke nilai lain untuk membatasi Manager per tim/wilayah |
| editable_by_role_code | VARCHAR(50) | default `superadmin` | Menentukan role mana yang **berwenang mengubah baris ini**. Baris dengan `role_id` merujuk ke role `agent` bernilai `superadmin,manager` (baik Superadmin maupun Manager boleh mengubah); baris lain (role Admin/Manager/Superadmin, serta seluruh baris di modul konfigurasi sistem/keamanan) bernilai `superadmin` saja |
| updated_by | UUID/BIGINT | FK → users.id | User yang terakhir mengubah |
| updated_at | TIMESTAMP | | |
| UNIQUE | (role_id, permission_id) | | |

> Baris untuk `role_id` = `superadmin` **tidak pernah dibaca untuk pembatasan** — di level aplikasi, role `superadmin` selalu bypass pengecekan tabel ini (hardcoded full-access), sesuai business rule di PRD Modul 10.
> Field `editable_by_role_code` adalah mekanisme utama yang menegakkan aturan "Manager hanya boleh mengubah permission role Agen" — dicek di level aplikasi sebelum mengizinkan request `UPDATE` ke tabel ini.

---

### 2.33 `ref_provinces` (Referensi Wilayah — mendukung API Bagian 8)  
> **Entity ID:** `ENT-M03-RefProvince`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Kode wilayah resmi (mis. kode Kemendagri) |
| name | VARCHAR(100) | NOT NULL | mis. "Banten", "Jawa Barat" |

### 2.34 `ref_cities`  
> **Entity ID:** `ENT-M03-RefCity`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| province_id | UUID/BIGINT | FK → ref_provinces.id, NOT NULL | |
| code | VARCHAR(10) | UNIQUE, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | mis. "Tangerang Selatan" |
| type | ENUM | NOT NULL | `kota`, `kabupaten` |

### 2.35 `ref_districts`  
> **Entity ID:** `ENT-M03-RefDistrict`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| city_id | UUID/BIGINT | FK → ref_cities.id, NOT NULL | |
| code | VARCHAR(10) | UNIQUE, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | mis. "Serpong" |

### 2.36 `ref_villages` (kelurahan/desa — disiapkan untuk API Bagian 8 & kebutuhan lain seperti alamat profil, belum dipakai `listings` saat ini karena form listing hanya sampai level Kecamatan)  
> **Entity ID:** `ENT-M03-RefVillage`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| district_id | UUID/BIGINT | FK → ref_districts.id, NOT NULL | |
| code | VARCHAR(10) | UNIQUE, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | |
| postal_code | VARCHAR(6) | NULLABLE | |

> **Sumber data:** di-seed sekali dari dataset wilayah administratif resmi (mis. data Kemendagri) dan di-*host* di database internal — bukan dipanggil ke API pihak ketiga tiap request (sudah disepakati di API Specification Bagian 8), karena data ini relatif statis.

---

### 2.37 `url_redirects` (M11 — SEO & Analytics)  
> **Entity ID:** `ENT-M11-UrlRedirect`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| old_path | VARCHAR(300) | UNIQUE, NOT NULL | Path lama, mis. `/properti/rumah-lama-slug-ab12` |
| new_path | VARCHAR(300) | NOT NULL | Path tujuan baru |
| redirect_type | ENUM | default `301` | `301` (permanen), `302` (sementara) |
| reason | ENUM | NULLABLE | `slug_changed`, `listing_deleted`, `listing_merged`, `lainnya` |
| entity_type | VARCHAR(50) | NULLABLE | mis. `listing`, `developer_project` |
| entity_id | UUID/BIGINT | NULLABLE | |
| created_at | TIMESTAMP | | |

> Setiap kali `listings.slug` atau `developer_projects.slug` berubah, atau listing dihapus permanen, aplikasi **wajib** menulis baris baru ke tabel ini sebelum menerapkan perubahan — mencegah broken link/404 dari hasil pencarian Google yang sudah terlanjur mengindeks URL lama (lihat SEO Spec 1.2 & 1.4).

---

### 2.38 `organizations` (Modul 12 — **baru, v1.3**)  
> **Entity ID:** `ENT-M12-Organization` | **Dasar:** REQ-M12-001, 002, 006–009, 019 | `ADR-026`/`ADR-043`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_name | VARCHAR(150) | NOT NULL | |
| slug | VARCHAR(170) | UNIQUE, NOT NULL | Auto-generate, konvensi sama `agent_profiles.public_slug` |
| organization_type | ENUM | NOT NULL | `agency`, `kantor`, `tim`, `komunitas` — murni label (REQ-M12-007) |
| logo_url | VARCHAR(500) | NULLABLE | |
| banner_url | VARCHAR(500) | NULLABLE | |
| description | TEXT | NULLABLE | |
| website | VARCHAR(255) | NULLABLE | |
| social_media | JSON | NULLABLE | |
| address | VARCHAR(500) | NULLABLE | |
| contact_phone | VARCHAR(20) | NULLABLE | |
| created_by | UUID/BIGINT | FK → users.id, NOT NULL | Leader pembuat |
| status | ENUM | NOT NULL, default `active` | `active`, `closed` — **tidak ada** `pending_review`/`rejected` (self-service tanpa moderasi, REQ-M12-008) |
| deleted_at | TIMESTAMP | NULLABLE | **Soft-delete** — diterapkan konsisten dengan prinsip `ADR-046`/OD-07 (entitas direferensikan FK oleh `organization_members`/`listings` dan tampil di halaman publik `/organization/[slug]`); ini **penerapan prinsip yang sudah Approved**, bukan keputusan arsitektur baru |
| created_at / updated_at | TIMESTAMP | | |

### 2.39 `organization_members` (Modul 12 — **baru, v1.3**)  
> **Entity ID:** `ENT-M12-OrganizationMember` | **Dasar:** REQ-M12-003, 016 | `ADR-026`/`ADR-043`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_id | UUID/BIGINT | FK → organizations.id, NOT NULL | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | |
| role | ENUM | NOT NULL | `leader`, `member` |
| status | ENUM | NOT NULL, default `active` | `active`, `left`, `removed` |
| joined_at | TIMESTAMP | NOT NULL | |
| left_at | TIMESTAMP | NULLABLE | |
| UNIQUE | (agent_id) WHERE status='active' | | **Constraint kunci** — menegakkan "1 agen maksimal 1 Organization aktif" (REQ-M12-003) di level database |

### 2.40 `organization_invitations` (Modul 12 — **baru, v1.3**)  
> **Entity ID:** `ENT-M12-OrganizationInvitation` | **Dasar:** REQ-M12-010–013 | `ADR-026`/`ADR-043`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_id | UUID/BIGINT | FK → organizations.id, NOT NULL | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | Selalu agen subjek keanggotaan (diundang maupun mengajukan diri) |
| leader_id | UUID/BIGINT | FK → users.id, NOT NULL | Selalu Leader Organization terkait |
| initiated_by_type | ENUM | NOT NULL | `leader_invite`, `agent_request` — field kunci arah inisiasi (REQ-M12-011) |
| status | ENUM | NOT NULL, default `pending` | `pending`, `accepted`, `rejected`, `ignored`, `expired`, `cancelled` |
| responded_at | TIMESTAMP | NULLABLE | |
| expires_at | TIMESTAMP | NULLABLE | Transisi otomatis ke `expired` via job queue existing (`ADR-006`) |
| created_at | TIMESTAMP | NOT NULL | |
| UNIQUE | (organization_id, agent_id, initiated_by_type) WHERE status='pending' | | Mencegah duplikat baris pending di pasangan+arah yang sama |

> **Business rule level-aplikasi (bukan constraint DB, dicatat untuk API Spec Langkah 6):** cooldown 24 jam per (organization_id, agent_id, initiated_by_type) setelah `rejected` (REQ-M12-013); cross-cancellation seluruh `agent_request` pending lain saat salah satu `accepted` (REQ-M12-012).

### 2.41 `ai_providers` (Modul 13 — **baru, v1.3**)  
> **Entity ID:** `ENT-M13-AiProvider` | **Dasar:** REQ-M13-002, 008 | `ADR-028`/`ADR-045`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| code | VARCHAR(50) | UNIQUE, NOT NULL | `gemini`, `groq`, `mistral`, `github_models` |
| display_name | VARCHAR(100) | NOT NULL | |
| logo_url | VARCHAR(500) | NULLABLE | |
| billing_type | ENUM | NOT NULL | `free_tier_ongoing` (rilis awal); disiapkan menerima `paid_only`, `trial_then_paid` |
| setup_instructions_url | VARCHAR(500) | NOT NULL | Link generate API key resmi provider |
| usage_terms_note | TEXT | NULLABLE | Ditampilkan sebelum connect (REQ-M13-008) |
| requires_expiry_warning | BOOLEAN | default false | `true` khusus `github_models` (PAT bisa punya masa berlaku) |
| status | ENUM | NOT NULL, default `active` | `active`, `inactive` |

### 2.42 `agent_ai_connections` (Modul 13 — **baru, v1.3**)  
> **Entity ID:** `ENT-M13-AgentAiConnection` | **Dasar:** REQ-M13-001, 007 | `ADR-028`/`ADR-045`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| user_id | UUID/BIGINT | FK → users.id, NOT NULL | Seluruh role internal berakun, bukan hanya agen (REQ-M13-005) |
| provider_id | UUID/BIGINT | FK → ai_providers.id, NOT NULL | |
| encrypted_api_key | VARCHAR(500) | NOT NULL | Terenkripsi at-rest, pola sama `agent_verification_documents.file_url` |
| status | ENUM | NOT NULL, default `active` | `active`, `disconnected`, `invalid` |
| last_validated_at | TIMESTAMP | NULLABLE | |
| connected_at | TIMESTAMP | NOT NULL | |
| created_at / updated_at | TIMESTAMP | | |
| UNIQUE | (user_id, provider_id) WHERE status='active' | | Maks. 1 koneksi aktif per provider per user |

> **Tidak ada tabel riwayat percakapan** — sesuai REQ-M13-003, percakapan murni transient, tidak ada baris yang perlu disimpan (dikonfirmasi ulang, bukan diasumsikan, dari `Architecture-Evolution-Proposal-...` §18.4).

---

## 2A. Database Schema (Fisik) — Digabung ke Dokumen Ini (v1.3)

> **Keputusan cakupan (dikonfirmasi eksplisit oleh Owner):** proyek belum memiliki file migration/DDL fisik terpisah (0% kode, `CURRENT-PROJECT-STATE.md`). Sesuai arahan TUGAS 3 langkah 5, **Database Schema fisik digabungkan ke dalam file ERD ini** (satu file), bukan dibuat sebagai dokumen/file migrasi terpisah. Baris **"Database Schema (fisik)"** di `document-governance-baseline-register.md` Bagian 10 agar disinkronkan pada revisi berikutnya untuk merujuk ke dokumen ini (bukan `TBD`/`Planned` terpisah).

Karena implementasi kode masih 0% (belum ada migration dijalankan), **skema logis (Bagian 2 di atas) dan skema fisik saat ini identik** — seluruh tipe data, constraint, dan relasi di Bagian 2 **adalah** spesifikasi DDL yang akan dieksekusi saat Sprint S0/S1, tanpa lapisan abstraksi tambahan (tidak ada view/denormalisasi fisik yang berbeda dari model logis pada Fase 1). Dokumen ini akan diperbarui dengan nomor migrasi aktual (mis. `0001_init.sql`) begitu Sprint S0 dieksekusi dan migration pertama dijalankan — dicatat sebagai item tindak lanjut, bukan diasumsikan selesai di sini.

---

## 3. Ringkasan Relasi Kunci (Foreign Key Map)

| Tabel Anak | Foreign Key | Tabel Induk | Kardinalitas |
|---|---|---|---|
| agent_profiles | user_id | users | 1 : 1 |
| agent_verification_documents | user_id | users | N : 1 |
| listings | agent_id | users | N : 1 |
| listings | developer_project_id | developer_projects | N : 1 (nullable) |
| listings | province_id | ref_provinces | N : 1 |
| listings | city_id | ref_cities | N : 1 |
| listings | district_id | ref_districts | N : 1 |
| developer_projects | city_id | ref_cities | N : 1 |
| agent_reviews | agent_id | users | N : 1 |
| agent_reviews | buyer_id | users | N : 1 (nullable) |
| agent_reviews | listing_lead_id | listing_leads | N : 1 (nullable) |
| ref_cities | province_id | ref_provinces | N : 1 |
| ref_districts | city_id | ref_cities | N : 1 |
| ref_villages | district_id | ref_districts | N : 1 |
| listing_photos / videos | listing_id | listings | N : 1 |
| listing_amenities | listing_id, amenity_id | listings, amenities | N : N |
| listing_price_history | listing_id | listings | N : 1 |
| listing_leads | listing_id, agent_id | listings, users | N : 1 |
| developer_projects | developer_id | developer_partners | N : 1 |
| developer_project_media | project_id | developer_projects | N : 1 |
| agent_project_claims | agent_id, project_id | users, developer_projects | N : N |
| course_lessons | course_id | courses | N : 1 |
| quizzes | course_id | courses | N : 1 |
| quiz_questions | quiz_id | quizzes | N : 1 |
| quiz_options | question_id | quiz_questions | N : 1 |
| enrollments | agent_id, course_id | users, courses | N : N (via tabel ini) |
| quiz_attempts | enrollment_id | enrollments | N : 1 |
| certificates | agent_id, course_id | users, courses | N : N (via tabel ini) |
| events | related_course_id | courses | N : 1 (nullable) |
| events | related_project_id | developer_projects | N : 1 (nullable) |
| event_registrations | event_id, agent_id | events, users | N : N (via tabel ini) |
| dbr_simulations | agent_id | users | N : 1 |
| dbr_simulations | listing_id | listings | N : 1 (nullable) |
| notifications | user_id | users | N : 1 |
| users | role_id | roles | N : 1 |
| role_permissions | role_id, permission_id | roles, permissions | N : N (via tabel ini) |
| listings | organization_id | organizations | N : 1 (nullable) |
| organization_members | organization_id, agent_id | organizations, users | N : 1 masing-masing; UNIQUE agent_id WHERE active |
| organization_invitations | organization_id, agent_id, leader_id | organizations, users (x2) | N : 1 masing-masing |
| audit_logs | organization_id | organizations | N : 1 (nullable) |
| agent_ai_connections | user_id, provider_id | users, ai_providers | N : 1 masing-masing; UNIQUE (user_id, provider_id) WHERE active |

---

## 4. Catatan Desain & Keamanan Data

1. **Enkripsi field sensitif**: `agent_verification_documents.file_url` (dokumen KTP/NPWP) dan seluruh field finansial di `dbr_simulations` (`net_income`, `existing_installments`) wajib dienkripsi at-rest dan dibatasi akses hanya untuk pemilik data (agent_id) & role `admin`.
2. **Denormalisasi terkontrol**: `listings.cta_click_count` dan `agent_profiles.total_listings_sold/rented` adalah counter yang didenormalisasi dari tabel transaksional (`listing_leads`, `listings`) untuk performa query dashboard — perlu update via trigger/scheduled job, bukan dihitung on-the-fly setiap request.
3. **Soft delete wajib** (kolom `deleted_at`) untuk **8 tabel** (v1.2, OD-07/`ADR-046`, resolved 4 Agustus 2026): `listings`, `users`, `developer_projects` (asli), ditambah **`agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners`** (baru) — agar data riwayat (statistik, audit, sertifikat, registrasi) tidak hilang saat "dihapus". Prinsip umum yang mendasari perluasan ini: soft-delete wajib untuk entitas yang direferensikan foreign key oleh tabel lain (mis. `agent_profiles` ← `listings.agent_id`) atau tampil di halaman publik/bernilai audit; hard-delete diizinkan hanya untuk data child/log/transien murni (mis. `listing_views`, `quiz_attempts`) yang tidak punya nilai audit independen. Detail alasan per-entitas: `decision-log.md` `ADR-046`.
4. **Indexing prioritas**: `listings(status, category, transaction_type, city_id, price)` untuk mendukung filter pencarian; `listing_leads(listing_id, created_at)` untuk agregasi dashboard; `dbr_simulations(agent_id, created_at)` untuk riwayat prospek. Kolom `area_keyword` disarankan memakai index full-text/trigram terpisah agar pencarian keyword kawasan tetap cepat meski bersifat freetext.
5. **Konsistensi data Primary Listing**: field `listings.price`, spesifikasi, dan materi pada listing berkategori `primary` yang tertaut `developer_project_id` sebaiknya divalidasi di level aplikasi (bukan hard constraint DB) agar tetap sinkron dengan `developer_projects`, namun tetap mengizinkan agen menambah deskripsi/foto tambahan.
6. **Enforcement RBAC di level backend**: setiap query/endpoint yang menyentuh data ber-scope (`listings`, `dbr_simulations`, `agent_profiles`, dsb) wajib menambahkan filter `WHERE agent_id = :current_user_id` ketika `role_permissions.granted_scope = 'own'` (berlaku untuk role Agen). Untuk role Superadmin/Manager/Admin dengan `granted_scope = 'all'`, query berjalan tanpa filter kepemilikan (akses global) — namun **tetap wajib melalui pengecekan permission**, bukan hanya "tidak ada filter". Middleware juga wajib menolak (403) setiap permintaan `UPDATE`/`DELETE` dari Agen terhadap baris `listings`/`agent_profiles` yang `agent_id`-nya bukan miliknya, terlepas dari nilai permission apa pun — aturan ini bersifat hard rule di kode aplikasi, bukan sekadar konfigurasi.
7. **Enforcement pembatasan Manager pada `role_permissions`**: sebelum mengizinkan request `UPDATE` ke tabel `role_permissions`, aplikasi wajib memvalidasi `editable_by_role_code` pada baris target memuat kode role si pengubah — mis. Manager hanya boleh `UPDATE` baris dengan `role_id` = role `agent`; percobaan mengubah baris lain (role Admin/Manager/Superadmin, atau modul `M9_system_config`/`M9_security`) ditolak (403) meski request datang dari akun Manager yang valid.
8. **Role `superadmin` sebagai bypass tunggal**: di level kode aplikasi, cek permission untuk role `superadmin` sebaiknya di-short-circuit (selalu `true`) sebelum melakukan query ke `role_permissions`, agar konsisten dengan business rule "Superadmin tidak dapat dibatasi" tanpa bergantung pada data yang bisa saja tidak lengkap/salah konfigurasi.
9. **Safety guard akun Superadmin terakhir**: tambahkan constraint aplikasi (bukan constraint SQL) yang mencegah `UPDATE`/`DELETE` pada `users` jika hasilnya membuat jumlah user aktif dengan `role_id = (SELECT id FROM roles WHERE code='superadmin')` menjadi 0.
10. **(v1.1 — sudah diselesaikan)** Konsistensi referensi wilayah: `developer_projects.city` (freetext) telah dimigrasi menjadi `city_id` (FK → `ref_cities`), konsisten dengan `listings.city_id`, sehingga data lokasi proyek developer dan listing biasa kini dapat difilter/diagregasi bersama di pencarian tanpa mapping string manual.
11. **Index unik pada kolom `slug`** (`listings.slug`, `developer_projects.slug`, `agent_profiles.public_slug`) wajib dipasang sejak awal karena kolom ini menjadi bagian dari URL publik yang di-crawl mesin pencari — konflik slug harus tertangkap di level database, bukan hanya validasi aplikasi.
12. **Penulisan ke `url_redirects` bersifat wajib, bukan opsional**, setiap kali terjadi perubahan `slug` atau penghapusan permanen entitas yang punya halaman publik — lihat aturan di SEO Specification Bagian 1.2 & 1.4. Disarankan diimplementasikan sebagai database trigger atau hook aplikasi yang tidak bisa dilewati (bukan langkah manual yang bisa terlupa).
13. **(v1.1)** Index tambahan setelah migrasi `developer_projects.city_id`: `developer_projects(city_id, status, property_type)` untuk mendukung filter proyek per lokasi setara listing.
14. **(v1.1)** `agent_reviews.status` **wajib** difilter `= 'approved'` di setiap query publik (halaman profil agen, `aggregateRating` JSON-LD) — query internal moderasi (Admin/Manager/Superadmin) yang boleh melihat status `pending`/`rejected`. Index `agent_reviews(agent_id, status)` direkomendasikan untuk mendukung kedua pola query ini.
15. **(v1.4, baru)** Index non-unique direkomendasikan untuk `listing_photos.file_hash` dan `listing_photos.photo_hash` — mendukung query pembanding saat agen submit listing untuk review (`ADR-047`). Pengecekan duplikat dibatasi ke foto milik listing aktif (`published`/`pending_review`) dengan `agent_id` yang sama saja — tidak lintas agen, untuk menghindari false-positive pada foto proyek Primary yang sah dipakai berulang oleh agen berbeda. Threshold kemiripan final: Hamming Distance = 0 (exact/identik) → blocking; Hamming Distance 1–6 (similarity 90–99%) → non-blocking warning; Hamming Distance > 6 → tidak di-flag. Lihat `OD-25` (Resolved, 8 Agustus 2026) untuk riwayat keputusan lengkap.

---

*Diagram visual (ERD) tersedia di file terpisah `ERD-Diagram.mermaid`. Dokumen ini menjadi acuan untuk implementasi migrasi database pada tahap development.*

---

## CONTROLLED SYNCHRONIZATION NOTICE — STEP 07
**Date:** 16 August 2026  
**AEP source:** AEP #4 Learning Session  
**Cross-AEP dependencies:** Step 05 D1 Commercial/Payment PASS; Step 06 D2 Learning Economy PASS WITH CONTROLLED RESIDUAL  
**Scope:** D3 Learning Session downstream semantic synchronization only.

This is a controlled semantic overlay. It preserves the AEP4 final decision state and does not authorize physical migration, final provider production binding, final RBAC permission IDs, automatic provider failover, or closure of MADCR-049/053/054.

### D3-ERD-01 — Separate semantic Learning Session capability
The downstream model must add/evolve the following logical concepts without repurposing existing M04/M05 authorities:
- Learning Session;
- Session Enrollment;
- Provider Binding;
- Participation Evidence;
- Attendance Evaluation / Outcome;
- Completion Outcome;
- Session Artifact / Recording;
- Workspace / Visibility Context where applicable;
- audit/provenance linkage.

### D3-ERD-02 — Existing entity boundaries
- M04 `enrollments` remains Course Enrollment and is not Session Enrollment.
- M05 `event_registrations` remains Event Registration/RSVP and is not Session Enrollment.
- M05 `events` remains generic Event Calendar context and is not Learning Session authority.
- M04 Certificate remains separate from Title/Award Instance.

### D3-ERD-03 — Canonical lifecycles
Learning Session lifecycle:
`DRAFT → SCHEDULED → LIVE → ENDED`
with `CANCELLED` / `FAILED` exception states.

Session Enrollment lifecycle:
`PENDING → ACTIVE → COMPLETED`.

`COMPLETED` is the enrollment's historical outcome and must not be confused with the Session lifecycle or provider participation.

### D3-ERD-04 — Provider/evidence boundary
Provider Session ID is infrastructure reference, not semantic Learning Session identity.

Provider events must flow:
`Provider Event → Validation/Integrity → Normalization → Idempotency → Correlation → Participation Evidence → Attendance Evaluation → Completion Policy → Learning Activity Handoff`.

### D3-ERD-05 — Cross-AEP authority
- Commercial owns pricing/payment/entitlement; paid access consumes trusted Commercial outcome.
- Learning Economy owns LP transactions; Session cannot directly create official LP.
- Competency/Credential/Awarding remain separate authority.
- RBAC owns authorization.
- Recording is optional artifact/reference, not attendance/completion authority.

### D3-ERD-06 — Controlled open relationships
Exact Session↔Event cardinality, Workspace/Organization cardinality, attendance formula, capacity, visibility taxonomy and physical key/index/cardinality remain downstream/open.
