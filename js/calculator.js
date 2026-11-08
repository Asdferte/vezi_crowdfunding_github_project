// js/calculator.js — Калькулятор бюджета и управление проектами автора

function calculateBudgetState() {
  const prod = Number(document.getElementById('calcProd')?.value || 0);
  const log = Number(document.getElementById('calcLog')?.value || 0);
  const mkt = Number(document.getElementById('calcMkt')?.value || 0);
  const reservePct = Number(document.getElementById('calcReserve')?.value || 8);
  const taxPct = Number(document.querySelector('input[name="taxMode"]:checked')?.value || 6);

  const direct = prod + log + mkt;
  const reserveRub = Math.round(direct * (reservePct / 100));
  const subtotal = direct + reserveRub;

  // Учет налога и сборов (5% площадка + 3% платежный шлюз = 8%)
  const feeRate = 0.08;
  const taxRate = taxPct / 100;
  const grossGoal = Math.round((subtotal * (1 + taxRate)) / (1 - feeRate));
  const feesAndTax = grossGoal - subtotal;
  const netPayout = subtotal;

  const lblRes = document.getElementById('reserveValLabel');
  if (lblRes) lblRes.textContent = `${reservePct}% (+${formatRub(reserveRub)})`;

  const badgeRes = document.getElementById('reserveStatusBadge');
  if (badgeRes) {
    if (reservePct < 5 || reservePct > 10) {
      badgeRes.className = 'badge badge-danger';
      badgeRes.textContent = 'Требуется от 5% до 10%';
    } else {
      badgeRes.className = 'badge badge-emerald';
      badgeRes.textContent = 'Норматив выполнен';
    }
  }

  const outDirect = document.getElementById('outDirect');
  if (outDirect) outDirect.textContent = formatRub(direct);
  const outRes = document.getElementById('outReserve');
  if (outRes) outRes.textContent = formatRub(reserveRub);
  const outFees = document.getElementById('outFees');
  if (outFees) outFees.textContent = formatRub(feesAndTax);
  const outGross = document.getElementById('outGross');
  if (outGross) outGross.textContent = formatRub(grossGoal);
  const outNet = document.getElementById('outNet');
  if (outNet) outNet.textContent = formatRub(netPayout);

  return { prod, log, mkt, direct, reservePct, reserveRub, taxPct, feesAndTax, grossGoal, netPayout };
}

function renderInitiatorData() {
  const db = getDB();
  const stageList = document.getElementById('initiatorMilestonesList');
  if (stageList) {
    const ms = db.milestones.filter(m => m.project_id === 1);
    stageList.innerHTML = ms.map(m => {
      let badge = '<span class="badge">Ожидает начала</span>';
      if (m.status === 'completed') badge = '<span class="badge badge-emerald">Завершён • ' + (m.report_text || 'Отчёт опубликован') + '</span>';
      else if (m.status === 'in_progress') badge = '<span class="badge badge-amber">В работе • Срок до ' + m.due_date + '</span>';
      return `
        <div class="progress-box" style="margin-bottom:10px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:6px;">${m.title} (${m.weight}%)</div>
          ${badge}
        </div>
      `;
    }).join('');
  }

  const rewList = document.getElementById('initiatorRewardsList');
  if (rewList) {
    const rws = db.rewards.filter(r => r.project_id === 1);
    rewList.innerHTML = rws.map(r => `
      <div class="progress-box" style="margin-bottom:10px;">
        <div style="font-weight:700;font-size:13px;">${r.title}</div>
        <div style="font-size:12px;color:var(--accent);font-weight:600;margin-top:3px;">
          ${formatRub(r.price)} • Осталось ${r.remaining} из ${r.limit_count} шт.
        </div>
      </div>
    `).join('');
  }
}

function submitNewCampaign(e) {
  e.preventDefault();
  const state = calculateBudgetState();
  const title = document.getElementById('newProjTitle').value.trim();
  const cat = document.getElementById('newProjCat').value;
  const desc = document.getElementById('newProjDesc').value.trim();
  const msg = document.getElementById('calcMsg');

  msg.innerHTML = '';

  if (!title || !desc) {
    msg.innerHTML = '<div class="alert alert-error">Заполните название и описание нового проекта</div>';
    return;
  }
  if (state.direct < 10000) {
    msg.innerHTML = '<div class="alert alert-error">Минимальная сумма прямых расходов должна быть не менее 10 000 ₽</div>';
    return;
  }
  if (state.reservePct < 5 || state.reservePct > 10) {
    msg.innerHTML = '<div class="alert alert-error">Обязательный резерв на непредвиденные расходы должен быть от 5% до 10%</div>';
    return;
  }

  const db = getDB();
  const user = getCurrentUser();
  const newProjId = db.projects.reduce((m, p) => Math.max(m, p.id), 0) + 1;

  db.projects.push({
    id: newProjId,
    author_id: user ? user.id : 1,
    category: cat,
    title: title,
    description: desc,
    target_amount: state.grossGoal,
    current_amount: 0,
    status: 'under_review',
    deadline: '2027-02-15T23:59:59Z',
    created_at: new Date().toISOString()
  });

  let nextItemId = db.budget_items.reduce((m, b) => Math.max(m, b.id), 0) + 1;
  db.budget_items.push(
    { id: nextItemId++, project_id: newProjId, category: 'production', name: 'Разработка и производство', amount: state.prod, justification: document.getElementById('justProd').value },
    { id: nextItemId++, project_id: newProjId, category: 'logistics', name: 'Производство и доставка наград', amount: state.log, justification: document.getElementById('justLog').value },
    { id: nextItemId++, project_id: newProjId, category: 'marketing', name: 'Маркетинг и продвижение', amount: state.mkt, justification: document.getElementById('justMkt').value },
    { id: nextItemId++, project_id: newProjId, category: 'contingency', name: `Резерв рисков (${state.reservePct}%)`, amount: state.reserveRub, justification: 'Страховой фонд на непредвиденные расходы' },
    { id: nextItemId++, project_id: newProjId, category: 'tax', name: 'Налоги и сборы площадки', amount: state.feesAndTax, justification: 'Налоговые отчисления и комиссия' }
  );

  saveDB(db);
  msg.innerHTML = `<div class="alert alert-success">Проект «${title}» с расчётной целью ${formatRub(state.grossGoal)} сохранён в базу и отправлен на проверку модератору!</div>`;
  document.getElementById('newProjTitle').value = '';
  document.getElementById('newProjDesc').value = '';
}

function addStageReport() {
  const txt = prompt('Введите текст отчёта по текущему этапу дорожной карты:');
  if (!txt) return;
  const db = getDB();
  const stage = db.milestones.find(m => m.project_id === 1 && m.status !== 'completed');
  if (stage) {
    stage.status = 'completed';
    stage.report_text = txt;
    saveDB(db);
    renderInitiatorData();
    alert('Отчёт опубликован, этап отмечен как завершённый!');
  } else {
    alert('Все этапы проекта уже завершены.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calcProd')) {
    ['calcProd', 'calcLog', 'calcMkt', 'calcReserve'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', calculateBudgetState);
    });
    document.querySelectorAll('input[name="taxMode"]').forEach(el => {
      el.addEventListener('change', calculateBudgetState);
    });
    calculateBudgetState();
    renderInitiatorData();
  }
});
