'use strict';

const CONFIG = {
  title: 'Тренажёр таблицы умножения',

  tables: [2, 3, 4, 5, 6, 7, 8, 9],

  multiplierMin: 1,
  multiplierMax: 10,

  counts: [10, 20, 30, 50, '∞'],

  modes: [
    {
      id: 'choice',
      icon: '🔢',
      label: 'Выбор ответа'
    },
    {
      id: 'input',
      icon: '⌨️',
      label: 'Ввод ответа'
    },
    {
      id: 'mixed',
      icon: '🔀',
      label: 'Смешанный режим'
    }
  ],

  orders: [
    {
      id: 'random',
      label: 'Вперемешку'
    },
    {
      id: 'sequential',
      label: 'По порядку'
    }
  ],

  presets: [
    {
      label: 'Только ×2',
      tables: [2]
    },
    {
      label: 'От ×2 до ×4',
      tables: [2, 3, 4]
    },
    {
      label: 'От ×2 до ×5',
      tables: [2, 3, 4, 5]
    },
    {
      label: 'От ×2 до ×9',
      tables: [2, 3, 4, 5, 6, 7, 8, 9]
    }
  ],

  defaultSettings: {
    selectedTables: [2, 3, 4],
    count: 10,
    mode: 'choice',
    order: 'random'
  },

  feedback: {
    correct: [
      'Верно! 👍',
      'Отлично! ⭐',
      'Правильно! 😊',
      'Так держать! 💪'
    ],

    retry: 'Попробуй ещё раз',

    secondTry: 'Посмотри на подсказку и попробуй снова',

    reveal: answer => `Правильный ответ: ${answer}`
  },

  timing: {
    nextQuestionMs: 650
  },

  storageKey: 'dobrynya-erudit-multiplication-stats-v1'
};

const state = {
  settings: structuredClone(CONFIG.defaultSettings),

  questions: [],

  index: 0,

  /*
   * Количество правильных попыток.
   *
   * После правильного ответа вопрос завершается,
   * поэтому на один пример может быть только
   * одна правильная попытка.
   */
  correct: 0,

  /*
   * Общее количество попыток:
   * правильные + неправильные.
   *
   * Именно это значение используется
   * для расчёта точности.
   */
  attempts: 0,

  streak: 0,
  bestStreak: 0,

  /*
   * Количество ошибок только в текущем вопросе.
   * Нужное для показа подсказок.
   */
  currentMistakes: 0,

  /*
   * Все примеры, в которых были ошибки.
   */
  mistakes: new Map(),

  finished: false,
  reviewMode: false
};

const $ = (selector, root = document) => {
  return root.querySelector(selector);
};

const $$ = (selector, root = document) => {
  return [...root.querySelectorAll(selector)];
};

function init() {
  renderSettings();
  bindActions();
  updateSelectionSummary();
}

function renderSettings() {
  const tablePicker = $('[data-role="table-picker"]');

  tablePicker.innerHTML = CONFIG.tables
    .map(number => {
      const isSelected =
        state.settings.selectedTables.includes(number);

      return `
        <button
          type="button"
          class="table-card ${isSelected ? 'is-selected' : ''}"
          data-table="${number}"
          aria-pressed="${isSelected}"
        >
          ×${number}
        </button>
      `;
    })
    .join('');

  const presets = $('[data-role="presets"]');

  presets.innerHTML = CONFIG.presets
    .map((preset, index) => {
      return `
        <button
          type="button"
          class="preset-card"
          data-preset="${index}"
        >
          ${preset.label}
        </button>
      `;
    })
    .join('');

  const countPicker = $('[data-role="count-picker"]');

  countPicker.innerHTML = CONFIG.counts
    .map(count => {
      const isSelected =
        state.settings.count === count;

      return `
        <button
          type="button"
          class="choice-card ${isSelected ? 'is-selected' : ''}"
          data-count="${count}"
        >
          ${count}
        </button>
      `;
    })
    .join('');

  const modePicker = $('[data-role="mode-picker"]');

  modePicker.innerHTML = CONFIG.modes
    .map(mode => {
      const isSelected =
        state.settings.mode === mode.id;

      return `
        <button
          type="button"
          class="mode-card ${isSelected ? 'is-selected' : ''}"
          data-mode="${mode.id}"
        >
          <span>${mode.icon}</span>
          <span>${mode.label}</span>
        </button>
      `;
    })
    .join('');

  const orderPicker = $('[data-role="order-picker"]');

  orderPicker.innerHTML = CONFIG.orders
    .map(order => {
      const isSelected =
        state.settings.order === order.id;

      return `
        <button
          type="button"
          class="choice-card ${isSelected ? 'is-selected' : ''}"
          data-order="${order.id}"
        >
          ${order.label}
        </button>
      `;
    })
    .join('');
}

