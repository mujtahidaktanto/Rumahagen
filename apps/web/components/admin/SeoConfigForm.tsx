"use client";

// components/admin/SeoConfigForm.tsx — tab SEO Config (Konfigurasi Sistem, M09/M11): baris tunggal seo_config (migration 0097) lewat PUT /admin/config/seo, plus "Minta Reindex" (POST /admin/seo/reindex —
// HANYA mencatat last_reindex_requested_at/_by untuk audit, tidak ada crawl mesin pencari sungguhan; tidak ada kredensial Search Console/Webmaster di repo ini). Superadmin-only.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import type { SeoConfig } from "@/lib/admin/system-config-data";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

export function SeoConfigForm({ initial, readOnly }: { initial: SeoConfig; readOnly: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reindexOpen, setReindexOpen] = useState(false);
  const [reindexBusy, setReindexBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(
        "/admin/config/seo",
        {
          site_title_suffix: v.siteTitleSuffix?.trim() || null,
          default_meta_description: v.defaultMetaDescription?.trim() || null,
          default_og_image_url: v.defaultOgImageUrl?.trim() || null,
          robots_global_noindex: v.robotsGlobalNoindex,
          sitemap_enabled: v.sitemapEnabled,
        },
        { idempotency: true },
      );
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function reindex() {
    setReindexBusy(true);
    setError(null);
    try {
      const res = await api.post<{ last_reindex_requested_at: string }>("/admin/seo/reindex", undefined, { idempotency: true });
      setV((x) => ({ ...x, lastReindexRequestedAt: res.data.last_reindex_requested_at }));
      setReindexOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil mencatat permintaan. Coba lagi.");
    } finally {
      setReindexBusy(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Field label="Akhiran judul situs" hint="site_title_suffix">
        {(a) => <Input {...a} disabled={readOnly} value={v.siteTitleSuffix ?? ""} onChange={(e) => { setV((x) => ({ ...x, siteTitleSuffix: e.target.value })); setSaved(false); }} />}
      </Field>
      <Field label="Meta description default">
        {(a) => <Textarea {...a} rows={2} disabled={readOnly} value={v.defaultMetaDescription ?? ""} onChange={(e) => { setV((x) => ({ ...x, defaultMetaDescription: e.target.value })); setSaved(false); }} />}
      </Field>
      <Field label="URL gambar OG default">
        {(a) => <Input {...a} disabled={readOnly} value={v.defaultOgImageUrl ?? ""} onChange={(e) => { setV((x) => ({ ...x, defaultOgImageUrl: e.target.value })); setSaved(false); }} />}
      </Field>
      <label className="flex items-center gap-3">
        <Switch checked={v.robotsGlobalNoindex} disabled={readOnly} onChange={(n) => { setV((x) => ({ ...x, robotsGlobalNoindex: n })); setSaved(false); }} aria-label="robots_global_noindex" />
        <span className="text-body-md">robots_global_noindex — nonaktifkan indexing SELURUH situs (darurat)</span>
      </label>
      <label className="flex items-center gap-3">
        <Switch checked={v.sitemapEnabled} disabled={readOnly} onChange={(n) => { setV((x) => ({ ...x, sitemapEnabled: n })); setSaved(false); }} aria-label="sitemap_enabled" />
        <span className="text-body-md">sitemap_enabled</span>
      </label>
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button loading={busy} onClick={() => void save()}>
            Simpan Konfigurasi
          </Button>
          <Button variant="secondary" onClick={() => setReindexOpen(true)}>
            Minta Reindex
          </Button>
          {saved ? (
            <p role="status" className="text-caption text-success-600">
              Tersimpan.
            </p>
          ) : null}
        </div>
      ) : null}
      {v.lastReindexRequestedAt ? <p className="text-caption">Reindex terakhir diminta {formatDateTime(v.lastReindexRequestedAt)}.</p> : null}
      <p className="text-caption">Catatan jujur: &quot;Minta Reindex&quot; TIDAK memicu crawl mesin pencari sungguhan — hanya mencatat kapan &amp; oleh siapa reindex diminta untuk keperluan audit.</p>
      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={reindexOpen}
        onClose={() => (reindexBusy ? undefined : setReindexOpen(false))}
        title="Minta Reindex?"
        description="Ini hanya mencatat permintaan (last_reindex_requested_at/_by) untuk audit — tidak ada crawl sungguhan yang terpicu dari sini."
        footer={
          <>
            <Button variant="secondary" disabled={reindexBusy} onClick={() => setReindexOpen(false)}>
              Batal
            </Button>
            <Button loading={reindexBusy} onClick={() => void reindex()}>
              Catat Permintaan
            </Button>
          </>
        }
      />
    </div>
  );
}
