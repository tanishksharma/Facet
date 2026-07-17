# Motion

Every animation is built in. Nothing needs configuring; the exact physics live in the code.

## Interaction physics

- Every button presses down and springs back.
- Velvet presses dent into the material.
- Aero hovers brighten and glow.
- Clickable cards lift on hover, press on click.
- Switch knobs, check marks and chevrons move on springs.
- Sliders' thumbs grow under the pointer.
- Every interaction pairs with its sound and haptic.

## Overlay entrances and exits

- Modals rise in and scale up.
- Drawers slide from their edge.
- Popovers and menus pop in.
- Sheets slide in on a spring that overshoots and settles.
- The risen sheet condenses into and out of its corner button.
- Toasts spring up, leave by fading down.
- Tooltips fade in and settle.
- The phone menu grows down while the page dims and blurs.
- The corner menu's options cascade in bottom-up.
- Field errors expand into place.

## Navigation motion

- The tab highlight stretches between tabs: the leading edge leads, the trailing edge lags, both settle with a small overshoot.
- The pager springs between screens, with elastic resistance past the edges.
- View-stack screens fade and rise in.
- Page-to-page navigation eases the old page away and springs the new one in.
- Theme and mode switches cross-fade the whole page.
- The scroll gauge's thumb slides out of its groove on overscroll.

## Ambient

- Parallax: marked elements drift with device tilt, cursor, or scroll momentum.
- Shine: a specular light travels across marked surfaces.
- Idle life: when nothing moves, one smooth loop out of center and back, then rest.
- Idle classes: a slow float, sway or pulse for resting elements.
- Fluid backgrounds breathe; the aero scene has rays, bubbles and fish.
- Skeletons shimmer, loading skins pulse, spinners turn.

## The rules

- Three durations and three easings govern everything; the spring is a true spring curve where the browser supports it.
- Color changes cross-fade by default on every element; movement never does, the springs own it.
- Calm mode shortens and straightens everything.
- Off mode stops everything.
- The OS reduced-motion setting wins over every page choice.
- Every interaction sound pairs with its motion; the sound system itself is on the Features page.
- With JavaScript off, CSS motion still runs and nothing depends on the rest.