function bindActions() {
  document.addEventListener('click', event => {
    const tableButton =
      event.target.closest('[data-table]');

    if (tableButton) {
      toggleTable(Number(tableButton.dataset.table));
      return;
    }

    const presetButton =
      event.target.closest('[data-preset]');

    if (presetButton) {
      applyPreset(Number(presetButton.dataset.preset));
      return;
    }

    const countButton =
      event.target.closest('[data-count]');

    if (countButton) {
      const value =
        countButton.dataset.count === '∞'
          ? '∞'
          : Number(countButton.dataset.count);

      setCount(value);
      return;
    }

    const modeButton =
      event.target.closest('[data-mode]');

    if (modeButton) {
      setMode(modeButton.dataset.mode);
      return;
    }

    const orderButton =
      event.target.closest('[data-order]');

    if (orderButton) {
      setOrder(orderButton.dataset.order);
      return;
    }

    const answerButton =
      event.target.closest('[data-answer]');

    if (answerButton) {
      checkAnswer(
        Number(answerButton.dataset.answer),
        answerButton
      );

      return;
    }

    const actionElement =
      event.target.closest('[data-action]');

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;

    if (action === 'select-all') {
      selectAll();
      return;
    }

    if (action === 'start') {
      startTraining();
      return;
    }

    if (action === 'stop') {
      finishTraining();
      return;
    }

    if (action === 'settings') {
      showScreen('settings');
      return;
    }

    if (action === 'restart') {
      startTraining();
      return;
    }

    if (action === 'retry-mistakes') {
      startMistakeReview();
      return;
    }

    if (action === 'check-input') {
      checkInputAnswer();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') {
      return;
    }

    const trainingScreen =
      $('[data-screen="training"]');

    if (!trainingScreen?.classList.contains('is-active')) {
      return;
    }

    const input =
      $('[data-role="answer-input"]');

    if (!input || input.disabled) {
      return;
    }

    checkInputAnswer();
  });
}

function toggleTable(number) {
  const selected =
    new Set(state.settings.selectedTables);

  if (selected.has(number)) {
    selected.delete(number);
  } else {
    selected.add(number);
  }

  state.settings.selectedTables =
    [...selected].sort((a, b) => a - b);

  renderSettings();
  updateSelectionSummary();
}

function applyPreset(index) {
  const preset = CONFIG.presets[index];

  if (!preset) {
    return;
  }

  state.settings.selectedTables =
    [...preset.tables];

  renderSettings();
  updateSelectionSummary();
}

function selectAll() {
  state.settings.selectedTables =
    [...CONFIG.tables];

  renderSettings();
  updateSelectionSummary();
}

function setCount(value) {
  state.settings.count = value;

  renderSettings();
  updateSelectionSummary();
}

function setMode(value) {
  state.settings.mode = value;

  renderSettings();
  updateSelectionSummary();
}

function setOrder(value) {
  state.settings.order = value;

  renderSettings();
  updateSelectionSummary();
}

