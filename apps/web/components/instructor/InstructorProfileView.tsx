// components/instructor/InstructorProfileView.tsx — Profil Saya (M02, wireframe 04-Instructor/M02-Profil-Instruktur): kartu akun read-only + ganti kata sandi. Tidak ada
// avatar/foto di sini meski Instructor punya permission m02.profile_photo.* — tidak ada tabel/route unggah foto untuk peran non-Agent (avatar_url hanya di agent_profiles,
// Instructor tidak punya baris di sana), sama seperti Profil Saya Admin (components/admin/AdminProfileView.tsx). Dicatat di audit/FRONTEND_GAPS.md. Server Component murni
// (ChangePasswordDialog menerima string biasa, bukan fungsi, jadi aman dioper dari Server Component).
import { ChangePasswordDialog } from "@/components/instructor/ChangePasswordDialog";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { UserIcon } from "@/components/ui/icons";
import type { SelfAccountInfo } from "@/lib/instructor/self-profile-data";
import type { Part } from "@/lib/agent/dashboard-data";

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

export function InstructorProfileView({ name, email, account }: { name: string; email: string | null; account: Part<SelfAccountInfo> }) {
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
            <Badge tone="info">Instruktur</Badge>
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
          <p className="text-body-md text-ink-500">Ganti kata sandi lewat link yang dikirim ke email akun Anda.</p>
          {email ? <ChangePasswordDialog email={email} /> : null}
        </div>
      </div>
    </div>
  );
}
