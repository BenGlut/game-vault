"use client";

import { useState } from "react";
import { BUY_PRIORITIES, QUALITY_TIERS, type Game, type InventoryItem, type Platform } from "@/lib/schema";
import { normalizeTitle } from "@/lib/normalize";
import { Button, Field, Select, inputClass } from "./fields";
import InventoryRow from "./InventoryRow";

/** Fiche d'un jeu : ses métadonnées éditables et toutes ses lignes d'inventaire. */
export default function GameEditor({
  game,
  items,
  platform,
  onSaveGame,
  onSaveItem,
  onDeleteItem,
  onAddItem,
}: {
  game: Game;
  items: InventoryItem[];
  platform: Platform | undefined;
  onSaveGame: (next: Game) => Promise<unknown>;
  onSaveItem: (next: InventoryItem) => Promise<unknown>;
  onDeleteItem: (item: InventoryItem) => Promise<unknown>;
  onAddItem: (status: "wishlist" | "owned") => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<Game>(game);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(game);
  const set = <K extends keyof Game>(key: K, value: Game[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const hasWishlist = items.some((i) => i.status === "wishlist");

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">{platform?.name ?? game.platformId}</div>
        <h2 className="mt-1 text-xl font-bold tracking-tight">{game.canonicalTitle}</h2>
        <code className="text-xs text-muted">{game.id}</code>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">Fiche du jeu</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Titre" className="sm:col-span-2">
            <input
              className={inputClass}
              value={draft.canonicalTitle}
              onChange={(e) =>
                setDraft((d) => ({ ...d, canonicalTitle: e.target.value, normalizedTitle: normalizeTitle(e.target.value) }))
              }
            />
          </Field>
          <Field label="Édition">
            <input
              className={inputClass}
              value={draft.edition ?? ""}
              onChange={(e) => set("edition", e.target.value || null)}
            />
          </Field>
          <Field label="Franchise">
            <input
              className={inputClass}
              value={draft.franchise ?? ""}
              onChange={(e) => set("franchise", e.target.value || null)}
            />
          </Field>
          <Field label="Année de sortie">
            <input
              className={inputClass}
              type="number"
              min="1970"
              max="2030"
              value={draft.releaseYear ?? ""}
              onChange={(e) => set("releaseYear", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field label="Autres noms (séparés par des virgules)">
            <input
              className={inputClass}
              value={draft.aliases.join(", ")}
              onChange={(e) =>
                set(
                  "aliases",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </Field>
          <Field label="Qualité">
            <Select
              value={draft.qualityTier}
              options={QUALITY_TIERS}
              allowEmpty="Non notée"
              onChange={(v) => set("qualityTier", (v || null) as Game["qualityTier"])}
            />
          </Field>
          <Field label="Priorité d’achat">
            <Select
              value={draft.buyPriority}
              options={BUY_PRIORITIES}
              allowEmpty="Aucune"
              onChange={(v) => set("buyPriority", (v || null) as Game["buyPriority"])}
            />
          </Field>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          {dirty ? <Button onClick={() => setDraft(game)}>Annuler</Button> : null}
          <Button variant="primary" disabled={!dirty || busy} onClick={() => run(() => onSaveGame(draft))}>
            {busy ? "Enregistrement…" : "Enregistrer la fiche"}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            Exemplaires et wishlist <span className="text-muted">({items.length})</span>
          </h3>
          <div className="flex gap-2">
            {!hasWishlist ? (
              <Button disabled={busy} onClick={() => run(() => onAddItem("wishlist"))}>
                Ajouter à la wishlist
              </Button>
            ) : null}
            <Button disabled={busy} onClick={() => run(() => onAddItem("owned"))}>
              Ajouter un exemplaire possédé
            </Button>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
            Aucune ligne : ce jeu est seulement au catalogue.
          </p>
        ) : (
          items.map((item) => (
            <InventoryRow key={`${item.id}:${item.updatedAt}`} item={item} onSave={onSaveItem} onDelete={onDeleteItem} />
          ))
        )}
      </section>
    </div>
  );
}
