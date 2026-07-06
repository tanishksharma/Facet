/* Facet docs site behaviour — wires whatever docs elements a page has
   (the wall, folds, chips, search, scrollspy, playground…). Every init
   guards for absent elements, so one file serves every page. Not part of
   the library; never in /lib. */

/* The snippet under each wall entry is not hand-written: it is the
   demo's actual DOM, serialized. Flip a chip and the snippet follows,
   so what you copy is always exactly what you see. */
function renderSnippet(article) {
  const demo = article.querySelector(".demo");
  const code = article.querySelector("pre code");
  if (!demo || !code) return;
  const html = [...demo.children]
    .filter(el => !el.hidden)
    .map(el => el.outerHTML)
    .join("\n\n");
  code.textContent = tidySnippet(html);
}

/* Strips attributes facet.js adds at runtime and re-levels the
   indentation that comes from this page's own nesting. */
function tidySnippet(html) {
  html = html.replace(/ data-edited="true"/g, "").replace(/ placeholder="0"/g, "");
  html = html.replace(/(<span class="number-words"[^>]*>)[^<]*(<\/span>)/g, "$1$2");
  const lines = html.split("\n");
  const rest = lines.slice(1).filter(line => line.trim());
  const cut = rest.length ? Math.min(...rest.map(line => line.match(/^ */)[0].length)) : 0;
  return [lines[0], ...lines.slice(1).map(line => line.slice(cut))].join("\n").trim();
}

/* The setup strip: theme and mode picks rewrite the consume snippet
   (data attributes on the facet.js tag) and apply to this page live
   through the same facet.set() API projects use. */
function initSetupStrip() {
  const strip = document.querySelector("#setup-strip");
  const snippet = document.querySelector("#snippet-consume");
  if (!strip || !snippet) return;         // pages without the landing hero
  const picks = { theme: "", mode: "" };

  const renderSnippet = () => {
    const attrs =
      (picks.theme ? ` data-theme="${picks.theme}"` : "") +
      (picks.mode ? ` data-mode="${picks.mode}"` : "");
    snippet.textContent =
      `<link rel="stylesheet" href="${location.origin}/lib/facet.css">\n` +
      `<script src="${location.origin}/lib/facet.js"${attrs} defer><\/script>`;
  };

  for (const chip of strip.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      const group = chip.dataset.setup;
      picks[group] = chip.dataset.setupValue;
      for (const other of strip.querySelectorAll(`[data-setup="${group}"]`)) {
        other.setAttribute("aria-pressed", String(other === chip));
      }
      // Auto mode means "no attribute, follow the system" — live-demo
      // it by applying what this visitor's system prefers right now.
      const liveMode = picks.mode ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      facet.set({ theme: picks.theme || null, mode: liveMode });
      renderSnippet();
    });
  }
}

/* Chips flip the live demo. Three kinds, by data attribute:
     data-chip-group + data-chip-class   radio-style class swap
     data-chip-attr                      toggle an attribute on/off
     data-chip-show                      show one of several demo children
   data-chip-target narrows the element acted on (default: the demo's
   first child). Every flip re-renders the snippet. */
function initChips() {
  for (const chip of document.querySelectorAll(".element .chip:not([data-config-key])")) {
    chip.addEventListener("click", () => {
      const article = chip.closest(".element");
      const demo = article.querySelector(".demo");
      const target = chip.dataset.chipTarget
        ? demo.querySelector(chip.dataset.chipTarget)
        : demo.firstElementChild;

      if (chip.dataset.chipGroup !== undefined) {
        const group = article.querySelectorAll(`.chip[data-chip-group="${chip.dataset.chipGroup}"]`);
        for (const other of group) {
          if (other.dataset.chipClass) target.classList.remove(other.dataset.chipClass);
          other.setAttribute("aria-pressed", "false");
        }
        if (chip.dataset.chipClass) target.classList.add(chip.dataset.chipClass);
        chip.setAttribute("aria-pressed", "true");
      } else if (chip.dataset.chipAttr !== undefined) {
        const attr = chip.dataset.chipAttr;
        const isOn = target.hasAttribute(attr);
        if (isOn) target.removeAttribute(attr);
        else target.setAttribute(attr, "");
        chip.setAttribute("aria-pressed", String(!isOn));
      } else if (chip.dataset.chipShow) {
        for (const child of demo.children) child.hidden = true;
        demo.querySelector(chip.dataset.chipShow).hidden = false;
        for (const other of article.querySelectorAll(".chip[data-chip-show]")) {
          other.setAttribute("aria-pressed", "false");
        }
        chip.setAttribute("aria-pressed", "true");
      }

      renderSnippet(article);
    });
  }
}

