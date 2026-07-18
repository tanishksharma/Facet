# Elements

Every component, one line each. States, themes and sizes are system facts on the Features page and apply to everything here. Every entry links to the elements that look like it and to the function that drives it.

## Layout primitives

- Container. A page-width wrapper that centers content and caps its width. [done]
- Stack. Vertical flow with a fixed gap. [done]
- Row. Things side by side that wrap. [done]
- Grid. Auto-fitting columns, no breakpoints. [done]
- Snap pager. Full screens, one at a time. (Linked: view stack, Layouts shells.) [done]
- View stack. App screens, one visible, Back works. (Linked: snap pager.) [done]

## Form controls

- Button. A clickable action. [done]
- Checkbox. A yes or no tick. [done]
- Radio. Pick one, all options visible. [done]
- Switch. A setting that applies the moment it flips. [done]
- Stepper. A number between minus and plus buttons. [done]
- Segmented control. A pill of options, exactly one pressed. [done]
- Field. A labelled wrapper around any input, hint line beneath. [done]
- Field actions. In-field clear plus a menu: copy, paste, select all, undo, redo. [done]
- Password reveal. A show-hide eye. [done]
- Password strength. A live strength bar under a password field. [gap]
- File upload. The native picker, themed, with a drop zone. [partial: themed native picker ships; no drop zone]
- Date input. The native picker, themed. [done]
- Time input. The native picker, themed. [done]
- Date range. A start and end date as one control. [gap]
- Memorable date. Day, month, year as three fields. [gap]
- Number input. Groups digits per locale, reads the value in words. [done]
- Slider. Drag a number in a range, live readout. [done]
- Detailed slider. Slider plus steppers plus a number box. [done]
- Dual-thumb range. One track, two handles, picks a range. [gap]
- Choice grid. Square buttons, one exclusive pick. [done]
- Combobox. An input that filters a list as you type. [gap]
- Multi-select. Several picks shown as removable chips in the field. [gap]
- Tags input. Type and Enter makes a chip. [gap]
- OTP input. One-digit boxes for verification codes. [gap]
- Rating. Stars as input, and the read-only twin. [gap]
- Character count. Live count under a limited field. [gap]
- Input add-ons. Fixed prefix or suffix: currency, units, domains. [gap]
- Conditional reveal. A choice reveals its follow-up field. [gap]
- Inline edit. Click a value, it becomes a field. [gap]
- Copy button. Copies an element's text. [done]

## Content pieces

- Card. A padded rounded panel grouping one thing. (Linked: list, feature grid, stat row.) [done]
- Feed post. A card for one authored post. [done]
- Entry. One dated item: a job, a release, a milestone. [done]
- Testimonial. A quote with its author. [done]
- List. Repeated rows with icon, text and trailing value. (Linked: card, description list, table.) [done]
- Description list. Labelled key-value rows. (Linked: invoice, settings section.) [gap]
- Task list. A checklist with per-row status. [gap]
- Comment thread. Nested comments with reply actions. [gap]
- Chat bubble. Sent and received messages with timestamps. [gap]

## Overlays

- Modal. A dialog for confirmations and short tasks. [done]
- Drawer. A panel from a screen edge. [done]
- Popover. A small anchored bubble, closes when attention moves. [done]
- Popconfirm. A tiny are-you-sure popover on the button itself. [gap]
- Accordion. A fold for optional reading. [done]
- Toast. A transient notice that leaves on its own. [done]
- Dropdown menu. A few actions behind one button. [done]
- Context menu. Right-click actions on app surfaces. [gap]
- Nested submenu. A menu item that opens a second level. [gap]
- Command palette. Fuzzy search over actions and pages, on one shortcut. [gap]
- Hover card. A rich preview panel on hover or focus. [gap]
- Banner bar. A page-top strip for announcements, dismissible. [gap]

## Navigation

