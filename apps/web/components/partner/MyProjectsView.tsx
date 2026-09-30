// components/partner/MyProjectsView.tsx — Kelola Proyek (M06, wireframe 03-Developer-Partner/M06-Kelola-Proyek): daftar proyek milik perusahaan sendiri.
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import type { MyProjectRow } from "@/lib/partner/project-data";
import { CATEGORY_LABEL, TRANSACTION_LABEL, projectStatus } from "@/lib/partner/project-rules";
import type { Part } from "@/lib/agent/dashboard-data";

export function MyProjectsView({ projects, linked }: { projects: Part<MyProjectRow[]>; linked: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Proyek Saya</h1>
          <p className="text-body-md text-ink-500">Proyek Coming Soon tampil publik sebagai &ldquo;Segera hadir&rdquo;. Status Aktif hanya diberikan tim RumahAgen.</p>
        </div>
        {linked ? (
          <LinkButton href={"/partner/proyek/baru" as Route}>+ Buat Proyek Baru</LinkButton>
        ) : null}
      </div>

      {!linked ? (
        <p className="rounded-md border border-warning-600/30 bg-warning-100 p-3.5 text-body-md text-ink-700">
          Akun Anda belum terhubung ke perusahaan developer. Hubungi tim RumahAgen lewat <Link href={"/partner/profil" as Route} className="font-bold text-blue-700">Profil Developer</Link>.
        </p>
      ) : !projects.ok ? (
        <ErrorState title="Proyek gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : projects.data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Belum ada proyek. Buat proyek pertama Anda.</p>
          <div className="mt-4 flex justify-center">
            <LinkButton href={"/partner/proyek/baru" as Route}>+ Buat Proyek Baru</LinkButton>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-100 bg-white">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-ink-100 text-caption">
                <th className="p-3 font-bold">Proyek</th>
                <th className="p-3 font-bold">Kategori</th>
                <th className="p-3 font-bold">Lokasi</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {projects.data.map((p) => {
                const st = projectStatus(p.status);
                return (
                  <tr key={p.id} className="border-b border-ink-50 last:border-b-0">
                    <td className="max-w-[280px] p-3 text-body-md break-words">{p.name}</td>
                    <td className="p-3 text-body-md">
                      {CATEGORY_LABEL[p.category] ?? p.category} · {TRANSACTION_LABEL[p.transactionType] ?? p.transactionType}
                    </td>
                    <td className="max-w-[200px] p-3 text-body-md break-words">{p.location ?? "—"}</td>
                    <td className="p-3">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="p-3">
                      <Link href={`/partner/proyek/${p.id}` as Route} className="text-label-lg text-blue-600">
                        Kelola
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
