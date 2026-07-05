# Facet backlog

The build list — the only planning file. One checkbox per item, each
sized to land in one commit, written with enough detail to build from
this file alone. The owner adds work by saying it; Claude writes it in
here immediately, then works the queue top-down on every "continue".
Shipped work is recorded at the bottom.

Ordering rule: heavy systems first, lighter work after. The accent-rank
retokenisation leads because every component sits on it; then the
configuration spine, the JS context/i18n/offline systems, navigation
transitions and the native-theme work; the theming suite and machine
manifest; and only then the lighter CSS adds, site polish and the long
component/blocks/templates road.

Standing exclusion: no right-to-left layout support. Translation yes,
RTL no — decided 4 Jul 2026.

## Queue · heavy systems first

### Accent ranks — R1

- [x] Retokenise color: keep the base family (--background, --surface,
      --text, --text-muted, --border), replace --accent/--accent-hover/
      --accent-pressed/--on-accent with --accent-1/-2/-3, each with
      -hover, -pressed and --on-accent-N, defined for Default light/dark
      and Sand light/dark. Old names removed, not aliased.
- [x] Migrate every component to ranks: btn-primary → accent-1,
      btn-secondary and ghost hover → accent-2, links, slider thumb,
      selection, focus ring, number-words, chips → accent-3. One primary
      per screen stays the rule.
- [x] Docs update for ranks: Color section teaches base + three accents
      with live swatches per rank; Features line, llms.txt, CLAUDE.md
      theme sections all reworded in the same commit.

### Setup and configuration — R14 (load-time core; generator lands with R8)

- [x] Load-time config: facet.js reads data-theme / data-mode / density /
      language off its own script tag or a facet-config JSON block, and
      boots the page into that configuration before first paint.
- [x] Runtime setters: facet.set({theme, mode, density, accent…}) applies
      key-value pairs live — theme, dark/light, accent overrides restyle
      in real time, no reload. Attributes stay the source of truth so
      custom scripts keep working.
- [x] Document the setup step on the site: a "Set up your project"
      strip — pick theme and mode, copy the configured script tags.

### Context in facet.js — R5

- [x] facet.now: date, time, timezone and pre-formatted helpers,
      available synchronously.
- [x] facet.location: country/region/city from IP lookup (endpoint
      documented, overridable, disablable), upgraded via Geolocation
      when permitted; promise + cached property; null on failure, never
      throws.

### Internationalisation — R4 (no RTL, by decision)

- [x] Strings table: every built-in string the library ships moves into
      one table in facet.js; no hardcoded literals remain.
- [x] Language switch: one attribute or facet.set({language}) switches
      all library strings; projects can extend the table with their own
      languages.
- [x] Locale-aware numbers: grouping and words helper follow the locale —
      lakh/crore for India, million/billion elsewhere — defaulting from
      facet.location, overridable by the page.

### Offline, updates and PWA — R6 + R12

- [x] State the pre-v1 policy: "always the latest from the web until v1"
      on the site and in llms.txt.
- [x] Service worker template: cached library files + offline shell,
      served instantly from cache, revalidated against the server when
      online; newer versions download in the background and a flag makes
      them take over on the next refresh or navigation, never mid-page.
- [x] Registration and install helpers in facet.js: one call (or data
      attribute) registers the worker; beforeinstallprompt captured and
      exposed as a simple install-button wiring.
- [x] manifest.json template plus icon-set checklist in the starter.

### Motion personality — R17

How the library moves, not just how it looks. Everything downstream —
page transitions (R13), the parallax/idle motion pack (R11) — inherits
these tokens.

- [x] Personality tokens: two complete motion sets selectable with one
      attribute or config key. Lively, the default: momentum, inertia
      and playful bounce — spring-like overshoot easings (CSS linear()
      spring curves with cubic-bezier fallback), weight in every press,
      settle in every arrival. Calm: short, near-linear, slight — for
      products that should whisper. prefers-reduced-motion stays the
      third level above both: everything collapses to nothing.
