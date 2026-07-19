'use strict';

const CONFIG = {
  game: {
    id: 'backpack',
    targetGoodDeeds: 6,
    cardsPerRound: 4,
    goodEmoji: '😊',
    emptyEmoji: '○',
    mapUrl: 'tropa.html'
  },

  assets: {
    background: 'images/tropa/backpack/bg.png',
    bag: 'images/tropa/backpack/bag.png',
    icon: 'images/tropa/backpack/bag.png',
    win: 'images/tropa/backpack/win.png'
  },

  text: {
    pageTitle: 'Собери рюкзак добрых дел — Уроки с Добрыней',
    startBadge: 'Станция добрых поступков',
    startTitle: 'Собери рюкзак добрых дел',
    startText: 'Выбирай добрые поступки и складывай их в волшебный рюкзак Добрыни.',
    startButton: 'Начать игру',
    helpButton: 'Как играть',

    gameBadge: 'Тропа Добра',
    gameTitle: 'Какие дела возьмём с собой?',
    gameHint: 'Нажимай только на карточки с добрыми поступками.',
    progressLabel: 'Рюкзак наполняется',
    countTemplate: '{current} из {total}',
    restartButton: 'Начать заново',

    correctMessages: [
      'Отличный выбор! Доброе дело отправляется в рюкзак.',
      'Верно! Такой поступок делает мир добрее.',
      'Здорово! Это настоящее доброе дело.',
      'Правильно! Берём этот поступок с собой.'
    ],
    wrongMessages: [
      'Такой поступок в рюкзак добрых дел не кладут.',
      'Подумай ещё: станет ли кому-то от этого лучше?',
      'Это не доброе дело. Выбери другую карточку.',
      'Доброта не обижает других. Попробуй ещё раз.'
    ],

    resultBadge: 'Рюкзак собран',
    resultTitle: 'Рюкзак добрых дел наполнен!',
    resultText: 'Ты выбрал поступки, которые помогают, поддерживают и радуют других.',
    lesson: 'Добрые дела можно совершать каждый день.',
    againButton: 'Сыграть ещё раз',
    mapButton: 'Вернуться на карту',

    helpTitle: 'Как играть',
    helpParagraphs: [
      'На поляне появляются карточки с разными поступками.',
      'Нажимай на те поступки, которые помогают другим и делают мир добрее.',
      'Правильная карточка улетит в рюкзак. Неправильная останется на месте — можно попробовать снова.'
    ]
  },

  timings: {
    flyDuration: 700,
    feedbackDuration: 1800,
    nextRoundDelay: 850,
    winDelay: 900,
    wrongUnlockDelay: 650
  },

  deeds: [
    { id: 'help-mom', text: 'Помочь маме', good: true },
    { id: 'support-friend', text: 'Поддержать друга', good: true },
    { id: 'share-toy', text: 'Поделиться игрушкой', good: true },
    { id: 'care-animal', text: 'Позаботиться о животном', good: true },
    { id: 'say-thanks', text: 'Поблагодарить', good: true },
    { id: 'give-seat', text: 'Уступить место', good: true },
    { id: 'help-younger', text: 'Помочь младшему', good: true },
    { id: 'comfort-sad', text: 'Утешить того, кому грустно', good: true },
    { id: 'pick-trash', text: 'Поднять мусор на поляне', good: true },
    { id: 'invite-game', text: 'Позвать одинокого ребёнка играть', good: true },

    { id: 'be-rude', text: 'Нагрубить', good: false },
    { id: 'lie', text: 'Обмануть', good: false },
    { id: 'laugh-mistake', text: 'Посмеяться над чужой ошибкой', good: false },
    { id: 'push', text: 'Толкнуть', good: false },
    { id: 'take-without-asking', text: 'Взять чужое без спроса', good: false },
    { id: 'ignore-help', text: 'Не помочь тому, кто просит', good: false },
    { id: 'tease', text: 'Дразнить другого', good: false },
    { id: 'break', text: 'Специально сломать чужую вещь', good: false },
    { id: 'exclude', text: 'Не принимать новичка в игру', good: false },
    { id: 'litter', text: 'Бросить мусор на землю', good: false }
  ]
};

const state = {
  collected: 0,
  usedGoodIds: new Set(),
  currentCards: [],
  locked: false,
  feedbackTimer: null
};

const el = {};