/* Chips that drive page-wide configuration through facet.set() —
   the same API projects use. Radio behavior within each config key. */
function initConfigChips() {
  for (const chip of document.querySelectorAll(".chip[data-config-key]")) {
    chip.addEventListener("click", () => {
      facet.set({ [chip.dataset.configKey]: chip.dataset.configValue || null });
      for (const other of document.querySelectorAll(
        `.chip[data-config-key="${chip.dataset.configKey}"]`)) {
        other.setAttribute("aria-pressed", String(other === chip));
      }
    });
  }
}

/* The search box filters the wall and the sidebar together. */
function initWallSearch() {
  const box = document.querySelector("#wall-search");
  if (!box) return;                       // pages without the wall (home)
  const articles = [...document.querySelectorAll("article.element")];
  const links = [...document.querySelectorAll(".docs-index a[href^='#']")];
  const emptyNote = document.querySelector("#wall-empty");

  const groups = [...document.querySelectorAll(".nav-group")];
  let priorOpen = null;                    // remembers fold state before a search

  box.addEventListener("input", () => {
    const query = box.value.trim().toLowerCase();
    let shown = 0;

    for (const article of articles) {
      const hit = !query || article.textContent.toLowerCase().includes(query);
      article.hidden = !hit;
      if (hit) shown++;
    }
    for (const link of links) {
      const section = document.querySelector(link.getAttribute("href"));
      if (section && section.matches("article.element")) {
        link.parentElement.hidden = section.hidden;
      }
    }
    emptyNote.hidden = !(query && shown === 0);
    // A search reaches across every layer, so open them all while it
    // runs; remember the reader's fold state first and restore it the
    // moment the box is cleared.
    if (query) {
      if (!priorOpen) priorOpen = groups.map(g => g.open);
      for (const g of groups) g.open = true;
    } else if (priorOpen) {
      groups.forEach((g, i) => { g.open = priorOpen[i]; });
      priorOpen = null;
    }
  });
}

/* Marking, not collapsing: setActiveGroup only highlights the layer the
   reader is in — it never opens or closes a group. Expanding is the
   reader's job (click a label to toggle it, native <details>), so the
   nav never rearranges itself under the pointer while scrolling. */
const navGroups = [...document.querySelectorAll(".nav-group")];
function setActiveGroup(group) {
  for (const g of navGroups) g.classList.toggle("is-active-group", g === group);
}

/* Scrollspy: as the page scrolls, the sidebar link for the section on
   screen lights up and its layer label is marked, so the nav always
   shows where you are — without opening or closing anything. */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".docs-index a[href^='#']")];
  const nav = document.querySelector(".docs-index");
  const pairs = [];
  for (const link of links) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) pairs.push([link, target]);
  }

  let ticking = false;
  const highlight = () => {
    ticking = false;
    // The section whose top has most recently crossed the reading
    // line (140px below the viewport top) is the one on screen.
    // Viewport-relative rects, so it works whatever the offset
    // parent is — the old offsetTop math read the wrong coordinate.
    const line = 140;
    let best = null, bestTop = -Infinity;
    for (const [link, target] of pairs) {
      if (target.hidden || target.offsetParent === null) continue;
      const top = target.getBoundingClientRect().top;
      if (top <= line && top > bestTop) { bestTop = top; best = link; }
    }
    if (!best) {
      for (const [link, target] of pairs) {
        if (!target.hidden && target.offsetParent !== null) { best = link; break; }
      }
    }
    for (const [link] of pairs) link.classList.toggle("is-current", link === best);
    // Mark the layer the current section lives in (highlight only).
    const group = best && best.closest(".nav-group");
    if (group) setActiveGroup(group);
    // Keep where-you-are visible in the sticky sidebar: the active link
    // when its group is open, otherwise that group's own label. Scroll
    // only the nav, never the page.
    const keep = best && best.offsetParent !== null
      ? best
      : (group && group.querySelector(":scope > summary"));
    if (keep && nav) {
      const nb = nav.getBoundingClientRect(), bb = keep.getBoundingClientRect();
      if (bb.top < nb.top) nav.scrollTop += bb.top - nb.top - 8;
      else if (bb.bottom > nb.bottom) nav.scrollTop += bb.bottom - nb.bottom + 8;
    }
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(highlight); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request, { passive: true });
  // Folds opening/closing changes section positions — re-spy after each.
  for (const fold of document.querySelectorAll(".fold")) fold.addEventListener("toggle", request);
  highlight();
}

