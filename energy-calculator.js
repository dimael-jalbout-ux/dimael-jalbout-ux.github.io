(() => {
  const form = document.querySelector('#calculator-form');
  const fields = ['investment', 'savings', 'maintenance', 'horizon', 'discount'];
  const money = new Intl.NumberFormat('en-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  const value = (name) => Number(form.elements[name].value);

  function renderChart(investment, annualBenefit, horizon) {
    const width = 600;
    const height = 136;
    const pad = { top: 12, right: 14, bottom: 25, left: 14 };
    const values = Array.from({ length: horizon + 1 }, (_, year) => -investment + annualBenefit * year);
    const low = Math.min(0, ...values);
    const high = Math.max(0, ...values);
    const range = Math.max(1, high - low);
    const x = (i) => pad.left + i * (width - pad.left - pad.right) / horizon;
    const y = (v) => pad.top + (high - v) * (height - pad.top - pad.bottom) / range;
    const d = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const area = `${d} L ${x(horizon).toFixed(1)} ${(height - pad.bottom).toFixed(1)} L ${x(0).toFixed(1)} ${(height - pad.bottom).toFixed(1)} Z`;
    const zeroY = y(0).toFixed(1);
    const midX = x(Math.round(horizon / 2)).toFixed(1);
    const endX = x(horizon).toFixed(1);
    document.querySelector('#cashflow-chart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><line class="axis" x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}"/><line class="zero" x1="${pad.left}" y1="${zeroY}" x2="${width - pad.right}" y2="${zeroY}"/><path class="benefit-area" d="${area}"/><path class="benefit-line" d="${d}"/><text x="${pad.left}" y="${height - 7}">Year 0</text><text x="${midX}" y="${height - 7}" text-anchor="middle">Year ${Math.round(horizon / 2)}</text><text x="${endX}" y="${height - 7}" text-anchor="end">Year ${horizon}</text></svg>`;
  }

  function update() {
    if (!form.reportValidity()) return;
    const investment = value('investment');
    const savings = value('savings');
    const maintenance = value('maintenance');
    const horizon = Math.trunc(value('horizon'));
    const discount = value('discount') / 100;
    const annualBenefit = savings - maintenance;
    const payback = annualBenefit > 0 ? investment / annualBenefit : null;
    const npv = discount === 0
      ? -investment + annualBenefit * horizon
      : -investment + annualBenefit * (1 - Math.pow(1 + discount, -horizon)) / discount;
    const roi = investment > 0 ? ((annualBenefit * horizon - investment) / investment) * 100 : 0;
    setText('payback', payback === null ? 'Not reached' : `${payback.toFixed(1)} years`);
    setText('npv', money.format(npv));
    setText('annual-benefit', money.format(annualBenefit));
    setText('roi', `${roi.toFixed(0)}%`);
    renderChart(investment, annualBenefit, horizon);
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  fields.forEach((name) => form.elements[name].addEventListener('input', update));
  update();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
})();
