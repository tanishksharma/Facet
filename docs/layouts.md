# Layouts

Everything page-shaped: shells, blocks, app pieces, templates, system pages. Blocks compose Elements; every block links to the elements inside it.

## Shells

One shell per page, never nested.

- Plain page. Normal flow and scrolling, for documents and marketing.
- Snap pager. One screen at a time, top to bottom.
- View stack. Screen-to-screen app navigation; Back works, every screen has a URL.

## Blocks

- Grid of cards. Same-shaped cards, as many columns as fit.
- Horizontal card row. Cards that scroll sideways and snap.
- Promo rail. A full-width carousel of tinted feature cards.
- Filterable card list. A search field that live-hides non-matches.
- List cards. Full-width rows: name, meta, amount, action.
- Product grid. A storefront shelf; the whole card is the link.
- Product detail. Gallery beside name, price, options, one buy action.
- Cart line items. Order rows with steppers, ending in the total.
- Full top menu. The site header; folds to one line on phones.
- Mega menu panel. The full-width multi-column dropdown under a header item.
- Sidebar navigation. Grouped links in a side column.
- Collapsible nav rail. The sidebar collapsed to icons and back.
- Footer. Identity, link columns, a sign-up well, a legal row.
- Hero. Display heading, one line, one action.
- Bento grid. Mixed-size feature tiles.
- Feature grid. Icon, claim, one sentence, repeated.
- Pricing table. Plan cards, the recommended one highlighted.
- Comparison table. Plans against features, check by check.
- FAQ list. Questions that fold open one at a time, no JavaScript.
- CTA band. The closing strip: one line, one button.
- Logo row and testimonial. Customer logos, one quote with a photo and name.
- Data table with toolbar. Search, filter chips and actions over a table.
- Stat row. One number over its label, repeated.
- Settings section. Labelled rows with controls under a caption.
- Form section. Grouped fields, one submit row.
- Multi-step form. Form sections behind a steps indicator.
- Auth forms. Sign in, register, forgot password.
- Team section. People: avatar, name, role.
- Contact section. Form, address and the themed map.
- Article set. Header, reading-width text, media figure, pull quote.
- Side index. A pinned panel of section links marking where you are.
- App grid. A launcher of app tiles.
- App identity. An app's about header: icon, name, phrase, stats.
- Masonry. Uneven tiles in balanced columns.
- Chip strip. Two rows of chips scrolling sideways together.
- Section fold. A heading row that folds a section.
- Rail dots. One dot per card under a scrolling rail.
- Timeline. Phases on an axis.

## App-shape pieces

- Tab bar. The floating command bar: menu, tab pill, settings; bottom on phones, top on wide screens.
- Sheet and menu. The edge panel over a scrim; settings right, navigation left.
- Nav menu. The floating bottom-corner cluster.
- Appearance panel. The settings sheet as a live page customiser.
- Float button. One floating action pinned to a corner.
- Speed dial. The float button fanning into several actions.
- Toolbar. A strip of actions that overflows into a menu.
- Split button. A primary action fused to a dropdown.
- Scroll gauge. A slim thumb showing and scrubbing progress.
- Self-wiring. Apps are markup plus data; everything wires itself from attributes.

## Templates

Whole-page starters. Copy one, replace the content.

- Landing. Top menu, hero, proof, features, pricing, FAQ, CTA, footer.
- SaaS dashboard. Sidebar, top bar, stats, chart, table, activity.
- Social app. Feed columns folding to one, tab bar, compose, settings sheet.
- App shell. An installable app with a working dashboard, manifest wired.
- Article. Editorial page with the article JSON-LD slot.
- Deck. A 1920x1080 pitch deck; arrow keys, fullscreen, prints exact. (Linked: Things you can make, deck layouts.)
- Document. A4 letterhead, invoice, one-pager; true print margins.
- Business card. 3.5x2 inch, front and back, duplex print sheet.
- Chat. Conversation list, thread, compose row.
- Kanban. Columns of draggable cards.
- Settings and account. Profile, preferences, plan, danger zone.
- Checkout. Cart, address, payment, confirmation.
- Docs site. Sectioned reference with the side index.
- Link-in-bio. One column of links under a name.
- Coming soon. Logo, one line, subscribe, countdown.
- Manifest. The PWA manifest with the icon checklist.

## System pages

- 404
	1. Not found, with a route home.
- 500
	1. Something broke, with one line.
- Maintenance. Planned downtime and a return time.
- Offline. What the service worker shows with no network.
- Cookie banner. The consent strip, done accessibly.
- Status page. Systems up and down.
- Changelog. Dated releases.
