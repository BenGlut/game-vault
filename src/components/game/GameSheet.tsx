"use client";

import { useState } from "react";
import { BUY_PRIORITIES, QUALITY_TIERS, type Game, type Platform } from "@/lib/schema";
import { normalizeTitle } from "@/lib/normalize";
import { Field, Select, inputClass } from "@/components/ui/fields";
import { Badge, Button } from "@/components/ui/primitives";
import { PencilIcon } from "@/components/icons";
import { useVault } from "@/components/vault/VaultProvider";

const MEDIA_LABELS: Record<string, string> = {
  cartridge: "Cartouche",
  disc: "Disque",
  card: "Carte de jeu",
  code_in_box: "Code dans la boîte",
  digital: "Dématérialisé",
  other: "Autre",
};

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
      ["Support", MEDIA_LABELS[game.mediaType] ?? game.mediaType],
    ];
    return (
      <div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-border bg-surface p-3.5 text-[13px]">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[11px] font-medium text-muted">{label}</dt>
              <dd className="mt-0.5 truncate text-text">{value}</dd>
            </div>
          ))}
        </dl>
        {game.aliases.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {game.aliases.map((a) => (
              <Badge key={a}>{a}</Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <code className="truncate font-mono text-[11px] text-muted">{game.id}</code>
          <Button
            size="sm"
            variant="ghost"
            icon={<PencilIcon size={12} />}
            onClick={() => {
              setDraft(game);
              setAliasText(game.aliases.join(", "));
              setEditing(true);
            }}
          >
            Modifier la fiche
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent/40 bg-surface p-3.5 shadow-[var(--shadow-card)]">
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
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={() => setEditing(false)}>Annuler</Button>
        <Button variant="primary" disabled={!dirty || busy} onClick={save}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
