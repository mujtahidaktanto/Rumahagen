// lib/certificates/designs.ts
// Empat desain sertifikat RumahAgen (A4 lanskap, 842x595 pt) yang digambar dengan pdf-lib memakai font standar PDF (Times, Helvetica), tanpa embed font.
// Template: classic (Klasik Elegan), modern (Modern Minimalis), corporate (Korporat Lingkaran), premium (Premium Art Deco). Disetujui produk 2026-09-25.
// Teks dinamis: nama mengecil otomatis (fit) dan judul kursus dibungkus maksimal 2 baris. Logo utama + maksimal 2 logo mitra; tanda tangan PNG transparan opsional.

import { degrees, rgb, StandardFonts, type PDFDocument, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";

export const CERT_W = 842;
export const CERT_H = 595;
export const CERTIFICATE_TEMPLATES = ["classic", "modern", "corporate", "premium"] as const;
export type CertificateTemplate = (typeof CERTIFICATE_TEMPLATES)[number];

export interface CertLogo {
  ref: PDFImage;
  w: number;
  h: number;
  main?: boolean;
}
export interface CertData {
  name: string;
  course: string;
  date: string;
  year: string;
  number: string;
  code: string;
  verifyUrl: string;
  signerName: string;
  signerTitle: string;
}
export interface CertAssets {
  logos: CertLogo[]; // logo RumahAgen (main) diikuti logo mitra
  sig: CertLogo | null;
  qr: PDFImage;
}
export interface CertFonts {
  serif: PDFFont;
  serifB: PDFFont;
  serifI: PDFFont;
  serifBI: PDFFont;
  sans: PDFFont;
  sansB: PDFFont;
}

const W = CERT_W;
const H = CERT_H;
const C = {
  navy: rgb(0.043, 0.129, 0.29),
  blue: rgb(0.12, 0.37, 0.75),
  gold: rgb(0.79, 0.6, 0.2),
  goldSoft: rgb(0.91, 0.8, 0.52),
  cream: rgb(0.995, 0.985, 0.95),
  ink: rgb(0.13, 0.16, 0.22),
  grey: rgb(0.42, 0.46, 0.53),
  line: rgb(0.85, 0.87, 0.91),
  white: rgb(1, 1, 1),
  tint: rgb(0.955, 0.965, 0.99),
};

export async function loadCertFonts(doc: PDFDocument): Promise<CertFonts> {
  return {
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifB: await doc.embedFont(StandardFonts.TimesRomanBold),
    serifI: await doc.embedFont(StandardFonts.TimesRomanItalic),
    serifBI: await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansB: await doc.embedFont(StandardFonts.HelveticaBold),
  };
}

/** Ganti karakter yang tidak bisa dikodekan font standar (WinAnsi), mis. emoji, agar pembuatan PDF tidak gagal. */
export function pdfSafeText(font: PDFFont, text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      try {
        font.encodeText(base);
        out += base;
      } catch {
        out += "?";
      }
    }
  }
  return out;
}

type Align = "left" | "center" | "right";

const fit = (font: PDFFont, t: string, max: number, size: number, min: number): number => {
  let s = size;
  while (s > min && font.widthOfTextAtSize(t, s) > max) s -= 0.5;
  return s;
};

function wrap(font: PDFFont, t: string, size: number, max: number, maxLines: number): string[] {
  const words = String(t).split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= max || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    let last = lines.slice(maxLines - 1).join(" ");
    while (font.widthOfTextAtSize(`${last}…`, size) > max && last.length > 1) last = last.slice(0, -1);
    return lines.slice(0, maxLines - 1).concat(`${last}…`);
  }
  return lines;
}

const spaced = (t: string, n: number): string => t.split("").join(" ".repeat(n));

function text(page: PDFPage, t: string, x: number, y: number, font: PDFFont, size: number, color: RGB, opt: { align?: Align; rotate?: ReturnType<typeof degrees> } = {}): void {
  const w = font.widthOfTextAtSize(t, size);
  const px = opt.align === "center" ? x - w / 2 : opt.align === "right" ? x - w : x;
  page.drawText(t, { x: px, y, size, font, color, rotate: opt.rotate });
}

