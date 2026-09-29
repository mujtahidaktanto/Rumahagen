// app/admin/profil/page.tsx — Profil Saya (Admin/Manager/Superadmin). SessionUser sudah memuat nama/email/role/status; detail akun (created_at dll.)
// dibaca terpisah dari users karena tidak ikut SessionUser.
import { AdminProfileView } from "@/components/admin/AdminProfileView";
import { getSelfAccountInfo } from "@/lib/admin/self-profile-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil Saya | RumahAgen" };

export default async function AdminProfilePage() {
  const user = await requireArea("admin");
  const account = await getSelfAccountInfo(user.id);
  return <AdminProfileView name={user.name} email={user.email} role={user.role} status={user.status} account={account} />;
}
