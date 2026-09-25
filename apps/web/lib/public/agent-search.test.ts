import { describe, expect, it } from "vitest";
import { agentQuery, parseAgentSearch } from "./agent-data";

describe("parseAgentSearch / agentQuery", () => {
  it("bawaan: urut listing terbanyak, 12 per halaman", () => {
    expect(parseAgentSearch({})).toEqual({ q: "", urut: "listing", tampil: 12 });
  });
  it("nilai tidak valid kembali ke bawaan; tampil dibulatkan dan dibatasi", () => {
    expect(parseAgentSearch({ urut: "acak", tampil: "5" })).toMatchObject({ urut: "listing", tampil: 12 });
    expect(parseAgentSearch({ tampil: "30" }).tampil).toBe(36);
    expect(parseAgentSearch({ tampil: "9999" }).tampil).toBe(12);
    expect(parseAgentSearch({ urut: "nama", q: "  budi " })).toMatchObject({ urut: "nama", q: "budi" });
  });
  it("query string menghilangkan nilai bawaan", () => {
    expect(agentQuery(parseAgentSearch({}))).toBe("");
    expect(agentQuery(parseAgentSearch({ q: "bogor", urut: "nama" }), { tampil: 24 })).toBe("?q=bogor&urut=nama&tampil=24");
  });
});
