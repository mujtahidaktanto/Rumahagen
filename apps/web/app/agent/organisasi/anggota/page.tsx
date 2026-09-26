// app/agent/organisasi/anggota/page.tsx — Kelola Anggota (M12): leader mengatur permohonan, undangan, dan anggota; anggota biasa hanya melihat daftar anggota aktif.
import type { Route } from "next";
import { OrgMembersPanel } from "@/components/agent/OrgMembersPanel";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getOrgMembersPage } from "@/lib/agent/org-data";
import { getActiveContext } from "@/lib/agent/shell-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Anggota | RumahAgen" };

export default async function OrganizationMembersPage() {
  const user = await requireArea("agent");
  const ctx = await getActiveContext(user.id);
  const data = await getOrgMembersPage(user.id, ctx.kind === "org" ? ctx.org.id : null);
  if (data.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 lg:p-8">
        <ErrorState title="Anggota gagal dimuat" message="Terjadi gangguan saat mengambil data organisasi. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={"/agent/organisasi/anggota" as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  if (data.state === "no_org") {
    return (
      <div className="mx-auto w-full max-w-[900px] p-4 py-16 lg:p-8">
        <EmptyState title="Anda belum tergabung ke organisasi" message="Buat organisasi atau terima undangan dari leader untuk mengelola anggota." />
        <div className="flex justify-center">
          <LinkButton href={"/agent/organisasi" as Route} size="sm">
            Ke Organisasi
          </LinkButton>
        </div>
      </div>
    );
  }
  return <OrgMembersPanel orgId={data.org.id} orgName={data.org.name} role={data.role} status={data.org.status} roster={data.roster} pending={data.pending} />;
}
