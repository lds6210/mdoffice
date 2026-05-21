'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * `mdoffice open [vault-path]`
 *
 * Opens the vault in Obsidian via the `obsidian://open?path=<...>` URI.
 * The OS routes the URI to Obsidian if installed; if not, the user sees
 * the OS's "no app for this URL" dialog and a hint to install Obsidian.
 *
 * Defaults to ./vault if no path given.
 */
module.exports = function open(args) {
  const opts = parseArgs(args);
  if (opts.help) { printOpenHelp(); process.exit(0); }

  const vaultPath = path.resolve(opts.vault || 'vault');
  if (!fs.existsSync(vaultPath)) {
    console.error(`mdoffice open: vault not found at ${vaultPath}`);
    console.error("  run 'mdoffice init' first, or pass the vault path explicitly.");
    process.exit(1);
  }

  const uri = obsidianUriFor(vaultPath);
  console.log(`opening ${vaultPath} in Obsidian...`);
  console.log(`  uri: ${uri}`);

  const opened = openUri(uri);
  if (!opened) {
    console.error('mdoffice open: could not invoke the OS URI handler.');
    console.error(`  manually open this URI: ${uri}`);
    console.error('  if Obsidian is not installed, get it at https://obsidian.md');
    process.exit(2);
  }
};

function obsidianUriFor(vaultPath) {
  // Use the `path` query so Obsidian opens the folder as a vault even if
  // it hasn't been registered yet. This is the most forgiving form.
  return `obsidian://open?path=${encodeURIComponent(vaultPath)}`;
}

function openUri(uri) {
  const p = process.platform;
  let cmd, args;
  if (p === 'win32') {
    // 'start' is a cmd builtin; the empty "" is a title placeholder so the
    // URI isn't interpreted as the window title.
    cmd = 'cmd';
    args = ['/c', 'start', '""', uri];
  } else if (p === 'darwin') {
    cmd = 'open';
    args = [uri];
  } else {
    // linux: xdg-open is the standard fallback even though Linux isn't a
    // first-class spawn target in v0.1 — opening a URI is harmless.
    cmd = 'xdg-open';
    args = [uri];
  }

  try {
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    child.on('error', () => {});
    child.unref();
    return true;
  } catch (_) {
    return false;
  }
}

function parseArgs(args) {
  const opts = { vault: null, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (!opts.vault) opts.vault = a;
  }
  return opts;
}

function printOpenHelp() {
  console.log(`mdoffice open — open the vault in Obsidian

usage:
  mdoffice open [vault-path]

If Obsidian isn't installed, the OS will show its standard "no app" dialog.
Get Obsidian at https://obsidian.md (free for personal use).
`);
}

// Exported for reuse by other commands (e.g. 'init' can offer to open).
module.exports.obsidianUriFor = obsidianUriFor;
module.exports.openUri = openUri;
