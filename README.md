# mdoffice

> Markdown Office — your AI company runs on a folder of `.md` files.

**You talk to one agent — your Chief of Staff. The Chief delegates to specialist sub-agents and aggregates their work into reports. Every artifact lives as a markdown file in a shared vault, where you can read, edit, or redirect at any time.**

## Status

WIP. v0.1 in progress. See `NOTES.md` for the full roadmap and design notes.

## Why this matters

The pain of letting an AI run end-to-end is **loss of mid-flight control**. Once it starts, you either let it finish (and pray) or kill it (and lose context). There's no clean way to nudge.

mdoffice fixes this by making **the intermediate work product itself the intervention surface**. The Chief and specialists work in markdown files. At any moment you can open the vault and:

- read what they're about to do — and stop them by editing the instruction
- correct their understanding — edit the task file
- inject new context — drop a note in the relevant role's folder
- redirect them — rewrite the plan

You don't fight the agent's flow. You steer the document. On the next read, the agent picks up the new direction. This is the difference between **supervising a black box** and **editing a draft**.

## The model

```
You (CEO)
 │
 │  one pane: "mdoffice — chief"
 ▼
Chief of Staff  ── runs as Claude Code with the vault's CLAUDE.md as its prompt
 │
 │  Task tool (Claude Code sub-agents from vault/.claude/agents/*.md)
 ▼
Specialists  ── backend, frontend (v0.1)   |   full 10-role roster (v0.2)
 │
 │  output files in 20_team/<role>/output/<date>-<slug>.md
 ▼
Vault (markdown, source of truth)
```

- **One pane.** You only see the Chief. Specialists run as Claude Code sub-agents — invisible by design. This is the opposite of multi-pane multiplexers (wmux/cmux), which show you all the work and expect you to read it.
- **All state in markdown.** No JSON sessions, no replay logs, no proprietary state. Every artifact a human can read, grep, and edit.
- **Claude Code is the engine.** mdoffice ships a vault layout, system prompts, and sub-agent definitions — Claude Code is what actually runs in the pane.

## Daily flow (v0.1)

1. You drop a directive in `00_ceo/instructions.md` — could be "ship the payment module," could be "research how Stripe does idempotency keys."
2. The Chief reads it, decides which specialists are needed, writes a task file to each (`20_team/<role>/task.md`).
3. The Chief invokes each specialist via the Task tool. The specialist returns when done; detailed output lands in `20_team/<role>/output/<date>-<slug>.md`.
4. The Chief reads each specialist's output and appends a result-first highlight to `10_chief/report.md`.
5. **You see the deliverables first, not the raw process.** Drill into specialist folders only if you want the trace.
6. The Chief surfaces blockers and decisions to `10_chief/escalations.md` only when your input is required.

Normal operation: you read two files — `10_chief/report.md` (running status) and `10_chief/escalations.md` (things needing your call). The rest of the vault is there if you want to dig in.

## Asset accumulation

Every specialist's output is also an **asset**, not a one-off byproduct. The vault is your company's growing IP:

```
vault/
├── .claude/agents/      ← sub-agent definitions (backend.md, frontend.md, ...)
├── CLAUDE.md            ← Chief of Staff system prompt (auto-loaded by Claude Code)
├── 00_ceo/instructions.md
├── 10_chief/
│   ├── report.md
│   └── escalations.md
├── 20_team/
│   ├── backend/{task.md, output/}
│   └── frontend/{task.md, output/}
└── 50_assets/           ← the long-term library
    ├── code/            ← reusable snippets, modules
    ├── design/          ← design docs, decisions, ADRs
    ├── docs/            ← writeups, research notes
    └── playbooks/       ← repeatable processes
```

When a deliverable proves useful beyond its originating task, the Chief explicitly promotes it from `20_team/<role>/output/` into `50_assets/<category>/`. The next task can reference prior assets instead of redoing the work. Over time the vault accumulates institutional knowledge in markdown — fully readable, fully grep-able, fully under your control.

## Usage

```sh
# Scaffold a new vault (and optionally open it in Obsidian)
mdoffice init [path]
mdoffice init my-project-vault --obsidian

# Open an existing vault in Obsidian
mdoffice open my-project-vault

# Spawn the Chief pane and queue a directive (one-shot mode)
mdoffice run "ship the payment module" --vault my-project-vault

# Keep the office running — Chief pane + vault watcher (primary mode)
mdoffice serve --vault my-project-vault
```

## Requirements

- **Node.js 18+**
- **Claude Code** on PATH (mdoffice v0.1 is Claude Code-specific — specialists are defined as Claude Code sub-agents in `.claude/agents/`)
- **A terminal mdoffice can spawn into:**
  - v0.1: Windows Terminal on Windows 10 1903+ / Windows 11, **and** macOS (iTerm2 via AppleScript)
  - v0.2+: Linux (tmux / kitty / gnome-terminal)
- **Optional but recommended: Obsidian** — the vault is built around markdown, and Obsidian's graph view makes it sing. mdoffice doesn't depend on it; any markdown editor (VS Code, Typora, `cat`) works.

The core (vault layout, Chief prompt, sub-agent definitions) is OS-independent. Only pane spawning is platform-specific, isolated in `src/spawn/<platform>.js`.

## How is this different from oh-my-claudecode / wmux / cmux / Claude Squad?

There are already multi-agent tools for Claude Code, and some of them are very popular. mdoffice doesn't try to replace them — it targets a different segment.

|                          | mdoffice (this)                              | oh-my-claudecode (34.5k★)            | wmux family (Electron multiplexers)  |
|--------------------------|----------------------------------------------|--------------------------------------|--------------------------------------|
| Surface                  | one pane, one report file                    | slash commands + HUD + artifacts     | N panes, one per agent               |
| State                    | all markdown                                 | JSON / JSONL + skills folder         | terminal memory                      |
| Org metaphor             | **explicit CEO / Chief / Specialists**       | "teams-first" as a slogan            | flat agent list                      |
| Asset library            | **explicit `50_assets/` promotion by Chief** | auto-extracted skills                | none                                 |
| User intervention        | **edit the markdown file**                   | slash command, replay log inspection | open a pane and type                 |
| Obsidian integration     | **first-class (`mdoffice open`)**            | none                                 | none                                 |
| Distribution             | npm CLI (planned)                            | Claude Code plugin + npm             | Electron installer                   |
| Footprint                | tiny                                         | medium                               | heavy                                |

If you want a power-user multi-agent suite, oh-my-claudecode is the safer choice today. If you want **a markdown-native virtual company with one human-facing pane and Obsidian as your dashboard**, mdoffice is built for you.

## Future / extensibility

Deliberately out of scope for v0.1. Architecture leaves room to land these cleanly later.

- **Full 10-specialist roster** (v0.2) — PM, Architect, QA, Designer, DevOps, Security, Data, Docs join Backend and Frontend.
- **Dynamic team sizing** (v0.2) — Chief picks N (1–10) from task complexity.
- **AI-CEO / Hybrid CEO modes** (v0.3+) — let an AI own vision and strategy when you don't know the domain; you become the board / approver.
- **Self-improvement loop** (v0.3+) — Chief autonomously audits the codebase and the competitive landscape during idle time, drafts PRs, asks for your approval.
- **YAML org charts** (v0.4+) — define new roles, swap who's human vs AI per seat, share recipes as npm packages (`@mdoffice/recipe-*`).
- **Obsidian plugin** (v0.4+) — richer CEO dashboard (graph view of dependencies, daily standup notes, asset search).

## License

MIT
