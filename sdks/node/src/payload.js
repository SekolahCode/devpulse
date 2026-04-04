'use strict';

/**
 * Parse a Node.js Error (or any thrown value) into the DevPulse ingest payload
 * shape, mirroring the structure used by the browser SDK.
 */

/**
 * @param {Error} error
 * @returns {Array<{file?: string, line?: number, function?: string}>}
 */
function parseStackTrace(error) {
  if (!error || typeof error.stack !== 'string') return [];

  return error.stack
    .split('\n')
    .slice(1) // skip the first line — it's the error message
    .map((line) => {
      const trimmed = line.trim();
      // Format: "at FunctionName (file:line:col)" or "at file:line:col"
      const match =
        trimmed.match(/^at (?:(.+?) \((.+):(\d+):\d+\)|(.+):(\d+):\d+)$/) ||
        trimmed.match(/^at (.+):(\d+):\d+$/);

      if (!match) return null;

      const [, fnName, file1, line1, file2, line2] = match;
      return {
        function: fnName   ?? null,
        file:     (file1 ?? file2) ?? null,
        line:     parseInt(line1 ?? line2, 10) || null,
      };
    })
    .filter(Boolean);
}

/**
 * Build a DevPulse ingest payload from an Error or thrown value.
 *
 * @param {unknown} error
 * @param {object}  [extra={}]
 * @returns {object}
 */
function buildFromError(error, extra = {}) {
  const err = error instanceof Error ? error : new Error(String(error));

  return {
    level: 'error',
    exception: {
      type:       err.constructor?.name ?? 'Error',
      message:    err.message,
      stacktrace: parseStackTrace(err),
    },
    timestamp:   new Date().toISOString(),
    platform:    'node',
    ...extra,
  };
}

/**
 * Build a DevPulse ingest payload from a plain message.
 *
 * @param {string} message
 * @param {string} [level='info']
 * @param {object} [extra={}]
 * @returns {object}
 */
function buildFromMessage(message, level = 'info', extra = {}) {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    platform:  'node',
    ...extra,
  };
}

module.exports = { buildFromError, buildFromMessage, parseStackTrace };