/* Clicking a layer's label just expands or collapses that layer — the
   native <details> toggle, no scroll, no rearranging its neighbours.
   (Kept as a named no-op hook in case wiring is needed later.) */

/* The color panels follow the active theme: when the header switcher
   changes data-theme on <html>, mirror it onto each panel so they show
   this theme's light and dark, not just the Default's. */
function initModePanels() {
  const panels = document.querySelectorAll(".mode-panel");
  const sync = () => {
    const theme = document.documentElement.dataset.theme;
    for (const panel of panels) {
      if (theme) panel.dataset.theme = theme;
      else delete panel.dataset.theme;
    }
  };
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"],
  });
  sync();
}

/* Copy as Markdown: every wall entry gains a second copy button
   that packages the component's description and exact snippet as
   Markdown — one paste puts a whole component in an LLM prompt. */
function initMarkdownButtons() {
  for (const article of document.querySelectorAll("article.element")) {
    const copyBtn = article.querySelector("[data-copy]");
    const code = article.querySelector("pre code");
    const title = article.querySelector("h3");
    const desc = article.querySelector("p");
    if (!copyBtn || !code || !title || !desc) continue;
    const btn = document.createElement("button");
    btn.className = "btn btn-small";
    btn.dataset.codeTool = "markdown";
    btn.textContent = "Copy as Markdown";
    btn.dataset.event = "copy-markdown";
    btn.dataset.tip = "The description and snippet as Markdown, ready for an LLM prompt";
    btn.addEventListener("click", async () => {
      const md = "## Facet: " + title.textContent.trim() + "\n\n"
        + desc.textContent.replace(/\s+/g, " ").trim() + "\n\n"
        + "```html\n" + code.textContent.trim() + "\n```\n";
      try { await navigator.clipboard.writeText(md); } catch { /* clipboard denied */ }
      if (window.facet) facet.toast("Copied as Markdown", "success");
    });
    copyBtn.parentElement.appendChild(btn);
  }
}

/* Overlay the code-block actions as an icon cluster at the bottom-right of
   each snippet, instead of a row of buttons below it. The primary Copy is a
   copy icon; Copy-as-Markdown, CodePen and Edit-on-GitHub become small icon
   buttons in the same corner. Runs after the buttons are created. */
function overlayCodeTools() {
  const ICON = { copy: "copy", codepen: "download-cloud", github: "link" };
  for (const pre of document.querySelectorAll("article.element pre")) {
    if (pre.parentElement.classList.contains("code-wrap")) continue;   // idempotent
    // the actions row is the <p> holding the [data-copy] button, right after the pre
    const row = pre.nextElementSibling && pre.nextElementSibling.querySelector?.("[data-copy]")
      ? pre.nextElementSibling
      : [...pre.parentElement.children].find(el => el.tagName === "P" && el.querySelector("[data-copy]"));
    if (!row) continue;

    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const tools = document.createElement("div");
    tools.className = "code-tools";
    for (const btn of [...row.children]) {
      const label = btn.textContent.trim();
      const kind = btn.hasAttribute("data-copy") ? "copy"
        : btn.dataset.codeTool === "markdown" ? "markdown"
        : /codepen/i.test(label) ? "codepen"
        : /github/i.test(label) ? "github" : "other";
      btn.classList.add("btn-icon", "btn-small");
      btn.classList.remove("btn");
      btn.classList.add("btn");
      if (!btn.dataset.tip) btn.dataset.tip = label;
      btn.setAttribute("aria-label", label);
      btn.innerHTML = kind === "markdown"
        ? '<span aria-hidden="true">MD</span>'
        : `<svg data-icon="${ICON[kind] || "copy"}" aria-hidden="true"></svg>`;
      tools.appendChild(btn);
    }
    wrap.appendChild(tools);
    row.remove();
  }
  if (window.facet) facet.icon();     // fill the new svg[data-icon]
}

