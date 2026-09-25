// components/public/OrganizationCard.tsx — kartu organisasi pada daftar /organisasi: logo (atau inisial), nama, jenis, alamat, ringkasan. Seluruh kartu adalah tautan ke /organisasi/{slug}.
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { PinIcon } from "@/components/ui/icons";
import { initialsOf } from "@/lib/initials";
import { ORG_TYPE_LABEL, type PublicOrganization } from "@/lib/public/organization-data";
import { safeHref } from "@/lib/public/promo-data";
import { excerptOf } from "@/lib/public/rich-text";

export function OrgLogo({ org, size = 56 }: { org: Pick<PublicOrganization, "organization_name" | "logo_url">; size?: number }) {
  const logo = safeHref(org.logo_url);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.34) };
  if (logo) {
    // Logo dari data (jalur situs atau https); gambar biasa tanpa optimasi Next, alt kosong karena nama tampil di dekatnya.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" style={style} className="flex-none rounded-md border border-ink-100 bg-white object-contain" />;
  }
  return (
    <span aria-hidden="true" style={style} className="flex flex-none items-center justify-center rounded-md bg-blue-100 font-bold text-blue-600">
      {initialsOf(org.organization_name)}
    </span>
  );
}

export function OrganizationCard({ org }: { org: PublicOrganization }) {
  return (
    <Link
      href={`/organisasi/${org.slug}` as Route}
      className="flex h-full min-w-0 flex-col gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline transition-shadow hover:shadow-2 hover:no-underline"
    >
      <div className="flex items-center gap-3">
        <OrgLogo org={org} />
        <div className="min-w-0">
          <div className="truncate text-title-md text-ink-900">{org.organization_name}</div>
          <Badge tone="info" dot={false} className="mt-1">
            {ORG_TYPE_LABEL[org.organization_type] ?? org.organization_type}
          </Badge>
        </div>
      </div>
      {org.address ? (
        <span className="flex items-start gap-1.5 text-ink-500">
          <PinIcon size={13} className="mt-0.5 flex-none" />
          <span className="line-clamp-2 text-caption">{org.address}</span>
        </span>
      ) : null}
      <span className="line-clamp-2 min-h-10 text-body-md text-ink-500">{excerptOf(org.description, 120)}</span>
    </Link>
  );
}
