import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RumahAgen",
  description: "RumahAgen SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
