// Regenerates the self-contained review copies from the source folders.
// Usage: node build-previews.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const projects = [
  { dir: 'afterhours/dist', out: 'Afterhours-preview.html' },
  { dir: 'signaldesk/dist', out: 'SignalDesk-preview.html' }
];

const dataUri = file => `data:image/svg+xml;base64,${readFileSync(file).toString('base64')}`;

for (const { dir, out } of projects) {
  const base = join(root, dir);
  let html = readFileSync(join(base, 'index.html'), 'utf8');
  const css = readFileSync(join(base, 'style.css'), 'utf8');
  const js = readFileSync(join(base, 'app.js'), 'utf8');

  html = html
    .replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}</style>`)
    .replace('<script src="app.js"></script>', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}</script>`)
    .replace(/(src|href)="((?:assets\/)?[\w-]+\.svg)"/g, (_, attr, path) => `${attr}="${dataUri(join(base, path))}"`);

  if (/href="style\.css"|src="app\.js"/.test(html)) throw new Error(`${out}: a local reference was not inlined`);
  writeFileSync(join(root, out), html);
  console.log(`Wrote ${out} (${Math.round(html.length / 1024)} KB)`);
}