- [x] Apply the personality everywhere: every existing transition moves
      to the personality tokens — buttons press with weight and spring
      back, chips and toggles bounce as they flip, tooltips and reveals
      arrive with a settle, slider thumbs carry momentum. No component
      ever hardcodes an easing or duration again; the tokens are the
      only source.
- [x] Wall entry for motion: Lively / Calm / Off chips that flip the
      whole page live so the difference is felt, not described — plus
      the Features and llms.txt lines.

### Seamless page transitions — R13

- [x] Cross-page transitions: @view-transition navigation rules so
      moving between pages of a Facet product animates old-page-out /
      new-page-in while the URL changes; instant fallback where
      unsupported; off under prefers-reduced-motion.
- [x] Opt-in controls: one attribute enables transitions site-wide,
      per-link opt-out, and a facet.js helper for programmatic
      navigation with the same transition.

### Velvet ingestion — R18 · from the inflation-app handoff

COMPLETE. Source of truth was handoff-velvet.md in the repo root
(verbatim export from apps/inflation.html in tanishksharmacom —
user-approved, shipped work), deleted when the last box below ticked;
everything it carried now lives in the library files, the wall, the
Platform laws docs and the R11 chart item.

- [x] Velvet theme (§1): [data-theme="velvet"] light + dark — the two
      --v-* value blocks plus the standard base/accent-rank tokens
      mapped from them (gold = accent-1, gray face = accent-2, gold ink
      = accent-3); component recipes fold into facet.css scoped under
      the theme; behavioral laws recorded as comments. Composition
      layer (type voices, gold ink, spacing) with it.
- [x] Snap-pager layout (§2): the iOS-proven model — outer never
      free-scrolls, JS spring between section tops, sections scroll
      natively inside, gesture handoff with rubber-band hint, wheel
      paging, equal head/foot padding. Ships as facetPager in facet.js
      plus the layout CSS.
- [x] Components (§3) — base CSS ingested and self-wiring; float-btn
      shipped as the lone-trigger variant (owner request, 5 Jul); wall
      entries live for tab bar, sheet & menu, float button, scroll
      gauge, choice grid; tick scale on the slider entry; golden CTA and
      typography voices ship inside the velvet theme; chart theming
      rules moved to the R11 chart item (the handoff is deleted).
      Full list: tab bar + spring pill, sheet, menu list +
      icon toggles, scroll gauge (panel + draggable page variants),
      velvet slider with gold jewel + tick scale, choice grid
      (generalized .choice-grid), capsule number input, golden primary
      CTA, tooltip tail + touch peek (folds into [data-tip] — fixes
      iOS sticky hover), install nudge card, full-screen instruction
      overlay, typography voices, chart theming rules.
- [x] JS modules (§4, verbatim): facetFeedback (sounds + haptics),
      facetSheet, facetScrollGauge, facetTabIndicator, facetInstallNudge,
      facetMotion (parallax off/cursor/tilt — the R11 motion pack,
      arriving by extraction), plus facetTouchPolish and the controls
      wiring pattern.
- [x] Rules / laws (§5): the iOS platform laws into the docs — pager
      law, gesture law, app shell law, caching law, parallax exclusion,
      font-list law — as "Platform laws" in the Rules section on the
      page, in CLAUDE.md where they bind building, and in llms.txt.
      The caching law superseded the R6 worker: facet-sw.js is now
      network-first for pages and unversioned /lib/ files (cache only
      answers offline), cache-first + revalidate for other assets.

### System-native Default theme — R2

- [x] Support matrix first: AccentColor/AccentColorText work in Safari
      16.4+ and Firefox 103+ (real OS accent; iOS resolves to system
      blue), do not parse at all in Chrome/Edge (probed Chromium —
      CSS.supports false, a clean @supports gate); Highlight/
      SelectedItem parse everywhere but are fixed browser blues in
      Chromium, so they cannot carry the accent. Recorded as the
      comment on the system-native accent block in facet.css.
