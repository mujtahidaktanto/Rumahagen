// app/admin/provider-ai/page.tsx — Provider AI (M13): tab lewat query string (?tab=catalogue|conn|platform).
// Tab "platform" (Koneksi AI RumahAgen, migration 0174) SUPERADMIN-ONLY -- dijaga di sini (data hanya
// dimuat untuk superadmin) dan di komponen (tab tidak ditautkan untuk admin/manager).
import { AiProviderCatalogueView } from "@/components/admin/AiProviderCatalogueView";
import { getAiProviderCatalog, getAllAiConnections } from "@/lib/admin/ai-provider-admin-data";
import { getPlatformAiFeatureSettings, getPlatformAiProviders } from "@/lib/admin/platform-ai-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Provider AI | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminAiProviderPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const isSuperadmin = user.role === "superadmin";
  const sp = await searchParams;
  const tabParam = one(sp.tab);
  const tab: "catalogue" | "conn" | "platform" = tabParam === "conn" ? "conn" : tabParam === "platform" && isSuperadmin ? "platform" : "catalogue";

  const providers = await getAiProviderCatalog();
  const connections = tab === "conn" && isSuperadmin ? await getAllAiConnections() : null;
  const platformProviders = tab === "platform" && isSuperadmin ? await getPlatformAiProviders() : null;
  const platformFeatureSettings = tab === "platform" && isSuperadmin ? await getPlatformAiFeatureSettings() : null;

  return (
    <AiProviderCatalogueView
      isSuperadmin={isSuperadmin}
      tab={tab}
      providers={providers}
      connections={connections}
      platformProviders={platformProviders}
      platformFeatureSettings={platformFeatureSettings}
    />
  );
}
