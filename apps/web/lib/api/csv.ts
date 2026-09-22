// lib/api/csv.ts
// Util CSV kecil untuk GET /admin/reports/export (satu-satunya konsumen
// saat ini) -- tidak ada library CSV di package.json, dan kebutuhannya
// sesederhana escape RFC 4180 dasar, jadi tidak menambah dependency baru.

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}
