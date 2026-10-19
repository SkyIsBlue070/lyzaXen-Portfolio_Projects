/* Development: build once, serve dist/ without caching, and rebuild when source files change. */
import { watch } from 'node:fs';
import { build } from './build.mjs';
import { serve } from './serve.mjs';

const WATCH = ['index.html', 'config.js', '_headers', 'css', 'js', 'src', 'assets', 'demos'];

await build();
await serve({ dir: 'dist', port: 4174, noCache: true, label: 'Dev server (rebuilds on save)' });

let timer;
for (const target of WATCH) {
  watch(target, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => build({ quiet: true }).then(() => console.log('Rebuilt.')).catch(error => console.error(error.message)), 150);
  });
}
