'use strict';

const fs = require('fs');
const path = require('path');
const { obsidianUriFor, openUri } = require('./open.js');

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates', 'vault');

module.exports = function init(args) {
  const opts = parseArgs(args);
  const target = path.resolve(opts.target || 'vault');

  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    console.error(`mdoffice init: ${target} already exists and is not empty`);
    process.exit(1);
  }

  fs.mkdirSync(target, { recursive: true });
  copyDir(TEMPLATES_DIR, target);

  console.log(`✓ vault initialized at ${target}`);
  console.log('');
  console.log('next steps:');
  console.log(`  1. edit  ${path.join(target, '00_ceo', 'instructions.md')}  with your first directive`);
  console.log(`  2. run   mdoffice run "<task>"  to spawn the office`);
  console.log('');
  console.log('open in Obsidian (recommended — the vault is built around markdown editing):');
  console.log(`  ${obsidianUriFor(target)}`);
  console.log(`  or run: mdoffice open ${path.relative(process.cwd(), target) || target}`);

  if (opts.openObsidian) {
    console.log('');
    console.log('attempting to open in Obsidian now...');
    openUri(obsidianUriFor(target));
  }
};

function parseArgs(args) {
  const opts = { target: null, openObsidian: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--obsidian' || a === '--open') opts.openObsidian = true;
    else if (!opts.target) opts.target = a;
  }
  return opts;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
