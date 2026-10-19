// Afterhours — fictional café concept by LyzaXen.
// Everything here runs in the browser. Nothing is sent to a server.

const menu = [
  { id: 'flat-white', name: 'The usual, elevated', price: 180, category: 'coffee', description: 'Double espresso, textured milk, a very good morning.', ingredients: 'Coffee, dairy milk', tag: 'House flat white', art: 'cup', drink: { mood: 'comfort', serve: 'warm', dairyFree: false, why: 'it is our warm, milky house flat white' } },
  { id: 'espresso-tonic', name: 'Orange you glad', price: 220, category: 'coffee', description: 'Espresso meets orange tonic. Bright, bittersweet, a little unexpected.', ingredients: 'Coffee, orange, tonic water', tag: 'Cold & citrusy', art: 'tonic', drink: { mood: 'bright', serve: 'cold', dairyFree: true, why: 'a citrus espresso tonic is our most refreshing drink' } },
  { id: 'toast', name: 'The slow Sunday', price: 260, category: 'bites', description: 'Golden sourdough, roasted tomatoes, basil and whipped feta.', ingredients: 'Wheat, dairy, tomato, basil', tag: 'Vegetarian', art: 'toast' },
  { id: 'cheesecake', name: 'Cloud nine', price: 240, category: 'sweet', description: 'A soft slice of vanilla cheesecake. Your fork knows what to do.', ingredients: 'Wheat, dairy, egg, vanilla', tag: 'Something sweet', art: 'cake' },
  { id: 'cold-brew', name: 'Midnight cold brew', price: 200, category: 'coffee', description: 'Long-steeped coffee over ice. Smooth, chocolatey, unhurried.', ingredients: 'Coffee, water, ice', tag: 'Dairy-free', art: 'glass', drink: { mood: 'bold', serve: 'cold', dairyFree: true, why: 'long-steeped cold brew is the most coffee-forward drink here' } },
  { id: 'cookie', name: 'A little crunch', price: 150, category: 'sweet', description: 'A warm dark-chocolate cookie with a pinch of sea salt.', ingredients: 'Wheat, dairy, egg, chocolate', tag: 'Fresh-baked feeling', art: 'cookie' }
];

const categoryLabels = { all: ['menu item', 'menu items'], coffee: ['coffee drink', 'coffee drinks'], bites: ['little bite', 'little bites'], sweet: ['sweet thing', 'sweet things'] };
const moodLabels = { comfort: 'warm and comforting', bright: 'cold and refreshing', bold: 'bold and coffee-forward' };

