'use strict';

const { spawn } = require('child_process');

/**
 * Spawn the office in Windows Terminal.
 *
 * Layout (v0.1, post pane-rethink):
 *   ┌─────────────────────────────┐
 *   │                             │
 *   │       chief (only pane)     │
 *   │                             │
 *   └─────────────────────────────┘
 *
 * Specialists are NOT spawned as panes — they run as Claude Code sub-agents
 * invoked by the Chief via the Task tool (defined in vault/.claude/agents/).
 * The user only ever talks to the Chief, in one window. Specialist outputs
 * land as markdown files in the vault.
 */
module.exports = function spawnOffice({ vaultPath, command }) {
  const cmd = command || 'claude';

  const args = [
    '-w', '0',
    'new-tab', '-d', vaultPath, '--title', 'mdoffice — chief', 'cmd', '/K', cmd,
  ];

  const child = spawn('wt', args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  child.on('error', (err) => {
    console.error(`mdoffice: failed to spawn 'wt': ${err.message}`);
    console.error("  is Windows Terminal installed and on PATH?");
    console.error('  install: https://aka.ms/terminal');
  });
  child.unref();
  return { pid: child.pid, layout: 'single chief pane' };
};
