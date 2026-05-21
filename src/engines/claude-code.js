'use strict';

const { spawnSync } = require('child_process');

/**
 * Engine adapter for Claude Code.
 *
 * mdoffice doesn't call Claude itself — it spawns the user's installed
 * `claude` CLI in the vault directory. Claude Code then reads the vault's
 * CLAUDE.md as its system prompt and uses .claude/agents/*.md as
 * sub-agent definitions. The adapter's job is:
 *
 *   1. Tell the user where Claude Code came from / whether it's installed.
 *   2. Provide the spawn command + cwd convention.
 *   3. (Future) point to engine-specific template variations.
 */
module.exports = {
  name: 'claude-code',
  displayName: 'Claude Code',
  cmd: 'claude',
  installUrl: 'https://docs.claude.com/en/docs/claude-code',

  /**
   * Verify the engine is reachable. Returns { ok, version?, reason?, install? }.
   * Does NOT verify authentication — Claude Code handles its own auth flow on
   * first run if not logged in, and we don't want to duplicate that logic.
   */
  check() {
    const result = spawnSync(this.cmd, ['--version'], {
      stdio: 'pipe',
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });

    if (result.error) {
      return {
        ok: false,
        reason: `'${this.cmd}' not found on PATH (${result.error.code || result.error.message})`,
        install: this.installUrl,
      };
    }
    if (result.status !== 0) {
      return {
        ok: false,
        reason: `'${this.cmd} --version' exited with code ${result.status}`,
        install: this.installUrl,
      };
    }
    return {
      ok: true,
      version: (result.stdout || '').trim() || 'unknown',
    };
  },
};
