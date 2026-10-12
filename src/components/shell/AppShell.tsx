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
import { Button, IconButton, Kbd, cx, useFocusTrap } from "@/components/ui/primitives";
import CommandPalette from "./CommandPalette";
import ThemeSwitcher from "./ThemeSwitcher";
import { MOBILE_TABS, NAV_ITEMS, isActive, shortLabel } from "./nav";

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

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="GameVault, tableau de bord">
      <span className={cx("flex items-center justify-center rounded-lg bg-brand text-brand-ink shadow-[var(--shadow-sm)]", compact ? "h-7 w-7" : "h-8 w-8")}>
        <GamepadIcon size={compact ? 16 : 18} />
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">GameVault</span>
    </Link>
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
      const typing = e.target instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable);
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
  const moreActive = NAV_ITEMS.some((n) => !MOBILE_TABS.includes(n.href) && isActive(pathname, n.href));

  return (
    <div className="min-h-dvh">
      {/* menu latéral (ordinateur) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-bg-elev lg:flex" aria-label="Menu principal">
        <div className="flex h-14 items-center px-4">
          <Logo />
        </div>
        <div className="space-y-2 px-3 pb-4 pt-1">
          <Button variant="primary" className="w-full" icon={<PlusIcon size={16} />} disabled={!vault} onClick={() => openNewGame()}>
            Nouveau jeu
          </Button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-[13px] text-muted shadow-[var(--shadow-sm)] transition hover:border-border-strong hover:text-text"
          >
            <SearchIcon size={15} />
            <span className="flex-1 text-left">Rechercher</span>
            <Kbd>⌘K</Kbd>
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Pages">
          {groups.map((group) => (
            <div key={group}>
              <div className="mb-1 px-2.5 text-[11px] font-medium text-muted">{group}</div>
              <ul className="space-y-px">
                {NAV_ITEMS.filter((n) => n.group === group).map((n) => {
                  const Icon = NAV_ICONS[n.href];
                  const active = isActive(pathname, n.href);
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition",
                          active ? "bg-surface-2 font-medium text-text" : "text-text-2 hover:bg-surface-2/70 hover:text-text",
                        )}
                      >
                        {active ? <span className="absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r bg-brand" aria-hidden /> : null}
                        {Icon ? <Icon size={16} className={active ? "text-accent" : "text-muted transition group-hover:text-text-2"} /> : null}
                        <span className="flex-1">{n.label}</span>
                        {n.href === "/commandes" && incoming ? (
                          <span className="rounded-full bg-info/12 px-1.5 text-[11px] font-semibold tabular-nums text-info" aria-label={`${incoming} en cours`}>
                            {incoming}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-3">
          <ThemeSwitcher />
          <IconButton label="Se déconnecter" onClick={logout} size="sm">
            <LogOutIcon size={15} />
          </IconButton>
        </div>
      </aside>

      {/* en-tête (téléphone, tablette) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur-md lg:hidden">
        <Logo compact />
        <div className="flex items-center gap-1">
          <IconButton label="Rechercher" onClick={() => setPaletteOpen(true)}>
            <SearchIcon size={19} />
          </IconButton>
          <button
            type="button"
            aria-label="Nouveau jeu"
            disabled={!vault}
            onClick={() => openNewGame()}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-ink shadow-[var(--shadow-sm)] transition hover:bg-brand-strong disabled:opacity-45"
          >
            <PlusIcon size={18} />
          </button>
        </div>
      </header>

      <main id="contenu" tabIndex={-1} className="px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 outline-none sm:px-6 lg:ml-60 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1280px]">
          <VaultGate>{children}</VaultGate>
        </div>
      </main>

      {/* onglets du bas (téléphone) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-elev/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navigation principale"
      >
        <ul className="grid grid-cols-5">
          {MOBILE_TABS.map((href) => {
            const item = NAV_ITEMS.find((n) => n.href === href)!;
            const Icon = NAV_ICONS[href];
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx("relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition", active ? "text-text" : "text-muted")}
                >
                  {active ? <span className="absolute top-0 h-0.5 w-8 rounded-b bg-brand" aria-hidden /> : null}
                  {Icon ? <Icon size={20} className={active ? "text-accent" : ""} /> : null}
                  {shortLabel(item)}
                  {href === "/commandes" && incoming ? (
                    <span className="absolute right-[24%] top-2 h-2 w-2 rounded-full bg-info ring-2 ring-bg-elev" aria-label={`${incoming} en cours`} />
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              className={cx("relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium", moreActive ? "text-text" : "text-muted")}
            >
              {moreActive ? <span className="absolute top-0 h-0.5 w-8 rounded-b bg-brand" aria-hidden /> : null}
              <MenuIcon size={20} className={moreActive ? "text-accent" : ""} />
              Plus
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? <MoreSheet pathname={pathname} onClose={() => setMoreOpen(false)} onLogout={logout} /> : null}

      {vault ? <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}

/** Feuille « Plus » (téléphone) : autres pages, thème, déconnexion. */
function MoreSheet({ pathname, onClose, onLogout }: { pathname: string; onClose: () => void; onLogout: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages">
      <div className="animate-fade absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div
        ref={ref}
        className="animate-sheet absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border-strong bg-bg-elev p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-pop)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" aria-hidden />
        <ul className="grid grid-cols-3 gap-2">
          {NAV_ITEMS.filter((n) => !MOBILE_TABS.includes(n.href)).map((n) => {
            const Icon = NAV_ICONS[n.href];
            const active = isActive(pathname, n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 text-xs font-medium transition",
                    active ? "border-accent/40 bg-accent/10 text-text" : "border-border bg-surface text-text-2",
                  )}
                >
                  {Icon ? <Icon size={20} className="text-accent" /> : null}
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
          <span className="text-[13px] font-medium">Thème</span>
          <ThemeSwitcher withLabels />
        </div>
        <Button variant="ghost" className="mt-2 w-full" icon={<LogOutIcon size={16} />} onClick={onLogout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
