// app/instructor/profil/page.tsx — Profil Saya (M02, Fase 6). SessionUser sudah memuat nama/email; detail akun (created_at dll.) dibaca terpisah.
import { InstructorProfileView } from "@/components/instructor/InstructorProfileView";
import { getSelfAccountInfo } from "@/lib/instructor/self-profile-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil Saya | RumahAgen" };

export default async function InstructorProfilePage() {
  const user = await requireArea("instructor");
  const account = await getSelfAccountInfo(user.id);
  return <InstructorProfileView name={user.name} email={user.email} account={account} />;
}
