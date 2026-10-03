"use strict";

/*
 * Тренажёр ВПР: площадь и периметр фигур на клетчатом поле.
 *
 * Главное:
 * - ребёнок НЕ выбирает "площадь" или "периметр";
 * - тип задания выбирается случайно для каждого вопроса;
 * - фигура может быть прямоугольником или простым ортогональным многоугольником;
 * - клетка = 1 см × 1 см;
 * - рисунок строится прямо в SVG, никаких графических ассетов не нужно.
 */

const CONFIG = {
  counts: [5, 10, 20],
  defaultCount: 10,

  // Вероятность появления прямоугольника.
  // Остальные задания — простые многоугольники по клеткам.
  rectangleChance: 0.38,

  feedback: {
    correct: [
      "Верно! 👍",
      "Отлично! ⭐",
      "Правильно! 😊",
      "Так держать! 💪"
    ],
    retry: "Проверь условие и попробуй ещё раз.",
    secondTry: "Обрати внимание: что именно нужно найти — площадь или периметр?"
  },

  storageKey: "dobrynya-erudit-area-perimeter-stats-v1"
};

/*
 * Шаблоны многоугольников.
 *
 * Все координаты заданы в клетках.
 * Фигуры:
 * - без диагоналей;
 * - без самопересечений;
 * - умеренной сложности для 4 класса.
 *
 * Часть шаблонов похожа на реальные задания ВПР:
 * ступеньки, Г-образные фигуры, один прямоугольный вырез,
 * простой "крестик".
 */
const POLYGON_TEMPLATES = [
  {
    id: "L-small",
    points: [[0,0],[4,0],[4,2],[2,2],[2,4],[0,4]]
  },
  {
    id: "L-wide",
    points: [[0,0],[5,0],[5,3],[2,3],[2,5],[0,5]]
  },
  {
    id: "step-1",
    points: [[0,0],[4,0],[4,1],[6,1],[6,4],[2,4],[2,3],[0,3]]
  },
  {
    id: "step-2",
    points: [[0,0],[3,0],[3,2],[5,2],[5,5],[1,5],[1,3],[0,3]]
  },
  {
    id: "notch-top",
    points: [[0,0],[2,0],[2,1],[3,1],[3,0],[5,0],[5,4],[3,4],[3,3],[2,3],[2,4],[0,4]]
  },
  {
    id: "notch-side",
    points: [[0,0],[5,0],[5,5],[3,5],[3,3],[2,3],[2,5],[0,5]]
  },
  {
    id: "cross",
    points: [[1,0],[3,0],[3,1],[4,1],[4,3],[3,3],[3,4],[1,4],[1,3],[0,3],[0,1],[1,1]]
  },
  {
    id: "chair",
    points: [[0,0],[4,0],[4,2],[6,2],[6,4],[2,4],[2,2],[0,2]]
  },
  {
    id: "stair",
    points: [[0,0],[3,0],[3,1],[4,1],[4,2],[5,2],[5,4],[2,4],[2,3],[1,3],[1,2],[0,2]]
  }
];

