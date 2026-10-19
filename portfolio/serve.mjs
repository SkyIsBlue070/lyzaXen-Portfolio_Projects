/* Tiny static server for dist/, shared by `npm run dev` and `npm start`.
 * Applies the same per-path headers as Netlify's _headers file (minus HSTS on plain HTTP). */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.vtt': 'text/vtt', '.txt': 'text/plain; charset=utf-8'
};

export function parseHeaders(text) {
  const rules = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { current = { pattern: line.trim(), headers: {} }; rules.push(current); continue; }
    const split = line.indexOf(':');
    if (current && split > 0) current.headers[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  return rules;
}

export function headersFor(rules, pathname) {
  const out = {};
  for (const { pattern, headers } of rules) {
    const matches = pattern.endsWith('/*') ? pathname.startsWith(pattern.slice(0, -1)) || pathname === pattern.slice(0, -2) : pathname === pattern;
    if (matches) Object.assign(out, headers);
  }
  return out;
}

export async function serve({ dir, port, noCache = false, label = 'Local' }) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    const rules = parseHeaders(await readFile(join(root, '_headers'), 'utf8').catch(() => ''));
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const base = headersFor(rules, pathname);
    delete base['Strict-Transport-Security'];
    if (noCache) base['Cache-Control'] = 'no-store';

    if (pathname === '/api/contact') {
      res.writeHead(503, { ...base, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'The contact function only runs on Netlify.' }));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, base); res.end(); return; }

    try {
      let file = resolve(root, '.' + pathname);
      if (file !== root && !file.startsWith(root + sep)) throw new Error('outside');
      const info = await stat(file).catch(() => null);
      if (info?.isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { ...base, Location: pathname + '/' + url.search }); res.end(); return; }
        file = join(file, 'index.html');
      }
      const body = await readFile(file);
      const headers = { ...headersFor(rules, pathname.endsWith('/') ? pathname : pathname), ...base, 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' };
      delete headers['Strict-Transport-Security'];
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(404, { ...base, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });
  await new Promise((ok, fail) => {
    server.once('error', error => fail(error.code === 'EADDRINUSE' ? new Error(`Port ${port} is busy. Stop the other server (Ctrl+C) and try again.`) : error));
    server.listen(port, '127.0.0.1', ok);
  });
  console.log(`${label}: http://127.0.0.1:${port}`);
  return server;
}
