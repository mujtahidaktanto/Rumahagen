// app/admin/konfigurasi-belajar/page.tsx — Konfigurasi Belajar (M04). Superadmin/Admin/Manager (m04.learning_economy_configuration.manage) bisa mengubah; role lain hanya melihat.
import { LearningSettingsView } from "@/components/admin/LearningSettingsView";
import { getLearningSettings, getLearningSettingsHistory } from "@/lib/admin/learning-settings-data";
import { ErrorState } from "@/components/ui/States";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konfigurasi Belajar | RumahAgen" };

export default async function AdminLearningSettingsPage() {
  const user = await requireArea("admin");
  const readOnly = !(user.role === "superadmin" || user.role === "admin" || user.role === "manager");

  const [settings, history] = await Promise.all([getLearningSettings(), getLearningSettingsHistory()]);

  if (!settings.ok) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
        <h1 className="mb-4 text-headline">Konfigurasi Belajar</h1>
        <ErrorState title="Pengaturan belajar gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }

  return <LearningSettingsView settings={settings.data} history={history} readOnly={readOnly} />;
}
