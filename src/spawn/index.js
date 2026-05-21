'use strict';

/**
 * Pick the right spawn adapter for the current OS.
 * Throws a clear error if no adapter exists for this platform.
 */
module.exports = function getSpawner() {
  const p = process.platform;
  if (p === 'win32')  return require('./windows.js');
  if (p === 'darwin') return require('./mac.js');
  const err = new Error(
    `mdoffice: no spawn adapter for platform '${p}' yet.\n` +
    `         Windows and macOS are supported in v0.1.\n` +
    `         Linux support is planned for v0.2+.`
  );
  err.code = 'ENOSPAWN';
  throw err;
};
