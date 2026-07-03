/*
  facet.js — the small vanilla JS behaviours of the Facet design library.

  Consumed with one script tag, after facet.css:

    <script src="https://[domain]/lib/facet.js" defer></script>

  What lives here (one small named function per behavior):

    initColorMode      honours the system's dark preference on first load
    initNumberInputs   the calculator number input: one-tap clear of the
                       example value, Indian digit grouping while typing,
                       and the words helper ("25 lakh") under the field
    initSliders        keeps a slider's <output> readout in sync
    initCopyButtons    "click copy, paste into any project" on docs pages
    initModeToggles    any [data-mode-toggle] button flips light and dark

  Everything wires itself to data attributes, so pages opt in by writing
  HTML, never by writing JS. App logic, data fetching and state management
  live in projects — never in this file.

  A tiny public API is exposed as window.facet for calculator apps:

    facet.numberValue(input)   the plain number behind a grouped input
    facet.groupIndian(n)       74250000  -> "7,42,50,000"
    facet.numberWords(n)       74250000  -> "7.43 crore"

  TODO: parallax and idle animations (Layer 3 motion effects) land here
  behind prefers-reduced-motion once the first app needs them.
*/


/* --------------------------------------------------------------------------
   COLOR MODE
   facet.css defaults to light. If the page author set no explicit
   data-mode on <html>, follow the visitor's system preference. A page can
   still force a mode by hardcoding data-mode="light|dark" in its HTML.
   -------------------------------------------------------------------------- */

function initColorMode() {
  const html = document.documentElement;
  if (html.dataset.mode) return; // the page chose a mode: respect it

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.dataset.mode = "dark";
  }
}


/* --------------------------------------------------------------------------
   NUMBER FORMATTING
   Shared helpers for the number input and for any calculator app.
   -------------------------------------------------------------------------- */

/* "7,42,50,000" style grouping: last three digits, then pairs. */
function groupIndian(number) {
  if (number === "" || number === null || isNaN(number)) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(number);
}

/* Reads a number back in Indian words: 74250000 -> "7.43 crore".
   Below a thousand the digits already say it all, so it returns "". */
function numberWords(number) {
  if (isNaN(number) || number === null || number === "") return "";
  const n = Math.abs(number);

  const scales = [
    { unit: 1e7, word: "crore" },
    { unit: 1e5, word: "lakh" },
    { unit: 1e3, word: "thousand" },
  ];

  for (const scale of scales) {
    if (n >= scale.unit) {
      // Two decimals, trimmed: 2.50 -> "2.5", 25.00 -> "25".
      const amount = parseFloat((n / scale.unit).toFixed(2));
      return `${amount} ${scale.word}`;
    }
  }
  return "";
}

/* The plain number behind a grouped input: "7,42,500" -> 742500. */
function numberValue(input) {
  const digits = input.value.replace(/[^0-9.]/g, "");
  return digits === "" ? 0 : parseFloat(digits);
}


/* --------------------------------------------------------------------------
   NUMBER INPUT
   Wires every <input data-number> inside a .number-input wrapper:

     1. The prefilled example clears fully on first touch — one tap and
        it is gone. Once the visitor has typed anything themselves, focus
        never clears the field again.
     2. Digits regroup Indian-style as they are typed: 2500000 -> 25,00,000.
     3. The sibling .number-words span reads the value back in words.

   Markup lives in facet.css under FIELD + NUMBER INPUT and on the docs
   page /components/number-input.html.
   -------------------------------------------------------------------------- */

function initNumberInputs() {
  for (const input of document.querySelectorAll("input[data-number]")) {
    // An empty placeholder lets CSS hide the clear button on empty fields.
    if (!input.placeholder) input.placeholder = "0";

    formatNumberInput(input);

    // 1. One-tap clear of the example value, on first touch only.
    input.addEventListener("focus", () => {
      if (input.dataset.edited) return;
      input.value = "";
      updateNumberWords(input);
    });

    // 2 + 3. Regroup and re-read on every keystroke.
    input.addEventListener("input", () => {
      input.dataset.edited = "true";
      formatNumberInput(input);
    });

    // The clear button empties the field and hands focus back.
    const clearButton = input.parentElement.querySelector(".number-clear");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        input.value = "";
        input.dataset.edited = "true"; // clearing counts as editing
        updateNumberWords(input);
        input.focus();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
  }
}

/* Regroups the input's digits without losing the caret: the caret keeps
   its position among the digits, wherever the commas land. */
function formatNumberInput(input) {
  const digitsBeforeCaret = input.value
    .slice(0, input.selectionStart)
    .replace(/[^0-9]/g, "").length;

  const raw = input.value.replace(/[^0-9.]/g, "");
  input.value = raw === "" ? "" : groupIndian(parseFloat(raw));

  // Walk the new value until the same number of digits has passed.
  let caret = 0;
  let digitsSeen = 0;
  while (caret < input.value.length && digitsSeen < digitsBeforeCaret) {
    if (/[0-9]/.test(input.value[caret])) digitsSeen++;
    caret++;
  }
  if (document.activeElement === input) input.setSelectionRange(caret, caret);

  updateNumberWords(input);
}

/* Writes "25 lakh" (or nothing) into the field's .number-words span. */
function updateNumberWords(input) {
  const field = input.closest(".field") || input.parentElement;
  const words = field.querySelector(".number-words");
  if (words) words.textContent = input.value === "" ? "" : numberWords(numberValue(input));
}


/* --------------------------------------------------------------------------
   SLIDER
   Keeps the <output> in a slider's field label showing the live value.

     <label class="field">
       <span class="field-label">Years <output>10</output></span>
       <input type="range" class="slider" min="1" max="40" value="10">
     </label>
   -------------------------------------------------------------------------- */

function initSliders() {
  for (const slider of document.querySelectorAll("input.slider")) {
    const field = slider.closest(".field");
    const output = field && field.querySelector("output");
    if (!output) continue;

    const show = () => { output.value = slider.value; };
    slider.addEventListener("input", show);
    show(); // sync once on load, in case HTML and value attribute disagree
  }
}


/* --------------------------------------------------------------------------
   COPY BUTTON
   The docs-site behavior behind every snippet: a button with
   data-copy="#some-snippet" copies that element's text to the clipboard
   and confirms itself for a moment.

     <pre id="snippet-button"><code>...</code></pre>
     <button class="btn btn-small" data-copy="#snippet-button">Copy</button>
   -------------------------------------------------------------------------- */

function initCopyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const source = document.querySelector(button.dataset.copy);
      if (!source) return;

      await navigator.clipboard.writeText(source.innerText.trim());

      const label = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = label; }, 1500);
    });
  }
}


/* --------------------------------------------------------------------------
   MODE TOGGLE
   The one-step theme change, as a button. Any element with data-mode-toggle
   flips the whole page between light and dark on click:

     <button class="btn" data-mode-toggle data-tip="Switch light and dark">
       Light / dark
     </button>
   -------------------------------------------------------------------------- */

function initModeToggles() {
  for (const button of document.querySelectorAll("[data-mode-toggle]")) {
    button.addEventListener("click", () => {
      const html = document.documentElement;
      html.dataset.mode = html.dataset.mode === "dark" ? "light" : "dark";
    });
  }
}


/* --------------------------------------------------------------------------
   BOOT
   -------------------------------------------------------------------------- */

initColorMode();

document.addEventListener("DOMContentLoaded", () => {
  initNumberInputs();
  initSliders();
  initCopyButtons();
  initModeToggles();
});

/* The public API for calculator apps. */
window.facet = { numberValue, groupIndian, numberWords };
