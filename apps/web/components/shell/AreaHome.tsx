// components/shell/AreaHome.tsx — halaman awal sementara tiap area sampai dashboard aslinya dibangun (Fase 3 dan seterusnya). Menampilkan pengguna yang login sebagai
// bukti penjaga sesi bekerja.
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";

export async function AreaHome({ title, note }: { title: string; note: string }) {
  const user = await getSessionUser();
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 lg:p-10">
      <h1 className="text-headline">{title}</h1>
      {user ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="text-title-md">Halo, {user.name}</p>
            <p className="truncate text-caption">{user.email}</p>
          </div>
          <Badge tone="info">{ROLE_LABEL[user.role]}</Badge>
        </Card>
      ) : null}
      <Card>
        <EmptyState title="Halaman ini belum dibangun" message={note} />
      </Card>
    </div>
  );
}
