// app/(publik)/learning-session/page.tsx — Daftar Learning Session (M11): sesi publik yang terjadwal, berlangsung, dan selesai. RLS hanya menjawab pengguna yang LOGIN, sehingga pengunjung
// melihat panel "terbatas" dengan ajakan masuk. Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses. Selalu noindex (isi bergantung login).
import type { Metadata, Route } from "next";
import { RestrictedPanel } from "@/components/public/RestrictedPanel";
import { SessionCard } from "@/components/public/LearningCards";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getSessionUser } from "@/lib/auth/session";
import { listPublicSessions } from "@/lib/public/learning-data";

export const metadata: Metadata = {
  title: "Learning Session | RumahAgen",
  description: "Sesi belajar live, interaktif, dan on-demand dari RumahAgen.",
  robots: { index: false, follow: true },
};

export default async function SessionListPage() {
  const user = await getSessionUser();
  const res = user && user.status === "active" ? await listPublicSessions() : null;

  return (
    <div>
      <div className="bg-linear-to-b from-blue-50 to-white py-10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-3 px-4 sm:px-6 xl:px-10">
          <h1 className="text-display">Learning Session</h1>
          <p className="max-w-140 text-body-lg text-ink-500">Sesi belajar live, interaktif, dan on-demand untuk meningkatkan kompetensi Anda.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-6 sm:px-6 xl:px-10">
        {!res ? (
          <RestrictedPanel title="Masuk untuk Melihat Sesi" message="Daftar Learning Session hanya dapat dilihat oleh pengguna yang sudah masuk. Masuk atau daftar untuk melanjutkan." nextPath="/learning-session" />
        ) : !res.ok ? (
          <div>
            <ErrorState title="Gagal memuat sesi" message="Terjadi gangguan saat mengambil data. Coba lagi beberapa saat lagi." />
            <div className="flex justify-center">
              <LinkButton href={"/learning-session" as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </div>
        ) : res.items.length === 0 ? (
          <EmptyState title="Belum ada sesi" message="Sesi publik yang dijadwalkan akan tampil di sini." />
        ) : (
          <ul className="grid grid-cols-1 gap-5 pt-2 min-[560px]:grid-cols-2 lg:grid-cols-3">
            {res.items.map((s) => (
              <li key={s.id}>
                <SessionCard session={s} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
