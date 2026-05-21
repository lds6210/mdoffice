'use strict';

const { spawn } = require('child_process');
const path = require('path');

/**
 * Spawn the office in iTerm2 on macOS.
 * Layout (v0.1):
 *   ┌──────────┬──────────┐
 *   │          │ backend  │
 *   │  chief   ├──────────┤
 *   │          │ frontend │
 *   └──────────┴──────────┘
 *
 * Requires iTerm2. Terminal.app fallback lands in a later v0.1 patch if
 * users without iTerm2 hit issues.
 *
 * NOTE: Untested on macOS at time of writing — author works on Windows.
 * macOS validation pass needed before v0.1 ships.
 */
module.exports = function spawnOffice({ vaultPath, command }) {
  const cmd = command || 'claude';

  const chiefDir    = vaultPath;
  const backendDir  = path.join(vaultPath, '20_team', 'backend');
  const frontendDir = path.join(vaultPath, '20_team', 'frontend');

  // AppleScript single-quote escape: ' -> '\''
  const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

  // Each `write text` enters a shell command in the pane and runs it.
  // `set name` sets the pane title.
  const script = [
    'tell application "iTerm"',
    '  activate',
    '  set newWindow to (create window with default profile)',
    '  tell current session of current tab of newWindow',
    '    set name to "chief"',
    `    write text "cd ${q(chiefDir)} && ${cmd}"`,
    '    set backendSession to (split vertically with default profile)',
    '  end tell',
    '  tell backendSession',
    '    set name to "backend"',
    `    write text "cd ${q(backendDir)} && ${cmd}"`,
    '    set frontendSession to (split horizontally with default profile)',
    '  end tell',
    '  tell frontendSession',
    '    set name to "frontend"',
    `    write text "cd ${q(frontendDir)} && ${cmd}"`,
    '  end tell',
    'end tell',
  ].join('\n');

  const child = spawn('osascript', ['-e', script], {
    detached: true,
    stdio: 'ignore',
  });
  child.on('error', (err) => {
    console.error(`mdoffice: failed to spawn osascript: ${err.message}`);
    console.error('  is iTerm2 installed and accessible to AppleScript?');
  });
  child.unref();
  return { pid: child.pid, layout: 'chief | (backend / frontend)' };
};
