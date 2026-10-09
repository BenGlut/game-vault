"use client";

import { useMemo, useState } from "react";
import { normalizeTitle } from "@/lib/normalize";
import { EmptyState, PageHeader, Segmented } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/fields";
import { SearchIcon } from "@/components/icons";
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
      (e) =>
        (actor === "all" || (actor === "web" ? e.actor === "web" : e.actor !== "web")) &&
        (!q || normalizeTitle(`${e.message} ${e.command}`).includes(q)),
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
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher une modification…" className={`${inputClass} pl-9`} />
        </div>
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
      </div>
      {days.length === 0 ? (
        <EmptyState title="Aucune modification trouvée" />
      ) : (
        <div className="space-y-6">
          {days.map(([day, entries]) => (
            <section key={day}>
              <h2 className="sticky top-[57px] z-10 mb-2 bg-bg/90 py-1 text-sm font-semibold backdrop-blur lg:top-0">
                {relativeDay(`${day}T12:00:00`)}
                <span className="ml-2 font-normal text-muted">{entries.length}</span>
              </h2>
              <div className="rounded-2xl border border-border bg-surface p-2">
                <ActivityList entries={entries} onOpenGame={open} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
