// components/agent/MyListingsView.tsx — isi "Listing Saya" (M03, wireframe 01-Agent/M03-Listing-Saya): kartu kuota, filter status (nilai CHECK apa adanya, dengan jumlah), daftar listing dengan
// catatan kuota per listing, dan "Muat Lebih Banyak" (?tampil=). Filter di URL (server-render tanpa JS). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses.
// "Tambah Listing" menuju wizard /agent/listing/baru.
import Link from "next/link";
import type { Route } from "next";
import { ListingQuotaCard } from "@/components/agent/ListingQuotaCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ListingStatusBadge } from "@/components/ui/StatusBadge";
import { BuildingIcon, EyeIcon, PinIcon } from "@/components/ui/icons";
import type { MyListingsData } from "@/lib/agent/listing-data";
import { MY_LISTING_STATUSES, myListingsQuery, MY_LISTING_PAGE_SIZE, type MyListingsSearch } from "@/lib/agent/listing-params";
import { cn } from "@/lib/cn";
import { listingPhotoUrl } from "@/lib/media/variants";

const nf = new Intl.NumberFormat("id-ID");
const NOTE_CLS = { normal: "text-ink-500", warn: "text-warning-600", danger: "text-danger-600" } as const;

export function MyListingsView({ data, search }: { data: MyListingsData; search: MyListingsSearch }) {
  const list = data.list.ok ? data.list.data : null;
  const chips: { key: "semua" | (typeof MY_LISTING_STATUSES)[number]; label: string; count: number }[] = list
    ? [{ key: "semua", label: "Semua", count: list.total }, ...MY_LISTING_STATUSES.map((k) => ({ key: k, label: k, count: list.counts[k] ?? 0 }))]
    : [];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Listing Saya</h1>
        <LinkButton href={"/agent/listing/baru" as Route}>+ Tambah Listing</LinkButton>
      </div>

      <ListingQuotaCard quota={data.quota} />

      {list ? (
        <nav aria-label="Filter status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          {chips.map((c) => (
            <Link
              key={c.key}
              href={`/agent/listing${myListingsQuery(search, { status: c.key, tampil: MY_LISTING_PAGE_SIZE })}` as Route}
              aria-current={search.status === c.key ? "page" : undefined}
              className={cn(
                "inline-flex h-10 flex-none items-center gap-1.5 rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
                search.status === c.key ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
              )}
            >
              {c.label}
              <span className={search.status === c.key ? "text-white/80" : "text-ink-500"}>·{nf.format(c.count)}</span>
            </Link>
          ))}
        </nav>
      ) : null}

      {search.status === "pending_review" && list ? (
        <p role="note" className="rounded-md bg-info-100 p-3.5 text-body-md text-ink-900">
          Listing di bawah ini <strong>sudah pernah tayang</strong> dan sedang ditinjau ulang tim kami karena dugaan pelanggaran (mis. foto tidak sesuai aturan) — bukan listing baru yang menunggu persetujuan pertama kali.
        </p>
      ) : null}

      {!list ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Gagal memuat listing" message="Periksa koneksi internet Anda, lalu coba lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={`/agent/listing${myListingsQuery(search)}` as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : list.items.length === 0 ? (
        <div className="rounded-md bg-white">
          {list.total === 0 ? (
            <>
              <EmptyState title="Belum ada listing" message="Buat listing pertama Anda. Listing tersimpan sebagai draf sampai Anda menerbitkannya." />
              <div className="flex justify-center pb-10">
                <LinkButton href={"/agent/listing/baru" as Route} size="sm">
                  Tambah Listing
                </LinkButton>
              </div>
            </>
          ) : (
            <>
              <EmptyState title={`Tidak ada listing berstatus "${search.status}"`} message="Coba pilih filter lain, atau buat listing baru." />
              <div className="flex justify-center pb-10">
                <LinkButton href={"/agent/listing" as Route} variant="secondary" size="sm">
                  Lihat Semua
                </LinkButton>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {list.items.map((l) => (
              <li key={l.id}>
                <Link href={`/agent/listing/${l.id}` as Route} className="flex items-stretch gap-4 rounded-md border border-ink-100 bg-white p-3.5 text-inherit no-underline hover:shadow-2 hover:no-underline sm:p-4">
                  {l.coverUrl ? (
                    // Foto sampul dari data (URL tersimpan); gambar biasa tanpa optimasi Next.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listingPhotoUrl(l.coverUrl, "sm") ?? l.coverUrl} alt="" className="h-20 w-24 flex-none rounded-sm bg-ink-100 object-cover sm:h-24 sm:w-32" />
                  ) : (
                    <span aria-hidden="true" className="flex h-20 w-24 flex-none items-center justify-center rounded-sm bg-ink-100 text-ink-300 sm:h-24 sm:w-32">
                      <BuildingIcon size={24} />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-label-lg break-words text-ink-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{l.title}</span>
                      <ListingStatusBadge status={l.status} className="flex-none" />
                    </div>
                    {l.location ? (
                      <span className="flex items-center gap-1.5 text-body-md text-ink-500">
                        <PinIcon size={14} className="flex-none" />
                        <span className="truncate">{l.location}</span>
                      </span>
                    ) : null}
                    {l.note ? <span className={cn("text-caption", NOTE_CLS[l.note.tone])}>{l.note.text}</span> : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                      <span className="text-title-md text-blue-600">{l.priceText}</span>
                      <span className="flex items-center gap-1.5 text-caption">
                        <EyeIcon size={14} />
                        {nf.format(l.viewCount)} dilihat
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center gap-2.5 pt-2">
            <span className="text-caption">
              Menampilkan {list.items.length} dari {nf.format(list.filteredTotal)} listing
            </span>
            {list.items.length < list.filteredTotal ? (
              <LinkButton href={`/agent/listing${myListingsQuery(search, { tampil: search.tampil + MY_LISTING_PAGE_SIZE })}` as Route} variant="secondary">
                Muat Lebih Banyak
              </LinkButton>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
