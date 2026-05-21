# mdoffice

> **Turn fuzzy ideas into clear specs through an AI office that runs on markdown.**
>
> A tool for figuring out what to actually build, before writing code.

## The premise

**Development ends when you know the spec.** Once requirements are clear, an LLM writes the code in ten minutes. The real bottleneck — and it's been the bottleneck for backend developers forever — is the messy middle: figuring out what trade-offs matter, what decisions you're implicitly making, what you don't yet know.

mdoffice is for that middle.

You give the office a vague directive. A Chief of Staff agent runs it past specialist agents (backend, frontend, ...). The specialists don't write code — they **surface the unknowns**: trade-offs, missing decisions, hidden assumptions. Their output is markdown, structured so a human can read it and respond. You answer. The vault accumulates the answered questions as your spec emerges. By the time you actually open Cursor or Copilot, the spec is sharp enough that the code is almost dictation.

A side effect: the vault becomes your **Architecture Decision Record**, written naturally as you go, never as a chore.

## Status

WIP. v0.1 in progress. See `NOTES.md` for design notes and roadmap.

## The two insights driving this

**1. The intermediate artifact is the product, not the intervention surface.**
The thesis isn't "interrupt the AI mid-flight." It's "read what the AI produced and learn what to ask better next time." Once you frame it that way, sync mechanisms and race conditions become non-problems — the user reads files when files are done, and steers by editing what to ask, not by editing in-flight work.

**2. Specialists exist to draw out unknowns, not to write code.**
A backend specialist's job isn't to implement the API. It's to look at the directive from a backend angle and ask, "have you decided about idempotency keys? client-generated or server-generated? what about retry strategy?" The output is a checklist of decisions, not a deliverable. You answer the checklist. That's the spec.

## The model

```
You (CEO)                 — write a fuzzy directive
 │
 │  one pane: "mdoffice — chief"
 ▼
Chief of Staff             — reads the directive, picks specialists,
                             asks them to surface unknowns
 │
 │  Task tool (Claude Code sub-agents)
 ▼
Specialists                — output structured questions, trade-offs,
                             decisions-to-make. Not code. Not yet.
 │
 ▼
Vault (markdown)           — answered questions accumulate here.
                             This IS your spec / ADR / institutional memory.
```

The "AI company" metaphor is the mechanism. Spec emergence is the value.

## Daily flow

1. You drop a fuzzy directive in `00_ceo/instructions.md`. Example: *"결제 모듈 만들어야 하는데 아직 어떻게 할지 모르겠어. 정리 좀 도와줘."* (or *"Need to build a payment module — not sure how yet. Help me figure it out."*)
2. The Chief reads it, picks the right specialists, writes a task to each (`20_team/<role>/task.md`).
3. Each specialist returns a structured artifact: **decisions you need to make**, **trade-offs**, **hidden assumptions**, **what's still missing**.
4. The Chief surfaces a result-first summary in `10_chief/report.md`. You read.
5. You answer the questions — either by editing `00_ceo/instructions.md` with your decisions, or by dropping notes directly into the relevant role's folder.
6. Run again. The next round narrows further. Repeat until the spec is sharp.

You're not supervising agents. You're using them as a mirror to find what you didn't know you had to decide.

## Asset accumulation

The answered-decision artifacts are durable. The Chief promotes reusable ones into `50_assets/`:

```
vault/
├── .claude/agents/        ← sub-agent definitions (backend.md, frontend.md, ...)
├── CLAUDE.md              ← Chief of Staff system prompt
├── 00_ceo/instructions.md
├── 10_chief/
│   ├── report.md          ← what the office did today
│   └── escalations.md     ← decisions needing CEO answer
├── 20_team/
│   ├── backend/{task.md, output/}
│   └── frontend/{task.md, output/}
├── 50_assets/             ← growing institutional memory
│   ├── decisions/         ← ADRs, generated as a side effect
│   ├── trade-offs/        ← reusable trade-off tables
│   ├── playbooks/         ← repeatable processes
│   └── code/              ← reusable snippets (when code does happen)
└── 90_archive/
```

