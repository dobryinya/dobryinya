'use strict';

const CONFIG = {
  counts: [10, 20, 30, 50, '∞'],
  ranges: [20, 100, 1000],

  operations: [
    { id: 'addition', symbol: '+', title: 'Сложение', note: 'слагаемые и сумма' },
    { id: 'subtraction', symbol: '−', title: 'Вычитание', note: 'уменьшаемое, вычитаемое, разность' },
    { id: 'mixed', symbol: '±', title: 'Вперемешку', note: 'оба действия' }
  ],

  components: {
    addition: [
      { id: 'addend1', title: '1-е слагаемое', short: 'Слагаемое', symbol: 'a' },
      { id: 'addend2', title: '2-е слагаемое', short: 'Слагаемое', symbol: 'b' },
      { id: 'sum', title: 'Сумма', short: 'Сумма', symbol: 'Σ' }
    ],
    subtraction: [
      { id: 'minuend', title: 'Уменьшаемое', short: 'Уменьшаемое', symbol: 'a' },
      { id: 'subtrahend', title: 'Вычитаемое', short: 'Вычитаемое', symbol: 'b' },
      { id: 'difference', title: 'Разность', short: 'Разность', symbol: 'Δ' }
    ]
  },

  modes: [
    { id: 'choice', icon: '🔢', label: 'Выбор ответа' },
    { id: 'input', icon: '⌨️', label: 'Ввод ответа' },
    { id: 'mixed', icon: '🔀', label: 'Смешанный режим' }
  ],

  orders: [
    { id: 'random', label: 'Вперемешку' },
    { id: 'sequential', label: 'По порядку' }
  ],

  defaultSettings: {
    operation: 'mixed',
    selectedComponents: ['addend1', 'addend2', 'sum', 'minuend', 'subtrahend', 'difference'],
    range: 100,
    count: 10,
    mode: 'choice',
    order: 'random'
  },

  feedback: {
    correct: ['Верно! 👍', 'Отлично! ⭐', 'Правильно! 😊', 'Так держать! 💪'],
    retry: 'Попробуй ещё раз',
    secondTry: 'Вспомни правило и попробуй снова',
    reveal: answer => `Правильный ответ: ${answer}`
  },

  timing: { nextQuestionMs: 650 },
  storageKey: 'dobrynya-erudit-components-stats-v1'
};

