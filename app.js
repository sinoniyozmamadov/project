const state = {
  currentUser: null,
  weekSelection: null,
  daySelection: null,
  users: [],
  tasks: [],
};

const elements = {
  sidebar: document.getElementById('sidebar'),
  toggleSidebar: document.getElementById('toggleSidebar'),
  navLinks: document.querySelectorAll('.nav-link'),
  sections: document.querySelectorAll('.section'),
  pageTitle: document.getElementById('pageTitle'),
  pageSubtitle: document.getElementById('pageSubtitle'),
  weeksGrid: document.getElementById('weeksGrid'),
  weekView: document.getElementById('weekView'),
  dayView: document.getElementById('dayView'),
  weekTitle: document.getElementById('weekTitle'),
  weekDays: document.getElementById('weekDays'),
  dayTitle: document.getElementById('dayTitle'),
  dayTasks: document.getElementById('dayTasks'),
  backToGrid: document.getElementById('backToGrid'),
  backToWeek: document.getElementById('backToWeek'),
  profileForm: document.getElementById('profileForm'),
  settingsForm: document.getElementById('settingsForm'),
  taskFilter: document.getElementById('taskFilter'),
  tasksOverview: document.getElementById('tasksOverview'),
  adminPanel: document.getElementById('adminPanel'),
  authDialog: document.getElementById('authDialog'),
  openAuth: document.getElementById('openAuth'),
  loginButton: document.getElementById('loginButton'),
  registerButton: document.getElementById('registerButton'),
  resetButton: document.getElementById('resetButton'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authHint: document.getElementById('authHint'),
  userChip: document.getElementById('userChip'),
  logoutButton: document.getElementById('logoutButton'),
  yearRange: document.getElementById('yearRange'),
  startYear: document.getElementById('startYear'),
};

const storageKeys = {
  users: 'weekboard.users',
  tasks: 'weekboard.tasks',
  currentUser: 'weekboard.currentUser',
  settings: 'weekboard.settings',
};

const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const defaultTasks = [
  {
    id: 'task-1',
    userId: 'admin',
    title: 'Запуск платформы',
    description: 'Проверить сетку недель и доступы.',
    week: 12,
    year: 2025,
    day: 2,
    deadline: '2025-03-18 18:00',
    status: 'active',
  },
  {
    id: 'task-2',
    userId: 'user-1',
    title: 'Контроль дедлайна',
    description: 'Отправить отчёт куратору.',
    week: 12,
    year: 2025,
    day: 4,
    deadline: '2025-03-20 12:00',
    status: 'overdue',
  },
  {
    id: 'task-3',
    userId: 'user-1',
    title: 'Закрыть спринт',
    description: 'Подготовить заметки по задачам.',
    week: 13,
    year: 2025,
    day: 1,
    deadline: '2025-03-25 17:00',
    status: 'done',
  },
];

const defaultUsers = [
  {
    id: 'admin',
    email: 'admin@weekboard.local',
    password: 'admin',
    fullName: 'Администратор',
    birthYear: 1990,
    avatar: '',
    role: 'admin',
    access: ['user-1'],
  },
  {
    id: 'user-1',
    email: 'user@weekboard.local',
    password: 'user',
    fullName: 'Пользователь',
    birthYear: 1998,
    avatar: '',
    role: 'user',
    access: [],
  },
];

function saveState() {
  localStorage.setItem(storageKeys.users, JSON.stringify(state.users));
  localStorage.setItem(storageKeys.tasks, JSON.stringify(state.tasks));
  localStorage.setItem(storageKeys.currentUser, state.currentUser?.id ?? '');
}

function loadState() {
  const storedUsers = JSON.parse(localStorage.getItem(storageKeys.users) || 'null');
  const storedTasks = JSON.parse(localStorage.getItem(storageKeys.tasks) || 'null');
  state.users = storedUsers || defaultUsers;
  state.tasks = storedTasks || defaultTasks;
  const currentUserId = localStorage.getItem(storageKeys.currentUser);
  state.currentUser = state.users.find((user) => user.id === currentUserId) || null;
}

function formatWeekLabel(year, week) {
  return `Неделя ${week} · ${year}`;
}

function setActiveSection(sectionId) {
  elements.sections.forEach((section) => {
    section.classList.toggle('section--active', section.id === `section-${sectionId}`);
  });
  elements.navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });
  if (sectionId === 'dashboard') {
    elements.pageTitle.textContent = 'Календарь недель';
    elements.pageSubtitle.textContent = 'Просмотр занятости по неделям и годам.';
  }
  if (sectionId === 'profile') {
    elements.pageTitle.textContent = 'Профиль';
    elements.pageSubtitle.textContent = 'Данные учетной записи и аватар.';
  }
  if (sectionId === 'settings') {
    elements.pageTitle.textContent = 'Настройки';
    elements.pageSubtitle.textContent = 'Время, формат и фон.';
  }
  if (sectionId === 'tasks') {
    elements.pageTitle.textContent = 'Задачи';
    elements.pageSubtitle.textContent = 'Списки по статусам и доступам.';
  }
}

