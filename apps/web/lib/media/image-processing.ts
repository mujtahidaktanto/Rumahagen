// lib/media/image-processing.ts — pengecilan dan pemangkasan foto DI BROWSER sebelum diunggah (keputusan 2026-09-26): agen memilih foto kamera apa adanya (hingga 25 MB), browser
// mengecilkannya ke WebP (cadangan JPEG) di bawah 3 MB per berkas. Hanya untuk komponen klien (memakai canvas dan fetch). Geometri murni ada di lib/media/variants.ts (diuji).
import {
  AVATAR_SIZE,
  LISTING_VARIANTS,
  LISTING_VARIANT_ORDER,
  MAX_PICKED_IMAGE_BYTES,
  MAX_STORED_IMAGE_BYTES,
  fitWithin,
  type ListingVariant,
  type StoredImageType,
} from "./variants";

export type Source = { canvas: HTMLCanvasElement; width: number; height: number };
export type Encoded = { blob: Blob; type: StoredImageType };

const isHeic = (f: File) => /hei[cf]$/i.test(f.name) || /hei[cf]/i.test(f.type);

/** Alasan berkas tidak bisa dipakai sebelum diproses; null = boleh dicoba. */
export function pickProblem(file: { name: string; type: string; size: number }): string | null {
  if (/hei[cf]$/i.test(file.name) || /hei[cf]/i.test(file.type)) return "Format HEIC belum bisa dibuka di browser ini. Pilih foto dari galeri (otomatis JPEG) atau ubah ke JPEG dahulu.";
  if (!file.type.startsWith("image/")) return "Berkas harus berupa gambar (JPG, PNG, atau WebP).";
  if (file.size <= 0) return "Berkas kosong.";
  if (file.size > MAX_PICKED_IMAGE_BYTES) return "Ukuran foto melebihi 25 MB. Pilih foto lain.";
  return null;
}

/** Membuka berkas gambar ke kanvas, dengan orientasi EXIF (foto HP tegak) sudah diterapkan. */
export async function loadSource(file: File): Promise<Source> {
  if (isHeic(file)) throw new Error(pickProblem(file) ?? "HEIC");
  let bmp: ImageBitmap | HTMLImageElement;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bmp = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Foto tidak bisa dibuka. Coba foto lain."));
      };
      img.src = url;
    });
  }
  const width = "naturalWidth" in bmp ? bmp.naturalWidth : bmp.width;
  const height = "naturalHeight" in bmp ? bmp.naturalHeight : bmp.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0);
  if ("close" in bmp) bmp.close();
  return { canvas, width, height };
}

/** Memutar sumber 90 derajat searah jarum jam. */
export function rotateSource(src: Source): Source {
  const canvas = document.createElement("canvas");
  canvas.width = src.height;
  canvas.height = src.width;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src.canvas, 0, 0);
  return { canvas, width: src.height, height: src.width };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Menyandikan kanvas ke WebP (cadangan JPEG bila browser tak mendukung WebP) di bawah batas simpan; kualitas turun bertahap, lalu ukuran mengecil. */
export async function encodeUnderLimit(input: HTMLCanvasElement, maxBytes = MAX_STORED_IMAGE_BYTES): Promise<Encoded> {
  let canvas = input;
  for (let shrink = 0; shrink < 5; shrink++) {
    for (const q of [0.82, 0.72, 0.62, 0.5]) {
      let blob = await toBlob(canvas, "image/webp", q);
      let type: StoredImageType = "image/webp";
      if (!blob || blob.type !== "image/webp") {
        blob = await toBlob(canvas, "image/jpeg", q);
        type = "image/jpeg";
      }
      if (blob && blob.size <= maxBytes) return { blob, type };
    }
    const next = document.createElement("canvas");
    next.width = Math.max(1, Math.round(canvas.width * 0.8));
    next.height = Math.max(1, Math.round(canvas.height * 0.8));
    next.getContext("2d")!.drawImage(canvas, 0, 0, next.width, next.height);
    canvas = next;
  }
  throw new Error("Foto tidak bisa dikecilkan. Coba foto lain.");
}

function scaled(src: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
  return c;
}

/** Tiga varian foto listing (400/1080/2048 px sisi terpanjang). Semua varian memakai jenis berkas yang sama. */
export async function makeListingVariants(src: Source): Promise<{ type: StoredImageType; blobs: Record<ListingVariant, Blob> }> {
  let type: StoredImageType | null = null;
  const blobs = {} as Record<ListingVariant, Blob>;
  for (const v of [...LISTING_VARIANT_ORDER].reverse()) {
    const { width, height } = fitWithin(src.width, src.height, LISTING_VARIANTS[v]);
    const enc = await encodeUnderLimit(scaled(src.canvas, width, height));
    if (type && enc.type !== type) throw new Error("Foto tidak bisa diproses di browser ini.");
    type = enc.type;
    blobs[v] = enc.blob;
  }
  return { type: type!, blobs };
}

/** Pangkas persegi (piksel sumber) lalu jadikan foto profil 512x512. */
export async function makeAvatar(src: Source, rect: { sx: number; sy: number; size: number }): Promise<Encoded> {
  const c = document.createElement("canvas");
  c.width = AVATAR_SIZE;
  c.height = AVATAR_SIZE;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src.canvas, rect.sx, rect.sy, rect.size, rect.size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return encodeUnderLimit(c);
}

/** PUT berkas ke signed upload URL (Content-Type sama dengan yang diminta). Melempar bila gagal. */
export async function putToSignedUrl(url: string, blob: Blob, type: string): Promise<void> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": type }, body: blob });
  if (!res.ok) throw new Error("upload");
}
