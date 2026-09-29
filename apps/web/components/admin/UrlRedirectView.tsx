// components/admin/UrlRedirectView.tsx — Pengalihan URL (M11, wireframe 02-Admin/M11-Pengalihan-URL): daftar url_redirects (migration 0051), tulis hanya
// m11.static_public_content.publish (superadmin+admin, migration 0130) — sama seperti gerbang tab Konten Publik di Konten & Notifikasi.
import { RedirectFormDialog } from "@/components/admin/RedirectFormDialog";
import { RedirectRowActions } from "@/components/admin/RedirectRowActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { RedirectRow } from "@/lib/admin/url-redirect-data";
import { redirectReasonLabel } from "@/lib/admin/url-redirect-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function UrlRedirectView({ redirects, canManage }: { redirects: Part<RedirectRow[]>; canManage: boolean }) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Pengalihan URL</h1>
          <p className="text-body-md text-ink-500">Alihkan pengunjung dari jalur lama ke jalur baru (mis. slug listing berubah) tanpa halaman 404.</p>
        </div>
        {canManage ? <RedirectFormDialog trigger={(open) => <Button onClick={open}>+ Buat Pengalihan</Button>} /> : null}
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {!redirects.ok ? (
          <ErrorState title="Data pengalihan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : redirects.data.length === 0 ? (
          <p className="py-16 text-center text-body-md text-ink-500">Belum ada pengalihan URL. Buat pengalihan pertama saat sebuah jalur berubah atau dihapus.</p>
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Jalur Lama</TH>
                  <TH>Jalur Baru</TH>
                  <TH>Tipe</TH>
                  <TH>Alasan</TH>
                  <TH>Dibuat</TH>
                  {canManage ? <TH>Aksi</TH> : null}
                </TR>
              </THead>
              <TBody>
                {redirects.data.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-mono text-body-md">{r.oldPath}</TD>
                    <TD className="font-mono text-body-md">{r.newPath}</TD>
                    <TD>
                      <Badge tone={r.redirectType === 301 ? "success" : "warning"}>{r.redirectType} — {r.redirectType === 301 ? "Permanen" : "Sementara"}</Badge>
                    </TD>
                    <TD className="text-body-md text-ink-500">{redirectReasonLabel(r.reason)}</TD>
                    <TD className="text-body-md text-ink-500">{dtf.format(new Date(r.createdAt))}</TD>
                    {canManage ? (
                      <TD>
                        <RedirectRowActions redirect={r} />
                      </TD>
                    ) : null}
                  </TR>
                ))}
              </TBody>
            </Table>
            <span className="text-caption">Menampilkan {redirects.data.length} pengalihan terbaru (dibatasi 300 baris).</span>
          </>
        )}
      </div>
    </div>
  );
}
