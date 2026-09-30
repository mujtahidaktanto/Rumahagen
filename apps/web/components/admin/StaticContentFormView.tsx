"use client";

// components/admin/StaticContentFormView.tsx — Form Konten Publik (M11, wireframe 02-Admin/M09-Form-Konten-Publik): buat/ubah satu halaman static_public_content lewat POST/PUT
// /api/admin/static-content(/{id}), route baru 2026-09-30 (sebelumnya tabel ini tidak punya route API sama sekali). Manager hanya melihat (izin m11.static_public_content.publish
// hanya Superadmin/Admin, sama seperti tab Banner & Promosi).
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import type { StaticContentDetail } from "@/lib/admin/content-notif-data";
import { STATIC_CONTENT_STATUS_OPTIONS, staticContentStatus, validateStaticContentForm, type StaticContentForm } from "@/lib/admin/static-content-rules";
import { ApiClientError, api } from "@/lib/api-client";

function formFrom(c?: StaticContentDetail | null): StaticContentForm {
  return {
    title: c?.title ?? "",
    slug: c?.slug ?? "",
    content: c?.content ?? "",
    metaTitle: c?.metaTitle ?? "",
    metaDescription: c?.metaDescription ?? "",
    canonicalUrl: c?.canonicalUrl ?? "",
    indexability: (c?.indexability as "index" | "noindex") ?? "index",
    sitemapParticipation: c?.sitemapParticipation ?? true,
    status: c?.status ?? "draft",
  };
}

