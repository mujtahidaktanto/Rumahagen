-- 0016_m13_agent_ai_connections.sql
-- Menutup residual: sebagian D13-09 lanjutan (Own BYOK Connection — konsumen dari
-- 0015), D13-10 (FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE administrative
-- intervention), D13-11 (complete connection lifecycle/state semantics), dan
-- melengkapi R-07 (agent_ai_connections.provider_id FK ke ai_providers = mekanisme
-- "sync" yang dimaksud R-07: setiap koneksi selalu tertaut ke baris katalog yang
-- masih ada; ON DELETE RESTRICT mencegah provider dihapus fisik selama masih ada
-- koneksi aktif — provider hanya bisa "retire" via status, bukan hilang begitu saja
-- di bawah koneksi yang bergantung padanya).
--
-- Sumber kolom dasar: STEP10-D_ATTRIBUTE_TO_PHYSICAL_COLUMN_RECONCILIATION.csv,
-- entity AGENT_AI_CONNECTIONS (module M13, PRESERVE_EXACT_PHYSICAL_CORROBORATION).
--
-- SATU DEVIASI TERDOKUMENTASI (pola sama seperti pelebaran action_code di 0003):
-- STEP10-D hanya mengunci 3 nilai status ('active','disconnected','invalid').
-- D13-11 SENDIRI secara eksplisit menyatakan gap ini: "complete connection
-- lifecycle/state semantics exceed the currently evidenced connection API family"
-- — artinya 3 nilai itu memang didokumentasikan TIDAK LENGKAP, bukan diam-diam
-- diabaikan. Untuk menutup D13-10 (tiga operasi admin: FORCE_REVOKE/FORCE_DISCONNECT/
-- FORCE_DISABLE) secara fisik, status dilebarkan ke 5 nilai: ditambah 'disabled' dan
-- 'revoked', plus kolom baru `disabled_by_admin` untuk membedakan disable oleh
-- pemilik sendiri (reversible oleh pemilik) vs FORCE_DISABLE oleh admin (hanya bisa
-- direverse oleh admin) — lihat rincian di bawah.

CREATE TABLE IF NOT EXISTS public.agent_ai_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id         UUID NOT NULL REFERENCES public.ai_providers(id) ON DELETE RESTRICT,
  encrypted_api_key   VARCHAR(500) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','disconnected','invalid','disabled','revoked')),
  disabled_by_admin   BOOLEAN NOT NULL DEFAULT false,
  last_validated_at   TIMESTAMPTZ,
  connected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agent_ai_connections IS
  'Koneksi BYOK milik user (role Developer Partner secara semantik permission, kolom tetap bernama user_id/agent_ai_connections mengikuti STEP10-D apa adanya — "agent" di nama tabel adalah istilah generik untuk actor, bukan pengikat ke role platform "Agent"; lihat has_permission() calls di bawah yang benar-benar menegakkan Developer Partner=OWN). encrypted_api_key TIDAK PERNAH didekripsi di lapisan SQL/RLS — hanya disimpan; dekripsi terjadi di application layer route handler saat dipakai memanggil provider.';

COMMENT ON COLUMN public.agent_ai_connections.status IS
  'DILEBARKAN dari 3 nilai STEP10-D (active/disconnected/invalid) menjadi 5, menutup D13-11. "disabled" = jeda reversible (lihat disabled_by_admin untuk siapa yang bisa membalikkannya). "revoked" = final, admin-only, tidak bisa diubah lagi (credential dianggap tidak sah selamanya) — pemilik harus buat koneksi baru, bukan reaktivasi baris ini.';

COMMENT ON COLUMN public.agent_ai_connections.disabled_by_admin IS
  'ADD-NEW, bukan dari STEP10-D. Membedakan status=disabled oleh pemilik sendiri (disabled_by_admin=false, pemilik bisa enable lagi sendiri) vs FORCE_DISABLE oleh admin (disabled_by_admin=true, HANYA admin yang bisa enable lagi — menutup D13-10 bagian FORCE_DISABLE secara fisik, bukan cuma konvensi penamaan).';

