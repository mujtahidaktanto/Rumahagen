# ARCHITECTURE EVOLUTION PROPOSAL
## Organization Management System & AI Assistant Integration — Platform Web RUMAHAGEN

---

# 1. Document Information

| Field | Value |
|---|---|
| **Name** | Architecture Evolution Proposal — Organization Management System & AI Assistant Integration |
| **Version** | 0.9 (Draft) — direvisi dari 0.8: menambahkan **tombol "Chat Baru"** (wajib, konsekuensi dari riwayat tidak dipersist) + **thread paralel per-provider** (pindah provider tidak reset thread lain) + **label pengingat permanen** di dekat kotak input chat. Lihat Bagian 18.2 poin 12 dan 18.6 |
| **Status** | **Draft — menunggu review & pengesahan Architecture Review Board dan sign-off bisnis.** Belum menggantikan/mengubah dokumen manapun yang sudah Baseline/Approved. Dokumen ini adalah usulan, bukan source of truth. |
| **Owner** | Business Owner / Product Owner (nama TBD) — disusun dengan asistensi AI (Claude) berdasarkan input Business Owner |
| **Tanggal Disusun** | 3 Agustus 2026 |
| **Input Sumber** | (1) Diskusi awal Business Owner dengan ChatGPT — ringkasan akhir (`Workspace_Management_System_Specification_v1_0.docx`); (2) Transkrip lengkap diskusi Business Owner–ChatGPT (proses berpikir penuh, termasuk pertanyaan terbuka & keputusan final); (3) Klarifikasi lanjutan Business Owner atas beberapa open item yang teridentifikasi selama analisis; (4) Diskusi lanjutan Business Owner–Claude soal fitur AI Assistant Integration (Bagian 18) |
| **Purpose** | Menjadi dokumen jembatan antara **keputusan bisnis** (hasil diskusi Business Owner) dan **dokumen governance teknis proyek** yang sudah Baseline/Approved. Dokumen ini **tidak** mengedit dokumen sumber manapun secara langsung — ia mengusulkan perubahan spesifik, dengan draft ADR siap-pakai dan urutan sinkronisasi, untuk direview dan dieksekusi sebagai siklus governance formal (mengikuti pola yang sudah dipakai proyek ini pada siklus ADR-008 dan ADR-018). |
| **Cakupan Perubahan** | Dua inisiatif independen dibundel dalam satu siklus sinkronisasi: **(1) Organization Management System** (Bagian 1-17) — dari *single-agency B2B2C lead-generation platform* menjadi *platform dengan lapisan organisasi (Organization) sebagai unit kolaborasi tim*; **(2) AI Assistant Integration** (Bagian 18) — agen/role internal dapat chat dengan AI assistant pilihan sendiri di dalam SaaS lewat BYOK. Ditambah 3 Lampiran (A/B/C) berisi temuan/perbaikan kecil di luar cakupan keduanya. |

---

## Riwayat Versi

> Tabel ini disusun berdasarkan 9 file yang tersedia (v0.1–v0.9, lengkap — gap v0.1/v0.2/v0.6 dari audit sebelumnya sudah dilengkapi 9 Agustus 2026).

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 0.1 | 3 Agu 2026 | Rilis awal, dengan nama file/entitas **"Workspace Management System"** — sebelum konflik penamaan dengan fitur "Agent Workspace" (reminder personal, `technology-decisions.md`/`CURRENT-PROJECT-STATE.md`) diresolusi. |
| 0.2 | 3 Agu 2026 | Entitas diganti nama dari **"Workspace" → "Organization"** di seluruh dokumen (keputusan Business Owner, lebih familiar secara umum) — menyelesaikan konflik penamaan tanpa perlu mengubah dokumen existing manapun. |
| 0.3 | 3 Agu 2026 | Menambahkan fitur **Join Request** (Agen mencari Organization & mengajukan gabung) sebagai pelengkap dua-arah flow Invite. Reuse skema `organization_invitations` (`initiated_by_type`), cooldown 24 jam, cross-cancellation. |
| 0.4 | 3 Agu 2026 | Menambahkan **Lampiran A** — temuan data gap `listing_leads` vs `POST /leads` (di luar cakupan Organization, dibundel ke paket sinkronisasi akhir). |
| 0.5 | 3 Agu 2026 | Mendetailkan form **Create Organization** — dipecah 2 tahap (form cepat wajib: nama+tipe; branding opsional menyusul di Settings). |
| 0.6 | 3 Agu 2026 | Menambahkan **Lampiran B** — temuan restrukturisasi form Create Listing jadi wizard 6 step (di luar cakupan Organization, tapi berkaitan — 2 entry point Personal & Organization pakai wizard sama). |
| 0.7 | 3 Agu 2026 | Menambahkan **Lampiran C** — konfirmasi pagination berbasis halaman dipertahankan (bukan infinite scroll, demi SEO/ADR-021), opsi sort baru "Relevansi" (memanfaatkan ADR-005). |
| 0.8 | 3 Agu 2026 | **Cakupan dokumen meluas** — menambahkan **Bagian 18 (Modul Baru — AI Assistant Integration)**: BYOK + chat UI custom, draft ADR-028. Judul dokumen berubah jadi "...Organization Management System & AI Assistant Integration". Bagian "Persetujuan" bergeser 18→19. |
| 0.9 | 3 Agu 2026 | Menambahkan tombol **"Chat Baru"** (wajib, konsekuensi riwayat chat tidak dipersist), **thread paralel per-provider**, label pengingat permanen di kotak input chat. **Versi terkini** — basis dokumen final di bawah. |

---

# 2. Executive Summary

Business Owner mengusulkan penambahan **Organization** — entitas organisasi baru yang memungkinkan satu akun Agen bekerja dalam dua konteks: sebagai **Agen Individu**, atau sebagai **Leader/Member** dari sebuah Organization (tim/kantor/komunitas) — tanpa membuat akun kedua. Model ini setara secara konseptual dengan pola *dual-sided identity* yang sudah terbukti (Shopee Customer→Seller, GitHub User→Organization, Slack/Notion personal→Organization).

**Temuan kunci dari analisis:**

1. **Timing strategis optimal.** Proyek saat ini berada di **Pre-Phase 0** — 25 dari 25 ADR teknis sudah *Approved*, namun **0% kode, belum ada database fisik, Sprint S0 belum dieksekusi** (`CURRENT-PROJECT-STATE.md`). Perubahan ini bisa diintegrasikan ke baseline sebelum implementasi dimulai — jauh lebih murah dibanding migrasi pasca-produksi.
2. **Sudah diantisipasi sebagian.** `ADR-023` (Multi-Tenancy Strategy) sudah mencatat kebutuhan ini sebagai *"Proposed — future decision"*; `ADR-006` bahkan secara eksplisit mencatat *"Status resmi fitur Agent Workspace di roadmap ... perlu dikonfirmasi tim produk"* sebagai catatan kondisional terbuka.
3. **Potensi konflik nama sudah diresolusi.** Entitas organisasi baru dinamai **"Organization"** (bukan "Workspace"), sehingga tidak bentrok dengan istilah "Agent Workspace" yang sudah lebih dulu dipakai untuk fitur reminder personal di `technology-decisions.md`/`CURRENT-PROJECT-STATE.md` — lihat Bagian 4.
4. **Setelah klarifikasi Business Owner (chat/CRM dihapus, organization type diseragamkan, split commission dihapus), model bisnis Organization sekarang 100% konsisten dengan prinsip inti platform** (`PROJECT-CONSTITUTION.md` §2 — platform bukan pemroses transaksi properti, murni lead-gen & tooling). Tidak ada lagi perluasan lingkup bisnis yang bertentangan dengan fondasi yang sudah disepakati.
5. Seluruh 5 open item yang sempat teridentifikasi (reconciliation status listing, moderasi organization, label publik, dst.) **sudah tertutup** melalui klarifikasi Business Owner — lihat Bagian 5.

---

# 3. Latar Belakang & Rasionalitas Bisnis

Platform saat ini (`PRD v1.1`, `PROJECT-CONSTITUTION v1.6`) dirancang sebagai PropTech SaaS B2B2C **single-agency**: satu agensi, banyak agen di bawahnya, dengan hierarki role tetap (Superadmin→Manager→Admin→Instructor→Agen). Skema database eksplisit **single-tenant** (`ADR-023`).

Business Owner mengidentifikasi peluang: banyak agen properti independen ingin beroperasi *seolah-olah* punya kantor/tim sendiri — branding sendiri, listing bersama, dashboard performa tim — tanpa harus keluar dari platform atau membuat entitas bisnis terpisah. Fitur ini berpotensi menjadi pembeda kompetitif kuat dibanding CRM agen properti konvensional, sekaligus membuka jalur monetisasi baru (subscription per-Organization) yang selama ini masih terbuka (`OD-11`, model monetisasi belum final).

Diskusi eksplorasi dengan ChatGPT (dua dokumen yang di-upload) menghasilkan model yang matang secara konseptual, kemudian diperkuat lewat proses klarifikasi bersama Claude untuk memastikan konsistensinya dengan arsitektur teknis yang sudah dibangun proyek ini sejak Juli 2026.

---

# 4. ✅ Konflik Penamaan — Sudah Diresolusi (Entitas Baru Dinamai "Organization")

**Temuan awal yang muncul saat analisis:** Istilah **"Agent Workspace"** sudah muncul di dua dokumen teknis yang sudah Approved, merujuk ke konsep yang **sama sekali berbeda** dari entitas organisasi baru yang diusulkan Business Owner:

> `technology-decisions.md` §Job Queue: *"...serta kebutuhan Agent Workspace di masa depan (reminder listing stale, jadwal temu, reminder customer)."*
> `CURRENT-PROJECT-STATE.md`: *"Status resmi fitur Agent Workspace di roadmap (reminder listing >90 hari, jadwal temu, reminder customer) perlu dikonfirmasi tim produk..."*

Konsep "Agent Workspace" yang sudah tercatat di kedua dokumen tersebut adalah **dashboard produktivitas personal** per-agen (todo list, reminder listing stale, jadwal temu, reminder customer) — fitur individual, tidak melibatkan organisasi/tim sama sekali. Kalau istilah "Workspace" tetap dipakai untuk entitas organisasi baru, dua konsep berbeda ini akan bentrok di dokumentasi dan berisiko membingungkan AI Coding Assistant di sesi mendatang.

**Keputusan Business Owner:** entitas organisasi baru dinamai **"Organization"** (bukan "Workspace") — dipilih karena istilahnya lebih familiar secara umum. Dengan keputusan ini, konflik penamaan **selesai secara otomatis**: istilah "Agent Workspace" di `technology-decisions.md` dan `CURRENT-PROJECT-STATE.md` **tidak perlu diubah sama sekali** — kedua dokumen itu tetap merujuk ke fitur reminder personalnya sendiri tanpa persinggungan makna dengan "Organization".

**Dampak ke dokumen ini:** seluruh istilah "Workspace" pada draft sebelumnya (v0.1) — termasuk nama entitas, nama tabel (`workspaces`→`organizations`, `workspace_members`→`organization_members`, `workspace_invitations`→`organization_invitations`), nama kolom (`workspace_id`→`organization_id`, `workspace_type`→`organization_type`), pola URL (`/workspace/[slug]`→`/organization/[slug]`), dan judul ADR — sudah diganti konsisten menjadi "Organization" di revisi 0.2 ini. Konsekuensi baiknya: **dua baris di Bagian 14 (Peta Dampak Dokumen)** yang sebelumnya mengharuskan `technology-decisions.md` dan `CURRENT-PROJECT-STATE.md` direvisi untuk rename istilah lama, **sekarang tidak diperlukan lagi** — kedua dokumen itu keluar dari cakupan perubahan sinkronisasi ini.

---

