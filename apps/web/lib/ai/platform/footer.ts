// lib/ai/platform/footer.ts — penutup wajib (docs/ai-description-rules.md "Penutup wajib: nama
// agen dan RumahAgen"). DITAMBAHKAN SERVER, tidak pernah ditulis/diminta dari AI -- supaya selalu
// konsisten dan tidak bisa diubah prompt injection. "RumahAgen" selalu kata terakhir.
export function applyFooter(description: string, template: string, agentOrCompanyName: string | null): string {
  const name = agentOrCompanyName?.trim();
  const footerLine = name ? template.replace("{nama_agen}", name) : "Dipasarkan melalui RumahAgen";
  return `${description.trim()}\n\n${footerLine}`;
}

/** Buang penutup lama (mode Perbaiki yang ada, atau saat deskripsi lain dipakai referensi). Penanda: baris terakhir diawali "Dipasarkan" dan diakhiri "RumahAgen" (boleh diikuti titik). */
export function stripFooter(text: string): string {
  const lines = text.split("\n");
  const lastIdx = lines.length - 1;
  const last = lines[lastIdx]?.trim() ?? "";
  if (/^Dipasarkan/.test(last) && /RumahAgen\.?$/.test(last)) {
    return lines.slice(0, lastIdx).join("\n").trim();
  }
  return text;
}
