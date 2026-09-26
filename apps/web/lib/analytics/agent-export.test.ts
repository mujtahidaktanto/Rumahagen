import zlib from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildAgentStatsWorkbook } from "./agent-export";
import { assembleAgentStats, type AgentSummary, type DailyRow } from "./agent-stats";
import { enumerateDays } from "./period";

/** Pembaca zip minimal (direktori pusat + deflate mentah): peta nama berkas -> isi teks. */
function unzip(buf: Buffer): Record<string, string> {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nlen);
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(dataStart, dataStart + csize);
    out[name] = (method === 8 ? zlib.inflateRawSync(raw) : raw).toString("utf8");
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

const from = "2026-09-20";
const to = "2026-09-26";
const summary: AgentSummary = { listing_status: { published: 2 }, lead_pipeline: { new: 1 }, active_listings: 2, stale_listings: 0, top_listings: [] };
const current: DailyRow[] = enumerateDays(from, to).map((d) => ({ m_key: "views", m_day: d, m_value: 5 }));

describe("ekspor Excel Statistik Saya", () => {
  const stats = assembleAgentStats({ scope: "own", organizationId: null, from, to, compare: false, current, previous: null, summary, benchmark: null, generatedAt: "2026-09-26T00:00:00Z" });
  const buf = buildAgentStatsWorkbook(stats, { exportedBy: "Uji" });
  const files = unzip(buf);

  it("berkas xlsx sah (zip) dengan lembar yang diharapkan", () => {
    expect(buf.subarray(0, 2).toString()).toBe("PK");
    for (const name of ["Ringkasan", "Harian", "Listing", "Catatan"]) expect(files["xl/workbook.xml"]).toContain(`name="${name}"`);
  });
  it("pita identitas RumahAgen: dua baris berwarna di lembar Ringkasan memakai gaya merek", () => {
    const sheet = files["xl/worksheets/sheet1.xml"]!;
    expect(sheet).toContain("RumahAgen");
    expect(sheet).toContain("Statistik Saya");
    // baris 1 dan 2 memakai gaya 14 (merek) dan 15 (sub), melintasi kolom A-E
    expect((sheet.match(/s="14"/g) ?? []).length).toBe(5);
    expect((sheet.match(/s="15"/g) ?? []).length).toBe(5);
  });
  it("gaya: biru merek dan navy terdaftar, jumlah font/isian/gaya konsisten", () => {
    const st = files["xl/styles.xml"]!;
    expect(st).toContain('rgb="FF1652C4"');
    expect(st).toContain('rgb="FF0B2E6B"');
    expect(st).toContain('<fonts count="8">');
    expect(st.match(/<font>/g)!.length).toBe(8);
    expect(st).toContain('<fills count="6">');
    expect(st.match(/<fill>/g)!.length).toBe(6);
    const xfs = st.slice(st.indexOf("<cellXfs"), st.indexOf("</cellXfs>"));
    expect(xfs).toContain('<cellXfs count="16">');
    expect(xfs.match(/<xf /g)!.length).toBe(16);
  });
});
