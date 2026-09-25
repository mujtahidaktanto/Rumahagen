"use client";

// components/public/ListingGallery.tsx — galeri Detail Listing (wireframe M11): satu foto besar + dua foto kecil (layar lebar), tombol "Lihat semua N foto" membuka dialog
// berisi seluruh foto. Tanpa foto -> kotak abu bertuliskan "Belum ada foto". `overlay` = spanduk status (terjual/disewa/ditinjau/kedaluwarsa) di atas galeri.
import { useState } from "react";
import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";

type Photo = { url: string; alt: string | null };

const cameraPath = "M4 8a2 2 0 0 1 2-2h1.2l1-1.6h7.6l1 1.6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z";

function Img({ p, title, className }: { p: Photo; title: string; className?: string }) {
  // Foto dari storage (URL publik); gambar biasa tanpa optimasi Next agar tidak memakai kuota gambar Vercel.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={p.url} alt={p.alt ?? title} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
}

export function ListingGallery({ photos, title, overlay }: { photos: Photo[]; title: string; overlay?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [main, ...rest] = photos;
  const subs = rest.slice(0, 2);

  return (
    <div className="relative mt-4 h-64 overflow-hidden rounded-lg bg-ink-100 sm:h-80 lg:h-[420px]">
      {main ? (
        <div className={cn("grid h-full gap-2", subs.length > 0 ? "lg:grid-cols-[2fr_1fr]" : "")}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Lihat foto lebih besar" className="h-full min-h-0 w-full">
            <Img p={main} title={title} />
          </button>
          {subs.length > 0 ? (
            <div className="hidden min-h-0 grid-rows-2 gap-2 lg:grid">
              {subs.map((p, i) => (
                <button key={p.url + i} type="button" onClick={() => setOpen(true)} aria-label={`Lihat foto ${i + 2}`} className="min-h-0">
                  <Img p={p} title={title} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-body-md text-ink-500">Belum ada foto</div>
      )}

      {photos.length > 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-4 bottom-4 flex h-10 items-center gap-1.5 rounded-pill bg-ink-900/72 px-4 text-[13px] font-bold text-white"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={cameraPath} />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          Lihat semua {photos.length} foto
        </button>
      ) : null}

      {overlay ? <div className="absolute inset-0 flex items-center justify-center bg-ink-900/55">{overlay}</div> : null}

      <Dialog open={open} onClose={() => setOpen(false)} title={`Foto ${title}`} className="max-w-3xl">
        <ul className="flex max-h-[70dvh] flex-col gap-3 overflow-y-auto">
          {photos.map((p, i) => (
            <li key={p.url + i} className="overflow-hidden rounded-md bg-ink-100">
              <Img p={p} title={`${title} — foto ${i + 1}`} className="h-auto" />
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