- Tabs. Buttons that switch views in place. [done]
- Steps indicator. Numbered stages of a multi-step flow. [done]
- Breadcrumb. The path to the current page. [done]
- Back link. A small back step above the title. [gap]
- Back to top. Appears after scrolling, returns to the top. [gap]
- Scroll return. After any jump to top, a button returns you exactly where you were. [gap]
- Pagination. Numbered links through a long set. [done]
- Nav link. The link style that marks the current page. [done]
- Subscribe. A compact email sign-up. [done]
- Mega menu and footer live on the Layouts page as blocks.

## Data display

- Table. Real records, sortable columns, restacks as cards on phones. [partial: sortable ships; no card restack on phones — the table scrolls horizontally instead]
- Bulk actions. Select rows, a bar shows the actions. [gap]
- Tree view. An expandable hierarchy. [gap]
- Badge. A word in a pill stating a status. [done]
- Chip. A small toggleable pill, with a dismissible variant. [done]
- Avatar. An image or initials, round. [done]
- Avatar group. Overlapping avatars with an overflow count. [done]
- Progress. A completeness bar. [done]
- Progress ring. The circular twin with a center value. [gap]
- Icon badge. A status dot on an icon corner. [done]
- Kbd. A keycap for shortcuts. [done]
- Countdown. Live time remaining to a moment. [gap]
- Watermark. A faint repeated label over content. [gap]
- The comparison table lives on the Layouts page as a block.

## Charts

One family, one voice: which chart for which data is on the Guidance page.

- Line. One series over time. [done]
- Bar. Categorical comparison. [gap]
- Area. The line with a filled wash. [gap]
- Donut. Part of a whole, center stat. [gap]
- Sparkline. A tiny inline trend. [gap]
- Meter. A capacity bar with zones. [done]
- Gauge. The dial version. [gap]
- Heatmap. Day cells colored by intensity. [gap]

## Status

- Skeleton. A placeholder shaped like coming content. [done]
- Spinner. A ring for unknown waits. [done]
- Empty state. Names what would be here, offers the filling action. [done]
- Loading skin. One attribute turns a region's own content into placeholders. [done]
- Result block. A verdict line, one big number, the supporting figures. [done]

## Media

- Video and audio. The native players, themed like everything else. [gap]
- Lightbox. An image opens full screen with next and previous. [gap]
- Pinch-out image zoom. Pinch any image and it grows out of its container, one layer up, and settles back; the page itself never zooms. [gap]
- Gallery grid. Thumbnails that open the lightbox. [gap]
- Carousel. Slides with arrows, dots and optional autoplay. [partial: only the promo-rail block ships — snap-scrolling cards, no arrows, dots or autoplay]
- Aspect ratio. Locks a box to 16:9, 1:1, 4:3. [gap]
- Before-after slider. A draggable divider between two images. [gap]
- Device frames. Phone and browser mockups for screenshots. [gap]

## Text utilities

- Flagship link. A large link for the one onward step. [done]
- Heading bar. A short accent stroke under a heading. [done]
- Section title. The section-opening heading style. [gap]
- Eyebrow. The small spaced-caps label above a heading. [done]
- Callout. A bordered aside that breaks information down. [gap]
- Divider with label. A rule carrying centered text. [gap]
- Text clamp. Holds text to a line count with a soft fade. [done]
- Description tooltip. A one-attribute explanation bubble. [done]
- Visually hidden. Screen-reader-only text. [done]

## Decoration

- Backgrounds. Grid, fluid pools, and the aero scene. [done]
- Adaptive ink on glass. Text on glass flips light or dark with what is behind it. [gap]
- Reflection. A soft mirror below an element. [done]
- Go arrow. A trailing arrow that slides forward. [done]
- Shine. A specular light that travels with the device. [done]
- Scroll-edge fades. Gradients that signal more content. [gap]
- Themed map. A map colored by the active theme. [done]
- Annotation kit. Margin notes, hand-drawn circles, highlighter, stamps. [gap]
- Icons. 108 and growing line glyphs, filled from one attribute. [done]

## Effects

One family of small, opt-in animation pieces, each honoring reduced motion: spotlight card, magnet, click spark, dock magnify, dot field, scroll reveals, split text, blur text, count up, typewriter text, rotating text, scramble text, shine button, traveling border, glare hover, gradient text, shiny text, glitch text, mac-window code block, splash screen. [gap]
