# Browser capabilities

What the browser itself gives Facet, grouped by topic: the support contract, the platform features area by area, the platform-specific features from iOS to desktop, and what the web cannot do.

## The support contract

- All modern engines supported: Chrome, Safari, Firefox, Edge, on phone and desktop.
- Single-engine features ship only as progressive enhancement, never as a requirement.
- Every stack ends in a fallback: fonts in system faces, effects in stillness, transitions in plain navigation.
- With JavaScript off, content, layout, links and forms all work.

## Color, shape and theming

- Color mixing in CSS: every tint, wash and edge derives from a few base colors; a perceptually even color space lets one declaration hold a light and dark pair, shrinking every theme block.
- Dark mode, contrast preference, forced colors and reduced motion all honored; browser-picked AA text color for any background (Safari first).
- Squircle corners where the browser supports them, plain rounding elsewhere.
- Blur-behind glass that flattens when the OS asks for reduced transparency; brighter shine on HDR screens.
- Themed scrollbars and text caret, a block caret for the typewriter voice (Chrome), gradient-filled and outlined display text.
- Tints and swatches kept on paper when printing; a favicon that inverts for dark browser chrome (Chrome, Firefox).

## Layout and scrolling

- Parent-aware selectors and container queries: styles react to what an element contains and to the space it sits in, not the screen.
- Subgrid aligns card internals across a row; containers that swallow stray child margins (WebKit only).
- Scroll containment, reserved scrollbar space so Windows layouts never shift, and viewport units that respect mobile bars, notches and home bars.
- Scroll-driven animations: reveals, progress and parallax with zero JavaScript; native CSS carousels with buttons and dots (Chrome first).
- Style a sticky bar only while it is stuck (Chrome first); curved free-form clipping for section edges (Safari 18.4).
- Skip rendering of off-screen sections for faster long pages; observers watch size, visibility and DOM changes instead of polling.
- Focus order follows visual order in reordered layouts (Chrome 137); heading wrap that balances lines and avoids orphan words.
- Landscape-phone adjustments via an orientation query.

## Overlays and layers

- Menus, tooltips and modals ride the browser's built-in top layer: focus handling, light dismiss, and enter and exit animations without JavaScript.
- Anchor positioning places and flips tooltips and menus in pure CSS; exits stay in the top layer while they animate out.
- Native disclosure elements power accordions and folds, including one-open-at-a-time groups.

## Motion and transitions

- Page-to-page navigation cross-fades instead of flashing white; element-level morphs let a card expand into its page.
- Spring easing curves defined in CSS; position-based stagger without per-item variables (Chrome 138).
- Compose two animations on one property, unblocking parallax on physical elements; move DOM nodes without losing animation and focus state (Chrome 133).

## The CSS engine

- Typed custom properties for the traveling-border class of effects; scoped styles without specificity games (Chrome).
- Conditionals and author-defined functions turn the repeated tint recipes into one function (Chrome 137/139); attributes readable as typed values size chart bars directly (Chrome 133).

## Device, sound and offline

- Sound synthesized in the browser; vibration where the platform allows it; device tilt drives parallax and shine.
- Clipboard access, lazy image loading, mobile keyboard hints, locale-aware number formatting.
- Offline via a service worker; install prompts; standalone-launch detection.

## Typography and languages

- Cap-height trimming for true optical centering in buttons and chips (no Firefox yet); real small caps and per-font feature settings; color fonts recolored by the theme.
- Dictionary hyphenation for narrow columns and print; drop caps for articles; hanging quotes into the margin (Safari only).
- Style the highlight when a shared deep link lands on a phrase.
- CJK punctuation spacing (Chrome), emphasis dots and ruby styling; emoji- and CJK-safe splitting for text effects.
- Bidirectional isolation so an Arabic username cannot scramble a comment row; "2 hours ago" in the page language.

## HTML and forms