function cacheElements() {
  const ids = [
    'backpackStart', 'backpackGame', 'backpackResult', 'backpackStartIcon',
    'backpackStartBadge', 'backpackStartTitle', 'backpackStartText',
    'backpackStartBtn', 'backpackHelpBtn', 'backpackGameBadge',
    'backpackGameTitle', 'backpackHint', 'backpackProgressLabel',
    'backpackProgress', 'backpackBg', 'backpackBagZone', 'backpackBag',
    'backpackCount', 'backpackCards', 'backpackFeedback', 'backpackRestartBtn',
    'backpackResultImage', 'backpackResultBadge', 'backpackResultTitle',
    'backpackResultText', 'backpackLesson', 'backpackAgainBtn',
    'backpackMapLink', 'backpackHelpModal', 'backpackHelpTitle', 'backpackHelpText'
  ];

  ids.forEach((id) => {
    el[id] = document.getElementById(id);
  });
}

function applyConfig() {
  document.title = CONFIG.text.pageTitle;

  el.backpackStartIcon.src = CONFIG.assets.icon;
  el.backpackStartIcon.alt = CONFIG.text.startTitle;
  el.backpackStartBadge.textContent = CONFIG.text.startBadge;
  el.backpackStartTitle.textContent = CONFIG.text.startTitle;
  el.backpackStartText.textContent = CONFIG.text.startText;
  el.backpackStartBtn.textContent = CONFIG.text.startButton;
  el.backpackHelpBtn.textContent = CONFIG.text.helpButton;

  el.backpackGameBadge.textContent = CONFIG.text.gameBadge;
  el.backpackGameTitle.textContent = CONFIG.text.gameTitle;
  el.backpackHint.textContent = CONFIG.text.gameHint;
  el.backpackProgressLabel.textContent = CONFIG.text.progressLabel;
  el.backpackBg.src = CONFIG.assets.background;
  el.backpackBag.src = CONFIG.assets.bag;
  el.backpackRestartBtn.textContent = CONFIG.text.restartButton;

  el.backpackResultImage.src = CONFIG.assets.win;
  el.backpackResultImage.alt = CONFIG.text.resultTitle;
  el.backpackResultBadge.textContent = CONFIG.text.resultBadge;
  el.backpackResultTitle.textContent = CONFIG.text.resultTitle;
  el.backpackResultText.textContent = CONFIG.text.resultText;
  el.backpackLesson.textContent = CONFIG.text.lesson;
  el.backpackAgainBtn.textContent = CONFIG.text.againButton;
  el.backpackMapLink.textContent = CONFIG.text.mapButton;
  el.backpackMapLink.href = CONFIG.game.mapUrl;

  el.backpackHelpTitle.textContent = CONFIG.text.helpTitle;
  el.backpackHelpText.innerHTML = CONFIG.text.helpParagraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
}

function bindEvents() {
  el.backpackStartBtn.addEventListener('click', startGame);
  el.backpackRestartBtn.addEventListener('click', startGame);
  el.backpackAgainBtn.addEventListener('click', startGame);
  el.backpackHelpBtn.addEventListener('click', openHelp);

  document.querySelectorAll('[data-backpack-close]').forEach((node) => {
    node.addEventListener('click', closeHelp);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeHelp();
  });
}

function startGame() {
  state.collected = 0;
  state.usedGoodIds.clear();
  state.currentCards = [];
  state.locked = false;
  clearTimeout(state.feedbackTimer);

  showScreen('backpackGame');
  el.backpackBagZone.classList.remove('is-full', 'is-receiving');
  el.backpackFeedback.className = 'backpack-feedback';
  el.backpackFeedback.textContent = '';
  updateProgress();
  renderRound();
}

function renderRound() {
  if (state.collected >= CONFIG.game.targetGoodDeeds) {
    finishGame();
    return;
  }

  state.locked = false;
  state.currentCards = makeRoundCards();
  el.backpackCards.innerHTML = '';

  state.currentCards.forEach((deed, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'backpack-deed-card';
    button.dataset.deedId = deed.id;
    button.style.setProperty('--card-index', index);
    button.innerHTML = `<span>${escapeHtml(deed.text)}</span>`;
    button.addEventListener('click', () => handleCard(button, deed));
    el.backpackCards.appendChild(button);
  });
}

