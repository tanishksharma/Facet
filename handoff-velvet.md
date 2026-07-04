# FACET LIBRARY HANDOFF — Velvet theme, components, modules, and the snap-pager layout

Everything below was built and user-approved inside
**tanishksharma.com/apps/inflation** (`apps/inflation.html` in the
tanishksharmacom repo — the living reference this file was generated
from). It is a complete ingestion kit for the Facet design library
(facet-kappa.vercel.app): the new **Velvet** neumorphic theme, every
component, every JS module, the full-page snap-pager **layout**, and the
platform laws we paid for in blood on iOS. App-specific calculator logic
is excluded; a few app selectors appear inside larger CSS slices as
worked examples and are marked as such.

**Suggested ingestion order** — each step stands alone:
1. The Velvet theme (tokens + behavioral laws)
2. The snap-pager layout (markup + CSS + wiring)
3. Components (CSS + markup contracts)
4. JS modules (verbatim, already library-shaped)
5. Rules / laws (docs)

Everything follows the library's existing conventions: tokens-only CSS,
JS that wires itself to data attributes or tiny factory calls, one
canonical description per thing. Code blocks are verbatim from the
shipped app — trust them over any prose that disagrees.

---

## 1. THE VELVET THEME (`data-theme="velvet"`)

A CRED-Copper/Synth-inspired neumorphic material: matte velvet surfaces,
one light source from straight above, elements either RAISED out of the
fabric (faces with key light + cast shadow + bevel) or CARVED into it
(wells and pits with interior shadows). Gold is the only accent ink.
Tuned interactively over five slider-playground rounds in
`/apps/velvet-tuner` (velvet-tuner.html in the same repo) — the values
below are final and user-approved.

**How to ship it in the library:** the two `--v-*` value blocks become
`[data-theme="velvet"]` (light) and `[data-theme="velvet"][data-mode="dark"]`;
the component recipes (everything consuming `var(--v-…)`) fold into the
library's component CSS, scoped under the theme. Nothing else in a page
needs to change — that is the point.

### Behavioral laws (non-negotiable — they ARE the theme)

```
Behavioral laws (all in the reference implementation):
  - ONE RAISED FACE: the tab indicator pill and the primary CTA are
    the same object; the CTA wears the accent. Pills inside a well
    carry NO key light (the well owns the outer shine) — cast + bevels
    only. Secondary tier = gray face at 0.35/0.45 elevation; tertiary
    = flat, 1px fixed press sink, label never lifts.
  - CUSHION PRESS: the dent is a fading overlay (::after, ~70ms in,
    ~300ms spring-out cubic-bezier(.34,1.45,.6,1)); the face gradient
    NEVER changes on press (no blackening/washing); button dents are
    capped soft (~0.4x) while bare icon tap-glows use full strength.
    Transform/box-shadow share the fast-in spring-out timing.
  - RAISED TEXT RIDES: active tab label translateY(-lift); button
    labels -0.6*lift, dipping by `dip` while pressed. Rounded stack:
    ui-rounded / SF Pro Rounded / Arial Rounded MT Bold / sans-serif
    (never put `inherit` in a font list).
  - ICONS ENGRAVE LIKE TEXT: same orientation as the active text style
    (embossed: dark below+light above; letterpress: inverse), full text
    blur, alphas x1.3, via two drop-shadow() filters.
  - ELASTIC PILL TRAVEL: leading edge stretches to the target, trailing
    edge snaps in with ~5px overshoot (WAAPI keyframes ~480ms in the
    app; tuner used transition cubic-bezier(.34,1.45,.5,1) 450ms).
  - SPRING PILL (final animation): each pill edge is an analytic spring
    (leading edge omega 16 / zeta 0.70, trailing omega 10 / zeta 0.62,
    dt 1/60): the trailing edge lags so the pill stretches with
    momentum, both edges settle with a fixed ~3px overshoot regardless
    of jump length. Replaces all keyframe choreography (facetTabIndicator).
  - GEAR OPEN STATE: the panel trigger wears its own round raised pill
    ([aria-expanded="true"] -> face + pill shadows) while the panel is open.
  - CRED COMPOSITION: two type voices — heavy tight display (system,
    800, -0.03em, clamp to ~4rem) for statements, the rounded stack in
    0.16em-tracked uppercase caption for micro labels; content left-set
    at ~46rem with roomier side padding; key numbers in a gold ink token
    (--v-gold: #8a6c26 light / #dcbe8e dark); the intro's only CTA is a
    60px golden round arrow; the results CTA is the golden primary.
    Squircle corners are for rectangles only — capsules opt back to
    corner-shape: round.
  - PARALLAX EXCLUSION: elements carrying velvet lift/press transforms
    must NOT register with facetMotion (inline transforms collide).
```

### The theme CSS, verbatim (light tokens on body{}, dark on html[data-mode="dark"] body{}, then recipes)

