"use client";

// components/public/ListingGallery.tsx — galeri Detail Listing (wireframe M11): satu foto besar + dua foto kecil (layar lebar). Mengetuk foto atau "Lihat semua N foto" membuka
// PENAMPIL FOTO layar penuh: foto utuh (tidak dipotong), tombol sebelumnya/berikutnya, panah keyboard, geser jari, deretan gambar kecil untuk memilih, dan penghitung "2 / 5".
// Tanpa foto -> kotak abu "Belum ada foto". `overlay` = spanduk status di atas galeri.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Photo = { url: string; alt: string | null };

const cameraPath = "M4 8a2 2 0 0 1 2-2h1.2l1-1.6h7.6l1 1.6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z";

function Cover({ p, title, className }: { p: Photo; title: string; className?: string }) {
  // Foto dari storage (URL publik); gambar biasa tanpa optimasi Next agar tidak memakai kuota gambar Vercel.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={p.url} alt={p.alt ?? title} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
}

function Viewer({ photos, title, index, onIndex, onClose }: { photos: Photo[]; title: string; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = photos.length;

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el?.open) el.close();
    };
  }, []);

  const go = useCallback((d: number) => onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    thumbs.current[index]?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0]!.clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  }

  const p = photos[index]!;
  return (
    <dialog
      ref={ref}
      aria-label={`Foto ${title}`}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      className="m-0 h-dvh max-h-dvh w-screen max-w-none bg-ink-900 p-0 text-white backdrop:bg-ink-900"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 flex-none items-center justify-between px-4">
          <span aria-live="polite" className="text-label-lg">
            {index + 1} / {count}
          </span>
          <button type="button" onClick={onClose} aria-label="Tutup penampil foto" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
            <CloseIcon />
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
          onTouchStart={(e) => {
            touchX.current = e.touches[0]!.clientX;
          }}
          onTouchEnd={onTouchEnd}
        >
          {/* Foto utuh: object-contain agar tidak dipotong. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt={p.alt ?? `${title} — foto ${index + 1}`} className="max-h-full max-w-full object-contain" />
          {count > 1 ? (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className="absolute top-1/2 left-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:left-4">
                <ChevronLeftIcon size={22} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className="absolute top-1/2 right-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:right-4">
                <ChevronRightIcon size={22} />
              </button>
            </>
          ) : null}
        </div>

        {p.alt ? <p className="flex-none px-4 pt-2 text-center text-caption text-white/70">{p.alt}</p> : null}

        {count > 1 ? (
          <ul aria-label="Pilih foto" className="scroll-thin flex flex-none gap-2 overflow-x-auto px-4 py-3">
            {photos.map((t, i) => (
              <li key={t.url + i} className="flex-none">
                <button
                  type="button"
                  ref={(el) => {
                    thumbs.current[i] = el;
                  }}
                  onClick={() => onIndex(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  aria-current={i === index}
                  className={cn("block h-14 w-20 overflow-hidden rounded-sm border-2 sm:h-16 sm:w-24", i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100")}
                >
                  <Cover p={t} title={title} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </dialog>
  );
}

export function ListingGallery({ photos, title, overlay }: { photos: Photo[]; title: string; overlay?: ReactNode }) {
  const [viewer, setViewer] = useState<number | null>(null);
  const [main, ...rest] = photos;
  const subs = rest.slice(0, 2);

  return (
    <div className="relative mt-4 h-64 overflow-hidden rounded-lg bg-ink-100 sm:h-80 lg:h-[420px]">
      {main ? (
        <div className={cn("grid h-full gap-2", subs.length > 0 ? "lg:grid-cols-[2fr_1fr]" : "")}>
          <button type="button" onClick={() => setViewer(0)} aria-label="Lihat foto 1 lebih besar" className="h-full min-h-0 w-full">
            <Cover p={main} title={title} />
          </button>
          {subs.length > 0 ? (
            <div className="hidden min-h-0 grid-rows-2 gap-2 lg:grid">
              {subs.map((p, i) => (
                <button key={p.url + i} type="button" onClick={() => setViewer(i + 1)} aria-label={`Lihat foto ${i + 2} lebih besar`} className="min-h-0">
                  <Cover p={p} title={title} />
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
          onClick={() => setViewer(0)}
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

      {viewer !== null ? <Viewer photos={photos} title={title} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} /> : null}
    </div>
  );
}
