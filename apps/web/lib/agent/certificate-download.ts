// lib/agent/certificate-download.ts — unduh PDF sertifikat dari browser (M04). Endpoint PDF bukan JSON: berhasil = berkas, gagal = JSON { error: { message } }.
// Mengembalikan nama berkas yang diunduh, atau melempar Error berpesan yang bisa ditampilkan apa adanya.
export async function downloadCertificatePdf(path: string, fallbackName: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "same-origin" });
  } catch {
    throw new Error("Sertifikat belum bisa diunduh. Periksa koneksi Anda lalu coba lagi.");
  }
  if (!res.ok) {
    let msg = "Sertifikat belum bisa diunduh. Coba lagi beberapa saat lagi.";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (res.status !== 500 && j.error?.message) msg = j.error.message;
    } catch {
      // badan bukan JSON: pakai pesan umum
    }
    throw new Error(msg);
  }
  const cd = res.headers.get("Content-Disposition") ?? "";
  const name = /filename="?([^";]+)"?/i.exec(cd)?.[1];
  const filename = name ?? fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return filename;
}
