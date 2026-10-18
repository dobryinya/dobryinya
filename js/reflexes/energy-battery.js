// =========================
// КОНФИГУРАЦИЯ ИГРЫ
// Меняй здесь пути, уровни, цвета, громкость и советы Добрыни.
// =========================
const ENERGY_BATTERY_CONFIG = {
  storageKey: "dobrynya-energy-battery-class-results-v1",
  assets: {
    avatar: "/images/fav.png"
  },
  sounds: {
    confirm: "/sounds/1.mp3",
    highCharge: "/sounds/taiga-win.mp3"
  },
  soundEnabledByDefault: true,
  volumes: { confirm: 0.32, highCharge: 0.2 },
  // Пустой путь скрывает кнопку музыки и исключает запрос к отсутствующему MP3.
  music: { path: "", volume: 0.14, enabledByDefault: false },
  slider: { min: 0, max: 100, step: 5, initial: 50 },
  levelBands: [
    {
      id: "rest", min: 0, max: 15, title: "Мне нужен отдых", caption: "Сил сейчас немного", color: "#e9786e",
      preview: "Сейчас тебе может пригодиться небольшая пауза. Не нужно требовать от себя больше, чем можешь.",
      tips: [
        "Кажется, сил сейчас немного. Сделай несколько спокойных вдохов и расслабь плечи.",
        "Небольшая передышка — тоже полезный шаг. Позволь себе минуту тишины.",
        "Необязательно сразу браться за новое дело. Сначала восстанови силы.",
        "Попробуй потянуться и спокойно подышать. Иногда короткая пауза помогает собраться.",
        "Прислушайся к себе: возможно, сейчас лучше немного отдохнуть, а потом продолжить."
      ]
    },
    {
      id: "low", min: 20, max: 35, title: "Нужна передышка", caption: "Заряд невысокий", color: "#eea34f",
      preview: "Энергии немного, и это нормально. Начни с небольшого и посильного шага.",
      tips: [
        "Энергии пока немного. Раздели следующее дело на маленькие шаги.",
        "Попробуй сменить позу, расправить плечи и сделать несколько спокойных вдохов.",
        "Начни с самого простого шага. Не обязательно решать всё сразу.",
        "Если мысли разбегаются, остановись на минуту и выбери одно дело.",
        "Небольшая разминка или глоток воды могут помочь почувствовать себя бодрее."
      ]
    },
    {
      id: "middle", min: 40, max: 55, title: "Заряжаюсь постепенно", caption: "Сил хватает на спокойную работу", color: "#eac64f",
      preview: "Похоже, силы есть, но важно сохранять баланс. Выбери удобный темп.",
      tips: [
        "Ты можешь двигаться в своём темпе. Сосредоточься на одном следующем шаге.",
        "Чтобы сохранить силы, делай короткие паузы между делами.",
        "Подумай, что сейчас поможет тебе работать спокойнее и увереннее.",
        "Не торопись: последовательные действия часто помогают лучше спешки.",
        "Отметь, что уже получилось, и спокойно переходи к следующему шагу."
      ]
    },
    {
      id: "good", min: 60, max: 75, title: "Есть силы работать", caption: "Хороший рабочий заряд", color: "#7acb65",
      preview: "У тебя есть силы продолжать. Направь их на то, что сейчас важно.",
      tips: [
        "У тебя есть силы продолжать. Выбери задачу, с которой хочешь разобраться.",
        "Хороший момент, чтобы попробовать новый способ решения.",
        "Сохрани этот настрой и не забывай делать паузы, если они понадобятся.",
        "Направь энергию на одну цель — так легче заметить результат.",
        "Подумай, какую идею ты хотел бы проверить, пока чувствуешь себя бодро."
      ]
    },
    {
      id: "full", min: 80, max: 100, title: "Полон сил и идей", caption: "Высокий заряд", color: "#35bd82",
      preview: "Похоже, ты полон сил. Можно поделиться идеей или попробовать что-то новое.",
      tips: [
        "Ты полон сил! Запомни одну идею, которую тебе хочется воплотить.",
        "Направь свою энергию на интересный вопрос или новое открытие.",
        "Хороший настрой помогает пробовать новое. Выбери, с чего начнёшь.",
        "Поделись хорошей идеей с классом — возможно, она вдохновит других.",
        "Заметь, что помогает тебе чувствовать себя бодро, и постарайся сохранить это."
      ]
    }
  ],
  classSummaries: {
    empty: "Когда появятся ответы, батарейка покажет средний заряд класса.",
    rest: "По среднему показателю классу может пригодиться спокойная пауза перед следующим делом.",
    low: "Сейчас лучше не торопиться: небольшие шаги и короткие передышки помогут сохранить силы.",
    middle: "У класса умеренный заряд. Можно продолжать в удобном темпе и делать небольшие паузы.",
    good: "У класса хороший рабочий заряд. Можно продолжать работу, сохраняя время для отдыха.",
    full: "Средний заряд высокий. Направьте силы на интересные идеи и новые задачи."
  },
  results: {
    bands: [
      { id: "rest", title: "Нужен отдых", min: 0, max: 15, color: "#e9786e" },
      { id: "low", title: "Невысокий заряд", min: 20, max: 35, color: "#eea34f" },
      { id: "middle", title: "Средний заряд", min: 40, max: 55, color: "#eac64f" },
      { id: "good", title: "Есть силы", min: 60, max: 75, color: "#7acb65" },
      { id: "full", title: "Полный заряд", min: 80, max: 100, color: "#35bd82" }
    ]
  }
};

