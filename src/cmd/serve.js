'use strict';

const fs = require('fs');
const path = require('path');
const getSpawner = require('../spawn/index.js');

/**
 * `mdoffice serve [vault] [--cmd <ai-cli>] [--quiet]`
 *
 * Primary v0.1 operation mode. Same as `run` except:
 *   - no directive is appended (the user adds directives any time by editing
 *     00_ceo/instructions.md in their editor of choice — Obsidian, VS Code, etc.)
 *   - the process stays alive and watches the vault for file changes,
 *     printing a live log of what's happening
 *   - Ctrl+C stops the watcher; the Chief pane is left running
 *
 * The Chief itself polls the vault on its own (per its system prompt in
 * vault/CLAUDE.md). This watcher is purely for the user's visibility — so
 * they can see, from their host shell, what the office is doing without
 * tab-switching to the Chief pane.
 */
module.exports = function serve(args) {
  const opts = parseArgs(args);
  if (opts.help) { printServeHelp(); process.exit(0); }

  const vaultPath = path.resolve(opts.vault || 'vault');
  if (!fs.existsSync(vaultPath)) {
    console.error(`mdoffice serve: vault not found at ${vaultPath}`);
    console.error("  run 'mdoffice init' to create one, or pass the vault path.");
    process.exit(1);
  }

  let spawner;
  try {
    spawner = getSpawner();
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const result = spawner({ vaultPath, command: opts.cmd });
  console.log(`✓ chief pane spawned (pid ${result.pid})`);
  console.log(`  vault: ${vaultPath}`);
  console.log('');
  console.log('serve mode: watching the vault. edit 00_ceo/instructions.md to');
  console.log("queue directives; the Chief will pick them up on its own poll.");
  console.log('Ctrl+C stops the watcher. The Chief pane is left running.');
  console.log('');

  startWatcher(vaultPath, opts.quiet);
};

function startWatcher(vaultPath, quiet) {
  let watcher;
  try {
    watcher = fs.watch(vaultPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      if (shouldIgnore(filename)) return;
      if (quiet) return;
      const ts = new Date().toISOString();
      const norm = filename.split(path.sep).join('/');
      console.log(`[${ts}] ${eventType.padEnd(7)} ${norm}`);
    });
  } catch (err) {
    console.error(`mdoffice serve: cannot watch vault: ${err.message}`);
    console.error("  recursive fs.watch may not be supported on this platform.");
    console.error("  the Chief pane is running; you can ignore this and use the");
    console.error("  vault from Obsidian/VS Code directly.");
    process.exit(3);
  }

  const stop = () => {
    console.log('\nserve: stopping watcher. Chief pane left running.');
    try { watcher.close(); } catch (_) {}
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  // Keep the event loop alive. setInterval is the cleanest cross-platform
  // way; the callback is intentionally a no-op.
  setInterval(() => {}, 1 << 30);
}

const IGNORE_FRAGMENTS = ['node_modules', '.git', '.DS_Store', '.obsidian'];
function shouldIgnore(filename) {
  for (const frag of IGNORE_FRAGMENTS) {
    if (filename.includes(frag)) return true;
  }
  return false;
}

function parseArgs(args) {
  const opts = { vault: null, cmd: null, help: false, quiet: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--cmd' || a === '-c') opts.cmd = args[++i];
    else if (a === '--vault' || a === '-V') opts.vault = args[++i];
    else if (a === '--quiet' || a === '-q') opts.quiet = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!opts.vault) opts.vault = a;
  }
  return opts;
}

function printServeHelp() {
  console.log(`mdoffice serve — keep the office running, watch the vault

usage:
  mdoffice serve [vault] [options]

options:
  --cmd <ai-cli>    AI CLI to launch in the chief pane (default: claude)
  --vault <path>    vault path (alternative to positional arg)
  --quiet           don't print the file-change log
  --help            show this help

example:
  mdoffice serve my-project-vault
  mdoffice serve --vault my-project-vault --quiet
`);
}