export function StaticContentFormView({ content, canManage }: { content?: StaticContentDetail | null; canManage: boolean }) {
  const router = useRouter();
  const isEdit = !!content;
  const initial = formFrom(content);
  const [f, setF] = useState<StaticContentForm>(initial);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = tried ? validateStaticContentForm(f) : {};
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const readOnly = !canManage;

  function set<K extends keyof StaticContentForm>(k: K, v: StaticContentForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setError(null);
  }

  async function save() {
    setTried(true);
    const errs = validateStaticContentForm(f);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    const body = {
      title: f.title.trim(),
      slug: f.slug.trim(),
      content: f.content.trim() || undefined,
      meta_title: f.metaTitle.trim() || undefined,
      meta_description: f.metaDescription.trim() || undefined,
      canonical_url: f.canonicalUrl.trim() || undefined,
      indexability: f.indexability,
      sitemap_participation: f.sitemapParticipation,
      ...(isEdit ? { status: f.status } : {}),
    };
    try {
      if (isEdit) {
        await api.put(`/admin/static-content/${content.id}`, body, { idempotency: true });
        router.refresh();
      } else {
        const res = await api.post<{ id: string }>("/admin/static-content", body, { idempotency: true });
        router.push(`/admin/konten/konten-publik/${res.data.id}` as Route);
      }
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 pb-28 lg:p-8 lg:pb-28">
      <nav className="flex items-center gap-1.5 text-caption">
        <Link href={"/admin/konten?tab=konten" as Route} className="text-blue-600">
          Konten &amp; Notifikasi
        </Link>
        <span>›</span>
        <Link href={"/admin/konten?tab=konten" as Route} className="text-blue-600">
          Konten Publik
        </Link>
        <span>›</span>
        <span className="truncate">{isEdit ? content.title : "Halaman baru"}</span>
      </nav>

      {readOnly ? <p className="rounded-md bg-info-100 p-3 text-body-md text-ink-700">Hanya Superadmin dan Admin yang bisa mengubah konten publik. Anda bisa melihatnya.</p> : null}

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <h2 className="mb-3.5 text-title-md">Isi halaman</h2>
        <div className="flex flex-col gap-3.5">
          <Field label="Judul" required error={errors.title}>
            {(a) => <Input {...a} value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} disabled={readOnly} />}
          </Field>
          <Field label="Alamat halaman (slug)" required hint="Hanya huruf kecil, angka, tanda hubung — mis. syarat-ketentuan." error={errors.slug}>
            {(a) => (
              <div className="flex items-center gap-2">
                <span className="text-caption">/konten/</span>
                <Input {...a} className="flex-1 font-mono" value={f.slug} onChange={(e) => set("slug", e.target.value)} maxLength={220} disabled={readOnly} />
              </div>
            )}
          </Field>
          <Field label="Isi" hint="Teks biasa: baris kosong = paragraf, ## Judul = subjudul, - butir = daftar. HTML tidak didukung.">
            {(a) => <Textarea {...a} rows={10} value={f.content} onChange={(e) => set("content", e.target.value)} disabled={readOnly} />}
          </Field>
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <h2 className="text-title-md">Mesin pencari (SEO)</h2>
        <p className="mb-3.5 text-caption">Tampil di hasil Google. Kosong = memakai judul dan awal isi halaman.</p>
        <div className="flex flex-col gap-3.5">
          <Field label="Judul SEO (opsional)" hint={`${f.metaTitle.length}/70`}>
            {(a) => <Input {...a} value={f.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} maxLength={70} disabled={readOnly} />}
          </Field>
          <Field label="Deskripsi SEO (opsional)" hint={`${f.metaDescription.length}/160`}>
            {(a) => <Textarea {...a} rows={2} value={f.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} maxLength={160} disabled={readOnly} />}
          </Field>
          <Field label="URL kanonik (opsional)" hint="Isi hanya bila halaman ini salinan dari alamat lain. Kosong = alamat halaman ini." error={errors.canonicalUrl}>
            {(a) => <Input {...a} type="url" placeholder="https://…" value={f.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} disabled={readOnly} />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Indeks mesin pencari</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => set("indexability", "index")}
                className={`rounded-md border p-3 text-left ${f.indexability === "index" ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
              >
                <span className="block text-label-lg">Boleh diindeks</span>
                <span className="text-caption">Bisa muncul di Google</span>
              </button>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => set("indexability", "noindex")}
                className={`rounded-md border p-3 text-left ${f.indexability === "noindex" ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
              >
                <span className="block text-label-lg">Jangan diindeks</span>
                <span className="text-caption">Halaman tetap bisa dibuka lewat tautan</span>
              </button>
            </div>
            <span className="text-caption">Jangan diindeks tidak menyembunyikan halaman dari pengunjung; hanya meminta mesin pencari tidak memuatnya.</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-label-lg">Ikut sitemap</span>
              <span className="text-caption">Hanya berlaku bila halaman Diterbitkan dan Boleh diindeks.</span>
            </div>
            <Switch checked={f.sitemapParticipation} onChange={(v) => set("sitemapParticipation", v)} disabled={readOnly} aria-label="Ikut sitemap" />
          </div>
        </div>
      </div>

      {isEdit ? (
        <div className="rounded-md border border-ink-100 bg-white p-5">
          <h2 className="text-title-md">Status</h2>
          <p className="mb-3.5 text-caption">Siklus: Draf → Diterbitkan → Tidak Diterbitkan → Diarsipkan. Hanya yang Diterbitkan terlihat pengunjung.</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STATIC_CONTENT_STATUS_OPTIONS.map((s) => {
              const st = staticContentStatus(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={readOnly}
                  onClick={() => set("status", s)}
                  className={`rounded-md border p-3 text-left ${f.status === s ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
                >
                  <span className="block text-label-lg">{st.label}</span>
                  <span className="text-caption">{st.hint}</span>
                </button>
              );
            })}
          </div>
          {content.publishedAt ? (
            <p className="mt-3 text-caption">Pertama diterbitkan: {new Date(content.publishedAt).toLocaleString("id-ID")}. Tanggal ini tidak berubah walau diterbitkan ulang.</p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      {!readOnly && dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-ink-100 bg-white p-4 shadow-3">
          <span className="text-body-md text-ink-700">Ada perubahan yang belum disimpan.</span>
          <div className="flex gap-2.5">
            <LinkButton href={"/admin/konten?tab=konten" as Route} variant="secondary">
              Batalkan
            </LinkButton>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
