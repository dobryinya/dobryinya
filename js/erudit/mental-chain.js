"use strict";

const CONFIG = {
  counts: [5, 10, 20],
  lengths: [4, 5, 6],

  levels: [
    { id: "100", title: "До 100", note: "Классический устный счёт" },
    { id: "1000-5000", title: "От 1000 до 5000", note: "Крупные числа, но удобные действия" }
  ],

  defaultSettings: {
    level: "100",
    count: 10,
    length: 5
  },

  feedback: {
    correct: ["Верно! 👍", "Отлично! ⭐", "Правильно! 😊", "Так держать! 💪"],
    retry: "Проверь вычисления и попробуй ещё раз.",
    secondTry: "Пройди цепочку ещё раз сверху вниз, не пропуская ни одного действия."
  },

  storageKey: "dobrynya-erudit-mental-chain-stats-v2"
};

const state = {
  settings: structuredClone(CONFIG.defaultSettings),
  questions: [],
  index: 0,
  firstTryCorrect: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  currentMistakes: 0,
  currentResolved: false,
  mistakes: [],
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

function renderSettings() {
  $('[data-role="level-picker"]').innerHTML = CONFIG.levels.map(level => `
    <button type="button"
            class="chain-level-card ${state.settings.level === level.id ? "is-selected" : ""}"
            data-level="${level.id}"
            aria-pressed="${state.settings.level === level.id}">
      <strong>${level.title}</strong>
      <span>${level.note}</span>
    </button>
  `).join("");

  $('[data-role="length-picker"]').innerHTML = CONFIG.lengths.map(length => `
    <button type="button"
            class="choice-card ${state.settings.length === length ? "is-selected" : ""}"
            data-length="${length}">
      ${length}
    </button>
  `).join("");

  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button type="button"
            class="choice-card ${state.settings.count === count ? "is-selected" : ""}"
            data-count="${count}">
      ${count}
    </button>
  `).join("");
}

function updateSelectionSummary() {
  const level = CONFIG.levels.find(item => item.id === state.settings.level);

  $('[data-role="selection-summary"]').textContent =
    `${level?.title || ""} · ${state.settings.length} действий · ${state.settings.count} заданий`;
}

function bindActions() {
  document.addEventListener("click", event => {
    const levelButton = event.target.closest("[data-level]");
    if (levelButton) {
      state.settings.level = levelButton.dataset.level;
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const lengthButton = event.target.closest("[data-length]");
    if (lengthButton) {
      state.settings.length = Number(lengthButton.dataset.length);
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const countButton = event.target.closest("[data-count]");
    if (countButton) {
      state.settings.count = Number(countButton.dataset.count);
      renderSettings();
      updateSelectionSummary();
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const action = actionElement.dataset.action;

    if (action === "start") return startTraining();
    if (action === "stop") return finishTraining();
    if (action === "next") return nextQuestion();
    if (action === "check-input") return checkInputAnswer();
    if (action === "restart") return startTraining();
    if (action === "settings") return showScreen("settings");
    if (action === "retry-mistakes") return startMistakeReview();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    if (!$('[data-screen="training"]')?.classList.contains("is-active")) return;

    const nextWrap = $('[data-role="next-wrap"]');
    if (nextWrap && !nextWrap.hidden) {
      nextQuestion();
      return;
    }

    const input = $('[data-role="answer-input"]');
    if (!input || input.disabled) return;

    checkInputAnswer();
  });
}

function startTraining() {
  resetRun();

  state.questions = Array.from(
    { length: state.settings.count },
    () => generateChain(state.settings.level, state.settings.length)
  );

  showScreen("training");
  renderQuestion();
}

function resetRun() {
  state.index = 0;
  state.firstTryCorrect = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.currentResolved = false;
  state.mistakes = [];
  state.finished = false;
  state.reviewMode = false;
}

/* =========================================================
   ГЕНЕРАЦИЯ ЦЕПОЧЕК
   ========================================================= */

function generateChain(level, length) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const question =
      level === "100"
        ? generateSmallChain(length)
        : generateLargeChain(length);

    if (question) {
      return {
        id: createId(),
        level,
        ...question
      };
    }
  }

  // Запасные цепочки на случай, если генератор не нашёл вариант.
  if (level === "100") {
    return {
      id: createId(),
      level,
      start: 84,
      operations: [
        { symbol: ":", value: 3 },
        { symbol: "·", value: 2 },
        { symbol: "+", value: 4 },
        { symbol: "−", value: 20 }
      ].slice(0, length),
      values: [],
      answer: 40
    };
  }

  return buildChainFromOperations(
    2400,
    [
      { symbol: ":", value: 2 },
      { symbol: "+", value: 400 },
      { symbol: "·", value: 2 },
      { symbol: "−", value: 800 },
      { symbol: "+", value: 200 },
      { symbol: ":", value: 2 }
    ].slice(0, length)
  );
}

function generateSmallChain(length) {
  let current = randomInt(24, 96);
  const start = current;
  const operations = [];
  const values = [];

  for (let i = 0; i < length; i++) {
    const candidates = [];

    // Деление — только нацело.
    for (const divisor of [2, 3, 4, 5, 6, 7, 8, 9]) {
      if (current % divisor === 0 && current / divisor >= 1) {
        candidates.push({
          symbol: ":",
          value: divisor,
          next: current / divisor
        });
      }
    }

    // Умножение — итог остаётся <= 100.
    for (const multiplier of [2, 3, 4, 5]) {
      const next = current * multiplier;
      if (next <= 100) {
        candidates.push({
          symbol: "·",
          value: multiplier,
          next
        });
      }
    }

    // Сложение.
    for (const add of shuffle([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]).slice(0, 5)) {
      const next = current + add;
      if (next <= 100) {
        candidates.push({ symbol: "+", value: add, next });
      }
    }

    // Вычитание без отрицательных значений.
    for (const sub of shuffle([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]).slice(0, 5)) {
      const next = current - sub;
      if (next >= 1) {
        candidates.push({ symbol: "−", value: sub, next });
      }
    }

    if (!candidates.length) return null;

    const chosen = randomItem(candidates);

    operations.push({
      symbol: chosen.symbol,
      value: chosen.value
    });

    current = chosen.next;
    values.push(current);
  }

  return {
    start,
    operations,
    values,
    answer: current
  };
}

function generateLargeChain(length) {
  let current = randomMultiple(1000, 5000, 100);
  const start = current;
  const operations = [];
  const values = [];

  for (let i = 0; i < length; i++) {
    const candidates = [];

    // Для крупных чисел действия всё равно делаем удобными для устного счёта.
    // Деление используем только когда результат остаётся >= 1000.
    for (const divisor of [2, 4, 5]) {
      if (current % divisor === 0) {
        const next = current / divisor;
        if (next >= 1000 && next <= 5000) {
          candidates.push({
            symbol: ":",
            value: divisor,
            next
          });
        }
      }
    }

    // Умножаем только на 2/3/4 и не выходим за 5000.
    for (const multiplier of [2, 3, 4]) {
      const next = current * multiplier;
      if (next >= 1000 && next <= 5000) {
        candidates.push({
          symbol: "·",
          value: multiplier,
          next
        });
      }
    }

    // Прибавляем круглые десятки/сотни.
    for (const add of shuffle([100, 200, 300, 400, 500, 600, 800, 1000]).slice(0, 5)) {
      const next = current + add;
      if (next <= 5000) {
        candidates.push({
          symbol: "+",
          value: add,
          next
        });
      }
    }

    // Вычитаем круглые десятки/сотни и остаёмся >= 1000.
    for (const sub of shuffle([100, 200, 300, 400, 500, 600, 800, 1000]).slice(0, 5)) {
      const next = current - sub;
      if (next >= 1000) {
        candidates.push({
          symbol: "−",
          value: sub,
          next
        });
      }
    }

    if (!candidates.length) return null;

    const chosen = randomItem(candidates);

    operations.push({
      symbol: chosen.symbol,
      value: chosen.value
    });

    current = chosen.next;
    values.push(current);
  }

  return {
    start,
    operations,
    values,
    answer: current
  };
}

function buildChainFromOperations(start, operations) {
  let current = start;
  const values = [];

  for (const operation of operations) {
    current = applyOperation(current, operation);
    values.push(current);
  }

  return {
    start,
    operations,
    values,
    answer: current
  };
}

function applyOperation(current, operation) {
  if (operation.symbol === "+") return current + operation.value;
  if (operation.symbol === "−") return current - operation.value;
  if (operation.symbol === "·") return current * operation.value;
  return current / operation.value;
}

/* =========================================================
   РЕНДЕР
   ========================================================= */

function renderQuestion() {
  if (state.index >= state.questions.length) {
    finishTraining();
    return;
  }

  state.currentMistakes = 0;
  state.currentResolved = false;

  const q = state.questions[state.index];

  $('[data-role="chain-board"]').innerHTML = chainHtml(q);

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = "";
  feedback.className = "feedback";

  const hint = $('[data-role="hint"]');
  hint.hidden = true;
  hint.textContent = "";

  const solution = $('[data-role="solution"]');
  solution.hidden = true;
  solution.innerHTML = "";

  $('[data-role="next-wrap"]').hidden = true;

  renderAnswerArea();
  updateHud();
  renderProgress();
}

function chainHtml(q) {
  return `
    <div class="chain-start">
      <div class="chain-triangle">
        <div class="chain-bubble">${q.start}</div>
      </div>
    </div>

    ${q.operations.map(operation => `
      <div class="chain-step">
        <div class="chain-triangle">
          <div class="chain-bubble">${operation.symbol}${operation.value}</div>
        </div>
      </div>
    `).join("")}
  `;
}

function renderAnswerArea() {
  $('[data-role="answer-area"]').innerHTML = `
    <div class="chain-input">
      <label for="chain-answer">Ответ:</label>

      <input
        id="chain-answer"
        data-role="answer-input"
        type="number"
        min="0"
        inputmode="numeric"
        autocomplete="off"
        aria-label="Введите результат цепочки"
      >

      <button class="trainer-btn trainer-btn--primary"
              type="button" data-action="check-input">
        Проверить
      </button>
    </div>
  `;

  requestAnimationFrame(() => {
    $('[data-role="answer-input"]')?.focus();
  });
}

/* =========================================================
   ПРОВЕРКА
   ========================================================= */

function checkInputAnswer() {
  const input = $('[data-role="answer-input"]');

  if (!input || input.disabled || input.value.trim() === "") return;

  const value = Number(input.value);
  if (!Number.isFinite(value)) return;

  checkAnswer(value, input);
}

function checkAnswer(value, input) {
  if (state.finished || state.currentResolved) return;

  const q = state.questions[state.index];
  if (!q) return;

  state.attempts++;

  if (value === q.answer) {
    input.classList.add("is-correct");
    resolveCorrect(q);
    return;
  }

  input.classList.add("is-wrong");
  setTimeout(() => input.classList.remove("is-wrong"), 360);

  handleWrong(q);
}

function resolveCorrect(q) {
  state.currentResolved = true;

  const firstTry = state.currentMistakes === 0;

  if (firstTry) {
    state.firstTryCorrect++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
  }

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = randomItem(CONFIG.feedback.correct);
  feedback.className = "feedback is-good";

  disableAnswer();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(firstTry);
  updateHud();
}

function handleWrong(q) {
  state.currentMistakes++;
  state.streak = 0;

  if (!state.mistakes.some(item => item.id === q.id)) {
    state.mistakes.push(structuredClone(q));
  }

  const feedback = $('[data-role="feedback"]');
  const hint = $('[data-role="hint"]');

  feedback.className = "feedback is-bad";

  if (state.currentMistakes === 1) {
    feedback.textContent = CONFIG.feedback.retry;
    return;
  }

  if (state.currentMistakes === 2) {
    feedback.textContent = CONFIG.feedback.secondTry;
    hint.hidden = false;
    hint.textContent =
      `Первое действие: ${q.start} ${q.operations[0].symbol} ${q.operations[0].value} = ${q.values[0]}.`;
    return;
  }

  feedback.textContent = `Правильный ответ: ${q.answer}.`;
  hint.hidden = false;
  hint.textContent =
    `Начни с первого шага: ${q.start} ${q.operations[0].symbol} ${q.operations[0].value} = ${q.values[0]}.`;

  state.currentResolved = true;

  disableAnswer();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(false);
  updateHud();
}

function showSolution(q) {
  let previous = q.start;

  const rows = q.operations.map((operation, index) => {
    const result = q.values[index];
    const row =
      `<p class="chain-solution-row">${index + 1}) ${previous} ${operation.symbol} ${operation.value} = ${result}</p>`;
    previous = result;
    return row;
  }).join("");

  const solution = $('[data-role="solution"]');

  solution.innerHTML = `
    <h3>Проверим цепочку</h3>
    ${rows}
    <p class="chain-final">Ответ: ${q.answer}.</p>
  `;

  solution.hidden = false;
}

function disableAnswer() {
  const input = $('[data-role="answer-input"]');
  const button = $('[data-action="check-input"]');

  if (input) input.disabled = true;
  if (button) button.disabled = true;
}

function nextQuestion() {
  if (!state.currentResolved) return;

  state.index++;
  renderQuestion();
}

/* =========================================================
   HUD / РЕЗУЛЬТАТ
   ========================================================= */

function updateHud() {
  const total = state.questions.length;

  $('[data-role="question-counter"]').textContent =
    `${Math.min(state.index + 1, total)} из ${total}`;

  $('[data-role="score-counter"]').textContent =
    state.firstTryCorrect;

  $('[data-role="streak-counter"]').textContent =
    state.streak;
}

function renderProgress() {
  const total = state.questions.length;
  let progress = "";

  for (let i = 0; i < total; i++) {
    if (i < state.index) progress += "😊";
    else if (i === state.index) progress += "🙂";
    else progress += "⚪";
  }

  $('[data-role="emoji-progress"]').textContent = progress;
}

function finishTraining() {
  if (state.finished) return;

  state.finished = true;

  const completed =
    state.currentResolved
      ? Math.min(state.index + 1, state.questions.length)
      : Math.min(state.index, state.questions.length);

  const accuracy =
    completed > 0
      ? Math.round((state.firstTryCorrect / completed) * 100)
      : 0;

  $('[data-role="result-score"]').textContent =
    `${state.firstTryCorrect} из ${completed}`;

  $('[data-role="result-accuracy"]').textContent =
    `${accuracy}%`;

  $('[data-role="result-streak"]').textContent =
    state.bestStreak;

  let title = "Продолжай тренироваться!";
  let emoji = "💪";
  let message = "Устный счёт становится быстрее с практикой.";

  if (accuracy >= 90) {
    title = "Отличный результат!";
    emoji = "🎉";
    message = "Ты уверенно проходишь цепочки действий.";
  } else if (accuracy >= 70) {
    title = "Хорошая работа!";
    emoji = "😊";
    message = "Ещё немного практики — и считать устно станет легче.";
  }

  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = message;

  renderReview();

  $('[data-action="retry-mistakes"]').disabled =
    state.mistakes.length === 0;

  showScreen("result");
}

function renderReview() {
  const list = $('[data-role="review-list"]');

  if (!state.mistakes.length) {
    list.innerHTML = `<p class="review-empty">Ошибок нет — все цепочки решены с первой попытки! ✅</p>`;
    return;
  }

  list.innerHTML = state.mistakes.map(q => `
    <span class="review-chip">
      ${q.start} → ${q.operations.map(op => `${op.symbol}${op.value}`).join(" → ")}
    </span>
  `).join("");
}

function startMistakeReview() {
  if (!state.mistakes.length) return;

  state.questions = shuffle(
    state.mistakes.map(q => ({
      ...structuredClone(q),
      id: createId()
    }))
  );

  state.index = 0;
  state.firstTryCorrect = 0;
  state.attempts = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.currentResolved = false;
  state.mistakes = [];
  state.finished = false;
  state.reviewMode = true;

  showScreen("training");
  renderQuestion();
}

function recordStat(firstTry) {
  let stats = {};

  try {
    stats = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
  } catch {
    stats = {};
  }

  const key = state.settings.level;

  if (!stats[key]) {
    stats[key] = { firstTry: 0, withMistakes: 0 };
  }

  if (firstTry) stats[key].firstTry++;
  else stats[key].withMistakes++;

  localStorage.setItem(CONFIG.storageKey, JSON.stringify(stats));
}

/* =========================================================
   УТИЛИТЫ
   ========================================================= */

function showScreen(name) {
  $$(".trainer-screen").forEach(screen => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomMultiple(min, max, step) {
  const first = Math.ceil(min / step);
  const last = Math.floor(max / step);
  return randomInt(first, last) * step;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

init();