/* Size badge: fetches the two shipped files, gzips them right here
   in the browser (CompressionStream), and states the real number.
   Absent where the API is missing — never an invented figure. */
async function initSizeBadge() {
  const badge = document.querySelector("#size-badge");
  if (!badge || typeof CompressionStream === "undefined") return;
  try {
    const gzipped = async (url) => {
      const raw = await (await fetch(url)).blob();
      const gz = await new Response(
        raw.stream().pipeThrough(new CompressionStream("gzip"))
      ).blob();
      return gz.size;
    };
    const [css, js] = await Promise.all([gzipped("/lib/facet.css"), gzipped("/lib/facet.js")]);
    badge.textContent =
      `${((css + js) / 1024).toFixed(1)} KB gzipped over the wire — two files, zero dependencies, never minified.`;
    badge.hidden = false;
  } catch { /* offline: show no badge rather than a wrong one */ }
}

/* Playground: the textarea renders into a real framed page built
   on the two shipped files, re-rendered as you type (debounced).
   The frame mirrors this page's theme and mode attributes. */
function initPlayground() {
  const input = document.querySelector("#playground-input");
  const frame = document.querySelector("#playground-frame");
  if (!input || !frame) return;
  input.value = '<main class="container stack" style="padding: 1rem;">\n  <h2>Hello, Facet</h2>\n  <button class="btn btn-primary" data-tip="A real button">Try me</button>\n</main>';
  let timer;
  const render = () => {
    const html = document.documentElement;
    frame.srcdoc = `<!doctype html>
      <html${html.dataset.theme ? ` data-theme="${html.dataset.theme}"` : ""}${html.dataset.mode ? ` data-mode="${html.dataset.mode}"` : ""}>
      <head><meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="${location.origin}/lib/facet.css">
      <script src="${location.origin}/lib/facet.js" defer><\/script></head>
      <body>${input.value}</body></html>`;
  };
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 350); });
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme", "data-mode"],
  });
  render();
}

/* Click-to-copy tokens: every swatch and every token name in a
   type label becomes a real button copying its var(--name). */
function initTokenCopy() {
  const copyable = (btnText) => {
    const m = btnText.match(/--[a-z0-9-]+/);
    return m ? `var(${m[0]})` : null;
  };
  const arm = (btn) => {
    const payload = copyable(btn.textContent);
    if (!payload) return;
    btn.dataset.tip = `Copies ${payload}`;
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(payload); } catch { /* denied */ }
      if (window.facet && facet.feedback) facet.feedback.tap();
    });
  };
  for (const li of document.querySelectorAll(".swatch-row li")) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "token-copy";
    btn.append(...li.childNodes);
    li.appendChild(btn);
    arm(btn);
  }
  for (const label of document.querySelectorAll(".type-label")) {
    const parts = label.textContent.split("·").map(s => s.trim()).filter(Boolean);
    label.textContent = "";
    parts.forEach((part, i) => {
      if (i) label.append(" · ");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "token-copy";
      btn.textContent = part;
      label.append(btn);
      arm(btn);
    });
  }
}

/* Keyboard-first search: "/" or Cmd/Ctrl+K focuses the wall
   search; arrows walk the visible sidebar links from there. */
function initSearchKeys() {
  const search = document.querySelector("#wall-search") || document.querySelector(".docs-index input");
  if (!search) return;
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      search.focus();
      search.select();
    }
  });
  const links = () => [...document.querySelectorAll(".docs-index a")].filter(a => !a.parentElement.hidden);
  search.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); links()[0]?.focus(); }
  });
  document.querySelector(".docs-index").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const list = links();
    const i = list.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    (list[i + (e.key === "ArrowDown" ? 1 : -1)] || (e.key === "ArrowUp" ? search : list[i]))?.focus();
  });
}

