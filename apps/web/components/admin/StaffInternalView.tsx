// components/admin/StaffInternalView.tsx — Staf Internal (M09, wireframe 02-Admin/M09-Staf-Internal): daftar akun staf (admin/manager/superadmin) + Tambah/Ubah Role/Nonaktifkan.
// Superadmin-only untuk seluruh layar (dicek eksplisit di server, bukan cuma disembunyikan UI) — akun agent/mitra ada di Direktori Pengguna.
import { CreateStaffDialog } from "@/components/admin/CreateStaffDialog";
import { StaffRowActions } from "@/components/admin/StaffRowActions";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { LockIcon } from "@/components/ui/icons";
import type { StaffRow } from "@/lib/admin/staff-data";
import { INTERNAL_STATUS_LABEL, INTERNAL_STATUS_TONE } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";
import { ROLE_LABEL } from "@/lib/auth/roles";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const dtfFull = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function StaffInternalView({ isSuperadmin, staff, roleIdByCode }: { isSuperadmin: boolean; staff: Part<StaffRow[]>; roleIdByCode: Record<string, string> }) {
  if (!isSuperadmin) {
    return (
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-3 p-4 py-20 text-center lg:p-8">
        <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 text-danger-600">
          <LockIcon size={28} />
        </span>
        <h1 className="text-title-lg">Akses Ditolak</h1>
        <p className="max-w-[420px] text-body-md text-ink-500">
          Halaman ini hanya untuk Superadmin — membuat/mengubah akun staf (Admin, Manager, Superadmin) adalah kapabilitas paling sensitif di seluruh admin console dan tidak diberikan ke role
          Admin/Manager sekalipun.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Staf Internal</h1>
        <CreateStaffDialog roleIdByCode={roleIdByCode} />
      </div>

      {!staff.ok ? (
        <ErrorState title="Daftar staf gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Dibuat</TH>
                <TH>Login Terakhir</TH>
                <TH>Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {staff.data.map((s) => (
                <TR key={s.id}>
                  <TD className="text-label-lg">{s.email ?? "—"}</TD>
                  <TD>
                    <span className="inline-flex rounded-pill bg-ink-50 px-2.5 py-1 text-[12px] font-bold text-ink-700">{ROLE_LABEL[s.roleCode as keyof typeof ROLE_LABEL] ?? s.roleCode}</span>
                  </TD>
                  <TD>
                    <Badge tone={INTERNAL_STATUS_TONE[s.status]}>{INTERNAL_STATUS_LABEL[s.status]}</Badge>
                  </TD>
                  <TD className="text-body-md text-ink-500">{dtf.format(new Date(s.createdAt))}</TD>
                  <TD className="text-body-md text-ink-500">{s.lastLoginAt ? dtfFull.format(new Date(s.lastLoginAt)) : "—"}</TD>
                  <TD>
                    <StaffRowActions userId={s.id} email={s.email ?? s.id} roleCode={s.roleCode} canDeactivate={s.status === "active"} roleIdByCode={roleIdByCode} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <span className="text-caption">Menampilkan {staff.data.length} akun staf (role admin/manager/superadmin) — akun agent/developer partner ada di Direktori Pengguna.</span>
        </>
      )}
    </div>
  );
}
