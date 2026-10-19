// SignalDesk — customer-feedback workspace concept by LyzaXen.
// Theme detection uses visible keyword rules. No AI model or server is involved.

const sample = [
  { id: 'FB-001', name: 'Aarav M.', source: 'Support email', text: 'The setup has too many steps. I got stuck connecting my first workspace and could not find the onboarding guide.' },
  { id: 'FB-002', name: 'Mia R.', source: 'Product interview', text: 'I need a CSV export for our weekly review. Copying every row into a spreadsheet takes forever.' },
  { id: 'FB-003', name: 'Jordan K.', source: 'In-app feedback', text: 'The dashboard is slow on my phone. It takes a long time to load when I open a large project.' },
  { id: 'FB-004', name: 'Sam T.', source: 'Support email', text: 'Can we invite a teammate without giving them admin permissions? We need a read-only role.' },
  { id: 'FB-005', name: 'Nora P.', source: 'In-app feedback', text: 'The onboarding checklist helped, but the setup guide does not explain how to import our first file.' },
  { id: 'FB-006', name: 'Ishan D.', source: 'Product interview', text: 'Exporting to CSV would help me share the findings with my manager. A downloadable report would be ideal.' },
  { id: 'FB-007', name: 'Leah S.', source: 'Support email', text: 'Page loading is slow when I filter feedback. The search also freezes on our larger workspace.' },
  { id: 'FB-008', name: 'Alex C.', source: 'In-app feedback', text: 'Please add a viewer role so I can invite people from outside my team without allowing edits.' },
  { id: 'FB-009', name: 'Riya B.', source: 'Product interview', text: 'I would love a clearer onboarding guide. The first setup screen asks for things I do not understand.' },
  { id: 'FB-010', name: 'Owen L.', source: 'In-app feedback', text: 'The weekly report should have an export button. I need a spreadsheet I can send to stakeholders.' },
  { id: 'FB-011', name: 'Anika S.', source: 'Support email', text: 'The app feels laggy and the dashboard can freeze when there are a lot of items.' },
  { id: 'FB-012', name: 'Theo W.', source: 'Product interview', text: 'It is useful to keep all our customer notes in one place. The layout makes weekly review much easier.' }
];

// `color` fills charts and bars; `ink` is the darker text colour that passes contrast on `bg`.
const themes = [
  { id: 'onboarding', name: 'A smoother first five minutes', short: 'Onboarding', terms: /\b(onboard\w*|setup|set up|guide[sd]?|getting started)\b/i, color: '#9478e3', ink: '#5b3fbf', bg: '#f0eafa', icon: '◈', task: 'Review the first-workspace setup flow', next: 'Observe a new user completing setup, then identify where guidance is missing.' },
  { id: 'export', name: 'Take the insights with you', short: 'Exports', terms: /\b(export\w*|csv|spreadsheets?|download\w*)\b/i, color: '#69b3a4', ink: '#2a6d5f', bg: '#e8f5f0', icon: '↗', task: 'Scope a useful feedback export', next: 'Confirm the required fields and format with the people asking for exports.' },
  { id: 'performance', name: 'Less waiting, more doing', short: 'Performance', terms: /\b(slow\w*|load(s|ed|ing)?|lag\w*|freez\w*|froze\w*)\b/i, color: '#dfb16e', ink: '#80551a', bg: '#fcf2e2', icon: 'ϟ', task: 'Investigate reported loading delays', next: 'Reproduce the reported cases and measure timings before choosing a fix.' },
  { id: 'access', name: 'The right access for everyone', short: 'Team access', terms: /\b(roles?|permissions?|invit\w*|teammates?|viewers?|read-only)\b/i, color: '#8a9edb', ink: '#3f57a8', bg: '#ecf0fc', icon: '♧', task: 'Define viewer access requirements', next: 'Review the requested permissions and agree a minimal viewer role.' }
];

