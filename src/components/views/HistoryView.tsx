"use client";

import { useMemo, useState } from "react";
import { normalizeTitle } from "@/lib/normalize";
import { HistoryIcon } from "@/components/icons";
import { Badge, EmptyState, FilterBar, PageHeader, SearchField, Segmented } from "@/components/ui/primitives";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault } from "@/components/vault/VaultProvider";
import ActivityList, { relativeDay } from "./ActivityList";

type Actor = "all" | "web" | "agent";

export default function HistoryView() {
  const { data } = useVault();
  const { open } = useGameDrawer();
  const [actor, setActor] = useState<Actor>("all");
  const [query, setQuery] = useState("");

  const days = useMemo(() => {
    const q = normalizeTitle(query);
    const list = data.changeLog.filter(
      (e) => (actor === "all" || (actor === "web" ? e.actor === "web" : e.actor !== "web")) && (!q || normalizeTitle(`${e.message} ${e.command}`).includes(q)),
    );
    const groups = new Map<string, typeof list>();
    for (const e of list) {
      const key = e.at.slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }
    return [...groups.entries()];
  }, [data.changeLog, actor, query]);

  return (
    <div className="animate-page">
      <PageHeader title="Historique" subtitle={`Les ${data.changeLog.length} dernières modifications, en ligne et par l’agent`} />
      <FilterBar
        top={
          <>
            <SearchField className="basis-full sm:flex-1 sm:basis-56" value={query} onChange={setQuery} placeholder="Chercher une modification…" />
            <Segmented<Actor>
              label="Origine"
              value={actor}
              onChange={setActor}
              options={[
                { value: "all", label: "Tout" },
                { value: "web", label: "En ligne" },
                { value: "agent", label: "Agent" },
              ]}
            />
          </>
        }
      />
      {days.length === 0 ? (
        <EmptyState title="Aucune modification trouvée" icon={<HistoryIcon size={18} />}>
          Essayez un autre mot ou une autre origine.
        </EmptyState>
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-5 sm:ml-2">
          {days.map(([day, entries]) => (
            <li key={day} className="relative">
              <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-border-strong" aria-hidden />
              <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                {relativeDay(`${day}T12:00:00`)}
                <Badge>{entries.length}</Badge>
              </h2>
              <div className="rounded-xl border border-border bg-surface px-3 py-1.5 shadow-[var(--shadow-card)]">
                <ActivityList entries={entries} onOpenGame={open} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
