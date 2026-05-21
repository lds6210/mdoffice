'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates', 'vault');

module.exports = function init(args) {
  const target = path.resolve(args[0] || 'vault');

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
  console.log(`  2. run   mdoffice serve  (once implemented) to start the office`);
};

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