function makeRoundCards() {
  const availableGood = CONFIG.deeds.filter(
    (deed) => deed.good && !state.usedGoodIds.has(deed.id)
  );
  const bad = shuffle(CONFIG.deeds.filter((deed) => !deed.good));
  const selectedGood = shuffle(availableGood)[0];
  const selectedBad = bad.slice(0, CONFIG.game.cardsPerRound - 1);
  return shuffle([selectedGood, ...selectedBad].filter(Boolean));
}

function handleCard(card, deed) {
  if (state.locked || card.disabled) return;

  if (!deed.good) {
    handleWrong(card);
    return;
  }

  state.locked = true;
  state.collected += 1;
  state.usedGoodIds.add(deed.id);
  card.disabled = true;
  showFeedback(randomItem(CONFIG.text.correctMessages), 'success');
  animateCardToBag(card);
  updateProgress();

  window.setTimeout(() => {
    el.backpackBagZone.classList.remove('is-receiving');
    if (state.collected >= CONFIG.game.targetGoodDeeds) {
      el.backpackBagZone.classList.add('is-full');
      window.setTimeout(finishGame, CONFIG.timings.winDelay);
    } else {
      renderRound();
    }
  }, CONFIG.timings.nextRoundDelay);
}

function handleWrong(card) {
  card.disabled = true;
  card.classList.remove('is-wrong');
  void card.offsetWidth;
  card.classList.add('is-wrong');
  showFeedback(randomItem(CONFIG.text.wrongMessages), 'wrong');

  window.setTimeout(() => {
    card.disabled = false;
    card.classList.remove('is-wrong');
  }, CONFIG.timings.wrongUnlockDelay);
}

function animateCardToBag(card) {
  const cardRect = card.getBoundingClientRect();
  const bagRect = el.backpackBag.getBoundingClientRect();
  const clone = card.cloneNode(true);
  const targetX = bagRect.left + bagRect.width / 2 - cardRect.width / 2;
  const targetY = bagRect.top + bagRect.height * 0.35 - cardRect.height / 2;

  clone.className = 'backpack-flying-card';
  clone.style.left = `${cardRect.left}px`;
  clone.style.top = `${cardRect.top}px`;
  clone.style.width = `${cardRect.width}px`;
  clone.style.height = `${cardRect.height}px`;
  clone.style.setProperty('--fly-x', `${targetX - cardRect.left}px`);
  clone.style.setProperty('--fly-y', `${targetY - cardRect.top}px`);
  clone.style.setProperty('--fly-duration', `${CONFIG.timings.flyDuration}ms`);
  document.body.appendChild(clone);

  card.classList.add('is-collected');
  el.backpackBagZone.classList.add('is-receiving');

  window.setTimeout(() => clone.remove(), CONFIG.timings.flyDuration + 100);
}

function updateProgress() {
  const total = CONFIG.game.targetGoodDeeds;
  const items = [];

  for (let index = 0; index < total; index += 1) {
    const filled = index < state.collected;
    items.push(
      `<span class="backpack-progress-item${filled ? ' is-filled' : ''}" aria-hidden="true">${filled ? CONFIG.game.goodEmoji : CONFIG.game.emptyEmoji}</span>`
    );
  }

  el.backpackProgress.innerHTML = items.join('');
  el.backpackCount.textContent = CONFIG.text.countTemplate
    .replace('{current}', String(state.collected))
    .replace('{total}', String(total));
}

function finishGame() {
  state.locked = true;
  showScreen('backpackResult');
}

function showFeedback(message, type) {
  clearTimeout(state.feedbackTimer);
  el.backpackFeedback.textContent = message;
  el.backpackFeedback.className = `backpack-feedback is-visible is-${type}`;

  state.feedbackTimer = window.setTimeout(() => {
    el.backpackFeedback.classList.remove('is-visible');
  }, CONFIG.timings.feedbackDuration);
}

function showScreen(id) {
  document.querySelectorAll('.backpack-screen').forEach((screen) => {
    screen.classList.toggle('is-active', screen.id === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openHelp() {
  el.backpackHelpModal.classList.add('is-open');
  el.backpackHelpModal.setAttribute('aria-hidden', 'false');
}

function closeHelp() {
  el.backpackHelpModal.classList.remove('is-open');
  el.backpackHelpModal.setAttribute('aria-hidden', 'true');
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function init() {
  cacheElements();
  applyConfig();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