- [x] Wire the Default theme to the OS accent where supported: accent-3
      rank (links, labels, focus ring, selection via ::selection's
      tokens) becomes AccentColor/AccentColorText behind
      @supports (color: AccentColor), hover/pressed via color-mix
      toward ink in light and paper in dark; scoped with :not(
      [data-theme]) so themed pages keep their inks; ink fallback
      everywhere else. Cascade verified in-browser with a same-shape
      probe (Chromium lacks AccentColor, so the selector logic was
      proven with a substituted system color, plus fallback checks).

### Theming suite — R8

- [x] Custom accent recipe: overriding a rank's four tokens in one
      block, documented as a supported feature in the Color section
      with a live example (subtree override on the demo container) and
      the copyable :root block; facet.set named as the runtime path;
      AA note on the on-color included.
- [x] Aero theme, light and dark: sky aqua, glass gloss, translucent
      plastic, pill buttons; palette locked in the theme block; --a-*
      material tokens (gloss with the hard 50% line, glass border,
      glass fill, blue glow); recipes for buttons (pills + gloss),
      inputs (glass capsules), result/tab-bar/sheet/float-btn panels;
      dark is ocean glass. Switcher and setup strip enabled.
- [x] Elegant theme, light and dark: cream and gold, serif display
      via the --font-heading token, carved elevation via the --e-carve
      inset token (panels pressed in, never floated), gold hairline
      borders; obsidian-and-gold dark twin. Switcher and setup strip
      enabled; palette locked in the theme block.
- [x] Theme generator (Style Mixer): #style-mixer on the homepage —
      eight pickers (base family + three accents) restyle the page
      live via facet.set inline custom properties over the active
      theme; hover/pressed derive via color-mix toward ink/paper by
      mode, on-colors by luminance; mix rides ?mix= for sharing;
      export block renders the paste-ready facet.set script; reset
      returns to the active theme. Docs-only logic, inline.
- [x] Skin Lab: #skin-lab on the homepage — 5 themes × 2 modes, each
      panel its own tiny framed document (real facet.css, identical
      markup, one attribute apart). Frames, not subtrees, on purpose:
      material themes scope recipes under [data-theme] and an
      ancestor's recipes would leak into differently-themed subtree
      panels. Lazy-loaded.

### Themed map — R16

- [x] Map styling engine: facet.mapStyle() — the active theme's tokens
      become a Maps styles array by formula (ground = background,
      parks 6% ink, water 14% ink, roads surface/border, labels the
      text family haloed in background, country boundaries accent-3;
      POI/transit clutter off), resolved to hex through a probe so
      color-mix and the OS accent work. Never hand-tuned per theme.
- [x] Map component: div[data-map] wired by initMaps — bring-your-own
      key via data-map-key or data-maps-key on the script tag; loads
      the Maps JS API once, applies facet.mapStyle(), restyles all
      live maps on theme/mode attribute change; themed placeholder
      (token grid + one line, localized) when there is no key, no
      network, or the API fails — never a broken embed.
- [x] Map on the library page: #map wall entry, snippet with copy.
      Docs-key decision recorded: the page carries no key on purpose —
      no referrer-restricted key exists for the domain yet, so the
      placeholder IS the honest no-key state shown live. Swap in a
      site-owned restricted key later by adding data-maps-key to the
      script tag; nothing else changes.

- [x] facet.json: machine-readable manifest at the repo root — files,
      themes, modes, motion personalities, languages, every token by
      group, global data attributes, every component with classes/
      attributes/one-liner, the full facet.* API. Kept in sync by the
      three-places rule (updates in the same commit as any capability).
- [x] "Copy as Markdown for LLM" button per wall entry: docs script
      adds it beside every copy button — heading + description + exact
      snippet fenced as html, one paste per component.
- [x] Analytics bridge: the five-line closest("[data-event]") snippet
      documented under Rules → Analytics on the page, in llms.txt's
      analytics section, with a copy button.