const STATUSES = [['todo', 'To review'], ['progress', 'In progress'], ['done', 'Done']];
const STORAGE_KEY = 'lyzaxen-signaldesk-v1';
const LIMITS = { lines: 50, lineLength: 500, importItems: 1000, importTextLength: 2000, importBytes: 1_000_000 };

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const matches = item => themes.filter(t => t.terms.test(item.text));
const evidence = theme => state.feedback.filter(item => theme.terms.test(item.text));
const activeThemes = () => themes.filter(t => evidence(t).length);
const statusOf = id => (STATUSES.some(([s]) => s === state.statuses[id]) ? state.statuses[id] : 'todo');
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// ---------- State and storage ----------

// Validates anything that comes from storage or an imported file. Returns a clean state or null.
function sanitiseWorkspace(raw, { maxText = LIMITS.importTextLength } = {}) {
  if (!raw || !Array.isArray(raw.feedback) || raw.feedback.length > LIMITS.importItems) return null;
  const seen = new Set();
  const feedback = [];
  for (const item of raw.feedback) {
    if (!item || ['id', 'name', 'source', 'text'].some(key => typeof item[key] !== 'string')) return null;
    const clean = {
      id: item.id.trim().slice(0, 20),
      name: item.name.trim().slice(0, 80) || 'Unknown',
      source: item.source.trim().slice(0, 60) || 'Unknown source',
      text: item.text.trim().slice(0, maxText)
    };
    if (!clean.id || !clean.text || seen.has(clean.id)) return null;
    seen.add(clean.id);
    feedback.push(clean);
  }
  const statuses = {};
  const rawStatuses = raw.statuses && typeof raw.statuses === 'object' ? raw.statuses : {};
  themes.forEach(t => {
    if (STATUSES.some(([s]) => s === rawStatuses[t.id])) statuses[t.id] = rawStatuses[t.id];
  });
  return { feedback, statuses, origin: typeof raw.origin === 'string' ? raw.origin : 'custom' };
}

function probeStorage() {
  try {
    localStorage.setItem('__signaldesk_probe', '1');
    localStorage.removeItem('__signaldesk_probe');
    return true;
  } catch {
    return false;
  }
}

let storageOk = probeStorage();
let state = { feedback: structuredClone(sample), statuses: {}, origin: 'sample' };
try {
  const saved = sanitiseWorkspace(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  if (saved) state = saved;
} catch { /* nothing saved yet, or storage blocked */ }

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    storageOk = false;
  }
  updateStorageUi();
  return storageOk;
}

const savedSuffix = () => (storageOk ? 'Saved in this browser.' : 'Not saved: browser storage is unavailable.');

function updateStorageUi() {
  $('#storage-warning').hidden = storageOk;
  $('#storage-note').textContent = storageOk ? 'Changes save in this browser.' : 'Changes last only until this tab closes.';
  $('#footer-storage').textContent = storageOk ? 'Browser-local workspace · no account required' : 'Browser storage unavailable · session only';
}

// ---------- Toasts ----------

let toastTimer;
function toast(message) {
  const el = $('#toast');
  // Inside an open modal the rest of the page is inert and covered by the backdrop,
  // so the toast has to live in the dialog to be seen and announced.
  const host = modal.open ? modal : document.body;
  if (el.parentNode !== host) host.appendChild(el);
  clearTimeout(toastTimer);
  el.textContent = message;
  el.classList.add('visible');
  toastTimer = setTimeout(() => el.classList.remove('visible'), 4500);
}

// ---------- Rendering ----------

function tag(t) {
  return `<span class="tag" style="background:${t.bg};color:${t.ink}">${t.short}</span>`;
}

function feedbackRow(item) {
  const found = matches(item);
  const initials = item.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('');
  return `
    <article class="feedback-row">
      <span class="avatar" aria-hidden="true">${esc(initials)}</span>
      <div class="feedback-main">
        <div class="feedback-meta"><strong>${esc(item.name)}</strong><span>${esc(item.source)}</span><span class="feedback-id">${esc(item.id)}</span></div>
        <p>${esc(item.text)}</p>
        <div class="tags">${found.length ? found.map(tag).join('') : '<span class="tag tag-unmatched">Needs manual review</span>'}</div>
      </div>
    </article>`;
}

