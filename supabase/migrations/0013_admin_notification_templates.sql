-- 0013_admin_notification_templates.sql
-- Menutup residual D13-08: "M09 Notification Template/Content Configuration is
-- locked ADD-NEW but lacks a complete current Core endpoint/storage contract."
-- Dikonfirmasi di STEP12-G_CONTROLLED_PHYSICAL_DELTA_REGISTER.csv:
-- "No dedicated current physical table evidenced" + STEP12-G capability matrix
-- PAR-031: "notifications is state, not template authority" — artinya tabel
-- `notifications` (sudah ada di Core, dipakai M08 dashboard) BUKAN tempat
-- menyimpan template/wording, hanya instance notifikasi yang sudah terkirim.
-- Tabel ini BARU (ADD-NEW per klasifikasi di master matrix), didesain dari nol
-- mengikuti pola tabel M09 lain (id/updated_by/updated_at) + reuse enum `type`
-- yang sama persis dengan kolom `notifications.type` supaya konsisten.
--
-- Permission: `m09.notification_template_content.configure` — SUDAH ada di seed
-- 0009 (Superadmin=ALL, Admin=ALL, Manager=ALL, sisanya NONE). Satu action
-- "Configure" menutup CRUD penuh (tidak ada split view/manage di baris sumber
-- ini, beda dengan System Configuration yang punya dua action terpisah).

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT NOT NULL UNIQUE
                     CHECK (type IN ('approval_status','event_reminder','listing_expiring','certificate_issued','lead_new','lainnya')),
  title_template   VARCHAR(200) NOT NULL,
  message_template TEXT NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  updated_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notification_templates IS
  'BARU (ADD-NEW). Menyimpan wording template per tipe notifikasi (kolom `type` sinkron dengan notifications.type). "Presentation/content config; source event remains domain-owned" (kondisi di master matrix) — artinya tabel ini HANYA mengatur judul/isi teks, bukan KAPAN/KENAPA notifikasi dikirim (itu tetap tanggung jawab modul sumber event, mis. M03 untuk listing_expiring).';

-- title_template/message_template mendukung placeholder gaya {{nama_variabel}},
-- diisi oleh kode aplikasi saat mengirim notifikasi nyata (bukan bagian dari DDL ini).

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_templates_all ON public.notification_templates
  FOR ALL USING (public.has_permission('m09.notification_template_content.configure'))
  WITH CHECK (public.has_permission('m09.notification_template_content.configure'));

-- Seed minimal: satu baris placeholder per tipe enum yang sudah dikunci di
-- NOTIFICATIONS, supaya tabel tidak kosong dan langsung bisa dites (pola sama
-- seperti seed dbr_config di 0009).
INSERT INTO public.notification_templates (type, title_template, message_template)
VALUES
  ('approval_status',   'Status persetujuan Anda diperbarui', 'Status {{entity_type}} Anda kini: {{status}}.'),
  ('event_reminder',    'Pengingat acara: {{event_title}}',   'Acara {{event_title}} akan dimulai pada {{event_time}}.'),
  ('listing_expiring',  'Listing Anda akan kedaluwarsa',       'Listing "{{listing_title}}" akan kedaluwarsa pada {{expires_at}}.'),
  ('certificate_issued','Sertifikat Anda telah terbit',        'Sertifikat untuk {{qualification_title}} sudah bisa diunduh.'),
  ('lead_new',          'Prospek baru masuk',                  'Anda menerima prospek baru untuk {{listing_title}}.'),
  ('lainnya',           'Notifikasi',                          '{{message}}')
ON CONFLICT (type) DO NOTHING;
