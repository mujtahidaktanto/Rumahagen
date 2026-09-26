// lib/agent/mask-email.ts — email tersamar untuk pesan OTP ("d***@gmail.com"): huruf pertama nama, bintang, dan domain utuh.
export function maskEmail(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const [name, domain] = email.split("@") as [string, string];
  return `${name.charAt(0)}${"*".repeat(Math.max(2, Math.min(5, name.length - 1)))}@${domain}`;
}
