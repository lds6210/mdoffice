# mdoffice

> Markdown Office — your AI company runs on a folder of `.md` files.

**You talk to one agent — your Chief of Staff. The Chief delegates to up to 10 specialist agents. Every piece of work they produce lands as a markdown file in a shared vault, where you can read, edit, or repurpose it at any time.**

## Status

WIP. v0.1 in progress. See `NOTES.md` for the full roadmap and design notes.

## Why this matters

The pain of letting an AI run end-to-end is **loss of mid-flight control**. Once it starts, you either let it finish (and pray) or kill it (and lose context). There's no clean way to nudge.

mdoffice fixes this by making **the intermediate work product itself the intervention surface**. The Chief and specialists work in markdown files. At any moment you can open the vault and:

- read what they're about to do — and stop them by editing the instruction
- correct their understanding — edit the task file
- inject new context — drop a note in the relevant role's folder
- redirect them — rewrite the plan

You don't fight the agent's flow. You steer the document. On the next poll, the agent picks up the new direction. This is the difference between **supervising a black box** and **editing a draft**.

## The model

```
You
 └─ Chief of Staff (AI, strongest model)
      ├─ PM         ├─ DevOps
      ├─ Architect  ├─ Security
      ├─ Backend    ├─ Data
      ├─ Frontend   ├─ Docs
      ├─ QA         └─ Designer
```

- The Chief decides how many specialists to spin up (1–10) per task.
- All inter-role communication is markdown files in a shared vault.
- The vault is just `.md` files. View it in Obsidian, VS Code, or `cat` — your choice.
- You write a directive to one file. The Chief reports back to one file. Specialists write their work products to their own folders. That's the whole protocol.

## Daily flow (v0.1)

1. You drop a directive in `00_ceo/instructions.md` — could be "ship the payment module," could be "research how Stripe does idempotency keys."
2. The Chief reads it, decides which specialists are needed, writes a task file to each.
3. Specialists work. Each writes their deliverables to their own `output/` folder as markdown.
4. The Chief tracks progress, reads each specialist's output as it lands, and updates `10_chief/report.md` with a running summary.
5. **You see the deliverables first, not the raw process.** When a specialist's output lands, the Chief lifts the highlight into the report. If you want the full trace, drill into the specialist's folder. Most of the time you won't need to.
6. The Chief surfaces blockers and decisions to `10_chief/escalations.md` only when your input is required.

This means in normal operation you only ever read two files: `10_chief/report.md` (running status) and `10_chief/escalations.md` (things needing your call). The rest of the vault is there if you want to dig in, but you don't have to.

## Asset accumulation

Every specialist's output is also an **asset**, not a one-off byproduct. The vault is your company's growing IP:

```
vault/
├── 00_ceo/instructions.md
├── 10_chief/
│   ├── report.md
│   └── escalations.md
├── 20_team/
│   ├── backend/output/
│   ├── frontend/output/
│   └── ...
└── 50_assets/                ← the long-term library
    ├── code/                 ← reusable snippets, modules
    ├── design/               ← design docs, decisions, ADRs
    ├── docs/                 ← writeups, research notes
    └── playbooks/            ← repeatable processes
```

When a piece of work proves useful beyond its originating task, the Chief promotes it from a specialist's `output/` into `50_assets/`. The next task can reference and build on prior assets instead of redoing the same research or rewriting the same boilerplate. Over time the office accumulates institutional knowledge in markdown — fully readable, fully grep-able, fully under your control.

## Planned usage

```sh
# Bootstrap a new office (creates vault folder + role templates)
mdoffice init

# Keep the office running (primary mode — Chief polls the vault, you edit directives)
mdoffice serve

# One-shot: run a single directive end-to-end
mdoffice run "ship the payment module"

# Run with a fixed team size override
mdoffice run "fix the login bug" --team 2

# Just the Chief, no team yet
mdoffice chief
```

## Requirements

- Node.js 18+
- An AI CLI on PATH (Claude Code recommended)
- A terminal mdoffice knows how to spawn panes in:
  - **v0.1 (now):** Windows Terminal on Windows 10 1903+ / Windows 11
  - **v0.4+ (planned):** macOS (iTerm2 / Terminal.app) and Linux (tmux / kitty) via swappable adapter

The core (vault, Chief, specialists, coordination) is OS-independent. Only pane spawning is platform-specific.

## Why mdoffice (vs other AI multiplexers)

Other AI multiplexers (`wmux` and friends) put N agent panes in front of you and expect you to supervise all of them. mdoffice puts **one human-facing pane** — the Chief — in front of you. The Chief manages the rest. Your cognitive load stays at 1, not N. State lives in markdown files, not terminal memory, so you can intervene by editing a file, and so the office picks up where it left off across restarts.

## Future / extensibility

These are deliberately out of scope for v0.1, but the architecture is designed to land them cleanly later.

- **Configurable CEO seat** — the human is not assumed to be at the top. v0.3+ supports AI-CEO mode (an AI owns vision and strategy; you act as board / final approver) and hybrid mode (you set a one-paragraph north star, the AI CEO scopes from there). Useful when entering a domain you don't know well.
- **Self-improvement loop** — once stable, the Chief can self-initiate work during idle time: scan competitor repos, audit the codebase, draft PRs for proposed improvements, push branches, and surface them in `00_ceo/decisions_needed.md`. mdoffice's first long-term customer is mdoffice.
- **YAML org charts** — define new roles, swap who's human vs AI per seat, share company recipes as npm packages (`@mdoffice/recipe-*`).
- **Obsidian plugin** — richer CEO interface (graph view of dependencies, daily standup notes, asset search).

## License

MIT