/* Heading permalinks: hover a titled section heading, copy the
   deep link. On h2 section headings only — folded h3s live inside a
   clickable summary, where a permalink would fight the toggle. */
function initPermalinks() {
  for (const h of document.querySelectorAll("main h2")) {
    if (h.closest(".home-section")) continue;   // the home manual is not a wall — no hash affordance
    const target = h.id || h.closest("[id]")?.id;
    if (!target) continue;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "permalink";
    btn.textContent = "#";
    btn.setAttribute("aria-label", `Copy link to ${h.textContent.trim()}`);
    btn.dataset.tip = "Copies the deep link to this section";
    btn.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#${target}`;
      try { await navigator.clipboard.writeText(url); } catch { /* denied */ }
      history.replaceState(null, "", `#${target}`);
    });
    h.appendChild(btn);
  }
}

/* Live contrast badges: WCAG ratios for the working pairs in each
   color panel, re-checked whenever theme or mode changes. */
function initContrastBadges() {
  const ratio = (fg, bg) => {
    const lum = (rgb) => {
      const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [a, b] = [lum(fg), lum(bg)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const PAIRS = [
    ["text", "--text", "--background"],
    ["muted", "--text-muted", "--background"],
    ["accent-1", "--on-accent-1", "--accent-1"],
    ["accent-3 link", "--accent-3", "--background"],
  ];
  const rows = [];
  for (const panel of document.querySelectorAll(".mode-panel")) {
    const row = document.createElement("p");
    row.className = "contrast-badges";
    panel.appendChild(row);
    rows.push([panel, row]);
  }
  const probeIn = (panel, token) => {
    const s = document.createElement("span");
    s.hidden = true;
    s.style.color = `var(${token})`;
    panel.appendChild(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return c;
  };
  const render = () => {
    for (const [panel, row] of rows) {
      row.replaceChildren();
      for (const [name, fg, bg] of PAIRS) {
        const r = ratio(probeIn(panel, fg), probeIn(panel, bg));
        const grade = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA-large" : "fails";
        const badge = document.createElement("span");
        badge.textContent = `${name} ${r.toFixed(1)}:1 ${grade}`;
        row.appendChild(badge);
      }
    }
  };
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme", "data-mode"],
  });
  render();
}

/* Viewport-width toggles, Open in CodePen, Edit on GitHub: one
   small tool row appended to every wall entry. */
function initDemoTools() {
  for (const article of document.querySelectorAll("article.element")) {
    const demo = article.querySelector(".demo");
    const code = article.querySelector("pre code");
    const copyRow = article.querySelector("[data-copy]")?.closest("p");
    if (!demo || !code || !copyRow) continue;

    const widths = document.createElement("p");
    widths.className = "chips demo-width-chips";
    widths.setAttribute("role", "group");
    widths.setAttribute("aria-label", "Device width");
    for (const [label, w] of [["Phone", "375px"], ["Tablet", "640px"], ["Desktop", ""]]) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = label;
      chip.dataset.chipWidth = w;   // owned: keeps the library's self-toggle off it
      chip.dataset.tip = w ? `Constrains the demo to ${w}` : "Full width again";
      chip.setAttribute("aria-pressed", String(!w));
      chip.addEventListener("click", () => {
        demo.style.maxWidth = w;
        for (const c of widths.children) c.setAttribute("aria-pressed", "false");
        chip.setAttribute("aria-pressed", "true");
      });
      widths.appendChild(chip);
    }
    demo.before(widths);

    const pen = document.createElement("button");
    pen.type = "button";
    pen.className = "btn btn-small";
    pen.textContent = "Open in CodePen";
    pen.dataset.event = "open-codepen";
    pen.dataset.tip = "The snippet plus the two tags, live on CodePen";
    pen.addEventListener("click", () => {
      const form = document.createElement("form");
      form.action = "https://codepen.io/pen/define";
      form.method = "POST";
      form.target = "_blank";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "data";
      input.value = JSON.stringify({
        title: "Facet — " + article.querySelector("h3").textContent.trim(),
        head: `<link rel="stylesheet" href="${location.origin}/lib/facet.css">\n<script src="${location.origin}/lib/facet.js" defer><\/script>`,
        html: code.textContent,
        editors: "100",
      });
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      form.remove();
    });
    copyRow.appendChild(pen);

    const edit = document.createElement("a");
    edit.className = "btn btn-ghost btn-small";
    edit.href = "https://github.com/tanishksharma/Facet/blob/main/index.html";
    edit.textContent = "Edit on GitHub";
    edit.dataset.tip = "This page's readable source in the repo";
    copyRow.appendChild(edit);
  }
}

/* Relocate the Playground to the end of the page, so DOM order matches
   the sidebar's Tools group. It was wedged mid-Layer-1, which made clicks
   and the scrollspy disagree — the section you scrolled into never
   matched the link. */
function relocateTools() {
  const main = document.querySelector("#main");
  for (const id of ["playground"]) {
    const sec = document.querySelector("#" + id);
    if (sec) main.appendChild(sec);
  }
}

/* Component wall category filter: the chip row (.wall-filter) flips which
   data-cat entries show. Composes with the search box — an article hides
   when EITHER the category chip or the text search excludes it — and the
   .wall-group category headings hide when nothing under them is visible. */
function initWallFilter() {
  const chips = [...document.querySelectorAll(".wall-filter [data-chip-cat]")];
  if (!chips.length) return;
  // Only the six Layer-2 categories are filtered; app-kit (Layer 5) and any
  // uncategorised article are untouched, so the filter can't reach past its
  // own layer on the merged page.
  const catset = new Set(chips.map(c => c.dataset.chipCat).filter(c => c !== "all"));
  const articles = [...document.querySelectorAll("article.element[data-cat]")].filter(a => catset.has(a.dataset.cat));
  const groups = [...document.querySelectorAll(".wall-group")];

  const updateGroups = () => {
    for (const g of groups) {
      // stop at the next category heading OR the next layer (section / band),
      // so a category's visibility never depends on another layer's articles.
      let visible = false, el = g.nextElementSibling;
      while (el && !el.classList.contains("wall-group") && !el.matches("section, .layer-band")) {
        if (el.matches("article.element") && !el.classList.contains("cat-hidden") && !el.hidden) { visible = true; break; }
        el = el.nextElementSibling;
      }
      g.hidden = !visible;
    }
  };
  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.chipCat;
      for (const c of chips) c.setAttribute("aria-pressed", String(c === chip));
      for (const a of articles) a.classList.toggle("cat-hidden", cat !== "all" && a.dataset.cat !== cat);
      updateGroups();
      if (window.facet && facet.feedback) facet.feedback.tick();
    });
  }
  const search = document.querySelector("#wall-search");
  if (search) search.addEventListener("input", () => setTimeout(updateGroups, 0));
  updateGroups();
}

