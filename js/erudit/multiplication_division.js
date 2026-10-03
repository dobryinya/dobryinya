'use strict';

const CONFIG = {
  counts: [10, 20, 30, 50, '∞'],
  ranges: [20, 100, 1000],

  operations: [
    { id: 'multiplication', symbol: '×', title: 'Умножение', note: 'множители и произведение' },
    { id: 'division', symbol: '÷', title: 'Деление', note: 'делимое, делитель и частное' },
    { id: 'mixed', symbol: '×÷', title: 'Вперемешку', note: 'оба действия' }
  ],

  components: {
    multiplication: [
      { id: 'factor1', title: '1-й множитель', short: 'Множитель', symbol: 'a' },
      { id: 'factor2', title: '2-й множитель', short: 'Множитель', symbol: 'b' },
      { id: 'product', title: 'Произведение', short: 'Произведение', symbol: 'P' }
    ],
    division: [
      { id: 'dividend', title: 'Делимое', short: 'Делимое', symbol: 'a' },
      { id: 'divisor', title: 'Делитель', short: 'Делитель', symbol: 'b' },
      { id: 'quotient', title: 'Частное', short: 'Частное', symbol: 'Q' }
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
    selectedComponents: ['factor1', 'factor2', 'product', 'dividend', 'divisor', 'quotient'],
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
  storageKey: 'dobrynya-erudit-multiplication-division-components-v1'
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
  if (state.settings.operation === 'multiplication') return CONFIG.components.multiplication;
  if (state.settings.operation === 'division') return CONFIG.components.division;
  return [...CONFIG.components.multiplication, ...CONFIG.components.division];
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
  if (!state.settings.selectedComponents.length) {
    state.settings.selectedComponents = allowed.map(item => item.id);
  }

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
    factor1: 'произведение ÷ известный множитель',
    factor2: 'произведение ÷ известный множитель',
    product: 'множитель × множитель',
    dividend: 'делитель × частное',
    divisor: 'делимое ÷ частное',
    quotient: 'делимое ÷ делитель'
  };
  return rules[id] || '';
}

function bindActions() {
  document.addEventListener('click', event => {
    const operation = event.target.closest('[data-operation]');
    if (operation) {
      state.settings.operation = operation.dataset.operation;
      const available = availableComponents();
      state.settings.selectedComponents = available.map(item => item.id);
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
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const count = event.target.closest('[data-count]');
    if (count) {
      state.settings.count = count.dataset.count === '∞' ? '∞' : Number(count.dataset.count);
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const mode = event.target.closest('[data-mode]');
    if (mode) {
      state.settings.mode = mode.dataset.mode;
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const order = event.target.closest('[data-order]');
    if (order) {
      state.settings.order = order.dataset.order;
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const answer = event.target.closest('[data-answer]');
    if (answer) {
      checkAnswer(Number(answer.dataset.answer), answer);
      return;
    }

    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    if (action === 'select-all-components') {
      state.settings.selectedComponents = availableComponents().map(item => item.id);
      renderSettings();
      updateSelectionSummary();
    } else if (action === 'start') {
      startTraining();
    } else if (action === 'stop') {
      finishTraining();
    } else if (action === 'settings') {
      showScreen('settings');
    } else if (action === 'restart') {
      startTraining();
    } else if (action === 'retry-mistakes') {
      startMistakeReview();
    } else if (action === 'check-input') {
      checkInputAnswer();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const trainingScreen = $('[data-screen="training"]');
    if (!trainingScreen?.classList.contains('is-active')) return;
    const input = $('[data-role="answer-input"]');
    if (!input || input.disabled) return;
    checkInputAnswer();
  });
}

function toggleComponent(id) {
  const selected = new Set(state.settings.selectedComponents);
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  state.settings.selectedComponents = [...selected];
  renderSettings();
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const operationLabel = CONFIG.operations.find(item => item.id === state.settings.operation)?.title || '';
  const countText = state.settings.count === '∞' ? 'без ограничения' : `${state.settings.count} примеров`;
  const selectedCount = state.settings.selectedComponents.length;
  $('[data-role="selection-summary"]').textContent =
    `${operationLabel} · ${selectedCount} типов заданий · числа до ${state.settings.range} · ${countText}`;
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

  if (['factor1', 'factor2', 'product'].includes(type)) {
    const [a, b] = makeFactors(max);
    const product = a * b;
    const answer = type === 'factor1' ? a : type === 'factor2' ? b : product;
    return { operation: 'multiplication', type, a, b, result: product, answer };
  }

  const [divisor, quotient] = makeDivisionParts(max);
  const dividend = divisor * quotient;
  const answer =
    type === 'dividend' ? dividend :
    type === 'divisor' ? divisor :
    quotient;

  return {
    operation: 'division',
    type,
    a: dividend,
    b: divisor,
    result: quotient,
    answer
  };
}

function makeFactors(max) {
  const factorCap = max <= 20 ? 10 : max <= 100 ? 10 : 30;
  let a, b;
  do {
    a = randomInt(2, factorCap);
    b = randomInt(2, factorCap);
  } while (a * b > max);
  return [a, b];
}

function makeDivisionParts(max) {
  const divisorCap = max <= 20 ? 10 : max <= 100 ? 10 : 25;
  const quotientCap = max <= 20 ? 10 : max <= 100 ? 10 : 40;
  let divisor, quotient;
  do {
    divisor = randomInt(2, divisorCap);
    quotient = randomInt(2, quotientCap);
  } while (divisor * quotient > max);
  return [divisor, quotient];
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
    factor1: 'Найди первый множитель',
    factor2: 'Найди второй множитель',
    product: 'Найди произведение',
    dividend: 'Найди делимое',
    divisor: 'Найди делитель',
    quotient: 'Найди частное'
  };
  return labels[type];
}

function expressionText(q) {
  const first = ['factor1', 'dividend'].includes(q.type) ? '?' : q.a;
  const second = ['factor2', 'divisor'].includes(q.type) ? '?' : q.b;
  const result = ['product', 'quotient'].includes(q.type) ? '?' : q.result;
  const sign = q.operation === 'multiplication' ? '×' : '÷';
  return `${first} ${sign} ${second} = ${result}`;
}

function tableHtml(q) {
  const multiplication = q.operation === 'multiplication';
  const cells = multiplication
    ? [
        { id: 'factor1', name: 'Множитель', value: q.a },
        { id: 'factor2', name: 'Множитель', value: q.b },
        { id: 'product', name: 'Произведение', value: q.result }
      ]
    : [
        { id: 'dividend', name: 'Делимое', value: q.a },
        { id: 'divisor', name: 'Делитель', value: q.b },
        { id: 'quotient', name: 'Частное', value: q.result }
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
  const maxOption = Math.max(state.settings.range, correct + 20);
  const scale = correct <= 10 ? 5 : correct <= 100 ? 15 : 100;
  let guard = 0;

  while (values.size < 4 && guard < 100) {
    const offset = randomInt(-scale, scale);
    const value = correct + offset;
    if (value > 0 && value <= maxOption) values.add(value);
    guard++;
  }

  let fallback = 1;
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
  setTimeout(() => {
    state.index++;
    renderQuestion();
  }, CONFIG.timing.nextQuestionMs);
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
    factor1: `Чтобы найти неизвестный множитель, произведение ${q.result} раздели на известный множитель ${q.b}.`,
    factor2: `Чтобы найти неизвестный множитель, произведение ${q.result} раздели на известный множитель ${q.a}.`,
    product: `Чтобы найти произведение, умножь множители ${q.a} и ${q.b}.`,
    dividend: `Чтобы найти делимое, умножь делитель ${q.b} на частное ${q.result}.`,
    divisor: `Чтобы найти делитель, делимое ${q.a} раздели на частное ${q.result}.`,
    quotient: `Чтобы найти частное, делимое ${q.a} раздели на делитель ${q.b}.`
  };
  return map[q.type];
}

function disableAnswers() {
  $$('[data-answer], [data-role="answer-input"], [data-action="check-input"]').forEach(el => {
    el.disabled = true;
  });
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

  const accuracy = state.attempts
    ? Math.round((state.correct / state.attempts) * 100)
    : 0;

  const fully = state.index >= state.questions.length;
  const completed = Math.min(state.index, state.questions.length);
  const total = fully ? state.questions.length : completed;

  $('[data-role="result-score"]').textContent = `${state.correct} из ${total}`;
  $('[data-role="result-accuracy"]').textContent = `${accuracy}%`;
  $('[data-role="result-streak"]').textContent = state.bestStreak;

  let title = 'Продолжай тренироваться!';
  let emoji = '💪';

  if (accuracy >= 90) {
    title = 'Отличный результат!';
    emoji = '🎉';
  } else if (accuracy >= 70) {
    title = 'Хорошая работа!';
    emoji = '😊';
  }

  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = accuracy >= 90
    ? 'Ты хорошо различаешь компоненты умножения и деления.'
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
    operation: item.operation,
    type: item.type,
    a: item.a,
    b: item.b,
    result: item.result,
    answer: item.answer
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
  try {
    stats = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '{}');
  } catch (_) {
    stats = {};
  }

  if (!stats[type]) stats[type] = { correct: 0, wrong: 0 };
  stats[type][isCorrect ? 'correct' : 'wrong']++;

  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(stats));
  } catch (_) {}
}

function showScreen(name) {
  $$('[data-screen]').forEach(screen => {
    screen.classList.toggle('is-active', screen.dataset.screen === name);
  });
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