- [x] Playground: #playground — a textarea rendering debounced into a
      framed real page built on the two shipped files, following the
      docs page's theme and mode live.
- [x] Cheatsheet: #cheatsheet — components, global attributes, tokens
      and the JS API rendered from facet.json (one source, can never
      drift), with a filter that hides rows and emptied groups.
- [x] Live size badge: the get-started strip fetches both lib files
      and gzips them in the visitor's own browser (CompressionStream)
      — the real number, never a claim; absent when it cannot be
      computed.

### Reader adaptation — R3

- [x] prefers-contrast: more — token-layer formulas after every theme
      block: muted text becomes the ink, borders mix 55% toward it,
      focus ring thickens to 3px; holds in all themes and modes.
- [x] Forced-colors mode: audited under emulation; background-shaped
      pieces (tab indicator, gauge, sheet, nudge card, float button,
      slider, tooltip) keep a real border in the system palette.
- [x] data-density="compact": tightens the whole spacing scale, html
      or any subtree, same mechanic as themes; config key already
      wired through R14.
- [x] .visually-hidden utility class, standard clip pattern.
- [x] Text roles: .text-display/.text-h1…h4/.text-body/.text-small/
      .text-caption — same names as the tokens; display and heading
      steps carry the heading voice.

### Backgrounds — R15

- [x] Technical-drawing grid background: .bg-grid — plus marks at the
      intersections and nothing else, built from four gradient layers
      (two gridline layers under two background-colored covers with
      transparent windows at each crossing); tokens only, every theme
      and mode.
- [x] Pattern set: .bg-dots, .bg-ruled, .bg-graph (minor/major lines)
      — same one-class mechanic, whisper-faint, background-image: none
      under prefers-contrast: more.
- [x] Backgrounds wall entry with pattern chips, Features line,
      llms.txt section, facet.json entry.

### Safari/iOS capabilities and child safety — R7

- [x] Research pass: catalogued as "iOS, honestly" in the Rules
      section and llms.txt — theme-color tints Safari's chrome;
      standalone install via manifest + apple metas; web push and
      badging only for home-screen apps on iOS 16.4+, from a user
      gesture, never a plain tab; Screen Time, age reading and
      parental controls are OS-only, no web API; child safety for
      websites = self-labeling (RTA rating meta for adult content,
      isFamilyFriendly JSON-LD for family content) plus restraint.
- [x] Implemented: facet.js now creates and live-syncs the
      theme-color meta to the active theme's --background (theme,
      mode and system-scheme changes); the head pack is documented
      with a copy button on the page and in llms.txt; the apple metas
      and manifest mechanics were already law from R18/R6.

### Site polish — R10

- [x] Click-to-copy tokens: every swatch and every token name in the
      type labels is a real button copying its var(--name), with a
      feedback tap.
- [x] Keyboard-first search: "/" or Cmd/Ctrl+K focuses the wall
      search; ArrowDown enters the index and arrows walk its visible
      links, ArrowUp at the top returns to the box.
- [x] Heading permalink anchors: every titled h2/h3 gains a hover/
      focus-revealed # button that copies the deep link and sets the
      hash.
- [x] Class reference table per component: classNotes authored in
      facet.json for all 16 wall components, rendered into each entry
      as a details block — one source, cannot drift.
- [x] Keyboard interaction table on interactive components (keys in
      facet.json, same renderer).
- [x] Do/Don't pairs per component with the one-sentence reason
      (do/dont/why in facet.json).
- [x] Accessibility notes per component (a11y in facet.json): ARIA
      behavior, focus, announcements, honest limits.
- [x] Live AA/AAA contrast badges: WCAG ratios for text/muted/
      on-accent-1/accent-3-link pairs under both color panels,
      probe-resolved per panel, re-rendered on theme/mode mutation.
- [x] Component status badges: data-status on each wall h3 (stable
      core, beta app kit, alpha map), rendered as a pill chip.
