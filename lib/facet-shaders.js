/*
   Facet · facet-shaders.js — OPTIONAL WebGL shader backgrounds
   =============================================================

   True opalescent, GPU-drawn animated backgrounds — a class of material
   CSS gradients cannot reach. This whole engine is POWERED BY PAPER
   SHADERS (https://shaders.paper.design), the zero-dependency shader
   library by Paper (https://paper.design), Apache-2.0 licensed:
   https://github.com/paper-design/shaders. Facet does not host or fork
   their code — this file dynamic-imports the published package from
   esm.sh at runtime (pinned, since Paper ships breaking changes under
   0.0.x), so the shader source always comes from the original authors.
   All credit for the shader work is theirs; this file is only the
   Facet-style declarative adapter.

   USE — one extra script tag beside facet.js (optional engine, like
   gem.js; never merged into facet.js, no component requires it):

     <script src="https://facet.tanishksharma.com/lib/facet-shaders.js" defer></script>

   then declare a surface:

     <div class="bg-fixed" data-bg-shader
          data-shader-colors="#e0eaff, #241d9a, #f75092, #9f50d3"
          data-shader-speed="0.6" data-shader-distortion="0.8"
          data-shader-swirl="0.1" aria-hidden="true"></div>

   - data-bg-shader          mounts Paper's MESH GRADIENT into the element
                             (the element's own size; give it one — e.g.
                             .bg-fixed for a whole-page ground).
   - data-shader-colors      comma-separated CSS colors, up to 10
                             (default: the surface's --bg-fluid-color-1..4,
                             so it follows the same palette hooks as the
                             CSS fluid background).
   - data-shader-speed       animation speed, 0 stops it (default 0.6).
   - data-shader-distortion  organic noise 0–1 (default 0.8).
   - data-shader-swirl       vortex power 0–1 (default 0.1).

   Degrades honestly: offline, or if WebGL/esm.sh is unavailable, the
   element simply keeps whatever CSS background it already has — pair it
   with data-bg-fluid for a same-palette fallback. prefers-reduced-motion
   mounts the gradient static (speed 0). facetShaders.mount(el) mounts a
   late-added surface; every mount stores its handle on el.__facetShader
   (with .dispose()).
*/
(function () {
  'use strict';

  // Pinned on purpose: Paper ships breaking changes under 0.0.x.
  var PAPER = 'https://esm.sh/@paper-design/shaders@0.0.78';

  var reduceMotion = false;
  try { reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isNaN(v) ? fallback : v;
  }

  function colorsFor(el) {
    var raw = el.getAttribute('data-shader-colors');
    if (raw) {
      var list = raw.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
      if (list.length) return list.slice(0, 10);
    }
    // fall back to the CSS fluid background's palette hooks, so one set of
    // custom properties drives both engines
    var cs = getComputedStyle(el);
    var vars = ['--bg-fluid-color-1', '--bg-fluid-color-2', '--bg-fluid-color-3', '--bg-fluid-color-4']
      .map(function (v) { return cs.getPropertyValue(v).trim(); })
      .filter(Boolean);
    return vars.length ? vars : ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'];
  }

  function mount(el) {
    if (!el || el.__facetShader) return Promise.resolve(null);
    return import(PAPER).then(function (paper) {
      if (el.__facetShader) return null;
      var colors = colorsFor(el).map(paper.getShaderColorFromString);
      var uniforms = {
        u_colors: colors,
        u_colorsCount: colors.length,
        u_distortion: num(el, 'data-shader-distortion', 0.8),
        u_swirl: num(el, 'data-shader-swirl', 0.1),
        u_grainMixer: 0,
        u_grainOverlay: 0,
        u_fit: paper.ShaderFitOptions[paper.defaultObjectSizing.fit],
        u_rotation: 0,
        u_scale: 1,
        u_offsetX: 0,
        u_offsetY: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0,
      };
      var speed = reduceMotion ? 0 : num(el, 'data-shader-speed', 0.6);
      var handle = new paper.ShaderMount(el, paper.meshGradientFragmentShader, uniforms, undefined, speed);
      el.__facetShader = handle;
      return handle;
    }).catch(function () { return null; });   // offline / no WebGL: CSS background stays
  }

  function init() {
    var els = document.querySelectorAll('[data-bg-shader]');
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  window.facetShaders = { mount: mount };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
