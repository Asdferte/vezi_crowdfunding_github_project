// js/db.js — Модуль базы данных платформы «вЕзи»
const INITIAL_DB = {
  "users": [
    {
      "id": 1,
      "email": "author@vezi.ru",
      "password": "password123",
      "password_hash": "$2b$12$e8xL4sF2h1O5Q7Vz09mXeeZ0L8aGk7xGgH5M6yF8s3K4w6Y1Z8c5e",
      "full_name": "Иванов Иван Алексеевич",
      "role": "initiator",
      "kyc_status": "verified",
      "created_at": "2026-10-01T10:00:00Z"
    },
    {
      "id": 2,
      "email": "sponsor@mail.ru",
      "password": "password123",
      "password_hash": "$2b$12$y1wX5aP9k2L8Q1Nz07mVeeX1L9bHk8yHhI6N7zG9s4L5x7Z2a9d6f",
      "full_name": "Смирнов Алексей Петрович",
      "role": "sponsor",
      "kyc_status": "verified",
      "created_at": "2026-10-05T12:30:00Z"
    },
    {
      "id": 3,
      "email": "moderator@vezi.ru",
      "password": "password123",
      "password_hash": "$2b$12$k9zL3mN7j1P4V8Wz01qAeeZ2M8cIk9xJjK7O8aH0s5M6y8A3b0e7g",
      "full_name": "Карцев Михаил Сергеевич",
      "role": "moderator",
      "kyc_status": "verified",
      "created_at": "2026-09-15T09:00:00Z"
    },
    {
      "id": 4,
      "email": "admin@vezi.ru",
      "password": "password123",
      "password_hash": "$2b$12$b3xM7vP8k4L1Q9Nz05mSeeZ3N9dJk0yKkL8P9bI1s6N7z9B4c1f8h",
      "full_name": "Кузнецов Дмитрий Олегович",
      "role": "admin",
      "kyc_status": "verified",
      "created_at": "2026-09-01T08:00:00Z"
    }
  ],
  "projects": [
    {
      "id": 1,
      "author_id": 1,
      "category": "Технологии и ПО",
      "title": "Краудфандинговое веб-приложение «вЕзи»",
      "description": "Специализированная платформа с прозрачным калькулятором сметы, контролем дорожной карты и автоматическим возвратом средств спонсорам.",
      "target_amount": 165000.0,
      "current_amount": 128700.0,
      "status": "active",
      "deadline": "2026-12-31T23:59:59Z",
      "created_at": "2026-10-10T14:20:00Z"
    },
    {
      "id": 2,
      "author_id": 1,
      "category": "Игры",
      "title": "Кооперативный тактический шутер «Бастион»",
      "description": "Отечественная сетевая игра с выделенными серверами, разрушаемым окружением и поддержкой пользовательских модификаций.",
      "target_amount": 500000.0,
      "current_amount": 540000.0,
      "status": "active",
      "deadline": "2026-11-25T23:59:59Z",
      "created_at": "2026-09-20T11:00:00Z"
    },
    {
      "id": 3,
      "author_id": 1,
      "category": "Устройства",
      "title": "Станция мониторинга микроклимата «ЭкоБокс»",
      "description": "Настольный датчик уровня углекислого газа, температуры и влажности с открытым протоколом и мобильным приложением.",
      "target_amount": 210000.0,
      "current_amount": 84000.0,
      "status": "active",
      "deadline": "2026-12-20T23:59:59Z",
      "created_at": "2026-10-18T09:15:00Z"
    },
    {
      "id": 4,
      "author_id": 1,
      "category": "Книги и медиа",
      "title": "Иллюстрированный атлас архитектуры Сибири",
      "description": "Подарочное печатное издание с архивными чертежами, фотографиями памятников деревянного зодчества и реконструкциями.",
      "target_amount": 140000.0,
      "current_amount": 0.0,
      "status": "under_review",
      "deadline": "2027-01-30T23:59:59Z",
      "created_at": "2026-11-05T16:40:00Z"
    }
  ],
  "budget_items": [
    {
      "id": 1,
      "project_id": 1,
      "category": "production",
      "name": "Разработка серверной части и интерфейса",
      "amount": 90000.0,
      "justification": "Оплата труда программистов за два спринта разработки"
    },
    {
      "id": 2,
      "project_id": 1,
      "category": "logistics",
      "name": "Производство и курьерская доставка мерча",
      "amount": 25000.0,
      "justification": "Пошив брендированных футболок и отправка спонсорам через СДЭК"
    },
    {
      "id": 3,
      "project_id": 1,
      "category": "marketing",
      "name": "Продвижение и видеоролик",
      "amount": 15000.0,
      "justification": "Привлечение первых участников на платформу"
    },
    {
      "id": 4,
      "project_id": 1,
      "category": "contingency",
      "name": "Обязательный резерв на непредвиденные расходы",
      "amount": 10400.0,
      "justification": "Страховой фонд 8% на случай удорожания материалов и логистики"
    },
    {
      "id": 5,
      "project_id": 1,
      "category": "tax",
      "name": "Налоговые отчисления и сборы",
      "amount": 24600.0,
      "justification": "Налог УСН 6% и сервисный сбор площадки и платежного шлюза"
    }
  ],
  "rewards": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Цифровая благодарность и значок в профиле",
      "price": 500.0,
      "limit_count": 100,
      "remaining": 98,
      "est_delivery": "2027-01-15"
    },
    {
      "id": 2,
      "project_id": 1,
      "title": "Фирменная футболка с логотипом проекта",
      "price": 2500.0,
      "limit_count": 50,
      "remaining": 46,
      "est_delivery": "2027-02-28"
    },
    {
      "id": 3,
      "project_id": 1,
      "title": "Ранний доступ к закрытому тестированию",
      "price": 10000.0,
      "limit_count": 10,
      "remaining": 9,
      "est_delivery": "2027-01-20"
    },
    {
      "id": 4,
      "project_id": 2,
      "title": "Цифровая копия игры и саундтрек",
      "price": 1200.0,
      "limit_count": 300,
      "remaining": 140,
      "est_delivery": "2026-12-15"
    },
    {
      "id": 5,
      "project_id": 3,
      "title": "Станция «ЭкоБокс» из первой партии",
      "price": 3500.0,
      "limit_count": 60,
      "remaining": 36,
      "est_delivery": "2027-03-10"
    }
  ],
  "milestones": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Проектирование архитектуры и базы данных",
      "weight": 20,
      "due_date": "2026-11-15",
      "status": "completed",
      "report_text": "Сформирована схема базы данных и макеты всех экранов."
    },
    {
      "id": 2,
      "project_id": 1,
      "title": "Разработка калькулятора сметы и серверной части",
      "weight": 50,
      "due_date": "2026-12-05",
      "status": "in_progress",
      "report_text": "Реализована формула расчёта цели сбора и резервирование платежей."
    },
    {
      "id": 3,
      "project_id": 1,
      "title": "Тестирование и открытый запуск витрины",
      "weight": 30,
      "due_date": "2026-12-25",
      "status": "pending",
      "report_text": ""
    },
    {
      "id": 4,
      "project_id": 2,
      "title": "Сетевой код и базовые локации",
      "weight": 70,
      "due_date": "2026-11-10",
      "status": "completed",
      "report_text": "Серверы выдерживают нагрузку до 64 игроков на карте."
    },
    {
      "id": 5,
      "project_id": 2,
      "title": "Финальная озвучка и релиз",
      "weight": 30,
      "due_date": "2026-11-25",
      "status": "in_progress",
      "report_text": ""
    },
    {
      "id": 6,
      "project_id": 3,
      "title": "Разводка печатных плат и корпуса",
      "weight": 25,
      "due_date": "2026-11-20",
      "status": "completed",
      "report_text": "Готова первая ревизия плат датчика CO2."
    },
    {
      "id": 7,
      "project_id": 3,
      "title": "Сборка опытной партии",
      "weight": 75,
      "due_date": "2026-12-18",
      "status": "in_progress",
      "report_text": ""
    }
  ],
  "payments": [
    {
      "id": 1,
      "user_id": 2,
      "project_id": 1,
      "reward_id": 2,
      "amount": 2500.0,
      "status": "authorized",
      "idempotency_key": "c3b9b4a1-7e82-4d2c-9a28-6a5b8e9c011a",
      "created_at": "2026-10-15T16:45:00Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "project_id": 1,
      "reward_id": 3,
      "amount": 10000.0,
      "status": "authorized",
      "idempotency_key": "f1d4a8e2-9b31-4c18-8f55-1b2c3d4e5f60",
      "created_at": "2026-10-16T11:10:00Z"
    },
    {
      "id": 3,
      "user_id": 2,
      "project_id": 1,
      "reward_id": 1,
      "amount": 2500.0,
      "status": "authorized",
      "idempotency_key": "a7e6c5d4-3b2a-1f0e-9d8c-7b6a5e4d3c2b",
      "created_at": "2026-10-18T18:20:00Z"
    }
  ],
  "transactions": [
    {
      "id": 1,
      "payment_id": 1,
      "type": "HOLD",
      "amount": 2500.0,
      "status": "success",
      "gateway_tx_id": "HOLD_PAY_20261015_001",
      "created_at": "2026-10-15T16:45:02Z"
    },
    {
      "id": 2,
      "payment_id": 2,
      "type": "HOLD",
      "amount": 10000.0,
      "status": "success",
      "gateway_tx_id": "HOLD_PAY_20261016_002",
      "created_at": "2026-10-16T11:10:04Z"
    },
    {
      "id": 3,
      "payment_id": 3,
      "type": "HOLD",
      "amount": 2500.0,
      "status": "success",
      "gateway_tx_id": "HOLD_PAY_20261018_003",
      "created_at": "2026-10-18T18:20:03Z"
    }
  ]
};

