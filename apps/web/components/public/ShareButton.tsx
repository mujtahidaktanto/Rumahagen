"use client";

// components/public/ShareButton.tsx — tombol Bagikan (wireframe M11): memakai Web Share API bila ada (HP), selain itu menyalin tautan halaman dan memberi tahu "Tautan disalin".
import { useState } from "react";

const icon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4" />
  </svg>
);

/** `label` = tombol berteks (mis. "Bagikan Profil"); tanpa label = tombol ikon bulat. `text` = teks ajakan yang ikut dibagikan lewat lembar bagikan perangkat. */
export function ShareButton({ title, label, text, className }: { title: string; label?: string; text?: string; className?: string }) {
  const [note, setNote] = useState<string | null>(null);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, ...(text ? { text } : {}), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote("Tautan disalin");
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // pengguna menutup lembar bagikan
      setNote("Tautan tidak dapat disalin");
    }
    setTimeout(() => setNote(null), 2500);
  }

  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      {label ? (
        <button type="button" onClick={share} className="flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-ink-100 px-4 text-label-lg text-blue-600 hover:bg-ink-50">
          {icon}
          {label}
        </button>
      ) : (
        <button type="button" onClick={share} aria-label="Bagikan" className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink-100 text-ink-700 hover:bg-ink-50">
          {icon}
        </button>
      )}
      <span role="status" aria-live="polite" className="absolute top-full right-0 mt-1 text-caption whitespace-nowrap text-ink-500">
        {note}
      </span>
    </span>
  );
}
