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
    now, locate        built-in context: facet.now() for date and time,
                       facet.location / facet.locate() for rough place
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

  A tiny public API is exposed as window.facet for calculator apps:

    facet.numberValue(input)   the plain number behind a grouped input
    facet.groupNumber(n)       grouped for the active locale
    facet.groupIndian(n)       74250000  -> "7,42,50,000", always Indian
    facet.numberWords(n)       74250000  -> "7.43 crore" / "74.25 million"
    facet.numberSystem()       "indian" or "western", however resolved
    facet.strings              the translation table: extend it in place

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
  for (const key of ["theme", "mode", "density", "language", "numbers", "motion", "transition"]) {
    if (script.dataset[key] && !html.dataset[key]) {
      html.dataset[key] = script.dataset[key];
    }
  }

  // data-location-endpoint="" disables lookups; a URL replaces the default.
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

     facet.set({ theme: "sand" })            switch theme
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
    } else if (["theme", "mode", "density", "language", "numbers", "motion", "transition"].includes(key)) {
      if (value) html.dataset[key] = value;
      else delete html.dataset[key];
      if (key === "theme") setUrlParam("theme", value || null);
      if (key === "mode") setUrlParam("mode", value || null);
    }
  }
  showActiveThemeSwitches();
  if ("language" in config || "numbers" in config) refreshNumberInputs();
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
   CONTEXT: TIME AND PLACE

   What it is: ready-to-use context so apps never rewrite this plumbing.
   facet.now() answers "when is it" synchronously; facet.location answers
   "roughly where is the visitor", resolved once at load.

     facet.now()        { date, iso, dateText, timeText, timezone, year }
     facet.location     null until resolved, then { city, region, country,
                        countryCode, latitude, longitude, source }
     facet.locate()     the promise behind facet.location; await it when
                        the timing matters. Never throws; resolves null
                        on any failure, including offline.

   Where the location comes from: an IP lookup against ipwho.is by
   default — no key, HTTPS, CORS-open. The endpoint is configurable on
   the script tag:

     data-location-endpoint="https://your-endpoint/"   use your own
     data-location-endpoint=""                         disable lookups

   If the visitor has already granted geolocation permission elsewhere in
   the app, coordinates upgrade to GPS accuracy silently. The library
   never prompts for permission on its own.
   -------------------------------------------------------------------------- */

/* "When is it": fresh values on every call, no async, no surprises. */
function now() {
  const d = new Date();
  return {
    date: d,
    iso: d.toISOString(),
    dateText: d.toLocaleDateString(),
    timeText: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: d.getFullYear(),
  };
}

