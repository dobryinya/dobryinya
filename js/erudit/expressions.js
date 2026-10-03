"use strict";

const CONFIG = {
  counts: [5, 10, 20],

  levels: [
    {
      id: "100",
      title: "Простой",
      note: ""
    },
    {
      id: "5000",
      title: "Сложный",
      note: ""
    }
  ],

  defaultSettings: {
    level: "100",
    count: 10
  },

  taskLabels: [
    "Найди значение выражения",
    "Вычисли",
    "Найди значение"
  ],

  feedback: {
    correct: ["Верно! 👍", "Отлично! ⭐", "Правильно! 😊", "Так держать! 💪"],
    retry: "Проверь порядок действий и попробуй ещё раз.",
    secondTry: "Вспомни: сначала скобки, затем умножение и деление, потом сложение и вычитание."
  },

  storageKey: "dobrynya-erudit-expressions-stats-v1"
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
    <button
      type="button"
      class="expressions-level-card ${state.settings.level === level.id ? "is-selected" : ""}"
      data-level="${level.id}"
      aria-pressed="${state.settings.level === level.id}"
    >
      <strong>${level.title}</strong>
      <span>${level.note}</span>
    </button>
  `).join("");

  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button
      type="button"
      class="choice-card ${state.settings.count === count ? "is-selected" : ""}"
      data-count="${count}"
    >
      ${count}
    </button>
  `).join("");
}

