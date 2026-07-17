# Spec vs reality audit — 17 Jul 2026

Every line of /docs was verified against the shipped files (lib/facet.css, lib/facet.js, lib/facet-sw.js, llms.txt, the five site pages, build.txt, the 8 templates). Each auditable line now ends in [done], [partial: what is missing] or [gap]. Only code-confirmed claims are marked done. 592 lines audited: **347 done · 79 partial · 166 gap**.

## Counts per page

| Page | done | partial | gap | lines |
|---|---|---|---|---|
| features.md | 61 | 5 | 3 | 69 |
| elements.md | 64 | 3 | 52 | 119 |
| layouts.md | 44 | 10 | 20 | 74 |
| things-you-can-make.md | 4 | 9 | 19 | 32 |
| functions.md | 42 | 5 | 14 | 61 |
| motion.md | 35 | 1 | 0 | 36 |
| themes.md | 18 | 1 | 2 | 21 |
| website.md | 20 | 14 | 0 | 34 |
| why-facet.md | 4 | 0 | 0 | 4 |
| guidance.md | 14 | 10 | 9 | 33 |
| ai-native.md | 18 | 1 | 5 | 24 |
| build-method.md | 12 | 1 | 3 | 16 |
| browser-capabilities.md | 11 | 19 | 39 | 69 |
| **Total** | **347** | **79** | **166** | **592** |

## The gaps, grouped by page

**features.md (3):** theme-set density and text size (themes never set the scales; user cyclers do) · theme-following favicon with PNG fallback · a consumer-readable changelog.

**elements.md (52):**
- Form: password strength, date range, memorable date, dual-thumb range, combobox, multi-select, tags input, OTP input, rating, character count, input add-ons, conditional reveal, inline edit.
- Content: description list, task list, comment thread, chat bubble.
- Overlays: popconfirm, context menu, nested submenu, command palette, hover card, banner bar.
- Navigation: steps indicator, back link, back to top, scroll return.
- Data: bulk actions, tree view, progress ring, countdown, watermark.
- Charts: bar, area, donut, sparkline, gauge, heatmap (facet.chart draws lines only).
- Media: video/audio styling, lightbox, pinch-out zoom, gallery grid, aspect ratio, before-after slider, device frames.
- Text: section title, callout, divider with label.
- Decoration: adaptive ink on glass, scroll-edge fades, annotation kit.
- Effects: the whole 20-piece effects family (shine text, scramble, count-up, spotlight card, magnet, click spark, etc.).

**layouts.md (20):** mega menu panel · collapsible nav rail · bento grid · comparison table · multi-step form · auth forms · team section · masonry · chip strip · rail dots · speed dial · split button · chat template · kanban template · link-in-bio template · 404 · 500 · maintenance · cookie banner · status page.

**things-you-can-make.md (19):** deck layouts big statement, full-bleed image, table, quote, team, timeline, pricing, comparison, market · food and retail pieces · promotion pieces · certificates · structured sheets · print primitives fold lines, form lines, serial numbers, QR generator, connectors, bleed/large format.

**functions.md (14):** data-palette · data-lightbox · data-carousel · data-combobox · data-multi-select/data-tags · data-otp · data-countdown · data-tree · data-bulk · data-inline-edit · data-range · data-compare · data-zoom · data-kanban.

**themes.md (2):** community themes marketplace · adaptive ink on glass.

**guidance.md (9):** error summary pattern · wizards · buttons-say-the-verb rule · error-copy rule · sentence-case rule · one-term-per-concept rule · numbers-as-numerals rule · screen-reader testing commitment · RTL isolation of user content.

**ai-native.md (5):** described-tokens file · MCP server + agent skill · AI-buildability evals · projects copying Facet rules into their own CLAUDE.md · build prompts instructing that copying.

**build-method.md (3):** prompt router · checker prompts · continuous bloat-cutting.

**browser-capabilities.md (39, capability names):** print tints kept on paper + dark-chrome favicon · subgrid/margin-trim · scroll-driven animations + native carousel · stuck-state styling + shape() clipping · orientation query adjustments · animation composition + moveBefore · @property typed custom properties + @scope · CSS functions/conditionals + typed attr() · cap-height trimming, small caps, color fonts · dictionary hyphenation, drop caps, hanging quotes · ::target-text styling · CJK punctuation/emphasis/ruby + safe splitting · bidi isolation + Intl relative times · datalist + auto-growing textarea · field attribute pack (autocorrect/capture/passkeys) · hidden-until-found · pause-on-hidden-tab · keyboard-aware panels + IME safety · cross-tab sync, update signal, offline badge, persistent cache · Highlight API + scroll-margin anchors · file drop state, kanban drag-drop, coalesced events, scrollend/snap events · prerendering + boot yielding + offscreen canvas · save-as dialogs, eyedropper, data-saver mode · Web Share button · iPhone Text Size + P3 color · native iOS switch haptic + audio session mixing · SW navigation preload + same-document morphs (Safari) · splash/app-name metas + App Store banner · format-detection + callout kill · shake/pinch/Pencil inputs · two-flavor clipboard copy · model viewer · Android back gesture for sheets · manifest pack (id, shortcuts, share target, monochrome icon, badges) · window-controls overlay + no-JS dark address bar · declarative hovercards · PNG favicon fallback + pinned-tab icon · declared keyboard shortcuts + context menus.

## The ten gaps to close first

1. **Steps indicator** — the homepage and the multi-step-form layout both call for it today; it ships as a plain ol on the new homepage.
2. **Rating** — every product form asks for it, it is tiny, and there is no shipped substitute at all.
3. **Chat bubble** — declared three times (element, layout, template) and the homepage wall had to stand in a feed post for it.
4. **Bento grid** — the spec uses it twice on the homepage alone; one CSS section (mixed-size spans on the existing grid) unlocks it.
5. **Chart types beyond the line** — bar, area, donut, sparkline; dashboards are a core pitch and facet.chart is single-series line-only.
6. **PNG favicon fallback** — Safari never renders SVG favicons, so every Safari tab shows nothing today; a visible defect, one file to fix.
7. **System pages (404, 500, offline, maintenance)** — cheap templates that complete the "ready-to-ship product" promise.
8. **Rail dots** — small self-wiring behavior already spec'd; finishes the homepage template shelf and every card rail.
9. **Two-row chip strip** — small CSS piece the homepage approximates with a wrapping row.
10. **Described-tokens file** — the AI-native moat item: turns "AI-readable" into machine-queryable tokens for one keep-in-sync cost.

## Bug found during verification (not a spec line)

Printing a themed page in dark mode leaks dark ink onto paper: the print block's `:root` token reset (facet.css ~line 2483) loses specificity to `[data-theme="velvet"][data-mode="dark"]` blocks. Default theme prints clean; themed dark does not. One-selector fix in the print block.