# 5. Keputusan Bisnis Final (Hasil Klarifikasi)

| # | Keputusan | Sumber |
|---|---|---|
| 1 | Organization adalah **entitas organisasi berdiri sendiri**, bukan role akun. Role akun (`agent`, dst.) tidak berubah. | Diskusi awal, dikonfirmasi final |
| 2 | Ditambahkan dimensi baru **Organization Status**: `Individual`, `Leader`, `Member` — terpisah dari `roles.code` platform yang sudah ada | Diskusi awal, dikonfirmasi final |
| 3 | Satu Agen maksimal **1 Organization** (sebagai Leader atau Member, tidak keduanya, tidak lebih dari satu) | Dikonfirmasi eksplisit, ditolak opsi multi-organization |
| 4 | **Tidak ada Transfer Kepemimpinan.** Leader keluar/menutup Organization → Organization otomatis bubar | Dikonfirmasi eksplisit, menolak saran ChatGPT |
| 5 | Leader **tidak boleh** invite/di-invite Leader lain selagi masih memimpin Organization-nya sendiri — harus bubarkan dulu | Dikonfirmasi eksplisit |
| 6 | Member **keluar tanpa approval** Leader (self-service, tombol langsung) | Dikonfirmasi eksplisit |
| 7 | Invitation punya 6 status: `Pending, Accepted, Rejected, Ignored, Expired, Cancelled` — Reject ≠ Ignore secara semantik | Dikonfirmasi eksplisit |
| 8 | Agen bisa menerima **banyak invite bersamaan** (Waiting Invitation list), pilih salah satu | Dikonfirmasi eksplisit |
| 9 | Join **tidak otomatis** — re-validasi status Individual persis saat Accept ditekan (mencegah race condition) | Dikonfirmasi eksplisit |
| 10 | Listing terpisah: **Personal Listing** vs **Organization Listing**, satu listing = satu baris data (tidak boleh duplikat ID) | Dikonfirmasi eksplisit |
| 11 | **Listing Origin** (`PERSONAL`/`ORGANIZATION`) — immutable, dan **Current Listing State** (lokasi+status saat ini) — mutable | Dikonfirmasi eksplisit |
| 12 | Keluar dari Organization / Organization bubar → listing **tidak pernah hilang**, kembali ke pemilik asal sebagai **Draft Pribadi** (butuh review manual sebelum aktif kembali) | Dikonfirmasi eksplisit |
| 13 | Permission: Leader CRUD penuh Organization Listing; Member CRUD listing miliknya + Read-only listing anggota lain (tanpa akses draft/data internal); Leader hanya **statistik** untuk Personal Listing member (tanpa akses edit/draft) | Dikonfirmasi eksplisit |
| 14 | Organization Activity Log (audit trail) mencatat seluruh aktivitas penting: organization, member, listing, branding, permission — dengan halaman Activity Timeline publik-internal (gaya GitHub) | Dikonfirmasi eksplisit |
| 15 | Organization Dashboard: jumlah member, listing, leads, performa member, top agent | Dikonfirmasi eksplisit |
| 16 | Organization Branding: logo, banner, deskripsi, landing page, website, media sosial, alamat, kontak — halaman publik sendiri `/organization/[slug]` | Dikonfirmasi eksplisit |
| 17 | **Organization Subscription tetap ada** sebagai konsep *future-ready* (kuota member/listing, fitur branding lanjutan, dashboard premium, custom domain, API integration) — saat ini gratis, arsitektur disiapkan agar tidak perlu migrasi besar nanti | Dikonfirmasi eksplisit |
| 18 | **Chat access & CRM access oleh Leader — dihapus dari scope.** Tidak ada modul Chat/CRM yang ditambahkan | ✅ Klarifikasi terbaru |
| 19 | **`organization_type`** (Agency/Kantor/Tim/Komunitas) diseragamkan — murni label kosmetik, tidak ada percabangan logika permission/dashboard/branding per tipe | ✅ Klarifikasi terbaru |
| 20 | **Split Commission — dihapus total.** Platform tidak mencatat/mengatur pembagian komisi transaksi properti dalam bentuk apa pun | ✅ Klarifikasi terbaru |
| 21 | Reconciliation `listings.status` vs `Current Listing State`: **Opsi A dipilih** — pisah jadi 3 kolom independen (`status` tidak berubah + `listing_origin` baru + `listing_context` baru), "Current Listing State" jadi label turunan/computed, bukan kolom fisik | ✅ Klarifikasi terbaru |
| 22 | Moderasi pembuatan Organization: **self-service penuh, tanpa approval Admin**, sekarang maupun jangka panjang. Gating masa depan (jika ada) lewat *poin keaktifan* atau *subscription berbayar*, bukan lewat moderasi manual | ✅ Klarifikasi terbaru |
| 23 | Label nama Organization **tetap ditampilkan** di halaman profil publik agen individu (`/agent/[slug]`), agar publik tahu status agen (Independent/punya Organization/member Organization lain) | ✅ Klarifikasi terbaru |
| 24 | **Fitur baru: Join Request (arah kebalikan dari Invite).** Agen bisa mencari nama Organization dan mengajukan "Minta Gabung" — Leader yang approve/tolak. Melengkapi flow Invite yang sudah ada (Leader→Agen), sekarang ada juga Agen→Leader | ✅ Klarifikasi terbaru (fitur baru) |
| 25 | Join Request **reuse tabel `organization_invitations`** yang sama (bukan tabel terpisah), dibedakan lewat kolom `initiated_by_type` (`leader_invite`/`agent_request`) — satu sumber kebenaran untuk kedua arah | ✅ Klarifikasi terbaru |
| 26 | Simetri hak **Cancel**: pada `leader_invite`, Leader bisa cancel undangannya sendiri; pada `agent_request`, Agen bisa cancel permintaannya sendiri. Hanya inisiator yang boleh cancel, bukan pihak yang merespons | ✅ Klarifikasi terbaru |
| 27 | Race condition re-check (poin 9) **berlaku simetris di kedua arah** — Leader yang meng-Approve `agent_request` juga wajib re-cek status Individual agen persis saat approve ditekan | ✅ Klarifikasi terbaru |
| 28 | Agen boleh punya **banyak `agent_request` pending sekaligus** (ke beberapa Organization) dan **banyak `leader_invite` pending sekaligus** (Waiting Invitation, sudah ada). **Begitu salah satu `agent_request` di-approve** → seluruh `agent_request` pending lain milik agen tsb **otomatis batal**. **`leader_invite` pending dari Leader lain tidak ikut batal** — tetap valid, tapi tidak bisa di-Accept selama agen belum keluar dari Organization saat ini (ditegakkan lewat re-check poin 9/27). Begitu agen keluar & kembali Individual, agen bebas mengajukan `agent_request` baru **atau** meng-Accept `leader_invite` lama yang masih pending | ✅ Klarifikasi terbaru |
| 29 | Organization **tidak pernah auto-accept** Join Request — approval manual Leader wajib di semua kasus, tidak ada pengecualian/toggle | ✅ Klarifikasi terbaru |
| 30 | **Cooldown 24 jam, simetris per arah:** `agent_request` ditolak Leader → agen tidak bisa mengajukan ulang ke Organization yang sama selama 24 jam. `leader_invite` ditolak Agen → Leader tidak bisa mengundang ulang agen yang sama selama 24 jam. Cooldown dihitung per pasangan (organization, agen, arah) — tidak saling memblokir lintas arah | ✅ Klarifikasi terbaru |
| 31 | UI: sisi Agen — halaman gabungan "Waiting Invitation" + "Cari & Ajukan Gabung" di area akun agen sendiri. Sisi Leader — antrian "Permintaan Bergabung Masuk" ditambahkan ke Organization Dashboard, sejajar menu invite member | ✅ Klarifikasi terbaru |
| 32 | Activity Log (poin 14) diperluas dengan kategori baru: *Join request dikirim/disetujui/ditolak/dibatalkan* (manual maupun auto-cancel sistem — dicatat beda actor). Notifikasi baru dua arah: Leader dapat notif ada `agent_request` masuk; Agen dapat notif hasil approve/reject atas `agent_request`-nya | ✅ Klarifikasi terbaru |
| 33 | **Form Create Organization dipecah 2 tahap**: (1) form cepat wajib hanya `organization_name` + `organization_type`, langsung aktif; (2) 7 field branding (logo, banner, deskripsi, website, media sosial, alamat, kontak) opsional, diisi menyusul di Organization Settings kapan saja — konsisten pola `agent_profiles` (data inti dulu, kelengkapan menyusul) | ✅ Klarifikasi terbaru |

---

# 6. Ruang Lingkup Perubahan

### 6.1 Termasuk Dalam Lingkup
- Entitas baru: Organization, Organization Member, Organization Invitation (mencakup dua arah: Leader Invite & Agent Join Request)
- Fitur pencarian nama Organization dari sisi Agen + pengajuan permintaan bergabung (Join Request)
- Dimensi baru: Organization Status (Individual/Leader/Member)
- Perluasan model listing: origin, context, kepemilikan ganda personal/organization
- Halaman publik Organization + dampak SEO
- Organization Dashboard, Branding, Activity Log
- Fondasi subscription (struktur data saja, bukan implementasi payment)
- Permission/RBAC lapisan kedua (organization-scoped), berjalan berdampingan dengan RBAC platform yang sudah ada

### 6.2 Eksplisit Di Luar Lingkup (jangan diimplementasikan)
- ❌ Modul Chat / messaging
- ❌ Akses Lead ke CRM milik Member (follow-up, reminder, notes, deal)
- ❌ Split Commission / pencatatan pembagian komisi transaksi apa pun
- ❌ Transfer kepemimpinan Organization
- ❌ Multi-organization membership per agen
- ❌ Differensiasi fungsi berdasarkan `organization_type`
- ❌ Payment gateway aktif untuk Organization Subscription (tetap `POST /billing/*` placeholder, konsisten `ADR` yang sudah ada)
- ❌ Moderasi/approval Admin untuk pembuatan Organization

---

# 7. Analisis Dampak terhadap Arsitektur Eksisting

