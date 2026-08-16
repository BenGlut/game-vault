#!/usr/bin/env tsx
/**
 * Bootstrap du repo privé game-vault-data à partir du seed initial (section 14 du cahier des charges).
 * Idempotent : refuse d'écraser des données existantes sans --force.
 *
 * Tous les items sont créés en verificationStatus="needs_review" (aucun jeu confirmé physiquement).
 * Les 8 titres de la section 15 sont flagués quantityNeedsReview=true.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTitle, gameId, inventoryId } from "../../src/lib/normalize";
import {
  GamesFileSchema,
  InventoryFileSchema,
  PlatformsFileSchema,
  ChangeLogFileSchema,
  PublishConfigSchema,
  type Game,
  type InventoryItem,
  type Platform,
} from "../../src/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(__dirname, "../../../game-vault-data");

const PLATFORMS: Platform[] = [
  { id: "nes", name: "Nintendo Entertainment System", shortName: "NES", brand: "Nintendo", generation: 3, mediaTypes: ["cartridge"] },
  { id: "snes", name: "Super Nintendo", shortName: "SNES", brand: "Nintendo", generation: 4, mediaTypes: ["cartridge"] },
  { id: "n64", name: "Nintendo 64", shortName: "N64", brand: "Nintendo", generation: 5, mediaTypes: ["cartridge"] },
  { id: "gamecube", name: "Nintendo GameCube", shortName: "NGC", brand: "Nintendo", generation: 6, mediaTypes: ["disc"] },
  { id: "wii", name: "Nintendo Wii", shortName: "Wii", brand: "Nintendo", generation: 7, mediaTypes: ["disc"] },
  { id: "wiiu", name: "Nintendo Wii U", shortName: "Wii U", brand: "Nintendo", generation: 8, mediaTypes: ["disc"] },
  { id: "switch", name: "Nintendo Switch", shortName: "Switch", brand: "Nintendo", generation: 8, mediaTypes: ["cartridge", "code_in_box"] },
  { id: "switch2", name: "Nintendo Switch 2", shortName: "Switch 2", brand: "Nintendo", generation: 9, mediaTypes: ["cartridge", "code_in_box"] },
  { id: "gb", name: "Game Boy", shortName: "GB", brand: "Nintendo", generation: 4, mediaTypes: ["cartridge"] },
  { id: "gbc", name: "Game Boy Color", shortName: "GBC", brand: "Nintendo", generation: 5, mediaTypes: ["cartridge"] },
  { id: "gba", name: "Game Boy Advance", shortName: "GBA", brand: "Nintendo", generation: 6, mediaTypes: ["cartridge"] },
  { id: "ds", name: "Nintendo DS", shortName: "DS", brand: "Nintendo", generation: 7, mediaTypes: ["cartridge"] },
  { id: "3ds", name: "Nintendo 3DS", shortName: "3DS", brand: "Nintendo", generation: 8, mediaTypes: ["cartridge"] },
  { id: "ps1", name: "PlayStation", shortName: "PS1", brand: "Sony", generation: 5, mediaTypes: ["disc"] },
  { id: "ps2", name: "PlayStation 2", shortName: "PS2", brand: "Sony", generation: 6, mediaTypes: ["disc"] },
  { id: "ps3", name: "PlayStation 3", shortName: "PS3", brand: "Sony", generation: 7, mediaTypes: ["disc"] },
  { id: "ps4", name: "PlayStation 4", shortName: "PS4", brand: "Sony", generation: 8, mediaTypes: ["disc"] },
  { id: "ps5", name: "PlayStation 5", shortName: "PS5", brand: "Sony", generation: 9, mediaTypes: ["disc"] },
  { id: "psp", name: "PlayStation Portable", shortName: "PSP", brand: "Sony", generation: 7, mediaTypes: ["disc"] },
  { id: "psvita", name: "PlayStation Vita", shortName: "PS Vita", brand: "Sony", generation: 8, mediaTypes: ["card"] },
  { id: "xbox", name: "Xbox", shortName: "Xbox", brand: "Microsoft", generation: 6, mediaTypes: ["disc"] },
  { id: "xbox360", name: "Xbox 360", shortName: "X360", brand: "Microsoft", generation: 7, mediaTypes: ["disc"] },
  { id: "xboxone", name: "Xbox One", shortName: "XONE", brand: "Microsoft", generation: 8, mediaTypes: ["disc"] },
  { id: "xboxseries", name: "Xbox Series X|S", shortName: "XSX", brand: "Microsoft", generation: 9, mediaTypes: ["disc"] },
  { id: "master-system", name: "Sega Master System", shortName: "SMS", brand: "Sega", generation: 3, mediaTypes: ["cartridge"] },
  { id: "megadrive", name: "Sega Mega Drive", shortName: "MD", brand: "Sega", generation: 4, mediaTypes: ["cartridge"] },
  { id: "saturn", name: "Sega Saturn", shortName: "Saturn", brand: "Sega", generation: 5, mediaTypes: ["disc"] },
  { id: "dreamcast", name: "Sega Dreamcast", shortName: "DC", brand: "Sega", generation: 6, mediaTypes: ["disc"] },
  { id: "game-gear", name: "Sega Game Gear", shortName: "GG", brand: "Sega", generation: 4, mediaTypes: ["cartridge"] },
  { id: "atari2600", name: "Atari 2600", shortName: "2600", brand: "Atari", generation: 2, mediaTypes: ["cartridge"] },
  { id: "neogeo", name: "Neo Geo AES", shortName: "AES", brand: "SNK", generation: 4, mediaTypes: ["cartridge"] },
  { id: "pc", name: "PC", shortName: "PC", brand: "PC", mediaTypes: ["disc", "code_in_box", "digital"] },
];

// [titre canonique, franchise, alias...]
type SeedGame = [string, string | null, ...string[]];

const GAMES_3DS: SeedGame[] = [
  ["Animal Crossing: New Leaf - Welcome amiibo", "Animal Crossing"],
  ["Captain Toad: Treasure Tracker", "Super Mario"],
  ["Cars 2", "Cars"],
  ["Détective Pikachu", "Pokémon", "Detective Pikachu"],
  ["Disney Magical World 2", "Disney"],
  ["Donkey Kong Country Returns 3D", "Donkey Kong"],
  ["Dragon Ball Fusions", "Dragon Ball"],
  ["Dragon Ball Z: Extreme Butoden", "Dragon Ball"],
  ["Dragon Quest VII : La Quête des vestiges du monde", "Dragon Quest", "Dragon Quest VII: Fragments of the Forgotten Past", "DQ VII", "DQ7"],
  ["Dragons 2", "Dragons", "How to Train Your Dragon 2"],
  ["Ever Oasis", null],
  ["Farming Simulator 18", "Farming Simulator"],
  ["Fire Emblem Echoes: Shadows of Valentia", "Fire Emblem"],
  ["Fire Emblem Fates: Conquête", "Fire Emblem", "Fire Emblem Fates: Conquest"],
  ["Fire Emblem Warriors", "Fire Emblem"],
  ["Fossil Fighters: Frontier", "Fossil Fighters"],
  ["Kirby Battle Royale", "Kirby"],
  ["Kirby Planet Robobot", "Kirby"],
  ["Kirby Triple Deluxe", "Kirby"],
  ["LBX: Little Battlers eXperience", null, "Little Battlers Experience", "Danball Senki"],
  ["LEGO Batman 3 : Au-delà de Gotham", "LEGO", "LEGO Batman 3: Beyond Gotham"],
  ["LEGO City Undercover: The Chase Begins", "LEGO"],
  ["LEGO Chima : Le Voyage de Laval", "LEGO", "LEGO Legends of Chima: Laval's Journey"],
  ["LEGO Le Hobbit", "LEGO", "LEGO The Hobbit"],
  ["LEGO Le Seigneur des Anneaux", "LEGO", "LEGO The Lord of the Rings"],
  ["LEGO Marvel Super Heroes : L'Univers en péril", "LEGO", "LEGO Marvel Super Heroes: Universe in Peril"],
  ["LEGO Ninjago : L'Ombre de Ronin", "LEGO", "LEGO Ninjago: Shadow of Ronin"],
  ["LEGO Ninjago : Nindroids", "LEGO", "LEGO Ninjago: Nindroids"],
  ["LEGO Star Wars III", "LEGO", "LEGO Star Wars III: The Clone Wars"],
  ["LEGO Star Wars : Le Réveil de la Force", "LEGO", "LEGO Star Wars: The Force Awakens"],
  ["La Grande Aventure LEGO : Le Jeu Vidéo", "LEGO", "The LEGO Movie Videogame"],
  ["Luigi's Mansion", "Luigi's Mansion"],
  ["Luigi's Mansion 2", "Luigi's Mansion", "Luigi's Mansion: Dark Moon"],
  ["Mario & Luigi: Dream Team Bros.", "Mario & Luigi", "Mario & Luigi: Dream Team"],
  ["Mario & Luigi: Paper Jam Bros.", "Mario & Luigi", "Mario & Luigi: Paper Jam"],
  ["Mario & Luigi: Superstar Saga + Les Sbires de Bowser", "Mario & Luigi", "Mario & Luigi: Superstar Saga + Bowser's Minions"],
  ["Mario Kart 7", "Mario Kart"],
  ["Mario Party: Island Tour", "Mario Party"],
  ["Mario Party: Star Rush", "Mario Party"],
  ["Mario & Sonic aux Jeux Olympiques de Londres 2012", "Mario & Sonic", "Mario & Sonic at the London 2012 Olympic Games"],
  ["Mario Tennis Open", "Mario Tennis"],
  ["Miitopia", "Mii"],
  ["Monster Hunter 3 Ultimate", "Monster Hunter"],
  ["Monster Hunter Generations", "Monster Hunter"],
  ["New Super Mario Bros. 2", "Super Mario"],
  ["Nintendogs + Cats", "Nintendogs"],
  ["Paper Mario: Sticker Star", "Paper Mario"],
  ["Planes", "Disney"],
  ["Pokémon Donjon Mystère : Les Portes de l'Infini", "Pokémon", "Pokémon Mystery Dungeon: Gates to Infinity"],
  ["Pokémon Méga Donjon Mystère", "Pokémon", "Pokémon Super Mystery Dungeon"],
  ["Pokémon Rumble World", "Pokémon"],
  ["Pokémon Rubis Oméga", "Pokémon", "Pokémon Omega Ruby"],
  ["Pokémon Saphir Alpha", "Pokémon", "Pokémon Alpha Sapphire"],
  ["Pokémon Soleil", "Pokémon", "Pokémon Sun"],
  ["Pokémon Ultra-Soleil", "Pokémon", "Pokémon Ultra Sun"],
  ["Pokémon Lune", "Pokémon", "Pokémon Moon"],
  ["Pokémon Ultra-Lune", "Pokémon", "Pokémon Ultra Moon"],
  ["Pokémon X", "Pokémon"],
  ["Pokémon Y", "Pokémon"],
  ["Super Pokémon Rumble", "Pokémon", "Pokémon Rumble Blast"],
  ["Rayman + Les Lapins Crétins : Pack Famille", "Rayman", "Rayman and Rabbids Family Pack"],
  ["Sonic Boom : Le Cristal Brisé", "Sonic", "Sonic Boom: Shattered Crystal"],
  ["Star Fox 64 3D", "Star Fox", "Lylat Wars"],
  ["Super Mario 3D Land", "Super Mario"],
  ["Super Mario Maker for Nintendo 3DS", "Super Mario", "Mario Maker"],
  ["Super Smash Bros. for Nintendo 3DS", "Super Smash Bros.", "Smash 3DS"],
  ["The Legend of Zelda: A Link Between Worlds", "The Legend of Zelda", "Zelda ALBW"],
  ["The Legend of Zelda: Ocarina of Time 3D", "The Legend of Zelda", "Zelda OoT 3D"],
  ["The Legend of Zelda: Tri Force Heroes", "The Legend of Zelda"],
  ["WRC", "WRC", "WRC: FIA World Rally Championship"],
  ["Yo-kai Watch 2 : Esprits Farceurs", "Yo-kai Watch", "Yo-kai Watch 2: Bony Spirits"],
  ["Yo-kai Watch 2 : Fantômes Bouffis", "Yo-kai Watch", "Yo-kai Watch 2: Fleshy Souls"],
  ["Yo-kai Watch Blasters : L'Escadron du Chien Blanc", "Yo-kai Watch", "Yo-kai Watch Blasters: White Dog Squad"],
  ["Yoshi's New Island", "Yoshi"],
];

const GAMES_DS: SeedGame[] = [
  ["Arthur et les Minimoys", null, "Arthur and the Invisibles"],
  ["Astérix & Obélix XXL 2 : Mission Wifix", "Astérix", "Asterix & Obelix XXL 2: Mission Wifix"],
  ["Bien-être du visage", null, "Face Training"],
  ["Bratz: Forever Diamondz", "Bratz"],
  ["Cars", "Cars"],
  ["Cars Race-O-Rama", "Cars"],
  ["Children of Mana", "Mana", "Seiken Densetsu DS"],
  ["Clochette et la Pierre de Lune", "Disney Fairies", "Tinker Bell and the Lost Treasure"],
  ["Clochette et l'Expédition Féerique", "Disney Fairies", "Tinker Bell and the Great Fairy Rescue"],
  ["Dance Floor", null],
  ["Dora Cuisine", "Dora l'exploratrice", "Dora's Cooking Club"],
  ["Dora et Sauvons les animaux", "Dora l'exploratrice", "Dora Saves the Snow Princess"],
  ["Dragon Ball Z: Supersonic Warriors 2", "Dragon Ball"],
  ["Final Fantasy III", "Final Fantasy", "FF3", "FFIII"],
  ["Final Fantasy Crystal Chronicles: Echoes of Time", "Final Fantasy"],
  ["Final Fantasy Tactics A2", "Final Fantasy", "Final Fantasy Tactics A2: Grimoire of the Rift"],
  ["Fort Boyard", "Fort Boyard"],
  ["GoldenEye 007", "James Bond"],
  ["High School Musical 3", "High School Musical", "High School Musical 3: Senior Year"],
  ["LEGO Batman 2 : DC Super Heroes", "LEGO", "LEGO Batman 2: DC Super Heroes"],
  ["LEGO Harry Potter : Années 1-4", "LEGO", "LEGO Harry Potter: Years 1-4"],
  ["Leçons de cuisine", null, "Cooking Guide: Can't Decide What to Eat?"],
  ["Les Chevaliers de Baphomet: Director's Cut", "Les Chevaliers de Baphomet", "Broken Sword: Shadow of the Templars - Director's Cut"],
  ["Les Rebelles de la Forêt", null, "Open Season"],
  ["Ma Pause Yoga", null, "Let's Yoga"],
  ["Mario & Luigi : Voyage au centre de Bowser", "Mario & Luigi", "Mario & Luigi: Bowser's Inside Story"],
  ["Mario vs. Donkey Kong 2 : La Marche des Mini", "Mario vs. Donkey Kong", "Mario vs. Donkey Kong 2: March of the Minis"],
  ["Mission Safari", null],
  ["Nancy Drew: The Deadly Secret of Olde World Park", "Nancy Drew"],
  ["Plus Belle la Vie : Le Secret du Dr Livia", "Plus Belle la Vie"],
  ["Pokémon Version Argent SoulSilver", "Pokémon", "Pokémon SoulSilver Version", "Pokémon SoulSilver"],
  ["Pokémon Version Blanche", "Pokémon", "Pokémon White Version", "Pokémon White"],
  ["Pokémon Version Diamant", "Pokémon", "Pokémon Diamond Version", "Pokémon Diamond"],
  ["Pokémon Version Noire", "Pokémon", "Pokémon Black Version", "Pokémon Black"],
  ["Pokémon Version Noire 2", "Pokémon", "Pokémon Black Version 2", "Pokémon Black 2"],
  ["Pokémon Version Or HeartGold", "Pokémon", "Pokémon HeartGold Version", "Pokémon HeartGold"],
  ["Pokémon Version Perle", "Pokémon", "Pokémon Pearl Version", "Pokémon Pearl"],
  ["Pokémon Version Platine", "Pokémon", "Pokémon Platinum Version", "Pokémon Platinum"],
  ["Pokémon Donjon Mystère : Équipe de Secours Bleue", "Pokémon", "Pokémon Mystery Dungeon: Blue Rescue Team"],
  ["Pokémon Donjon Mystère : Explorateurs de l'Ombre", "Pokémon", "Pokémon Mystery Dungeon: Explorers of Darkness"],
  ["Pokémon Donjon Mystère : Explorateurs du Temps", "Pokémon", "Pokémon Mystery Dungeon: Explorers of Time"],
  ["Pokémon Link!", "Pokémon", "Pokémon Trozei!"],
  ["Pokémon Ranger", "Pokémon"],
  ["Populous DS", "Populous"],
  ["Programme d'entraînement cérébral", null, "Dr Kawashima's Brain Training", "Brain Age"],
  ["Professeur Layton et l'Étrange Village", "Professeur Layton", "Professor Layton and the Curious Village"],
  ["Runaway: A Twist of Fate", "Runaway"],
  ["Runaway: The Dream of the Turtle", "Runaway"],
  ["SimCity DS", "SimCity"],
  ["Sonic Chronicles : La Confrérie des Ténèbres", "Sonic", "Sonic Chronicles: The Dark Brotherhood"],
  ["Spyro: Shadow Legacy", "Spyro"],
  ["Star Wars: The Clone Wars - L'Alliance Jedi", "Star Wars", "Star Wars: The Clone Wars - Jedi Alliance"],
  ["Super Mario 64 DS", "Super Mario"],
  ["Totally Spies! 2: Undercover", "Totally Spies"],
  ["Worms: Open Warfare", "Worms"],
  ["Worms: Open Warfare 2", "Worms"],
];

/** Section 15 : quantités à vérifier (doublons potentiels), sans fixer la quantité sans preuve. */
const QUANTITY_REVIEW_3DS = new Set(
  [
    "Luigi's Mansion 2",
    "Mario & Luigi: Dream Team Bros.",
    "Mario Party: Island Tour",
    "Nintendogs + Cats",
    "Pokémon Lune",
    "Super Pokémon Rumble",
    "Super Smash Bros. for Nintendo 3DS",
    "Yoshi's New Island",
  ].map(normalizeTitle),
);

