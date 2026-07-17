# Features

The complete capability inventory. One line per capability. Details of any single capability live in its own page or in the code.

## Distribution

- Two files at a public URL, plus an optional service-worker engine.
- One link tag, one script tag.
- No framework, no npm, no build, never minified.
- Projects consume by URL, never copy files in.
- Everyone gets the latest until v1 (see Versioning).

## Works without JavaScript

- Content, layout, links and forms all work with JavaScript off.
- Raw semantic HTML looks designed with no classes.

## Theming

- One attribute restyles the whole page, layout included.
- Dark mode is a second attribute and composes with every theme.
- The four themes, the mechanics and the tools are on the Themes page.

## Tokens

- Every design decision is a variable named by role, never by value.
- Neutral ramp: background, surface, fills, three border weights, three text weights.
- Three accent ranks used as placement layers, base to top.
- Four status colors, each with tint and edge pairs.
- Five vivid decorative colors with text-safe companions.
- Eighteen font roles: seven core, seven special-job, four script pairings; loaded in subsets, unused faces cost nothing.
- Type, weight, line height, tracking, measure and rhythm all tokenised by role.
- Spacing named by intent, from bound pairs to hero breaks.
- Four page-width tiers; one attribute remaps the page.
- Radii, borders, shadows, motion and focus all tokens.

## One-control steps

- Density: small, medium, large, XL, 2XL.
- Text size: small, medium, large, XL, 2XL; only text moves, layout holds. Sizes are rem, so browser and OS text settings scale everything.
- Page width: narrow, default, wide, extra wide.
- Corner shape: one step control.
- Theme sets density and text size; you never pick them separately.

## Translation

- Every built-in string comes from one table; one attribute switches language; extend in one line.
- Marked containers hold one child per language; the active one shows.
- Exactly one language shows with JavaScript off; the page stays crawlable.
- Buttons or a cycle button switch; the URL carries the choice.
- No right-to-left layout, by design.

## Numbers

- Grouping and number words follow the locale: lakh and crore where that is the norm.
- Optional IP locale helper, off by default, never GPS.

## Print and export

- Every page prints ink on paper in every theme; interface controls stay off paper.
- Three print roles: never prints, always prints, prints only.
- Folds open for paper, lazy images load, everything restores after.
- Headings keep their text; cards, rows and figures never tear across sheets.
- One attribute makes any button a Save-as-PDF control.

## Copy hygiene

- Selecting and copying a page yields the content, in reading order.
- Interface controls, buttons, tooltips and gauges are unselectable and never pollute a copy.
- Fixed controls are authored after the content, so selection sweeps content first.

## Accessibility

- AA contrast, full keyboard operation and reduced motion honoured, in every theme, light and dark.
- The full commitment is on the Guidance page.

## Keyboard

- One keyboard map on every page, carried by the components.
- Escape always closes the open layer and returns focus.
- Arrows walk grouped controls; Enter and Space activate.
- The deck presents with arrow, page and space keys.

## Explained in place

- Every interactive element ships a description tooltip on one attribute.

## Sound and haptics

- Five synthesized interface sounds, each paired with a haptic, carried by the components.
- On by default, muted from the settings sheet; sound never carries meaning alone.
- The pairing rules live on the Motion page; the calls are in Functions.

## Head and SEO

- Every template ships a complete head: title, description, social share preview, favicon set.
- The favicon follows the theme, with a PNG fallback so every browser shows it.
- Structured data where the page type has one: the article template carries its JSON-LD slot.

## Analytics

- No vendor baked in.
- Every key action carries a stable event name; five lines wire any tool to all of them.

## Session-scoped settings

- Every stored preference lives for the tab session: restored before paint, gone when the tab closes.

## Page transitions

- One attribute animates every same-origin navigation: the old page eases away, the new one springs in.
- Unsupported browsers simply navigate.

## States

- One grammar for every state: a native pseudo-class, an ARIA attribute, or one status attribute.
- The kinds: hover, focus, pressed, disabled, loading, selected, expanded, indeterminate, readonly, error, warning, success, info, empty.
- Marking a region busy turns its own content into pulsing placeholders.

## App-ready

- Three root files make any page an installable offline app.
- Pages load network-first, so every deploy lands on the next refresh; the cache answers offline.
- Install buttons appear only when the browser offers installation.
- App no-zoom mode: the page refuses pinch and double-tap zoom; images grant it instead (see Elements, pinch-out image zoom).
- Safe areas, 44px touch targets, no hover-only interactions.

## Versioning

- Consume by URL; releases are Git tags.
- At v1, files freeze to a versioned folder; old projects point there forever.
- A changelog consumers can read, since a redeploy changes their live site.
