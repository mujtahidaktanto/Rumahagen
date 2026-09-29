// app/admin/pengalihan-url/page.tsx — Pengalihan URL (M11). Tulis hanya m11.static_public_content.publish (superadmin+admin) — gerbang sama seperti
// tab Konten Publik di Konten & Notifikasi.
import { UrlRedirectView } from "@/components/admin/UrlRedirectView";
import { getUrlRedirects } from "@/lib/admin/url-redirect-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pengalihan URL | RumahAgen" };

export default async function AdminUrlRedirectPage() {
  const user = await requireArea("admin");
  const canManage = user.role === "superadmin" || user.role === "admin";
  const redirects = await getUrlRedirects();
  return <UrlRedirectView redirects={redirects} canManage={canManage} />;
}
