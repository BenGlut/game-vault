"use client";

import { useState } from "react";
import { COMPLETENESS, CONDITIONS, INVENTORY_STATUSES, type InventoryItem } from "@/lib/schema";
import { COMPLETENESS_LABELS, CONDITION_LABELS, STATUS_LABELS, euro } from "@/lib/labels";
import { StatusBadge } from "@/components/ui/primitives";
import { Button, Field, Select, inputClass } from "@/components/ui/fields";
import { useVault } from "@/components/vault/VaultProvider";

const dateFr = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Un exemplaire (ou la ligne wishlist) : résumé lisible, formulaire déplié sur
 * « Modifier ». Enregistrement validé par le serveur, puis visible partout.
 */
export default function InventoryEditor({ item, orderLabel }: { item: InventoryItem; orderLabel?: string }) {
  const { saveItem, deleteItem } = useVault();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InventoryItem>(item);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(item);
  const set = <K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function setStatus(status: InventoryItem["status"]) {
    // 1 article physique = 1 entrée ; la wishlist n'a pas d'objet (modèle ERP)
    const physical = ["owned", "delivered", "duplicate"].includes(status);
    setDraft((d) => ({
      ...d,
      status,
      quantity: status === "wishlist" ? 0 : physical ? 1 : d.quantity,
      acquiredAt: physical && !d.acquiredAt ? new Date().toISOString().slice(0, 10) : d.acquiredAt,
    }));
  }

  async function run(fn: () => Promise<boolean>) {
    setBusy(true);
    const ok = await fn();
    setBusy(false);
    if (ok) setEditing(false);
  }

  const facts = [
    item.completeness !== "unknown" ? COMPLETENESS_LABELS[item.completeness] : null,
    item.condition !== "unknown" ? CONDITION_LABELS[item.condition] : null,
    item.purchasePrice ? euro(item.purchasePrice.amount) : null,
    item.acquiredAt ? `arrivé le ${dateFr(item.acquiredAt)}` : null,
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={item.status} />
            {item.status !== "wishlist" ? (
              <span className={`text-[11px] ${item.verificationStatus === "verified" ? "text-ok" : "text-accent"}`}>
                {item.verificationStatus === "verified" ? "vérifié" : "à vérifier"}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-muted">{facts.length ? facts.join(" · ") : "Détails non renseignés"}</p>
          {orderLabel ? <p className="mt-1 text-xs text-muted">{orderLabel}</p> : null}
          {item.privateNotes && !editing ? <p className="mt-1.5 line-clamp-2 text-xs text-muted/80">{item.privateNotes}</p> : null}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraft(item);
              setEditing(true);
            }}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-soft"
          >
            Modifier
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="border-t border-border p-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Statut">
              <Select value={draft.status} options={INVENTORY_STATUSES} labels={STATUS_LABELS} onChange={(v) => setStatus(v as InventoryItem["status"])} />
            </Field>
            <Field label="Vérification">
              <Select
                value={draft.verificationStatus}
                options={["verified", "needs_review"]}
                labels={{ verified: "Vérifié", needs_review: "À vérifier" }}
                onChange={(v) => set("verificationStatus", v as InventoryItem["verificationStatus"])}
              />
            </Field>
            <Field label="Complétude">
              <Select value={draft.completeness} options={COMPLETENESS} labels={COMPLETENESS_LABELS} onChange={(v) => set("completeness", v as InventoryItem["completeness"])} />
            </Field>
            <Field label="État">
              <Select value={draft.condition} options={CONDITIONS} labels={CONDITION_LABELS} onChange={(v) => set("condition", v as InventoryItem["condition"])} />
            </Field>
            <Field label="Prix payé, port compris">
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft.purchasePrice?.amount ?? ""}
                onChange={(e) =>
                  set("purchasePrice", e.target.value === "" ? null : { amount: Number(e.target.value), currency: "EUR", includesShipping: true })
                }
              />
            </Field>
            <Field label="Arrivé le">
              <input className={inputClass} type="date" value={draft.acquiredAt ?? ""} onChange={(e) => set("acquiredAt", e.target.value || null)} />
            </Field>
            <Field label="Notes privées" className="col-span-2">
              <textarea className={`${inputClass} min-h-16`} value={draft.privateNotes ?? ""} onChange={(e) => set("privateNotes", e.target.value || null)} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {item.orderId ? (
              <span className="mr-auto text-xs text-muted">Liée à une commande : suivie depuis Commandes.</span>
            ) : confirmDelete ? (
              <>
                <span className="mr-auto basis-full text-xs text-ko">Supprimer définitivement cette ligne ?</span>
                <Button onClick={() => setConfirmDelete(false)}>Garder</Button>
                <Button variant="danger" disabled={busy} onClick={() => run(() => deleteItem(item))}>
                  Supprimer
                </Button>
              </>
            ) : (
              <span className="mr-auto">
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  Supprimer
                </Button>
              </span>
            )}
            {!confirmDelete ? (
              <>
                <Button onClick={() => setEditing(false)}>Annuler</Button>
                <Button variant="primary" disabled={!dirty || busy} onClick={() => run(() => saveItem(draft))}>
                  {busy ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