const glass = '<path d="M51 25h69l-9 113H62z" fill="#9e582d"/><path d="M51 25h69l-3 34H54z" fill="#d3a16c"/><path d="M51 25h69l-9 113H62z" fill="none" stroke="#faf4e4" stroke-width="4"/><path d="M102 3L90 93" stroke="#f7ecd2" stroke-width="5"/><rect x="63" y="68" width="23" height="19" rx="3" fill="#ffffff50"/><rect x="84" y="95" width="22" height="19" rx="3" fill="#ffffff40"/>';
const shapes = {
  cup: '<ellipse cx="85" cy="130" rx="67" ry="15" fill="#f9f4e9"/><path d="M127 56h17c28 0 28 43-2 43h-16" fill="none" stroke="#fcf9ee" stroke-width="12"/><path d="M32 52h101l-9 65q-40 26-82 0z" fill="#fdf9ef"/><ellipse cx="83" cy="52" rx="50" ry="17" fill="#6e3b22"/><ellipse cx="83" cy="53" rx="41" ry="12" fill="#c69a6a"/><path d="M64 53q19-24 38 0q-19 21-38 0m8 0q11-15 23 0" fill="none" stroke="#fff3d9" stroke-width="4"/>',
  glass,
  tonic: glass.replace('#9e582d', '#c9772f').replace('#d3a16c', '#7a3f1f') + '<circle cx="118" cy="30" r="20" fill="#f29a3a" stroke="#fbe6c2" stroke-width="4"/><path d="M118 12v36M100 30h36M105 17l26 26M131 17l-26 26" stroke="#fbe6c2" stroke-width="2"/>',
  toast: '<ellipse cx="86" cy="122" rx="78" ry="18" fill="#f7f3e9"/><path d="M29 55q54-30 112 0l-4 58q-57 20-106-1z" fill="#a76b37" stroke="#71401e" stroke-width="4"/><path d="M37 59q47-25 95 0v45q-45 15-95 0z" fill="#efdeae"/><path d="M47 70l66 15m-65 4l70-17" stroke="#fff5de" stroke-width="10"/><g fill="#bd4e32"><circle cx="56" cy="72" r="11"/><circle cx="103" cy="92" r="12"/><circle cx="94" cy="65" r="10"/></g><path d="M66 88q-5-25 16-16q8 16-16 16m39-9q0-21 17-14q0 18-17 14" fill="#57704a"/>',
  cake: '<ellipse cx="85" cy="133" rx="70" ry="15" fill="#f8f4e9"/><path d="M30 66l103-27v85H30z" fill="#f4e6bf"/><path d="M30 114h103v12H30z" fill="#a77642"/><path d="M30 66l103-27v13L30 80z" fill="#fff6df"/><circle cx="94" cy="51" r="12" fill="#bb4635"/>',
  cookie: '<ellipse cx="84" cy="100" rx="68" ry="44" fill="#ac6b36"/><ellipse cx="84" cy="92" rx="68" ry="44" fill="#c38c50"/><g fill="#593a2d"><path d="M50 67l15 4-6 14-13-3zM93 57l12 5-5 13-12-5zM115 89l14 5-7 12-12-3zM76 95l14 5-5 14-15-6zM42 102l13 4-6 11-10-6z"/></g>'
};
const art = type => `<svg viewBox="0 0 170 160" aria-hidden="true">${shapes[type]}</svg>`;

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const localDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// ---------- Menu ----------

function renderMenu(filter = 'all') {
  const items = menu.filter(m => filter === 'all' || m.category === filter);
  $('#menu-grid').innerHTML = items.map(m => `
    <article class="menu-card reveal">
      <div class="menu-art">${art(m.art)}</div>
      <div class="menu-title"><h3>${m.name}</h3><span>₹${m.price}</span></div>
      <p>${m.description}</p>
      <p class="ingredients">Contains: ${m.ingredients}</p>
      <span class="menu-badge">${m.tag}</span>
    </article>`).join('');
  $('#menu-status').textContent = `Showing ${items.length} ${categoryLabels[filter][items.length === 1 ? 0 : 1]}.`;
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.classList.toggle('active', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  renderMenu(button.dataset.filter);
}));

// ---------- Drink matcher (explicit rules, no AI) ----------

function matchDrink(mood, dairyFreeOnly) {
  const drinks = menu.filter(m => m.drink);
  const exact = drinks.find(m => m.drink.mood === mood && (!dairyFreeOnly || m.drink.dairyFree));
  if (exact) {
    const reason = `You asked for something ${moodLabels[mood]}${dairyFreeOnly ? ' and dairy-free' : ''}, and ${exact.drink.why}.`;
    return { item: exact, exact: true, reason };
  }
  // No drink fits both answers: say so instead of pretending.
  const fallback = drinks.find(m => m.drink.dairyFree && m.drink.mood === 'bold');
  return {
    item: fallback,
    exact: false,
    reason: `This concept menu has no ${moodLabels[mood]} drink that is also dairy-free. The closest dairy-free option is ${fallback.name} — but note it is served ${fallback.drink.serve}.`
  };
}

// ---------- Dialogs ----------

const modal = $('#modal');
const content = $('#modal-content');

