// app/agent/profil/page.tsx — Profil Saya (M02, termasuk verifikasi KTP). Data dimuat di server (lib/agent/profile-data.ts); formulir dan KTP adalah komponen klien yang menulis lewat /api.
import { KtpCard } from "@/components/agent/KtpCard";
import { ProfileForm } from "@/components/agent/ProfileForm";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getMyProfile } from "@/lib/agent/profile-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil Saya | RumahAgen" };

export default async function AgentProfilePage() {
  const user = await requireArea("agent");
  const res = await getMyProfile(user.id, user.name);
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1200px] p-4 lg:p-8">
        <ErrorState title="Profil gagal dimuat" message="Terjadi gangguan saat mengambil profil Anda. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href="/agent/profil" size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  const p = res.profile;
  return (
    <ProfileForm
      exists={p.exists}
      initial={p.values}
      avatarUrl={p.avatarUrl}
      publicSlug={p.publicSlug}
      soldCount={p.soldCount}
      rentedCount={p.rentedCount}
      provinceName={p.provinceName}
      cityName={p.cityName}
      organization={p.organization}
      titles={p.titles}
      ktpSlot={<KtpCard state={p.ktp.state} maskedNik={p.ktp.maskedNik} submittedAt={p.ktp.submittedAt} profileExists={p.exists} />}
    />
  );
}
