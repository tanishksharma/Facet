# Facet backlog

The build list, in working order. One checkbox per item, ticked as it lands.
Every session: read this file, work the top unchecked item unless told
otherwise, tick what ships. The Notion page is the charter; this file is
the plan.

## Tokens

- [x] Core palette: background, surface, text, muted text, borders
- [x] Accent color plus hover and pressed shades
- [x] Status colors: success, warning, error, info
- [x] Dark mode values for every color token
- [x] One-attribute theme switch on the html tag (Default, Sand; aero and elegant stubbed)
- [x] Layout containers restyle with the theme: padding, gaps, backgrounds
- [x] Font stack: one heading font, one body font, one mono font
- [x] Type scale: display, h1 to h4, body, small, caption
- [ ] Text roles: one class per role, display down to label
- [x] Weights and line heights per scale step
- [x] Spacing scale on a 4px base
- [x] Container widths: narrow, default, wide, full
- [x] Radius scale: small, medium, large, pill
- [x] Border widths
- [x] Shadow scale: flat, raised, floating, overlay
- [x] Motion durations: fast, normal, slow
- [x] Easing curves
- [x] Reduced motion handling

## Base styles

- [x] Reset: box sizing, margin reset, sensible element defaults, [hidden] wins
- [x] Text: headings, paragraphs, links, lists
- [x] Blockquote, code, inline code, horizontal rule
- [x] Forms: raw input, textarea, select and button defaults
- [x] Labels, fieldsets, placeholder styling
- [x] Media: responsive images and video
- [x] Default table styling
- [x] Focus rings, text selection, scrollbars
- [x] Skip-to-content link
- [x] Print base: page margins, hide non-print elements

## Components

- [x] Container: page-width wrapper with themed padding
- [x] Stack: vertical flow with themed gaps
- [ ] Row: horizontal flow with wrap and themed gaps
- [ ] Grid: responsive columns with themed gaps
- [x] Snap section: full-viewport scroll-snap area, the calculator page skeleton
- [x] Button: primary, secondary, ghost, three sizes
- [x] Icon button
- [ ] Switch, checkbox, radio
- [x] Slider
- [ ] Stepper, segmented control
- [ ] Input, textarea, select, search field (as components with field wiring)
- [x] Number input: prefilled example, one-tap clear, Indian digit grouping with words helper
- [x] Labelled field with hint and error state
- [ ] File upload, date input
- [ ] Card: default, outlined, clickable
- [ ] Modal, drawer, popover
- [x] Description tooltip attachable to any element with one attribute
- [ ] Accordion, toast, dropdown menu
- [ ] Tabs, breadcrumb, pagination
- [ ] Nav link states: default, hover, active
- [ ] Table component: header, zebra rows, row hover (beyond base styling)
- [ ] Badge, chip, avatar, progress bar
- [x] Result block: verdict-first big number with supporting figures
- [ ] Skeleton, spinner, empty state block
- [ ] Flagship link: the signature style for linking to another page
- [ ] Motion: desktop parallax driven by pointer position
- [ ] Motion: mobile parallax driven by scroll, with velocity, weight and inertia
- [ ] Motion: gyroscope upgrade where permission is granted
- [ ] Motion: idle animations on key elements at rest
- [x] Motion: all effects disabled under prefers-reduced-motion
- [ ] Icon set: thin 1.5px line glyphs, around 40 to start

## Blocks

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

## Templates

- [ ] Landing page assembled from marketing blocks
- [ ] App shell: sidebar plus top bar frame with one dashboard screen
- [ ] Pitch deck: 1920x1080 slide class, full-screen presenting, arrow-key navigation
- [ ] Pitch deck: slide layouts — title, content, two-column, chart, closing
- [ ] Pitch deck: print-to-PDF export at exact 1080p
- [ ] A4 document: page class with print margins
- [ ] A4 document: letterhead, invoice table, one-pager layout
- [ ] Business card: 3.5x2 inch card class, front and back
- [ ] Business card: print-sheet export at print resolution
- [ ] Article page: header, prose, footer
- [ ] SEO starter: head pack — title, meta description, OG tags, favicon
- [ ] SEO starter: JSON-LD slots — article, product, organization
- [ ] SEO starter: sitemap.xml and robots.txt
- [ ] PWA starter: manifest.json plus icon set, installable out of the box
- [ ] PWA starter: service worker — offline shell, cached library files

