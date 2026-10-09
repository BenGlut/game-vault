"use client";

import { useState } from "react";
import { BUY_PRIORITIES, QUALITY_TIERS, type Game, type Platform } from "@/lib/schema";
import { normalizeTitle } from "@/lib/normalize";
import { Button, Field, Select, inputClass } from "@/components/ui/fields";
import { useVault } from "@/components/vault/VaultProvider";

/** Fiche produit du jeu : lecture compacte, édition sur « Modifier ». */
export default function GameSheet({ game, platform }: { game: Game; platform: Platform | undefined }) {
  const { saveGame } = useVault();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Game>(game);
  const [busy, setBusy] = useState(false);
  // texte libre pendant la saisie (sinon la virgule finale disparaît à chaque frappe)
  const [aliasText, setAliasText] = useState(game.aliases.join(", "));
  const parsedAliases = aliasText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const next = { ...draft, aliases: parsedAliases };
  const dirty = JSON.stringify(next) !== JSON.stringify(game);
  const set = <K extends keyof Game>(key: K, value: Game[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function save() {
    setBusy(true);
    const ok = await saveGame(next);
    setBusy(false);
    if (ok) setEditing(false);
  }

  if (!editing) {
    const facts: [string, string][] = [
      ["Console", platform?.name ?? game.platformId],
      ["Région", game.region],
      ["Année", game.releaseYear ? String(game.releaseYear) : "—"],
      ["Franchise", game.franchise ?? "—"],
      ["Édition", game.edition ?? "—"],
      ["Priorité d’achat", game.buyPriority ?? "—"],
      ["Éditeur", game.publisher ?? "—"],
      ["Support", game.mediaType],
    ];
    return (
      <div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border bg-surface p-3 text-xs">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted">{label}</dt>
              <dd className="truncate">{value}</dd>
            </div>
          ))}
        </dl>
        {game.aliases.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {game.aliases.map((a) => (
              <span key={a} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                {a}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <code className="truncate text-[11px] text-muted/70">{game.id}</code>
          <button
            type="button"
            onClick={() => {
              setDraft(game);
              setAliasText(game.aliases.join(", "));
              setEditing(true);
            }}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-soft"
          >
            Modifier la fiche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Titre" className="col-span-2">
          <input
            className={inputClass}
            value={draft.canonicalTitle}
            onChange={(e) => setDraft((d) => ({ ...d, canonicalTitle: e.target.value, normalizedTitle: normalizeTitle(e.target.value) }))}
          />
        </Field>
        <Field label="Édition">
          <input className={inputClass} value={draft.edition ?? ""} onChange={(e) => set("edition", e.target.value || null)} />
        </Field>
        <Field label="Franchise">
          <input className={inputClass} value={draft.franchise ?? ""} onChange={(e) => set("franchise", e.target.value || null)} />
        </Field>
        <Field label="Année">
          <input
            className={inputClass}
            type="number"
            min="1970"
            max="2030"
            value={draft.releaseYear ?? ""}
            onChange={(e) => set("releaseYear", e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Qualité">
          <Select value={draft.qualityTier} options={QUALITY_TIERS} allowEmpty="Non notée" onChange={(v) => set("qualityTier", (v || null) as Game["qualityTier"])} />
        </Field>
        <Field label="Priorité d’achat">
          <Select value={draft.buyPriority} options={BUY_PRIORITIES} allowEmpty="Aucune" onChange={(v) => set("buyPriority", (v || null) as Game["buyPriority"])} />
        </Field>
        <Field label="Éditeur">
          <input className={inputClass} value={draft.publisher ?? ""} onChange={(e) => set("publisher", e.target.value || null)} />
        </Field>
        <Field label="Autres noms, séparés par des virgules" className="col-span-2">
          <input className={inputClass} value={aliasText} onChange={(e) => setAliasText(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={() => setEditing(false)}>Annuler</Button>
        <Button variant="primary" disabled={!dirty || busy} onClick={save}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