- [x] Viewport-width toggles on every demo: phone 375 / tablet 640 /
      desktop chips constraining the demo box.
- [x] Open in CodePen on every wall entry: POSTs the snippet plus the
      two real tags to codepen.io/pen/define.
- [x] Edit-on-GitHub link on every wall entry.

### Components — R11

- [x] Row: .row/.row-tight/.row-loose — horizontal flow with wrap,
      the row owns the gap; wall entry with gap chips.
- [x] Grid: .grid/.grid-wide/.grid-tight/.grid-loose — auto-fit
      minmax columns, breakpoint-free; wall entry with variant chips.
- [x] Switch, checkbox, radio: native inputs themed via accent-color,
      label.check-row makes the whole line the 44px target, .switch
      upgrades a checkbox to track-and-thumb with semantics untouched.
- [x] Stepper (real number input between step buttons; min/max/step
      rule; feedback tick) and segmented control (hidden radios:
      native arrows, form value, announcements; pressed-in pill).
- [x] Input, textarea, select, search as wired field components: one
      label.field pattern for all; select grows a token-colored
      two-gradient chevron (velvet keeps it — recipe moved to
      background-color); search is a capsule; .field-invalid error
      state on every control.
- [x] File upload (::file-selector-button dressed as the secondary
      action, everything else native) and date/time inputs (native
      pickers, accent-color highlight, color-scheme dark).
- [x] Card: .card / .card-outlined / a.card.card-clickable (whole
      surface links, spring lift + press); velvet raises, elegant
      carves, aero glosses — material recipes per theme.
- [x] Modal, drawer, popover: dialog.modal / dialog.drawer opened by
      aria-controls buttons (showModal; Esc, form method=dialog and
      backdrop click close), [popover] styled with light dismiss and
      zero JS; spring arrivals on the motion tokens.
- [x] Accordion (native details, name-grouped exclusivity, rotating
      chevron), toast (facet.toast(message, kind), aria-live rack,
      4s self-dismiss), dropdown menu (details.dropdown of real
      buttons; outside click / Esc / pick closes).
- [x] Tabs (real ARIA tabs: roving tabindex, arrow keys, accent
      underline, facet.js panel wiring), breadcrumb (ol of links,
      aria-current page), pagination (real links, 44px squares,
      accent-1 current, aria-disabled edges).
- [x] Nav link states: .nav-link — muted default, hover names it,
      aria-current="page" fills it; 44px rows for chrome navigation.
- [x] Table component: table.table — muted header, zebra rows, row
      hover, .num tabular columns, .table-scroll phone wrapper.
- [x] Chart: facet.chart(el, {points, projectFrom, events, format}) —
      all the handoff's theming rules shipped: accent-1 line 2.5px
      with dashed projections, background-ringed dots, border grid,
      muted axis text, event verticals labelled in the reserved band
      above, drag crosshair dropped on lift, ~1 unit/px SVG,
      touch-action none. Velvet golds the line through accent-1 with
      zero chart rules; .chart-card is a well there. Bonus fix found
      in verification: [popover]:not(:popover-open) display none at
      author origin, so layout utilities can never beat the UA's
      closed-popover hiding.
- [x] Badge (tinted status pills, four kinds), chip (promoted from
      the docs' own controls; bare aria-pressed chips self-toggle,
      wired chips keep their handlers), avatar (image or initials,
      two sizes), progress (native element themed, accent-1 fill).
- [x] Skeleton (shimmer placeholder, aria-hidden groups), spinner
      (accent ring, role=status words carry it under reduced motion),
      empty state (dashed zone + the one filling action).
- [ ] Flagship link: the signature style for linking to another page
- [ ] Icon set: thin 1.5px line glyphs, around 40 to start
- [ ] Motion: desktop parallax driven by pointer position
- [ ] Motion: mobile parallax driven by scroll — velocity, weight,
      inertia
- [ ] Motion: gyroscope upgrade where permission is granted
- [ ] Motion: idle animations on key elements at rest

