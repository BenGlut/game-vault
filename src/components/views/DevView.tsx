"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import BrandLogo from "@/components/BrandLogos";
import BarList from "@/components/charts/BarList";
import { SERIES, intFmt } from "@/components/charts/core";
import { Card, PageHeader, StatTile } from "@/components/ui/primitives";
import { useVault } from "@/components/vault/VaultProvider";

/** Fiche figée au déploiement (scripts/cloudflare/dev-info.ts). */
interface DevInfo {
  generatedAt: string;
  version: string;
  git: { commit: string; branch: string; commits: number; lastCommitAt: string; dataCommits: number };
  runtime: { node: string; pnpm: string };
  packages: Record<string, string>;
  scripts: Record<string, string>;
  code: { label: string; dir: string; files: number; lines: number; bytes: number }[];
  tests: { unit: number; e2e: number };
  data: { file: string; records: number; bytes: number }[];
  backups: number;
  catalog: { platform: string; entries: number; withSource: number; bytes: number }[];
  assets: { covers: { files: number; bytes: number; withHiResSource: number }; catalogCovers: { files: number; bytes: number } };
  build: { files: number; bytes: number; js: { files: number; bytes: number }; css: { files: number; bytes: number }; pages: number };
  cloudflare: {
    d1: { database_size?: number; num_tables?: number; running_in_region?: string; read_queries_24h?: number; write_queries_24h?: number; rows_read_24h?: number; rows_written_24h?: number; created_at?: string } | null;
    pagesDeployments: number;
  };
}

/** Mesures en direct de la base (functions/api/dev.ts). */
interface LiveDb {
  measuredAt: string;
  queryMs: number;
  tables: { name: string; rows: number; bytes: number }[];
  sqlite: string | null;
  lastChangeAt: string | null;
  webChanges: number;
}

const CLOUDFLARE_ACCOUNT = "414718ea9d832e611be62297b420ef0b";
const D1_ID = "1bd499bb-c542-474e-92fc-e32705bd044d";

/** Plafonds de l'offre gratuite Cloudflare (Workers Free, octobre 2026). */
const FREE = {
  d1Storage: 5 * 1024 ** 3,
  rowsReadPerDay: 5_000_000,
  rowsWrittenPerDay: 100_000,
  functionRequestsPerDay: 100_000,
  filesPerDeployment: 20_000,
};

function bytes(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 ** 2) return `${(n / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Ko`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
  return `${(n / 1024 ** 3).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Go`;
}

const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STACK: { brand: string; name: string; pkg?: string; role: string }[] = [
  { brand: "nextjs", name: "Next.js", pkg: "next", role: "Pages exportées en statique, routage, build" },
  { brand: "react", name: "React", pkg: "react", role: "Interface, état de l'application" },
  { brand: "typescript", name: "TypeScript", pkg: "typescript", role: "Typage strict de tout le code" },
  { brand: "tailwind", name: "Tailwind CSS", pkg: "tailwindcss", role: "Styles, thème sombre, responsive" },
  { brand: "zod", name: "Zod", pkg: "zod", role: "Schémas : validation CLI et API (source unique)" },
  { brand: "cloudflare", name: "Cloudflare Pages", pkg: "wrangler", role: "Hébergement, Functions (API), déploiement" },
  { brand: "sqlite", name: "Cloudflare D1", role: "Base SQLite en ligne (une table par fichier JSON)" },
  { brand: "google", name: "Google Identity", role: "Connexion, un seul compte autorisé" },
  { brand: "vitest", name: "Vitest", pkg: "vitest", role: "Tests unitaires" },
  { brand: "playwright", name: "Playwright", pkg: "@playwright/test", role: "Tests de bout en bout (API simulée)" },
  { brand: "pnpm", name: "pnpm", role: "Gestionnaire de paquets (npm et npx interdits)" },
  { brand: "github", name: "GitHub", role: "2 dépôts, CI, Pages pour les jaquettes du catalogue" },
];

