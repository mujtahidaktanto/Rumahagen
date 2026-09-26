// lib/agent/profile-data.ts — data layar Profil Saya (M02), dibaca di server dengan RLS pemanggil: baris agent_profiles milik sendiri, nama wilayah/organisasi, title yang ditampilkan,
// dan status KTP (nomor disamarkan; foto/nomor asli tidak pernah dikirim ke halaman). Belum punya profil -> `exists: false` dengan nilai awal dari akun (nama), bukan galat.
import { maskNik } from "@/lib/storage/agent-ktp";
import { createClient } from "@/lib/supabase/server";
import type { ProfileFormValues } from "@/lib/validation/profile-form";

export type KtpState = "deferred" | "submitted" | "verified";
export type ProfileTitle = { name: string; kind: "primary" | "additional" };

export type MyProfile = {
  exists: boolean;
  values: ProfileFormValues;
  avatarUrl: string | null;
  publicSlug: string | null;
  /** Terakhir kali alamat profil diganti (batas 1x per bulan kalender WIB, migration 0157); null = belum pernah. */
  slugChangedAt: string | null;
  soldCount: number;
  rentedCount: number;
  provinceName: string | null;
  cityName: string | null;
  organization: { name: string; slug: string | null } | null;
  titles: ProfileTitle[];
  ktp: { state: KtpState; maskedNik: string | null; submittedAt: string | null };
};
export type MyProfileResult = { state: "ok"; profile: MyProfile } | { state: "error" };

type ProfileRow = {
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialization: string[] | null;
  coverage_area: string | null;
  office_name: string | null;
  license_number: string | null;
  whatsapp_number: string | null;
  profile_visibility: string;
  public_cta_enabled: boolean;
  ktp_requirement_state: KtpState;
  public_slug: string | null;
  slug_changed_at: string | null;
  total_listings_sold: number;
  total_listings_rented: number;
  province_id: string | null;
  city_id: string | null;
  organization_id: string | null;
  province: { name: string } | null;
  city: { name: string } | null;
};

const SELECT =
  "full_name, avatar_url, bio, specialization, coverage_area, office_name, license_number, whatsapp_number, profile_visibility, public_cta_enabled, ktp_requirement_state, public_slug, slug_changed_at, total_listings_sold, total_listings_rented, province_id, city_id, organization_id, province:ref_provinces(name), city:ref_cities(name)";

export async function getMyProfile(userId: string, fallbackName: string): Promise<MyProfileResult> {
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("agent_profiles").select(SELECT).eq("user_id", userId).is("deleted_at", null).maybeSingle<ProfileRow>();
  if (error) return { state: "error" };

  const blank: ProfileFormValues = {
    fullName: fallbackName,
    whatsapp: "",
    bio: "",
    specialization: [],
    coverageArea: "",
    licenseNumber: "",
    officeName: "",
    provinceId: "",
    cityId: "",
    profileVisibility: "public",
    publicCtaEnabled: false,
    publicSlug: "",
  };
  if (!row) {
    return { state: "ok", profile: { exists: false, values: blank, avatarUrl: null, publicSlug: null, slugChangedAt: null, soldCount: 0, rentedCount: 0, provinceName: null, cityName: null, organization: null, titles: [], ktp: { state: "deferred", maskedNik: null, submittedAt: null } } };
  }

  // Bagian pelengkap: gagal memuat tidak menjatuhkan halaman (kosong).
  const [org, titles, kyc] = await Promise.all([
    row.organization_id
      ? supabase.from("organizations").select("organization_name, slug").eq("id", row.organization_id).maybeSingle<{ organization_name: string; slug: string | null }>()
      : Promise.resolve({ data: null }),
    supabase
      .from("title_presentations")
      .select("presentation_type, display_order, title:title_definitions(name)")
      .eq("user_id", userId)
      .eq("active", true)
      .order("presentation_type", { ascending: true })
      .order("display_order", { ascending: true })
      .returns<{ presentation_type: "primary" | "additional"; display_order: number | null; title: { name: string } | null }[]>(),
    supabase.from("agent_kyc").select("ktp_number, submitted_at").eq("user_id", userId).maybeSingle<{ ktp_number: string; submitted_at: string | null }>(),
  ]);

  return {
    state: "ok",
    profile: {
      exists: true,
      values: {
        fullName: row.full_name,
        whatsapp: row.whatsapp_number ?? "",
        bio: row.bio ?? "",
        specialization: row.specialization ?? [],
        coverageArea: row.coverage_area ?? "",
        licenseNumber: row.license_number ?? "",
        officeName: row.office_name ?? "",
        provinceId: row.province_id ?? "",
        cityId: row.city_id ?? "",
        profileVisibility: row.profile_visibility === "private" ? "private" : "public",
        publicCtaEnabled: row.public_cta_enabled,
        publicSlug: row.public_slug ?? "",
      },
      avatarUrl: row.avatar_url,
      publicSlug: row.public_slug,
      slugChangedAt: row.slug_changed_at,
      soldCount: row.total_listings_sold,
      rentedCount: row.total_listings_rented,
      provinceName: row.province?.name ?? null,
      cityName: row.city?.name ?? null,
      organization: org.data ? { name: org.data.organization_name, slug: org.data.slug } : null,
      titles: (titles.data ?? []).filter((t) => t.title).map((t) => ({ name: t.title!.name, kind: t.presentation_type })),
      ktp: { state: row.ktp_requirement_state, maskedNik: kyc.data ? maskNik(kyc.data.ktp_number) : null, submittedAt: kyc.data?.submitted_at ?? null },
    },
  };
}