const templates = {
  visit: () => `
    <p class="eyebrow">MAKE A LITTLE TIME</p>
    <h2 id="modal-title">Your next <em>slow day.</em></h2>
    <p>Afterhours is a fictional café concept inspired by Kolkata. There is no operating venue, real address or reservation service.</p>
    <div class="visit-grid">
      <div><b>IMAGINED HOURS</b><p>Every day<br>9 am — 10 pm</p></div>
      <div><b>THE IDEA</b><p>A neighbourhood café<br>Kolkata, India</p></div>
    </div>
    <p>Explore the menu or try planning a gathering. Nothing you enter is sent to a business.</p>
    <div class="dialog-actions">
      <button class="button dark" type="button" data-go="event">Plan a gathering ↗</button>
      <button class="button" type="button" data-go="menu">Explore the menu ↓</button>
    </div>`,
  match: () => `
    <p class="eyebrow">A LITTLE HELP CHOOSING</p>
    <h2 id="modal-title">Find <em>your cup.</em></h2>
    <p>A transparent, rule-based menu matcher. This demo does not use an AI model or send your preferences anywhere.</p>
    <form id="match-form">
      <label>What sounds good?<select id="mood"><option value="comfort">Warm & comforting</option><option value="bright">Cold & refreshing</option><option value="bold">Bold & coffee-forward</option></select></label>
      <label>Milk preference<select id="milk"><option value="any">No preference</option><option value="none">Dairy-free drink</option></select></label>
      <button class="button dark wide">Find my match ✳</button>
    </form>
    <div id="match-result" aria-live="polite"></div>
    <p class="fineprint">Dietary preferences are not allergy screening. No suitability guarantee is provided.</p>`,
  event: () => `
    <p class="eyebrow">LET’S MAKE A LITTLE OCCASION</p>
    <h2 id="modal-title">Gather <em>your people.</em></h2>
    <p>Create a private-event inquiry brief. This demo checks the details and lets you download them. Nothing is sent and no reservation is made.</p>
    <form id="event-form" novalidate>
      <div class="form-grid">
        <label>Your name<input name="name" autocomplete="name" maxlength="80" required></label>
        <label>Email or phone<input name="contact" autocomplete="email" maxlength="120" required></label>
      </div>
      <label>Occasion<select name="occasion"><option>Birthday</option><option>Team gathering</option><option>Book club</option><option>Something else</option></select></label>
      <div class="form-grid">
        <label>Preferred date<input name="date" id="event-date" type="date" required></label>
        <label>Time of day<select name="time"><option>Morning (9–12)</option><option selected>Afternoon (12–5)</option><option>Evening (5–10)</option></select></label>
      </div>
      <label>Guests (4–24)<input name="guests" type="number" inputmode="numeric" min="4" max="24" step="1" value="8" required></label>
      <label>Anything to add? (optional)<textarea name="notes" maxlength="600" placeholder="Food preferences, accessibility needs, anything we should know…"></textarea></label>
      <p class="form-error" id="event-error" role="alert"></p>
      <button class="button dark wide">Create inquiry brief ↗</button>
    </form>
    <div id="event-result" aria-live="polite"></div>`
};

function openModal(kind) {
  content.innerHTML = templates[kind]();
  if (!modal.open) modal.showModal();
  if (kind === 'event') setupEventForm();
}

content.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if (!go) return;
  if (go.dataset.go === 'menu') {
    modal.close();
    $('#menu').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#menu h2').focus({ preventScroll: true });
  } else {
    openModal(go.dataset.go);
  }
});

content.addEventListener('submit', event => {
  if (event.target.id !== 'match-form') return;
  event.preventDefault();
  const { item, exact, reason } = matchDrink($('#mood').value, $('#milk').value === 'none');
  $('#match-result').innerHTML = `
    <div class="result">
      <span class="menu-badge">${exact ? 'YOUR MATCH' : 'NO EXACT MATCH'}</span>
      <h3>${item.name} · ₹${item.price}</h3>
      <p>${reason}</p>
      <p>Ingredients: ${item.ingredients}.</p>
    </div>`;
});

// ---------- Event inquiry brief ----------

function briefText(data) {
  return [
    'AFTERHOURS — CONCEPT EVENT INQUIRY',
    '',
    `Name: ${data.name}`,
    `Contact: ${data.contact}`,
    `Occasion: ${data.occasion}`,
    `Preferred date: ${data.date}`,
    `Time of day: ${data.time}`,
    `Guests: ${data.guests}`,
    `Notes: ${data.notes || 'None'}`,
    '',
    `Created: ${new Date().toLocaleString()}`,
    'Demo only. Nothing was sent and no reservation has been made. Availability and prices are not confirmed.'
  ].join('\n');
}

function readEventForm(form) {
  const data = Object.fromEntries(new FormData(form));
  Object.keys(data).forEach(key => { data[key] = String(data[key]).trim(); });
  return data;
}

