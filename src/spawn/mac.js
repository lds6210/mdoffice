'use strict';

const { spawn } = require('child_process');

/**
 * Spawn the office in iTerm2 on macOS.
 *
 * Layout (v0.1, post pane-rethink):
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │       chief (only pane)     │
 *   │                             │
 *   └─────────────────────────────┘
 *
 * Specialists are Claude Code sub-agents (defined in vault/.claude/agents/),
 * not panes. The Chief invokes them via the Task tool.
 *
 * NOTE: Untested on macOS at time of writing. Validation pass needed before
 * v0.1 ships.
 */
module.exports = function spawnOffice({ vaultPath, command }) {
  const cmd = command || 'claude';

  // AppleScript single-quote escape: ' -> '\''
  const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

  const script = [
    'tell application "iTerm"',
    '  activate',
    '  set newWindow to (create window with default profile)',
    '  tell current session of current tab of newWindow',
    '    set name to "mdoffice — chief"',
    `    write text "cd ${q(vaultPath)} && ${cmd}"`,
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
  return { pid: child.pid, layout: 'single chief pane' };
};
