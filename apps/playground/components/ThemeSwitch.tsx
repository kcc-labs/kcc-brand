"use client";

import { useSyncExternalStore } from "react";
import { SegmentedControl } from "@kcc/design";

type Theme = "system" | "light" | "dark";
const KEY = "kcc-theme";

// The theme lives on <html data-theme>, set before paint by the script in layout.tsx. This control reads it from
// there and writes it there; "system" removes it, so prefers-color-scheme decides.
const read = (): Theme => {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
};
const subscribe = (onChange: () => void) => {
  const o = new MutationObserver(onChange);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}

export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  return (
    <div className="pg-theme">
      <SegmentedControl
        name="theme"
        legend="Theme"
        value={theme}
        onChange={(v) => apply(v as Theme)}
        options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
    </div>
  );
}
