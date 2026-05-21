'use strict';

const fs = require('fs');
const path = require('path');
const engines = require('../engines/index.js');
const { obsidianUriFor, openUri } = require('./open.js');

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates', 'vault');

module.exports = function init(args) {
  const opts = parseArgs(args);
  if (opts.help) { printInitHelp(); process.exit(0); }

  const target = path.resolve(opts.target || 'vault');

  // Engine selection (v0.1: claude-code default; CLI flag lets us future-proof
  // even before codex / gemini adapters ship).
  const engineName = opts.engine || 'claude-code';
  const engine = engines.get(engineName);
  if (!engine) {
    console.error(`mdoffice init: unknown engine '${engineName}'.`);
    console.error(`  available engines: ${engines.list().join(', ')}`);
    process.exit(1);
  }

  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    console.error(`mdoffice init: ${target} already exists and is not empty`);
    process.exit(1);
  }

  // Engine check is informative, not blocking — the user might be scaffolding
  // a vault before they install the engine. Print the result either way.
  const check = engine.check();
  if (check.ok) {
    console.log(`✓ engine: ${engine.displayName} (${check.version})`);
  } else {
    console.log(`⚠ engine: ${engine.displayName} NOT found.`);
    console.log(`  ${check.reason}`);
    if (check.install) console.log(`  install: ${check.install}`);
    console.log('  (vault will still be scaffolded — install the engine before running serve / run)');
  }

  fs.mkdirSync(target, { recursive: true });
  copyDir(TEMPLATES_DIR, target);

  console.log('');
  console.log(`✓ vault initialized at ${target}`);
  console.log('');
  console.log('next steps:');
  console.log(`  1. drop your spec (if any) into  ${path.join(target, '00_ceo', 'spec', '')}`);
  console.log(`  2. write a fuzzy directive in    ${path.join(target, '00_ceo', 'instructions.md')}`);
  console.log(`  3. run  mdoffice serve ${path.relative(process.cwd(), target) || target}`);
  console.log('');
  console.log('open in Obsidian (recommended):');
  console.log(`  ${obsidianUriFor(target)}`);
  console.log(`  or run: mdoffice open ${path.relative(process.cwd(), target) || target}`);

  if (opts.openObsidian) {
    console.log('');
    console.log('opening in Obsidian now...');
    openUri(obsidianUriFor(target));
  }
};

function parseArgs(args) {
  const opts = { target: null, openObsidian: false, engine: null, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--obsidian' || a === '--open') opts.openObsidian = true;
    else if (a === '--engine' || a === '-e') opts.engine = args[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!opts.target) opts.target = a;
  }
  return opts;
}

function printInitHelp() {
  console.log(`mdoffice init — scaffold a new vault

usage:
  mdoffice init [path] [options]

options:
  --engine <name>   AI engine to scaffold for (default: claude-code)
                    available: ${engines.list().join(', ')}
  --obsidian        also open the vault in Obsidian after scaffolding
  --help            show this help

example:
  mdoffice init my-project-vault
  mdoffice init my-project-vault --obsidian
`);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