```css
/* ======================================================================
   VELVET THEME — FINAL, tuned end-to-end in /apps/velvet-tuner.
   Shape: one value block per mode (the theme), then component recipes
   that consume only the --v-* tokens. Library-ready: the two value
   blocks become data-theme="velvet" light/dark; the recipes fold into
   the component sections. Spec: apps/facet-backlog.txt.
   ====================================================================== */

body {
  /* ---- VELVET value block · light ---- */
  --v-bg: #e4e4e9;
  --v-well-bg: #d6d6db;
  --v-face:
    radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.45), transparent 68%),
    linear-gradient(180deg, #e6e6ea, #d6d6db);
  --v-face-accent:
    radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.6), transparent 68%),
    linear-gradient(180deg, #ecd8b2, #d1bb91);
  --v-ink: #8c8c90;
  --v-ink-strong: #636367;
  --v-ink-accent: #5C4A18;
  --v-weight: 750;
  --v-text-shadow: 0 1px 1px rgba(255,255,255,0.5), 0 -1px 1px rgba(0,0,0,0.1);
  --v-icon-filter: drop-shadow(0 1px 1px rgba(255,255,255,0.65)) drop-shadow(0 -1px 1px rgba(0,0,0,0.13));
  --v-key: 0 -7px 16px rgba(255,255,255,0.9);
  --v-cast: 0 12px 28px rgba(0,0,0,0.15);
  --v-bevel:
    inset 0 1.5px 2.5px rgba(255,255,255,0.95),
    inset 0 -1.5px 2.5px rgba(255,255,255,0.35),
    inset 0 -3px 5px rgba(0,0,0,0.12);
  --v-raised: var(--v-key), var(--v-cast), var(--v-bevel);
  --v-raised-pressed: 0 -5.95px 13.6px rgba(255,255,255,0.9), 0 10.2px 23.8px rgba(0,0,0,0.15), var(--v-bevel);
  --v-pill: var(--v-cast), var(--v-bevel);   /* inside a well: no key light */
  --v-raised-2nd: 0 -3.15px 7.2px rgba(255,255,255,0.9), 0 5.4px 12.6px rgba(0,0,0,0.15), var(--v-bevel);
  --v-well-shadow:
    var(--v-key), var(--v-cast),
    inset 0 3px 6px rgba(255,255,255,0.5),
    inset 0 2.8px 7px rgba(0,0,0,0.22),
    inset 0 -2.8px 7px rgba(255,255,255,0.9);
  --v-pit:
    inset 0 2.8px 7px rgba(0,0,0,0.22),
    inset 0 -2.8px 7px rgba(255,255,255,0.9);
  --v-dent-btn: radial-gradient(72% 62% at 50% 58%, rgba(0,0,0,0.056), transparent 78%);
  --v-dent-tap: radial-gradient(72% 62% at 50% 58%, rgba(0,0,0,0.14), transparent 78%);
  --v-div-line: linear-gradient(180deg, transparent, rgba(0,0,0,0.18) 25%, rgba(0,0,0,0.18) 75%, transparent);
  --v-div-edge: 0 1px 2px rgba(255,255,255,0.6), 1px 0 2px rgba(255,255,255,0.6);
  --v-div-blur: 0.3px;
  --v-well-pad: 7px;  --v-pill-drop: 2px;  --v-face-up: 2.5px;
  --v-lift: 3px;  --v-dip: 1.5px;  --v-sink: 1px;
  --v-font: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Varela Round", "Nunito", sans-serif;
  /* press lands fast, release springs back */
  --v-press-in: 0.09s ease-out;
  --v-press-out: 0.32s cubic-bezier(0.34, 1.45, 0.6, 1);
  background: var(--v-bg);
}
html[data-mode="dark"] body {
  /* ---- VELVET value block · dark ---- */
  --v-bg: #1a1a1e;
  --v-well-bg: #17171a;
  --v-face:
    radial-gradient(120% 110% at 50% 0%, rgba(255,255,255,0.08), transparent 68%),
    linear-gradient(180deg, #353539, #17171a);
  --v-face-accent:
    radial-gradient(120% 110% at 50% 0%, rgba(255,255,255,0.26), transparent 68%),
    linear-gradient(180deg, #423b2e, #160e00);
  --v-ink: #ffffff;
  --v-ink-strong: #ffffff;
  --v-ink-accent: #ffffff;
  --v-weight: 650;
  --v-text-shadow: 0 1px 1.5px rgba(0,0,0,0.5), 0 -1px 1.5px rgba(255,255,255,0.25);
  --v-icon-filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.65)) drop-shadow(0 -1px 1.5px rgba(255,255,255,0.33));
  --v-key: 0 -8px 32px rgba(255,255,255,0.11);
  --v-cast: 0 9px 53px rgba(0,0,0,0.73);
  --v-bevel:
    inset 0 1.5px 4.5px rgba(255,255,255,0.08),
    inset 0 -1.5px 4.5px rgba(255,255,255,0.08),
    inset 0 -3px 16px rgba(0,0,0,0.71);
  --v-raised-pressed: var(--v-key), var(--v-cast), var(--v-bevel); /* pressElev 1 */
  --v-raised-2nd: 0 -2.8px 11.2px rgba(255,255,255,0.11), 0 3.15px 18.55px rgba(0,0,0,0.73), var(--v-bevel);
  --v-well-shadow:
    var(--v-key), var(--v-cast),
    inset 0 1.5px 3px rgba(255,255,255,0.1),
    inset 0 7.2px 18px rgba(0,0,0,0.91),
    inset 0 -9.6px 24px rgba(255,255,255,0.11);
  --v-pit:
    inset 0 5px 13px rgba(0,0,0,0.75),
    inset 0 -5px 14px rgba(255,255,255,0.09);
  --v-dent-btn: radial-gradient(65% 56% at 50% 40%, rgba(0,0,0,0.4), transparent 78%);
  --v-dent-tap: radial-gradient(65% 56% at 50% 40%, rgba(0,0,0,1), transparent 78%);
  --v-div-line: linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,1));
  --v-div-edge: 0 1px 2px rgba(255,255,255,0.17), 1px 0 2px rgba(255,255,255,0.17);
  --v-div-blur: 0.6px;
  --v-well-pad: 7px;  --v-pill-drop: 3px;  --v-face-up: 0px;
  --v-lift: 2.5px;  --v-dip: 1px;  --v-sink: 0px;
}

/* ---- pits: inputs, cards, controls carved into the material ---- */
input:not(.slider),
.year-row .year-input {
  background: var(--v-well-bg);
  border-color: transparent;
  box-shadow: var(--v-pit);
}
input:not(.slider):hover { border-color: transparent; }
.seg {
  background: var(--v-well-bg);
  border: none;
  border-radius: var(--radius-pill);
  padding: var(--space-1);
  box-shadow: var(--v-pit);
}
.seg-btn {
  border-radius: var(--radius-pill);
  font-family: var(--v-font);
  font-weight: var(--v-weight);
  color: var(--v-ink);
  text-shadow: var(--v-text-shadow);
}
.seg-btn[aria-pressed="true"] {
  background: var(--v-face);
  color: var(--v-ink-strong);
  box-shadow: var(--v-pill);
}
.stat,
.chart-card {
  background: var(--v-well-bg);
  border: none;
  border-radius: var(--radius-large);
  box-shadow: var(--v-pit);
}

/* ---- sliders: carved groove, raised round knob ---- */
.slider::-webkit-slider-runnable-track {
  height: 10px; background: var(--v-well-bg); box-shadow: var(--v-pit);
}
.slider::-moz-range-track {
  height: 10px; background: var(--v-well-bg); box-shadow: var(--v-pit);
}
/* a raised face carrying a gold jewel dead-centre; grabbing it deepens
   the gold (the face itself never changes — facet's white
   accent-pressed :active is overridden below) */
.slider::-webkit-slider-thumb {
  width: 32px; height: 32px; margin-top: -11px;
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 78%, #fff 30%) 0,
      var(--v-gold) 55%,
      color-mix(in srgb, var(--v-gold) 72%, #000 28%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
  border: none;
  box-shadow: var(--v-pill);
}
.slider::-moz-range-thumb {
  width: 32px; height: 32px;
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 78%, #fff 30%) 0,
      var(--v-gold) 55%,
      color-mix(in srgb, var(--v-gold) 72%, #000 28%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
  border: none;
  box-shadow: var(--v-pill);
}
.slider:active::-webkit-slider-thumb {
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 88%, #000 8%) 0,
      color-mix(in srgb, var(--v-gold) 74%, #000 26%) 55%,
      color-mix(in srgb, var(--v-gold) 55%, #000 45%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
}
.slider:active::-moz-range-thumb {
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 88%, #000 8%) 0,
      color-mix(in srgb, var(--v-gold) 74%, #000 26%) 55%,
      color-mix(in srgb, var(--v-gold) 55%, #000 45%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
}

/* ---- tab bar: the tuned well + its pill ---- */
.tab-bar {
  padding: var(--v-well-pad);
  /* translucent well: the page visibly slides past behind the glass */
  background: color-mix(in srgb, var(--v-well-bg) 55%, transparent);
  border: none;
  -webkit-backdrop-filter: blur(6px) saturate(1.25);
  backdrop-filter: blur(6px) saturate(1.25);
  box-shadow: var(--v-well-shadow);
}
.tab-indicator {
  top: calc(var(--v-well-pad) - var(--v-face-up));
  height: calc(100% - var(--v-well-pad) * 2 + var(--v-pill-drop));
  background: var(--v-face);
  box-shadow: var(--v-pill);
}
.tab-seg {
  font-family: var(--v-font);
  font-weight: var(--v-weight);
  color: var(--v-ink);
  text-shadow: var(--v-text-shadow);
  transition: transform 0.3s cubic-bezier(0.34, 1.45, 0.6, 1), color 0.15s;
}
.tab-seg[aria-current="true"] {
  color: var(--v-ink-strong);
  text-shadow: var(--v-text-shadow);
  transform: translateY(calc(-1 * var(--v-lift)));
}
.tab-settings { color: var(--v-ink); }
.tab-settings svg { filter: var(--v-icon-filter); }
.tab-settings::after {
  content: ""; position: absolute; inset: 0; border-radius: var(--radius-pill);
  background: var(--v-dent-tap); opacity: 0; pointer-events: none;
  transition: opacity var(--v-press-out);
}
.tab-settings:active::after { opacity: 1; transition: opacity var(--v-press-in); }
.tab-divider {
  width: 2px; height: var(--space-5); border-radius: var(--radius-pill);
  background: var(--v-div-line);
  box-shadow: var(--v-div-edge);
  filter: blur(var(--v-div-blur));
}

/* ---- buttons: primary CTA = the pill's face wearing the accent ---- */
.intro-stack .btn-primary,
.results-actions .btn,
.chevron-btn {
  position: relative;
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--v-font);
  font-weight: var(--v-weight);
  text-shadow: var(--v-text-shadow);
  transition: transform var(--v-press-out), box-shadow var(--v-press-out);
}
.intro-stack .btn-primary::after,
.results-actions .btn::after,
.chevron-btn::after {
  content: ""; position: absolute; inset: 0; border-radius: var(--radius-pill);
  background: var(--v-dent-btn); opacity: 0; pointer-events: none;
  transition: opacity var(--v-press-out);
}
.intro-stack .btn-primary:active,
.results-actions .btn:active,
.chevron-btn:active { transition-duration: 0.09s, 0.09s; }
.intro-stack .btn-primary:active::after,
.results-actions .btn:active::after,
.chevron-btn:active::after { opacity: 1; transition: opacity var(--v-press-in); }

.intro-stack .btn-primary {
  background: var(--v-face-accent);
  color: var(--v-ink-accent);
  box-shadow: var(--v-raised);
  transform: translateY(calc(-1 * var(--v-face-up)));
}
.intro-stack .btn-primary:hover { background: var(--v-face-accent); }
.intro-stack .btn-primary:active {
  background: var(--v-face-accent);
  box-shadow: var(--v-raised-pressed);
  transform: translateY(calc(var(--v-sink) - var(--v-face-up)));
}
.results-actions .btn,
.chevron-btn {
  background: var(--v-face);
  color: var(--v-ink);
  box-shadow: var(--v-raised-2nd);
}
.results-actions .btn:hover,
.chevron-btn:hover { background: var(--v-face); border: none; }
.results-actions .btn:active,
.chevron-btn:active { transform: translateY(1px); }
.chevron-btn svg { filter: var(--v-icon-filter); }

/* raised labels ride up; they dip with the press */
.intro-stack .btn-primary .btn-lbl,
.results-actions .btn .btn-lbl {
  display: inline-block;
  transform: translateY(calc(-0.6 * var(--v-lift)));
  transition: transform var(--v-press-out);
}
.intro-stack .btn-primary:active .btn-lbl,
.results-actions .btn:active .btn-lbl {
  transform: translateY(calc(var(--v-dip) - 0.6 * var(--v-lift)));
  transition: transform var(--v-press-in);
}

/* ---- sheet: floating slab (dark drop shadows, matte material).
        Translucent enough that the page is glimpsed moving behind. ---- */
.sheet {
  background: color-mix(in srgb, var(--v-bg) 62%, transparent);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  backdrop-filter: blur(12px) saturate(1.2);
  border: none;
  box-shadow:
    0 24px 60px rgba(0,0,0,0.32),
    0 8px 24px rgba(0,0,0,0.2),
    var(--v-bevel);
}
.scroll-gauge { background: var(--v-well-bg); box-shadow: var(--v-pit); }
.scroll-gauge-thumb { background: var(--v-face); box-shadow: var(--v-pill); }

/* ---- sheet controls: raised gray tier, sunk when off ---- */
.menu-item { font-family: var(--v-font); }
.menu-icon-row {
  padding: var(--space-2);
  border-radius: var(--radius-large);
  background: var(--v-well-bg);
  box-shadow: var(--v-pit);
}
.menu-icon-btn {
  position: relative;
  background: var(--v-face);
  border: none;
  box-shadow: var(--v-raised-2nd);
  color: var(--v-ink);
  font-family: var(--v-font);
  transition:
    transform var(--v-press-out),
    background 0.28s ease,
    box-shadow 0.28s ease,
    color 0.28s ease;
}
.menu-icon-btn .menu-value { transition: color 0.28s ease; }
.menu-icon-btn::after {
  content: ""; position: absolute; inset: 0; border-radius: var(--radius-medium);
  background: var(--v-dent-btn); opacity: 0; pointer-events: none;
  transition: opacity var(--v-press-out);
}
.menu-icon-btn:active::after { opacity: 1; transition: opacity var(--v-press-in); }
.menu-icon-btn:hover { background: var(--v-face); border: none; }
.menu-icon-btn svg { filter: var(--v-icon-filter); }
.menu-icon-btn:active { transform: translateY(1px); }
.menu-icon-btn:has(.menu-value[data-off="true"]) {
  background: var(--v-well-bg);
  box-shadow: var(--v-pit);
  color: var(--text-muted);
}
.menu-icon-btn .menu-value {
  color: var(--v-ink);
  text-shadow: var(--v-text-shadow);
}
.menu-icon-btn:has(.menu-value[data-off="true"]) .menu-value { color: var(--text-muted); }

/* ---- sheet: a thick molded slab — key-light glow on the top edge,
        deep layered cast below, rolled bevel, big round corners ---- */
/* No key-light: the glow belongs to things lifting out of the page's
   fabric — this panel slides OVER the page, so it only casts shadow. */
.sheet {
  border-radius: 28px;
  box-shadow:
    0 30px 70px rgb(0 0 0 / 0.5),
    0 10px 28px rgb(0 0 0 / 0.32),
    var(--v-bevel);
}
/* ---- icon toggles: true squares; OFF sinks into a darker well ---- */
.menu-icon-btn {
  aspect-ratio: 1;
  min-height: 0;
  height: auto;
}
.menu-icon-btn:has(.menu-value[data-off="true"]) {
  background: color-mix(in srgb, #000 16%, var(--v-well-bg));
}

/* ---- gear wears its own round pill while the panel is open ---- */
.tab-settings[aria-expanded="true"] {
  background: var(--v-face);
  box-shadow: var(--v-pill);
  color: var(--v-ink-strong);
}

/* ---- sheet rows: same press language as the bar ---- */
.sheet { background: color-mix(in srgb, var(--v-bg) 62%, transparent); }
.sheet .menu-label { color: var(--v-gold); }
.menu-item {
  position: relative;
  font-size: var(--text-body);
  font-weight: 400;
  letter-spacing: 0.006em;
  color: color-mix(in srgb, var(--v-ink-strong) 72%, transparent);
  transition:
    transform var(--v-press-out),
    background 0.2s ease,
    box-shadow 0.2s ease;
}
.menu-item:hover { background: transparent; }
/* press: the row sinks INTO the panel — a true bevel, no shadow smear */
.menu-item:active {
  transform: translateY(1px);
  background: var(--v-well-bg);
  box-shadow: var(--v-pit);
  transition-duration: 0.09s;
}
.menu-item svg { filter: var(--v-icon-filter); color: var(--v-ink); }
```

### The composition layer (type voices, gold ink, spacing)

Two type voices: an elegant serif display for statements
(Baskerville/Palatino/New York stack, weight 400) and the rounded stack
in wide-tracked uppercase for micro labels. Content sits left-set at
~46rem. Key numbers wear the gold ink token `--v-gold`. Several
selectors in this slice are app examples (`.verdict`, `.stat`,
`.chart-card`, the intro/inputs/results sections, the nudge and overlay)
— keep them as reference recipes for how app pages compose the theme:

```css
/* ======================================================================
   CRED-INSPIRED COMPOSITION — big left-set type, roomy sections, gold
   numbers. Two voices: heavy tight display type for statements, the
   rounded stack in wide-tracked uppercase for micro labels.
   ====================================================================== */
body { --v-gold: #8a6c26; }
html[data-mode="dark"] body { --v-gold: #dcbe8e; }

.snap-section { padding-inline: var(--space-5) calc(var(--space-5) + 14px); }
.snap-section > * { max-width: 46rem; }

/* micro labels: rounded, spaced, quiet */
.eyebrow,
.field-label,
.stat dt,
.chart-card h2,
.menu-label {
  font-family: var(--v-font);
  font-size: var(--text-caption);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--text-muted);
}
.eyebrow { color: var(--v-gold); display: block; }

/* statements: heavy, tight, left-set */
.intro-stack { text-align: left; align-items: flex-start; gap: var(--space-4); }
.intro-stack p { margin-inline: 0; font-size: var(--text-h4); color: var(--text-muted); }
.intro-stack h1 {
  font-size: clamp(2.75rem, 12vw, 4.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.02;
}
.app-emoji { font-size: 2.6rem; }
.inputs-section h2 {
  font-size: clamp(1.9rem, 8vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.verdict {
  text-align: left;
  font-size: clamp(1.75rem, 7.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
/* the numbers that matter glow gold */
.verdict strong { color: var(--v-gold); }
.stat dd { color: var(--v-gold); font-size: var(--text-h2); font-weight: 800; }
.number-words { color: var(--v-gold); }
.field output { color: var(--v-gold); }


/* ---- intro: eyebrow pinned top, script heading centred, arrow floating
        above the bar ---- */
.intro-section { position: relative; padding-left: var(--space-6); }
.intro-stack {
  margin-bottom: 12vh;                /* lifts the title above centre */
  gap: calc(var(--space-4) * 2);      /* twice the stack's usual air */
}
.intro-stack h1 {
  /* one elegant step past a plain serif — nothing extreme */
  font-family: "Baskerville", "Palatino", "New York", ui-serif, Georgia, serif;
  font-weight: 400;
  font-size: clamp(3.4rem, 15.5vw, 5.6rem);
  letter-spacing: -0.01em;
  line-height: 1.04;
  color: var(--v-gold);
}
.intro-stack p {
  font-size: 1.22rem;
  font-weight: 300;
  line-height: 1.55;
}
.intro-scroll {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  margin-top: calc(var(--space-4) * 2);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  font-family: var(--v-font);
  font-size: var(--text-body);
  font-weight: 600;
}
.intro-scroll:active { transform: translateY(1px); }
.intro-scroll svg { animation: intro-bob 1.9s ease-in-out infinite; }
@keyframes intro-bob {
  0%, 100% { transform: translateY(-1px); }
  50%      { transform: translateY(4px); }
}
@media (prefers-reduced-motion: reduce) { .intro-scroll svg { animation: none; } }

/* ---- every section gets the SAME head- and foot-room, so each snaps
        with balanced air; content taller than that scrolls inside the
        section (margin-block auto centres a short one) before the snap.
        The tab-bar height (48px) is mirrored at the top for symmetry. ---- */
.snap-section {
  --sec-pad-y: calc((48px + var(--space-6)) * 2);
  padding-top: calc(env(safe-area-inset-top, 0px) + var(--sec-pad-y));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--sec-pad-y));
}
.results-inner { gap: var(--space-5); }
/* elegant verdict: lighter serif voice, larger, airy */
.verdict {
  font-family: ui-serif, "New York", Georgia, "Times New Roman", serif;
  font-weight: 400;
  font-size: clamp(2rem, 9.5vw, 2.9rem);
  letter-spacing: -0.01em;
  line-height: 1.22;
  text-align: left;
}
.verdict strong { font-weight: 600; }
.verdict-sub {
  font-size: var(--text-h4);
  color: var(--text-muted);
  max-width: 40ch;
}
.stat dt { white-space: nowrap; }
.stat dd { font-size: clamp(1.6rem, 7vw, 2rem); }

/* ---- projection warning + data source: quiet fine print ---- */
.proj-note {
  font-size: var(--text-caption);
  color: var(--text-muted);
  max-width: 44ch;
}
.source-note {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + var(--space-6));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2 * var(--space-5));
  max-width: 46rem;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
  opacity: 0.6;
  text-align: left;
}

/* ---- install nudge: a velvet card over a dim scrim, above the bar ---- */
.nudge-scrim {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-5);
  padding-bottom: calc(var(--space-3) + 48px + env(safe-area-inset-bottom, 0px) + var(--space-6));
  background: rgb(0 0 0 / 0.5);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}
.nudge-card {
  width: min(100%, 22rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5) var(--space-4);
  border-radius: 28px;
  background: var(--v-bg);
  box-shadow:
    0 30px 70px rgb(0 0 0 / 0.5),
    0 10px 28px rgb(0 0 0 / 0.32),
    var(--v-bevel);
  text-align: center;
}
.nudge-card h2 { font-size: var(--text-h3); }
.nudge-card p { color: var(--text-muted); font-size: var(--text-small); max-width: 30ch; }
.nudge-add {
  width: 100%;
  min-height: 52px;
  margin-top: var(--space-2);
  border: none;
  background: var(--v-face-accent);
  color: var(--v-ink-accent);
  box-shadow: var(--v-raised);
  font-family: var(--v-font);
}
.nudge-add:hover { background: var(--v-face-accent); }
.nudge-add:active { background: var(--v-face-accent); box-shadow: var(--v-raised-pressed); }
.nudge-later {
  width: 100%;
  border: none;
  background: transparent;
  box-shadow: none;
  color: var(--text-muted);
  opacity: 0.7;
}
.nudge-never {
  border: none;
  background: transparent;
  padding: var(--space-2);
  font-size: var(--text-caption);
  color: var(--text-muted);
  opacity: 0.6;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ---- add-to-home-screen instruction: the whole screen goes dark,
        the direction sits up top where the eye lands ---- */
.a2hs-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgb(0 0 0 / 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-8)) var(--space-5) var(--space-8);
}
.a2hs-overlay .eyebrow { color: #dcbe8e; }
.a2hs-title {
  font-size: clamp(2rem, 9vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: #ffffff;
  max-width: 20ch;
}
.a2hs-title strong { color: #dcbe8e; }
.a2hs-sub { color: rgb(255 255 255 / 0.6); font-size: var(--text-h4); }

/* ---- tooltip tail + touch behaviour (candidate: fold into facet's
        [data-tip]). facet's bubble is :hover/:focus-visible driven;
        iOS applies a STICKY :hover on tap that never clears, so on
        touch we kill :hover and drive the bubble from a .tip-on class
        (JS shows it ~5s after a tap, then it fades). ---- */
[data-tip]::before {
  content: "";
  position: absolute;
  bottom: calc(100% + var(--space-2) - 5px);
  left: 50%;
  translate: -50% 2px;
  z-index: 10;
  border: 5px solid transparent;
  border-top-color: var(--text);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    translate var(--duration-fast) var(--ease-out);
}
[data-tip][data-tip-below]::before {
  bottom: auto;
  top: calc(100% + var(--space-2) - 5px);
  border-top-color: transparent;
  border-bottom-color: var(--text);
}
@media (hover: hover) {
  [data-tip]:hover::before { opacity: 1; translate: -50% 0; }
}
@media (hover: none) {
  /* touch: no sticky hover bubble/tail */
  [data-tip]:hover::after,
  [data-tip]:hover::before { opacity: 0; }
}
[data-tip].tip-on::after,
[data-tip].tip-on::before { opacity: 1; translate: -50% 0; }

/* capsules stay true circles/pills — squircle corners read square here */
@supports (corner-shape: squircle) {
  .chevron-btn,
  .results-actions .btn,
  .results-go,
  .seg,
  .seg-btn { corner-shape: round; }
}
```

---

## 2. LAYOUT: THE SNAP-PAGER (full-screen sections that snap to tops)

The library takes layouts — this is the one to add. Three (or N)
full-viewport sections; each scrolls natively INSIDE itself; the page
transitions between them with a spring and can only ever land on a
section's top (or the previous section's bottom when paging back up).

### The law (why, learned the hard way on iOS)

Nothing declarative survives iOS for this: CSS `scroll-snap-type:
mandatory` re-snaps any section taller than the viewport back to its top
after a flick and wedges the next gesture; `proximity` feels like no
snap at all; a free-scrolling outer with a JS settle-snap is mushy and
fights momentum; nested scrollers with a free outer break scroll
chaining. The model that works — the PAGER:

- The outer `.snap` container **never free-scrolls**: `overflow: hidden`,
  CSS snap `none`, `scroll-behavior: auto`. JS springs its `scrollTop`
  between section tops (analytic spring w=11 z=0.9).
- Every `.snap-section` is exactly `100dvh`, `overflow-y: auto`,
  `overscroll-behavior: contain` — content scrolls inside with full
  native momentum. Short content centres via `margin-block: auto` on the
  child (never `justify-content: center`, which clips the top of
  overflowing content and makes it unreachable).
- **Gesture handoff:** a non-passive `touchmove` on the outer watches the
  active section; when it is at its edge in the pull direction, the move
  is prevented (guard `e.cancelable`), the pull accumulates, the whole
  container translates by `pull * 0.28` as a rubber-band hint, and past
  ~56px of pull it commits: spring to the neighbour (reversals reset the
  pull; gestures starting on `.chart`, `input`, `textarea` are ignored —
  those own their touches). Paging UP pre-sets the destination section's
  `scrollTop` to its max so you arrive at its **bottom**.
- **Wheel:** same edge test; accumulate ~60 deltaY within 250ms, page
  once, cool down 650ms.
- All sections share EQUAL head/foot padding (`--sec-pad-y`, tab-bar
  height mirrored at the top) and a hairline divider marks each
  boundary. Tab-bar taps route through the pager too.

### Markup skeleton

```html
<main class="snap">
  <section class="snap-section" id="intro"> <div class="stack">…</div> </section>
  <section class="snap-section" id="inputs"> <div class="stack">…</div> </section>
  <section class="snap-section" id="results"> <div class="stack">…</div> </section>
</main>
<!-- html/body are pinned to one viewport; .snap is the only outer frame -->
```

### Layout CSS, verbatim (app shell + pager model + boundaries)

