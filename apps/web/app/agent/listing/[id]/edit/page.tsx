// app/agent/listing/[id]/edit/page.tsx — Wizard Edit Listing (M03). ?langkah=media membuka langkah Media (tombol Kelola Media). Hanya pemilik; listing dibekukan (suspended) tidak bisa diedit.
import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { ListingWizard } from "@/components/agent/ListingWizard";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { getWizardSource } from "@/lib/agent/listing-edit-data";
import { getMyContextOrgs } from "@/lib/agent/shell-data";
import { WIZARD_STEPS, type StepKey } from "@/lib/agent/listing-wizard";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Listing | RumahAgen" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ langkah?: string }> };

export default async function EditListingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { langkah } = await searchParams;
  const user = await requireArea("agent");
  const res = await getWizardSource(id, user.id);
  if (res.state === "not_found") notFound();
  if (res.state === "error") {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-8">
        <ErrorState title="Listing gagal dimuat" message="Terjadi gangguan saat memuat halaman. Muat ulang beberapa saat lagi." />
        <div className="flex justify-center">
          <LinkButton href={`/agent/listing/${id}/edit` as Route} size="sm">
            Coba Lagi
          </LinkButton>
        </div>
      </div>
    );
  }
  const s = res.source;
  if (s.status === "suspended") redirect(`/agent/listing/${id}` as Route);
  const orgs = await getMyContextOrgs(user.id);
  const start = (WIZARD_STEPS.map((x) => x.key) as string[]).includes(langkah ?? "") ? (langkah as StepKey) : undefined;
  return (
    <ListingWizard
      mode="edit"
      initial={s.values}
      orgs={orgs}
      listingId={s.listingId}
      status={s.status}
      locked={s.locked}
      existingAmenityIds={s.amenityIds}
      existingPhotos={s.photos}
      existingVideos={s.videos}
      startStep={start}
    />
  );
}
