// lib/claims/pdf.ts
// Generator PDF untuk GET /claims/{id}/approval-pdf (STEP11-B3 §14
// "Approval Claim PDF Generate/View/Download" + "Approval Record" —
// keduanya CONTROLLED GAP di Core, tidak ada route/tabel dievidensi.
// Keputusan produk (dikonfirmasi user): 1 endpoint, PDF dibuat on-demand
// dari baris `agent_project_claims` yang SUDAH approved (bukan tabel
// Approval Record terpisah — baris klaim itu sendiri sudah cukup immutable:
// reviewed_by/reviewed_at otomatis terisi sejak 0035, tidak ada jalur balik
// ke 'pending'), pola sama seperti lib/dbr/pdf.ts. Logo RumahAgen
// (public/assets/rumahagen-logo.png, disalin dari asset kanonik wireframe)
// digambar di pojok kanan atas sesuai permintaan user.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

export interface ClaimApprovalPdfData {
  claimId: string;
  agentName: string;
  developerCompanyName: string;
  developerPicName: string | null;
  projectName: string;
  projectLocation: string | null;
  propertyType: string;
  transactionType: string;
  priceMin: number | null;
  priceMax: number | null;
  commissionScheme: string | null;
  extraCommission: string | null;
  claimedAt: string;
  reviewedAt: string | null;
}

function formatIdr(value: number | null): string {
  if (value === null) return "-";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

export async function generateClaimApprovalPdf(data: ClaimApprovalPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const logoPath = path.join(process.cwd(), "public", "assets", "rumahagen-logo.png");
  const logoBytes = await fs.readFile(logoPath);
  const logoImage = await doc.embedPng(logoBytes);
  const logoWidth = 110;
  const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
  page.drawImage(logoImage, {
    x: 595.28 - 50 - logoWidth,
    y: 841.89 - 50 - logoHeight,
    width: logoWidth,
    height: logoHeight,
  });

  let y = 800;
  const left = 50;

  const drawLine = (text: string, opts?: { bold?: boolean; size?: number; gap?: number }) => {
    page.drawText(text, {
      x: left,
      y,
      size: opts?.size ?? 11,
      font: opts?.bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= opts?.gap ?? 20;
  };

  drawLine("Bukti Persetujuan Klaim Proyek", { bold: true, size: 18, gap: 28 });
  drawLine("RumahAgen", { size: 10, gap: 30 });

  drawLine("Agent", { bold: true, size: 12, gap: 18 });
  drawLine(`Nama: ${data.agentName}`);
  y -= 8;

  drawLine("Developer", { bold: true, size: 12, gap: 18 });
  drawLine(`Perusahaan: ${data.developerCompanyName}`);
  if (data.developerPicName) drawLine(`PIC: ${data.developerPicName}`);
  y -= 8;

  drawLine("Proyek", { bold: true, size: 12, gap: 18 });
  drawLine(`Nama proyek: ${data.projectName}`);
  if (data.projectLocation) drawLine(`Lokasi: ${data.projectLocation}`);
  drawLine(`Tipe properti: ${data.propertyType} (${data.transactionType})`);
  drawLine(`Kisaran harga: ${formatIdr(data.priceMin)} - ${formatIdr(data.priceMax)}`);
  if (data.commissionScheme) drawLine(`Skema komisi: ${data.commissionScheme}`);
  if (data.extraCommission) drawLine(`Komisi tambahan: ${data.extraCommission}`);
  y -= 8;

  drawLine("Status Klaim", { bold: true, size: 12, gap: 18 });
  drawLine(`Diajukan: ${new Date(data.claimedAt).toLocaleString("id-ID")}`);
  drawLine(`Disetujui: ${data.reviewedAt ? new Date(data.reviewedAt).toLocaleString("id-ID") : "-"}`, { bold: true, gap: 30 });

  drawLine(`ID Klaim: ${data.claimId}`, { size: 9 });
  drawLine("Dokumen ini adalah bukti persetujuan klaim proyek developer oleh Agent di platform RumahAgen.", { size: 9 });

  return doc.save();
}