```css
/* ----- app shell: behaves like an app, not a document ----- */
/* No stray scrollbars, no pinch/double-tap zoom, no text selection,
   and nothing wider than the viewport. */
/* The .snap container is the ONLY scroller: the document itself is
   pinned to exactly one viewport so an overscroll at the top can never
   latch onto the body and hijack the next gesture. */
html, body {
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
}
body {
  min-height: 0;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
.snap {
  overflow-x: hidden;
  scrollbar-width: none;
  overscroll-behavior-y: contain;
}
.snap::-webkit-scrollbar { display: none; }
/* pan-y = vertical scroll only, which also disables iOS double-tap
   zoom and pinch; the fixed chrome uses manipulation (tap, no zoom). */
.snap, .snap-section { touch-action: pan-y; }
.tab-bar, .sheet, .sheet-scrim, .nudge-scrim, .a2hs-overlay { touch-action: manipulation; }
/* PAGER MODEL (final): the outer container NEVER free-scrolls — CSS
   snap off, overflow hidden, JS springs its scrollTop between section
   tops, so a transition can only ever land on a section top (or the
   previous section's bottom coming back up). Each section is exactly
   one viewport tall and scrolls natively INSIDE itself; pulling past
   its edge hands the gesture to the pager. This is the only model
   that survives iOS: CSS mandatory yanks tall sections, proximity
   doesn't snap, and free-scrolling outers fight the sections. */
.snap {
  scroll-snap-type: none;
  overflow-y: hidden;
  scroll-behavior: auto;      /* the pager sets scrollTop per frame */
}
.snap-section {
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  justify-content: flex-start;
}
.snap-section::-webkit-scrollbar { display: none; }
.snap-section > .stack { margin-block: auto; }  /* short content centres */
/* a hairline at each boundary shows where one section's foot-room ends
   and the next one's head-room begins */
.snap-section + .snap-section {
  border-top: 1px solid color-mix(in srgb, var(--v-ink-strong) 12%, transparent);
}

/* Content sits away from the edges, centred; extra footroom for the
   bottom tab bar. */
.snap-section { padding: var(--space-6) var(--space-7) var(--space-8); }
```

```css
/* every section gets the SAME head- and foot-room; the tab-bar height
   is mirrored at the top for symmetry */
.snap-section {
  --sec-pad-y: calc((48px + var(--space-6)) * 2);
  padding-top: calc(env(safe-area-inset-top, 0px) + var(--sec-pad-y));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--sec-pad-y));
}
.snap-section + .snap-section {
  border-top: 1px solid color-mix(in srgb, var(--v-ink-strong) 12%, transparent);
}
```

### Layout JS, verbatim (pager + gestures + composite page gauge + tab wiring)

Host hooks to generalize when this becomes `facetPager(snap, opts)`:
`markSection(id)` / `navLockUntil` (tab-pill sync), `feedback.snap()`
(sound/haptic on page), and `facetScrollGauge` (§4). Everything else is
self-contained:

```js
  /* ----- section nav: the bottom tab bar with its gliding pill ----- */
  const snap = document.querySelector(".snap");
  const sections = [...snap.querySelectorAll(".snap-section")];

  /* ----- pager: fullpage-style transitions. The outer only ever moves
     through here, so it can only land on a section top — or show the
     previous section's bottom when coming back up. ----- */
  const pager = (() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = 11, Z = 0.9, DT = 1 / 60;    // gentle spring, whisper of bounce
    let cur = 0, raf = null, x = 0, v = 0, target = 0;
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
      markSection(sec.id);
      navLockUntil = performance.now() + 700;
      if (reduce) { snap.scrollTop = x = target; v = 0; return; }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    addEventListener("resize", () => {
      if (raf) return;
      snap.scrollTop = x = target = sections[cur].offsetTop; v = 0;
    });
    return {
      go,
      toEl: el => go(sections.indexOf(el)),
      get index() { return cur; },
      set index(i) { cur = Math.max(0, Math.min(sections.length - 1, i)); },
      get animating() { return !!raf; },
      settle() { go(Math.round(snap.scrollTop / snap.clientHeight)); },
    };
  })();

  /* ----- gesture handoff: a pull past the active section's edge (or any
     swipe on a section that already fits) pages to the neighbour. A small
     rubber-band hint shows the pull before it commits. ----- */
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
    snap.addEventListener("touchstart", e => {
      tracking = !pager.animating && e.touches.length === 1
        && !e.target.closest(".chart, input, textarea");
      consumed = false; pull = 0;
      if (tracking) lastY = e.touches[0].clientY;
    }, { passive: true });
    snap.addEventListener("touchmove", e => {
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
          feedback.snap();
          pager.go(pager.index + (pull > 0 ? 1 : -1), { fromBottom: pull < 0 });
          pull = 0;
        }
      } else if (pull) { pull = 0; release(); }
    }, { passive: false });
    const endTouch = () => { if (pull) { pull = 0; release(); } tracking = false; };
    snap.addEventListener("touchend", endTouch, { passive: true });
    snap.addEventListener("touchcancel", endTouch, { passive: true });

    // desktop wheel: an edge-push hops one section, then cools down
    let acc = 0, accT = 0, cool = 0;
    snap.addEventListener("wheel", e => {
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
          feedback.snap();
          pager.go(pager.index + (e.deltaY > 0 ? 1 : -1), { fromBottom: e.deltaY < 0 });
        }
      }
    }, { passive: false });
  }

  /* ----- the lane reflects + drives the COMPOSITE scroll: every
     section's inner height laid end to end ----- */
  const pageMetric = () => {
    const vh = snap.clientHeight;
    const outer = snap.scrollTop;
    const active = Math.max(0, Math.min(sections.length - 1, Math.round(outer / vh)));
    let total = 0;
    for (const sec of sections) total += sec.scrollHeight;
    let pos = outer - active * vh;          // fractional offset mid-glide
    for (let i = 0; i < active; i++) pos += sections[i].scrollHeight;
    pos += sections[active].scrollTop;
    return { pos, total, visible: vh };
  };
  const scrollToComposite = frac => {
    const vh = snap.clientHeight;
    let total = 0;
    for (const sec of sections) total += sec.scrollHeight;
    let pos = Math.max(0, Math.min(1, frac)) * (total - vh);
    let base = 0;
    for (let i = 0; i < sections.length; i++) {
      const sh = sections[i].scrollHeight;
      const last = i === sections.length - 1;
      if (pos <= base + sh || last) {
        const raw = pos - base;
        const innerMax = Math.max(0, sh - vh);
        sections.forEach((sec, j) => {
          sec.scrollTop = j < i ? sec.scrollHeight : j === i ? Math.min(raw, innerMax) : 0;
        });
        snap.scrollTop = sections[i].offsetTop;
        pager.index = i;
        break;
      }
      base += sh;
    }
  };
  const pageGauge = facetScrollGauge(snap, {
    className: "scroll-gauge-page",
    metric: pageMetric,
    onScrub: scrollToComposite,
    onScrubEnd: () => pager.settle(),
  });
  sections.forEach(sec =>
    sec.addEventListener("scroll", pageGauge.update, { passive: true }));
  const sectionDots = [...document.querySelectorAll(".tab-seg")];
  const tabs = facetTabIndicator(document.querySelector(".tab-bar"));
  const segFor = id => sectionDots.find(d => d.dataset.section === id);
  tabs.moveTo(segFor("intro"));
  let currentSection = "intro";
  let navLockUntil = 0;                   // tap-driven glides own the pill
  const markSection = id => {
    currentSection = id;
    tabs.moveTo(segFor(id));
    sectionDots.forEach(dot =>
      dot.setAttribute("aria-current", String(dot.dataset.section === id)));
  };
  const goTo = id => {
    feedback.tap();
    markSection(id);                      // pill glides straight to the target...
    navLockUntil = performance.now() + 1000;  // ...while pass-through sections stay quiet
    snapTo($(id));
  };
  sectionDots.forEach(dot =>
    dot.addEventListener("click", () => goTo(dot.dataset.section)));
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || performance.now() < navLockUntil) continue;
      if (entry.target.id !== currentSection) feedback.snap();
      markSection(entry.target.id);
    }
  }, { root: snap, threshold: 0.6 });
  document.querySelectorAll(".snap-section").forEach(s => sectionObserver.observe(s));
```

---

## 3. COMPONENTS

The CSS for 3.1–3.4 lives in one tokens-only block, verbatim below
(§3.0); their velvet skins are inside the theme slice (§1). Components
3.5+ carry their slices inline. Markup contracts follow each
description.

### 3.0 The candidate component CSS (tab bar, sheet, menu list, scroll gauge)