function updateUserChip() {
  if (state.currentUser) {
    elements.userChip.textContent = `${state.currentUser.fullName || state.currentUser.email}`;
  } else {
    elements.userChip.textContent = 'Гость';
  }
}

function getVisibleUsers() {
  if (!state.currentUser) {
    return [];
  }
  if (state.currentUser.role === 'admin') {
    return state.users;
  }
  return state.users.filter((user) => user.id === state.currentUser.id);
}

function canViewTasks(targetUserId) {
  if (!state.currentUser) {
    return false;
  }
  if (state.currentUser.role === 'admin') {
    return true;
  }
  if (state.currentUser.id === targetUserId) {
    return true;
  }
  return state.currentUser.access.includes(targetUserId);
}

function renderWeekGrid() {
  elements.weeksGrid.innerHTML = '';
  const startYear = Number(elements.startYear.value);
  const range = Number(elements.yearRange.value);
  const endYear = startYear + range - 1;
  const visibleTasks = state.tasks.filter((task) => canViewTasks(task.userId));

  for (let year = startYear; year <= endYear; year += 1) {
    for (let week = 1; week <= 53; week += 1) {
      const cell = document.createElement('div');
      cell.className = 'week-cell';
      cell.dataset.year = year;
      cell.dataset.week = week;
      const tasksForCell = visibleTasks.filter((task) => task.year === year && task.week === week);
      if (tasksForCell.some((task) => task.status === 'overdue')) {
        cell.dataset.status = 'overdue';
      } else if (tasksForCell.length) {
        cell.dataset.status = 'busy';
      }
      cell.title = formatWeekLabel(year, week);
      cell.addEventListener('click', () => openWeekView(year, week));
      elements.weeksGrid.appendChild(cell);
    }
  }
}

function openWeekView(year, week) {
  state.weekSelection = { year, week };
  state.daySelection = null;
  elements.weekTitle.textContent = formatWeekLabel(year, week);
  elements.weekView.scrollIntoView({ behavior: 'smooth' });
  renderWeekDays();
}

function renderWeekDays() {
  elements.weekDays.innerHTML = '';
  if (!state.weekSelection) {
    return;
  }
  const { year, week } = state.weekSelection;
  const tasksForWeek = state.tasks.filter(
    (task) => task.year === year && task.week === week && canViewTasks(task.userId)
  );

  weekDays.forEach((day, index) => {
    const dayTasks = tasksForWeek.filter((task) => task.day === index + 1);
    const dayCard = document.createElement('div');
    dayCard.className = 'week-day';
    dayCard.innerHTML = `
      <h4>${day}</h4>
      <p>${dayTasks.length ? `${dayTasks.length} задач(и)` : 'Нет задач'}</p>
      <p>Ближайший дедлайн: ${dayTasks[0]?.deadline || '—'}</p>
    `;
    dayCard.addEventListener('click', () => openDayView(day, index + 1));
    elements.weekDays.appendChild(dayCard);
  });
}

function openDayView(dayLabel, dayNumber) {
  state.daySelection = { label: dayLabel, dayNumber };
  elements.dayTitle.textContent = `${dayLabel} · ${formatWeekLabel(state.weekSelection.year, state.weekSelection.week)}`;
  renderDayTasks();
  elements.dayView.scrollIntoView({ behavior: 'smooth' });
}

