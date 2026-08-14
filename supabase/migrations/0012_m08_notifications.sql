-- ============================================================================
-- Migration 0012: Modul 8 — Dashboard & Notifikasi
-- ENT: ENT-M08-Notification (Dashboard tidak punya tabel sendiri — agregator query)
-- ============================================================================

CREATE TABLE notifications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL CHECK (type IN ('approval_status','event_reminder','listing_expiring','certificate_issued','lead_new','lainnya')),
  title                VARCHAR(200),
  message              TEXT,
  related_entity_type  VARCHAR(50),
  related_entity_id    UUID,
  is_read              BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- RLS: strict own-only, tanpa bocor lintas-scope (REQ-M08-005)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own ON notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
