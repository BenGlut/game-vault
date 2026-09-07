/**
 * Relevé de marché Vinted France — À COLLER TEL QUEL dans javascript_tool,
 * depuis un onglet Vinted authentifié. Ne jamais réécrire la requête à la main.
 *
 * Raison d'être : le 2026-09-07, un comptage brut tapé à la volée a annoncé
 * « 22 exemplaires entre 10 et 15 € » à une vendeuse. La vérité était 11
 * exemplaires et une médiane à 22 € — l'échantillon contenait des boîtiers
 * vides, des notices et des inserts. Elle a vérifié, refusé, et bloqué benglut.
 *
 * Le filtre naïf écrit dans la foulée (« exclure tout titre contenant boîte »)
 * s'est révélé faux dans l'autre sens : il jetait « jeu + boîte + notice »,
 * c'est-à-dire précisément les exemplaires complets. D'où les trois tests
 * ci-dessous, qui séparent « la boîte est le produit » de « la boîte est
 * mentionnée comme accessoire du jeu ».
 *
 * Usage :
 *   releve([["cs2", "tamagotchi corner shop 2", /corner shop 2/i]])
 */

/** Le produit est un accessoire (le jeu n'est PAS dedans). */
const ACCESSOIRE =
  /\b(notice|mode d.emploi|bo[iî]t(e|ier)s?|scatola|custodia|inserto|foglietto|locandina|poster|sticker|soundtrack|artbook|jaquette|coque|manual|carte vip|code vip|pi[eè]ce sos)\b/i;

/** Le titre affirme que le jeu est là. Annule ACCESSOIRE : « jeu + boîte + notice ». */
const CONTENU = /\b(jeux?|gioco|giochi|game|juego|complet|completo|complete|cib)\b/i;

/** Vendu explicitement vide ou seul — aucune annulation possible. */
const VIDE = /\b(vide|vuota|empty|sans (le )?jeu|seule?s?|uniquement la)\b/i;

/** Cartouche nue : marché distinct de l'exemplaire en boîte. */
const LOOSE = /\b(cartouche|cartuccia|loose|sans bo[iî]t\w*|disque seul)\b/i;
const LOOSE_ANNULE = /\bcomplet\w*|cib|avec (sa )?bo[iî]te\b/i;

/** Neuf scellé : marché distinct de l'occasion, jamais mélangé. */
const SCELLE = /\b(scell\w*|sigillat\w*|precintad\w*|sealed|blister|neuf sous|nuovo|selado|nieuw)\b/i;

/** @returns {"accessoire"|"loose"|"scelle"|null} la raison d'écarter, ou null. */
function ecarter(t) {
  if (VIDE.test(t)) return "accessoire";
  if (ACCESSOIRE.test(t) && !CONTENU.test(t)) return "accessoire";
  if (LOOSE.test(t) && !LOOSE_ANNULE.test(t)) return "loose";
  if (SCELLE.test(t)) return "scelle";
  return null;
}

async function csrf() {
  const html = await fetch(location.href).then((r) => r.text());
  return {
    "X-Csrf-Token": html.match(/CSRF_TOKEN\\?":\\?"([0-9a-f-]{36})/)?.[1],
    "X-Anon-Id": document.cookie.match(/anon_id=([^;]+)/)?.[1],
    Accept: "application/json",
  };
}

function quantile(tri, p) {
  return tri.length ? tri[Math.min(tri.length - 1, Math.floor(tri.length * p))] : null;
}

/**
 * @param {[string, string, RegExp][]} cibles  [clé, requête, regex de titre]
 *
 * Les DEUX tris sont interrogés : au-delà de 60 résultats l'API ne rend qu'une
 * page, et ne lire que `price_low_to_high` fabrique une médiane fausse — c'est
 * ce qui avait fait annoncer « gros paquet à 15 € » sur l'Appel du Spectre,
 * dont la médiane réelle est 35 €.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- point d'entrée, appelé après collage
async function releve(cibles) {
  const H = await csrf();
  const chercher = async (q, ordre) => {
    const r = await fetch(
      `/api/v2/catalog/items?search_text=${encodeURIComponent(q)}&per_page=60&order=${ordre}`,
      { headers: H },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status} — recharger un onglet /catalog puis relancer`);
    return ((await r.json()).items || []).map((i) => ({
      t: i.title.replace(/\s+/g, " "),
      p: +i.price.amount,
      u: (i.url || "").split("vinted.fr")[1],
    }));
  };

  const out = {};
  for (const [cle, q, re] of cibles) {
    const vus = new Set();
    const cible = [
      ...(await chercher(q, "price_low_to_high")),
      ...(await chercher(q, "price_high_to_low")),
    ]
      .filter((x) => re.test(x.t))
      .filter((x) => (vus.has(x.u) ? false : (vus.add(x.u), true)));

    const ecartes = { accessoire: [], loose: [], scelle: [] };
    const net = [];
    for (const x of cible) {
      const r = ecarter(x.t);
      if (r) ecartes[r].push(x);
      else net.push(x);
    }
    net.sort((a, b) => a.p - b.p);
    const prix = net.map((x) => x.p);

    out[cle] = {
      // LE SEUL chiffre citable à un vendeur : n et la fourchette q1-q3.
      n: net.length,
      min: prix[0] ?? null,
      q1: quantile(prix, 0.25),
      mediane: quantile(prix, 0.5),
      q3: quantile(prix, 0.75),
      max: prix.at(-1) ?? null,
      ecartes: Object.fromEntries(Object.entries(ecartes).map(([k, v]) => [k, v.length])),
      // À RELIRE avant de citer : si un exemplaire complet apparaît ici, le filtre
      // sur-exclut et n est sous-estimé.
      controle: Object.entries(ecartes).flatMap(([k, v]) =>
        v.slice(0, 3).map((x) => `${k} · ${x.p} € · ${x.t.slice(0, 48)}`),
      ),
      annonces: net.map((x) => `${x.p} € · ${x.t.slice(0, 48)}`),
    };
  }
  return JSON.stringify(out, null, 1);
}
