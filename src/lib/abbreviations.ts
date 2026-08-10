/**
 * Abréviations courantes de collectionneurs → mots réels des titres.
 * Utilisé par la recherche du catalogue : taper « DQM 2 » doit trouver
 * « Dragon Quest Monsters - Joker 2 ».
 */
export const ABBREVIATIONS: Record<string, string> = {
  dqm: "dragon quest monsters",
  dq: "dragon quest",
  ff: "final fantasy",
  ffta: "final fantasy tactics advance",
  smt: "shin megami tensei",
  totk: "tears of the kingdom",
  botw: "breath of the wild",
  albw: "a link between worlds",
  oot: "ocarina of time",
  mm: "majora s mask",
  lttp: "a link to the past",
  nsmb: "new super mario bros",
  smb: "super mario bros",
  sm64: "super mario 64",
  mk: "mario kart",
  ssb: "super smash bros",
  fe: "fire emblem",
  mh: "monster hunter",
  pkmn: "pokemon",
  ac: "animal crossing",
  dkc: "donkey kong country",
  tmnt: "teenage mutant ninja turtles",
  dbz: "dragon ball z",
  dbfz: "dragon ball fighterz",
  gta: "grand theft auto",
  re: "resident evil",
  ptd: "paper mario",
  twewy: "the world ends with you",
};

/** Remplace les abréviations d'une requête normalisée par leur forme longue. */
export function expandAbbreviations(query: string): string {
  return query
    .split(" ")
    .map((w) => ABBREVIATIONS[w] ?? w)
    .join(" ");
}