```css
/* ======================================================================
   FACET-CANDIDATE COMPONENTS — designed for extraction into facet.css.
   Three components, tokens only, no app-specific selectors:
     TAB BAR   .tab-bar > .tab-seg / .tab-divider / .tab-settings
     SHEET     .sheet-scrim + .sheet[data-open] > .sheet-body
     MENU LIST .menu-item / .menu-label / .menu-divider / .menu-value
   To promote: move this whole block to facet.css and delete it here.
   ====================================================================== */

/* ----- TAB BAR: iOS-style bottom pill of segments + a trailing icon -----
   Embossed frosted glass: translucent over a backdrop blur, pressed INTO
   the page via inset shadows (dark from the top, faint from the bottom).
   The active highlight is one .tab-indicator pill (injected by
   facetTabIndicator) that glides between segments like iOS. */
.tab-bar {
  position: fixed;
  bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  padding: var(--space-1);
  /* Light blur only: content should visibly move behind the glass. */
  background: color-mix(in srgb, var(--surface) 32%, transparent);
  -webkit-backdrop-filter: blur(5px) saturate(1.4);
  backdrop-filter: blur(5px) saturate(1.4);
  border: var(--border-width) solid color-mix(in srgb, var(--border) 65%, transparent);
  border-radius: var(--radius-pill);
  box-shadow:
    inset 0 2px 5px color-mix(in srgb, var(--text) 22%, transparent),
    inset 0 -1px 3px color-mix(in srgb, var(--text) 9%, transparent),
    0 1px 0 color-mix(in srgb, var(--surface) 55%, transparent);
  white-space: nowrap;
}
.tab-indicator {
  position: absolute;
  top: var(--space-1);
  left: 0;
  height: calc(100% - var(--space-1) * 2);
  width: 0;
  border-radius: var(--radius-pill);
  /* raised pill gliding inside the inset bar; facetTabIndicator
     animates transform/width itself (squash-and-stretch), so no
     CSS transition here */
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  box-shadow:
    0 2px 5px color-mix(in srgb, var(--text) 25%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--background) 85%, transparent);
  pointer-events: none;
}
.tab-seg {
  position: relative;
  z-index: 1;
  min-height: 40px;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-small);
  font-weight: var(--weight-strong);
  /* letterpress: inactive labels sit pressed into the inset bar */
  text-shadow: 0 1px 0 color-mix(in srgb, var(--background) 65%, transparent);
  transition: color var(--duration-fast) var(--ease-out);
}
.tab-seg[aria-current="true"] {
  color: var(--accent-pressed);
  /* the active label rides the raised pill: crisper, lighter press */
  text-shadow: 0 1px 0 color-mix(in srgb, var(--background) 40%, transparent);
}
.tab-divider {
  width: var(--border-width);
  height: var(--space-5);
  background: var(--border);
  margin-inline: var(--space-1);
}
.tab-settings {
  position: relative;
  z-index: 1;
  width: 40px;
  min-width: 40px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-muted);
  transition: color var(--duration-fast) var(--ease-out);
}
/* The gear turns a quarter with the panel: in on open, back on close. */
.tab-settings svg {
  transition: transform var(--duration-slow) var(--ease-in-out);
}
.tab-settings[aria-expanded="true"] {
  color: var(--accent-pressed);
}
.tab-settings[aria-expanded="true"] svg {
  transform: rotate(90deg);
}

/* ----- SHEET: right-edge slide-in panel over a darkening scrim -----
   Vertically centred; caps at 60% of the viewport height and 80% of
   its width on phones. Content taller than the cap scrolls INSIDE
   .sheet-body. Toggle via data-open on both elements. */
.sheet-scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgb(0 0 0 / 0.6);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-slow) var(--ease-in-out);
}
.sheet-scrim[data-open="true"] {
  opacity: 1;
  pointer-events: auto;
}
.sheet {
  position: fixed;
  top: 50%;
  right: var(--space-3);
  z-index: 41;
  width: min(80vw, 20rem);
  height: 80dvh;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--surface) 40%, transparent);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  backdrop-filter: blur(24px) saturate(1.5);
  border: var(--border-width) solid color-mix(in srgb, var(--border) 65%, transparent);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-overlay);
  /* facetSheet drives entry/exit with the tab pill's per-edge springs
     (frame stretches, right edge never crosses its resting line) —
     no CSS transform transition here, JS owns transform + width. */
  transform: translate(calc(100% + var(--space-4)), -50%);
  visibility: hidden;
}
/* Nav + actions scroll in the top region; the icon row lives in a foot
   pinned below it. The scroll region keeps the panel's RESTING width and
   anchors to the right edge, so while the frame's left edge overshoots
   and breathes, the text inside lands linearly and then stays still —
   the tab bar's still-labels/moving-pill split, applied to the panel.
   The foot spans the frame itself, so its buttons stretch and snap back
   with the overshoot. */
.sheet-scroll {
  flex: 1;
  min-height: 0;
  width: min(80vw, 20rem);
  margin-left: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-5) var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;        /* groups stack close, no spread */
  gap: var(--space-4);
}
/* the foot keeps the RESTING width too: its buttons stay a fixed size
   while the frame overshoots around them */
.sheet-foot {
  width: min(80vw, 20rem);
  margin-left: auto;
  padding: var(--space-2) var(--space-3) var(--space-3);
}
.sheet-group {
  display: flex;
  flex-direction: column;
}
.sheet-scroll .sheet-group { gap: var(--space-1); }
/* SCROLL GAUGE: a pill thumb inset in an embossed groove, top right —
   thumb height shows how much of the content is visible, position
   shows where you are. Spans only the top quarter; its left edge
   lines up with where the panel's corner radius ends. Momentum can
   push the thumb past the groove, where it clips away. Injected by
   facetScrollGauge; the native scrollbar hides in its favour. */
.sheet-scroll { scrollbar-width: none; }
.sheet-scroll::-webkit-scrollbar { display: none; }
.scroll-gauge {
  position: absolute;
  top: var(--space-4);          /* clears the corner curve */
  right: var(--space-2);
  height: 25%;
  width: 8px;                   /* left edge lands at the radius line */
  padding: 2px;                 /* breathing room around the pill */
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--text) 8%, transparent);
  box-shadow:
    inset 0 1px 2px color-mix(in srgb, var(--text) 20%, transparent),
    inset 0 -1px 1px color-mix(in srgb, var(--text) 8%, transparent),
    0 1px 0 color-mix(in srgb, var(--surface) 60%, transparent);
  overflow: hidden;             /* out-of-bounds momentum disappears */
  pointer-events: none;
}
.scroll-gauge-thumb {
  width: 100%;
  border-radius: var(--radius-pill);
  /* a light raised pill sitting in the inset groove */
  background: color-mix(in srgb, var(--surface) 96%, transparent);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--text) 30%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--background) 85%, transparent);
  transition: height var(--duration-fast) var(--ease-out);
}
/* Page-level variant: a fixed lane floating just off the right edge,
   half the viewport tall, vertically centred. The thumb is the
   viewport's true share of the page, so snaps and smooth glides
   read 1:1 on it. */
.scroll-gauge-page {
  position: fixed;
  top: 50%;
  right: var(--space-2);
  transform: translateY(-50%);
  height: 50dvh;
  width: 10px;
  z-index: 25;
  pointer-events: auto;
  cursor: grab;
  touch-action: none;         /* the gauge drags the page, never scrolls */
  transition: width 0.16s ease, right 0.16s ease;
}
/* grab: the lane widens and the pill lights up in the theme colour */
.scroll-gauge-page.grabbing {
  width: 18px;
  right: calc(var(--space-2) - 4px);
  cursor: grabbing;
}
.scroll-gauge-page .scroll-gauge-thumb { transition: background 0.16s ease; }
.scroll-gauge-page.grabbing .scroll-gauge-thumb {
  background: var(--v-gold);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
}

/* Apple-style continuous corners wherever a rectangle has a radius.
   Progressive: browsers without corner-shape keep plain rounding.
   Pills (tab bar, gauge) stay true capsules on purpose. */
@supports (corner-shape: squircle) {
  .sheet,
  .menu-item,
  .menu-icon-btn,
  .stat,
  .chart-card,
  .seg,
  .btn,
  input,
  .result {
    corner-shape: squircle;
  }
}

/* ----- MENU LIST: rows for a sheet or dropdown ----- */
.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-medium);
  background: transparent;
  color: var(--text);
  font-size: var(--text-small);
  font-weight: var(--weight-strong);
  text-align: left;
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-out);
}
.menu-item:hover { background: color-mix(in srgb, var(--background) 55%, transparent); }
.menu-item svg { flex: none; color: var(--text-muted); }
/* Trailing state readout: "Auto", "On", "Tilt"... */
.menu-value {
  margin-left: auto;
  color: var(--accent-pressed);
  font-weight: var(--weight-strong);
}
.menu-value[data-off="true"] { color: var(--text-muted); }
.menu-label {
  padding: var(--space-2) var(--space-3) 0;
  margin-bottom: var(--space-2);
  font-size: var(--text-caption);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.menu-divider {
  border: none;
  border-top: var(--border-width) solid var(--border);
  margin: var(--space-1) var(--space-2);
}
/* Inset divider: a short centred hairline, not edge to edge. */
.menu-divider-inset {
  width: 55%;
  align-self: flex-start;
  margin-left: var(--space-3);
  margin-right: auto;
}
/* A horizontal row of icon controls: equal widths, proper button faces,
   each with a tiny state caption. */
.menu-icon-row {
  flex-direction: row;
  align-items: stretch;
  gap: var(--space-2);
}
.menu-icon-btn {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: 56px;
  padding: var(--space-2) var(--space-1);
  border: var(--border-width) solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: var(--radius-medium);
  /* ON reads raised: light face, soft drop shadow, lit top lip */
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  box-shadow:
    0 2px 4px color-mix(in srgb, var(--text) 16%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--background) 85%, transparent);
  color: var(--text);
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}
.menu-icon-btn:hover {
  background: color-mix(in srgb, var(--surface) 95%, transparent);
  border-color: var(--text-muted);
}
.menu-icon-btn:active { transform: translateY(1px); }
/* OFF reads pressed into the glass: darker well, inset shadows */
.menu-icon-btn:has(.menu-value[data-off="true"]) {
  background: color-mix(in srgb, var(--text) 7%, transparent);
  border-color: color-mix(in srgb, var(--border) 50%, transparent);
  box-shadow:
    inset 0 2px 4px color-mix(in srgb, var(--text) 20%, transparent),
    inset 0 -1px 2px color-mix(in srgb, var(--text) 8%, transparent),
    0 1px 0 color-mix(in srgb, var(--surface) 60%, transparent);
  color: var(--text-muted);
}
.menu-icon-btn .menu-value {
  margin-left: 0;
  font-size: var(--text-caption);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* ================== end FACET-CANDIDATE COMPONENTS ================== */
```

### 3.1 Tab bar + spring pill (`.tab-bar` / `.tab-seg` / `.tab-divider` / `.tab-settings` + `facetTabIndicator`)

iOS-style bottom pill: text segments, hairline divider, trailing gear.
Frosted and translucent (velvet: 55% well + blur(6px) — the page slides
visibly behind), embossed INTO the page via inset shadows. One injected
`.tab-indicator` pill glides behind the active segment on per-edge
analytic springs (leading edge w=16 z=0.70, trailing w=10 z=0.62 — the
pill stretches with momentum and settles with a fixed ~3px overshoot no
matter the jump length). The active label rides the pill up by
`--v-lift`; the gear rotates a quarter turn and wears its own raised
pill while its panel is open. On tab tap, move the pill straight to the
target and suppress observer-driven moves for ~1s (`navLockUntil`) so
pass-through sections don't yank it.

```html
  <nav class="tab-bar" aria-label="Sections">
    <button type="button" class="tab-seg" data-section="intro" aria-current="true">Intro</button>
    <button type="button" class="tab-seg" data-section="inputs" aria-current="false">Inputs</button>
    <button type="button" class="tab-seg" data-section="results" aria-current="false">Results</button>
    <span class="tab-divider" aria-hidden="true"></span>
    <button type="button" class="tab-settings" id="settings-btn" aria-expanded="false" aria-controls="settings-sheet" aria-label="Open settings">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </nav>
```

### 3.2 Sheet (`.sheet-scrim` + `.sheet` > `.sheet-scroll` + `.sheet-foot`) — rigid rubber-band entry

Right-edge panel floating clear of the screen edge, 80dvh tall,
`min(80vw, 20rem)` wide, 28px corners, translucent slab (62% + blur(12))
over a DARK scrim (0.6). **No key-light/top glow**: glow is reserved for
things lifted out of the page's fabric; a panel sliding OVER the page
only casts shadow (dark drops + inset bevel). Motion (final,
user-chosen): the WHOLE panel — frame, text, buttons — slides as one
rigid block on a single translateX spring (open w=15 z=0.62: it
overshoots a touch past its resting edge and rubber-bands back; close
w=18 z=1.0), via `facetSheet` (§4). Anatomy: `.sheet-scroll` holds the
nav/actions groups stacked close from the top and scrolls (its gauge
watches it); `.sheet-foot` is pinned below with the icon row; both keep
the resting width. Scrim tap and Esc close.

Reference markup (the whole settings panel, including the Extras group
added to exercise the panel gauge):

