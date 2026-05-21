'use strict';

const fs = require('fs');
const path = require('path');
const getSpawner = require('../spawn/index.js');
const engines = require('../engines/index.js');

/**
 * `mdoffice serve [vault] [--engine <name>] [--quiet]`
 *
 * Primary v0.1 operation mode. Spawns the Chief pane and stays alive watching
 * the vault for changes (purely for the user's host-shell visibility — the
 * Chief polls the vault on its own per its system prompt).
 *
 * Ctrl+C stops the watcher; the Chief pane is left running.
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

  const engine = engines.get(opts.engine || 'claude-code');
  if (!engine) {
    console.error(`mdoffice serve: unknown engine '${opts.engine}'.`);
    console.error(`  available: ${engines.list().join(', ')}`);
    process.exit(1);
  }

  const check = engine.check();
  if (!check.ok) {
    console.error(`mdoffice serve: ${engine.displayName} not available.`);
    console.error(`  ${check.reason}`);
    if (check.install) console.error(`  install: ${check.install}`);
    process.exit(2);
  }

  let spawner;
  try {
    spawner = getSpawner();
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const cmd = opts.cmdOverride || engine.cmd;
  const result = spawner({ vaultPath, command: cmd });
  console.log(`✓ engine: ${engine.displayName} (${check.version})`);
  console.log(`✓ chief pane spawned (pid ${result.pid})`);
  console.log(`  vault: ${vaultPath}`);
  console.log('');
  console.log('serve mode: watching the vault. edit 00_ceo/instructions.md to');
  console.log("queue directives; the Chief picks them up on its next read.");
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
  const opts = { vault: null, engine: null, cmdOverride: null, help: false, quiet: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--engine' || a === '-e') opts.engine = args[++i];
    else if (a === '--cmd') opts.cmdOverride = args[++i];
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
  --engine <name>   AI engine (default: claude-code, available: ${engines.list().join(', ')})
  --cmd <override>  override the engine's CLI command (rare, for testing)
  --vault <path>    vault path (alternative to positional arg)
  --quiet           don't print the file-change log
  --help            show this help

example:
  mdoffice serve my-project-vault
  mdoffice serve --vault my-project-vault --quiet
`);
}
