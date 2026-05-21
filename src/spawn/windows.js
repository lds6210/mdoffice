'use strict';

const { spawn } = require('child_process');
const path = require('path');

/**
 * Spawn the office in Windows Terminal.
 * Layout (v0.1):
 *   ┌──────────┬──────────┐
 *   │          │ backend  │
 *   │  chief   ├──────────┤
 *   │          │ frontend │
 *   └──────────┴──────────┘
 *
 * Each pane runs `command` (default: "claude") in its role's vault subfolder.
 * Pane titles are set so the user can tell them apart at a glance.
 */
module.exports = function spawnOffice({ vaultPath, command }) {
  const cmd = command || 'claude';

  const chiefDir    = vaultPath;
  const backendDir  = path.join(vaultPath, '20_team', 'backend');
  const frontendDir = path.join(vaultPath, '20_team', 'frontend');

  // `wt` accepts `;` as a command separator between sub-actions in one
  // invocation. When passed via Node child_process arg array (shell: false),
  // the literal `;` token is passed through as its own argv element and wt
  // parses it correctly.
  const args = [
    '-w', '0',
    'new-tab',    '-d', chiefDir,    '--title', 'chief',    'cmd', '/K', cmd,
    ';',
    'split-pane', '-V', '-d', backendDir,  '--title', 'backend',  'cmd', '/K', cmd,
    ';',
    'split-pane', '-H', '-d', frontendDir, '--title', 'frontend', 'cmd', '/K', cmd,
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
  return { pid: child.pid, layout: 'chief | (backend / frontend)' };
};
