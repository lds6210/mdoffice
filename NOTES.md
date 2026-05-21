# mdoffice — Working Notes (WIP)

Personal working notes. Pre-public — not curated for end users yet.

## One-line pitch

A Claude Code framework that boots a "markdown-native virtual company" in a single terminal pane. You (CEO) talk only to a Chief of Staff; the Chief delegates to specialist sub-agents and writes their work to a markdown vault you can read, grep, and edit at any time.

## Origin

Grew out of `paneup-seed` (a thin `wt` launcher idea). Two realizations stacked:

1. Spawning N AI panes side-by-side doesn't reduce cognitive load — it multiplies it. The fix is hierarchical: one human-facing agent (the Chief) absorbs the N specialists.
2. **The real problem with autonomous AI is loss of mid-flight control.** Once an agent starts running, the user has only crude options: let it finish or kill it. Markdown-mediated work fixes this — every intermediate artifact is a `.md` file the user can read and rewrite at any moment. The vault is the intervention surface. This is the headline value proposition, not just a nice side effect.

## v0.1 priority order (the only thing that matters now)

User explicitly scoped v0.1 down on 2026-05-21:

1. **Delegation works** — user drops directive → Chief reads → invokes specialist sub-agents → outputs land in `20_team/<role>/output/`.
2. **Asset accumulation works** — Chief promotes durable artifacts into `50_assets/` (code snippets, design docs, playbooks). The vault becomes the company's long-term IP store, not just a scratch space.
3. **Result-first surfacing** — user reads `10_chief/report.md` highlights, drills into specialist folders only when they want to.

AI-CEO modes, Hybrid mode, self-improvement loop, multi-CLI: explicitly deferred. They're in the README's "Future" section. Don't dilute v0.1 chasing them.

## Differentiation: honest market check (2026-05-21)

Surveyed the existing Claude Code multi-agent landscape:

| Tool                     | ★      | Approach                                                              |
|--------------------------|--------|-----------------------------------------------------------------------|
| oh-my-claudecode         | 34.5k  | Teams-first, 19 agents, 5-stage pipeline, JSON/JSONL state, HUD, skills |
| claude-forge             | 705    | "Claude Code plugin framework inspired by oh-my-zsh"                  |
| multi-agent-squad        | 82     | Production multi-agent orchestration                                  |
| amirlehmam/wmux          | 122    | Electron terminal + Claude Code monitoring hooks + wave orchestrator  |
| openwong2kim/wmux        | 89     | Electron + MCP browser tools + agent-to-agent messaging               |
| fernandomenuk/wmux       | 6      | Rust/Tauri + JSON-RPC named pipe                                      |
| llm-wiki-kit             | 8      | Obsidian vault templates + agent skills (closest concept)             |
| CrewAI                   | n/a    | Python library + visual builder, code-defined agents                  |

Key honest point: **oh-my-claudecode (34.5k★) is the gorilla in this space and overlaps a lot.** It already has hierarchical staging (plan→prd→exec→verify→fix), skills accumulation (auto-extracted markdown), and "teams-first" framing. mdoffice is not the first multi-agent orchestrator for Claude Code.

### Where mdoffice can credibly stand apart

- **Single human-facing pane.** oh-my-claudecode exposes slash commands, a HUD, replay logs, and artifacts — many surfaces. mdoffice exposes one pane + one report file. Different ergonomics, simpler model.
- **All-markdown state.** oh-my-claudecode mixes JSON, JSONL, and markdown. mdoffice is markdown-only. A human can open any file and understand it.
- **Explicit company metaphor.** oh-my-claudecode says "teams-first" but the org is implicit. mdoffice makes CEO / Chief / Specialists explicit and visible in the folder structure.
- **Explicit asset promotion.** oh-my-claudecode auto-extracts skills. mdoffice has the Chief explicitly decide what to promote to `50_assets/` and why. More controllable; matches how a real chief of staff curates institutional knowledge.
- **First-class Obsidian integration.** `mdoffice open <vault>` opens the vault via Obsidian URI. The vault layout is designed to play well with Obsidian's graph view and Daily Notes pattern. Nobody else does this.
- **No custom terminal.** No Electron, no Tauri. Wraps existing `wt` / iTerm2. `npm i -g mdoffice` and you're in.

### Where mdoffice does NOT try to compete

- Not trying to beat oh-my-claudecode on feature breadth. It will always have more.
- Not building a custom GUI / HUD. The terminal + markdown editor are the UI.
- Not chasing the "agentic IDE" segment (Devin, OpenHands).
- Not bundling a marketplace of agents / skills in v0.1.

The bet: there's a real segment of users who want a **single-surface, markdown-only, opinionated, lightweight** alternative. Not everyone wants 19 agents and 5 pipeline stages. Some people want a Linear-like simplicity over a Photoshop-like surface.

## Architecture

### Roles in the office

| Role          | Default model           | Job                                                                                  |
|---------------|------------------------|--------------------------------------------------------------------------------------|
| CEO           | (human)                 | Writes instructions to `00_ceo/instructions.md`. Reads reports.                       |
| Chief of Staff | Strongest available    | Reads CEO instructions, decides team size, invokes specialist sub-agents, aggregates reports, escalates blockers. |
| Specialists   | Mid-tier (Sonnet)       | Receive task files from Chief, work, write results to `output/` as markdown.         |