| Area | Kondisi Saat Ini | Perubahan Diperlukan | Tingkat Dampak |
|---|---|---|---|
| Multi-Tenancy (`ADR-023`) | Single-tenant implisit, kebutuhan multi-tenant berstatus "Proposed" | **Diaktifkan dalam bentuk lebih ringan** dari yang diantisipasi — bukan `tenant_id` isolasi penuh di seluruh tabel, melainkan `organization_id` sebagai grouping construct pada tabel `listings` saja + RLS scoped. `ADR-023` perlu direvisi statusnya, bukan diaktifkan mentah sesuai asumsi lama. | 🟡 Sedang |
| RBAC (`ADR-024`) | `scope_type` hanya 3 nilai: `all/own/none`, eksplisit menolak "scoped tim/wilayah" | Butuh dimensi otorisasi **baru dan terpisah** (organization-scoped), tidak menyentuh/melanggar aturan `all/own/none` platform yang sudah ada. Perlu ADR baru yang secara eksplisit mengklarifikasi: larangan "scoped tim/wilayah" di ADR-024 berlaku untuk role platform (Manager), bukan untuk lapisan otorisasi Organization yang independen. | 🔴 Tinggi (butuh klarifikasi eksplisit agar tidak dibaca sebagai pelanggaran ADR-024) |
| Skema `listings` | Kolom `status` (7 nilai) sudah dipakai luas — moderasi, SEO, search (`ADR-005`) | Aditif murni (Opsi A, Bagian 5 poin 21) — 2 kolom baru + 1 FK, `status` existing **tidak diubah**. | 🟢 Rendah risiko (by design) |
| Audit/Logging | `audit_logs` sudah ada, berorientasi admin action | Diperluas (tambah `organization_id` nullable, perluas `entity_type`) — bukan tabel baru terpisah, menghindari duplikasi mekanisme logging | 🟢 Rendah |
| SEO (`SEO-Analytics-Spec`) | Structured data untuk `Person`(agen)/listing, `url_redirects` tabel sudah ada | Tambah pola URL `/organization/[slug]`, structured data `Organization`, entri sitemap baru. Infrastruktur redirect sudah tersedia — tinggal diperluas | 🟢 Rendah |
| Model Bisnis Inti (`PROJECT-CONSTITUTION` §2) | Eksplisit: platform bukan pemroses transaksi, murni lead-gen/tooling | **Tidak ada konflik lagi** setelah Split Commission dihapus (Bagian 5 poin 20). Organization Subscription = biaya SaaS, bukan komisi transaksi properti — konsisten prinsip inti | 🟢 Tidak ada konflik |
| Scope 11 Modul PRD | Tidak mencakup Chat/CRM | **Tidak ada modul baru di luar cakupan** setelah Chat/CRM access dihapus (Bagian 5 poin 18) — Organization jadi Modul 12 baru, tapi beroperasi murni di atas domain listing/profil yang sudah ada | 🟢 Blast radius terkendali |
| Penamaan "Agent Workspace" | Sudah dipakai untuk konsep lain (reminder tools personal) | ✅ Resolved — entitas baru dinamai "Organization" (Bagian 4), istilah lama tidak disentuh | 🟢 Tidak ada dampak |
| Notification (`ADR-020`) | Tipe notifikasi existing tidak mencakup invite/membership | Tambah tipe notifikasi baru: invite diterima/ditolak, member join/keluar, organization ditutup — pola yang sudah ada tinggal diperluas | 🟢 Rendah |
| Job Queue (`ADR-006`) | Sudah mengantisipasi *scan terjadwal* untuk fitur lama "Agent Workspace" (reminder) | Tidak ada kebutuhan job queue baru untuk Organization (organisasi) ini — seluruh operasinya *event-driven* langsung (create/invite/join/leave), bukan scan periodik | 🟢 Tidak ada dampak |

---

# 8. Draft Architecture Decision Records

> Format mengikuti konvensi `architecture-decision-records.md` yang sudah berlaku di proyek ini, agar bisa langsung ditransplantasi setelah disetujui Architecture Review Board. Penomoran melanjutkan ADR tertinggi saat ini (**ADR-025**).

---

**ADR-026 — Organization Model Strategy**

**Status:** Proposed (menunggu Architecture Review Board)
**Date:** —
**Owner:** —

**Context:** Business Owner mengusulkan lapisan organisasi baru ("Organization") yang memungkinkan agen bekerja dalam konteks individu maupun tim, tanpa mengubah model akun/role platform yang sudah ada. Kebutuhan ini sebelumnya sudah dicatat sebagai *Future Decision Proposed* di `ADR-023` dan disinggung sebagai catatan kondisional terbuka di `ADR-006`.

**Decision:** Menambahkan 3 entitas baru — `organizations`, `organization_members`, `organization_invitations` — dan dimensi baru `organization_status` (`individual`/`leader`/`member`) pada level akun agen, terpisah dari `roles.code` platform. `organization_invitations` menampung **dua arah inisiasi** dalam satu tabel: Leader mengundang Agen (`leader_invite`), atau Agen mengajukan diri ke Organization (`agent_request`) — lihat detail skema di Bagian 9.3. Listing memperoleh 2 atribut baru: `listing_origin` (immutable) dan `listing_context` (mutable, lihat ADR terkait reconciliation di Bagian 9). Satu agen dibatasi maksimal 1 keanggotaan Organization aktif. Tidak ada mekanisme transfer kepemimpinan — Organization melekat pada Leader-nya, bubar otomatis saat Leader keluar/menutup.

**Alternatives Considered:**
- *Multi-tenant penuh dengan `tenant_id` di seluruh tabel inti* (sesuai bayangan awal `ADR-023`) — ditolak, karena kebutuhan aktual adalah grouping/organisasi dalam satu database bersama, bukan isolasi data antar-tenant untuk white-labeling.
- *Organization sebagai role baru* (bukan entitas terpisah) — ditolak Business Owner sejak awal, karena mencampur konsep "siapa Anda" (role) dengan "Anda bekerja sebagai apa saat ini" (status organisasi).
- *Multi-organization membership per agen* — ditolak eksplisit, demi kesederhanaan model data dan menghindari ambiguitas "listing/CRM/dashboard mana" yang relevan.
- *Fitur Transfer Kepemimpinan Organization* — ditolak eksplisit oleh Business Owner; Organization yang Leader-nya keluar langsung bubar, bukan dialihkan.
- *Tabel terpisah untuk Join Request* (`organization_join_requests`, di luar `organization_invitations`) — ditolak; akan menduplikasi state machine status/expiry/race-condition-check yang sudah ada, berisiko drift antara dua tabel yang seharusnya berbagi satu sumber kebenaran.
- *Auto-accept Join Request tanpa approval Leader* — ditolak eksplisit; approval manual Leader wajib di semua kasus, tanpa toggle/pengecualian.

**Pros:** Model data tetap sederhana (1 agen = maksimal 1 Organization); tidak ada kehilangan data (listing selalu kembali ke pemilik asal); konsisten dengan prinsip "business logic terpisah dari role akun" yang sudah dipakai proyek ini di `ADR-024`.

**Cons:** Menambah kompleksitas skema (3 tabel baru + FK baru di `listings`); RLS policy perlu diperluas untuk mencakup akses berbasis `organization_id`.

**Impact:** `ERD-Skema-Database` (tabel baru + modifikasi `listings`/`audit_logs`), `PRD` (Modul 12 baru), `API-Specification` (endpoint group `/organizations/*`), `User-Flow` (flow baru), `SEO-Analytics-Specification` (URL pattern baru), `SYSTEM-ARCHITECTURE` §5 (Module Architecture), §24 (ADR Cross-Reference Matrix).

**Affected Documents:** Lihat Bagian 12 (Impact Matrix) dokumen ini.

**Dependencies:** Merevisi status `ADR-023` (Multi-Tenancy Strategy). Berkaitan dengan `ADR-027` (Organization-Scoped Authorization).

**Review Date:** Jika kebutuhan multi-organization-membership atau white-labeling penuh dikonfirmasi eksplisit di masa depan (akan memerlukan ADR baru yang men-supersede sebagian ADR ini).

**Notes:** ADR ini **tidak** mengaktifkan skenario multi-tenant klasik yang dibayangkan `ADR-023` (isolasi `tenant_id` di seluruh tabel). Ini model yang lebih ringan — grouping construct dalam database bersama. `ADR-023` perlu direvisi eksplisit untuk mencerminkan perbedaan ini, bukan ditandai "diaktifkan" begitu saja.

---

**ADR-027 — Organization-Scoped Authorization Strategy**

**Status:** Proposed (menunggu Architecture Review Board)
**Date:** —
**Owner:** —

**Context:** `ADR-024` mengunci `permissions.scope_type` hanya pada 3 nilai (`all`/`own`/`none`) dan secara eksplisit **menolak** level "scoped tim/wilayah" — dirancang khusus untuk menjaga akses Manager selalu global tanpa pengecualian. Kebutuhan Organization memperkenalkan otorisasi berbasis kelompok (Leader CRUD penuh listing Organization-nya, Member CRUD milik sendiri + Read anggota lain) yang **secara literal terlihat seperti** "scoped tim" yang dilarang ADR-024.

**Decision:** Otorisasi Organization **tidak** mengubah atau memperluas `permissions`/`role_permissions`/`scope_type` yang sudah ada — sistem itu tetap murni mengatur role platform (superadmin/manager/admin/instructor/agent/dst.) dan **tetap tidak punya pengecualian tim/wilayah**, persis seperti yang dikunci `ADR-024`. Otorisasi Organization dibangun sebagai **lapisan kedua yang independen**, dievaluasi setelah gate role platform lolos: middleware mengecek `organization_members.role` (Leader/Member) + `organization_members.organization_id` terhadap `listings.organization_id` untuk menentukan hak CRUD pada Organization Listing. Dua sistem otorisasi ini berjalan paralel, tidak saling menggantikan.

**Alternatives Considered:**
- *Menambah nilai `scope_type` keempat* (mis. `organization`) ke tabel `permissions` yang sudah ada — ditolak, karena akan membuat `ADR-024` secara harfiah tidak konsisten dengan implementasinya sendiri (dokumen itu eksplisit bilang hanya 3 nilai valid), dan berisiko district ambigu dengan larangan "scoped Manager" yang justru ingin dihindari.
- *Menyimpan role Organization di tabel `roles` yang sama dengan role platform* — ditolak, karena `roles.is_system_role`/`is_protected` dirancang untuk role platform, bukan role kontekstual yang berubah-ubah per Organization.

**Pros:** `ADR-024` tetap berlaku 100% tanpa perlu direvisi isinya — larangan "scoped tim/wilayah" untuk Manager tetap tegak; Organization punya aturan otorisasinya sendiri yang bersih tanpa mencemari sistem RBAC platform inti.

**Cons:** Middleware butuh dua tahap pengecekan (role platform → role Organization) alih-alih satu; sedikit tambahan kompleksitas di layer otorisasi.

**Impact:** `SYSTEM-ARCHITECTURE` §8 (Authentication & Authorization Architecture); middleware RBAC di implementasi (saat Sprint S0/S1 berjalan).

**Affected Documents:** `architecture-decision-records.md` (ADR baru, tidak mengedit ADR-024), `SYSTEM-ARCHITECTURE.md` §8.

**Dependencies:** `ADR-024` (RBAC Role Model Scope), `ADR-026` (Organization Model Strategy).

**Review Date:** Jika role Organization kustom (di luar Leader/Member) dibutuhkan di masa depan.

**Notes:** ADR ini secara eksplisit **bukan amandemen** terhadap `ADR-024` — melainkan konfirmasi bahwa `ADR-024` tetap berlaku utuh, dan otorisasi Organization adalah sistem terpisah yang tidak bersinggungan dengannya.

---

**Revisi Status ADR-023 (Multi-Tenancy Strategy) — Diusulkan**

Status saat ini: *"Approved (implisit) — evaluasi masa depan berstatus Proposed."*
Status diusulkan: *"Approved (implisit, cakupan awal) — Diaktifkan sebagian melalui ADR-026 dalam bentuk lebih ringan dari skenario tenant_id penuh yang diantisipasi semula. Skenario multi-tenant klasik (isolasi penuh/white-label) tetap berstatus Proposed untuk future decision terpisah."*

Catatan tambahan yang perlu ditambahkan ke bagian **Notes** ADR-023: menjelaskan bahwa `organization_id` yang diperkenalkan `ADR-026` adalah grouping construct dalam database bersama, bukan implementasi `tenant_id` yang tadinya dibayangkan ADR ini (isolasi data lintas agensi/white-label). Kebutuhan multi-tenant klasik (jika suatu saat platform ini di-white-label ke banyak agensi terpisah dengan branding masing-masing di level yang lebih tinggi dari Organization) tetap menjadi keputusan terbuka yang berbeda.

---

# 9. Perubahan Skema Database (ERD Delta)

