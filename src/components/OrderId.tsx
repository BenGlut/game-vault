"use client";

import { useState } from "react";

/**
 * Identifiant interne d'une commande, affiché tel quel et copiable d'un clic.
 * Sert à désigner sans ambiguïté une commande précise dans une conversation :
 * l'identifiant est celui que consomme `pnpm vault update-order --order …`.
 * Le clic ne doit jamais remonter — carte et panneau l'utilisent tous deux
 * à l'intérieur d'une zone elle-même cliquable.
 */
/** Copie sans l'API clipboard : un champ hors écran, sélectionné puis copié. */
function copierParChampTemporaire(texte: string): boolean {
  const champ = document.createElement("textarea");
  champ.value = texte;
  champ.setAttribute("readonly", "");
  champ.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(champ);
  champ.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  champ.remove();
  return ok;
}

export function OrderId({ id, className = "" }: { id: string; className?: string }) {
  const [etat, setEtat] = useState<"repos" | "copie" | "selection">("repos");

  async function copier(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setEtat("copie");
    } catch {
      // presse-papier moderne refusé (permission non accordée au contexte) :
      // repli sur la copie par champ temporaire, qui ne demande aucune permission.
      // Surtout ne pas sélectionner le texte du bouton : son libellé change juste après.
      setEtat(copierParChampTemporaire(id) ? "copie" : "selection");
    }
    window.setTimeout(() => setEtat("repos"), 1600);
  }

  const libelle =
    etat === "copie" ? "identifiant copié" : etat === "selection" ? "copie refusée" : id;

  return (
    <button
      type="button"
      onClick={copier}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") copier(e);
        e.stopPropagation();
      }}
      title="Copier l'identifiant de la commande"
      aria-label={`Copier l'identifiant de la commande ${id}`}
      className={`select-all font-mono text-[11px] text-muted transition hover:text-accent focus:outline-none focus-visible:text-accent ${className}`}
    >
      {libelle}
    </button>
  );
}