function buildGames(list: SeedGame[], platformId: string): Game[] {
  return list.map(([title, franchise, ...aliases]) => ({
    id: gameId(platformId, title),
    kind: "game" as const,
    canonicalTitle: title,
    normalizedTitle: normalizeTitle(title),
    aliases,
    franchise,
    platformId,
    region: "PAL-FR" as const,
    languages: ["fr"],
    publisher: null,
    developer: null,
    releaseYear: null,
    genres: [],
    edition: null,
    mediaType: "cartridge" as const,
    externalIds: {},
    qualityTier: null,
    buyPriority: null,
  }));
}

function buildInventory(games: Game[]): InventoryItem[] {
  const now = new Date().toISOString();
  return games.map((g) => ({
    id: inventoryId(g.id),
    gameId: g.id,
    status: "owned" as const,
    quantity: 1,
    condition: "unknown" as const,
    completeness: "unknown" as const,
    purchasePrice: null,
    currentEstimate: null,
    verificationStatus: "needs_review" as const,
    quantityNeedsReview: g.platformId === "3ds" && QUANTITY_REVIEW_3DS.has(g.normalizedTitle),
    evidenceIds: [],
    orderId: null,
    privateNotes:
      g.platformId === "3ds" && QUANTITY_REVIEW_3DS.has(g.normalizedTitle)
        ? "Doublon possible — quantité à confirmer avec preuve (section 15 du seed)"
        : null,
    acquiredAt: null,
    createdAt: now,
    updatedAt: now,
  }));
}

