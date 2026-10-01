// lib/ai/platform/response-schemas.ts — skema JSON ketat hasil AI (docs/ai-description-rules.md
// "Skema JSON output deskripsi" + "Generate MetaSEO"). Lapis 5 anti prompt-injection: kunci lain
// ditolak, panjang dibatasi, tipe dicek -- AI yang "dibelokkan" untuk menambah isi di luar format
// tidak lolos sampai ke pengguna.
import { z } from "zod";

export const descriptionAiResponseSchema = z
  .object({
    judul_saran: z.string().max(300).nullable(),
    deskripsi: z.string().min(1).max(4000),
    poin_unggulan: z.array(z.string().max(200)).max(5),
    poin_area: z.array(z.object({ id: z.string().max(20), teks: z.string().max(300) })).max(12),
    saran_field: z
      .array(
        z.object({
          field: z.string().max(50),
          nilai: z.union([z.string(), z.number(), z.boolean()]),
          jenis: z.enum(["isi_kosong", "konflik"]),
          bukti: z.string().max(200),
          keyakinan: z.enum(["tinggi", "sedang", "rendah"]),
        }),
      )
      .max(20),
    catatan_verifikasi: z.array(z.string().max(300)).max(20),
  })
  .strict();

export const metaSeoAiResponseSchema = z
  .object({
    kata_kunci_utama: z.string().max(100),
    meta_title: z.string().max(200),
    meta_description_inti: z.string().max(400),
  })
  .strict();

const JSON_BLOCK = /\{[\s\S]*\}/;

/** Ambil blok { ... } pertama kalau ada teks di luar JSON -- docs "Pemeriksaan server untuk setiap fakta" / "Pemeriksaan hasil di server". */
export function extractJsonBlock(text: string): unknown {
  const match = text.match(JSON_BLOCK);
  if (!match) throw new Error("Respons AI tidak mengandung objek JSON.");
  return JSON.parse(match[0]);
}
