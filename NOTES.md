# mdoffice — Working Notes (WIP)

Personal working notes. Pre-public — not curated for end users yet.

## One-line pitch

A CLI that boots a "markdown-native virtual company" on top of Windows Terminal. You (CEO) talk to a Chief of Staff agent; the Chief delegates to up to 10 specialist agents; all coordination happens through markdown files in a vault folder.

## Origin

Grew out of `paneup-seed` (a thin `wt` launcher idea). Two realizations stacked:

1. Spawning N AI panes side-by-side doesn't reduce cognitive load — it multiplies it. The user still has to read N streams. The fix is hierarchical: one human-facing agent (the Chief) absorbs the N specialists.
2. **The real problem with autonomous AI is loss of mid-flight control.** Once an agent starts running, the user has only crude options: let it finish or kill it. Markdown-mediated work fixes this — every intermediate artifact is a `.md` file the user can read and rewrite at any moment. The vault is the intervention surface. This is the headline value proposition, not just a nice side effect.

## Differentiation vs existing wmux landscape

Surveyed in May 2026:
- `amirlehmam/wmux` (122★) — Electron multiplexer + Claude Code monitoring hooks + wave-based orchestrator plugin.
- `openwong2kim/wmux` (89★) — Electron multiplexer + MCP browser tools + agent-to-agent messaging.
- `fernandomenuk/wmux` (6★) — Rust/Tauri + JSON-RPC named pipe.

All three: **flat agent arrays**, **in-memory state**, custom terminal apps (Electron/Tauri).

mdoffice difference:
- **Hierarchical delegation** — CEO → Chief → team. User talks to one agent only.
- **File-based state** — vault of `.md` files is the single source of truth. Persistent, git-trackable, viewable in any editor.
- **No custom terminal** — wraps existing `wt`. `npm i -g mdoffice`, no Electron binary, no GUI app, no separate updater.
- **Async human intervention** — CEO can edit vault files directly (e.g. in Obsidian) and the Chief sees the change on next poll.

## Architecture

### Roles in the office

| Role | Default model | Job |
|------|--------------|-----|
| CEO | (human) | Writes instructions to `00_ceo/instructions.md`. Reads reports. |
| Chief of Staff | Strongest available (Opus tier) | Reads CEO instructions, decides team size, spawns/dismisses specialists, aggregates reports, escalates blockers. |
| Specialists (PM, Architect, Backend, Frontend, QA, Designer, DevOps, Security, Data, Docs) | Mid-tier (Sonnet) | Receive task files from Chief, work, write results back. |

The Chief is the product's center of gravity. A bad Chief = bad product. Use the strongest model available there; token cost is not a constraint.

### Vault structure (proposed)

```
vault/
├── 00_ceo/
│   └── instructions.md          # CEO writes here
├── 10_chief/
│   ├── report.md                # Chief's summary for CEO (the only file CEO reads regularly)
│   ├── delegation.md            # Who got what task, current state
│   └── escalations.md           # Things needing CEO decision
├── 20_team/
│   ├── pm/
│   │   ├── task.md              # Current assignment from Chief
│   │   └── output/              # Specialist's deliverables
│   ├── architect/
│   ├── backend/
│   ├── frontend/
│   ├── qa/
│   ├── designer/
│   ├── devops/
│   ├── security/
│   ├── data/
│   └── docs/
└── 90_archive/                  # Completed task snapshots
```

### Pane layout (Windows Terminal)

```
┌─────────────────────────┬─────────────┐
│                         │ chief view  │
│   CEO interface         │  (read-only │
│   (you talk here)       │   live tail │
│                         │   of report)│
│                         ├─────────────┤
│                         │ team grid   │
│                         │ (N×N split, │
│                         │  read-only) │
└─────────────────────────┴─────────────┘
```

Open question: does the CEO type into a pane at all, or just into the vault file via their editor? Two modes worth supporting:
- **Pane mode** — CEO types in the leftmost pane, mdoffice routes input to instructions.md
- **Editor mode** — CEO edits instructions.md in Obsidian/VS Code, mdoffice only shows status panes

## Roadmap

### v0.1 (MVP) — minimum proof-of-life
- `mdoffice init` — scaffold vault folder + role templates
- `mdoffice run "<task>"` — spawn Chief pane (Claude Code with a chief-of-staff system prompt) + 2 specialist panes (start with backend + frontend hardcoded)
- Chief reads CEO instructions, writes a task file to each specialist, reads back their output
- File watcher in each pane so role agents react to their task.md being updated
- Ship as GitHub-only release (no npm publish until v0.2)

### v0.2 — dynamic team size
- Chief decides N (1–10) based on task analysis
- `--team <N>` override
- Specialist roster customization via config

### v0.3 — coordination quality
- Inter-specialist messaging via shared `10_chief/delegation.md` (Chief mediates, specialists don't talk directly)
- Auto-archive on task complete
- CEO report cadence config (every N seconds / on demand / on change)
- npm publish

### v0.4+
- Recipe hub: vault layouts as npm packages (`@mdoffice/recipe-*`)
- Multi-office support (switch between vaults)
- Obsidian plugin for richer CEO interface (graph view of dependencies, daily standup notes)
- Non-Claude AI CLI support (Codex, Gemini)

## Constraints and assumptions

- Windows Terminal required (Win10 1903+)
- Node.js 18+ on PATH
- An AI CLI on PATH (Claude Code is the first target; multi-CLI later)
- Token cost is not a constraint — premium model on Chief is the design center
- Single-user, single-machine — no team sync, no cloud state

## Open questions

- File watcher vs polling for specialist panes? `chokidar` is the obvious choice but spawn-side polling is simpler.
- How does the Chief shut down idle specialists? Kill the pane, or leave it running with empty task?
- Should the CEO instruction file be append-only (log) or last-write-wins (current intent)? Probably last-write with git log preserving history.
- Conflict resolution when two specialists' outputs disagree — Chief mediates, but on what policy? (Defer to v0.3.)
- The Chief itself needs memory across sessions — is that just `10_chief/journal.md`?
