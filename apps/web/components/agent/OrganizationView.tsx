// components/agent/OrganizationView.tsx — isi "Organisasi" Agent (M12, wireframe 01-Agent/M12-Organisasi-Dashboard). Belum tergabung: kartu "Undangan untuk Anda" + ajakan Buat/Cari organisasi. Sudah tergabung:
// spanduk status (closing/closed/suspended), kepala organisasi (banner, logo, nama, jenis, peran), angka (anggota, undangan pending untuk leader, listing tayang), kuota penerbitan organisasi, anggota tim,
// Branding, dan aksi menurut peran (leader: Kelola Anggota, Edit Branding, Tutup Organisasi; anggota: Keluar). Tiap bagian punya keadaan gagal sendiri; memuat = loading.tsx.
import Link from "next/link";
import type { Route } from "next";
import { ListingQuotaCard } from "@/components/agent/ListingQuotaCard";
import { OrgBrandingDialog } from "@/components/agent/OrgBrandingDialog";
import { OrgCloseFlow } from "@/components/agent/OrgCloseFlow";
import { OrgInvitationsCard } from "@/components/agent/OrgInvitationsCard";
import { OrgLeaveButton } from "@/components/agent/OrgLeaveButton";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { BuildingIcon } from "@/components/ui/icons";
import type { OrgPageData } from "@/lib/agent/org-data";
import { ORG_TYPE_LABEL, ROLE_LABEL, ROLE_TONE, canLeaveOrg, canManageOrg, closeStep, orgBanner } from "@/lib/agent/org-rules";
import { cn } from "@/lib/cn";
import { initialsOf } from "@/lib/initials";

const nf = new Intl.NumberFormat("id-ID");
const BANNER_CLS = { warning: "border-warning-600/40 bg-warning-100", neutral: "border-ink-100 bg-ink-50", danger: "border-danger-600/40 bg-danger-100" } as const;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-ink-100 bg-white p-4">
      <span className="text-caption">{label}</span>
      <span className="text-headline">{value}</span>
    </div>
  );
}