### 9.1 Tabel Baru: `organizations`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_name | VARCHAR(150) | NOT NULL | |
| slug | VARCHAR(170) | UNIQUE, NOT NULL | Untuk URL publik `/organization/[slug]`, konvensi sama dengan `agent_profiles.public_slug` |
| organization_type | ENUM | NOT NULL | `agency`, `kantor`, `tim`, `komunitas` — **murni label, tidak ada logika bisnis berbeda per nilai** (Bagian 5 poin 19) |
| logo_url | VARCHAR(500) | NULLABLE | |
| banner_url | VARCHAR(500) | NULLABLE | |
| description | TEXT | NULLABLE | |
| website | VARCHAR(255) | NULLABLE | |
| social_media | JSON | NULLABLE | |
| address | VARCHAR(500) | NULLABLE | |
| contact_phone | VARCHAR(20) | NULLABLE | |
| created_by | UUID/BIGINT | FK → users.id, NOT NULL | Leader pembuat |
| status | ENUM | NOT NULL, default `active` | `active`, `closed`, `deleted` — **tidak ada `pending_review`/`rejected`** karena self-service tanpa moderasi (Bagian 5 poin 22) |
| created_at / updated_at | TIMESTAMP | | |

**Rincian Form Create Organization (menjawab Bagian 5 poin 22 — self-service instan):**

| Field | Wajib di Form Create? | Tipe Input | Catatan |
|---|---|---|---|
| `organization_name` | ✅ Wajib | Text | Dasar auto-generate `slug`, mengikuti pola `listings.slug` (auto dari nama + short ID, bukan diketik manual) |
| `organization_type` | ✅ Wajib | Dropdown/Select | 4 pilihan (Agency/Kantor/Tim/Komunitas), murni label (Bagian 5 poin 19) |
| `logo_url` | ⬜ Opsional | Upload gambar | Diisi menyusul di Organization Settings |
| `banner_url` | ⬜ Opsional | Upload gambar | idem |
| `description` | ⬜ Opsional | Textarea | idem |
| `website` | ⬜ Opsional | URL | idem |
| `social_media` | ⬜ Opsional | Beberapa input per platform (bukan textarea JSON mentah), diserialisasi ke kolom `social_media` | idem |
| `address` | ⬜ Opsional | Text | idem |
| `contact_phone` | ⬜ Opsional | Phone | idem |
| `slug`, `created_by`, `status`, `created_at`/`updated_at` | — | Tidak ditampilkan di form | Diisi otomatis sistem |

**Rekomendasi UX — form dipecah 2 tahap** (menghindari form berat untuk aksi yang seharusnya instan, konsisten pola produk sejenis — GitHub Organization/Slack Workspace: cukup nama saat create, branding menyusul):
1. **Form Create (2 field):** `organization_name` + `organization_type` → submit → agen langsung jadi Leader, Organization langsung `active`.
2. **Organization Settings/Branding (post-creation, kapan saja, halaman terpisah):** 7 field opsional sisanya (logo, banner, deskripsi, website, media sosial, alamat, kontak).

Pola ini konsisten dengan `agent_profiles`: data inti diisi saat registrasi, kelengkapan profil menyusul.

**Prasyarat akses form** (bukan field, gate sebelum form ditampilkan — Bagian 5 poin 3): tombol "Buat Organization" hanya aktif untuk agen berstatus `organization_status = individual`.

### 9.2 Tabel Baru: `organization_members`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_id | UUID/BIGINT | FK → organizations.id, NOT NULL | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | |
| role | ENUM | NOT NULL | `leader`, `member` |
| status | ENUM | NOT NULL, default `active` | `active`, `left`, `removed` |
| joined_at | TIMESTAMP | NOT NULL | |
| left_at | TIMESTAMP | NULLABLE | |
| UNIQUE | (agent_id) WHERE status='active' | | **Constraint kunci** — menegakkan aturan "1 agen maksimal 1 Organization aktif" di level database, bukan hanya validasi aplikasi |

### 9.3 Tabel Baru: `organization_invitations` (mendukung 2 arah inisiasi — direvisi)

> **Catatan desain (menjawab Bagian 5 poin 25):** Tabel ini **di-reuse** untuk dua arah — Leader mengundang Agen (Invite), dan Agen mengajukan diri ke Organization (Join Request) — agar state machine status/expiry/race-condition tidak terduplikasi ke dua tabel. Untuk menghindari ambiguitas field seperti di draft v0.1/v0.2 (`invited_by`/`invited_agent_id` yang maknanya bisa tertukar tergantung arah), field di bawah **selalu punya makna tetap** terlepas dari arah inisiasi:

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| organization_id | UUID/BIGINT | FK → organizations.id, NOT NULL | |
| agent_id | UUID/BIGINT | FK → users.id, NOT NULL | **Selalu** agen yang menjadi subjek keanggotaan — baik yang diundang maupun yang mengajukan diri |
| leader_id | UUID/BIGINT | FK → users.id, NOT NULL | **Selalu** Leader Organization terkait — baik yang mengundang maupun yang akan approve/tolak |
| initiated_by_type | ENUM | NOT NULL | `leader_invite` (Leader memulai) atau `agent_request` (Agen memulai) — **field kunci yang menentukan siapa berperan sebagai apa** |
| status | ENUM | NOT NULL, default `pending` | `pending`, `accepted`, `rejected`, `ignored`, `expired`, `cancelled` |
| responded_at | TIMESTAMP | NULLABLE | |
| expires_at | TIMESTAMP | NULLABLE | Mendukung transisi otomatis ke `expired` (job queue existing `ADR-006`, scan berkala) |
| created_at | TIMESTAMP | NOT NULL | |

**Aturan aksi per `initiated_by_type` (ditegakkan di level aplikasi/middleware, bukan di skema):**

| Arah | Siapa membuat baris | Siapa boleh Accept/Approve, Reject, Ignore | Siapa boleh Cancel |
|---|---|---|---|
| `leader_invite` | Leader (`leader_id` = pembuat) | **Agen** (`agent_id`) — Accept/Reject/Ignore | **Leader** (`leader_id`, inisiator) |
| `agent_request` | Agen (`agent_id` = pembuat) | **Leader** (`leader_id`) — Approve(=`accepted`)/Reject | **Agen** (`agent_id`, inisiator) |

> Prinsip umum: **hanya inisiator yang boleh Cancel**; **hanya pihak lawan (counterparty) yang boleh merespons** (Accept/Approve/Reject/Ignore). "Accept" dan "Approve" adalah label UI berbeda untuk transisi status yang sama (`pending`→`accepted`) — tidak perlu nilai enum terpisah.

**Race condition re-check (Bagian 5 poin 27):** berlaku simetris — baik saat Agen menekan Accept pada `leader_invite`, maupun saat Leader menekan Approve pada `agent_request`, sistem wajib re-cek `organization_members` (status Individual agen) tepat sebelum transisi ke `accepted` dieksekusi.

**Cross-cancellation saat approval (Bagian 5 poin 28):** saat sebuah baris `agent_request` bertransisi ke `accepted` (agen resmi menjadi Member), sistem wajib **otomatis membatalkan** (`status → cancelled`) seluruh baris `agent_request` lain milik `agent_id` yang sama berstatus `pending` — karena itu representasi upaya aktif agen yang sudah tidak relevan. **Baris `leader_invite` pending dari Leader lain tidak disentuh** — tetap `pending`, agar bisa di-Accept nanti jika agen kembali `Individual`. Auto-cancel ini dicatat di Activity Log dengan actor sistem, bukan dianggap tindakan manual agen (lihat Bagian 5 poin 32 di bawah).

**Cooldown 24 jam (Bagian 5 poin 30):** sebelum meng-`INSERT` baris baru, aplikasi wajib mengecek apakah ada baris `rejected` untuk pasangan **(organization_id, agent_id, initiated_by_type)** yang sama dengan `responded_at` dalam 24 jam terakhir — jika ada, tolak pembuatan baru dengan pesan cooldown. Cooldown **scoped per arah**: penolakan `agent_request` tidak memblokir `leader_invite` ke pasangan yang sama, dan sebaliknya. Cooldown hanya berlaku untuk status `rejected` — **tidak** untuk `ignored`/`expired` (keduanya secara semantik bukan penolakan aktif, konsisten dengan pembedaan Reject≠Ignore di Bagian 5 poin 7).

**UNIQUE constraint yang disarankan:** `(organization_id, agent_id, initiated_by_type) WHERE status='pending'` — mencegah duplikat baris pending di pasangan+arah yang sama (mis. agen tidak bisa mengajukan `agent_request` dua kali ke Organization yang sama sebelum yang pertama direspons/dibatalkan).

### 9.4 Modifikasi Tabel: `listings` (aditif, `status` existing tidak diubah)

| Field Baru | Tipe | Constraint | Keterangan |
|---|---|---|---|
| listing_origin | ENUM | NOT NULL, default `personal` | `personal`, `organization` — **immutable setelah create** (ditegakkan di level aplikasi, bukan constraint DB karena tidak ada trigger yang mencegah UPDATE kolom spesifik secara native) |
| listing_context | ENUM | NOT NULL, default `personal` | `personal`, `organization` — **mutable**, berubah setiap kali listing berpindah |
| organization_id | UUID/BIGINT | FK → organizations.id, NULLABLE | Diisi hanya saat `listing_context='organization'`; di-NULL-kan kembali saat kembali `personal` |

> **Catatan implementasi (Opsi A, Bagian 5 poin 21):** "Current Listing State" dari spec asli **bukan kolom fisik** — dihitung saat render dari kombinasi `listing_context` + `status`:
> `personal`+`draft/pending_review` → *Personal Draft* · `personal`+`published` → *Personal Active* · `organization`+`draft/pending_review` → *Organization Draft* · `organization`+`published` → *Organization Active* · `status='archived'` (nilai baru) → *Archived*, lintas context.
> Nilai baru `archived` perlu ditambahkan ke enum `listings.status` yang sudah ada — satu-satunya perubahan pada kolom existing.

**Constraint tambahan:** UNIQUE index gabungan yang memastikan satu listing tidak pernah punya dua baris (menegakkan aturan Bagian 5 poin 10) — cukup ditegakkan lewat PK `id` yang sudah unik per definisi; perlu dipastikan tidak ada jalur kode yang meng-`INSERT` baris baru saat listing "pindah" konteks (harus selalu `UPDATE` baris yang sama).

### 9.5 Modifikasi Tabel: `audit_logs` (perluasan, bukan tabel baru)

| Field Baru | Tipe | Constraint | Keterangan |
|---|---|---|---|
| organization_id | UUID/BIGINT | FK → organizations.id, NULLABLE | NULL untuk audit log platform biasa; terisi untuk aktivitas Organization |

`entity_type` yang sudah ada diperluas mencakup nilai baru: `organization`, `organization_member`, `organization_invitation`. Halaman "Activity Timeline" (Bagian 5 poin 14) adalah view/query terhadap `audit_logs WHERE organization_id = ...`, bukan tabel terpisah.

### 9.6 Tidak Ada Perubahan Skema: `agent_profiles`

Label Organization di halaman publik agen (Bagian 5 poin 23) **tidak butuh kolom baru** — cukup di-join dari `organization_members` (cari baris `status='active'` untuk `agent_id` tsb) saat generate response API. Perubahan terjadi di layer API/response composition, bukan di skema.

---

# 10. Dampak API Specification (Ringkasan Endpoint Baru)

Endpoint group baru `/organizations/*`, mengikuti konvensi REST yang sudah dipakai (`ADR-012`):

