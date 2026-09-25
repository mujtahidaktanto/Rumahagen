// components/public/PublicHeader.tsx — header Global Public Shell (Server Component): tombol cari + Masuk/Daftar untuk pengunjung, atau lonceng + avatar (menuju /portal)
// untuk pengguna yang login. Isi halaman tidak berubah antara pengunjung dan agent; hanya blok kanan ini (wireframe M11-Homepage).
import Link from "next/link";
import type { Route } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { LinkButton } from "@/components/ui/Button";
import { BellIcon, SearchIcon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/auth/session";
import { PublicNav } from "./PublicNav";

export async function PublicHeader() {
  const user = await getSessionUser();
  const account = (
    <>
      <Link href={"/listing" as Route} aria-label="Cari properti" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
        <SearchIcon size={18} />
      </Link>
      {user && user.status === "active" ? (
        <>
          <Link href={"/notifikasi" as Route} aria-label="Notifikasi" className="hidden h-11 w-11 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50 sm:flex">
            <BellIcon size={19} />
          </Link>
          <Link href={"/portal" as Route} aria-label={`Ke aplikasi sebagai ${user.name}`} className="rounded-full">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size={34} />
          </Link>
        </>
      ) : (
        <>
          <LinkButton href="/login" variant="secondary" size="sm">
            Masuk
          </LinkButton>
          <LinkButton href="/daftar" size="sm">
            Daftar
          </LinkButton>
        </>
      )}
    </>
  );
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white">
      <PublicNav account={account} />
    </header>
  );
}
