# Guidance

How to use the library well. Written for the AI as much as the person.

## Patterns

- Form flow. Label, hint, validate on leave, error under the field. [done]
- Error summary. A failed form lists every error at the top, each linking to its field. [gap]
- Destructive actions. Confirm in place for cheap ones, a modal for real ones, name the thing being destroyed. [partial: the modal ships the destructive-confirm pattern with .btn-danger; the in-place-vs-modal rule and name-the-thing rule are written nowhere]
- Search and filtering. Live filter for one list, chips for applied filters, a clear-all. [partial: the live filter (data-filter, filterable card list) ships; applied-filter chips and a clear-all are written nowhere]
- Wizards. Steps indicator, one decision per screen, back never loses data. [gap]
- Notifications. Toast for outcomes, banner for page-level news, badge for counts. [partial: toast-for-outcomes guidance ships; no banner component exists and the badge-for-counts rule is written nowhere]
- Empty, loading, error. Every data region handles all three, in that grammar. [done]
- Long pages. Side index on desktop, scroll return after jumps. [partial: the side index block ships and is documented; scroll return after jumps is written nowhere]

## Writing

- Buttons say the verb: Save, Delete, Send. [gap]
- Errors say what happened and what to do next. [gap]
- Sentence case everywhere; no title case. [gap]
- One term per concept, everywhere. [gap]
- Numbers as numerals. [gap]

## Accessibility

- The claim: AA in every theme, light and dark. [done]
- Everything keyboard operable, one visible focus ring, a skip link first. [done]
- Icon-only controls always carry a name. [done]
- Reduced motion, contrast and forced-colors settings all honored. [partial: reduced motion honored everywhere; prefers-contrast handled only by backgrounds; forced-colors handled nowhere]
- Tested with a screen reader, not just a scanner. [gap]

## Internationalization

- Translation yes, right-to-left no. [done]
- Script font pairings for Japanese, Chinese, Korean, Devanagari; Cyrillic in the core faces. [done]
- User content can be RTL even when layout is not: isolate it. [gap]
- Dates, numbers and relative times format per locale. [partial: numbers ship locale grouping and words (lakh/crore, numberWords); dates and relative times have no formatter or guidance]

## Data visualization

- Line for change, bar for comparison, donut for parts, sparkline inline. [partial: only the line chart ships — no bar, donut or sparkline, and no chart-choice guidance is written]
- Area for volume over time, meter for capacity against a limit, gauge for one value in a range, heatmap for intensity across days. [partial: only the meter ships (themed in base styles); no area, gauge or heatmap]
- Series colors follow the vivid palette, in rank order. [partial: llms.txt names the vivid palette for charts, but facet.chart draws one accent-1 series — no rank-order rule for series]
- Every chart handles empty, loading, error. [done]
- The number is the point; the chart supports it. [partial: only the chart's keep-the-numbers-in-a-table-nearby note]

## Glossary

- Rank. One of three accent placement layers. [done]
- Role. What a token is for, never its value. [done]
- Wash, tint, edge. A hue at ground, fill and outline strength. [done]
- Layer 1 to 5. Tokens, components, blocks, templates, app feel. [done]
- Shell. The page's scrolling model. [done]
- Block. An assembly of components. [done]
