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
  init:  '../src/cmd/init.js',
  run:   '../src/cmd/run.js',
  open:  '../src/cmd/open.js',
  serve: '../src/cmd/serve.js',
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
  mdoffice init [path] [--engine <name>] [--obsidian]   scaffold a vault
  mdoffice run "<task>" [--engine <name>]               spawn the Chief and append a directive (one-shot)
  mdoffice serve [vault] [--engine <name>]              spawn the Chief and watch the vault (primary mode)
  mdoffice open [vault]                                 open the vault in Obsidian

  mdoffice version               print version
  mdoffice help                  print this help

docs: https://github.com/lds6210/mdoffice
`);
}