function renderMetrics() {
  const active = activeThemes();
  const unmatched = state.feedback.filter(f => !matches(f).length).length;
  const done = active.filter(t => statusOf(t.id) === 'done').length;
  const metricData = [
    ['Feedback collected', state.feedback.length, 'Items in this workspace', '▤'],
    ['Themes surfaced', active.length, 'Keyword-matched groups', '◈'],
    ['Needs manual review', unmatched, 'No matching theme found', '⌕'],
    ['Actions completed', done, `Of ${active.length} suggested actions`, '✓']
  ];
  $('#metrics').innerHTML = metricData.map(([label, value, note, icon]) => `
    <article class="metric">
      <div class="metric-label">${label}<span aria-hidden="true">${icon}</span></div>
      <div class="metric-value">${value}</div>
      <div class="metric-note">${note}</div>
    </article>`).join('');
}

function renderThemes() {
  const active = activeThemes().sort((a, b) => evidence(b).length - evidence(a).length);
  const max = Math.max(1, ...active.map(t => evidence(t).length));
  $('#themes').innerHTML = active.length ? active.map(t => {
    const items = evidence(t);
    const quote = items[0].text.length > 110 ? items[0].text.slice(0, 107).trimEnd() + '…' : items[0].text;
    return `
      <button class="theme-row" data-detail="${t.id}">
        <span class="theme-icon" style="background:${t.bg};color:${t.ink}" aria-hidden="true">${t.icon}</span>
        <div class="theme-info">
          <h3>${t.name}</h3>
          <p class="theme-quote">“${esc(quote)}”</p>
          <p class="theme-meta">${t.short} · ${plural(items.length, 'source item')}</p>
        </div>
        <div class="theme-count">${items.length}<div class="theme-bar"><span style="width:${100 * items.length / max}%;background:${t.color}"></span></div></div>
        <span class="theme-arrow" aria-hidden="true">↗</span>
      </button>`;
  }).join('') : '<div class="empty">No matching themes yet.<br>Add feedback or review unmatched notes in the inbox.</div>';
}

function renderChart() {
  const active = activeThemes();
  const total = active.reduce((sum, t) => sum + evidence(t).length, 0);
  let position = 0;
  const stops = active.map(t => {
    const start = position;
    position += evidence(t).length / total * 100;
    return `${t.color} ${start}% ${position}%`;
  });
  const donut = $('#donut');
  donut.style.background = total ? `conic-gradient(${stops.join(',')})` : '#ece9f1';
  donut.setAttribute('aria-label', total
    ? `Theme mentions: ${active.map(t => `${t.short} ${evidence(t).length}`).join(', ')}.`
    : 'No theme mentions yet.');
  $('#donut-total').textContent = total;
  $('#chart-legend').innerHTML = active.map(t => `
    <div class="legend-row"><span><i style="background:${t.color}"></i>${t.short}</span><b>${plural(evidence(t).length, 'mention')}</b></div>`).join('')
    || '<div class="legend-row">No theme mentions yet</div>';
}

function renderRecent() {
  $('#recent').innerHTML = state.feedback.slice(-3).reverse().map(feedbackRow).join('')
    || '<div class="empty">Your next useful insight starts with a note.</div>';
}

function renderInbox() {
  const query = $('#search').value.toLowerCase().trim();
  const filter = $('#theme-filter').value;
  const list = state.feedback.filter(f =>
    `${f.text} ${f.name} ${f.source} ${f.id}`.toLowerCase().includes(query) &&
    (filter === 'all' || (filter === 'unmatched' && !matches(f).length) || matches(f).some(t => t.id === filter)));
  const filtered = query || filter !== 'all';
  $('#result-count').textContent = filtered
    ? `Showing ${list.length} of ${plural(state.feedback.length, 'item')}`
    : plural(state.feedback.length, 'item');
  $('#clear-filters').hidden = !filtered;
  $('#inbox-list').innerHTML = list.length
    ? [...list].reverse().map(feedbackRow).join('')
    : `<div class="empty">No feedback matches this view.<br>Try another search or theme.</div>`;
}

