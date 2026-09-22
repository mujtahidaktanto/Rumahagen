// app/api/market-insights/suburb/route.ts
// GET /market-insights/suburb (STEP11-B10 M07 list, PRESERVE). TIDAK ADA
// definisi semantik "market insight" di mana pun di korpus Core selain
// nama endpoint ini sendiri (dicek menyeluruh — tidak ada di STEP10
// dictionary, tidak ada entity MARKET_INSIGHT) — jadi bentuk respons di
// bawah adalah KEPUTUSAN REKAYASA (agregat harga listing publik per
// district_id, dipakai wajar sebagai konteks pembanding saat agent
// menjalankan simulasi DBR untuk properti di area itu), BUKAN tabel baru
// (tidak ada data yang dikarang — murni agregat dari `listings` yang
// sudah ada dan sudah publik). Kalau Core suatu saat mengunci bentuk lain,
// ini gampang diubah tanpa mempengaruhi skema/permission apa pun.
//
// Publik (tanpa sesi) — data sumbernya (listing published) memang sudah
// bisa dibaca publik lewat RLS listings_select_published_or_owner_or_staff
// (0018), agregasi di sini tidak membocorkan apa pun yang belum publik.

import { withApiHandler } from "@/lib/api/handler";
import { validateSearchParams } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const suburbQuerySchema = z.object({
  district_id: z.string().uuid(),
});

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { district_id } = validateSearchParams(url.searchParams, suburbQuerySchema);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("property_type, transaction_type, price, land_area, building_area")
    .eq("district_id", district_id)
    .eq("status", "published");

  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    throw new ApiError("NOT_FOUND", "Tidak ada listing published di district ini.");
  }

  const groups = new Map<string, { prices: number[]; pricePerSqm: number[] }>();
  for (const row of data) {
    const key = `${row.property_type}:${row.transaction_type}`;
    if (!groups.has(key)) groups.set(key, { prices: [], pricePerSqm: [] });
    const g = groups.get(key)!;
    const price = Number(row.price);
    g.prices.push(price);
    const area = Number(row.building_area) || Number(row.land_area) || 0;
    if (area > 0) g.pricePerSqm.push(price / area);
  }

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

  const breakdown = Array.from(groups.entries()).map(([key, g]) => {
    const [property_type, transaction_type] = key.split(":");
    return {
      property_type,
      transaction_type,
      listing_count: g.prices.length,
      avg_price: avg(g.prices),
      min_price: Math.min(...g.prices),
      max_price: Math.max(...g.prices),
      avg_price_per_sqm: avg(g.pricePerSqm),
    };
  });

  return { data: { district_id, total_listings: data.length, breakdown } };
});
