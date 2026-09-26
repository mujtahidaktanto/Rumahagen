// app/agent/listing/page.tsx — Listing Saya (M03). Filter dan "Muat Lebih Banyak" lewat URL (?status=&tampil=); data dimuat di server (lib/agent/listing-data.ts).
import { MyListingsView } from "@/components/agent/MyListingsView";
import { getMyListingsData } from "@/lib/agent/listing-data";
import { getActiveContext } from "@/lib/agent/shell-data";
import { parseMyListingsSearch } from "@/lib/agent/listing-params";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Listing Saya | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MyListingsPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const search = parseMyListingsSearch(await searchParams);
  const context = await getActiveContext(user.id);
  const data = await getMyListingsData(user.id, search, context);
  return <MyListingsView data={data} search={search} context={context} />;
}
