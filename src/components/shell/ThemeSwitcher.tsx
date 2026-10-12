"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import { Segmented } from "@/components/ui/primitives";
import { useTheme, type ThemePref } from "@/components/theme";

/** Sélecteur Clair / Sombre / Système (mémorisé dans ce navigateur). */
export default function ThemeSwitcher({ withLabels = false }: { withLabels?: boolean }) {
  const { pref, setPref } = useTheme();
  const icon = (p: ThemePref, size = 14) => (p === "light" ? <SunIcon size={size} /> : p === "dark" ? <MoonIcon size={size} /> : <MonitorIcon size={size} />);
  const names: Record<ThemePref, string> = { light: "Clair", dark: "Sombre", system: "Système" };
  return (
    <Segmented<ThemePref>
      label="Thème"
      value={pref}
      onChange={setPref}
      size={withLabels ? "md" : "sm"}
      options={(["light", "dark", "system"] as const).map((p) => ({
        value: p,
        title: `Thème ${names[p].toLowerCase()}`,
        label: withLabels ? (
          <>
            {icon(p)}
            {names[p]}
          </>
        ) : (
          icon(p)
        ),
      }))}
    />
  );
}
