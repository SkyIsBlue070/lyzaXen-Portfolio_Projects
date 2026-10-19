import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, MAX_BYTES } from '../netlify/functions/contact.mjs';
import { deploymentEnvironment } from '../netlify/contact-settings.mjs';

const ORIGIN = 'https://lyzaxen.example';
const env = { SITE_ORIGIN: ORIGIN, FORMSPREE_FORM_ID: 'abcd1234' };
const good = { name: 'Asha Rao', email: 'asha@example.com', service: 'Website or web app', message: 'I need a small website for my bakery with a menu page.', consent: true, website: '' };

function req(body, { origin = ORIGIN, method = 'POST', type = 'application/json', site = 'same-origin', raw } = {}) {
  const headers = { 'content-type': type };
  if (origin) headers.origin = origin;
  if (site) headers['sec-fetch-site'] = site;
  return new Request(`${ORIGIN}/api/contact`, { method, headers, body: method === 'GET' ? undefined : (raw ?? JSON.stringify(body)) });
}
const okFetch = () => { const calls = []; const fn = async (url, init) => { calls.push({ url, init }); return new Response('{}', { status: 200 }); }; fn.calls = calls; return fn; };

test('delivers a valid enquiry and only sends plain fields to the fixed provider URL', async () => {
  const fetchImpl = okFetch();
  const res = await handle(req(good), { env, fetchImpl });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(fetchImpl.calls.length, 1);
  assert.equal(fetchImpl.calls[0].url, 'https://formspree.io/f/abcd1234');
  assert.equal(fetchImpl.calls[0].init.redirect, 'error');
  const sent = JSON.parse(fetchImpl.calls[0].init.body);
  assert.deepEqual(Object.keys(sent).sort(), ['_replyto', '_subject', 'email', 'message', 'name', 'service']);
});

test('is unavailable until configured', async () => {
  const res = await handle(req(good), { env: {}, fetchImpl: okFetch() });
  assert.equal(res.status, 503);
});

test('production defaults deliver to the supplied Formspree destination through the relay', async () => {
  const configured = deploymentEnvironment({});
  const fetchImpl = okFetch();
  const productionOrigin = 'https://lyzaxen-portfolio.netlify.app';
  const request = new Request(`${productionOrigin}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: productionOrigin, 'Sec-Fetch-Site': 'same-origin' },
    body: JSON.stringify(good)
  });
  const response = await handle(request, { env: configured, fetchImpl });
  assert.equal(response.status, 200);
  assert.equal(fetchImpl.calls.length, 1);
  assert.equal(fetchImpl.calls[0].url, 'https://formspree.io/f/xkjoegyv');
  assert.equal(JSON.parse(fetchImpl.calls[0].init.body)._replyto, good.email);
});

test('explicit runtime settings override defaults, including an intentionally disabled destination', async () => {
  const configured = deploymentEnvironment({ SITE_ORIGIN: ORIGIN, FORMSPREE_FORM_ID: '' });
  assert.equal(configured.SITE_ORIGIN, ORIGIN);
  assert.equal(configured.FORMSPREE_FORM_ID, '');
  const fetchImpl = okFetch();
  const response = await handle(req(good), { env: configured, fetchImpl });
  assert.equal(response.status, 503);
  assert.equal(fetchImpl.calls.length, 0);
});

test('rejects wrong method, origin, fetch site and content type', async () => {
  assert.equal((await handle(req(good, { method: 'GET' }), { env })).status, 405);
  assert.equal((await handle(req(good, { origin: 'https://evil.example' }), { env })).status, 403);
  assert.equal((await handle(req(good, { origin: null }), { env })).status, 403);
  assert.equal((await handle(req(good, { site: 'cross-site' }), { env })).status, 403);
  assert.equal((await handle(req(good, { type: 'text/plain' }), { env })).status, 415);
});

test('rejects oversized and malformed bodies', async () => {
  const big = { ...good, message: 'x'.repeat(MAX_BYTES) };
  assert.equal((await handle(req(big), { env, fetchImpl: okFetch() })).status, 413);
  assert.equal((await handle(req(null, { raw: '{not json' }), { env })).status, 400);
  assert.equal((await handle(req(null, { raw: '[]' }), { env })).status, 400);
});

test('validates fields, consent, service and honeypot without calling the provider', async () => {
  const fetchImpl = okFetch();
  const cases = [
    { ...good, name: 'A' },
    { ...good, email: 'not-an-email' },
    { ...good, service: 'Something else' },
    { ...good, message: 'too short' },
    { ...good, message: '<script>alert(1)</script> and some more text here' },
    { ...good, name: 'Asha‮evil' },
    { ...good, consent: false },
    { ...good, consent: 'true' },
    { ...good, website: 'https://spam.example' }
  ];
  for (const body of cases) assert.equal((await handle(req(body), { env, fetchImpl })).status, 400, JSON.stringify(body));
  assert.equal(fetchImpl.calls.length, 0);
});

test('normalises Unicode and whitespace before sending', async () => {
  const fetchImpl = okFetch();
  await handle(req({ ...good, name: '  Ａｓｈａ  ', email: ' ASHA@Example.com ' }), { env, fetchImpl });
  const sent = JSON.parse(fetchImpl.calls[0].init.body);
  assert.equal(sent.name, 'Asha');
  assert.equal(sent.email, 'asha@example.com');
});

test('reports provider failures and timeouts as not delivered, without leaking details', async () => {
  const failing = async () => new Response('provider secret detail', { status: 500 });
  const res = await handle(req(good), { env, fetchImpl: failing });
  assert.equal(res.status, 502);
  assert.doesNotMatch(await res.text(), /secret/);
  const throwing = async () => { throw new Error('network down'); };
  assert.equal((await handle(req(good), { env, fetchImpl: throwing })).status, 502);
});
