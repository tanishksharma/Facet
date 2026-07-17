# Layouts

Everything page-shaped: shells, blocks, app pieces, templates, system pages. Blocks compose Elements; every block links to the elements inside it.

## Shells

One shell per page, never nested.

- Plain page. Normal flow and scrolling, for documents and marketing. [done]
- Snap pager. One screen at a time, top to bottom. [done]
- View stack. Screen-to-screen app navigation; Back works, every screen has a URL. [done]

## Blocks

- Grid of cards. Same-shaped cards, as many columns as fit. [done]
- Horizontal card row. Cards that scroll sideways and snap. [done]
- Promo rail. A full-width carousel of tinted feature cards. [done]
- Filterable card list. A search field that live-hides non-matches. [done]
- List cards. Full-width rows: name, meta, amount, action. [done]
- Product grid. A storefront shelf; the whole card is the link. [done]
- Product detail. Gallery beside name, price, options, one buy action. [done]
- Cart line items. Order rows with steppers, ending in the total. [done]
- Full top menu. The site header; folds to one line on phones. [done]
- Mega menu panel. The full-width multi-column dropdown under a header item. [gap]
- Sidebar navigation. Grouped links in a side column. [done]
- Collapsible nav rail. The sidebar collapsed to icons and back. [gap]
- Footer. Identity, link columns, a sign-up well, a legal row. [done]
- Hero. Display heading, one line, one action. [done]
- Bento grid. Mixed-size feature tiles. [gap]
- Feature grid. Icon, claim, one sentence, repeated. [done]
- Pricing table. Plan cards, the recommended one highlighted. [done]
- Comparison table. Plans against features, check by check. [gap]
- FAQ list. Questions that fold open one at a time, no JavaScript. [done]
- CTA band. The closing strip: one line, one button. [done]
- Logo row and testimonial. Customer logos, one quote with a photo and name. [done]
- Data table with toolbar. Search, filter chips and actions over a table. [done]
- Stat row. One number over its label, repeated. [done]
- Settings section. Labelled rows with controls under a caption. [done]
- Form section. Grouped fields, one submit row. [done]
- Multi-step form. Form sections behind a steps indicator. [gap]
- Auth forms. Sign in, register, forgot password. [gap]
- Team section. People: avatar, name, role. [gap]
- Contact section. Form, address and the themed map. [partial: form section and themed map ship as separate blocks; no composed contact section]
- Article set. Header, reading-width text, media figure, pull quote. [done]
- Side index. A pinned panel of section links marking where you are. [done]
- App grid. A launcher of app tiles. [done]
- App identity. An app's about header: icon, name, phrase, stats. [done]
- Masonry. Uneven tiles in balanced columns. [gap]
- Chip strip. Two rows of chips scrolling sideways together. [gap]
- Section fold. A heading row that folds a section. [partial: the details-based accordion covers folding under a heading row; no dedicated section-fold block]
- Rail dots. One dot per card under a scrolling rail. [gap]
- Timeline. Phases on an axis. [partial: the Entry component styles dated lists (résumés, changelogs); no phases-on-an-axis block]

## App-shape pieces

- Tab bar. The floating command bar: menu, tab pill, settings; bottom on phones, top on wide screens. [done]
- Sheet and menu. The edge panel over a scrim; settings right, navigation left. [done]
- Nav menu. The floating bottom-corner cluster. [done]
- Appearance panel. The settings sheet as a live page customiser. [done]
- Float button. One floating action pinned to a corner. [done]
- Speed dial. The float button fanning into several actions. [gap]
- Toolbar. A strip of actions that overflows into a menu. [partial: a .row toolbar arrangement (title left, actions right, spacer) ships; no overflow-into-menu behaviour]
- Split button. A primary action fused to a dropdown. [gap]
- Scroll gauge. A slim thumb showing and scrubbing progress. [done]
- Self-wiring. Apps are markup plus data; everything wires itself from attributes. [done]

## Templates

Whole-page starters. Copy one, replace the content.

- Landing. Top menu, hero, proof, features, pricing, FAQ, CTA, footer. [done]
- SaaS dashboard. Sidebar, top bar, stats, chart, table, activity. [done]
- Social app. Feed columns folding to one, tab bar, compose, settings sheet. [done]
- App shell. An installable app with a working dashboard, manifest wired. [done]
- Article. Editorial page with the article JSON-LD slot. [done]
- Deck. A 1920x1080 pitch deck; arrow keys, fullscreen, prints exact. (Linked: Things you can make, deck layouts.) [done]
- Document. A4 letterhead, invoice, one-pager; true print margins. [done]
- Business card. 3.5x2 inch, front and back, duplex print sheet. [done]
- Chat. Conversation list, thread, compose row. [gap]
- Kanban. Columns of draggable cards. [gap]
- Settings and account. Profile, preferences, plan, danger zone. [partial: the settings-section block ships; no whole-page template]
- Checkout. Cart, address, payment, confirmation. [partial: product grid, product detail and cart line-item blocks ship; no checkout template]
- Docs site. Sectioned reference with the side index. [partial: the side-index block ships (the library's own docs use it); no template file]
- Link-in-bio. One column of links under a name. [gap]
- Coming soon. Logo, one line, subscribe, countdown. [partial: the subscribe block ships; no template, no countdown]
- Manifest. The PWA manifest with the icon checklist. [done]

## System pages

- 404 [gap]
	1. Not found, with a route home.
- 500 [gap]
	1. Something broke, with one line.
- Maintenance. Planned downtime and a return time. [gap]
- Offline. What the service worker shows with no network. [partial: facet-sw.js falls back to the cached app shell for offline navigations; no dedicated offline page]
- Cookie banner. The consent strip, done accessibly. [gap]
- Status page. Systems up and down. [gap]
- Changelog. Dated releases. [partial: the Entry component styles dated releases; no changelog page or template]