```html
  <aside class="sheet" id="settings-sheet" data-open="false" aria-hidden="true" aria-label="Settings">
    <div class="sheet-scroll">
      <div class="sheet-group">
        <span class="menu-label">Navigation</span>
        <a class="menu-item" href="/apps" data-event="nav-all-apps">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="2" width="5" height="5" rx="1"></rect>
            <rect x="9" y="2" width="5" height="5" rx="1"></rect>
            <rect x="2" y="9" width="5" height="5" rx="1"></rect>
            <rect x="9" y="9" width="5" height="5" rx="1"></rect>
          </svg>
          All apps
        </a>
        <button type="button" class="menu-item" data-nav="intro" data-event="sheet-nav-intro">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5"></circle>
            <path d="M8 7.5v3.5"></path>
            <circle cx="8" cy="5" r="0.5" fill="currentColor"></circle>
          </svg>
          Intro
        </button>
        <button type="button" class="menu-item" data-nav="inputs" data-event="sheet-nav-inputs">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M2 4.5h12M2 11.5h12"></path>
            <circle cx="10.5" cy="4.5" r="1.8" fill="var(--surface)"></circle>
            <circle cx="5.5" cy="11.5" r="1.8" fill="var(--surface)"></circle>
          </svg>
          Inputs
        </button>
        <button type="button" class="menu-item" data-nav="results" data-event="sheet-nav-results">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 13.5V9M6 13.5V5.5M10 13.5V8M14 13.5V3"></path>
          </svg>
          Results
        </button>
      </div>

      <div class="sheet-group">
        <span class="menu-label">Actions</span>
        <button type="button" class="menu-item" id="menu-copy" data-event="share-copy">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <path d="M6.5 9.5l3-3"></path>
            <path d="M7.5 4.5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L11 8"></path>
            <path d="M8.5 11.5l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L5 8"></path>
          </svg>
          Copy result link
        </button>
        <button type="button" class="menu-item" id="menu-reset" data-event="inputs-reset">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 8a5.5 5.5 0 1 1 1.6 3.9"></path>
            <path d="M2.5 12.5V8.9h3.6"></path>
          </svg>
          Reset inputs
        </button>
        <button type="button" class="menu-item" id="menu-a2hs" data-event="add-to-home">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2.5" y="2.5" width="11" height="11" rx="2.5"></rect>
            <path d="M8 5.5v5M5.5 8h5"></path>
          </svg>
          Add to Home Screen
        </button>
      </div>

      <div class="sheet-group">
        <span class="menu-label">Extras</span>
        <button type="button" class="menu-item" id="menu-share" data-event="share-app">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 9.5V2.5M5.5 4.5L8 2l2.5 2.5"></path>
            <path d="M3.5 7.5v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-5"></path>
          </svg>
          Share this app
        </button>
        <a class="menu-item" href="https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG" target="_blank" rel="noopener" data-event="view-data">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5"></circle>
            <path d="M1.5 8h13M8 1.5c-4.5 4-4.5 9 0 13M8 1.5c4.5 4 4.5 9 0 13"></path>
          </svg>
          View the CPI data
        </a>
        <a class="menu-item" href="mailto:tanishk.sharma@live.com?subject=Inflation%20calculator" data-event="email-feedback">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
            <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"></rect>
            <path d="M2 4.5l6 4.5 6-4.5"></path>
          </svg>
          Email feedback
        </a>
        <button type="button" class="menu-item" id="menu-clear" data-event="reset-prompts">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 8a5 5 0 1 1 1.5 3.6"></path>
            <path d="M3 12.5V8.9h3.6"></path>
            <path d="M6 6l4 4M10 6l-4 4"></path>
          </svg>
          Reset app prompts
        </button>
      </div>
    </div>

    <div class="sheet-foot">
      <div class="sheet-group menu-icon-row">
        <button type="button" class="menu-icon-btn" id="ctl-appearance" aria-label="Appearance: cycles light, dark, auto" data-event="cycle-appearance">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5"></circle>
            <path d="M8 1.5v13A6.5 6.5 0 0 0 8 1.5z" fill="currentColor" stroke="none"></path>
          </svg>
          <span class="menu-value" id="val-appearance">Auto</span>
        </button>
        <button type="button" class="menu-icon-btn" id="ctl-sounds" aria-label="Sounds: on or off" data-event="toggle-sounds">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 6v4h2.6L9 13V3L5.1 6z"></path>
            <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" stroke-linecap="round"></path>
          </svg>
          <span class="menu-value" id="val-sounds">On</span>
        </button>
        <button type="button" class="menu-icon-btn" id="ctl-haptics" aria-label="Haptics: on or off" data-event="toggle-haptics">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <rect x="5.5" y="2.5" width="5" height="11" rx="1.5"></rect>
            <path d="M2.5 5.5v5M13.5 5.5v5"></path>
          </svg>
          <span class="menu-value" id="val-haptics">On</span>
        </button>
        <button type="button" class="menu-icon-btn" id="ctl-motion" aria-label="Motion: cycles off, cursor, tilt" data-event="cycle-motion">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 2.5v3M8 10.5v3M2.5 8h3M10.5 8h3"></path>
            <circle cx="8" cy="8" r="1.6"></circle>
          </svg>
          <span class="menu-value" id="val-motion">Off</span>
        </button>
      </div>
    </div>
  </aside>
```

### 3.3 Menu list (`.menu-item` / `.menu-label` / `.menu-icon-row` / `.menu-icon-btn`)

Rows read THIN: weight 400, a hair of tracking, ~72% ink, 40px min
height, a small inter-row gap; group titles in the gold accent ink;
dividers optional (the sheet dropped them). **Press = a true bevel**: the
row sinks INTO the panel (`--v-well-bg` + `--v-pit` + 1px dip) — never a
dark overlay smear. The icon row: equal-width SQUARE toggles
(aspect-ratio 1); ON stands raised (`--v-face` + `--v-raised-2nd`), OFF
sinks into a darker well (`color-mix(#000 16%, --v-well-bg)` + pit); all
state changes EASE over ~0.28s (background/box-shadow/color) — toggles
must never jump. Trailing `.menu-value` readouts ("Auto", "On", "Tilt")
dim via `data-off`. Base CSS in §3.0, velvet skin in §1.

### 3.4 Scroll gauge (`.scroll-gauge` / `.scroll-gauge-thumb` / `.scroll-gauge-page` + `facetScrollGauge`)

A pill thumb inset in an embossed groove beside any scroller: thumb
height = the visible share of the content, position = progress; momentum
slides it out of the groove where `overflow: hidden` clips it away
(deliberately unclamped). Auto-hides when nothing overflows. PANEL
variant: spans the top quarter of the sheet, left edge on the corner-
radius line. PAGE variant (`.scroll-gauge-page` via the `{className}`
option): a fixed lane floating just off the right viewport edge, half
the viewport tall, vertically centred — mounted on the page with a
COMPOSITE metric (all sections' inner heights laid end to end, see the
layout JS) so the thumb is the true viewport-share of the whole page and
follows every snap and glide. DRAGGABLE: `{onScrub, onScrubEnd}` make
the lane a grab handle — grabbing adds `.grabbing` (the lane widens and
the thumb turns theme-gold) and the 0..1 fraction maps back onto the
composite scroll. Content columns reserve ~14px of right padding for the
lane. Base CSS in §3.0, module in §4.

### 3.5 Velvet slider + gold jewel + tick scale (`.slider` / `.year-slider-wrap` / `.slider-scale`)

Carved groove track, raised 32px round knob carrying an 18px gold jewel
dead-centre. Grabbing DEEPENS the jewel's gold — the face never changes
(this overrides the library's white `accent-pressed` `:active`, which
otherwise wins the specificity fight). Below the track, a tick scale
hugging it: minor ticks every 10 units, sparse labels every 40, and an
optional gold "now" tick marking a meaningful value (e.g. the current
year where a projection zone begins). Wrap slider + scale in a flex
column and inset the scale by half the knob so tick positions stay true;
rebuild the ticks in JS when the slider's min/max change.

```html
        <div class="field">
          <span class="field-label" id="from-label">From year &mdash; when you had the money</span>
          <div class="year-row">
            <div class="year-slider-wrap">
              <input type="range" class="slider" id="from-slider" min="1960" max="2056" step="1" value="2000" aria-labelledby="from-label" data-tip="Drag to change the starting year" data-event="year-drag">
              <div class="slider-scale" id="from-scale" aria-hidden="true"></div>
            </div>
            <input type="text" inputmode="numeric" maxlength="4" class="year-input" id="from-input" value="2000" aria-label="From year" data-event="year-edit">
          </div>
          <span class="field-note" id="from-note"></span>
        </div>
```

```css
/* ---- sliders: carved groove, raised round knob ---- */
.slider::-webkit-slider-runnable-track {
  height: 10px; background: var(--v-well-bg); box-shadow: var(--v-pit);
}
.slider::-moz-range-track {
  height: 10px; background: var(--v-well-bg); box-shadow: var(--v-pit);
}
/* a raised face carrying a gold jewel dead-centre; grabbing it deepens
   the gold (the face itself never changes — facet's white
   accent-pressed :active is overridden below) */
.slider::-webkit-slider-thumb {
  width: 32px; height: 32px; margin-top: -11px;
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 78%, #fff 30%) 0,
      var(--v-gold) 55%,
      color-mix(in srgb, var(--v-gold) 72%, #000 28%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
  border: none;
  box-shadow: var(--v-pill);
}
.slider::-moz-range-thumb {
  width: 32px; height: 32px;
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 78%, #fff 30%) 0,
      var(--v-gold) 55%,
      color-mix(in srgb, var(--v-gold) 72%, #000 28%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
  border: none;
  box-shadow: var(--v-pill);
}
.slider:active::-webkit-slider-thumb {
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 88%, #000 8%) 0,
      color-mix(in srgb, var(--v-gold) 74%, #000 26%) 55%,
      color-mix(in srgb, var(--v-gold) 55%, #000 45%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
}
.slider:active::-moz-range-thumb {
  background:
    radial-gradient(circle closest-side at 50% 42%,
      color-mix(in srgb, var(--v-gold) 88%, #000 8%) 0,
      color-mix(in srgb, var(--v-gold) 74%, #000 26%) 55%,
      color-mix(in srgb, var(--v-gold) 55%, #000 45%) 88%,
      transparent 93%) no-repeat 50% 50% / 18px 18px,
    var(--v-face);
}
```

```css
.year-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.year-slider-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.year-slider-wrap .slider { width: 100%; }
/* decade gradations; the gold tick marks "now" on the To slider */
.slider-scale {
  position: relative;
  height: 18px;
  margin: -3px 16px 0;                /* hugs the track; half-knob inset */
}
.slider-scale .tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 5px;
  background: var(--border);
}
.slider-scale .tick-label {
  position: absolute;
  top: 7px;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.8;
}
.slider-scale .tick-now {
  width: 2px;
  height: 8px;
  background: var(--v-gold);
}
.slider-scale .tick-now-label { color: var(--v-gold); opacity: 1; }
```

### 3.6 Choice grid (`.cur-grid` / `.cur-btn` — generalize as `.choice-grid` / `.choice-btn`)

A grid of small square-ish choice buttons (symbol above a tiny caption),
5 per row on phones. Velvet state language: UNSELECTED options sit flat
in carved wells; the SELECTED one stands proud of the fabric with its
symbol in gold. States ease ~0.25s — selection changes must never jump.
This shipped as the app's 10-currency picker; the pattern is any
exclusive pick from up to ~10 options (`aria-pressed` carries state).

