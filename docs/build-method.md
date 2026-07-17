# Build method

The library ships prompts that turn any AI into a product builder. A person copies one prompt, describes the idea, answers questions, reviews the result. The whole method is public: the human page and the agent file carry the same rules. [done]

## The contract

- Learn the material. Fetch the guide; never invent a component; never reach for a framework. [done]
- Interview first. Small rounds of questions until the AI can say who it is for, the one job, what success looks like, how it should feel. [done]
- Agree the plan. A short v1 list: screens, what is in, what is explicitly out, theme, shell. Wait for a yes. [done]
- Build with the library. Semantic HTML, the right shell, one theme, one primary action per screen, every state in the URL. [done]
- Verify like a user. Walk every screen, click everything, phone size, light and dark. [done]
- Hand over honestly. What shipped, what was left out and why, the one next thing. [done]

## The prompts

- Non-technical. The AI makes every technical decision, asks in plain words, bans jargon, keeps everything static, parks anything needing a server in one sentence. [done]
- Technical. The AI teaches as it builds and keeps the user in the real decisions; explains when a backend is genuinely needed, its smallest form and its cost, and builds the front end fully either way. [done]
- Backend addendum. Smallest real thing; static-first degradation; secrets never in the client; costs in real money first. [done]
- Question bank. Who exactly; the one job; a successful use, start to finish; the never-do list; the feel; phone or desktop; what exists; what is out of scope. [done]
- Quality bar. Every screen URL-reachable; one primary action; keyboard everything; phone and desktop; both modes intentional; readable with JavaScript off; prints clean; one-glance HTML. [done]

## Scenario prompts

- A prompt router: the AI picks the right prompt for the moment, from the project's state and the user's answers. [gap]
- Checker prompts: after every big step, a different prompt verifies what was done, flags the replaceable, cuts the extra. [gap]
- Bloat is cut continuously, not in one cleanup at the end. [gap]
- Always guided: at every point the AI knows what the next step is. [partial: the fixed six-step contract sequences a build; no per-moment guidance system ships]
