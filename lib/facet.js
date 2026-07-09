/*
  facet.js — the small vanilla JS behaviours of the Facet design library.

  Consumed with one script tag, after facet.css:

    <script src="https://facet-kappa.vercel.app/lib/facet.js" defer></script>

  What lives here (one small named function per behavior):

    applyScriptConfig  reads data-theme / data-mode / data-density / data-text-size /
                       data-language off this script's own tag, so a page
                       boots straight into its configuration
    applyUrlTheme      reads ?theme= and ?mode= from the URL on load, so a
                       shared link opens in the sender's theme
    initColorMode      honours the system's dark preference on first load
    setConfig          facet.set({...}): change theme, mode or any token
                       live at runtime, no reload
    locate             built-in context: facet.location / facet.locate()
                       for the visitor's rough place (IP-based, opt-in)
    t, numberSystem    the strings table and the locale: every built-in
                       string translated via data-language, numbers
                       grouped and worded per locale via data-numbers
    initThemeSwitches  any [data-theme-switch] button changes the whole
                       page's theme live and carries the choice in the URL
    initModeToggles    any [data-mode-toggle] button flips light and dark,
                       carried in the URL the same way
    initNumberInputs   the calculator number input: one-tap clear of the
                       example value, locale-aware grouping while typing,
                       and the words helper ("25 lakh" / "2.5 million")
    initSliders        keeps a slider's <output> readout in sync
    initDetailSliders  wide-range slider: coarse drag + fine steppers/entry
    initCopyButtons    "click copy, paste into any project" on docs pages
    initServiceWorker  data-service-worker="/sw.js" registers the Facet
                       worker: offline shell, cached files, updates that
                       take over on the next navigation
    initInstallButtons [data-install] buttons appear when the app is
                       installable; facet.install() prompts on demand
    go, opt-outs       facet.go(url) navigates with the page transition;
                       a[data-no-transition] links snap instead
    initPagers         full-viewport .snap containers auto-upgrade to the
                       iOS-proven pager: spring between section tops,
                       native scrolling inside sections, gesture handoff

  Everything wires itself to data attributes, so pages opt in by writing
  HTML, never by writing JS. App logic, data fetching and state management
  live in projects — never in this file.

  The full public API lives on window.facet — configuration, context,
  number helpers, and a handle on every behaviour engine. The complete,
  commented list is the export block at the bottom of this file.

  The motion pack: one engine (facet.motion) normalises the device's
  movement — tilt, pointer, scroll momentum, or an idle drift when no
  input exists — into a single vector, and two channels spend it:
  data-parallax="depth" translates the element (the move channel), and
  data-shine steers the light across it (the light channel writes the
  --shine-x/--shine-y custom properties the shine overlay reads). The
  idle-* classes animate the composable translate/rotate/scale
  properties. Everything stills under data-motion="off" and
  prefers-reduced-motion.
*/


/* --------------------------------------------------------------------------
   THEME AND MODE

   What it is: the one-step theme change, wired to buttons and to the URL.
   One attribute on the html tag switches the theme (data-theme), a second
   flips light and dark (data-mode), and both compose.
   What it is for: restyling the whole page — layout containers included —
   live, and keeping the choice in the URL query so a reload or a shared
   link opens the same way.
   When to use it: give any button data-theme-switch="velvet" (empty value
   means the Default theme) to make it a theme switcher, and data-mode-toggle
   to make it a light/dark flip. Pages can also just hardcode the
   attributes and skip the buttons entirely.

     <button class="btn" data-theme-switch="">Default</button>
     <button class="btn" data-theme-switch="velvet">Velvet</button>
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

     <script src=".../facet.js" data-theme="velvet" data-mode="dark" defer></script>

   Runs at script time (before first paint). Explicit attributes the page
   author wrote on <html> win over the script config; the URL (below)
   wins over both, so shared links stay faithful. */
function applyScriptConfig() {
  const script = document.currentScript;
  if (!script) return;

  const html = document.documentElement;
  for (const key of ["theme", "mode", "density", "textSize", "language", "numbers", "motion", "transition"]) {
    if (script.dataset[key] && !html.dataset[key]) {
      html.dataset[key] = script.dataset[key];
    }
  }

  // Location lookup is opt-in, so a calculator that never needs geo makes
  // no network call (and never logs a failed request in a no-egress box).
  // data-location turns on the default IP endpoint; data-location-endpoint
  // sets a custom one (or "" to force it off even with data-location).
  if (script.dataset.location !== undefined) locationEndpoint = DEFAULT_LOCATION_ENDPOINT;
  if (script.dataset.locationEndpoint !== undefined) {
    locationEndpoint = script.dataset.locationEndpoint;
  }

  // data-service-worker="/sw.js" opts the page into the Facet worker.
  if (script.dataset.serviceWorker) {
    serviceWorkerPath = script.dataset.serviceWorker;
  }
}

/* facet.set({...}) — the runtime half of configuration. Applies key-value
   pairs live, no reload:

     facet.set({ theme: "velvet" })          switch theme
     facet.set({ mode: "dark" })             flip dark
     facet.set({ motion: "calm" })           quiet the animations
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
    } else if (key === "mode") {
      // Route through the scheme system so state stays consistent: a null
      // or "auto" mode returns to following the OS.
      setScheme(value === "dark" || value === "light" ? value : "auto");
    } else if (["theme", "density", "textSize", "language", "numbers", "motion", "transition"].includes(key)) {
      if (value) html.dataset[key] = value;
      else delete html.dataset[key];
      if (key === "theme") { setUrlParam("theme", value || null); themeStore.set(value || null); }
      if (key === "language") setUrlParam("language", value || null);
    }
  }
  showActiveThemeSwitches();
  if ("language" in config) { applyTranslations(); showActiveLanguageSwitches(); }
  if ("language" in config || "numbers" in config) refreshNumberInputs();
}

/* On load, resolve the theme in precedence order: the URL wins
   (?theme=velvet restores a shared link and updates the session), then the
   session choice (sessionStorage), then whatever default the page set on
   its <html>/script tag. Runs at script time (deferred = before first
   paint), so there is no flash. Mode is settled by initColorMode below. */
function applyUrlTheme() {
  const params = new URLSearchParams(location.search);
  const html = document.documentElement;

  const theme = params.get("theme");
  if (theme) { html.dataset.theme = theme; themeStore.set(theme); }
  else { const stored = themeStore.get(); if (stored) html.dataset.theme = stored; }

  const mode = params.get("mode");
  if (mode === "dark" || mode === "light") html.dataset.mode = mode;

  const language = params.get("language");
  if (language) html.dataset.language = language;
}

/* The theme (palette) and the mode (light/dark) persist for the SESSION
   only — sessionStorage, not localStorage — so a choice sticks across page
   navigations and reloads in the same tab but resets when the tab or
   browser closes; it is never made permanent. Both also ride the URL, so a
   shared link opens in exactly the same look. */
const THEME_KEY = "facet-theme";
const themeStore = {
  get() { try { return sessionStorage.getItem(THEME_KEY); } catch { return null; } },
  set(v) { try { v ? sessionStorage.setItem(THEME_KEY, v) : sessionStorage.removeItem(THEME_KEY); } catch { /* private mode */ } },
};

/* Appearance is three-way: "auto" follows the OS, "light" and "dark" are
   held choices. The choice is remembered in the URL (?mode=) and in
   sessionStorage (session-scoped, above); while on auto, a live
   prefers-color-scheme listener keeps the page in step with the OS.
   facet.scheme exposes get/set/cycle; the settings icon-row cycles
   Light -> Dark -> Auto through it. data-mode on <html> stays the render
   attribute the CSS reads. */
const SCHEME_KEY = "facet-scheme";
const schemeStore = {
  get() { try { return sessionStorage.getItem(SCHEME_KEY); } catch { return null; } },
  set(v) { try { v ? sessionStorage.setItem(SCHEME_KEY, v) : sessionStorage.removeItem(SCHEME_KEY); } catch { /* private mode */ } },
};
let schemeState = "auto";
const osDark = () => window.matchMedia("(prefers-color-scheme: dark)");

function renderScheme() {
  const html = document.documentElement;
  if (schemeState === "auto") {
    if (osDark().matches) html.dataset.mode = "dark"; else delete html.dataset.mode;
  } else {
    html.dataset.mode = schemeState;
  }
}

function setScheme(scheme) {
  if (scheme !== "auto" && scheme !== "light" && scheme !== "dark") return schemeState;
  schemeState = scheme;
  renderScheme();
  setUrlParam("mode", scheme === "auto" ? null : scheme);
  schemeStore.set(scheme === "auto" ? null : scheme);
  return schemeState;
}

function cycleScheme() {
  return setScheme(schemeState === "light" ? "dark" : schemeState === "dark" ? "auto" : "light");
}

/* Establish the initial scheme at boot, in precedence order URL > stored
   > a page-preset data-mode > auto, then render and start following the
   OS while on auto. Replaces the old "set dark if OS is dark" one-shot. */
