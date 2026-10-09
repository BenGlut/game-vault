"use client";

import { useMemo, useState } from "react";
import { REGIONS, type Game } from "@/lib/schema";
import { gameId, normalizeTitle, slugify } from "@/lib/normalize";
import { Button, Field, Select, inputClass } from "./fields";
import type { VaultData } from "./api";

/** Ajout d'un jeu au catalogue (et à la wishlist), mêmes règles de doublon que `vault add-game`. */
export default function NewGameForm({
  data,
  onCreate,
}: {
  data: VaultData;
  onCreate: (game: Game, wishlist: boolean) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [platformId, setPlatformId] = useState("switch");
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
        ? data.games.find(
            (g) => g.platformId === platformId && g.normalizedTitle === norm && (g.edition ?? "") === edition.trim(),
          )
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
    try {
      if (!(await onCreate(game, wishlist))) return;
      setTitle("");
      setEdition("");
      setYear("");
      setFranchise("");
      setAliases("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Titre (boîte FR)" className="sm:col-span-2">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Console">
          <Select
            value={platformId}
            options={data.platforms.map((p) => p.id)}
            labels={Object.fromEntries(data.platforms.map((p) => [p.id, p.name]))}
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
          <input
            className={inputClass}
            type="number"
            min="1970"
            max="2030"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Field>
        <Field label="Franchise">
          <input className={inputClass} value={franchise} onChange={(e) => setFranchise(e.target.value)} />
        </Field>
        <Field label="Autres noms (séparés par des virgules)">
          <input className={inputClass} value={aliases} onChange={(e) => setAliases(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={wishlist} onChange={(e) => setWishlist(e.target.checked)} className="accent-[var(--accent)]" />
        Ajouter aussi à la wishlist
      </label>
      {duplicate ? (
        <p className="text-sm text-ko">
          Déjà dans la base : {duplicate.canonicalTitle} ({duplicate.id}). Précisez l’édition s’il s’agit d’une autre
          version.
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={!norm || !!duplicate || busy}>
          {busy ? "Ajout…" : "Ajouter le jeu"}
        </Button>
      </div>
    </form>
  );
}
