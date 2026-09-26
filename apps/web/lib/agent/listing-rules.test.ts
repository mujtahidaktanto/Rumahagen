import { describe, expect, it } from "vitest";
import { detailActions, leadSourceLabel, publishErrorMessage, refreshState } from "./listing-rules";

const now = new Date("2026-09-26T10:00:00Z"); // 17.00 WIB

describe("refreshState", () => {
  it("hanya published yang bisa di-refresh", () => {
    expect(refreshState({ status: "draft", lastRefreshedAt: null }, { allowance: 5, usedToday: 0 }, now)).toBe("tidak_tersedia");
  });
  it("sudah di-refresh hari ini (kalender WIB) mengalahkan kuota", () => {
    expect(refreshState({ status: "published", lastRefreshedAt: "2026-09-26T01:00:00Z" }, { allowance: 5, usedToday: 1 }, now)).toBe("sudah_hari_ini");
    // kemarin malam WIB (16.59 UTC = 23.59 WIB tanggal 25) bukan hari ini
    expect(refreshState({ status: "published", lastRefreshedAt: "2026-09-25T16:59:00Z" }, { allowance: 5, usedToday: 1 }, now)).toBe("siap");
  });
  it("kuota habis vs siap vs tidak diketahui", () => {
    expect(refreshState({ status: "published", lastRefreshedAt: null }, { allowance: 5, usedToday: 5 }, now)).toBe("kuota_habis");
    expect(refreshState({ status: "published", lastRefreshedAt: null }, { allowance: 5, usedToday: 2 }, now)).toBe("siap");
    expect(refreshState({ status: "published", lastRefreshedAt: null }, "gagal", now)).toBe("tidak_diketahui");
    expect(refreshState({ status: "published", lastRefreshedAt: null }, null, now)).toBe("tidak_diketahui");
  });
});

describe("detailActions", () => {
  it("draft: terbitkan, edit, hapus; tanpa terjual/tersewa", () => {
    expect(detailActions({ status: "draft", transactionType: "sale" })).toMatchObject({ publish: true, edit: true, remove: true, markSold: false, markRented: false });
  });
  it("published: jual -> terjual saja, sewa -> tersewa saja, tidak bisa dihapus", () => {
    expect(detailActions({ status: "published", transactionType: "sale" })).toMatchObject({ markSold: true, markRented: false, remove: false, publish: false });
    expect(detailActions({ status: "published", transactionType: "rent" })).toMatchObject({ markSold: false, markRented: true });
  });
  it("rejected: ajukan ulang; suspended: tidak bisa diedit", () => {
    expect(detailActions({ status: "rejected", transactionType: "sale" })).toMatchObject({ resubmit: true, edit: true });
    expect(detailActions({ status: "suspended", transactionType: "sale" })).toMatchObject({ edit: false, remove: false });
  });
});

describe("publishErrorMessage / leadSourceLabel", () => {
  it("kuota habis diberi kalimat khusus", () => {
    expect(publishErrorMessage({ details: { reason: "listing_quota_exhausted" } })).toMatch(/Kuota penerbitan habis/);
    expect(publishErrorMessage({ message: "Ditolak." })).toBe("Ditolak.");
    expect(publishErrorMessage(null)).toMatch(/Gagal menerbitkan/);
  });
  it("sumber lead", () => {
    expect(leadSourceLabel("whatsapp_cta")).toMatch(/WhatsApp/);
    expect(leadSourceLabel("lain")).toBe("lain");
  });
});
