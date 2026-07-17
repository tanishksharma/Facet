# Website

The site at [facet.tanishksharma.com](http://facet.tanishksharma.com) is the shop window and the documentation in one deploy. It runs on the same two files it sells: the site is the proof. This page maps the site and holds the homepage plan. [done]

## The pages

- Home. The promise and the sell; the full plan is below. [done]
- Library (library.html). Every component live on one page, behind a pinned left index. [done]
- Functions (functions.html). Every behavior: the exact attribute or call, a code example, a copy button. [done]
- Product (product.html). The build method: the four steps, the two prompt tiers, the copyable prompts. [done]
- Themes (build.html). Seven real product scenes restyled live, then Skin Lab with every theme side by side. [done]
- The files. llms.txt, [CLAUDE.md](http://CLAUDE.md), /lib/facet.css, /lib/facet.js, and the GitHub repo, all public. [done]

## Header

- The site header is the library's own top menu block: logo, Library, Functions, Product, Themes. [partial: only index.html uses the top menu block — Library, Functions, Product and Themes ship the tab-bar site chrome instead]
- The header sells too: theme, mode and language switch from it, and the whole site obeys. [partial: on tab-bar pages the switches open from the header's settings button; on index.html they live in page sections and the corner float button, not the header]

## Footer

- The library's own footer block: navigation columns, the files, GitHub. [partial: the footer block ships only on index.html — Library, Functions, Product and Themes pages end without it]
- The settings sheet rides the corner on every page: theme, appearance, motion, sound, haptics. [done]

## How the library section works

- A pinned left index groups every entry: tokens and base, layout primitives, forms, content and data, overlays, navigation, status, blocks, templates, motion and surfaces, app kit. [done]
- Click a group and it opens; click an entry and the page goes to it. [done]
- Every entry shows the live component, the copy-ready code, its options and states, and the same instructions the AI reads. [done]
- The page restyles on the spot: switch theme, mode, density or motion and every preview follows. [done]

## The homepage plan

The page is two heroes, then the proof, then the invite. Hero one sells how easy it is to use. Hero two makes the argument. The features section proves everything live. The close invites contribution. Show, never tell; every section is one of the library's own blocks, named in brackets. [partial: several named blocks — steps indicator, bento grid, rail dots, two-row chip strip, Mac-window code block — are not shipped library blocks; index.html approximates them]

**Hero 1: how you use it**

- The very first thing on the page is the one-sentence copy block with its copy button: "Use the Facet library at [facet.tanishksharma.com](http://facet.tanishksharma.com) and build me a ___." \[Hero + copy button.\] [done]
- One line under it: paste this into your AI of choice and have fun. [done]
- Three steps beneath: 1. Paste the prompt. 2. The AI guides you through the planning: what you are building and how. 3. The AI builds you a ready-to-ship product from the library's components. The full method links to Product. \[Steps indicator, three across.\] [partial: steps indicator component missing — a plain numbered list stands in]
- One line naming who this is for: vibe coders, PMs, hobby builders, anyone who wants to ship a product and does not care about the tech. [done]
- A small condensed bento quantifying what a shipped product includes: themes and dark mode, translation, print, offline install, accessibility, sound and motion, analytics, versioning. Tiny tiles, a word or two each. \[Bento grid, compact.\] [partial: bento grid component missing — a tight uniform card grid stands in; all eight tiles present]

**Hero 2: the argument**

- The claim as a display heading: now that AI writes the code, the web can get clean again. [done]
- The evidence as short cards: commented HTML anyone can read; no bloated framework shipping unreadable minified slop; the browser's own features doing the work; every screen size and browser respected; translation built in; versioning that never breaks a shipped project. \[Feature grid.\] [done]
- One quiet line beneath: no npm, no build, no framework, never minified. [done]

**The features, proven live**

- The numbers first, as live counts: how many components, how many animations, how many layouts. \[Stat row.\] [partial: stat row ships but the counts are hardcoded, not live, and count components/blocks/templates/behaviours/icons — no animations or layouts count]
- Live component wall. Mixed-size tiles of real working components: a field validating, a chart drawing, a table sorting, a slider, chat bubbles, a rating, a button that presses and ticks. Everything pressable, nothing a screenshot. \[Bento grid.\] [partial: bento grid, rating and chat-bubble components missing — a uniform card grid ships, with a feed post standing in]
- Theming, live. The four themes as a segmented control beside one small product scene; click and the whole page restyles. The dark mode toggle sits with it; the page flips. \[Split: controls one side, live scene the other.\] [partial: the theme picker is a chip row, not a segmented control]
- Translation, live. Language buttons beside the same scene, mirrored to the other side; one line: every component is already wired for translation. Demo sections alternate sides as you scroll. \[Split, mirrored.\] [done]
- Sound and motion, live. Press the buttons, hear the ticks, watch the springs; the calm and off switches sit right beside them. \[Split, alternating.\] [partial: the motion control cycles Off/Idle/responsive — no calm switch on the page, though data-motion="calm" exists in the library]
- What you can ship. Cards scrolling sideways and snapping: landing page, dashboard, pitch deck, invoice, installable app, docs site. Each card is a small live template, not an image. \[Horizontal card row + rail dots.\] [partial: rail dots component missing — the snapping card row ships without them]
- Everything it carries. The rest of the inventory compressed into chips: print, sound and haptics, offline and install, accessibility, keyboard, states, analytics, copy hygiene, works without JavaScript. Each chip links into the Library. \[Chip strip, two rows.\] [partial: chip-strip-two-rows component missing — a single wrapping chips row ships, and the analytics chip is absent]
- AI-native. llms.txt shown raw: one fetch teaches your AI everything. \[Mac-window code block.\] [partial: Mac-window code block component missing — a plain pre ships, showing only the file's opening lines]

**The close: open source**

- The invite: this library is completely open source, and the instructions for adding a component ship with it. Point your AI at them and add one; you do not need to be technical. The GitHub link. \[CTA band variant.\] [partial: the invite ships as a plain section with buttons — only the closing sentence sits in a CTA band]
- The sentence and its copy button one last time. \[CTA band.\] [done]