/* Device preview: each .device-preview[data-src] loads a real template
   page into an iframe and scales it to fit the column. Desktop / Tablet /
   Phone chips set the frame's logical width; the frame is transform-scaled
   so the template's genuine responsive layout shows at that breakpoint.
   Lazy: the iframe src is only set once the preview nears the viewport. */
function initDevicePreview() {
  const SIZES = { desktop: [1280, 800], tablet: [834, 1040], phone: [390, 780] };
  for (const preview of document.querySelectorAll(".device-preview")) {
    const stage = preview.querySelector(".device-stage");
    const frame = preview.querySelector(".device-frame");
    const src = preview.dataset.src;
    if (!stage || !frame || !src) continue;
    let device = "desktop";
    const layout = () => {
      const [w, h] = SIZES[device];
      const avail = stage.clientWidth || preview.clientWidth || w;
      const scale = Math.min(1, avail / w);
      frame.style.width = w + "px";
      frame.style.height = h + "px";
      frame.style.marginLeft = -(w / 2) + "px";
      frame.style.transform = `scale(${scale})`;
      stage.style.height = h * scale + "px";
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { if (!frame.src) frame.src = src; io.disconnect(); }
    }, { rootMargin: "300px" });
    io.observe(preview);
    for (const chip of preview.querySelectorAll("[data-chip-device]")) {
      chip.addEventListener("click", () => {
        device = chip.dataset.chipDevice;
        for (const c of preview.querySelectorAll("[data-chip-device]")) c.setAttribute("aria-pressed", String(c === chip));
        layout();
        if (window.facet && facet.feedback) facet.feedback.tick();
      });
    }
    layout();
    addEventListener("resize", layout);
  }
}

