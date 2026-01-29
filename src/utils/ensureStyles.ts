// Ensures styles are present in the document
// Handles cases where styles are removed (e.g., by Astro View Transitions)

import cssContent from "../styles/base.css?inline";

const STYLE_ID = "nostr-comments-styles";

export function ensureStyles(): void {
  // Check if styles already exist
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  // In development, Vite injects styles differently
  const devStyle = document.querySelector(
    'style[data-vite-dev-id*="base.css"]'
  );
  if (devStyle) {
    return;
  }

  // Inject styles manually
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = cssContent;
  document.head.appendChild(style);
}
