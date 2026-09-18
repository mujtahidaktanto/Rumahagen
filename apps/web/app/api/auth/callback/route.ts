// app/api/auth/callback/route.ts
// Target redirect PKCE untuk /api/auth/oauth/google (BUKAN salah satu dari
// 10 endpoint STEP11-B1 yang terkunci -- ini infrastruktur pendukung OAuth,
// dipanggil browser via GET setelah Google redirect balik dengan ?code=).
// Tidak dibungkus withApiHandler karena ini bukan endpoint JSON: hasil akhir
// yang diharapkan browser adalah redirect, bukan body {data,...}.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect_to") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
