// app/(auth)/login/page.tsx — halaman masuk (M01 Login, wireframe 00-Publik/M01-Login). Sudah login dan aktif -> langsung ke tujuan (`next`) atau /portal.
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = { title: "Masuk | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string | string[]; alasan?: string | string[] }> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(first(sp.next));
  const alasan = first(sp.alasan);

  const user = await getSessionUser();
  if (user && user.status === "active") redirect(next as Route); // `next` sudah disaring safeNext (hanya jalur di situs ini)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-headline">Masuk</h1>
        <p className="mt-1 text-body-md text-ink-500">Masuk ke akun RumahAgen Anda.</p>
      </div>
      {alasan === "dibatasi" || (user && user.status !== "active") ? (
        <div role="alert" className="rounded-md border border-warning-600/30 bg-warning-100 p-3 text-body-md text-warning-600">
          Akun Anda sedang dibatasi, sehingga belum bisa masuk. Hubungi tim RumahAgen bila Anda merasa ini keliru.
        </div>
      ) : null}
      <LoginForm next={next} />
    </div>
  );
}
