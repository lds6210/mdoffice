'use strict';

const fs = require('fs');
const path = require('path');
const getSpawner = require('../spawn/index.js');

/**
 * `mdoffice run "<task>" [--vault <path>] [--cmd <ai-cli>]`
 *
 * v0.1 behavior:
 *   1. Resolve the vault path (default: ./vault).
 *   2. Append the task as a new directive block to 00_ceo/instructions.md.
 *   3. Spawn the office (Chief + Backend + Frontend panes) via the OS adapter.
 *
 * The Chief/specialist agents themselves are NOT yet wired up in this chunk
 * — this command opens the panes and primes the directive file. Auto
 * delegation lands in the next chunk (Chief system prompt + vault watcher).
 */
module.exports = function run(args) {
  const opts = parseArgs(args);

  if (!opts.task) {
    console.error('mdoffice run: missing task.');
    console.error('  usage: mdoffice run "<task>" [--vault <path>] [--cmd <ai-cli>]');
    process.exit(1);
  }

  const vaultPath = path.resolve(opts.vault || 'vault');
  if (!fs.existsSync(vaultPath)) {
    console.error(`mdoffice run: vault not found at ${vaultPath}`);
    console.error("  run 'mdoffice init' to create one, or pass --vault <path>.");
    process.exit(1);
  }

  const instructionsPath = path.join(vaultPath, '00_ceo', 'instructions.md');
  if (!fs.existsSync(instructionsPath)) {
    console.error(`mdoffice run: ${instructionsPath} is missing.`);
    console.error('  this vault may be from an older mdoffice version. Re-init it.');
    process.exit(1);
  }

  appendDirective(instructionsPath, opts.task);
  console.log(`✓ directive appended to ${instructionsPath}`);

  let spawner;
  try {
    spawner = getSpawner();
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const result = spawner({ vaultPath, command: opts.cmd });
  console.log(`✓ office spawned (pid ${result.pid}, layout: ${result.layout})`);
  console.log('  → Chief, Backend, Frontend panes are opening now.');
  console.log(`  → Edit ${instructionsPath} any time to add more directives.`);
};

function parseArgs(args) {
  const opts = { task: null, vault: null, cmd: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--vault' || a === '-V') {
      opts.vault = args[++i];
    } else if (a === '--cmd' || a === '-c') {
      opts.cmd = args[++i];
    } else if (a === '--help' || a === '-h') {
      printRunHelp();
      process.exit(0);
    } else if (!opts.task) {
      opts.task = a;
    } else {
      console.error(`mdoffice run: unexpected argument '${a}'`);
      process.exit(1);
    }
  }
  return opts;
}

function appendDirective(filePath, task) {
  const now = new Date().toISOString();
  const block = `\n\n---\n## ${now}\n\n${task}\n`;
  fs.appendFileSync(filePath, block, 'utf8');
}

function printRunHelp() {
  console.log(`mdoffice run — spawn the office and queue a directive

usage:
  mdoffice run "<task>" [options]

options:
  --vault <path>    path to the vault (default: ./vault)
  --cmd <ai-cli>    AI CLI to launch in each pane (default: claude)
  --help            show this help

example:
  mdoffice run "ship the payment module"
  mdoffice run "fix the login bug" --vault ./my-project-vault
`);
}
