"use strict";

/* =========================================================
   МЕРЫ ДЛИНЫ И МАССЫ
   Длина и масса идут вперемешку.

   ВЕСЫ:
   - справа всегда ОДИН заданный груз;
   - слева ребёнок выбирает ОДИН эквивалентный груз;
   - выбранный груз ЗАМЕНЯЕТ предыдущий, ничего не суммируется;
   - если слева тяжелее -> левая чаша вниз;
   - если справа тяжелее -> правая чаша вниз;
   - если массы равны -> весы уравновешены.
   ========================================================= */

/*
 * ПОДГОНКА ГРУЗОВ ПОД ТВОИ PNG ВЕСОВ.
 * x / y — проценты от ширины/высоты блока весов.
 * y — точка, на которой стоит низ картинки груза.
 */
const SCALE_LAYOUT = {
  leftHeavy: {
    left:  { x: 20, y: 67 },
    right: { x: 75, y: 48 }
  },
  balanced: {
    left:  { x: 20, y: 57 },
    right: { x: 80, y: 57 }
  },
  rightHeavy: {
    left:  { x: 20, y: 38 },
    right: { x: 80, y:70 }
  },
  weights: {
    small:  { width: 48, scale: 2 },
    medium: { width: 64, scale: 2 },
    large:  { width: 82, scale: 2 }
  }
};

const ASSETS = {
  backgrounds: {
    leftHeavy:  "/images/erudit/measures/scales-left-heavy.png",
    balanced:   "/images/erudit/measures/scales-balanced.png",
    rightHeavy: "/images/erudit/measures/scales-right-heavy.png"
  },
  weights: {
    small:  "/images/erudit/measures/weight-small.png",
    medium: "/images/erudit/measures/weight-medium.png",
    large:  "/images/erudit/measures/weight-large.png"
  }
};

const CONFIG = {
  counts: [5, 10, 20],
  defaultCount: 10,
  correctMessages: ["Верно! 👍", "Отлично! ⭐", "Правильно! 😊", "Так держать! 💪"]
};

