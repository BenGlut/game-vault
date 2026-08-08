"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDoc } from "@/lib/data";

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Recherche tolérante : fautes mineures, accents, FR/EN, abréviations, franchise.
 * Ex.: "pokemon lune", "Pokemon Moon", "DQ VII", "luigi mansion", "bowser ds".
 */
export default function SearchClient({
  docs,
  covers = {},
}: {
  docs: SearchDoc[];
  covers?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "n", weight: 2 },
          { name: "a", weight: 1.5 },
          { name: "t", weight: 1 },
          { name: "f", weight: 0.6 },
          { name: "p", weight: 0.4 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        includeScore: true,
      }),
    [docs],
  );

  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    // astuce : si le dernier mot est une plateforme (ds, 3ds…), filtre dessus
    const words = q.split(" ");
    const last = words[words.length - 1];
    const platformFilter = ["ds", "3ds", "switch", "wii", "gba", "ps1", "ps2"].includes(last ?? "")
      ? last
      : null;
    const textQuery = platformFilter ? words.slice(0, -1).join(" ") : q;
    let hits = fuse.search(textQuery || q);
    if (platformFilter) hits = hits.filter((h) => h.item.p === platformFilter);
    return hits.slice(0, 20);
  }, [fuse, query]);

  return (
    <div>
      <input
        autoFocus
        type="search"
        placeholder='Ex.: "pokemon lune", "DQ VII", "bowser ds", "luigi mansion"…'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg focus:border-accent focus:outline-none"
      />
      <div className="mt-4 space-y-2">
        {results.map((h) => (
          <Link
            key={h.item.id}
            href={`/jeu/${h.item.id}/`}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent/40 hover:bg-surface-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              {covers[h.item.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={covers[h.item.id]}
                  alt=""
                  loading="lazy"
                  className="h-14 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-surface-2 text-xs text-muted">
                  ?
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{h.item.t}</div>
                <div className="mt-0.5 flex gap-2 text-xs text-muted">
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono uppercase">
                    {h.item.p}
                  </span>
                  {h.item.f ? <span>{h.item.f}</span> : null}
                  {h.item.a.length ? <span className="truncate">alias : {h.item.a.join(", ")}</span> : null}
                </div>
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs text-muted">
              {Math.round((1 - (h.score ?? 0)) * 100)}%
            </span>
          </Link>
        ))}
        {query && results.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
            Aucun résultat pour « {query} ». Le jeu n&apos;est peut-être pas dans la collection.
          </div>
        ) : null}
      </div>
    </div>
  );
}