-- ── Trigger: state machine — menutup D13-11 ("complete lifecycle/state semantics") ──
-- Berlapis DI ATAS RLS (bukan pengganti): RLS menentukan SIAPA yang boleh UPDATE baris
-- ini, trigger ini menentukan APAKAH lompatan status yang diajukan valid secara
-- state-machine, terlepas dari siapa pemanggilnya — supaya kalaupun suatu saat ada
-- RLS policy modul lain yang salah konfigurasi, garis pertahanan kedua ini tetap
-- mencegah lompatan status yang tidak masuk akal (mis. 'revoked' balik ke 'active').
CREATE OR REPLACE FUNCTION public.enforce_agent_ai_connection_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Tidak ada perubahan status/disabled_by_admin yang relevan — lewati validasi
  -- (mis. update last_validated_at saja saat 'test' sukses tanpa ganti status).
  IF OLD.status = NEW.status AND OLD.disabled_by_admin = NEW.disabled_by_admin THEN
    RETURN NEW;
  END IF;

  -- 'revoked' final — tidak ada jalan keluar, oleh siapa pun termasuk Superadmin.
  IF OLD.status = 'revoked' THEN
    RAISE EXCEPTION 'agent_ai_connections: status revoked bersifat final (D13-11) — buat koneksi baru, bukan reaktivasi baris ini';
  END IF;

  -- Tiga transisi berikut HANYA boleh dieksekusi actor dengan permission
  -- m13.administrative_force_revoke_disable.execute (D13-10), terlepas dari RLS
  -- yang mengizinkan UPDATE sampai ke titik ini (defense-in-depth kedua):
  --   1) menuju 'revoked' (FORCE_REVOKE)
  --   2) menuju 'disabled' dengan disabled_by_admin=true (FORCE_DISABLE)
  --   3) melepas disabled_by_admin dari true→false (admin membalikkan FORCE_DISABLE-nya sendiri)
  IF NEW.status = 'revoked'
     OR (NEW.status = 'disabled' AND NEW.disabled_by_admin = true)
     OR (OLD.disabled_by_admin = true AND NEW.disabled_by_admin = false)
  THEN
    IF NOT public.has_permission('m13.administrative_force_revoke_disable.execute') THEN
      RAISE EXCEPTION 'agent_ai_connections: transisi status ke % (disabled_by_admin=%) butuh permission m13.administrative_force_revoke_disable.execute (D13-10)', NEW.status, NEW.disabled_by_admin;
    END IF;
  END IF;

  -- Pemilik sendiri tidak boleh menandai baris miliknya sebagai disabled_by_admin=true
  -- lewat jalur lain manapun (mis. set status tetap 'active' tapi flag true) — dicegah
  -- oleh kondisi kedua di atas karena NEW.status='disabled' disyaratkan bersamaan
  -- dengan disabled_by_admin=true; kombinasi status<>'disabled' AND disabled_by_admin=true
  -- ditolak eksplisit di sini supaya tidak ada state tidak valid yang lolos.
  IF NEW.status <> 'disabled' AND NEW.disabled_by_admin = true THEN
    RAISE EXCEPTION 'agent_ai_connections: disabled_by_admin=true hanya valid bersama status=disabled';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- TIDAK SECURITY DEFINER (beda dengan 0006/0012) — trigger ini hanya membaca
-- OLD/NEW dan memanggil has_permission() yang privilege-nya sudah dinaikkan
-- sendiri (DEFINER) di 0006; tidak ada alasan menaikkan privilege trigger ini
-- juga (prinsip least-privilege, konsisten dengan trigger business-rule di 0004
-- yang juga tidak DEFINER).

CREATE TRIGGER trg_agent_ai_connection_transition
  BEFORE UPDATE OF status, disabled_by_admin ON public.agent_ai_connections
  FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_ai_connection_transition();

-- ── RLS ── sumber: STEP12-01 baris "Own BYOK Connection" (Superadmin=ALL,
-- Developer Partner=OWN, lainnya=NONE) dan "Administrative Force Revoke/Disable"
-- (Superadmin=ALL, lainnya=NONE). Permission code SUDAH ADA di seed 0009 sejak
-- Tahap 1 — tidak ada permission baru dibuat di migration ini.

ALTER TABLE public.agent_ai_connections ENABLE ROW LEVEL SECURITY;

-- 1) SELECT — pemilik lihat koneksi sendiri, atau Superadmin lihat semua.
CREATE POLICY agent_ai_connections_select ON public.agent_ai_connections
  FOR SELECT USING (public.has_permission('m13.own_byok_connection.view', user_id));

-- 2) Self-manage — create/update/rotate/test/enable/disable/disconnect oleh pemilik
-- sendiri. Enam verb selain 'create' berbagi scope identik (Superadmin=ALL,
-- Developer Partner=OWN) di baris matrix yang sama — dipakai satu action_code
-- representative ('update') untuk operasi UPDATE, konsisten dengan pola 0015 untuk
-- kasus multi-verb bergama scope. WITH CHECK memastikan pemilik tidak bisa mengubah
-- user_id (pindah kepemilikan) maupun mengeset disabled_by_admin=true sendiri
-- (sudah dicegah trigger juga — RLS + trigger sengaja tumpang tindih di sini,
-- lihat catatan defense-in-depth di atas trigger).
CREATE POLICY agent_ai_connections_self_insert ON public.agent_ai_connections
  FOR INSERT WITH CHECK (
    public.has_permission('m13.own_byok_connection.create', user_id)
    AND user_id = auth.uid()
    AND disabled_by_admin = false
  );

