/* Facet docs site behaviour — wires whatever docs elements a page has
   (the wall, folds, chips, search, scrollspy…). Every init guards for
   absent elements, so one file serves every page. Not part of the
   library; never in /lib. */

/* Open at the top on every reload. Browsers default to "auto" scroll
   restoration, which reopens a long page at the previous scroll position
   — on the docs site that reads as the page loading half-scrolled. Set
   it to manual so a plain reload starts at the top; an explicit #anchor
   in the URL still scrolls to its target on load. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

/* The snippet under each wall entry is not hand-written: it is the
   demo's actual DOM, serialized. Flip a chip and the snippet follows,
   so what you copy is always exactly what you see. */
function renderSnippet(article) {
  const demo = article.querySelector(".demo");
  const code = article.querySelector("pre code");
  // a pre marked data-code-static is hand-authored (a recipe, a URL list)
  // and never overwritten by the demo serializer
  if (!demo || !code || code.closest("pre").hasAttribute("data-code-static")) return;
  const html = [...demo.children]
    .filter(el => !el.hidden)
    .map(el => el.outerHTML)
    .join("\n\n");
  code.innerHTML = highlightHtml(tidySnippet(html));
}

/* Color the snippet like an HTML file in VS Code's default themes:
   tags, attribute names, attribute values, comments. Escapes first,
   then wraps tokens in .hl-* spans (colors in docs.css). */
function highlightHtml(src) {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hl-comment">$1</span>')
    .replace(/(&lt;\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?&gt;)/g, (m, open, tag, attrs, close) => {
      const inner = attrs.replace(/([\w-]+)(=)("[^"]*")/g,
        '<span class="hl-attr">$1</span><span class="hl-punct">$2</span><span class="hl-value">$3</span>');
      return `<span class="hl-punct">${open}</span><span class="hl-tag">${tag}</span>${inner}<span class="hl-punct">${close}</span>`;
    });
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
  });
}

/* AI instructions, pulled live from llms.txt — one source of truth.
   Each entry's h3 is matched against the file's ## / ### section
   titles; the matching section's text renders verbatim in the entry's
   AI-instructions block, so a person reads exactly what an agent
   reads. An entry whose title differs from its llms section (the
   function pages name the API, the file names the component) points
   at the section with data-llms="Section title" on the article.
   Entries with no llms section keep any hand-written .ai-notes as a
   fallback. */
