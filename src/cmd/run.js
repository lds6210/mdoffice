'use strict';

const fs = require('fs');
const path = require('path');
const getSpawner = require('../spawn/index.js');
const engines = require('../engines/index.js');

/**
 * `mdoffice run "<task>" [--vault <path>] [--engine <name>] [--cmd <override>]`
 *
 * v0.1 behavior:
 *   1. Resolve the vault path (default: ./vault).
 *   2. Append the task as a new directive block to 00_ceo/instructions.md.
 *   3. Resolve the engine (default: claude-code) and verify it's installed.
 *   4. Spawn the Chief pane via the OS adapter, running the engine CLI in
 *      the vault root.
 *
 * The Chief reads vault/CLAUDE.md as its system prompt. Specialists are
 * defined in vault/.claude/agents/*.md and invoked by the Chief via the
 * Task tool. mdoffice does not call the LLM directly.
 */
module.exports = function run(args) {
  const opts = parseArgs(args);
  if (opts.help) { printRunHelp(); process.exit(0); }

  if (!opts.task) {
    console.error('mdoffice run: missing task.');
    console.error('  usage: mdoffice run "<task>" [--vault <path>] [--engine <name>]');
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

  const engine = engines.get(opts.engine || 'claude-code');
  if (!engine) {
    console.error(`mdoffice run: unknown engine '${opts.engine}'.`);
    console.error(`  available: ${engines.list().join(', ')}`);
    process.exit(1);
  }

  const check = engine.check();
  if (!check.ok) {
    console.error(`mdoffice run: ${engine.displayName} not available.`);
    console.error(`  ${check.reason}`);
    if (check.install) console.error(`  install: ${check.install}`);
    process.exit(2);
  }

  appendDirective(instructionsPath, opts.task);
  console.log(`✓ directive appended to ${instructionsPath}`);
  console.log(`✓ engine: ${engine.displayName} (${check.version})`);

  let spawner;
  try {
    spawner = getSpawner();
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const cmd = opts.cmdOverride || engine.cmd;
  const result = spawner({ vaultPath, command: cmd });
  console.log(`✓ office spawned (pid ${result.pid}, layout: ${result.layout})`);
  console.log(`  → Chief pane is opening now in your terminal.`);
  console.log(`  → Edit ${instructionsPath} any time to queue more directives.`);
};

function parseArgs(args) {
  const opts = { task: null, vault: null, engine: null, cmdOverride: null, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--vault' || a === '-V') opts.vault = args[++i];
    else if (a === '--engine' || a === '-e') opts.engine = args[++i];
    else if (a === '--cmd') opts.cmdOverride = args[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!opts.task) opts.task = a;
    else { console.error(`mdoffice run: unexpected argument '${a}'`); process.exit(1); }
  }
  return opts;
}

function appendDirective(filePath, task) {
  const now = new Date().toISOString();
  const block = `\n\n---\n## ${now}\n\n${task}\n`;
  fs.appendFileSync(filePath, block, 'utf8');
}

function printRunHelp() {
  console.log(`mdoffice run — spawn the Chief pane and queue a directive

usage:
  mdoffice run "<task>" [options]

options:
  --vault <path>    path to the vault (default: ./vault)
  --engine <name>   AI engine (default: claude-code, available: ${engines.list().join(', ')})
  --cmd <override>  override the engine's CLI command (rare, for testing)
  --help            show this help

example:
  mdoffice run "결제 모듈 어떻게 설계할지 정리 좀 도와줘"
  mdoffice run "이 spec 인터랙티브 프로토타입으로 뽑아줘" --vault ./my-project
`);
}
