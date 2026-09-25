// lib/supabase/middleware.ts
// Menyegarkan sesi Supabase (token akses kedaluwarsa ~1 jam -> ditukar lewat refresh token) untuk permintaan halaman aplikasi, dan meneruskan jalur permintaan lewat
// header `x-pathname` agar layout server tahu tujuan `next` saat mengalihkan ke /login. Server Component tidak boleh menulis cookie, jadi penyegaran harus
// terjadi di middleware (pola resmi @supabase/ssr). Hanya dipanggil untuk jalur aplikasi (needsSession), bukan halaman publik, agar halaman publik tidak
// menambah satu panggilan jaringan ke Supabase.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_PREFIXES = ["/agent", "/admin", "/partner", "/instructor", "/notifikasi", "/portal", "/login"];

export function needsSession(pathname: string): boolean {
  return SESSION_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return response; // tanpa konfigurasi Supabase: teruskan apa adanya (layout akan mengalihkan ke /login)
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    await supabase.auth.getUser(); // memicu penyegaran token bila perlu; hasilnya dibaca ulang oleh layout
  } catch {
    // Kegagalan jaringan ke Supabase tidak boleh menjatuhkan halaman; layout memutuskan (mengalihkan ke /login bila sesi tak terbaca).
  }
  return response;
}
