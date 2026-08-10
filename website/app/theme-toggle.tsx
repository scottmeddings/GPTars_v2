"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gptars-theme";

/** Re-renders the button whenever the theme attribute on <html> changes. */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * Theme control for the server-rendered pages. The document element is the
 * source of truth — it is set before paint by the inline script in layout.tsx —
 * so no state is duplicated in React and there is no flash of the wrong theme.
 *
 * The aria-label is also the hook used by static/theme.js in the scriptless
 * GitHub Pages export, so keep the two identical.
 */
export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme !== "light",
    () => true, // Dark is the served default, so the server snapshot matches.
  );

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button type="button" onClick={toggleTheme} aria-label="Toggle colour theme">
      {dark ? "Light sheet" : "Dark sheet"}
    </button>
  );
}
