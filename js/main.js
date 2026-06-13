/* ── Leaderboard modal ── */
const lbToggle   = document.getElementById('lb-toggle');
const lbModal    = document.getElementById('lb-modal');
const lbClose    = document.getElementById('lb-close');
const lbContainer = document.getElementById('lb-table-container');
let   lbLoaded   = false;

function openModal() {
  lbModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!lbLoaded) {
    fetchLeaderboard();
    lbLoaded = true;
  }
}

function closeModal() {
  lbModal.classList.remove('open');
  document.body.style.overflow = '';
}

lbToggle.addEventListener('click', openModal);
lbClose .addEventListener('click', closeModal);
lbModal .addEventListener('click', e => { if (e.target === lbModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Leaderboard: fetch CSV and render custom table ── */
async function fetchLeaderboard() {
  lbContainer.innerHTML = '<p class="lb-loading">Loading standings...</p>';
  try {
    const res  = await fetch(LEADERBOARD.csvUrl);
    if (!res.ok) throw new Error();
    const text = await res.text();
    renderLeaderboard(text);
  } catch {
    lbContainer.innerHTML = `
      <p class="lb-error">
        Could not load standings.
        <a href="${LEADERBOARD.directUrl}" target="_blank" rel="noopener noreferrer">Open in Google Sheets</a>
      </p>`;
  }
}

function renderLeaderboard(csv) {
  // Parse CSV, keep only rows where column 0 is a number (skip title/header rows)
  const rows = csv.trim().split('\n')
    .map(line => line.split(',').map(c => c.replace(/^"|"$/g, '').trim()))
    .filter(r => r[0] && !isNaN(parseInt(r[0], 10)));

  if (!rows.length) {
    lbContainer.innerHTML = '<p class="lb-empty">No standings yet. Check back after matchday!</p>';
    return;
  }

  const items = rows.map(r => ({
    rank:   parseInt(r[0], 10),
    name:   r[1] || '',
    points: r[2] || '0'
  }));

  const html = items.map(item => {
    const cls    = item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : '';
    const medal  = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;
    return `
      <div class="lb-row ${cls}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-name">${item.name}</span>
        <span class="lb-pts">${item.points}<span class="lb-pts-label"> pts</span></span>
      </div>`;
  }).join('');

  lbContainer.innerHTML = `<div class="lb-list">${html}</div>`;
}

/* ── Upcoming forms ── */
const THREE_HRS_MS = 3 * 60 * 60 * 1000;

function deadlineMs(f)  { return new Date(f.deadline).getTime(); }
function isPast(f)      { return Date.now() > deadlineMs(f); }
function shouldShow(f)  { return Date.now() < deadlineMs(f) + THREE_HRS_MS; }

function timeLeft(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000)  / 60000);
  const s = Math.floor((ms % 60000)    / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function isUrgent(deadline) {
  const ms = new Date(deadline).getTime() - Date.now();
  return ms > 0 && ms < 3_600_000;
}

function fmtDeadline(str) {
  return new Date(str).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

function buildCard(f) {
  const past   = isPast(f);
  const left   = timeLeft(f.deadline);
  const urgent = isUrgent(f.deadline);

  const el = document.createElement('article');
  el.className  = `form-card${past ? ' is-closed' : ''}`;
  el.dataset.id = f.id;

  el.innerHTML = `
    <div class="fc-top">
      <h3 class="fc-name">${f.name}</h3>
      <span class="fc-badge ${past ? 'badge-closed' : 'badge-open'}">${past ? 'Closed' : 'Open'}</span>
    </div>
    <p class="fc-deadline">⏰ <span>${fmtDeadline(f.deadline)}</span></p>
    <div class="fc-countdown">
      ${past
        ? `<span class="cdown-done">Submissions closed</span>`
        : `<div class="cdown-label">Time Remaining</div>
           <div class="cdown-time${urgent ? ' cdown-urgent' : ''}" data-deadline="${f.deadline}">${left}</div>`
      }
    </div>
    <a class="btn btn-form${past ? ' btn-disabled' : ''}"
       ${past ? 'aria-disabled="true" tabindex="-1"' : `href="${f.url}" target="_blank" rel="noopener noreferrer"`}>
      ${past ? '🔒 Form Closed' : '📝 Fill Out Form'}
    </a>
  `;
  return el;
}

function renderUpcoming() {
  const grid  = document.getElementById('forms-grid');
  const empty = document.getElementById('forms-empty');
  const list  = FORMS.filter(shouldShow);

  grid.querySelectorAll('.form-card').forEach(el => el.remove());

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.forEach(f => grid.insertBefore(buildCard(f), empty));
}

function tick() {
  document.querySelectorAll('.cdown-time[data-deadline]').forEach(el => {
    const left = timeLeft(el.dataset.deadline);
    if (!left) { renderUpcoming(); return; }
    el.textContent = left;
    el.className   = `cdown-time${isUrgent(el.dataset.deadline) ? ' cdown-urgent' : ''}`;
  });
}

renderUpcoming();
setInterval(tick,           1_000);
setInterval(renderUpcoming, 60_000);
