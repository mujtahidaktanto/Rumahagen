# Fase 0 — Rencana penutupan temuan keamanan (sebelum frontend dibuka ke internet)

Disusun 2026-09-25 dari Supabase Security Advisor dan pengecekan langsung ke DB live `jawywzavznjekxxlhwqo`. **Belum ada yang diterapkan.** Tiap migration ditulis, diuji rollback, dan diterapkan hanya setelah pemilik produk berkata "terapkan NNNN".

## 1. Temuan Advisor (diverifikasi ulang)

| Temuan | Jumlah | Rencana |
|---|---|---|
| `anon_security_definer_function_executable` | 67 | Bagian 2 |
| `authenticated_security_definer_function_executable` | 96 | Bagian 3 |
| `security_definer_view` (`public_agent_profiles`) | 1 ERROR | Bagian 4 |
| `function_search_path_mutable` | 12 | Sudah ada di 0146 |
| `auth_leaked_password_protection` | 1 | Tindakan pemilik: Supabase > Auth > aktifkan |
| `rls_enabled_no_policy` (`rate_limit_log`, `certificate_counters`) | 2 INFO | Disengaja: hanya diakses fungsi SECURITY DEFINER. Terima |

## 2. 67 fungsi yang bisa dipanggil anon (klasifikasi)

| Kelompok | Fungsi | Tindakan |
|---|---|---|
| **A. Fungsi trigger (34)** | `trg_notify_*`, `enforce_*`, `handle_auth_user_sync`, `log_listing_price_change`, dst. | Cabut EXECUTE dari anon dan authenticated. Aman: EXECUTE hanya diperiksa saat `CREATE TRIGGER`, bukan saat trigger berjalan. **Sudah di 0146 (bagian 5)** |
| **B. Tiga celah terbukti** | `create_notification`, `log_audit_event`, `check_and_increment_rate_limit` | Guard/khusus service role + `log_audit_event_for`. **Sudah di 0146 (bagian 1-3)** |
| **C. RPC mutasi yang sudah punya guard** (14, ditambah `create_notification` dari B) | `adjust_learning_points`, `admin_force_provider_connection`, `allocate_quota_capacity`, `cancel_commercial_order`, `capture_qualification_evidence_from_session`, `configure_refresh_allowance`, `consume_quota_capacity`, `consume_refresh_allowance`, `evaluate_qualification`, `fulfill_commercial_order`, `grant_learning_points_from_purchase`, `refresh_listing`, `revoke_dbr_simulation_share`, `share_dbr_simulation` | Cabut dari anon, pertahankan authenticated dan service_role. **Sudah di 0146 (bagian 4)** |
| **D. Pembantu internal yang belum tercakup 0146** (4) | `new_certificate_verification_code`, `next_certificate_number`, `session_enrollment_agent`, `course_enroll_problem` | Tambah ke migration lanjutan: cabut anon (dan authenticated bila hanya dipanggil fungsi lain). Perlu dicek pemanggilnya dulu; `course_enroll_problem` dipanggil trigger invoker, jadi authenticated harus tetap |
| **E. Pembantu RLS** (10) | `has_permission`, `auth_scope`, `current_role_code`, `is_superadmin`, `is_org_member`, `is_org_leader`, `is_event_organizer`, `is_session_team`, `is_session_team_for_enrollment`, `session_owner_for_enrollment` | **Dibiarkan.** Dipakai policy RLS yang berlaku untuk anon (mis. 158 dari 159 policy `has_permission`). Hanya membaca `auth.uid()`, hasilnya `false`/`null` untuk anon. Menutupnya butuh menulis ulang puluhan policy; Advisor tetap memberi peringatan. Catat sebagai risiko diterima |
| **F. Publik disengaja** (2; total 34+3+14+4+10+2 = 67) | `verify_certificate` (kode verifikasi, data terbatas), `get_shared_dbr_simulation` (token uuid) | Dibiarkan |

Cek tiap kelompok memakai: `has_function_privilege('anon', oid, 'EXECUTE')`, pemakaian di `pg_policy`, dan `.rpc("...")` di `apps/web`.

## 3. 96 fungsi authenticated (belum diaudit satu per satu)

Sebagian besar sama dengan kelompok E (perlu tetap) dan C (guard di dalam fungsi). Yang perlu ditinjau: fungsi yang mengubah data dan **tidak** memeriksa peran di dalamnya (mis. `refresh_listing`, `share_dbr_simulation` harus memeriksa kepemilikan). Langkah: untuk tiap fungsi non-trigger, uji rollback sebagai role `authenticated` dengan pengguna Agent biasa terhadap data milik orang lain. Hasil ditambahkan ke dokumen ini sebelum migration lanjutan.

## 4. View `public_agent_profiles`

- Sengaja SECURITY DEFINER: proyeksi publik profil Agent (kolom terbatas). Tidak ada email, KTP, atau data pribadi lain; `whatsapp_number` dan `license_number` tampil sesuai keputusan produk 2026-09-25.
- Mengubah ke `security_invoker` akan membuat anon butuh akses ke `agent_profiles`, `users`, `award_instances`; RLS-nya membatasi. Jadi **tetap DEFINER**.
- Temuan nyata: anon dan authenticated punya **semua** hak (INSERT, UPDATE, DELETE, TRUNCATE, dst.) pada view ini. View kompleks ini tidak bisa ditulis, tetapi hak berlebih harus dicabut: `REVOKE ALL ON public.public_agent_profiles FROM anon, authenticated; GRANT SELECT ON public.public_agent_profiles TO anon, authenticated;`. Advisor akan tetap menandai ERROR; catat sebagai pengecualian yang diterima.

## 5. Urutan pelaksanaan

1. `git stash pop`, jalankan `tsc` dan uji ulang rollback 0146 (rate limit hanya service role; audit lewat `logAuditEvent()`; notifikasi manual hanya Admin).
2. Commit dan push **kode** dulu (`lib/api/audit.ts`, `lib/api/rate-limit.ts`, 13 route).
3. Deploy ke staging.
4. "terapkan 0146".
5. Migration lanjutan (mis. 0153): kelompok D, hak view, plus hasil audit bagian 3. Diuji rollback, diterapkan setelah "terapkan".
6. Pemilik mengaktifkan leaked password protection di dashboard Supabase.
7. Jalankan ulang Advisor; sisa yang diterima: kelompok E dan F, view `public_agent_profiles`, dua tabel tanpa policy.

**Aturan setelah 0146:** audit lewat `logAuditEvent()` (`lib/api/audit.ts`), bukan `supabase.rpc("log_audit_event")`; fungsi yang memanggil `log_audit_event` harus SECURITY DEFINER; rate limit dipanggil lewat client service role.