```html
        <div class="field">
          <span class="field-label" id="cur-label">Select your currency</span>
          <div class="cur-grid" role="group" aria-labelledby="cur-label">
            <button type="button" class="cur-btn" data-cur="INR" aria-pressed="true" data-tip="Indian rupee" data-event="cur-inr">
              <span class="cur-sym" aria-hidden="true">&#8377;</span><span class="cur-code">INR</span>
            </button>
            <button type="button" class="cur-btn" data-cur="USD" aria-pressed="false" data-tip="US dollar" data-event="cur-usd">
              <span class="cur-sym" aria-hidden="true">$</span><span class="cur-code">USD</span>
            </button>
            <button type="button" class="cur-btn" data-cur="EUR" aria-pressed="false" data-tip="Euro" data-event="cur-eur">
              <span class="cur-sym" aria-hidden="true">&euro;</span><span class="cur-code">EUR</span>
            </button>
            <button type="button" class="cur-btn" data-cur="GBP" aria-pressed="false" data-tip="British pound" data-event="cur-gbp">
              <span class="cur-sym" aria-hidden="true">&pound;</span><span class="cur-code">GBP</span>
            </button>
            <button type="button" class="cur-btn" data-cur="JPY" aria-pressed="false" data-tip="Japanese yen" data-event="cur-jpy">
              <span class="cur-sym" aria-hidden="true">&yen;</span><span class="cur-code">JPY</span>
            </button>
            <button type="button" class="cur-btn" data-cur="CNY" aria-pressed="false" data-tip="Chinese yuan" data-event="cur-cny">
              <span class="cur-sym" aria-hidden="true">CN&yen;</span><span class="cur-code">CNY</span>
            </button>
            <button type="button" class="cur-btn" data-cur="CAD" aria-pressed="false" data-tip="Canadian dollar" data-event="cur-cad">
              <span class="cur-sym" aria-hidden="true">C$</span><span class="cur-code">CAD</span>
            </button>
            <button type="button" class="cur-btn" data-cur="AUD" aria-pressed="false" data-tip="Australian dollar" data-event="cur-aud">
              <span class="cur-sym" aria-hidden="true">A$</span><span class="cur-code">AUD</span>
            </button>
            <button type="button" class="cur-btn" data-cur="BRL" aria-pressed="false" data-tip="Brazilian real" data-event="cur-brl">
              <span class="cur-sym" aria-hidden="true">R$</span><span class="cur-code">BRL</span>
            </button>
            <button type="button" class="cur-btn" data-cur="KRW" aria-pressed="false" data-tip="South Korean won" data-event="cur-krw">
              <span class="cur-sym" aria-hidden="true">&#8361;</span><span class="cur-code">KRW</span>
            </button>
          </div>
        </div>
```

```css
.cur-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}
.cur-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 56px;
  padding: var(--space-2) 0;
  border: none;
  border-radius: var(--radius-medium);
  background: var(--v-well-bg);
  box-shadow: var(--v-pit);
  color: var(--text-muted);
  font-family: var(--v-font);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease,
    color 0.25s ease,
    transform var(--v-press-out);
}
.cur-btn:active { transform: translateY(1px); }
.cur-btn .cur-sym { font-size: var(--text-h4); font-weight: 700; }
.cur-btn .cur-code { font-size: 10px; letter-spacing: 0.06em; }
/* the picked currency stands proud of the fabric */
.cur-btn[aria-pressed="true"] {
  background: var(--v-face);
  box-shadow: var(--v-raised-2nd);
  color: var(--v-ink-strong);
}
.cur-btn[aria-pressed="true"] .cur-sym { color: var(--v-gold); }
```

### 3.7 Capsule number input

The calculator-grade number field reads as one soft capsule: pill
radius, roomy inline padding, 54px min height, `--text-h4` digits,
carved into the material by the theme's input recipe. Pairs with facet's
existing `data-number` behaviours (one-tap clear, grouping, words
readout — the words render in gold via the theme).

```css
/* the amount reads as one soft capsule */
.number-input input {
  border-radius: var(--radius-pill);
  padding-inline: var(--space-5);
  min-height: 54px;
  font-size: var(--text-h4);
}
```

### 3.8 Golden primary button (the one-raised-face CTA)

The primary CTA is the tab pill's face wearing the accent — same object,
one raised face per screen. Capsule shape (`corner-shape: round`; never
squircle on capsules), 52px min height, `--v-face-accent` +
`--v-ink-accent` + `--v-raised`; press swaps to `--v-raised-pressed` +
1px dip. Left-set inside content stacks. (The same recipe skins the
install-nudge CTA.)

```css
.results-go {
  align-self: flex-start;
  width: max-content;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 52px;
  padding: var(--space-3) var(--space-6);
  margin-top: var(--space-2);
  border: none;
  background: var(--v-face-accent);
  color: var(--v-ink-accent);
  box-shadow: var(--v-raised);
  font-family: var(--v-font);
  font-size: var(--text-body);
}
.results-go:hover { background: var(--v-face-accent); }
.results-go:active {
  background: var(--v-face-accent);
  box-shadow: var(--v-raised-pressed);
  transform: translateY(1px);
}
```

### 3.9 Tooltip: tail + touch peek (fold into facet's `[data-tip]`)

Two additions to the library's bubble: a `::before` triangle TAIL under
the bubble (flips with `data-tip-below`), and TOUCH behaviour — iOS
applies a sticky `:hover` on tap that never clears, so under
`@media (hover: none)` the hover bubble is forced off and a `.tip-on`
class (added by a document-level touch `pointerdown`, cleared after ~5s)
drives a peek instead, with the bubble's own fade transition. Desktop
keeps pure-CSS hover.

```css
/* ---- tooltip tail + touch behaviour (candidate: fold into facet's
        [data-tip]). facet's bubble is :hover/:focus-visible driven;
        iOS applies a STICKY :hover on tap that never clears, so on
        touch we kill :hover and drive the bubble from a .tip-on class
        (JS shows it ~5s after a tap, then it fades). ---- */
[data-tip]::before {
  content: "";
  position: absolute;
  bottom: calc(100% + var(--space-2) - 5px);
  left: 50%;
  translate: -50% 2px;
  z-index: 10;
  border: 5px solid transparent;
  border-top-color: var(--text);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    translate var(--duration-fast) var(--ease-out);
}
[data-tip][data-tip-below]::before {
  bottom: auto;
  top: calc(100% + var(--space-2) - 5px);
  border-top-color: transparent;
  border-bottom-color: var(--text);
}
@media (hover: hover) {
  [data-tip]:hover::before { opacity: 1; translate: -50% 0; }
}
@media (hover: none) {
  /* touch: no sticky hover bubble/tail */
  [data-tip]:hover::after,
  [data-tip]:hover::before { opacity: 0; }
}
[data-tip].tip-on::after,
[data-tip].tip-on::before { opacity: 1; translate: -50% 0; }
```

The touch driver (plus the pinch/double-tap guards — candidate
`facetTouchPolish()`):

```js
  // iOS ignores user-scalable=no for pinch; block the gesture directly.
  // (Double-tap zoom is handled by touch-action in CSS.)
  document.addEventListener("gesturestart", e => e.preventDefault());

  /* Tooltips: desktop shows them on hover (CSS). Touch has no hover —
     and iOS makes :hover stick after a tap — so on touch we peek the
     bubble via a .tip-on class for a few seconds, then let it fade. */
  let tipEl = null, tipTimer = 0;
  const clearTip = () => {
    if (tipEl) tipEl.classList.remove("tip-on");
    tipEl = null;
    clearTimeout(tipTimer);
  };
  document.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;      // desktop hover handles it
    const t = e.target.closest("[data-tip]");
    clearTip();
    if (t) {
      tipEl = t;
      t.classList.add("tip-on");
      tipTimer = setTimeout(clearTip, 5000);
    }
  }, { passive: true });
```

### 3.10 Install nudge card (`.nudge-scrim` / `.nudge-card` + `facetInstallNudge`)

A velvet card over a dim blurred scrim, sitting just above the tab bar:
gold eyebrow, title, one-line pitch, then the golden primary "Add now",
a dimmed "Add it later", and fine-print underlined "Don't ask again".
Driven by `facetInstallNudge` (§4): shows once per session after ~30s,
never when standalone / installed / opted out; "Add now" runs the native
prompt on Android or hands off to the instruction overlay on iOS.

```html
  <div class="nudge-scrim" id="a2hs-nudge" hidden>
    <div class="nudge-card" role="dialog" aria-modal="true" aria-labelledby="nudge-title">
      <span class="eyebrow">One tap away</span>
      <h2 id="nudge-title">Add this to your Home Screen</h2>
      <p>Quick access from your phone &mdash; full screen, works offline.</p>
      <button type="button" class="btn nudge-add" id="nudge-add" data-event="nudge-add">Add now</button>
      <button type="button" class="btn nudge-later" id="nudge-later" data-event="nudge-later">Add it later</button>
      <button type="button" class="nudge-never" id="nudge-never" data-event="nudge-never">Don&rsquo;t ask again</button>
    </div>
  </div>
```

```css
/* ---- install nudge: a velvet card over a dim scrim, above the bar ---- */
.nudge-scrim {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--space-5);
  padding-bottom: calc(var(--space-3) + 48px + env(safe-area-inset-bottom, 0px) + var(--space-6));
  background: rgb(0 0 0 / 0.5);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}
.nudge-card {
  width: min(100%, 22rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5) var(--space-4);
  border-radius: 28px;
  background: var(--v-bg);
  box-shadow:
    0 30px 70px rgb(0 0 0 / 0.5),
    0 10px 28px rgb(0 0 0 / 0.32),
    var(--v-bevel);
  text-align: center;
}
.nudge-card h2 { font-size: var(--text-h3); }
.nudge-card p { color: var(--text-muted); font-size: var(--text-small); max-width: 30ch; }
.nudge-add {
  width: 100%;
  min-height: 52px;
  margin-top: var(--space-2);
  border: none;
  background: var(--v-face-accent);
  color: var(--v-ink-accent);
  box-shadow: var(--v-raised);
  font-family: var(--v-font);
}
.nudge-add:hover { background: var(--v-face-accent); }
.nudge-add:active { background: var(--v-face-accent); box-shadow: var(--v-raised-pressed); }
.nudge-later {
  width: 100%;
  border: none;
  background: transparent;
  box-shadow: none;
  color: var(--text-muted);
  opacity: 0.7;
}
.nudge-never {
  border: none;
  background: transparent;
  padding: var(--space-2);
  font-size: var(--text-caption);
  color: var(--text-muted);
  opacity: 0.6;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

### 3.11 Full-screen instruction overlay (`.a2hs-overlay`)

The whole screen goes near-black; the direction sits up top where the
eye lands: gold eyebrow, huge bold title with the key phrase in gold,
muted body lines (one embeds Safari's share-arrow glyph inline), and a
faint "tap anywhere to close". Shipped as the Add-to-Home-Screen
walk-through; reusable for any full-screen how-to.

```html
  <div class="a2hs-overlay" id="a2hs-overlay" hidden>
    <span class="eyebrow">Install this app</span>
    <p class="a2hs-title">Select<br><strong>&ldquo;Add to Home Screen&rdquo;</strong></p>
    <p class="a2hs-sub" id="a2hs-sub">Tap Safari&rsquo;s <strong>Share</strong> button
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-3px" aria-hidden="true"><path d="M10 12V2.5M6.5 5.5L10 2l3.5 3.5"></path><path d="M4.5 9v7a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9"></path></svg>
      in the toolbar, then choose <strong>Add to Home Screen</strong>.</p>
    <p class="a2hs-sub">If the option isn&rsquo;t visible, scroll down further.</p>
    <p class="a2hs-sub" style="opacity:.55">Tap anywhere to close</p>
  </div>
```

```css
/* ---- add-to-home-screen instruction: the whole screen goes dark,
        the direction sits up top where the eye lands ---- */