function updateSelectionSummary() {
  const selectedTables =
    state.settings.selectedTables;

  const tablesText = selectedTables.length
    ? selectedTables
        .map(number => `×${number}`)
        .join(', ')
    : 'не выбраны';

  const countText =
    state.settings.count === '∞'
      ? 'без ограничения'
      : `${state.settings.count} примеров`;

  const selectedMode =
    CONFIG.modes.find(mode => {
      return mode.id === state.settings.mode;
    });

  const modeText =
    selectedMode?.label.toLowerCase() || '';

  const summary =
    $('[data-role="selection-summary"]');

  summary.textContent =
    `Таблицы: ${tablesText} · ${countText} · ${modeText}`;

  const startButton =
    $('[data-action="start"]');

  startButton.disabled =
    selectedTables.length === 0;
}

function startTraining() {
  if (!state.settings.selectedTables.length) {
    return;
  }

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
  const pool = [];

  state.settings.selectedTables.forEach(table => {
    for (
      let multiplier = CONFIG.multiplierMin;
      multiplier <= CONFIG.multiplierMax;
      multiplier++
    ) {
      pool.push({
        a: table,
        b: multiplier,
        answer: table * multiplier
      });
    }
  });

  let questions;

  if (state.settings.order === 'random') {
    questions = shuffle([...pool]);
  } else {
    questions = [...pool];
  }

  if (state.settings.count === '∞') {
    return questions;
  }

  const desiredCount =
    Number(state.settings.count);

  while (questions.length < desiredCount) {
    const additionalQuestions =
      state.settings.order === 'random'
        ? shuffle([...pool])
        : [...pool];

    questions.push(...additionalQuestions);
  }

  return questions.slice(0, desiredCount);
}

function renderQuestion() {
  if (state.index >= state.questions.length) {
    finishTraining();
    return;
  }

  state.currentMistakes = 0;

  const question =
    state.questions[state.index];

  const expression =
    $('[data-role="expression"]');

  expression.textContent =
    `${question.a} × ${question.b} = ?`;

  const feedback =
    $('[data-role="feedback"]');

  feedback.textContent = '';
  feedback.className = 'feedback';

  const hint =
    $('[data-role="hint"]');

  hint.hidden = true;
  hint.textContent = '';

  updateHud();
  renderProgress();
  renderAnswerArea(question);
}

