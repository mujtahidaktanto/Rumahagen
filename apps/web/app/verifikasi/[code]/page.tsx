// app/verifikasi/[code]/page.tsx — hasil verifikasi sertifikat (M04, tujuan QR di PDF sertifikat). Tanpa login, tidak diindeks, tidak di-cache (status cabut harus langsung terlihat).
// Lima keadaan sesuai wireframe: valid (Berlaku), dicabut, tidak ditemukan, gagal (gangguan), terlalu banyak percobaan (pembatas lib/certificates/verify-rate.ts).
// Yang tampil hanya data aman dari RPC verify_certificate (lib/certificates/verify.ts): nama, kursus, nomor, tanggal, penyelenggara, status.
import type { Metadata, Route } from "next";
import { CopyLinkButton } from "@/components/public/CopyLinkButton";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { AlertIcon, CheckCircleIcon } from "@/components/ui/icons";
import { organizerLabel, verifyCertificateByCode, type CertificateVerification } from "@/lib/certificates/verify";
import { isVerifyRateLimited } from "@/lib/certificates/verify-rate";
import { SUPPORT_EMAIL } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { HowItWorks, VerifyForm, VerifyPage } from "../ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat | RumahAgen",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-caption sm:w-40 sm:flex-none">{label}</dt>
      <dd className="min-w-0 text-body-md font-bold break-words">{children}</dd>
    </div>
  );
}

function StatusCard({ tone, icon, title, children }: { tone: "success" | "danger" | "neutral"; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const border = tone === "success" ? "border-success-600/30" : tone === "danger" ? "border-danger-600/30" : "border-ink-100";
  const iconBg = tone === "success" ? "bg-success-100 text-success-600" : tone === "danger" ? "bg-danger-100 text-danger-600" : "bg-ink-50 text-ink-500";
  return (
    <div role="status" className={`rounded-lg border bg-white p-5 sm:p-6 ${border}`}>
      <div className="flex items-start gap-3.5">
        <span aria-hidden="true" className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-title-lg">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code: rawCode } = await params;
  let decoded = rawCode;
  try {
    decoded = decodeURIComponent(rawCode);
  } catch {
    // kode dengan %-escape rusak diperlakukan apa adanya -> tidak ditemukan
  }
  const code = decoded.trim().toUpperCase().slice(0, 40);
  const here = `/verifikasi/${encodeURIComponent(code)}` as Route;

  if (await isVerifyRateLimited()) {
    return (
      <VerifyPage>
        <StatusCard tone="neutral" icon={<AlertIcon size={22} />} title="Terlalu banyak percobaan">
          <p className="mt-1.5 text-body-md text-ink-700">Demi keamanan, pemeriksaan dibatasi. Coba lagi dalam 1 menit.</p>
          <div className="mt-4">
            <LinkButton href={here} size="sm" variant="secondary">
              Coba Lagi
            </LinkButton>
          </div>
        </StatusCard>
        <HowItWorks />
      </VerifyPage>
    );
  }

  let result: CertificateVerification | null = null;
  let failed = false;
  try {
    result = await verifyCertificateByCode(code);
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <VerifyPage>
        <div role="alert" className="rounded-lg border border-danger-600/30 bg-white p-5 sm:p-6">
          <h2 className="text-title-lg">Verifikasi belum bisa dilakukan</h2>
          <p className="mt-1.5 text-body-md text-ink-700">Terjadi gangguan saat memeriksa sertifikat. Coba lagi sebentar lagi.</p>
          <div className="mt-4">
            <LinkButton href={here} size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      </VerifyPage>
    );
  }

  if (!result) {
    const subject = encodeURIComponent("Pertanyaan verifikasi sertifikat");
    const body = encodeURIComponent(`Kode verifikasi: ${code}`);
    return (
      <VerifyPage>
        <StatusCard tone="neutral" icon={<AlertIcon size={22} />} title="Sertifikat tidak ditemukan">
          <p className="mt-1.5 text-body-md text-ink-700">
            Tidak ada sertifikat RumahAgen dengan kode <span className="font-mono font-bold break-all">{code}</span>.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body-md text-ink-700">
            <li>Periksa lagi kode di bawah QR pada sertifikat (huruf A–F dan angka 0–9).</li>
            <li>Sertifikat palsu atau kode yang salah tidak akan ditemukan.</li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-100 pt-4">
            <span className="text-body-md text-ink-500">Ragu dengan keaslian sertifikat? Hubungi RumahAgen dan sertakan kode ini.</span>
            <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}` as Route} size="sm" variant="secondary">
              Hubungi bantuan
            </LinkButton>
          </div>
        </StatusCard>
        <VerifyForm label="Periksa lagi" showHint={false} />
        <HowItWorks />
      </VerifyPage>
    );
  }

  const revoked = !result.valid;
  const organizer = organizerLabel(result.organizer_type);
  return (
    <VerifyPage>
      <StatusCard tone={revoked ? "danger" : "success"} icon={revoked ? <AlertIcon size={22} /> : <CheckCircleIcon size={22} />} title={revoked ? "Sertifikat dicabut" : "Sertifikat valid"}>
        <p className="mt-1.5 text-body-md text-ink-700">
          {revoked ? "Sertifikat ini pernah diterbitkan, tetapi sudah dicabut dan tidak berlaku lagi." : "Sertifikat ini diterbitkan oleh RumahAgen dan masih berlaku."}
        </p>
        <Badge tone={revoked ? "danger" : "success"} className="mt-3">
          {revoked ? "Dicabut" : "Berlaku"}
        </Badge>
        <dl className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4">
          <Row label="Nama pemegang">{result.holder_name}</Row>
          <Row label="Kursus">{result.course_title}</Row>
          <Row label="Nomor sertifikat">
            <span className="font-mono">{result.certificate_number}</span>
          </Row>
          <Row label="Diterbitkan">{formatDate(result.issued_at)}</Row>
          {organizer ? <Row label="Penyelenggara">{organizer}</Row> : null}
          {revoked && result.revoked_at ? <Row label="Dicabut pada">{formatDate(result.revoked_at)}</Row> : null}
          <Row label="Kode verifikasi">
            <span className="font-mono">{code}</span>
          </Row>
        </dl>
        <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-ink-100 pt-4">
          <CopyLinkButton />
          <LinkButton href={"/verifikasi" as Route} size="sm" variant="ghost">
            Periksa kode lain
          </LinkButton>
        </div>
      </StatusCard>
      <HowItWorks />
    </VerifyPage>
  );
}
