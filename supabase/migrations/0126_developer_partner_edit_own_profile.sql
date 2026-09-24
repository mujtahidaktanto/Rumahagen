-- 0126_developer_partner_edit_own_profile.sql
-- Keputusan produk (2026-09-24): Developer Partner BOLEH mengedit profil perusahaannya sendiri
-- (nama perusahaan, logo, "Tentang Developer", nama dan kontak PIC).
--
-- Sebelumnya (0033) developer_partners hanya bisa diubah pemegang m06.developer_partner.manage
-- (staf); Developer Partner cuma bisa SELECT barisnya sendiri. Diuji 2026-09-24: UPDATE oleh
-- Developer Partner = 0 baris, padahal STEP13-C §8.1 dan STEP13-E §17.1 menyebut Developer
-- mengelola company_logo dan Tentang Developer.
--
-- Perubahan:
--   1. Permission BARU m06.developer_partner.update_own_profile (ADD-NEW): Developer Partner=OWN,
--      Superadmin=ALL. Tidak memperluas m06.developer_partner.manage (direktori, tetap staf).
--   2. Policy UPDATE tambahan untuk pemilik baris (user_id), hanya baris yang belum dihapus.
--   3. Trigger penjaga kolom: yang bukan pemegang .manage TIDAK boleh mengubah user_id (tautan akun),
--      status (aktif/nonaktif), maupun deleted_at. Jadi mitra tidak bisa memindahkan tautan akun,
--      mengaktifkan kembali perusahaannya, atau menghapusnya sendiri.

INSERT INTO public.permissions (module_code, action_code, scope_type, description) VALUES
  ('m06', 'm06.developer_partner.update_own_profile', 'own', 'Developer Partner - Update own company profile (ADD-NEW, 0126: nama, logo, Tentang Developer, PIC milik perusahaan sendiri; status dan tautan akun tetap staf)')
ON CONFLICT (module_code, action_code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, x.scope, 'superadmin'
FROM (VALUES
  ('superadmin',        'm06.developer_partner.update_own_profile', 'all'),
  ('developer_partner', 'm06.developer_partner.update_own_profile', 'own')
) AS x(role_code, action_code, scope)
JOIN public.roles r ON r.code = x.role_code
JOIN public.permissions p ON p.action_code = x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE POLICY developer_partners_update_own ON public.developer_partners
  FOR UPDATE
  USING (deleted_at IS NULL AND public.has_permission('m06.developer_partner.update_own_profile', user_id))
  WITH CHECK (deleted_at IS NULL AND public.has_permission('m06.developer_partner.update_own_profile', user_id));

CREATE OR REPLACE FUNCTION public.enforce_developer_partner_self_edit_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.has_permission('m06.developer_partner.manage') THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'developer_partners: hanya staf (m06.developer_partner.manage) yang boleh mengubah user_id, status, atau deleted_at'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_developer_partner_self_edit_columns
  BEFORE UPDATE ON public.developer_partners
  FOR EACH ROW EXECUTE FUNCTION public.enforce_developer_partner_self_edit_columns();
