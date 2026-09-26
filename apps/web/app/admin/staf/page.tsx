// app/admin/staf/page.tsx — Staf Internal (M09): daftar akun staf, Superadmin-only.
import { StaffInternalView } from "@/components/admin/StaffInternalView";
import { getRoleIdByCode } from "@/lib/admin/role-catalog-data";
import { getStaffDirectory } from "@/lib/admin/staff-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staf Internal | RumahAgen" };

export default async function AdminStaffPage() {
  const user = await requireArea("admin");
  const isSuperadmin = user.role === "superadmin";
  const [staff, roleIdByCode] = await Promise.all([isSuperadmin ? getStaffDirectory() : Promise.resolve({ ok: true as const, data: [] }), getRoleIdByCode()]);
  return <StaffInternalView isSuperadmin={isSuperadmin} staff={staff} roleIdByCode={roleIdByCode} />;
}
