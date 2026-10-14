(() => {
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menu.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  const decisionSteps = [...document.querySelectorAll('.decision-step')];
  const decisionDescription = document.querySelector('#decision-description');
  const stepCopy = {
    signal: 'Clarify the question and find the signal in the information.',
    analysis: 'Combine financial, operational and customer context to understand the trade-offs.',
    action: 'Turn the analysis into a practical next step the team can own.'
  };
  decisionSteps.forEach((button) => {
    button.addEventListener('click', () => {
      decisionSteps.forEach((step) => {
        const active = step === button;
        step.classList.toggle('is-active', active);
        step.setAttribute('aria-pressed', String(active));
      });
      if (decisionDescription) decisionDescription.textContent = stepCopy[button.dataset.step];
    });
  });

  const filters = [...document.querySelectorAll('.filter-button')];
  const cards = [...document.querySelectorAll('.project-card[data-tags]')];
  const filterStatus = document.querySelector('#filter-status');
  const filterLabels = {
    all: 'all',
    strategy: 'strategy and operations',
    finance: 'finance and ESG',
    ai: 'AI and digital'
  };
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.tags.split(/\s+/).includes(filter);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (filterStatus) {
        filterStatus.textContent = filter === 'all'
          ? `Showing all ${visible} examples.`
          : `Showing ${visible} examples for ${filterLabels[filter]}.`;
      }
    });
  });
})();
