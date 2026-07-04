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
    thousand: "thousand",
    lakh: "lakh",
    crore: "crore",
    million: "million",
    billion: "billion",
    trillion: "trillion",
  },
  hi: {
    copied: "कॉपी हुआ",
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
  numberSystem,
  numberValue,
  groupNumber,
  groupIndian,
  numberWords,
};
