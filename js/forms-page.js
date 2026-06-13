function fmtFull(str) {
  return new Date(str).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function renderAllForms() {
  const list = document.getElementById('all-forms-list');

  if (!FORMS.length) {
    list.innerHTML = `<p class="empty-state">No forms yet — check back soon!</p>`;
    return;
  }

  const sorted = [...FORMS].sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

  sorted.forEach(f => {
    const past = Date.now() > new Date(f.deadline).getTime();
    const row  = document.createElement('div');
    row.className = `form-row${past ? ' form-row-closed' : ''}`;
    row.innerHTML = `
      <div class="form-row-info">
        <p class="form-row-name">${f.name}</p>
        <p class="form-row-deadline">${fmtFull(f.deadline)}</p>
      </div>
      <div class="form-row-right">
        <span class="fc-badge ${past ? 'badge-closed' : 'badge-open'}">${past ? 'Closed' : 'Open'}</span>
        <a class="btn btn-sm ${past ? 'btn-disabled' : 'btn-outline'}"
           ${past ? 'aria-disabled="true" tabindex="-1"' : `href="${f.url}" target="_blank" rel="noopener noreferrer"`}>
          ${past ? '🔒 Closed' : '📝 Open Form'}
        </a>
      </div>
    `;
    list.appendChild(row);
  });
}

renderAllForms();