/* The default lookup endpoint; applyScriptConfig can override or blank it. */
let locationEndpoint = "https://ipwho.is/";
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

    // GPS upgrade, only when permission was already granted: no prompts.
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state === "granted") {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 }));
        place = {
          ...(place ?? { city: null, region: null, country: null, countryCode: null }),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "gps",
        };
      }
    } catch {
      /* keep the IP result */
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
    mapKey: "Add your Maps key to bring this map to life",
    thousand: "thousand",
    lakh: "lakh",
    crore: "crore",
    million: "million",
    billion: "billion",
    trillion: "trillion",
  },
  hi: {
    copied: "कॉपी हुआ",
    mapKey: "नक्शा जगाने के लिए अपनी Maps key जोड़ें",
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
   grouping and the words follow the locale (see LANGUAGE AND LOCALE);
   groupIndian stays for when Indian format is wanted explicitly.
   -------------------------------------------------------------------------- */

/* "7,42,50,000" style grouping: last three digits, then pairs. Always
   Indian, whatever the locale — for apps that want it explicitly. */
function groupIndian(number) {
  if (number === "" || number === null || isNaN(number)) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(number);
}

/* Locale-aware grouping: 7425000 -> "74,25,000" or "7,425,000". */
function groupNumber(number) {
  if (number === "" || number === null || isNaN(number)) return "";
  const tag = numberSystem() === "indian" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(number);
}

/* Reads a number back in words for the active locale and language:
   74250000 -> "7.43 crore" or "74.25 million" (or "7.43 करोड़").
   Below a thousand the digits already say it all, so it returns "". */
function numberWords(number) {
  if (isNaN(number) || number === null || number === "") return "";
  const n = Math.abs(number);

  const scales = numberSystem() === "indian"
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
      button.textContent = t("copied");
      setTimeout(() => { button.textContent = label; }, 1500);
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



/* --------------------------------------------------------------------------
   SNAP PAGER

   What it is: the JS upgrade for .snap — fullpage-style transitions that
   survive iOS. The outer container never free-scrolls: this pager springs
   its scrollTop between section tops (analytic spring w=11 z=0.9, tuned
   and final in every motion personality), so a transition can only land
   on a section top — or the previous section's bottom when paging back
   up. Each section stays exactly one viewport tall and scrolls natively
   INSIDE itself; pulling past its edge hands the gesture to the pager
   with a rubber-band hint, and a desktop wheel-push at an edge hops one
   section with a cooldown.
   What it is for: the law learned the hard way — CSS mandatory snap
   re-snaps tall sections and wedges the next gesture on iOS, proximity
   feels like nothing, free-scrolling outers fight their sections. The
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

function initPagers() {
  for (const snap of document.querySelectorAll(".snap")) {
    const fullViewport = snap.clientHeight >= window.innerHeight * 0.9;
    if (snap.dataset.pager === "off" || !fullViewport) continue;
    facetPager(snap);
  }
}

function facetPager(snap) {
  const sections = [...snap.querySelectorAll(".snap-section")];
  if (sections.length < 2) return null;
  snap.classList.add("is-paged");

  const reduce = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "off";

  /* The spring: gentle, a whisper of bounce. Tuned constants are law. */
  const W = 11, Z = 0.9, DT = 1 / 60;
  let cur = 0, raf = null, x = 0, v = 0, target = 0;

  const announce = (sec) => {
    snap.dispatchEvent(new CustomEvent("facet:section", {
      detail: { id: sec.id, index: sections.indexOf(sec) },
    }));
  };

  const frame = () => {
    v += (W * W * (target - x) - 2 * Z * W * v) * DT;
    x += v * DT * 60 * DT;
    snap.scrollTop = x;
    if (Math.abs(target - x) < 0.5 && Math.abs(v) * DT < 0.5) {
      snap.scrollTop = x = target; v = 0; raf = null; return;
    }
    raf = requestAnimationFrame(frame);
  };

  const go = (i, { fromBottom = false } = {}) => {
    i = Math.max(0, Math.min(sections.length - 1, i));
    const sec = sections[i];
    if (i !== cur) sec.scrollTop = fromBottom ? sec.scrollHeight : 0;
    cur = i;
    x = snap.scrollTop;
    target = sec.offsetTop;
    announce(sec);
    if (window.facet && facet.feedback) facet.feedback.snap?.();
    if (reduce()) { snap.scrollTop = x = target; v = 0; return; }
    if (!raf) raf = requestAnimationFrame(frame);
  };

  addEventListener("resize", () => {
    if (raf) return;
    snap.scrollTop = x = target = sections[cur].offsetTop; v = 0;
  });

  const pager = {
    go,
    toEl: (el) => go(sections.indexOf(el)),
    get index() { return cur; },
    get animating() { return !!raf; },
    settle() { go(Math.round(snap.scrollTop / snap.clientHeight)); },
  };
  snap.facetPager = pager;

  /* Gesture handoff: a pull past the active section's edge pages to the
     neighbour; a small rubber-band hint shows the pull before it commits. */
  {
    const THRESH = 56;
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
      tracking = !pager.animating && e.touches.length === 1
        && !e.target.closest(".chart, input, textarea");
      consumed = false; pull = 0;
      if (tracking) lastY = e.touches[0].clientY;
    }, { passive: true });
    snap.addEventListener("touchmove", (e) => {
      if (!tracking || consumed) return;
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
      if (pager.animating || now < cool) { e.preventDefault(); return; }
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
   every motion personality; only reduced motion quiets them.

     facetFeedback()          -> { sound, haptic, tap, tick, snap, toggle,
                                   success }  (sound.enabled / haptic.enabled)
     facetSheet(sheet, scrim, {onChange}) -> { open, close, toggle, isOpen }
     facetScrollGauge(scroller, {className, metric, onScrub, onScrubEnd})
                              -> { update }
     facetTabIndicator(bar)   -> { moveTo }
     facetInstallNudge(el, {storageKey, delay, busy})
                              -> { standalone, installed, addNow, never }
     facetMotion              -> { register(selector, {xMax, yMax}),
                                   init({scrollRoot}), setMode(mode),
                                   cycle(), mode }  modes: off|cursor|tilt

   Auto-wiring (below the modules): facet.feedback is created at load —
   sounds and haptics ON by default, per the recorded decision, with
   .sound.enabled/.haptic.enabled as the switches the settings controls
   flip. A .tab-bar wires itself: its indicator pill is injected, its
   [data-section] segments drive the page's snap pager, the pager's
   facet:section events glide the pill back (a 1s nav lock keeps
   pass-through sections from yanking it), and a [aria-controls] trigger
   opens its sheet through facetSheet. Velvet law: elements carrying
   velvet lift/press transforms must NOT register with facetMotion —
   inline transforms collide.
   -------------------------------------------------------------------------- */


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

/* Right-edge sheet over a darkening scrim — entry driven by the same
   analytic per-edge springs as the tab pill. Opening, the frame's LEFT
   edge leads and overshoots (the panel stretches past its resting width
   and eases back) while the RIGHT edge is critically damped: it glides
   to its resting line and never crosses it. Content that must land
   linearly sits in a fixed-width wrapper anchored to the right edge
   (.sheet-scroll) — the frame breathes around still text, exactly the
   tab bar's moving-pill-under-still-labels trick; a full-width foot
   (.sheet-foot) rides the stretch instead. Scrim tap and Esc close. */
const facetSheet = (sheet, scrim, opts = {}) => {
  const DT = 1 / 60;
  // one spring on the whole panel's X: it slides in as a rigid block —
  // frame, text and buttons together — overshoots a touch past its
  // resting edge, then rubber-bands back. Close is critically damped.
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

/* Add-to-Home-Screen state + a gentle once-per-session nudge.
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

/* Parallax engine. Registered elements spring toward an offset driven by
   the active input source — device tilt or cursor — while the scroll
   velocity of the page adds a vertical kick, so everything moves with
   momentum and settles back to its true position on its own.
     modes: "off"     nothing moves
            "cursor"  pointer position (scroll kick still applies)
            "tilt"    device orientation; asks iOS permission on demand
   init() auto-picks: tilt where no permission gate exists (Android),
   cursor elsewhere, off under prefers-reduced-motion. */
const facetMotion = (() => {
  const parts = [];
  let mode = "off";
  let target = { x: 0, y: 0 };
  let kick = 0;
  let raf = null;
  let tiltBase = null;
  let scrollRoot = null, lastTop = 0, lastT = 0;
  const STIFF = 0.10, DAMP = 0.80;
  const clamp1 = v => Math.max(-1, Math.min(1, v));

  const frame = () => {
    let settled = true;
    for (const p of parts) {
      const tx = mode === "off" ? 0 : target.x * p.xMax;
      const ty = mode === "off" ? 0 : target.y * p.yMax + kick * p.yMax * 2;
      p.vx = (p.vx + (tx - p.x) * STIFF) * DAMP;
      p.vy = (p.vy + (ty - p.y) * STIFF) * DAMP;
      p.x += p.vx; p.y += p.vy;
      // settled = resting ON its target (which may be a held offset)
      if (Math.abs(tx - p.x) + Math.abs(ty - p.y) + Math.abs(p.vx) + Math.abs(p.vy) > 0.06) settled = false;
      p.el.style.transform =
        `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0)`;
    }
    kick *= 0.9;
    if (settled && Math.abs(kick) < 0.002) {
      // sleep; any input (pointer, tilt, scroll) wakes the loop again
      raf = null;
      if (mode === "off")
        for (const p of parts) { p.x = p.y = p.vx = p.vy = 0; p.el.style.transform = ""; }
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const onPointer = e => {
    if (mode !== "cursor") return;
    target.x = clamp1((e.clientX / innerWidth) * 2 - 1);
    target.y = clamp1((e.clientY / innerHeight) * 2 - 1);
    wake();
  };
  const onTilt = e => {
    if (mode !== "tilt" || e.beta == null || e.gamma == null) return;
    if (tiltBase === null) tiltBase = e.beta;
    tiltBase += (e.beta - tiltBase) * 0.004;  // slow drift back to centre
    target.x = clamp1(e.gamma / 24);
    target.y = clamp1((e.beta - tiltBase) / 24);
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
      if (!D) want = "off";
      else if (typeof D.requestPermission === "function") {
        try { if (await D.requestPermission() !== "granted") want = "cursor"; }
        catch { want = "cursor"; }
      }
    }
    mode = want;
    tiltBase = null;
    if (mode === "off") { target.x = target.y = 0; kick = 0; }
    wake();
    return mode;
  };

  return {
    register(selector, o) {
      document.querySelectorAll(selector).forEach(el =>
        parts.push({ el, xMax: o.xMax, yMax: o.yMax, x: 0, y: 0, vx: 0, vy: 0 }));
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
      return setMode(coarse && window.DeviceOrientationEvent && !gated ? "tilt" : "cursor");
    },
    setMode,
    cycle() { return setMode(mode === "off" ? "cursor" : mode === "cursor" ? "tilt" : "off"); },
    get mode() { return mode; },
  };
})();



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
      mark(seg.dataset.section);            // pill glides straight there...
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
   trailing gear, or a lone .float-btn pinned to a page corner. */
function initSheetTriggers() {
  for (const trigger of document.querySelectorAll("button[aria-controls]")) {
    const sheet = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!sheet || !sheet.classList.contains("sheet")) continue;
    const scrim = sheet.previousElementSibling?.classList.contains("sheet-scrim")
      ? sheet.previousElementSibling : null;
    if (!scrim) continue;
    const panel = facetSheet(sheet, scrim, {
      onChange: (open) => trigger.setAttribute("aria-expanded", String(open)),
    });
    trigger.addEventListener("click", () => {
      if (window.facet.feedback) facet.feedback.tap();
      panel.toggle();
    });
  }
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

function initChoiceGrids() {
  for (const grid of document.querySelectorAll(".choice-grid")) {
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-btn");
      if (!btn) return;
      for (const other of grid.querySelectorAll(".choice-btn")) {
        other.setAttribute("aria-pressed", String(other === btn));
      }
      if (window.facet.feedback) facet.feedback.tick();
    });
  }
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
    for (const ev of opts.events || []) {
      const x = X(ev.x);
      make("line", { class: "evt", x1: x, x2: x, y1: PAD.t, y2: H - PAD.b });
      make("text", {
        class: "lbl-e", x, y: 12, "font-size": 10,
        "text-anchor": x > W * 0.85 ? "end" : x < W * 0.15 ? "start" : "middle",
      }).textContent = ev.label;
    }

    const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p.x)},${Y(p.y)}`).join(" ");
    const cut = Math.min(opts.projectFrom ?? points.length, points.length);
    if (cut > 1) make("path", { class: "line", d: path(points.slice(0, cut)) });
    if (cut < points.length) make("path", { class: "line proj", d: path(points.slice(cut - 1)) });

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
      (k) => k.startsWith("chip") || k.startsWith("setup") || k.startsWith("config")
    );
    if (owned) continue;
    chip.addEventListener("click", () => {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
      if (window.facet.feedback) facet.feedback.tap();
    });
  }
}

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


/* --------------------------------------------------------------------------
   STEPPER
   Wires .stepper-down/.stepper-up to the input's own stepUp/stepDown,
   so min, max and step attributes rule, then fires input + change as
   if the user had typed. A feedback tick marks each bump.
   -------------------------------------------------------------------------- */
function initSteppers() {
  for (const stepper of document.querySelectorAll(".stepper")) {
    const input = stepper.querySelector("input");
    const down = stepper.querySelector(".stepper-down");
    const up = stepper.querySelector(".stepper-up");
    if (!input || !down || !up) continue;
    const bump = (dir) => {
      if (dir > 0) input.stepUp(); else input.stepDown();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      if (window.facet.feedback) facet.feedback.tick();
    };
    down.addEventListener("click", () => bump(-1));
    up.addEventListener("click", () => bump(1));
  }
}


/* --------------------------------------------------------------------------
   BROWSER CHROME COLOR
   What it is: the theme-color meta kept in sync with the active
   theme's --background, so Safari's toolbar and the installed app's
   chrome always match the page — including live theme and mode
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
  initCopyButtons();
  initServiceWorker();
  initInstallButtons();
  initTransitionOptOuts();
  initPagers();
  window.facet.feedback = facetFeedback();   // sounds + haptics, on by default
  initTabBars();
  initSheetTriggers();
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
});

/* The public API for apps: configuration, context, number helpers. */
window.facet = {
  set: setConfig,
  now,
  locate,
  location: null,   // fills in when locate() resolves
  strings,          // extend with your own languages: facet.strings.ta = {...}
  install,          // show the install prompt, when the browser offers one
  go,               // navigate with the page transition
  feedback: null,   // facetFeedback(), created at load: .tap/.snap/.success
  sheet: facetSheet,
  scrollGauge: facetScrollGauge,
  tabIndicator: facetTabIndicator,
  installNudge: facetInstallNudge,
  motion: facetMotion,
  sliderScale: buildSliderScale,   // rebuild a scale after a range change
  mapStyle: facetMapStyle,         // the active theme as a Maps styles array
  toast: facetToast,               // facet.toast("Saved", "success")
  chart: facetChart,               // facet.chart(el, {points, projectFrom, events})
  numberSystem,
  numberValue,
  groupNumber,
  groupIndian,
  numberWords,
};
