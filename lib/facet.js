/*
  facet.js — the small vanilla JS behaviours of the Facet design library.

  Consumed with one script tag, after facet.css:

    <script src="https://[domain]/lib/facet.js" defer></script>

  What lives here (one small named function per behavior):

    applyScriptConfig  reads data-theme / data-mode / data-density /
                       data-language off this script's own tag, so a page
                       boots straight into its configuration
    applyUrlTheme      reads ?theme= and ?mode= from the URL on load, so a
                       shared link opens in the sender's theme
    initColorMode      honours the system's dark preference on first load
    setConfig          facet.set({...}): change theme, mode or any token
                       live at runtime, no reload
    initThemeSwitches  any [data-theme-switch] button changes the whole
                       page's theme live and carries the choice in the URL
    initModeToggles    any [data-mode-toggle] button flips light and dark,
                       carried in the URL the same way
    initNumberInputs   the calculator number input: one-tap clear of the
                       example value, Indian digit grouping while typing,
                       and the words helper ("25 lakh") under the field
    initSliders        keeps a slider's <output> readout in sync
    initCopyButtons    "click copy, paste into any project" on docs pages

  Everything wires itself to data attributes, so pages opt in by writing
  HTML, never by writing JS. App logic, data fetching and state management
  live in projects — never in this file.

  A tiny public API is exposed as window.facet for calculator apps:

    facet.numberValue(input)   the plain number behind a grouped input
    facet.groupIndian(n)       74250000  -> "7,42,50,000"
    facet.numberWords(n)       74250000  -> "7.43 crore"

  TODO: parallax and idle animations (Layer 3 motion effects) land here
  behind prefers-reduced-motion once the first app needs them.
*/


/* --------------------------------------------------------------------------
   THEME AND MODE

   What it is: the one-step theme change, wired to buttons and to the URL.
   One attribute on the html tag switches the theme (data-theme), a second
   flips light and dark (data-mode), and both compose.
   What it is for: restyling the whole page — layout containers included —
   live, and keeping the choice in the URL query so a reload or a shared
   link opens the same way.
   When to use it: give any button data-theme-switch="sand" (empty value
   means the Default theme) to make it a theme switcher, and data-mode-toggle
   to make it a light/dark flip. Pages can also just hardcode the
   attributes and skip the buttons entirely.

     <button class="btn" data-theme-switch="">Default</button>
     <button class="btn" data-theme-switch="sand">Sand</button>
     <button class="btn" data-mode-toggle>Light / dark</button>
   -------------------------------------------------------------------------- */

/* Writes one query parameter without reloading; null removes it. */
function setUrlParam(name, value) {
  const url = new URL(location.href);
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
  history.replaceState(null, "", url);
}

/* Setup by configuration: the script tag itself can carry the whole
   look, copied off the library site's setup strip —

     <script src=".../facet.js" data-theme="sand" data-mode="dark" defer></script>

   Runs at script time (before first paint). Explicit attributes the page
   author wrote on <html> win over the script config; the URL (below)
   wins over both, so shared links stay faithful. */
function applyScriptConfig() {
  const script = document.currentScript;
  if (!script) return;

  const html = document.documentElement;
  for (const key of ["theme", "mode", "density", "language"]) {
    if (script.dataset[key] && !html.dataset[key]) {
      html.dataset[key] = script.dataset[key];
    }
  }
}

/* facet.set({...}) — the runtime half of configuration. Applies key-value
   pairs live, no reload:

     facet.set({ theme: "sand" })            switch theme
     facet.set({ mode: "dark" })             flip dark
     facet.set({ theme: null, mode: null })  back to defaults
     facet.set({ "--accent-1": "#5F9E44" })  override any token

   Attributes on <html> stay the source of truth (custom scripts that set
   them directly keep working); token overrides land as inline custom
   properties. Theme and mode changes are written to the URL, like the
   switcher buttons. */
