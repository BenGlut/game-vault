"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { REGIONS, type Game } from "@/lib/schema";
import { gameId, normalizeTitle, slugify } from "@/lib/normalize";
import { Button, Field, Select, inputClass } from "@/components/ui/fields";
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

  useEffect(() => {
    if (!prefill) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prefill, close]);

  return (
    <Ctx.Provider value={{ openNewGame }}>
      {children}
      {prefill ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Nouveau jeu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="animate-pop relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border-strong bg-bg-elev p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nouveau jeu</h2>
              <button type="button" onClick={close} aria-label="Fermer" className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NewGameForm prefill={prefill} onDone={close} />
          </div>
        </div>
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
  const duplicate = useMemo(
    () =>
      norm
        ? data.games.find((g) => g.platformId === platformId && g.normalizedTitle === norm && (g.edition ?? "") === edition.trim())
        : undefined,
    [data.games, platformId, norm, edition],
  );

  function buildId(): string {
    const base = gameId(platformId, title);
    if (!data.games.some((g) => g.id === base)) return base;
    const withEdition = edition.trim() ? `${base}-${slugify(edition)}` : `${base}-2`;
    let id = withEdition;
    let n = 2;
    while (data.games.some((g) => g.id === id)) id = `${withEdition}-${n++}`;
    return id;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!norm || duplicate || !platform) return;
    const game: Game = {
      id: buildId(),
      kind: "game",
      canonicalTitle: title.trim(),
      normalizedTitle: norm,
      aliases: aliases
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      franchise: franchise.trim() || null,
      platformId,
      region: region as Game["region"],
      languages: ["fr"],
      publisher: null,
      developer: null,
      releaseYear: year ? Number(year) : null,
      genres: [],
      edition: edition.trim() || null,
      playsOn: [],
      mediaType: platform.mediaTypes[0] ?? "cartridge",
      externalIds: {},
      qualityTier: null,
      buyPriority: null,
    };
    setBusy(true);
    const ok = await createGame(game, wishlist);
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
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={wishlist} onChange={(e) => setWishlist(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
        Ajouter aussi à la wishlist
      </label>
      {duplicate ? (
        <p className="rounded-lg bg-ko/10 px-3 py-2 text-sm text-ko">
          Déjà dans la base : {duplicate.canonicalTitle}. Précisez l’édition s’il s’agit d’une autre version.
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button onClick={onDone}>Annuler</Button>
        <Button type="submit" variant="primary" disabled={!norm || !!duplicate || busy}>
          {busy ? "Ajout…" : "Ajouter le jeu"}
        </Button>
      </div>
    </form>
  );
}
