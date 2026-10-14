"use client";

import { useCallback, useState } from "react";
import type { Game } from "@/lib/schema";
import { Badge, Button } from "@/components/ui/primitives";
import { CheckIcon, StarIcon } from "@/components/icons";
import CoverHero from "@/components/game/CoverHero";
import { AmiiboGames } from "@/components/game/AmiiboCompat";
import { AMIIBO_PLATFORM, formatRelease, isUpcoming } from "@/lib/amiibo";
import { ShopLinks, shopLinks } from "@/components/game/GameDetail";
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
  /** amiibo : série, type, sortie, précision */
  s?: string;
  ty?: string;
  d?: string;
  note?: string;
}

/** Fiche d'un jeu du catalogue absent de la base : jaquette au format de la console, ajout en un clic. */
export default function CatalogEntryPanel({
  entry,
  platformId,
  platformName,
  fallback,
  tierLabel,
  boxLabel = null,
  onClose,
}: {
  entry: Entry;
  platformId: string;
  platformName: string;
  fallback: string | null;
  tierLabel: string | null;
  boxLabel?: string | null;
  onClose: () => void;
}) {
  const { data, createGame } = useVault();
  const { open } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState<"wishlist" | "owned" | null>(null);
  const basePlatform = platformId.replace(/-digital$/, "");
  const known = data.platforms.some((p) => p.id === basePlatform);
  const duplicate = findDuplicate(data.games, { title: entry.t, platformId: basePlatform });

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(onClose, 280);
  }, [onClose]);

  async function add(initial: "wishlist" | "owned") {
    setBusy(initial);
    const game = makeGame(data.games, data.platforms, {
      title: entry.t,
      platformId: basePlatform,
      qualityTier: (entry.q ?? null) as Game["qualityTier"],
      region: entry.r.includes("France") || entry.r.includes("Europe") ? "PAL-FR" : "other",
    });
    const ok = await createGame(game, initial);
    setBusy(null);
    if (ok) {
      onClose();
      open(game.id);
    }
  }

  return (
    <SidePanel label={`Fiche catalogue de ${entry.t}`} visible={visible} onClose={close}>
      <CoverHero platformId={platformId} platformName={platformName} src={entry.u} fallback={fallback} title={entry.t} square={entry.sq} />
      <div className="space-y-6 px-5 pb-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em]">{entry.t}</h2>
          {entry.s ? (
            <p className="mt-1 text-[13px] text-muted">
              {entry.ty ?? "amiibo"} · {entry.s}
              {entry.d ? ` · ${isUpcoming(entry.d) ? "sortie prévue" : "sorti"} ${entry.d.length === 4 ? "en" : "le"} ${formatRelease(entry.d)}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-muted">
              {platformName} · {entry.r.join(", ") || "région inconnue"}
            </p>
          )}
          {entry.note ? <p className="mt-1 text-xs text-muted">{entry.note}</p> : null}
          {tierLabel || boxLabel ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {tierLabel ? <Badge tone="accent">Qualité {tierLabel}</Badge> : null}
              {boxLabel ? <Badge>{boxLabel}</Badge> : null}
            </div>
          ) : null}
          <div className="mt-4">
            <ShopLinks links={shopLinks(entry.t, platformName)} />
          </div>
        </div>

        <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold">Pas encore dans la base</h3>
          <p className="mt-1 text-[13px] text-muted">Vous l’avez déjà ? Ajoutez-le à votre collection. Sinon, mettez-le en wishlist pour le suivre dans les chasses.</p>
          {duplicate ? (
            <p role="alert" className="mt-3 text-xs font-medium text-accent">
              Un jeu du même titre existe déjà sur cette console : {duplicate.canonicalTitle}.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" icon={<CheckIcon size={14} />} disabled={!!busy || !known || !!duplicate} onClick={() => add("owned")}>
              {busy === "owned" ? "Ajout…" : "Je l’ai : ajouter à ma collection"}
            </Button>
            <Button icon={<StarIcon size={14} />} disabled={!!busy || !known || !!duplicate} onClick={() => add("wishlist")}>
              {busy === "wishlist" ? "Ajout…" : "Ajouter à la wishlist"}
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
        {platformId === AMIIBO_PLATFORM ? <AmiiboGames title={entry.t} catalogId={entry.id} /> : null}
      </div>
    </SidePanel>
  );
}
