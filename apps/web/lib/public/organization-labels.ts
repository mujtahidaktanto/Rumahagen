// lib/public/organization-labels.ts — jenis organisasi dan labelnya, murni (tanpa impor server) agar aman dipakai komponen klien. Diekspor ulang dari organization-data.ts.
export const ORG_TYPES = ["agency", "kantor", "tim", "komunitas"] as const;
export type OrgType = (typeof ORG_TYPES)[number];
export const ORG_TYPE_LABEL: Record<string, string> = { agency: "Agency", kantor: "Kantor", tim: "Tim", komunitas: "Komunitas" };
