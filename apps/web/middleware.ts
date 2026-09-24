// middleware.ts
// Pengalihan URL untuk pengunjung publik dari tabel url_redirects (M11, migration 0051; entri otomatis saat slug berubah: 0137).
// Membaca SELURUH tabel (kecil, SELECT publik sesuai RLS url_redirects_select_public) lewat REST anon dan menyimpannya di memori isolate selama
// 60 detik; saat kedaluwarsa, tabel lama tetap dipakai sambil disegarkan di latar belakang (waitUntil). Kegagalan membaca tidak pernah menghalangi
// halaman: tanpa data pengalihan, request diteruskan apa adanya. Hanya jalur internal yang dialihkan (lib/seo/url-redirects.ts).
// Tidak berlaku untuk /api, aset Next, dan berkas statis (matcher).

import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { buildRedirectMap, resolveRedirect, type RedirectMap } from "@/lib/seo/url-redirects";

const TTL_MS = 60_000;
const RETRY_AFTER_FAILURE_MS = 10_000;
const FETCH_TIMEOUT_MS = 800;
const MAX_ROWS = 5000;

let cache: { map: RedirectMap; loadedAt: number; ok: boolean } | null = null;
let inflight: Promise<void> | null = null;

async function refresh(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      cache = { map: cache?.map ?? new Map(), loadedAt: Date.now(), ok: false };
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${url}/rest/v1/url_redirects?select=old_path,new_path,redirect_type&limit=${MAX_ROWS}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`url_redirects ${res.status}`);
      cache = { map: buildRedirectMap(await res.json()), loadedAt: Date.now(), ok: true };
    } catch {
      // Pertahankan tabel lama bila ada; coba lagi lebih cepat.
      cache = { map: cache?.map ?? new Map(), loadedAt: Date.now() - (TTL_MS - RETRY_AFTER_FAILURE_MS), ok: false };
    } finally {
      clearTimeout(timer);
      inflight = null;
    }
  })();
  return inflight;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  if (!cache) {
    await refresh();
  } else if (Date.now() - cache.loadedAt > TTL_MS) {
    event.waitUntil(refresh());
  }

  const map = cache?.map;
  if (!map || map.size === 0) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const rule = resolveRedirect(map, pathname, search);
  if (!rule) {
    return NextResponse.next();
  }

  const target = new URL(rule.to, request.url);
  const response = NextResponse.redirect(target, rule.status);
  response.headers.set("x-redirect-source", "url_redirects");
  return response;
}

export const config = {
  // Lewati API, aset Next, dan berkas dengan ekstensi (sitemap .xml, gambar, dst.).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
