"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeTitle } from "@/lib/normalize";
import {
  AMIIBO_PLATFORM,
  COMPAT_PLATFORM_LABELS,
  amiiboForGame,
  compatGameIndexes,
  gamesForAmiibo,
  type AmiiboCompat,
  type CompatGameLike,
} from "@/lib/amiibo";
import { useVault } from "@/components/vault/VaultProvider";
import { Badge } from "@/components/ui/primitives";

interface AmiiboEntry {
  id: string;
  t: string;
  n: string;
  u?: string;
  s?: string;
  ty?: string;
}

/** Catalogue amiibo + table de compatibilité, chargés une fois pour toute la session. */
let cache: Promise<{ compat: AmiiboCompat; amiibo: AmiiboEntry[] } | null> | null = null;
function loadAmiibo() {
  cache ??= Promise.all([
    fetch("/catalog/amiibo-compat.json").then((r) => (r.ok ? (r.json() as Promise<AmiiboCompat>) : null)),
    fetch("/catalog/amiibo.json").then((r) => (r.ok ? (r.json() as Promise<AmiiboEntry[]>) : null)),
  ])
    .then(([compat, amiibo]) => (compat && amiibo ? { compat, amiibo } : null))
    .catch(() => null);
  return cache;
}

function useAmiiboData() {
  const [data, setData] = useState<{ compat: AmiiboCompat; amiibo: AmiiboEntry[] } | null>(null);
  useEffect(() => {
    let alive = true;
    void loadAmiibo().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

const listClass = "divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface";

/** Fiche d'un jeu : les amiibo qui débloquent quelque chose dedans, ceux de la collection en tête. */
export function GameAmiibo({ game }: { game: CompatGameLike }) {
  const data = useAmiiboData();
  const { stats } = useVault();
  const [all, setAll] = useState(false);
  const owned = useMemo(
    () => new Set(stats.rows.filter((r) => r.game.kind === "amiibo" && r.ownedCount > 0).map((r) => r.game.normalizedTitle)),
    [stats.rows],
  );
  const list = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.amiibo.map((a) => [a.id, a]));
    return amiiboForGame(game, data.compat)
      .map((x) => ({ ...x, a: byId.get(x.id) }))
      .filter((x): x is typeof x & { a: AmiiboEntry } => !!x.a)
      .map((x) => ({ ...x, mine: owned.has(x.a.n) }))
      .sort((x, y) => Number(y.mine) - Number(x.mine) || x.a.t.localeCompare(y.a.t, "fr"));
  }, [data, game, owned]);
  if (!list.length) return null;
  const shown = all ? list : list.slice(0, 8);
  const mine = list.filter((x) => x.mine).length;
  return (
    <section>
      <div className="mb-2.5 flex min-h-7 items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold">Amiibo compatibles</h3>
        <a
          href={`/catalogue/?plateforme=${AMIIBO_PLATFORM}&jeu=${compatGameIndexes(game, data!.compat)[0] ?? ""}`}
          className="text-xs font-medium text-accent hover:underline"
        >
          {list.length} amiibo{mine ? ` · ${mine} possédé${mine > 1 ? "s" : ""}` : ""}
        </a>
      </div>
      <ul className={listClass}>
        {shown.map(({ a, usage, mine: isMine }) => (
          <li key={a.id} className="flex items-start gap-3 px-3 py-2.5">
            {a.u ? (
              // eslint-disable-next-line @next/next/no-img-element -- export statique : pas d'optimiseur d'images Next
              <img src={a.u} alt="" loading="lazy" className="h-10 w-10 shrink-0 object-contain" />
            ) : (
              <span className="h-10 w-10 shrink-0" />
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[13px] font-medium">
                {a.t}
                {isMine ? <Badge tone="ok">Possédé</Badge> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{usage}</span>
            </span>
          </li>
        ))}
      </ul>
      {list.length > shown.length ? (
        <button type="button" onClick={() => setAll(true)} className="mt-2 text-xs font-medium text-accent hover:underline">
          Voir les {list.length} amiibo
        </button>
      ) : null}
    </section>
  );
}

/** Fiche d'un amiibo : les jeux avec lesquels il fonctionne, ceux de la collection en tête. */
export function AmiiboGames({ title, catalogId }: { title: string; catalogId?: string }) {
  const data = useAmiiboData();
  const { stats } = useVault();
  const list = useMemo(() => {
    if (!data) return [];
    const id = catalogId ?? data.amiibo.find((a) => a.n === normalizeTitle(title))?.id;
    if (!id) return [];
    const mine = new Set<number>();
    for (const r of stats.rows) {
      if (r.game.kind !== "game" || (r.ownedCount === 0 && r.state !== "incoming")) continue;
      for (const i of compatGameIndexes(r.game, data.compat)) mine.add(i);
    }
    return gamesForAmiibo(id, data.compat)
      .map((g) => ({ ...g, mine: mine.has(g.index) }))
      .sort((x, y) => Number(y.mine) - Number(x.mine) || x.t.localeCompare(y.t, "fr"));
  }, [data, title, catalogId, stats.rows]);
  if (!data) return null;
  return (
    <section>
      <div className="mb-2.5 flex min-h-7 items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold">Jeux compatibles</h3>
        <span className="text-xs text-muted">{list.length ? `${list.length} jeu${list.length > 1 ? "x" : ""}` : ""}</span>
      </div>
      {list.length ? (
        <ul className={listClass}>
          {list.map((g) => (
            <li key={`${g.p}-${g.t}`} className="px-3 py-2.5">
              <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
                {g.t}
                <Badge>{COMPAT_PLATFORM_LABELS[g.p] ?? g.p}</Badge>
                {g.mine ? <Badge tone="ok">Dans ma collection</Badge> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{g.usage}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-muted">Aucun jeu compatible connu.</p>
      )}
    </section>
  );
}