const rectStroke = (page: PDFPage, x: number, y: number, w: number, h: number, color: RGB, thick: number): void => {
  page.drawRectangle({ x, y, width: w, height: h, borderColor: color, borderWidth: thick });
};
const diamond = (page: PDFPage, cx: number, cy: number, r: number, color: RGB): void => {
  page.drawSvgPath(`M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`, { x: cx, y: cy, color });
};
const ruler = (page: PDFPage, x1: number, y: number, x2: number, color: RGB, thick = 0.8): void => {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, color, thickness: thick });
};
function roundRect(page: PDFPage, x: number, y: number, w: number, h: number, r: number, color: RGB): void {
  page.drawSvgPath(`M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`, { x, y: y + h, color });
}
function arcLine(page: PDFPage, cx: number, cy: number, dx: number, dy: number, r: number, color: RGB, thick: number): void {
  let prev: { x: number; y: number } | null = null;
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    const p = { x: cx + dx * r * Math.cos(a), y: cy + dy * r * Math.sin(a) };
    if (prev) page.drawLine({ start: prev, end: p, color, thickness: thick });
    prev = p;
  }
}
function rosette(page: PDFPage, cx: number, cy: number, R: number, gold: RGB, fill: RGB, ring: RGB, F: CertFonts, label: string, labelColor: RGB): void {
  const pts = 32;
  let d = "";
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * Math.PI * 2;
    const r = i % 2 ? R * 0.9 : R;
    d += `${i ? "L" : "M"}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)} `;
  }
  page.drawSvgPath(`${d}Z`, { x: cx, y: cy, color: gold });
  page.drawCircle({ x: cx, y: cy, size: R * 0.74, color: fill, borderColor: ring, borderWidth: 1.2 });
  page.drawCircle({ x: cx, y: cy, size: R * 0.6, borderColor: gold, borderWidth: 0.7 });
  text(page, label, cx, cy - R * 0.2, F.serifB, R * 0.62, labelColor, { align: "center" });
}

function logoScale(im: CertLogo, maxH: number): number {
  const h = im.main ? maxH : maxH * 0.86;
  return Math.min(h / im.h, (im.main ? 190 : 110) / im.w);
}
function logoWidth(imgs: CertLogo[], maxH: number): number {
  return imgs.reduce((a, im) => a + im.w * logoScale(im, maxH), 0) + 22 * (imgs.length - 1);
}
function logoRow(page: PDFPage, imgs: CertLogo[], x: number, y: number, maxH: number, align: "left" | "center", sepColor: RGB): number {
  const items = imgs.map((im) => {
    const s = logoScale(im, maxH);
    return { im, w: im.w * s, h: im.h * s };
  });
  const gap = 22;
  const total = items.reduce((a, i) => a + i.w, 0) + gap * (items.length - 1);
  let cx = align === "center" ? x - total / 2 : x;
  items.forEach((it, i) => {
    if (i > 0) page.drawLine({ start: { x: cx - gap / 2, y: y + maxH * 0.05 }, end: { x: cx - gap / 2, y: y + maxH * 0.95 }, color: sepColor, thickness: 0.7 });
    page.drawImage(it.im.ref, { x: cx, y: y + (maxH - it.h) / 2, width: it.w, height: it.h });
    cx += it.w + gap;
  });
  return total;
}

function signature(page: PDFPage, d: CertData, sig: CertLogo | null, x: number, y: number, w: number, ink: RGB, sub: RGB, fontN: PDFFont, fontT: PDFFont, maxH = 92): void {
  if (sig) {
    const s = Math.min(150 / sig.w, maxH / sig.h);
    page.drawImage(sig.ref, { x: x + (w - sig.w * s) / 2, y: y + 3, width: sig.w * s, height: sig.h * s });
  }
  ruler(page, x, y, x + w, sub, 0.8);
  text(page, d.signerName, x + w / 2, y - 15, fontN, fit(fontN, d.signerName, w, 12, 9), ink, { align: "center" });
  text(page, d.signerTitle, x + w / 2, y - 29, fontT, fit(fontT, d.signerTitle, w, 10, 8), sub, { align: "center" });
}

function qrBlock(page: PDFPage, qr: PDFImage, x: number, y: number, size: number, d: CertData, F: CertFonts, ink: RGB, sub: RGB): void {
  page.drawImage(qr, { x, y, width: size, height: size });
  const tx = x + size;
  text(page, `Nomor: ${d.number}`, tx, y - 13, F.sansB, 8, ink, { align: "right" });
  text(page, `Kode verifikasi: ${d.code}`, tx, y - 24, F.sans, 7.5, sub, { align: "right" });
  text(page, d.verifyUrl, tx, y - 35, F.sans, 7, sub, { align: "right" });
}

