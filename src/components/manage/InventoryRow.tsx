"use client";

import { useState } from "react";
import { COMPLETENESS, CONDITIONS, INVENTORY_STATUSES, type InventoryItem } from "@/lib/schema";
import { COMPLETENESS_LABELS, CONDITION_LABELS, STATUS_LABELS } from "@/lib/labels";
import { StatusBadge } from "@/components/ui";
import { Button, Field, Select, inputClass } from "./fields";

/** Une ligne d'inventaire (un exemplaire physique, ou la ligne wishlist) éditable. */
export default function InventoryRow({
  item,
  onSave,
  onDelete,
}: {
  item: InventoryItem;
  onSave: (next: InventoryItem) => Promise<unknown>;
  onDelete: (item: InventoryItem) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<InventoryItem>(item);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(item);
  const set = <K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function setStatus(status: InventoryItem["status"]) {
    // 1 article physique = 1 entrée ; la wishlist n'a pas d'objet (cf. modèle ERP)
    const physical = ["owned", "delivered", "duplicate"].includes(status);
    setDraft((d) => ({
      ...d,
      status,
      quantity: status === "wishlist" ? 0 : physical ? 1 : d.quantity,
      acquiredAt: physical && !d.acquiredAt ? new Date().toISOString().slice(0, 10) : d.acquiredAt,
    }));
  }

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg-elev p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <code className="text-xs text-muted">{item.id}</code>
        </div>
        {item.orderId ? <span className="text-xs text-muted">Commande {item.orderId}</span> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Statut">
          <Select
            value={draft.status}
            options={INVENTORY_STATUSES}
            labels={STATUS_LABELS}
            onChange={(v) => setStatus(v as InventoryItem["status"])}
          />
        </Field>
        <Field label="État">
          <Select
            value={draft.condition}
            options={CONDITIONS}
            labels={CONDITION_LABELS}
            onChange={(v) => set("condition", v as InventoryItem["condition"])}
          />
        </Field>
        <Field label="Complétude">
          <Select
            value={draft.completeness}
            options={COMPLETENESS}
            labels={COMPLETENESS_LABELS}
            onChange={(v) => set("completeness", v as InventoryItem["completeness"])}
          />
        </Field>
        <Field label="Prix payé (port compris)">
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={draft.purchasePrice?.amount ?? ""}
            onChange={(e) =>
              set(
                "purchasePrice",
                e.target.value === ""
                  ? null
                  : { amount: Number(e.target.value), currency: "EUR", includesShipping: true },
              )
            }
          />
        </Field>
        <Field label="Acquis le">
          <input
            className={inputClass}
            type="date"
            value={draft.acquiredAt ?? ""}
            onChange={(e) => set("acquiredAt", e.target.value || null)}
          />
        </Field>
        <Field label="Vérification">
          <Select
            value={draft.verificationStatus}
            options={["verified", "needs_review"]}
            labels={{ verified: "Vérifié", needs_review: "À vérifier" }}
            onChange={(v) => set("verificationStatus", v as InventoryItem["verificationStatus"])}
          />
        </Field>
        <Field label="Notes privées" className="sm:col-span-3">
          <textarea
            className={`${inputClass} min-h-16`}
            value={draft.privateNotes ?? ""}
            onChange={(e) => set("privateNotes", e.target.value || null)}
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {item.orderId ? (
          <span className="mr-auto text-xs text-muted">Liée à une commande : la suivre depuis l’onglet Commandes.</span>
        ) : confirmDelete ? (
          <>
            <span className="mr-auto basis-full text-xs text-ko sm:basis-auto">Supprimer définitivement cette ligne ?</span>
            <Button onClick={() => setConfirmDelete(false)}>Garder</Button>
            <Button variant="danger" disabled={busy} onClick={() => run(() => onDelete(item))}>
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
        {dirty ? <Button onClick={() => setDraft(item)}>Annuler</Button> : null}
        <Button variant="primary" disabled={!dirty || busy} onClick={() => run(() => onSave(draft))}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