const state = {
  settings: {
    count: CONFIG.defaultCount
  },

  questions: [],
  index: 0,

  // "Без ошибок" — сколько заданий решено с первой попытки.
  firstTryCorrect: 0,

  attempts: 0,
  streak: 0,
  bestStreak: 0,

  currentMistakes: 0,
  currentResolved: false,

  mistakes: [],
  finished: false,
  reviewMode: false,

  // Для итоговой разбивки.
  typeStats: {
    area: { total: 0, firstTry: 0 },
    perimeter: { total: 0, firstTry: 0 }
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function init() {
  renderSettings();
  bindActions();
  updateSelectionSummary();
}

function renderSettings() {
  const picker = $('[data-role="count-picker"]');

  picker.innerHTML = CONFIG.counts.map(count => `
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
  $('[data-role="selection-summary"]').textContent =
    `${state.settings.count} случайных заданий · площадь и периметр вперемешку`;
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
    if (action === "check-input") return checkInputAnswer();
    if (action === "restart") return startTraining();
    if (action === "settings") return showScreen("settings");
    if (action === "retry-mistakes") return startMistakeReview();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    if (!$('[data-screen="training"]')?.classList.contains("is-active")) return;

    // Если уже показано решение — Enter переводит к следующему вопросу.
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
    () => generateQuestion()
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

  state.typeStats = {
    area: { total: 0, firstTry: 0 },
    perimeter: { total: 0, firstTry: 0 }
  };
}

/* =========================================================
   ГЕНЕРАЦИЯ ЗАДАНИЙ
   ========================================================= */

function generateQuestion() {
  const type = Math.random() < 0.5 ? "area" : "perimeter";
  const useRectangle = Math.random() < CONFIG.rectangleChance;

  let shape;

  if (useRectangle) {
    shape = generateRectangle();
  } else {
    shape = generatePolygon();
  }

  const area = polygonArea(shape.points);
  const perimeter = polygonPerimeter(shape.points);

  return {
    id: createId(),
    type,
    shapeKind: shape.kind,
    shapeName: shape.name,
    points: shape.points,
    area,
    perimeter,
    answer: type === "area" ? area : perimeter
  };
}

function generateRectangle() {
  const width = randomInt(3, 8);
  const height = randomInt(2, 6);

  return {
    kind: "rectangle",
    name: "прямоугольник",
    points: [[0,0],[width,0],[width,height],[0,height]]
  };
}

function generatePolygon() {
  const template = structuredClone(randomItem(POLYGON_TEMPLATES));

  let points = template.points.map(([x, y]) => [x, y]);

  // Зеркалим фигуру, чтобы один шаблон выглядел по-разному.
  if (Math.random() < 0.5) points = mirrorX(points);
  if (Math.random() < 0.5) points = mirrorY(points);

  // Иногда меняем оси местами.
  if (Math.random() < 0.5) points = points.map(([x, y]) => [y, x]);

  points = normalizePoints(points);

  return {
    kind: "polygon",
    name: "фигура",
    points
  };
}

function mirrorX(points) {
  const maxX = Math.max(...points.map(([x]) => x));
  return points.map(([x, y]) => [maxX - x, y]);
}

function mirrorY(points) {
  const maxY = Math.max(...points.map(([, y]) => y));
  return points.map(([x, y]) => [x, maxY - y]);
}

function normalizePoints(points) {
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));

  return points.map(([x, y]) => [x - minX, y - minY]);
}

/* =========================================================
   МАТЕМАТИКА ФИГУРЫ
   ========================================================= */

function polygonArea(points) {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    sum += x1 * y2 - x2 * y1;
  }

  return Math.abs(sum) / 2;
}

function polygonPerimeter(points) {
  let perimeter = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    // Все фигуры ортогональные, поэтому длина ребра —
    // количество клеток по горизонтали или вертикали.
    perimeter += Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  return perimeter;
}

function sideLengths(points) {
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];

    return Math.abs(next[0] - point[0]) +
           Math.abs(next[1] - point[1]);
  });
}

/* =========================================================
   РЕНДЕР ВОПРОСА
   ========================================================= */

function renderQuestion() {
  if (state.index >= state.questions.length) {
    finishTraining();
    return;
  }

  state.currentMistakes = 0;
  state.currentResolved = false;

  const q = state.questions[state.index];

  $('[data-role="task-text"]').textContent = taskText(q);
  $('[data-role="figure-wrap"]').innerHTML = createFigureSvg(q.points);

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

function taskText(q) {
  const objectText =
    q.shapeKind === "rectangle"
      ? "прямоугольник"
      : "фигура";

  if (q.type === "area") {
    return `На клетчатом поле со стороной клетки 1 см изображена фигура. Найди площадь этой фигуры.`;
  }

  return `На клетчатом поле со стороной клетки 1 см изображена фигура. Найди периметр этой фигуры.`;
}

function createFigureSvg(points) {
  const cell = 38;
  const marginCells = 2;

  const maxX = Math.max(...points.map(([x]) => x));
  const maxY = Math.max(...points.map(([, y]) => y));

  const gridCols = Math.max(8, maxX + marginCells * 2);
  const gridRows = Math.max(6, maxY + marginCells * 2);

  const width = gridCols * cell;
  const height = gridRows * cell;

  const offsetX = Math.floor((gridCols - maxX) / 2) * cell;
  const offsetY = Math.floor((gridRows - maxY) / 2) * cell;

  const pathPoints = points
    .map(([x, y]) => `${offsetX + x * cell},${offsetY + y * cell}`)
    .join(" ");

  let grid = "";

  for (let x = 0; x <= width; x += cell) {
    grid += `<line class="ap-grid-line" x1="${x}" y1="0" x2="${x}" y2="${height}"></line>`;
  }

  for (let y = 0; y <= height; y += cell) {
    grid += `<line class="ap-grid-line" x1="0" y1="${y}" x2="${width}" y2="${y}"></line>`;
  }

  // Подпись "1 см" располагаем на одной клетке в свободной верхней зоне.
  const markX1 = cell;
  const markX2 = cell * 2;
  const markY = cell * 1.25;

  return `
    <svg
      class="ap-grid-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Фигура на клетчатом поле. Сторона клетки 1 сантиметр."
    >
      <rect class="ap-grid-bg" x="0" y="0" width="${width}" height="${height}"></rect>

      <g aria-hidden="true">
        ${grid}
      </g>

      <polyline
        class="ap-shape"
        points="${pathPoints} ${offsetX + points[0][0] * cell},${offsetY + points[0][1] * cell}"
      ></polyline>

      <line
        class="ap-unit-mark"
        x1="${markX1}" y1="${markY}"
        x2="${markX2}" y2="${markY}"
      ></line>

      <text
        class="ap-unit-text"
        x="${markX1 + cell / 2}"
        y="${markY - 7}"
        text-anchor="middle"
      >1 см</text>
    </svg>
  `;
}

function renderAnswerArea(q) {
  const unit = q.type === "area" ? "см²" : "см";

  $('[data-role="answer-area"]').innerHTML = `
    <div class="ap-answer-line">
      <span class="ap-answer-label">Ответ:</span>

      <input
        data-role="answer-input"
        type="number"
        min="0"
        inputmode="numeric"
        autocomplete="off"
        aria-label="Введите ответ"
      >

      <span class="ap-answer-unit">${unit}</span>

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

  setTimeout(() => {
    input.classList.remove("is-wrong");
  }, 360);

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

  state.typeStats[q.type].total++;

  if (firstTry) {
    state.typeStats[q.type].firstTry++;
  }

  const feedback = $('[data-role="feedback"]');
  feedback.textContent = randomItem(CONFIG.feedback.correct);
  feedback.className = "feedback is-good";

  disableAnswer();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(q.type, firstTry);
  updateHud();
}

function handleWrong(q) {
  state.currentMistakes++;
  state.streak = 0;

  // Сохраняем вопрос только один раз.
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
    hint.innerHTML = hintText(q);
    return;
  }

  // После третьей ошибки показываем правильный ответ и решение.
  feedback.textContent = `Правильный ответ: ${q.answer} ${q.type === "area" ? "см²" : "см"}.`;

  hint.hidden = false;
  hint.innerHTML = hintText(q);

  state.currentResolved = true;
  state.typeStats[q.type].total++;

  disableAnswer();
  showSolution(q);
  $('[data-role="next-wrap"]').hidden = false;

  recordStat(q.type, false);
  updateHud();
}

function hintText(q) {
  if (q.type === "area") {
    if (q.shapeKind === "rectangle") {
      const dims = rectangleDimensions(q.points);

      return `
        <strong>Подсказка.</strong>
        Вспомни формулу площади прямоугольника:
        длину нужно умножить на ширину.
        На рисунке стороны равны ${dims.width} см и ${dims.height} см.
      `;
    }

    return `
      <strong>Подсказка.</strong>
      Нужно найти <em>площадь</em>.
      Каждая целая клетка внутри фигуры имеет площадь 1 см².
      Можно посчитать клетки или мысленно разделить фигуру на несколько прямоугольников.
    `;
  }

  return `
    <strong>Подсказка.</strong>
    Нужно найти <em>периметр</em>.
    Иди по контуру фигуры и сложи длины всех её сторон.
    Одна сторона клетки равна 1 см.
  `;
}

function showSolution(q) {
  const solution = $('[data-role="solution"]');

  solution.innerHTML = solutionHtml(q);
  solution.hidden = false;
}

function solutionHtml(q) {
  if (q.type === "area") {
    if (q.shapeKind === "rectangle") {
      const dims = rectangleDimensions(q.points);

      return `
        <h3>Как можно записать решение</h3>
        <p class="ap-equation">
          ${dims.width} × ${dims.height} = ${q.area} (см²)
        </p>
        <p>Ответ: ${q.area} см².</p>
      `;
    }

    return `
      <h3>Как можно проверить решение</h3>
      <p>
        Посчитай все клетки внутри фигуры.
        Каждая клетка — это 1 см².
      </p>
      <p class="ap-equation">
        Площадь фигуры = ${q.area} см².
      </p>
      <p>Ответ: ${q.area} см².</p>
    `;
  }

  const sides = sideLengths(q.points);
  const expression = sides.join(" + ");

  return `
    <h3>Как можно записать решение</h3>
    <p>
      Складываем длины всех сторон по контуру фигуры:
    </p>
    <p class="ap-equation">
      ${expression} = ${q.perimeter} (см)
    </p>
    <p>Ответ: ${q.perimeter} см.</p>
  `;
}

function rectangleDimensions(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);

  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
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
   HUD И ПРОГРЕСС
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
  let result = "";

  for (let i = 0; i < total; i++) {
    if (i < state.index) {
      result += "😊";
    } else if (i === state.index) {
      result += "🙂";
    } else {
      result += "⚪";
    }
  }

  $('[data-role="emoji-progress"]').textContent = result;
}

/* =========================================================
   РЕЗУЛЬТАТЫ
   ========================================================= */

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
  let message = "Главное — внимательно читать, что требуется найти.";

  if (accuracy >= 90) {
    title = "Отличный результат!";
    emoji = "🎉";
    message = "Ты уверенно различаешь площадь и периметр.";
  } else if (accuracy >= 70) {
    title = "Хорошая работа!";
    emoji = "😊";
    message = "Ещё немного практики — и задания будут решаться увереннее.";
  }

  $('[data-role="result-title"]').textContent = title;
  $('[data-role="result-emoji"]').textContent = emoji;
  $('[data-role="result-message"]').textContent = message;

  renderBreakdown();
  renderReview();

  const retry = $('[data-action="retry-mistakes"]');
  retry.disabled = state.mistakes.length === 0;

  showScreen("result");
}