async function initAiNotes() {
  const articles = [...document.querySelectorAll("article.element")];
  if (!articles.length) return;
  let text;
  try { text = await (await fetch("/llms.txt")).text(); } catch { return; }
  const sections = {};
  const heads = [...text.matchAll(/^##+ +(.+)$/gm)];
  heads.forEach((m, i) => {
    const body = text.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : text.length).trim();
    sections[m[1].trim().toLowerCase()] = body;
  });
  for (const article of articles) {
    const h3 = article.querySelector(":scope > h3");
    if (!h3) continue;
    const body = sections[(article.dataset.llms || h3.textContent).trim().toLowerCase()];
    if (!body) continue;
    let notes = article.querySelector(":scope > .ai-notes");
    if (!notes) {
      notes = document.createElement("div");
      notes.className = "ai-notes";
      article.appendChild(notes);
    }
    notes.innerHTML = "";
    const pre = document.createElement("pre");
    pre.className = "ai-notes-body";
    pre.textContent = body;
    notes.appendChild(pre);
  }
}

/* The entry structure, enforced everywhere: description, variant row,
   PREVIEW, customization, code, AI instructions. Entries are authored
   with controls above the demo in older markup — move every option row
   (chips, fields, control clusters) that is not a .variant-row to just
   after the demo, so the preview always comes first. */
function orderEntryParts() {
  for (const article of document.querySelectorAll("article.element")) {
    const demo = article.querySelector(":scope > .demo");
    if (!demo) continue;
    const movers = [];
    for (const child of [...article.children]) {
      if (child === demo) break;
      if (child.matches("p.chips:not(.variant-row), label.field, .entry-controls")) movers.push(child);
    }
    for (const mover of movers.reverse()) demo.after(mover);
  }
}

/* The Backgrounds entry: variant sections (grid | fluid), each with
   its own controls. Everything writes classes, attributes or custom
   properties on the demo surfaces — the library's own machinery
   redraws — and the snippet re-renders to the visible variant. */
function initBackgroundDemo() {
  const article = document.querySelector("#backgrounds");
  const grid = document.querySelector("#bg-variant-grid");
  const fluid = document.querySelector("#bg-variant-fluid");
  if (!article || !grid || !fluid) return;
  const gridControls = document.querySelector("#bg-controls-grid");
  const customControls = document.querySelector("#bg-controls-custom");
  const press = (sel, chip) => {
    for (const c of document.querySelectorAll(sel)) c.setAttribute("aria-pressed", String(c === chip));
  };
  const refresh = () => renderSnippet(article);

  for (const chip of document.querySelectorAll("[data-bg-variant]")) {
    chip.addEventListener("click", () => {
      const isGrid = chip.dataset.bgVariant === "grid";
      grid.hidden = !isGrid;
      fluid.hidden = isGrid;
      gridControls.hidden = !isGrid;
      if (!isGrid && window.facet) facet.fluidBackground(fluid);
      press("[data-bg-variant]", chip);
      refresh();
    });
  }
  for (const chip of document.querySelectorAll("[data-grid-kind]")) {
    chip.addEventListener("click", () => {
      const kind = chip.dataset.gridKind;
      grid.classList.remove("bg-grid", "bg-dots", "bg-ruled", "bg-graph");
      if (kind === "custom") {
        if (!grid.dataset.bgGlyph) grid.dataset.bgGlyph = "sparkle";
        customControls.hidden = false;
      } else {
        delete grid.dataset.bgGlyph;
        grid.classList.add(kind);
        customControls.hidden = true;
      }
      press("[data-grid-kind]", chip);
      refresh();
    });
  }
  const setProp = (name, value) => {
    if (value) grid.style.setProperty(name, value);
    else grid.style.removeProperty(name);
    refresh();
  };
  for (const chip of document.querySelectorAll("[data-grid-tint]")) {
    chip.addEventListener("click", () => { setProp("--bg-tint", chip.dataset.gridTint); press("[data-grid-tint]", chip); });
  }
  for (const chip of document.querySelectorAll("[data-grid-strength]")) {
    chip.addEventListener("click", () => { setProp("--bg-strength", chip.dataset.gridStrength); press("[data-grid-strength]", chip); });
  }
  for (const chip of document.querySelectorAll("[data-grid-cell]")) {
    chip.addEventListener("click", () => { setProp("--bg-cell", chip.dataset.gridCell); press("[data-grid-cell]", chip); });
  }
  for (const chip of document.querySelectorAll("[data-glyph-preset]")) {
    chip.addEventListener("click", () => {
      grid.dataset.bgGlyph = chip.dataset.glyphPreset;
      press("[data-glyph-preset]", chip);
      const box = document.querySelector("#glyph-input");
      if (box) box.value = "";
      refresh();
    });
  }
  for (const chip of document.querySelectorAll("[data-glyph-scale]")) {
    chip.addEventListener("click", () => {
      if (chip.dataset.glyphScale) grid.dataset.bgGlyphScale = chip.dataset.glyphScale;
      else delete grid.dataset.bgGlyphScale;
      press("[data-glyph-scale]", chip);
      refresh();
    });
  }
  const box = document.querySelector("#glyph-input");
  if (box) box.addEventListener("input", () => {
    if (box.value.trim()) {
      grid.dataset.bgGlyph = box.value.trim();
      press("[data-glyph-preset]", null);
      refresh();
    }
  });
}

/* The library's pages (initLibraryPages): the wall is a reference, not
   a scroll. One URL hash = one page:
     (no hash) / #intro   the front door — the five layer cards
     #layer1 … #layer5    a layer's page: every entry in it as a card
     #<entry-id>          one component/section, fully open (no fold),
                          with previous/next links naming its neighbours
   The sidebar drives it (group names open the layer pages), any hash
   link anywhere swaps the page, and browser Back walks the trail. On
   phones and narrow windows the front door is one browsable scroll —
   the intro plus every layer's card grid — and opening a card slides
   the entry in full screen. A live search suspends the paging so
   matches from every layer can appear together; clearing the box
   restores the page. With JS off nothing routes: the whole wall renders
   in reading order, every entry open. */
function initLibraryPages() {
  const main = document.querySelector("main#main");
  const index = document.querySelector(".docs-index");
  const intro = document.querySelector("#intro");
  if (!main || !index || !intro) return;         // pages without the wall
  const narrow = matchMedia("(max-width: 56rem)");
  let searching = false;

  // ----- the model: the page's groups, read from the sidebar. Each
  // .nav-group is one card page: its label link names the page and its
  // #hash, and the group carries the page's kicker and lead as data
  // attributes — so this router serves any catalogue page (the component
  // library's five layers, the function library's groups) unchanged.
  const LAYERS = [...index.querySelectorAll(".nav-group[data-group]")].map((g) => {
    const name = g.querySelector(".nav-group-name");
    if (!name) return null;
    return {
      hash: (name.getAttribute("href") || "#").slice(1),
      group: g.dataset.group,
      kicker: g.dataset.pageKicker || "",
      title: name.textContent.trim(),
      lead: g.dataset.pageLead || "",
    };
  }).filter(Boolean);
  const flat = [];                                   // ordered entries for previous/next
  const unitFor = (id) => {
    const target = id && document.getElementById(id);
    if (!target || target === main || !main.contains(target)) return null;
    return target.closest("article.element") || target.closest("#main > section") || null;
  };

  // ----- build each layer's card page after the intro
  let anchor = intro;
  for (const [li, L] of LAYERS.entries()) {
    const groupEl = index.querySelector(`.nav-group[data-group="${L.group}"]`);
    if (!groupEl) continue;
    const page = document.createElement("section");
    page.className = "layer-page stack";
    page.id = L.hash;
    // the group's vivid thread color — the same one its sidebar dot wears
    page.style.setProperty("--group-color", `var(--color-${(li % 5) + 1})`);
    const head = document.createElement("header");
    head.className = "stack-tight";
    head.innerHTML = `<p class="layer-page-kicker"></p><h2></h2><p class="layer-page-lead"></p>`;
    if (L.kicker) head.querySelector(".layer-page-kicker").textContent = L.kicker;
    else head.querySelector(".layer-page-kicker").remove();
    head.querySelector("h2").textContent = L.title;
    head.querySelector(".layer-page-lead").textContent = L.lead;
    page.append(head);
    const grid = document.createElement("div");
    grid.className = "layer-grid";
    // walk the sidebar group in order: sub-labels become full-row
    // headings, links become cards
    for (const child of groupEl.children) {
      if (child.classList.contains("nav-sub")) {
        const sub = document.createElement("p");
        sub.className = "layer-grid-sub";
        sub.textContent = child.textContent;
        grid.append(sub);
      } else if (child.tagName === "UL") {
        for (const a of child.querySelectorAll("a[href^='#']")) {
          const id = decodeURIComponent(a.getAttribute("href").slice(1));
          const unit = unitFor(id);
          if (!unit) continue;
          const desc = unit.querySelector(":scope > p");
          const card = document.createElement("a");
          card.className = "card card-clickable entry-card";
          card.href = "#" + id;
          card.innerHTML = `<strong></strong><span class="entry-card-line"></span>`;
          card.querySelector("strong").textContent = a.textContent;
          card.querySelector(".entry-card-line").textContent =
            desc ? calloutFrom(desc.textContent) : "";
          grid.append(card);
          flat.push({ id, unit, title: a.textContent, layer: L });
        }
      }
    }
    page.append(grid);
    anchor.after(page);
    anchor = page;
  }
  const layerPages = LAYERS.map(L => document.getElementById(L.hash)).filter(Boolean);

  // ----- previous/next: a slim bar at the top of an entry's page
  const entryNav = document.createElement("nav");
  entryNav.className = "entry-nav";
  entryNav.setAttribute("aria-label", "Neighbouring entries");
  entryNav.hidden = true;
  main.prepend(entryNav);
  const fillEntryNav = (unit) => {
    const i = flat.findIndex(e => e.unit === unit);
    entryNav.innerHTML = "";
    const mk = (e, dir) => {
      const a = document.createElement("a");
      a.className = "entry-nav-link entry-nav-" + dir;
      a.href = "#" + e.id;
      a.innerHTML = `<span class="entry-nav-cue"></span><strong></strong>`;
      a.querySelector(".entry-nav-cue").textContent = dir === "prev" ? "← Previous" : "Next →";
      a.querySelector("strong").textContent = e.title;
      return a;
    };
    entryNav.append(i > 0 ? mk(flat[i - 1], "prev") : document.createElement("span"));
    entryNav.append(i >= 0 && i < flat.length - 1 ? mk(flat[i + 1], "next") : document.createElement("span"));
  };

  // ----- visibility: hide/show top-level areas of <main>
  const clearAll = () => {
    for (const el of main.querySelectorAll(".solo-hidden")) el.classList.remove("solo-hidden");
  };
  const showOnly = (keep) => {          // keep: Set of top-level children to show
    clearAll();
    for (const child of main.children) {
      if (child === entryNav) continue;
      if (!keep.has(child)) child.classList.add("solo-hidden");
    }
  };
  const showEntry = (unit) => {
    showOnly(new Set([unit.closest("#main > *")]));
    // inside a shared section (#components…): hide the unit's siblings too
    for (let node = unit; node && node !== main; node = node.parentElement) {
      if (node.parentElement === main) break;
      for (const sib of node.parentElement.children) {
        if (sib !== node) sib.classList.add("solo-hidden");
      }
    }
    fillEntryNav(unit);
    entryNav.hidden = false;
    main.classList.add("is-entry");
    scrollTo(0, 0);
  };
  const showPages = (pages) => {
    showOnly(new Set(pages));
    entryNav.hidden = true;
    main.classList.remove("is-entry");
    scrollTo(0, 0);
  };

  const apply = () => {
    if (searching) {                    // search shows matches across layers
      clearAll();
      for (const p of [intro, ...layerPages]) p.classList.add("solo-hidden");
      entryNav.hidden = true;
      main.classList.remove("is-entry");
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const L = LAYERS.find(l => l.hash === id);
    if (L && !narrow.matches) { showPages([document.getElementById(L.hash)]); return; }
    if (L) {                            // narrow: one browsable scroll, jump to the layer
      showPages([intro, ...layerPages]);
      document.getElementById(L.hash).scrollIntoView();
      return;
    }
    const unit = id && id !== "intro" ? unitFor(id) : null;
    if (unit) { showEntry(unit); return; }
    showPages(narrow.matches ? [intro, ...layerPages] : [intro]);
  };
  addEventListener("hashchange", apply);
  narrow.addEventListener("change", apply);
  index.addEventListener("click", (e) => {
    if (e.target.closest("a[href^='#']")) requestAnimationFrame(apply);
  });
  const box = document.querySelector("#wall-search");
  if (box) box.addEventListener("input", () => {
    searching = !!box.value.trim();
    apply();
  });
  apply();
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
    // Keep where-you-are centred in the sticky sidebar: whenever the
    // marked link CHANGES, scroll the panel so that link sits in the
    // panel's own middle — the panel scrolls, never the page. Links near
    // the ends settle as close to the middle as the panel allows.
    const keep = best && best.offsetParent !== null
      ? best
      : (group && group.querySelector(".nav-group-name"));
    if (keep && nav && keep !== centered) {
      centered = keep;
      const nb = nav.getBoundingClientRect(), bb = keep.getBoundingClientRect();
      const delta = (bb.top + bb.height / 2) - (nb.top + nb.height / 2);
      if (Math.abs(delta) > 2) nav.scrollTo({
        top: nav.scrollTop + delta,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  };
  let centered = null;
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(highlight); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request, { passive: true });
  // Previous/next and any hash link change the visible entry without a
  // scroll event (the page is already at the top) — re-spy on the change.
  addEventListener("hashchange", request);
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


/* The one code action: Copy, as an icon sitting fully inside the
   snippet's bottom-left corner (the block reserves room for it). */
function overlayCodeTools() {
  for (const pre of document.querySelectorAll("article.element pre")) {
    if (pre.parentElement.classList.contains("code-wrap")) continue;   // idempotent
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
    const copy = row.querySelector("[data-copy]");
    copy.classList.add("btn", "btn-icon", "btn-small");
    if (!copy.dataset.tip) copy.dataset.tip = "Copy this code";
    copy.setAttribute("aria-label", "Copy this code");
    copy.innerHTML = '<svg data-icon="copy" aria-hidden="true"></svg> <span>Copy</span>';
    tools.appendChild(copy);
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
    demo.after(widths);   // customization sits below the preview

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


/* Device preview: each .device-preview[data-src] loads a real template
   page into an iframe and scales it to fit the column. Desktop / Tablet /
   Phone chips set the frame's logical width; the frame is transform-scaled
   so the template's genuine responsive layout shows at that breakpoint.
   On a phone the chips hide and the preview just shows the phone layout —
   a desktop or tablet frame scaled into a phone column is unreadable and
   claims a truth the visitor cannot check.
   Lazy: the iframe src is only set once the preview nears the viewport. */
function initDevicePreview() {
  const SIZES = { desktop: [1280, 800], tablet: [834, 1040], phone: [390, 780] };
  const phoneViewer = matchMedia("(max-width: 34rem)").matches;
  for (const preview of document.querySelectorAll(".device-preview")) {
    const stage = preview.querySelector(".device-stage");
    const frame = preview.querySelector(".device-frame");
    const src = preview.dataset.src;
    if (!stage || !frame || !src) continue;
    let device = phoneViewer ? "phone" : "desktop";
    if (phoneViewer) {
      const row = preview.querySelector('[role="group"]');
      if (row) row.hidden = true;
      for (const c of preview.querySelectorAll("[data-chip-device]"))
        c.setAttribute("aria-pressed", String(c.dataset.chipDevice === "phone"));
    }
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

/* The Fonts entry: each face card names the actual font the active
   theme resolved for its role — read from the sample's computed stack
   (the first family is the theme's pick) and re-read when the theme or
   mode changes, so the caption always tells the truth. */
function initFontNames() {
  const blocks = [...document.querySelectorAll("#fonts .demo > article")];
  if (!blocks.length) return;
  const render = () => {
    for (const block of blocks) {
      const caption = block.querySelector(".type-label");
      const sample = block.querySelector("p:not(.type-label)");
      if (!caption || !sample) continue;
      let name = caption.querySelector(".font-name");
      if (!name) {
        name = document.createElement("strong");
        name.className = "font-name";
        caption.append(" · ", name);
      }
      name.textContent = getComputedStyle(sample).fontFamily
        .split(",")[0].trim().replace(/^"|"$/g, "");
    }
  };
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme", "data-mode"],
  });
  render();
  // Early paint can resolve the stack before the imported fonts CSS
  // arrives (the caption would read a browser default) — re-read once
  // everything, fonts included, has landed.
  addEventListener("load", render);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
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


/* The one-line callout for an entry: its own "what it is / what it's
   for" text, trimmed to a glance. Used by the layer pages' cards. */
const calloutFrom = (text) => {
  const t = text.replace(/\s+/g, " ").trim();
  const isM = /What it is:\s*(.+?)(?:\s*What it is for:|\s*When to use it:|$)/.exec(t);
  const forM = /What it is for:\s*(.+?)(?:\s*When to use it:|$)/.exec(t);
  let out = isM ? isM[1].trim() : t.slice(0, 180);
  if (forM) out += " " + forM[1].trim();
  if (out.length > 240) {
    const cut = out.slice(0, 240).lastIndexOf(". ");
    out = cut > 80 ? out.slice(0, cut + 1) : out.slice(0, 240).trim() + "…";
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
};



/* Label the parts of an opened wall entry, so it is obvious what each
   region is: every control chip group is captioned by what it changes
   (its aria-label — "Stack gaps", "Device width"…), the live demo is
   "Preview", and the snippet is "Code". */
function labelWallParts() {
  const mk = (text) => {
    const s = document.createElement("span");
    s.className = "part-label";
    s.textContent = text;
    return s;
  };
  const labelled = (el) => el && el.previousElementSibling
    && el.previousElementSibling.classList.contains("part-label");
  for (const fold of document.querySelectorAll("article.element")) {
    for (const chips of fold.querySelectorAll(":scope > p.chips, :scope > .entry-controls p.chips")) {
      if (labelled(chips)) continue;
      chips.before(mk(chips.getAttribute("aria-label") || "Options"));
    }
    const demo = fold.querySelector(":scope > .demo") || fold.querySelector(":scope > .device-preview");
    if (demo && !labelled(demo)) demo.before(mk("Preview"));
    // the code block may be a bare <pre> or already wrapped by
    // overlayCodeTools in a .code-wrap — label whichever is the direct
    // child, so every entry gets a "Code" heading and its gap above it.
    const code = fold.querySelector(":scope > pre, :scope > .code-wrap");
    if (code && !labelled(code)) code.before(mk("Code"));
    const notes = fold.querySelector(":scope > .ai-notes");
    if (notes && !labelled(notes)) notes.before(mk("AI instructions"));
  }
}

/* -------------------------------------------------------------------------
   BUILD-A-THEME PAGE — the theme builder and Skin Lab (build.html only).
   Each init guards on its own root element (#builder-canvas / #lab-grid),
   so both are inert on every other page.
   ------------------------------------------------------------------------- */

/* Theme builder: build on the active theme, one token category at a time
   (colors, spacing, type, shape), previewed live on a scoped canvas —
   every token is written as a custom property on #builder-canvas alone,
   so the sample layouts restyle while the rest of the page holds still.
   Colors fan out to their hover/pressed/on shades; numeric tokens ride
   the detailed slider. Density and type size are the two global scales,
   set as data attributes on the canvas. The whole build rides ?mix= so a
   link reproduces it, and the export block is the paste-ready :root
   config. Docs-only logic — the library ships facet.set for the
   whole-page version; this is a contained workspace. */
function initStyleMixer() {
  const canvas = document.querySelector("#builder-canvas");
  const exportCode = document.querySelector("#code-style-mixer code");
  if (!canvas || !exportCode || !window.facet) return;
  const root = document.documentElement;
  const pickers = [...document.querySelectorAll("#tab-colors [data-mix]")];
  const sliders = [...document.querySelectorAll(".slider-detail[data-token]")];
  const scaleChips = [...document.querySelectorAll("[data-scale-pick]")];

  const tokens = {};                // "--cssvar" -> raw value the user set
  const scales = { density: "", textSize: "" };   // the two global scales
  const isColor = (v) => /^#|^rgb|color-mix|Color$/.test(v) || v.startsWith("#");
  const sliderInit = new Map(sliders.map((s) => [s, s.querySelector(".slider-detail-number").value]));

  // A picked color fans out to its derived tokens; anything else is literal.
  const luma = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  };
  const derive = (cssVar, val) => {
    const set = { [cssVar]: val };
    if (cssVar.startsWith("--accent") && val.startsWith("#")) {
      const toward = root.dataset.mode === "dark" ? "white" : "black";
      set[`${cssVar}-hover`] = `color-mix(in srgb, ${val} 86%, ${toward})`;
      set[`${cssVar}-pressed`] = `color-mix(in srgb, ${val} 74%, ${toward})`;
      set[`--on-${cssVar.slice(2)}`] = luma(val) > 0.55 ? "#17171B" : "#FFFFFF";
    }
    return set;
  };

  // Colours resolve their live theme value so an untouched picker shows it.
  const probe = document.createElement("span");
  probe.hidden = true;
  canvas.appendChild(probe);
  const tokenHex = (cssVar) => {
    probe.style.color = `var(${cssVar})`;
    const m = getComputedStyle(probe).color.match(/\d+/g) || [0, 0, 0];
    return "#" + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
  };

  const renderExport = () => {
    const entries = Object.entries(tokens).flatMap(([k, v]) => Object.entries(derive(k, v)));
    const attrs = [scales.density && `data-density="${scales.density}"`,
                   scales.textSize && `data-text-size="${scales.textSize}"`].filter(Boolean);
    if (!entries.length && !attrs.length) {
      exportCode.textContent = "<!-- Move a control and the paste-ready config appears here. -->";
      return;
    }
    const note = attrs.length ? `<!-- on your <html>: ${attrs.join(" ")} -->\n` : "";
    const call = entries.length
      ? "<script>\n  addEventListener(\"DOMContentLoaded\", () => facet.set({\n"
        + entries.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")
        + "\n  }));\n<\/script>"
      : "";
    exportCode.textContent = note + call;
  };

  const writeUrl = () => {
    const url = new URL(location);
    if (Object.keys(tokens).length || scales.density || scales.textSize) {
      url.searchParams.set("mix", JSON.stringify({ tokens, scales }));
    } else url.searchParams.delete("mix");
    history.replaceState(null, "", url);
  };

  const setToken = (cssVar, val) => {
    tokens[cssVar] = val;
    for (const [k, v] of Object.entries(derive(cssVar, val))) canvas.style.setProperty(k, v);
  };
  const setScale = (which, value) => {
    scales[which] = value;
    const attr = which === "textSize" ? "text-size" : "density";
    if (value) canvas.setAttribute(`data-${attr}`, value);
    else canvas.removeAttribute(`data-${attr}`);
    for (const c of scaleChips) {
      if (c.dataset.scalePick === which) c.setAttribute("aria-pressed", String((c.dataset.scaleValue || "") === value));
    }
  };
  const syncColorPickers = () => {
    for (const p of pickers) p.value = tokens["--" + p.dataset.mix] || tokenHex("--" + p.dataset.mix);
  };

  // Colour pickers.
  for (const p of pickers) {
    p.addEventListener("input", () => { setToken("--" + p.dataset.mix, p.value); writeUrl(); renderExport(); });
  }

  // Font selects: each of the five roles picks a real family. "" clears
  // the override back to the theme's own face.
  const FONT_OPTIONS = [
    ["", "Theme default"],
    ['"Cormorant", Georgia, "Times New Roman", serif', "Cormorant — calligraphic serif"],
    ['"Playfair Display", Georgia, serif', "Playfair Display — didone serif"],
    ['"Newsreader", Georgia, serif', "Newsreader — editorial serif"],
    ['"Nunito Sans", system-ui, sans-serif', "Nunito Sans — rounded sans"],
    ['"JetBrains Mono", ui-monospace, monospace', "JetBrains Mono — technical mono"],
    ['system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', "System sans"],
    ['Georgia, "Times New Roman", serif', "System serif"],
    ['ui-monospace, "SF Mono", Menlo, monospace', "System mono"],
  ];
  const fontSelects = [...document.querySelectorAll("[data-mix-font]")];
  for (const sel of fontSelects) {
    for (const [val, label] of FONT_OPTIONS) {
      const o = document.createElement("option");
      o.value = val; o.textContent = label;
      sel.appendChild(o);
    }
    sel.addEventListener("change", () => {
      const cssVar = sel.dataset.mixFont;
      if (sel.value) setToken(cssVar, sel.value);
      else { delete tokens[cssVar]; canvas.style.removeProperty(cssVar); }
      writeUrl(); renderExport();
    });
  }

  // Numeric type controls (weight, line-height, tracking, measure): native
  // ranges that scale to the real token value and unit. Integer tokens
  // (scale 1) round; fractional ones (leading, tracking) keep decimals.
  const numSliders = [...document.querySelectorAll("[data-mix-num]")];
  const numInit = new Map(numSliders.map((s) => [s, s.value]));
  const numFormat = (s) => {
    const raw = parseFloat(s.value) * parseFloat(s.dataset.scale);
    const num = parseFloat(s.dataset.scale) === 1 ? Math.round(raw) : +raw.toFixed(3);
    return num + (s.dataset.unit || "");
  };
  const numReadout = (s) => { const o = s.parentElement.querySelector(".slider-out"); if (o) o.textContent = numFormat(s); };
  for (const s of numSliders) {
    numReadout(s);
    s.addEventListener("input", () => {
      setToken(s.dataset.mixNum, numFormat(s));
      numReadout(s); writeUrl(); renderExport();
    });
  }
  // Numeric detail sliders: the library wires the slider and fires
  // facet:slide; we just read the value and paint the token.
  for (const s of sliders) {
    s.addEventListener("facet:slide", (e) => {
      setToken(s.dataset.token, e.detail.value + (s.dataset.unit || ""));
      writeUrl(); renderExport();
    });
  }
  // Density / type-size scale chips (radio per group). The pressed chips
  // carry data-chip-owned in the markup so the library's bare-chip
  // self-toggle never binds to them (docs.js runs after the deferred
  // library now); stopImmediatePropagation still shields the
  // aria-pressed we set from any other listener.
  for (const c of scaleChips) {
    c.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      setScale(c.dataset.scalePick, c.dataset.scaleValue || "");
      writeUrl(); renderExport();
    });
  }

  const reset = () => {
    for (const k of Object.keys(tokens)) {
      for (const dk of Object.keys(derive(k, tokens[k]))) canvas.style.removeProperty(dk);
      delete tokens[k];
    }
    setScale("density", ""); setScale("textSize", "");
    for (const [s, val] of sliderInit) {
      s.querySelector('input[type="range"]').value = val;
      s.querySelector(".slider-detail-number").value = val;
    }
    for (const sel of fontSelects) sel.value = "";
    for (const [s, val] of numInit) { s.value = val; numReadout(s); }
    writeUrl(); renderExport(); syncColorPickers();
  };
  document.querySelector("#mixer-reset").addEventListener("click", reset);

  // A shared link opens with the build already applied.
  try {
    const saved = JSON.parse(new URLSearchParams(location.search).get("mix") || "null");
    if (saved && saved.tokens) {
      for (const [k, v] of Object.entries(saved.tokens)) {
        setToken(k, v);
        const s = sliders.find((x) => x.dataset.token === k);
        if (s) { const n = parseFloat(v); s.querySelector('input[type="range"]').value = n; s.querySelector(".slider-detail-number").value = n; }
        const fsel = fontSelects.find((x) => x.dataset.mixFont === k);
        if (fsel) fsel.value = v;
        const ns = numSliders.find((x) => x.dataset.mixNum === k);
        if (ns) { ns.value = parseFloat(v) / parseFloat(ns.dataset.scale); numReadout(ns); }
      }
      if (saved.scales) { setScale("density", saved.scales.density || ""); setScale("textSize", saved.scales.textSize || ""); }
    }
  } catch { /* malformed ?mix= — ignore */ }

  // Theme or mode switch under a build: untouched pickers re-read the new
  // theme; built tokens persist by design (a build rides on top).
  new MutationObserver(() => { syncColorPickers(); renderExport(); })
    .observe(root, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });

  renderExport();
  syncColorPickers();
}

/* Skin Lab: builds one framed mini page per theme × mode. Frames,
   not subtrees, on purpose — material themes (velvet, aero) scope
   component recipes under [data-theme], and inside one document an
   ancestor's recipes would leak into a differently-themed panel.
   Each frame is a genuine document with the two real tags, so it
   is also living proof of the one-attribute promise. */
function initSkinLab() {
  const grid = document.querySelector("#lab-grid");
  if (!grid) return;
  const THEMES = [["", "Default"], ["velvet", "Velvet"], ["aero", "Aero"], ["elegant", "Elegant"]];
  const LAYOUT = `
    <main class="container stack" style="padding: 1rem;">
      <h2 style="margin: 0;">Ledger</h2>
      <p>The same markup as every other panel — <a href="#">one attribute</a> apart.</p>
      <p style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-primary btn-small">Save</button>
        <button class="btn btn-small">Preview</button>
      </p>
      <label for="lab-amount">Amount</label>
      <input id="lab-amount" type="text" value="12,500">
      <div class="result"><span>Total</span><strong>₹ 12,500</strong></div>
    </main>`;
  for (const [theme, themeName] of THEMES) {
    for (const mode of ["light", "dark"]) {
      const cell = document.createElement("figure");
      cell.className = "lab-cell";
      const frame = document.createElement("iframe");
      frame.className = "lab-frame";
      frame.loading = "lazy";
      frame.title = `${themeName}, ${mode}`;
      frame.setAttribute("tabindex", "-1");
      frame.srcdoc = `<!doctype html>
        <html${theme ? ` data-theme="${theme}"` : ""} data-mode="${mode}">
        <head><meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="${location.origin}/lib/facet.css"></head>
        <body>${LAYOUT}</body></html>`;
      const cap = document.createElement("figcaption");
      cap.textContent = `${themeName} · ${mode}`;
      cell.append(frame, cap);
      grid.appendChild(cell);
    }
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  orderEntryParts();   // preview first, options after — the entry structure
  for (const article of document.querySelectorAll("article.element")) {
    // Hand-authored code (data-code-static, or any entry without a demo)
    // gets the same syntax coloring the serialized snippets get.
    const authored = [...article.querySelectorAll("pre[data-code-static] code")];
    if (!authored.length && !article.querySelector(".demo")) {
      const code = article.querySelector("pre code");
      if (code) authored.push(code);
    }
    for (const code of authored) {
      if (code.textContent.trim()) code.innerHTML = highlightHtml(code.textContent);
    }
    renderSnippet(article);
  }
  initChips();
  initConfigChips();
  initModePanels();
  initSetupStrip();
  initSizeBadge();
  initTokenCopy();
  initContrastBadges();
  initDemoTools();
  overlayCodeTools();              // code actions become a corner icon cluster
  initFeedbackDemo();              // the Sound & haptics wall buttons
  initFontNames();                 // the Fonts cards name the resolved face
  initBackgroundDemo();            // the Backgrounds entry: variants + knobs
  initDevicePreview();             // Layer 5 templates in scaled device frames
  initStyleMixer();                // build.html: the scoped theme builder
  initSkinLab();                   // build.html: the theme × mode gallery
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
  await initAiNotes();  // AI instructions come from llms.txt, one source
  labelWallParts();     // after the notes exist, so every entry gets its AI-instructions label
  initWallSearch();
  initSearchKeys();
  initScrollSpy();
  initLibraryPages();  // intro → layer card pages → entry pages (see the router)
});