function main(): void {
  const force = process.argv.includes("--force");
  const dataDir = path.join(DATA_REPO, "data");
  if (fs.existsSync(path.join(dataDir, "games.json")) && !force) {
    console.error(`Refus: ${dataDir}/games.json existe déjà (utiliser --force pour régénérer)`);
    process.exit(1);
  }
  fs.mkdirSync(dataDir, { recursive: true });

  const games = [...buildGames(GAMES_3DS, "3ds"), ...buildGames(GAMES_DS, "ds")];
  const inventory = buildInventory(games);

  // garde-fou anti-doublon dans le seed lui-même
  const ids = new Set<string>();
  for (const g of games) {
    if (ids.has(g.id)) throw new Error(`Seed corrompu — id dupliqué: ${g.id}`);
    ids.add(g.id);
  }

  const changeLog = [
    {
      id: `chg_seed_${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      actor: "agent",
      command: "seed",
      message: `Seed initial: ${GAMES_3DS.length} jeux 3DS + ${GAMES_DS.length} jeux DS, tous en needs_review, ${QUANTITY_REVIEW_3DS.size} quantités à vérifier`,
      affected: [
        { file: "games.json", ids: [] },
        { file: "inventory.json", ids: [] },
      ],
    },
  ];

  const publishConfig = {
    publish: {
      purchase_price: false,
      seller_name: false,
      order_reference: false,
      private_notes: false,
      acquisition_date: true,
      condition: true,
      ownership_status: true,
      estimates: true,
      marketplace: true,
    },
  };

  const files: [string, unknown, { parse: (x: unknown) => unknown }][] = [
    ["games.json", games, GamesFileSchema],
    ["inventory.json", inventory, InventoryFileSchema],
    ["orders.json", [], { parse: (x) => x }],
    ["platforms.json", PLATFORMS, PlatformsFileSchema],
    ["sellers.json", [], { parse: (x) => x }],
    ["listings.json", [], { parse: (x) => x }],
    ["price-observations.json", [], { parse: (x) => x }],
    ["evidence.json", [], { parse: (x) => x }],
    ["change-log.json", changeLog, ChangeLogFileSchema],
  ];
  for (const [name, content, schema] of files) {
    schema.parse(content); // validation avant écriture
    fs.writeFileSync(path.join(dataDir, name), JSON.stringify(content, null, 2) + "\n", "utf8");
  }
  PublishConfigSchema.parse(publishConfig);
  fs.writeFileSync(path.join(DATA_REPO, "publish.config.json"), JSON.stringify(publishConfig, null, 2) + "\n", "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        dataRepo: DATA_REPO,
        games: games.length,
        g3ds: GAMES_3DS.length,
        ds: GAMES_DS.length,
        inventory: inventory.length,
        quantityNeedsReview: inventory.filter((i) => i.quantityNeedsReview).length,
      },
      null,
      2,
    ),
  );
}

main();
