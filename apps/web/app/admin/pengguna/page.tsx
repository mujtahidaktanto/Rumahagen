// app/admin/pengguna/page.tsx — Direktori Pengguna (M09): semua pengguna (Superadmin/Admin) atau agent/mitra saja (Manager, dibatasi RLS).
import { UserDirectoryView } from "@/components/admin/UserDirectoryView";
import { getUserDirectory } from "@/lib/admin/user-directory-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Direktori Pengguna | RumahAgen" };

export default async function AdminUserDirectoryPage() {
  const user = await requireArea("admin");
  const users = await getUserDirectory();
  return <UserDirectoryView viewerRole={user.role as AdminViewerRole} users={users} />;
}
