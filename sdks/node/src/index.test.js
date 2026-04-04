'use strict';

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { DevPulseClient } = require('./index.js');
const { buildFromError, buildFromMessage, parseStackTrace } = require('./payload.js');
const { Transport } = require('./transport.js');

// ── payload.js ────────────────────────────────────────────────────────────────

describe('buildFromError', () => {
  it('produces the correct level and platform', () => {
    const payload = buildFromError(new Error('test'));
    assert.equal(payload.level, 'error');
    assert.equal(payload.platform, 'node');
  });

  it('captures error type and message', () => {
    class CustomError extends Error {}
    const payload = buildFromError(new CustomError('custom'));
    assert.equal(payload.exception.type, 'CustomError');
    assert.equal(payload.exception.message, 'custom');
  });

  it('handles a non-Error thrown value', () => {
    const payload = buildFromError('string error');
    assert.equal(payload.exception.type, 'Error');
    assert.match(payload.exception.message, /string error/);
  });

  it('includes a timestamp', () => {
    const payload = buildFromError(new Error('ts'));
    assert.match(payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  });

  it('merges extra properties into the payload', () => {
    const payload = buildFromError(new Error('extra'), { environment: 'staging' });
    assert.equal(payload.environment, 'staging');
  });
});

describe('buildFromMessage', () => {
  it('defaults level to info', () => {
    const payload = buildFromMessage('hello');
    assert.equal(payload.level, 'info');
    assert.equal(payload.message, 'hello');
  });

  it('uses the supplied level', () => {
    const payload = buildFromMessage('warn me', 'warning');
    assert.equal(payload.level, 'warning');
  });
});

describe('parseStackTrace', () => {
  it('returns an empty array when stack is missing', () => {
    const err = new Error('no stack');
    err.stack = undefined;
    assert.deepEqual(parseStackTrace(err), []);
  });

  it('parses a standard Node.js stack frame', () => {
    const err = new Error('test');
    err.stack = [
      'Error: test',
      '    at myFunction (/app/src/server.js:42:10)',
    ].join('\n');
    const frames = parseStackTrace(err);
    assert.equal(frames.length, 1);
    assert.equal(frames[0].function, 'myFunction');
    assert.equal(frames[0].file, '/app/src/server.js');
    assert.equal(frames[0].line, 42);
  });
});

// ── Transport._parseDsn ───────────────────────────────────────────────────────

describe('Transport._parseDsn', () => {
  it('extracts the API key from the last path segment', () => {
    const { endpoint, apiKey } = Transport._parseDsn(
      'https://devpulse.example.com/api/ingest/myapikey123',
    );
    assert.equal(apiKey, 'myapikey123');
    assert.equal(endpoint, 'https://devpulse.example.com/api/ingest');
  });

  it('works with http DSNs', () => {
    const { endpoint, apiKey } = Transport._parseDsn(
      'http://localhost/api/ingest/localkey',
    );
    assert.equal(apiKey, 'localkey');
    assert.match(endpoint, /http:\/\/localhost/);
  });
});

// ── DevPulseClient ────────────────────────────────────────────────────────────

describe('DevPulseClient', () => {
  let client;
  let captured;

  beforeEach(() => {
    client   = new DevPulseClient();
    captured = [];

    client.init({ dsn: 'https://example.com/api/ingest/testkey123', captureUnhandled: false });

    // Stub transport to intercept payloads
    if (client._transport) {
      client._transport.send = async (payload) => { captured.push(payload); };
    }
  });

  it('captures an Error', async () => {
    await client.capture(new Error('boom'));
    assert.equal(captured.length, 1);
    assert.equal(captured[0].exception.message, 'boom');
  });

  it('captures a plain message', async () => {
    await client.captureMessage('hello world', 'info');
    assert.equal(captured.length, 1);
    assert.equal(captured[0].message, 'hello world');
    assert.equal(captured[0].level, 'info');
  });

  it('deduplicates the same error within 2 seconds', async () => {
    const err = new Error('dup');
    await client.capture(err);
    await client.capture(err);
    assert.equal(captured.length, 1);
  });

  it('sends again after the dedup window expires', async () => {
    const err = new Error('delayed dup');
    await client.capture(err);
    client._lastError.time = Date.now() - 3000;
    await client.capture(err);
    assert.equal(captured.length, 2);
  });

  it('attaches user context to captured events', async () => {
    client.setUser({ id: 42, email: 'user@example.com' });
    await client.capture(new Error('with user'));
    assert.deepEqual(captured[0].user, { id: 42, email: 'user@example.com' });
  });

  it('clears user context after clearUser()', async () => {
    client.setUser({ id: 1 });
    client.clearUser();
    await client.capture(new Error('no user'));
    assert.equal(captured[0].user, null);
  });

  it('drops events when beforeSend returns null', async () => {
    client._config.beforeSend = () => null;
    await client.capture(new Error('dropped'));
    assert.equal(captured.length, 0);
  });

  it('sends modified payload from beforeSend', async () => {
    client._config.beforeSend = (e) => ({ ...e, level: 'warning' });
    await client.capture(new Error('modified'));
    assert.equal(captured[0].level, 'warning');
  });

  it('does nothing when not initialised', async () => {
    const uninit = new DevPulseClient();
    await uninit.capture(new Error('no-op'));
    // No error thrown, nothing captured
    assert.equal(captured.length, 0);
  });
});

// ── errorHandler middleware ───────────────────────────────────────────────────

describe('errorHandler middleware', () => {
  it('returns a 4-argument function', () => {
    const client = new DevPulseClient();
    client.init({ dsn: 'https://example.com/api/ingest/testkey', captureUnhandled: false });
    const handler = client.errorHandler();
    assert.equal(typeof handler, 'function');
    assert.equal(handler.length, 4);
  });

  it('calls next() with the error', async () => {
    const client = new DevPulseClient();
    client.init({ dsn: 'https://example.com/api/ingest/testkey', captureUnhandled: false });
    if (client._transport) client._transport.send = async () => {};

    const handler = client.errorHandler();
    const err     = new Error('express error');
    const req     = { method: 'GET', url: '/test', headers: { authorization: 'Bearer secret' } };
    const res     = {};
    let nextCalled = null;

    await new Promise((resolve) => {
      handler(err, req, res, (e) => { nextCalled = e; resolve(); });
    });

    assert.equal(nextCalled, err);
  });
});