function renderBreakdown() {
  const area = state.typeStats.area;
  const perimeter = state.typeStats.perimeter;

  $('[data-role="breakdown"]').innerHTML = `
    <div class="ap-breakdown-item">
      <span>Площадь</span>
      <strong>${area.firstTry} из ${area.total}</strong>
    </div>

    <div class="ap-breakdown-item">
      <span>Периметр</span>
      <strong>${perimeter.firstTry} из ${perimeter.total}</strong>
    </div>
  `;
}

function renderReview() {
  const list = $('[data-role="review-list"]');

  if (!state.mistakes.length) {
    list.innerHTML = `
      <p class="review-empty">
        Ошибок нет — всё решено с первой попытки! ✅
      </p>
    `;
    return;
  }

  list.innerHTML = state.mistakes.map(q => `
    <span class="review-chip">
      ${q.type === "area" ? "Площадь" : "Периметр"} ·
      ${q.shapeKind === "rectangle" ? "прямоугольник" : "фигура"}
    </span>
  `).join("");
}

function startMistakeReview() {
  if (!state.mistakes.length) return;

  const questions = shuffle(
    state.mistakes.map(question => ({
      ...structuredClone(question),
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
  state.questions = questions;

  state.typeStats = {
    area: { total: 0, firstTry: 0 },
    perimeter: { total: 0, firstTry: 0 }
  };

  showScreen("training");
  renderQuestion();
}

/* =========================================================
   СТАТИСТИКА
   ========================================================= */

function recordStat(type, firstTry) {
  let stats = {};

  try {
    stats = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
  } catch {
    stats = {};
  }

  if (!stats[type]) {
    stats[type] = {
      firstTry: 0,
      withMistakes: 0
    };
  }

  if (firstTry) {
    stats[type].firstTry++;
  } else {
    stats[type].withMistakes++;
  }

  localStorage.setItem(CONFIG.storageKey, JSON.stringify(stats));
}

/* =========================================================
   УТИЛИТЫ
   ========================================================= */

function showScreen(name) {
  $$(".trainer-screen").forEach(screen => {
    screen.classList.toggle(
      "is-active",
      screen.dataset.screen === name
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
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
