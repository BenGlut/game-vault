"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GamepadIcon, LogOutIcon, MenuIcon, NAV_ICONS, PlusIcon, SearchIcon } from "@/components/icons";
import { VaultGate, VaultProvider, useVaultMaybe } from "@/components/vault/VaultProvider";
import { GameDrawerProvider } from "@/components/game/GameDrawer";
import { CoverSourcesProvider } from "@/components/game/coverSources";
import { NewGameProvider, useNewGame } from "@/components/game/NewGameForm";
import { api } from "@/components/vault/api";
import CommandPalette from "./CommandPalette";
import { MOBILE_TABS, NAV_ITEMS, isActive } from "./nav";

/**
 * Cadre de l'application privée : menu latéral groupé, recherche globale (⌘K),
 * barre d'onglets sur téléphone. La base est chargée une fois pour toutes les pages.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <VaultProvider>
      <CoverSourcesProvider>
        <GameDrawerProvider>
          <NewGameProvider>
            <Frame>{children}</Frame>
          </NewGameProvider>
        </GameDrawerProvider>
      </CoverSourcesProvider>
    </VaultProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const vault = useVaultMaybe();
  const { openNewGame } = useNewGame();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const incoming = vault?.stats.incomingOrders.length ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setMoreOpen(false), [pathname]);

  const logout = () => api.logout().finally(() => location.assign("/connexion/"));
  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];

  return (
    <div className="min-h-screen">
      {/* menu latéral (ordinateur) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-bg-elev/80 px-3 py-5 backdrop-blur lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/30">
            <GamepadIcon size={18} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            Game<span className="text-accent">Vault</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted transition hover:border-border-strong hover:text-text"
        >
          <SearchIcon size={15} />
          <span className="flex-1 text-left">Rechercher</span>
          <kbd className="rounded-md border border-border px-1.5 text-[10px]">⌘K</kbd>
        </button>
        <nav className="flex-1 space-y-5 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              <div className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted/70">{group}</div>
              <ul className="space-y-0.5">
                {NAV_ITEMS.filter((n) => n.group === group).map((n) => {
                  const Icon = NAV_ICONS[n.href];
                  const active = isActive(pathname, n.href);
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                          active ? "bg-surface-2 font-medium text-text" : "text-muted hover:bg-surface hover:text-text"
                        }`}
                      >
                        {Icon ? <Icon size={17} className={active ? "text-accent" : "opacity-80"} /> : null}
                        <span className="flex-1">{n.label}</span>
                        {n.href === "/commandes" && incoming ? (
                          <span className="rounded-full bg-info/15 px-1.5 text-[11px] font-semibold text-info">{incoming}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => openNewGame()}
            disabled={!vault}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-bg transition hover:bg-accent-2 disabled:opacity-50"
          >
            <PlusIcon size={16} /> Nouveau jeu
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-text"
          >
            <LogOutIcon size={16} /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* en-tête (téléphone, tablette) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <GamepadIcon size={16} />
          </span>
          <span className="font-semibold">
            Game<span className="text-accent">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Rechercher" onClick={() => setPaletteOpen(true)} className="rounded-xl p-2 text-muted hover:text-text">
            <SearchIcon size={20} />
          </button>
          <button
            type="button"
            aria-label="Nouveau jeu"
            disabled={!vault}
            onClick={() => openNewGame()}
            className="rounded-xl p-2 text-accent disabled:opacity-50"
          >
            <PlusIcon size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-60 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-7xl">
          <VaultGate>{children}</VaultGate>
        </div>
      </main>

      {/* onglets du bas (téléphone) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-elev/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navigation principale">
        <ul className="grid grid-cols-5">
          {MOBILE_TABS.map((href) => {
            const item = NAV_ITEMS.find((n) => n.href === href)!;
            const Icon = NAV_ICONS[href];
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "text-accent" : "text-muted"}`}>
                  {Icon ? <Icon size={20} /> : null}
                  {item.label.replace("Tableau de bord", "Accueil").replace("Ma collection", "Collection")}
                  {href === "/commandes" && incoming ? (
                    <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-info" aria-label={`${incoming} en cours`} />
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setMoreOpen(true)} className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] text-muted">
              <MenuIcon size={20} />
              Plus
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} />
          <div className="animate-sheet absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border-strong bg-bg-elev p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />
            <ul className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.filter((n) => !MOBILE_TABS.includes(n.href)).map((n) => {
                const Icon = NAV_ICONS[n.href];
                return (
                  <li key={n.href}>
                    <Link href={n.href} className="flex flex-col items-center gap-2 rounded-2xl bg-surface px-2 py-4 text-xs">
                      {Icon ? <Icon size={22} className="text-accent" /> : null}
                      {n.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button type="button" onClick={logout} className="flex w-full flex-col items-center gap-2 rounded-2xl bg-surface px-2 py-4 text-xs text-muted">
                  <LogOutIcon size={22} />
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {vault ? <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}
