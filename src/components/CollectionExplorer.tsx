"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { Game, Platform } from "@/lib/schema";
import type { PublicInventoryItem } from "@/lib/data";

interface Row {
  game: Game;
  items: PublicInventoryItem[];
  platform: Platform | undefined;
  coverUrl: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  owned: "Possédé",
  ordered: "Commandé",
  shipped: "Expédié",
  received: "Reçu",
  wishlist: "Wishlist",
  duplicate: "Doublon",
  sold: "Vendu",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

const STATUS_COLORS: Record<string, string> = {
  owned: "bg-[#4ade8020] text-[#4ade80]",
  received: "bg-[#4ade8020] text-[#4ade80]",
  ordered: "bg-[#60a5fa20] text-[#60a5fa]",
  shipped: "bg-[#60a5fa20] text-[#93c5fd]",
  wishlist: "bg-[#c084fc20] text-[#c084fc]",
  duplicate: "bg-[#f5b64220] text-[#f5b642]",
  sold: "bg-[#8a93a820] text-[#8a93a8]",
  cancelled: "bg-[#f8717120] text-[#f87171]",
  refunded: "bg-[#f8717120] text-[#fca5a5]",
};

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function CollectionExplorer({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [franchise, setFranchise] = useState("");
  const [verif, setVerif] = useState("");
  const [region, setRegion] = useState("");

  // lit les filtres depuis l'URL (?plateforme=3ds&verif=needs_review)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plateforme");
    const v = params.get("verif");
    const s = params.get("statut");
    if (p) setPlatform(p);
    if (v) setVerif(v);
    if (s) setStatus(s);
  }, []);

  const platforms = useMemo(
    () => [...new Set(rows.map((r) => r.game.platformId))].sort(),
    [rows],
  );
  const franchises = useMemo(
    () => [...new Set(rows.map((r) => r.game.franchise).filter(Boolean) as string[])].sort(),
    [rows],
  );
  const regions = useMemo(() => [...new Set(rows.map((r) => r.game.region))].sort(), [rows]);
  const statuses = useMemo(
    () => [...new Set(rows.flatMap((r) => r.items.map((i) => i.status)))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = norm(query);
    return rows.filter((r) => {
      if (platform && r.game.platformId !== platform) return false;
      if (franchise && r.game.franchise !== franchise) return false;
      if (region && r.game.region !== region) return false;
      if (status && !r.items.some((i) => i.status === status)) return false;
      if (verif === "needs_review" && !r.items.some((i) => i.verificationStatus === "needs_review"))
        return false;
      if (verif === "verified" && !r.items.some((i) => i.verificationStatus === "verified"))
        return false;
      if (q) {
        const hay = [r.game.normalizedTitle, ...r.game.aliases.map(norm), norm(r.game.franchise ?? "")].join(" | ");
        for (const word of q.split(" ")) {
          if (!hay.includes(word)) return false;
        }
      }
      return true;
    });
  }, [rows, query, platform, status, franchise, verif, region]);

  const select =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Filtrer par titre, alias, franchise…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${select} w-full md:w-72`}
        />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={select}>
          <option value="">Toutes plateformes</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={select}>
          <option value="">Tous statuts</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <select value={franchise} onChange={(e) => setFranchise(e.target.value)} className={select}>
          <option value="">Toutes franchises</option>
          {franchises.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={select}>
          <option value="">Toutes régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select value={verif} onChange={(e) => setVerif(e.target.value)} className={select}>
          <option value="">Vérification (tous)</option>
          <option value="verified">Vérifiés</option>
          <option value="needs_review">À vérifier</option>
        </select>
      </div>

      <p className="mb-3 text-sm text-muted">
        {filtered.length} jeu{filtered.length > 1 ? "x" : ""} — lecture seule
      </p>

      <div className="space-y-2">
        {filtered.map((r) => (
          <Link
            key={r.game.id}
            href={`/jeu/${r.game.id}/`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent/40 hover:bg-surface-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              {r.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.coverUrl}
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
                <div className="truncate font-medium">{r.game.canonicalTitle}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
                    {r.platform?.shortName ?? r.game.platformId}
                  </span>
                  {r.game.franchise ? <span>{r.game.franchise}</span> : null}
                  <span>{r.game.region}</span>
                  {r.items.some((i) => i.quantityNeedsReview) ? (
                    <span className="text-accent">quantité à confirmer</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {r.items.map((i) => (
                <span key={i.id} className="flex items-center gap-1">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[i.status] ?? "bg-surface-2 text-muted"}`}
                  >
                    {STATUS_LABELS[i.status] ?? i.status}
                  </span>
                  {i.quantity > 1 ? <span className="text-xs text-accent">×{i.quantity}</span> : null}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
            Aucun jeu ne correspond à ces filtres.
          </div>
        ) : null}
      </div>
    </div>
  );
}
