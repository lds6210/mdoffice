# mdoffice

> **Turn a fuzzy spec into a clickable HTML prototype, before you write a line of code.**
>
> An engine-agnostic markdown vault that hosts an AI office. Claude Code is the first supported engine. Codex CLI / Gemini CLI / others coming.

## The thesis

> **Development ends when you know the spec.**

For a backend engineer, the bottleneck isn't writing code — it's figuring out what to build. By the time the spec is clear, an LLM writes the code in ten minutes. The messy middle — trade-offs, hidden assumptions, decisions you didn't know you had to make — that's where the days go.

mdoffice is for that middle. Drop a fuzzy directive into the vault. An AI office breaks it down: a spec reader extracts what's explicit and what's missing, a backend specialist sketches the API surface, a frontend specialist sketches the screens, and a prototyper folds it all into one self-contained HTML file you can click through. You read the prototype, edit the directive to answer what was unclear, run again. Two or three cycles in, the spec is sharp enough to hand to Cursor / Copilot — or to the designer who used to be the one telling you what the UI should look like.

The vault itself becomes your ADR: every decision is captured as a side effect of using the office.

## Status

WIP. v0.1 in progress. See `NOTES.md` for full design notes and roadmap.

## What you get

```
fuzzy directive in 00_ceo/instructions.md
                │
                ▼
        Chief of Staff (the AI in your one pane)
                │
                ├──▶ spec-reader  (extracts explicit + implicit + missing requirements)
                │
                ▼  reads spec-reader's output
                │
                ├──▶ backend      (API surface table, data model, backend decisions)
                ├──▶ frontend     (screen inventory, navigation, frontend decisions)
                │
                ▼  reads both
                │
                └──▶ prototyper   (single self-contained HTML file you open in a browser)
                                  ↑
                                  this is the marquee artifact — a clickable spec
```

The prototype is plain HTML/CSS/JS, single file, no build step. Each button shows which API call it would fire. Each unresolved decision is highlighted. Open it, click through, decide what to change, edit the directive, run again.

## Why this matters

The pain mdoffice is built to solve is real and specific.

**For a backend engineer**, today's workflow is: PM writes a spec → designer turns it into a Figma → backend gets handed the Figma and reverse-engineers what the API should be. The backend engineer never gets to ask their own architectural questions before the UI shape is locked in. By the time they're at the keyboard, the spec is implicit in pixels they didn't author.

mdoffice flips that. The backend engineer drops the spec into the vault and gets back an interactive HTML prototype with their own structural choices visible. *That* is what they hand to the designer — "make this beautiful," not "figure out what I want."

