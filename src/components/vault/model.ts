/**
 * Règles métier côté interface — mêmes conventions que la CLI.
 */
import type { Game, InventoryItem, InventoryStatus, Platform } from "@/lib/schema";
import { gameId, normalizeTitle, slugify } from "@/lib/normalize";

export interface NewGameInput {
  title: string;
  platformId: string;
  edition?: string;
  year?: number | null;
  franchise?: string;
  aliases?: string[];
  region?: Game["region"];
  qualityTier?: Game["qualityTier"];
}

/** Doublon au sens de `vault add-game` : même console, même titre normalisé, même édition. */
export function findDuplicate(games: Game[], input: Pick<NewGameInput, "title" | "platformId" | "edition">): Game | undefined {
  const norm = normalizeTitle(input.title);
  if (!norm) return undefined;
  return games.find((g) => g.platformId === input.platformId && g.normalizedTitle === norm && (g.edition ?? "") === (input.edition ?? "").trim());
}

/** Fiche d'un nouveau jeu, id déterministe et libre (cf. `vault add-game`). */
export function makeGame(games: Game[], platforms: Platform[], input: NewGameInput): Game {
  const base = gameId(input.platformId, input.title);
  let id = base;
  if (games.some((g) => g.id === id)) {
    const withEdition = input.edition?.trim() ? `${base}-${slugify(input.edition)}` : `${base}-2`;
    id = withEdition;
    let n = 2;
    while (games.some((g) => g.id === id)) id = `${withEdition}-${n++}`;
  }
  const platform = platforms.find((p) => p.id === input.platformId);
  return {
    id,
    kind: "game",
    canonicalTitle: input.title.trim(),
    normalizedTitle: normalizeTitle(input.title),
    aliases: input.aliases ?? [],
    franchise: input.franchise?.trim() || null,
    platformId: input.platformId,
    region: input.region ?? "PAL-FR",
    languages: ["fr"],
    publisher: null,
    developer: null,
    releaseYear: input.year ?? null,
    genres: [],
    edition: input.edition?.trim() || null,
    playsOn: [],
    mediaType: platform?.mediaTypes[0] ?? "cartridge",
    externalIds: {},
    qualityTier: input.qualityTier ?? null,
    buyPriority: null,
  };
}

/** Premier id d'inventaire libre : inv_x, inv_x-2, inv_x-3… (cf. freeInventoryId de la CLI). */
export function freeInventoryId(inventory: InventoryItem[], gameId: string): string {
  const base = gameId.replace(/^game_/, "inv_");
  const taken = new Set(inventory.map((i) => i.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function newInventoryLine(
  inventory: InventoryItem[],
  gameId: string,
  status: Extract<InventoryStatus, "wishlist" | "owned">,
): InventoryItem {
  const now = new Date().toISOString();
  return {
    id: freeInventoryId(inventory, gameId),
    gameId,
    status,
    quantity: status === "wishlist" ? 0 : 1,
    condition: "unknown",
    completeness: "unknown",
    purchasePrice: null,
    currentEstimate: null,
    verificationStatus: status === "owned" ? "verified" : "needs_review",
    quantityNeedsReview: false,
    evidenceIds: [],
    orderId: null,
    privateNotes: null,
    acquiredAt: status === "owned" ? now.slice(0, 10) : null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Recherche tolérante : chaque mot de la requête doit apparaître dans le titre, un alias ou la franchise. */
export function matches(game: Game, query: string): boolean {
  const words = normalizeTitle(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = [game.normalizedTitle, ...game.aliases.map(normalizeTitle), normalizeTitle(game.franchise ?? "")].join(
    " ",
  );
  return words.every((w) => hay.includes(w));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** URL de la jaquette servie avec le site (absente pour un jeu ajouté en ligne : repli géré par GameCover). */
export function coverUrl(gameId: string): string {
  return `/covers/${gameId}.jpg`;
}
