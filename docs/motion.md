# Motion

Every animation is built in. Nothing needs configuring; the exact physics live in the code.

## Interaction physics

- Every button presses down and springs back. [done]
- Velvet presses dent into the material. [done]
- Aero hovers brighten and glow. [done]
- Clickable cards lift on hover, press on click. [done]
- Switch knobs, check marks and chevrons move on springs. [partial: check marks are native accent-color rendering, not spring-animated; knobs and chevrons do spring]
- Sliders' thumbs grow under the pointer. [done]
- Every interaction pairs with its sound and haptic. [done]

## Overlay entrances and exits

- Modals rise in and scale up. [done]
- Drawers slide from their edge. [done]
- Popovers and menus pop in. [done]
- Sheets slide in on a spring that overshoots and settles. [done]
- The risen sheet condenses into and out of its corner button. [done]
- Toasts spring up, leave by fading down. [done]
- Tooltips fade in and settle. [done]
- The phone menu grows down while the page dims and blurs. [done]
- The corner menu's options cascade in bottom-up. [done]
- Field errors expand into place. [done]

## Navigation motion

- The tab highlight stretches between tabs: the leading edge leads, the trailing edge lags, both settle with a small overshoot. [done]
- The pager springs between screens, with elastic resistance past the edges. [done]
- View-stack screens fade and rise in. [done]
- Page-to-page navigation eases the old page away and springs the new one in. [done]
- Theme and mode switches cross-fade the whole page. [done]
- The scroll gauge's thumb slides out of its groove on overscroll. [done]

## Ambient

- Parallax: marked elements drift with device tilt, cursor, or scroll momentum. [done]
- Shine: a specular light travels across marked surfaces. [done]
- Idle life: when nothing moves, one smooth loop out of center and back, then rest. [done]
- Idle classes: a slow float, sway or pulse for resting elements. [done]
- Fluid backgrounds breathe; the aero scene has rays, bubbles and fish. [done]
- Skeletons shimmer, loading skins pulse, spinners turn. [done]

## The rules

- Three durations and three easings govern everything; the spring is a true spring curve where the browser supports it. [done]
- Color changes cross-fade by default on every element; movement never does, the springs own it. [done]
- Calm mode shortens and straightens everything. [done]
- Off mode stops everything. [done]
- The OS reduced-motion setting wins over every page choice. [done]
- Every interaction sound pairs with its motion; the sound system itself is on the Features page. [done]
- With JavaScript off, CSS motion still runs and nothing depends on the rest. [done]
