/* Zero-dependency build: copies the static site to dist/, generates the case-study pages,
 * and fails if any local link or asset is missing. Usage: node build.mjs */
import { cp, mkdir, readFile, rm, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const COPY = ['index.html', 'config.js', 'robots.txt', '_headers', 'css', 'js', 'assets', 'demos'];

export async function build({ quiet = false } = {}) {
  const { caseStudies } = await import(`${pathToFileURL(join(root, 'src/case-studies.mjs')).href}?t=${Date.now()}`);
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  for (const item of COPY) await cp(join(root, item), join(dist, item), { recursive: true });

  const home = await readFile(join(root, 'index.html'), 'utf8');
  const head = home.slice(0, home.indexOf('<title>'));
  const header = home.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
  const footer = home.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)[0];

  for (const study of caseStudies) {
    const next = caseStudies.find(s => s.slug === study.next);
    const html = renderCaseStudy(study, next, { head, header, footer });
    await mkdir(join(dist, 'work', study.slug), { recursive: true });
    await writeFile(join(dist, 'work', study.slug, 'index.html'), html);
  }

  await applyOrigin();
  const problems = await checkLinks();
  if (problems.length) throw new Error(`Broken local references:\n  ${problems.join('\n  ')}`);
  if (!quiet) console.log(`Built dist/ — ${caseStudies.length} case studies, all local links and assets resolved.`);
}

// ---------- Template ----------

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isExternal = href => /^https?:\/\//.test(href);
const linkAttrs = href => (isExternal(href) ? ` rel="noopener noreferrer" target="_blank"` : '');
const arrow = href => (isExternal(href) || href.startsWith('/demos/') ? '↗' : '→');

