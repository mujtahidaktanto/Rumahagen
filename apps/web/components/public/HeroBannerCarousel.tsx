"use client";

// components/public/HeroBannerCarousel.tsx — slider blok hero Homepage (app/(publik)/page.tsx): auto-play tiap 5 detik (jeda saat dihover atau ada >1 slide),
// panah kiri/kanan dan titik navigasi untuk geser manual. Gambar dari Supabase Storage (bucket home-hero-media, migration 0167) memakai <img> biasa TANPA
// next/image — proyek ini belum mengonfigurasi images.remotePatterns untuk domain Storage (pola sama seperti gambar banner Promo/branding Organisasi).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { HeroBannerSlide } from "@/lib/public/home-hero-data";

const AUTOPLAY_MS = 5000;

export function HeroBannerCarousel({ slides }: { slides: HeroBannerSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length, paused]);

  // Daftar slide berubah (mis. revalidate) dan indeks lama sudah di luar jangkauan.
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  if (slides.length === 0) return null;
  const s = slides[Math.min(index, slides.length - 1)]!;
  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={s.imageUrl} alt={s.altText} className="absolute inset-0 h-full w-full object-cover" />
  );

  return (
    <div className="relative hidden aspect-[4/3] overflow-hidden rounded-lg lg:block" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {s.href ? (
        <Link href={s.href as Route} className="absolute inset-0" aria-label={s.altText || "Lihat selengkapnya"} {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {image}
        </Link>
      ) : (
        image
      )}
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-900 hover:bg-white"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-900 hover:bg-white"
          >
            <ChevronRightIcon size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Pilih slide">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2 rounded-pill transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
