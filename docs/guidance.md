# Guidance

How to use the library well. Written for the AI as much as the person.

## Patterns

- Form flow. Label, hint, validate on leave, error under the field.
- Error summary. A failed form lists every error at the top, each linking to its field.
- Destructive actions. Confirm in place for cheap ones, a modal for real ones, name the thing being destroyed.
- Search and filtering. Live filter for one list, chips for applied filters, a clear-all.
- Wizards. Steps indicator, one decision per screen, back never loses data.
- Notifications. Toast for outcomes, banner for page-level news, badge for counts.
- Empty, loading, error. Every data region handles all three, in that grammar.
- Long pages. Side index on desktop, scroll return after jumps.

## Writing

- Buttons say the verb: Save, Delete, Send.
- Errors say what happened and what to do next.
- Sentence case everywhere; no title case.
- One term per concept, everywhere.
- Numbers as numerals.

## Accessibility

- The claim: AA in every theme, light and dark.
- Everything keyboard operable, one visible focus ring, a skip link first.
- Icon-only controls always carry a name.
- Reduced motion, contrast and forced-colors settings all honored.
- Tested with a screen reader, not just a scanner.

## Internationalization

- Translation yes, right-to-left no.
- Script font pairings for Japanese, Chinese, Korean, Devanagari; Cyrillic in the core faces.
- User content can be RTL even when layout is not: isolate it.
- Dates, numbers and relative times format per locale.

## Data visualization

- Line for change, bar for comparison, donut for parts, sparkline inline.
- Area for volume over time, meter for capacity against a limit, gauge for one value in a range, heatmap for intensity across days.
- Series colors follow the vivid palette, in rank order.
- Every chart handles empty, loading, error.
- The number is the point; the chart supports it.

## Glossary

- Rank. One of three accent placement layers.
- Role. What a token is for, never its value.
- Wash, tint, edge. A hue at ground, fill and outline strength.
- Layer 1 to 5. Tokens, components, blocks, templates, app feel.
- Shell. The page's scrolling model.
- Block. An assembly of components.
