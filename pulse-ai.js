(() => {
  const tickets = [
    { theme: 'Reporting', title: 'Export finishes but the CSV is empty', detail: 'The date range is correct in the dashboard, but the downloaded file has column names only.', confidence: 0.96, priority: 'Normal' },
    { theme: 'Access', title: 'A new teammate cannot join the workspace', detail: 'The invitation link opens a sign-in page and then returns to the invite screen.', confidence: 0.71, priority: 'Review' },
    { theme: 'Billing', title: 'Invoice shows the previous seat count', detail: 'The team removed two seats before renewal. The invoice preview still has the old quantity.', confidence: 0.89, priority: 'Normal' },
    { theme: 'Onboarding', title: 'Not sure which data source to connect first', detail: 'The setup guide lists several integrations. The team wants a suggested first step.', confidence: 0.82, priority: 'Normal' },
    { theme: 'Integration', title: 'Scheduled sync has not updated today', detail: 'The last successful update was yesterday morning. The connection page shows no error.', confidence: 0.63, priority: 'Review' },
    { theme: 'Reporting', title: 'Can I compare two quarters side by side?', detail: 'The current report shows one period at a time and the team wants a simple comparison.', confidence: 0.91, priority: 'Normal' },
    { theme: 'Access', title: 'Two-factor code is not accepted', detail: 'The user has tried a fresh code twice and can no longer access the workspace.', confidence: 0.94, priority: 'Priority' },
    { theme: 'Billing', title: 'Need a copy of last month’s invoice', detail: 'The finance contact cannot find the invoice in the billing area.', confidence: 0.88, priority: 'Normal' },
    { theme: 'Onboarding', title: 'Where should our team start?', detail: 'A newly created account is active. The user asks for a short introduction to the main workflow.', confidence: 0.76, priority: 'Review' },
    { theme: 'Integration', title: 'How often does the CRM connection refresh?', detail: 'The team wants to understand the expected delay between a CRM change and the updated dashboard.', confidence: 0.83, priority: 'Normal' },
    { theme: 'Reporting', title: 'Report totals differ from the overview card', detail: 'The report and overview card appear to use different time windows. The user is unsure which is expected.', confidence: 0.58, priority: 'Review' },
    { theme: 'Billing', title: 'Payment method needs to be changed', detail: 'The account owner asks where to replace an expired card before the next renewal.', confidence: 0.92, priority: 'Normal' }
  ];
  const list = document.querySelector('#ticket-list');
  const filter = document.querySelector('#theme-filter');
  const search = document.querySelector('#ticket-search');
  const escapeHTML = (text) => text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const summaryTheme = () => {
    const counts = tickets.reduce((result, item) => { result[item.theme] = (result[item.theme] || 0) + 1; return result; }, {});
    const largest = Math.max(...Object.values(counts));
    return Object.entries(counts).filter(([, count]) => count === largest).map(([theme]) => theme).join(', ');
  };
  function draw() {
    const query = search.value.trim().toLowerCase();
    const selected = filter.value;
    const visible = tickets.filter((ticket) => (selected === 'all' || ticket.theme === selected) && `${ticket.theme} ${ticket.title} ${ticket.detail}`.toLowerCase().includes(query));
    list.innerHTML = visible.length ? visible.map((ticket) => {
      const needsReview = ticket.confidence < 0.75;
      return `<article class="ticket-card"><div><h3>${escapeHTML(ticket.title)}</h3><p>${escapeHTML(ticket.detail)}</p></div><div class="ticket-meta"><span class="tag">${escapeHTML(ticket.theme)}</span><span class="tag ${needsReview ? 'low' : ''}">${needsReview ? 'Human review' : 'Sample label'} · ${Math.round(ticket.confidence * 100)}%</span><span class="tag">${escapeHTML(ticket.priority)} priority</span></div></article>`;
    }).join('') : '<p class="empty-state">No examples match those filters. Try another theme or search.</p>';
    document.querySelector('#ticket-count').textContent = `${visible.length} / ${tickets.length}`;
    document.querySelector('#review-count').textContent = visible.filter((ticket) => ticket.confidence < 0.75).length;
    document.querySelector('#common-theme').textContent = selected === 'all' ? summaryTheme() : selected;
    document.querySelector('#ticket-status').textContent = `${visible.length} fictional examples shown.`;
  }
  filter.addEventListener('change', draw);
  search.addEventListener('input', draw);
  draw();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
})();
