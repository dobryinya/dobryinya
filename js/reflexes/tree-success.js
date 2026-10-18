// ===== КОНФИГУРАЦИЯ: пути, громкости, лимиты и реплики редактируются здесь =====
const TREE_CONFIG = {
  storageKey: "dobrynya-tree-success-v2",
  messageStorageKey: "dobrynya-tree-success-message-decks-v1",
  maxLeaves: 65,
  soundEnabledByDefault: true,
  musicEnabledByDefault: false,
  paths: {
    tree: "/images/reflexes/tree-empty.png",
    leaves: {
      green: "/images/reflexes/leaf-green.png",
      yellow: "/images/reflexes/leaf-yellow.png",
      orange: "/images/reflexes/leaf-orange.png"
    },
    music: "/music/reflexes-bg.mp3",
    sounds: {
      select: "/sounds/1.mp3",
      leafFlip: "/sounds/flip.mp3",
      wind: "/sounds/eagle-wind.mp3"
    }
  },
  volumes: { select: 0.3, leafFlip: 0.38, wind: 0.25, music: 0.2 },
  sounds: { windEnabledWithEffects: true },
  canopy: { centerX: 53, centerY: 45, radiusX: 40, radiusY: 30 },
  toastDurationMs: 7200,
  messages: {
    green: [
    "Здорово! Ты заметил, что у тебя уже получается всё больше.",
    "Твой зелёный листочек говорит: сегодня ты хорошо поработал!",
    "Отличный результат! Сохрани этот способ работы на будущее.",
    "Ты справился — и это повод собой гордиться!",
    "Вот это да! Твои знания сегодня стали крепче.",
    "Ты уверенно двигался к цели и дошёл до неё.",
    "Классно получилось! Попробуй объяснить свой способ соседу.",
    "Твой труд заметен. Продолжай в том же духе!",
    "Ты смог применить то, чему учился раньше. Это большой шаг.",
    "Сегодня ты добавил к своим умениям ещё одну победу.",
    "Зелёный листочек — знак твоей уверенности. Молодец!",
    "Ты не просто ответил, а научился чему-то новому.",
    "Отлично! Запомни, что помогло тебе добиться результата.",
    "Твои старания превратились в настоящий успех.",
    "Ты был внимательным и довёл работу до конца. Здорово!",
    "У тебя получилось! Теперь можно смело браться за следующий шаг.",
    "Каждая такая победа помогает тебе расти.",
    "Ты сегодня показал, сколько всего уже умеешь.",
    "Твой успех — результат твоей работы. Так держать!",
    "Ты смог разобраться и найти верное решение. Браво!",
    "Пусть этот листочек напоминает: ты способен учиться новому.",
    "Отличная работа! Ты можешь гордиться своим прогрессом.",
    "Ты использовал знания с пользой — это настоящее умение.",
    "Получилось с уверенностью! Поделись, что тебе помогло.",
    "Сегодняшний успех станет опорой для следующей задачи.",
    "Ты был настойчивым и получил хороший результат.",
    "К дереву присоединился листочек твоей маленькой победы!",
    "Ты заметил главное и сумел справиться. Молодец!",
    "Успех складывается из шагов — и сегодня ты сделал отличный шаг.",
    "Пусть твоя уверенность растёт вместе с нашим деревом!"
],
    yellow: [
    "Трудности бывают у всех. Главное — ты продолжал пробовать.",
    "Ты уже сделал часть пути. Выбери один момент, который стоит повторить.",
    "Ошибки помогают понять, чему ещё нужно научиться.",
    "Ты старался — это важно. На следующем уроке попробуй ещё раз.",
    "Не всё получилось сразу, зато ты узнал, над чем поработать.",
    "Сделай маленькую паузу и вспомни самый трудный шаг.",
    "Ты молодец, что честно оценил свою работу.",
    "Попробуй решить похожее задание вместе с другом.",
    "Если задача кажется сложной, раздели её на маленькие шаги.",
    "Не спеши сравнивать себя с другими: замечай свой прогресс.",
    "Сегодняшняя трудность может стать завтрашним умением.",
    "Вспомни, в какой момент стало сложно. Это подскажет, что потренировать.",
    "Смелость — это не только знать ответ, но и пробовать снова.",
    "Ты не обязан уметь всё сразу. Учиться — значит постепенно разбираться.",
    "Попросить подсказку — хороший способ продолжить путь.",
    "Выбери одно задание и попробуй выполнить его ещё раз спокойно.",
    "Ты уже знаешь больше, чем до начала урока.",
    "Трудный вопрос — возможность стать чуть сильнее.",
    "Подумай: что помогло бы тебе почувствовать себя увереннее?",
    "Даже маленький шаг вперёд имеет значение. Не останавливайся.",
    "Ты проявил терпение. Теперь можно найти другой способ решения.",
    "Не получилось с первого раза? Попробуй изменить один шаг.",
    "Замечать трудности — значит понимать, как двигаться дальше.",
    "Ты можешь обратиться за помощью и затем попробовать сам.",
    "В следующий раз начни с того задания, которое кажется понятнее.",
    "Каждая тренировка делает сложное немного привычнее.",
    "Ты учишься не только отвечать, но и замечать свои затруднения.",
    "Вспомни момент, когда стало получаться хоть немного лучше.",
    "Твой жёлтый листочек — не ошибка, а подсказка для следующего шага.",
    "Продолжай пробовать. Уверенность растёт постепенно!"
],
    orange: [
    "Выбери один пример и разбери его по шагам — с этого начинается тренировка.",
    "Попроси учителя объяснить ещё раз именно тот момент, который непонятен.",
    "Попробуй сначала решить похожее, но более простое задание.",
    "Нарисуй схему или сделай короткую запись — так мысль может стать яснее.",
    "Объясни задачу своими словами. Это поможет увидеть, что уже понятно.",
    "Потренируйся пять минут: маленькие занятия тоже приносят результат.",
    "Сначала найди, что ты уже знаешь в этом задании.",
    "Попробуй другой способ решения — к ответу иногда ведёт несколько дорог.",
    "Раздели трудное задание на два или три понятных действия.",
    "Попроси одноклассника рассказать, как он рассуждал, а затем попробуй сам.",
    "Задай себе вопрос: «С чего я могу начать?» — и сделай первый шаг.",
    "Вернись к примеру, который получился, и сравни его с трудным.",
    "Запиши правило своими словами и придумай к нему свой пример.",
    "Если запутался, остановись и проверь каждый шаг по порядку.",
    "Потренируйся на карточках или в тренажёре, не торопясь.",
    "Попроси подсказку, но попробуй сделать следующий шаг самостоятельно.",
    "Сегодня можно выбрать одну цель для тренировки — этого достаточно.",
    "Найди в задании знакомые слова, числа или действия: они подскажут начало.",
    "Попробуй проговорить ход решения вслух, словно объясняешь его другу.",
    "Не нужно делать всё сразу. Один понятный шаг уже продвигает вперёд.",
    "После объяснения реши ещё один похожий пример, чтобы закрепить способ.",
    "Отметь, где именно нужна помощь: в условии, правиле или вычислениях.",
    "Попросить повторить объяснение — это разумный шаг, а не повод стесняться.",
    "Выбери удобный способ: рисунок, схема, запись или объяснение словами.",
    "Проверь, правильно ли ты понял условие, прежде чем начинать решение.",
    "Потренируй один небольшой навык, а потом проверь, что изменилось.",
    "Попробуй вспомнить похожее задание, которое ты уже решал.",
    "Составь план из двух шагов и выполняй их по очереди.",
    "Можно попросить пример-подсказку, а затем выполнить похожее задание самому.",
    "Тренировка — это способ научиться. Дай себе время, и станет понятнее!"
]
  }
};