function renderCaseStudy(s, next, { head, header, footer }) {
  const primary = s.links[0];
  const secondary = s.links.slice(1);
  const sections = [
    ['problem', 'The problem'],
    ['contribution', 'My contribution'],
    ['approach', 'Approach'],
    ['features', 'Features'],
    ['stack', 'Stack'],
    ['inspect', 'What you can inspect'],
    ['screens', 'Screenshots'],
    ['limits', 'Honest limits']
  ];
  const paragraphs = list => list.map(p => `<p>${esc(p)}</p>`).join('\n          ');
  const cover = s.gallery[0];
  const description = `${s.name} — ${s.summary}`;

  return `${head.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(s.name)} — case study by LyzaXen">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(s.summary)}">`)}<title>${esc(s.name)} — case study · LyzaXen</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/site.css">
  <script src="/config.js" defer></script>
  <script src="/js/main.js" type="module"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  ${header}

  <main id="main" class="case case-${s.slug}" tabindex="-1">
    <section class="case-hero" aria-labelledby="case-title">
      <a class="case-back" href="/#work"><span aria-hidden="true">←</span> All work</a>
      <p class="case-type">${esc(s.type)}</p>
      <h1 id="case-title">${esc(s.name)}</h1>
      <p class="case-summary">${esc(s.summary)}</p>
      <div class="case-actions">
        <a class="btn btn-ink" href="${primary.href}"${linkAttrs(primary.href)}>${esc(primary.label)} <span aria-hidden="true">${arrow(primary.href)}</span></a>
        ${secondary.map(l => `<a class="text-link" href="${l.href}"${linkAttrs(l.href)}>${esc(l.label)} <span aria-hidden="true">${arrow(l.href)}</span></a>`).join('\n        ')}
      </div>
      <dl class="case-facts">
        ${s.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n        ')}
      </dl>
    </section>
${cover ? `
    <div class="case-cover">
      ${shot(cover, s, 0, 'eager', true)}
    </div>
` : ''}
    <div class="case-body">
      <nav class="case-toc" aria-label="On this page">
        ${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('\n        ')}
      </nav>
      <div class="case-content">
        <section class="case-section" id="problem" aria-labelledby="h-problem">
          <h2 id="h-problem">The <em>problem</em></h2>
          ${paragraphs(s.problem)}
        </section>
        <section class="case-section" id="contribution" aria-labelledby="h-contribution">
          <h2 id="h-contribution">My <em>contribution</em></h2>
          ${paragraphs(s.contribution)}
        </section>
        <section class="case-section" id="approach" aria-labelledby="h-approach">
          <h2 id="h-approach">Approach</h2>
          ${paragraphs(s.approach)}
        </section>
        <section class="case-section" id="features" aria-labelledby="h-features">
          <h2 id="h-features">Features</h2>
          <ul class="case-features">
            ${s.features.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('\n            ')}
          </ul>
        </section>
        <section class="case-section" id="stack" aria-labelledby="h-stack">
          <h2 id="h-stack">Stack</h2>
          <ul class="case-stack">
            ${s.stack.map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </section>
        <section class="case-section" id="inspect" aria-labelledby="h-inspect">
          <h2 id="h-inspect">What you can <em>inspect</em></h2>
          <ul class="inspect">
            ${s.links.map(l => `<li><span class="inspect-kind">${esc(l.kind)}</span><a href="${l.href}"${linkAttrs(l.href)}>${esc(l.label)} <span aria-hidden="true">${arrow(l.href)}</span></a><span>${esc(l.note)}</span></li>`).join('\n            ')}
          </ul>
        </section>
        <section class="case-section" id="screens" aria-labelledby="h-screens">
          <h2 id="h-screens">Screenshots</h2>
          ${s.gallery.length ? `<p>Screenshots of the actual build, cropped to the page. Select one to view it full size.</p>
          <div class="gallery">
            ${s.gallery.map((g, i) => `<figure>${shot(g, s, i, 'lazy')}<figcaption>${esc(g.caption)}</figcaption></figure>`).join('\n            ')}
          </div>` : `<p class="note-box">${esc(s.galleryNote)}</p>`}
        </section>
        <section class="case-section" id="limits" aria-labelledby="h-limits">
          <h2 id="h-limits">Honest <em>limits</em></h2>
          <p class="note-box">${esc(s.limits)}</p>
        </section>
      </div>
    </div>

    <section class="case-next" aria-label="Next">
      <div>
        <p>Next case study</p>
        <a class="next-link" href="/work/${next.slug}/">${esc(next.name)} <span aria-hidden="true">→</span></a>
      </div>
      <a class="btn btn-paper" href="/#contact">Discuss a project <span aria-hidden="true">→</span></a>
    </section>
  </main>

  ${footer}
</body>
</html>
`;
}

function shot(g, s, index, loading, isCover = false) {
  const full = `/assets/work/${g.file}-1600.jpg`;
  return `<a class="shot" href="${full}" data-lightbox="${isCover ? 'cover' : 'gallery'}" data-full="${full}" data-alt="${esc(g.alt)}" data-caption="${esc(g.caption)}" data-title="${esc(s.name)} · screenshot ${index + 1}" aria-label="View full size: ${esc(g.alt)}">`
    + `<img src="/assets/work/${g.file}-800.jpg" srcset="/assets/work/${g.file}-800.jpg 800w, ${full} 1600w" sizes="(max-width: 960px) 94vw, 70vw" width="1600" height="786" alt="${esc(g.alt)}" loading="${loading}" decoding="async"></a>`;
}

// ---------- Production origin (canonical + Open Graph) ----------

async function applyOrigin() {
  const origin = process.env.SITE_ORIGIN;
  if (!origin) return;
  const url = new URL(origin);
  if (url.protocol !== 'https:' || url.origin !== origin) throw new Error('SITE_ORIGIN must be an https origin with no path or trailing slash.');
  for (const page of await htmlFiles(dist)) {
    if (page.includes(`${join(dist, 'demos')}`)) continue;
    const path = '/' + page.slice(dist.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
    let html = await readFile(page, 'utf8');
    html = html.replace('content="/assets/social-card.png"', `content="${origin}/assets/social-card.png"`);
    html = html.replace('</head>', `<link rel="canonical" href="${origin}${path}">\n<meta property="og:url" content="${origin}${path}">\n</head>`);
    await writeFile(page, html);
  }
}

// ---------- Link check ----------

async function htmlFiles(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if ((await stat(full)).isDirectory()) out.push(...await htmlFiles(full));
    else if (extname(name) === '.html') out.push(full);
  }
  return out;
}

async function checkLinks() {
  const problems = [];
  for (const page of await htmlFiles(dist)) {
    const html = await readFile(page, 'utf8');
    const refs = [...html.matchAll(/(?:href|src|data-full)="([^"]+)"/g), ...html.matchAll(/srcset="([^"]+)"/g)]
      .flatMap(m => m[0].startsWith('srcset') ? m[1].split(',').map(p => p.trim().split(' ')[0]) : [m[1]]);
    for (const ref of refs) {
      if (/^(https?:|mailto:|data:|#)/.test(ref)) {
        if (ref.startsWith('#') && ref.length > 1 && !html.includes(`id="${ref.slice(1)}"`)) problems.push(`${rel(page)} → ${ref} (missing anchor)`);
        continue;
      }
      const [pathPart, hash] = ref.split('#');
      const target = pathPart.startsWith('/') ? join(dist, pathPart) : resolve(dirname(page), pathPart);
      const file = pathPart.endsWith('/') || pathPart === '' ? join(target, 'index.html') : target;
      if (!existsSync(file)) { problems.push(`${rel(page)} → ${ref}`); continue; }
      if (hash && pathPart.endsWith('/')) {
        const targetHtml = await readFile(file, 'utf8');
        if (!targetHtml.includes(`id="${hash}"`)) problems.push(`${rel(page)} → ${ref} (missing anchor)`);
      }
    }
  }
  return problems;
}
const rel = file => file.slice(dist.length + 1).replace(/\\/g, '/');

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  build().catch(error => { console.error(error.message); process.exit(1); });
}
