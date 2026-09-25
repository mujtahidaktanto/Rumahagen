// components/public/RestrictedPanel.tsx — "Sesi Ini Bersifat Terbatas" (wireframe M11 Learning Session): dipakai bila pengunjung belum login. Aturan akses baris untuk sesi
// hanya menjawab pengguna yang login, jadi pengunjung anonim tidak dapat diberi tahu apakah suatu sesi ada (tidak membocorkan keberadaan sesi).
import type { Route } from "next";
import { LinkButton } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";

export function RestrictedPanel({ title, message, nextPath }: { title: string; message: string; nextPath: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-100 text-warning-600">
        <LockIcon size={26} />
      </span>
      <h2 className="text-title-lg">{title}</h2>
      <p className="max-w-md text-body-md text-ink-500">{message}</p>
      <LinkButton href={`/login?next=${encodeURIComponent(nextPath)}` as Route}>Masuk untuk Cek Akses</LinkButton>
    </div>
  );
}
