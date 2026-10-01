"use client";

// components/public/ListingVideoSection.tsx — tautan Video dan Virtual Tour/3D (listing_videos, migration 0047) di Detail Listing publik: SENGAJA bagian terpisah
// di bawah galeri foto (bukan digabung ke ListingGallery), dan kartu Video terpisah dari kartu Virtual Tour (agen bisa isi salah satu saja tanpa tercampur).
// Pemutar (iframe YouTube/Vimeo atau <video> berkas langsung) baru dimuat saat tombol "Putar"/"Buka" diklik (malas-muat) -- sebelum diklik cuma kartu ringan tanpa
// kode pihak ketiga, supaya tidak membebani waktu muat halaman awal. TANPA autoplay -- pemutar bawaan YouTube/Vimeo tampil dulu (thumbnail + tombol putarnya
// sendiri), suara baru jalan kalau pengunjung klik tombol putar itu secara eksplisit (hindari suara mengejutkan begitu kartu diklik). Tombol Tutup melepas
// iframe/<video> dari DOM sepenuhnya (bukan cuma disembunyikan) supaya pemutaran benar-benar berhenti, lalu kembali ke tampilan kartu.
// Virtual tour ditanam apa adanya (tautan share penyedia tur seperti Matterport umumnya sudah bisa ditanam langsung); kalau gagal ditanam, tautan "Buka di tab baru" tetap tersedia sebagai cadangan.
import { useState } from "react";
import { CloseIcon, PlayCircleIcon, VideoIcon, LayersIcon } from "@/components/ui/icons";

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/70 text-white hover:bg-ink-900">
      <CloseIcon size={16} />
    </button>
  );
}

type VideoRow = { url: string; type: "video" | "virtual_tour" };

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1]! : null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1]! : null;
}
const isDirectFile = (url: string) => /\.(mp4|webm|ogv)(\?|$)/i.test(url);

function VideoCard({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  if (!playing) {
    return (
      <button type="button" onClick={() => setPlaying(true)} className="flex w-full items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-left hover:border-blue-500">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <VideoIcon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-label-lg text-ink-900">Video Properti</span>
          <span className="block text-caption">Ketuk untuk memutar</span>
        </span>
        <PlayCircleIcon size={26} className="flex-none text-blue-600" />
      </button>
    );
  }
  const yt = youtubeId(url);
  const vm = !yt ? vimeoId(url) : null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-ink-900">
      <CloseButton onClick={() => setPlaying(false)} label="Tutup video" />
      {yt ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title="Video Properti" allow="encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
      ) : vm ? (
        <iframe src={`https://player.vimeo.com/video/${vm}`} title="Video Properti" allow="encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
      ) : isDirectFile(url) ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls className="h-full w-full">
          <source src={url} />
        </video>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="flex h-full w-full items-center justify-center text-label-lg text-white underline">
          Buka Video di Tab Baru
        </a>
      )}
    </div>
  );
}

function VirtualTourCard({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  if (!playing) {
    return (
      <button type="button" onClick={() => setPlaying(true)} className="flex w-full items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-left hover:border-blue-500">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <LayersIcon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-label-lg text-ink-900">Virtual Tour / 3D</span>
          <span className="block text-caption">Ketuk untuk menjelajahi</span>
        </span>
        <PlayCircleIcon size={26} className="flex-none text-blue-600" />
      </button>
    );
  }
  return (
    <div className="relative flex aspect-video w-full flex-col overflow-hidden rounded-md bg-ink-900">
      <CloseButton onClick={() => setPlaying(false)} label="Tutup virtual tour" />
      <iframe src={url} title="Virtual Tour" allow="fullscreen; xr-spatial-tracking" allowFullScreen className="h-full w-full" />
      <a href={url} target="_blank" rel="noreferrer" className="bg-ink-900 px-3 py-2 text-center text-caption text-white/70 underline">
        Tidak tampil? Buka di tab baru
      </a>
    </div>
  );
}

export function ListingVideoSection({ videos }: { videos: VideoRow[] }) {
  const video = videos.find((v) => v.type === "video");
  const tour = videos.find((v) => v.type === "virtual_tour");
  if (!video && !tour) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {video ? <VideoCard url={video.url} /> : null}
      {tour ? <VirtualTourCard url={tour.url} /> : null}
    </div>
  );
}