Specialists are **Claude Code sub-agents** (defined in `vault/.claude/agents/*.md`). The Chief invokes them via the Task tool — no separate process per specialist, no extra panes.

The Chief is the product's center of gravity. A bad Chief = bad product. Use the strongest model available there; token cost is not a constraint.

### Vault structure

```
vault/
├── .claude/agents/
│   ├── backend.md            # sub-agent definition (frontmatter + system prompt)
│   └── frontend.md
├── CLAUDE.md                 # Chief of Staff system prompt (Claude Code auto-loads)
├── 00_ceo/
│   └── instructions.md       # CEO writes here
├── 10_chief/
│   ├── report.md             # Chief's summary for CEO (the only file CEO reads regularly)
│   ├── delegation.md         # Internal bookkeeping
│   └── escalations.md        # Things needing CEO decision
├── 20_team/
│   ├── backend/{task.md, output/}
│   └── frontend/{task.md, output/}
├── 50_assets/                # Promoted reusable IP
│   ├── code/
│   ├── design/
│   ├── docs/
│   └── playbooks/
└── 90_archive/               # Completed task snapshots
```

### Pane layout

```
┌─────────────────────────────┐
│                             │
│   mdoffice — chief (only)   │
│                             │
└─────────────────────────────┘
```

One window, one pane, running Claude Code in the vault. The Chief reads the vault, invokes sub-agents, writes back to the vault. Sub-agent execution is non-visual — outputs are files.

This is a deliberate inversion of the wmux model. Other tools spawn N panes for N agents. mdoffice spawns 1 pane because the user only ever talks to the Chief; everyone else is downstream.

### Cross-platform spawn

```
src/
├── core/                 ← OS-independent
│   ├── vault.js          ← vault structure, file I/O (TBD: not yet extracted)
│   ├── chief.js          ← (TBD)
│   └── watcher.js        ← (TBD: serve mode polling)
├── cmd/                  ← CLI command handlers
│   ├── init.js           ← `mdoffice init`
│   ├── run.js            ← `mdoffice run "<task>"`
│   ├── open.js           ← `mdoffice open` (Obsidian)
│   └── serve.js          ← `mdoffice serve` (TBD)
└── spawn/                ← OS-specific
    ├── index.js          ← platform dispatcher
    ├── windows.js        ← wt single-pane spawn (v0.1)
    ├── mac.js            ← iTerm2 osascript single-pane spawn (v0.1 — cross-platform from day one)
    └── linux.js          ← tmux / kitty (v0.2+)
```

`bin/mdoffice.js` is just an argv dispatcher to the `cmd/` handlers.

## Roadmap

### v0.1 (MVP) — minimum proof-of-life
- `mdoffice init [path] [--obsidian]` — scaffold vault + Claude Code integration (.claude/agents + CLAUDE.md)
- `mdoffice run "<task>"` — append directive, spawn Chief pane (Windows wt or macOS iTerm2)
- `mdoffice open [vault]` — open vault in Obsidian via URI
- `mdoffice serve [vault]` — Chief pane + vault watcher, stays alive
- Chief uses Task tool to invoke `backend` and `frontend` sub-agents (defined in vault)
- Asset promotion handled by Chief's system prompt (instructions in `vault/CLAUDE.md`)
- **Cross-platform from v0.1: Windows + macOS.** Linux in v0.2.
- Ship GitHub-only first, npm publish in v0.2.

### v0.2 — full team + npm publish
- Full 10-specialist roster (PM, Architect, QA, Designer, DevOps, Security, Data, Docs added)
- Dynamic team sizing — Chief picks N specialists per task
- Linux spawn adapter (tmux / kitty)
- Specialist roster customization via config
- `--team <N>` override
- First npm publish

### v0.3 — coordination quality
- AI-CEO mode (`--ceo ai`) and Hybrid mode (`--ceo hybrid`)
- Inter-specialist messaging via `10_chief/delegation.md` (Chief mediates, specialists don't talk directly)
- Auto-archive on task completion
- Report cadence config

### v0.4+
- Self-improvement loop (Chief auto-audits codebase + competition during idle time)
- Recipe hub: vault layouts as npm packages (`@mdoffice/recipe-*`)
- Multi-office support (switch between vaults)
- Obsidian plugin for richer CEO dashboard
- Non-Claude AI CLI support (Codex, Gemini) — re-examine after v0.3

## Constraints and assumptions

- Node.js 18+ on PATH
- Claude Code on PATH (v0.1 is Claude Code-specific because specialists are sub-agents)
- v0.1 spawn targets: Windows Terminal on Win10 1903+ / Win11 **and** macOS (iTerm2). Linux in v0.2+.
- Token cost is not a constraint — premium model on Chief is the design center.
- Single-user, single-machine. No team sync, no cloud state.

## Open questions

- How does the Chief know when a specialist is "done" beyond the Task tool's synchronous return? Probably: trust the return, archive the task.md, write the report highlight. Revisit if it feels wrong in real use.
- Should the Chief itself maintain a journal across sessions? Probably `10_chief/journal.md`, write on session end / start.
- Conflict resolution when two specialists' outputs disagree — Chief mediates, but on what policy? (Defer to v0.3.)
- File watcher vs polling for `serve` mode? `fs.watch` is fine for v0.1; revisit `chokidar` if cross-platform reliability bites.
- How to test the macOS spawn path before shipping? Need access to a Mac, or write the AppleScript carefully and ask a user to verify.