function courseBlock(page: PDFPage, d: CertData, cx: number, y: number, maxW: number, font: PDFFont, size: number, color: RGB, lines = 2, lh = 1.25): number {
  const ls = wrap(font, d.course, size, maxW, lines);
  ls.forEach((l, i) => text(page, l, cx, y - i * size * lh, font, size, color, { align: "center" }));
  return y - ls.length * size * lh;
}

// ---------- 1. Klasik Elegan ----------
function classic(page: PDFPage, F: CertFonts, d: CertData, A: CertAssets): void {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.cream });
  rectStroke(page, 22, 22, W - 44, H - 44, C.navy, 2.2);
  rectStroke(page, 30, 30, W - 60, H - 60, C.gold, 0.9);
  for (const [cx, cy] of [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]] as [number, number][]) {
    page.drawCircle({ x: cx, y: cy, size: 9, color: C.cream, borderColor: C.gold, borderWidth: 1 });
    diamond(page, cx, cy, 4.5, C.gold);
  }
  logoRow(page, A.logos, W / 2, H - 100, 52, "center", C.goldSoft);
  text(page, spaced("SERTIFIKAT", 1), W / 2, H - 150, F.serifB, 34, C.navy, { align: "center" });
  text(page, spaced("PENYELESAIAN KURSUS", 1), W / 2, H - 172, F.sansB, 9, C.gold, { align: "center" });
  ruler(page, W / 2 - 60, H - 184, W / 2 + 60, C.gold, 1);
  diamond(page, W / 2, H - 184, 3.2, C.gold);
  text(page, "Diberikan kepada", W / 2, H - 214, F.serifI, 14, C.grey, { align: "center" });
  const ns = fit(F.serifBI, d.name, 640, 42, 22);
  text(page, d.name, W / 2, H - 258, F.serifBI, ns, C.navy, { align: "center" });
  ruler(page, W / 2 - 250, H - 270, W / 2 + 250, C.goldSoft, 0.8);
  text(page, "atas keberhasilannya menyelesaikan kursus", W / 2, H - 296, F.serifI, 13, C.grey, { align: "center" });
  const yb = courseBlock(page, d, W / 2, H - 326, 600, F.serifB, fit(F.serifB, d.course, 1200, 22, 16), C.ink);
  text(page, `Diterbitkan pada ${d.date}`, W / 2, yb - 8, F.serif, 12, C.grey, { align: "center" });
  signature(page, d, A.sig, 96, 92, 200, C.ink, C.grey, F.serifB, F.serifI);
  const sx = W / 2;
  const sy = 96;
  page.drawCircle({ x: sx, y: sy, size: 34, color: C.gold });
  page.drawCircle({ x: sx, y: sy, size: 29, color: C.cream, borderColor: C.navy, borderWidth: 1 });
  page.drawCircle({ x: sx, y: sy, size: 24, borderColor: C.gold, borderWidth: 0.8 });
  text(page, "RA", sx, sy - 6, F.serifB, 20, C.navy, { align: "center" });
  text(page, "TERVERIFIKASI", sx, sy - 44, F.sansB, 6.5, C.gold, { align: "center" });
  qrBlock(page, A.qr, W - 96 - 62, 96, 62, d, F, C.ink, C.grey);
}

// ---------- 2. Modern Minimalis ----------
function modern(page: PDFPage, F: CertFonts, d: CertData, A: CertAssets): void {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.white });
  page.drawRectangle({ x: 0, y: 0, width: 132, height: H, color: C.blue });
  page.drawRectangle({ x: 132, y: 0, width: 5, height: H, color: C.gold });
  text(page, spaced("RUMAHAGEN  LEARNING", 1), 78, 60, F.sansB, 10, rgb(0.85, 0.91, 1), { rotate: degrees(90) });
  text(page, d.year, 34, H - 70, F.sansB, 26, C.white);
  text(page, "Sertifikat", 34, H - 88, F.sans, 10, rgb(0.85, 0.91, 1));
  const x0 = 190;
  const mw = W - x0 - 60;
  logoRow(page, A.logos, x0, H - 108, 48, "left", C.line);
  text(page, spaced("SERTIFIKAT KELULUSAN", 1), x0, H - 160, F.sansB, 11, C.blue);
  text(page, "Dengan bangga diberikan kepada", x0, H - 196, F.sans, 12, C.grey);
  const ns = fit(F.sansB, d.name, mw, 38, 20);
  text(page, d.name, x0, H - 240, F.sansB, ns, C.navy);
  page.drawRectangle({ x: x0, y: H - 256, width: 64, height: 3, color: C.gold });
  text(page, "atas keberhasilan menyelesaikan kursus", x0, H - 284, F.sans, 12, C.grey);
  const fs = fit(F.sansB, d.course, 2000, 21, 15);
  const ls = wrap(F.sansB, d.course, fs, mw, 2);
  ls.forEach((l, i) => text(page, l, x0, H - 314 - i * fs * 1.3, F.sansB, fs, C.ink));
  const yb = H - 314 - ls.length * fs * 1.3;
  text(page, `Diterbitkan pada ${d.date}`, x0, yb - 6, F.sans, 11, C.grey);
  signature(page, d, A.sig, x0, 96, 190, C.ink, C.grey, F.sansB, F.sans);
  qrBlock(page, A.qr, W - 60 - 66, 96, 66, d, F, C.ink, C.grey);
}