function initColorMode() {
  const html = document.documentElement;
  const fromUrl = new URLSearchParams(location.search).get("mode");
  const stored = schemeStore.get();
  if (fromUrl === "auto" || fromUrl === "light" || fromUrl === "dark") schemeState = fromUrl;
  else if (stored === "light" || stored === "dark") schemeState = stored;
  else if (html.dataset.mode === "light" || html.dataset.mode === "dark") schemeState = html.dataset.mode;
  else schemeState = "auto";
  renderScheme();
  osDark().addEventListener("change", () => { if (schemeState === "auto") renderScheme(); });
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

/* Light/dark flip, kept for back-compat. It routes through setScheme so a
   toggle lands on a held "light"/"dark" (never a stale "auto"); the
   three-way cycle lives on facet.scheme / data-control="appearance". */
function initModeToggles() {
  for (const button of document.querySelectorAll("[data-mode-toggle]")) {
    button.addEventListener("click", () => {
      setScheme(document.documentElement.dataset.mode === "dark" ? "light" : "dark");
    });
  }
}

/* --------------------------------------------------------------------------
   CONTENT TRANSLATION

   What it is: the same data-language switch that translates the library's
   own strings, extended to the page's OWN content. What it is for: a
   multilingual page that stays one HTML file — the author writes each
   translated variant inline instead of maintaining parallel pages. When
   to use it: any content you want offered in more than one language. Mark
   the natural container data-i18n and give it one child per language,
   each tagged data-lang="xx"; the active html[data-language] variant
   shows and the rest hide. Author the default-language variant plain and
   the others hidden — so with JavaScript OFF exactly one language shows
   (the page stays readable and crawlable) and this system only switches
   WHICH one. Fallback order: the active language, then the page's own
   <html lang>, then the first variant. A separate keyed path fills any
   [data-t="key"] element from facet.strings (extend the table in one
   line), for strings shared across a page. Switch the language with a
   [data-language-switch="xx"] button (one per language) or a single
   [data-language-cycle] button that walks data-languages (default: every
   language in facet.strings); the choice rides the URL (?language=) so a
   shared link opens in the same tongue. facet.translate re-applies it
   after you insert new markup.

   Usage:
     <h1 data-i18n>
       <span data-lang="en">Welcome</span>
       <span data-lang="hi" hidden>स्वागत है</span>
     </h1>
     <button data-language-cycle data-languages="en,hi"
             data-event="language">EN</button>
   -------------------------------------------------------------------------- */

/* (docs mirror — identical to llms.txt · Content translation)
   WHEN TO USE: any page that speaks more than one language — mark the container once and the same switch that translates the UI translates your content.

   The data-language switch that localises the library's own strings also
   localises YOUR content, so a multilingual page stays one HTML file. Mark
   the natural container data-i18n and give it one child per language, each
   tagged data-lang="xx"; the active html[data-language] variant shows and
   the rest hide. Author the default-language variant plain and the others
   hidden — so with JavaScript OFF exactly one language shows (the page
   stays readable and crawlable) and this only switches WHICH. Fallback
   order: the active language, then the page's <html lang>, then the first
   variant. A keyed path also fills any [data-t="key"] element from
   facet.strings (extend the table in one line) for strings shared across a
   page. Switch with a [data-language-switch="xx"] button (one per
   language, aria-pressed follows) or a single [data-language-cycle] button
   that walks data-languages (default: every language in facet.strings);
   either routes through facet.set, so the URL (?language=), the content
   variants and the button states all follow in one step. facet.translate()
   re-applies it after you insert markup. */
/* Show the active-language variant inside every data-i18n group and hide
   the rest; then fill any keyed [data-t] element from the strings table. */
function applyTranslations() {
  const lang = currentLanguage();
  const pageLang = (document.documentElement.lang || "en").split("-")[0];
  for (const group of document.querySelectorAll("[data-i18n]")) {
    const variants = [...group.querySelectorAll(":scope > [data-lang]")];
    if (!variants.length) continue;
    const show = variants.find(v => v.dataset.lang === lang)
              || variants.find(v => v.dataset.lang === pageLang)
              || variants[0];
    for (const v of variants) v.hidden = v !== show;
  }
  for (const el of document.querySelectorAll("[data-t]")) {
    el.textContent = t(el.dataset.t);
  }
}
function initTranslate() { applyTranslations(); }

/* The languages a page offers: an explicit data-languages="en,hi,ja" on
   the control, else every language in the strings table. */
function pageLanguages(control) {
  const listed = control && control.dataset.languages;
  return listed ? listed.split(",").map(s => s.trim()).filter(Boolean)
                : Object.keys(strings);
}

/* Mark the [data-language-switch] button matching the live language, and
   write each [data-language-cycle] button's label to the active code. */
function showActiveLanguageSwitches() {
  const current = currentLanguage();
  for (const b of document.querySelectorAll("[data-language-switch]")) {
    b.setAttribute("aria-pressed", String(b.dataset.languageSwitch === current));
  }
  for (const b of document.querySelectorAll("[data-language-cycle]")) {
    const value = b.querySelector(".menu-value");
    const label = current.toUpperCase();
    if (value) value.textContent = label; else b.textContent = label;
  }
}

/* Language controls: [data-language-switch="xx"] sets that language;
   [data-language-cycle] walks the page's languages. Both route through
   setConfig, so the URL, the content variants and the switch states all
   follow in one step. */
function initLanguageControls() {
  for (const button of document.querySelectorAll("[data-language-switch]")) {
    button.addEventListener("click", () => {
      setConfig({ language: button.dataset.languageSwitch || null });
      if (window.facet && facet.feedback) facet.feedback.tap();
    });
  }
  for (const button of document.querySelectorAll("[data-language-cycle]")) {
    button.addEventListener("click", () => {
      const langs = pageLanguages(button);
      const at = langs.indexOf(currentLanguage());
      setConfig({ language: langs[(at + 1) % langs.length] });
      if (window.facet && facet.feedback) facet.feedback.tap();
    });
  }
  showActiveLanguageSwitches();
}


/* --------------------------------------------------------------------------
   CONTEXT: TIME AND PLACE

   What it is: ready-to-use rough location so apps never rewrite this
   plumbing. facet.location answers "roughly where is the visitor",
   resolved once at load from an IP lookup — a thing the browser does NOT
   give you natively (navigator.geolocation is precise, prompts, and needs
   a user gesture). Time and date are deliberately NOT wrapped: new Date()
   and Intl.DateTimeFormat() are already one-liners, so the library adds
   nothing by re-exporting them.

     facet.location     null until resolved, then { city, region, country,
                        countryCode, latitude, longitude, source }
     facet.locate()     the promise behind facet.location; await it when
                        the timing matters. Never throws; resolves null
                        on any failure, including offline.

   Where the location comes from: the lookup is OFF by default and
   opt-in on the script tag, so a page that never needs geo makes no
   network call (and logs no failed request in a no-egress box):

     data-location            turn on the default IP lookup (ipwho.is)
     data-location-endpoint="https://your-endpoint/"   use your own
     data-location-endpoint=""                         force it off

   ipwho.is needs no key, is HTTPS and CORS-open. Failure is silent —
   facet.location stays null. Precise GPS is intentionally NOT requested:
   it means a permission prompt, which is the app's call to make on a real
   user gesture (navigator.geolocation), never the library's on load.
   -------------------------------------------------------------------------- */

/* Location lookup is off unless the page opts in (data-location on the
   script tag); DEFAULT_LOCATION_ENDPOINT is what that opt-in turns on. */
const DEFAULT_LOCATION_ENDPOINT = "https://ipwho.is/";
let locationEndpoint = "";
let locationPromise = null;

/* "Roughly where": resolves once, caches, and mirrors onto facet.location. */
function locate() {
  if (locationPromise) return locationPromise;

  locationPromise = (async () => {
    if (!locationEndpoint) return null;   // lookups disabled by the page

    let place = null;
    try {
      const data = await (await fetch(locationEndpoint)).json();
      place = {
        city: data.city ?? null,
        region: data.region ?? null,
        country: data.country ?? null,
        countryCode: data.country_code ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        source: "ip",
      };
    } catch {
      place = null;                       // offline or blocked: quietly null
    }

    window.facet.location = place;
    return place;
  })();

  return locationPromise;
}


/* --------------------------------------------------------------------------
   LANGUAGE AND LOCALE

   What it is: the translation system for the library's own strings, and
   the locale awareness behind every number the library formats.
   What it is for: every built-in string the library injects (button
   feedback, number words) comes from the one table below — no literals
   are hardcoded anywhere else. One attribute switches the language:
   data-language="hi" on the html tag, the script tag, or
   facet.set({ language: "hi" }) at runtime.
   Projects extend the table with their own languages before or after
   load:  facet.strings.ta = { copied: "நகலெடுக்கப்பட்டது", ... }
   Missing keys fall back to English, so partial tables are fine.

   The number system follows the locale: lakh/crore grouping and words
   where that is the norm, million/billion elsewhere. Resolution order —
   explicit data-numbers="indian|western" (html or script tag), then the
   country facet.location resolved, then the browser's language region,
   then Indian as the library's home default. facet.numberSystem() tells
   an app which one is active.

   Explicitly out of scope, by decision: right-to-left layout.
   -------------------------------------------------------------------------- */

/* Every string the library itself ships. Extend, don't fork:
   facet.strings.<lang> = { ... } adds a language in one line. */
const strings = {
  en: {
    copied: "Copied",
    mapKey: "Add your Maps key to display this map",
    thousand: "thousand",
    lakh: "lakh",
    crore: "crore",
    million: "million",
    billion: "billion",
    trillion: "trillion",
  },
  hi: {
    copied: "कॉपी हुआ",
    mapKey: "नक्शा दिखाने के लिए अपनी Maps key जोड़ें",
    thousand: "हज़ार",
    lakh: "लाख",
    crore: "करोड़",
    million: "मिलियन",
    billion: "बिलियन",
    trillion: "ट्रिलियन",
  },
};

/* The active language: the page's choice, else the browser's. */
function currentLanguage() {
  return document.documentElement.dataset.language
    || (navigator.language || "en").split("-")[0];
}

/* One string, in the active language, falling back to English. */
function t(key) {
  const table = strings[currentLanguage()];
  return (table && table[key]) || strings.en[key] || key;
}

/* Where lakh and crore are how people actually say numbers. */
const LAKH_CRORE_REGIONS = ["IN", "PK", "BD", "NP", "LK"];

/* "indian" or "western": explicit override, then located country, then
   browser region, then the library's home default. */
function numberSystem() {
  const explicit = document.documentElement.dataset.numbers;
  if (explicit === "indian" || explicit === "western") return explicit;

  const located = window.facet && window.facet.location;
  if (located && located.countryCode) {
    return LAKH_CRORE_REGIONS.includes(located.countryCode) ? "indian" : "western";
  }

  const region = (navigator.language || "").split("-")[1];
  if (region) return LAKH_CRORE_REGIONS.includes(region) ? "indian" : "western";

  return "indian";
}


/* --------------------------------------------------------------------------
   NUMBER FORMATTING
   Shared helpers for the number input and for any calculator app. The
   grouping and the words follow the locale (see LANGUAGE AND LOCALE). For
   an explicit system, groupNumber(n, {system:"indian"}) forces it — no
   separate helper, since it is one Intl.NumberFormat call either way.
   -------------------------------------------------------------------------- */

/* Locale-aware grouping: 7425000 -> "74,25,000" or "7,425,000". The
   system defaults to numberSystem() but an app can force it per call —
   groupNumber(n, {system:"western"}) — so a currency-switching
   calculator groups by the chosen currency, not the viewer's IP. */
function groupNumber(number, opts = {}) {
  if (number === "" || number === null || isNaN(number)) return "";
  const system = opts.system || numberSystem();
  const tag = system === "indian" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(number);
}

/* Reads a number back in words for the active locale and language:
   74250000 -> "7.43 crore" or "74.25 million" (or "7.43 करोड़").
   Below a thousand the digits already say it all, so it returns "". */
function numberWords(number, opts = {}) {
  if (isNaN(number) || number === null || number === "") return "";
  const n = Math.abs(number);

  const scales = (opts.system || numberSystem()) === "indian"
    ? [
        { unit: 1e7, key: "crore" },
        { unit: 1e5, key: "lakh" },
        { unit: 1e3, key: "thousand" },
      ]
    : [
        { unit: 1e12, key: "trillion" },
        { unit: 1e9, key: "billion" },
        { unit: 1e6, key: "million" },
        { unit: 1e3, key: "thousand" },
      ];

  for (const scale of scales) {
    if (n >= scale.unit) {
      // Two decimals, trimmed: 2.50 -> "2.5", 25.00 -> "25".
      const amount = parseFloat((n / scale.unit).toFixed(2));
      return `${amount} ${t(scale.key)}`;
    }
  }
  return "";
}


/* (docs mirror — identical to llms.txt · Number input)
   WHEN TO USE: every numeric entry in a calculator or money product — it groups digits for the visitor's locale as they type and reads the number back in words.

   What it is: a labelled field wrapping the calculator-grade number input,
   with a clear button inside the field and a words helper under it. What it
   is for: money and other large numbers, entered the way the visitor says
   them. The input ships prefilled with an example value, clears fully on
   the first tap — and never again once the visitor has typed — groups
   digits for the locale as they are typed (25,00,000 where lakh and crore
   are the norm, 2,500,000 elsewhere), and reads the number back in words
   underneath, in the active language: 25 lakh, 2.5 million, 25 लाख. The
   locale follows facet.location and the browser, overridable with
   data-numbers="indian|western"; the language with data-language. All
   behaviours come from facet.js the moment the input carries data-number.
   When to use it: every numeric entry in a calculator. The field shows the
   grouped text; read the plain number in app code by stripping separators —
   parseFloat(input.value.replace(/[^0-9.]/g, "")). For the error state,
   set data-status="error" on the field and swap the hint for a
   .field-msg line (.field-invalid + .field-error stay as aliases). */
/* --------------------------------------------------------------------------
   NUMBER INPUT

   What it is: the behaviours behind the calculator-grade number field.
   Wires every <input data-number> inside a .number-input wrapper:

     1. The prefilled example clears fully on first touch — one tap and
        it is gone. Once the visitor has typed anything themselves, focus
        never clears the field again.
     2. Digits regroup for the locale as they are typed: 2500000 becomes
        25,00,000 where lakh and crore are the norm, 2,500,000 elsewhere.
     3. The sibling .number-words span reads the value back in words, in
        the active language.

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

/* Re-renders every number input's grouping and words — called when the
   language or number system changes, and when facet.location resolves. */
function refreshNumberInputs() {
  for (const input of document.querySelectorAll("input[data-number]")) {
    if (input.value !== "") formatNumberInput(input);
    else updateNumberWords(input);
  }
}

/* Regroups the input's digits without losing the caret: the caret keeps
   its position among the digits, wherever the commas land. */
function formatNumberInput(input) {
  const digitsBeforeCaret = input.value
    .slice(0, input.selectionStart)
    .replace(/[^0-9]/g, "").length;

  const raw = input.value.replace(/[^0-9.]/g, "");
  input.value = raw === "" ? "" : groupNumber(parseFloat(raw));

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
  const plain = parseFloat(input.value.replace(/[^0-9.]/g, "")) || 0;
  if (words) words.textContent = input.value === "" ? "" : numberWords(plain);
}


/* (docs mirror — identical to llms.txt · Slider)
   WHEN TO USE: a bounded pick where the feel of more-and-less matters more than the exact digit — years, percentages. Pair it with the number input when precision matters.

   What it is: a real, themed range input — hairline track,
   accent-3 thumb — paired with a live value readout. What it is for: picking a number
   inside a known range where the feel of more-and-less matters more than
   exact digits: years, percentages, counts. When to use it: bounded inputs
   with sensible ends. When the exact number matters, pair it with or swap it
   for the number input. Put an <output> in the field label and facet.js
   keeps it showing the live value. Full keyboard support comes free with the
   native element. */
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


/* (docs mirror — identical to llms.txt · Detailed slider)
   WHEN TO USE: a range too wide for a plain slider to land exactly — a price, a duration in seconds, a token in pixels. Fast coarse drag plus precise fine entry, always in sync.

   What it is: a slider for a wide range, paired with a precise entry. The
   track drags fast in coarse jumps (data-coarse) so you cross a big span in
   one swipe; the −/+ steppers and the number box reach the exact value
   between the jumps (data-fine). All three stay in sync. What it is for:
   values with many gradations where you want both speed and precision — a
   price, a duration in seconds, a token in pixels. When to use it: ranges
   too wide for a plain slider to land precisely. For a small bounded range,
   the plain .slider is enough. facet.js wires it and fires a bubbling
   facet:slide {value} on any change. */
/* --------------------------------------------------------------------------
   DETAILED SLIDER

   What it is: the wiring behind .slider-detail — a wide-range slider that
   drags in coarse jumps (data-coarse) with −/+ steppers and a number box
   for the exact value between jumps (data-fine). The three stay in sync,
   clamped to min/max, and every change fires a bubbling facet:slide.
   -------------------------------------------------------------------------- */
function initDetailSliders() {
  for (const box of document.querySelectorAll(".slider-detail")) {
    const range = box.querySelector('input[type="range"]');
    const number = box.querySelector(".slider-detail-number");
    if (!range || !number) continue;

    const min = Number(box.dataset.min ?? range.min ?? 0);
    const max = Number(box.dataset.max ?? range.max ?? 100);
    const fine = Number(box.dataset.fine) || 1;
    const coarse = Number(box.dataset.coarse) || fine;
    const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / fine) * fine));
    let value = clamp(Number(range.value));

    const sync = (v, emit = true) => {
      value = clamp(v);
      range.value = String(value);
      number.value = String(value);
      if (emit) box.dispatchEvent(new CustomEvent("facet:slide", { bubbles: true, detail: { value } }));
    };

    // Dragging snaps to the coarse jump for fast travel; the keyboard keeps
    // the native fine step, so arrow keys still reach every value.
    let dragging = false;
    range.addEventListener("pointerdown", () => { dragging = true; });
    document.addEventListener("pointerup", () => { dragging = false; });
    range.addEventListener("input", () => {
      const raw = Number(range.value);
      sync(dragging && coarse > fine ? Math.round(raw / coarse) * coarse : raw);
    });

    // Steppers nudge by the fine step; the number box takes an exact entry.
    for (const step of box.querySelectorAll(".slider-detail-step")) {
      step.addEventListener("click", () => sync(value + fine * Number(step.dataset.step)));
    }
    number.addEventListener("input", () => { if (number.value !== "") sync(Number(number.value)); });
    number.addEventListener("change", () => sync(Number(number.value)));

    sync(value, false);
  }
}


/* --------------------------------------------------------------------------
   COPY BUTTON

   (docs mirror — identical to llms.txt · Copy buttons)
   WHEN TO USE: any button that copies text on click — a snippet, a share
   link, a result. One attribute, no JS to write.

   What it is: a button carrying data-copy="#id" copies that element's
   text to the clipboard on click and confirms with the library's own
   toast — never by relabelling the button, which would shift layout and
   lose the button's name to assistive tech mid-press. What it is for:
   "Copy" actions beside code blocks, generated links and results. When
   to use it: wherever a reader takes text away with one tap.

     <pre id="snippet"><code>the text to take away</code></pre>
     <button class="btn btn-small" data-copy="#snippet">Copy</button>
   -------------------------------------------------------------------------- */

function initCopyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const source = document.querySelector(button.dataset.copy);
      if (!source) return;

      await navigator.clipboard.writeText(source.innerText.trim());

      // Confirm with a transient toast, never by rewriting the button —
      // a button that relabels itself shifts layout and loses its name to
      // assistive tech mid-press. facet.toast is the library's own pill.
      facetToast(t("copied"), "success");
    });
  }
}


/* --------------------------------------------------------------------------
   OFFLINE AND INSTALL (PWA)

   What it is: the app-ready machinery, in the library instead of in each
   project. Registration is one attribute; the caching strategy lives in
   /lib/facet-sw.js (cache-first, revalidate behind, updates take over on
   the next navigation — never mid-page).
   What it is for: every Facet product opens instantly, works offline,
   and can be installed to the home screen with a real install button.
   When to use it: create a one-line sw.js in your project root —
   importScripts("https://[domain]/lib/facet-sw.js"); — then point the
   script tag at it with data-service-worker="/sw.js". Give any button
   data-install and it appears only when the browser offers installation;
   facet.install() does the same programmatically. Pair with
   /templates/manifest.json for the icons and name.
   -------------------------------------------------------------------------- */

let serviceWorkerPath = null;   // set by data-service-worker on the script tag
let installPrompt = null;       // the captured beforeinstallprompt event

/* (docs mirror — identical to llms.txt · Installable (PWA))
   WHEN TO USE: any page that should install to a home screen — three small files at the root and the library's caching engine do the rest.

   What it is: the setup that turns any Facet page into an installable, offline-capable app. What it is for: products you want on a phone's home screen — opening full-screen, working offline. When to use it: any app-shaped page. Facet ships the caching engine (/lib/facet-sw.js) plus a working reference set — /sw.js, /manifest.json and /icons/ — that you copy into your own project root. The full step-by-step recipe lives in llms.txt; the app template ships the exact head block below. */
/* Registers the project's one-line worker stub, when the page opted in. */
function initServiceWorker() {
  if (!serviceWorkerPath || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register(serviceWorkerPath).catch(() => {
    /* registration failing (unsupported, blocked) never breaks the page */
  });
}

/* Install buttons: hidden until the browser says the app is installable,
   then one tap shows the real install prompt. */
function initInstallButtons() {
  const buttons = document.querySelectorAll("[data-install]");
  for (const button of buttons) button.hidden = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    for (const button of buttons) button.hidden = false;
  });

  for (const button of buttons) {
    button.addEventListener("click", install);
  }
}

/* The programmatic version: facet.install(). Resolves true if installed. */
async function install() {
  if (!installPrompt) return false;
  installPrompt.prompt();
  const choice = await installPrompt.userChoice;
  installPrompt = null;
  return choice.outcome === "accepted";
}


/* --------------------------------------------------------------------------
   PAGE TRANSITIONS

   What it is: the JS half of seamless page transitions. The CSS half
   (facet.css) animates cross-document navigation on pages carrying
   data-transition="page"; here live the helper and the per-link opt-out.
   What it is for: facet.go(url) navigates with the same transition an
   ordinary link gets — use it after form submissions or programmatic
   flows. A link with data-no-transition snaps the old page straight out
   instead of easing it; the arrival stays the destination's choice.
   When to use it: put data-transition="page" on the html tag (or the
   script tag, or facet.set({transition: "page"})) and every same-origin
   navigation transitions. Browsers without support just navigate.
   -------------------------------------------------------------------------- */

/* Navigate with the page transition — the URL changes for real. */
function go(url) {
  location.assign(url);
}

/* Links that opt out drop the attribute just before leaving, so the
   outgoing animation is skipped for that one navigation. */
function initTransitionOptOuts() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-no-transition]");
    if (link) delete document.documentElement.dataset.transition;
  });
}



