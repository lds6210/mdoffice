#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
  printHelp();
  process.exit(cmd ? 0 : 1);
}

if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
  console.log(require('../package.json').version);
  process.exit(0);
}

const handlers = {
  init: '../src/cmd/init.js',
  run:  '../src/cmd/run.js',
  open: '../src/cmd/open.js',
  // serve:  '../src/cmd/serve.js',   // wired later
  // chief:  '../src/cmd/chief.js',   // wired later
};

if (!(cmd in handlers)) {
  console.error(`mdoffice: unknown command '${cmd}'`);
  console.error("run 'mdoffice help' to see available commands");
  process.exit(1);
}

require(handlers[cmd])(args.slice(1));

function printHelp() {
  console.log(`mdoffice — markdown-native AI company

usage:
  mdoffice init [path] [--obsidian]   scaffold a vault at <path> (default: ./vault)
  mdoffice run "<task>"               spawn the office (Chief pane) and queue a directive
  mdoffice open [vault]               open the vault in Obsidian
  mdoffice serve                      (not yet implemented)
  mdoffice chief                      (not yet implemented)

  mdoffice version               print version
  mdoffice help                  print this help

docs: https://github.com/lds6210/mdoffice
`);
}