You don't write ADRs separately — they emerge from the act of using the office.

## Usage

```sh
# Scaffold a new vault (open it in Obsidian for the best experience)
mdoffice init my-project-vault --obsidian

# Open an existing vault in Obsidian
mdoffice open my-project-vault

# One-shot: drop a directive and run the office once
mdoffice run "결제 모듈 어떻게 설계할지 정리 좀 도와줘" --vault my-project-vault

# Daemon mode: keep the office running while you edit instructions in your editor
mdoffice serve --vault my-project-vault
```

## Requirements

- **Node.js 18+**
- **Claude Code** on PATH — specialists are defined as Claude Code sub-agents in `.claude/agents/`. v0.1 is Claude Code-specific by design (ship fast, abstract later if needed).
- **A terminal mdoffice can spawn into:**
  - v0.1: Windows Terminal on Windows 10 1903+ / Windows 11, **and** macOS (iTerm2 via AppleScript)
  - v0.2+: Linux (tmux / kitty / gnome-terminal)
- **Recommended: Obsidian** — the vault is built around markdown. Obsidian's graph view + backlinks turn the vault into a navigable knowledge base. Any markdown editor works, but Obsidian is the intended dashboard.

## How is this different from oh-my-claudecode / wmux / Cursor / Devin?

| | mdoffice (this) | oh-my-claudecode (34.5k★) | wmux family | Cursor / Devin / Aider |
|---|---|---|---|---|
| What's it for | **figuring out the spec** | running multi-agent pipelines | watching N agents in panes | writing the code |
| When in workflow | **before code** | during execution | during execution | the code itself |
| Output | structured decisions + ADRs | execution artifacts | terminal state | code |
| Competes with | Notion docs, whiteboard sessions | other multi-agent suites | tmux + AI | other coding agents |
| Surface | one pane + a vault | slash + HUD + artifacts | N panes | IDE |
| Org metaphor | explicit CEO / Chief / Specialists | "teams-first" slogan | flat | flat |
| State | all markdown | JSON / JSONL + skills | terminal memory | code files |
| Obsidian | **first-class** | none | none | none |

mdoffice is **the layer above coding agents**, not a competitor to them. The Cursor users are the natural downstream — they take the sharpened spec from mdoffice's vault and feed it to their AI to generate code that actually fits what they want.

## Roadmap

### v0.1 — proof of life
- `mdoffice init / run / serve / open` — done
- Single chief pane, Claude Code sub-agents for backend + frontend specialists
- Chief prompt and specialist prompts tuned for **unknowns surfacing**, not implementation
- Obsidian URI integration
- Cross-platform from day one (Windows + macOS)

### v0.2 — full roster + npm publish
- Add PM, Architect, QA, Designer, DevOps, Security, Data, Docs specialists
- Dynamic team sizing (Chief picks N from task)
- Linux spawn adapter
- npm publish

### v0.3 — coordination quality
- Inter-specialist mediation (Chief routes between specialists)
- Auto-archive on task completion
- Hybrid asset promotion: Chief proposes promotions in `escalations.md`, user one-line approves
- Standard task.md sections (`## Goal / ## Constraints / ## Out of scope`)

### v0.4+
- Recipe hub: vault layouts as npm packages (`@mdoffice/recipe-*`)
- Obsidian plugin (richer dashboard, interactive artifact rendering)
- Interactive intermediate artifacts (mermaid / excalidraw / runnable snippets) — explore which form earns its weight
- Non-Claude AI CLI support — only after the patterns are clearly proven

### Deferred to a separate track (not v0.1)
- **AI-CEO / autonomous mode** — interesting, but a different product. If the human isn't deciding, the v0.1 thesis ("human knows what they want by reading the vault") falls apart. Belongs in a sister project (`mdoffice-autonomous`) or v1.0+ after the human-in-loop version is validated. See `NOTES.md` "the longer arc" section for the bigger vision this connects to.
- **Self-improvement loop** — Chief auto-auditing the codebase during idle time. Same reasoning: shouldn't dilute v0.1.

## License

MIT
