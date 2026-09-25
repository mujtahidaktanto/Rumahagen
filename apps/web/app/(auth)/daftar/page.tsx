// app/(auth)/daftar/page.tsx — Daftar + verifikasi kode (M01 Register/OTP). Sudah login dan aktif -> langsung ke tujuan.
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { RegisterFlow } from "./RegisterFlow";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = { title: "Daftar | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function RegisterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  const user = await getSessionUser();
  if (user && user.status === "active") redirect(next as Route); // `next` sudah disaring safeNext
  return <RegisterFlow next={next} />;
}