function renderBoard() {
  const active = activeThemes();
  $('#board').innerHTML = STATUSES.map(([status, label]) => {
    const tasks = active.filter(t => statusOf(t.id) === status);
    return `
      <section class="board-column">
        <h2 class="column-title"><i></i>${label}<span>${tasks.length}</span></h2>
        ${tasks.length ? tasks.map(t => `
          <article class="task">
            ${tag(t)}
            <h3>${t.task}</h3>
            <p>${plural(evidence(t).length, 'feedback item')} · Suggested for review</p>
            <div class="task-actions">
              <button data-detail="${t.id}">View evidence ↗</button>
              <label><span class="sr-only">Status for ${t.task}</span>
                <select data-status="${t.id}">${STATUSES.map(([s, l]) => `<option value="${s}" ${s === status ? 'selected' : ''}>${l}</option>`).join('')}</select>
              </label>
            </div>
          </article>`).join('') : '<p class="column-empty">A little room for<br>your next move.</p>'}
      </section>`;
  }).join('');
}

function render() {
  $('#inbox-count').textContent = state.feedback.length;
  renderMetrics();
  renderThemes();
  renderChart();
  renderRecent();
  renderInbox();
  renderBoard();
}

// ---------- Views ----------

const viewInfo = {
  overview: ['Overview', 'Find the signal.', 'Turn scattered customer feedback into a clearer next move.'],
  inbox: ['Feedback inbox', 'Every voice, in one place.', 'Read the original notes. Keep the context. Make your own call.'],
  board: ['Action board', 'From feedback to forward.', 'A small, evidence-linked plan for what to investigate next.']
};

function setView(view) {
  ['overview', 'inbox', 'board'].forEach(v => { $(`#${v}-view`).hidden = v !== view; });
  document.querySelectorAll('[data-view]').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
    if (b.dataset.view === view) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  const [crumb, title, subtitle] = viewInfo[view];
  $('#breadcrumb').textContent = crumb;
  $('#page-title').textContent = title;
  $('#page-subtitle').textContent = subtitle;
}

// ---------- Dialogs ----------

const modal = $('#modal');
const body = $('#modal-body');

function openDialog(html) {
  body.innerHTML = html;
  if (!modal.open) modal.showModal();
}

function showDetail(id) {
  const t = themes.find(theme => theme.id === id);
  const items = evidence(t);
  openDialog(`
    <p class="eyebrow">SOURCE-LINKED THEME / ${plural(items.length, 'ITEM')}</p>
    <h2 id="modal-title">${t.name}</h2>
    <p class="detail-note">${t.next} This is a rule-generated suggestion, not a validated customer requirement.</p>
    <p>Matching rule: <code>${esc(t.terms.source)}</code>. Matching an item does not establish its sentiment, urgency or business impact.</p>
    ${items.map(f => `<article class="evidence"><span>${esc(f.id)} · ${esc(f.name)} · ${esc(f.source)}</span><p>${esc(f.text)}</p></article>`).join('')}`);
}

function showAbout() {
  openDialog(`
    <p class="eyebrow">INDEPENDENT CONCEPT BY LYZAXEN</p>
    <h2 id="modal-title">An honest demo of a useful idea.</h2>
    <p>SignalDesk explores how a small product team could turn scattered customer feedback into reviewable next steps.</p>
    <ul class="details-list">
      <li>The initial dataset is fictional. Names, messages and sources are examples.</li>
      <li>Theme detection uses four visible keyword rules. No AI model is connected.</li>
      <li>Every suggestion links to its original source text. Unmatched notes stay visible for manual review.</li>
      <li>Your changes stay in this browser's local storage. Export a JSON file to keep a copy, and import it later to restore it.</li>
      <li>This is not a secure multi-user system. A production version would need access control, secure storage and an agreed data-retention policy.</li>
    </ul>
    <p>Designed and developed as a portfolio concept for LyzaXen.</p>`);
}

