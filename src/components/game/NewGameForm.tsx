"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { REGIONS, type Game } from "@/lib/schema";
import { normalizeTitle } from "@/lib/normalize";
import { findDuplicate, makeGame } from "@/components/vault/model";
import { Button, Checkbox, Field, Select, inputClass } from "@/components/ui/fields";
import { Dialog } from "@/components/ui/primitives";
import { useVault } from "@/components/vault/VaultProvider";
import { useGameDrawer } from "./GameDrawer";

interface Prefill {
  title?: string;
  platformId?: string;
}

const Ctx = createContext<{ openNewGame: (prefill?: Prefill) => void }>({ openNewGame: () => undefined });

export function useNewGame() {
  return useContext(Ctx);
}

/** Fenêtre « Nouveau jeu » disponible partout (collection, wishlist, catalogue, recherche). */
export function NewGameProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const openNewGame = useCallback((p?: Prefill) => setPrefill(p ?? {}), []);
  const close = useCallback(() => setPrefill(null), []);

  return (
    <Ctx.Provider value={{ openNewGame }}>
      {children}
      {prefill ? (
        <Dialog label="Nouveau jeu" title="Nouveau jeu" onClose={close}>
          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <p className="mb-4 text-[13px] text-muted">Ajoutez le jeu au catalogue de la collection, et à la wishlist si vous le cherchez.</p>
            <NewGameForm prefill={prefill} onDone={close} />
          </div>
        </Dialog>
      ) : null}
    </Ctx.Provider>
  );
}

/** Ajout au catalogue (et à la wishlist), mêmes règles de doublon que `vault add-game`. */
function NewGameForm({ prefill, onDone }: { prefill: Prefill; onDone: () => void }) {
  const { data, createGame } = useVault();
  const { open } = useGameDrawer();
  const [title, setTitle] = useState(prefill.title ?? "");
  const [platformId, setPlatformId] = useState(prefill.platformId ?? "switch");
  const [edition, setEdition] = useState("");
  const [year, setYear] = useState("");
  const [franchise, setFranchise] = useState("");
  const [aliases, setAliases] = useState("");
  const [region, setRegion] = useState<string>("PAL-FR");
  const [wishlist, setWishlist] = useState(true);
  const [busy, setBusy] = useState(false);

  const platform = data.platforms.find((p) => p.id === platformId);
  const norm = normalizeTitle(title);
  const duplicate = useMemo(() => findDuplicate(data.games, { title, platformId, edition }), [data.games, platformId, title, edition]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!norm || duplicate || !platform) return;
    const game = makeGame(data.games, data.platforms, {
      title,
      platformId,
      edition,
      year: year ? Number(year) : null,
      franchise,
      aliases: aliases
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      region: region as Game["region"],
    });
    setBusy(true);
    const ok = await createGame(game, wishlist ? "wishlist" : null);
    setBusy(false);
    if (ok) {
      onDone();
      open(game.id);
    }
  }

  const platforms = [...data.platforms].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Titre (boîte FR)" className="sm:col-span-2">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </Field>
        <Field label="Console">
          <Select
            value={platformId}
            options={platforms.map((p) => p.id)}
            labels={Object.fromEntries(platforms.map((p) => [p.id, p.name]))}
            onChange={setPlatformId}
          />
        </Field>
        <Field label="Région de la boîte">
          <Select value={region} options={REGIONS} onChange={setRegion} />
        </Field>
        <Field label="Édition (facultatif)">
          <input className={inputClass} value={edition} onChange={(e) => setEdition(e.target.value)} />
        </Field>
        <Field label="Année de sortie">
          <input className={inputClass} type="number" min="1970" max="2030" value={year} onChange={(e) => setYear(e.target.value)} />
        </Field>
        <Field label="Franchise">
          <input className={inputClass} value={franchise} onChange={(e) => setFranchise(e.target.value)} />
        </Field>
        <Field label="Autres noms, séparés par des virgules">
          <input className={inputClass} value={aliases} onChange={(e) => setAliases(e.target.value)} />
        </Field>
      </div>
      <Checkbox checked={wishlist} onChange={setWishlist}>
        Ajouter aussi à la wishlist
      </Checkbox>
      {duplicate ? (
        <p role="alert" className="rounded-lg border border-ko/30 bg-ko/10 px-3 py-2 text-[13px] text-ko">
          Déjà dans la base : {duplicate.canonicalTitle}. Précisez l’édition s’il s’agit d’une autre version.
        </p>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button onClick={onDone}>Annuler</Button>
        <Button type="submit" variant="primary" disabled={!norm || !!duplicate || busy}>
          {busy ? "Ajout…" : "Ajouter le jeu"}
        </Button>
      </div>
    </form>
  );
}
