// components/shell/nav-active.ts — penentuan menu navigasi aktif (murni, mudah diuji).
/** Menu yang aktif = yang href-nya cocok dan PALING PANJANG (mis. di /agent/listing hanya "Listing Saya" menyala, bukan juga "Dashboard" /agent). */
export function activeHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter((h) => pathname === h || (h !== "/" && pathname.startsWith(`${h}/`)));
  return matches.length ? matches.reduce((a, b) => (b.length > a.length ? b : a)) : null;
}