function setConfig(config) {
  const html = document.documentElement;

  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith("--")) {
      if (value === null || value === "") html.style.removeProperty(key);
      else html.style.setProperty(key, value);
    } else if (["theme", "mode", "density", "language"].includes(key)) {
      if (value) html.dataset[key] = value;
      else delete html.dataset[key];
      if (key === "theme") setUrlParam("theme", value || null);
      if (key === "mode") setUrlParam("mode", value || null);
    }
  }
  showActiveThemeSwitches();
}

/* On load, the URL wins: ?theme=sand&mode=dark restores that exact look.
   Runs at script time (deferred = before first paint), so no flash. */
function applyUrlTheme() {
  const params = new URLSearchParams(location.search);
  const html = document.documentElement;

  const theme = params.get("theme");
  if (theme) html.dataset.theme = theme;

  const mode = params.get("mode");
  if (mode === "dark" || mode === "light") html.dataset.mode = mode;
}

/* If neither the page nor the URL chose a mode, follow the system. */
function initColorMode() {
  const html = document.documentElement;
  if (html.dataset.mode) return; // the page or the URL chose: respect it

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.dataset.mode = "dark";
  }
}

/* Marks the switcher button matching the live theme with aria-pressed,
   for keyboard and screen-reader users. Called after every theme change,
   whether it came from a button or from facet.set(). */
function showActiveThemeSwitches() {
  const current = document.documentElement.dataset.theme || "";
  for (const b of document.querySelectorAll("[data-theme-switch]")) {
    b.setAttribute("aria-pressed", String(b.dataset.themeSwitch === current));
  }
}

/* Theme switcher buttons: set the theme and carry it in the URL. */
function initThemeSwitches() {
  for (const button of document.querySelectorAll("[data-theme-switch]")) {
    button.addEventListener("click", () => {
      setConfig({ theme: button.dataset.themeSwitch || null });
    });
  }
  showActiveThemeSwitches();
}

/* Light/dark flip, carried in the URL like the theme. */
function initModeToggles() {
  for (const button of document.querySelectorAll("[data-mode-toggle]")) {
    button.addEventListener("click", () => {
      const html = document.documentElement;
      html.dataset.mode = html.dataset.mode === "dark" ? "light" : "dark";
      setUrlParam("mode", html.dataset.mode);
    });
  }
}


/* --------------------------------------------------------------------------
   NUMBER FORMATTING
   Shared helpers for the number input and for any calculator app.
   -------------------------------------------------------------------------- */

/* "7,42,50,000" style grouping: last three digits, then pairs. */
function groupIndian(number) {
  if (number === "" || number === null || isNaN(number)) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(number);
}

/* Reads a number back in Indian words: 74250000 -> "7.43 crore".
   Below a thousand the digits already say it all, so it returns "". */
function numberWords(number) {
  if (isNaN(number) || number === null || number === "") return "";
  const n = Math.abs(number);

  const scales = [
    { unit: 1e7, word: "crore" },
    { unit: 1e5, word: "lakh" },
    { unit: 1e3, word: "thousand" },
  ];

  for (const scale of scales) {
    if (n >= scale.unit) {
      // Two decimals, trimmed: 2.50 -> "2.5", 25.00 -> "25".
      const amount = parseFloat((n / scale.unit).toFixed(2));
      return `${amount} ${scale.word}`;
    }
  }
  return "";
}

/* The plain number behind a grouped input: "7,42,500" -> 742500. */
function numberValue(input) {
  const digits = input.value.replace(/[^0-9.]/g, "");
  return digits === "" ? 0 : parseFloat(digits);
}


/* --------------------------------------------------------------------------
   NUMBER INPUT

   What it is: the behaviours behind the calculator-grade number field.
   Wires every <input data-number> inside a .number-input wrapper:

     1. The prefilled example clears fully on first touch — one tap and
        it is gone. Once the visitor has typed anything themselves, focus
        never clears the field again.
     2. Digits regroup Indian-style as they are typed: 2500000 -> 25,00,000.
     3. The sibling .number-words span reads the value back in words.

   Markup lives in facet.css under FIELD + NUMBER INPUT and on the library
   site's element wall.
   -------------------------------------------------------------------------- */

