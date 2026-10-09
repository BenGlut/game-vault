import type { Metadata, Viewport } from "next";
import AppShell from "@/components/shell/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameVault",
  description: "Collection privée de jeux vidéo",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