/* (docs mirror — identical to llms.txt · Snap section)
   WHEN TO USE: a single-purpose page that tells one story one screen at a time — a calculator's intro, inputs, results. Not for documents (they just scroll), and not for apps with real screen-to-screen navigation (that is the view stack).

   What it is: full-viewport scroll-snap areas. The .snap wrapper scrolls one
   full screen at a time and each .snap-section centers its content at a
   readable width. What it is for: the calculator page skeleton — intro
   screen, then inputs, then results — and any page that tells one story
   one screen at a time. When to use it: single-purpose pages with a clear
   screen-by-screen flow. Not for ordinary documents; normal pages just
   scroll. The .snap wrapper exists to enable scrolling, which is the one
   reason the wrapper law allows a container inside a container. */
/* --------------------------------------------------------------------------
   SNAP PAGER

   What it is: the JS upgrade for .snap — fullpage-style transitions that
   survive iOS. The outer container never free-scrolls: this pager springs
   its scrollTop between section tops (analytic spring w=11 z=0.9, tuned
   and final in every motion profile), so a transition can only land
   on a section top — or the previous section's bottom when paging back
   up. Each section stays exactly one viewport tall and scrolls natively
   INSIDE itself; pulling past its edge hands the gesture to the pager
   with a spring-back hint, and a desktop wheel-push at an edge hops one
   section with a cooldown. After a transition lands, input is swallowed
   for a beat so residual momentum from the same swipe can never page
   twice.
   What it is for: the constraint proven in practice — CSS mandatory snap
   re-snaps tall sections and wedges the next gesture on iOS, proximity
   has no perceptible effect, free-scrolling outers conflict with their sections. The
   pager is the only model that works, so pages that carry .snap get it
   automatically when facet.js is present, and keep plain CSS snapping
   without JS.
   When to use it: nothing to do — any full-viewport .snap upgrades
   itself (the .is-paged class carries the model's CSS). Embedded demo
   frames smaller than the viewport are left alone; data-pager="off" on
   the .snap opts out explicitly. The pager announces moves by
   dispatching "facet:section" on the .snap (detail: {id, index}) and
   exposes itself as element.facetPager {go, toEl, index, settle}.
   Gestures starting on .chart, input or textarea are ignored — those
   own their touches. Reduced motion and data-motion="off" jump
   instantly.
   -------------------------------------------------------------------------- */

function initPagers(opts = {}) {
  for (const snap of document.querySelectorAll(".snap")) {
    const fullViewport = snap.clientHeight >= window.innerHeight * 0.9;
    if (snap.dataset.pager === "off" || !fullViewport) continue;
    facetPager(snap, { gauge: opts.gauge || snap.dataset.gauge !== undefined });
  }
}

function facetPager(snap, opts = {}) {
  const sections = [...snap.querySelectorAll(".snap-section")];
  if (sections.length < 2) return null;
  snap.classList.add("is-paged");
  const mountGauge = !!opts.gauge;

  const reduce = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "off";

  /* The spring: soft, a slight bounce. Tuned constants are fixed. */
  const W = 11, Z = 0.9, DT = 1 / 60;
  let cur = 0, raf = null, x = 0, v = 0, target = 0, onGlide = null, settledAt = 0;

  /* A section's true top, rounded and including its own top border, so
     paging lands exactly on the top even with a 1px divider present. */
  const topOf = (sec) =>
    Math.round(sec.offsetTop + (parseFloat(getComputedStyle(sec).borderTopWidth) || 0));

  const announce = (sec) => {
    snap.dispatchEvent(new CustomEvent("facet:section", {
      detail: { id: sec.id, index: sections.indexOf(sec) },
    }));
  };

  const frame = () => {
    v += (W * W * (target - x) - 2 * Z * W * v) * DT;
    x += v * DT * 60 * DT;
    snap.scrollTop = x;
    if (onGlide) onGlide();
    if (Math.abs(target - x) < 0.5 && Math.abs(v) * DT < 0.5) {
      snap.scrollTop = x = target; v = 0; raf = null; settledAt = performance.now();
      if (onGlide) onGlide(); return;
    }
    raf = requestAnimationFrame(frame);
  };

  const go = (i, { fromBottom = false } = {}) => {
    i = Math.max(0, Math.min(sections.length - 1, i));
    const sec = sections[i];
    if (i !== cur) sec.scrollTop = fromBottom ? sec.scrollHeight : 0;
    cur = i;
    x = snap.scrollTop;
    target = topOf(sec);
    announce(sec);
    if (window.facet && facet.feedback) facet.feedback.snap?.();
    if (reduce()) { snap.scrollTop = x = target; v = 0; settledAt = performance.now(); return; }
    if (!raf) raf = requestAnimationFrame(frame);
  };

  addEventListener("resize", () => {
    if (raf) return;
    snap.scrollTop = x = target = topOf(sections[cur]); v = 0;
  });

  const pager = {
    go,
    toEl: (el) => go(sections.indexOf(el)),
    get index() { return cur; },
    get animating() { return !!raf; },
    settle() { go(Math.round(snap.scrollTop / snap.clientHeight)); },
  };
  snap.facetPager = pager;

  /* Optional whole-page scroll gauge: a draggable right-edge lane whose
     thumb reflects true position across every section laid end to end.
     Each section owns a span of its own height: the first (height - vh)
     is its inner scroll, the trailing vh is the outer transition to the next.
     Mounted when the .snap carries data-gauge (or initPagers({gauge})). */
  if (mountGauge) {
    const vh = () => snap.clientHeight;
    const heights = () => sections.map((s) => Math.max(s.scrollHeight, vh()));
    const metric = () => {
      const h = heights(), v0 = vh();
      let pos = 0;
      for (let i = 0; i < cur; i++) pos += h[i];
      pos += sections[cur].scrollTop;
      return { pos, total: h.reduce((a, b) => a + b, 0), visible: v0 };
    };
    const onScrub = (frac) => {
      const h = heights(), v0 = vh();
      let t = frac * Math.max(1, h.reduce((a, b) => a + b, 0) - v0);
      for (let i = 0; i < sections.length; i++) {
        const inner = h[i] - v0;                 // this section's own scroll span
        if (t <= inner || i === sections.length - 1) {
          go(i);
          sections[i].scrollTop = Math.max(0, Math.min(inner, t));
          if (onGlide) onGlide();
          return;
        }
        t -= h[i];                               // past this section's whole span
      }
    };
    const gauge = facetScrollGauge(snap, {
      className: "scroll-gauge-page", metric, onScrub,
    });
    onGlide = gauge.update;
    snap.addEventListener("facet:section", gauge.update);
    for (const sec of sections) sec.addEventListener("scroll", gauge.update, { passive: true });
    gauge.update();
  }

  /* Gesture handoff: a pull past the active section's edge pages to the
     neighbour; a small spring-back hint shows the pull before it commits. */
  {
    const THRESH = 56;
    /* Momentum swallow: after a transition lands, the same swipe's residual
       momentum keeps streaming input; without a dead time it reads as a new
       gesture and one swipe pages TWO sections. Every gesture path below
       ignores input while animating AND for a beat after the spring settles. */
    const SWALLOW = 350;
    const swallowing = () => !!raf || performance.now() < settledAt + SWALLOW;
    let lastY = 0, pull = 0, consumed = false, tracking = false;
    const hint = () => {
      const capped = Math.max(-110, Math.min(110, pull));
      snap.style.transform = `translateY(${(-capped * 0.28).toFixed(1)}px)`;
    };
    const release = () => {
      snap.style.transition = "transform 320ms cubic-bezier(0.22, 1.3, 0.4, 1)";
      snap.style.transform = "translateY(0)";
      setTimeout(() => { snap.style.transition = ""; }, 340);
    };
    snap.addEventListener("touchstart", (e) => {
      tracking = !swallowing() && e.touches.length === 1
        && !e.target.closest(".chart, input, textarea");
      consumed = false; pull = 0;
      if (tracking) lastY = e.touches[0].clientY;
    }, { passive: true });
    snap.addEventListener("touchmove", (e) => {
      if (!tracking || consumed || swallowing()) return;
      const y = e.touches[0].clientY;
      const dy = lastY - y;                 // > 0: pushing DOWN the page
      lastY = y;
      if (!dy) return;
      const sec = sections[pager.index];
      const max = sec.scrollHeight - sec.clientHeight;
      const atTop = sec.scrollTop <= 1, atBottom = sec.scrollTop >= max - 1;
      if ((dy > 0 && atBottom) || (dy < 0 && atTop)) {
        if (pull && (pull > 0) !== (dy > 0)) pull = 0;   // reversal restarts
        pull += dy;
        if (e.cancelable) e.preventDefault();
        hint();
        if (Math.abs(pull) > THRESH) {
          consumed = true;
          release();
          go(pager.index + (pull > 0 ? 1 : -1), { fromBottom: pull < 0 });
          pull = 0;
        }
      } else if (pull) { pull = 0; release(); }
    }, { passive: false });
    const endTouch = () => { if (pull) { pull = 0; release(); } tracking = false; };
    snap.addEventListener("touchend", endTouch, { passive: true });
    snap.addEventListener("touchcancel", endTouch, { passive: true });

    // Desktop wheel: an edge-push hops one section, then cools down.
    let acc = 0, accT = 0, cool = 0;
    snap.addEventListener("wheel", (e) => {
      const now = performance.now();
      if (swallowing() || now < cool) { e.preventDefault(); return; }
      const sec = sections[pager.index];
      const max = sec.scrollHeight - sec.clientHeight;
      const atTop = sec.scrollTop <= 1, atBottom = sec.scrollTop >= max - 1;
      if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
        e.preventDefault();
        if (now - accT > 250) acc = 0;
        accT = now;
        acc += e.deltaY;
        if (Math.abs(acc) > 60) {
          acc = 0;
          cool = now + 650;
          go(pager.index + (e.deltaY > 0 ? 1 : -1), { fromBottom: e.deltaY < 0 });
        }
      }
    }, { passive: false });
  }

  announce(sections[0]);
  return pager;
}


/* --------------------------------------------------------------------------
   APP MODULES — ingested verbatim from the shipped inflation app.

   What they are: the six behaviours behind Facet's app components, each
   consumed through its small API. Tuned spring constants are final in
   every motion profile; only reduced motion quiets them.

     facetFeedback()          -> { sound, haptic, tap, tick, snap, toggle,
                                   success }  (sound.enabled / haptic.enabled)
     facetSheet(sheet, scrim, {onChange}) -> { open, close, toggle, isOpen }
     facetScrollGauge(scroller, {className, metric, onScrub, onScrubEnd})
                              -> { update }
     facetTabIndicator(bar)   -> { moveTo }
     facetInstallNudge(el, {storageKey, delay, busy})
                              -> { standalone, installed, addNow, never }
     facetMotion              -> { register(selector, {xMax, yMax} or
                                   {light: true}), init({scrollRoot}),
                                   setMode(mode), cycle(), mode }
                                   modes: off|cursor|tilt|idle
     facet.views (initViews)  -> { go(id), back(), current }  the
                                   view-stack app shell, hash-routed

   Auto-wiring (below the modules): facet.feedback is created at load —
   sounds and haptics ON by default, per the recorded decision, with
   .sound.enabled/.haptic.enabled as the switches the settings controls
   flip. A .tab-bar wires itself: its indicator pill is injected, its
   [data-section] segments drive the page's snap pager, the pager's
   facet:section events move the pill back (a 1s nav lock keeps
   pass-through sections from moving it), and a [aria-controls] trigger
   opens its sheet through facetSheet. Velvet rule: elements carrying
   velvet lift/press transforms must NOT register with facetMotion —
   inline transforms collide.
   -------------------------------------------------------------------------- */


/* (docs mirror — identical to llms.txt · Sound & haptics)
   WHEN TO USE: any app-shaped product — leave it on and the components click, tick and snap by themselves; the settings sheet's switches are the user's mute.

   What it is: synthesized UI sound and vibration with no audio files — facet.feedback plays short Web Audio blips (tap, tick, snap, toggle, success) and fires navigator.vibrate haptics, both ON by default. What it is for: the physical feel of an app — a tick as a stepper bumps, a soft snap as a pager settles, a tap under every control. When to use it: any app-shaped product; leave it on and it wires itself to the components. There is almost no HTML to write: the user's switches are the settings sheet's Sounds and Haptics toggles (data-control="sounds" / "haptics", self-wired), and the components already call it. To fire it yourself: facet.feedback.tap() / .tick() / .snap() / .success(); mute a channel with facet.feedback.sound.enabled = false or .haptic.enabled = false. Reduced-motion and a muted switch silence it. */
/* Synthesized UI sounds (Web Audio, no files) + vibration haptics.
   Sounds unlock on the first gesture; navigator.vibrate is Android-only. */