function renderDayTasks() {
  elements.dayTasks.innerHTML = '';
  if (!state.weekSelection || !state.daySelection) {
    return;
  }
  const { year, week } = state.weekSelection;
  const { dayNumber } = state.daySelection;
  const dayTasks = state.tasks.filter(
    (task) =>
      task.year === year && task.week === week && task.day === dayNumber && canViewTasks(task.userId)
  );
  if (!dayTasks.length) {
    elements.dayTasks.innerHTML = '<p class="muted">Задачи не найдены.</p>';
    return;
  }
  dayTasks.forEach((task) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.status = task.status;
    card.innerHTML = `
      <strong>${task.title}</strong>
      <span>${task.description}</span>
      <span>Дедлайн: ${task.deadline}</span>
      <span>Ответственный: ${getUserName(task.userId)}</span>
    `;
    elements.dayTasks.appendChild(card);
  });
}

function renderTasksOverview() {
  elements.tasksOverview.innerHTML = '';
  const filter = elements.taskFilter.value;
  const visibleTasks = state.tasks.filter((task) => canViewTasks(task.userId));
  const filteredTasks = visibleTasks.filter((task) => task.status === filter);
  if (!filteredTasks.length) {
    elements.tasksOverview.innerHTML = '<p class="muted">Нет задач для выбранного статуса.</p>';
    return;
  }
  filteredTasks.forEach((task) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.status = task.status;
    card.innerHTML = `
      <strong>${task.title}</strong>
      <span>${task.description}</span>
      <span>${formatWeekLabel(task.year, task.week)} · ${weekDays[task.day - 1]}</span>
      <span>Дедлайн: ${task.deadline}</span>
    `;
    elements.tasksOverview.appendChild(card);
  });
}

