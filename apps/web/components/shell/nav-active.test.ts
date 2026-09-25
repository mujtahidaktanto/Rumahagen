import { describe, expect, it } from "vitest";
import { activeHref } from "./nav-active";

describe("activeHref", () => {
  const hrefs = ["/agent", "/agent/listing", "/agent/belajar", "/agent/profil"];
  it("halaman akar hanya mengaktifkan Dashboard", () => {
    expect(activeHref("/agent", hrefs)).toBe("/agent");
  });
  it("halaman turunan mengaktifkan menu terpanjang yang cocok, bukan Dashboard", () => {
    expect(activeHref("/agent/listing", hrefs)).toBe("/agent/listing");
    expect(activeHref("/agent/listing/123/edit", hrefs)).toBe("/agent/listing");
  });
  it("jalur yang tidak cocok tidak mengaktifkan apa pun", () => {
    expect(activeHref("/admin", hrefs)).toBeNull();
    expect(activeHref("/agentx", hrefs)).toBeNull();
  });
});