// ---------- 3. Korporat Lingkaran ----------
function corporate(page: PDFPage, F: CertFonts, d: CertData, A: CertAssets): void {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.white });
  const blueLight = rgb(0.9, 0.94, 0.99);
  const blueMid = rgb(0.62, 0.76, 0.95);
  for (const [r, col, op] of [[190, blueLight, 1], [150, blueMid, 0.55], [108, C.blue, 1], [70, C.navy, 1]] as [number, RGB, number][]) page.drawCircle({ x: W, y: H, size: r, color: col, opacity: op });
  page.drawCircle({ x: W, y: H, size: 128, borderColor: C.gold, borderWidth: 1.6 });
  for (const [r, col, op] of [[170, blueLight, 1], [128, blueMid, 0.5], [88, C.blue, 1]] as [number, RGB, number][]) page.drawCircle({ x: 0, y: 0, size: r, color: col, opacity: op });
  page.drawCircle({ x: 0, y: 0, size: 106, borderColor: C.gold, borderWidth: 1.6 });
  logoRow(page, A.logos, 50, H - 96, 52, "left", C.line);
  text(page, "SERTIFIKAT", W / 2, H - 152, F.sansB, 32, C.navy, { align: "center" });
  const pillW = 190;
  roundRect(page, W / 2 - pillW / 2, H - 186, pillW, 22, 11, C.blue);
  text(page, "PENYELESAIAN KURSUS", W / 2, H - 179, F.sansB, 9.5, C.white, { align: "center" });
  text(page, "Dengan bangga diberikan kepada", W / 2, H - 218, F.sans, 12.5, C.grey, { align: "center" });
  const ns = fit(F.sansB, d.name, 640, 36, 20);
  text(page, d.name, W / 2, H - 258, F.sansB, ns, C.navy, { align: "center" });
  roundRect(page, W / 2 - 46, H - 272, 92, 4, 2, C.gold);
  text(page, "atas keberhasilan menyelesaikan kursus", W / 2, H - 298, F.sans, 12.5, C.grey, { align: "center" });
  const fs = fit(F.sansB, d.course, 1200, 19, 14);
  const ls = wrap(F.sansB, d.course, fs, 560, 2);
  const ph = ls.length * fs * 1.3 + 22;
  roundRect(page, W / 2 - 300, H - 312 - ph, 600, ph, 14, C.tint);
  roundRect(page, W / 2 - 292, H - 312 - ph + 12, 4, ph - 24, 2, C.gold);
  ls.forEach((l, i) => text(page, l, W / 2, H - 312 - 12 - fs - i * fs * 1.3 + 6, F.sansB, fs, C.ink, { align: "center" }));
  text(page, `Diterbitkan pada ${d.date}`, W / 2, H - 312 - ph - 18, F.sans, 11, C.grey, { align: "center" });
  signature(page, d, A.sig, 200, 92, 190, C.ink, C.grey, F.sansB, F.sans);
  text(page, "Nomor Sertifikat", W / 2 + 40, 104, F.sans, 8, C.grey, { align: "center" });
  text(page, d.number, W / 2 + 40, 86, F.sansB, 14, C.navy, { align: "center" });
  text(page, `Kode: ${d.code}`, W / 2 + 40, 72, F.sans, 8, C.grey, { align: "center" });
  qrBlock(page, A.qr, W - 70 - 62, 92, 62, d, F, C.ink, C.grey);
}

