# AI-native

Every part of the library ships with its own instructions. You point an AI at it and it knows what to do. [done]

## The guide

- One fetch teaches everything: llms.txt is the complete usage guide and the inventory of what exists. [done]
- The guide splits as it grows: a small root index pointing at focused files. [partial: build.txt split off; llms.txt is still the one large guide, not a small root index of focused files]
- A described-tokens file: every token with its purpose, machine-readable. [gap]
- The shipped code is the ground truth: fully commented, never minified, an AI reads it directly. [done]
- The docs show the same instructions the AI reads, word for word, inside every component entry. [done]
- A person reads exactly what the agent reads. [done]
- An MCP server and agent skill, so agents pull components directly. [gap]
- AI-buildability evals: prove the point-your-AI promise with tests. [gap]

## The maintenance guide

- The repo carries a [CLAUDE.md](http://CLAUDE.md): how to maintain the library, written for the AI doing the work. [done]
- Every rule an AI needs to keep the library healthy lives there: how to add a component, what never changes, how to test. [done]
- Projects built with Facet copy the relevant rules into their own [CLAUDE.md](http://CLAUDE.md) or README, so their AI works the Facet way too. [gap]
- The build prompts instruct the AI to do this copying as part of setup. [gap]
- The library is open source, and contribution rides the same guide: point your AI at the rules and it adds a component the right way; the contributor never needs to be technical. [done]

## The operable page

- An agent reads any Facet page top to bottom and understands it in one pass. [done]
- Every action is a real button or link with an accessible name. Never a div with a click handler. [done]
- Every page and state is reachable by URL: theme, mode, language in the query, screens in the hash. An agent constructs any state from a link. [done]
- Sections and elements carry stable, descriptive IDs. [done]
- Key actions carry stable event names, the same hooks analytics uses. [done]
- Nothing needs JavaScript to render, so crawlers and agents see everything. [done]

## Setup is prompts, not code

- The script tag's attributes boot the whole look. [done]
- Behaviours wire themselves to attributes in the markup. [done]
- The wrapper law binds the AI's output: not one extra container. [done]
- Guidance entries tell the AI how to choose: shells, navigation, safe areas, state homes, brand mapping, reserved names. [done]
