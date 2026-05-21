# mdoffice — Claude Code development rules

These rules govern how Claude (and any other contributor) develops this tool. Claude Code reads this file automatically and applies the rules to every action in this repo.

## 1. Git author identity

- Commit author email **MUST be `lds6210@naver.com`**.
- Author name: `lds6210`.
- Verify before the first commit of any new session: `git config user.email`.
- If a commit is made with the wrong email, surface it immediately — do NOT silently force-push to rewrite. Ask the user.

## 2. Commit hygiene

- Use conventional prefixes: `feat:`, `fix:`, `concept:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Subject line ≤ 70 chars. Body explains WHY, not WHAT.
- Every feature commit includes a smoke-test command line in the body.
- Never `--amend` an already-pushed commit. Never `push --force` without explicit user approval. Never `--no-verify`.

## 3. v0.1 scope discipline

Ships in v0.1:
- `mdoffice init` — vault scaffold
- `mdoffice run "<task>"` — one-shot office with Chief + 2 specialists (backend, frontend)
- `mdoffice serve` — always-on daemon mode
- Asset accumulation (`50_assets/` promotion)
- Result-first surfacing (Chief writes report highlights)
- **Cross-platform: Windows (`wt`) AND macOS (iTerm2 / Terminal.app)**

Deferred — do NOT write code for these in v0.1 unless explicitly unblocked:
- Linux spawn adapter (v0.2)
- AI-CEO / Hybrid CEO modes (v0.3+)
- Self-improvement loop (v0.3+)
- Inter-specialist messaging (v0.3+)
- YAML org charts, recipe hub, Obsidian plugin (v0.4+)
- Full 10-specialist roster (v0.2 — v0.1 ships with 2)

If something feels valuable but isn't in v0.1: write it to `NOTES.md` roadmap and stop.

## 4. Dependencies

- Prefer Node built-ins (`fs`, `path`, `child_process`, `fs.watch`, `os`).
- Only add an npm dep when there is no reasonable built-in. Justify the choice in the commit body.
- No transpilers, no bundlers, no TypeScript in v0.1. Use CommonJS (simplest shebang interop).

## 5. Cross-platform discipline

The tool MUST run on Windows AND macOS from v0.1.

- All paths via `path.join`, never string concatenation with `/` or `\\`.
- Spawn logic lives in `src/spawn/<platform>.js`. Dispatch by `process.platform` at runtime.
- Core logic (vault, chief, watcher, prompts) is platform-agnostic. If you find yourself writing platform-specific code outside `src/spawn/`, stop and refactor.
- Test on at least one Windows machine before claiming a Windows-only change works.
- macOS: the maintainer (lds6210) is Windows-only and explicitly does NOT test macOS code paths. macOS changes ship "as-is" and rely on community PRs to verify / fix. Mark macOS-touching commits as "untested on macOS — community welcomed" in the body. Don't hold back a commit waiting for macOS verification.

## 6. Repository hygiene — what goes to GitHub vs stays local

**GOES TO GITHUB** (this repo, public):
- `bin/`, `src/`, `templates/` — the tool itself
- `README.md`, `NOTES.md`, `CLAUDE.md` — concept & rules
- `package.json`, `package-lock.json`, `LICENSE`, `.gitignore`
- `CHANGELOG.md` (once it exists)

**NEVER GOES TO GITHUB** (`.gitignore` enforces this):
- Any vault folder at repo root, regardless of name (`/vault/`, `/test-vault/`, `/example-vault/`, `/real-test/`, `/dogfood-*/`, `/*-vault/`)
- `.env`, `.env.*` — secrets, tokens, API keys
- `node_modules/`, `dist/`, `*.log`, `.DS_Store`
- Anything containing the user's real project content
- The user's Obsidian vault content — **lives in the user's Obsidian folder, NEVER mirrored to this repo**

**Vault location rule (added 2026-05-22 after a near-miss):** dogfood / test vaults should live OUTSIDE this repo. Prefer `C:/workspace/mdoffice-vaults/<name>/` or similar. If a vault must live inside the repo for some reason, add its exact name to `.gitignore` BEFORE the first `git add`. The maintainer once let `real-test/` slip into a commit; templates only, no harm, but don't repeat.

**LIVES IN USER'S OBSIDIAN VAULT** (separate from this repo):
- `Obsidian Vault/mdoffice/` — the user's writable workspace for thinking about this project: rules mirror, progress journal, brainstorms, decisions.
- This is the user's surface. Git-versioned separately by the user if they want.
- Claude updates files in this folder when the user asks, but does NOT commit them to the mdoffice repo.

If you're about to add a file and you're unsure which category it belongs to: ask.

## 7. Documentation sync

- `README.md` is for users. `NOTES.md` is for the author's working memory.
- When the concept changes, update both in the same commit.
- When v0.1 ships, write a `CHANGELOG.md`. Until then, NOTES.md is the changelog.

## 8. Testing

- Every command-line feature must have a smoke-test recipe in the commit message body.
- After implementing a command, run it from a clean state in a throwaway directory before committing.
- Clean up throwaway directories before staging — no `test-vault/` etc. in commits.

## 9. Working with the user

- The user prefers Korean for chat, English for code/commit messages/docs.
- User feedback in memory: "묻지말고 결과만 보여줄 것" — default to acting, not asking. But this CLAUDE.md overrides on destructive actions (force push, file deletion outside the working tree, npm publish).
- For force pushes, npm publish, secret-affecting changes: confirm before acting.
- Match the scope of actions to what was requested. Don't add features beyond the ask.

## 10. Platform-specific gotchas

### Windows / `wt`
- `wt` accepts `;` as command separator INSIDE one invocation. In cmd shell that needs `^;` escape; in PowerShell `\`;` or `--%`.
- When spawning via Node `child_process.spawn`, build the arg array explicitly — don't rely on shell quoting.
- Watch CRLF/LF on text files. `.gitattributes` may be needed.

### macOS
- iTerm2 must be running for AppleScript pane creation, or fall back to Terminal.app.
- `osascript` is the bridge. Wrap in `child_process.spawn('osascript', ['-e', script])`.
- Detect iTerm2 vs Terminal.app via `mdfind` or `defaults read`.
