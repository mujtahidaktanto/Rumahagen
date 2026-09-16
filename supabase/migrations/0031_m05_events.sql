-- 0031_m05_events.sql
-- Sumber kolom: STEP10-D entity EVENTS/EVENT_PROVIDER_BINDING (module M05).
-- Permission SUDAH ADA sejak Tahap 1 (12 permission M05, lihat 0009):
-- m05.event.{create,update,publish,lifecycle,visibility,cancellation}.

CREATE TABLE IF NOT EXISTS public.events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                VARCHAR(200) NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('training','launching_proyek','open_house','gathering')),
  description          TEXT,
  is_online            BOOLEAN NOT NULL DEFAULT false,
  location             VARCHAR(255),
  meeting_link         VARCHAR(500),
  host                 VARCHAR(150),
  quota                INT,
  related_course_id    UUID,  -- FK ke courses DITUNDA — courses (M04 Learning Catalog) di luar scope migration manapun sejauh ini, sama seperti course_id di learning_sessions/0021
  related_project_id   UUID,  -- FK ke developer_projects DITUNDA — dibangun di 0034 (nomor migration lebih besar dari file ini), FK ditambahkan lewat ALTER TABLE di 0034
  submitted_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visibility           TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','organization','private')),
  status               TEXT NOT NULL DEFAULT 'pending_approval'
                          CHECK (status IN ('pending_approval','published','rejected','cancelled')),
  start_at             TIMESTAMPTZ NOT NULL,
  end_at               TIMESTAMPTZ,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.events.related_project_id IS
  'FK ke developer_projects — TABEL TARGET BELUM ADA saat migration ini dibuat (developer_projects ada di 0034, nomor SETELAH file ini). Kolom tetap didefinisikan tanpa FK constraint fisik di sini (UUID biasa secara efektif, meski ditulis dengan REFERENCES di source comment untuk kejelasan niat) — FK sungguhan ditambahkan lewat ALTER TABLE di 0034 begitu developer_projects ada. Lihat pola serupa (loose reference, FK menyusul) di 0014/0018/0019.';

COMMENT ON COLUMN public.events.visibility IS
  'ADD-NEW — tidak eksplisit di STEP10-D EVENTS (tidak ada kolom visibility di physical definition), tapi permission m05.event.visibility SUDAH ADA di seed 0009 (Gate mengunci "Submission does not imply publish", menyiratkan ada kontrol visibilitas terpisah dari status approval) — kolom ditambahkan supaya permission itu punya sesuatu untuk digerbangi secara fisik, pola sama seperti profile_visibility di 0029.';

CREATE TABLE IF NOT EXISTS public.event_provider_bindings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  provider_selection    TEXT NOT NULL,
  binding_state         TEXT NOT NULL DEFAULT 'active'
                           CHECK (binding_state IN ('pending','active','ended','failed','replaced')),
  fallback_position     SMALLINT,
  effective_from        TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to          TIMESTAMPTZ,
  credential_reference  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_provider_bindings IS
  'Sumber: STEP10-D entity EVENT_PROVIDER_BINDING — SELURUH kolom (kecuali id/event_id) sql_physical_definition-nya kosong di dokumen sumber. Tipe di sini didesain mengikuti pola session_provider_bindings (0021, entity M04 sejenis) untuk konsistensi lintas modul: provider_selection ~ provider_key, binding_state ~ binding_state, credential_reference adalah REFERENSI (bukan credential itu sendiri — kredensial mentah tidak boleh disimpan di kolom ini apa pun bentuknya), fallback_position untuk urutan provider cadangan kalau provider utama gagal.';

-- ── RLS ──

ALTER TABLE public.events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_provider_bindings ENABLE ROW LEVEL SECURITY;

-- SELECT: event published+public terlihat siapa pun; submitter/staff lihat
-- semua status miliknya/dalam wewenangnya.
CREATE POLICY events_select ON public.events
  FOR SELECT USING (
    (status = 'published' AND visibility = 'public' AND deleted_at IS NULL)
    OR public.has_permission('m05.event.update', submitted_by)
    OR public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
  );

CREATE POLICY events_insert ON public.events
  FOR INSERT WITH CHECK (public.has_permission('m05.event.create', submitted_by));

CREATE POLICY events_update ON public.events
  FOR UPDATE USING (public.has_permission('m05.event.update', submitted_by));

-- Publish/Lifecycle/Cancellation dipisah dari Update biasa lewat trigger
-- (pola sama seperti listings/0018) supaya permission yang lebih spesifik
-- (publish, lifecycle, cancellation) benar-benar ditegakkan, bukan cuma
-- 'update' generik.
CREATE OR REPLACE FUNCTION public.enforce_event_lifecycle_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status <> 'published' THEN
    IF NOT public.has_permission('m05.event.publish', OLD.submitted_by) THEN
      RAISE EXCEPTION 'events: transisi ke published butuh permission m05.event.publish';
    END IF;
  END IF;

  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    IF NOT public.has_permission('m05.event.cancellation', OLD.submitted_by) THEN
      RAISE EXCEPTION 'events: transisi ke cancelled butuh permission m05.event.cancellation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_event_lifecycle_permissions
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.enforce_event_lifecycle_permissions();

CREATE POLICY event_provider_bindings_select ON public.event_provider_bindings
  FOR SELECT USING (
    public.is_superadmin()
    OR public.current_role_code() IN ('admin','manager')
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_provider_bindings.event_id AND e.submitted_by = auth.uid())
  );

CREATE POLICY event_provider_bindings_manage ON public.event_provider_bindings
  FOR ALL USING (public.is_superadmin() OR public.current_role_code() IN ('admin','manager'))
  WITH CHECK (public.is_superadmin() OR public.current_role_code() IN ('admin','manager'));
