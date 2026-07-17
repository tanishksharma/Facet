# Themes

## The four

- Default. Cool near-white and near-black; the accent is the ink itself; hairline borders, light shadows; dark is a near-black surface ladder. [done]
- Velvet. Neumorphic matte material, one light source above, gold ink, serif display, tuned press physics. [done]
- Aero. The Frutiger Aero era: aurora ground, glass gloss, translucent plastic, bubbly pills, wet sheen on headings; dark is ocean glass. [done]
- Elegant. Roman. Cream and gold, serif display, carved elevation; dark is obsidian and gold. [done]

## Mechanics

- One attribute on html switches the theme, layout included. [done]
- Dark mode is its own attribute and composes with every theme. [done]
- Both work on any element, flipping only that subtree. [done]
- The URL carries theme, mode and language; shared links open identically. [done]
- System dark preference is honoured when the page does not choose. [done]
- The script tag boots the look before first paint; one call changes anything live, no reload. [done]
- Switcher buttons are one attribute; an empty value means Default. [done]
- A theme changes colors, faces, elevation style, scrollbars, form controls and the browser bar color. [done]
- Markup never changes between themes. [done]

## Tools

- Appearance panel. The settings sheet as a live customiser: theme, appearance, motion, sound, colors, fonts, density, width, text size, shape. [done]
- Skin Lab. Every theme, light and dark, side by side, from identical markup. [done]
- Style mixer. Restyle per token, carry it in the URL, copy the config. [done]
- Custom accent. Override one rank in one block, page-wide or per subtree. [done]
- Brand onboarding. One, two or three brand colors map onto the placement ranks; a single-color brand sets all three and lets placement carry the difference. [done]
- Community themes. Build one, submit it, a marketplace lists approved ones. [gap]
- OS accent. The system accent color as an opt-in. [partial: the --os-accent token exists dormant in facet.css; deliberately parked — no component uses it and it is not billed as a capability]
- Adaptive ink on glass is defined in Elements, decoration. [gap]
