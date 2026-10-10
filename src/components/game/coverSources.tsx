"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CoverSource {
  u: string;
  sq?: boolean;
}

const Ctx = createContext<Record<string, CoverSource>>({});

/** Jaquettes originales de la collection (public/covers/sources.json, généré au déploiement). */
export function CoverSourcesProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<Record<string, CoverSource>>({});
  useEffect(() => {
    fetch("/covers/sources.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setSources, () => undefined);
  }, []);
  return <Ctx.Provider value={sources}>{children}</Ctx.Provider>;
}

export function useCoverSource(gameId: string): CoverSource | undefined {
  return useContext(Ctx)[gameId];
}
