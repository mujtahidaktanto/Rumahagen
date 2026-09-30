// lib/instructor/self-profile-data.ts — Profil Saya Instruktur (M02, wireframe 04-Instructor/M02-Profil-Instruktur). `getSelfAccountInfo` DIPAKAI ULANG langsung dari
// lib/admin/self-profile-data.ts (murni baca users.* by id, tanpa kolom khas Admin — sama role-agnostik seperti getMyEventForEdit yang dipakai ulang di lib/instructor/event-data.ts).
// Instructor punya permission m02.profile_photo.upload/edit/delete (migration 0009) TAPI tidak ada tabel/route unggah foto untuk peran non-Agent — avatar_url hanya kolom di
// agent_profiles (migration 0029), dan Instructor tidak punya baris agent_profiles (SOURCE-Instructor.md: "Tidak ada agent_profile: profil = foto"). Sama seperti Profil Saya Admin
// (lib/admin/self-profile-data.ts), celah ini TIDAK diimprovisasi dengan menulis ke agent_profiles — dicatat di audit/FRONTEND_GAPS.md.
export { getSelfAccountInfo } from "@/lib/admin/self-profile-data";
export type { SelfAccountInfo } from "@/lib/admin/self-profile-data";
