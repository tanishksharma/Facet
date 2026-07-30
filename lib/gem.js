/*! ============================================================================
 *  gem.js — animated SVG gemstones, in one dependency-free file
 *  ---------------------------------------------------------------------------
 *  Part of the Facet library (an OPTIONAL extra engine, like facet-sw.js):
 *  load it with its own script tag next to facet.js —
 *      <script src="https://facet.tanishksharma.com/lib/gem.js" defer></script>
 *  It is fully standalone: no facet.css/facet.js required, works on any page.
 *  ---------------------------------------------------------------------------
 *  Renders a faceted gemstone as inline SVG and lights it from a single moving
 *  light source driven by the cursor (desktop) or device tilt (mobile). No
 *  build step, no dependencies, no canvas/WebGL — just SVG + a little maths.
 *
 *  The gem reproduces the four optical properties jewellers talk about:
 *    • Brilliance    — white-light return: the facets brighten/darken as the
 *                      light moves. Always on (it IS the stone).
 *    • Highlight     — the specular hot-spot. Rendered as two opposite spots
 *                      that orbit the centre as you tilt (one bright + large,
 *                      one dim + small), fading to nothing when the gem rests.
 *    • Sheen         — a soft band of reflected light that sweeps with tilt.
 *    • Scintillation — the sparkle/flash of light seen during movement.
 *                      Diamonds get more of them, a few placed BEHIND the stone,
 *                      and some tinted single solid spectral colours.
 *    • Fire          — dispersion: brief spectral colour flashes on random
 *                      facets, both front and back, but never the big central
 *                      table. Diamond-strength; opt-in on other stones.
 *    • Idle loop     — a passive "look at me": when nothing is driving the light
 *                      (parallax off, or you've simply left the page alone) the
 *                      gem traces one full circle every few seconds, as if a
 *                      wrist rotated or a cursor swept around it, then settles.
 *                      Opt-in, per gem; cancels the instant real input returns.
 *
 *  The stone is drawn in two layers — a deep pavilion (back) beneath a
 *  translucent crown (front). On tilt the two shift apart, so it reads as a
 *  3-D translucent body rather than a flat badge.
 *
 *  SCOPE: this library only RENDERS + LIGHTS gems (at whatever size their
 *  container is — small chips or big hero stones, all the same code). Page
 *  layout, click-to-expand, lightboxes/carousels, and the parallax toggle UI
 *  are the host page's job — build them around Gem.create() (see the homepage's
 *  script.js for a full example: a row of gems that open a scrollable gallery).
 *
 *  ---------------------------------------------------------------------------
 *  QUICK START — copy/paste into any HTML page
 *  ---------------------------------------------------------------------------
 *
 *    <!-- 1. Load the library (defer is fine; it self-initialises) -->
 *    <script src="gem.js" defer></script>
 *
 *    <!-- 2a. DECLARATIVE: any element with [data-gem] becomes a gem.
 *             Give it a size with CSS; the gem fills its box. -->
 *    <div data-gem="round" data-stone="diamond"
 *         style="width:160px;height:160px"></div>
 *
 *    <div data-gem="pear" data-stone="sapphire"
 *         data-effects="highlight sheen scintillation fire"
 *         style="width:200px;height:200px"></div>
 *
 *    <!-- 2b. PROGRAMMATIC: create / change / destroy from JS -->
 *    <div id="hero" style="width:280px;height:280px"></div>
 *    <script>
 *      const g = Gem.create('#hero', {
 *        shape:   'marquise',                 // see Gem.shapes for the list
 *        stone:   'amethyst',                 // see Gem.stones for the list
 *        effects: { highlight:true, sheen:true, scintillation:true, fire:false }
 *      });
 *
 *      g.toggle('fire');                      // flip one effect
 *      g.set({ stone:'ruby' });               // swap the stone (or shape)
 *      g.destroy();                           // remove it
 *    </script>
 *
 *    <!-- iOS needs a user gesture to allow motion. Call once from a tap: -->
 *    <button onclick="Gem.enableTilt()">Enable tilt</button>
 *
 *  ---------------------------------------------------------------------------
 *  OPTIONS  (Gem.create(target, options) / data-* attributes)
 *  ---------------------------------------------------------------------------
 *    shape    : string   cut outline  — data-gem="round"      (default 'round')
 *    stone    : string   colour ramp  — data-stone="ruby"     (default 'diamond')
 *    effects  : object   { highlight, sheen, scintillation, fire, idle } bools.
 *                        As an attribute, list the ON ones:
 *                        data-effects="highlight sheen idle"  (others off)
 *                        `idle` is the passive auto-loop (see Idle loop above);
 *                        off by default — turn it on for gems left to sit.
 *    ramp     : string[] optional custom 6-colour ramp, lightest → darkest,
 *                        overriding `stone`.
 *    spin     : boolean  perpetual self-rotation: the gem ignores the shared
 *                        parallax light (cursor/tilt/Gem.setParallax) and loops
 *                        its idle circle forever at full radius. For a brand
 *                        mark that must always turn (pair with effects.fire for
 *                        constant sparkle). Default false. As an attribute:
 *                        bare `data-spin` on the [data-gem] element.
 *
 *  SIZING: the gem fills its container, so size is pure CSS — e.g. a 32px chip
 *  or a 480px hero stone use the exact same call; just size the box.
 *
 *  INSTANCE METHODS
 *    .set(opts)          re-render with new shape/stone/ramp/effects
 *    .setEffects(obj)    merge effect booleans, e.g. .setEffects({fire:true})
 *    .toggle(name)       toggle one effect, returns its new boolean
 *    .destroy()          stop animating and remove the SVG
 *
 *  STATIC API
 *    Gem.create(target, options)   target = element or CSS selector
 *    Gem.scan(root?)               hydrate [data-gem] elements (auto-run once)
 *    Gem.enableTilt()              request device-motion permission (iOS) + on
 *    Gem.setParallax(on)           enable/disable motion for all gems
 *    Gem.motionLive()              is the light drivable now? (for a host toggle UI)
 *    Gem.shapes                    array of available cut names
 *    Gem.stones                    array of available stone names
 *    Gem.config                    global tuning knobs (see CONFIG below)
 *
 *  PARALLAX / PERMISSIONS
 *    The light follows the cursor (desktop) or device tilt (mobile). gem.js
 *    shares the host page's parallax setting: it reads/writes the same
 *    localStorage['parallax-enabled'] key (poll-synced), and on iOS it rides
 *    whatever device-orientation permission the page already granted — so one
 *    tap on the site's parallax toggle lights the gems too. The host owns the
 *    toggle UI; call Gem.setParallax(bool) / Gem.enableTilt() to drive it.
 *
 *  ---------------------------------------------------------------------------
 *  HOW THE LIGHTING WORKS (the 60-second tour, for anyone improving this)
 *  ---------------------------------------------------------------------------
 *  Everything is drawn in a fixed 64×64 SVG viewBox, centre = (32,32).
 *
 *  1. INPUT → a single shared light vector `(curX,curY)` in the range −1..1.
 *     We use the "baseline-drift" model: the live offset is (input − base),
 *     where `base` eases toward the latest input every frame. Hold still and
 *     base catches up, so the light returns to centre on its own (CONFIG.drift
 *     sets how fast). `cur` then lerps toward that offset for smoothing. The
 *     vector is used UN-normalised on purpose: a normalised direction snaps
 *     180° when it crosses the centre, but the raw vector glides through zero.
 *
 *  2. Each facet stores its offset (dx,dy) from centre. Its brightness is the
 *     projection of the light vector onto that offset → we pick a ramp colour
 *     by that value. Facets facing the light go light; facing away, dark.
 *
 *  3. A small STATIC up-left light is always added so a resting gem still looks
 *     cut (top-left brighter, bottom-right darker) even with no input.
 *
 *  One shared requestAnimationFrame loop advances the maths once per frame and
 *  paints every on-screen gem (off-screen ones are skipped via
 *  IntersectionObserver). prefers-reduced-motion renders a single static frame.
 *
 *  Copyright (c) 2026 Tanishk Sharma
 *  License: MIT (see LICENSE). Attribution welcome but not required.
 * ========================================================================== */