/* The Sound & haptics wall entry: its buttons carry data-feedback-demo
   naming a facet.feedback method (tap/tick/snap/success). Wired here in
   docs.js — the library never ships demo handlers. Absent on other pages. */
function initFeedbackDemo() {
  for (const btn of document.querySelectorAll("[data-feedback-demo]")) {
    const method = btn.dataset.feedbackDemo;
    btn.addEventListener("click", () => {
      if (window.facet && facet.feedback && facet.feedback[method]) facet.feedback[method]();
    });
  }
}

/* Big layer bands: a strong divider and display-sized heading before
   each layer, so the page reads as Manual / Layer 1 / 2 / 3 / 4 /
   Tools instead of one endless scroll. */
function insertLayerBands() {
  const bands = [
    ["typography", "Layer 1", "Tokens & base", "Every design decision as a named variable — type, color, space, shape, motion — plus raw semantic HTML already designed."],
    ["components", "Layer 2", "Components",  "Every piece of the library, live — grouped and filterable. Each folds to a heading and a line; open one to see it work."],
    ["blocks",     "Layer 3", "Blocks",     "The components, assembled into ready page sections you copy whole."],
    ["templates",  "Layer 4", "Templates",  "Whole pages — full app and site layouts you rename and fill in."],
    ["appfeel",    "Layer 5", "App feel",   "The layer that makes a finished page feel native: parallax, sound, surfaces, and the app kit."],
    ["playground", "Tools",   "Playground","An editable live playground that renders whatever you type through the real library files."],
  ];
  for (const [id, kicker, title, blurb] of bands) {
    const anchor = document.querySelector("#" + id);
    if (!anchor) continue;
    const band = document.createElement("header");
    band.className = "layer-band";
    band.innerHTML = `<span class="layer-kicker"></span><h2></h2><p></p>`;
    band.querySelector(".layer-kicker").textContent = kicker;
    band.querySelector("h2").textContent = title;
    band.querySelector("p").textContent = blurb;
    anchor.parentNode.insertBefore(band, anchor);
  }
}

/* Fold every wall entry: heading + a one-line callout when collapsed,
   full description, demo, snippet and reference on open. The callout
   is the entry's own "what it is / what it's for" text, trimmed — so
   a glance down the page explains the whole library. */
function foldWallEntries() {
  const calloutFrom = (text) => {
    const t = text.replace(/\s+/g, " ").trim();
    const isM = /What it is:\s*(.+?)(?:\s*What it is for:|\s*When to use it:|$)/.exec(t);
    const forM = /What it is for:\s*(.+?)(?:\s*When to use it:|$)/.exec(t);
    let out = isM ? isM[1].trim() : t.slice(0, 180);
    if (forM) out += " " + forM[1].trim();
    if (out.length > 240) {                       // keep it to a glance
      const cut = out.slice(0, 240).lastIndexOf(". ");
      out = cut > 80 ? out.slice(0, cut + 1) : out.slice(0, 240).trim() + "…";
    }
    return out.charAt(0).toUpperCase() + out.slice(1);   // the clause starts lowercase in source
  };
  for (const article of document.querySelectorAll("article.element")) {
    if (article.querySelector(":scope > .fold")) continue;   // idempotent
    const h3 = article.querySelector(":scope > h3");
    const desc = article.querySelector(":scope > p");
    if (!h3 || !desc) continue;
    const details = document.createElement("details");
    details.className = "fold";
    while (article.firstChild) details.appendChild(article.firstChild);
    const summary = document.createElement("summary");
    const titleRow = document.createElement("div");
    titleRow.className = "fold-title";
    titleRow.appendChild(h3);                     // move the heading up
    const chevron = document.createElement("span");
    chevron.className = "fold-chevron";
    chevron.setAttribute("aria-hidden", "true");
    titleRow.appendChild(chevron);
    const note = document.createElement("p");
    note.className = "fold-note";
    note.textContent = calloutFrom(desc.textContent);
    summary.append(titleRow, note);
    details.prepend(summary);
    article.appendChild(details);
    // Charts and gauges measured 0 while hidden — nudge a redraw on open.
    details.addEventListener("toggle", () => {
      if (details.open) requestAnimationFrame(() => dispatchEvent(new Event("resize")));
    });
  }
}

