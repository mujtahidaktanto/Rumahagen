import { describe, expect, it } from "vitest";
import { EMPTY_EVENT, canEditEvent, canPublishEvent, canResubmitEvent, isoToWibLocal, toEventPayload, validateEvent, wibLocalToIso, type EventFormValues } from "./event-rules";

const ok: EventFormValues = { ...EMPTY_EVENT, title: "Open House Green Valley", category: "open_house", startAt: "2026-10-02T10:00" };

describe("waktu WIB", () => {
  it("datetime-local WIB <-> ISO UTC", () => {
    expect(wibLocalToIso("2026-10-02T10:00")).toBe("2026-10-02T03:00:00.000Z");
    expect(wibLocalToIso("2026-10-02T00:30")).toBe("2026-10-01T17:30:00.000Z");
    expect(isoToWibLocal("2026-10-02T03:00:00.000Z")).toBe("2026-10-02T10:00");
    expect(isoToWibLocal("2026-10-01T17:30:00Z")).toBe("2026-10-02T00:30");
  });
  it("kosong dan tidak valid", () => {
    expect(wibLocalToIso("")).toBeNull();
    expect(wibLocalToIso("2026-02-31T10:00")).toBeNull();
    expect(wibLocalToIso("bukan tanggal")).toBeNull();
    expect(isoToWibLocal(null)).toBe("");
    expect(isoToWibLocal("x")).toBe("");
  });
  it("bolak-balik konsisten", () => {
    for (const l of ["2026-01-01T00:00", "2026-12-31T23:59", "2027-03-15T13:45"]) expect(isoToWibLocal(wibLocalToIso(l))).toBe(l);
  });
});

describe("validateEvent", () => {
  const now = new Date("2026-09-26T00:00:00Z");
  it("minimal valid", () => expect(validateEvent(ok, { creating: true, now })).toEqual({}));
  it("judul dan mulai wajib", () => {
    const e = validateEvent({ ...ok, title: " ", startAt: "" }, { creating: true, now });
    expect(e.title).toBeTruthy();
    expect(e.startAt).toMatch(/wajib/);
  });
  it("waktu lewat hanya ditolak saat membuat", () => {
    const past = { ...ok, startAt: "2026-01-01T10:00" };
    expect(validateEvent(past, { creating: true, now }).startAt).toMatch(/lewat/);
    expect(validateEvent(past, { creating: false, now }).startAt).toBeUndefined();
  });
  it("selesai harus setelah mulai", () => {
    expect(validateEvent({ ...ok, endAt: "2026-10-02T09:00" }, { creating: true, now }).endAt).toBeTruthy();
    expect(validateEvent({ ...ok, endAt: "2026-10-02T10:00" }, { creating: true, now }).endAt).toBeTruthy();
    expect(validateEvent({ ...ok, endAt: "2026-10-02T12:00" }, { creating: true, now }).endAt).toBeUndefined();
  });
  it("tautan meeting harus https; lokasi hanya untuk offline", () => {
    expect(validateEvent({ ...ok, isOnline: true, meetingLink: "http://x.com" }, { creating: true, now }).meetingLink).toBeTruthy();
    expect(validateEvent({ ...ok, isOnline: true, meetingLink: "https://meet.google.com/abc" }, { creating: true, now }).meetingLink).toBeUndefined();
    expect(validateEvent({ ...ok, isOnline: false, location: "x".repeat(256) }, { creating: true, now }).location).toBeTruthy();
  });
  it("kuota bilangan bulat positif", () => {
    for (const q of ["0", "-1", "1.5", "abc"]) expect(validateEvent({ ...ok, quota: q }, { creating: true, now }).quota).toBeTruthy();
    expect(validateEvent({ ...ok, quota: "50" }, { creating: true, now }).quota).toBeUndefined();
  });
});

describe("toEventPayload", () => {
  it("event offline: lokasi dikirim, tautan dikosongkan, opsional kosong tidak dikirim", () => {
    const p = toEventPayload({ ...ok, location: " Kantor RumahAgen " });
    expect(p).toMatchObject({ title: "Open House Green Valley", category: "open_house", is_online: false, location: "Kantor RumahAgen", meeting_link: "", start_at: "2026-10-02T03:00:00.000Z", registration_approval_mode: "auto_confirm", visibility: "public" });
    for (const k of ["end_at", "quota", "related_course_id", "related_project_id"]) expect(p).not.toHaveProperty(k);
  });
  it("event online + kuota + terkait", () => {
    const p = toEventPayload({ ...ok, isOnline: true, meetingLink: "https://meet.google.com/x", location: "diabaikan", quota: "50", endAt: "2026-10-02T12:00", relatedCourseId: "c1", relatedProjectId: "p1" });
    expect(p).toMatchObject({ is_online: true, meeting_link: "https://meet.google.com/x", location: "", quota: 50, end_at: "2026-10-02T05:00:00.000Z", related_course_id: "c1", related_project_id: "p1" });
  });
});

describe("aksi menurut status", () => {
  it("edit dan terbitkan", () => {
    expect(canEditEvent("published")).toBe(true);
    expect(canEditEvent("cancelled")).toBe(false);
    expect(canPublishEvent("pending_approval")).toBe(true);
    expect(canPublishEvent("rejected")).toBe(false);
    expect(canResubmitEvent("rejected")).toBe(true);
    expect(canResubmitEvent("pending_approval")).toBe(false);
    expect(canPublishEvent("published")).toBe(false);
    expect(canPublishEvent("cancelled")).toBe(false);
  });
});
