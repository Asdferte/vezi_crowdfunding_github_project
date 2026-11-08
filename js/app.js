// js/app.js — Основная логика каталога, вкладов, модерации и администрирования

let activeCategory = 'Все категории';
let searchQuery = '';
let sortMode = 'popular';
let selectedProjectForPledge = null;

// --- ГЛАВНАЯ СТРАНИЦА (КАТАЛОГ ПРОЕКТОВ) ---
function renderHomeCatalog() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const db = getDB();
  const totalRaised = db.projects.reduce((acc, p) => acc + Number(p.current_amount || 0), 0);
  const heroTotal = document.getElementById('heroTotalRaised');
  if (heroTotal) heroTotal.textContent = formatRub(totalRaised);

  let list = db.projects.filter(p => p.status === 'active');

  if (activeCategory !== 'Все категории') {
    list = list.filter(p => (p.category || 'Технологии и ПО') === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p => {
      const author = db.users.find(u => u.id === p.author_id);
      const authorName = author ? author.full_name.toLowerCase() : '';
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || authorName.includes(q);
    });
  }

  if (sortMode === 'percent') {
    list.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount));
  } else if (sortMode === 'new') {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    list.sort((a, b) => b.current_amount - a.current_amount);
  }

  if (list.length === 0) {
    grid.innerHTML = '<div class="panel" style="grid-column: 1 / -1; text-align:center;">Проекты по заданным параметрам не найдены</div>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const author = db.users.find(u => u.id === p.author_id);
    const authorName = author ? author.full_name : 'Иванов Иван Алексеевич';
    const pctFin = Math.round((p.current_amount / p.target_amount) * 100);

    const ms = db.milestones.filter(m => m.project_id === p.id);
    const totalWeight = ms.reduce((s, m) => s + Number(m.weight || 0), 0) || 100;
    const doneWeight = ms.filter(m => m.status === 'completed').reduce((s, m) => s + Number(m.weight || 0), 0);
    const pctWork = Math.round((doneWeight / totalWeight) * 100);
    const activeStage = ms.find(m => m.status === 'in_progress') || ms[ms.length - 1];
    const stageText = activeStage ? activeStage.title : 'Все этапы по плану';

    const rewards = db.rewards.filter(r => r.project_id === p.id && r.remaining > 0);
    const minPrice = rewards.length > 0 ? Math.min(...rewards.map(r => r.price)) : 500;
    const statusBadge = pctFin >= 100
      ? '<span class="badge badge-emerald">Цель достигнута</span>'
      : '<span class="badge badge-emerald">Смета проверена</span>';

    return `
      <article class="project-card">
        <div>
          <div class="card-cover">
            <div class="card-cover-top">
              <span class="badge" style="background:var(--surface);color:var(--text);">${p.category || 'Технологии и ПО'}</span>
              ${statusBadge}
            </div>
            <div style="font-size:13px;font-weight:700;color:var(--accent);margin-top:auto;">
              Платформа «вЕзи» • Открытая смета
            </div>
          </div>

          <h3 class="card-title" style="margin-top:14px;">${p.title}</h3>
          <div class="card-author">Автор: ${authorName}</div>
          <p class="card-desc">${p.description}</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="progress-box">
            <div class="progress-head">
              <span style="color:var(--text-sec);">Собрано средств</span>
              <strong style="color:var(--accent);">${pctFin}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill-emerald" style="width:${Math.min(pctFin, 100)}%;"></div>
            </div>
            <div style="font-size:12px;font-weight:700;">
              ${formatRub(p.current_amount)} из ${formatRub(p.target_amount)}
            </div>
          </div>

          <div class="progress-box">
            <div class="progress-head">
              <span style="color:var(--text-sec);">Выполнение дорожной карты</span>
              <strong style="color:var(--amber);">${pctWork}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill-amber" style="width:${Math.min(pctWork, 100)}%;"></div>
            </div>
            <div style="font-size:12px;color:var(--text-sec);">
              Этап: ${stageText}
            </div>
          </div>

          <div class="card-meta">
            <span>Срок до ${p.deadline.slice(0, 10)}</span>
            <span>Вознаграждения: ${rewards.length}</span>
          </div>

          <button type="button" class="btn btn-primary" style="width:100%;" onclick="openPledgeModal(${p.id})">
            Поддержать от ${formatRub(minPrice)}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function openPledgeModal(projectId) {
  const db = getDB();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return;
  selectedProjectForPledge = proj;

  document.getElementById('pledgeModalTitle').textContent = proj.title;
  const select = document.getElementById('pledgeRewardSelect');
  const rewards = db.rewards.filter(r => r.project_id === projectId && r.remaining > 0);

  select.innerHTML = '<option value="" data-price="1000">Без вознаграждения (свободный взнос)</option>' +
    rewards.map(r => `<option value="${r.id}" data-price="${r.price}">${r.title} — ${formatRub(r.price)} (осталось ${r.remaining} шт.)</option>`).join('');

  const amountInput = document.getElementById('pledgeAmountInput');
  if (rewards.length > 0) {
    select.value = String(rewards[0].id);
    amountInput.value = rewards[0].price;
  } else {
    amountInput.value = 1000;
  }

  select.onchange = function() {
    const opt = select.options[select.selectedIndex];
    if (opt && opt.dataset.price) {
      amountInput.value = opt.dataset.price;
    }
  };

  document.getElementById('pledgeModalMsg').innerHTML = '';
  document.getElementById('pledgeModal').classList.add('open');
}

function closePledgeModal() {
  document.getElementById('pledgeModal')?.classList.remove('open');
}

function submitPledgeForm(e) {
  e.preventDefault();
  if (!selectedProjectForPledge) return;

  const amount = Number(document.getElementById('pledgeAmountInput').value || 0);
  const rewardIdVal = document.getElementById('pledgeRewardSelect').value;
  const msgBox = document.getElementById('pledgeModalMsg');

  if (amount < 100) {
    msgBox.innerHTML = '<div class="alert alert-error">Минимальная сумма взноса составляет 100 ₽</div>';
    return;
  }

  const db = getDB();
  const user = getCurrentUser();
  const userId = user ? user.id : 2;
  const proj = db.projects.find(p => p.id === selectedProjectForPledge.id);

  let rewardId = null;
  if (rewardIdVal) {
    rewardId = Number(rewardIdVal);
    const rObj = db.rewards.find(r => r.id === rewardId);
    if (rObj && rObj.remaining > 0) {
      rObj.remaining -= 1;
    }
  }

  const newPayId = db.payments.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const nowIso = new Date().toISOString();

  db.payments.push({
    id: newPayId,
    user_id: userId,
    project_id: proj.id,
    reward_id: rewardId,
    amount: amount,
    status: 'authorized',
    idempotency_key: generateUUID(),
    created_at: nowIso
  });

  const newTxId = db.transactions.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  db.transactions.push({
    id: newTxId,
    payment_id: newPayId,
    type: 'HOLD',
    amount: amount,
    status: 'success',
    gateway_tx_id: 'HOLD_PAY_' + Date.now(),
    created_at: nowIso
  });

  proj.current_amount = Number(proj.current_amount) + amount;
  saveDB(db);

  msgBox.innerHTML = '<div class="alert alert-success">Взнос успешно зарезервирован и записан в базу данных!</div>';
  renderHomeCatalog();
  setTimeout(() => {
    closePledgeModal();
  }, 800);
}

// --- КАБИНЕТ СПОНСОРА ---
function renderSponsorCabinet() {
  const tbody = document.getElementById('sponsorPaymentsTableBody');
  if (!tbody) return;

  const db = getDB();
  const user = getCurrentUser();
  const sponsorId = (user && user.role === 'sponsor') ? user.id : 2;

  const myPayments = db.payments.filter(p => p.user_id === sponsorId || sponsorId === 2);
  const totalHold = myPayments.filter(p => p.status === 'authorized').reduce((s, p) => s + Number(p.amount), 0);

  const holdEl = document.getElementById('sponsorTotalHold');
  if (holdEl) holdEl.textContent = formatRub(totalHold);
  const countEl = document.getElementById('sponsorProjectsCount');
  if (countEl) countEl.textContent = myPayments.length + ' вклада';

  tbody.innerHTML = myPayments.map(pay => {
    const proj = db.projects.find(pr => pr.id === pay.project_id);
    const rew = db.rewards.find(rw => rw.id === pay.reward_id);
    let badge = '<span class="badge badge-amber">Зарезервирован</span>';
    if (pay.status === 'captured') badge = '<span class="badge badge-emerald">Перечислен автору</span>';
    if (pay.status === 'refunded') badge = '<span class="badge badge-blue">Возврат 100%</span>';

    return `
      <tr>
        <td><strong>${proj ? proj.title : 'Проект #' + pay.project_id}</strong></td>
        <td>${rew ? rew.title : 'Без вознаграждения'}</td>
        <td><strong>${formatRub(pay.amount)}</strong></td>
        <td>${badge}</td>
        <td style="color:var(--text-muted);font-size:12px;">${pay.created_at.slice(0, 10)}</td>
      </tr>
    `;
  }).join('');

  const delivBox = document.getElementById('sponsorDeliveriesList');
  if (delivBox) {
    const rewarded = myPayments.filter(p => p.reward_id);
    delivBox.innerHTML = rewarded.map(pay => {
      const rew = db.rewards.find(rw => rw.id === pay.reward_id);
      if (!rew) return '';
      return `
        <div class="progress-box" style="margin-bottom:10px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${rew.title}</div>
          <div style="font-size:12px;color:var(--text-sec);">
            Ожидаемая отправка: <strong>до ${rew.est_delivery}</strong> • Доступно в тираже: ${rew.remaining} из ${rew.limit_count} шт.
          </div>
        </div>
      `;
    }).join('');
  }
}

// --- КАБИНЕТ МОДЕРАТОРА ---
let currentAuditProjectId = 1;

function renderModeratorCabinet() {
  const queueBox = document.getElementById('moderatorQueueList');
  if (!queueBox) return;

  const db = getDB();
  const underReviewCount = db.projects.filter(p => p.status === 'under_review').length;
  const badgeCnt = document.getElementById('modQueueCountBadge');
  if (badgeCnt) badgeCnt.textContent = 'На проверке: ' + underReviewCount;

  queueBox.innerHTML = db.projects.map(p => {
    const author = db.users.find(u => u.id === p.author_id);
    const isSel = p.id === currentAuditProjectId;
    let stLabel = 'Опубликован';
    if (p.status === 'under_review') stLabel = 'На проверке сметы';
    else if (p.status === 'needs_revision') stLabel = 'Возвращён на доработку';
    else if (p.status === 'suspended') stLabel = 'Сбор приостановлен';

    return `
      <div class="progress-box" style="margin-bottom:10px;cursor:pointer;border-color:${isSel ? 'var(--accent)' : 'var(--border)'};border-width:${isSel ? '2px' : '1px'};" onclick="selectAuditProject(${p.id})">
        <div style="font-weight:700;font-size:14px;">${p.title}</div>
        <div style="font-size:12px;color:var(--text-sec);margin:4px 0;">
          Автор: ${author ? author.full_name : 'Иванов И.А.'} • Цель: ${formatRub(p.target_amount)}
        </div>
        <span class="badge ${p.status === 'under_review' ? 'badge-amber' : 'badge-emerald'}">${stLabel}</span>
      </div>
    `;
  }).join('');

  const proj = db.projects.find(p => p.id === currentAuditProjectId) || db.projects[0];
  if (!proj) return;

  document.getElementById('auditProjTitle').textContent = 'Проверка заявки: ' + proj.title;
  const items = db.budget_items.filter(b => b.project_id === proj.id);
  const displayItems = items.length > 0 ? items : db.budget_items.filter(b => b.project_id === 1);

  const tbody = document.getElementById('moderatorBudgetTableBody');
  const catNames = {
    production: 'Разработка и производство',
    logistics: 'Производство и доставка наград',
    marketing: 'Маркетинг и продвижение',
    contingency: 'Резерв на непредвиденные расходы',
    tax: 'Налоговые отчисления и сборы'
  };

  tbody.innerHTML = displayItems.map(it => `
    <tr>
      <td><strong>${catNames[it.category] || it.name}</strong></td>
      <td>${it.justification}</td>
      <td><strong>${formatRub(it.amount)}</strong></td>
    </tr>
  `).join('');
}

function selectAuditProject(id) {
  currentAuditProjectId = id;
  renderModeratorCabinet();
}

function updateModerationStatus(newStatus) {
  const db = getDB();
  const proj = db.projects.find(p => p.id === currentAuditProjectId);
  if (!proj) return;
  proj.status = newStatus;
  saveDB(db);
  renderModeratorCabinet();

  const msg = document.getElementById('modActionMsg');
  if (msg) {
    let text = 'Проект одобрен и опубликован на главной витрине!';
    if (newStatus === 'needs_revision') text = 'Проект возвращён автору на доработку с замечаниями.';
    if (newStatus === 'suspended') text = 'Сбор по проекту приостановлен.';
    msg.innerHTML = `<div class="alert alert-success">${text}</div>`;
  }
}

// --- КАБИНЕТ АДМИНИСТРАТОРА ---
function renderAdminCabinet() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  const db = getDB();
  const gmv = db.projects.reduce((s, p) => s + Number(p.current_amount || 0), 0);
  const gmvEl = document.getElementById('adminGmvVal');
  if (gmvEl) gmvEl.textContent = formatRub(gmv);

  const totalPledges = db.payments.length;
  const avg = totalPledges > 0 ? Math.round(db.payments.reduce((s, p) => s + Number(p.amount), 0) / totalPledges) : 3250;
  const avgEl = document.getElementById('adminAvgPledge');
  if (avgEl) avgEl.textContent = formatRub(avg);

  tbody.innerHTML = db.users.map(u => `
    <tr>
      <td><strong>${u.full_name}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge badge-emerald">${getRoleTitle(u.role)}</span></td>
      <td><span class="badge ${u.kyc_status === 'verified' ? 'badge-emerald' : 'badge-amber'}">${u.kyc_status === 'verified' ? 'Подтверждён' : 'На проверке'}</span></td>
      <td>
        <select class="select" style="padding:4px 8px;font-size:12px;width:auto;" onchange="changeUserRole(${u.id}, this.value)">
          <option value="sponsor" ${u.role === 'sponsor' ? 'selected' : ''}>Спонсор</option>
          <option value="initiator" ${u.role === 'initiator' ? 'selected' : ''}>Автор проекта</option>
          <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Модератор</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Администратор</option>
        </select>
      </td>
    </tr>
  `).join('');

  const txBody = document.getElementById('adminTransactionsTableBody');
  if (txBody) {
    txBody.innerHTML = db.transactions.map(t => `
      <tr>
        <td>#${t.id}</td>
        <td>Взнос #${t.payment_id}</td>
        <td><span class="badge badge-amber">${t.type}</span></td>
        <td><strong>${formatRub(t.amount)}</strong></td>
        <td><code>${t.gateway_tx_id}</code></td>
        <td>${t.created_at.slice(0, 19).replace('T', ' ')}</td>
      </tr>
    `).join('');
  }
}

function changeUserRole(userId, newRole) {
  const db = getDB();
  const usr = db.users.find(u => u.id === userId);
  if (usr) {
    usr.role = newRole;
    saveDB(db);
    renderAdminCabinet();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();

  // Инициализация главной
  if (document.getElementById('projectsGrid')) {
    renderHomeCatalog();

    document.getElementById('searchInput')?.addEventListener('input', function(e) {
      searchQuery = e.target.value.trim();
      renderHomeCatalog();
    });

    document.getElementById('sortSelect')?.addEventListener('change', function(e) {
      sortMode = e.target.value;
      renderHomeCatalog();
    });

    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.dataset.cat;
        renderHomeCatalog();
      });
    });

    document.getElementById('pledgeForm')?.addEventListener('submit', submitPledgeForm);
  }

  // Инициализация кабинетов
  renderSponsorCabinet();
  renderModeratorCabinet();
  renderAdminCabinet();
});
