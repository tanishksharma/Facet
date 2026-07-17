# AI-native

Every part of the library ships with its own instructions. You point an AI at it and it knows what to do.

## The guide

- One fetch teaches everything: llms.txt is the complete usage guide and the inventory of what exists.
- The guide splits as it grows: a small root index pointing at focused files.
- A described-tokens file: every token with its purpose, machine-readable.
- The shipped code is the ground truth: fully commented, never minified, an AI reads it directly.
- The docs show the same instructions the AI reads, word for word, inside every component entry.
- A person reads exactly what the agent reads.
- An MCP server and agent skill, so agents pull components directly.
- AI-buildability evals: prove the point-your-AI promise with tests.

## The maintenance guide

- The repo carries a [CLAUDE.md](http://CLAUDE.md): how to maintain the library, written for the AI doing the work.
- Every rule an AI needs to keep the library healthy lives there: how to add a component, what never changes, how to test.
- Projects built with Facet copy the relevant rules into their own [CLAUDE.md](http://CLAUDE.md) or README, so their AI works the Facet way too.
- The build prompts instruct the AI to do this copying as part of setup.
- The library is open source, and contribution rides the same guide: point your AI at the rules and it adds a component the right way; the contributor never needs to be technical.

## The operable page

- An agent reads any Facet page top to bottom and understands it in one pass.
- Every action is a real button or link with an accessible name. Never a div with a click handler.
- Every page and state is reachable by URL: theme, mode, language in the query, screens in the hash. An agent constructs any state from a link.
- Sections and elements carry stable, descriptive IDs.
- Key actions carry stable event names, the same hooks analytics uses.
- Nothing needs JavaScript to render, so crawlers and agents see everything.

## Setup is prompts, not code

- The script tag's attributes boot the whole look.
- Behaviours wire themselves to attributes in the markup.
- The wrapper law binds the AI's output: not one extra container.
- Guidance entries tell the AI how to choose: shells, navigation, safe areas, state homes, brand mapping, reserved names.
