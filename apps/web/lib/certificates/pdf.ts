// lib/certificates/pdf.ts
// Membuat PDF sertifikat dari baris `certificates` (migration 0150) memakai pdf-lib. Semua isi berasal dari `snapshot` saat terbit (nama pemegang, judul kursus,
// template, penandatangan, logo mitra) sehingga PDF stabil walau profil/kursus berubah. QR menunjuk ke halaman verifikasi. Logo/tanda tangan yang gagal
// dimuat dilewati (sertifikat tetap dibuat).

import QRCode from "qrcode";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { CERT_H, CERT_W, CERTIFICATE_TEMPLATES, drawCertificate, loadCertFonts, pdfSafeText, type CertAssets, type CertData, type CertLogo, type CertificateTemplate } from "@/lib/certificates/designs";
import { RUMAHAGEN_LOGO_PNG_BASE64 } from "@/lib/certificates/logo-data";
import { downloadCertAsset } from "@/lib/storage/certificate-assets";

export interface CertificateSnapshot {
  holder_name: string;
  course_title: string;
  organizer_type: string;
  template: string;
  signer_name: string;
  signer_title: string;
  signer_signature_path: string | null;
  partner_logo_paths: string[];
}
export interface CertificateForPdf {
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  snapshot: CertificateSnapshot;
}

export function siteBaseUrl(): string {
  return (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://rumahagen.com").replace(/\/+$/, "");
}
export function certificateVerifyUrl(code: string): string {
  return `${siteBaseUrl()}/verifikasi/${code}`;
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

const yearFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "Asia/Jakarta" });

async function normalizeImage(bytes: Buffer, maxW: number, maxH: number): Promise<Buffer> {
  return sharp(bytes).rotate().resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: true }).png().toBuffer();
}

export async function generateCertificatePdf(cert: CertificateForPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Sertifikat ${cert.certificate_number}`);
  doc.setAuthor("RumahAgen");
  doc.setProducer("RumahAgen");
  const F = await loadCertFonts(doc);
  const snap = cert.snapshot;

  const embed = async (bytes: Buffer, main = false): Promise<CertLogo> => {
    const ref = await doc.embedPng(bytes);
    return { ref, w: ref.width, h: ref.height, main };
  };
  const logos: CertLogo[] = [await embed(Buffer.from(RUMAHAGEN_LOGO_PNG_BASE64, "base64"), true)];
  for (const path of (snap.partner_logo_paths ?? []).slice(0, 2)) {
    try {
      const raw = await downloadCertAsset(path);
      if (raw) logos.push(await embed(await normalizeImage(raw, 600, 300)));
    } catch {
      // logo mitra rusak: dilewati
    }
  }
  let sig: CertLogo | null = null;
  if (snap.signer_signature_path) {
    try {
      const raw = await downloadCertAsset(snap.signer_signature_path);
      if (raw) sig = await embed(await normalizeImage(raw, 500, 500));
    } catch {
      // tanda tangan rusak: dilewati, garis tanda tangan tetap tampil
    }
  }

  const verifyUrl = certificateVerifyUrl(cert.verification_code);
  const qr = await doc.embedPng(await QRCode.toBuffer(verifyUrl, { margin: 1, width: 300, errorCorrectionLevel: "M", color: { dark: "#0b2148", light: "#ffffff" } }));

  const issued = new Date(cert.issued_at);
  const safe = (t: string) => pdfSafeText(F.serif, t);
  const data: CertData = {
    name: safe(snap.holder_name),
    course: safe(snap.course_title),
    date: dateFormat.format(issued),
    year: yearFormat.format(issued),
    number: cert.certificate_number,
    code: cert.verification_code,
    verifyUrl: verifyUrl.replace(/^https?:\/\//, ""),
    signerName: safe(snap.signer_name),
    signerTitle: safe(snap.signer_title),
  };
  const template: CertificateTemplate = (CERTIFICATE_TEMPLATES as readonly string[]).includes(snap.template) ? (snap.template as CertificateTemplate) : "classic";
  const page = doc.addPage([CERT_W, CERT_H]);
  const assets: CertAssets = { logos, sig, qr };
  drawCertificate(template, page, F, data, assets);
  return doc.save();
}
