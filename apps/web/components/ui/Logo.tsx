// components/ui/Logo.tsx — logo RumahAgen (berkas: public/brand/rumahagen-logo.png, dipangkas dari docs/design/wireframes-v2/assets/rumahagen-logo.png; rasio 480:106).
// Logo berwarna (biru dan emas): tampilkan di latar TERANG (putih), seperti wireframe (header putih di atas rel biru). `unoptimized`: berkas sudah kecil, dan menghindari kuota optimasi gambar Vercel.
import Image from "next/image";
import { cn } from "@/lib/cn";

const RATIO = 480 / 106;

export function Logo({ height = 34, className }: { height?: number; className?: string }) {
  return (
    <Image
      src="/brand/rumahagen-logo.png"
      alt="RumahAgen"
      width={Math.round(height * RATIO)}
      height={height}
      priority
      unoptimized
      className={cn("h-auto w-auto flex-none object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}
