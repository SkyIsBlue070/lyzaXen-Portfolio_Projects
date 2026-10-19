/* Shared behaviour for the homepage and case-study pages. Every feature checks that its markup exists. */

const config = window.PORTFOLIO || {};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

// ---------- Header ----------

const header = $('[data-header]');
if (header) {
  const toggle = $('.menu-toggle', header);
  const nav = $('#site-nav');
  const label = $('.menu-toggle-label', header);

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open, { restoreFocus = false } = {}) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    if (open) $('a', nav).focus();
    else if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) setMenu(false, { restoreFocus: true });
  });
  document.addEventListener('click', event => {
    if (header.classList.contains('menu-open') && !header.contains(event.target)) setMenu(false);
  });
  matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Mark the nav link for the section currently on screen (homepage only).
  const links = $$('a[href^="/#"]', nav).filter(a => document.getElementById(a.hash.slice(1)));
  if (links.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => {
          if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => observer.observe(document.getElementById(a.hash.slice(1))));
  }
}

$$('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

// ---------- Scroll reveals ----------

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const targets = $$('.section-head, .feature, .mini, .reel, .service, .step, .about-portrait, .about-copy, .faq-list, .contact-form, .case-section');
  targets.forEach(node => node.setAttribute('data-reveal', ''));
  document.documentElement.classList.add('motion');
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(node => reveal.observe(node));
}

// ---------- Safe external URLs from config ----------

function httpsUrl(value, hosts) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (hosts && !hosts.includes(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}
const validEmail = value => typeof value === 'string' && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value);

// ---------- Video samples ----------

const reels = $('[data-reels]');
if (reels) {
  const dialog = $('#video-dialog');
  const player = $('#video-player');
  let opener = null;
  const localMedia = (value, pattern) => {
    if (typeof value !== 'string' || !value.startsWith('assets/')) return null;
    const url = new URL(`/${value}`, location.origin);
    return pattern.test(url.pathname) ? url.pathname : null;
  };
  let ready = 0;
  $$('[data-clip]', reels).forEach(card => {
    const clip = config.clips?.[card.dataset.clip];
    const src = localMedia(clip?.src, /\.(mp4|webm)$/i);
    if (!src) return; // no file configured: keep the honest "in preparation" label, no play button
    ready += 1;
    const status = $('[data-reel-status]', card);
    const button = el('button', { type: 'button', className: 'reel-play', textContent: `Play “${clip.title || $('h3', card).textContent}”` });
    status.replaceWith(button);
    button.addEventListener('click', () => {
      opener = button;
      $('#video-dialog-title').textContent = clip.title || $('h3', card).textContent;
      player.replaceChildren();
      player.src = src;
      const captions = localMedia(clip.captions, /\.vtt$/i);
      if (captions) player.append(el('track', { kind: 'captions', label: 'English', srclang: 'en', src: captions, default: true }));
      $('#video-transcript').textContent = clip.transcript || '';
      dialog.showModal();
    });
  });
  if (ready) $('[data-reel-note]').textContent = 'Videos load only when you press play. Captions are included where there is speech.';
  if (dialog) {
    $('[data-dialog-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); opener?.focus(); });
  }
}

// ---------- Service preselection ----------

const serviceValues = { web: 'Website or web app', video: 'Video editing' };
$$('[data-service-pick]').forEach(link => link.addEventListener('click', () => {
  const input = $(`.service-pick input[value="${serviceValues[link.dataset.servicePick]}"]`);
  if (input) { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); }
}));

// ---------- Contact ----------

const form = $('#contact-form');
if (form) setupContact(form);