- `POST /organizations` — buat Organization (hanya untuk agen berstatus `individual`; payload minimal `organization_name` + `organization_type`, sesuai form Create tahap 1 — Bagian 9.1)
- `GET /organizations/{slug}` — halaman publik Organization
- `PATCH /organizations/{id}` — update branding/info (Leader only)
- `POST /organizations/{id}/close` — tutup Organization (Leader only, memicu proses bubar)
- `POST /organizations/{id}/invitations` — kirim invite, `initiated_by_type='leader_invite'` (Leader only)
- `GET /organizations/search?q=` — **baru**, pencarian nama Organization untuk fitur "Cari & Ajukan Gabung" (hanya mengembalikan Organization berstatus `active`, hanya bisa diakses agen berstatus `individual`)
- `POST /organizations/{id}/join-requests` — **baru**, ajukan permintaan gabung, `initiated_by_type='agent_request'` (Agen berstatus `individual` only; ditolak jika masih dalam cooldown 24 jam ke Organization tsb — Bagian 5 poin 30)
- `GET /agents/me/invitations` — daftar waiting invitation milik agen (kedua arah — filter via `initiated_by_type` di response)
- `GET /organizations/{id}/join-requests` — **baru**, antrian permintaan gabung masuk (Leader only)
- `POST /invitations/{id}/accept` | `/reject` | `/ignore` — respons invite oleh Agen (dengan re-validasi status di Bagian 5 poin 9)
- `POST /join-requests/{id}/approve` | `/reject` — respons Join Request oleh Leader (dengan re-validasi status di Bagian 5 poin 27) — secara internal memakai endpoint/transisi status yang sama dengan Accept/Reject di atas, hanya beda label & pihak yang berwenang
- `POST /invitations/{id}/cancel` — batalkan (inisiator only: Leader untuk `leader_invite`, Agen untuk `agent_request`)
- `POST /organizations/{id}/members/{agentId}/remove` — kick member (Leader only)
- `POST /organization-members/me/leave` — keluar (self-service, agen sendiri)
- `GET /organizations/{id}/dashboard` — statistik Organization
- `GET /organizations/{id}/activity-log` — Activity Timeline
- `PATCH /listings/{id}/move-to-organization` | `/move-to-personal` — pindah konteks listing

Perlu ditambahkan juga field baru di response `GET /agents/{slug}` (Bagian 9.6) dan `GET /listings/{slug}` (menyertakan `listing_origin`/`listing_context`).

---

# 11. Dampak User Flow

Flow baru yang perlu ditambahkan ke `User-Flow-RUMAHAGEN.md`:
1. **Create Organization** (dari status Individual) — form 2 tahap: (a) Create cepat (nama + tipe, langsung aktif jadi Leader), (b) Lengkapi Branding di Organization Settings (opsional, kapan saja) — rincian field di Bagian 9.1
2. Invite Member (dari sisi Leader)
3. Respond to Invitation (Accept/Reject/Ignore, dari sisi Agen calon member) — termasuk skenario race condition (Bagian 5 poin 9)
4. **Search Organization & Send Join Request** (dari sisi Agen, status Individual) — cari nama Organization, tekan "Ajukan Gabung", cek cooldown 24 jam sebelum submit (Bagian 5 poin 30)
5. **Respond to Join Request** (Approve/Reject, dari sisi Leader) — termasuk re-validasi status Individual agen pengaju persis saat Approve ditekan (Bagian 5 poin 27), dan efek cross-cancellation ke `agent_request` lain milik agen yang sama (Bagian 5 poin 28)
6. **Cancel** (dari sisi inisiator — Leader untuk invite yang dikirim, Agen untuk join request yang diajukan)
7. Leave Organization (self-service, dari sisi Member)
8. Close/Dissolve Organization (dari sisi Leader) — termasuk skenario seluruh listing member kembali jadi draft
9. Move Listing (Personal ↔ Organization)
10. View Organization Public Page & Activity Timeline (visitor/publik)

*(Detail step-by-step masing-masing flow sudah disampaikan pada tahap diskusi sebelumnya dan bisa langsung ditransplantasi ke format `User-Flow.md` yang berlaku.)*

---

# 12. Dampak SEO & Analytics

- Pola URL baru `/organization/[slug]`, terdaftar di sitemap (perluasan mekanisme existing di `SEO-Analytics-Specification` §1)
- Structured data baru: schema.org `Organization` untuk halaman Organization (saat ini baru ada `Person`/listing schema)
- `agent_profiles` publik: tambahan properti `worksFor`/afiliasi organisasi jika agen tergabung Organization (Bagian 5 poin 23)
- `url_redirects` (tabel existing, Modul 11) dipakai ulang untuk menangani perubahan `organizations.slug`

---

# 13. Dampak PRD — Modul Baru

Diusulkan **Modul 12: Organization Management**, ditambahkan ke daftar 11 modul existing di `PRD` §1 dan `SYSTEM-ARCHITECTURE` §1 (Ruang Lingkup Sistem). Deskripsi ringkas: *"Memungkinkan agen membentuk/bergabung organisasi (Organization) untuk kolaborasi listing bersama, branding tim, dan dashboard performa kolektif — tanpa mengubah model kepemilikan aset listing individual."*

Bagian 2 (Business Domain) PRD perlu tambahan kalimat eksplisit menegaskan: *"Fitur Organization tidak memperkenalkan pemrosesan transaksi/komisi apa pun — tetap konsisten dengan prinsip platform sebagai lead-generation & tooling, bukan payment processor."* — mengunci interpretasi ini secara permanen di dokumen sumber, mengantisipasi usulan serupa (split commission) muncul kembali di masa depan.

---

# 14. Peta Dampak Dokumen & Urutan Sinkronisasi

Mengikuti pola siklus sinkronisasi yang sudah dipakai proyek ini (lihat Document Version Matrix siklus ADR-008/ADR-018 di `project-manifest.md`). **Perbedaan penting:** siklus-siklus sebelumnya tidak pernah menyentuh PRD/ERD/API Spec/User Flow/SEO Spec (selalu tercatat "tidak berubah"). Siklus ini akan jadi **yang pertama** mengubah dokumen requirement bisnis tersebut — bobot review-nya perlu setingkat sign-off bisnis, bukan hanya Architecture Review Board teknis.

| Urutan | Dokumen | Versi Saat Ini | Jenis Perubahan | Versi Diusulkan |
|---|---|---|---|---|
| 1 | `PROJECT-CONSTITUTION.md` | 1.6 | MINOR — prinsip bisnis baru §2, Riwayat Keputusan Arsitektur baris baru | 1.7 |
| 2 | `PRD-RUMAHAGEN.md` | 1.1 | **MINOR/business** — Modul 12 (Organization) & **Modul 13 (AI Assistant Integration, Bagian 18) baru**, §2 & §3 diperluas; **dibundel** restrukturisasi form §3.2 jadi wizard 6 step (Lampiran B) dan tambahan opsi sort "Relevansi" di §3.4 (Lampiran C) | 1.2 |
| 3 | `architecture-decision-records.md` | 1.0 (Draft) | Tambah ADR-026, ADR-027, **ADR-028**; revisi status ADR-023 | 1.0 (isi bertambah) |
| 4 | `ERD-Skema-Database.md` + `.mermaid` | 1.1 | **MINOR** — 3 tabel baru + modifikasi `listings`/`audit_logs` (Organization), **2 tabel baru** `ai_providers`/`agent_ai_connections` (Bagian 18.4); **dibundel sekaligus** perbaikan `listing_leads` (Lampiran A) | 1.2 |
| 5 | `API-Specification.md` | 1.1 | **MINOR** — endpoint group `/organizations/*` dan **`/ai-assistant/*`** (Bagian 18.5); **dibundel** tambahan `sort=relevance` di endpoint search listing (Lampiran C) | 1.2 |
| 6 | `User-Flow.md` | 1.1 | **MINOR** — 7 flow Organization baru + **wizard koneksi AI Assistant** (Bagian 18.6); **dibundel** flow "Create Listing" direstrukturisasi jadi wizard 6 step (Lampiran B) | 1.2 |
| 7 | `SEO-Analytics-Specification.md` | 1.1 | **MINOR** — URL pattern + structured data baru (Organization only — AI Assistant tidak berdampak SEO, halaman privat authenticated) | 1.2 |
| 8 | `SYSTEM-ARCHITECTURE.md` | 1.5 | MINOR — §5 Module Architecture, §8 Authorization, §20 Future Architecture (Multi-Tenant), §24 ADR Cross-Reference Matrix (Organization); **§8 Security** (pola enkripsi API key) & **§13 Notification** (Bagian 18.8, AI Assistant); **dibundel** §9 Sorting `relevance` (Lampiran C) | 1.6 |
| 9 | `technology-decisions.md` | 1.5 | MINOR — catat keputusan RLS pattern Organization, **dan pemilihan 4 provider AI Assistant** (Bagian 18.8). **Tidak perlu rename istilah "Agent Workspace" lama** (konflik selesai lewat penamaan entitas baru, Bagian 4) | 1.6 |
| 10 | `dependency-manifest.md` | 1.5 | Kemungkinan tidak berubah (tidak ada dependency baru teridentifikasi) | 1.5 (tidak berubah) atau 1.6 jika ada tambahan saat implementasi |
| 11 | `development-playbook.md` | 1.5 | MINOR — reading order menyertakan Modul 12 | 1.6 |
| 12 | `CURRENT-PROJECT-STATE.md` | 0.1 | Update snapshot — catat Modul 12 (Organization Management) sebagai rencana. **Tidak perlu rename istilah "Agent Workspace" lama** | 0.1 (snapshot baru) |
| 13 | `decision-log.md` | 1.0 (42 entri) | Tambah entri **ADR-043** (cross-ref ADR-026), **ADR-044** (cross-ref ADR-027) | 1.0 (44 entri) |
| 14 | `CHANGELOG.md` | rilis 0.1.5 | **Disarankan MINOR bump** (0.1.5 → **0.2.0**), bukan PATCH seperti siklus sebelumnya — karena ini genuine scope addition pertama, bukan sekadar resolusi ADR teknis | 0.2.0 |
| 15 | `document-governance-baseline-register.md` | 1.0 (Draft) | Update Baseline Register, tambah Document Version Matrix siklus ini | 1.0 (isi disinkronkan) |
| 16 | `project-manifest.md` | 1.4 | MINOR — sinkronisasi menyeluruh siklus ini | 1.5 |

---

# 15. Asumsi & Open Item

| # | Item | Asumsi yang Dipakai Dokumen Ini | Perlu Konfirmasi? |
|---|---|---|---|
| 1 | Immutability `listing_origin` di level DB | Ditegakkan aplikasi, bukan DB constraint (Postgres tidak native mendukung "immutable column" tanpa trigger custom) | 🟡 Bisa dikonfirmasi saat technical spec — opsional tambah trigger `BEFORE UPDATE` yang menolak perubahan kolom ini jika ingin proteksi di level DB |
| 2 | Maksimum member Organization | Unlimited untuk saat ini (Bagian 5), disimpan sebagai `system_configs` agar configurable | Tidak perlu, sudah final |
| 3 | Siapa yang bayar Organization Subscription | Organization/Leader yang bertanggung jawab; member tetap gratis (Bagian 5 poin 17) | Tidak perlu, sudah final |
| 4 | Apakah `listings.status='archived'` (nilai baru) berlaku juga untuk listing yang tidak pernah masuk Organization | Diasumsikan ya — nilai baru ini generik, tidak eksklusif untuk konteks Organization | 🟡 Perlu konfirmasi kecil saat ERD final |

> Item "penamaan entitas baru" yang sebelumnya tercatat di tabel ini (draft v0.1) sudah **selesai** — Business Owner memutuskan nama "Organization", lihat Bagian 4.

---

# 16. Alternatif yang Ditolak (Dicatat agar Tidak Diusulkan Ulang)

Mengikuti konvensi `Alternatives Considered` di ADR proyek ini — didokumentasikan eksplisit di sini agar keputusan yang sudah final tidak diusulkan ulang tanpa konteks di sesi mendatang:

- ❌ Transfer Kepemimpinan Organization — ditolak, Organization bubar saat Leader keluar
- ❌ Multi-organization membership per agen — ditolak, maksimal 1 per agen
- ❌ Split Commission dalam bentuk apa pun — ditolak total, di luar lingkup bisnis platform
- ❌ Chat & akses CRM oleh Leader terhadap data Member — ditolak, di luar lingkup modul
- ❌ Diferensiasi fungsi berdasarkan `organization_type` — ditolak, murni label
- ❌ Moderasi/approval Admin untuk pembuatan Organization — ditolak, self-service permanen
- ❌ Multi-tenancy klasik dengan `tenant_id` di seluruh tabel (skenario asli `ADR-023`) — ditolak untuk cakupan ini, diganti model `organization_id` yang lebih ringan
- ❌ Tabel terpisah untuk Join Request (`organization_join_requests`) — ditolak, di-reuse ke `organization_invitations` yang sama (Bagian 5 poin 25)
- ❌ Auto-accept Join Request tanpa approval Leader (toggle opt-out per Organization) — ditolak total, approval manual Leader wajib di semua kasus (Bagian 5 poin 29)
- ❌ Cross-cancellation `leader_invite` pending saat sebuah `agent_request` di-approve — ditolak; hanya `agent_request` lain yang ikut batal, `leader_invite` dari Leader lain tetap valid (Bagian 5 poin 28)

---

# 17. Rekomendasi Langkah Berikutnya