// ===== ЛОГИКА СТРАНИЦЫ =====
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const config = TREE_CONFIG;
  const colors = ["green", "yellow", "orange"];
  let leaves = [];
  try {
    const stored = JSON.parse(localStorage.getItem(config.storageKey) || "[]");
    if (Array.isArray(stored)) {
      leaves = stored.filter(item => colors.includes(item.color) && Number.isFinite(item.x) && Number.isFinite(item.y)).slice(0, config.maxLeaves);
    }
  } catch { /* Повреждённое сохранение не мешает запуску */ }

  let soundOn = config.soundEnabledByDefault;
  let musicOn = config.musicEnabledByDefault;
  let toastTimer = 0;
  const bg = new Audio(config.paths.music);
  bg.loop = true;
  bg.volume = config.volumes.music;
  const wind = new Audio(config.paths.sounds.wind);
  wind.loop = true;
  wind.volume = config.volumes.wind;

  function play(path, volume) {
    if (!soundOn || !path) return;
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(() => {});
  }
  function syncWind() {
    if (soundOn && config.sounds.windEnabledWithEffects) wind.play().catch(() => {});
    else { wind.pause(); wind.currentTime = 0; }
  }
  function saveLeaves() {
    try { localStorage.setItem(config.storageKey, JSON.stringify(leaves)); } catch {}
  }
  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function loadDeckState() {
    try {
      const value = JSON.parse(localStorage.getItem(config.messageStorageKey) || "null");
      if (value && value.bags && value.last) return value;
    } catch {}
    return { bags: { green: [], yellow: [], orange: [] }, last: { green: "", yellow: "", orange: "" } };
  }
  let deckState = loadDeckState();
  function saveDeckState() {
    try { localStorage.setItem(config.messageStorageKey, JSON.stringify(deckState)); } catch {}
  }
  function nextMessage(color) {
    let bag = deckState.bags[color];
    if (!Array.isArray(bag) || bag.length === 0) {
      bag = shuffle(config.messages[color]);
      // На границе нового круга не повторяем сообщение, которое звучало последним.
      if (bag.length > 1 && bag[bag.length - 1] === deckState.last[color]) {
        const swapIndex = Math.floor(Math.random() * (bag.length - 1));
        [bag[bag.length - 1], bag[swapIndex]] = [bag[swapIndex], bag[bag.length - 1]];
      }
    }
    const message = bag.pop();
    deckState.bags[color] = bag;
    deckState.last[color] = message;
    saveDeckState();
    return message;
  }
  function showToast(color) {
    const toast = $("#toast");
    const icon = { green: "🌟", yellow: "💛", orange: "🌱" }[color];
    $("#toast-icon").textContent = icon;
    $("#toast-message").textContent = nextMessage(color);
    toast.hidden = false;
    toast.classList.remove("is-visible");
    // Перезапуск CSS-анимации при быстром выборе следующего листочка.
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, config.toastDurationMs);
  }
  function hideToast() {
    const toast = $("#toast");
    toast.classList.remove("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 260);
  }
  function coordinates(index) {
      const {
          centerX,
          centerY,
          radiusX,
          radiusY
      } = config.canopy;

      // Минимальное расстояние между центрами листьев
      const minDistance = 10;

      let bestPosition = null;
      let bestDistance = -1;

      // Пробуем найти свободное место
      for (let attempt = 0; attempt < 50; attempt++) {
          // Случайный угол
          const angle = Math.random() * Math.PI * 2;

          // Распределяем листья по всей площади кроны
          const radius = Math.sqrt(Math.random());

          const candidate = {
              x: centerX + Math.cos(angle) * radius * radiusX,
              y: centerY + Math.sin(angle) * radius * radiusY
          };

          // Определяем расстояние до ближайшего листа
          const nearestDistance = leaves.length
              ? Math.min(
                  ...leaves.map(leaf =>
                      Math.hypot(
                          (candidate.x - leaf.x) * 0.83,
                          candidate.y - leaf.y
                      )
                  )
              )
              : Infinity;

          // Нашли достаточно свободное место
          if (nearestDistance >= minDistance) {
              return candidate;
          }

          // Запоминаем наиболее свободное из проверенных мест
          if (nearestDistance > bestDistance) {
              bestDistance = nearestDistance;
              bestPosition = candidate;
          }
      }

      // Если свободного места нет, выбираем лучшее из найденных
      return bestPosition ?? {
          x: centerX,
          y: centerY
      };
  }
  function render() {
    const area = $("#leaves");
    area.replaceChildren();
    const counts = { green: 0, yellow: 0, orange: 0 };
    leaves.forEach((leaf, index) => {
      counts[leaf.color]++;
      const image = document.createElement("img");
      image.className = `leaf leaf--${leaf.color}`;
      image.src = config.paths.leaves[leaf.color];
      image.alt = "";
      image.draggable = false;
      image.style.left = `${leaf.x}%`;
      image.style.top = `${leaf.y}%`;
      image.style.setProperty("--rot", `${(index * 137.5 % 110) - 55}deg`);
      image.style.animationDelay = `${Math.min(index * 8, 260)}ms`;
      area.append(image);
    });
    colors.forEach(color => { $(`#${color}-count`).textContent = counts[color]; });
    $("#total-count").textContent = leaves.length;
    $("#undo").disabled = leaves.length === 0;
    saveLeaves();
  }
  $(".choices").addEventListener("click", event => {
    const button = event.target.closest("button[data-color]");
    if (!button) return;
    if (leaves.length >= config.maxLeaves) {
      $("#feedback").textContent = "Дерево уже полно листочков! Можно сохранить общий результат или начать новое дерево.";
      return;
    }
    const color = button.dataset.color;
    leaves.push({ color, ...coordinates(leaves.length) });
    play(config.paths.sounds.select, config.volumes.select);
    render();
    window.setTimeout(() => play(config.paths.sounds.leafFlip, config.volumes.leafFlip), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240);
    const shortFeedback = {
      green: "Твоя победа украсила наше дерево!",
      yellow: "Стараться и замечать трудности — тоже успех.",
      orange: "Теперь у тебя есть идея, что потренировать дальше."
    };
    $("#feedback").textContent = shortFeedback[color];
    showToast(color);
  });
  $("#undo").addEventListener("click", () => {
    if (!leaves.length) return;
    leaves.pop();
    render();
    $("#feedback").textContent = "Последний листочек убран. Можно выбрать другой ответ.";
  });
  $("#reset").addEventListener("click", () => {
    if (leaves.length && !confirm("Начать новое дерево? Все листочки этого класса исчезнут.")) return;
    leaves = [];
    render();
    $("#feedback").textContent = "Новое дерево готово к успехам следующего урока!";
  });
  $("#sound").addEventListener("click", () => {
    soundOn = !soundOn;
    $("#sound").textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
    $("#sound").setAttribute("aria-pressed", String(soundOn));
    syncWind();
    if (soundOn) play(config.paths.sounds.select, config.volumes.select);
  });
  $("#music").addEventListener("click", async () => {
    musicOn = !musicOn;
    if (musicOn) {
      try { await bg.play(); }
      catch {
        musicOn = false;
      }
    } else {
      bg.pause();
    }
    $("#music").textContent = musicOn ? "♫ Музыка ✓" : "♫ Музыка";
    $("#music").setAttribute("aria-pressed", String(musicOn));
  });
  $("#toast-close").addEventListener("click", hideToast);
  $("#year").textContent = new Date().getFullYear();
  render();
})();
