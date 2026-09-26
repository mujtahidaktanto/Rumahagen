import { describe, expect, it } from "vitest";
import { allVariantPaths, avatarPath, baseScale, centerCrop, clampCrop, fitWithin, listingPhotoPath, listingPhotoUrl, objectPathFromPublicUrl, sourceRect, zoomAtCenter } from "./variants";

const SB = "https://abc.supabase.co";

describe("URL varian foto listing", () => {
  const large = `${SB}/storage/v1/object/public/listing-photos/u1/l1/aaaa-2048.webp`;
  it("menurunkan varian kecil dan sedang dari varian besar", () => {
    expect(listingPhotoUrl(large, "sm")).toBe(`${SB}/storage/v1/object/public/listing-photos/u1/l1/aaaa-400.webp`);
    expect(listingPhotoUrl(large, "md")).toBe(`${SB}/storage/v1/object/public/listing-photos/u1/l1/aaaa-1080.webp`);
    expect(listingPhotoUrl(large, "lg")).toBe(large);
  });
  it("URL lama/eksternal dikembalikan apa adanya; kosong -> null", () => {
    expect(listingPhotoUrl("https://cdn.example.com/foto.jpg", "sm")).toBe("https://cdn.example.com/foto.jpg");
    expect(listingPhotoUrl(null, "sm")).toBeNull();
    expect(listingPhotoUrl("", "md")).toBeNull();
  });
  it("mendukung ekstensi jpg (cadangan bila WebP tidak didukung browser)", () => {
    expect(listingPhotoUrl(`${SB}/x/a-2048.jpg`, "sm")).toBe(`${SB}/x/a-400.jpg`);
  });
});

describe("path", () => {
  it("susunan path listing dan avatar", () => {
    expect(listingPhotoPath("u1", "l1", "id", "lg", "webp")).toBe("u1/l1/id-2048.webp");
    expect(avatarPath("u1", "id", "jpg")).toBe("u1/id-512.jpg");
  });
  it("semua path varian dari varian besar", () => {
    expect(allVariantPaths("u1/l1/id-2048.webp")).toEqual(["u1/l1/id-400.webp", "u1/l1/id-1080.webp", "u1/l1/id-2048.webp"]);
    expect(allVariantPaths("u1/l1/lama.jpg")).toEqual(["u1/l1/lama.jpg"]);
  });
  it("path dari URL publik bucket; bucket/host lain ditolak", () => {
    expect(objectPathFromPublicUrl(`${SB}/storage/v1/object/public/avatars/u1/a-512.webp?v=1`, SB, "avatars")).toBe("u1/a-512.webp");
    expect(objectPathFromPublicUrl(`${SB}/storage/v1/object/public/listing-photos/u1/a.webp`, SB, "avatars")).toBeNull();
    expect(objectPathFromPublicUrl(`https://evil.com/storage/v1/object/public/avatars/u1/a.webp`, SB, "avatars")).toBeNull();
    expect(objectPathFromPublicUrl(`${SB}/storage/v1/object/public/avatars/u1/../u2/a.webp`, SB, "avatars")).toBeNull();
  });
});

describe("fitWithin", () => {
  it("mengecilkan sisi terpanjang, tidak pernah memperbesar", () => {
    expect(fitWithin(4000, 3000, 2048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(3000, 4000, 1080)).toEqual({ width: 810, height: 1080 });
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(0, 10, 100)).toEqual({ width: 0, height: 0 });
  });
});

describe("pemangkas", () => {
  const W = 4000;
  const H = 3000;
  const F = 280;
  it("posisi awal di tengah dan menutupi bingkai", () => {
    const c = centerCrop(W, H, F);
    const r = sourceRect(W, H, F, c);
    expect(r.size).toBeCloseTo(3000, 5);
    expect(r.sx).toBeCloseTo(500, 5);
    expect(r.sy).toBeCloseTo(0, 5);
  });
  it("geser dijepit agar tidak ada ruang kosong", () => {
    const c = clampCrop(W, H, F, { zoom: 1, x: 500, y: 500 });
    expect(c.x).toBeLessThanOrEqual(0);
    expect(c.y).toBeLessThanOrEqual(0);
    const far = clampCrop(W, H, F, { zoom: 1, x: -99999, y: -99999 });
    const s = baseScale(W, H, F);
    expect(far.x).toBeCloseTo(F - W * s, 5);
    expect(far.y).toBeCloseTo(0, 5); // sisi pendek tepat menutupi bingkai
  });
  it("zoom dibatasi 1..4 dan menjaga titik tengah", () => {
    const c0 = centerCrop(W, H, F);
    const before = sourceRect(W, H, F, c0);
    const cxBefore = before.sx + before.size / 2;
    const c1 = zoomAtCenter(W, H, F, c0, 2);
    const after = sourceRect(W, H, F, c1);
    expect(after.size).toBeCloseTo(before.size / 2, 5);
    expect(after.sx + after.size / 2).toBeCloseTo(cxBefore, 4);
    expect(zoomAtCenter(W, H, F, c0, 99).zoom).toBe(4);
    expect(zoomAtCenter(W, H, F, c0, 0.2).zoom).toBe(1);
  });
  it("persegi sumber selalu berada di dalam gambar", () => {
    for (const z of [1, 1.7, 3, 4]) {
      const c = clampCrop(W, H, F, { zoom: z, x: -1e6, y: -1e6 });
      const r = sourceRect(W, H, F, c);
      expect(r.sx).toBeGreaterThanOrEqual(-1e-6);
      expect(r.sy).toBeGreaterThanOrEqual(-1e-6);
      expect(r.sx + r.size).toBeLessThanOrEqual(W + 1e-6);
      expect(r.sy + r.size).toBeLessThanOrEqual(H + 1e-6);
    }
  });
});
