// app/partner/profil/page.tsx — Profil Developer (M06, Fase 6).
import { PartnerProfileView } from "@/components/partner/PartnerProfileView";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { ErrorState } from "@/components/ui/States";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil Developer | RumahAgen" };

export default async function PartnerProfilePage() {
  const user = await requireArea("partner");
  const result = await getMyPartnerProfile(user.id);
  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
        <ErrorState title="Profil gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." />
      </div>
    );
  }
  return <PartnerProfileView profile={result.data} name={user.name} email={user.email} />;
}