// ---------- 4. Premium Art Deco ----------
function premium(page: PDFPage, F: CertFonts, d: CertData, A: CertAssets): void {
  const paper = rgb(0.975, 0.972, 0.96);
  const deep = rgb(0.03, 0.09, 0.22);
  const goldD = rgb(0.6, 0.42, 0.1);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
  const PH = 190;
  const py = H - PH;
  page.drawRectangle({ x: 0, y: py, width: W, height: PH, color: deep });
  const cx = W / 2;
  const cy = py;
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * Math.PI;
    const x2 = cx + Math.cos(a) * 330;
    const y2 = cy + Math.sin(a) * 230;
    if (Math.abs(Math.cos(a)) < 0.62) continue;
    page.drawLine({ start: { x: cx + Math.cos(a) * 150, y: cy + Math.sin(a) * 105 }, end: { x: x2, y: Math.min(y2, H) }, color: C.gold, thickness: 0.6, opacity: 0.45 });
  }
  for (const r of [120, 170, 220, 270]) {
    for (const dx of [-1, 1]) {
      let prev: { x: number; y: number } | null = null;
      for (let i = 0; i <= 30; i++) {
        const a = (i / 30) * Math.PI;
        const p = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.7 };
        if (Math.abs(Math.cos(a)) >= 0.62 && Math.sign(Math.cos(a)) === dx && prev && p.y <= H) page.drawLine({ start: prev, end: p, color: C.gold, thickness: 0.7, opacity: 0.55 });
        prev = p;
      }
    }
  }
  page.drawRectangle({ x: 0, y: py - 3, width: W, height: 3, color: C.gold });
  const lw = logoWidth(A.logos, 52) + 36;
  roundRect(page, W / 2 - lw / 2, H - 92, lw, 62, 12, C.white);
  logoRow(page, A.logos, W / 2, H - 87, 52, "center", C.line);
  text(page, spaced("SERTIFIKAT PRESTASI", 1), W / 2, H - 130, F.serifB, 24, C.goldSoft, { align: "center" });
  text(page, spaced("PENYELESAIAN KURSUS", 1), W / 2, H - 150, F.sansB, 8.5, rgb(0.75, 0.8, 0.9), { align: "center" });
  const cxL = 92;
  const cw = W - 184;
  const cb = 84;
  const ct = py - 14;
  page.drawRectangle({ x: cxL + 4, y: cb - 5, width: cw, height: ct - cb, color: rgb(0, 0, 0), opacity: 0.08 });
  page.drawRectangle({ x: cxL, y: cb, width: cw, height: ct - cb, color: C.white, borderColor: C.gold, borderWidth: 1.2 });
  rectStroke(page, cxL + 7, cb + 7, cw - 14, ct - cb - 14, C.goldSoft, 0.5);
  text(page, "Dengan hormat diberikan kepada", W / 2, ct - 32, F.serifI, 13, C.grey, { align: "center" });
  const ns = fit(F.serifB, d.name, 560, 38, 20);
  text(page, d.name, W / 2, ct - 74, F.serifB, ns, deep, { align: "center" });
  ruler(page, W / 2 - 46, ct - 90, W / 2 - 8, C.gold, 1);
  ruler(page, W / 2 + 8, ct - 90, W / 2 + 46, C.gold, 1);
  diamond(page, W / 2, ct - 90, 3.4, C.gold);
  text(page, "atas keberhasilannya menyelesaikan kursus", W / 2, ct - 114, F.serifI, 12.5, C.grey, { align: "center" });
  const yb = courseBlock(page, d, W / 2, ct - 142, 520, F.serifB, fit(F.serifB, d.course, 1000, 20, 15), goldD, 2, 1.22);
  text(page, `Diterbitkan pada ${d.date}`, W / 2, yb - 4, F.serif, 11.5, C.grey, { align: "center" });
  signature(page, d, A.sig, cxL + 34, cb + 46, 190, C.ink, C.grey, F.serifB, F.serifI, 76);
  qrBlock(page, A.qr, cxL + cw - 34 - 56, cb + 52, 56, d, F, C.ink, C.grey);
  const sx = W / 2;
  const sy = cb + 2;
  page.drawSvgPath("M -22 0 L -31 -42 L -18 -34 L -8 -46 L 4 0 Z", { x: sx, y: sy, color: deep });
  page.drawSvgPath("M 22 0 L 31 -42 L 18 -34 L 8 -46 L -4 0 Z", { x: sx, y: sy, color: C.blue });
  rosette(page, sx, sy, 36, C.gold, C.white, deep, F, "RA", deep);
  text(page, `Nomor ${d.number}   •   Kode ${d.code}`, W / 2, 26, F.sans, 8, C.grey, { align: "center" });
}

export function drawCertificate(template: CertificateTemplate, page: PDFPage, F: CertFonts, d: CertData, A: CertAssets): void {
  ({ classic, modern, corporate, premium })[template](page, F, d, A);
}