### Blocks — R11

- [ ] Grid of cards with responsive columns
- [ ] Horizontal scrolling card row
- [ ] Filterable card list: search and filter bar on top, cards below
- [ ] List cards: stacked full-width rows
- [ ] Product grid: image, title, price, action
- [ ] Product detail block: gallery plus info panel
- [ ] Cart line items with totals
- [ ] Full top menu: logo, links, actions, mobile collapse
- [ ] Sidebar navigation with sections
- [ ] Footer: link columns plus legal row
- [ ] Hero: headline, subtext, CTA
- [ ] Feature grid, pricing table, FAQ list, CTA band
- [ ] Logo row, testimonial block
- [ ] Data table with toolbar: search, filters, actions
- [ ] Stat row: KPI cards
- [ ] Settings section: labelled rows with controls
- [ ] Form section: grouped fields with a submit row
- [ ] Article header: title, byline, meta
- [ ] Prose block: styled long-form text
- [ ] Media figure with caption, pull quote

### Templates and versioning — R11 + R12

- [ ] Landing page assembled from marketing blocks
- [ ] App shell: sidebar plus top bar frame with one dashboard screen
- [ ] Pitch deck: 1920x1080 slide class, full-screen presenting,
      arrow-key navigation
- [ ] Pitch deck: slide layouts — title, content, two-column, chart,
      closing
- [ ] Pitch deck: print-to-PDF export at exact 1080p
- [ ] A4 document: page class with print margins
- [ ] A4 document: letterhead, invoice table, one-pager layout
- [ ] Business card: 3.5x2 inch card class, front and back
- [ ] Business card: print-sheet export at print resolution
- [ ] Article page: header, prose, footer
- [ ] SEO starter: head pack — title, meta description, OG tags, favicon
- [ ] SEO starter: JSON-LD slots — article, product, organization
- [ ] SEO starter: sitemap.xml and robots.txt
- [ ] PWA starter: manifest plus icon set, installable out of the box
      (mechanics land earlier under R6)
- [ ] v1 freeze: copy /lib/ to /lib/v1/, tag the release, start the
      changelog, add the version switcher to the site

## Shipped

### Tokens and themes
- [x] Core palette, accent + hover/pressed, status colors, dark values
      for every token
- [x] One-attribute theme switch (Default, Sand; aero and elegant
      stubbed); layout containers restyle with the theme
- [x] Subtree theming: data-theme / data-mode work on any element
- [x] Font stacks, type scale, weights and line heights
- [x] 4px spacing scale, container widths, radii, border widths, shadow
      scale, motion durations and easings, reduced-motion handling

### Base styles
- [x] Reset (box sizing, margins, media defaults, [hidden] wins)
- [x] Text, forms, media, tables — every raw tag styled
- [x] Focus rings, selection, scrollbars, skip link, print base

### Components
- [x] Container (four widths) · Stack (three gaps) · Snap section
- [x] Button (three variants, three sizes) · Icon button
- [x] Number input: prefilled example, one-tap clear, Indian grouping,
      words helper · Labelled field with hint and error state
- [x] Slider with live readout · Result block (three variants)
- [x] Description tooltip: data-tip on anything, data-tip-below variant

### The library site
- [x] Header: wordmark, live theme switcher with URL state, dark toggle,
      GitHub link
- [x] Get-started strip with self-filling domain and one copy button
- [x] Features section: the complete capability inventory, mirrored in
      llms.txt, no-orphan-features rule in CLAUDE.md
- [x] Rules on the page, near the top, same text as CLAUDE.md and
      llms.txt
- [x] Typography as a real article · Color as light/dark side by side ·
      Spacing through real components · Shape/elevation/motion section
- [x] Element wall: every component live with description-as-AI-
      instructions, variant/state chips, DOM-serialized snippets with
      copy buttons
- [x] Sidebar index with search filtering, scrollspy highlighting,
      dividers between sections
- [x] llms.txt: the full plain-text manual for AI crawlers