const ROUTES: [string, string][] = [
  ["/", "Tableau de bord"],
  ["/statistiques", "Courbes et répartitions"],
  ["/collection", "Collection (grille ou liste)"],
  ["/wishlist", "Jeux à trouver"],
  ["/catalogue", "Catalogue de référence (35 000 jeux)"],
  ["/commandes", "Suivi des achats"],
  ["/estimateur", "Bon plan ou pas"],
  ["/historique", "Journal des modifications"],
  ["/jeu/?id=…", "Fiche d'un jeu en pleine page"],
  ["/dev", "Cette page"],
  ["/connexion/", "Connexion Google (seule page publique)"],
];

const API: [string, string, string][] = [
  ["GET", "/api/vault", "Toute la base en une requête (chargement de l'application)"],
  ["GET POST", "/api/<collection>", "Lister / créer (games, inventory, orders, platforms, sellers, listings, price-observations, evidence)"],
  ["GET PUT DELETE", "/api/<collection>/<id>", "Lire / remplacer / supprimer un enregistrement"],
  ["POST", "/api/order-transition/<id>", "Expédiée, reçue, annulée, remboursée (commande + exemplaires)"],
  ["GET", "/api/change-log", "200 dernières modifications"],
  ["GET", "/api/dev", "Mesures de la base pour cette page"],
  ["POST", "/api/auth/login · logout", "Ouverture / fermeture de session"],
  ["GET", "/api/auth/config · me", "Identifiant client Google · compte connecté"],
];

const CLI: [string, string][] = [
  ["pnpm vault <commande>", "CLI de l'agent : add-game, add-inventory, add-order, deliver-order, inspect, validate, publish…"],
  ["pnpm d1 pull", "Rapatrie dans le repo JSON les modifications faites en ligne (avant toute commande vault)"],
  ["pnpm d1 push", "Envoie le repo JSON dans D1 (refuse s'il reste des modifications en ligne non rapatriées)"],
  ["pnpm deploy:cf", "Sources des jaquettes → build → fiche technique → déploiement Cloudflare"],
  ["pnpm test · pnpm e2e", "Tests unitaires · tests de bout en bout"],
  ["pnpm lint · pnpm typecheck", "Qualité du code"],
  ["pnpm exec wrangler pages dev out", "Application + API + base D1 locale sur localhost:8788"],
];

