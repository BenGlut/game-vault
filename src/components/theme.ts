"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Thème clair / sombre / système. Le choix est mémorisé (clé `gv-theme`) ; le thème
 * résolu est posé sur <html data-theme> et le choix sur <html data-theme-pref>.
 * THEME_SCRIPT tourne en ligne en tête de <body>, avant le premier rendu : pas de flash.
 */
export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "gv-theme";

/** Script inline (layout + page de connexion) : même logique, sans dépendance. */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,p="system";try{var s=localStorage.getItem("${THEME_KEY}");if(s==="light"||s==="dark")p=s}catch(e){}var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)");function a(){var r=p==="system"?(m&&m.matches?"light":"dark"):p;d.setAttribute("data-theme",r);d.setAttribute("data-theme-pref",p)}a();if(m&&m.addEventListener)m.addEventListener("change",function(){if((d.getAttribute("data-theme-pref")||"system")==="system"){p="system";a()}});window.__gvSetTheme=function(n){p=n;try{if(n==="system")localStorage.removeItem("${THEME_KEY}");else localStorage.setItem("${THEME_KEY}",n)}catch(e){}a()};setTimeout(function(){d.classList.add("theme-ready")},0)})();`;

declare global {
  interface Window {
    __gvSetTheme?: (pref: ThemePref) => void;
  }
}

function readPref(): ThemePref {
  if (typeof document === "undefined") return "system";
  const p = document.documentElement.getAttribute("data-theme-pref");
  return p === "light" || p === "dark" ? p : "system";
}

export function useTheme(): { pref: ThemePref; setPref: (p: ThemePref) => void } {
  const [pref, setState] = useState<ThemePref>("system");
  useEffect(() => setState(readPref()), []);
  const setPref = useCallback((p: ThemePref) => {
    if (window.__gvSetTheme) window.__gvSetTheme(p);
    else {
      try {
        if (p === "system") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, p);
      } catch {
        /* stockage indisponible : le choix vaut pour la session */
      }
      const light = p === "light" || (p === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
      document.documentElement.setAttribute("data-theme", light ? "light" : "dark");
      document.documentElement.setAttribute("data-theme-pref", p);
    }
    setState(p);
  }, []);
  return { pref, setPref };
}
