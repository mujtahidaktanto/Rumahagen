// lib/dbr/pdf.ts
// Generator PDF untuk GET /calculator/dbr/{id}/export-pdf (STEP11-B10 M07
// list, PRESERVE). Pakai `pdf-lib` -- SATU-SATUNYA library PDF yang
// "Approved" di W4-02A.6.7_DEPENDENCY_MANIFEST (STEP-09-D), bukan pilihan
// bebas.
//
// PDF dibuat ON-THE-FLY setiap request (tidak dipersist ke Supabase
// Storage) -- repo ini belum punya integrasi Storage sama sekali di modul
// manapun, dan menambah itu adalah pekerjaan arsitektur terpisah di luar
// cakupan menutup gap endpoint ini. Kolom `dbr_simulations.pdf_export_url`
// (STEP10-D) TIDAK diisi oleh implementasi ini -- didokumentasikan sebagai
// keputusan cakupan eksplisit, bukan diam-diam diabaikan; kalau nanti
// Storage terintegrasi, kolom itu tinggal dipakai tanpa mengubah kontrak
// endpoint ini.
//
// Logo RumahAgen (public/assets/rumahagen-logo.png) digambar di pojok kanan
// atas -- pola sama persis seperti lib/claims/pdf.ts (permintaan user yang
// sama, diterapkan konsisten di kedua generator PDF).

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

export interface DbrPdfData {
  id: string;
  bankName: string;
  prospectName: string | null;
  prospectPhone: string | null;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  tenorMonths: number;
  interestRateAnnual: number;
  netIncome: number;
  existingInstallments: number;
  monthlyInstallment: number;
  dbrPercent: number;
  eligibilityStatus: string;
  createdAt: string;
}

function formatIdr(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

export async function generateDbrSimulationPdf(data: DbrPdfData): Promise<Uint8Array> {
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

  drawLine("Simulasi Debt Burden Ratio (DBR)", { bold: true, size: 18, gap: 28 });
  drawLine("RumahAgen", { size: 10, gap: 24 });

  if (data.prospectName) {
    drawLine(`Prospek: ${data.prospectName}${data.prospectPhone ? " (" + data.prospectPhone + ")" : ""}`, { bold: true });
  }

  drawLine(`Bank: ${data.bankName}`);
  drawLine(`Harga properti: ${formatIdr(data.propertyPrice)}`);
  drawLine(`Uang muka: ${formatIdr(data.downPayment)}`);
  drawLine(`Jumlah pinjaman: ${formatIdr(data.loanAmount)}`);
  drawLine(`Tenor: ${data.tenorMonths} bulan`);
  drawLine(`Suku bunga tahunan: ${data.interestRateAnnual}%`);
  drawLine(`Penghasilan bersih: ${formatIdr(data.netIncome)}`);
  drawLine(`Cicilan berjalan lain: ${formatIdr(data.existingInstallments)}`);
  y -= 8;
  drawLine(`Cicilan bulanan estimasi: ${formatIdr(data.monthlyInstallment)}`, { bold: true });
  drawLine(`DBR: ${data.dbrPercent}%`, { bold: true });
  drawLine(`Status kelayakan: ${data.eligibilityStatus.toUpperCase()}`, { bold: true, gap: 30 });

  drawLine(`Dibuat: ${new Date(data.createdAt).toLocaleString("id-ID")}`, { size: 9 });
  drawLine(`ID Simulasi: ${data.id}`, { size: 9 });
  drawLine("Dokumen ini adalah estimasi, bukan keputusan kredit final dari bank.", { size: 9 });

  return doc.save();
}