function setupContact(form) {
  const banner = $('#form-banner');
  const errorBox = $('#form-error');
  const status = $('#form-status');
  const submit = $('.btn-submit', form);
  const submitText = $('.btn-text', submit);
  const alt = $('[data-contact-alt]');
  const enabled = config.contactEnabled === true;

  // Alternatives appear only when they are actually configured.
  const fiverr = httpsUrl(config.fiverrUrl, ['www.fiverr.com', 'fiverr.com']);
  if (fiverr) alt.append(el('a', { className: 'btn btn-paper', href: fiverr.href, rel: 'noopener noreferrer', target: '_blank', textContent: 'Hire me on Fiverr ↗' }));
  if (validEmail(config.email)) alt.append(el('a', { className: 'btn btn-outline-paper', href: `mailto:${config.email}`, textContent: `Email ${config.email}` }));
  alt.hidden = !alt.children.length;

  if (!enabled) {
    banner.hidden = false;
    banner.textContent = 'This form isn’t connected yet, so nothing you enter here can be sent. It will start working once the site’s form provider is set up.';
    submitText.textContent = 'Sending is not connected yet';
    submit.disabled = true;
  }

  const fields = { name: form.elements.name, email: form.elements.email, message: form.elements.message, consent: form.elements.consent };
  const servicePick = $('.service-pick', form);

  function validate() {
    const problems = [];
    const service = new FormData(form).get('service');
    servicePick.toggleAttribute('aria-invalid', !service);
    if (!service) problems.push(['service', 'Choose the service you need.']);
    const checks = [
      ['name', fields.name.value.trim().length >= 2, 'Add your name.'],
      ['email', fields.email.validity.valid && fields.email.value.trim() !== '', 'Add an email address I can reply to.'],
      ['message', fields.message.value.trim().length >= 20, 'Tell me a little more about the project (at least 20 characters).'],
      ['consent', fields.consent.checked, 'Tick the consent box so the form can send your details.']
    ];
    checks.forEach(([key, ok, message]) => {
      fields[key].setAttribute('aria-invalid', String(!ok));
      if (!ok) problems.push([key, message]);
    });
    if (/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(fields.name.value + fields.message.value)) {
      problems.push(['message', 'Please use plain text without angle brackets.']);
    }
    return problems;
  }

  form.addEventListener('input', () => { if (errorBox.textContent) { errorBox.textContent = ''; } });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    const problems = validate();
    if (problems.length) {
      errorBox.textContent = problems.map(([, message]) => message).join(' ');
      const first = problems[0][0];
      (first === 'service' ? $('input', servicePick) : fields[first]).focus();
      return;
    }
    errorBox.textContent = '';
    if (!enabled) {
      status.className = 'form-status is-info';
      status.textContent = 'Nothing was sent: the form isn’t connected yet.';
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    ['name', 'email', 'service', 'message'].forEach(key => { data[key] = String(data[key] || '').trim(); });
    data.consent = fields.consent.checked;
    submit.disabled = true;
    submit.classList.add('is-loading');
    submitText.textContent = 'Sending…';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const body = await response.json().catch(() => ({}));
      if (body.ok !== true) throw new Error('Not confirmed');
      status.className = 'form-status is-success';
      status.textContent = 'Sent. Thanks — I’ll reply to the email address you gave.';
      form.reset();
      $$('[aria-invalid]', form).forEach(node => node.removeAttribute('aria-invalid'));
    } catch {
      status.className = 'form-status is-failure';
      status.textContent = 'Delivery could not be confirmed. Please try again in a few minutes.';
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
      submitText.textContent = 'Send project details';
    }
  });
}

// ---------- Screenshot lightbox (case-study galleries) ----------

const shots = $$('[data-lightbox="gallery"]');
const coverShot = $('[data-lightbox="cover"]');
if (shots.length) {
  const dialog = el('dialog', { className: 'lightbox' });
  dialog.setAttribute('aria-label', 'Screenshot viewer');
  const title = el('h2', { textContent: 'Screenshot' });
  const close = el('button', { type: 'button', className: 'dialog-close', textContent: '×' });
  close.setAttribute('aria-label', 'Close viewer');
  const img = el('img', { alt: '' });
  const caption = el('figcaption');
  const prev = el('button', { type: 'button', textContent: '← Previous' });
  const next = el('button', { type: 'button', textContent: 'Next →' });
  const count = el('span', { className: 'lightbox-count' });
  dialog.append(
    el('div', { className: 'dialog-head' }, [title, close]),
    el('figure', {}, [img, caption]),
    el('div', { className: 'lightbox-nav' }, [prev, count, next])
  );
  document.body.append(dialog);
  let index = 0;
  let opener = null;

  const show = i => {
    index = (i + shots.length) % shots.length;
    const shot = shots[index];
    img.src = shot.dataset.full;
    img.alt = shot.dataset.alt;
    caption.textContent = shot.dataset.caption;
    title.textContent = shot.dataset.title || 'Screenshot';
    count.textContent = `${index + 1} / ${shots.length}`;
    prev.hidden = next.hidden = shots.length < 2;
  };
  shots.forEach((shot, i) => shot.addEventListener('click', event => {
    event.preventDefault();
    opener = shot;
    show(i);
    dialog.showModal();
  }));
  coverShot?.addEventListener('click', event => { event.preventDefault(); opener = coverShot; show(0); dialog.showModal(); });
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());
}
