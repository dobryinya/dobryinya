// ===== КОНФИГУРАЦИЯ: оформление маршрута, тексты и звуки =====
const MOUNTAIN_CONFIG = {
  storageKey: "dobrynya-achievement-mountain-class-v3",
  classSizeStorageKey: "dobrynya-achievement-mountain-class-size-v1",
  messageDeckStorageKey: "dobrynya-achievement-mountain-class-messages-v2",
  defaultClassSize: 25,
  minClassSize: 1,
  maxClassSize: 40,
  soundEnabledByDefault: true,
  paths: {
    dobrynya: "/images/fav.png",
    landscape: "/images/reflexes/achievement-mountain/mountain-landscape.png",
    sounds: {
      select: "/sounds/1.mp3",
      move: "/sounds/ruhthrow.mp3",
      summit: "/sounds/taiga-win.mp3"
    }
  },
  volumes: { select: 0.3, move: 0.28, summit: 0.38 },
  // Координаты контрольных точек тропы: от подножия до вершины, в процентах.
  route: [
    // Контрольные точки центра тропы на mountain-landscape.png; путь идёт от подножия к вершине.
    { left: 70, top: 84 }, { left: 72, top: 81 }, { left: 69, top: 78 },
    { left: 63, top: 75 }, { left: 58, top: 72 }, { left: 50, top: 70 },
    { left: 42, top: 68 }, { left: 40, top: 66 }, { left: 35.5, top: 64 },
    { left: 35, top: 62 }, { left: 37, top: 60 }, { left: 37.5, top: 58 },
    { left: 41, top: 56 }, { left: 48.5, top: 54 }, { left: 54.5, top: 52 },
    { left: 58.5, top: 50 }, { left: 62.5, top: 48 }, { left: 64.5, top: 46 },
    { left: 63.5, top: 44 }, { left: 60, top: 42 }, { left: 57, top: 40 },
    { left: 54.5, top: 38 }, { left: 51, top: 36 }, { left: 48, top: 34 },
    { left: 48.3, top: 32 }, { left: 49.7, top: 30 }, { left: 51.4, top: 28 },
    { left: 53, top: 26 }, { left: 54.4, top: 24 }, { left: 55.6, top: 22 },
    { left: 55.9, top: 20 }, { left: 55.8, top: 18 }, { left: 55.4, top: 16 },
    { left: 55.2, top: 14 }, { left: 53, top: 12.5 }
  ],
  marker: { size: 34, offsetX: 0.5, offsetY: 0, rotationDegrees: 12 },
  climber: { size: 68, offsetX: 0, offsetY: 2 },
  stages: [
    {
      id: "tried", title: "Я попробовал", shortTitle: "Попробовали",
      description: "Включился в работу и сделал первый шаг.",
      flag: "/images/reflexes/achievement-mountain/flag-tried.png",
      summary: "Наш класс сделал ещё один шаг вперёд.",
      prompt: "Что помогло тебе начать работу?",
      messages: [
        "Ты включился в работу — теперь у нашего класса на один шаг больше.",
        "С любой вершины начинают с первого шага. Сегодня ты его сделал.",
        "Попытка тоже даёт опыт. Этот шаг приближает класс к вершине.",
        "Ты не остался в стороне и попробовал. Это важно для общего пути.",
        "Начать бывает непросто, но ты включился в работу.",
        "Сегодня ты проверил свои силы и получил новый опыт.",
        "Даже если пока не всё ясно, попытка помогает найти направление.",
        "Ты сделал посильный шаг. Так и складывается общий результат.",
        "Хорошо, что ты дал себе возможность попробовать.",
        "Первый шаг сделан — продолжаем восхождение вместе.",
        "Сегодня ты начал разбираться в задании. Это уже движение вперёд.",
        "Попробовать — значит открыть себе путь к новому умению.",
        "Твой вклад добавил ещё один шаг на общей тропе.",
        "Ты проверил один из способов. Этот опыт пригодится дальше.",
        "Не требуется сразу всё уметь. Важно начать и продолжать.",
        "Ты сделал первый шаг к результату — отметим его на горе.",
        "Сегодня ты попробовал действовать самостоятельно. Это ценный опыт.",
        "Каждая попытка помогает понять, что делать дальше.",
        "Ты включился в общее дело. Наш класс поднимается шаг за шагом.",
        "Попробовал — значит уже продвинулся дальше, чем в начале.",
        "Ты не побоялся нового задания и начал с того, что было понятно.",
        "Этот шаг может показаться небольшим, но он часть общего пути.",
        "Ты дал себе шанс научиться — хорошо, что попробовал.",
        "Первый шаг есть. Что поможет сделать следующий?",
        "Сегодняшняя попытка стала частью достижений нашего класса."
      ]
    },
    {
      id: "managed", title: "Я справился", shortTitle: "Справились",
      description: "Разобрался с заданием и довёл его до результата.",
      flag: "/images/reflexes/achievement-mountain/flag-managed.png",
      summary: "Мы добавили к общему пути ещё один результат.",
      prompt: "Какой способ помог тебе справиться?",
      messages: [
        "Ты разобрался с заданием — это ещё один шаг нашего класса к вершине.",
        "Ты смог применить знания на практике. Хорошая работа.",
        "Ты нашёл подходящий способ и довёл дело до результата.",
        "Этот успех — результат твоих действий и внимания.",
        "Ты понял, что нужно сделать, и справился с заданием.",
        "Ещё один навык стал увереннее. Общая гора растёт.",
        "Ты не только начал, но и завершил работу.",
        "Похоже, выбранный способ сработал. Запомни его.",
        "Ты смог проверить себя и увидеть результат.",
        "Сегодня ты использовал знания там, где они действительно нужны.",
        "Ты продвинулся от условия к решению — это заметный шаг.",
        "Твой опыт пополнил общий путь класса.",
        "Ты справился с тем, что требовалось сделать. Есть повод порадоваться.",
        "Ты смог применить знакомый приём в задании.",
        "Сегодняшний результат показывает, что тренировка приносит пользу.",
        "Ты заметил главное и воспользовался этим.",
        "Ты получил результат и можешь подумать, что именно помогло.",
        "Ещё одна ступенька пройдена. Продолжаем вместе.",
        "Ты работал внимательно и смог закончить задание.",
        "Сложенные вместе, такие результаты ведут весь класс к вершине.",
        "Ты нашёл решение. Попробуй сформулировать, как ты к нему пришёл.",
        "Ты можешь опереться на этот опыт в похожей задаче.",
        "Твои усилия привели к результату — отметим этот шаг.",
        "Сегодня у тебя получилось применить то, чему ты учился.",
        "Ты справился и внёс свой вклад в общее восхождение."
      ]
    },
    {
      id: "teach", title: "Я могу научить другого", shortTitle: "Могут объяснить",
      description: "Понимаю способ решения и могу его объяснить.",
      flag: "/images/reflexes/achievement-mountain/flag-teach.png",
      summary: "Умение объяснять помогает двигаться вперёд всем классом.",
      prompt: "Как бы ты объяснил свой способ однокласснику?",
      messages: [
        "Ты можешь объяснить способ другому — это помогает расти всей команде.",
        "Объяснить ход решения — значит показать, что ты понимаешь его.",
        "Твой способ может стать хорошей подсказкой для одноклассника.",
        "Когда делишься знаниями, весь класс становится сильнее.",
        "Ты понимаешь не только ответ, но и путь к нему.",
        "Попробуй объяснить решение так, чтобы другому было понятно.",
        "Умение объяснять — важное достижение и хороший вклад в команду.",
        "Ты можешь помочь не готовым ответом, а точным вопросом или подсказкой.",
        "Объясняя, ты сам лучше замечаешь важные шаги решения.",
        "Твои знания могут помочь кому-то сделать следующий шаг.",
        "Ты готов поделиться тем, что уже освоил.",
        "Общий путь складывается и из тех моментов, когда мы помогаем друг другу.",
        "Ты можешь рассказать, почему выбрал именно этот способ.",
        "Умение разложить сложное на шаги пригодится и за пределами урока.",
        "Твоя поддержка помогает одноклассникам увереннее пробовать самим.",
        "Ты можешь сравнить разные способы и объяснить свой выбор.",
        "Сегодня ты продвинулся настолько, что можешь поделиться опытом.",
        "Хорошее объяснение помогает другому найти собственный ответ.",
        "Ты заметил, что может быть непонятно, и можешь это прояснить.",
        "Такие достижения помогают всему классу идти к общей вершине.",
        "Ты можешь показать, с чего начать, а дальше дать другому попробовать.",
        "Поделиться способом решения — значит сделать знание полезным для команды.",
        "Ты можешь поддержать другого и при этом уважать его самостоятельность.",
        "Ты сумел разобраться и готов объяснить свою мысль своими словами.",
        "Твой вклад помогает другим учиться. Это хороший шаг для всего класса."
      ]
    }
  ],
  defaultMessage: "У каждого свой опыт, а вершина у нас общая. Каждый выбор приближает класс к цели.",
  defaultPrompt: "Что сегодня помогало классу учиться вместе?",
  summitMessage: "Наш класс достиг вершины! Мы собрались из разных шагов, старания и взаимной помощи."
};

