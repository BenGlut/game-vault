"use client";

import { useEffect, useState } from "react";
import type { ChangeLogEntry } from "@/lib/schema";
import { api } from "./api";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

/** Dernières modifications, en ligne (web) et depuis la CLI (agent). */
export default function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<ChangeLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .changeLog()
      .then(setEntries)
      .catch((e: Error) => setError(e.message));
  }, [refreshKey]);

  if (error) return <p className="text-sm text-ko">{error}</p>;
  if (!entries) return <p className="text-sm text-muted">Chargement…</p>;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {entries.slice(0, 60).map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
          <span className="min-w-0">
            <span className="block">{e.message}</span>
            <span className="block text-xs text-muted">{e.command}</span>
          </span>
          <span className="shrink-0 text-right text-xs text-muted">
            {dateFormat.format(new Date(e.at))}
            <br />
            {e.actor === "web" ? "en ligne" : "agent"}
          </span>
        </li>
      ))}
    </ul>
  );
}