function renderAdminPanel() {
  elements.adminPanel.innerHTML = '';
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    elements.adminPanel.innerHTML = '<p class="muted">Доступно только администратору.</p>';
    return;
  }
  state.users
    .filter((user) => user.role !== 'admin')
    .forEach((user) => {
      const row = document.createElement('div');
      row.className = 'admin-row';
      const hasAccess = state.currentUser.access.includes(user.id);
      row.innerHTML = `
        <div>
          <strong>${user.fullName || user.email}</strong>
          <small>${user.email}</small>
        </div>
        <button class="ghost-button">${hasAccess ? 'Отозвать доступ' : 'Дать доступ'}</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        toggleAdminAccess(user.id);
      });
      elements.adminPanel.appendChild(row);
    });
}

function toggleAdminAccess(userId) {
  const access = state.currentUser.access;
  if (access.includes(userId)) {
    state.currentUser.access = access.filter((id) => id !== userId);
  } else {
    state.currentUser.access = [...access, userId];
  }
  saveState();
  renderAdminPanel();
  renderWeekGrid();
  renderTasksOverview();
}

function getUserName(userId) {
  const user = state.users.find((item) => item.id === userId);
  return user?.fullName || user?.email || 'Неизвестно';
}

function applySettings(settings) {
  if (settings?.background) {
    document.documentElement.style.setProperty('--bg', settings.background);
  }
}

function saveProfile(event) {
  event.preventDefault();
  if (!state.currentUser) {
    elements.authHint.textContent = 'Войдите, чтобы сохранить профиль.';
    return;
  }
  const formData = new FormData(elements.profileForm);
  Object.assign(state.currentUser, {
    fullName: formData.get('fullName'),
    birthYear: Number(formData.get('birthYear')) || '',
    avatar: formData.get('avatar'),
    email: formData.get('email'),
  });
  saveState();
  updateUserChip();
}

function saveSettings(event) {
  event.preventDefault();
  const formData = new FormData(elements.settingsForm);
  const settings = {
    time: formData.get('time'),
    date: formData.get('date'),
    dateFormat: formData.get('dateFormat'),
    background: formData.get('background'),
  };
  localStorage.setItem(storageKeys.settings, JSON.stringify(settings));
  applySettings(settings);
}

function handleLogin(event, mode) {
  event.preventDefault();
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value.trim();
  if (!email || !password) {
    elements.authHint.textContent = 'Введите почту и пароль.';
    return;
  }
  if (mode === 'login') {
    const user = state.users.find((item) => item.email === email && item.password === password);
    if (!user) {
      elements.authHint.textContent = 'Неверные данные для входа.';
      return;
    }
    state.currentUser = user;
    saveState();
    updateUserChip();
    elements.authDialog.close();
    renderAfterAuth();
    return;
  }
  if (mode === 'register') {
    if (state.users.some((item) => item.email === email)) {
      elements.authHint.textContent = 'Пользователь уже существует.';
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      fullName: email.split('@')[0],
      birthYear: '',
      avatar: '',
      role: 'user',
      access: [],
    };
    state.users.push(newUser);
    state.currentUser = newUser;
    saveState();
    updateUserChip();
    elements.authDialog.close();
    renderAfterAuth();
    return;
  }
  if (mode === 'reset') {
    const existing = state.users.find((item) => item.email === email);
    if (!existing) {
      elements.authHint.textContent = 'Нет пользователя с такой почтой.';
      return;
    }
    elements.authHint.textContent = 'Ссылка для сброса отправлена на почту (демо).';
  }
}

function renderAfterAuth() {
  renderWeekGrid();
  renderWeekDays();
  renderDayTasks();
  renderTasksOverview();
  renderAdminPanel();
}

function populateYears() {
  const currentYear = new Date().getFullYear();
  elements.startYear.innerHTML = '';
  for (let year = currentYear - 10; year <= currentYear + 10; year += 1) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear - 5) {
      option.selected = true;
    }
    elements.startYear.appendChild(option);
  }
}

function initListeners() {
  elements.toggleSidebar.addEventListener('click', () => {
    elements.sidebar.classList.toggle('collapsed');
  });

  elements.navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveSection(link.dataset.section);
    });
  });

  elements.backToGrid.addEventListener('click', () => {
    elements.weekView.scrollIntoView({ behavior: 'smooth' });
  });

  elements.backToWeek.addEventListener('click', () => {
    elements.weekView.scrollIntoView({ behavior: 'smooth' });
  });

  elements.profileForm.addEventListener('submit', saveProfile);
  elements.settingsForm.addEventListener('submit', saveSettings);

  elements.taskFilter.addEventListener('change', renderTasksOverview);

  elements.openAuth.addEventListener('click', () => {
    elements.authHint.textContent = '';
    elements.authDialog.showModal();
  });

  elements.loginButton.addEventListener('click', (event) => handleLogin(event, 'login'));
  elements.registerButton.addEventListener('click', (event) => handleLogin(event, 'register'));
  elements.resetButton.addEventListener('click', (event) => handleLogin(event, 'reset'));

  elements.logoutButton.addEventListener('click', () => {
    state.currentUser = null;
    saveState();
    updateUserChip();
    renderAfterAuth();
  });

  elements.yearRange.addEventListener('change', renderWeekGrid);
  elements.startYear.addEventListener('change', renderWeekGrid);
}

function hydrateForms() {
  if (state.currentUser) {
    elements.profileForm.fullName.value = state.currentUser.fullName || '';
    elements.profileForm.birthYear.value = state.currentUser.birthYear || '';
    elements.profileForm.avatar.value = state.currentUser.avatar || '';
    elements.profileForm.email.value = state.currentUser.email || '';
  }
  const settings = JSON.parse(localStorage.getItem(storageKeys.settings) || 'null');
  if (settings) {
    elements.settingsForm.time.value = settings.time || '';
    elements.settingsForm.date.value = settings.date || '';
    elements.settingsForm.dateFormat.value = settings.dateFormat || 'dd.mm.yyyy';
    elements.settingsForm.background.value = settings.background || '#f6f7fb';
  }
  applySettings(settings);
}

function init() {
  loadState();
  populateYears();
  updateUserChip();
  initListeners();
  hydrateForms();
  renderWeekGrid();
  renderTasksOverview();
  renderAdminPanel();
}

init();
