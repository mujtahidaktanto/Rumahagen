// app/(publik)/agen/page.tsx — Daftar Agen publik (M11 Discovery, tab Agen): cari nama/kota/kantor, urut listing terbanyak atau nama, "Muat Lebih Banyak" (?tampil=). Data dari view
// public_agent_profiles (hanya profil publik). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Halaman dengan pencarian tidak diindeks.
import type { Metadata, Route } from "next";
import { AgentCard } from "@/components/public/AgentCard";
import { DiscoveryTabs } from "@/components/public/DiscoveryTabs";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { SearchIcon } from "@/components/ui/icons";
import { AGENT_MAX_SHOWN, AGENT_PAGE_SIZE, agentQuery, parseAgentSearch, searchAgents } from "@/lib/public/agent-data";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const s = parseAgentSearch(await searchParams);
  const filtered = s.q !== "" || s.urut !== "listing" || s.tampil !== AGENT_PAGE_SIZE;
  return {
    title: s.q ? `Cari agen “${s.q}” | RumahAgen` : "Cari Agen Properti | RumahAgen",
    description: "Temukan agen properti profesional dan terverifikasi di seluruh Indonesia.",
    alternates: { canonical: "/agen" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function AgentDiscoveryPage({ searchParams }: Props) {
  const search = parseAgentSearch(await searchParams);
  const result = await searchAgents(search);

  return (
    <div>
      <form action="/agen" method="get">
        <div className="border-b border-ink-100 bg-white py-5">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
            <DiscoveryTabs active="agen" />
            <div role="search" className="flex flex-col gap-2.5 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Cari agen</span>
                <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search.q}
                  maxLength={100}
                  placeholder="Cari nama agen, kota, atau kantor…"
                  className="h-11 w-full rounded-sm border-[1.5px] border-ink-100 bg-white pr-3.5 pl-10 text-body-md text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none"
                />
              </label>
              <select
                name="urut"
                defaultValue={search.urut}
                aria-label="Urutkan"
                className="h-11 rounded-sm border-[1.5px] border-ink-100 bg-white px-3 text-[13px] font-semibold text-ink-700"
              >
                <option value="listing">Listing terbanyak</option>
                <option value="nama">Nama (A–Z)</option>
              </select>
              <Button type="submit">Cari</Button>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-surface">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-6 xl:px-10">
          <p className="mb-4 text-body-md text-ink-500" aria-live="polite">
            {result.ok ? (
              <>
                <strong className="text-ink-900">{new Intl.NumberFormat("id-ID").format(result.total)}</strong> agen ditemukan
              </>
            ) : null}
          </p>

          {!result.ok ? (
            <div className="rounded-md bg-white">
              <ErrorState title="Gagal memuat daftar agen" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
              <div className="flex justify-center pb-10">
                <LinkButton href={`/agen${agentQuery(search)}` as Route} variant="secondary" size="sm">
                  Coba Lagi
                </LinkButton>
              </div>
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-md bg-white">
              <EmptyState
                title={search.q ? "Tidak ada agen yang cocok" : "Belum ada agen"}
                message={search.q ? "Coba kata kunci lain, misalnya nama kota atau nama kantor." : "Profil agen yang dipublikasikan akan tampil di sini."}
              />
              {search.q ? (
                <div className="flex justify-center pb-10">
                  <LinkButton href={"/agen" as Route} variant="secondary" size="sm">
                    Reset Pencarian
                  </LinkButton>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((a) => (
                  <li key={a.user_id}>
                    <AgentCard agent={a} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center gap-2.5 pt-7">
                <span className="text-caption">
                  Menampilkan {result.items.length} dari {result.total} agen
                </span>
                {result.items.length < result.total && search.tampil < AGENT_MAX_SHOWN ? (
                  <LinkButton href={`/agen${agentQuery(search, { tampil: search.tampil + AGENT_PAGE_SIZE })}` as Route} variant="secondary" scroll={false} rel="nofollow">
                    Muat Lebih Banyak
                  </LinkButton>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
