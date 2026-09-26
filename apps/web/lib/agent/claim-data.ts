// lib/agent/claim-data.ts — data layar Klaim Proyek Agent (M06), dibaca di server dengan RLS pemanggil dan dibatasi agent_id = pengguna: klaim milik sendiri + ringkasan proyek + listing yang sudah dibuat dari
// proyek itu (listings.developer_project_id) + nomor WhatsApp bawaan dari profil. Bagian listing dan WhatsApp yang gagal dimuat tidak menjatuhkan daftar klaim. Mutasi (tarik klaim, buat listing) lewat /api/*.
import { createClient } from "@/lib/supabase/server";
import { projectKindLabel } from "./claim-rules";

export type Part<T> = { ok: true; data: T } | { ok: false };

export type ClaimItem = {
  id: string;
  projectId: string;
  projectName: string;
  /** null = proyek tidak terbaca (mis. sudah tidak tayang); klaim tetap ditampilkan. */
  projectSlug: string | null;
  location: string | null;
  kind: string;
  status: string;
  claimedAt: string;
  reviewedAt: string | null;
  /** Listing yang sudah dibuat dari proyek ini (draf awal atau lanjutannya). */
  listing: { id: string; status: string } | null;
};
export type ClaimsData = { claims: Part<ClaimItem[]>; defaultWhatsapp: string };

type Row = {
  id: string;
  project_id: string;
  status: string;
  claimed_at: string;
  reviewed_at: string | null;
  developer_projects: { name: string; slug: string; location: string | null; category: string | null; property_type: string | null } | { name: string; slug: string; location: string | null; category: string | null; property_type: string | null }[] | null;
};

export async function getMyClaims(userId: string): Promise<ClaimsData> {
  const supabase = await createClient();
  const [claimsRes, profile] = await Promise.all([
    supabase
      .from("agent_project_claims")
      .select("id, project_id, status, claimed_at, reviewed_at, developer_projects(name, slug, location, category, property_type)")
      .eq("agent_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(100)
      .returns<Row[]>(),
    supabase.from("agent_profiles").select("whatsapp_number").eq("user_id", userId).maybeSingle<{ whatsapp_number: string | null }>(),
  ]);
  const defaultWhatsapp = profile.data?.whatsapp_number ?? "";
  if (claimsRes.error) return { claims: { ok: false }, defaultWhatsapp };

  const rows = claimsRes.data ?? [];
  const listings = new Map<string, { id: string; status: string }>();
  if (rows.length > 0) {
    const { data } = await supabase
      .from("listings")
      .select("id, status, developer_project_id, created_at")
      .eq("agent_id", userId)
      .in("developer_project_id", rows.map((r) => r.project_id))
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .returns<{ id: string; status: string; developer_project_id: string }[]>();
    // Listing tertua per proyek dianggap hasil "Buat Listing dari Proyek". Gagal memuat = tombol buat tetap tersedia (API tetap memeriksa klaim).
    for (const l of data ?? []) if (!listings.has(l.developer_project_id)) listings.set(l.developer_project_id, { id: l.id, status: l.status });
  }

  return {
    defaultWhatsapp,
    claims: {
      ok: true,
      data: rows.map((r) => {
        const p = Array.isArray(r.developer_projects) ? r.developer_projects[0] : r.developer_projects;
        return {
          id: r.id,
          projectId: r.project_id,
          projectName: p?.name ?? "Proyek tidak tersedia",
          projectSlug: p?.slug ?? null,
          location: p?.location ?? null,
          kind: projectKindLabel(p?.category ?? null, p?.property_type ?? null),
          status: r.status,
          claimedAt: r.claimed_at,
          reviewedAt: r.reviewed_at,
          listing: listings.get(r.project_id) ?? null,
        };
      }),
    },
  };
}
