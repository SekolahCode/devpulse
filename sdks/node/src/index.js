'use strict';

const { Transport }                    = require('./transport');
const { buildFromError, buildFromMessage } = require('./payload');

/**
 * DevPulse Node.js SDK.
 *
 * Usage:
 *   const { DevPulse } = require('@sekolahcode/devpulse-node');
 *   DevPulse.init({ dsn: 'https://example.com/api/ingest/<key>' });
 */
class DevPulseClient {
  constructor() {
    this._transport = null;
    this._config    = {};
    this._user      = null;
    this._breadcrumbs = [];
    this._installed = false;
    this._lastError = null; // { hash, time } — burst deduplication
  }

  /**
   * Initialise the SDK. Must be called before any capture methods.
   *
   * @param {import('./index.d.ts').DevPulseNodeConfig} config
   */
  init(config = {}) {
    if (!config.dsn) {
      console.warn('[DevPulse] dsn is required');
      return;
    }

    this._config = {
      dsn:              config.dsn,
      environment:      config.environment  ?? 'production',
      release:          config.release      ?? null,
      enabled:          config.enabled      ?? true,
      timeout:          config.timeout      ?? 3000,
      beforeSend:       config.beforeSend   ?? null,
      captureUnhandled: config.captureUnhandled ?? true,
    };

    if (!this._config.enabled) return;

    this._transport = new Transport(this._config.dsn, this._config.timeout);

    if (this._config.captureUnhandled) {
      this._installHandlers();
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Capture an Error or any thrown value.
   *
   * @param {unknown} error
   * @param {object}  [extra={}]
   * @returns {Promise<void>}
   */
  async capture(error, extra = {}) {
    if (!this._transport || !this._config.enabled) return;

    const err  = error instanceof Error ? error : new Error(String(error));
    const hash = `${err.name}:${err.message}`;
    const now  = Date.now();

    // Drop burst duplicates within 2 s
    if (this._lastError && this._lastError.hash === hash && now - this._lastError.time < 2000) {
      return;
    }
    this._lastError = { hash, time: now };

    let payload = {
      ...buildFromError(error, extra),
      user:         this._user,
      environment:  this._config.environment,
      release:      this._config.release,
      breadcrumbs:  [...this._breadcrumbs],
    };

    payload = await this._runBeforeSend(payload);
    if (!payload) return;

    this._send(payload);
  }

  /**
   * Capture a plain message at the given severity level.
   *
   * @param {string} message
   * @param {string} [level='info']
   * @param {object} [extra={}]
   * @returns {Promise<void>}
   */
  async captureMessage(message, level = 'info', extra = {}) {
    if (!this._transport || !this._config.enabled) return;

    let payload = {
      ...buildFromMessage(message, level, extra),
      user:        this._user,
      environment: this._config.environment,
      release:     this._config.release,
      breadcrumbs: [...this._breadcrumbs],
    };

    payload = await this._runBeforeSend(payload);
    if (!payload) return;

    this._send(payload);
  }

  /**
   * @param {object} user
   */
  setUser(user) {
    this._user = user;
  }

  clearUser() {
    this._user = null;
  }

  /**
   * Manually add a breadcrumb.
   *
   * @param {{ category?: string, message?: string, level?: string, data?: object }} crumb
   */
  addBreadcrumb(crumb) {
    this._breadcrumbs.push({ timestamp: new Date().toISOString(), ...crumb });
    const max = this._config.maxBreadcrumbs ?? 20;
    if (this._breadcrumbs.length > max) {
      this._breadcrumbs.shift();
    }
  }

  /**
   * Returns an Express/Connect-compatible error handler middleware.
   * Mount it after all other middleware:
   *   app.use(DevPulse.errorHandler());
   *
   * @returns {Function}
   */
  errorHandler() {
    const self = this;
    // eslint-disable-next-line no-unused-vars
    return function devPulseErrorHandler(err, req, res, next) {
      self.capture(err, {
        request: {
          method:  req.method,
          url:     req.url,
          headers: _scrubHeaders(req.headers),
        },
      });
      next(err);
    };
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  _installHandlers() {
    if (this._installed) return;
    this._installed = true;

    process.on('uncaughtException', (err) => {
      this.capture(err, { context: { type: 'uncaughtException' } });
    });

    process.on('unhandledRejection', (reason) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      this.capture(err, { context: { type: 'unhandledRejection' } });
    });
  }

  /**
   * @param {object} payload
   * @returns {Promise<object|null>}
   */
  async _runBeforeSend(payload) {
    if (!this._config.beforeSend) return payload;
    try {
      const result = await this._config.beforeSend(payload);
      return result ?? null;
    } catch {
      return payload;
    }
  }

  /**
   * @param {object} payload
   */
  _send(payload) {
    this._transport.send(payload).catch((err) => {
      // Never let transport errors surface to the host process
      console.warn('[DevPulse] Failed to send event:', err.message);
    });
  }
}

/**
 * Strip common sensitive header names before including them in payloads.
 *
 * @param {object} headers
 * @returns {object}
 */
function _scrubHeaders(headers) {
  const SENSITIVE = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key']);
  const result = {};
  for (const [k, v] of Object.entries(headers || {})) {
    result[k] = SENSITIVE.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return result;
}

const DevPulse = new DevPulseClient();

module.exports = { DevPulse, DevPulseClient };
