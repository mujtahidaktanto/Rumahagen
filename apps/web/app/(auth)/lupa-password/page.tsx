// app/(auth)/lupa-password/page.tsx — Pemulihan kata sandi (M01 Recovery). `?tahap=reset` adalah tujuan link email (setelah /api/auth/callback memasang sesi recovery):
// tanpa sesi -> "Link tidak berlaku". Alamat ini dikirim sebagai redirect_to oleh RecoveryFlow.
import type { Metadata } from "next";
import { RecoveryFlow, type RecoveryStage } from "./RecoveryFlow";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pemulihan Kata Sandi | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ tahap?: string | string[] }> };

export default async function RecoveryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tahap = Array.isArray(sp.tahap) ? sp.tahap[0] : sp.tahap;
  let initial: RecoveryStage = "request";
  if (tahap === "reset") {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    initial = data.user ? "reset" : "expired";
  }
  return <RecoveryFlow initial={initial} />;
}
