"use strict";

const CONFIG = {
  counts: [5, 10, 20],

  assets: {
    apple: {
      title: "Яблоко",
      image: "/images/erudit/vpr-shop/apple.png"
    },
    pear: {
      title: "Груша",
      image: "/images/erudit/vpr-shop/pear.png"
    },
    mandarin: {
      title: "Мандарин",
      image: "/images/erudit/vpr-shop/mandarin.png"
    },
    carrot: {
      title: "Морковь",
      image: "/images/erudit/vpr-shop/carrot.png"
    },
    cabbage: {
      title: "Капуста",
      image: "/images/erudit/vpr-shop/cabbage.png"
    }
  },

  defaultSettings: {
    count: 10
  },

  feedback: {
    correct: ["Верно! 👍", "Отлично! ⭐", "Правильно! 😊", "Ребус разгадан! 🧩"],
    retry: "Проверь значения картинок и попробуй ещё раз.",
    secondTry: "Начни с равенства, где неизвестную картинку найти проще всего."
  },

  storageKey: "dobrynya-erudit-math-rebus-stats-v1"
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
  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button type="button"
            class="choice-card ${state.settings.count === count ? "is-selected" : ""}"
            data-count="${count}">
      ${count}
    </button>
  `).join("");
}

function updateSelectionSummary() {
  $('[data-role="selection-summary"]').textContent =
    `${state.settings.count} случайных ребусов`;
}

function bindActions() {
  document.addEventListener("click", event => {
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
    if (action === "check") return checkAnswers();
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

    const active = document.activeElement;
    if (active?.matches?.("[data-rebus-input]")) {
      checkAnswers();
    }
  });
}

function startTraining() {
  resetRun();

  state.questions = Array.from(
    { length: state.settings.count },
    () => generatePuzzle()
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
   ГЕНЕРАЦИЯ РЕБУСА
   ========================================================= */

function generatePuzzle() {
  const ids = shuffle(Object.keys(CONFIG.assets)).slice(0, 3);

  // A — "главная" картинка, которую можно найти из второго равенства.
  // B и C затем находятся последовательно.
  const [aId, bId, cId] = ids;

  const a = randomInt(35, 85);

  // Первое равенство: known + B = A
  const b = randomInt(10, Math.max(10, a - 10));
  const known1 = a - b;

  // Второе: A - known2 = result2
  const known2 = randomInt(5, Math.min(30, a - 5));
  const result2 = a - known2;

  // Третье: B + C = A
  const c = a - b;

  // Чтобы значения картинок были различимы и не совпадали слишком часто,
  // при неудачной генерации пробуем заново.
  if (new Set([a, b, c]).size < 3 || c < 5) {
    return generatePuzzle();
  }

  const equations = [
    {
      type: "known-plus-b-equals-a",
      left: [
        { kind: "number", value: known1 },
        { kind: "operator", value: "+" },
        { kind: "icon", id: bId }
      ],
      right: { kind: "icon", id: aId }
    },
    {
      type: "a-minus-known",
      left: [
        { kind: "icon", id: aId },
        { kind: "operator", value: "−" },
        { kind: "number", value: known2 }
      ],
      right: { kind: "number", value: result2 }
    },
    {
      type: "b-plus-c-equals-a",
      left: [
        { kind: "icon", id: bId },
        { kind: "operator", value: "+" },
        { kind: "icon", id: cId }
      ],
      right: { kind: "icon", id: aId }
    }
  ];

  // Иногда меняем порядок строк, но сохраняем решаемость:
  // прямое уравнение с A всё равно остаётся среди трёх.
  if (Math.random() < 0.5) {
    [equations[0], equations[2]] = [equations[2], equations[0]];
  }

  return {
    id: createId(),
    icons: [
      { id: aId, value: a },
      { id: bId, value: b },
      { id: cId, value: c }
    ],
    aId,
    bId,
    cId,
    a,
    b,
    c,
    known1,
    known2,
    result2,
    equations
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

  $('[data-role="rebus-board"]').innerHTML = rebusBoardHtml(q);

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = "";
  feedback.className = "feedback";

  const hint = $('[data-role="hint"]');
  hint.hidden = true;
  hint.innerHTML = "";

  const solution = $('[data-role="solution"]');
  solution.hidden = true;
  solution.innerHTML = "";

  $('[data-role="next-wrap"]').hidden = true;

  renderAnswerArea(q);
  updateHud();
  renderProgress();
}

function rebusBoardHtml(q) {
  return `
    <div class="rebus-question-row">
      ${q.icons.map(item => `
        <div class="rebus-question-item">
          ${iconHtml(item.id, "rebus-icon")}
          <span class="rebus-question-mark">?</span>
        </div>
      `).join("")}
    </div>

    <div class="rebus-equations">
      ${q.equations.map(equation => `
        <div class="rebus-equation">
          ${equation.left.map(partHtml).join("")}
          <span>=</span>
          ${partHtml(equation.right)}
        </div>
      `).join("")}
    </div>
  `;
}

function partHtml(part) {
  if (part.kind === "icon") return iconHtml(part.id, "rebus-icon");
  return `<span>${part.value}</span>`;
}

function iconHtml(id, className = "") {
  const asset = CONFIG.assets[id];

  return `
    <img
      class="${className}"
      src="${asset.image}"
      alt="${asset.title}"
      draggable="false"
    >
  `;
}

function renderAnswerArea(q) {
  $('[data-role="answer-area"]').innerHTML = `
    <div class="rebus-inputs">
      ${q.icons.map(item => `
        <label class="rebus-input-card">
          ${iconHtml(item.id)}
          <input
            type="number"
            min="0"
            inputmode="numeric"
            autocomplete="off"
            data-rebus-input="${item.id}"
            aria-label="Значение: ${CONFIG.assets[item.id].title}"
          >
        </label>
      `).join("")}
    </div>

    <div class="rebus-check-wrap">
      <button class="trainer-btn trainer-btn--primary"
              type="button" data-action="check">
        Проверить
      </button>
    </div>
  `;

  requestAnimationFrame(() => {
    $('[data-rebus-input]')?.focus();
  });
}

/* =========================================================
   ПРОВЕРКА
   ========================================================= */

function checkAnswers() {
  if (state.finished || state.currentResolved) return;

  const q = state.questions[state.index];
  if (!q) return;

  const inputs = $$("[data-rebus-input]");

  if (inputs.some(input => input.value.trim() === "")) {
    const feedback = $('[data-role="feedback"]');
    feedback.textContent = "Заполни значения всех трёх картинок.";
    feedback.className = "feedback is-bad";
    return;
  }

  state.attempts++;

  let allCorrect = true;

  for (const input of inputs) {
    const id = input.dataset.rebusInput;
    const correct = q.icons.find(item => item.id === id)?.value;
    const value = Number(input.value);

    input.classList.remove("is-wrong", "is-correct");

    if (value === correct) {
      input.classList.add("is-correct");
    } else {
      input.classList.add("is-wrong");
      allCorrect = false;
    }
  }

  setTimeout(() => {
    inputs.forEach(input => input.classList.remove("is-wrong"));
  }, 360);

  if (allCorrect) {
    resolveCorrect(q);
  } else {
    handleWrong(q);
  }
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

  disableAnswers();
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
    hint.innerHTML = `
      Сначала посмотри на равенство
      ${iconHtml(q.aId)}
      <strong>− ${q.known2} = ${q.result2}</strong>.
      Из него можно сразу найти значение этой картинки.
    `;
    return;
  }

  feedback.textContent = "Показываю решение ребуса.";

  state.currentResolved = true;

  for (const input of $$("[data-rebus-input]")) {
    const id = input.dataset.rebusInput;
    const correct = q.icons.find(item => item.id === id)?.value;
    input.value = correct;
    input.classList.add("is-correct");
  }

  disableAnswers();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(false);
  updateHud();
}

function showSolution(q) {
  const solution = $('[data-role="solution"]');

  solution.innerHTML = `
    <h3>Как разгадать ребус</h3>

    <div class="rebus-solution-step">
      1)
      ${iconHtml(q.aId)}
      = ${q.result2} + ${q.known2} = ${q.a}
    </div>

    <div class="rebus-solution-step">
      2)
      ${iconHtml(q.bId)}
      = ${q.a} − ${q.known1} = ${q.b}
    </div>

    <div class="rebus-solution-step">
      3)
      ${iconHtml(q.cId)}
      = ${q.a} − ${q.b} = ${q.c}
    </div>
  `;

  solution.hidden = false;
}

function disableAnswers() {
  $$("[data-rebus-input], [data-action='check']").forEach(element => {
    element.disabled = true;
  });
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

  let title = "Продолжай разгадывать!";
  let emoji = "🧩";
  let message = "С каждым ребусом находить неизвестные становится легче.";

  if (accuracy >= 90) {
    title = "Отличный результат!";
    emoji = "🎉";
    message = "Ты уверенно находишь неизвестные значения.";
  } else if (accuracy >= 70) {
    title = "Хорошая работа!";
    emoji = "😊";
    message = "Ещё немного практики — и ребусы будут решаться совсем быстро.";
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
    list.innerHTML = `<p class="review-empty">Ошибок нет — все ребусы разгаданы с первой попытки! ✅</p>`;
    return;
  }

  list.innerHTML = state.mistakes.map(q => `
    <span class="review-chip">
      ${q.icons.map(item => CONFIG.assets[item.id].title).join(" · ")}
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

  if (!stats.total) {
    stats = { firstTry: 0, withMistakes: 0, total: 0 };
  }

  stats.total++;

  if (firstTry) stats.firstTry++;
  else stats.withMistakes++;

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
