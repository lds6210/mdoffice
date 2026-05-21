'use strict';

/**
 * Engine registry.
 *
 * mdoffice's bet: the AI CLI engine (Claude Code today; Codex / Gemini /
 * something else tomorrow) is a swappable part. The vault is the user's
 * asset. Engines are how that asset reaches an LLM.
 *
 * v0.1 ships with Claude Code only. v0.2+ will add codex and gemini once
 * the patterns prove out on the first adapter.
 */
const ENGINES = {
  'claude-code': require('./claude-code.js'),
  // 'codex':    require('./codex.js'),     // v0.2+
  // 'gemini':   require('./gemini.js'),    // v0.2+
};

module.exports = {
  list:    () => Object.keys(ENGINES),
  get:     (name) => ENGINES[name] || null,
  default: () => ENGINES['claude-code'],
};
