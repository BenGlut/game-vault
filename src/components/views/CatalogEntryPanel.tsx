"use client";

import { useCallback, useState } from "react";
import type { Game } from "@/lib/schema";
import { Button } from "@/components/ui/fields";
import BrandLogo from "@/components/BrandLogos";
import CoverHero from "@/components/game/CoverHero";
import SidePanel from "@/components/game/SidePanel";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import { useVault } from "@/components/vault/VaultProvider";
import { findDuplicate, makeGame } from "@/components/vault/model";

interface Entry {
  id: string;
  t: string;
  r: string[];
  q?: string;
  u?: string;
  sq?: boolean;
}

function searchText(s: string): string {
  return s.replace(/[:–—_/]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Fiche d'un jeu du catalogue absent de la base : jaquette au format de la console, ajout en un clic. */
export default function CatalogEntryPanel({
  entry,
  platformId,
  platformName,
  fallback,
  tierLabel,
  onClose,
}: {
  entry: Entry;
  platformId: string;
  platformName: string;
  fallback: string | null;
  tierLabel: string | null;
  onClose: () => void;
}) {
  const { data, createGame } = useVault();
  const { open } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const basePlatform = platformId.replace(/-digital$/, "");
  const known = data.platforms.some((p) => p.id === basePlatform);
  const duplicate = findDuplicate(data.games, { title: entry.t, platformId: basePlatform });

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(onClose, 280);
  }, [onClose]);

  async function addToWishlist() {
    setBusy(true);
    const game = makeGame(data.games, data.platforms, {
      title: entry.t,
      platformId: basePlatform,
      qualityTier: (entry.q ?? null) as Game["qualityTier"],
      region: entry.r.includes("France") || entry.r.includes("Europe") ? "PAL-FR" : "other",
    });
    const ok = await createGame(game, true);
    setBusy(false);
    if (ok) {
      onClose();
      open(game.id);
    }
  }

  return (
    <SidePanel label={`Fiche catalogue de ${entry.t}`} visible={visible} onClose={close}>
      <CoverHero platformId={platformId} platformName={platformName} src={entry.u} fallback={fallback} title={entry.t} square={entry.sq} />
      <div className="space-y-6 px-5 pb-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold leading-tight tracking-tight">{entry.t}</h2>
          <p className="mt-1 text-xs text-muted">
            {platformName} · {entry.r.join(", ") || "région inconnue"}
          </p>
          {tierLabel ? <p className="mt-2 text-xs text-accent">Qualité {tierLabel}</p> : null}
        </div>

        <section className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold">Pas encore dans la base</h3>
          <p className="mt-1 text-xs text-muted">
            Ajoute-le à la wishlist pour le suivre dans les chasses, ou complète sa fiche (édition, région, franchise).
          </p>
          {duplicate ? (
            <p className="mt-3 text-xs text-accent">Un jeu du même titre existe déjà sur cette console : {duplicate.canonicalTitle}.</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" disabled={busy || !known || !!duplicate} onClick={addToWishlist}>
              {busy ? "Ajout…" : "Ajouter à la wishlist"}
            </Button>
            <Button
              disabled={!known}
              onClick={() => {
                onClose();
                openNewGame({ title: entry.t, platformId: basePlatform });
              }}
            >
              Ajouter avec détails…
            </Button>
          </div>
          {!known ? <p className="mt-2 text-xs text-muted">Console absente de la base : ajout impossible depuis l’interface.</p> : null}
        </section>

        {/* comparer avant d'acheter : Vinted, Micromania occasion, Amazon neuf */}
        <div className="grid grid-cols-2 gap-2">
          {[
            ["vinted", "Vinted", `https://www.vinted.fr/catalog?search_text=${encodeURIComponent(searchText(`${entry.t} ${platformName}`))}`],
            [
              "micromania",
              "Micromania",
              `https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=${encodeURIComponent(searchText(entry.t))}`,
            ],
            ["amazon", "Amazon", `https://www.amazon.fr/s?k=${encodeURIComponent(searchText(`${entry.t} ${platformName}`))}&i=videogames`],
            ["", "Notes et fiche", `https://www.mobygames.com/search/?q=${encodeURIComponent(searchText(entry.t))}`],
          ].map(([brand, label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm transition hover:border-accent/50 hover:text-accent"
            >
              {brand ? <BrandLogo brand={brand} size={16} /> : null}
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </SidePanel>
  );
}
