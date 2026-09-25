// app/verifikasi/[code]/page.tsx
// Halaman publik verifikasi sertifikat (tujuan QR di PDF sertifikat, M04). Tanpa login, tidak diindeks mesin pencari, tidak di-cache (status cabut harus
// langsung terlihat). Wireframe: docs/design/wireframes-v2/Desktop|Mobile/00-Publik/M04-Verifikasi-Sertifikat-*. Data dari lib/certificates/verify.ts.

import type { Metadata } from "next";
import { verifyCertificateByCode, type CertificateVerification } from "@/lib/certificates/verify";
import { VerifyShell, VerifyForm, cardStyle, formatDate, organizerLabel } from "../ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat | RumahAgen",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

export default async function VerifyCertificatePage({ params }: Props) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim().toUpperCase();

  let result: CertificateVerification | null = null;
  let failed = false;
  try {
    result = await verifyCertificateByCode(code);
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <VerifyShell>
        <div role="alert" style={{ ...cardStyle, borderColor: "#F3B9B9" }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Verifikasi belum bisa dilakukan</h1>
          <p style={{ color: "#3C4858" }}>Terjadi gangguan saat memeriksa sertifikat. Tidak ada yang berubah; coba muat ulang halaman ini beberapa saat lagi.</p>
          <a href={`/verifikasi/${encodeURIComponent(code)}`} style={{ color: "#1F5FBF", fontWeight: 600 }}>Coba lagi</a>
        </div>
      </VerifyShell>
    );
  }

  if (!result) {
    return (
      <VerifyShell>
        <div role="status" style={cardStyle}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Sertifikat tidak ditemukan</h1>
          <p style={{ color: "#3C4858" }}>
            Tidak ada sertifikat RumahAgen dengan kode <span style={{ fontFamily: "ui-monospace, monospace" }}>{code}</span>.
          </p>
          <ul style={{ color: "#3C4858", paddingLeft: 20, display: "grid", gap: 6 }}>
            <li>Periksa lagi kode di bawah QR pada sertifikat (huruf A–F dan angka 0–9).</li>
            <li>Sertifikat palsu atau kode yang salah tidak akan ditemukan.</li>
            <li>Ragu dengan keaslian sertifikat? Hubungi RumahAgen dan sertakan kode ini.</li>
          </ul>
        </div>
        <VerifyForm label="Periksa kode lain" />
      </VerifyShell>
    );
  }

  const revoked = !result.valid;
  const organizer = organizerLabel(result.organizer_type);
  return (
    <VerifyShell>
      <div role="status" style={{ ...cardStyle, borderColor: revoked ? "#F3B9B9" : "#B7E3CC" }}>
        <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13, background: revoked ? "#FDECEC" : "#E6F6EE", color: revoked ? "#B42318" : "#12704A" }}>
          {revoked ? "Sertifikat telah dicabut" : "Sertifikat valid"}
        </div>
        <h1 style={{ margin: "12px 0 4px", fontSize: 22, overflowWrap: "anywhere" }}>{result.holder_name}</h1>
        <p style={{ margin: 0, color: "#3C4858", overflowWrap: "anywhere" }}>{revoked ? "Pernah menyelesaikan kursus" : "Telah menyelesaikan kursus"} <strong>{result.course_title}</strong></p>
        <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "8px 16px", margin: "20px 0 0" }}>
          <dt style={{ color: "#5B6B7F" }}>Nomor sertifikat</dt>
          <dd style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>{result.certificate_number}</dd>
          <dt style={{ color: "#5B6B7F" }}>Diterbitkan</dt>
          <dd style={{ margin: 0 }}>{formatDate(result.issued_at)}</dd>
          {organizer ? (
            <>
              <dt style={{ color: "#5B6B7F" }}>Penyelenggara</dt>
              <dd style={{ margin: 0 }}>{organizer}</dd>
            </>
          ) : null}
          {revoked && result.revoked_at ? (
            <>
              <dt style={{ color: "#5B6B7F" }}>Dicabut</dt>
              <dd style={{ margin: 0 }}>{formatDate(result.revoked_at)}</dd>
            </>
          ) : null}
        </dl>
        {revoked ? <p style={{ color: "#B42318", marginBottom: 0 }}>Sertifikat ini tidak lagi berlaku. Hubungi RumahAgen bila ada pertanyaan.</p> : null}
      </div>
      <VerifyForm label="Periksa kode lain" />
    </VerifyShell>
  );
}