const facetFeedback = () => {
  let ctx = null;
  const ensure = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const sound = { enabled: true };
  const blip = (freq, dur, type, gain, slideTo) => {
    if (!sound.enabled) return;
    try {
      const c = ensure(), t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch { /* no audio: stay silent */ }
  };
  const haptic = { enabled: true };
  const buzz = p => { if (haptic.enabled && navigator.vibrate) navigator.vibrate(p); };
  return {
    sound, haptic,
    tick:    () => { blip(2100, 0.03, "square", 0.012); buzz(4); },
    tap:     () => { blip(620, 0.06, "sine", 0.05, 930); buzz(8); },
    snap:    () => { blip(460, 0.09, "sine", 0.045, 340); buzz(8); },
    toggle:  () => { blip(520, 0.05, "triangle", 0.045); buzz(8); },
    success: () => {
      blip(660, 0.09, "sine", 0.05);
      setTimeout(() => blip(880, 0.12, "sine", 0.05), 90);
      buzz([10, 40, 14]);
    },
  };
};

/* (docs mirror — identical to llms.txt · Sheet & menu)
   WHEN TO USE: the app's settings and secondary navigation, behind one button — the right-edge panel every calculator shares.

   What it is: the settings panel — a right-edge slab floating clear of the screen over a dark scrim, sliding in as one rigid block on a spring that overshoots slightly and eases back; inside it, menu groups of thin rows (.menu-item under a .menu-label) and a foot row of square icon toggles (.menu-icon-btn) whose ON state stands raised while OFF sinks into a darker well. What it is for: navigation, actions and app-level controls behind one trigger — any button that aria-controls the sheet opens it; scrim tap and Esc close; the trigger's aria-expanded is managed. When to use it: every app-shaped product's settings. Press a row: it sinks INTO the panel with a true bevel, never a dark smear. State changes ease — toggles must never jump. */
/* Right-edge sheet over a darkening scrim — entry driven by the same
   analytic per-edge springs as the tab pill. Opening, the frame's LEFT
   edge leads and overshoots (the panel stretches past its resting width
   and eases back) while the RIGHT edge is critically damped: it settles
   to its resting line and never crosses it. Content that must land
   linearly sits in a fixed-width wrapper anchored to the right edge
   (.sheet-scroll) — the frame flexes around still text, exactly the
   tab bar's moving-pill-under-still-labels technique; a full-width foot
   (.sheet-foot) follows the stretch instead. Scrim tap and Esc close. */
const facetSheet = (sheet, scrim, opts = {}) => {
  const DT = 1 / 60;
  // one spring on the whole panel's X: it slides in as a rigid block —
  // frame, text and buttons together — overshoots slightly past its
  // resting edge, then springs back. Close is critically damped.
  const OPEN = { w: 15, z: 0.62 }, CLOSE = { w: 18, z: 1.0 };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let closedX = 0, x = 0, v = 0, target = 0, params = OPEN;
  let raf = null, opened = false, measured = false;
  const measure = () => {
    const right = parseFloat(getComputedStyle(sheet).right) || 0;
    closedX = sheet.offsetWidth + right + 16;   // fully off the right edge
  };
  const render = () => { sheet.style.transform = `translate(${x.toFixed(2)}px, -50%)`; };
  const frame = () => {
    v += (params.w * params.w * (target - x) - 2 * params.z * params.w * v) * DT;
    x += v * DT * 60 * DT;
    render();
    if (Math.abs(target - x) + Math.abs(v) * DT < 0.4) {
      x = target; v = 0; render();
      if (!opened) sheet.style.visibility = "hidden";
      raf = null;
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  const set = open => {
    opened = open;
    if (!measured) { measure(); x = closedX; measured = true; }
    sheet.dataset.open = String(open);
    scrim.dataset.open = String(open);
    sheet.setAttribute("aria-hidden", String(!open));
    params = open ? OPEN : CLOSE;
    target = open ? 0 : closedX;
    if (open) sheet.style.visibility = "visible";
    if (reduce) {
      x = target; v = 0; render();
      if (!open) sheet.style.visibility = "hidden";
    } else if (!raf && Math.abs(target - x) > 0.4) {
      raf = requestAnimationFrame(frame);
    }
    if (opts.onChange) opts.onChange(open);
  };
  addEventListener("resize", () => {
    measured = false;
    if (opened) { measure(); x = target = 0; v = 0; render(); }
  });
  scrim.addEventListener("click", () => set(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  return {
    open: () => set(true),
    close: () => set(false),
    toggle() { set(sheet.dataset.open !== "true"); },
    get isOpen() { return sheet.dataset.open === "true"; },
  };
};

/* (docs mirror — identical to llms.txt · Scroll gauge)
   WHEN TO USE: long scrollers inside app screens — a slim thumb that shows how much is left and drags to scrub.

   What it is: a pill thumb inset in an embossed groove beside a scroller — thumb height is the visible share of the content, position is progress, and overscroll momentum slides it out of the groove where the clip swallows it. What it is for: a themed, unobtrusive scrollbar look-alike for panels and whole pages; facet.scrollGauge(scroller) injects it, a metric option reports composite scrolls (the pager's sections laid end to end), and onScrub makes the lane a drag handle. When to use it: sheets and app pages where the native scrollbar is hidden. Auto-hides when nothing overflows. Scroll the box: */
/* Floating scroll gauge: injects a scrollbar look-alike (.scroll-gauge)
   beside a scrolling element — thumb height = the visible share of the
   content, thumb position = how far in you are. Call update() after
   content or visibility changes. */
const facetScrollGauge = (scroller, opts = {}) => {
  const track = document.createElement("div");
  track.className = "scroll-gauge" + (opts.className ? ` ${opts.className}` : "");
  track.setAttribute("aria-hidden", "true");
  const thumb = document.createElement("div");
  thumb.className = "scroll-gauge-thumb";
  track.appendChild(thumb);
  scroller.parentElement.appendChild(track);
  // Default: read the scroller directly. A {metric} option lets a caller
  // report a composite (e.g. an outer snap scroller whose sections each
  // scroll internally) so the thumb still reflects the WHOLE page.
  const measure = opts.metric || (() => ({
    pos: scroller.scrollTop, total: scroller.scrollHeight, visible: scroller.clientHeight,
  }));
  const update = () => {
    // inner height of the groove (clientHeight minus its padding)
    const cs = getComputedStyle(track);
    const h = track.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const m = measure();
    if (h <= 0 || !m.total) return;
    const size = Math.max(h * (m.visible / m.total), 12);
    const maxScroll = m.total - m.visible;
    // deliberately unclamped: overscroll momentum slides the pill out of
    // the groove, where overflow:hidden clips it away
    const y = maxScroll > 0 ? (m.pos / maxScroll) * (h - size) : 0;
    thumb.style.height = `${size}px`;
    thumb.style.transform = `translateY(${y}px)`;
    // nothing to scroll -> no gauge
    track.style.opacity = m.total > m.visible + 1 ? "" : "0";
  };
  scroller.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  // Optional: make the lane a grab handle. The caller maps a 0..1
  // fraction to a scroll position (it knows the scroller's real shape).
  if (opts.onScrub) {
    const frac = clientY => {
      const r = track.getBoundingClientRect();
      const cs2 = getComputedStyle(track);
      const pt = parseFloat(cs2.paddingTop), pb = parseFloat(cs2.paddingBottom);
      const inner = r.height - pt - pb;
      const size = thumb.offsetHeight || 12;
      const y = clientY - r.top - pt - size / 2;
      return Math.max(0, Math.min(1, y / Math.max(1, inner - size)));
    };
    let dragging = false;
    track.addEventListener("pointerdown", e => {
      dragging = true;
      track.classList.add("grabbing");
      try { track.setPointerCapture(e.pointerId); } catch { /* ok */ }
      opts.onScrub(frac(e.clientY));
      e.preventDefault();
    });
    track.addEventListener("pointermove", e => { if (dragging) opts.onScrub(frac(e.clientY)); });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("grabbing");
      if (opts.onScrubEnd) opts.onScrubEnd();
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
  }
  update();
  return { update };
};

/* Add-to-Home-Screen state + a once-per-session nudge.
   The web can't ask iOS "is this installed?" — but a standalone launch
   (display-mode / navigator.standalone) can only happen FROM the icon,
   so the first such launch stamps "installed" in localStorage for all
   later browser visits. Android fires beforeinstallprompt/appinstalled,
   so it gets the real native prompt instead of a how-to overlay.
   After `delay` ms the given element is shown once per session, unless:
   already standalone, stamped installed, opted out ("never"), or there
   is no install path to guide (not iOS, no captured prompt). `busy()`
   lets the host postpone the nudge while other overlays are up.
   addNow() resolves "native" (Android prompt shown) or "guide" (the
   caller should show its own instruction overlay). */
const facetInstallNudge = (el, opts = {}) => {
  const KEY = opts.storageKey || "facet-a2hs";
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
  const standalone = matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;
  if (standalone) store(KEY, "installed");
  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  addEventListener("appinstalled", () => store(KEY, "installed"));
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const flag = () => { try { return localStorage.getItem(KEY); } catch { return "never"; } };
  const asked = () => { try { return sessionStorage.getItem(KEY + "-asked"); } catch { return "yes"; } };
  const tryShow = () => {
    if (standalone || flag() || asked()) return;
    if (!isIOS && !deferred) return;       // nothing to guide — stay quiet
    if (opts.busy && opts.busy()) { setTimeout(tryShow, 15000); return; }
    try { sessionStorage.setItem(KEY + "-asked", "true"); } catch { /* ok */ }
    if (el) el.hidden = false;
  };
  if (el) setTimeout(tryShow, opts.delay ?? 30000);
  return {
    standalone,
    get installed() { return flag() === "installed"; },
    async addNow() {
      if (!deferred) return "guide";
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === "accepted") store(KEY, "installed");
      return "native";
    },
    never() { store(KEY, "never"); },
  };
};

/* Sliding pill for a .tab-bar — real spring physics, rebuilt.
   Each edge of the pill is its own spring chasing the target segment:
   the edge on the travel side is stiff (leads with momentum), the far
   edge is softer (lags, stretching the pill), and both are lightly
   under-damped so they arrive with a small, natural overshoot and
   settle — no keyframes, no scripted shapes. */
const facetTabIndicator = bar => {
  const ind = document.createElement("span");
  ind.className = "tab-indicator";
  ind.setAttribute("aria-hidden", "true");
  bar.prepend(ind);
  /* analytic springs: overshoot is a fixed small fraction (~5%) of the
     jump no matter its length. omega = speed, zeta = bounce character */
  const LEAD = { w: 16, z: 0.70 }, TRAIL = { w: 10, z: 0.62 };
  const DT = 1 / 60;
  let cur = null, raf = null, dirRight = true;
  let L = 0, R = 0, vL = 0, vR = 0, tL = 0, tR = 0;
  const render = () => {
    ind.style.transform = `translateX(${L.toFixed(2)}px)`;
    ind.style.width = `${(R - L).toFixed(2)}px`;
  };
  const step = (x, v, t, p) => {
    v += (p.w * p.w * (t - x) - 2 * p.z * p.w * v) * DT;
    return [x + v * DT * 60 * DT, v];  // dt-scaled position update
  };
  const frame = () => {
    const pL = dirRight ? TRAIL : LEAD;
    const pR = dirRight ? LEAD : TRAIL;
    [L, vL] = step(L, vL, tL, pL);
    [R, vR] = step(R, vR, tR, pR);
    render();
    if (Math.abs(tL - L) + Math.abs(tR - R) + (Math.abs(vL) + Math.abs(vR)) * DT < 0.5) {
      L = tL; R = tR; vL = vR = 0; render();
      raf = null;
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  const moveTo = seg => {
    if (!seg) return;
    const first = !cur;
    cur = seg;
    tL = seg.offsetLeft;
    tR = tL + seg.offsetWidth;
    if (first) { L = tL; R = tR; render(); return; }
    dirRight = (tL + tR) / 2 >= (L + R) / 2;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  addEventListener("resize", () => {
    if (!cur) return;
    tL = L = cur.offsetLeft; tR = R = tL + cur.offsetWidth;
    vL = vR = 0; render();
  });
  return { moveTo };
};

/* (docs mirror — identical to llms.txt · Parallax & idle motion)
   WHEN TO USE: heroes, illustrations, decorative cards — movement at the edges, never on the reading path; one or two moving things per screen.

   What it is: ambient motion, on by default. data-parallax="depth" registers an
   element with facet.motion — it drifts up to depth pixels behind the
   desktop pointer, the scroll's momentum (a velocity impulse), the
   device tilt where no permission gate blocks it (iOS gates it;
   facet.motion.setMode("tilt") asks), or the engine's idle life where
   nothing else drives (modes: off | cursor | tilt | idle). Cursor and
   tilt mirror the real world directly — just enough smoothing to hide
   jitter, no easing lag — and when the pointer or device goes still the
   vector drifts slowly back to centre, so nothing rests jammed
   off-centre. In idle the vector sweeps one fast full lap of the rim
   (about a second), rests three, and sweeps again; gated touch devices
   land here by default. The same engine's light channel drives the shine
   effect (next entry) from the same vector. The idle-* classes
   (.idle-float, .idle-sway, .idle-pulse) give resting elements a slow
   pulse; they animate the separate translate/rotate/scale properties so
   they compose with the engine's transform instead of colliding — the
   parallax exclusion, solved structurally. Never put data-parallax on
   elements with their own transform physics (velvet lift/press, the
   pager). Calm stills idle life; data-motion="off" and
   prefers-reduced-motion still everything. */
/* Motion engine — one input, two channels. The device's movement (tilt,
   cursor, or the idle drift when neither exists) is normalised into one
   springy vector; the scroll velocity of the page adds a vertical kick,
   so everything moves with momentum and settles back to its true
   position on its own. Each registered part spends the vector on one of
   two channels:
     move   (data-parallax) the element translates, up to xMax/yMax px
     light  (data-shine)    the element's --shine-x/--shine-y light-
                            direction custom properties follow the same
                            vector, so the shine overlay's highlight and
                            shade travel with the device — parallax and
                            shine share one physics, one orientation
     modes: "off"     nothing moves; shine rests at its CSS default
            "cursor"  pointer position, mirrored directly (scroll kick
                      still applies); drifts home when the pointer stops
            "tilt"    device orientation, mirrored directly; asks iOS
                      permission on demand; drifts home when still
            "idle"    no input available: one fast lap of the rim
                      (~1s), a ~3s rest, repeat
   init() auto-picks: tilt where no permission gate exists (Android),
   idle on gated touch devices (iOS, until setMode("tilt") asks and is
   granted), cursor elsewhere, off under prefers-reduced-motion. */
const facetMotion = (() => {
  const parts = [];
  let mode = "off";
  let target = { x: 0, y: 0 };
  let kick = 0;
  let raf = null;
  let tiltBase = null;
  let scrollRoot = null, lastTop = 0, lastT = 0;
  let idleStart = null;
  let lastInput = 0;                 // when the real world last actually moved
  let lastTiltX = null, lastTiltY = null;
  const TRACK = 0.5;                 // per-frame catch-up: the vector is the real
                                     // world, so parts track it directly — a
                                     // couple of frames of smoothing kills
                                     // jitter, and there is no easing lag
  const RETURN_DELAY = 1200;         // ms of stillness before centring begins
  const RETURN_RATE = 0.985;         // the slow per-frame drift home
  const IDLE_BASE = 2.1;
  const IDLE_LAP = 1000, IDLE_REST = 3000;   // one fast lap, then a rest
  const IDLE_R = 0.7;
  const clamp1 = v => Math.max(-1, Math.min(1, v));

  const frame = now => {
    // the idle life: one fast full lap of the rim (~1s), then a ~3s
    // rest at the starting point, repeating — motion breathes on a
    // still desk instead of crawling forever
    if (mode === "idle") {
      if (idleStart === null) idleStart = now;
      const t = (now - idleStart) % (IDLE_LAP + IDLE_REST);
      const a = IDLE_BASE + Math.min(1, t / IDLE_LAP) * Math.PI * 2;
      target.x = Math.cos(a) * IDLE_R;
      target.y = Math.sin(a) * IDLE_R;
    } else if ((mode === "cursor" || mode === "tilt") && now - lastInput > RETURN_DELAY) {
      // the real world went still: drift the vector slowly home, so
      // nothing rests jammed off-centre when the hand stops
      target.x *= RETURN_RATE;
      target.y *= RETURN_RATE;
    }
    let settled = true;
    for (const p of parts) {
      const tx = mode === "off" ? 0 : target.x * p.xMax;
      const ty = mode === "off" ? 0 : target.y * p.yMax + kick * p.yMax * 2;
      // direct tracking: no spring, no overshoot — the element IS the
      // vector, smoothed just enough to hide sensor and pointer jitter
      p.x += (tx - p.x) * TRACK;
      p.y += (ty - p.y) * TRACK;
      if (Math.abs(tx - p.x) + Math.abs(ty - p.y) > p.eps) settled = false;
      if (p.kind === "light") {
        p.el.style.setProperty("--shine-x", clamp1(p.x).toFixed(3));
        p.el.style.setProperty("--shine-y", clamp1(p.y).toFixed(3));
      } else {
        p.el.style.transform =
          `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0)`;
      }
    }
    kick *= 0.9;
    // sleep only once the parts sit still AND the vector is home — the
    // return-to-centre drift is driven by this loop, so it must keep
    // running while the target is anywhere but the middle
    if (mode !== "idle" && settled && Math.abs(kick) < 0.002 &&
        Math.abs(target.x) + Math.abs(target.y) < 0.004) {
      raf = null;
      if (mode === "off")
        for (const p of parts) {
          p.x = p.y = 0;
          if (p.kind === "light") {
            // back to the stylesheet's resting light (lit from above)
            p.el.style.removeProperty("--shine-x");
            p.el.style.removeProperty("--shine-y");
          } else p.el.style.transform = "";
        }
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const onPointer = e => {
    if (mode !== "cursor") return;
    target.x = clamp1((e.clientX / innerWidth) * 2 - 1);
    target.y = clamp1((e.clientY / innerHeight) * 2 - 1);
    lastInput = performance.now();
    wake();
  };
  const onTilt = e => {
    if (mode !== "tilt" || e.beta == null || e.gamma == null) return;
    if (tiltBase === null) tiltBase = e.beta;
    tiltBase += (e.beta - tiltBase) * 0.004;  // slow drift back to centre
    const x = clamp1(e.gamma / 24);
    const y = clamp1((e.beta - tiltBase) / 24);
    // many devices fire orientation events forever even when perfectly
    // still — only a reading that actually CHANGED counts as input, so
    // a resting device still drifts home
    if (lastTiltX === null || Math.abs(x - lastTiltX) + Math.abs(y - lastTiltY) > 0.006) {
      lastInput = performance.now();
      lastTiltX = x; lastTiltY = y;
    }
    target.x = x;
    target.y = y;
    wake();
  };
  const onScroll = () => {
    if (mode === "off") return;
    const now = performance.now();
    const top = scrollRoot.scrollTop;
    const v = (top - lastTop) / Math.max(8, now - lastT);   // px per ms
    lastTop = top; lastT = now;
    kick = clamp1(kick - v * 0.35);
    wake();
  };

  const setMode = async want => {
    if (want === "tilt") {
      const D = window.DeviceOrientationEvent;
      // no gyroscope, or permission refused: idle keeps the motion alive
      if (!D) want = "idle";
      else if (typeof D.requestPermission === "function") {
        try { if (await D.requestPermission() !== "granted") want = "idle"; }
        catch { want = "idle"; }
      }
    }
    mode = want;
    tiltBase = null;
    idleStart = null;
    lastTiltX = lastTiltY = null;
    if (mode === "off") { target.x = target.y = 0; kick = 0; }
    wake();
    return mode;
  };

  return {
    register(target, o) {
      const els = typeof target === "string"
        ? document.querySelectorAll(target)
        : [target];
      for (const el of els)
        parts.push(o.light
          ? { el, kind: "light", xMax: 1, yMax: 1, eps: 0.008, x: 0, y: 0 }
          : { el, kind: "move", xMax: o.xMax, yMax: o.yMax, eps: 0.06, x: 0, y: 0 });
    },
    init(opts = {}) {
      scrollRoot = opts.scrollRoot || document.scrollingElement;
      lastTop = scrollRoot.scrollTop;
      lastT = performance.now();
      addEventListener("pointermove", onPointer, { passive: true });
      addEventListener("deviceorientation", onTilt);
      scrollRoot.addEventListener("scroll", onScroll, { passive: true });
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setMode("off");
      const gated = window.DeviceOrientationEvent
        && typeof DeviceOrientationEvent.requestPermission === "function";
      const coarse = matchMedia("(pointer: coarse)").matches;
      return setMode(coarse
        ? (window.DeviceOrientationEvent && !gated ? "tilt" : "idle")
        : "cursor");
    },
    setMode,
    cycle() {
      return setMode(mode === "off" ? "cursor"
        : mode === "cursor" ? "tilt"
        : mode === "tilt" ? "idle" : "off");
    },
    get mode() { return mode; },
  };
})();



/* Declarative ambient motion: any element carrying data-parallax="depth"
   (px of maximum drift, default 8) registers on the engine's move
   channel, any element carrying data-shine registers on its light
   channel, and the engine starts — desktop pointer drives it, scroll
   velocity kicks it, gyro devices without a permission gate follow
   tilt, and gated touch devices fall back to the idle drift.
   data-motion="off" and prefers-reduced-motion keep everything still.
   The exclusion rule is structural and applies to the MOVE channel
   only: the engine owns style.transform there, so never put
   data-parallax on elements with their own transform physics (velvet
   lift/press, the pager). data-shine is exempt — the light channel
   writes only the --shine-x/--shine-y custom properties, which
   compose with any transform. The idle-* classes are safe company
   too — they animate the separate translate/rotate/scale properties. */
function initAmbientMotion() {
  const movers = [...document.querySelectorAll("[data-parallax]")];
  const shiners = [...document.querySelectorAll("[data-shine]")];
  if (!movers.length && !shiners.length) return;
  for (const el of movers) {
    const depth = parseFloat(el.dataset.parallax) || 8;
    facetMotion.register(el, { xMax: depth, yMax: depth });
  }
  for (const el of shiners) {
    // the overlay is a .shine child (the pseudo-elements stay free for
    // the tooltip); inject it unless the author already wrote one
    if (!el.querySelector(":scope > .shine")) {
      const overlay = document.createElement("span");
      overlay.className = "shine";
      overlay.setAttribute("aria-hidden", "true");
      el.appendChild(overlay);
    }
    facetMotion.register(el, { light: true });
  }
  facetMotion.init();
  if (document.documentElement.dataset.motion === "off") facetMotion.setMode("off");
}

/* Glyph backgrounds — the customizable member of the background set.
   data-bg-glyph="✦" on any surface (any character or emoji, a facet
   icon name, or several tokens separated by spaces for an alternating
   grid) draws a repeating tile as an inline SVG in the same faint
   pattern ink the other backgrounds use; data-bg-glyph-size sets the
   cell in px (default 56). The pattern rides the attributes: change
   data-bg-glyph, the theme or the mode at any time and it redraws
   itself (one MutationObserver). facet.glyphBackground(el) draws one
   you inserted after load. */
function drawGlyphBackground(el) {
  const raw = (el.dataset.bgGlyph || "").trim();
  if (!raw) {
    el.style.removeProperty("--bg-glyph");
    el.style.removeProperty("--bg-glyph-tile");
    return;
  }
  const tokens = raw.split(/\s+/).slice(0, 8);
  // spacing: the explicit px override, else the shared --bg-cell knob
  let cell = parseFloat(el.dataset.bgGlyphSize);
  if (!cell) {
    const cs = getComputedStyle(el).getPropertyValue("--bg-cell").trim();
    cell = cs.endsWith("rem") ? parseFloat(cs) * 16 : parseFloat(cs);
  }
  cell = Math.max(16, cell || 56);
  const scale = Math.min(1, Math.max(0.1, parseFloat(el.dataset.bgGlyphScale) || 0.42));
  // resolve the pattern ink to a concrete color — an SVG data URI is
  // its own little document and cannot read the page's tokens
  const probe = document.createElement("i");
  probe.style.color = "var(--bg-ink)";
  el.appendChild(probe);
  const ink = getComputedStyle(probe).color;
  probe.remove();
  const cx = cell / 2;
  const w = cell * tokens.length;
  const parts = tokens.map((t, i) => {
    const x = i * cell + cx;
    const icon = FACET_ICONS[t];
    if (icon) {
      const k = (cell * scale) / 24;
      const off = (cell * scale) / 2;
      return `<g transform="translate(${x - off} ${cx - off}) scale(${k})" ` +
        `fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icon}</g>`;
    }
    const safe = t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<text x="${x}" y="${cx}" font-size="${cell * scale}" fill="${ink}" ` +
      `text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif">${safe}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${cell}" viewBox="0 0 ${w} ${cell}">${parts}</svg>`;
  el.style.setProperty("--bg-glyph", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  el.style.setProperty("--bg-glyph-tile", `${w}px ${cell}px`);
}
/* Fluid backgrounds — variant fluid of the background set. Any surface
   carrying data-bg-fluid gets three .bg-fluid-layer spans: the ground,
   the big breathing color pools, and the small drifting bubbles. All
   color comes from the stylesheet (theme tokens), so themes and modes
   recolor the field with no redraw; the desynced CSS clocks keep it
   from visibly repeating. Idempotent; facet.fluidBackground(el) mounts
   one you inserted after load. */
function mountFluidBackground(el) {
  if (el.querySelector(":scope > .bg-fluid-layer")) return;
  for (let i = 0; i < 3; i++) {
    const layer = document.createElement("span");
    layer.className = "bg-fluid-layer";
    layer.setAttribute("aria-hidden", "true");
    el.prepend(layer);
  }
}
function initFluidBackgrounds() {
  for (const el of document.querySelectorAll("[data-bg-fluid]")) mountFluidBackground(el);
}

function initGlyphBackgrounds() {
  const all = () => document.querySelectorAll("[data-bg-glyph]");
  for (const el of all()) drawGlyphBackground(el);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.attributeName === "data-theme" || m.attributeName === "data-mode") {
        for (const el of all()) drawGlyphBackground(el);
      } else if (m.target instanceof Element &&
                 (m.attributeName !== "style" || m.target.dataset.bgGlyph !== undefined)) {
        drawGlyphBackground(m.target);   // draws, or clears when the attribute left
      }
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bg-glyph", "data-bg-glyph-size", "data-bg-glyph-scale", "style", "data-theme", "data-mode"],
    subtree: true,
  });
}

/* (docs mirror — identical to llms.txt · View stack)
   WHEN TO USE: an app with real screens and a working Back button — home, question, result. One per page, as the page's <main>. For a one-story scroll, use the snap shell instead.

   What it is: the app shell for apps with real screens — a <main
   class="view-stack"> of .view sections where exactly one shows at a
   time, each scrolling on its own, content centered by auto margins when
   short. Navigation is plain hash links: any <a href="#result"> switches
   views, facet.views.go(id) and .back() do it from code, the URL always
   names the screen, and the browser's own Back walks the trail (back()
   falls home to the first view when there is nothing left to pop). Every
   view pads itself clear of the Dynamic Island (safe-area top) and of
   the home bar plus the nav menu (safe-area bottom + clearance); opt a
   view out with .bleed-top. What it is for: screen-to-screen apps — home
   → question → result → leaderboard — where the paged .snap shell (one
   long page you page through) is the wrong shape. When to use it: one
   view-stack per page, as the page's <main>, one .view per screen with a
   real id. facet.js upgrades it (.is-stacked, like .snap → .is-paged):
   html gets .is-app-shell, the page locks to the viewport, one view
   shows. With JS off the screens simply stack in reading order and the
   links jump between them — everything stays crawlable. Views keep their
   scroll positions while hidden, so Back returns exactly where the
   visitor left. Each arrival fires a bubbling "facet:view" CustomEvent
   ({view, from}) on the stack and moves focus to the view. */
/* The view stack — the app shell for apps with real screens (home →
   question → result). Upgrades <main class="view-stack"> the way the
   pager upgrades .snap: html gets .is-app-shell (the page locks to the
   viewport), the stack gets .is-stacked, and exactly one .view shows.
   Navigation is the URL hash: a plain <a href="#result"> switches
   views natively, facet.views.go(id)/back() do it from code, and the
   browser's own Back walks the trail (back() falls home to the first
   view when there is nothing left to pop). Each arrival fires a
   bubbling "facet:view" CustomEvent {view, from} and moves focus to
   the view for keyboard and reader users. With JS off nothing
   upgrades: the views stack in reading order and the links jump. */
function initViews() {
  const stack = document.querySelector("main.view-stack");
  if (!stack) return;
  const views = [...stack.querySelectorAll(":scope > .view")].filter(v => v.id);
  if (!views.length) return;
  document.documentElement.classList.add("is-app-shell");
  stack.classList.add("is-stacked");
  const find = id => views.find(v => v.id === id);
  const trail = [];                 // the ids visited, for back()
  let current = null;
  const activate = (view, focus) => {
    if (view === current) return;
    const from = current ? current.id : null;
    current = view;
    // a step back along the trail pops it; anything else extends it
    if (trail[trail.length - 2] === view.id) trail.pop();
    else trail.push(view.id);
    for (const v of views) v.classList.toggle("is-active", v === current);
    if (focus) {
      current.setAttribute("tabindex", "-1");
      current.focus({ preventScroll: true });
    }
    stack.dispatchEvent(new CustomEvent("facet:view", {
      bubbles: true,
      detail: { view: current.id, from },
    }));
  };
  const go = id => {
    const view = find(id);
    if (view && view !== current) location.hash = id;   // hashchange activates
  };
  const back = () => {
    if (trail.length > 1) history.back();
    else if (current !== views[0]) go(views[0].id);
  };
  addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const view = id ? find(id) : views[0];   // no hash = the entry state = first view
    if (view) activate(view, true);
  });
  activate(find(decodeURIComponent(location.hash.slice(1))) || views[0], false);
  window.facet.views = { go, back, get current() { return current.id; } };
}

/* Print & export: the JS half of the print system. beforeprint opens
   every closed <details> (folds and accordions cannot be opened from
   CSS alone) and forces lazy images to load so nothing prints blank;
   afterprint restores exactly what it opened. Any button carrying
   data-print-action="page" prints the page — the documented
   Save-as-PDF affordance (give it data-event="export-pdf"). */
function initPrint() {
  let opened = [];
  addEventListener("beforeprint", () => {
    opened = [...document.querySelectorAll("details:not([open])")];
    for (const d of opened) d.open = true;
    for (const img of document.querySelectorAll('img[loading="lazy"]')) img.loading = "eager";
  });
  addEventListener("afterprint", () => {
    for (const d of opened) d.open = false;
    opened = [];
  });
  for (const btn of document.querySelectorAll('[data-print-action="page"]')) {
    btn.addEventListener("click", () => print());
  }
}

/* (docs mirror — identical to llms.txt · Tab bar)
   WHEN TO USE: section navigation in app-shaped pages with a snap pager — three to five destinations, thumb height.

   What it is: the iOS-style bottom pill — text segments, a hairline divider, a trailing settings button — with one injected .tab-indicator pill moving behind the active segment on per-edge analytic springs: the leading edge leads with momentum, the trailing edge lags so the pill stretches, and both settle with a small fixed overshoot whatever the jump length. What it is for: section navigation in app-shaped pages; it wires itself to the page's snap pager ([data-section] segments page there, and the pager's moves slide the pill back behind a one-second nav lock so pass-through sections stay quiet) and its settings button opens the sheet it aria-controls. When to use it: any snap-paged product. On a real page it floats fixed above the bottom edge; here it sits in the flow. Frosted and embossed in the base theme; a tuned translucent well with a raised pill under Velvet. */
/* The auto-wiring: tab bars find their pager and their sheet. */
function initTabBars() {
  for (const bar of document.querySelectorAll(".tab-bar")) {
    const indicator = facetTabIndicator(bar);
    const segs = [...bar.querySelectorAll(".tab-seg")];
    const snap = document.querySelector(".snap.is-paged");
    const pager = snap && snap.facetPager;
    let navLockUntil = 0;

    const mark = (id) => {
      const seg = segs.find((s) => s.dataset.section === id);
      if (!seg) return;
      indicator.moveTo(seg);
      segs.forEach((s) =>
        s.setAttribute("aria-current", String(s === seg)));
    };

    segs.forEach((seg) => seg.addEventListener("click", () => {
      if (window.facet.feedback) facet.feedback.tap();
      mark(seg.dataset.section);            // pill moves straight there...
      navLockUntil = performance.now() + 1000;  // ...pass-throughs stay quiet
      const target = document.getElementById(seg.dataset.section);
      if (pager && target) pager.toEl(target);
    }));

    if (snap) {
      snap.addEventListener("facet:section", (e) => {
        if (performance.now() < navLockUntil) return;
        mark(e.detail.id);
      });
    }
    const current = segs.find((s) => s.getAttribute("aria-current") === "true");
    if (current) indicator.moveTo(current);

  }
}

/* Any trigger that aria-controls a .sheet gets wired: the tab bar's
   trailing settings button, or a lone .float-btn pinned to a page corner. */
function initSheetTriggers() {
  for (const trigger of document.querySelectorAll("button[aria-controls]")) {
    const sheet = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!sheet || !sheet.classList.contains("sheet")) continue;
    const scrim = sheet.previousElementSibling?.classList.contains("sheet-scrim")
      ? sheet.previousElementSibling : null;
    if (!scrim) continue;
    const panel = sheet.facetSheet || facetSheet(sheet, scrim, {
      onChange: (open) => trigger.setAttribute("aria-expanded", String(open)),
    });
    sheet.facetSheet = panel;          // expose it, mirroring snap.facetPager
    trigger.addEventListener("click", () => {
      if (window.facet.feedback) facet.feedback.tap();
      panel.toggle();
    });
  }
}

/* Settings controls, self-wired by data-control on any element (a
   .menu-icon-btn, a .menu-item row, or a .nav-set pill): "sounds" and
   "haptics" flip facet.feedback switches, "motion" cycles facet.motion
   (Off/Cursor/Tilt), "appearance" cycles facet.scheme (Light/Dark/Auto),
   and "theme" cycles the shipped themes (Default/Velvet/Aero/Elegant).
   Each writes its .menu-value word, marks data-off for the dimmed OFF
   state, and plays feedback.toggle(). A settings panel needs zero app JS. */
function initAppControls() {
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const THEMES = ["", "velvet", "aero", "elegant"];   // "" = the default theme
  const state = {
    sounds:     () => ({ word: facet.feedback.sound.enabled ? "On" : "Off", off: !facet.feedback.sound.enabled }),
    haptics:    () => ({ word: facet.feedback.haptic.enabled ? "On" : "Off", off: !facet.feedback.haptic.enabled }),
    motion:     () => ({ word: cap(facet.motion.mode), off: facet.motion.mode === "off" }),
    appearance: () => ({ word: cap(facet.scheme.get()), off: false }),
    theme:      () => { const t = document.documentElement.dataset.theme || ""; return { word: t ? cap(t) : "Default", off: false }; },
  };
  const paint = (btn, control) => {
    const s = state[control]();
    const value = btn.querySelector(".menu-value");
    if (value) { value.textContent = s.word; value.dataset.off = String(s.off); }
    else btn.dataset.off = String(s.off);   // value-less buttons dim on the button
    btn.setAttribute("aria-pressed", String(!s.off));
  };
  for (const btn of document.querySelectorAll("[data-control]")) {
    const control = btn.dataset.control;
    if (!state[control]) continue;
    paint(btn, control);
    btn.addEventListener("click", async () => {
      if (control === "sounds") facet.feedback.sound.enabled = !facet.feedback.sound.enabled;
      else if (control === "haptics") facet.feedback.haptic.enabled = !facet.feedback.haptic.enabled;
      else if (control === "motion") await facet.motion.cycle();
      else if (control === "appearance") facet.scheme.cycle();
      else if (control === "theme") {
        const cur = document.documentElement.dataset.theme || "";
        setConfig({ theme: THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length] || null });
      }
      paint(btn, control);
      if (facet.feedback) facet.feedback.toggle();
    });
  }
}

/* (docs mirror — identical to llms.txt · Nav menu)
   WHEN TO USE: whole-site navigation on app-like pages and PWAs — the thumb-reachable Menu and Settings pills in a bottom corner.

   What it is: a floating navigation cluster pinned bottom-left — a "Menu" pill that opens a stack of page links, and a same-size round Settings button beside it that opens a stack of setting toggles. Both stacks rise above their own trigger; opening one closes the other, and neither trigger moves when a stack opens. Every link and the Menu pill are the base .btn.btn-pill (the Settings button is .btn-pill.btn-icon, canonical icon data-icon="sliders"); each setting is a .btn.btn-pill.nav-set whose on/off state shows in the pill itself: the pill stays solid in both states and only the trailing .menu-value chip changes (filled accent = on, outlined muted = off). What it is for: whole-site navigation on any Facet page, plus the app's own settings — theme, appearance, motion, sound, haptics, language — behind two thumb-reachable floating controls. When to use it: the primary nav for a content site or app. The Menu is a real <details> wrapping real <a> links, so it works with JavaScript off — the summary opens the links inline — and the links sit in the DOM for crawlers and AI. Every item is one line, left-aligned, sized to its own content and capped near 300px; wrap the label in .nav-label and a long one truncates with an ellipsis while the icon and any trailing .menu-value stay whole. facet.js upgrades both stacks to a floating overlay: a dimming scrim, body scroll-lock, a staggered reveal, Escape to close, and focus moved into the open stack and back. The setting pills self-wire through data-control (theme cycles Default/Velvet/Aero/Elegant; appearance is the separate Light/Dark/Auto and the two compose) and data-language-cycle. Clicking a nav link or action closes the panel; a .nav-set toggle leaves it open so several settings can be changed in a row. Reduced motion drops the stagger. Add .nav-menu-right to anchor the cluster bottom-right with right-aligned stacks (left stays the default); an optional .nav-menu-back round pill — a real link with a chevron-left — sits on the cluster's outer edge, in the canonical order [back] [Menu] [settings]. On a real page it floats fixed bottom-left or bottom-right; here it sits in the flow. */
/* Nav menu: upgrades a .nav-menu's <details> into a floating overlay —
   a dimming scrim, body scroll-lock, a staggered bottom-up reveal of the
   links, Escape to close, and focus moved into the menu on open and back
   to the trigger on close. Without this the <details> is still a working
   no-JS disclosure of real <a> links, so navigation never depends on
   JavaScript; this only adds the enhancements. prefers-reduced-motion drops
   the stagger. Idempotent: the data-enhanced guard lets a page re-run it
   after inserting new markup. The Settings button beside the pill is a
   plain sheet trigger, wired by initSheetTriggers like any other. */
function initNavMenu() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const nav of document.querySelectorAll(".nav-menu")) {
    if (nav.dataset.enhanced === "true") continue;      // run-twice safe
    const panels = [...nav.querySelectorAll("details.nav-menu-panel")];
    if (!panels.length) continue;
    nav.dataset.enhanced = "true";

    // one scrim per cluster, at the end of <body> (reading-order rule:
    // controls are authored last so a top-to-bottom copy sweeps content first)
    const scrim = document.createElement("div");
    scrim.className = "nav-menu-scrim";
    scrim.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrim);

    const anyOpen = () => panels.some((p) => p.open);
    const syncOverlay = () => {
      const open = anyOpen();
      scrim.dataset.open = String(open);
      document.body.classList.toggle("nav-menu-open", open);
    };

    for (const details of panels) {
      const items = [...details.querySelectorAll(".nav-menu-items > *")];
      let timers = [];
      const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
      const reveal = () => {
        clearTimers();
        items.forEach((el, i) => {
          el.classList.remove("is-in");
          if (reduce) { el.classList.add("is-in"); return; }
          // nearest the trigger lights first: a bottom-up cascade
          timers.push(setTimeout(() => el.classList.add("is-in"), (items.length - 1 - i) * 45));
        });
      };
      const hide = () => { clearTimers(); items.forEach((el) => el.classList.remove("is-in")); };

      details.addEventListener("toggle", () => {
        if (details.open) {
          // only one stack at a time: close any sibling that is open
          for (const other of panels) if (other !== details && other.open) other.open = false;
          if (window.facet && facet.feedback) facet.feedback.tap();
          reveal();
          if (items[0]) items[0].focus({ preventScroll: true });
        } else {
          hide();
        }
        syncOverlay();
      });

      // Clicking a navigation link or an action button closes the panel; a
      // .nav-set setting toggle leaves it open so several settings can be
      // changed in a row (its own value flips via initAppControls). The
      // scrim tap and Escape still close, handled below.
      const list = details.querySelector(".nav-menu-items");
      list?.addEventListener("click", (e) => {
        const item = e.target.closest("a, button");
        if (!item || !list.contains(item) || item.classList.contains("nav-set")) return;
        details.open = false;
      });
    }

    scrim.addEventListener("click", () => { for (const p of panels) p.open = false; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && anyOpen()) {
        const open = panels.find((p) => p.open);
        for (const p of panels) p.open = false;
        open?.querySelector("summary")?.focus({ preventScroll: true });
      }
    });
  }
}

/* Sheet menu rows (and any non-tab element) carrying data-section page
   the snap pager and close the sheet they live in — the tab bar already
   pages from .tab-seg[data-section], this extends it to menu rows. */
function initSectionLinks() {
  const snap = document.querySelector(".snap.is-paged");
  const pager = snap && snap.facetPager;
  if (!pager) return;
  for (const link of document.querySelectorAll("[data-section]")) {
    if (link.classList.contains("tab-seg")) continue;   // the tab bar owns those
    link.addEventListener("click", () => {
      const target = document.getElementById(link.dataset.section);
      if (!target) return;
      if (window.facet.feedback) facet.feedback.tap();
      pager.toEl(target);
      const sheet = link.closest(".sheet");
      if (sheet && sheet.facetSheet) sheet.facetSheet.close();
    });
  }
}

/* Auto-mount the Add-to-Home-Screen flow: opt in by putting a
   .nudge-scrim on the page. data-nudge-key sets the storage key,
   data-nudge-delay the wait (default 30s). The whole flow self-wires:
   [data-nudge="add"] runs addNow() and reveals the .overlay-guide when
   the platform needs a how-to (iOS); [data-nudge="later"] hides the
   nudge; [data-nudge="never"] opts out; a tap on the overlay dismisses
   it. An "Add to Home Screen" menu row in the settings sheet ([data-
   nudge="add"] there too) opens the same guide. The nudge waits while a
   sheet is open or the guide is up. Zero app JS. */
function initInstallNudge() {
  const scrim = document.querySelector(".nudge-scrim");
  if (!scrim) return;
  const overlay = document.querySelector(".overlay-guide");
  const busy = () =>
    !!document.querySelector('.sheet[data-open="true"]') || (overlay && !overlay.hidden);
  const nudge = facetInstallNudge(scrim, {
    storageKey: scrim.dataset.nudgeKey,
    delay: scrim.dataset.nudgeDelay ? +scrim.dataset.nudgeDelay : 30000,
    busy,
  });
  const hideNudge = () => { scrim.hidden = true; };
  const showGuide = () => { if (overlay) overlay.hidden = false; };
  document.addEventListener("click", async (e) => {
    const add = e.target.closest('[data-nudge="add"]');
    if (add) {
      const result = await nudge.addNow();      // "native" (Android) or "guide" (iOS)
      hideNudge();
      if (result === "guide") showGuide();
      return;
    }
    if (e.target.closest('[data-nudge="later"]')) { hideNudge(); return; }
    if (e.target.closest('[data-nudge="never"]')) { nudge.never(); hideNudge(); return; }
    if (overlay && !overlay.hidden && e.target.closest(".overlay-guide")) overlay.hidden = true;
  });
  return nudge;
}


/* --------------------------------------------------------------------------
   TOUCH POLISH

   What it is: the touch behaviours every Facet page needs on iOS. Pinch
   zoom is blocked directly (iOS ignores user-scalable=no); tooltips,
   which are hover-driven on desktop, peek for a few seconds after a tap
   instead — because iOS makes :hover stick after a tap and never clears
   it.
   -------------------------------------------------------------------------- */

function initTouchPolish() {
  // iOS ignores user-scalable=no for pinch; block the gesture directly.
  document.addEventListener("gesturestart", (e) => e.preventDefault());

  /* Touch has no hover — peek the bubble via .tip-on, then let it fade. */
  let tipEl = null, tipTimer = 0;
  const clearTip = () => {
    if (tipEl) tipEl.classList.remove("tip-on");
    tipEl = null;
    clearTimeout(tipTimer);
  };
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;      // desktop hover handles it
    const t = e.target.closest("[data-tip]");
    clearTip();
    if (t) {
      tipEl = t;
      t.classList.add("tip-on");
      tipTimer = setTimeout(clearTip, 5000);
    }
  }, { passive: true });
}


/* --------------------------------------------------------------------------
   CHOICE GRID + SLIDER SCALE
   The wiring for two field components: exclusive picks in a
   .choice-grid (aria-pressed radio behavior, a tick of feedback), and
   the tick scale built from a slider's own min/max.
   -------------------------------------------------------------------------- */

/* A choice button's value: its data-value, or its text when unlabelled. */
function choiceValue(btn) {
  return btn.dataset.value ?? btn.textContent.trim();
}

/* (docs mirror — identical to llms.txt · Choice grid)
   WHEN TO USE: one exclusive pick from up to about ten compact, symbolic
   options — currencies, units, categories — too many for a segmented
   control, too visual for a select. What it is: a grid of small square
   choice buttons (.choice-grid of .choice-btn — a .choice-sym symbol
   above a .choice-cap caption), five per row on phones. aria-pressed
   carries the state and facet.js keeps the pick exclusive; on change the
   grid fires a bubbling CustomEvent "facet:choice" {value, button}
   (value = data-value ?? the button text), and
   facet.choiceSelect(grid, value) sets a pick from code (URL restore,
   reset). With JS off the buttons still render and submit nothing —
   pair with a hidden input when the form must post. */
/* Set the exclusive aria-pressed across a grid and announce the change. */
function markChoice(grid, btn) {
  for (const other of grid.querySelectorAll(".choice-btn")) {
    other.setAttribute("aria-pressed", String(other === btn));
  }
  grid.dispatchEvent(new CustomEvent("facet:choice", {
    bubbles: true, detail: { value: choiceValue(btn), button: btn },
  }));
}

function initChoiceGrids() {
  for (const grid of document.querySelectorAll(".choice-grid")) {
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-btn");
      if (!btn) return;
      markChoice(grid, btn);
      if (window.facet.feedback) facet.feedback.tick();
    });
  }
}

/* Programmatic pick, for URL-restore and reset: fires facet:choice too. */
function choiceSelect(grid, value) {
  const btn = [...grid.querySelectorAll(".choice-btn")].find(b => choiceValue(b) === String(value));
  if (btn) markChoice(grid, btn);
  return btn || null;
}

/* Builds a .slider-scale's ticks from its slider's min/max: minor ticks
   every data-minor (10), labels every data-label (40), and a highlighted
   data-now value. facet.sliderScale(wrap) rebuilds after a range change. */
function buildSliderScale(wrap) {
  const slider = wrap.querySelector(".slider");
  const scale = wrap.querySelector(".slider-scale");
  if (!slider || !scale) return;
  const min = +slider.min || 0, max = +slider.max || 100;
  const minor = +(scale.dataset.minor || 10);
  const label = +(scale.dataset.label || 40);
  const now = scale.dataset.now ? +scale.dataset.now : null;
  const pct = (v) => `${(((v - min) / (max - min)) * 100).toFixed(2)}%`;

  scale.replaceChildren();
  const addTick = (v, isNow, withLabel) => {
    const tick = document.createElement("span");
    tick.className = "tick" + (isNow ? " tick-now" : "");
    tick.style.left = pct(v);
    scale.appendChild(tick);
    if (withLabel) {
      const text = document.createElement("span");
      text.className = "tick-label" + (isNow ? " tick-now-label" : "");
      text.style.left = pct(v);
      text.textContent = v;
      scale.appendChild(text);
    }
  };
  for (let v = Math.ceil(min / minor) * minor; v <= max; v += minor) {
    if (v === now) continue;                 // the now tick is drawn last, on top
    addTick(v, false, v % label === 0);
  }
  // The highlighted value sits wherever it falls, on or off the minor grid.
  if (now !== null && now >= min && now <= max) addTick(now, true, true);
}

function initSliderScales() {
  for (const wrap of document.querySelectorAll(".slider-wrap")) {
    buildSliderScale(wrap);
  }
}


/* (docs mirror — identical to llms.txt · Chart)
   WHEN TO USE: one series over time where the shape tells the story — prices, balances, rates. Keep the numbers in a table nearby for readers.

   What it is: a line chart drawn by facet.chart(el, {points, projectFrom,
   events, format}) into a .chart div — data line in accent-1 (2.5px,
   dashed from projectFrom on), dots ringed in the page background, grid
   on the border token, muted axis text, event markers as faint dashed
   verticals labelled in a band above the plot, and a drag crosshair that
   reads the nearest value, dropped on pointer lift. points is
   [{x, y, label?}]. Colors are all tokens, so theme and mode switches
   restyle a live chart with no redraw; velvet turns the line gold via
   accent-1 automatically. The SVG draws at ~1 unit per pixel so type
   reads true; the surface is touch-action: none (gesture law). Put the
   chart in a .chart-card — a well in velvet, a quiet panel elsewhere.
   update(next) redraws with new data. */
/* --------------------------------------------------------------------------
   CHART
   facet.chart(el, {points, projectFrom, events, format}) draws the
   themed SVG line chart into el (a .chart div). points is
   [{x, y, label?}]; projectFrom (an index) dashes the span from
   there on; events is [{x, label}] for the faint verticals labelled
   in the band above the plot. Colors come entirely from the CSS
   classes (tokens), so theme and mode switches restyle a live chart
   with no redraw. Dragging shows the crosshair and reads the nearest
   value; it drops on pointer lift. Returns {update(next)}.
   -------------------------------------------------------------------------- */
const facetChart = (host, opts = {}) => {
  const NS = "http://www.w3.org/2000/svg";
  let svg = host.querySelector("svg");
  if (!svg) {
    svg = document.createElementNS(NS, "svg");
    host.appendChild(svg);
  }
  svg.setAttribute("role", "img");
  const fmt = opts.format || ((v) => groupNumber(Math.round(v)));
  let points = opts.points || [];

  const make = (name, attrs) => {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    svg.appendChild(node);
    return node;
  };

  const draw = () => {
    svg.replaceChildren();
    const W = Math.max(host.clientWidth || 0, 240);
    const H = Math.round(W * 0.5);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);   /* ~1 unit per pixel */
    if (points.length < 2) return;

    const PAD = { l: 8, r: 8, t: 26, b: 20 };       /* t reserves the event band */
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const spread = Math.max(...ys) - Math.min(...ys);
    const y0 = Math.min(...ys) - (spread * 0.12 || 1);
    const y1 = Math.max(...ys) + (spread * 0.12 || 1);
    const X = (x) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
    const Y = (y) => H - PAD.b - ((y - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);

    for (let i = 1; i <= 3; i++) {
      const y = PAD.t + ((H - PAD.t - PAD.b) * i) / 4;
      make("line", { class: "grid", x1: PAD.l, x2: W - PAD.r, y1: y, y2: y });
    }
    // Event markers: labels alternate across two rows in the top band so
    // neighbours (e.g. 2016 and 2020 on a phone) never collide, and the
    // anchor flips near the edges so nothing clips.
    const evs = [...(opts.events || [])].sort((a, b) => a.x - b.x);
    evs.forEach((ev, i) => {
      const x = X(ev.x);
      make("line", { class: "evt", x1: x, x2: x, y1: PAD.t, y2: H - PAD.b });
      make("text", {
        class: "lbl-e", x, y: 11 + (i % 2) * 11, "font-size": 10,
        "text-anchor": x > W * 0.82 ? "end" : x < W * 0.18 ? "start" : "middle",
      }).textContent = ev.label;
    });

    const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p.x)},${Y(p.y)}`).join(" ");
    const cut = Math.min(opts.projectFrom ?? points.length, points.length);
    if (cut > 1) make("path", { class: "line", d: path(points.slice(0, cut)) });
    if (cut < points.length) make("path", { class: "line proj", d: path(points.slice(cut - 1)) });

    // Where projection begins: a faint divider with a small label.
    if (opts.projectFrom != null && opts.projectFrom > 0 && opts.projectFrom < points.length) {
      const px = X(points[opts.projectFrom].x);
      make("line", { class: "evt", x1: px, x2: px, y1: PAD.t, y2: H - PAD.b });
      make("text", {
        class: "lbl-e", x: px + (px > W * 0.7 ? -3 : 3), y: H - PAD.b - 4, "font-size": 9,
        "text-anchor": px > W * 0.7 ? "end" : "start",
      }).textContent = "projection";
    }

    // Dots stay legible: cap them on dense series.
    const step = Math.ceil(points.length / 24);
    points.forEach((p, i) => {
      if (i % step && i !== points.length - 1) return;
      make("circle", { class: "dot", cx: X(p.x), cy: Y(p.y), r: 3 });
    });

    const first = points[0], last = points[points.length - 1];
    make("text", { class: "lbl-m", x: PAD.l, y: H - 4, "font-size": 10 })
      .textContent = first.label ?? first.x;
    make("text", { class: "lbl-m", x: W - PAD.r, y: H - 4, "font-size": 10, "text-anchor": "end" })
      .textContent = last.label ?? last.x;
    make("text", {
      class: "lbl", x: X(last.x) - 6, y: Y(last.y) - 8, "font-size": 12, "text-anchor": "end",
    }).textContent = fmt(last.y);

    // The crosshair: drag to read, drops on lift.
    const xhair = make("line", { class: "xhair", y1: PAD.t, y2: H - PAD.b, visibility: "hidden" });
    const read = make("text", {
      class: "lbl", y: PAD.t + 12, "font-size": 12, "text-anchor": "middle", visibility: "hidden",
    });
    const show = (clientX) => {
      const r = svg.getBoundingClientRect();
      const gx = ((clientX - r.left) / r.width) * W;
      let best = points[0];
      for (const p of points) if (Math.abs(X(p.x) - gx) < Math.abs(X(best.x) - gx)) best = p;
      const x = X(best.x);
      xhair.setAttribute("x1", x); xhair.setAttribute("x2", x);
      xhair.setAttribute("visibility", "visible");
      read.setAttribute("x", Math.max(40, Math.min(W - 40, x)));
      read.setAttribute("visibility", "visible");
      read.textContent = `${best.label ?? best.x} · ${fmt(best.y)}`;
    };
    const hide = () => {
      xhair.setAttribute("visibility", "hidden");
      read.setAttribute("visibility", "hidden");
    };
    svg.onpointerdown = (e) => { svg.setPointerCapture(e.pointerId); show(e.clientX); };
    svg.onpointermove = (e) => { if (e.buttons) show(e.clientX); };
    svg.onpointerup = hide;
    svg.onpointercancel = hide;
  };

  draw();
  addEventListener("resize", draw);
  return {
    update(next) {
      if (next && next.points) points = next.points;
      if (next && "projectFrom" in next) opts.projectFrom = next.projectFrom;
      if (next && next.events) opts.events = next.events;
      draw();
    },
  };
};

/* (docs mirror — identical to llms.txt · Icons)
   WHEN TO USE: every small symbol a product needs — write <svg data-icon="name"></svg> and facet.js fills it. Never paste icon paths by hand; extend the table instead.

   What it is: 24x24 line glyphs at a 1.5px stroke with round
   caps, carried as markup inside facet.js — no image files, no sprite
   fetch. Write <svg data-icon="search"></svg> and facet.js fills it;
   icons ride currentColor and scale with the surrounding text.
   In running text add .glyph — it makes the svg sit in the sentence
   like a character (inline-block, sized to the line, baseline-aligned)
   instead of breaking the line, because the base media rule makes
   every svg a block.
   Decorative by default (aria-hidden); an aria-label on the svg makes
   it meaningful. Extend: facet.icons.rocket = '<path d="..."/>' then
   facet.icon(). The set: search close check plus minus arrow-right
   arrow-left arrow-up arrow-down chevron-right chevron-left chevron-up
   chevron-down menu more settings home user users heart star bookmark
   bell calendar clock download upload share external link copy edit
   trash filter eye lock mail globe image file folder sun moon info
   warning help play pause. */
/* --------------------------------------------------------------------------
   ICONS
   Thin line glyphs, 24x24, 1.5px stroke, round caps — the whole
   set lives here as markup strings, no image files and no sprite
   fetch. Write <svg data-icon="search"></svg> and facet.js fills it;
   icons are decorative by default (aria-hidden) unless you give the
   svg an aria-label. facet.icons is the table — extend it with your
   own: facet.icons.rocket = '<path d="..."/>'.
   -------------------------------------------------------------------------- */
const FACET_ICONS = {
  "search": '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>',
  "close": '<path d="M6 6l12 12M18 6 6 18"/>',
  "check": '<path d="m5 13 5 5L19 7"/>',
  "plus": '<path d="M12 5v14M5 12h14"/>',
  "minus": '<path d="M5 12h14"/>',
  "arrow-right": '<path d="M4 12h16M14 6l6 6-6 6"/>',
  "arrow-left": '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  "arrow-up": '<path d="M12 20V4M6 10l6-6 6 6"/>',
  "arrow-down": '<path d="M12 4v16M6 14l6 6 6-6"/>',
  "chevron-right": '<path d="m9 5 7 7-7 7"/>',
  "chevron-left": '<path d="M15 5 8 12l7 7"/>',
  "chevron-up": '<path d="m5 15 7-7 7 7"/>',
  "chevron-down": '<path d="m5 9 7 7 7-7"/>',
  "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
  "more": '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  "settings": '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  "home": '<path d="m4 11 8-7 8 7M6 9.5V20h12V9.5"/>',
  "user": '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
  "users": '<circle cx="9" cy="9" r="3"/><path d="M3 20c0-3.5 2.5-5 6-5s6 1.5 6 5M16 4.5a3 3 0 0 1 0 6M21 20c0-3-1.6-4.5-4-5"/>',
  "heart": '<path d="M12 20C5 14 4 9 7.5 6.5 10 5 12 7 12 8c0-1 2-3 4.5-1.5C20 9 19 14 12 20Z"/>',
  "star": '<path d="m12 4 2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 16.2 7 19.2l1.2-5.6L4 9.8l5.6-.6Z"/>',
  "bookmark": '<path d="M7 4h10v16l-5-4-5 4Z"/>',
  "bell": '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5h-15Z M10 21h4"/>',
  "calendar": '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 10h16M8 4v4M16 4v4"/>',
  "clock": '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/>',
  "download": '<path d="M12 4v11M7 10.5l5 5 5-5M5 19h14"/>',
  "upload": '<path d="M12 15V4M7 8.5l5-5 5 5M5 19h14"/>',
  "share": '<circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="m8.2 10.9 6.6-3.8M8.2 13.1l6.6 3.8"/>',
  "external": '<path d="M9 5H5v14h14v-4M13 4h7v7M20 4l-9 9"/>',
  "link": '<path d="m9 15 6-6M7.5 17a3.5 3.5 0 0 1 0-5l2-2M16.5 7a3.5 3.5 0 0 1 0 5l-2 2"/>',
  "copy": '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15V5h10"/>',
  "edit": '<path d="m4 20 4-1L19 8l-3-3L5 16ZM14 7l3 3"/>',
  "trash": '<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
  "filter": '<path d="M4 6h16l-6 7v6l-4 2v-8Z"/>',
  "eye": '<path d="M2 12c3-5.5 7-7 10-7s7 1.5 10 7c-3 5.5-7 7-10 7S5 17.5 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  "lock": '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>',
  "mail": '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m3 7 9 6 9-6"/>',
  "globe": '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3.5 3 12.5 0 16M12 4c-3 3.5-3 12.5 0 16"/>',
  "image": '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-3 4 4"/>',
  "file": '<path d="M6 3h8l4 4v14H6ZM14 3v4h4"/>',
  "folder": '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>',
  "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  "moon": '<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10Z"/>',
  "info": '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.01"/>',
  "warning": '<path d="M12 4 21 19H3ZM12 10v4M12 16.5v.01"/>',
  "help": '<circle cx="12" cy="12" r="8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17v.01"/>',
  "play": '<path d="M8 5l11 7-11 7Z"/>',
  "pause": '<path d="M9 5v14M15 5v14"/>',
  // App-UI glyphs: named for their real jobs so app settings and
  // navigation stop borrowing semantically-wrong icons.
  "chart": '<path d="M4 4v16h16"/><path d="M7 14l3-4 3 3 4-6"/>',
  "grid": '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  "sliders": '<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>',
  "refresh": '<path d="M20 11a8 8 0 1 0-.5 4"/><path d="M20 5v6h-6"/>',
  "undo": '<path d="M9 7 4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-3"/>',
  "volume": '<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M17 8.5a5 5 0 0 1 0 7M20 6a9 9 0 0 1 0 12"/>',
  "vibrate": '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M3 9v6M21 9v6"/>',
  "motion": '<circle cx="12" cy="12" r="2.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2"/>',
  "contrast": '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z"/>',
  "plus-square": '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 9v6M9 12h6"/>',
  "download-cloud": '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 8.5a3.5 3.5 0 0 1-.5 9"/><path d="M12 12v6M9 15l3 3 3-3"/>',
  // Status glyphs for the icon badge (and anywhere else): a four-point
  // sparkle for "new", a wrench for work-in-progress.
  "sparkle": '<path d="M12 4c.8 5 2.7 6.9 7.7 7.7-5 .8-6.9 2.7-7.7 7.7-.8-5-2.7-6.9-7.7-7.7 5-.8 6.9-2.7 7.7-7.7Z"/>',
  "wrench": '<path d="M14.6 6.3a1 1 0 0 0 0 1.4l1.7 1.7a1 1 0 0 0 1.4 0l3.4-3.4a5 5 0 0 1-6.6 6.6l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a5 5 0 0 1 6.6-6.6Z"/>',
};

function initIcons() {
  for (const svg of document.querySelectorAll("svg[data-icon]")) {
    const body = FACET_ICONS[svg.dataset.icon];
    if (!body) continue;
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.innerHTML = body;
    if (!svg.hasAttribute("aria-label")) svg.setAttribute("aria-hidden", "true");
    else svg.setAttribute("role", "img");
  }
}

/* --------------------------------------------------------------------------
   FILTER INPUT
   An input carrying data-filter="#selector" live-hides children of
   the target that do not contain its text. Generic DOM filtering,
   not app logic: the markup is the data.
   -------------------------------------------------------------------------- */
function initFilterInputs() {
  for (const input of document.querySelectorAll("input[data-filter]")) {
    const target = document.querySelector(input.dataset.filter);
    if (!target) continue;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      for (const child of target.children) {
        child.hidden = !!q && !child.textContent.toLowerCase().includes(q);
      }
    });
  }
}

/* --------------------------------------------------------------------------
   CHIP TOGGLES
   A bare .chip button carrying aria-pressed toggles itself on click
   (multi-select filters). Chips that belong to a wiring system —
   any data-chip-*, data-setup or data-config-* attribute — are left
   to their own handlers.
   -------------------------------------------------------------------------- */
function initChipToggles() {
  for (const chip of document.querySelectorAll(".chip[aria-pressed]")) {
    const owned = Object.keys(chip.dataset).some(
      (k) => k.startsWith("chip") || k.startsWith("setup") || k.startsWith("config") ||
             k.startsWith("theme") || k.startsWith("mode") || k.startsWith("language")
    );
    if (owned) continue;   // theme/mode/language chips are driven by their own wiring
    chip.addEventListener("click", () => {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
      if (window.facet.feedback) facet.feedback.tap();
    });
  }
}

/* (docs mirror — identical to llms.txt · Tabs, breadcrumb, pagination)
   WHEN TO USE: tabs switch views in place; the breadcrumb says where you are in a hierarchy; pagination walks a long set page by page.

   What it is: the wayfinding trio. Tabs are real ARIA tabs (role=
   tablist/tab/tabpanel; click or arrow keys; accent underline; facet.js
   wires panels and roving tabindex) for two-to-five in-page views.
   Breadcrumb is the path to here — nav.breadcrumb > ol of links with
   quiet separators, current page unlinked with aria-current="page".
   Pagination is numbered page links in 44px squares, current page
   filled in accent-1, edges disabled with aria-disabled on a span.
   When to use which: tabs switch views in place; the tab bar navigates
   an app; the segmented control is a form value; breadcrumb and
   pagination are links, never buttons. */
/* --------------------------------------------------------------------------
   TABS
   Real ARIA tabs: click or arrow between [role="tab"] buttons inside
   a .tabs list; the matching aria-controls panel shows, the rest
   hide; roving tabindex keeps one tab stop for the whole list.
   -------------------------------------------------------------------------- */
function initTabs() {
  for (const list of document.querySelectorAll(".tabs")) {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    if (!tabs.length) continue;
    const panelOf = (tab) => document.getElementById(tab.getAttribute("aria-controls"));
    const select = (tab, focus) => {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = panelOf(t);
        if (panel) panel.hidden = !on;
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(tabs[(i + dir + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  }
}

/* (docs mirror — identical to llms.txt · Accordion, toast, dropdown menu)
   WHEN TO USE: the accordion folds long optional reading; the toast confirms an outcome that needs no reply; the dropdown holds a few quiet actions behind one button.

   What it is: the accordion is native <details class="accordion">
   styled (hairline rows, rotating chevron; give siblings the same name
   attribute and the browser keeps exactly one open); the toast is
   facet.toast(message, kind) — a transient pill that says one thing and
   leaves after four seconds, announced politely (kinds success /
   warning / error / info color the dot); the dropdown is
   details.dropdown whose summary is styled as a button and whose
   .dropdown-menu holds real buttons and links, closed by outside
   clicks, Esc, or picking an item. When to use it: never a toast for a
   question (dialog) and never a dropdown for navigation (links). */
/* --------------------------------------------------------------------------
   TOAST
   facet.toast(message, kind) — a transient pill near the bottom that
   says one thing and leaves after four seconds. Kinds success /
   warning / error / info color the leading dot. The shared rack is
   aria-live polite so screen readers hear it in place.
   -------------------------------------------------------------------------- */
function facetToast(message, kind) {
  let rack = document.querySelector(".toast-rack");
  if (!rack) {
    rack = document.createElement("div");
    rack.className = "toast-rack";
    rack.setAttribute("aria-live", "polite");
    document.body.appendChild(rack);
  }
  const toast = document.createElement("p");
  toast.className = "toast";
  if (kind) toast.dataset.kind = kind;
  toast.textContent = message;
  rack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 800);   // reduced motion: no transitionend
  }, 4000);
  return toast;
}

/* (docs mirror — identical to llms.txt · Modal, drawer, popover)
   WHEN TO USE: a modal for a decision that blocks the page, a drawer for a side task that keeps context, a popover for a small anchored bite. All are the native elements, so focus trapping, Esc and the backdrop come free.

   What it is: overlays built on the platform's own machinery — modal and
   drawer are <dialog> (focus trap, Esc, inert page for free), popover is
   the popover attribute (top layer, light dismiss, no JS at all). What
   it is for: modal for a decision that blocks the page; drawer for a
   side panel of details or filters; popover for small floating bits.
   When to use it: open a dialog from any button whose aria-controls
   names it — facet.js calls showModal; close with a form method="dialog"
   button inside, Esc, or a backdrop click. Popovers need only
   popovertarget on the button. The app-kit .sheet stays the settings
   panel for app pages; the drawer is the document-world sibling. */
/* --------------------------------------------------------------------------
   DROPDOWN MENU
   details.dropdown closes on outside click, on Esc, and after any of
   its menu items is clicked — the three things details does not do by
   itself. Everything else is native disclosure.
   -------------------------------------------------------------------------- */
function initDropdowns() {
  const dropdowns = [...document.querySelectorAll("details.dropdown")];
  if (!dropdowns.length) return;
  document.addEventListener("click", (e) => {
    for (const d of dropdowns) {
      if (d.open && !d.contains(e.target)) d.open = false;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const d of dropdowns) {
      if (d.open) {
        d.open = false;
        d.querySelector("summary").focus();
      }
    }
  });
  for (const d of dropdowns) {
    d.querySelector(".dropdown-menu")?.addEventListener("click", (e) => {
      if (e.target.closest("button, a")) d.open = false;
    });
  }
}


/* --------------------------------------------------------------------------
   DIALOG TRIGGERS
   Any button whose aria-controls names a <dialog> opens it modally on
   click — same one-attribute contract as the sheet. A click outside
   the dialog's box (on the backdrop) closes it; Esc and
   <form method="dialog"> buttons are the platform's own.
   -------------------------------------------------------------------------- */
function initDialogTriggers() {
  for (const btn of document.querySelectorAll("button[aria-controls]")) {
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target || target.tagName !== "DIALOG") continue;
    btn.addEventListener("click", () => {
      target.showModal();
      if (window.facet.feedback) facet.feedback.tap();
    });
    target.addEventListener("click", (e) => {
      const r = target.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right
        && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) target.close();
    });
  }
}


/* (docs mirror — identical to llms.txt · Stepper & segmented control)
   WHEN TO USE: the stepper for small counts where typing is overkill; the segmented control for flipping between two to five views of the same thing. Not for settings that act (the switch) or navigation (the tab bar).

   What it is: a quantity control — a real number input between two step
   buttons in one pill — and a segmented control, a pill of options where
   exactly one is pressed in, radios underneath. What it is for: the
   stepper for counts and small adjustments where typing is overkill; the
   segmented control for switching between 2–5 views or ranges of the
   same thing. When to use it: stepper for ranges of a few dozen at most
   (beyond that, the number input); segmented for choices that change
   what is shown — not settings that act (the switch) and not navigation
   (the tab bar). The stepper buttons call the input's own
   stepUp/stepDown so min/max/step rule; the radios keep arrows, form
   value and announcements native. */
/* --------------------------------------------------------------------------
   STEPPER
   Wires .stepper-down/.stepper-up to the input's own stepUp/stepDown,
   so min, max and step attributes rule, then fires input + change as
   if the user had typed. A feedback tick marks each bump. When the
   input carries min or max, the matching button disables at the edge
   — the state grammar's :disabled look, set live.
   -------------------------------------------------------------------------- */
function initSteppers() {
  for (const stepper of document.querySelectorAll(".stepper")) {
    const input = stepper.querySelector("input");
    const down = stepper.querySelector(".stepper-down");
    const up = stepper.querySelector(".stepper-up");
    if (!input || !down || !up) continue;
    const clamp = () => {
      const v = parseFloat(input.value);
      down.disabled = input.min !== "" && !Number.isNaN(v) && v <= +input.min;
      up.disabled = input.max !== "" && !Number.isNaN(v) && v >= +input.max;
    };
    const bump = (dir) => {
      if (dir > 0) input.stepUp(); else input.stepDown();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      if (window.facet.feedback) facet.feedback.tick();
    };
    down.addEventListener("click", () => bump(-1));
    up.addEventListener("click", () => bump(1));
    input.addEventListener("input", clamp);
    clamp();
  }
}


/* --------------------------------------------------------------------------
   BUSY — the loading skin's JS upgrade
   What it is: facet.busy(el, true) marks an element aria-busy so the
   loading skin (facet.css) skins everything inside, then wraps every
   text node in a .skeleton-text pill so the pulsing bars hug real
   lines instead of whole blocks. Elements carrying
   data-skeleton-lines="n" with no content yet get n lines of
   generated placeholder words — random lengths, statistically shaped
   like average text. facet.busy(el, false) unwraps everything and
   hands the content back untouched. data-static subtrees are left
   alone. Pass an element or a selector.
   -------------------------------------------------------------------------- */

/* Placeholder words with natural lengths (2–8 letters, ~42 chars a
   line). The letters are invisible under the pill — only the widths
   and wrap points matter, so the bars break like a real paragraph. */
function placeholderText(lines) {
  const words = [];
  let chars = 0;
  while (chars < lines * 42) {
    const len = 2 + Math.floor(Math.random() * 7);
    words.push("x".repeat(len));
    chars += len + 1;
  }
  return words.join(" ");
}

function facetBusy(el, on = true) {
  if (typeof el === "string") el = document.querySelector(el);
  if (!el) return;
  if (on) {
    if (el.dataset.busy === "wired") return;   /* double-init guard */
    el.setAttribute("aria-busy", "true");
    el.dataset.busy = "wired";
    /* Seed empty live slots first so the walker wraps them too. */
    for (const slot of el.querySelectorAll("[data-skeleton-lines]")) {
      if (slot.textContent.trim()) continue;
      slot.dataset.skeletonSeeded = "true";
      slot.textContent = placeholderText(+slot.dataset.skeletonLines || 1);
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-static], .skeleton-text")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const pill = document.createElement("span");
      pill.className = "skeleton-text";
      node.after(pill);
      pill.appendChild(node);
    }
  } else {
    for (const pill of el.querySelectorAll(".skeleton-text")) {
      pill.replaceWith(...pill.childNodes);
    }
    for (const slot of el.querySelectorAll("[data-skeleton-seeded]")) {
      slot.textContent = "";
      delete slot.dataset.skeletonSeeded;
    }
    el.removeAttribute("aria-busy");
    delete el.dataset.busy;
    el.normalize();
  }
}


/* --------------------------------------------------------------------------
   BROWSER INTERFACE COLOR
   What it is: the theme-color meta kept in sync with the active
   theme's --background, so Safari's toolbar and the installed app's
   interface always match the page — including live theme and mode
   switches. What it is for: the last sliver of browser UI joining the
   product instead of staying vendor gray. When to use it: automatic;
   facet.js creates the meta if the page has none and keeps it current.
   -------------------------------------------------------------------------- */
function initThemeColorMeta() {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  const sync = () => {
    meta.content = getComputedStyle(document.documentElement)
      .getPropertyValue("--background").trim() || "#FFFFFF";
  };
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme", "data-mode"],
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
  sync();
}


/* --------------------------------------------------------------------------
   THEMED MAP
   What it is: a Google Map wearing the active theme — ground, water,
   parks and roads derived from the base family, labels from the text
   family, boundaries from the quiet accent, recomputed live when the
   theme or mode switches. What it is for: maps that belong to the
   product instead of arriving in Google's own colors. When to use it:
   any embedded map. Bring your own key (like the analytics rule — the
   library never ships one): put data-map on a div, the key in
   data-map-key (or data-maps-key on the facet.js script tag), optional
   data-lat / data-lng / data-zoom. Without a key, or offline, the div
   stays a quiet themed placeholder — never a broken embed.
   facet.mapStyle() returns the styles array for anything else.
   -------------------------------------------------------------------------- */

/* (docs mirror — identical to llms.txt · Themed map)
   WHEN TO USE: a Google map that must look like the page — facet.mapStyle() returns the active theme as a Maps styles array, so the map re-skins when the theme flips.

   A Google Map styled with the active theme — ground, water, parks and roads
   derived from the base family, labels from the text family, boundaries
   from the quiet accent, recomputed live when the theme or mode switches.
   Bring your own key (the library never ships one): put data-map on a
   div, the key in data-map-key (or data-maps-key on the facet.js script
   tag), optional data-lat / data-lng / data-zoom. Without a key, or
   offline, the div stays a quiet themed placeholder — never a broken
   embed. facet.mapStyle() returns the styles array for anything else.
   Styles derive from tokens by formula, never hand-tuned per theme, so
   every future theme gets its map for free. */
/* The styling engine: the active theme's tokens become a Maps styles
   array. A hidden probe element resolves each formula to plain hex, so
   color-mix results and system colors (the OS accent) arrive in the
   form the Maps API accepts. Formulas, never hand-tuned hexes, so
   every theme — and every future theme — gets its map for free:
   ground = background, parks lean 6% toward ink, water 14%, roads are
   surface with border strokes, labels are the text family haloed in
   background, boundaries take the quiet accent. POI and transit
   clutter is off: the product's pins should own the map. */
function facetMapStyle() {
  const probe = document.createElement("span");
  probe.hidden = true;
  document.body.appendChild(probe);
  const hex = (css) => {
    probe.style.color = css;
    // Computed colors arrive as rgb(R, G, B) integers or, for mixes,
    // as color(srgb R G B) floats in 0..1 — handle both.
    const c = getComputedStyle(probe).color;
    const n = (c.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    const rgb = c.startsWith("color(")
      ? n.slice(0, 3).map((v) => Math.round(v * 255))
      : n.slice(0, 3).map(Math.round);
    return "#" + rgb.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
  };
  const ground = hex("var(--background)");
  const parks = hex("color-mix(in srgb, var(--text) 6%, var(--background))");
  const water = hex("color-mix(in srgb, var(--text) 14%, var(--background))");
  const road = hex("var(--surface)");
  const roadEdge = hex("var(--border)");
  const ink = hex("var(--text)");
  const muted = hex("var(--text-muted)");
  const accent = hex("var(--accent-3)");
  probe.remove();
  return [
    { elementType: "geometry", stylers: [{ color: ground }] },
    { elementType: "labels.text.fill", stylers: [{ color: muted }] },
    { elementType: "labels.text.stroke", stylers: [{ color: ground }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: parks }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: parks, visibility: "on" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: water }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: muted }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: road }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: roadEdge }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: roadEdge }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: muted }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: ink }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: roadEdge }] },
    { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: accent }] },
  ];
}

