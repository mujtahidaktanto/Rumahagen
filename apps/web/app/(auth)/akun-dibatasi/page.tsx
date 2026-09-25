// app/(auth)/akun-dibatasi/page.tsx — gerbang akun tidak aktif (M01 Akun Dibatasi). Status = users.status: pending_review | suspended | rejected (CHECK constraint).
// Tanpa sesi -> /login; akun aktif -> /portal. Kontak dukungan: SUPPORT_EMAIL di lib/config.ts (sementara email Google pemilik produk).
import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { StatusPanel } from "@/components/auth/StatusPanel";
import { getSessionUser } from "@/lib/auth/session";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Akun Dibatasi | RumahAgen", robots: { index: false, follow: false } };

const COPY: Record<string, { title: string; body: string; tone: "warning" | "danger" }> = {
  suspended: {
    title: "Akun Anda Ditangguhkan Sementara",
    body: "Tim kami menangguhkan akses akun ini karena terindikasi melanggar kebijakan platform. Anda tidak dapat membuat listing, mengelola organisasi, atau mengakses fitur lain selama status ini berlaku.",
    tone: "danger",
  },
  rejected: {
    title: "Pendaftaran Akun Ditolak",
    body: "Verifikasi dokumen pendaftaran Anda tidak memenuhi syarat platform. Anda dapat mengajukan pendaftaran ulang setelah melengkapi dokumen yang diminta.",
    tone: "danger",
  },
  pending_review: {
    title: "Akun Anda Sedang Ditinjau",
    body: "Pendaftaran Anda sedang ditinjau tim RumahAgen. Anda akan dapat masuk setelah peninjauan selesai.",
    tone: "warning",
  },
};

export default async function RestrictedAccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login" as Route);
  if (user.status === "active") redirect("/portal" as Route);

  const copy = COPY[user.status] ?? COPY.suspended!;
  const subject = encodeURIComponent(`Bantuan akun RumahAgen (${user.status})`);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <StatusPanel tone={copy.tone} icon={<LockIcon size={28} />} title={copy.title}>
        {copy.body}
      </StatusPanel>
      <Badge tone={copy.tone}>{user.status}</Badge>
      <p className="text-caption">
        Alasan lebih rinci telah dikirim ke email terdaftar Anda. Status ini berlaku untuk seluruh akun — tidak ada bagian aplikasi yang bisa diakses selama status ini aktif.
      </p>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <SignOutButton className="flex-1" />
        <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${subject}` as Route} className="flex-1">
          Hubungi Dukungan
        </LinkButton>
      </div>
    </div>
  );
}
