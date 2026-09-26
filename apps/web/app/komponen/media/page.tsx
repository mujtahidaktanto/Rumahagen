// app/komponen/media/page.tsx — uji pengecilan foto di browser (tanpa unggah): pilih foto, lihat ukuran ketiga varian listing dan avatar 512. Sembunyikan di produksi dengan HIDE_DEV_PAGES=1.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaLab } from "./MediaLab";

export const metadata: Metadata = { title: "Uji Foto | RumahAgen", robots: { index: false, follow: false } };

export default function MediaLabPage() {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  return <MediaLab />;
}
