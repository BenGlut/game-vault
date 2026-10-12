import type { Metadata, Viewport } from "next";
import AppShell from "@/components/shell/AppShell";
import { THEME_SCRIPT } from "@/components/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GameVault", template: "%s · GameVault" },
  description: "Collection privée de jeux vidéo",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // barre du navigateur : couleur du thème système (le <head> n'est jamais modifié avant
  // l'hydratation, sinon React régénère tout le document et perd le thème posé)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b10" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-[14px] text-text antialiased">
        {/* thème appliqué avant que le moindre contenu ne s'affiche : aucun flash clair/sombre.
            Script bloquant en tête de <body> (un <head> manuel dérègle l'hydratation de Next). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-ink"
        >
          Aller au contenu
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