- Native form marks (checkbox, radio, progress) tinted by the theme; fully themable native select (Chrome first).
- Live validation styled only after the user actually types; native validation messages routed into the shipped field states.
- Buttons open dialogs, popovers, sheets and the native date or color picker with no JavaScript (Chrome 135).
- Native autocomplete lists on any input; textareas that grow as the user types.
- Field attribute pack: kill autocorrect, spellcheck and AI suggestions on code and handle fields; camera-direct file capture; passkey-ready login fields.
- Hidden content that page search can still find and open.
- Responsive images: templates serve sized, modern-format images; a media base layer beneath the themed players (see Elements, media).

## JavaScript and device

- Pause everything when the tab is hidden: motion, shine, sound and timers.
- Keyboard-aware panels keep the focused field above the phone keyboard; IME safety so undo and typing effects never fire mid-composition.
- The deck keeps the screen awake and gets fullscreen styling with an exit affordance.
- Sync theme and mode across open tabs; carry the "new version available" signal; an offline badge when the network is gone; cache protected from eviction on request.
- Highlight search matches without touching the markup; anchored headings that never hide under sticky bars.
- A styled drop state for the file field; drag-and-drop for the kanban; smoother drags from coalesced pointer events; native scroll-end and snap-change events.
- Prerender the next page on hover so page changes feel instant, and yield during boot so first interaction is never blocked (Chromium); canvas effects off the main thread.
- Real save-as dialogs for exports, an eyedropper color picker for the theme studio, and a data-saver mode like the motion setting (Chromium).
- A share button using the system share sheet.

## iOS and iPadOS

- Respect the iPhone Text Size setting; wider-gamut color on Apple screens.
- The true iOS switch with a real haptic tick, the only web haptic iPhones allow; UI sounds that mix under the user's music instead of interrupting it.
- Faster loads by starting the network request while the service worker boots; in-page morphs for theme and tab changes (Safari 18).
- Home-screen app name meta and splash images that remove the install launch flash; App Store banner meta for products with a native app.
- Stop iOS turning invoice numbers into phone links; kill the long-press callout on drag surfaces.
- Shake and acceleration as motion inputs beside tilt; ready-made pinch data for the image zoom and lightbox; Apple Pencil pressure, tilt and hover for a signature piece.
- Copy in two flavors so pasted content keeps formatting.
- Declarative 3D and AR model viewer (Safari 26), held against the no-heavy-media rule.

## Chrome, Edge, Android

- Android back gesture closes sheets and menus instead of leaving the site.
- Manifest pack: stable app id, icon shortcuts, store-style install sheet, single-window behavior, share-sheet target, themed monochrome icon; app icon badge counts; skip the install nudge when the native app is already installed.
- The app's bar extends into the desktop title bar for installed apps; a dark address-bar color for visitors with JavaScript off.
- Declarative hovercards absorb the tooltip code (around Chrome 140).

## macOS and desktop

- A PNG favicon fallback, since Safari never renders SVG favicons; a monochrome pinned-tab icon.
- The Safari "Add to Dock" install path, documented beside iOS and Android; touch targets that survive a mouse-plus-touchscreen machine.
- Keyboard shortcuts declared on the elements that carry them, for assistive tech and agents; right-click menus on app surfaces, reusing the dropdown.

## What the web cannot do

- No vibration on iPhone. The haptics channel only works on Android; the native-switch trick above is the sole iOS haptic.
- No true page fullscreen on iPhone; only video may go fullscreen.
- iOS Safari may evict a site's storage after 7 days of non-use; installed apps can request protection but not guarantee it.
- The iPhone Text Size setting does not reach normal web text; it must be captured through the system font trick.
- No install prompt API on iOS; installation is always the user's manual Share-menu act.
- Push notifications on iOS only for installed web apps, never in the browser.
- Web apps cannot read the OS accent color everywhere; only some browsers expose it.
- iOS ignores the no-zoom viewport flags; zoom control needs the gesture-level approach.
- CSS scroll snap cannot deliver full-page sections that outgrow an iPhone screen; only the JS pager survives.
- Tap-the-status-bar scroll-to-top is OS behavior: it works only while the page scrolls the document itself.
