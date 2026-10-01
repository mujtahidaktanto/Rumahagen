// components/public/DeveloperDetailView.tsx — Profil Publik Developer (/developer/{slug}, M06, migration 0172): logo/nama, Tentang Developer, Riwayat Perumahan
// (logo+nama, citra brand), Proyek dari Developer Ini, dan kartu Kontak (WhatsApp PIC). Pola struktur sama persis seperti components/public/OrganizationDetailView.tsx
// (banner gradien bawaan karena developer_partners tidak punya kolom banner, kepala profil, bagian, kartu kontak sticky).
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { ProjectCard } from "@/components/public/ProjectCard";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { BuildingIcon } from "@/components/ui/icons";
import type { DeveloperHistoryItem, PublicDeveloper } from "@/lib/public/developer-data";
import type { ProjectSummary } from "@/lib/public/project-data";
import { whatsappUrl } from "@/lib/format";
import { safeHref } from "@/lib/public/promo-data";
import { initialsOf } from "@/lib/initials";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

export function DeveloperDetailView({
  developer,
  history,
  historyOk,
  projects,
  projectsOk,
}: {
  developer: PublicDeveloper;
  history: DeveloperHistoryItem[];
  historyOk: boolean;
  projects: ProjectSummary[];
  projectsOk: boolean;
}) {
  const logo = safeHref(developer.company_logo);
  const wa = developer.pic_contact ? whatsappUrl(developer.pic_contact, `Halo, saya tertarik dengan perumahan dari ${developer.company_name}.`) : null;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1.5 pt-4 text-[13px] text-ink-500">
        <Link href="/" className="text-ink-500">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={"/developer" as Route} className="text-ink-500">
          Developer
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate text-ink-900">
          {developer.company_name}
        </span>
      </nav>

      <div className="mt-4 aspect-[4/1] rounded-lg bg-linear-to-br from-blue-700 to-blue-500" aria-hidden="true" />

      <div className="-mt-9 flex items-end gap-4 px-4 sm:px-6">
        {logo ? (
          // Logo dari storage (URL publik); gambar biasa tanpa optimasi Next.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-20 w-20 flex-none rounded-lg border-4 border-white bg-white object-cover shadow-2" />
        ) : (
          <span aria-hidden="true" className="flex h-20 w-20 flex-none items-center justify-center rounded-lg border-4 border-white bg-white text-[24px] font-extrabold text-blue-600 shadow-2">
            {initialsOf(developer.company_name)}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-1">
          <h1 className="text-headline break-words">{developer.company_name}</h1>
          <span className="text-body-md text-ink-500">Developer Partner</span>
        </div>
      </div>

      <div className="grid items-start gap-8 pt-8 pb-14 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section title="Tentang Developer">
            {developer.description ? <p className="whitespace-pre-line text-body-md text-ink-700">{developer.description}</p> : <p className="text-body-md text-ink-500">Developer ini belum menambahkan deskripsi.</p>}
          </Section>

          <Section title="Riwayat Perumahan">
            {!historyOk ? (
              <ErrorState title="Riwayat belum bisa dimuat" message="Terjadi gangguan saat mengambil riwayat perumahan. Muat ulang beberapa saat lagi." className="py-8" />
            ) : history.length === 0 ? (
              <EmptyState title="Belum ada riwayat perumahan" message="Developer ini belum menambahkan riwayat perumahan." className="py-8" />
            ) : (
              <ul className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3">
                {history.map((h) => (
                  <li key={h.id} className="flex flex-col items-center gap-2 rounded-md border border-ink-100 bg-white p-3.5 text-center">
                    <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-ink-100">
                      {h.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BuildingIcon size={20} className="text-ink-400" />
                      )}
                    </span>
                    <span className="line-clamp-2 text-body-md text-ink-900">{h.projectName}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Proyek dari Developer Ini">
            {!projectsOk ? (
              <ErrorState title="Proyek belum bisa dimuat" message="Terjadi gangguan saat mengambil proyek. Muat ulang beberapa saat lagi." className="py-8" />
            ) : projects.length === 0 ? (
              <EmptyState title="Belum ada proyek aktif" message="Belum ada proyek aktif dari developer ini." className="py-8" />
            ) : (
              <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id} className="flex">
                    <div className="flex w-full flex-col [&>a]:h-full">
                      <ProjectCard project={p} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <aside aria-label="Kontak Developer" className="flex flex-col gap-3.5 rounded-lg border border-ink-100 bg-white p-5 shadow-2">
            <span className="text-label-md text-ink-500">Kontak Developer</span>
            {developer.pic_name ? <p className="text-body-md text-ink-700">PIC: {developer.pic_name}</p> : null}
            {wa ? (
              <WhatsAppButton href={wa} className="w-full" />
            ) : developer.pic_contact ? (
              <p className="text-body-md text-ink-700">Kontak: {developer.pic_contact}</p>
            ) : (
              <p className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">Kontak developer belum tersedia.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
