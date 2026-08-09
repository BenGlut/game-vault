import type { Metadata } from "next";
import Link from "next/link";
import { GamepadIcon, NAV_ICONS } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameVault — Collection de jeux vidéo",
  description: "Gestionnaire personnel de collection de jeux vidéo (lecture seule)",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/collection", label: "Collection" },
  { href: "/recherche", label: "Recherche" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/estimateur", label: "Estimateur" },
  { href: "/commandes", label: "Commandes" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/recommandations", label: "Recommandations" },
  { href: "/doublons", label: "Doublons" },
  { href: "/plateformes", label: "Plateformes" },
  { href: "/valeur", label: "Valeur" },
  { href: "/historique", label: "Historique" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-text">
        <div className="mx-auto flex min-h-screen max-w-7xl">
          <aside className="hidden w-56 shrink-0 border-r border-border px-4 py-6 md:block">
            <Link href="/" className="mb-8 block">
              <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <GamepadIcon size={22} className="text-accent" />
                Game<span className="text-accent">Vault</span>
              </span>
              <span className="mt-1 block text-xs text-muted">Lecture seule</span>
            </Link>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const Icon = NAV_ICONS[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-text"
                  >
                    {Icon ? <Icon size={17} className="shrink-0 opacity-80" /> : null}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
              <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
                <GamepadIcon size={18} className="text-accent" />
                Game<span className="text-accent">Vault</span>
              </Link>
              <nav className="flex gap-3 overflow-x-auto text-xs">
                {NAV.slice(1, 6).map((i) => {
                  const Icon = NAV_ICONS[i.href];
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      className="flex flex-col items-center gap-0.5 text-muted transition hover:text-text"
                    >
                      {Icon ? <Icon size={18} /> : null}
                      {i.label}
                    </Link>
                  );
                })}
              </nav>
            </header>
            <main className="px-4 py-6 md:px-8">{children}</main>
            <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted md:px-8">
              GameVault — interface publique en lecture seule. Les données sont modifiées uniquement
              via la CLI agent.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
