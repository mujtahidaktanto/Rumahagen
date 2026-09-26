import { describe, expect, it } from "vitest";
import { attemptBlockMessage, canMarkLesson, doneFromProgress, lpAmountLabel, progressForDone, safeHttps, toggleAnswer, youtubeEmbedUrl, toSubmitPayload, unansweredCount } from "./learning-rules";

describe("progres pelajaran", () => {
  it("k pelajaran selesai ↔ progres tersimpan bolak-balik untuk berbagai jumlah", () => {
    for (const n of [1, 2, 3, 5, 8, 12, 30, 60]) {
      for (let k = 0; k <= n; k++) {
        const p = progressForDone(k, n);
        expect(p).toBeLessThanOrEqual(90);
        expect(doneFromProgress(p, n, false)).toBe(k);
      }
    }
  });
  it("kursus selesai = semua pelajaran selesai; tanpa pelajaran = 0", () => {
    expect(doneFromProgress(100, 4, true)).toBe(4);
    expect(progressForDone(3, 0)).toBe(0);
    expect(doneFromProgress(50, 0, false)).toBe(0);
  });
  it("hanya pelajaran berikutnya yang boleh ditandai", () => {
    expect(canMarkLesson(2, 2)).toBe(true);
    expect(canMarkLesson(3, 2)).toBe(false);
    expect(canMarkLesson(1, 2)).toBe(false);
  });
});

describe("Learning Points", () => {
  it("tanda dan pemisah ribuan", () => {
    expect(lpAmountLabel(20)).toBe("+20 LP");
    expect(lpAmountLabel(-50)).toBe("−50 LP");
    expect(lpAmountLabel(1200)).toBe("+1.200 LP");
  });
});

describe("kuis", () => {
  const single = { id: "q1", question_type: "single_choice" as const };
  const multi = { id: "q2", question_type: "multi_choice" as const };
  it("pilihan tunggal menggantikan, pilihan ganda menukar", () => {
    let a = toggleAnswer({}, single, "a");
    a = toggleAnswer(a, single, "b");
    expect(a.q1).toEqual(["b"]);
    a = toggleAnswer(a, multi, "x");
    a = toggleAnswer(a, multi, "y");
    a = toggleAnswer(a, multi, "x");
    expect(a.q2).toEqual(["y"]);
  });
  it("hitung soal belum dijawab dan susun badan kiriman", () => {
    const qs = [{ id: "q1" }, { id: "q2" }];
    expect(unansweredCount(qs, { q1: ["a"] })).toBe(1);
    expect(unansweredCount(qs, { q1: ["a"], q2: [] })).toBe(1);
    expect(toSubmitPayload("e1", qs, { q1: ["a"], q2: ["b", "c"] })).toEqual({ enrollment_id: "e1", answers: [{ question_id: "q1", selected_option_ids: ["a"] }, { question_id: "q2", selected_option_ids: ["b", "c"] }] });
  });
  it("pesan batas percobaan dan jeda", () => {
    const now = new Date("2026-09-26T10:00:00Z");
    const base = { limited: true, attempts_used: 1, max_attempts: 3, cooldown_minutes: 30, next_allowed_at: null, can_attempt: true };
    expect(attemptBlockMessage(base, now)).toBeNull();
    expect(attemptBlockMessage(null, now)).toBeNull();
    expect(attemptBlockMessage({ ...base, can_attempt: false, next_allowed_at: "2026-09-26T10:25:00Z" }, now)).toBe("Anda bisa mencoba lagi dalam 25 menit.");
    expect(attemptBlockMessage({ ...base, can_attempt: false, next_allowed_at: "2026-09-26T13:00:00Z" }, now)).toBe("Anda bisa mencoba lagi dalam 3 jam.");
    expect(attemptBlockMessage({ ...base, can_attempt: false, attempts_used: 3 }, now)).toMatch(/3 percobaan/);
  });
});

describe("safeHttps", () => {
  it("hanya https", () => {
    expect(safeHttps("https://cdn.example.com/a.pdf")).toBe("https://cdn.example.com/a.pdf");
    expect(safeHttps("http://x.com/a")).toBeNull();
    expect(safeHttps("javascript:alert(1)")).toBeNull();
    expect(safeHttps(null)).toBeNull();
    expect(safeHttps("bukan url")).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  it("mengubah tautan YouTube menjadi sematan; selain itu null", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=abcDEF12345")).toBe("https://www.youtube-nocookie.com/embed/abcDEF12345");
    expect(youtubeEmbedUrl("https://youtu.be/abcDEF12345?t=3")).toBe("https://www.youtube-nocookie.com/embed/abcDEF12345");
    expect(youtubeEmbedUrl("https://www.youtube.com/embed/abcDEF12345")).toBe("https://www.youtube-nocookie.com/embed/abcDEF12345");
    expect(youtubeEmbedUrl("https://evil.com/watch?v=abcDEF12345")).toBeNull();
    expect(youtubeEmbedUrl("http://youtu.be/abcDEF12345")).toBeNull();
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=<script>")).toBeNull();
  });
});
