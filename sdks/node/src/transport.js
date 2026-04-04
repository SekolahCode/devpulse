'use strict';

const https = require('node:https');
const http  = require('node:http');
const { URL } = require('node:url');

/**
 * Minimal HTTP transport for the Node.js SDK.
 *
 * DSN format: https://<host>/api/ingest/<api_key>
 * The API key is extracted from the path and sent as the X-API-Key header so
 * it never appears in server access logs or proxy logs.
 */
class Transport {
  /**
   * @param {string} dsn
   * @param {number} [timeout=3000]
   */
  constructor(dsn, timeout = 3000) {
    const parsed = Transport._parseDsn(dsn);
    this.endpoint = parsed.endpoint;
    this.apiKey   = parsed.apiKey;
    this.timeout  = timeout;
  }

  /**
   * @param {string} dsn
   * @returns {{ endpoint: string, apiKey: string }}
   */
  static _parseDsn(dsn) {
    const url   = new URL(dsn);
    const parts = url.pathname.split('/');
    const apiKey = parts.pop() || '';
    url.pathname = parts.join('/');
    return { endpoint: url.toString(), apiKey };
  }

  /**
   * Send a payload object. Returns a Promise that resolves when the request
   * completes (or rejects on network error). Errors are swallowed by the
   * caller so they never crash the host process.
   *
   * @param {object} payload
   * @returns {Promise<void>}
   */
  send(payload) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload);
      const url  = new URL(this.endpoint);
      const lib  = url.protocol === 'https:' ? https : http;

      const options = {
        hostname: url.hostname,
        port:     url.port || (url.protocol === 'https:' ? 443 : 80),
        path:     url.pathname,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-API-Key':      this.apiKey,
        },
        timeout: this.timeout,
      };

      const req = lib.request(options, (res) => {
        // Drain the response body to free the socket
        res.resume();
        res.on('end', resolve);
      });

      req.on('timeout', () => { req.destroy(); reject(new Error('DevPulse: request timeout')); });
      req.on('error',   reject);
      req.write(body);
      req.end();
    });
  }
}

module.exports = { Transport };