(mdoffice originated as one Korean backend engineer's scratch against Figma-first workflows. The pain is local; the framing isn't. But the Korean examples scattered through this README are intentional — that's whose itch the v0.1 prompts are tuned for first.)

This is also why the v0.1 marquee artifact is HTML and not markdown alone. A markdown table of API endpoints is fine. An HTML prototype that a designer can open, a PM can click through, and a frontend can use as a contract is *better*. The prototype IS the conversation for the rest of the team.

## Engine-agnostic vault

mdoffice is **not** an AI app that calls Claude. It's a vault layout + scaffolding tool that spawns whichever AI CLI you have installed. v0.1 supports **Claude Code** as the first engine. Codex CLI and Gemini CLI adapters are planned for v0.2.

The user-facing folder structure (`00_ceo/`, `10_chief/`, `20_team/`, `50_assets/`) is the same regardless of engine. What changes per engine is the system-prompt convention (`CLAUDE.md` for Claude Code; `AGENTS.md` for Codex; etc.) and how sub-agents are defined. mdoffice handles that translation.

The implication: **your vault is your asset, not your lock-in.** When a new model lands, point mdoffice at a different engine and re-run any past directive. v0.2's parallel mode (`--engines claude-code,codex,gemini`) lets you compare engines on your *actual* work, not on synthetic benchmarks.

## Daily flow

1. Drop a spec file (Notion export, PR description, Slack thread) into `00_ceo/spec/` and reference it in your directive — or just write the directive freehand.
2. `mdoffice serve my-project-vault` — Chief pane opens. You can mostly forget about the terminal from here.
3. The Chief invokes spec-reader → backend + frontend → prototyper. Outputs land as markdown / HTML in `20_team/*/output/`.
4. Open `10_chief/report.md` and the linked prototype HTML. Click through the prototype.
5. Edit `00_ceo/instructions.md` to answer what wasn't clear (or to redirect). Run again.
6. Decisions surface in `10_chief/escalations.md`. When you approve a promotion, the Chief moves the artifact into `50_assets/` — your ADR, accreted one approval at a time (no surprise auto-writes).

## Vault structure

```
my-project-vault/
├── .claude/agents/        ← Claude Code sub-agent definitions
│   ├── spec-reader.md     ← extracts explicit + implicit + missing requirements
│   ├── backend.md         ← API surface + data model + backend decisions (no code)
│   ├── frontend.md        ← screen inventory + nav map + UX decisions (no code)
│   └── prototyper.md      ← rolls everything into one self-contained HTML
├── CLAUDE.md              ← Chief of Staff system prompt
├── 00_ceo/
│   ├── instructions.md    ← you write directives here
│   └── spec/              ← drop reference spec files here
├── 10_chief/
│   ├── report.md          ← what the office did, result-first
│   ├── delegation.md      ← internal bookkeeping
│   └── escalations.md     ← decisions / promotions needing your answer
├── 20_team/
│   ├── spec-reader/{task.md, output/}
│   ├── backend/{task.md, output/}
│   ├── frontend/{task.md, output/}
│   └── prototype/{task.md, output/<date>.html}    ← the marquee artifact
├── 50_assets/             ← decisions, trade-offs, playbooks accumulate here
│   ├── decisions/         ← ADRs, generated as a side effect
│   ├── trade-offs/
│   ├── playbooks/
│   └── code/              ← reusable snippets (later)
└── 90_archive/
```

## Usage

```sh
# Install (v0.2)
npm install -g mdoffice

# Install (v0.1 — direct from source)
git clone https://github.com/lds6210/mdoffice.git
cd mdoffice
npm link   # exposes the `mdoffice` command globally; or call `node bin/mdoffice.js` directly

# Scaffold a new vault (Claude Code is the default engine)
mdoffice init my-project-vault --obsidian

# Scaffold for a specific engine
mdoffice init my-project-vault --engine claude-code

# Open an existing vault in Obsidian
mdoffice open my-project-vault

# One-shot: drop a directive and run the office once
mdoffice run "결제 모듈 어떻게 설계할지 정리 좀 도와줘" --vault my-project-vault

# Daemon mode: keep the office running, edit directives in your editor
mdoffice serve --vault my-project-vault
```

## Requirements

- **Node.js 18+**
- **Claude Code on PATH** (v0.1's first supported engine). mdoffice checks for it on `init` / `run` / `serve` and tells you what's missing if it isn't there.
- **A terminal mdoffice can spawn into:**
  - v0.1: **Windows Terminal on Win10 1903+ / Win11** (the maintainer's only test platform). macOS (iTerm2 via AppleScript) code ships but is **untested by the maintainer — community PRs to verify and fix it are welcomed**.
  - v0.2+: Linux (tmux / kitty / gnome-terminal)
- **Strongly recommended: Obsidian.** A vault that's been working for weeks isn't a flat folder — it's a graph of linked decisions, prior trade-offs, and reused playbooks. Obsidian's graph view, backlinks, and full-text search aren't a nice-to-have; they're how you actually navigate the vault as it accumulates. Any markdown editor (VS Code, Typora, `cat`) can open the files, but you'll feel the missing dashboard the moment the vault grows past one project.

## How is this different from oh-my-claudecode / wmux / Cursor / Devin?

|                                       | mdoffice                                 | oh-my-claudecode (34.5k★)  | wmux family       | Cursor / Devin / Aider |
|---------------------------------------|------------------------------------------|----------------------------|-------------------|------------------------|
| What it's for                         | **figuring out the spec**                | running multi-agent pipelines | watching N panes  | writing the code       |
| When in workflow                      | **before code**                          | during execution           | during execution  | the code itself        |
| Marquee artifact                      | **interactive HTML prototype**           | execution artifacts        | terminal state    | code                   |
| Engine                                | **agnostic** (Claude Code first; Codex / Gemini coming) | Claude Code-locked       | Claude Code-leaning | varies                 |
| Vault is your asset                   | **yes (engine-swappable)**               | partial                    | no                | no                     |
| Multi-engine parallel (compare models on your real spec) | v0.2+ (planned)        | not possible by design     | not possible      | not possible           |
| Surface                               | one pane + a vault                       | slash + HUD + artifacts    | N panes           | IDE                    |
| State                                 | all markdown                             | JSON + JSONL + skills      | terminal memory   | code files             |

mdoffice is **the layer above coding agents**, not a competitor. The Cursor / Copilot / oh-my-claudecode users are downstream — they take a spec sharpened by mdoffice and execute on it.

## Roadmap

### v0.1 — proof of life ← we are here
- `mdoffice init / run / serve / open` (wired)
- Specialists: `spec-reader`, `backend`, `frontend`, `prototyper` — prompts tuned for **unknowns surfacing**, not implementation
- Marquee artifact: single self-contained HTML prototype
- Engine adapter abstraction (single engine: Claude Code)
- Cross-platform from day one (Windows + macOS)
- Obsidian URI integration

### v0.2 — multi-engine + npm publish
- Codex CLI adapter (`AGENTS.md` convention)
- Gemini CLI adapter
- `mdoffice run --engines claude-code,codex,gemini` — parallel execution against the same directive, mdoffice generates a side-by-side comparison report
- Linux spawn adapter (tmux / kitty)
- npm publish

### v0.3 — coordination quality
- Full 10-specialist roster (PM, Architect, QA, Designer, DevOps, Security, Data, Docs)
- Dynamic team sizing (Chief picks which specialists for which directive)
- Hybrid asset promotion (Chief proposes in `escalations.md`, user one-line approves)
- Standard task.md sections (`## Goal / ## Constraints / ## Out of scope`)

### v0.4+
- Recipe hub: vault layouts as npm packages (`@mdoffice/recipe-*`)
- Obsidian plugin (richer dashboard, interactive artifact rendering)
- Agent-level engine mixing (one role on Claude, another on GPT) — only after v0.2 multi-engine proves stable

### Deferred (separate sister project or v1.0+)
- **AI-CEO / autonomous mode** — if the human isn't deciding, the v0.1 thesis falls apart. Belongs in `mdoffice-autonomous` or v1.0+ after the human-in-loop version is validated. See `NOTES.md` "the longer arc" for the bigger vision.
- **Self-improvement loop** — Chief auto-auditing the codebase during idle time. Same reasoning.

## License

MIT