const DB_KEY = 'vezi_database_v1';
const SESSION_KEY = 'vezi_current_user';
const THEME_KEY = 'vezi_theme';

async function initDB() {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.warn('Ошибка чтения базы, восстановление из исходного файла db.json');
    }
  }
  try {
    const res = await fetch('db.json');
    if (res.ok) {
      const fileData = await res.json();
      localStorage.setItem(DB_KEY, JSON.stringify(fileData));
      return fileData;
    }
  } catch (err) {
    // Если открыто напрямую через file://, используем встроенную копию db.json
  }
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
  return JSON.parse(JSON.stringify(INITIAL_DB));
}

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
  return JSON.parse(raw);
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
  window.location.reload();
}

function downloadDBJson() {
  const db = getDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'db.json';
  a.click();
  URL.revokeObjectURL(url);
}

function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

function getRolePage(role) {
  switch (role) {
    case 'sponsor': return 'sponsor.html';
    case 'initiator': return 'initiator.html';
    case 'moderator': return 'moderator.html';
    case 'admin': return 'admin.html';
    default: return 'index.html';
  }
}

function getRoleTitle(role) {
  switch (role) {
    case 'sponsor': return 'Спонсор';
    case 'initiator': return 'Автор проекта';
    case 'moderator': return 'Модератор';
    case 'admin': return 'Администратор';
    default: return 'Гость';
  }
}

function formatRub(val) {
  return Number(val || 0).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽';
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