function showAddFeedback() {
  openDialog(`
    <p class="eyebrow">BRING THE CONTEXT</p>
    <h2 id="modal-title">What are people saying?</h2>
    <p>Add one feedback item per line: up to ${LIMITS.lines} lines and ${LIMITS.lineLength} characters per line. Use fictional or non-sensitive text for this demo.</p>
    <form id="feedback-form" novalidate>
      <label>Source label<input name="source" maxlength="60" placeholder="e.g. Demo interviews" value="Manually added"></label>
      <label for="feedback-text">Feedback</label>
      <textarea id="feedback-text" name="feedback" aria-describedby="feedback-error feedback-hint" placeholder="The first setup screen is confusing.&#10;I need to export the feedback to CSV.&#10;The dashboard takes too long to load."></textarea>
      <p class="form-error" id="feedback-error" role="alert"></p>
      <p class="form-note" id="feedback-hint">Stored in this browser. No model or server receives this text.</p>
      <div class="modal-actions">
        <button type="button" class="secondary" data-close>Cancel</button>
        <button class="primary" type="submit">Add & analyse locally ↗</button>
      </div>
    </form>`);
}

function addFeedback(form) {
  const data = new FormData(form);
  const textarea = form.feedback;
  const error = $('#feedback-error');
  const lines = String(data.get('feedback')).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const longLine = lines.findIndex(l => l.length > LIMITS.lineLength);
  let message = '';
  if (!lines.length) message = 'Add at least one line of feedback.';
  else if (lines.length > LIMITS.lines) message = `That is ${lines.length} lines. Add up to ${LIMITS.lines} at a time.`;
  else if (longLine !== -1) message = `Line ${longLine + 1} has ${lines[longLine].length} characters. Keep each line to ${LIMITS.lineLength} or fewer.`;
  if (message) {
    error.textContent = message;
    textarea.setAttribute('aria-invalid', 'true');
    textarea.focus();
    return;
  }
  const start = Math.max(0, ...state.feedback.map(f => Number(f.id.replace(/\D/g, '')) || 0));
  const source = String(data.get('source')).trim().slice(0, 60) || 'Manually added';
  state.feedback.push(...lines.map((text, i) => ({ id: `FB-${String(start + i + 1).padStart(3, '0')}`, name: 'Your feedback', source, text })));
  state.origin = 'mixed';
  save();
  render();
  modal.close();
  setView('inbox');
  toast(`${plural(lines.length, 'feedback item')} added. Review the theme matches. ${savedSuffix()}`);
}

function confirmReset() {
  openDialog(`
    <p class="eyebrow">RESET WORKSPACE</p>
    <h2 id="modal-title">Start fresh with the sample?</h2>
    <p>This replaces your current feedback and action statuses in this browser with the fictional sample dataset. Export your workspace first if you want to restore it later.</p>
    <div class="modal-actions">
      <button type="button" class="secondary" data-close>Keep my workspace</button>
      <button type="button" class="primary" id="confirm-reset">Reset to sample</button>
    </div>`);
}

function resetToSample() {
  state = { feedback: structuredClone(sample), statuses: {}, origin: 'sample' };
  $('#search').value = '';
  $('#theme-filter').value = 'all';
  save();
  render();
  modal.close();
  toast(`Fictional sample restored. ${savedSuffix()}`);
}

// ---------- Import / export ----------