// ===== ЛОГИКА ИГРЫ =====
(() => {
  "use strict";
  const cfg = MOUNTAIN_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const stageById = Object.fromEntries(cfg.stages.map(stage => [stage.id, stage]));
  const validIds = new Set(cfg.stages.map(stage => stage.id));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mountainStage = $("#mountain-stage");
  mountainStage.style.backgroundImage = `url("${cfg.paths.landscape}")`;
  let steps = [];
  let soundOn = cfg.soundEnabledByDefault;
  let lastStageId = null;
  let decks = readDecks();
  let classSize = readClassSize();

  function readClassSize() {
    try {
      const saved = Number.parseInt(localStorage.getItem(cfg.classSizeStorageKey), 10);
      if (Number.isFinite(saved)) return Math.min(cfg.maxClassSize, Math.max(cfg.minClassSize, saved));
    } catch { /* Use the configured default. */ }
    return cfg.defaultClassSize;
  }
  function saveClassSize() {
    try { localStorage.setItem(cfg.classSizeStorageKey, String(classSize)); } catch {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(cfg.storageKey) || "[]");
    if (Array.isArray(saved)) steps = saved.filter(id => validIds.has(id)).slice(0, classSize);
  } catch { /* Start with an empty class route. */ }

  function readDecks() {
    try {
      const saved = JSON.parse(localStorage.getItem(cfg.messageDeckStorageKey) || "null");
      if (saved && saved.decks && saved.last) return saved;
    } catch { /* Start with fresh messages. */ }
    return { decks: {}, last: {} };
  }
  function saveDecks() {
    try { localStorage.setItem(cfg.messageDeckStorageKey, JSON.stringify(decks)); } catch {}
  }
  function saveSteps() {
    try { localStorage.setItem(cfg.storageKey, JSON.stringify(steps)); } catch {}
  }
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function nextMessage(stage) {
    let deck = decks.decks[stage.id];
    if (!Array.isArray(deck) || deck.length === 0) {
      deck = shuffle(stage.messages);
      if (deck.length > 1 && deck[deck.length - 1] === decks.last[stage.id]) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    const message = deck.pop();
    decks.decks[stage.id] = deck;
    decks.last[stage.id] = message;
    saveDecks();
    return message;
  }
  function playSound(name) {
    if (!soundOn) return;
    const path = cfg.paths.sounds[name];
    if (!path) return;
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = cfg.volumes[name] ?? 0.3;
    audio.play().catch(error => console.warn(`[Гора достижений] Не удалось воспроизвести ${path}`, error));
  }
  function setPosition(element, point, offset = {}) {
    // Конфиг персонажа хранит offsetX / offsetY; поддерживаем также left / top.
    const offsetX = Number(offset.left ?? offset.offsetX ?? 0);
    const offsetY = Number(offset.top ?? offset.offsetY ?? 0);
    element.style.left = `${point.left + offsetX}%`;
    element.style.top = `${point.top + offsetY}%`;
  }
  function pointAtProgress(progress) {
    const anchors = cfg.route;
    const safeProgress = Math.min(1, Math.max(0, progress));
    const position = safeProgress * (anchors.length - 1);
    const index = Math.min(anchors.length - 2, Math.floor(position));
    const fraction = safeProgress === 1 ? 1 : position - index;
    const from = anchors[index];
    const to = anchors[Math.min(index + 1, anchors.length - 1)];
    return {
      left: from.left + (to.left - from.left) * fraction,
      top: from.top + (to.top - from.top) * fraction
    };
  }
  function renderRoute() {
    const markers = $("#route-markers");
    markers.replaceChildren();
    steps.forEach((id, index) => {
      const stage = stageById[id];
      // Флажок остаётся на предыдущей позиции; Добрыня движется дальше по тропе.
      const point = pointAtProgress(index / classSize);
      const marker = document.createElement("span");
      marker.className = `route-marker route-marker--${id}`;
      marker.style.left = `${point.left + cfg.marker.offsetX}%`;
      marker.style.top = `${point.top + cfg.marker.offsetY}%`;
      marker.style.setProperty("--marker-rotation", `${(index % 2 ? -1 : 1) * (4 + (index % 4) * 2)}deg`);
      const markerSize = Math.min(cfg.marker.size, Math.max(20, 760 / classSize));
      marker.style.setProperty("--marker-size", `${markerSize}px`);
      const image = document.createElement("img");
      image.src = stage.flag;
      image.alt = "";
      marker.append(image);
      markers.append(marker);
    });
    const climber = $("#climber");
    climber.style.setProperty("--climber-size", `${cfg.climber.size}px`);
    const point = steps.length ? pointAtProgress(steps.length / classSize) : cfg.route[0];
    setPosition(climber, point, cfg.climber);
    climber.classList.remove("is-climbing");
    void climber.offsetWidth;
    if (!reducedMotion && steps.length) climber.classList.add("is-climbing");
    const reachedSummit = steps.length >= classSize;
    $("#summit-marker").classList.toggle("is-reached", reachedSummit);
    const celebration = $("#summit-celebration");
    celebration.hidden = !reachedSummit;
    celebration.classList.toggle("is-visible", reachedSummit);
  }
  function renderProgress() {
    const total = steps.length;
    const count = id => steps.filter(step => step === id).length;
    $("#step-count").textContent = `${total} из ${classSize} шагов`;
    $("#progress-track").setAttribute("aria-valuemax", String(classSize));
    $("#progress-track").setAttribute("aria-valuenow", String(total));
    $("#progress-fill").style.width = `${total / classSize * 100}%`;
    $("#count-tried").textContent = count("tried");
    $("#count-managed").textContent = count("managed");
    $("#count-teach").textContent = count("teach");
    $("#progress-note").textContent = total >= classSize
      ? "Вершина достигнута всем классом!"
      : `До вершины — ещё ${classSize - total} ${pluralSteps(classSize - total)}.`;
    $("#reset-climb").disabled = total === 0;
    const sizeInput = $("#class-size");
    if (sizeInput) {
      sizeInput.value = String(classSize);
      sizeInput.disabled = total > 0;
      sizeInput.title = total > 0 ? "Чтобы изменить число учеников, сначала сбросьте восхождение." : "Укажите число учеников: столько шагов нужно для вершины.";
    }
    document.querySelectorAll("[data-stage-choice]").forEach(button => {
      button.disabled = total >= classSize;
    });
  }
  function pluralSteps(n) {
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return "шагов";
    const last = n % 10;
    if (last === 1) return "шаг";
    if (last >= 2 && last <= 4) return "шага";
    return "шагов";
  }
  function renderMessage(stage = null) {
    const total = steps.length;
    if (total >= classSize) {
      $("#encouragement-title").textContent = "Вершина покорена!";
      $("#encouragement-text").textContent = cfg.summitMessage;
      $("#prompt-title").textContent = "Наш общий результат";
      $("#prompt-text").textContent = "Вспомните, какие усилия и идеи помогли классу дойти до вершины.";
      return;
    }
    $("#encouragement-title").textContent = stage ? "Добрыня поддерживает класс" : "Каждый шаг важен";
    $("#encouragement-text").textContent = stage ? nextMessage(stage) : cfg.defaultMessage;
    $("#prompt-title").textContent = stage ? "Подумай" : "Вопрос для размышления";
    $("#prompt-text").textContent = stage ? stage.prompt : cfg.defaultPrompt;
  }
  function chooseStage(id) {
    if (!validIds.has(id) || steps.length >= classSize) return;
    const stage = stageById[id];
    lastStageId = id;
    steps.push(id);
    saveSteps();
    playSound("select");
    renderRoute();
    renderProgress();
    renderMessage(stage);
    if (steps.length === classSize) {
      window.setTimeout(() => playSound("summit"), reducedMotion ? 0 : 520);
      $("#summit-celebration").classList.add("is-visible");
    } else {
      window.setTimeout(() => playSound("move"), reducedMotion ? 0 : 180);
    }
  }
  document.querySelectorAll("[data-stage-choice]").forEach(button => {
    button.addEventListener("click", () => chooseStage(button.dataset.stageChoice));
  });
  $("#class-size").addEventListener("change", event => {
    if (steps.length) return;
    const requested = Number.parseInt(event.currentTarget.value, 10);
    classSize = Number.isFinite(requested)
      ? Math.min(cfg.maxClassSize, Math.max(cfg.minClassSize, requested))
      : cfg.defaultClassSize;
    event.currentTarget.value = String(classSize);
    saveClassSize();
    renderRoute();
    renderProgress();
    renderMessage();
  });
  $("#reset-climb").addEventListener("click", () => {
    if (!steps.length) return;
    if (!window.confirm("Начать новое восхождение? Общий прогресс горы будет очищен.")) return;
    steps = [];
    lastStageId = null;
    saveSteps();
    renderRoute();
    renderProgress();
    renderMessage();
    $("#summit-celebration").classList.remove("is-visible");
  });
  $("#sound-toggle").addEventListener("click", event => {
    soundOn = !soundOn;
    event.currentTarget.setAttribute("aria-pressed", String(soundOn));
    event.currentTarget.textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
    if (soundOn) playSound("select");
  });
  $("#year").textContent = new Date().getFullYear();
  renderRoute();
  renderProgress();
  renderMessage(steps.length && lastStageId ? stageById[lastStageId] : null);
  if (steps.length) {
    const recent = steps[steps.length - 1];
    renderMessage(stageById[recent]);
    lastStageId = recent;
  }
})();