function updateSelectionSummary() {
  const level = CONFIG.levels.find(item => item.id === state.settings.level);

  $('[data-role="selection-summary"]').textContent =
    `${level?.title || ""} · ${state.settings.count} случайных выражений`;
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
    () => generateQuestion(state.settings.level)
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
   ГЕНЕРАТОР
   ========================================================= */

function generateQuestion(level) {
  const generators = level === "5000"
    ? [
        genDivPlusDiv5000,
        genBracketMulMinus5000,
        genMinusMulBracket5000,
        genDivBracketMinus5000,
        genMulPlusDiv5000,
        genBracketDivPlus5000
      ]
    : [
        genDivPlusDiv100,
        genBracketDivMinus100,
        genBracketMulMinus100,
        genMinusMulBracket100,
        genDivBracketMinus100,
        genMulPlusDiv100
      ];

  for (let guard = 0; guard < 100; guard++) {
    const q = randomItem(generators)();

    if (isValidQuestion(q, level)) {
      return {
        id: createId(),
        level,
        ...q
      };
    }
  }

  // Безопасный запасной вариант.
  return level === "5000"
    ? { id: createId(), level, expression: "2400 : 60 + 1800 : 30", answer: 100,
        steps: ["2400 : 60 = 40", "1800 : 30 = 60", "40 + 60 = 100"] }
    : { id: createId(), level, expression: "75 : 15 + 84 : 6", answer: 19,
        steps: ["75 : 15 = 5", "84 : 6 = 14", "5 + 14 = 19"] };
}

function isValidQuestion(q, level) {
  if (!q || !Number.isInteger(q.answer) || q.answer < 0) return false;

  const max = level === "5000" ? 5000 : 100;

  if (q.answer > max) return false;
  if (!Array.isArray(q.steps) || !q.steps.length) return false;

  return true;
}

/* ---------- ДО 100 ---------- */

function genDivPlusDiv100() {
  const d1 = randomInt(2, 10);
  const q1 = randomInt(2, Math.floor(90 / d1));
  const d2 = randomInt(2, 10);
  const q2 = randomInt(2, Math.floor(90 / d2));

  const a = d1 * q1;
  const b = d2 * q2;
  const answer = q1 + q2;

  return {
    expression: `${a} : ${d1} + ${b} : ${d2}`,
    answer,
    steps: [
      `${a} : ${d1} = ${q1}`,
      `${b} : ${d2} = ${q2}`,
      `${q1} + ${q2} = ${answer}`
    ]
  };
}

function genBracketDivMinus100() {
  const divisor = randomInt(2, 9);
  const quotient = randomInt(6, 35);
  const inside = divisor * quotient;

  const left = randomInt(Math.max(2, inside - 30), inside - 1);
  const right = inside - left;
  const minus = randomInt(1, Math.max(1, quotient - 1));
  const answer = quotient - minus;

  return {
    expression: `(${left} + ${right}) : ${divisor} − ${minus}`,
    answer,
    steps: [
      `${left} + ${right} = ${inside}`,
      `${inside} : ${divisor} = ${quotient}`,
      `${quotient} − ${minus} = ${answer}`
    ]
  };
}

function genBracketMulMinus100() {
  const multiplier = randomInt(2, 5);
  const sumMax = Math.floor(95 / multiplier);
  const sum = randomInt(8, Math.max(8, sumMax));
  const a = randomInt(2, sum - 2);
  const b = sum - a;
  const product = sum * multiplier;
  const minus = randomInt(1, Math.min(12, product));
  const answer = product - minus;

  return {
    expression: `(${a} + ${b}) · ${multiplier} − ${minus}`,
    answer,
    steps: [
      `${a} + ${b} = ${sum}`,
      `${sum} · ${multiplier} = ${product}`,
      `${product} − ${minus} = ${answer}`
    ]
  };
}

function genMinusMulBracket100() {
  const a = randomInt(45, 100);
  const multiplier = randomInt(2, 5);
  const maxSum = Math.floor((a - 1) / multiplier);
  const sum = randomInt(4, Math.max(4, maxSum));
  const x = randomInt(1, sum - 1);
  const y = sum - x;
  const product = multiplier * sum;
  const answer = a - product;

  return {
    expression: `${a} − ${multiplier} · (${x} + ${y})`,
    answer,
    steps: [
      `${x} + ${y} = ${sum}`,
      `${multiplier} · ${sum} = ${product}`,
      `${a} − ${product} = ${answer}`
    ]
  };
}

function genDivBracketMinus100() {
  const difference = randomInt(2, 10);
  const quotient = randomInt(2, 10);
  const dividend = difference * quotient;
  const small = randomInt(1, 8);
  const large = small + difference;
  const minus = randomInt(0, Math.max(0, quotient - 1));
  const answer = quotient - minus;

  return {
    expression: `${dividend} : (${large} − ${small})${minus ? ` − ${minus}` : ""}`,
    answer,
    steps: [
      `${large} − ${small} = ${difference}`,
      `${dividend} : ${difference} = ${quotient}`,
      ...(minus ? [`${quotient} − ${minus} = ${answer}`] : [])
    ]
  };
}

function genMulPlusDiv100() {
  const a = randomInt(2, 9);
  const b = randomInt(2, 9);
  const product = a * b;

  const divisor = randomInt(2, 10);
  const quotient = randomInt(1, Math.max(1, Math.floor((100 - product) / divisor)));
  const dividend = divisor * quotient;
  const answer = product + quotient;

  return {
    expression: `${a} · ${b} + ${dividend} : ${divisor}`,
    answer,
    steps: [
      `${a} · ${b} = ${product}`,
      `${dividend} : ${divisor} = ${quotient}`,
      `${product} + ${quotient} = ${answer}`
    ]
  };
}

/* ---------- ДО 5000 ---------- */

function genDivPlusDiv5000() {
  const divisor1 = randomItem([10, 20, 25, 40, 50, 100]);
  const quotient1 = randomInt(10, Math.floor(3000 / divisor1));
  const a = divisor1 * quotient1;

  const divisor2 = randomItem([10, 20, 25, 40, 50, 100]);
  const quotient2 = randomInt(5, Math.floor(1900 / divisor2));
  const b = divisor2 * quotient2;

  const answer = quotient1 + quotient2;

  return {
    expression: `${a} : ${divisor1} + ${b} : ${divisor2}`,
    answer,
    steps: [
      `${a} : ${divisor1} = ${quotient1}`,
      `${b} : ${divisor2} = ${quotient2}`,
      `${quotient1} + ${quotient2} = ${answer}`
    ]
  };
}

function genBracketMulMinus5000() {
  const multiplier = randomInt(2, 9);
  const sum = randomInt(50, Math.floor(4500 / multiplier));
  const a = randomInt(20, sum - 20);
  const b = sum - a;
  const product = sum * multiplier;
  const minus = randomInt(10, Math.min(500, product));
  const answer = product - minus;

  return {
    expression: `(${a} + ${b}) · ${multiplier} − ${minus}`,
    answer,
    steps: [
      `${a} + ${b} = ${sum}`,
      `${sum} · ${multiplier} = ${product}`,
      `${product} − ${minus} = ${answer}`
    ]
  };
}

function genMinusMulBracket5000() {
  const start = randomInt(800, 5000);
  const multiplier = randomInt(2, 9);
  const maxSum = Math.floor((start - 1) / multiplier);
  const sum = randomInt(20, Math.max(20, Math.min(maxSum, 400)));
  const a = randomInt(5, sum - 5);
  const b = sum - a;
  const product = multiplier * sum;
  const answer = start - product;

  return {
    expression: `${start} − ${multiplier} · (${a} + ${b})`,
    answer,
    steps: [
      `${a} + ${b} = ${sum}`,
      `${multiplier} · ${sum} = ${product}`,
      `${start} − ${product} = ${answer}`
    ]
  };
}

function genDivBracketMinus5000() {
  const difference = randomItem([5, 10, 20, 25, 40, 50]);
  const quotient = randomInt(10, Math.min(100, Math.floor(4800 / difference)));
  const dividend = difference * quotient;

  const small = randomInt(2, 60);
  const large = small + difference;
  const minus = randomInt(1, Math.min(30, quotient - 1));
  const answer = quotient - minus;

  return {
    expression: `${dividend} : (${large} − ${small}) − ${minus}`,
    answer,
    steps: [
      `${large} − ${small} = ${difference}`,
      `${dividend} : ${difference} = ${quotient}`,
      `${quotient} − ${minus} = ${answer}`
    ]
  };
}

function genMulPlusDiv5000() {
  const a = randomInt(12, 80);
  const b = randomInt(2, 20);
  const product = a * b;

  const divisor = randomItem([5, 10, 20, 25, 50]);
  const quotient = randomInt(5, Math.max(5, Math.min(100, 5000 - product)));
  const dividend = divisor * quotient;
  const answer = product + quotient;

  return {
    expression: `${a} · ${b} + ${dividend} : ${divisor}`,
    answer,
    steps: [
      `${a} · ${b} = ${product}`,
      `${dividend} : ${divisor} = ${quotient}`,
      `${product} + ${quotient} = ${answer}`
    ]
  };
}

function genBracketDivPlus5000() {
  const divisor = randomItem([5, 10, 20, 25, 50]);
  const quotient = randomInt(10, 90);
  const sum = divisor * quotient;

  const a = randomInt(50, sum - 10);
  const b = sum - a;

  const add = randomInt(10, Math.min(500, 5000 - quotient));
  const answer = quotient + add;

  return {
    expression: `(${a} + ${b}) : ${divisor} + ${add}`,
    answer,
    steps: [
      `${a} + ${b} = ${sum}`,
      `${sum} : ${divisor} = ${quotient}`,
      `${quotient} + ${add} = ${answer}`
    ]
  };
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

  $('[data-role="task-label"]').textContent = randomItem(CONFIG.taskLabels);
  $('[data-role="expression"]').textContent = `${q.expression}.`;

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

function renderAnswerArea() {
  $('[data-role="answer-area"]').innerHTML = `
    <div class="expressions-input">
      <label for="expression-answer">Ответ:</label>

      <input
        id="expression-answer"
        data-role="answer-input"
        type="number"
        min="0"
        inputmode="numeric"
        autocomplete="off"
        aria-label="Введите ответ"
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
    hint.textContent = firstStepHint(q);
    return;
  }

  feedback.textContent = `Правильный ответ: ${q.answer}.`;
  hint.hidden = false;
  hint.textContent = firstStepHint(q);

  state.currentResolved = true;

  disableAnswer();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(false);
  updateHud();
}

function firstStepHint(q) {
  const first = q.steps[0] || "";

  return `Начни с первого действия: ${first.replace(/ = .+$/, "")}.`;
}

function showSolution(q) {
  const solution = $('[data-role="solution"]');

  solution.innerHTML = `
    <h3>Решение по действиям</h3>
    ${q.steps.map((step, index) => `
      <p class="expressions-step">${index + 1}) ${step}</p>
    `).join("")}
    <p class="expressions-final">Ответ: ${q.answer}.</p>
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
   HUD / ИТОГИ
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
  let message = "Повтори порядок действий и попробуй ещё раз.";

  if (accuracy >= 90) {
    title = "Отличный результат!";
    emoji = "🎉";
    message = "Порядок действий уже хорошо закреплён.";
  } else if (accuracy >= 70) {
    title = "Хорошая работа!";
    emoji = "😊";
    message = "Ещё немного практики — и выражения будут решаться увереннее.";
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
    list.innerHTML = `<p class="review-empty">Ошибок нет — всё решено с первой попытки! ✅</p>`;
    return;
  }

  list.innerHTML = state.mistakes.map(q => `
    <span class="review-chip">${escapeHtml(q.expression)}</span>
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
  if (max < min) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

init();