/* Loads the Maps JS API once, wires every [data-map] div, and restyles
   all live maps whenever the theme or mode attribute changes. */
function initMaps() {
  const divs = [...document.querySelectorAll("[data-map]")];
  if (!divs.length) return;

  // The placeholder is the resting state: set the message now, replace
  // it only if a real map actually arrives.
  for (const div of divs) {
    if (!div.textContent.trim()) div.textContent = t("mapKey");
  }

  const scriptTag = document.querySelector("script[src*='facet.js']");
  const key =
    divs.find((d) => d.dataset.mapKey)?.dataset.mapKey ||
    (scriptTag && scriptTag.dataset.mapsKey);
  if (!key || !navigator.onLine) return;

  const live = [];
  window.facetMapsReady = () => {
    for (const div of divs) {
      const center = {
        lat: +(div.dataset.lat || (window.facet.location && facet.location.latitude) || 20),
        lng: +(div.dataset.lng || (window.facet.location && facet.location.longitude) || 0),
      };
      div.textContent = "";
      div.dataset.map = "live";   // drops the placeholder frame styles
      live.push(new google.maps.Map(div, {
        center,
        zoom: +(div.dataset.zoom || 11),
        styles: facetMapStyle(),
        disableDefaultUI: true,
        zoomControl: true,
      }));
    }
    new MutationObserver(() => {
      const styles = facetMapStyle();
      for (const map of live) map.setOptions({ styles });
    }).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme", "data-mode"],
    });
  };
  const loader = document.createElement("script");
  loader.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=facetMapsReady`;
  loader.async = true;
  loader.onerror = () => { /* offline or bad key: the placeholder stays */ };
  document.head.appendChild(loader);
}


/* --------------------------------------------------------------------------
   BOOT
   -------------------------------------------------------------------------- */

applyScriptConfig();
applyUrlTheme();
initColorMode();
locate().then(() => refreshNumberInputs());   // formats follow the place

document.addEventListener("DOMContentLoaded", () => {
  initThemeSwitches();
  initModeToggles();
  initNumberInputs();
  initSliders();
  initDetailSliders();
  initCopyButtons();
  initServiceWorker();
  initInstallButtons();
  initTransitionOptOuts();
  initPagers();
  initViews();            // <main class="view-stack"> app shell: hash-routed screens
  window.facet.feedback = facetFeedback();   // sounds + haptics, on by default
  initTabBars();
  initSheetTriggers();
  initNavMenu();          // floating .nav-menu: overlay, scrim, staggered reveal
  initTranslate();        // show the active-language content variants
  initLanguageControls(); // data-language-switch / -cycle buttons
  initSectionLinks();     // menu rows with data-section page the pager
  initTouchPolish();
  initChoiceGrids();
  initSliderScales();
  initMaps();
  initThemeColorMeta();
  initSteppers();
  initDialogTriggers();
  initDropdowns();
  initTabs();
  initChipToggles();
  initIcons();
  initGlyphBackgrounds();  // data-bg-glyph surfaces draw + self-redraw
  initFluidBackgrounds();  // data-bg-fluid surfaces get their drifting layers
  initAmbientMotion();
  initFilterInputs();
  initAppControls();      // settings icon-row: sounds/haptics/motion/appearance
  initPrint();            // folds open on paper; data-print-action="page" buttons print
  initInstallNudge();     // Add-to-Home-Screen flow, opt-in by .nudge-scrim
});

/* The public API for apps: configuration, context, number helpers. */
window.facet = {
  version: "0.4.0",   // view-stack app shell + safe-area tokens/.bleed-top, on top of component states and icon badge + shine
  set: setConfig,
  scheme: { get: () => schemeState, set: setScheme, cycle: cycleScheme },  // auto|light|dark
  locate,
  location: null,   // fills in when locate() resolves
  strings,          // extend with your own languages: facet.strings.ta = {...}
  install,          // show the install prompt, when the browser offers one
  go,               // navigate with the page transition
  feedback: null,   // facetFeedback(), created at load: .tap/.snap/.success
  views: null,      // the view-stack app shell, when the page has one: .go(id)/.back()/.current
  sheet: facetSheet,
  scrollGauge: facetScrollGauge,
  tabIndicator: facetTabIndicator,
  installNudge: facetInstallNudge,
  motion: facetMotion,
  sliderScale: buildSliderScale,   // rebuild a scale after a range change
  mapStyle: facetMapStyle,         // the active theme as a Maps styles array
  toast: facetToast,               // facet.toast("Saved", "success")
  busy: facetBusy,                 // facet.busy(el, true|false) — the loading skin
  chart: facetChart,               // facet.chart(el, {points, projectFrom, events})
  icons: FACET_ICONS,              // the glyph table; extend it, then re-run facet.icon
  icon: initIcons,                 // (re)fill every svg[data-icon] on the page
  glyphBackground: drawGlyphBackground,  // (re)draw one data-bg-glyph surface
  fluidBackground: mountFluidBackground, // mount a late-added data-bg-fluid surface
  navMenu: initNavMenu,            // (re)wire floating .nav-menu overlays
  translate: applyTranslations,    // (re)apply content-language variants after inserting markup
  choiceSelect,                    // set a .choice-grid pick programmatically
  numberSystem,
  groupNumber,
  numberWords,
};
