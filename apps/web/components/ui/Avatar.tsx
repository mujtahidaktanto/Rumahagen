// components/ui/Avatar.tsx — lingkaran foto profil; tanpa foto tampil inisial (dua huruf pertama nama, huruf besar) di latar emas seperti wireframe.
import { cn } from "@/lib/cn";
import { initialsOf } from "@/lib/initials";

type AvatarProps = { name: string; imageUrl?: string | null; size?: number; className?: string };

export function Avatar({ name, imageUrl, size = 36, className }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) };
  if (imageUrl) {
    // Foto pengguna berasal dari storage (URL bertanda tangan/publik); gambar biasa, tanpa optimasi Next, alt kosong karena nama sudah tampil di sebelahnya.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt="" style={style} className={cn("flex-none rounded-full object-cover", className)} />;
  }
  return (
    <span aria-hidden="true" style={style} className={cn("flex flex-none items-center justify-center rounded-full bg-gold-500 font-extrabold text-ink-900", className)}>
      {initialsOf(name)}
    </span>
  );
}