const state = {
  settings: structuredClone(CONFIG.defaultSettings),
  questions: [],
  index: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  currentMistakes: 0,
  mistakes: new Map(),
  finished: false,
  reviewMode: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function init() {
  renderSettings();
  bindActions();
  updateSelectionSummary();
}

function availableComponents() {
  if (state.settings.operation === 'addition') return CONFIG.components.addition;
  if (state.settings.operation === 'subtraction') return CONFIG.components.subtraction;
  return [...CONFIG.components.addition, ...CONFIG.components.subtraction];
}

function renderSettings() {
  $('[data-role="operation-picker"]').innerHTML = CONFIG.operations.map(item => `
    <button type="button" class="component-operation-card ${state.settings.operation === item.id ? 'is-selected' : ''}" data-operation="${item.id}" aria-pressed="${state.settings.operation === item.id}">
      <strong>${item.symbol} ${item.title}</strong>
      <span>${item.note}</span>
    </button>
  `).join('');

  const allowed = availableComponents();
  const allowedIds = new Set(allowed.map(item => item.id));
  state.settings.selectedComponents = state.settings.selectedComponents.filter(id => allowedIds.has(id));
  if (!state.settings.selectedComponents.length) state.settings.selectedComponents = allowed.map(item => item.id);

  $('[data-role="component-picker"]').innerHTML = allowed.map(item => {
    const selected = state.settings.selectedComponents.includes(item.id);
    return `
      <button type="button" class="component-card ${selected ? 'is-selected' : ''}" data-component="${item.id}" aria-pressed="${selected}">
        <span class="component-card__symbol">${item.symbol}</span>
        <span class="component-card__text"><strong>${item.title}</strong><span>${componentRule(item.id)}</span></span>
      </button>
    `;
  }).join('');

  $('[data-role="range-picker"]').innerHTML = CONFIG.ranges.map(value => `
    <button type="button" class="choice-card ${state.settings.range === value ? 'is-selected' : ''}" data-range="${value}">до ${value}</button>
  `).join('');

  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button type="button" class="choice-card ${state.settings.count === count ? 'is-selected' : ''}" data-count="${count}">${count}</button>
  `).join('');

  $('[data-role="mode-picker"]').innerHTML = CONFIG.modes.map(mode => `
    <button type="button" class="mode-card ${state.settings.mode === mode.id ? 'is-selected' : ''}" data-mode="${mode.id}">
      <span>${mode.icon}</span><span>${mode.label}</span>
    </button>
  `).join('');

  $('[data-role="order-picker"]').innerHTML = CONFIG.orders.map(order => `
    <button type="button" class="choice-card ${state.settings.order === order.id ? 'is-selected' : ''}" data-order="${order.id}">${order.label}</button>
  `).join('');
}

function componentRule(id) {
  const rules = {
    addend1: 'сумма − второе слагаемое',
    addend2: 'сумма − первое слагаемое',
    sum: 'сложить два слагаемых',
    minuend: 'разность + вычитаемое',
    subtrahend: 'уменьшаемое − разность',
    difference: 'уменьшаемое − вычитаемое'
  };
  return rules[id] || '';
}

function bindActions() {
  document.addEventListener('click', event => {
    const operation = event.target.closest('[data-operation]');
    if (operation) {
      state.settings.operation = operation.dataset.operation;
      state.settings.selectedComponents = availableComponents().map(item => item.id);
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const component = event.target.closest('[data-component]');
    if (component) {
      toggleComponent(component.dataset.component);
      return;
    }

    const range = event.target.closest('[data-range]');
    if (range) {
      state.settings.range = Number(range.dataset.range);
      renderSettings(); updateSelectionSummary(); return;
    }

    const count = event.target.closest('[data-count]');
    if (count) {
      state.settings.count = count.dataset.count === '∞' ? '∞' : Number(count.dataset.count);
      renderSettings(); updateSelectionSummary(); return;
    }

    const mode = event.target.closest('[data-mode]');
    if (mode) {
      state.settings.mode = mode.dataset.mode;
      renderSettings(); updateSelectionSummary(); return;
    }

    const order = event.target.closest('[data-order]');
    if (order) {
      state.settings.order = order.dataset.order;
      renderSettings(); updateSelectionSummary(); return;
    }

    const answerButton = event.target.closest('[data-answer]');
    if (answerButton) {
      checkAnswer(Number(answerButton.dataset.answer), answerButton); return;
    }

    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;
    const action = actionElement.dataset.action;

    if (action === 'select-all-components') {
      state.settings.selectedComponents = availableComponents().map(item => item.id);
      renderSettings(); updateSelectionSummary(); return;
    }
    if (action === 'start') return startTraining();
    if (action === 'stop') return finishTraining();
    if (action === 'settings') return showScreen('settings');
    if (action === 'restart') return startTraining();
    if (action === 'retry-mistakes') return startMistakeReview();
    if (action === 'check-input') return checkInputAnswer();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    if (!$('[data-screen="training"]')?.classList.contains('is-active')) return;
    const input = $('[data-role="answer-input"]');
    if (!input || input.disabled) return;
    checkInputAnswer();
  });
}

function toggleComponent(id) {
  const selected = new Set(state.settings.selectedComponents);
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  state.settings.selectedComponents = [...selected];
  renderSettings();
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const operationLabel = CONFIG.operations.find(item => item.id === state.settings.operation)?.title || '';
  const countText = state.settings.count === '∞' ? 'без ограничения' : `${state.settings.count} примеров`;
  const selectedCount = state.settings.selectedComponents.length;
  $('[data-role="selection-summary"]').textContent = `${operationLabel} · ${selectedCount} типов заданий · числа до ${state.settings.range} · ${countText}`;
  $('[data-action="start"]').disabled = selectedCount === 0;
}

function startTraining() {
  if (!state.settings.selectedComponents.length) return;
  resetRun();
  state.questions = buildQuestions();
  showScreen('training');
  renderQuestion();
}

function resetRun() {
  state.index = 0;
  state.correct = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.mistakes = new Map();
  state.finished = false;
  state.reviewMode = false;
}

function buildQuestions() {
  const count = state.settings.count === '∞' ? 60 : Number(state.settings.count);
  const types = [...state.settings.selectedComponents];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const type = state.settings.order === 'sequential'
      ? types[i % types.length]
      : randomItem(types);
    questions.push(generateQuestion(type));
  }

  return questions;
}

function generateQuestion(type) {
  const max = state.settings.range;
  const minBase = max <= 20 ? 1 : 5;

  if (['addend1', 'addend2', 'sum'].includes(type)) {
    const a = randomInt(minBase, Math.max(minBase, Math.floor(max * 0.65)));
    const b = randomInt(minBase, Math.max(minBase, max - a));
    const sum = a + b;
    const answer = type === 'addend1' ? a : type === 'addend2' ? b : sum;
    return { operation: 'addition', type, a, b, result: sum, answer };
  }

  const minuend = randomInt(Math.max(2, minBase + 1), max);
  const subtrahend = randomInt(1, Math.max(1, minuend - 1));
  const difference = minuend - subtrahend;
  const answer = type === 'minuend' ? minuend : type === 'subtrahend' ? subtrahend : difference;
  return { operation: 'subtraction', type, a: minuend, b: subtrahend, result: difference, answer };
}

function renderQuestion() {
  if (state.index >= state.questions.length) return finishTraining();
  state.currentMistakes = 0;
  const q = state.questions[state.index];

  $('[data-role="task-label"]').textContent = taskLabel(q.type);
  $('[data-role="expression"]').textContent = expressionText(q);
  $('[data-role="component-table"]').innerHTML = tableHtml(q);

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = '';
  feedback.className = 'feedback';
  const hint = $('[data-role="hint"]');
  hint.hidden = true;
  hint.textContent = '';

  updateHud();
  renderProgress();
  renderAnswerArea(q);
}

function taskLabel(type) {
  const labels = {
    addend1: 'Найди первое слагаемое',
    addend2: 'Найди второе слагаемое',
    sum: 'Найди сумму',
    minuend: 'Найди уменьшаемое',
    subtrahend: 'Найди вычитаемое',
    difference: 'Найди разность'
  };
  return labels[type];
}

function expressionText(q) {
  const first = ['addend1', 'minuend'].includes(q.type) ? '?' : q.a;
  const second = ['addend2', 'subtrahend'].includes(q.type) ? '?' : q.b;
  const result = ['sum', 'difference'].includes(q.type) ? '?' : q.result;
  const sign = q.operation === 'addition' ? '+' : '−';
  return `${first} ${sign} ${second} = ${result}`;
}

function tableHtml(q) {
  const addition = q.operation === 'addition';
  const cells = addition
    ? [
        { id: 'addend1', name: 'Слагаемое', value: q.a },
        { id: 'addend2', name: 'Слагаемое', value: q.b },
        { id: 'sum', name: 'Сумма', value: q.result }
      ]
    : [
        { id: 'minuend', name: 'Уменьшаемое', value: q.a },
        { id: 'subtrahend', name: 'Вычитаемое', value: q.b },
        { id: 'difference', name: 'Разность', value: q.result }
      ];

  return cells.map(cell => `
    <div class="component-table__cell ${cell.id === q.type ? 'is-missing' : ''}">
      <span class="component-table__name">${cell.name}</span>
      <strong class="component-table__value">${cell.id === q.type ? '?' : cell.value}</strong>
    </div>
  `).join('');
}

function renderAnswerArea(q) {
  const answerArea = $('[data-role="answer-area"]');
  let mode = state.settings.mode;
  if (mode === 'mixed') mode = Math.random() < 0.5 ? 'choice' : 'input';

  if (mode === 'input') {
    answerArea.innerHTML = `
      <div class="input-answer">
        <input data-role="answer-input" type="number" inputmode="numeric" min="0" autocomplete="off" aria-label="Введите ответ">
        <button class="trainer-btn trainer-btn--primary" type="button" data-action="check-input">Проверить</button>
      </div>`;
    requestAnimationFrame(() => $('[data-role="answer-input"]')?.focus());
    return;
  }

  answerArea.innerHTML = `<div class="answer-grid">${buildAnswerOptions(q.answer).map(value => `
    <button type="button" class="answer-card" data-answer="${value}">${value}</button>
  `).join('')}</div>`;
}

function buildAnswerOptions(correct) {
  const values = new Set([correct]);
  const scale = state.settings.range <= 20 ? 4 : state.settings.range <= 100 ? 12 : 80;
  let guard = 0;
  while (values.size < 4 && guard < 100) {
    const offset = randomInt(-scale, scale);
    const value = correct + offset;
    if (value >= 0 && value <= state.settings.range) values.add(value);
    guard++;
  }
  let fallback = 0;
  while (values.size < 4) values.add(fallback++);
  return shuffle([...values]);
}

function checkInputAnswer() {
  const input = $('[data-role="answer-input"]');
  if (!input || input.disabled || input.value.trim() === '') return;
  checkAnswer(Number(input.value), input);
}

function checkAnswer(value, sourceElement) {
  if (state.finished || sourceElement?.disabled) return;
  const q = state.questions[state.index];
  if (!q) return;
  state.attempts++;

  if (value === q.answer) {
    sourceElement?.classList?.add('is-correct');
    handleCorrect(q);
  } else {
    sourceElement?.classList?.add('is-wrong');
    setTimeout(() => sourceElement?.classList?.remove('is-wrong'), 360);
    handleWrong(q);
  }
}

function handleCorrect(q) {
  state.correct++;
  state.streak++;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  const feedback = $('[data-role="feedback"]');
  feedback.textContent = randomItem(CONFIG.feedback.correct);
  feedback.className = 'feedback is-good';
  disableAnswers();
  recordStat(q.type, true);
  updateHud();
  setTimeout(() => { state.index++; renderQuestion(); }, CONFIG.timing.nextQuestionMs);
}

function handleWrong(q) {
  state.streak = 0;
  state.currentMistakes++;
  const key = `${q.type}:${q.a}:${q.b}:${q.result}`;
  const previous = state.mistakes.get(key);
  state.mistakes.set(key, { ...q, count: (previous?.count || 0) + 1 });
  recordStat(q.type, false);

  const feedback = $('[data-role="feedback"]');
  feedback.className = 'feedback is-bad';

  if (state.currentMistakes === 1) {
    feedback.textContent = CONFIG.feedback.retry;
  } else if (state.currentMistakes === 2) {
    feedback.textContent = CONFIG.feedback.secondTry;
    const hint = $('[data-role="hint"]');
    hint.hidden = false;
    hint.textContent = hintText(q);
  } else {
    feedback.textContent = CONFIG.feedback.reveal(q.answer);
    const hint = $('[data-role="hint"]');
    hint.hidden = false;
    hint.textContent = `${hintText(q)} Ответ: ${q.answer}.`;
  }
  updateHud();
}

function hintText(q) {
  const map = {
    addend1: `Чтобы найти неизвестное слагаемое, из суммы ${q.result} вычти известное слагаемое ${q.b}.`,
    addend2: `Чтобы найти неизвестное слагаемое, из суммы ${q.result} вычти известное слагаемое ${q.a}.`,
    sum: `Чтобы найти сумму, сложи слагаемые ${q.a} и ${q.b}.`,
    minuend: `Чтобы найти уменьшаемое, к разности ${q.result} прибавь вычитаемое ${q.b}.`,
    subtrahend: `Чтобы найти вычитаемое, из уменьшаемого ${q.a} вычти разность ${q.result}.`,
    difference: `Чтобы найти разность, из уменьшаемого ${q.a} вычти вычитаемое ${q.b}.`
  };
  return map[q.type];
}

function disableAnswers() {
  $$('[data-answer], [data-role="answer-input"], [data-action="check-input"]').forEach(el => { el.disabled = true; });
}

function updateHud() {
  const total = state.questions.length;
  $('[data-role="question-counter"]').textContent = `${Math.min(state.index + 1, total)} из ${total}`;
  $('[data-role="score-counter"]').textContent = state.correct;
  $('[data-role="streak-counter"]').textContent = state.streak;
}

function renderProgress() {
  const total = state.questions.length;
  const displayCount = Math.min(total, 20);
  let progress = '';
  for (let i = 0; i < displayCount; i++) {
    const threshold = Math.floor((i / displayCount) * total);
    progress += threshold < state.index ? '😊' : threshold === state.index ? '🙂' : '⚪';
  }
  $('[data-role="emoji-progress"]').textContent = progress;
}

function finishTraining() {
  if (state.finished) return;
  state.finished = true;
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  const fully = state.index >= state.questions.length;
  const completed = Math.min(state.index, state.questions.length);
  const total = fully ? state.questions.length : completed;

  $('[data-role="result-score"]').textContent = `${state.correct} из ${total}`;
  $('[data-role="result-accuracy"]').textContent = `${accuracy}%`;
  $('[data-role="result-streak"]').textContent = state.bestStreak;

  let title = 'Продолжай тренироваться!';
  let emoji = '💪';
  if (accuracy >= 90) { title = 'Отличный результат!'; emoji = '🎉'; }
  else if (accuracy >= 70) { title = 'Хорошая работа!'; emoji = '😊'; }
  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = accuracy >= 90
    ? 'Ты хорошо различаешь компоненты сложения и вычитания.'
    : 'Повтори правила нахождения неизвестных компонентов — и результат станет ещё лучше.';

  renderReview();
  $('[data-action="retry-mistakes"]').disabled = state.mistakes.size === 0;
  showScreen('result');
}

function renderReview() {
  const list = $('[data-role="review-list"]');
  if (!state.mistakes.size) {
    list.innerHTML = '<p class="review-empty">Ошибок нет — всё решено верно! ✅</p>';
    return;
  }
  list.innerHTML = [...state.mistakes.values()]
    .sort((a, b) => b.count - a.count)
    .map(item => `<span class="review-chip">${taskLabel(item.type)}</span>`)
    .join('');
}

function startMistakeReview() {
  if (!state.mistakes.size) return;
  const questions = [...state.mistakes.values()].map(item => ({
    operation: item.operation, type: item.type, a: item.a, b: item.b, result: item.result, answer: item.answer
  }));
  state.index = 0;
  state.correct = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.mistakes = new Map();
  state.finished = false;
  state.reviewMode = true;
  state.questions = shuffle(questions);
  showScreen('training');
  renderQuestion();
}

function recordStat(type, isCorrect) {
  let stats = {};
  try { stats = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}'); } catch (_) { stats = {}; }
  if (!stats[type]) stats[type] = { correct: 0, wrong: 0 };
  stats[type][isCorrect ? 'correct' : 'wrong']++;
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(stats)); } catch (_) {}
}

function showScreen(name) {
  $$('[data-screen]').forEach(screen => screen.classList.toggle('is-active', screen.dataset.screen === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

document.addEventListener('DOMContentLoaded', init);
