# mdoffice

> Markdown Office — your AI company runs on a folder of `.md` files.

**You are the CEO. You talk only to your Chief of Staff. The Chief delegates to a team of up to 10 specialists. Everything happens through markdown files.**

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
You (CEO)
  └─ Chief of Staff   ← you only talk to this one
       ├─ PM
       ├─ Architect
       ├─ Backend
       ├─ Frontend
       ├─ QA
       ├─ Designer
       ├─ DevOps
       ├─ Security
       ├─ Data
       └─ Docs
```

- The Chief decides how many specialists to spin up (1–10) based on the task.
- All inter-role communication is **markdown files in a shared vault folder**.
- The vault is just a directory of `.md` files. View it in Obsidian, VS Code, or `cat` — your choice.
- You write your instructions to one file. The Chief reports back to one file. That's it.

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
