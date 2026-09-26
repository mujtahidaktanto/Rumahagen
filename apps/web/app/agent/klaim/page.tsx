// app/agent/klaim/page.tsx — Klaim Proyek Agent (M06). Data di server (lib/agent/claim-data.ts); tarik klaim, buat listing, dan marketing kit lewat komponen klien (/api/*).
import { ClaimsView } from "@/components/agent/ClaimsView";
import { getMyClaims } from "@/lib/agent/claim-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Klaim Proyek | RumahAgen" };

export default async function ClaimsPage() {
  const user = await requireArea("agent");
  return <ClaimsView data={await getMyClaims(user.id)} />;
}