function validateEventForm(form) {
  const error = $('#event-error');
  form.name.setCustomValidity(form.name.value.trim() ? '' : 'Add your name.');
  form.contact.setCustomValidity(form.contact.value.trim().length >= 5 ? '' : 'Add an email address or phone number.');
  const invalid = [...form.elements].find(el => el.willValidate && !el.checkValidity());
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  if (!invalid) { error.textContent = ''; return true; }
  invalid.setAttribute('aria-invalid', 'true');
  const label = invalid.closest('label').firstChild.textContent.trim();
  error.textContent = invalid.validity.customError ? invalid.validationMessage : `${label}: ${invalid.validationMessage}`;
  invalid.focus();
  return false;
}

function setupEventForm() {
  const form = $('#event-form');
  const result = $('#event-result');
  const dateInput = $('#event-date');
  dateInput.min = localDate(0);
  dateInput.max = localDate(365);
  dateInput.value = localDate(7);

  // Any edit after the brief is created makes it stale, so remove it.
  form.addEventListener('input', () => {
    if (result.innerHTML) result.innerHTML = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateEventForm(form)) return;
    const data = readEventForm(form);
    result.innerHTML = `
      <div class="result">
        <h3>Your inquiry brief is ready.</h3>
        <dl class="brief-summary">
          <dt>For</dt><dd>${esc(data.name)} · ${esc(data.contact)}</dd>
          <dt>When</dt><dd>${esc(data.date)} · ${esc(data.time)}</dd>
          <dt>What</dt><dd>${esc(data.occasion)} for ${esc(data.guests)} guests</dd>
        </dl>
        <p>No booking was made and nothing was sent. Download the brief to see the handover a real café would receive.</p>
        <button class="button dark" type="button" id="download-brief">Download brief ↓</button>
      </div>`;
    const download = $('#download-brief');
    download.addEventListener('click', () => {
      // Build from the current form so the file always matches what is on screen.
      const text = briefText(readEventForm(form));
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `afterhours-inquiry-${data.date}.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    download.scrollIntoView({ block: 'nearest' });
    download.focus({ preventScroll: true });
  });
}

// ---------- Navigation ----------

const nav = $('#site-nav');
const navLinks = $('#nav-links');
const navToggle = $('.nav-toggle');
const pill = $('.nav-pill');
const sectionLinks = [...navLinks.querySelectorAll('a[data-section]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The dark pill slides to whichever link is hovered or focused, then back to the current section.
function movePill(link) {
  sectionLinks.forEach(a => a.classList.toggle('pill-on', a === link));
  if (!link) { pill.style.opacity = '0'; return; }
  pill.style.width = `${link.offsetWidth}px`;
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
  pill.style.opacity = '1';
}
const currentLink = () => sectionLinks.find(a => a.getAttribute('aria-current') === 'location') || null;
sectionLinks.forEach(link => {
  link.addEventListener('mouseenter', () => movePill(link));
  link.addEventListener('focus', () => movePill(link));
});
navLinks.addEventListener('mouseleave', () => movePill(null));
navLinks.addEventListener('focusout', event => { if (!navLinks.contains(event.relatedTarget)) movePill(null); });

// Highlight the section currently on screen.
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach(a => {
      if (a.dataset.section === entry.target.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sectionLinks.forEach(a => sectionObserver.observe(document.getElementById(a.dataset.section)));
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) sectionLinks.forEach(a => a.removeAttribute('aria-current'));
}, { rootMargin: '-45% 0px -50% 0px' }).observe($('.hero'));

// Lift the nav once the page scrolls.
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu.
function setMenu(open, { returnFocus = false } = {}) {
  nav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
  if (open) navLinks.querySelector('a').focus();
  else if (returnFocus) navToggle.focus();
}
navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
navLinks.addEventListener('click', event => {
  if (event.target.closest('a, button')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, { returnFocus: true });
});
document.addEventListener('click', event => {
  if (nav.classList.contains('open') && !nav.contains(event.target)) setMenu(false);
});
matchMedia('(min-width: 651px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

// ---------- Scroll reveals ----------

if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
}

// ---------- Wiring ----------

renderMenu();
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.open)));
$('.close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const r = modal.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
});