function exportWorkspace() {
  const data = {
    project: 'SignalDesk — LyzaXen concept',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    analysisMode: 'local-keyword-rules',
    origin: state.origin,
    feedback: state.feedback,
    statuses: state.statuses,
    themeMatches: themes.map(t => ({ themeId: t.id, theme: t.short, rule: t.terms.source, feedbackIds: evidence(t).map(f => f.id), suggestedAction: t.task, status: statusOf(t.id) }))
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `signaldesk-workspace-${data.exportedAt.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Workspace exported as JSON. Use Import to restore it later.');
}

let pendingImport = null;

async function readImport(file) {
  if (!file) return;
  if (file.size > LIMITS.importBytes) {
    toast('That file is larger than 1 MB. Import a SignalDesk export file.');
    return;
  }
  let workspace = null;
  try {
    workspace = sanitiseWorkspace(JSON.parse(await file.text()));
  } catch { /* handled below */ }
  if (!workspace || !workspace.feedback.length) {
    toast('This file is not a valid SignalDesk export. Nothing was changed.');
    return;
  }
  pendingImport = workspace;
  openDialog(`
    <p class="eyebrow">IMPORT WORKSPACE</p>
    <h2 id="modal-title">Replace this workspace?</h2>
    <p><strong>${esc(file.name)}</strong> contains ${plural(workspace.feedback.length, 'feedback item')}. Importing replaces the feedback and action statuses currently in this browser.</p>
    <div class="modal-actions">
      <button type="button" class="secondary" data-close>Cancel</button>
      <button type="button" class="primary" id="confirm-import">Replace workspace</button>
    </div>`);
}

function applyImport() {
  if (!pendingImport) return;
  state = pendingImport;
  pendingImport = null;
  $('#search').value = '';
  $('#theme-filter').value = 'all';
  save();
  render();
  modal.close();
  toast(`Imported ${plural(state.feedback.length, 'feedback item')}. ${savedSuffix()}`);
}

// ---------- Events ----------

$('#theme-filter').insertAdjacentHTML('beforeend',
  '<option value="unmatched">Needs manual review</option>' + themes.map(t => `<option value="${t.id}">${t.short}</option>`).join(''));

document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
['#view-inbox', '#see-all'].forEach(s => $(s).addEventListener('click', () => setView('inbox')));
$('#search').addEventListener('input', renderInbox);
$('#theme-filter').addEventListener('change', renderInbox);
$('#clear-filters').addEventListener('click', () => {
  $('#search').value = '';
  $('#theme-filter').value = 'all';
  renderInbox();
  $('#search').focus();
});

$('#add-button').addEventListener('click', showAddFeedback);
$('#load-sample').addEventListener('click', confirmReset);
$('#export-button').addEventListener('click', exportWorkspace);
$('#import-button').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', event => {
  readImport(event.target.files[0]);
  event.target.value = '';
});
document.querySelectorAll('[data-about]').forEach(b => b.addEventListener('click', showAbout));

// Delegated handlers survive re-renders.
document.addEventListener('click', event => {
  const detail = event.target.closest('[data-detail]');
  if (detail) showDetail(detail.dataset.detail);
});

$('#board').addEventListener('change', event => {
  const select = event.target.closest('[data-status]');
  if (!select) return;
  const id = select.dataset.status;
  state.statuses[id] = select.value;
  save();
  render();
  // The card moves column on re-render; put focus back on its status control.
  $(`[data-status="${id}"]`)?.focus();
  const label = STATUSES.find(([s]) => s === select.value)[1];
  toast(`Moved to ${label}. ${savedSuffix()}`);
});

body.addEventListener('submit', event => {
  if (event.target.id !== 'feedback-form') return;
  event.preventDefault();
  addFeedback(event.target);
});
body.addEventListener('input', event => {
  if (event.target.id !== 'feedback-text') return;
  event.target.removeAttribute('aria-invalid');
  $('#feedback-error').textContent = '';
});
body.addEventListener('click', event => {
  if (event.target.closest('[data-close]')) modal.close();
  if (event.target.closest('#confirm-reset')) resetToSample();
  if (event.target.closest('#confirm-import')) applyImport();
});

$('.close').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => { pendingImport = null; });
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const r = modal.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
});

updateStorageUi();
render();
setView('overview');