function Meter({ label, used, limit, format, note }: { label: string; used: number | null; limit: number; format: (n: number) => string; note?: string }) {
  const pct = used === null ? 0 : Math.min(100, (used / limit) * 100);
  const tone = pct > 80 ? "bg-ko" : pct > 50 ? "bg-accent" : "bg-ok";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted">
          {used === null ? "inconnu" : format(used)} / {format(limit)}
          <span className="ml-1.5 text-xs">({pct < 0.01 && used ? "< 0,01" : pct.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-2">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(used ? 0.8 : 0, pct)}%` }} />
      </div>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-text">{children}</code>;
}

export default function DevView() {
  const { data } = useVault();
  const [info, setInfo] = useState<DevInfo | null>(null);
  const [live, setLive] = useState<LiveDb | null>(null);
  const [infoMissing, setInfoMissing] = useState(false);
  const [network, setNetwork] = useState<{ vaultBytes: number; vaultMs: number; jsBytes: number } | null>(null);

  useEffect(() => {
    fetch("/dev-info.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setInfo, () => setInfoMissing(true));
    fetch("/api/dev", { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setLive, () => undefined);
    // ce que le navigateur a réellement téléchargé pour cette session
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const vault = entries.find((e) => e.name.endsWith("/api/vault"));
    const js = entries.filter((e) => e.name.includes("/_next/static/") && e.name.endsWith(".js"));
    setNetwork({
      vaultBytes: vault?.encodedBodySize || vault?.transferSize || 0,
      vaultMs: vault ? Math.round(vault.duration) : 0,
      jsBytes: js.reduce((s, e) => s + (e.encodedBodySize || e.transferSize || 0), 0),
    });
  }, []);

  const liveRows = live?.tables.reduce((s, t) => s + Number(t.rows), 0) ?? null;
  const liveBytes = live?.tables.reduce((s, t) => s + Number(t.bytes), 0) ?? null;
  const d1 = info?.cloudflare.d1;
  const totalLines = info?.code.reduce((s, c) => s + c.lines, 0) ?? 0;
  const vaultJsonBytes = useMemo(() => new Blob([JSON.stringify(data)]).size, [data]);

  return (
    <div className="animate-page space-y-6">
      <PageHeader
        title="</> Dev"
        subtitle="La fiche technique du projet : architecture, stack, données, consommation et points d’entrée"
        actions={
          info ? (
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
              v{info.version} · <span className="font-mono">{info.git.commit}</span> · déployé le {dateTime(info.generatedAt)}
            </span>
          ) : null
        }
      />

      {infoMissing ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Fiche de déploiement absente (build local) : seules les mesures en direct sont affichées. Elle est produite par <Mono>pnpm deploy:cf</Mono>.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Base D1" value={bytes(d1?.database_size)} detail={`${intFmt.format(liveRows ?? 0)} lignes · région ${d1?.running_in_region ?? "—"}`} />
        <StatTile
          label="Lectures en base (24 h)"
          value={intFmt.format(d1?.rows_read_24h ?? 0)}
          detail={`${intFmt.format(d1?.read_queries_24h ?? 0)} requêtes · ${intFmt.format(d1?.rows_written_24h ?? 0)} lignes écrites`}
        />
        <StatTile label="Site déployé" value={bytes(info?.build.bytes)} detail={`${intFmt.format(info?.build.files ?? 0)} fichiers · JS ${bytes(info?.build.js.bytes)}`} />
        <StatTile label="Code" value={`${intFmt.format(totalLines)} lignes`} detail={`${info?.tests.unit ?? "—"} tests unitaires · ${info?.tests.e2e ?? "—"} e2e`} />
      </div>

      <Card title="Architecture" subtitle="Qui parle à qui">
        <div className="grid gap-3 text-sm md:grid-cols-3">
          {[
            {
              title: "Navigateur",
              lines: ["Application Next.js exportée en statique", "Charge toute la base une fois (/api/vault)", "Calcule les statistiques localement"],
              logos: ["nextjs", "react"],
            },
            {
              title: "Cloudflare Pages",
              lines: ["Sert les pages et les jaquettes", "Functions : API + contrôle de session sur chaque requête", "Écritures validées par Zod, journalisées"],
              logos: ["cloudflare"],
            },
            {
              title: "Cloudflare D1",
              lines: ["SQLite en Europe de l’Ouest", "1 table par fichier JSON, enregistrement en JSON", "Colonnes indexées générées (jeu, statut, date)"],
              logos: ["sqlite"],
            },
            {
              title: "Agent (CLI sur le Mac)",
              lines: ["pnpm vault : seul point de mutation de l’agent", "Repo JSON privé = source de vérité", "pnpm d1 pull / push pour synchroniser"],
              logos: ["claude", "pnpm"],
            },
            {
              title: "GitHub",
              lines: ["benglut/game-vault (code, public)", "benglut/game-vault-data (données, privé)", "Pages : 35 000 jaquettes du catalogue"],
              logos: ["github"],
            },
            {
              title: "Services externes",
              lines: ["Google Identity : connexion", "wsrv.nl : jaquettes redimensionnées à la volée", "libretro, eShop Nintendo : images d’origine"],
              logos: ["google"],
            },
          ].map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-bg-elev p-4">
              <div className="mb-2 flex items-center gap-2">
                {b.logos.map((l) => (
                  <BrandLogo key={l} brand={l} size={18} />
                ))}
                <span className="font-semibold">{b.title}</span>
              </div>
              <ul className="space-y-1 text-xs text-muted">
                {b.lines.map((l) => (
                  <li key={l}>· {l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Stack technique" subtitle={info ? `Node ${info.runtime.node} · pnpm ${info.runtime.pnpm}` : undefined}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s) => (
            <div key={s.name} className="flex items-start gap-3 rounded-xl border border-border bg-bg-elev p-3">
              <span className="mt-0.5 shrink-0">
                <BrandLogo brand={s.brand} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {s.name}
                  {s.pkg && info?.packages[s.pkg] ? <span className="ml-1.5 font-mono text-xs text-muted">{info.packages[s.pkg]}</span> : null}
                </span>
                <span className="block text-xs text-muted">{s.role}</span>
              </span>
            </div>
          ))}
        </div>
        {info ? (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted hover:text-text">Toutes les dépendances ({Object.keys(info.packages).length})</summary>
            <div className="mt-2 grid gap-x-6 gap-y-1 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(info.packages).map(([name, version]) => (
                <div key={name} className="flex justify-between gap-3 border-b border-border/60 py-1">
                  <span className="truncate">{name}</span>
                  <span className="text-muted">{version}</span>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Consommation et quotas" subtitle="Offre gratuite Cloudflare · relevé au dernier déploiement">
          <div className="space-y-4">
            <Meter label="Stockage D1" used={d1?.database_size ?? null} limit={FREE.d1Storage} format={bytes} />
            <Meter
              label="Lignes lues (24 h)"
              used={d1?.rows_read_24h ?? null}
              limit={FREE.rowsReadPerDay}
              format={(n) => intFmt.format(n)}
              note="Un chargement complet de l’application lit environ toute la base une fois."
            />
            <Meter label="Lignes écrites (24 h)" used={d1?.rows_written_24h ?? null} limit={FREE.rowsWrittenPerDay} format={(n) => intFmt.format(n)} />
            <Meter
              label="Fichiers du dernier déploiement"
              used={info?.build.files ?? null}
              limit={FREE.filesPerDeployment}
              format={(n) => intFmt.format(n)}
              note="Les 35 000 jaquettes du catalogue sont servies par GitHub Pages pour rester sous le plafond."
            />
            <p className="text-xs text-muted">
              Requêtes aux Functions : {intFmt.format(FREE.functionRequestsPerDay)} par jour offertes (chaque page, fichier et appel d’API passe par le
              contrôle de session). {info ? `${info.cloudflare.pagesDeployments} déploiements Pages à ce jour.` : ""}
            </p>
          </div>
        </Card>

        <Card title="Dans ce navigateur" subtitle="Ce que cette session a réellement téléchargé">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Base chargée (/api/vault)", network ? `${bytes(network.vaultBytes)} compressés` : "—"],
              ["Temps de chargement", network?.vaultMs ? `${network.vaultMs} ms` : "—"],
              ["Base en mémoire", bytes(vaultJsonBytes)],
              ["JavaScript chargé", network ? bytes(network.jsBytes) : "—"],
              ["Requête de mesure D1", live ? `${live.queryMs} ms` : "—"],
              ["Tables en base", live ? String(live.tables.length) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-bg-elev p-3">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-0.5 font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Dernière écriture en base : {dateTime(live?.lastChangeAt)} · {intFmt.format(Number(live?.webChanges ?? 0))} modifications faites en ligne
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Base D1, en direct" subtitle={live ? `Mesuré le ${dateTime(live.measuredAt)}` : "Mesure en cours…"}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">Table</th>
                <th className="pb-2 text-right font-medium">Lignes</th>
                <th className="pb-2 text-right font-medium">Données</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(live?.tables ?? []).map((t) => (
                <tr key={t.name}>
                  <td className="py-1.5 font-mono text-xs">{t.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{intFmt.format(Number(t.rows))}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted">{bytes(Number(t.bytes))}</td>
                </tr>
              ))}
              {live ? (
                <tr className="font-medium">
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right tabular-nums">{intFmt.format(liveRows ?? 0)}</td>
                  <td className="pt-2 text-right tabular-nums">{bytes(liveBytes)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card title="Repo de données (JSON privé)" subtitle={info ? `${info.git.dataCommits} commits · ${info.backups} sauvegardes locales` : undefined}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">Fichier</th>
                <th className="pb-2 text-right font-medium">Enregistrements</th>
                <th className="pb-2 text-right font-medium">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(info?.data ?? []).map((d) => (
                <tr key={d.file}>
                  <td className="py-1.5 font-mono text-xs">{d.file}</td>
                  <td className="py-1.5 text-right tabular-nums">{intFmt.format(d.records)}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted">{bytes(d.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Code par zone" subtitle={info ? `${intFmt.format(info.git.commits)} commits · dernier le ${dateTime(info.git.lastCommitAt)}` : undefined}>
          <BarList
            color={SERIES[6]}
            items={(info?.code ?? []).map((c) => ({
              key: c.dir,
              label: c.label,
              value: c.lines,
              display: `${intFmt.format(c.lines)} lignes · ${c.files} fichiers`,
            }))}
          />
        </Card>
        <Card title="Images et catalogue">
          <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-bg-elev p-3">
              <dt className="text-xs text-muted">Jaquettes de la collection</dt>
              <dd className="mt-0.5 font-medium">
                {intFmt.format(info?.assets.covers.files ?? 0)} · {bytes(info?.assets.covers.bytes)}
              </dd>
              <dd className="text-xs text-muted">{intFmt.format(info?.assets.covers.withHiResSource ?? 0)} avec original haute résolution</dd>
            </div>
            <div className="rounded-xl border border-border bg-bg-elev p-3">
              <dt className="text-xs text-muted">Copies locales du catalogue</dt>
              <dd className="mt-0.5 font-medium">
                {intFmt.format(info?.assets.catalogCovers.files ?? 0)} · {bytes(info?.assets.catalogCovers.bytes)}
              </dd>
              <dd className="text-xs text-muted">repli 160 px, servies par GitHub Pages</dd>
            </div>
          </dl>
          <BarList
            color={SERIES[0]}
            items={(info?.catalog ?? [])
              .sort((a, b) => b.entries - a.entries)
              .map((c) => ({
                key: c.platform,
                label: c.platform,
                value: c.entries,
                display: `${intFmt.format(c.entries)} jeux · ${bytes(c.bytes)}`,
              }))}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Points d’entrée : pages">
          <ul className="divide-y divide-border text-sm">
            {ROUTES.map(([route, what]) => (
              <li key={route} className="flex items-center justify-between gap-3 py-1.5">
                <Mono>{route}</Mono>
                <span className="text-right text-xs text-muted">{what}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Points d’entrée : API" subtitle="Toutes derrière la session Google ; écritures avec l’en-tête x-gv-request">
          <ul className="divide-y divide-border text-sm">
            {API.map(([method, route, what]) => (
              <li key={route} className="py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-info/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-info">{method}</span>
                  <Mono>{route}</Mono>
                </div>
                <p className="mt-1 text-xs text-muted">{what}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Commandes utiles" subtitle="Depuis la racine du repo game-vault">
          <ul className="space-y-2.5 text-sm">
            {CLI.map(([cmd, what]) => (
              <li key={cmd}>
                <Mono>{cmd}</Mono>
                <p className="mt-1 text-xs text-muted">{what}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Sécurité, secrets et accès">
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">Connexion</span>
              <span className="text-muted"> : jeton Google vérifié côté serveur, cookie de session signé (HMAC, 30 jours), une seule adresse autorisée.</span>
            </li>
            <li>
              <span className="font-medium">Secrets Cloudflare</span> <Mono>ALLOWED_EMAIL</Mono> <Mono>SESSION_SECRET</Mono>
              <span className="text-muted"> (jamais dans le code) ; variable publique </span>
              <Mono>GOOGLE_CLIENT_ID</Mono>
            </li>
            <li>
              <span className="font-medium">Écritures</span>
              <span className="text-muted"> : validées par les schémas Zod, références contrôlées, journal dans le même lot que la modification.</span>
            </li>
            <li>
              <span className="font-medium">Règles de l’agent</span>
              <span className="text-muted"> : </span>
              <Mono>CLAUDE.md</Mono>
              <span className="text-muted"> à la racine du repo (contrat complet, à lire en premier).</span>
            </li>
          </ul>
          <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">Consoles d’administration</h3>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ["cloudflare", "Cloudflare Pages", `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT}/workers-and-pages`],
              ["cloudflare", "Base D1", `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT}/workers/d1/databases/${D1_ID}`],
              ["google", "Client OAuth Google", "https://console.cloud.google.com/auth/clients?project=gamevault-511106"],
              ["github", "Code (public)", "https://github.com/BenGlut/game-vault"],
              ["github", "Données (privé)", "https://github.com/BenGlut/game-vault-data"],
              ["github", "CI GitHub Actions", "https://github.com/BenGlut/game-vault/actions"],
            ].map(([brand, label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-bg-elev px-3 py-2 transition hover:border-accent/50 hover:text-accent"
                >
                  <BrandLogo brand={brand!} size={16} />
                  {label} ↗
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
