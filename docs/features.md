# Features

The complete capability inventory. One line per capability. Details of any single capability live in its own page or in the code.

## Distribution

- Two files at a public URL, plus an optional service-worker engine. [done]
- One link tag, one script tag. [done]
- No framework, no npm, no build, never minified. [done]
- Projects consume by URL, never copy files in. [done]
- Everyone gets the latest until v1 (see Versioning). [done]

## Works without JavaScript

- Content, layout, links and forms all work with JavaScript off. [done]
- Raw semantic HTML looks designed with no classes. [done]

## Theming

- One attribute restyles the whole page, layout included. [done]
- Dark mode is a second attribute and composes with every theme. [done]
- The four themes, the mechanics and the tools are on the Themes page. [done]

## Tokens

- Every design decision is a variable named by role, never by value. [done]
- Neutral ramp: background, surface, fills, three border weights, three text weights. [done]
- Three accent ranks used as placement layers, base to top. [done]
- Four status colors, each with tint and edge pairs. [done]
- Five vivid decorative colors with text-safe companions. [done]
- Eighteen font roles: seven core, seven special-job, four script pairings; loaded in subsets, unused faces cost nothing. [done]
- Type, weight, line height, tracking, measure and rhythm all tokenised by role. [done]
- Spacing named by intent, from bound pairs to hero breaks. [done]
- Four page-width tiers; one attribute remaps the page. [done]
- Radii, borders, shadows, motion and focus all tokens. [done]

## One-control steps

- Density: small, medium, large, XL, 2XL. [partial: only small/medium/large ship; no XL or 2XL steps]
- Text size: small, medium, large, XL, 2XL; only text moves, layout holds. Sizes are rem, so browser and OS text settings scale everything. [partial: only small/medium/large ship, no XL or 2XL; rem sizing confirmed]
- Page width: narrow, default, wide, extra wide. [done]
- Corner shape: one step control. [done]
- Theme sets density and text size; you never pick them separately. [gap]

## Translation

- Every built-in string comes from one table; one attribute switches language; extend in one line. [done]
- Marked containers hold one child per language; the active one shows. [done]
- Exactly one language shows with JavaScript off; the page stays crawlable. [done]
- Buttons or a cycle button switch; the URL carries the choice. [done]
- No right-to-left layout, by design. [done]

## Numbers

- Grouping and number words follow the locale: lakh and crore where that is the norm. [done]
- Optional IP locale helper, off by default, never GPS. [done]

## Print and export

- Every page prints ink on paper in every theme; interface controls stay off paper. [done]
- Three print roles: never prints, always prints, prints only. [done]
- Folds open for paper, lazy images load, everything restores after. [done]
- Headings keep their text; cards, rows and figures never tear across sheets. [done]
- One attribute makes any button a Save-as-PDF control. [done]

## Copy hygiene

- Selecting and copying a page yields the content, in reading order. [done]
- Interface controls, buttons, tooltips and gauges are unselectable and never pollute a copy. [done]
- Fixed controls are authored after the content, so selection sweeps content first. [done]

## Accessibility

- AA contrast, full keyboard operation and reduced motion honoured, in every theme, light and dark. [done]
- The full commitment is on the Guidance page. [done]

## Keyboard

- One keyboard map on every page, carried by the components. [done]
- Escape always closes the open layer and returns focus. [done]
- Arrows walk grouped controls; Enter and Space activate. [done]
- The deck presents with arrow, page and space keys. [done]

## Explained in place

- Every interactive element ships a description tooltip on one attribute. [done]

## Sound and haptics

- Five synthesized interface sounds, each paired with a haptic, carried by the components. [done]
- On by default, muted from the settings sheet; sound never carries meaning alone. [done]
- The pairing rules live on the Motion page; the calls are in Functions. [done]

## Head and SEO

- Every template ships a complete head: title, description, social share preview, favicon set. [done]
- The favicon follows the theme, with a PNG fallback so every browser shows it. [gap]
- Structured data where the page type has one: the article template carries its JSON-LD slot. [done]

## Analytics

- No vendor baked in. [done]
- Every key action carries a stable event name; five lines wire any tool to all of them. [done]

## Session-scoped settings

- Every stored preference lives for the tab session: restored before paint, gone when the tab closes. [done]

## Page transitions

- One attribute animates every same-origin navigation: the old page eases away, the new one springs in. [done]
- Unsupported browsers simply navigate. [done]

## States

- One grammar for every state: a native pseudo-class, an ARIA attribute, or one status attribute. [done]
- The kinds: hover, focus, pressed, disabled, loading, selected, expanded, indeterminate, readonly, error, warning, success, info, empty. [done]
- Marking a region busy turns its own content into pulsing placeholders. [done]

## App-ready

- Three root files make any page an installable offline app. [done]
- Pages load network-first, so every deploy lands on the next refresh; the cache answers offline. [done]
- Install buttons appear only when the browser offers installation. [done]
- App no-zoom mode: the page refuses pinch and double-tap zoom; images grant it instead (see Elements, pinch-out image zoom). [partial: pinch-block is always-on rather than an opt-in mode, and no pinch-out image zoom ships]
- Safe areas, 44px touch targets, no hover-only interactions. [done]

## Versioning

- Consume by URL; releases are Git tags. [partial: consume-by-URL ships; no Git tags exist in the repo yet]
- At v1, files freeze to a versioned folder; old projects point there forever. [partial: forward policy only — no /lib/v1 folder or v1 tag exists yet]
- A changelog consumers can read, since a redeploy changes their live site. [gap]
