# Functions

The API index. One line per call and per attribute. Each entry links to its component on Elements or Layouts; the component is described there, never here.

The rule: a function consumed by only one component belongs to that component. It is plain JavaScript, wires itself from the markup, and sits under Component calls. Page-level calls are the true API.

## Page-level calls

- `facet.set({...})`. Change theme, mode, language, width, any token, live.
- `facet.scheme.set("auto")`. The light, dark, auto control.
- `facet.translate()`. Re-apply translation to late markup.
- `facet.locate()`. The opt-in coarse locale helper.
- `facet.groupNumber(n)`, `facet.numberWords(n)`, `facet.numberSystem()`. Locale number helpers.
- `facet.go(url)`. Navigate with the page transition.
- `facet.toast(message, kind)`. Fire a toast.
- `facet.busy(el, true)`. The loading skin.
- `facet.icon()`. Fill icon glyphs.
- `facet.motion.register(sel, opts)`. Add elements to the motion engine.
- `facet.feedback.tap()`, `.tick()`, `.snap()`, `.success()`. Sounds and haptics.
- `facet.install()`. The install prompt.

## Component calls

- `facet.views.go("screen")`, `facet.views.back()`. Drive the view stack.
- `facet.sheet(el, scrim)`. Wire an edge panel.
- `facet.navMenu()`. Wire the corner menu cluster.
- `facet.tabIndicator(bar)`. The sliding tab highlight.
- `facet.scrollGauge(scroller)`. The scroll thumb.
- `facet.appearance()`. The live customiser panel.
- `facet.sliderScale(wrap)`. Rebuild a detailed slider's ticks.
- `facet.choiceSelect(grid, value)`. Pick in a choice grid from code.
- `facet.subscribe`. The subscribe form's validate-and-hand-off event.
- `facet.tableSort(table)`. Sortable column headers.
- `facet.fieldActions(field)`. The in-field action menu.
- `facet.passwordReveal(field)`. The show-hide eye.
- `facet.chart(el, data)`. Draw the themed chart.
- `facet.mapStyle()`. The theme-matched map styling.

## Attributes that wire themselves

- `data-theme`, `data-mode`, `data-density`, `data-text-size`, `data-width`, `data-motion`. The look, on html or the script tag.
- `data-theme-switch`, `data-mode-toggle`, `data-control`. Switcher buttons.
- `data-i18n`, `data-language-switch`. Translation.
- `data-transition="page"`, `data-no-transition`. Page transitions.
- `data-section`. A tab or button pages the snap pager.
- `aria-controls`. A button opens its sheet, dialog or panel.
- `data-number`. The self-formatting number input.
- `data-copy`. Copy a target's text.
- `data-filter`. A search input filters a target.
- `data-subscribe`. The subscribe form.
- `data-sortable`. The sortable table.
- `data-field-actions`, `data-reveal`. Field extras.
- `data-tip`. The description tooltip.
- `data-parallax`, `data-shine`. The motion engine's two channels.
- `data-bg-glyph`, `data-bg-scatter`, `data-bg-fluid`, `data-bg-aero`. Backgrounds.
- `data-print`, `data-print-action="page"`. Print roles and Save as PDF.
- `data-service-worker`, `data-install`. The PWA pair.
- `data-event`. The analytics hook on any key action.
- `aria-busy`. The loading skin on any region.
- `data-status`. The status grammar on any component.
- `data-palette`. The command palette and its shortcut.
- `data-lightbox`. A gallery's images open in the lightbox.
- `data-carousel`. Slides wire their arrows, dots and autoplay.
- `data-combobox`. An input filters its list as you type.
- `data-multi-select`, `data-tags`. The chip-based pickers.
- `data-otp`. Code boxes that advance and accept a paste.
- `data-countdown`. Live time remaining to the stamped moment.
- `data-tree`. The expandable hierarchy.
- `data-bulk`. Row selection and its actions bar.
- `data-inline-edit`. Click a value, it becomes a field.
- `data-range`. The dual-thumb range track.
- `data-compare`. The before-after divider.
- `data-zoom`. Pinch-out zoom on any image.
- `data-kanban`. Draggable card columns.
- `data-deck`. The deck's keys, fullscreen and print.
