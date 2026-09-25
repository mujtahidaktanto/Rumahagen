import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("menyelesaikan kelas Tailwind yang bentrok (yang terakhir menang)", () => {
    expect(cn("px-2 px-4")).toBe("px-4");
  });
  it("tidak membuang skala tipografi kustom saat bersanding dengan warna teks", () => {
    expect(cn("text-title-md", "text-ink-500")).toBe("text-title-md text-ink-500");
  });
  it("tetap menimpa ukuran teks kustom dengan ukuran teks kustom lain", () => {
    expect(cn("text-body-md", "text-title-lg")).toBe("text-title-lg");
  });
  it("mengabaikan nilai falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
