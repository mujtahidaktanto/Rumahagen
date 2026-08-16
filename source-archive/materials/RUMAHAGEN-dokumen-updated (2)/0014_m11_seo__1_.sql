-- ============================================================================
-- Migration 0014: Modul 11 — SEO & Analytics (url_redirects)
-- ENT: ENT-M11-UrlRedirect (konfigurasi GTM/GA4/GSC memakai system_configs)
-- ============================================================================

CREATE TABLE url_redirects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path        VARCHAR(300) UNIQUE NOT NULL,
  new_path        VARCHAR(300) NOT NULL,
  redirect_type   SMALLINT NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  reason          TEXT CHECK (reason IN ('slug_changed','listing_deleted','listing_merged','lainnya')),
  entity_type     VARCHAR(50),
  entity_id       UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_url_redirects_old_path ON url_redirects(old_path);

-- RLS: publik boleh baca (dipakai middleware redirect), tulis hanya via service role/trigger
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY url_redirects_select ON url_redirects FOR SELECT TO anon, authenticated USING (true);

-- Trigger wajib: tulis redirect saat listings.slug berubah (ERD v1.3 Bagian 4 poin 12)
CREATE OR REPLACE FUNCTION log_listing_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO url_redirects (old_path, new_path, reason, entity_type, entity_id)
    VALUES ('/listing/' || OLD.slug, '/listing/' || NEW.slug, 'slug_changed', 'listing', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_listings_slug_redirect AFTER UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION log_listing_slug_change();

CREATE OR REPLACE FUNCTION log_developer_project_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    INSERT INTO url_redirects (old_path, new_path, reason, entity_type, entity_id)
    VALUES ('/developer/' || OLD.slug, '/developer/' || NEW.slug, 'slug_changed', 'developer_project', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_developer_projects_slug_redirect AFTER UPDATE ON developer_projects
  FOR EACH ROW EXECUTE FUNCTION log_developer_project_slug_change();
