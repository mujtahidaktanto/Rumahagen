// components/admin/AdminProfileView.tsx — Profil Saya (Admin/Manager/Superadmin): kartu akun read-only. Staf tidak punya agent_profiles (nama tampilan
// jatuh ke bagian depan email lewat getSessionUser), jadi tidak ada avatar/telepon/alamat di sini seperti Profil Saya Agent (M02).
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { UserIcon } from "@/components/ui/icons";
import type { SelfAccountInfo } from "@/lib/admin/self-profile-data";
import { INTERNAL_STATUS_LABEL, INTERNAL_STATUS_TONE, type InternalUserStatus } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });
const dtfTime = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink-100 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-body-md text-ink-500">{label}</span>
      <span className="text-label-lg">{value}</span>
    </div>
  );
}

export function AdminProfileView({
  name,
  email,
  role,
  status,
  account,
}: {
  name: string;
  email: string | null;
  role: RoleCode;
  status: string;
  account: Part<SelfAccountInfo>;
}) {
  const internalStatus: InternalUserStatus = status === "active" ? "active" : "suspended";

  return (
    <div className="flex w-full flex-col">
      <div className="p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Profil Saya</h1>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:max-w-2xl lg:p-8">
        <div className="flex items-center gap-4 rounded-lg border border-ink-100 p-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserIcon size={26} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-title-lg">{name}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{ROLE_LABEL[role]}</Badge>
              <Badge tone={INTERNAL_STATUS_TONE[internalStatus]}>{INTERNAL_STATUS_LABEL[internalStatus]}</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-ink-100 px-4">
          <Row label="Email" value={email ?? "—"} />
          {!account.ok ? (
            <div className="py-3.5">
              <ErrorState title="Detail akun gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            </div>
          ) : (
            <>
              <Row label="Email terverifikasi" value={account.data.emailVerifiedAt ? dtf.format(new Date(account.data.emailVerifiedAt)) : "Belum diverifikasi"} />
              <Row label="Bergabung sejak" value={dtf.format(new Date(account.data.createdAt))} />
              <Row label="Login terakhir" value={account.data.lastLoginAt ? dtfTime.format(new Date(account.data.lastLoginAt)) : "—"} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-ink-100 p-4">
          <span className="text-label-lg">Kata Sandi</span>
          <p className="text-body-md text-ink-500">Ganti kata sandi lewat link yang dikirim ke email akun Anda (belum ada ganti sandi langsung tanpa email untuk akun staf).</p>
          {email ? <ChangePasswordDialog email={email} /> : null}
        </div>
      </div>
    </div>
  );
}
