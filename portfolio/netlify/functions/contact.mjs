/* Netlify Function: validates an enquiry and relays plain-text fields to Formspree.
 * Configuration (Netlify environment variables, never in frontend code):
 *   SITE_ORIGIN        exact https origin of the site, e.g. https://lyzaxen-portfolio.netlify.app
 *   FORMSPREE_FORM_ID  the ID from https://formspree.io/f/<ID>
 * The browser only ever learns whether delivery was accepted; provider details are never echoed. */

import { deploymentEnvironment } from '../contact-settings.mjs';

export const MAX_BYTES = 16 * 1024;
export const SERVICES = new Set(['Website or web app', 'Video editing', 'Not sure yet']);
const CONTROL_OR_MARKUP = /[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/;
const EMAIL = /^[^\s@<>"(),;:]+@[^\s@<>"(),;:]+\.[^\s@<>"(),;:]{2,}$/;

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }
});

const clean = value => (typeof value === 'string' ? value.normalize('NFKC').replace(/\r\n?/g, '\n').trim() : '');

export function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid request.' };
  if (clean(input.website)) return { error: 'Rejected.' }; // honeypot
  const data = {
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    service: clean(input.service),
    message: clean(input.message)
  };
  if (data.name.length < 2 || data.name.length > 80) return { error: 'Please give a name between 2 and 80 characters.' };
  if (data.email.length > 254 || !EMAIL.test(data.email)) return { error: 'Please give a valid email address.' };
  if (!SERVICES.has(data.service)) return { error: 'Please choose a service.' };
  if (data.message.length < 20 || data.message.length > 3000) return { error: 'Please write between 20 and 3000 characters about the project.' };
  if (CONTROL_OR_MARKUP.test(data.name) || CONTROL_OR_MARKUP.test(data.message.replace(/\n/g, ''))) return { error: 'Please use plain text without angle brackets.' };
  if (input.consent !== true) return { error: 'Consent is required to send the enquiry.' };
  return { data };
}

export async function handle(request, { env = process.env, fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });

  const origin = env.SITE_ORIGIN;
  const formId = env.FORMSPREE_FORM_ID;
  if (!origin || !/^https:\/\/[^/]+$/.test(origin) || !formId || !/^[A-Za-z0-9]{4,32}$/.test(formId)) {
    return json(503, { ok: false, error: 'The contact form is not configured.' });
  }

  // Same-origin browser requests only. Cross-site forms cannot send JSON, and we do not enable CORS.
  if (request.headers.get('origin') !== origin) return json(403, { ok: false, error: 'Forbidden.' });
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return json(403, { ok: false, error: 'Forbidden.' });
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'Send JSON.' });
  }
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) return json(413, { ok: false, error: 'Message too large.' });

  let raw;
  try {
    raw = await request.text();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }
  if (new TextEncoder().encode(raw).length > MAX_BYTES) return json(413, { ok: false, error: 'Message too large.' });

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }
  const { data, error } = validate(input);
  if (error) return json(400, { ok: false, error });

  try {
    const response = await fetchImpl(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, _subject: `LyzaXen enquiry: ${data.service}`, _replyto: data.email }),
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return json(502, { ok: false, error: 'The enquiry could not be delivered.' });
  } catch {
    return json(502, { ok: false, error: 'The enquiry could not be delivered.' });
  }
  return json(200, { ok: true });
}

export default request => handle(request, { env: deploymentEnvironment() });
