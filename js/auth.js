// js/auth.js — Управление темой, шапкой, авторизацией и регистрацией

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  setTheme(saved);
}

function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem(THEME_KEY, mode);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function renderHeaderUser() {
  const box = document.getElementById('headerUserArea');
  if (!box) return;
  const user = getCurrentUser();
  if (user) {
    const cabinetUrl = getRolePage(user.role);
    const roleName = getRoleTitle(user.role);
    box.innerHTML = `
      <span class="badge badge-emerald">${roleName}</span>
      <a href="${cabinetUrl}" class="btn btn-outline">${user.full_name}</a>
      <button type="button" class="btn btn-danger" onclick="logoutUser()">Выйти</button>
    `;
  } else {
    box.innerHTML = `
      <a href="login.html" class="btn btn-outline">Войти</a>
      <a href="register.html" class="btn btn-primary">Регистрация</a>
    `;
  }
}

function logoutUser() {
  setCurrentUser(null);
  window.location.href = 'login.html';
}

function initLoginPage() {
  const current = getCurrentUser();
  const alreadyBox = document.getElementById('alreadyLoggedBox');
  const formWrap = document.getElementById('loginFormWrap');

  if (current && alreadyBox && formWrap) {
    alreadyBox.style.display = 'block';
    formWrap.style.display = 'none';
    document.getElementById('currentLoggedName').textContent = current.full_name;
    document.getElementById('currentLoggedRole').textContent = getRoleTitle(current.role);
    document.getElementById('goCabinetBtn').href = getRolePage(current.role);
    return;
  }

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPassword').value;
    const msgBox = document.getElementById('loginMsg');

    msgBox.innerHTML = '';

    if (!email || !email.includes('@')) {
      msgBox.innerHTML = '<div class="alert alert-error">Введите корректный адрес электронной почты</div>';
      return;
    }
    if (!pass || pass.length < 4) {
      msgBox.innerHTML = '<div class="alert alert-error">Введите пароль (не менее 4 символов)</div>';
      return;
    }

    const activeUser = getCurrentUser();
    if (activeUser) {
      msgBox.innerHTML = '<div class="alert alert-error">Вы уже авторизованы в системе. Сначала выйдите из текущего аккаунта.</div>';
      return;
    }

    const db = getDB();
    const found = db.users.find(u => u.email.toLowerCase() === email);
    if (!found) {
      msgBox.innerHTML = '<div class="alert alert-error">Пользователь с такой почтой не найден в базе данных</div>';
      return;
    }

    const validPass = found.password ? (found.password === pass) : (pass === 'password123');
    if (!validPass) {
      msgBox.innerHTML = '<div class="alert alert-error">Неверный пароль. Проверьте введённые данные</div>';
      return;
    }

    setCurrentUser(found);
    msgBox.innerHTML = '<div class="alert alert-success">Вход выполнен успешно! Перенаправление в личный кабинет...</div>';
    setTimeout(() => {
      window.location.href = getRolePage(found.role);
    }, 600);
  });
}

function quickLogin(email) {
  const activeUser = getCurrentUser();
  if (activeUser) {
    alert('Вы уже вошли в систему как ' + activeUser.full_name + '. Сначала нажмите «Выйти».');
    return;
  }
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = 'password123';
  document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const fullName = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const role = document.getElementById('regRole').value;
    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPassConfirm').value;
    const consent = document.getElementById('regConsent').checked;
    const msgBox = document.getElementById('regMsg');

    msgBox.innerHTML = '';

    const words = fullName.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      msgBox.innerHTML = '<div class="alert alert-error">Укажите фамилию и имя полностью (минимум два слова)</div>';
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msgBox.innerHTML = '<div class="alert alert-error">Введите корректный адрес электронной почты</div>';
      return;
    }
    if (pass.length < 6) {
      msgBox.innerHTML = '<div class="alert alert-error">Пароль должен содержать не менее 6 символов</div>';
      return;
    }
    if (pass !== pass2) {
      msgBox.innerHTML = '<div class="alert alert-error">Введённые пароли не совпадают</div>';
      return;
    }
    if (!consent) {
      msgBox.innerHTML = '<div class="alert alert-error">Необходимо подтвердить согласие с правилами площадки</div>';
      return;
    }

    const db = getDB();
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      msgBox.innerHTML = '<div class="alert alert-error">Пользователь с такой электронной почтой уже зарегистрирован в базе</div>';
      return;
    }

    const newId = db.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser = {
      id: newId,
      email: email,
      password: pass,
      password_hash: '$2b$12$custom_' + btoa(pass).slice(0, 22),
      full_name: fullName,
      role: role,
      kyc_status: 'verified',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);
    setCurrentUser(newUser);

    msgBox.innerHTML = '<div class="alert alert-success">Аккаунт успешно создан и сохранён в базу данных! Переход в кабинет...</div>';
    setTimeout(() => {
      window.location.href = getRolePage(newUser.role);
    }, 700);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await initDB();
  renderHeaderUser();
});