function renderAnswerArea(question) {
  const answerArea =
    $('[data-role="answer-area"]');

  let mode =
    state.settings.mode;

  if (mode === 'mixed') {
    mode =
      Math.random() < 0.5
        ? 'choice'
        : 'input';
  }

  if (mode === 'input') {
    answerArea.innerHTML = `
      <div class="input-answer">
        <input
          data-role="answer-input"
          type="number"
          inputmode="numeric"
          autocomplete="off"
          aria-label="Введите ответ"
        >

        <button
          class="trainer-btn trainer-btn--primary"
          type="button"
          data-action="check-input"
        >
          Проверить
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      $('[data-role="answer-input"]')?.focus();
    });

    return;
  }

  const answers =
    buildAnswerOptions(question.answer);

  answerArea.innerHTML = `
    <div class="answer-grid">
      ${answers
        .map(value => {
          return `
            <button
              type="button"
              class="answer-card"
              data-answer="${value}"
            >
              ${value}
            </button>
          `;
        })
        .join('')}
    </div>
  `;
}

function buildAnswerOptions(correctAnswer) {
  const values =
    new Set([correctAnswer]);

  const offsets = shuffle([
    -16,
    -12,
    -10,
    -8,
    -7,
    -6,
    -5,
    -4,
    -3,
    -2,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    10,
    12,
    16
  ]);

  for (const offset of offsets) {
    const value =
      correctAnswer + offset;

    if (value > 0) {
      values.add(value);
    }

    if (values.size === 4) {
      break;
    }
  }

  return shuffle([...values]);
}

function checkInputAnswer() {
  const input =
    $('[data-role="answer-input"]');

  if (!input) {
    return;
  }

  if (input.disabled) {
    return;
  }

  if (input.value.trim() === '') {
    return;
  }

  checkAnswer(
    Number(input.value),
    input
  );
}

function checkAnswer(value, sourceElement) {
  if (state.finished) {
    return;
  }

  if (sourceElement?.disabled) {
    return;
  }

  const question =
    state.questions[state.index];

  if (!question) {
    return;
  }

  /*
   * Любая проверка ответа считается попыткой.
   *
   * Неверный ответ: attempts + 1.
   * Верный ответ: attempts + 1 и correct + 1.
   */
  state.attempts++;

  if (value === question.answer) {
    sourceElement?.classList?.add('is-correct');

    handleCorrect(question);
    return;
  }

  sourceElement?.classList?.add('is-wrong');

  setTimeout(() => {
    sourceElement?.classList?.remove('is-wrong');
  }, 360);

  handleWrong(question);
}

function handleCorrect(question) {
  state.correct++;

  state.streak++;

  state.bestStreak =
    Math.max(
      state.bestStreak,
      state.streak
    );

  const feedback =
    $('[data-role="feedback"]');

  feedback.textContent =
    randomItem(CONFIG.feedback.correct);

  feedback.className =
    'feedback is-good';

  disableAnswers();

  recordStat(
    question.a,
    true
  );

  updateHud();

  setTimeout(() => {
    state.index++;
    renderQuestion();
  }, CONFIG.timing.nextQuestionMs);
}

function handleWrong(question) {
  state.streak = 0;

  state.currentMistakes++;

  const key =
    `${question.a}×${question.b}`;

  const previousMistake =
    state.mistakes.get(key);

  state.mistakes.set(key, {
    ...question,
    count:
      (previousMistake?.count || 0) + 1
  });

  recordStat(
    question.a,
    false
  );

  const feedback =
    $('[data-role="feedback"]');

  feedback.className =
    'feedback is-bad';

  if (state.currentMistakes === 1) {
    feedback.textContent =
      CONFIG.feedback.retry;
  } else if (state.currentMistakes === 2) {
    feedback.textContent =
      CONFIG.feedback.secondTry;

    const hint =
      $('[data-role="hint"]');

    hint.hidden = false;

    hint.textContent =
      `${question.a} × ${question.b} = ` +
      Array(question.b)
        .fill(question.a)
        .join(' + ');
  } else {
    feedback.textContent =
      CONFIG.feedback.reveal(
        question.answer
      );

    const hint =
      $('[data-role="hint"]');

    hint.hidden = false;

    hint.textContent =
      `${question.a} × ${question.b} = ${question.answer}`;
  }

  updateHud();
}

function disableAnswers() {
  const elements = $$(
    [
      '[data-answer]',
      '[data-role="answer-input"]',
      '[data-action="check-input"]'
    ].join(', ')
  );

  elements.forEach(element => {
    element.disabled = true;
  });
}

function updateHud() {
  const totalQuestions =
    state.questions.length;

  const questionCounter =
    $('[data-role="question-counter"]');

  questionCounter.textContent =
    `${Math.min(
      state.index + 1,
      totalQuestions
    )} из ${totalQuestions}`;

  const scoreCounter =
    $('[data-role="score-counter"]');

  scoreCounter.textContent =
    state.correct;

  const streakCounter =
    $('[data-role="streak-counter"]');

  streakCounter.textContent =
    state.streak;
}

function renderProgress() {
  const totalQuestions =
    state.questions.length;

  const displayCount =
    Math.min(totalQuestions, 20);

  let progress = '';

  for (
    let index = 0;
    index < displayCount;
    index++
  ) {
    const threshold =
      Math.floor(
        (index / displayCount) *
        totalQuestions
      );

    if (threshold < state.index) {
      progress += '😊';
    } else if (threshold === state.index) {
      progress += '🙂';
    } else {
      progress += '⚪';
    }
  }

  const progressElement =
    $('[data-role="emoji-progress"]');

  progressElement.textContent =
    progress;
}

function finishTraining() {
  if (state.finished) {
    return;
  }

  state.finished = true;

  /*
   * Точность считается по всем попыткам.
   *
   * Пример:
   *
   * правильных попыток: 10
   * неправильных попыток: 6
   * всего попыток: 16
   *
   * точность:
   * 10 / 16 × 100 = 63%
   */
  const accuracy =
    state.attempts > 0
      ? Math.round(
          (state.correct / state.attempts) *
          100
        )
      : 0;

  /*
   * При полном прохождении:
   * resultTotal = количество вопросов.
   *
   * При нажатии «Завершить» раньше времени:
   * resultTotal = количество уже завершённых вопросов.
   */
  const completedQuestions =
    Math.min(
      state.index,
      state.questions.length
    );

  const isFullyCompleted =
    state.index >= state.questions.length;

  const resultTotal =
    isFullyCompleted
      ? state.questions.length
      : completedQuestions;

  const resultScore =
    $('[data-role="result-score"]');

  resultScore.textContent =
    `${state.correct} из ${resultTotal}`;

  const resultAccuracy =
    $('[data-role="result-accuracy"]');

  resultAccuracy.textContent =
    `${accuracy}%`;

  const resultStreak =
    $('[data-role="result-streak"]');

  resultStreak.textContent =
    state.bestStreak;

  let title =
    'Продолжай тренироваться!';

  let emoji =
    '💪';

  if (accuracy >= 90) {
    title =
      'Отличный результат!';

    emoji =
      '🎉';
  } else if (accuracy >= 70) {
    title =
      'Хорошая работа!';

    emoji =
      '😊';
  }

  const resultTitle =
    $('[data-role="result-title"]');

  resultTitle.textContent =
    title;

  const resultEmoji =
    $('[data-role="result-emoji"]');

  resultEmoji.textContent =
    emoji;

  const resultMessage =
    $('[data-role="result-message"]');

  resultMessage.textContent =
    accuracy >= 90
      ? 'Таблица умножения становится всё увереннее.'
      : 'Повтори сложные примеры — и результат станет ещё лучше.';

  renderReview();

  const retryButton =
    $('[data-action="retry-mistakes"]');

  retryButton.disabled =
    state.mistakes.size === 0;

  showScreen('result');
}

function renderReview() {
  const reviewList =
    $('[data-role="review-list"]');

  if (!state.mistakes.size) {
    reviewList.innerHTML = `
      <p class="review-empty">
        Ошибок нет — всё решено верно! ✅
      </p>
    `;

    return;
  }

  reviewList.innerHTML =
    [...state.mistakes.values()]
      .sort((first, second) => {
        return second.count - first.count;
      })
      .map(item => {
        return `
          <span class="review-chip">
            ${item.a} × ${item.b}
          </span>
        `;
      })
      .join('');
}

function startMistakeReview() {
  if (!state.mistakes.size) {
    return;
  }

  const questions =
    [...state.mistakes.values()]
      .map(item => {
        return {
          a: item.a,
          b: item.b,
          answer: item.answer
        };
      });

  state.index = 0;

  state.correct = 0;
  state.attempts = 0;

  state.streak = 0;
  state.bestStreak = 0;

  state.currentMistakes = 0;
  state.mistakes = new Map();

  state.finished = false;
  state.reviewMode = true;

  state.questions =
    shuffle(questions);

  showScreen('training');
  renderQuestion();
}

function recordStat(table, isCorrect) {
  let stats = {};

  try {
    stats = JSON.parse(
      localStorage.getItem(
        CONFIG.storageKey
      ) || '{}'
    );
  } catch (error) {
    stats = {};
  }

  if (!stats[table]) {
    stats[table] = {
      correct: 0,
      wrong: 0
    };
  }

  if (isCorrect) {
    stats[table].correct++;
  } else {
    stats[table].wrong++;
  }

  localStorage.setItem(
    CONFIG.storageKey,
    JSON.stringify(stats)
  );
}

function showScreen(name) {
  const screens =
    $$('.trainer-screen');

  screens.forEach(screen => {
    const shouldBeActive =
      screen.dataset.screen === name;

    screen.classList.toggle(
      'is-active',
      shouldBeActive
    );
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function shuffle(array) {
  for (
    let index = array.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
        (index + 1)
      );

    [
      array[index],
      array[randomIndex]
    ] = [
      array[randomIndex],
      array[index]
    ];
  }

  return array;
}

function randomItem(array) {
  const randomIndex =
    Math.floor(
      Math.random() *
      array.length
    );

  return array[randomIndex];
}

document.addEventListener(
  'DOMContentLoaded',
  init
);