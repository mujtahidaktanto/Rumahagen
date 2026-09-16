// lib/supabase/server.ts
// Supabase client untuk Server Components & Route Handlers, memakai cookie
// session user yang sedang login. TETAP tunduk pada RLS (bukan admin bypass) —
// dipakai di semua route handler normal (Step 3: route/handler API STEP-11).

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component tanpa akses set-cookie (mis. saat
            // render statis) — aman diabaikan karena middleware Next.js yang
            // menangani refresh session di request berikutnya.
          }
        },
      },
    },
  );
}
