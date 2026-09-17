-- 0040_developer_projects_delete_policy.sql
-- Menutup GAP fisik: STEP11-B3 (API-122) meng-evidence
-- "DELETE /admin/developer-projects/{id}" sebagai current preserved route,
-- TAPI migration 0034_m06_developer_projects.sql tidak pernah membuat RLS
-- policy untuk command DELETE di tabel `developer_projects` — diverifikasi
-- lewat pg_policies (hanya developer_projects_insert/select/update yang ada).
-- Pola gap yang PERSIS SAMA seperti `events` (lihat 0039) — tanpa policy ini
-- API-122 tidak bisa berfungsi untuk siapa pun.
--
-- Memakai permission `m06.developer_project.manage` yang sudah ada sejak
-- 0034 (Superadmin/Admin/Manager=ALL, Developer Partner=OWN) — kondisi WHERE
-- disalin persis dari developer_projects_update/insert (0034) untuk
-- konsistensi, bukan logika baru.

CREATE POLICY developer_projects_delete ON public.developer_projects
  FOR DELETE USING (
    public.has_permission('m06.developer_project.manage', (SELECT dp.user_id FROM public.developer_partners dp WHERE dp.id = developer_projects.developer_id))
  );