/* Label the parts of an opened wall entry, so it is obvious what each
   region is: every control chip group is captioned by what it changes
   (its aria-label — "Stack gaps", "Device width"…), the live demo is
   "Preview", and the snippet is "Code". Runs after foldWallEntries, so
   it labels the moved-in children of each .fold. */
function labelWallParts() {
  const mk = (text) => {
    const s = document.createElement("span");
    s.className = "part-label";
    s.textContent = text;
    return s;
  };
  const labelled = (el) => el && el.previousElementSibling
    && el.previousElementSibling.classList.contains("part-label");
  for (const fold of document.querySelectorAll("article.element > .fold")) {
    for (const chips of fold.querySelectorAll(":scope > p.chips")) {
      if (labelled(chips)) continue;
      chips.before(mk(chips.getAttribute("aria-label") || "Options"));
    }
    const demo = fold.querySelector(":scope > .demo");
    if (demo && !labelled(demo)) demo.before(mk("Preview"));
    const pre = fold.querySelector(":scope > pre");
    if (pre && !labelled(pre)) pre.before(mk("Code"));
  }
}

/* A sidebar link to a folded entry opens it before scrolling. */
function initFoldLinks() {
  for (const a of document.querySelectorAll(".docs-index a[href^='#']")) {
    a.addEventListener("click", () => {
      const target = document.querySelector(a.getAttribute("href"));
      const fold = target && target.querySelector && target.querySelector(":scope > .fold");
      if (fold) fold.open = true;
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  for (const article of document.querySelectorAll("article.element")) renderSnippet(article);
  initChips();
  initConfigChips();
  initModePanels();
  initSetupStrip();
  initSizeBadge();
  initTokenCopy();
  initContrastBadges();
  initMarkdownButtons();
  initDemoTools();
  overlayCodeTools();              // code actions become a corner icon cluster
  relocateTools();                 // Playground to the end
  insertLayerBands();
  initPlayground();
  initFeedbackDemo();              // the Sound & haptics wall buttons
  initWallFilter();                // Layer 3 category filter chips
  initDevicePreview();             // Layer 5 templates in scaled device frames
  const gaugeBox = document.querySelector("#scroll-gauge .demo-scroller");
  if (gaugeBox && window.facet) facet.scrollGauge(gaugeBox);
  document.querySelector("#demo-toast")?.addEventListener("click", () => {
    facet.toast("Report saved", "success");
  });
  // Icon gallery: every glyph in facet.icons, click to copy its markup.
  const gallery = document.querySelector("#icon-gallery");
  if (gallery && window.facet) {
    for (const name of Object.keys(facet.icons)) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "icon-cell";
      cell.dataset.tip = `Copies <svg data-icon="${name}">`;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.dataset.icon = name;
      const cap = document.createElement("span");
      cap.className = "text-caption";
      cap.textContent = name;
      cell.append(svg, cap);
      cell.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(`<svg data-icon="${name}"></svg>`); } catch { /* denied */ }
        facet.toast(`Copied the ${name} icon`);
      });
      gallery.appendChild(cell);
    }
    facet.icon();   // fill the gallery svgs just created
  }
  const chartEl = document.querySelector("#demo-chart");
  if (chartEl && window.facet) {
    // ₹1,00,000 of 2014 money, inflated year by year, projected on.
    const points = [];
    let v = 100000;
    for (let year = 2014; year <= 2030; year++) {
      points.push({ x: year, y: Math.round(v), label: String(year) });
      v *= year < 2026 ? 1.058 : 1.05;
    }
    facet.chart(chartEl, {
      points,
      projectFrom: 13,                        // 2027 on is projection
      events: [{ x: 2016, label: "Notes ban" }, { x: 2020, label: "Covid" }],
    });
  }

  // Fold, control and spy — after all content and demo wiring, so the
  // injected snippets, demo tools and reference blocks fold in too.
  foldWallEntries();
  labelWallParts();
  initWallSearch();
  initFoldLinks();
  initSearchKeys();
  initPermalinks();
  initScrollSpy();
});
