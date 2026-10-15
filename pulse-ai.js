(() => {
  const tickets = [
    { id: 'S-01', theme: 'Reporting', title: 'Export finishes but the CSV is empty', detail: 'The date range is correct in the dashboard, but the downloaded file has column names only.', confidence: 0.96, priority: 'Normal', prompt: 'Compare the selected date range with the export output before treating this as a data-loss issue.' },
    { id: 'S-02', theme: 'Access', title: 'A new teammate cannot join the workspace', detail: 'The invitation link opens a sign-in page and then returns to the invite screen.', confidence: 0.71, priority: 'Review', prompt: 'Check the invitation permissions and the sign-in redirect with a test account.' },
    { id: 'S-03', theme: 'Billing', title: 'Invoice shows the previous seat count', detail: 'The team removed two seats before renewal. The invoice preview still has the old quantity.', confidence: 0.89, priority: 'Normal', prompt: 'Compare the seat-change time with the renewal and invoice-preview rules.' },
    { id: 'S-04', theme: 'Onboarding', title: 'Not sure which data source to connect first', detail: 'The setup guide lists several integrations. The team wants a suggested first step.', confidence: 0.82, priority: 'Normal', prompt: 'Look for the shortest supported path to a first successful setup.' },
    { id: 'S-05', theme: 'Integration', title: 'Scheduled sync has not updated today', detail: 'The last successful update was yesterday morning. The connection page shows no error.', confidence: 0.63, priority: 'Review', prompt: 'Check the last successful sync and connection status before retrying the integration.' },
    { id: 'S-06', theme: 'Reporting', title: 'Can I compare two quarters side by side?', detail: 'The current report shows one period at a time and the team wants a simple comparison.', confidence: 0.91, priority: 'Normal', prompt: 'Check whether period comparison is available already or is a recurring reporting need.' },
    { id: 'S-07', theme: 'Access', title: 'Two-factor code is not accepted', detail: 'The user has tried a fresh code twice and can no longer access the workspace.', confidence: 0.94, priority: 'Priority', prompt: 'Keep the access recovery path clear and check the authentication failure with the account owner.' },
    { id: 'S-08', theme: 'Billing', title: 'Need a copy of last month’s invoice', detail: 'The finance contact cannot find the invoice in the billing area.', confidence: 0.88, priority: 'Normal', prompt: 'Check invoice visibility for the finance role and make the download path easy to find.' },
    { id: 'S-09', theme: 'Onboarding', title: 'Where should our team start?', detail: 'A newly created account is active. The user asks for a short introduction to the main workflow.', confidence: 0.76, priority: 'Review', prompt: 'Identify the first action that would help a new team reach a useful outcome.' },
    { id: 'S-10', theme: 'Integration', title: 'How often does the CRM connection refresh?', detail: 'The team wants to understand the expected delay between a CRM change and the updated dashboard.', confidence: 0.83, priority: 'Normal', prompt: 'Confirm the expected refresh interval and show when the last update ran.' },
    { id: 'S-11', theme: 'Reporting', title: 'Report totals differ from the overview card', detail: 'The report and overview card appear to use different time windows. The user is unsure which is expected.', confidence: 0.58, priority: 'Review', prompt: 'Compare the date windows shown in both places and record whether the mismatch reproduces.' },
    { id: 'S-12', theme: 'Billing', title: 'Payment method needs to be changed', detail: 'The account owner asks where to replace an expired card before the next renewal.', confidence: 0.92, priority: 'Normal', prompt: 'Check the payment settings path and confirm which account role can make the change.' }
  ];
  const threshold = 0.75;
  const counts = tickets.reduce((out, ticket) => { out[ticket.theme] = (out[ticket.theme] || 0) + 1; return out; }, {});
  const themes = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const list = document.querySelector('#ticket-list');
  const breakdown = document.querySelector('#theme-breakdown');
  const search = document.querySelector('#ticket-search');
  const status = document.querySelector('#ticket-status');
  const reviewed = new Set();
  let activeTheme = 'all';
  let queue = 'review';
  const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const byId = (id) => tickets.find((ticket) => ticket.id === id);
  const needsReview = (ticket) => ticket.confidence < threshold && !reviewed.has(ticket.id);

  function drawBreakdown() {
    const max = Math.max(...Object.values(counts));
    breakdown.innerHTML = themes.map((theme) => {
      const selected = activeTheme === theme;
      return `<button type="button" class="theme-row${selected ? ' is-selected' : ''}" data-theme="${escapeHTML(theme)}" aria-pressed="${selected}" aria-label="Filter to ${escapeHTML(theme)}: ${counts[theme]} fictional cases">
        <span class="theme-row-head"><strong>${escapeHTML(theme)}</strong><span>${counts[theme]} / ${tickets.length}</span></span>
        <span class="theme-bar" aria-hidden="true"><i style="--bar-width:${Math.round(counts[theme] / max * 100)}%"></i></span>
      </button>`;
    }).join('');
  }
  function draw() {
    const query = search.value.trim().toLowerCase();
    const filtered = tickets.filter((ticket) => {
      const matchesTheme = activeTheme === 'all' || ticket.theme === activeTheme;
      const matchesQueue = queue === 'all' || needsReview(ticket);
      const matchesSearch = `${ticket.theme} ${ticket.title} ${ticket.detail}`.toLowerCase().includes(query);
      return matchesTheme && matchesQueue && matchesSearch;
    });
    list.innerHTML = filtered.length ? filtered.map((ticket) => {
      const review = needsReview(ticket);
      const isReviewed = reviewed.has(ticket.id);
      return `<article class="case-row${review ? ' is-review' : ''}${isReviewed ? ' is-reviewed' : ''}">
        <button class="case-trigger" type="button" aria-expanded="false" aria-controls="detail-${ticket.id}" data-open-case="${ticket.id}">
          <span class="case-trigger-main"><span class="case-id">${ticket.id} <i aria-hidden="true">·</i> ${escapeHTML(ticket.theme)}</span><strong>${escapeHTML(ticket.title)}</strong><span class="case-excerpt">${escapeHTML(ticket.detail)}</span></span>
          <span class="case-trigger-side"><span class="case-state${review ? ' needs-human' : ''}">${isReviewed ? 'Reviewed · demo' : (review ? 'Needs review' : 'Sample label')}</span><span class="case-score">Fixed sample score <b>${Math.round(ticket.confidence * 100)}%</b></span><span class="case-open-label">Inspect case <i aria-hidden="true">＋</i></span></span>
        </button>
        <div class="case-details" id="detail-${ticket.id}" hidden>
          <div class="case-evidence"><span class="detail-label">FICTIONAL CASE DETAIL</span><p>${escapeHTML(ticket.detail)}</p></div>
          <div class="case-prompt"><span class="detail-label">REVIEW PROMPT · ILLUSTRATIVE</span><p>${escapeHTML(ticket.prompt)}</p></div>
          <div class="case-detail-footer"><span>Sample priority: <strong>${escapeHTML(ticket.priority)}</strong></span><span>Fixed score: <strong>${Math.round(ticket.confidence * 100)}%</strong></span>${review ? `<button class="review-action" type="button" data-review-case="${ticket.id}">Mark reviewed · demo</button>` : (isReviewed ? '<span class="reviewed-note">Reviewed in this session</span>' : '')}</div>
        </div>
      </article>`;
    }).join('') : '<div class="queue-empty"><span>NO MATCHING CASES</span><p>Try another theme, queue or search.</p></div>';
    const openReviews = tickets.filter(needsReview).length;
    document.querySelector('#review-count').textContent = openReviews;
    document.querySelector('#queue-review-count').textContent = openReviews;
    document.querySelector('#all-queue-count').textContent = tickets.length;
    document.querySelector('#triaged-count').textContent = reviewed.size;
    document.querySelector('#ticket-count').textContent = tickets.length;
    document.querySelector('#theme-count').textContent = themes.length;
    document.querySelectorAll('.queue-tab').forEach((button) => {
      const active = button.dataset.queue === queue;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const filterDescription = activeTheme === 'all' ? '' : ` in ${activeTheme}`;
    const queueDescription = queue === 'review' ? ' needing a human review' : '';
    status.textContent = `Showing ${filtered.length} fictional case${filtered.length === 1 ? '' : 's'}${queueDescription}${filterDescription}.`;
  }
  function selectTheme(theme) {
    activeTheme = theme;
    queue = 'all';
    drawBreakdown();
    draw();
  }

  drawBreakdown();
  draw();
  breakdown.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (button) selectTheme(button.dataset.theme);
  });
  document.querySelectorAll('.queue-tab').forEach((button) => button.addEventListener('click', () => {
    queue = button.dataset.queue;
    activeTheme = 'all';
    drawBreakdown();
    draw();
  }));
  search.addEventListener('input', draw);
  list.addEventListener('click', (event) => {
    const reviewButton = event.target.closest('[data-review-case]');
    if (reviewButton) {
      const ticket = byId(reviewButton.dataset.reviewCase);
      if (!ticket) return;
      reviewed.add(ticket.id);
      draw();
      const next = list.querySelector('.case-trigger');
      next?.focus();
      status.textContent = `${ticket.id} marked reviewed in this local demo. No real case was changed.`;
      return;
    }
    const trigger = event.target.closest('[data-open-case]');
    if (!trigger) return;
    const details = document.getElementById(trigger.getAttribute('aria-controls'));
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.case-trigger[aria-expanded="true"]').forEach((open) => {
      open.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(open.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
    if (!expanded && details) {
      trigger.setAttribute('aria-expanded', 'true');
      details.hidden = false;
    }
  });
  document.querySelector('#reset-demo').addEventListener('click', () => {
    reviewed.clear();
    activeTheme = 'all';
    queue = 'review';
    search.value = '';
    drawBreakdown();
    draw();
    status.textContent = 'Demo reset. The three low-confidence examples are back in the human review queue.';
  });

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
})();