// =========================
// ЛОГИКА ИГРЫ
// =========================
(() => {
  "use strict";
  const cfg = ENERGY_BATTERY_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const scene = $("#energy-scene");
  const slider = $("#energy-slider");
  const batteryFill = $("#battery-fill");
  const batteryIllustration = $("#battery-illustration");
  const addButton = $("#add-response");
  const soundButton = $("#sound-toggle");
  const musicButton = $("#music-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let soundOn = cfg.soundEnabledByDefault;
  let musicOn = false;
  let musicAudio = null;
  let tipsState = readTipsState();
  let responses = readResponses();

  slider.min = String(cfg.slider.min);
  slider.max = String(cfg.slider.max);
  slider.step = String(cfg.slider.step);
  slider.value = String(cfg.slider.initial);
  soundButton.setAttribute("aria-pressed", String(soundOn));
  if (cfg.music.path) {
    musicButton.hidden = false;
    musicButton.setAttribute("aria-pressed", "false");
    musicAudio = new Audio(cfg.music.path);
    musicAudio.loop = true;
    musicAudio.volume = cfg.music.volume;
  } else {
    musicButton.hidden = true;
  }
  $("#year").textContent = new Date().getFullYear();

  function readResponses() {
    try {
      const value = JSON.parse(localStorage.getItem(cfg.storageKey) || "[]");
      if (Array.isArray(value)) return value.filter(item => item && Number.isFinite(item.value) && item.value >= 0 && item.value <= 100 && cfg.levelBands.some(band => band.id === item.levelId)).map(item => ({ value: Math.round(item.value), levelId: item.levelId }));
    } catch { /* If storage is unavailable, start with an empty result. */ }
    return [];
  }
  function saveResponses() {
    try { localStorage.setItem(cfg.storageKey, JSON.stringify(responses)); } catch { /* The activity remains usable without browser storage. */ }
  }
  function readTipsState() {
    try {
      const value = JSON.parse(localStorage.getItem(`${cfg.storageKey}:tips`) || "null");
      if (value && value.decks && value.last) return value;
    } catch { /* Use fresh message decks. */ }
    return { decks: {}, last: {} };
  }
  function saveTipsState() {
    try { localStorage.setItem(`${cfg.storageKey}:tips`, JSON.stringify(tipsState)); } catch {}
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function nextTip(level) {
    let deck = tipsState.decks[level.id];
    if (!Array.isArray(deck) || deck.length === 0) {
      deck = shuffle(level.tips);
      if (deck.length > 1 && deck[deck.length - 1] === tipsState.last[level.id]) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    const tip = deck.pop();
    tipsState.decks[level.id] = deck;
    tipsState.last[level.id] = tip;
    saveTipsState();
    return tip;
  }
  function getLevel(value) {
    return cfg.levelBands.find(level => value >= level.min && value <= level.max) || cfg.levelBands.reduce((best, level) => Math.abs(value - (level.min + level.max) / 2) < Math.abs(value - (best.min + best.max) / 2) ? level : best, cfg.levelBands[0]);
  }
  function playSound(name) {
    if (!soundOn) return;
    const path = cfg.sounds[name];
    if (!path) return;
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = cfg.volumes[name] ?? 0.25;
    audio.play().catch(error => console.warn(`[Батарейка энергии] Не удалось воспроизвести ${path}`, error));
  }
  function renderCurrentLevel({ usePreview = true } = {}) {
    const value = Number(slider.value);
    const level = getLevel(value);
    $("#slider-output").textContent = `${value}%`;
    if (usePreview) setSelectionAdvice(`Выбранный уровень: ${level.title}`, level.preview);
    return level;
  }
  function setAdvice(title, text) {
    const card = $("#dobrynya-advice");
    $("#advice-title").textContent = title;
    $("#advice-text").textContent = text;
    card.classList.remove("is-changing");
    if (!reducedMotion) {
      void card.offsetWidth;
      card.classList.add("is-changing");
    }
  }
  function setSelectionAdvice(title, text) {
    const card = $("#selection-advice");
    $("#selection-advice-title").textContent = title;
    $("#selection-advice-text").textContent = text;
    card.classList.remove("is-changing");
    if (!reducedMotion) {
      void card.offsetWidth;
      card.classList.add("is-changing");
    }
  }
  function pluralResponses(total) {
    const lastTwo = total % 100;
    const last = total % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "ответов";
    if (last === 1) return "ответ";
    if (last >= 2 && last <= 4) return "ответа";
    return "ответов";
  }
  function renderClassBattery(average, total) {
    if (average === null) {
      scene.dataset.level = "empty";
      batteryFill.style.width = "0%";
      $("#class-state-title").textContent = "Пока нет ответов";
      $("#class-charge-value").textContent = "—";
      $("#class-charge-caption").textContent = "Общий заряд появится после первого ответа";
      batteryIllustration.setAttribute("aria-label", "Общий заряд класса пока не рассчитан");
      setAdvice("Добрыня ждёт результаты класса", cfg.classSummaries.empty);
      return;
    }

    const value = Math.max(0, Math.min(100, Math.round(average)));
    const level = getLevel(value);
    scene.dataset.level = level.id;
    batteryFill.style.width = `${value}%`;
    $("#class-state-title").textContent = level.title;
    $("#class-charge-value").textContent = `${value}%`;
    $("#class-charge-caption").textContent = `Среднее по ${total} ${pluralResponses(total)}`;
    batteryIllustration.setAttribute("aria-label", `Средний заряд класса — ${value} процентов по ${total} ${pluralResponses(total)}`);
    const summary = total === 1
      ? `${cfg.classSummaries[level.id]} Пока учтён только один ответ, поэтому общий показатель ещё изменится.`
      : cfg.classSummaries[level.id];
    setAdvice("Общий заряд класса", summary);
  }
  function renderResults() {
    const total = responses.length;
    $("#response-count").textContent = String(total);
    const average = total ? Math.round(responses.reduce((sum, response) => sum + response.value, 0) / total) : null;
    $("#average-charge").textContent = average === null ? "—" : `${average}%`;
    $("#average-fill").style.width = `${average ?? 0}%`;
    renderClassBattery(average, total);
    $("#undo-response").disabled = total === 0;
    $("#clear-results").disabled = total === 0;
    const distribution = $("#distribution");
    distribution.replaceChildren();
    if (!total) {
      const empty = document.createElement("div");
      empty.className = "distribution-empty";
      empty.textContent = "Здесь появится распределение ответов класса.";
      distribution.append(empty);
      return;
    }
    for (const band of cfg.results.bands) {
      const count = responses.filter(response => response.value >= band.min && response.value <= band.max).length;
      const row = document.createElement("div");
      row.className = "distribution-row";
      const label = document.createElement("span");
      label.className = "distribution-label";
      label.textContent = band.title;
      const track = document.createElement("span");
      track.className = "distribution-track";
      const fill = document.createElement("span");
      fill.style.width = `${count / total * 100}%`;
      fill.style.backgroundColor = band.color;
      track.append(fill);
      const number = document.createElement("span");
      number.className = "distribution-count";
      number.textContent = String(count);
      row.append(label, track, number);
      distribution.append(row);
    }
  }
  function addResponse() {
    const value = Number(slider.value);
    const level = getLevel(value);
    responses.push({ value, levelId: level.id });
    saveResponses();
    renderResults();
    setSelectionAdvice(`Добавлен ответ: ${level.title}`, nextTip(level));
    playSound("confirm");
    if (level.id === "full") window.setTimeout(() => playSound("highCharge"), 220);
    addButton.classList.remove("is-success");
    void addButton.offsetWidth;
    addButton.classList.add("is-success");
    window.setTimeout(() => addButton.classList.remove("is-success"), 420);
  }
  slider.addEventListener("input", () => renderCurrentLevel({ usePreview: true }));
  addButton.addEventListener("click", addResponse);
  $("#undo-response").addEventListener("click", () => {
    if (!responses.length) return;
    responses.pop();
    saveResponses();
    renderResults();
    renderCurrentLevel({ usePreview: true });
  });
  $("#clear-results").addEventListener("click", () => {
    if (!responses.length) return;
    responses = [];
    saveResponses();
    renderResults();
    renderCurrentLevel({ usePreview: true });
  });
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
    if (soundOn) playSound("confirm");
  });
  musicButton.addEventListener("click", () => {
    if (!musicAudio || !cfg.music.path) return;
    musicOn = !musicOn;
    musicButton.setAttribute("aria-pressed", String(musicOn));
    musicButton.textContent = musicOn ? "♫ Музыка: вкл." : "♫ Музыка";
    if (musicOn) {
      musicAudio.play().catch(error => {
        console.warn(`[Батарейка энергии] Не удалось воспроизвести музыку ${cfg.music.path}`, error);
        musicOn = false;
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.textContent = "♫ Музыка";
      });
    } else {
      musicAudio.pause();
      musicAudio.currentTime = 0;
    }
  });
  window.addEventListener("pagehide", () => {
    if (musicAudio) musicAudio.pause();
  });

  renderCurrentLevel();
  renderResults();
})();