1. Dokumen ini diajukan ke sesi **Architecture Review Board** (pola yang sama dipakai untuk ADR-001/005/006/008/018) untuk mengesahkan ADR-026, ADR-027, dan **ADR-028** dari status *Proposed* menjadi *Approved*.
2. Setelah disahkan, eksekusi urutan sinkronisasi Bagian 14 — **secara berurutan**, karena setiap dokumen di rantai bergantung pada dokumen sebelumnya (persis prinsip `document-governance-baseline-register.md` §2 Traceability yang sudah berlaku).
3. Update `document-governance-baseline-register.md` dan `project-manifest.md` sebagai penutup siklus, dengan Document Version Matrix baru mencatat siklus ini (referensi: "Siklus Organization Management System & AI Assistant Integration", analog siklus ADR-008/ADR-018 sebelumnya).
4. Karena proyek masih Pre-Phase 0, seluruh perubahan ini bisa masuk baseline **sebelum** Sprint S0 dieksekusi — tidak ada migrasi data produksi yang perlu ditangani.
5. **Urutan eksekusi sesuai preferensi Business Owner:** siklus governance (Open Decision → ADR-026/ADR-027/**ADR-028** → `technology-decisions.md` → Engineering Guidelines → `development-playbook.md` → `decision-log.md` → `CHANGELOG.md` → `CURRENT-PROJECT-STATE.md` → `document-governance-baseline-register.md` → `project-manifest.md`) dituntaskan **lebih dulu, sampai selesai penuh**. Baru setelah itu satu paket terakhir dieksekusi bersamaan: `ERD-Skema-Database.md`, `API-Specification.md`, Database Schema (implementasi fisik saat Sprint S0), `User-Flow.md`, `PRD.md`, `SEO-Analytics-Specification.md`. **Lampiran A** (temuan `listing_leads`), **Lampiran B** (wizard Create Listing), dan **Lampiran C** (sorting relevansi & konfirmasi pagination) — ketiganya di luar cakupan Organization — ikut dibundel ke paket ERD/API/User-Flow/PRD/System Architecture terakhir ini; tidak satupun memerlukan ADR atau perubahan dokumen governance apa pun, jadi tidak mempengaruhi urutan siklus governance di atas.

---

# 18. MODUL BARU — AI Assistant Integration (Inisiatif Kedua, Terpisah dari Organization)

> **Status cakupan:** Berbeda dari Lampiran A/B/C (temuan/perbaikan kecil), ini adalah **inisiatif arsitektur kedua** yang berdiri sendiri — tidak berkaitan dengan Organization Management System, tidak menyentuh entitas `organizations`/`listings` sama sekali. Dibundel ke dokumen proposal yang sama atas permintaan Business Owner, supaya satu siklus sinkronisasi governance menuntaskan dua inisiatif sekaligus. Ditulis dengan struktur setara Bagian 1-17 (rationale → keputusan bisnis → ADR → skema data → API → user flow) karena bobotnya setara, bukan sekadar temuan insidental.

## 18.1 Ringkasan & Rasionalitas

Agen (dan seluruh role internal berakun) dapat menghubungkan **API key milik mereka sendiri** dari provider AI assistant pilihan, lalu chat langsung di dalam SaaS lewat chat UI buatan sendiri — tanpa redirect keluar aplikasi. Model yang dipakai adalah **BYOK (Bring Your Own Key)**, bukan embed aplikasi chat vendor (ChatGPT/Gemini/Claude web app **tidak mengizinkan diri di-iframe** oleh situs lain, proteksi anti-clickjacking standar `X-Frame-Options`/CSP `frame-ancestors` — dikonfirmasi berlaku di ChatGPT lewat forum developer resmi OpenAI) — sehingga BYOK + chat UI custom adalah satu-satunya cara mewujudkan "chat di dalam SaaS tanpa redirect".

## 18.2 Keputusan Bisnis Final

| # | Keputusan |
|---|---|
| 1 | Metode integrasi: **BYOK** (API key milik agen sendiri) + chat UI dibangun sendiri di dalam SaaS — bukan embed/iframe aplikasi chat vendor (secara teknis tidak mungkin) |
| 2 | **Daftar provider dikurasi Admin secara manual**, agen tidak bisa input endpoint sembarang (mencegah key dicuri lewat endpoint palsu). Fokus rilis awal: **Google Gemini, Groq, Mistral, GitHub Models** — dipilih khusus karena punya **free tier berkelanjutan** (bukan kredit percobaan sekali habis seperti OpenAI API/Anthropic API langsung) |
| 3 | **Riwayat percakapan tidak disimpan di server, tanpa opsi simpan sama sekali** — murni transient, hilang begitu sesi chat ditutup/direfresh |
| 4 | **Tidak ada akses Admin/Superadmin ke isi percakapan** — karena tidak pernah disimpan, tidak ada yang bisa diaudit; berbeda karakter dari `agent_verification_documents` yang memang untuk direview Admin |
| 5 | **Terbuka untuk seluruh role internal berakun** (Superadmin, Manager, Admin, Instructor, Agen) — bukan eksklusif Agen, tidak ada alasan teknis untuk membatasi |
| 6 | **Rate limiting tambahan dari platform**, di luar limit bawaan tiap provider — reuse mekanisme `rate_limit_log` yang sudah ada dari `ADR-018`, standar sama dengan endpoint authenticated lain (300 req/menit/user) — mencegah 1 akun disalahgunakan jadi "proxy AI gratis" pihak luar |
| 7 | **Koneksi API key bersifat persisten** — tersimpan terenkripsi, tidak perlu di-generate ulang / dihubungkan ulang setiap kali buka aplikasi atau setelah aplikasi ditutup. Detail lengkap di 18.7 |
| 8 | UI wajib menjelaskan syarat pemakaian tiap provider sebelum agen menghubungkan (lihat 18.6) — termasuk peringatan biaya, limit, dan kebijakan privasi data provider terkait |
| 9 | Biaya pemakaian API **sepenuhnya tanggung jawab agen** — billing langsung ke akun agen di provider terkait, platform tidak menalangi/menandai markup |
| 10 | Platform **tidak mengklaim afiliasi/endorsement resmi** dari Google/Groq/Mistral/GitHub — bahasa UI "hubungkan API key Anda sendiri", bukan "kami menyediakan [Provider]" |
| 11 | **Bukan pengulangan/konflik dengan "❌ Modul Chat" yang ditolak di Bagian 6.2** — penolakan itu spesifik soal Leader mengakses chat/CRM Member (komunikasi agen↔buyer di konteks Organization); ini fitur berbeda total: agen chat dengan AI assistant pribadinya sendiri, tidak melibatkan Organization/Member/buyer sama sekali |
| 12 | **Tombol "Chat Baru" wajib ada** (bukan opsional) — konsekuensi langsung dari poin 3 (riwayat tidak disimpan): tanpa tombol ini, satu-satunya cara mulai percakapan baru adalah reload halaman penuh. Perilaku pindah provider: **thread paralel per-provider** (Opsi B) — tiap provider yang terhubung punya "ruang chat" sendiri di state browser (bukan server), pindah dropdown provider = pindah tab, bukan reset paksa. Tombol "Chat Baru" me-reset **hanya** provider yang sedang aktif dilihat, tidak mengganggu thread provider lain. Tetap 100% konsisten poin 3 — seluruhnya state sementara browser, hilang total saat tab ditutup/refresh, tidak ada yang tersimpan ke server kapan pun. Ditambah **label pengingat permanen** di dekat kotak input chat (bukan sekali muncul di awal saja) — mis. *"Percakapan ini akan hilang saat halaman ditutup/dimuat ulang"* |

## 18.3 Draft ADR-028

**ADR-028 — Third-Party AI Assistant Integration Strategy (BYOK)**

**Status:** Proposed (menunggu Architecture Review Board)
**Date:** —
**Owner:** —

**Context:** Business Owner mengusulkan fitur agen dapat chat dengan AI assistant pilihan sendiri (Gemini/Groq/Mistral/GitHub Models) langsung di dalam SaaS, tanpa redirect ke aplikasi eksternal.

**Decision:** Diimplementasikan sebagai **BYOK** — agen generate API key sendiri dari provider pilihan (kredensial developer, terpisah dari akun chat konsumer seperti ChatGPT Plus/Gemini App), simpan ke platform (terenkripsi at-rest, pola sama dengan `agent_verification_documents`/`dbr_simulations`), lalu seluruh request chat diproksi lewat backend SaaS (key **tidak pernah** dikirim ke client-side/browser) ke API resmi provider terkait, ditampilkan di chat UI custom buatan sendiri. Daftar provider dikurasi Admin (tabel referensi baru, lihat 18.4), dibatasi ke provider dengan **free tier berkelanjutan**: Gemini, Groq, Mistral, GitHub Models. Riwayat chat tidak dipersist. Tersedia untuk seluruh role internal berakun.

**Alternatives Considered:**
- *Embed/iframe aplikasi chat vendor* (ChatGPT/Gemini/Claude web app) — **ditolak, secara teknis tidak mungkin**: seluruh aplikasi tsb mengirim header `X-Frame-Options`/CSP `frame-ancestors` yang memblokir diri di-iframe situs lain (anti-clickjacking), dikonfirmasi eksplisit oleh developer OpenAI sendiri di forum resminya bahwa ChatGPT tidak mengizinkan iframe.
- *OAuth "connect akun chat konsumer"* — ditolak, tidak tersedia; provider yang dituju tidak menyediakan permukaan OAuth publik untuk delegasi chat pihak ketiga ke akun konsumer mereka (beda dari API key developer yang memang didesain untuk ini).
- *Sertakan OpenAI API/Anthropic API langsung sebagai pilihan default* — ditolak untuk rilis awal; keduanya hanya menyediakan kredit percobaan sekali habis (~$5), bukan free tier berkelanjutan seperti 4 provider yang dipilih — berpotensi menyesatkan agen yang mengira gratis selamanya. Tidak tertutup kemungkinan ditambahkan nanti sebagai opsi berbayar eksplisit.
- *Simpan riwayat chat default (dengan opsi non-aktifkan)* — ditolak; kebalikannya yang dipilih (default tidak simpan, tanpa opsi apa pun) untuk meminimalkan risiko PII buyer ter-paste agen ke percakapan lalu tersimpan tanpa proteksi setara data sensitif lain.
- *Restriksi fitur khusus role Agen* — ditolak; dibuka untuk seluruh role internal berakun.

**Pros:** Tidak melanggar ToS provider manapun (API key memang untuk ini); key tidak pernah exposed ke client; tidak menambah kewajiban kepatuhan data karena percakapan tidak dipersist; free tier genuinely gratis untuk 4 provider terpilih tanpa risiko tagihan mendadak ke agen.

**Cons:** Agen perlu paham istilah "API key" (bukan sekadar login biasa) — dimitigasi lewat wizard onboarding (18.6); free tier provider bisa berubah sewaktu-waktu (terbukti dari riset — kuota Gemini pernah dipangkas 50-80% Desember 2025) — bukan sesuatu yang dikontrol platform.

**Impact:** Tabel referensi provider baru, tabel koneksi per-agen baru, endpoint proxy chat baru, rate limiting tambahan (reuse `ADR-018`).

**Affected Documents:** `PRD.md` (Modul 13 baru), `ERD-Skema-Database.md`, `API-Specification.md`, `User-Flow.md`, `SYSTEM-ARCHITECTURE.md` §8/§14 (Security/Notification), `technology-decisions.md`.

**Dependencies:** `ADR-017` (Security Strategy — enkripsi kredensial), `ADR-018` (Caching Strategy — reuse `rate_limit_log`), `ADR-024` (RBAC — akses lintas role, bukan role-restricted).

**Review Date:** Jika ada permintaan menambah provider di luar 4 yang dikurasi, atau kebutuhan menyimpan riwayat chat muncul eksplisit di masa depan (memerlukan ADR terpisah karena mengubah keputusan PII).

**Notes:** Berdiri independen dari `ADR-026`/`ADR-027` (Organization) — tidak ada dependency ke entitas `organizations`.

## 18.4 Skema Data (ERD Baru)

### `ai_providers` (tabel referensi, dikelola Admin)

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| code | VARCHAR(50) | UNIQUE, NOT NULL | `gemini`, `groq`, `mistral`, `github_models` |
| display_name | VARCHAR(100) | NOT NULL | |
| logo_url | VARCHAR(500) | NULLABLE | |
| billing_type | ENUM | NOT NULL | `free_tier_ongoing` (khusus 4 provider awal) — field disiapkan menerima nilai lain (`paid_only`, `trial_then_paid`) jika daftar diperluas nanti |
| setup_instructions_url | VARCHAR(500) | NOT NULL | Link ke halaman generate API key resmi provider |
| usage_terms_note | TEXT | NULLABLE | Ringkasan syarat pakai ditampilkan di UI sebelum connect (18.6 langkah 1) |
| requires_expiry_warning | BOOLEAN | default false | `true` khusus `github_models` (lihat 18.7 — PAT bisa punya masa berlaku) |
| status | ENUM | NOT NULL, default `active` | `active`, `inactive` — Admin bisa nonaktifkan provider dari daftar tanpa hapus data historis |

### `agent_ai_connections` (koneksi per-user, seluruh role)

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID/BIGINT | PK | |
| user_id | UUID/BIGINT | FK → users.id, NOT NULL | Bukan hanya agen — seluruh role internal berakun (Bagian 18.2 poin 5) |
| provider_id | UUID/BIGINT | FK → ai_providers.id, NOT NULL | |
| encrypted_api_key | VARCHAR(500) | NOT NULL | Terenkripsi at-rest, pola sama `agent_verification_documents.file_url` |
| status | ENUM | NOT NULL, default `active` | `active`, `disconnected`, `invalid` (lihat 18.7) |
| last_validated_at | TIMESTAMP | NULLABLE | Diisi saat "Tes Koneksi" (manual atau otomatis saat error) |
| connected_at | TIMESTAMP | NOT NULL | |
| created_at / updated_at | TIMESTAMP | | |
| UNIQUE | (user_id, provider_id) WHERE status='active' | | Satu user maksimal 1 koneksi aktif per provider (boleh sambungkan multi-provider berbeda) |

> **Tidak ada tabel riwayat percakapan** — sesuai Bagian 18.2 poin 3, percakapan murni transient, tidak ada baris yang perlu disimpan.

## 18.5 Dampak API Specification

Endpoint group baru `/ai-assistant/*`:

- `GET /ai-providers` — daftar provider aktif dikurasi Admin (Authenticated, seluruh role internal)
- `POST /ai-providers/{code}/connect` — simpan + validasi API key (test call ringan sebelum disimpan, sesuai wizard 18.6 langkah 3)
- `POST /ai-providers/{code}/test` — cek ulang validitas koneksi tersimpan kapan saja
- `DELETE /ai-providers/{code}/disconnect` — putus koneksi, hapus key tersimpan
- `POST /ai-chat/completions` — proxy chat (backend meneruskan ke API resmi provider pakai key tersimpan; **rate limited** via `rate_limit_log`, ADR-018)

Seluruh endpoint di atas **authenticated, lintas role** (tidak dibatasi `role_id=agent`) — konsisten Bagian 18.2 poin 5.

## 18.6 User Flow — Wizard Koneksi (User-Friendly, per Rekomendasi UX)

1. Menu **"AI Assistant"** di sidebar — tersedia untuk seluruh role internal.
2. Kondisi awal: kartu tiap provider (Gemini/Groq/Mistral/GitHub Models) dengan **ringkasan syarat pakai** (`usage_terms_note`) langsung terlihat — mis. *"Gratis, limit 1.500 request/hari, tanpa kartu kredit"* untuk Gemini, atau *"Gratis, perlu akun GitHub, token bisa diset kedaluwarsa"* untuk GitHub Models — supaya agen tahu konsekuensinya **sebelum** klik connect.
3. Klik "Hubungkan" → wizard: (a) instruksi + link **tab baru** ke halaman generate API key resmi provider, (b) paste key ke field ter-masking, (c) sistem tes validitas dengan 1 request ringan, feedback instan ✅/❌.
4. Setelah valid → status "Terhubung", agen langsung bisa chat.
5. Agen boleh sambungkan **lebih dari 1 provider**, pilih/pindah lewat dropdown di dalam chat UI. **Tiap provider punya thread chat sendiri secara paralel** (state di browser, bukan server) — pindah dropdown = pindah tab, percakapan provider lain tidak ikut hilang (Bagian 18.2 poin 12).
6. Tombol **"Chat Baru"** selalu terlihat di chat UI — mereset **hanya** thread provider yang sedang aktif dilihat, tanpa mempengaruhi thread provider lain yang sedang terbuka.
7. **Label pengingat permanen** ditampilkan menempel di dekat kotak input chat (bukan modal sekali muncul) — mis. *"Percakapan ini akan hilang saat halaman ditutup/dimuat ulang"* — mengingatkan aturan 18.2 poin 3 secara berkelanjutan, bukan cuma sekali di awal.
8. Tombol **"Tes Koneksi"** & **"Putus Koneksi"** tersedia kapan saja dari Settings.

## 18.7 Aturan Persistensi Koneksi vs Riwayat Chat (Klarifikasi Penting)

Dua hal yang **tidak boleh tertukar**, karena punya perilaku berbeda:

| Aspek | Perilaku |
|---|---|
| **Koneksi (API key tersimpan)** | **Persisten.** Sekali dihubungkan, tetap tersambung — **tidak perlu generate ulang atau connect ulang** setiap kali membuka aplikasi, menutup tab, atau logout/login kembali. Sama seperti nomor WA yang auto-terisi dari `agent_profiles` — sekali diset, dipakai ulang terus sampai user sendiri yang memutuskan. |
| **Riwayat/sesi chat** | **Tidak persisten** (Bagian 18.2 poin 3). Menutup/refresh halaman chat = percakapan yang sedang berjalan hilang, mulai baru dari awal. Ini bukan soal "koneksi terputus" — API key-nya tetap valid, cuma histori pesannya yang tidak diingat sistem. |

**Kapan reconnect benar-benar diperlukan** (bukan rutin, hanya 3 skenario ini):
1. Agen sendiri menekan "Putus Koneksi" dari Settings.
2. Key jadi tidak valid dari **sisi provider** — mis. agen revoke/generate ulang key di console resmi provider (di luar aplikasi ini), API key lama otomatis invalid di sistem kita juga → status berubah otomatis jadi `invalid` saat request berikutnya gagal, ditampilkan sebagai notifikasi jelas ("Koneksi [Provider] terputus, silakan hubungkan ulang"), bukan silent failure.
3. **Khusus GitHub Models** — token akses GitHub (Personal Access Token) **bisa diset kedaluwarsa** oleh agen sendiri saat generate (30/60/90 hari, atau tanpa kedaluwarsa) — beda dari 3 provider lain yang API key-nya tidak expired by design. Wizard 18.6 langkah 2 **wajib** menampilkan peringatan khusus untuk GitHub: *"Pilih 'No expiration' saat generate token, atau catat tanggal kedaluwarsanya — token yang expired perlu dihubungkan ulang."*

Tidak ada job background untuk refresh token (berbeda dari pola OAuth access-token-refresh) — API key jenis ini murni kredensial statis sampai direvoke, sehingga **tidak perlu** melibatkan mekanisme job queue (`ADR-006`) sama sekali.

## 18.8 Dampak Dokumen (masuk ke Peta Sinkronisasi Bagian 14)

Ditambahkan sebagai baris baru di urutan sinkronisasi Bagian 14: `PRD.md` (Modul 13 baru), `ERD-Skema-Database.md` (`ai_providers` + `agent_ai_connections`), `API-Specification.md` (`/ai-assistant/*`), `User-Flow.md` (wizard 18.6), `SYSTEM-ARCHITECTURE.md` (§8 Security — pola enkripsi key baru, §13 Notification — notifikasi koneksi invalid), `technology-decisions.md` (catatan pemilihan 4 provider). **Tidak ada dependency-manifest.md baru** — seluruh komunikasi ke provider lewat REST API standar (fetch/HTTP client yang sudah ada), tidak perlu SDK/package tambahan.

---

# 19. Persetujuan

| Peran | Nama | Tanggal | Tanda Tangan/Approval |
|---|---|---|---|
| Business Owner / Product Owner | TBD | | ☐ |
| Principal Software Architect | TBD | | ☐ |
| Architecture Review Board | TBD | | ☐ |

---

# Lampiran A — Temuan Tambahan: Data Gap `listing_leads` vs `POST /leads`

> **Status cakupan:** Temuan ini **di luar lingkup Organization Management System** (Bagian 6). Ditemukan secara insidental saat menjawab pertanyaan Business Owner soal fitur analitik dashboard agen (Agustus 2026) — bukan hasil dari perubahan Organization/Workspace apa pun. Dicantumkan di sini semata agar tidak hilang dari radar, dan bisa dieksekusi dalam **paket ERD/API yang sama** di akhir siklus sinkronisasi (Bagian 17 poin 5), tanpa memerlukan ADR baru atau menyentuh dokumen governance manapun.

### A.1 Temuan

Dua dokumen yang sudah Approved (`API-Specification.md` v1.1 §4 dan `ERD-Skema-Database.md` v1.1 §2.9) **tidak sinkron** satu sama lain:

- `POST /leads` (API Spec §4) — endpoint untuk mengirim inquiry lewat form di halaman listing (alternatif selain klik CTA WA langsung) — contoh payload-nya menyertakan `name`, `phone`, `email`, `message`, `preferred_contact`.
- `listing_leads` (ERD §2.9) — tabel yang seharusnya menyimpan hasil `POST /leads` tsb, **hanya punya kolom**: `id`, `listing_id`, `agent_id`, `source` (default `whatsapp_cta`), `ip_address`, `user_agent`, `created_at`. **Tidak ada kolom untuk menyimpan nama/telepon/email/pesan dari form.**

Akibatnya: kontrak API sudah menjanjikan penyimpanan data inquiry, tapi skema database di baseline saat ini belum punya tempat menyimpannya — kalau tidak dikoreksi sebelum Sprint S0, endpoint `POST /leads` akan gagal diimplementasikan sesuai spec-nya sendiri.

### A.2 Klarifikasi (bukan gap, sudah by design)

Untuk klik CTA WhatsApp yang **pasif** (tombol "Chat via WhatsApp", redirect langsung ke `wa.me/{nomor_agen}`) — sistem **memang tidak pernah** menerima data kontak pengunjung sama sekali, karena flow-nya murni redirect browser, tanpa round-trip data ke server. `view_count` dan `cta_click_count` di `listings` mencatat **jumlah event**, bukan siapa yang melakukannya. Ini bukan gap yang perlu diperbaiki — cukup dicatat di sini agar terdokumentasi eksplisit dan tidak ditanyakan ulang di sesi mendatang.

### A.3 Rekomendasi Perbaikan (untuk paket update ERD nanti)

Perluasan aditif pada `listing_leads` — tidak mengubah kolom yang sudah ada:

| Field Baru | Tipe | Constraint | Keterangan |
|---|---|---|---|
| contact_name | VARCHAR(150) | NULLABLE | Diisi hanya jika `source='inquiry_form'` |
| contact_phone | VARCHAR(20) | NULLABLE | idem |
| contact_email | VARCHAR(255) | NULLABLE | idem |
| message | TEXT | NULLABLE | idem |
| preferred_contact | ENUM | NULLABLE | `whatsapp`, `email`, `phone` — selaras contoh payload `POST /leads` di API Spec |

`source` (ENUM, sudah ada) perlu ditambah nilai baru `inquiry_form`, berdampingan dengan `whatsapp_cta` yang sudah ada — agar satu tabel tetap bisa membedakan dua jenis lead (klik pasif vs form aktif) tanpa tabel terpisah.

**Catatan keamanan data:** `contact_phone`/`contact_email` adalah PII pengunjung (bukan data agen) — sejalan dengan prinsip enkripsi field sensitif yang sudah berlaku untuk `agent_verification_documents`/`dbr_simulations` (ERD §4 Catatan Desain & Keamanan Data), dan relevan dengan kepatuhan UU PDP yang sudah jadi acuan yurisdiksi proyek ini (`PROJECT-CONSTITUTION.md` §2). Direkomendasikan kolom ini masuk kategori field yang sama perlakuannya.

### A.4 Dampak

- **Tidak ada perubahan endpoint** — kontrak `POST /leads` di API Spec sudah benar, hanya ERD yang perlu menyusul.
- **Tidak memerlukan ADR baru** — ini koreksi kesesuaian antar dua dokumen v1.1 yang sudah Approved, bukan keputusan arsitektur baru.
- Masuk sebagai bagian dari revisi `ERD-Skema-Database.md` v1.1 → v1.2 yang sama dengan perubahan Organization (Bagian 14 baris 4) — satu siklus versi, dua sumber perubahan yang dicatat terpisah agar tetap traceable.

---

# Lampiran B — Temuan Tambahan: Restrukturisasi Form Create Listing Jadi Wizard 6 Step

> **Status cakupan:** Sama seperti Lampiran A, temuan ini **di luar lingkup inti Organization Management System** — form Create Listing sudah ada sejak `PRD v1.1` §3.2 dan `User-Flow v1.1` §3.1, jauh sebelum konsep Organization diusulkan. Namun ini **berkaitan erat** dengan Organization karena mulai sekarang ada **2 entry point** yang memakai form yang sama (Personal Listing & Organization Listing, Bagian 5 poin 10) — sehingga baik dibereskan dalam siklus dokumen yang sama. Ditemukan insidental dari diskusi UX form listing (Agustus 2026). Tidak memerlukan ADR baru.

### B.1 Masalah

Form Create Listing saat ini (`PRD` §3.2) berisi 9 kategori field dalam satu halaman tunggal — termasuk 12 field spesifikasi rumah saja, ditambah lokasi, harga, legalitas, media, deskripsi. Ini berat untuk satu form flat, dan tidak dipecah menjadi step di `User-Flow` §3.1 saat ini.

### B.2 Rekomendasi: Wizard 6 Step

| Step | Isi | Rasional |
|---|---|---|
| **1. Klasifikasi** | Kategori (Primary/Secondary) → jika Primary: tautkan ke proyek developer? → Tujuan Transaksi (Jual/Sewa) → Tipe Properti | **Wajib paling awal** — menentukan apakah step Harga & Spesifikasi nanti terkunci/read-only (Primary tertaut proyek developer mengunci harga & spesifikasi sesuai `PRD` Business Rules) atau bebas diisi. Urutan lain berisiko membuat agen mengetik ulang data yang keburu terkunci/ketimpa. |
| **2. Lokasi** | Provinsi/Kota/Kecamatan (cascading), nama kawasan, alamat, pin peta, patokan | Berdiri sendiri, tidak bergantung step lain |
| **3. Detail & Harga** | Harga (atau read-only jika Primary+tertaut), spesifikasi rumah, status legalitas | Digabung satu step — seluruhnya "fakta objektif properti" |
| **4. Media** | Upload foto (min. 3, pilih cover), video/virtual tour opsional | Step tersendiri — upload file berbeda karakteristik dari input teks |
| **5. Judul & Deskripsi** | **Judul auto-suggest** dari kombinasi tipe properti + lokasi + spesifikasi (step 1–3), dapat diedit agen; deskripsi; highlight | Ditaruh setelah data lain lengkap agar auto-suggest punya bahan |
| **6. Kontak & Preview** | Konfirmasi/edit nomor WA (auto-fill profil), preview lengkap, "Simpan Draft"/"Submit Review" | Step penutup, selaras flow existing |

### B.3 Rekomendasi Tambahan

- **Auto-save per step** (bukan hanya di akhir) — memperkuat opsi "Simpan sebagai Draft" yang sudah ada; agen yang keluar di tengah wizard tidak kehilangan progres.
- **Entry point (Personal vs Organization) TIDAK jadi step di dalam wizard.** `listing_origin`/`listing_context` sudah ditentukan dari halaman/tombol mana agen memulai ("Buat Listing" di area Personal vs area Organization Listing) — bukan pertanyaan di dalam form. Wizard-nya sendiri identik untuk kedua entry point.

### B.4 Dampak

- `User-Flow.md` §3.1 — direstrukturisasi dari flow linear menjadi wizard 6 step eksplisit.
- `PRD.md` §3.2 — pengelompokan field disesuaikan mengikuti pembagian step di atas (tidak ada field yang dihapus/ditambah, murni re-grouping + auto-suggest judul sebagai kapabilitas baru kecil).
- **Tidak ada perubahan ERD/API** — seluruh field yang dipakai sudah ada di `listings` (ERD §2.4), wizard murni perubahan presentasi form, bukan struktur data.
- Berlaku untuk **kedua entry point** (Personal & Organization Listing) — satu implementasi wizard, dipakai ulang di dua konteks.

---

# Lampiran C — Temuan Tambahan: Pagination Katalog Listing & Sorting Opsi "Relevansi"

> **Status cakupan:** Sama seperti Lampiran A & B, temuan ini **di luar lingkup inti Organization Management System** — berkaitan dengan Modul 3 (Listing) & Modul 11 (SEO) yang sudah ada sejak `v1.1`. Ditemukan insidental dari diskusi UX halaman katalog listing (Agustus 2026). **Tidak memerlukan ADR baru** — bagian sorting relevansi murni memanfaatkan kapabilitas yang sudah dikunci `ADR-005` (Search Strategy, PostgreSQL Full-Text Search), bukan keputusan arsitektur baru.

### C.1 Pagination — Dikonfirmasi Tetap, Tidak Diubah

`SYSTEM-ARCHITECTURE.md` §9 sudah mengunci standar pagination berbasis halaman di seluruh endpoint list (`?page=1&per_page=20&sort=...&order=...`, response `meta: {page, per_page, total}`). **Dikonfirmasi dipertahankan** — **bukan** diganti infinite scroll, karena dua alasan yang sudah jadi prinsip proyek: (1) `PROJECT-CONSTITUTION` §1 poin 6 menjadikan SEO tujuan utama, dan `ADR-021` mengunci SSR/SSG untuk halaman publik justru agar crawler membaca konten penuh sejak request pertama — infinite scroll murni (tanpa URL berubah per halaman) berisiko listing di halaman lanjutan tidak mendapat URL unik yang dapat di-crawl; (2) mengubah kontrak `page`/`per_page` yang sudah Approved tanpa alasan kuat tidak disarankan.

**Rekomendasi UX (progressive enhancement, bukan perubahan kontrak):** tombol **"Muat Lebih Banyak"** yang tetap meng-update URL (`?page=2`, dst.) saat diklik — memberi kesan *infinite-scroll* tanpa mengorbankan crawlability, karena tiap halaman tetap punya URL unik yang dapat di-index/dibagikan/di-bookmark. `per_page=20` (default existing) dipertahankan.

### C.2 Sorting — Tambahan Opsi "Relevansi"

`PRD` §3.4 saat ini punya 4 opsi sort: Terbaru, Harga Terendah–Tertinggi, Harga Tertinggi–Terendah, Terpopuler. Diusulkan **opsi ke-5: Relevansi**, dengan aturan berikut:

| Aturan | Ketentuan |
|---|---|
| Kapan opsi ini muncul | **Hanya saat search box terisi kata kunci.** Jika user murni memakai filter (kota, tipe properti, dst.) tanpa kata kunci pencarian, opsi "Relevansi" **disembunyikan** dari dropdown sort — secara konsep tidak ada apa pun untuk diranking relevansinya |
| Mesin di baliknya | `ts_rank` dari PostgreSQL Full-Text Search — kapabilitas yang **sudah** direncanakan lewat `ADR-005` (kolom generated `search_vector` + index GIN di `listings`, sudah dicatat di `CURRENT-PROJECT-STATE.md` sebagai bagian migration Sprint S0/S4). **Tidak perlu kolom/index baru** — memanfaatkan yang sudah ada |
| Default sort saat ada kata kunci | **Relevansi** menjadi default otomatis ketika user mengetik kata kunci pencarian (menggantikan default `created_at desc` biasa) — kecuali user memilih sort lain secara eksplisit |
| Default sort saat tanpa kata kunci | Tetap seperti sekarang — `created_at desc` (Terbaru) |
| Kontrak endpoint | Query param `sort=relevance` **hanya valid** jika request juga menyertakan param pencarian (`q=...`/keyword). Jika `sort=relevance` diminta tanpa kata kunci, API **fallback** ke `created_at desc` (bukan error) — konsisten prinsip endpoint yang toleran terhadap kombinasi param yang tidak lengkap |
| Migrasi ke Typesense (Fase 2, ADR-005) | Konsep "Relevansi" tetap berlaku secara kontrak — implementasi skor relevansi berpindah dari `ts_rank` Postgres ke skor bawaan Typesense, tanpa mengubah bentuk request/response endpoint (selaras prinsip `ADR-005` bahwa migrasi mesin pencari tidak mengubah kontrak API) |

### C.3 Kaitan dengan Organization — Minim

Katalog publik menampilkan seluruh listing `published` terlepas asal (Personal/Organization) — tidak ada logika filter/sort berbeda per `listing_context`. Opsional (bukan wajib, tidak diformalkan lebih lanjut di sini): badge kecil "via [Nama Organization]" pada card listing jika `listing_context='organization'`, murni dekorasi tampilan, tidak mempengaruhi pagination/sorting.

### C.4 Dampak

- `API-Specification.md` — endpoint search/list listing: tambah nilai `relevance` pada param `sort`, dengan aturan fallback di atas.
- `SYSTEM-ARCHITECTURE.md` §9 (Sorting) — dicatat sebagai perluasan, bukan perubahan mesin pencarian (`ADR-005` tidak berubah).
- `PRD.md` §3.4 — tabel filter/sort bertambah 1 baris opsi.
- **Tidak ada perubahan ERD** — `search_vector`/index GIN sudah direncanakan lewat `ADR-005`, tidak ada kolom baru yang dibutuhkan.
- **Pagination tidak berubah** — dikonfirmasi ulang (C.1), tidak ada dampak dokumen untuk bagian ini selain catatan konfirmasi.

