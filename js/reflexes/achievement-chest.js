// ===== КОНФИГУРАЦИЯ: файлы, громкость, поведение и реплики игры =====
const CHEST_CONFIG = {
  storageKey: "dobrynya-achievement-chest-v1",
  messageDeckStorageKey: "dobrynya-achievement-chest-message-decks-v1",
  soundEnabledByDefault: true,
  musicEnabledByDefault: false,
  toastDurationMs: 7600,
  animationMs: 620,
  maxPerAchievement: 30,
  // Раскладка предметов внутри сундука. Все координаты — проценты.
  // Подгоняй area под картинку сундука, а tokenSize/step — под плотность стопки.
  chestDisplay: {
    area: { left: 18, top: 35, width: 64, height: 50 },
    chestAspectRatio: 1.2, // ширина/высота chest-wrap (CSS: aspect-ratio: 6/5)
    tokenSize: 25,         // ширина предмета в % от области area
    horizontalStep: 7.0,   // меньше tokenSize = сильнее горизонтальное наложение
    verticalStep: 8.5,     // шаг между слоями по вертикали
    rows: 3,               // число рядов в видимой стопке
    startX: 1,
    startY: 1.5,
    jitterX: 2.0,          // небольшая вариативность позиции
    jitterY: 2.0,
    rotationDegrees: 25,   // случайный наклон предметов
    sizeVariation: 0.18,  // разброс размера ±18%
    layerShiftX: 1.2,     // сдвиг повторных слоёв, чтобы не лежали пиксель в пиксель
    layerShiftY: 1.3
  },
  paths: {
    imageBase: "/images/reflexes/achievement-chest/",
    music: "/music/reflexes-bg.mp3",
    sounds: {
      confirm: "/sounds/1.mp3",
      throw: "/sounds/ruhthrow.mp3",
      place: "/sounds/kladovka-place.mp3",
      magicOpen: "/sounds/taiga-win.mp3"
    }
  },
  volumes: { confirm: 0.32, throw: 0.44, place: 0.44, magicOpen: 0.44, music: 0.16 },
  images: {
    closed: "/images/reflexes/achievement-chest/chest-closed.png",
    open: "/images/reflexes/achievement-chest/chest-open.png"
  },
  achievements: [
    { id: "new", title: "Я узнал новое", shortTitle: "Узнал новое", icon: "🗝️", token: "token-key.png", guide: "Новое знание — это сокровище. Вспомни, что сегодня узнал или понял впервые.", messages: [
      "Сегодня ты пополнил свою копилку знаний — это настоящее сокровище!",
      "Новое открытие может пригодиться тебе ещё много раз. Здорово, что ты его заметил!",
      "Каждый новый факт — маленький ключ к большому миру знаний.",
      "Теперь ты знаешь то, чего не знал в начале урока. Отличное открытие!",
      "Отлично! Вспомни это открытие дома и расскажи о нём близким.",
      "Любознательность помогает находить самые интересные сокровища.",
      "Сегодня ты открыл новую дверцу в мире знаний. Так держать!",
      "Это знание теперь с тобой. Вспомни его, когда встретишь похожую задачу.",
      "Ты заметил новое и смог это запомнить. Это пригодится на следующих уроках.",
      "Маленькие открытия со временем складываются в большие знания.",
      "Здорово, что ты можешь назвать то, чему научился сегодня.",
      "Пусть это новое знание станет ключиком к следующей задаче.",
      "Ты расширил свой кругозор. В сундук отправляется настоящее сокровище!",
      "Знания растут, когда мы замечаем и запоминаем новое. У тебя получилось!",
      "Поделись своим открытием с одноклассником — знание станет ещё крепче.",
      "Сегодня ты нашёл ответ на вопрос, который раньше был незнакомым.",
      "Любопытство — суперсила исследователя. Продолжай задавать вопросы!",
      "Ты добавил в свою копилку ещё одну полезную идею.",
      "Новое знание — как ключ: оно помогает открывать новые возможности.",
      "Отличная работа! Что из сегодняшнего урока ты запомнишь надолго?",
      "Ты сумел заметить новое среди множества интересных вещей.",
      "Сегодня у тебя стало на одну загадку меньше. Прекрасное достижение!",
      "Ты не просто был на уроке — ты вынес из него новое открытие.",
      "Пусть твоя любознательность ведёт тебя к новым открытиям каждый день!"
    ]},
    { id: "effort", title: "Я старался", shortTitle: "Старался", icon: "⭐", token: "token-star.png", guide: "Старание важно, даже если не всё получилось сразу. Вспомни момент, когда ты не сдавался.", messages: [
      "Ты вложил силы в работу — и это достойно уважения!",
      "Настойчивость — твоя сильная сторона. Продолжай пробовать!",
      "Ты не сдался перед первым препятствием. Это большая победа.",
      "Старание помогает навыкам становиться крепче с каждым уроком.",
      "Звезда в сундуке — за твою работу и терпение. Молодец!",
      "Важно не только быстро найти ответ, но и честно постараться.",
      "Сегодня ты сделал то, что было в твоих силах. Это ценно.",
      "Даже маленькое усилие двигает тебя вперёд. Ты это доказал!",
      "Ты продолжал работать, когда хотелось отвлечься. Здорово!",
      "Твой успех начинается с готовности попробовать. Так держать!",
      "Стараться — значит давать себе шанс научиться новому.",
      "Ты проявил терпение. Этот навык пригодится не только в школе.",
      "Пусть эта звезда напоминает: усилия имеют значение.",
      "Ты работал шаг за шагом — так и строятся большие достижения.",
      "Сегодня ты можешь гордиться тем, что не бросил начатое.",
      "Старание не всегда сразу приносит ответ, но помогает расти.",
      "Ты показал характер: попробовал и продолжил работу.",
      "Отлично! Заметь, что помогло тебе удерживать внимание.",
      "Ты сделал свой вклад в урок. Он важен для твоего роста.",
      "Звезда заслужена: ты вложил в работу время и силы.",
      "Каждая тренировка начинается с решения попробовать. Ты сделал этот шаг.",
      "Ты не обязан всё уметь сразу. Твоё старание помогает учиться.",
      "Сегодня ты потренировал не только знания, но и настойчивость.",
      "Сохрани это упорство для следующей интересной задачи!"
    ]},
    { id: "challenge", title: "Я справился с трудностью", shortTitle: "Преодолел трудность", icon: "💎", token: "token-crystal.png", guide: "Даже если пришлось попросить подсказку или попробовать снова, ты мог сделать важный шаг вперёд.", messages: [
      "Ты встретил трудность и не отвернулся от неё. Это смелый шаг!",
      "Когда сложное становится понятнее, это настоящее достижение.",
      "Ты попробовал другой способ — и этим расширил свои возможности.",
      "Кристалл достаётся тому, кто готов разбираться. Молодец!",
      "Не обязательно справляться с первого раза. Важно продолжать путь.",
      "Сегодня ты смог пройти кусочек трудного пути. Это важно.",
      "Ты нашёл, где было сложно, и попробовал разобраться. Отлично!",
      "Просить подсказку и затем продолжать самому — умное решение.",
      "Трудность уже не кажется такой большой, когда знаешь первый шаг.",
      "Ты доказал себе, что можешь двигаться вперёд постепенно.",
      "Каждая преодолённая трудность добавляет уверенности.",
      "Ты не испугался сложного задания и уделил ему время.",
      "Кристалл в сундуке — знак твоего смелого учебного шага.",
      "Ты смог разобраться в том, что сначала казалось непонятным.",
      "Иногда победа — это понять ошибку и попробовать ещё раз.",
      "Ты стал ближе к цели, даже если путь был непростым.",
      "У тебя получилось сделать шаг, который раньше не получался.",
      "Ты использовал подсказку с пользой. Это тоже учебное умение.",
      "Сегодня ты потренировал умение не сдаваться перед трудностями.",
      "Ты разобрал задачу по частям — хороший способ справляться со сложным.",
      "Пусть этот кристалл напоминает: сложное можно освоить постепенно.",
      "Ты заметил свой прогресс. Это помогает становиться увереннее.",
      "Не нужно решать всё мгновенно. Ты сделал важный шаг сегодня.",
      "Ты справился не потому, что было легко, а потому, что продолжал пробовать."
    ]},
    { id: "help", title: "Я помогал другим", shortTitle: "Помогал другим", icon: "🪙", token: "token-coin.png", guide: "Доброта и поддержка тоже достижения. Вспомни, кому ты сегодня помог или с кем поделился идеей.", messages: [
      "Твоя помощь сделала день одноклассника немного легче. Спасибо!",
      "Делиться знаниями — значит помогать расти всей команде.",
      "Ты заметил другого человека и поддержал его. Это ценно.",
      "Добрый поступок — настоящее сокровище, которое нельзя купить.",
      "Ты помог классу стать дружнее. Отличное достижение!",
      "Когда мы помогаем друг другу, сложные задачи становятся легче.",
      "Сегодня ты проявил заботу. Пусть таких моментов будет больше!",
      "Твоя идея или подсказка могла очень помочь другому. Молодец!",
      "Ты умеешь быть частью команды — это важный навык.",
      "Монета в сундуке — за щедрость, внимание и доброту.",
      "Ты поделился тем, что знаешь, и помог другому разобраться.",
      "Иногда самое большое достижение — вовремя поддержать друга.",
      "Ты сделал полезное дело не только для себя, но и для класса.",
      "Спасибо, что помогаешь создавать в классе атмосферу поддержки.",
      "Умение слушать и помогать — тоже сила настоящего героя.",
      "Ты заметил, что кому-то нужна помощь, и не прошёл мимо.",
      "Доброта возвращается: сегодня ты помог кому-то стать увереннее.",
      "Команда становится сильнее, когда каждый готов поддержать другого.",
      "Ты проявил уважение к однокласснику. Это достойно похвалы.",
      "Твоя поддержка могла придать кому-то смелости попробовать ещё раз.",
      "Ты не только учился сам, но и помогал учиться другим.",
      "Хороший поступок — маленькая победа, которая делает мир теплее.",
      "Вместе мы умеем больше. Спасибо за твой вклад в команду!",
      "Пусть в твоём сундуке всегда будет место добрым поступкам."
    ]}
  ]
};

