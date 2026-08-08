import Link from "next/link";
import { getPlatforms, getGames } from "@/lib/data";
import { PageTitle } from "@/components/ui";

export default function PlatformsPage() {
  const platforms = getPlatforms();
  const games = getGames();
  const counts = new Map<string, number>();
  for (const g of games) counts.set(g.platformId, (counts.get(g.platformId) ?? 0) + 1);

  const withGames = platforms.filter((p) => (counts.get(p.id) ?? 0) > 0);
  const empty = platforms.filter((p) => !counts.get(p.id));

  return (
    <div>
      <PageTitle title="Plateformes" sub="Toutes marques supportées — Nintendo, Sony, Microsoft, Sega, Atari, SNK, PC" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {withGames.map((p) => (
          <Link
            key={p.id}
            href={`/collection/?plateforme=${p.id}`}
            className="rounded-xl border border-border bg-surface p-4 transition hover:border-accent/40"
          >
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-xs text-muted">
              {p.brand}
              {p.generation ? ` — génération ${p.generation}` : ""}
            </div>
            <div className="mt-2 font-mono text-accent">{counts.get(p.id)} jeux</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase text-muted">
        Prêtes à l&apos;emploi (aucun jeu pour l&apos;instant)
      </h2>
      <div className="flex flex-wrap gap-2">
        {empty.map((p) => (
          <span key={p.id} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            {p.shortName}
          </span>
        ))}
      </div>
    </div>
  );
}