function initNumberInputs() {
  for (const input of document.querySelectorAll("input[data-number]")) {
    // An empty placeholder lets CSS hide the clear button on empty fields.
    if (!input.placeholder) input.placeholder = "0";

    formatNumberInput(input);

    // 1. One-tap clear of the example value, on first touch only.
    input.addEventListener("focus", () => {
      if (input.dataset.edited) return;
      input.value = "";
      updateNumberWords(input);
    });

    // 2 + 3. Regroup and re-read on every keystroke.
    input.addEventListener("input", () => {
      input.dataset.edited = "true";
      formatNumberInput(input);
    });

    // The clear button empties the field and hands focus back.
    const clearButton = input.parentElement.querySelector(".number-clear");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        input.value = "";
        input.dataset.edited = "true"; // clearing counts as editing
        updateNumberWords(input);
        input.focus();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  }
}

/* Regroups the input's digits without losing the caret: the caret keeps
   its position among the digits, wherever the commas land. */
function formatNumberInput(input) {
  const digitsBeforeCaret = input.value
    .slice(0, input.selectionStart)
    .replace(/[^0-9]/g, "").length;

  const raw = input.value.replace(/[^0-9.]/g, "");
  input.value = raw === "" ? "" : groupIndian(parseFloat(raw));

  // Walk the new value until the same number of digits has passed.
  let caret = 0;
  let digitsSeen = 0;
  while (caret < input.value.length && digitsSeen < digitsBeforeCaret) {
    if (/[0-9]/.test(input.value[caret])) digitsSeen++;
    caret++;
  }
  if (document.activeElement === input) input.setSelectionRange(caret, caret);

  updateNumberWords(input);
}

/* Writes "25 lakh" (or nothing) into the field's .number-words span. */
function updateNumberWords(input) {
  const field = input.closest(".field") || input.parentElement;
  const words = field.querySelector(".number-words");
  if (words) words.textContent = input.value === "" ? "" : numberWords(numberValue(input));
}


/* --------------------------------------------------------------------------
   SLIDER

   What it is: the sync between a slider and its readout. Keeps the
   <output> in a slider's field label showing the live value.

     <label class="field">
       <span class="field-label">Years <output>10</output></span>
       <input type="range" class="slider" min="1" max="40" value="10">
     </label>
   -------------------------------------------------------------------------- */

function initSliders() {
  for (const slider of document.querySelectorAll("input.slider")) {
    const field = slider.closest(".field");
    const output = field && field.querySelector("output");
    if (!output) continue;

    const show = () => { output.value = slider.value; };
    slider.addEventListener("input", show);
    show(); // sync once on load, in case HTML and value attribute disagree
  }
}


/* --------------------------------------------------------------------------
   COPY BUTTON

   What it is: the docs-site behavior behind every snippet. A button with
   data-copy="#some-snippet" copies that element's text to the clipboard
   and confirms itself for a moment.

     <pre id="snippet-button"><code>...</code></pre>
     <button class="btn btn-small" data-copy="#snippet-button">Copy</button>
   -------------------------------------------------------------------------- */

function initCopyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const source = document.querySelector(button.dataset.copy);
      if (!source) return;

      await navigator.clipboard.writeText(source.innerText.trim());

      const label = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = label; }, 1500);
    });
  }
}


/* --------------------------------------------------------------------------
   BOOT
   -------------------------------------------------------------------------- */

applyScriptConfig();
applyUrlTheme();
initColorMode();

document.addEventListener("DOMContentLoaded", () => {
  initThemeSwitches();
  initModeToggles();
  initNumberInputs();
  initSliders();
  initCopyButtons();
});

/* The public API for apps: configuration plus the number helpers. */
window.facet = { set: setConfig, numberValue, groupIndian, numberWords };
