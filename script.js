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

  const lensTabs = [...document.querySelectorAll('.lens-tab')];
  const lensPanels = [...document.querySelectorAll('[data-lens-panel]')];
  function activateLens(tab, moveFocus = false) {
    lensTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    lensPanels.forEach((panel) => {
      const active = panel.dataset.lensPanel === tab.dataset.lens;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    if (moveFocus) tab.focus();
  }
  lensTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { pauseForManualChoice(); activateLens(tab); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? lensTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : lensTabs.length - 1)) % lensTabs.length;
      pauseForManualChoice();
      activateLens(lensTabs[next], true);
    });
  });

  const motionToggle = document.querySelector('[data-lens-toggle]');
  const motionLabel = document.querySelector('[data-motion-label]');
  const motionIcon = document.querySelector('[data-motion-icon]');
  const motionStatus = document.querySelector('[data-motion-status]');
  const motionProgress = document.querySelector('[data-lens-progress]');
  const studio = document.querySelector('.hero-lab');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionTimer = 0;
  let userPausedMotion = prefersReducedMotion.matches;
  let interactionPausedMotion = false;

  function syncLensMotion() {
    window.clearTimeout(motionTimer);
    const running = !userPausedMotion && !interactionPausedMotion && !document.hidden && !prefersReducedMotion.matches && lensTabs.length > 1;
    motionToggle?.classList.toggle('is-playing', running);
    if (motionToggle) {
      motionToggle.setAttribute('aria-label', running ? 'Pause automatic rotation' : 'Start automatic rotation');
      motionToggle.setAttribute('aria-pressed', String(running));
    }
    if (motionLabel) motionLabel.textContent = running ? 'Pause' : 'Play';
    if (motionIcon) motionIcon.textContent = running ? 'Ⅱ' : '▶';
    if (motionStatus) motionStatus.textContent = prefersReducedMotion.matches
      ? 'MOTION REDUCED'
      : (running ? 'AUTO ROTATION · 8 SEC' : (userPausedMotion ? 'ROTATION PAUSED' : 'PAUSED WHILE EXPLORING'));
    motionProgress?.classList.toggle('is-running', running);
    if (!running) return;
    motionTimer = window.setTimeout(() => {
      const activeIndex = lensTabs.findIndex((item) => item.getAttribute('aria-selected') === 'true');
      activateLens(lensTabs[(activeIndex + 1) % lensTabs.length]);
      syncLensMotion();
    }, 8000);
  }

  function pauseForManualChoice() {
    userPausedMotion = true;
    syncLensMotion();
  }

  motionToggle?.addEventListener('click', () => {
    userPausedMotion = !userPausedMotion;
    syncLensMotion();
  });
  studio?.addEventListener('pointerenter', () => {
    interactionPausedMotion = true;
    syncLensMotion();
  });
  studio?.addEventListener('pointerleave', () => {
    interactionPausedMotion = false;
    syncLensMotion();
  });
  studio?.addEventListener('focusin', () => {
    interactionPausedMotion = true;
    syncLensMotion();
  });
  studio?.addEventListener('focusout', (event) => {
    if (!studio.contains(event.relatedTarget)) {
      interactionPausedMotion = false;
      syncLensMotion();
    }
  });
  document.addEventListener('visibilitychange', syncLensMotion);
  prefersReducedMotion.addEventListener?.('change', () => {
    if (prefersReducedMotion.matches) userPausedMotion = true;
    syncLensMotion();
  });
  syncLensMotion();

  const filters = [...document.querySelectorAll('.filter-button')];
  const cards = [...document.querySelectorAll('.project-card[data-tags]')];
  const filterStatus = document.querySelector('#filter-status');
  const filterLabels = {strategy:'strategy and operations',finance:'finance and ESG',ai:'AI and digital'};
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
      if (filterStatus) filterStatus.textContent = filter === 'all'
        ? `Showing all ${visible} examples.`
        : `Showing ${visible} examples for ${filterLabels[filter]}.`;
    });
  });

  const caseNotes = {
    energy: {
      eyebrow: 'FINANCIAL MODELLING · PERSONAL TOOL',
      title: 'Energy investment calculator',
      facts: [
        ['Question', 'How do an upfront retrofit cost and annual operating savings compare over time?'],
        ['Approach', 'Keep the assumptions editable and show simple payback, NPV, ROI and cumulative cash flow together.'],
        ['What it demonstrates', 'A transparent business-case structure that helps people inspect the assumptions behind a recommendation.']
      ],
      note: 'Illustrative inputs only. Not investment advice or a reported client result.'
    },
    pulse: {
      eyebrow: 'AI OPERATIONS · PERSONAL PROTOTYPE',
      title: 'Pulse AI support insights',
      facts: [
        ['Question', 'How might a customer team spot repeated friction without losing sight of uncertain cases?'],
        ['Approach', 'Explore 12 fictional tickets by theme or search. Low-confidence examples are visibly routed for human review.'],
        ['What it demonstrates', 'A human-in-the-loop product concept. Labels are deterministic samples, not outputs from a live AI model.']
      ],
      note: 'Synthetic support examples only. No customer data is used.'
    },
    terra: {
      eyebrow: 'ESG & TRANSFORMATION · PROFESSIONAL EXPERIENCE',
      title: 'From climate obligations to investment choices',
      facts: [
        ['Question', 'How can commercial property teams compare climate obligations, risks and investment options?'],
        ['Approach', 'Reviewed ESG and CSRD requirements, assessed climate risks and modelled the financial case for solar PV, batteries and heat pumps.'],
        ['What it demonstrates', 'Connecting regulation and decarbonisation options to financial assumptions and practical client recommendations.']
      ],
      note: 'Client names and working materials are intentionally omitted.'
    },
    kpmg: {
      eyebrow: 'GROUP AUDIT · PROFESSIONAL EXPERIENCE',
      title: 'Making a complex group review traceable',
      facts: [
        ['Scope', 'Impairment testing for investments in 26 subsidiaries across three continents.'],
        ['Approach', 'Supported IAS 36 discounted cash-flow analysis and coordinated financial questions with legal teams.'],
        ['What it demonstrates', 'Structured analysis, documentation and coordination across a complex group review.']
      ],
      note: 'Confidential company information is not included.'
    }
  };
  const dialog = document.querySelector('#case-dialog');
  const dialogContent = document.querySelector('#case-dialog-content');
  const closeDialog = dialog?.querySelector('.dialog-close');
  document.querySelectorAll('[data-case]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = caseNotes[button.dataset.case];
      if (!dialog || !dialogContent || !item) return;
      dialogContent.replaceChildren();
      const title = document.createElement('h2');
      title.id = 'case-dialog-title';
      title.textContent = item.title;
      const eyebrow = document.createElement('p');
      eyebrow.className = 'dialog-eyebrow';
      eyebrow.textContent = item.eyebrow;
      dialogContent.append(eyebrow, title);
      const list = document.createElement('dl');
      list.className = 'case-facts';
      item.facts.forEach(([label, value]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = label;
        const detail = document.createElement('dd');
        detail.textContent = value;
        row.append(term, detail);
        list.append(row);
      });
      const note = document.createElement('p');
      note.className = 'dialog-note';
      note.textContent = item.note;
      dialogContent.append(list, note);
      dialog.showModal();
      closeDialog?.focus();
    });
  });
  closeDialog?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.body.classList.add('has-reveal');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.project-card, .timeline-item, .education-list article').forEach((item) => {
      item.classList.add('reveal-item');
      observer.observe(item);
    });
  }
})();
