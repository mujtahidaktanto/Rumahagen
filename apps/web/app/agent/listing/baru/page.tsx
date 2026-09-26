// app/agent/listing/baru/page.tsx — Wizard Buat Listing (M03). ?salin={id} menyalin isian dari listing milik sendiri (tanpa media; judul diberi "(salinan)"). Nomor WhatsApp bawaan dari profil.
import { notFound } from "next/navigation";
import { ListingWizard } from "@/components/agent/ListingWizard";
import { getDefaultWhatsapp, getWizardSource } from "@/lib/agent/listing-edit-data";
import { EMPTY_WIZARD, type WizardValues } from "@/lib/agent/listing-wizard";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Buat Listing | RumahAgen" };

type Props = { searchParams: Promise<{ salin?: string }> };

export default async function NewListingPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const { salin } = await searchParams;
  const whatsapp = await getDefaultWhatsapp(user.id);

  let initial: WizardValues = { ...EMPTY_WIZARD, whatsapp };
  let mode: "baru" | "salin" = "baru";
  if (salin) {
    const res = await getWizardSource(salin, user.id);
    if (res.state === "not_found") notFound();
    if (res.state === "ok") {
      // Salinan: tanpa media, judul ditandai, nomor WhatsApp profil bila listing asal kosong.
      initial = { ...res.source.values, title: `${res.source.values.title} (salinan)`.slice(0, 200), photoUrls: [], videoUrls: [], virtualTourUrl: "", whatsapp: res.source.values.whatsapp || whatsapp };
      mode = "salin";
    }
  }
  return <ListingWizard mode={mode} initial={initial} />;
}