const state = {
  settings: { count: CONFIG.defaultCount },
  questions: [],
  index: 0,
  firstTryCorrect: 0,
  streak: 0,
  bestStreak: 0,
  currentMistakes: 0,
  currentResolved: false,
  mistakes: [],
  finished: false,
  selectedLeftOption: null,
  typeStats: {
    length: { total: 0, firstTry: 0 },
    mass: { total: 0, firstTry: 0 }
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

init();

function init() {
  renderSettings();
  updateSelectionSummary();
  bindActions();
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

    const massOption = event.target.closest("[data-mass-option]");
    if (massOption) {
      selectMassOption(Number(massOption.dataset.massOption));
      return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    if (action === "start") startTraining();
    else if (action === "stop") finishTraining();
    else if (action === "next") nextQuestion();
    else if (action === "check-length") checkLengthAnswer();
    else if (action === "check-scales") checkMassAnswer();
    else if (action === "restart") startTraining();
    else if (action === "settings") showScreen("settings");
    else if (action === "retry-mistakes") startMistakeReview();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    if (!$('[data-screen="training"]')?.classList.contains("is-active")) return;

    const nextWrap = $('[data-role="next-wrap"]');
    if (nextWrap && !nextWrap.hidden) {
      nextQuestion();
      return;
    }

    const input = $('[data-role="length-input"]');
    if (input && !input.disabled) checkLengthAnswer();
  });
}

function renderSettings() {
  $('[data-role="count-picker"]').innerHTML = CONFIG.counts.map(count => `
    <button type="button" class="choice-card ${state.settings.count === count ? "is-selected" : ""}" data-count="${count}">
      ${count}
    </button>
  `).join("");
}

function updateSelectionSummary() {
  $('[data-role="selection-summary"]').textContent =
    `${state.settings.count} случайных заданий · длина и масса вперемешку`;
}

function startTraining() {
  resetRun();
  state.questions = buildMixedQuestions(state.settings.count);
  showScreen("training");
  renderQuestion();
}

function resetRun() {
  state.index = 0;
  state.firstTryCorrect = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.currentMistakes = 0;
  state.currentResolved = false;
  state.mistakes = [];
  state.finished = false;
  state.selectedLeftOption = null;
  state.typeStats = {
    length: { total: 0, firstTry: 0 },
    mass: { total: 0, firstTry: 0 }
  };
}

/* ========================= СМЕШИВАНИЕ ========================= */

function buildMixedQuestions(count) {
  const result = [];
  let lengthCount = Math.floor(count / 2);
  let massCount = Math.floor(count / 2);

  if (count % 2) {
    if (Math.random() < 0.5) lengthCount++;
    else massCount++;
  }

  for (let i = 0; i < lengthCount; i++) result.push(generateLengthQuestion());
  for (let i = 0; i < massCount; i++) result.push(generateMassQuestion());

  return shuffle(result);
}

/* ========================= ДЛИНА ========================= */

const LENGTH_GENERATORS = [
  () => {
    const m = randomInt(1, 9);
    const cm = randomStep(10, 90, 10);
    return {
      prompt: `${m} м ${cm} см = ? см`,
      answer: m * 100 + cm,
      unit: "см",
      solution: `${m} м = ${m * 100} см; ${m * 100} + ${cm} = ${m * 100 + cm} см`
    };
  },
  () => {
    const dm = randomInt(1, 9);
    const cm = randomInt(1, 9);
    return {
      prompt: `${dm} дм ${cm} см = ? см`,
      answer: dm * 10 + cm,
      unit: "см",
      solution: `${dm} дм = ${dm * 10} см; ${dm * 10} + ${cm} = ${dm * 10 + cm} см`
    };
  },
  () => {
    const cm = randomInt(1, 9);
    const mm = randomInt(1, 9);
    return {
      prompt: `${cm} см ${mm} мм = ? мм`,
      answer: cm * 10 + mm,
      unit: "мм",
      solution: `${cm} см = ${cm * 10} мм; ${cm * 10} + ${mm} = ${cm * 10 + mm} мм`
    };
  },
  () => {
    const km = randomInt(1, 5);
    const m = randomStep(100, 900, 100);
    return {
      prompt: `${km} км ${m} м = ? м`,
      answer: km * 1000 + m,
      unit: "м",
      solution: `${km} км = ${km * 1000} м; ${km * 1000} + ${m} = ${km * 1000 + m} м`
    };
  },
  () => {
    const m = randomInt(2, 9);
    return { prompt: `${m * 100} см = ? м`, answer: m, unit: "м", solution: `${m * 100} : 100 = ${m} м` };
  },
  () => {
    const m = randomInt(2, 9);
    return { prompt: `${m * 10} дм = ? м`, answer: m, unit: "м", solution: `${m * 10} : 10 = ${m} м` };
  },
  () => {
    const cm = randomInt(2, 9);
    return { prompt: `${cm * 10} мм = ? см`, answer: cm, unit: "см", solution: `${cm * 10} : 10 = ${cm} см` };
  },
  () => {
    const km = randomInt(2, 5);
    return { prompt: `${km * 1000} м = ? км`, answer: km, unit: "км", solution: `${km * 1000} : 1000 = ${km} км` };
  },
  () => {
    const m = randomInt(1, 5);
    return { prompt: `${m} м = ? мм`, answer: m * 1000, unit: "мм", solution: `1 м = 1000 мм; ${m} · 1000 = ${m * 1000} мм` };
  }
];

function generateLengthQuestion() {
  return { id: createId(), type: "length", ...randomItem(LENGTH_GENERATORS)() };
}

/* ========================= МАССА / ОДИН ГРУЗ ========================= */

function generateMassQuestion() {
  const kg = randomInt(1, 5);
  const fixedUnit = Math.random() < 0.5 ? "kg" : "g";
  const answerUnit = fixedUnit === "kg" ? "g" : "kg";

  const fixed = {
    grams: kg * 1000,
    label: fixedUnit === "kg" ? `${kg} кг` : `${kg * 1000} г`,
    size: sizeForMass(kg * 1000)
  };

  const correctValue = answerUnit === "kg" ? kg : kg * 1000;
  const values = makeMassOptions(kg, answerUnit);

  return {
    id: createId(),
    type: "mass",
    fixed,
    answerUnit,
    correctValue,
    options: values.map(value => ({
      value,
      grams: answerUnit === "kg" ? value * 1000 : value,
      label: `${value} ${answerUnit === "kg" ? "кг" : "г"}`,
      size: sizeForMass(answerUnit === "kg" ? value * 1000 : value)
    }))
  };
}

function makeMassOptions(correctKg, answerUnit) {
  const candidatesKg = new Set([correctKg]);

  const nearby = shuffle([
    correctKg - 2,
    correctKg - 1,
    correctKg + 1,
    correctKg + 2,
    correctKg + 3
  ].filter(value => value >= 1 && value <= 7));

  for (const value of nearby) {
    candidatesKg.add(value);
    if (candidatesKg.size === 4) break;
  }

  while (candidatesKg.size < 4) candidatesKg.add(randomInt(1, 7));

  const kgValues = shuffle([...candidatesKg].slice(0, 4));
  return answerUnit === "kg" ? kgValues : kgValues.map(value => value * 1000);
}

function sizeForMass(grams) {
  if (grams <= 1000) return "small";
  if (grams <= 3000) return "medium";
  return "large";
}

/* ========================= РЕНДЕР ========================= */

function renderQuestion() {
  if (state.index >= state.questions.length) {
    finishTraining();
    return;
  }

  state.currentMistakes = 0;
  state.currentResolved = false;
  state.selectedLeftOption = null;

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

  const q = state.questions[state.index];
  if (q.type === "length") renderLengthQuestion(q);
  else renderMassQuestion(q);

  updateHud();
  renderProgress();
}

function renderLengthQuestion(q) {
  $('[data-role="exercise-label"]').textContent = "Меры длины";
  $('[data-role="task-text"]').textContent = q.prompt;
  $('[data-role="visual"]').innerHTML = "";

  $('[data-role="answer-area"]').innerHTML = `
    <div class="measures-number-answer">
      <input data-role="length-input" type="number" min="0" inputmode="numeric" autocomplete="off" aria-label="Введите ответ">
      <span class="measures-answer-unit">${q.unit}</span>
      <button class="trainer-btn trainer-btn--primary" type="button" data-action="check-length">Проверить</button>
    </div>
  `;

  requestAnimationFrame(() => $('[data-role="length-input"]')?.focus());
}

function renderMassQuestion(q) {
  $('[data-role="exercise-label"]').textContent = "Меры массы";
  $('[data-role="task-text"]').textContent =
    `Какой груз равен ${q.fixed.label}? Выбери один груз для левой чаши.`;

  $('[data-role="answer-area"]').innerHTML = `
    <div class="weight-picker">
      ${q.options.map(option => `
        <button type="button" class="weight-choice" data-mass-option="${option.value}">
          ${option.label}
        </button>
      `).join("")}
    </div>

    <div class="weight-picker-actions">
      <button type="button" class="trainer-btn trainer-btn--primary" data-action="check-scales" disabled>
        Проверить
      </button>
    </div>
  `;

  renderScale(q);
}

function selectMassOption(value) {
  if (state.currentResolved) return;

  const q = state.questions[state.index];
  if (!q || q.type !== "mass") return;

  state.selectedLeftOption = q.options.find(option => option.value === value) || null;

  $$('[data-mass-option]').forEach(button => {
    button.classList.toggle("is-selected", Number(button.dataset.massOption) === value);
  });

  const checkButton = $('[data-action="check-scales"]');
  if (checkButton) checkButton.disabled = !state.selectedLeftOption;

  renderScale(q);
}

function renderScale(q) {
  const leftGrams = state.selectedLeftOption?.grams ?? 0;
  const rightGrams = q.fixed.grams;
  const scaleState = getScaleState(leftGrams, rightGrams);
  const layout = SCALE_LAYOUT[scaleState];

  const leftWeight = state.selectedLeftOption
    ? renderSingleWeight(state.selectedLeftOption, layout.left, "left")
    : "";

  const rightWeight = renderSingleWeight(q.fixed, layout.right, "right");

  $('[data-role="visual"]').innerHTML = `
    <div class="scales-stage">
      <img class="scales-background" src="${ASSETS.backgrounds[scaleState]}" alt="Весы">
      <div class="scales-status">${scaleStatusText(scaleState)}</div>
      ${leftWeight}
      ${rightWeight}
    </div>
  `;
}

function renderSingleWeight(weight, position, side) {
  const visual = SCALE_LAYOUT.weights[weight.size];
  const image = ASSETS.weights[weight.size];

  return `
    <div class="scales-weight-stack scales-weight-stack--${side}" style="left:${position.x}%; top:${position.y}%;">
      <div class="scales-weight" style="width:${visual.width * visual.scale}px;">
        <img src="${image}" alt="${weight.label}" style="width:100%;display:block;">
        <span class="scales-weight-label">${weight.label}</span>
      </div>
    </div>
  `;
}

function getScaleState(leftGrams, rightGrams) {
  if (leftGrams > rightGrams) return "leftHeavy";
  if (leftGrams < rightGrams) return "rightHeavy";
  return "balanced";
}

function scaleStatusText(stateName) {
  if (stateName === "leftHeavy") return "Левая чаша тяжелее";
  if (stateName === "rightHeavy") return "Правая чаша тяжелее";
  return "Весы уравновешены";
}

/* ========================= ПРОВЕРКА ========================= */

function checkLengthAnswer() {
  if (state.currentResolved) return;

  const q = state.questions[state.index];
  const input = $('[data-role="length-input"]');
  if (!q || q.type !== "length" || !input || input.value.trim() === "") return;

  const value = Number(input.value);
  if (!Number.isFinite(value)) return;

  if (value === q.answer) {
    input.classList.add("is-correct");
    resolveCorrect(q);
  } else {
    input.classList.add("is-wrong");
    setTimeout(() => input.classList.remove("is-wrong"), 350);
    handleWrong(q);
  }
}

function checkMassAnswer() {
  if (state.currentResolved) return;

  const q = state.questions[state.index];
  if (!q || q.type !== "mass" || !state.selectedLeftOption) return;

  if (state.selectedLeftOption.grams === q.fixed.grams) {
    resolveCorrect(q);
  } else {
    handleWrong(q);
  }
}

function resolveCorrect(q) {
  state.currentResolved = true;
  const firstTry = state.currentMistakes === 0;

  state.typeStats[q.type].total++;

  if (firstTry) {
    state.firstTryCorrect++;
    state.typeStats[q.type].firstTry++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
  }

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = randomItem(CONFIG.correctMessages);
  feedback.className = "feedback is-good";

  if (q.type === "length") {
    const input = $('[data-role="length-input"]');
    const button = $('[data-action="check-length"]');
    if (input) input.disabled = true;
    if (button) button.disabled = true;
  } else {
    // Правильный эквивалент => одинаковая масса => balanced.
    renderScale(q);
    $$('[data-mass-option], [data-action="check-scales"]').forEach(el => el.disabled = true);
  }

  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;
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

  if (q.type === "mass") {
    const selected = state.selectedLeftOption;
    if (!selected) return;

    if (selected.grams < q.fixed.grams) {
      feedback.textContent = "Этот груз легче. Посмотри, какая чаша опустилась.";
    } else {
      feedback.textContent = "Этот груз тяжелее. Посмотри, какая чаша опустилась.";
    }

    if (state.currentMistakes >= 2) {
      hint.hidden = false;
      hint.textContent = "Вспомни: 1 кг = 1000 г.";
    }
    return;
  }

  feedback.textContent = "Проверь единицы измерения и попробуй ещё раз.";

  if (state.currentMistakes >= 2) {
    hint.hidden = false;
    hint.textContent = lengthHint(q);
  }

  if (state.currentMistakes >= 3) {
    state.currentResolved = true;
    state.typeStats.length.total++;

    const input = $('[data-role="length-input"]');
    if (input) {
      input.value = q.answer;
      input.classList.add("is-correct");
      input.disabled = true;
    }

    const button = $('[data-action="check-length"]');
    if (button) button.disabled = true;

    feedback.textContent = `Правильный ответ: ${q.answer} ${q.unit}.`;
    showSolution(q);
    $('[data-role="next-wrap"]').hidden = false;
  }
}

function lengthHint(q) {
  if (q.unit === "мм") return "1 см = 10 мм, 1 м = 1000 мм.";
  if (q.unit === "см") return "1 дм = 10 см, 1 м = 100 см.";
  if (q.unit === "м") return "10 дм = 1 м, 100 см = 1 м, 1000 м = 1 км.";
  return "1000 м = 1 км.";
}

function showSolution(q) {
  const solution = $('[data-role="solution"]');

  if (q.type === "length") {
    solution.innerHTML = `
      <h3>Проверим</h3>
      <p class="equation">${q.solution}</p>
      <p>Ответ: ${q.answer} ${q.unit}.</p>
    `;
  } else {
    solution.innerHTML = `
      <h3>Весы уравновешены</h3>
      <p class="equation">${state.selectedLeftOption.label} = ${q.fixed.label}</p>
      <p>1 кг = 1000 г.</p>
    `;
  }

  solution.hidden = false;
}

function nextQuestion() {
  if (!state.currentResolved) return;
  state.index++;
  renderQuestion();
}

/* ========================= HUD / РЕЗУЛЬТАТ ========================= */

function updateHud() {
  const total = state.questions.length;
  $('[data-role="question-counter"]').textContent = `${Math.min(state.index + 1, total)} из ${total}`;
  $('[data-role="score-counter"]').textContent = state.firstTryCorrect;
  $('[data-role="streak-counter"]').textContent = state.streak;
}

function renderProgress() {
  const total = state.questions.length;
  let result = "";
  for (let i = 0; i < total; i++) {
    if (i < state.index) result += "😊";
    else if (i === state.index) result += "🙂";
    else result += "⚪";
  }
  $('[data-role="emoji-progress"]').textContent = result;
}

function finishTraining() {
  if (state.finished) return;
  state.finished = true;

  const completed = Math.min(state.index + (state.currentResolved ? 1 : 0), state.questions.length);
  const accuracy = completed ? Math.round(state.firstTryCorrect / completed * 100) : 0;

  $('[data-role="result-score"]').textContent = `${state.firstTryCorrect} из ${completed}`;
  $('[data-role="result-accuracy"]').textContent = `${accuracy}%`;
  $('[data-role="result-streak"]').textContent = state.bestStreak;

  let title = "Продолжай тренироваться!";
  let emoji = "💪";
  let message = "Повтори соотношения единиц длины и массы.";

  if (accuracy >= 90) {
    title = "Отличный результат!";
    emoji = "🎉";
    message = "Ты уверенно работаешь с мерами длины и массы.";
  } else if (accuracy >= 70) {
    title = "Хорошая работа!";
    emoji = "😊";
    message = "Ещё немного практики — и переводы будут получаться быстрее.";
  }

  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = message;

  renderBreakdown();
  renderReview();
  $('[data-action="retry-mistakes"]').disabled = state.mistakes.length === 0;
  showScreen("result");
}

function renderBreakdown() {
  const length = state.typeStats.length;
  const mass = state.typeStats.mass;
  $('[data-role="breakdown"]').innerHTML = `
    <div class="measures-breakdown-item"><span>Длина</span><strong>${length.firstTry} из ${length.total}</strong></div>
    <div class="measures-breakdown-item"><span>Масса</span><strong>${mass.firstTry} из ${mass.total}</strong></div>
  `;
}

function renderReview() {
  const list = $('[data-role="review-list"]');
  if (!state.mistakes.length) {
    list.innerHTML = '<p class="review-empty">Ошибок нет — всё решено с первой попытки! ✅</p>';
    return;
  }

  list.innerHTML = state.mistakes.map(q => `
    <span class="review-chip">
      ${q.type === "length" ? q.prompt : `Весы: ${q.fixed.label} = ? ${q.answerUnit === "kg" ? "кг" : "г"}`}
    </span>
  `).join("");
}

function startMistakeReview() {
  if (!state.mistakes.length) return;

  const questions = state.mistakes.map(q => ({ ...structuredClone(q), id: createId() }));
  resetRun();
  state.questions = shuffle(questions);
  showScreen("training");
  renderQuestion();
}

/* ========================= УТИЛИТЫ ========================= */

function showScreen(name) {
  $$(".trainer-screen").forEach(screen => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStep(min, max, step) {
  return min + randomInt(0, Math.floor((max - min) / step)) * step;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