// ===== ЛОГИКА ИГРЫ =====
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const cfg = CHEST_CONFIG;
  const achievementById = Object.fromEntries(cfg.achievements.map(item => [item.id, item]));
  const validIds = new Set(cfg.achievements.map(item => item.id));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let selected = [];
  let soundOn = cfg.soundEnabledByDefault;
  let musicOn = cfg.musicEnabledByDefault;
  let pending = false;
  let toastTimer = 0;
  let toastHideTimer = 0;

  try {
    const stored = JSON.parse(localStorage.getItem(cfg.storageKey) || "[]");
    if (Array.isArray(stored)) {
      const counts = {};
      selected = stored.filter(id => {
        if (!validIds.has(id)) return false;
        counts[id] = (counts[id] || 0) + 1;
        return counts[id] <= cfg.maxPerAchievement;
      });
    }
  } catch { /* Повреждённое сохранение не мешает запуску. */ }

  const music = new Audio(cfg.paths.music);
  music.loop = true;
  music.volume = cfg.volumes.music;
  $("#sound").setAttribute("aria-pressed", String(soundOn));
  $("#sound").textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
  $("#music").setAttribute("aria-pressed", String(musicOn));
  $("#music").textContent = musicOn ? "♫ Музыка: вкл." : "♫ Музыка";

  function playSound(name) {
    if (!soundOn) return;
    const path = cfg.paths.sounds[name];
    if (!path) return;

    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = cfg.volumes[name] ?? 0.35;
    audio.addEventListener("error", () => {
    }, { once: true });

    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(error => {
      });
    }
  }

  function countFor(id) {
    return selected.reduce((total, selectedId) => total + (selectedId === id ? 1 : 0), 0);
  }

  function selectedKindsCount() {
    return new Set(selected).size;
  }

  function saveSelected() {
    // try { localStorage.setItem(cfg.storageKey, JSON.stringify(selected)); } catch { /* Local storage может быть отключён. */ }
  }

  function readDeckState() {
    try {
      const state = JSON.parse(localStorage.getItem(cfg.messageDeckStorageKey) || "null");
      if (state && state.bags && state.last) return state;
    } catch { /* Начинаем с нового набора реплик. */ }
    return { bags: {}, last: {} };
  }
  let deckState = readDeckState();
  function saveDeckState() {
    try { localStorage.setItem(cfg.messageDeckStorageKey, JSON.stringify(deckState)); } catch {}
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function nextMessage(item) {
    let bag = deckState.bags[item.id];
    if (!Array.isArray(bag) || bag.length === 0) {
      bag = shuffle(item.messages);
      if (bag.length > 1 && bag[bag.length - 1] === deckState.last[item.id]) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      }
    }
    const message = bag.pop();
    deckState.bags[item.id] = bag;
    deckState.last[item.id] = message;
    saveDeckState();
    return message;
  }

  function setGuide(text) { $("#guide-text").textContent = text; }
  function syncChestAppearance(animate = false) {
    const wrap = $("#chest-wrap");
    const image = $("#chest-image");
    const open = selected.length > 0;
    wrap.classList.toggle("is-open", open);
    wrap.classList.remove("is-opening");
    image.src = open ? cfg.images.open : cfg.images.closed;
    image.alt = open ? "Открытый волшебный сундук с достижениями" : "Закрытый волшебный сундук";
    if (animate && open && !reducedMotion) {
      void wrap.offsetWidth;
      wrap.classList.add("is-opening");
      window.setTimeout(() => wrap.classList.remove("is-opening"), 700);
    }
  }

  function applyChestDisplaySettings() {
    const box = $("#chest-items");
    const area = cfg.chestDisplay.area;
    // Inline styles намеренно вычисляются из конфига: область легко подогнать
    // под конкретный PNG, не трогая CSS и остальную механику игры.
    box.style.left = `${area.left}%`;
    box.style.right = "auto";
    box.style.top = `${area.top}%`;
    box.style.width = `${area.width}%`;
    box.style.height = `${area.height}%`;
  }

  function tokenPlacement(index) {
    const d = cfg.chestDisplay;
    const area = d.area;
    const random = salt => {
      const value = Math.sin((index + 1) * 127.1 + salt * 311.7 + 74.7) * 43758.5453123;
      return value - Math.floor(value);
    };
    const randomBetween = (min, max, salt) => min + random(salt) * (max - min);
    const size = d.tokenSize * (1 + randomBetween(-d.sizeVariation, d.sizeVariation, 1));
    const columns = Math.max(1, Math.floor((100 - d.tokenSize) / d.horizontalStep) + 1);
    const rows = Math.max(1, d.rows);
    const slotsPerLayer = columns * rows;
    const layer = Math.floor(index / slotsPerLayer);
    const column = index % columns;
    const row = Math.floor(index / columns) % rows;
    // Каждый следующий слой немного смещается, поэтому предметы образуют стопку,
    // но не перекрываются совершенно одинаковыми силуэтами.
    const layerOffset = (layer % 3) - 1;
    const x = d.startX + column * d.horizontalStep
      + randomBetween(-d.jitterX, d.jitterX, 2)
      + layerOffset * d.layerShiftX;
    const rawY = d.startY + row * d.verticalStep
      + randomBetween(-d.jitterY, d.jitterY, 3)
      + layerOffset * d.layerShiftY;

    // Высота квадратного PNG относительно области зависит от соотношения сторон сундука.
    const tokenHeightPercent = size * area.width * d.chestAspectRatio / area.height;
    const maxY = Math.max(0, 100 - tokenHeightPercent);
    const left = Math.max(0, Math.min(100 - size, x));
    const top = Math.max(0, Math.min(maxY, rawY));
    const rotation = randomBetween(-d.rotationDegrees, d.rotationDegrees, 4);

    return { left, top, size, rotation, zIndex: index + 1 };
  }

  function createChestToken(item, animate = true) {
    const box = $("#chest-items");
    const index = box.children.length;
    const placement = tokenPlacement(index);
    const image = document.createElement("img");
    image.className = "chest-token";
    image.src = cfg.paths.imageBase + item.token;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.draggable = false;
    image.style.left = `${placement.left}%`;
    image.style.top = `${placement.top}%`;
    image.style.width = `${placement.size}%`;
    image.style.zIndex = String(placement.zIndex);
    image.style.setProperty("--token-rotation", `${placement.rotation.toFixed(1)}deg`);
    if (!animate || reducedMotion) image.style.animation = "none";
    box.append(image);
  }

  function renderAllItems() {
    const box = $("#chest-items");
    box.replaceChildren();
    selected.forEach(id => createChestToken(achievementById[id], false));
  }

  function updatePanel() {
    document.querySelectorAll("[data-achievement]").forEach(button => {
      const id = button.dataset.achievement;
      const item = achievementById[id];
      const count = countFor(id);
      const chosen = count > 0;
      const remaining = cfg.maxPerAchievement - count;

      button.classList.toggle("is-selected", chosen);
      button.classList.toggle("is-limit-reached", remaining === 0);
      button.setAttribute("aria-pressed", String(chosen));
      button.disabled = pending || remaining === 0;
      button.setAttribute(
        "aria-label",
        `${item.title}. Добавлено в сундук: ${count} из ${cfg.maxPerAchievement}.` +
          (remaining ? ` Можно добавить ещё ${remaining}.` : " Достигнут лимит.")
      );

      const mark = button.querySelector(".achievement-check");
      if (mark) {
        mark.textContent = count ? String(count) : "＋";
        mark.title = `${count} из ${cfg.maxPerAchievement}`;
      }
    });

    const maxTotal = cfg.achievements.length * cfg.maxPerAchievement;
    $("#count").textContent = selected.length;
    const totalCounter = $("#count").parentElement;
    if (totalCounter && !totalCounter.dataset.limitUpdated) {
      totalCounter.innerHTML = `<span id="count">${selected.length}</span> / ${maxTotal}`;
      totalCounter.dataset.limitUpdated = "true";
    }
    $("#summary-count").textContent = selected.length
      ? `${selected.length} из ${maxTotal}`
      : "Пока пусто";
    $("#undo").disabled = pending || selected.length === 0;
    $("#reset").disabled = pending;

    const chips = $("#summary-chips");
    chips.replaceChildren();
    if (!selected.length) {
      const empty = document.createElement("span");
      empty.className = "summary-empty";
      empty.textContent = "Сундук ждёт твоих побед ✨";
      chips.append(empty);
    } else {
      cfg.achievements.forEach(item => {
        const count = countFor(item.id);
        if (!count) return;

        const chip = document.createElement("span");
        chip.className = "summary-chip";
        const icon = document.createElement("img");
        icon.src = cfg.paths.imageBase + item.token;
        icon.alt = "";
        const label = document.createElement("span");
        label.textContent = `${item.shortTitle} ×${count}`;
        chip.append(icon, label);
        chips.append(chip);
      });
    }
  }

  function showToast(item) {
    const toast = $("#toast");
    $("#toast-icon").textContent = item.icon;
    $("#toast-title").textContent = item.title + "!";
    $("#toast-message").textContent = nextMessage(item);
    toast.hidden = false;
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastHideTimer);
    toastTimer = window.setTimeout(hideToast, cfg.toastDurationMs);
  }
  function hideToast() {
    const toast = $("#toast");
    toast.classList.remove("is-visible");
    window.clearTimeout(toastHideTimer);
    toastHideTimer = window.setTimeout(() => { toast.hidden = true; }, 260);
  }

  function openChestIfNeeded() {
    if (selected.length !== 1 || $("#chest-wrap").classList.contains("is-open")) return Promise.resolve(false);
    const wrap = $("#chest-wrap");
    const image = $("#chest-image");
    wrap.classList.add("is-open");
    wrap.classList.add("is-opening");
    image.src = cfg.images.open;
    image.alt = "Открытый волшебный сундук с достижениями";
    playSound("magicOpen");
    return new Promise(resolve => window.setTimeout(() => {
      wrap.classList.remove("is-opening");
      resolve(true);
    }, reducedMotion ? 0 : 420));
  }

  function flyToken(item, sourceButton) {
    return new Promise(resolve => {
      const source = sourceButton.querySelector(".achievement-art img").getBoundingClientRect();
      const target = $("#chest-wrap").getBoundingClientRect();
      const size = Math.max(42, Math.min(64, source.width));
      const startX = source.left + (source.width - size) / 2;
      const startY = source.top + (source.height - size) / 2;
      const endX = target.left + target.width * 0.5 - size / 2;
      const endY = target.top + target.height * 0.52 - size / 2;
      const flying = document.createElement("img");
      flying.className = "flying-token";
      flying.src = cfg.paths.imageBase + item.token;
      flying.alt = "";
      flying.style.left = `${startX}px`;
      flying.style.top = `${startY}px`;
      flying.style.width = `${size}px`;
      flying.style.height = `${size}px`;
      document.body.append(flying);
      playSound("throw");
      if (reducedMotion) {
        flying.remove();
        createChestToken(item, false);
        playSound("place");
        resolve();
        return;
      }
      requestAnimationFrame(() => {
        flying.style.transform = `translate3d(${endX - startX}px,${endY - startY}px,0) scale(.34) rotate(360deg)`;
        flying.style.opacity = ".45";
      });
      window.setTimeout(() => {
        flying.remove();
        createChestToken(item, true);
        playSound("place");
        resolve();
      }, cfg.animationMs);
    });
  }

  async function addAchievement(button) {
    if (pending) return;
    const id = button.dataset.achievement;
    if (!validIds.has(id) || countFor(id) >= cfg.maxPerAchievement) return;
    pending = true;
    const item = achievementById[id];
    const first = selected.length === 0;
    selected.push(id);
    saveSelected();
    updatePanel();

    playSound("confirm");
    if (first) await openChestIfNeeded();
    await flyToken(item, button);

    pending = false;
    updatePanel();
    showToast(item);
    const allKindsChosen = selectedKindsCount() === cfg.achievements.length;
    setGuide(allKindsChosen
      ? "Посмотри, сколько разных достижений ты собрал: узнал новое, постарался, справился с трудностью и помог другим. Есть чем гордиться!"
      : item.guide);
    $("#feedback").textContent = allKindsChosen
      ? "Ты собрал все четыре вида достижений! Можешь добавить ещё по одному или несколько раз отметить то, что особенно подходит тебе."
      : `Добавлено: ${countFor(id)} из ${cfg.maxPerAchievement}. Можно положить это достижение ещё ${cfg.maxPerAchievement - countFor(id)} раз.`;
  }

  $("#achievement-list").addEventListener("click", event => {
    const button = event.target.closest("button[data-achievement]");
    if (button) addAchievement(button);
  });
  $("#undo").addEventListener("click", () => {
    if (pending || !selected.length) return;
    const removed = selected.pop();
    saveSelected();
    renderAllItems();
    syncChestAppearance(true);
    updatePanel();
    const item = achievementById[removed];
    setGuide(selected.length ? "Можно добавить другое достижение или оставить в сундуке то, чем ты особенно гордишься." : "Сундук снова пуст. Вспомни, чем ты сегодня можешь гордиться.");
    $("#feedback").textContent = `«${item.title}» убрано. Можно выбрать другую карточку.`;
  });
  $("#reset").addEventListener("click", () => {
    if (pending) return;
    if (selected.length && !window.confirm("Начать новый сундук? Текущий набор достижений будет очищен.")) return;
    selected = [];
    saveSelected();
    renderAllItems();
    syncChestAppearance(true);
    updatePanel();
    setGuide("Начинаем заново! Вспомни, что сегодня ты узнал, чему уделил силы или кому помог.");
    $("#feedback").textContent = "Сундук готов к новым достижениям!";
    hideToast();
  });
  $("#sound").addEventListener("click", () => {
    soundOn = !soundOn;
    const button = $("#sound");
    button.setAttribute("aria-pressed", String(soundOn));
    button.textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
    if (soundOn) playSound("confirm");
  });
  $("#music").addEventListener("click", () => {
    musicOn = !musicOn;
    const button = $("#music");
    button.setAttribute("aria-pressed", String(musicOn));
    button.textContent = musicOn ? "♫ Музыка: вкл." : "♫ Музыка";
    if (musicOn) {
      const playback = music.play();
      if (playback && typeof playback.catch === "function") playback.catch(error => {
        musicOn = false;
        button.setAttribute("aria-pressed", "false");
        button.textContent = "♫ Музыка";
        const feedback = $("#feedback");
      });
    } else { music.pause(); music.currentTime = 0; }
  });
  $("#toast-close").addEventListener("click", hideToast);
  document.addEventListener("keydown", event => { if (event.key === "Escape") hideToast(); });
  $("#year").textContent = new Date().getFullYear();

  applyChestDisplaySettings();
  syncChestAppearance(false);
  renderAllItems();
  updatePanel();
  if (selected.length) setGuide("");
})();
