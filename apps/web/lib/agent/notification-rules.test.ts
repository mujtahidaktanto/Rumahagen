import { describe, expect, it } from "vitest";
import { notificationQuery, notificationType, notificationsPath, parseNotificationSearch } from "./notification-rules";

describe("jenis notifikasi", () => {
  it("semua nilai CHECK punya label; tak dikenal tampil apa adanya", () => {
    for (const t of ["approval_status", "event_reminder", "listing_expiring", "certificate_issued", "lead_new", "lainnya"]) expect(notificationType(t).label).not.toBe(t);
    expect(notificationType("baru")).toEqual({ label: "baru", tone: "neutral" });
    expect(notificationType("lead_new").tone).toBe("info");
  });
});

describe("parameter daftar", () => {
  it("bawaan dan batas", () => {
    expect(parseNotificationSearch({})).toEqual({ filter: "semua", tampil: 20, tersembunyi: false });
    expect(parseNotificationSearch({ filter: "belum", tampil: "40", tersembunyi: "1" })).toEqual({ filter: "belum", tampil: 40, tersembunyi: true });
    expect(parseNotificationSearch({ filter: "x", tampil: "5" }).tampil).toBe(20);
    expect(parseNotificationSearch({ tampil: "9999" }).tampil).toBe(20);
    expect(parseNotificationSearch({ tampil: ["60"] }).tampil).toBe(60);
  });
  it("query hanya memuat nilai bukan bawaan", () => {
    const s = parseNotificationSearch({});
    expect(notificationQuery(s)).toBe("");
    expect(notificationQuery(s, { filter: "belum" })).toBe("?filter=belum");
    expect(notificationQuery(s, { filter: "belum", tampil: 40, tersembunyi: true })).toBe("?filter=belum&tampil=40&tersembunyi=1");
  });
  it("jalur per persona", () => {
    expect(notificationsPath("agent")).toBe("/agent/notifikasi");
    expect(notificationsPath("instructor")).toBe("/instructor/notifikasi");
  });
});
