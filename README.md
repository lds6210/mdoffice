# mdoffice

> Markdown Office — your AI company runs on a folder of `.md` files.

**A hierarchy of AI agents organized as a company. The CEO can be you, or an AI, or both. The Chief of Staff (always AI, ideally the strongest available model) delegates to up to 10 specialist agents. All coordination happens through markdown files in a shared vault, so you can intervene at any moment by editing a file.**

## Status

WIP. v0.1 in progress. See `NOTES.md` for the full concept and roadmap.

## Why this matters (the real point)

The pain of letting an AI run end-to-end is **loss of mid-flight control**. Once it starts, you either let it finish (and pray) or kill it (and lose context). There's no clean way to nudge.

mdoffice fixes this by making **the intermediate work product itself the intervention surface**. The Chief and team specialists work in markdown files. At any moment you can open the vault and:

- read what they're about to do — and stop them by editing the instruction
- correct their understanding — edit the task file
- inject new context — drop a note in the relevant role's folder
- redirect them — rewrite the plan

You don't fight the agent's flow. You steer the document. On the next poll, the agent picks up the new direction. This is the difference between **supervising a black box** and **editing a draft**.

## The model

```
CEO  ← human, AI, or hybrid
 └─ Chief of Staff (always AI, strongest model)
      ├─ PM         ├─ DevOps
      ├─ Architect  ├─ Security
      ├─ Backend    ├─ Data
      ├─ Frontend   ├─ Docs
      ├─ QA         └─ Designer
```

- The Chief decides how many specialists to spin up (1–10) per task.
- All inter-role communication is **markdown files in a shared vault folder**.
- The vault is just `.md` files. View it in Obsidian, VS Code, or `cat` — your choice.
- You write instructions to one file. The Chief reports back to one file. That's it.

## Who plays CEO

mdoffice doesn't assume the human is at the top of the hierarchy. The CEO seat is configurable:

- **Human-CEO mode** — you write vision and directives. The Chief executes. Best when you know the domain deeply.
- **AI-CEO mode** — an AI agent owns vision and direction, the Chief executes, you act as board / advisor / final approver. Best when you're stepping into a domain you don't know well. The AI CEO does the market research, the competitive analysis, the planning. You say yes or no.
- **Hybrid mode** — you set the north star (one paragraph). AI CEO fills in the details, scopes the work, hands it to the Chief, escalates back to you only on decisions you said you cared about.

The org chart itself is data, not code. Future versions let you define new roles, swap who's human vs AI per seat, and assemble custom org structures from yaml.

## Self-improvement loop (the killer demo)

The first user of mdoffice is mdoffice itself.

Once the office is running, the Chief can self-initiate work between user directives:

- scan competitor repos (`gh search`, release notes) and write a weekly diff report
- audit own codebase (test coverage gaps, stale TODOs, dead code) and propose fixes
- draft PRs for proposed fixes, run tests, push to a branch, open the PR
- summarize what changed, drop the PR link into `00_ceo/decisions_needed.md`
- you (or AI CEO) say merge / hold / kill

You provide the vision. The office grows itself toward that vision. Your job is direction and approval, not implementation.

## Planned usage

```sh
# Bootstrap a new office (creates vault folder + role templates)
mdoffice init

# Open the office (spawns Chief + N team panes in Windows Terminal)
mdoffice run "ship the payment module"

# Run with a fixed team size override
mdoffice run "fix the login bug" --team 2

# Just the Chief, no team yet
mdoffice chief
```

## Requirements

- Node.js 18+
- An AI CLI on PATH (Claude Code recommended)
- A terminal that mdoffice knows how to spawn panes in:
  - **v0.1 (now):** Windows Terminal on Windows 10 1903+ / Windows 11
  - **v0.4+ (planned):** macOS (iTerm2 / Terminal.app) and Linux (tmux / kitty) via terminal adapter

The core of mdoffice (vault, Chief, specialist orchestration, markdown-mediated coordination) is OS-independent. Only the pane-spawning layer is platform-specific.

## Why mdoffice (vs other AI multiplexers)

Other AI multiplexers (`wmux` and friends) put N agent panes in front of you and expect you to supervise all of them. mdoffice puts **one human-facing pane** — the Chief — in front of you. The Chief manages the rest. Your cognitive load stays at 1, not N.

State lives in markdown files, not in terminal memory. Restart anything, the office picks up where it left off. And because the state is plain `.md`, you can intervene at any moment by editing a file — no need to wrestle a running agent for control.

## License

MIT