-- Catatan: WITH CHECK di sini SENGAJA tidak menduplikasi validasi disabled_by_admin
-- (mis. mencegah pemilik mereset disabled_by_admin=true→false) — itu sudah
-- ditegakkan otoritatif oleh trg_agent_ai_connection_transition di atas, yang
-- berjalan pada SETIAP UPDATE ke status/disabled_by_admin terlepas dari policy RLS
-- mana yang meloloskannya. Menduplikasi logika itu di sini hanya akan berisiko
-- keduanya drift kalau salah satu diedit di kemudian hari (R-02: satu sumber logika).
CREATE POLICY agent_ai_connections_self_update ON public.agent_ai_connections
  FOR UPDATE USING (
    public.has_permission('m13.own_byok_connection.update', user_id)
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- 3) Admin force — FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE. Redundan secara
-- sengaja dengan pengecekan di trigger (RLS mengatur AKSES, trigger mengatur
-- VALIDITAS transisi) — kalau permission ini dicabut dari Superadmin di masa depan,
-- RLS menutup jalur ini duluan sebelum sempat menyentuh trigger.
CREATE POLICY agent_ai_connections_admin_force ON public.agent_ai_connections
  FOR UPDATE USING (
    public.has_permission('m13.administrative_force_revoke_disable.execute')
  )
  WITH CHECK (
    public.has_permission('m13.administrative_force_revoke_disable.execute')
  );

-- Tidak ada policy DELETE sama sekali untuk agent_ai_connections (baik pemilik
-- maupun Superadmin) — SENGAJA. Siklus hidup koneksi hanya boleh berubah lewat
-- status (termasuk 'revoked' sebagai state final), bukan lewat penghapusan baris;
-- ini menjaga jejak audit (audit_logs) tetap punya entity_id yang valid untuk
-- ditelusuri kapan pun.

-- ── Fungsi pembungkus untuk 3 operasi admin (menutup D13-10 secara fisik) ──
-- Primitif yang benar-benar bisa dipanggil & diuji sekarang, meski route REST-nya
-- (Step 3/STEP-11) belum ditulis — pola yang sama seperti log_audit_event() di
-- 0012 dibuat sebelum ada satu pun route yang memanggilnya.
--
-- CARA PAKAI YANG BENAR: panggil lewat client server-side BIASA (createClient() dari
-- lib/supabase/server.ts, sesi user yang login sebagai Superadmin) — BUKAN admin
-- client (service role). SECURITY DEFINER di fungsi ini sudah cukup untuk bypass RLS
-- saat UPDATE tabel, tapi has_permission() DI DALAM fungsi tetap butuh auth.uid() dari
-- sesi user asli. Kalau dipanggil lewat admin/service-role client, auth.uid() akan
-- NULL dan permission check di bawah SELALU gagal — ini DISENGAJA (defense-in-depth),
-- supaya operasi force tidak pernah bisa dieksekusi tanpa identitas admin yang jelas
-- di baliknya, persis peringatan yang sudah ditulis di lib/supabase/admin.ts.
CREATE OR REPLACE FUNCTION public.admin_force_provider_connection(
  p_connection_id UUID,
  p_action        TEXT,  -- 'force_revoke' | 'force_disconnect' | 'force_disable'
  p_reason        TEXT DEFAULT NULL
)
RETURNS public.agent_ai_connections
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row                   public.agent_ai_connections;
  v_new_status            TEXT;
  v_new_disabled_by_admin BOOLEAN := false;
BEGIN
  IF NOT public.has_permission('m13.administrative_force_revoke_disable.execute') THEN
    RAISE EXCEPTION 'admin_force_provider_connection: tidak punya permission m13.administrative_force_revoke_disable.execute (D13-10)';
  END IF;

  IF p_action = 'force_revoke' THEN
    v_new_status := 'revoked';
  ELSIF p_action = 'force_disconnect' THEN
    v_new_status := 'disconnected';
  ELSIF p_action = 'force_disable' THEN
    v_new_status := 'disabled';
    v_new_disabled_by_admin := true;
  ELSE
    RAISE EXCEPTION 'admin_force_provider_connection: p_action harus salah satu dari force_revoke|force_disconnect|force_disable, diterima: %', p_action;
  END IF;

  UPDATE public.agent_ai_connections
  SET status = v_new_status,
      disabled_by_admin = v_new_disabled_by_admin,
      updated_at = now()
  WHERE id = p_connection_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'admin_force_provider_connection: connection % tidak ditemukan', p_connection_id;
  END IF;

  PERFORM public.log_audit_event(
    p_action      := 'm13.administrative_force_revoke_disable.execute',
    p_entity_type := 'agent_ai_connections',
    p_entity_id   := p_connection_id,
    p_old_value   := jsonb_build_object('requested_action', p_action, 'reason', p_reason),
    p_new_value   := jsonb_build_object('status', v_new_status, 'disabled_by_admin', v_new_disabled_by_admin)
  );

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.admin_force_provider_connection IS
  'Menutup D13-10 secara fisik: satu-satunya jalur untuk FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE. Mengecek permission sendiri (defense-in-depth di atas RLS+trigger), menulis audit_logs lewat log_audit_event() (0012). Dipanggil dari route handler Superadmin di Step 3/STEP-11 — belum ada route yang memanggilnya di migration ini, itu di luar scope Tahap 3 (migration), menyusul Step 5 sesuai rencana kerja yang disepakati.';
