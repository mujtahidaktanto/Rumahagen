-- 0036_m08_notifications.sql
-- Menutup D13-07: "Implementasikan operasi dismiss/delivery-state untuk
-- Notification State di dashboard." Permission SUDAH ADA sejak Tahap 1:
-- m08.dashboard_projection.{project,read}, m08.notification_state.{read,
-- update_state}.
--
-- Sumber kolom: STEP10-D entity NOTIFICATIONS (module M08) — is_read sudah
-- ada, TAPI dismiss/delivery-state BELUM ada kolom fisiknya. Gate PRE-00-J §16
-- ("NOTIFICATION STATE DATA CONTRACT") eksplisit menyatakan gap ini CONTROLLED
-- dan bilang "the correct treatment is not to invent columns during PRE-00-J
-- ... Downstream work must reconcile the physical representation to the
-- locked semantic contract. No alternate notification table is authorized." —
-- migration inilah "downstream work" itu: 2 kolom ADD-NEW (dismissed_at,
-- delivery_status) ditambahkan ke SATU tabel notifications yang sama (bukan
-- tabel notification-state terpisah, sesuai larangan eksplisit gate).
--
-- ATURAN PALING PENTING dari gate (§12-14, WAJIB dipatuhi secara fisik):
-- "Notification State ≠ Notification Creation" — M08 TIDAK PUNYA permission
-- untuk membuat notifikasi, dan gate eksplisit menandai risiko keamanan kalau
-- user bisa INSERT notifikasi sembarang lewat RLS. KARENA ITU: TIDAK ADA
-- policy INSERT untuk notifications sama sekali (implicit-deny) — satu-satunya
-- jalur pembuatan notifikasi adalah fungsi create_notification() di bawah,
-- SECURITY DEFINER, dipanggil dari trigger/fungsi modul lain (event bisnis
-- yang governed) atau Superadmin/Admin (Gate §14: "Admin Notification Push").

CREATE TABLE IF NOT EXISTS public.notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type                  TEXT NOT NULL CHECK (type IN ('approval_status','event_reminder','listing_expiring','certificate_issued','lead_new','lainnya')),
  title                 VARCHAR(200),
  message               TEXT,
  related_entity_type   VARCHAR(50),
  related_entity_id     UUID,
  is_read               BOOLEAN NOT NULL DEFAULT false,
  dismissed_at          TIMESTAMPTZ,
  delivery_status       TEXT NOT NULL DEFAULT 'delivered' CHECK (delivery_status IN ('pending','delivered','failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS
  'Sumber: STEP10-D entity NOTIFICATIONS. `related_entity_type`/`related_entity_id` adalah REFERENSI OPAQUE (tanpa FK — tipe entity bervariasi) — Gate §15 mengunci bahwa detail sumber yang dilindungi TETAP tunduk pada RLS entity aslinya kalau di-query terpisah; title/message di sini adalah SALINAN pra-render yang dibuat saat notifikasi dibuat (lihat create_notification()), BUKAN pandangan live ke entity terkait, supaya tidak ada jalur pintas melihati data yang seharusnya tidak boleh dilihat penerima.';

COMMENT ON COLUMN public.notifications.dismissed_at IS
  'ADD-NEW — menutup gap "dismiss" di Gate §16. NULL = belum di-dismiss. Terpisah dari is_read (baca ≠ dismiss, sesuai daftar Gate §6.2: "read/unread; dismiss; delivery-state handling" adalah TIGA hal berbeda).';

COMMENT ON COLUMN public.notifications.delivery_status IS
  'ADD-NEW — menutup gap "delivery-state" di Gate §16. Default ''delivered'' karena repo ini belum punya mekanisme push/delivery eksternal (email/push notification) — semua notifikasi saat ini dianggap "terkirim" begitu baris dibuat (in-app only). Kalau nanti ada integrasi push sungguhan, governed mechanism itu yang akan mengubah ke ''pending''/''failed'' sesuai hasil pengiriman.';

-- ── Fungsi SATU-SATUNYA jalur pembuatan notifikasi ──
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id              UUID,
  p_type                 TEXT,
  p_title                VARCHAR(200),
  p_message              TEXT,
  p_related_entity_type  VARCHAR(50) DEFAULT NULL,
  p_related_entity_id    UUID DEFAULT NULL
)
RETURNS public.notifications
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification public.notifications;
BEGIN
  -- Gerbang minimal untuk pemanggilan MANUAL (mis. dari route Admin Notification
  -- Push, Gate §14) — TIDAK gerbang m08 apa pun (M08 memang tidak punya
  -- permission create). Pemanggilan OTOMATIS dari trigger/fungsi modul lain
  -- (mis. saat award diberikan, saat event mendekati) berjalan sebagai bagian
  -- dari transaksi modul itu sendiri, yang permission-nya SUDAH dicek modul
  -- pemanggil sebelum sampai ke sini — fungsi ini tidak perlu mengecek ulang
  -- untuk kasus itu karena SECURITY DEFINER + dipanggil internal, bukan
  -- endpoint publik.
  IF auth.uid() IS NOT NULL AND NOT (public.is_superadmin() OR public.current_role_code() = 'admin') THEN
    -- auth.uid() IS NOT NULL berarti dipanggil dari sesi user biasa (bukan
    -- dari dalam trigger/fungsi lain yang berjalan sebagai bagian alur sistem)
    -- — untuk kasus itu WAJIB Superadmin/Admin (Gate §14).
    RAISE EXCEPTION 'create_notification: pembuatan notifikasi manual butuh Superadmin/Admin (Gate PRE-00-J §14) — bukan permission M08, notifikasi otomatis dari event modul lain tidak lewat jalur ini';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_entity_type, p_related_entity_id)
  RETURNING * INTO v_notification;

  RETURN v_notification;
END;
$$;

COMMENT ON FUNCTION public.create_notification IS
  'Satu-satunya jalur fisik pembuatan notifikasi (Gate PRE-00-J §12-14: "Notification State ≠ Notification Creation", tidak boleh ada permission M08 untuk ini). title/message di-pass sebagai parameter oleh PEMANGGIL (modul lain) — pemanggil bertanggung jawab TIDAK menaruh detail terproteksi di dalamnya (Gate §15), fungsi ini tidak melakukan redaksi otomatis karena tidak tahu konteks sumbernya.';

-- ── RLS ──

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- TIDAK ADA policy INSERT sama sekali — lihat catatan di atas migration ini.

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (public.has_permission('m08.notification_state.read', user_id));

-- UPDATE: hanya is_read/dismissed_at yang boleh diubah actor sendiri (state,
-- bukan isi notifikasi) — trigger di bawah mencegah kolom lain diubah lewat
-- jalur ini, walau WITH CHECK sendiri sudah cukup ketat lewat has_permission.
CREATE POLICY notifications_update_state ON public.notifications
  FOR UPDATE USING (public.has_permission('m08.notification_state.update_state', user_id))
  WITH CHECK (public.has_permission('m08.notification_state.update_state', user_id));

CREATE OR REPLACE FUNCTION public.enforce_notification_state_only_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IS DISTINCT FROM OLD.type
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.message IS DISTINCT FROM OLD.message
     OR NEW.related_entity_type IS DISTINCT FROM OLD.related_entity_type
     OR NEW.related_entity_id IS DISTINCT FROM OLD.related_entity_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
  THEN
    RAISE EXCEPTION 'notifications: hanya is_read/dismissed_at/delivery_status yang boleh diubah lewat UPDATE (Gate PRE-00-J §12: Notification State ≠ Notification Creation/content mutation)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_notification_state_only_update
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_notification_state_only_update();
