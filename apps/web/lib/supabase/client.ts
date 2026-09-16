// lib/supabase/client.ts
// Supabase client untuk komponen browser ("use client"). Memakai anon key +
// RLS dari supabase/migrations/0007_authorization_rls_policies.sql sebagai
// satu-satunya lapisan otorisasi — client ini TIDAK boleh bypass RLS.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