.a2hs-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgb(0 0 0 / 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-8)) var(--space-5) var(--space-8);
}
.a2hs-overlay .eyebrow { color: #dcbe8e; }
.a2hs-title {
  font-size: clamp(2rem, 9vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: #ffffff;
  max-width: 20ch;
}
.a2hs-title strong { color: #dcbe8e; }
.a2hs-sub { color: rgb(255 255 255 / 0.6); font-size: var(--text-h4); }
```

### 3.12 Typography voices

- **Display serif** (statements, page titles): `"Baskerville",
  "Palatino", "New York", ui-serif, Georgia, serif`, weight 400, tight
  leading — one elegant step past a plain serif, nothing extreme. Hero
  titles render in the theme gold.
- **Verdict serif** (result sentences): `ui-serif, "New York", Georgia`,
  weight 400, large clamp, key numbers in `<strong>` gold at 600.
- **Micro labels**: the rounded stack (`ui-rounded, "SF Pro Rounded",
  "Arial Rounded MT Bold", …` — NEVER put `inherit` inside a font list)
  in 0.16em-tracked uppercase caption size.
- **Fine print** (sources, legal): 11px, muted, ~60% opacity, left-set.
- **Body on display pages**: weight 300, ~1.22rem, relaxed 1.55 leading.
All in the §1 composition slice.

### 3.13 Data-display wells + themed chart marks (app example, theming rules carry)

Stat cards and the chart card are wells carved into the page
(`--v-well-bg` + `--v-pit`, `--radius-large`); big numbers in gold 800.
The data line is the THEME GOLD (2.5px; dashed for projected spans),
dots gold with a `--v-bg` ring, axis text muted, event markers as faint
dashed verticals with labels in a reserved band ABOVE the plot,
crosshair dashed muted. Draw the SVG at ~1 unit per rendered pixel so
type reads true. The chart surface is `touch-action: none` — dragging
reads values, never scrolls — and the crosshair drops on pointer lift.

```css
/* dragging along the chart reads values; it must never scroll the page */
.chart svg { width: 100%; height: auto; touch-action: none; }
.chart .grid { stroke: var(--border); stroke-width: 1; }
.chart .line { stroke: var(--v-gold); stroke-width: 2.5; fill: none;
               stroke-linecap: round; stroke-linejoin: round; }
.chart .dot  { fill: var(--v-gold); stroke: var(--v-bg); stroke-width: 2; }
.chart .lbl   { fill: var(--text); font-weight: 600; }
.chart .lbl-m { fill: var(--text-muted); }
.chart .xhair { stroke: var(--text-muted); stroke-dasharray: 3 3; }
.chart .evt   { stroke: var(--border); stroke-dasharray: 2 5; }
.chart .lbl-e { fill: var(--text-muted); }
.chart .line.proj { stroke-dasharray: 7 7; opacity: 0.85; }
```

---

## 4. JS MODULES (verbatim — already library-shaped)

Zero app-specific references; each is consumed through its small API
(the header comment lists the full surface): `facetFeedback`
(synthesized Web-Audio UI sounds + vibration haptics), `facetSheet`
(rigid rubber-band panel), `facetScrollGauge` (with `{className}`,
`{metric}`, `{onScrub}`/`{onScrubEnd}`), `facetInstallNudge` (A2HS state
+ once-per-session nudge, with the iOS storage-container caveat in its
comment), `facetTabIndicator` (per-edge spring pill), `facetMotion`
(parallax off/cursor/tilt + scroll kick, honours reduced motion).

```js
/* ======================================================================
   FACET-CANDIDATE MODULES — designed for extraction into facet.js.
   Zero app-specific references; each is consumed through its small API.
   To promote: move this whole block to facet.js and delete it here.

   facetFeedback()          -> { sound, haptic, tap, tick, snap, toggle,
                                 success }  (sound.enabled / haptic.enabled)
   facetSheet(sheet, scrim, {onChange}) -> { open, close, toggle, isOpen }
   facetScrollGauge(scroller, {className}) -> { update }
   facetTabIndicator(bar)               -> { moveTo }
   facetInstallNudge(el, {storageKey, delay, busy})
                            -> { standalone, installed, addNow, never }
   facetMotion              -> { register(selector, {xMax, yMax}),
                                 init({scrollRoot}), setMode(mode),
                                 cycle(), mode }  modes: off|cursor|tilt
   ====================================================================== */

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

/* ==================== end FACET-CANDIDATE MODULES ==================== */
```

### Controls wiring pattern (appearance cycle, sound/haptic toggles, motion cycle)

How a page binds the icon-row toggles to the modules — Appearance cycles
Light → Dark → Auto on `data-mode` (Auto follows the system query live),
Sounds/Haptics flip `feedback.sound.enabled` / `feedback.haptic.enabled`,
Motion cycles `facetMotion` off → cursor → tilt (tilt asks iOS
permission inside the user's tap):

```js
  // Appearance: Light -> Dark -> Auto
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  const SCHEMES = ["light", "dark", "auto"];
  let scheme = "auto";
  const applyScheme = () => {
    document.documentElement.dataset.mode =
      scheme === "auto" ? (darkQuery.matches ? "dark" : "light") : scheme;
    setValue("val-appearance", scheme[0].toUpperCase() + scheme.slice(1));
  };
  darkQuery.addEventListener("change", () => { if (scheme === "auto") applyScheme(); });
  on("ctl-appearance", "click", () => {
    feedback.toggle();
    scheme = SCHEMES[(SCHEMES.indexOf(scheme) + 1) % SCHEMES.length];
    applyScheme();
  });
  applyScheme();

  // Sounds / Haptics: On -> Off
  const wireToggle = (btnId, valId, obj) => on(btnId, "click", () => {
    obj.enabled = !obj.enabled;
    setValue(valId, obj.enabled ? "On" : "Off", !obj.enabled);
    feedback.toggle();                    // silent/still if just switched off
  });
  wireToggle("ctl-sounds", "val-sounds", feedback.sound);
  wireToggle("ctl-haptics", "val-haptics", feedback.haptic);

  // Motion: Off -> Cursor -> Tilt (tilt asks iOS permission in the tap)
  const MOTION_LABEL = { off: "Off", cursor: "Cursor", tilt: "Tilt" };
  const showMotion = m => setValue("val-motion", MOTION_LABEL[m], m === "off");
  on("ctl-motion", "click", async () => {
    feedback.toggle();
    showMotion(await facetMotion.cycle());
  });
```

---

## 5. RULES / LAWS (ship as library docs)

```
=====================================================================
4. RULES / DOCS to add to the library
=====================================================================

SNAP LAW (hard-won on iOS, FINAL — the PAGER model): for a full-page
  snap layout where sections can exceed the viewport, nothing declarative
  survives iOS. CSS MANDATORY re-snaps a tall section to its top after a
  flick and wedges the gesture; PROXIMITY feels like no snap; a free-
  scrolling outer with a JS settle-snap is mushy and still fights
  momentum. The model that works — candidate facetPager(snap):
  - The outer container NEVER free-scrolls: overflow hidden, CSS snap
    none, scroll-behavior auto. JS springs its scrollTop between section
    tops (analytic spring w:11 z:0.9), so a transition can ONLY land on
    a section top — or show the previous section's bottom when paging
    back up (set that section's scrollTop to max before the glide).
  - Each section is exactly 100dvh, overflow-y auto, overscroll-behavior
    contain: content scrolls natively INSIDE with full iOS momentum.
    Short content centres via margin-block auto on the child (never
    justify-content center — it clips the top of overflowing content).
  - Gesture handoff: non-passive touchmove on the outer; when the active
    section is at its edge in the pull direction, preventDefault (guard
    e.cancelable), accumulate the pull, translate the container by
    pull*0.28 as a rubber-band hint, and page when |pull| > ~56px
    (reversals reset). Ignore gestures starting on .chart/input/textarea
    — those own their touches. Wheel: same edge test, accumulate ~60
    deltaY within 250ms, then page and cool down ~650ms.
  - The page scroll-gauge needs a COMPOSITE metric (sections' inner
    heights laid end to end) and an inverse mapping for its drag.
  Reference: the pager block in apps/inflation.html.

GESTURE LAW: set touch-action to tame iOS. Scrollers get pan-y (vertical
  scroll only — also kills double-tap zoom and pinch); fixed chrome gets
  manipulation (tap, no zoom); an interactive drag surface (e.g. a chart
  you scrub) gets touch-action: none so the drag never scrolls the page.
  Pair with a gesturestart preventDefault for older iOS pinch. Never rely
  on viewport user-scalable=no / maximum-scale (iOS ignores them).

FULL-BLEED LAW (standalone PWAs): viewport-fit=cover alone is not
  enough on iOS — without <meta name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"> (plus apple-mobile-web-app-capable), the
  installed app gets an opaque strip cutting the page at the status bar.
  Every app page should carry both metas, keep safe-area env() insets in
  its section padding, and the shared manifest's background_color /
  theme_color must match the shipped theme (now #1a1a1e velvet dark, was
  sand).

CACHING RULE (add to facet.js/site docs, and to any service worker
recipe the library ever ships):
  - HTML documents and, during development, the library files themselves
    are NEVER cache-first. Every refresh loads from the network; caches
    (including service worker caches) answer only when the network
    fails (offline). A service worker that serves pages
    stale-while-revalidate makes every deploy invisible until a second
    refresh — this exact bug shipped in apps/sw.js and was fixed by
    switching to network-first (see apps/sw.js for the reference
    worker).
  - Keep serving /lib/facet.css and /lib/facet.js with
    "cache-control: max-age=0, must-revalidate" (Vercel's default) while
    unversioned: browsers revalidate by ETag every load, so consumers
    always get the current library at the cost of cheap 304 checks.

VERSIONING (backlog, after the library reaches v1 — user decision):
  - Introduce immutable versioned URLs for the lib files:
    /lib/v1/facet.css (+ .js), served with
    "cache-control: public, max-age=31536000, immutable".
    The unversioned /lib/facet.css stays as the moving "latest" for
    development. Consumers pin a version in production and bump the URL
    deliberately; caches can then never be stale by construction.
  - Until v1 ships: everything stays network-served/revalidated as
    above. Do not add long cache lifetimes to unversioned URLs — that
    combination is the one that creates stale-library bugs.

CONSUMER NOTE (docs): projects that vendor the lib (like
tanishksharma.com/apps) must keep the vendored copies verbatim in sync
with upstream and treat upstream as the single source of truth.
```

Laws already threaded through the sections above, repeated for the docs
page:

- **TRANSLUCENCY LAW**: overlays and chrome let the page show through
  (tab bar 55% well + blur 6; sheet 62% + blur 12; scrims dark 0.5–0.6
  with a light blur); only the page's own molded elements are opaque.
- **GLOW LAW**: key-light belongs to elements LIFTED out of the fabric.
  Anything sliding OVER the page (sheets, cards on scrims) casts shadow
  only — dark drops + inset bevel, no top glow.
- **SNAP/PAGER LAW**: see §2 — never CSS snap for full-page sections
  that can outgrow the viewport; ship the pager.
- **GESTURE LAW**: `touch-action: pan-y` on scrollers (kills double-tap
  zoom + pinch), `manipulation` on fixed chrome, `none` on drag surfaces
  like charts; `gesturestart` preventDefault for older iOS pinch; never
  rely on viewport `user-scalable=no`.
- **PARALLAX EXCLUSION**: elements carrying velvet lift/press transforms
  never register with facetMotion (inline transforms collide).