export function OrganizationView({ data, maskedEmail }: { data: OrgPageData; maskedEmail: string | null }) {
  if (data.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-8">
        <ErrorState title="Organisasi gagal dimuat" message="Terjadi gangguan saat mengambil data organisasi Anda. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={"/agent/organisasi" as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }

  if (data.state === "no_org") {
    const inv = data.invitations;
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
        <h1 className="text-headline">Organisasi</h1>
        {inv.ok && inv.data.length > 0 ? <OrgInvitationsCard invitations={inv.data} /> : null}
        {!inv.ok ? (
          <p role="alert" className="rounded-md border border-warning-600/30 bg-warning-100 p-3.5 text-body-md text-ink-900">
            Undangan gagal dimuat. Muat ulang halaman ini bila Anda menunggu undangan dari leader.
          </p>
        ) : null}
        <div className="flex flex-col items-center gap-3.5 px-4 py-14 text-center">
          <span aria-hidden="true" className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <BuildingIcon size={32} />
          </span>
          <h2 className="text-title-lg">Anda Belum Tergabung ke Organisasi</h2>
          <p className="max-w-[440px] text-body-md text-ink-500">Organisasi membuat listing Anda tampil di bawah nama kantor dan memudahkan kolaborasi tim. Anda tetap bisa bekerja mandiri tanpa organisasi, ini opsional.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href={"/agent/organisasi/baru" as Route}>Buat Organisasi Baru</LinkButton>
            <LinkButton href={"/organisasi" as Route} variant="secondary">
              Cari Organisasi untuk Bergabung
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const { org, role } = data;
  const isLeader = role === "leader";
  const banner = orgBanner(org.status, isLeader);
  const step = closeStep(org.status, isLeader);
  const manage = canManageOrg(role, org.status);
  const roster = data.roster.ok ? data.roster.data : [];

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <h1 className="text-headline">Organisasi</h1>

      {banner ? (
        <div className={cn("flex flex-wrap items-center gap-4 rounded-md border p-4", BANNER_CLS[banner.tone])}>
          <div className="min-w-0 flex-1 basis-72">
            <p className={cn("text-label-lg", banner.tone === "danger" && "text-danger-600")}>{banner.title}</p>
            <p className="text-body-md text-ink-700">{banner.text}</p>
          </div>
          {step === "confirm" ? <OrgCloseFlow orgId={org.id} status="closing" maskedEmail={maskedEmail} variant="spanduk" /> : null}
        </div>
      ) : null}

      <div>
        {org.bannerUrl ? (
          // Banner dari storage (URL publik); gambar biasa tanpa optimasi Next.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={org.bannerUrl} alt="" className="aspect-[4/1] w-full rounded-lg bg-ink-100 object-cover" />
        ) : (
          <div aria-hidden="true" className="aspect-[4/1] rounded-lg bg-gradient-to-br from-blue-600 to-blue-900" />
        )}
        <div className="flex flex-wrap items-start gap-4 px-2">
          {org.logoUrl ? (
            // Logo dari storage (URL publik).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoUrl} alt="" className="-mt-10 h-20 w-20 flex-none rounded-lg border-4 border-white bg-white object-cover shadow-2" />
          ) : (
            <span aria-hidden="true" className="-mt-10 flex h-20 w-20 flex-none items-center justify-center rounded-lg border-4 border-white bg-white text-[24px] font-extrabold text-blue-600 shadow-2">
              {initialsOf(org.name)}
            </span>
          )}
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1 pt-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-title-lg break-words">{org.name}</h2>
              <Badge tone="info" dot={false}>
                {ORG_TYPE_LABEL[org.type] ?? org.type}
              </Badge>
              <Badge tone={ROLE_TONE[role] ?? "neutral"} dot={false}>
                {ROLE_LABEL[role] ?? role}
              </Badge>
            </div>
            {org.address ? <span className="text-body-md break-words text-ink-500">{org.address}</span> : null}
          </div>
          <div className="flex flex-none flex-wrap gap-2 pt-3">
            {org.status === "active" && org.slug ? (
              <LinkButton href={`/organisasi/${org.slug}` as Route} variant="secondary" size="sm">
                Halaman Publik
              </LinkButton>
            ) : null}
            {manage ? (
              <LinkButton href={"/agent/organisasi/anggota" as Route} variant="secondary" size="sm">
                Kelola Anggota
              </LinkButton>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Anggota Aktif" value={data.roster.ok ? nf.format(roster.length) : "—"} />
        {data.pendingCount ? <Stat label="Undangan Pending" value={data.pendingCount.ok ? nf.format(data.pendingCount.data) : "—"} /> : null}
        <Stat label="Listing Organisasi" value={data.listingCount.ok ? nf.format(data.listingCount.data) : "—"} />
      </div>

      <ListingQuotaCard quota={data.quota} />

      <section aria-labelledby="org-members-title" className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="org-members-title" className="text-title-md">
            Anggota Tim
          </h2>
          {manage ? (
            <Link href={"/agent/organisasi/anggota" as Route} className="text-label-lg">
              Lihat semua
            </Link>
          ) : null}
        </div>
        {!data.roster.ok ? (
          <ErrorState title="Anggota gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : (
          <ul>
            {roster.slice(0, 6).map((m) => (
              <li key={m.memberId} className="flex items-center gap-3 border-b border-ink-50 py-2.5 last:border-b-0">
                <span aria-hidden="true" className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-blue-100 text-[13px] font-bold text-blue-600">
                  {initialsOf(m.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-label-lg">
                  {m.name}
                  {m.isSelf ? <span className="ml-1.5 text-caption font-normal">(Anda)</span> : null}
                </span>
                <Badge tone={ROLE_TONE[m.role] ?? "neutral"} dot={false}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="org-brand-title" className="rounded-md border border-ink-100 bg-white p-4 sm:p-5">
        <h2 id="org-brand-title" className="mb-1.5 text-title-md">
          Branding &amp; Informasi Publik
        </h2>
        <p className="mb-3.5 text-body-md text-ink-500">
          Logo, banner, deskripsi, website, dan sosial media bisa diperbarui kapan saja. Nama, jenis, alamat, dan nomor telepon organisasi <strong>terkunci permanen</strong> sejak dibuat.
        </p>
        {manage ? <OrgBrandingDialog org={org} /> : <p className="text-caption">Hanya leader yang bisa mengubah branding{org.status !== "active" ? " pada organisasi yang aktif" : ""}.</p>}
      </section>

      {step === "close" ? <OrgCloseFlow orgId={org.id} status="active" maskedEmail={maskedEmail} variant="zona" /> : null}

      {canLeaveOrg(role, org.status) ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger-100 bg-white p-4 sm:p-5">
          <span className="text-body-md text-ink-700">Anda member organisasi ini, bukan pemilik/leader.</span>
          <OrgLeaveButton membershipId={data.membershipId} orgName={org.name} />
        </div>
      ) : null}
    </div>
  );
}