(function (global) {
  'use strict';

  /* =========================================================================
   * 1. DATA — cut outlines, stone colour ramps, fire palette, per-stone tuning
   * ========================================================================= */

  // Build a regular n-point ring (used for round/oval brilliant outlines).
  function ring(n, rx, ry, rot) {
    const pts = []; rot = rot || -Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const a = rot + i * 2 * Math.PI / n;
      pts.push([32 + rx * Math.cos(a), 32 + (ry || rx) * Math.sin(a)]);
    }
    return pts;
  }

  // Cut outlines, as polygons in the 64×64 box. Add your own here.
  const SHAPES = {
    round:    ring(14, 21),
    oval:     ring(14, 14, 22),
    octagon:  [[24,14],[40,14],[50,24],[50,40],[40,50],[24,50],[14,40],[14,24]],
    emerald:  [[19,17],[45,17],[50,22],[50,42],[45,47],[19,47],[14,42],[14,22]],
    baguette: [[26,12],[38,12],[42,16],[42,48],[38,52],[26,52],[22,48],[22,16]],
    marquise: [[32,9],[38,16],[43,24],[46,32],[43,40],[38,48],[32,55],[26,48],[21,40],[18,32],[21,24],[26,16]],
    pear:     [[32,11],[39,16],[44,24],[47,33],[46,41],[40,49],[32,53],[24,49],[18,41],[17,33],[20,24],[25,16]],
    trillion: [[28.6,18.8],[35.4,18.8],[49.6,43.2],[46.3,49],[17.7,49],[14.4,43.2]],
    hexagon:  [[26,13],[38,13],[50,32],[38,51],[26,51],[14,32]],
    cushion:  [[22,16],[42,16],[46,18],[48,22],[48,42],[46,46],[42,48],[22,48],[18,46],[16,42],[16,22],[18,18]],
    heart:    [[32,21],[39,14],[48,13],[53,23],[48,35],[32,52],[16,35],[11,23],[16,13],[25,14]],
    droplet:  [[32,8],[35,16],[41,25],[45,35],[44,44],[38,50],[32,54],[26,50],[20,44],[19,35],[23,25],[29,16]],
  };

  // Stone colour ramps: 6 colours, lightest → darkest. Brilliance picks one
  // per facet by how much it faces the light. Add your own stone here.
  const STONES = {
    diamond:     ['#ffffff','#dfeaff','#b8c8e0','#92a4bd','#71859f','#566880'],
    sapphire:    ['#7fb0ff','#4f8ae6','#2f63cf','#1f3f86','#16306f','#0d2050'],
    ruby:        ['#ff7d9c','#ef4f74','#d62456','#a8123f','#7a0d2c','#560a20'],
    emerald:     ['#5fe6b8','#23c790','#15a875','#0f7d57','#0a5a3f','#073d2b'],
    morganite:   ['#ffc4b0','#f59177','#df6a55','#c2503d','#9a3e30','#722d24'],
    topaz:       ['#ffd591','#ffb24d','#ff8c1f','#f2731a','#cc5a14','#9e440f'],
    amethyst:    ['#c9a8ff','#a06ff0','#8344d8','#6a2fb8','#4a2585','#33195e'],
    citrine:     ['#fff2b0','#ffe070','#ffcb3e','#f7b223','#d68f16','#a86c0f'],
    aquamarine:  ['#cdf6ff','#8fe6f5','#4fcfe6','#27b4cf','#1f8aa8','#155f74'],
    tanzanite:   ['#b9a6ff','#8f7bef','#6a5be0','#4f44c8','#3a3399','#272270'],
    ptourmaline: ['#ffb3da','#ff7bc0','#f24fa6','#d63f8e','#a3206a','#7a154e'],
  };

  // Spectral palette for fire (dispersion) flashes.
  const FIRE = ['#ff2a00','#ffd000','#ff0048','#0091ff','#00e6a0','#a020ff','#ff7a00','#19e6ff'];

  // Per-stone brilliance tuning. `mid` = resting ramp index (lower = brighter
  // stone), `con` = how hard the light/shade contrast swings. Falls back to
  // the defaults below for any stone not listed. `mid` sits well above the
  // ramp's middle so a RESTING stone already reads bright and saturated —
  // the animation adds shine on top; it is not what keeps the stone lit.
  const TUNE = { diamond:{mid:2.2,con:2.7}, citrine:{mid:2.1,con:2.7}, topaz:{mid:2.4,con:2.7} };
  const TUNE_DEFAULT = { mid:2.8, con:2.7 };

  /* =========================================================================
   * 2. GLOBAL TUNING  (exposed as Gem.config — tweak to taste, affects all gems)
   * ========================================================================= */
  const CONFIG = {
    drift:        0.07,   // how fast the light eases back to centre when you stop
    mouseLerp:    0.14,   // cursor smoothing  (higher = snappier, lower = floatier)
    gyroLerp:     0.20,   // device-tilt smoothing
    maxTilt:      18,     // degrees of tilt that map to full deflection
    tiltDeadzone: 2,      // degrees of tilt ignored around rest — ordinary hand
                          // tremor stays inside it, so the gem neither twitches
                          // nor drops out of its idle loop until you MEAN to move
    spotA:        16,     // orbit radius of the bright highlight (viewBox units)
    spotB:        13,     // orbit radius of the dim counter-highlight
    restLightX:  -0.7,    // static ambient direction (−x = left, −y = up)
    restLightY:  -0.7,
    restContrast: 1.6,    // strength of the resting top-left shading
    spinRate:     4.8,    // how fast scintillation flashes in/out per unit of movement
    idleEvery:    3000,   // ms of rest before a gem plays a passive idle loop
    idleStagger:  1600,   // random spread on that interval, so gems don't loop in lockstep
    idleDur:      1300,   // ms length of one passive loop (a full circle)
    idleRadius:   0.82,   // how wide the passive circle sweeps (0..1, like full tilt)
    idleRest:     0.12,   // below this live |light| the gem counts as "at rest"
  };

  /* =========================================================================
   * 3. GEOMETRY + SVG HELPERS
   * ========================================================================= */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const centroid = pts => { let x = 0, y = 0; pts.forEach(p => { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; };
  // Move points toward a centre `c` by factor `f` (0 collapses to centre, 1 = no change).
  const scaleToward = (pts, c, f) => pts.map(p => [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f]);

  // Build the cut faces (facets) for an outline. We make two rings of facets —
  // an outer crown ring and an inner ring — plus a central "table". Each facet
  // carries data-dx/dy (its offset from centre) and data-j (a tiny brightness
  // jitter) so the lighting maths can read them back later.
  function facetsSVG(pts, ramp) {
    const c = centroid(pts);
    const inner = scaleToward(pts, c, 0.66);   // crown/inner ring vertices
    const table = scaleToward(pts, c, 0.4);    // flat top
    let s = `<polygon points="${fmt(pts)}" fill="${ramp[ramp.length - 1]}"/>`;
    const facet = (quad, seed) => {
      const fc = centroid(quad);
      const j = ((seed * 5) % 3) - 1;          // −1 / 0 / +1 jitter
      s += `<polygon class="gem-facet" data-dx="${(fc[0]-32).toFixed(2)}" data-dy="${(fc[1]-32).toFixed(2)}" data-j="${j}" points="${fmt(quad)}" fill="${ramp[4]}"/>`;
    };
    for (let i = 0; i < pts.length; i++) { const j = (i + 1) % pts.length; facet([pts[i], pts[j], inner[j], inner[i]], i); }
    for (let i = 0; i < pts.length; i++) { const j = (i + 1) % pts.length; facet([inner[i], inner[j], table[j], table[i]], i + 2); }
    const fc = centroid(table);
    s += `<polygon class="gem-facet" data-table="1" data-dx="${(fc[0]-32).toFixed(2)}" data-dy="${(fc[1]-32).toFixed(2)}" data-j="0" points="${fmt(table)}" fill="${ramp[3]}"/>`;
    // hairline edges from each outer vertex to the table, for a cut look
    s += `<g fill="none" stroke="rgba(0,0,0,.16)" stroke-width="0.35">`;
    for (let i = 0; i < pts.length; i++) s += `<line x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${table[i][0].toFixed(1)}" y2="${table[i][1].toFixed(1)}"/>`;
    s += `</g>`;
    return s;
  }

  // Build the BACK layer — the pavilion, as seen through the stone. Its facets
  // are triangles radiating from the girdle to the culet (centre point), a
  // different pattern from the crown. Drawn full-opacity and deep underneath the
  // translucent crown, so tilting reveals it and the stone reads as 3-D.
  function pavilionSVG(pts, ramp) {
    const c = centroid(pts), N = pts.length;
    // Inner ring sits at the GIRDLE-EDGE MIDPOINTS (not the vertices), so the
    // pavilion's seams are offset half a facet from the crown's — a different,
    // interlocking pattern. Three facet bands tile girdle → inner ring → culet.
    const inner = pts.map((p, i) => {
      const q = pts[(i + 1) % N], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      return [c[0] + (mx - c[0]) * 0.52, c[1] + (my - c[1]) * 0.52];
    });
    let s = '';
    const bf = quad => { const fc = centroid(quad); s += `<polygon class="gem-bfacet" data-dx="${(fc[0]-32).toFixed(2)}" data-dy="${(fc[1]-32).toFixed(2)}" points="${fmt(quad)}" fill="${ramp[4]}"/>`; };
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; bf([pts[i], pts[j], inner[i]]); }                 // pavilion mains (under each edge)
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; bf([pts[j], inner[i], inner[j]]); }               // break facets (under each vertex)
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; bf([inner[i], inner[j], [c[0], c[1]]]); }          // culet fan
    s += `<g fill="none" stroke="rgba(0,0,0,.16)" stroke-width="0.3">`;                                     // ribs to the culet
    for (let i = 0; i < N; i++) s += `<line x1="${inner[i][0].toFixed(1)}" y1="${inner[i][1].toFixed(1)}" x2="${c[0].toFixed(1)}" y2="${c[1].toFixed(1)}"/>`;
    s += `</g>`;
    return s;
  }

  // A small four-point star (sharp points, tiny body) used for scintillation.
  const STAR = '0,-6.6 0.65,-0.65 6.6,0 0.65,0.65 0,6.6 -0.65,0.65 -6.6,0 -0.65,-0.65';

  let _uid = 0;  // unique suffix so every gem's <defs> ids stay distinct on a page

  // Scintilla seed points: [x, y, layer] where layer 0 = in front of the gem,
  // 1 = behind it (placed near/over the girdle so they peek out from behind).
  // Diamonds get more of them; the rest get a handful.
  // Layer-1 (behind) stars sit just inside the girdle so most is hidden by the
  // body and only the outer points peek out past the edge — that peek is what
  // sells the depth, so they are also made bigger (see starSVG).
  const SCINTILLAS = {
    diamond: [[30,22,0],[41,33,0],[31,43,0],[23,33,0],[34,30,0],[20,20,1],[44,20,1],[20,44,1],[44,44,1]],
    plain:   [[28,26,0],[40,40,0],[21,21,1],[45,45,1]],
  };
  // Build one star <polygon>. Every star gets a different size; behind-stars are
  // larger so their peek reads. On diamonds every 3rd star is a single solid
  // spectral colour (a distinct colour per star). All stones share one speed.
  function starSVG(spot, i, isDiamond) {
    const [x, y, behind] = spot;
    const ph = ((i * 0.41) % 1).toFixed(2);
    const sp = (0.55 + (i % 3) * 0.12).toFixed(2);
    let size = 0.55 + ((i * 37) % 100) / 100 * 0.7;     // varied per star (~0.55–1.25)
    if (behind) size *= 1.5;                            // bigger so it peeks from behind
    const fill = (isDiamond && i % 3 === 0) ? FIRE[(i * 3) % FIRE.length] : '#fff';
    return `<polygon class="gem-scintilla" data-x="${x}" data-y="${y}" data-ph="${ph}" data-sp="${sp}" data-size="${size.toFixed(2)}" points="${STAR}" fill="${fill}" opacity="0"/>`;
  }

  // Assemble one complete gem SVG. Every effect layer is always present in the
  // DOM; effects are shown/hidden per frame by the painters, not rebuilt.
  function buildSVG(uid, pts, ramp, stone) {
    const isDiamond = stone === 'diamond';
    const spots = isDiamond ? SCINTILLAS.diamond : SCINTILLAS.plain;
    let backStars = '', frontStars = '';
    spots.forEach((spot, i) => { (spot[2] ? (backStars += starSVG(spot, i, isDiamond)) : (frontStars += starSVG(spot, i, isDiamond))); });
    return `<svg viewBox="0 0 64 64" width="100%" height="100%" style="overflow:visible;display:block" aria-hidden="true"><defs>
        <clipPath id="gclip${uid}"><polygon points="${fmt(pts)}"/></clipPath>
        <radialGradient id="gglow${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff" stop-opacity=".98"/><stop offset="32%" stop-color="#fff" stop-opacity=".55"/>
          <stop offset="68%" stop-color="#fff" stop-opacity=".14"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="gglowA${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="45%" stop-color="#fff" stop-opacity=".18"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="gsheen${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity=".78"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g class="gem-scints-back">${backStars}</g>
      <g clip-path="url(#gclip${uid})">
        <polygon points="${fmt(pts)}" fill="${ramp[ramp.length - 1]}"/>
        <g class="gem-back">${pavilionSVG(pts, ramp)}</g>
        <g class="gem-front" opacity="0.6">${facetsSVG(pts, ramp)}</g>
        <rect class="gem-sheen" x="14" y="-26" width="12" height="116" fill="url(#gsheen${uid})" transform="rotate(-28 32 32)" opacity="0"/>
        <g class="gem-highlight" style="mix-blend-mode:screen">
          <circle class="gem-glowB" cx="32" cy="32" r="11" fill="url(#gglow${uid})" opacity="0"/>
          <circle class="gem-coreB" cx="32" cy="32" r="2"  fill="#fff" opacity="0"/>
          <circle class="gem-glowA" cx="32" cy="32" r="29" fill="url(#gglowA${uid})" opacity="0"/>
        </g>
      </g>
      <g class="gem-scintillas">${frontStars}</g>
    </svg>`;
  }

  /* =========================================================================
   * 4. THE SHARED LIGHT + PARALLAX ENGINE
   *    One input model, one rAF loop, painting every registered gem.
   * ========================================================================= */

  // Live light state, shared by all gems (one light source / one device tilt).
  let curX = 0, curY = 0;   // smoothed light vector, −1..1 (also: how far off-centre)
  let move = 0;             // |light vector| — used as "how much is happening"
  let spin = 0;             // accumulates with movement; drives scintillation twirl
  let lastTs = 0;

  // Raw input + its drifting baseline (see "baseline-drift" in the header).
  let inMX = 0, inMY = 0, baseMX = 0, baseMY = 0;     // mouse, viewport-relative −1..1
  let inG = 0, inB = 0, baseG = null, baseB = null;   // gyro gamma/beta degrees
  let mode = 'mouse';                                 // flips to 'gyro' once tilt arrives

  const registry = [];          // every live Gem instance
  let looping = false;
  let inputBound = false;

  const reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Parallax permission, shared with the host page ------------------------
  // We mirror the site's own toggle via localStorage['parallax-enabled'] (the
  // exact key script.js uses), so turning the site's parallax on/off also
  // controls the gems — no extra wiring needed. On iOS the device-orientation
  // permission is page-wide: whoever requests it first (the site's toggle OR
  // Gem.enableTilt) lights up everyone.
  const PARALLAX_KEY = 'parallax-enabled';
  const finePointer = !!(global.matchMedia && global.matchMedia('(pointer:fine)').matches);
  let tiltActive = false;       // true once any deviceorientation event arrives
  let pollAcc = 0;              // throttles the localStorage poll in the loop
  function readParallaxPref() { try { return localStorage.getItem(PARALLAX_KEY) !== 'false'; } catch (e) { return true; } }
  function writeParallaxPref(v) { try { localStorage.setItem(PARALLAX_KEY, String(v)); } catch (e) {} }
  let parallaxOn = readParallaxPref();
  // Is the light actually drivable right now? (cursor on desktop, or granted tilt)
  function motionLive() { return parallaxOn && (finePointer || tiltActive); }

  function bindInput() {
    if (inputBound) return; inputBound = true;
    global.addEventListener('mousemove', e => {
      inMX = clamp((e.clientX - global.innerWidth / 2) / (global.innerWidth / 2), -1, 1);
      inMY = clamp((e.clientY - global.innerHeight / 2) / (global.innerHeight / 2), -1, 1);
    });
    // Attach unconditionally. On iOS it stays silent until the permission is
    // granted — by the host site's parallax toggle OR by Gem.enableTilt() — and
    // then this same listener starts firing (one shared, page-wide grant).
    if (typeof DeviceOrientationEvent !== 'undefined') global.addEventListener('deviceorientation', onOrient, true);
  }
  function onOrient(e) {
    if (e.gamma == null) return;
    mode = 'gyro'; inG = e.gamma || 0; inB = e.beta || 0;
    tiltActive = true;   // motion is live
  }

  // Advance the shared light vector one frame.
  function stepParallax() {
    if (mode === 'gyro') {
      if (baseG === null) { baseG = inG; baseB = inB; }
      baseG += (inG - baseG) * CONFIG.drift; baseB += (inB - baseB) * CONFIG.drift;
      // Dead-zone: offsets inside tiltDeadzone read as zero, and the response
      // is rescaled from the zone's edge so crossing it doesn't jump.
      const dgx = inG - baseG, dgy = inB - baseB;
      const dz = CONFIG.tiltDeadzone, mag = Math.hypot(dgx, dgy);
      const k = mag > dz ? (mag - dz) / mag : 0;
      const gx = clamp(dgx * k / Math.max(CONFIG.maxTilt - dz, 1), -1, 1);
      const gy = clamp(dgy * k / Math.max(CONFIG.maxTilt - dz, 1), -1, 1);
      curX += (gx - curX) * CONFIG.gyroLerp; curY += (gy - curY) * CONFIG.gyroLerp;
    } else {
      baseMX += (inMX - baseMX) * CONFIG.drift; baseMY += (inMY - baseMY) * CONFIG.drift;
      curX += ((inMX - baseMX) - curX) * CONFIG.mouseLerp;
      curY += ((inMY - baseMY) - curY) * CONFIG.mouseLerp;
    }
  }

  // ---- painters: each reads the shared light state + the gem's own fields ----

  // Brilliance: pick a ramp colour per facet from how much it faces the light.
  function paintBrilliance(g) {
    const ramp = g.ramp, n = ramp.length, contrast = g.con * 1.5 + move * 2.2, fmap = g.fireMap;
    g.facets.forEach((f, i) => {
      if (fmap && fmap[i]) { f.el.setAttribute('fill', fmap[i]); f.last = -99; return; } // fire overrides
      const dl = Math.hypot(f.dx, f.dy) || 1;
      const rest  = (f.dx * CONFIG.restLightX + f.dy * CONFIG.restLightY) / dl;   // static up-left ambient
      const aA    = (f.dx * curX + f.dy * curY) / dl;                             // toward bright spot A
      const lobes = Math.max(aA, 0) * 1.0 + Math.max(-aA, 0) * 0.5;               // A side strong, B side soft
      const depth = clamp((11 - dl) / 11, -1, 1) * 0.7;                           // table (centre) reads brighter
      const idx = clamp(Math.round(g.mid - rest * CONFIG.restContrast - lobes * contrast - depth + f.j), 0, n - 1);
      if (idx !== f.last) { f.el.setAttribute('fill', ramp[idx]); f.last = idx; }
    });
  }

  // Back layer (pavilion): shaded deeper than the crown so it reads as the dark
  // underside seen through the translucent top.
  function paintBack(g) {
    const ramp = g.ramp, n = ramp.length, contrast = g.con * 1.1 + move * 1.4, fmap = g.backFireMap;
    g.backFacets.forEach((f, i) => {
      if (fmap && fmap[i]) { f.el.setAttribute('fill', fmap[i]); f.last = -99; return; }   // fire shows through the back too
      const dl = Math.hypot(f.dx, f.dy) || 1;
      const aA = (f.dx * curX + f.dy * curY) / dl;
      const edge = clamp((dl - 5) / 16, 0, 1) * 1.4;                        // darker toward the girdle → a 3-D bowl
      const idx = clamp(Math.round(g.mid + 1.0 + edge - aA * contrast), 0, n - 1);
      if (idx !== f.last) { f.el.setAttribute('fill', ramp[idx]); f.last = idx; }
    });
  }

  // Depth parallax: shift the crown and pavilion in opposite directions on tilt
  // so the translucent top appears to float above the back — a 3-D thickness.
  function paintDepth(g) {
    if (g.frontEl) g.frontEl.setAttribute('transform', `translate(${(curX * 2.8).toFixed(2)} ${(curY * 2.8).toFixed(2)})`);
    if (g.backEl)  g.backEl.setAttribute('transform',  `translate(${(-curX * 1.4).toFixed(2)} ${(-curY * 1.4).toFixed(2)})`);
  }

  // Highlight: two opposite spots that orbit the centre and fade out at rest.
  // Spot A is a big, fully diffused soft glow (no hard core); spot B is the
  // small, crisp counter-glint.
  function paintHighlight(g) {
    const ax = clamp(32 + curX * CONFIG.spotA, 8, 56), ay = clamp(32 + curY * CONFIG.spotA, 8, 56);
    const bx = clamp(32 - curX * CONFIG.spotB, 8, 56), by = clamp(32 - curY * CONFIG.spotB, 8, 56);
    setSpot(g.glowA, ax, ay, clamp(move * 1.1, 0, 0.62));
    setSpot(g.glowB, bx, by, clamp(move * 0.85, 0, 0.55));
    setSpot(g.coreB, bx, by, clamp(move * 1.1, 0, 0.72));
  }
  function setSpot(el, cx, cy, op) {
    el.setAttribute('cx', cx.toFixed(1)); el.setAttribute('cy', cy.toFixed(1));
    el.setAttribute('opacity', op.toFixed(2));
  }

  // Sheen: a soft band that slides with horizontal tilt, brightest at the
  // extremes, invisible at rest. Purely tilt-driven.
  function paintSheen(g) {
    g.sheen.setAttribute('x', (14 + curX * 26).toFixed(1));
    g.sheen.setAttribute('opacity', clamp(move * 0.85, 0, 0.72).toFixed(2));
  }

  // Scintillation: little stars pop only while moving; they freeze + fade when
  // still. `spin` only advances with movement, so the twirl tracks motion.
  function paintScintillation(g) {
    const gate = clamp(move * 2.4, 0, 1);
    g.scintillas.forEach(s => {
      const prog = ((spin * s.sp) + s.ph) % 1;
      let v = 0; if (prog < 0.5) { const u = prog / 0.5; v = Math.pow(Math.sin(u * Math.PI), 1.5); }
      s.el.setAttribute('transform', `translate(${s.x} ${s.y}) scale(${((0.08 + v * 0.95) * s.size).toFixed(2)})`);
      s.el.setAttribute('opacity', (v * gate).toFixed(2));
    });
  }

  // Fire (dispersion): movement-gated spectral flashes on random facets.
  // Builds a {facetIndex: colour} map that paintBrilliance reads as an override.
  function paintFire(g) {
    // expire flashes; reset whichever facet (front or back) they were on
    g.fires = g.fires.filter(f => { f.life--; if (f.life <= 0) { (f.back ? g.backFacets : g.facets)[f.fi].last = -2; return false; } return true; });
    // Tie the number of live flashes to `move` the SAME way the facets' contrast
    // is — so colour appears the instant the light moves and thickens as it moves
    // faster, instead of trickling in via one rare dice-roll a frame. We fill
    // TOWARD that target (a few per frame so a fast flick can't strobe); the
    // short life then keeps each flash turning over with the cursor rather than
    // freezing on a facet for a quarter-second while the rest of the gem flows.
    const maxFires = g.isDiamond ? 7 : 3;
    const want = Math.min(maxFires, Math.round(move * (g.isDiamond ? 9 : 4)));
    for (let budget = 3; g.fires.length < want && budget-- > 0;) {
      const back = Math.random() < 0.4;                       // ~40% of flashes land behind the gem
      const arr = back ? g.backFacets : g.facets;
      let fi = Math.floor(Math.random() * arr.length);
      if (!back) { let guard = 0; while (arr[fi].noFire && guard++ < 6) fi = Math.floor(Math.random() * arr.length); }  // skip the table
      if (!arr[fi] || arr[fi].noFire) break;
      g.fires.push({ back, fi, life: 5 + Math.floor(Math.random() * 6), color: FIRE[Math.floor(Math.random() * FIRE.length)] });
    }
    const fm = {}, bm = {};
    g.fires.forEach(f => { if (f.back) bm[f.fi] = f.color; else fm[f.fi] = f.color; });
    g.fireMap = fm; g.backFireMap = bm;
  }

  // Idle loop: a passive "look at me" for gems nobody is touching. When no live
  // input is driving the shared light (parallax off, or the page just left
  // alone) an opted-in gem privately traces one full circle every few seconds —
  // as if a wrist rotated or a cursor swept around it — then settles.
  //
  // Why it lives on the gem (g.idle*) and not the shared light: the engine has
  // ONE light for the whole page, so driving it here would loop every gem in
  // lockstep. Instead each gem advances its own circle and paintGem swaps it in
  // for that gem's paint only. We gate on the real shared `move` (not a flag) so
  // ANY genuine input — cursor, tilt, even another effect — instantly wins and
  // the loop yields; there is no toggle to fight.
  function stepIdle(g, dt) {
    if (reduceMotion) { g._idleOn = false; return; }
    // A `spin` gem loops forever at full radius, ignoring the shared input
    // entirely — no rest gate, no easing envelope, no settle. It just turns.
    if (g._spin) {
      g._idleOn = true;
      g._idleP = (g._idleP + dt / CONFIG.idleDur) % 1;
      const a = g._idleDir * g._idleP * Math.PI * 2 + g._idlePhase;
      g.idleX = Math.cos(a) * CONFIG.idleRadius;
      g.idleY = Math.sin(a) * CONFIG.idleRadius;
      g.idleMove = clamp(Math.hypot(g.idleX, g.idleY), 0, 1);
      g.idleSpin += g.idleMove * dt / 1000 * CONFIG.spinRate;
      return;
    }
    if (!g.fx.idle) { g._idleOn = false; return; }
    if (move >= CONFIG.idleRest) {                 // real input is live → stand down and re-arm the timer
      g._idleOn = false; g._idleWait = 0; g._idleP = 0; return;
    }
    if (g._idleOn) {
      g._idleP += dt / CONFIG.idleDur;             // 0→1 over one loop
      if (g._idleP >= 1) { g._idleOn = false; g._idleP = 0; g._idleWait = 0; return; }
      // One revolution (angle) under a sin envelope (radius): the envelope is 0
      // at both ends, so the light starts and finishes at dead centre — the gem
      // eases out into the circle and back with no visible jump in or out. A
      // per-gem phase + direction (set in build) desync a row so it reads organic.
      const a = g._idleDir * g._idleP * Math.PI * 2 + g._idlePhase;
      const env = Math.sin(g._idleP * Math.PI) * CONFIG.idleRadius;
      g.idleX = Math.cos(a) * env; g.idleY = Math.sin(a) * env;
      g.idleMove = clamp(Math.hypot(g.idleX, g.idleY), 0, 1);
      g.idleSpin += g.idleMove * dt / 1000 * CONFIG.spinRate;   // own spin clock so scintillation twirls during the loop
    } else if ((g._idleWait += dt) >= g._idleEvery) {           // enough rest has passed → start a loop
      g._idleOn = true; g._idleP = 0;
    }
  }

  // Paint one gem for this frame, honouring its effect toggles.
  function paintGem(g) {
    // While idling, borrow the shared light vector for this gem's private circle,
    // then restore it (below) so the next gem and the engine see the real light.
    let sx, sy, sm, ss;
    if (g._idleOn) {
      sx = curX; sy = curY; sm = move; ss = spin;
      curX = g.idleX; curY = g.idleY; move = g.idleMove; spin = g.idleSpin;
    }
    if (g.fx.fire) paintFire(g); else if (g.fireMap || g.backFireMap) { g.fireMap = null; g.backFireMap = null; g.fires = []; g.facets.forEach(f => f.last = -1); g.backFacets.forEach(f => f.last = -1); }
    paintBack(g);
    paintBrilliance(g);
    paintDepth(g);
    if (g.fx.highlight) paintHighlight(g); else hideHighlight(g);
    if (g.fx.sheen) paintSheen(g); else g.sheen.setAttribute('opacity', '0');
    if (g.fx.scintillation) paintScintillation(g); else g.scintillas.forEach(s => s.el.setAttribute('opacity', '0'));
    if (g._idleOn) { curX = sx; curY = sy; move = sm; spin = ss; }   // hand the shared light back untouched
  }
  function hideHighlight(g) { [g.glowA, g.glowB, g.coreB].forEach(e => e.setAttribute('opacity', '0')); }

  // The single shared animation loop.
  function loop(ts) {
    const dt = lastTs ? Math.min(50, ts - lastTs) : 16; lastTs = ts;
    // Poll the shared parallax preference a couple of times a second so the
    // site's toggle (which writes the same key) turns the gems on/off too.
    if ((pollAcc += dt) > 450) { pollAcc = 0; parallaxOn = readParallaxPref(); }   // sync with the host's parallax toggle
    if (parallaxOn) stepParallax(); else { curX *= 0.85; curY *= 0.85; }            // freeze toward centre when off
    move = clamp(Math.hypot(curX, curY), 0, 1);
    spin += move * dt / 1000 * CONFIG.spinRate;
    for (let i = 0; i < registry.length; i++) if (registry[i]._onScreen) { stepIdle(registry[i], dt); paintGem(registry[i]); }
    if (registry.length) global.requestAnimationFrame(loop); else looping = false;
  }
  function ensureLoop() { if (!looping && registry.length) { looping = true; lastTs = 0; global.requestAnimationFrame(loop); } }

  // Skip painting gems scrolled out of view (cheap when many are on a page).
  const io = ('IntersectionObserver' in global)
    ? new IntersectionObserver(entries => entries.forEach(e => { if (e.target._gem) e.target._gem._onScreen = e.isIntersecting; }),
        { rootMargin: '40px' })
    : null;

  /* =========================================================================
   * 5. THE GEM INSTANCE
   * ========================================================================= */
  function Gem(el, options) {
    this.el = el;
    el._gem = this;
    this._onScreen = true;
    this.build(options || {});
    bindInput();
    registry.push(this);
    if (io) io.observe(el);
    if (reduceMotion) { move = 0; paintGem(this); } else ensureLoop();
  }

  // (Re)build the SVG and cache references the painters need.
  Gem.prototype.build = function (options) {
    const o = Object.assign({}, this.opts, options);
    this.opts = o;
    const shape = SHAPES[o.shape] ? o.shape : 'round';
    const ramp = Array.isArray(o.ramp) ? o.ramp : (STONES[o.stone] || STONES.diamond);
    const tune = TUNE[o.stone] || TUNE_DEFAULT;
    const uid = ++_uid;

    this.el.innerHTML = buildSVG(uid, SHAPES[shape], ramp, o.stone);
    const q = sel => this.el.querySelector(sel);
    this.ramp = ramp; this.mid = tune.mid; this.con = tune.con;
    this.facets = [...this.el.querySelectorAll('.gem-facet')].map(f => ({
      el: f, dx: +f.dataset.dx || 0, dy: +f.dataset.dy || 0, j: (+f.dataset.j || 0) * 0.6, last: -1,
      noFire: f.dataset.table === '1',   // the table is the biggest facet — never flash it
    }));
    this.backFacets = [...this.el.querySelectorAll('.gem-bfacet')].map(f => ({
      el: f, dx: +f.dataset.dx || 0, dy: +f.dataset.dy || 0, last: -1,
    }));
    this.scintillas = [...this.el.querySelectorAll('.gem-scintilla')].map(s => ({
      el: s, x: +s.dataset.x, y: +s.dataset.y, ph: +s.dataset.ph, sp: +s.dataset.sp, size: +s.dataset.size || 1,
    }));
    this.frontEl = q('.gem-front'); this.backEl = q('.gem-back');
    this.glowA = q('.gem-glowA');
    this.glowB = q('.gem-glowB'); this.coreB = q('.gem-coreB');
    this.sheen = q('.gem-sheen');
    this.isDiamond = (o.stone === 'diamond');   // diamonds disperse more → more fire
    this.fires = []; this.fireMap = null; this.backFireMap = null;

    // Passive idle-loop state (see stepIdle). Seeded once and guarded by the
    // null check so .set() (re-render with new stone/effects) keeps the running
    // clock instead of snapping the gem back to the start. Phase/direction/first
    // wait are randomised so a row of gems never loops in unison.
    if (this._idleEvery == null) {
      this._idleEvery = CONFIG.idleEvery + Math.random() * CONFIG.idleStagger;  // this gem's rest interval
      this._idlePhase = Math.random() * Math.PI * 2;        // where on the circle it starts
      this._idleDir = Math.random() < 0.5 ? 1 : -1;         // clockwise or anti-clockwise
      this._idleWait = Math.random() * CONFIG.idleStagger;  // offset the first loop so they don't all fire at once
      this._idleP = 0; this._idleOn = false;
      this.idleX = 0; this.idleY = 0; this.idleMove = 0; this.idleSpin = 0;
    }

    // Effect toggles. As an attribute this comes from the caller already parsed.
    const def = { highlight: true, sheen: true, scintillation: true, fire: false, idle: false };
    this.fx = Object.assign(def, this.fx, o.effects);

    // `spin`: a gem that IGNORES the shared parallax light and instead loops
    // its idle circle forever at a constant radius — a perpetual, self-driven
    // rotation independent of cursor/tilt and of Gem.setParallax(). Use it for
    // a brand mark that must always turn (and, with fire on, always sparkle),
    // whatever the rest of the page's gems are doing. Off by default.
    if (o.spin != null) this._spin = !!o.spin;
    if (this._spin) this.fx.idle = true;

    if (reduceMotion) { move = 0; paintGem(this); }
    return this;
  };

  Gem.prototype.set = function (options) { return this.build(options); };
  Gem.prototype.setEffects = function (obj) { Object.assign(this.fx, obj); return this; };
  Gem.prototype.toggle = function (name) { this.fx[name] = !this.fx[name]; return this.fx[name]; };
  Gem.prototype.destroy = function () {
    const i = registry.indexOf(this); if (i >= 0) registry.splice(i, 1);
    if (io) io.unobserve(this.el);
    this.el.innerHTML = ''; this.el._gem = null;
  };

  /* =========================================================================
   * 6. PUBLIC API + AUTO-INIT
   * ========================================================================= */

  // Parse a [data-gem] element's attributes into an options object.
  function optsFromEl(el) {
    const o = { shape: el.dataset.gem || 'round', stone: el.dataset.stone || 'diamond' };
    if (el.dataset.spin != null) o.spin = true;
    if (el.dataset.effects != null) {
      const on = el.dataset.effects.split(/[\s,]+/).filter(Boolean);
      o.effects = { highlight: false, sheen: false, scintillation: false, fire: false, idle: false };
      on.forEach(name => { if (name in o.effects) o.effects[name] = true; });
    }
    return o;
  }

  const API = {
    /** Create a gem in `target` (an element or CSS selector). */
    create(target, options) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) throw new Error('Gem.create: target not found — ' + target);
      return el._gem ? el._gem.set(options || {}) : new Gem(el, options);
    },
    /** Hydrate every [data-gem] element under `root` (defaults to document). */
    scan(root) {
      (root || document).querySelectorAll('[data-gem]').forEach(el => {
        if (!el._gem) new Gem(el, optsFromEl(el));
      });
    },
    /** Request device-motion permission (iOS) + turn parallax on. Call from a
     *  user gesture. Resolves to the permission state string. */
    enableTilt() {
      const D = global.DeviceOrientationEvent;
      const on = () => { parallaxOn = true; writeParallaxPref(true); };
      if (D && typeof D.requestPermission === 'function') {
        return D.requestPermission().then(s => {
          if (s === 'granted') { global.addEventListener('deviceorientation', onOrient, true); on(); }
          return s;
        }).catch(() => 'denied');
      }
      if (D) global.addEventListener('deviceorientation', onOrient, true);
      on();
      return Promise.resolve('granted');
    },
    /** Enable/disable motion globally (mirrors the host site's parallax toggle). */
    setParallax(state) { parallaxOn = !!state; writeParallaxPref(parallaxOn); return parallaxOn; },
    /** True when the light can actually move now (cursor on desktop, or granted
     *  tilt on mobile) AND parallax is on — handy for a host parallax toggle UI. */
    motionLive() { return motionLive(); },
    /** The live shared light vector { x, y } (−1..1) and its magnitude `move`.
     *  Lets the host react to the light too (e.g. a shadow that tracks the tilt). */
    light() { return { x: curX, y: curY, move: move }; },
    config: CONFIG,
    get shapes() { return Object.keys(SHAPES); },
    get stones() { return Object.keys(STONES); },
  };

  global.Gem = API;

  // Auto-init declared gems as soon as the DOM is ready.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => API.scan());
  else API.scan();

})(typeof window !== 'undefined' ? window : this);