## Site

- [x] Header: wordmark, theme switcher, GitHub link
- [x] Get-started strip: link and script tags, one copy button
- [x] Rules on the page, near the top, same text as CLAUDE.md and llms.txt
- [x] Typography section: the scale as a real article — display, headings,
      body, lists, quote, callout, small, caption — each block tagged with
      its token
- [x] Color section: the same mini-interface twice, light and dark side by
      side, following the active theme (subtree theming via data-mode on
      any element)
- [x] Spacing section: real components on a tinted ground — control-row
      gaps, card padding, stack gaps, section rhythm
- [x] Shape, elevation and motion section
- [x] Element wall: every built component live, grouped by layer
- [x] Dividers between sections and wall entries
- [x] Code + copy button per element, serialized from the live DOM
- [x] Description per element as AI instructions, same text as file comments
- [x] Variant and state chips flipping the live demo
- [x] Theme switcher with URL state (?theme=, ?mode=)
- [x] Sidebar index with anchors, search filtering the wall
- [x] Scrollspy: the section on screen highlights in the sidebar
- [ ] Playground: editable HTML box rendering live
- [x] llms.txt at the root for AI crawlers
- [ ] Style Mixer, later: axis controls that export a new theme
- [ ] Skin Lab, later: all themes side by side across layouts

## Site ideas · from researching other libraries' docs

Ranked by value-to-effort for a single static page with vanilla JS.
Sources: shadcn/ui, Tailwind, Radix, MUI, Bootstrap, daisyUI, Storybook,
Primer, Carbon, Polaris, Spectrum, Open Props.

- [ ] Click-to-copy tokens: every swatch and token name copies its
      var(--name) on click (Open Props)
- [ ] Section permalink anchors: hover a heading, copy a deep link
      (Tailwind)
- [ ] Keyboard-first search: "/" or Cmd+K focuses the wall search, arrow
      keys jump between results (shadcn/ui)
- [ ] Copy section as Markdown: per-component "copy for LLM" button,
      companion to llms.txt (shadcn/ui, Tailwind v4)
- [ ] Class reference table per component: every class, modifier and data
      attribute with a one-liner — the HTML equivalent of a props table
      (Radix, MUI)
- [ ] Keyboard interaction table on interactive components: Tab, Enter,
      Esc, arrows (Radix)
- [ ] Do/Don't pairs: one right and one wrong mini-demo per component with
      a one-sentence reason (Polaris)
- [ ] Accessibility notes per component: ARIA behavior, contrast, screen
      reader expectations in place (Carbon)
- [ ] Live contrast badges: computed AA/AAA chips next to color pairs,
      re-checked on theme switch (daisyUI)
- [ ] Component status badges: alpha / beta / stable chip per wall entry
      (Primer)
- [ ] Viewport preview toggles: phone/tablet/desktop widths on each demo
      (Storybook, shadcn/ui blocks)
- [ ] Open in CodePen: one button that posts the snippet plus the two tags
      to codepen.io/pen/define — no backend needed (MUI's sandbox links)
- [ ] Cheatsheet strip: one dense searchable table of every class in the
      library (Bootstrap cheatsheet)
- [ ] Edit-on-GitHub link per component section (Primer, Tailwind)
- [ ] Templates gallery: scaled live iframes of deck/card/document once
      Layer 5 lands (Bootstrap examples)
- [ ] Version switcher + changelog once /lib/v1/ exists (Bootstrap)
- [ ] Theme generator: pick the five semantic colors, live-restyle the
      page, export the CSS block, share via URL — the Style Mixer, staged
      (daisyUI theme generator)
