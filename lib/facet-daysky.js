/*
   Facet · facet-daysky.js — OPTIONAL volumetric day-cycle background
   ==================================================================

   A raymarched cloud sky that lives through a whole day: dawn reds into
   morning and midday blues, golden hour, violet dusk and indigo night,
   with a soft arcing suggestion of sunlight by day and a hazy moon
   crossing the night. The cloud rendering is POWERED BY VANTA.JS
   (https://www.vantajs.com, MIT, by Teng Bao; the cloud shader descends
   from Inigo Quilez's raymarching work) on three.js. Facet does not host
   or fork their code — this file loads the published packages from
   jsdelivr at runtime (pinned), so the shader source always comes from
   the original authors; this file is only the Facet-style declarative
   adapter plus the day-cycle choreography (palette keyframes, the sun
   and the moon).

   USE — one extra script tag beside facet.js (optional engine, like
   gem.js and facet-shaders.js; never merged into facet.js, no component
   requires it):

     <script src="https://facet.tanishksharma.com/lib/facet-daysky.js" defer></script>

   then declare a surface (give it a size — e.g. a fixed full-page div):

     <div class="bg-fixed" data-bg-daysky aria-hidden="true"></div>

   - data-bg-daysky        mounts the day cycle at the element's own size.
   - data-daysky           "clock" (default) folds the visitor's local
                           time onto the cycle — 06:00–18:30 is the sun's
                           arc, the rest of the night the moon's pass —
                           so the page's sky matches the world's.
                           "loop" plays the whole day on a fixed loop.
   - data-daysky-loop      seconds per full day in loop mode (default 60).

   Degrades honestly: prefers-reduced-motion, no WebGL, or an unreachable
   CDN paint a still gradient of the current moment's sky instead — no
   drift, no sun, no moon. facetDaysky.mount(el) mounts a late-added
   surface; every mount stores its handle on el.__facetDaysky (with
   .dispose()).
*/
(function () {
  'use strict';

  // Pinned on purpose: the cycle is tuned against these exact builds.
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
  var VANTA_URL = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.clouds.min.js';

  var reduceMotion = false;
  try { reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ---- the day as data: palette keyframes across one cycle t in [0,1) ----
  // [t, backgroundColor, skyColor, cloudColor, cloudShadowColor,
  //     sunColor, sunGlareColor, sunlightColor]
  var KEYS = [
    [0.00, 0x2a1830, 0x351d3d, 0x54344a, 0x0a0510, 0xd94f35, 0xb83a2a, 0xd9714f],  // pre-dawn violet-red
    [0.06, 0xb0403a, 0xc23a30, 0xe8815e, 0x40101e, 0xff5a2b, 0xff3a1a, 0xff8a55],  // dawn red
    [0.14, 0xffd9b0, 0xe0825a, 0xffc9a0, 0x622a42, 0xffb055, 0xff7a22, 0xffcf88],  // sunrise rose-gold
    [0.24, 0xf2f6f8, 0x64a8d8, 0xbcd4e4, 0x1c4462, 0xffd080, 0xff9944, 0xffc98a],  // morning
    [0.34, 0xffffff, 0x68b8d7, 0xadc1de, 0x183550, 0xff9919, 0xff6633, 0xff9933],  // midday
    [0.42, 0xffc97a, 0xd9691c, 0xf0ac6e, 0x561e2e, 0xff9919, 0xff6633, 0xff9933],  // golden hour
    [0.47, 0xa864c9, 0x5c2e92, 0xc383d0, 0x220c3e, 0xff6aa8, 0xe0488a, 0xc27ad9],  // dusk purple
    [0.53, 0x101024, 0x141432, 0x3a3a62, 0x050510, 0x8a9ad9, 0x5a6ab8, 0x7a8ac9],  // nightfall
    [0.94, 0x0c0c1e, 0x10102a, 0x32325a, 0x04040e, 0x8a9ad9, 0x5a6ab8, 0x7a8ac9],  // deep night
    [1.00, 0x2a1830, 0x351d3d, 0x54344a, 0x0a0510, 0xd94f35, 0xb83a2a, 0xd9714f],  // wraps to pre-dawn
  ];

  function lerpHex(a, b, u) {
    var r = ((a >> 16) + (((b >> 16) - (a >> 16)) * u)) | 0;
    var g = (((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * u)) | 0;
    var l = ((a & 255) + (((b & 255) - (a & 255)) * u)) | 0;
    return (r << 16) | (g << 8) | l;
  }
  function paletteAt(t) {
    var i = 1;
    while (KEYS[i][0] < t) i++;
    var a = KEYS[i - 1], b = KEYS[i], u = (t - a[0]) / (b[0] - a[0]);
    var out = [];
    for (var k = 1; k <= 7; k++) out.push(lerpHex(a[k], b[k], u));
    return out;
  }
  function css(c) { return '#' + ('00000' + c.toString(16)).slice(-6); }

  // the visitor's clock, folded onto the cycle: 06:00–18:30 is the sun's
  // arc (t 0.02–0.52), 18:30 through 06:00 the moon's night (0.52–1.02)
  function clockT(d) {
    var m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    if (m >= 360 && m < 1110) return 0.02 + ((m - 360) / 750) * 0.5;
    var night = (m - 1110 + 1440) % 1440;
    return (0.52 + (night / 690) * 0.5) % 1;
  }

  // a still gradient of the moment's sky — the reduced-motion and no-WebGL body
  function staticSky(el, t) {
    var p = paletteAt(t);
    el.style.background = 'linear-gradient(' + css(p[1]) + ', ' + css(p[2]) + ')';
  }

  // ---- the runtime libraries, loaded once from the original authors ----
  var libs = null;
  function loadLibs() {
    if (libs) return libs;
    libs = new Promise(function (resolve, reject) {
      function add(url, ready, next) {
        if (ready()) return next();
        var s = document.createElement('script');
        s.src = url;
        s.onload = next;
        s.onerror = function () { reject(new Error('daysky: could not load ' + url)); };
        document.head.appendChild(s);
      }
      add(THREE_URL, function () { return !!window.THREE; }, function () {
        add(VANTA_URL, function () { return !!(window.VANTA && window.VANTA.CLOUDS); }, function () {
          resolve(window.VANTA);
        });
      });
    });
    return libs;
  }

  // one soft glowing overlay (the sun or the moon), absolutely positioned
  function overlay(el) {
    var o = document.createElement('span');
    o.setAttribute('aria-hidden', 'true');
    o.style.cssText = 'position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;z-index:1;display:none;transform:translate(-50%,-50%);';
    el.appendChild(o);
    return o;
  }

  function mount(el) {
    if (!el || el.__facetDaysky) return el ? el.__facetDaysky : null;

    var mode = (el.getAttribute('data-daysky') || 'clock').toLowerCase();
    var loopSecs = parseFloat(el.getAttribute('data-daysky-loop'));
    if (isNaN(loopSecs) || loopSecs <= 0) loopSecs = 60;

    if (reduceMotion) {
      staticSky(el, clockT(new Date()));
      el.__facetDaysky = { dispose: function () { el.style.background = ''; delete el.__facetDaysky; } };
      return el.__facetDaysky;
    }

    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var sun = overlay(el), moon = overlay(el);
    moon.style.filter = 'blur(2px)';
    moon.style.background = 'radial-gradient(circle at 38% 34%, rgb(253 254 254 / 0.95), rgb(226 235 245 / 0.8) 55%, rgb(200 214 232 / 0.45) 80%, transparent)';

    var handle = { effect: null, raf: 0, dispose: dispose };
    el.__facetDaysky = handle;

    loadLibs().then(function (VANTA) {
      if (!el.__facetDaysky) return;   // disposed while loading
      try {
        handle.effect = VANTA.CLOUDS({ el: el, mouseControls: false, touchControls: false, gyroControls: false, minHeight: 100, speed: 0.9 });
      } catch (e) { staticSky(el, clockT(new Date())); return; }
      var start = performance.now();
      var frame = function () {
        handle.raf = requestAnimationFrame(frame);
        var t = mode === 'loop'
          ? (((performance.now() - start) / 1000) % loopSecs) / loopSecs
          : clockT(new Date());
        render(t);
      };
      var render = function (t) {
        var p = paletteAt(t);
        handle.effect.setOptions({ backgroundColor: p[0], skyColor: p[1], cloudColor: p[2], cloudShadowColor: p[3], sunColor: p[4], sunGlareColor: p[5], sunlightColor: p[6] });
        var w = el.clientWidth, h = el.clientHeight;
        var size = Math.max(w, h) * 0.9;

        // the sun: a blurred wash of light arcing corner to corner, its
        // brightness riding the arc so it bleeds in low and sets out dim
        if (t > 0 && t < 0.54) {
          var u = t / 0.54;
          var arc = Math.sin(u * Math.PI);
          var edge = 1 - arc;
          var glow = Math.max(0, Math.min(1, arc * 1.5 + 0.12));
          var core = lerpHex(0xfff2cf, 0xff7a35, edge);
          var halo = lerpHex(0xffd9a0, 0xff5a2b, edge);
          sun.style.display = 'block';
          sun.style.width = sun.style.height = (size * (1 + edge * 0.3)).toFixed(0) + 'px';
          sun.style.left = (-12 + u * 124) + '%';
          sun.style.top = (50 - arc * 40) + '%';
          sun.style.opacity = glow.toFixed(3);
          sun.style.mixBlendMode = 'screen';
          sun.style.filter = 'blur(' + (size * 0.04).toFixed(0) + 'px)';
          sun.style.background = 'radial-gradient(circle, ' + css(core) + 'cc 0 7%, ' + css(halo) + '55 26%, transparent 58%)';
        } else sun.style.display = 'none';

        // the moon: a hazy disc on the opposite curve — in high from one
        // corner, dipping through the night sky, out high the other side
        if (t > 0.54 && t < 0.98) {
          var v = (t - 0.54) / 0.44;
          var dip = Math.sin(v * Math.PI);
          var mglow = Math.max(0, Math.min(1, dip * 1.5 + 0.12));
          var msize = Math.max(48, size * 0.14);
          moon.style.display = 'block';
          moon.style.width = moon.style.height = msize.toFixed(0) + 'px';
          moon.style.left = (-12 + v * 124) + '%';
          moon.style.top = (10 + dip * 34) + '%';
          moon.style.opacity = mglow.toFixed(3);
          moon.style.boxShadow = '0 0 ' + (msize * (0.5 + dip * 0.5)).toFixed(0) + 'px ' + (msize * (0.2 + dip * 0.2)).toFixed(0) + 'px rgb(220 235 255 / ' + (0.18 + dip * 0.22).toFixed(2) + ')';
        } else moon.style.display = 'none';
      };
      frame();
    }).catch(function () { if (el.__facetDaysky) staticSky(el, clockT(new Date())); });

    function dispose() {
      cancelAnimationFrame(handle.raf);
      if (handle.effect) { try { handle.effect.destroy(); } catch (e) {} }
      sun.remove();
      moon.remove();
      el.style.background = '';
      delete el.__facetDaysky;
    }
    return handle;
  }

  function init() {
    var els = document.querySelectorAll('[data-bg-daysky]');
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.facetDaysky = { mount: mount, paletteAt: paletteAt, clockT: clockT };
})();
