// app/api/admin/diagnostics/midtrans-key-check/route.ts
// SEMENTARA — diagnostik satu kali untuk memastikan MIDTRANS_SERVER_KEY yang tersimpan di Vercel byte-identik dengan yang dipegang admin, TANPA pernah
// menampilkan nilainya. Hanya mengembalikan cuplikan SHA-256 (8 karakter hex pertama, tidak bisa dibalik jadi key asli) dan panjang string-nya.
// HAPUS FILE INI setelah dipakai — bukan bagian permanen dari aplikasi.
import crypto from "node:crypto";

export async function GET() {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  const fingerprint = crypto.createHash("sha256").update(key).digest("hex").slice(0, 12);
  return Response.json({ length: key.length, fingerprint });
}
