// components/public/PublicFooter.tsx — footer Global Public Shell (wireframe M11): merek + deskripsi, tiga kolom tautan, kolom aplikasi ("segera hadir"), hak cipta.
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { FOOTER_COLUMNS } from "./public-nav";

export function PublicFooter() {
  return (
    <footer className="mt-14 bg-ink-900 pt-12 text-white/70">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 pb-9 sm:px-6 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] xl:px-10">
        <div className="flex flex-col gap-3.5">
          <Logo height={26} className="self-start brightness-0 invert" />
          <p className="max-w-65 text-body-md text-white/55">
            Platform properti yang menghubungkan pembeli, agen, developer, dan peluang belajar dalam satu ekosistem.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col">
            <span className="text-label-md text-white/40">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.label} href={l.href} className="min-h-9 py-1.5 text-[13.5px] text-white/70 no-underline hover:text-white hover:no-underline">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
        <div className="flex flex-col">
          <span className="text-label-md text-white/40">Download Aplikasi</span>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex h-11 items-center rounded-sm border-[1.5px] border-white/20 px-3.5 text-[12px] text-white">Segera hadir di Google Play</div>
            <div className="flex h-11 items-center rounded-sm border-[1.5px] border-white/20 px-3.5 text-[12px] text-white">Segera hadir di App Store</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 xl:px-10">
          <span className="text-caption text-white/40">© {new Date().getFullYear()} RumahAgen.com — Seluruh hak cipta dilindungi.</span>
        </div>
      </div>
    </footer>
  );
}
