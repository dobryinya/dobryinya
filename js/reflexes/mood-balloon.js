// =========================
// КОНФИГУРАЦИЯ ИГРЫ
// Пути, громкость, анимация и тексты можно менять здесь.
// =========================
const MOOD_BALLOON_CONFIG = {
  assets: {
    avatar: "/images/fav.png",
    balloons: "/images/reflexes/mood-balloon/",
  },
  sounds: {
    confirm: "/sounds/1.mp3",
    launch: "/sounds/ruhthrow.mp3",
    arrival: "/sounds/taiga-win.mp3",
    wind: "/sounds/eagle-wind.mp3",
  },
  // Укажи путь после добавления общей фоновой мелодии в /music/.
  // Например: "/music/reflexes-bg.mp3". При пустом значении кнопка музыки скрыта.
  music: {
    path: "",
    volume: 0.14,
    enabledByDefault: false,
  },
  volumes: {
    confirm: 0.38,
    launch: 0.28,
    arrival: 0.24,
    wind: 0.035,
  },
  soundEnabledByDefault: true,
  animation: {
    flightDurationMs: 1050,
    targetWidthDesktop: 130,
    targetWidthMobile: 98,
    tiltDegrees: 5,
    arrivalDelayMs: 80,
  },
  // Раскладка накопленных шаров на небе. Координаты области — проценты от сцены.
  collection: {
    area: { left: 3, top: 4, width: 94, height: 69 },
    minWidthDesktop: 68,
    minWidthMobile: 52,
    shrinkAfter: 4,
    shrinkPerBalloonDesktop: 1.8,
    shrinkPerBalloonMobile: 1.1,
    placementAttempts: 48,
    jitterX: 8,
    jitterY: 7,
    rotationDegrees: 7,
  },
  moods: {
    happy: {
      title: "Мне радостно",
      image: "balloon-happy.png",
      messageTitle: "Радостный момент — уже часть твоего дня",
      messages: [
        "Здорово, что ты заметил хороший момент урока.",
        "Пусть это приятное чувство останется с тобой и после урока.",
        "Интересно, какой момент оказался самым весёлым?",
        "Когда замечаешь хорошее, его будто становится больше.",
        "Ты нашёл в сегодняшнем уроке что-то, что тебя порадовало.",
        "Поделись этой радостью — возможно, кто-то улыбнётся вместе с тобой.",
        "Приятные моменты помогают помнить, что нового мы пережили и узнали.",
        "Здорово, когда урок оставляет хорошее впечатление.",
        "Что-то получилось, удивило или рассмешило — у каждого своя радость.",
        "Ты сумел заметить то, что подняло тебе настроение.",
        "Пусть таких моментов в школьном дне будет больше.",
        "Радость иногда прячется в маленькой победе. Ты её заметил.",
        "Прекрасно, когда на уроке находится что-то интересное именно для тебя.",
        "Хорошее впечатление тоже стоит запомнить.",
        "Возможно, сегодня ты сделал то, что раньше казалось трудным.",
        "Когда учиться интересно, хочется узнавать ещё больше.",
        "Замечать хорошее — полезная привычка. Сегодня у тебя получилось.",
        "Твой радостный момент может вдохновить и других.",
        "Пусть сегодняшний урок запомнится чем-то приятным.",
        "Здорово, что ты можешь рассказать о своих чувствах.",
        "Радость — хорошая подсказка: вспомни, что именно тебе понравилось.",
        "Каждый урок может подарить маленькое открытие или приятную встречу.",
        "Ты заметил не только задания, но и свои эмоции. Это важно.",
        "Хороший момент уже случился — сохрани его в памяти.",
        "Спасибо, что поделился своим настроением."
      ]
    },
    calm: {
      title: "Я спокоен",
      image: "balloon-calm.png",
      messageTitle: "Спокойствие помогает услышать себя",
      messages: [
        "Спокойное настроение тоже многое говорит о том, как прошёл урок.",
        "Хорошо, когда можно остановиться и понять, что ты чувствуешь.",
        "Возможно, сегодня ты работал в удобном для себя темпе.",
        "Спокойствие помогает собраться с мыслями.",
        "Необязательно испытывать бурю эмоций после каждого урока.",
        "Ты заметил своё состояние и смог назвать его — это полезное умение.",
        "Пусть это спокойствие поможет тебе перейти к новым делам.",
        "Иногда лучший результат — ощущение, что всё идёт своим чередом.",
        "Можно быть спокойным и при этом узнавать много нового.",
        "Прислушиваться к себе важно и в спокойные дни.",
        "У каждого человека свой темп и свой способ переживать события.",
        "Сегодня ты нашёл минутку, чтобы понять своё настроение.",
        "Спокойное состояние может помочь заметить новые детали.",
        "Если захочется, расскажи, что помогло тебе чувствовать себя спокойно.",
        "Не нужно подбирать особенное настроение — достаточно честно заметить своё.",
        "Урок закончился, а у тебя есть время обдумать, что запомнилось.",
        "Ровное настроение — хороший момент, чтобы собрать мысли в порядок.",
        "Ты можешь просто побыть в своём состоянии, не сравнивая себя с другими.",
        "Благодарю за честный ответ: он помогает лучше понимать себя.",
        "Иногда спокойствие приходит, когда всё становится понятнее.",
        "Сегодня ты дал себе возможность прислушаться к собственным ощущениям.",
        "Любое настроение имеет право быть — в том числе спокойное.",
        "Пусть дальше у тебя будет достаточно времени на отдых и новые открытия.",
        "Ты умеешь замечать своё состояние. Это важный навык.",
        "Спасибо, что поделился тем, как чувствуешь себя сейчас."
      ]
    },
    worried: {
      title: "Было непросто",
      image: "balloon-worried.png",
      messageTitle: "Не всё обязано получаться сразу",
      messages: [
        "Спасибо, что честно заметил своё настроение. Это уже важный шаг.",
        "Если что-то осталось непонятным, можно вернуться к этому позже.",
        "Трудный урок не означает, что ты не справишься в следующий раз.",
        "Попробуй вспомнить, какой момент был самым сложным.",
        "Иногда нужно больше времени, чтобы новая тема стала понятной.",
        "Ты можешь попросить объяснить трудный момент ещё раз.",
        "Не обязательно решить всё сразу. Достаточно понять следующий шаг.",
        "Если было непросто, дай себе немного времени перед новой попыткой.",
        "Ошибки и вопросы помогают увидеть, что стоит разобрать подробнее.",
        "Тебе не нужно скрывать трудности — о них можно говорить спокойно.",
        "Подумай, что помогло бы тебе чувствовать себя увереннее на следующем уроке.",
        "Можно начать с небольшого задания и постепенно двигаться дальше.",
        "Если сегодня что-то не вышло, это не отменяет того, что ты уже умеешь.",
        "Сложная задача становится понятнее, когда разбираешь её по частям.",
        "Иногда полезно сделать паузу, а потом попробовать ещё раз.",
        "Ты можешь рассказать, что вызвало затруднение, и вместе найти решение.",
        "Не сравнивай свой путь с чужим — у каждого свой темп обучения.",
        "Главное сейчас — понять, какая помощь или практика тебе пригодится.",
        "То, что пока трудно, может стать знакомым после нескольких попыток.",
        "Ты заслуживаешь поддержки и тогда, когда ответ найти непросто.",
        "Можно не знать ответа сейчас и продолжать учиться дальше.",
        "Признаться, что было сложно, — это честно и смело.",
        "Давай оставим место для вопроса, который ещё хочется разобрать.",
        "Иногда понимание приходит не сразу, а чуть позже — это нормально.",
        "Спасибо, что доверился своему ощущению. С трудностями можно справляться постепенно."
      ]
    }
  },
  question: {
    title: "Что сегодня тебя порадовало?",
    caption: "Маленькая радость тоже важна."
  },
  initial: {
    guide: "Иногда полезно остановиться и прислушаться к себе.",
    title: "Добрыня рядом",
    message: "Настроение бывает разным. Важно заметить, что ты чувствуешь."
  }
};

// =========================
// ЛОГИКА ИГРЫ
// =========================
(() => {
  "use strict";

  const cfg = MOOD_BALLOON_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = $("#sky-stage");
  const balloonLayer = $("#floating-balloon-layer");
  const soundButton = $("#sound-toggle");
  const musicButton = $("#music-toggle");
  const question = $("#reflection-question");
  const againButton = $("#choose-again");
  const activeDecks = {};
  let soundOn = cfg.soundEnabledByDefault;
  let musicOn = cfg.music.enabledByDefault;
  let windAudio = null;
  let musicAudio = null;
  let flightToken = 0;
  let pending = false;
  // Координаты шаров, уже оставшихся на небе.
  const landedBalloons = [];

  for (const [key, mood] of Object.entries(cfg.moods)) activeDecks[key] = [];
  $("#year").textContent = new Date().getFullYear();

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function nextMessage(key) {
    const mood = cfg.moods[key];
    if (!activeDecks[key].length) activeDecks[key] = shuffle(mood.messages);
    return activeDecks[key].pop();
  }

  function playSound(name) {
    if (!soundOn) return;
    const path = cfg.sounds[name];
    if (!path) return;
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = cfg.volumes[name] ?? 0.25;
    audio.play().catch(error => console.warn(`[Воздушный шар настроения] Не удалось воспроизвести звук ${path}`, error));
  }

  function startWind() {
    if (!soundOn || windAudio) return;
    windAudio = new Audio(cfg.sounds.wind);
    windAudio.loop = true;
    windAudio.volume = cfg.volumes.wind;
    windAudio.play().catch(error => {
      console.warn(`[Воздушный шар настроения] Не удалось воспроизвести фоновый ветер ${cfg.sounds.wind}`, error);
      if (windAudio) { windAudio.pause(); windAudio = null; }
    });
  }

  function stopWind() {
    if (!windAudio) return;
    windAudio.pause();
    windAudio.currentTime = 0;
    windAudio = null;
  }

  function setMessage(title, text) {
    $("#message-title").textContent = title;
    $("#message-text").textContent = text;
    $("#dobrynya-message").textContent = text;
  }

  function updateMoodCards() {
    $$(".mood-card").forEach(card => {
      const hasMood = landedBalloons.some(balloon => balloon.key === card.dataset.mood);
      card.classList.toggle("is-selected", hasMood);
      card.setAttribute("aria-pressed", String(hasMood));
      card.disabled = pending;
    });
    againButton.disabled = pending;
    againButton.hidden = landedBalloons.length === 0;
  }

  function clearMood() {
    if (pending) return;
    flightToken++;
    landedBalloons.splice(0, landedBalloons.length);
    balloonLayer.replaceChildren();
    stage.classList.remove("has-balloon");
    question.hidden = true;
    againButton.hidden = true;
    $("#sky-copy").hidden = false;
    setMessage(cfg.initial.title, cfg.initial.message);
    $(".sky-copy strong").textContent = "У каждого настроения есть место";
    $(".sky-copy span:last-child").textContent = "Прислушайся к себе";
    updateMoodCards();
  }

  function getBalloonWidth() {
    const mobile = window.matchMedia("(max-width: 780px)").matches;
    const base = mobile ? cfg.animation.targetWidthMobile : cfg.animation.targetWidthDesktop;
    const minimum = mobile ? cfg.collection.minWidthMobile : cfg.collection.minWidthDesktop;
    const shrink = mobile ? cfg.collection.shrinkPerBalloonMobile : cfg.collection.shrinkPerBalloonDesktop;
    const reduction = Math.max(0, landedBalloons.length - cfg.collection.shrinkAfter) * shrink;
    return Math.max(minimum, base - reduction);
  }

  function findLandingPosition(width) {
    const bounds = stage.getBoundingClientRect();
    const area = cfg.collection.area;
    const balloonHeight = width * (620 / 480);
    const minX = bounds.width * area.left / 100;
    const minY = bounds.height * area.top / 100;
    const maxX = Math.max(minX, bounds.width * (area.left + area.width) / 100 - width);
    const maxY = Math.max(minY, bounds.height * (area.top + area.height) / 100 - balloonHeight);
    let best = null;
    let bestClearance = -Infinity;

    for (let attempt = 0; attempt < cfg.collection.placementAttempts; attempt++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      const centerX = x + width / 2;
      const centerY = y + balloonHeight / 2;
      let clearance = Infinity;

      for (const balloon of landedBalloons) {
        const oldHeight = balloon.width * (620 / 480);
        const dx = centerX - (balloon.x + balloon.width / 2);
        const dy = centerY - (balloon.y + oldHeight / 2);
        const distance = Math.hypot(dx * 0.86, dy);
        const required = (width + balloon.width) * 0.43;
        clearance = Math.min(clearance, distance - required);
      }

      if (!landedBalloons.length) clearance = Infinity;
      if (clearance > bestClearance) {
        bestClearance = clearance;
        best = { x, y };
      }
      // Ищем свободное место, но при заполненном небе допускаем наложение.
      if (clearance > Math.max(12, width * 0.08)) {
        best = { x, y };
        break;
      }
    }

    const jitterX = (Math.random() * 2 - 1) * cfg.collection.jitterX;
    const jitterY = (Math.random() * 2 - 1) * cfg.collection.jitterY;
    return {
      x: Math.max(minX, Math.min(maxX, (best?.x ?? minX) + jitterX)),
      y: Math.max(minY, Math.min(maxY, (best?.y ?? minY) + jitterY)),
    };
  }

  function createLandingBalloon(key, x, y, width) {
    const mood = cfg.moods[key];
    const image = document.createElement("img");
    image.className = "sky-balloon";
    image.src = cfg.assets.balloons + mood.image;
    image.alt = mood.title;
    image.draggable = false;
    image.style.width = `${width}px`;
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
    image.style.setProperty("--balloon-tilt", `${(Math.random() * 2 - 1) * cfg.collection.rotationDegrees}deg`);
    image.style.animationDuration = `${3.3 + Math.random() * 1.8}s`;
    image.style.animationDelay = `${-Math.random() * 3.5}s`;
    balloonLayer.append(image);
    landedBalloons.push({ key, x, y, width, element: image });
  }

  function animateFlight(key, sourceImage, runId, target) {
    return new Promise(resolve => {
      const source = sourceImage.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const targetWidth = target.width;
      const targetLeft = target.x;
      const targetTop = target.y;
      const targetHeight = targetWidth * (620 / 480);
      const flight = document.createElement("img");
      flight.className = "flying-balloon";
      flight.src = cfg.assets.balloons + cfg.moods[key].image;
      flight.alt = "";
      flight.style.left = `${source.left}px`;
      flight.style.top = `${source.top}px`;
      flight.style.width = `${source.width}px`;
      document.body.append(flight);
      playSound("launch");

      const finish = () => {
        flight.remove();
        if (runId === flightToken) {
          createLandingBalloon(key, targetLeft, targetTop, targetWidth);
          playSound("arrival");
          stage.classList.add("has-balloon");
        }
        resolve();
      };

      if (reducedMotion) {
        finish();
        return;
      }

      const scale = targetWidth / source.width;
      const dx = (stageRect.left + targetLeft + targetWidth / 2) - (source.left + source.width / 2);
      const dy = (stageRect.top + targetTop + targetHeight / 2) - (source.top + source.height / 2);
      flight.style.transition = `transform ${cfg.animation.flightDurationMs}ms cubic-bezier(.18,.76,.25,1), opacity ${cfg.animation.flightDurationMs}ms ease`;
      requestAnimationFrame(() => {
        flight.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${cfg.animation.tiltDegrees}deg)`;
        flight.style.opacity = "1";
      });
      window.setTimeout(finish, cfg.animation.flightDurationMs + cfg.animation.arrivalDelayMs);
    });
  }

  async function selectMood(card) {
    if (pending) return;
    const key = card.dataset.mood;
    if (!cfg.moods[key]) return;
    const runId = ++flightToken;
    pending = true;
    updateMoodCards();

    const targetWidth = getBalloonWidth();
    const target = { ...findLandingPosition(targetWidth), width: targetWidth };
    $(".sky-copy strong").textContent = cfg.moods[key].title;
    $(".sky-copy span:last-child").textContent = "Твоё настроение летит в небо";
    startWind();
    playSound("confirm");

    await animateFlight(key, $("img", card), runId, target);
    if (runId !== flightToken) {
      pending = false;
      updateMoodCards();
      return;
    }

    const mood = cfg.moods[key];
    setMessage(mood.messageTitle, nextMessage(key));
    $(".question-kicker").textContent = "Вспомни один момент";
    $(".reflection-question h3").textContent = cfg.question.title;
    $(".question-caption").textContent = cfg.question.caption;
    question.hidden = false;
    pending = false;
    updateMoodCards();
    againButton.hidden = false;
  }

  $$(".mood-card").forEach(card => card.addEventListener("click", () => selectMood(card)));
  againButton.addEventListener("click", clearMood);
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundButton.textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.setAttribute("aria-pressed", String(soundOn));
    soundButton.textContent = soundOn ? "🔊 Звуки" : "🔇 Звуки";
    if (soundOn) { startWind(); playSound("confirm"); }
    else stopWind();
  });

  if (cfg.music.path) {
    musicAudio = new Audio(cfg.music.path);
    musicAudio.loop = true;
    musicAudio.volume = cfg.music.volume;
    musicButton.hidden = false;
    musicButton.setAttribute("aria-pressed", String(musicOn));
    musicButton.textContent = musicOn ? "♫ Музыка: вкл." : "♫ Музыка";
    musicButton.addEventListener("click", () => {
      musicOn = !musicOn;
      musicButton.setAttribute("aria-pressed", String(musicOn));
      musicButton.textContent = musicOn ? "♫ Музыка: вкл." : "♫ Музыка";
      if (musicOn) musicAudio.play().catch(error => {
        console.warn(`[Воздушный шар настроения] Не удалось воспроизвести музыку ${cfg.music.path}`, error);
        musicOn = false;
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.textContent = "♫ Музыка";
      });
      else { musicAudio.pause(); musicAudio.currentTime = 0; }
    });
  } else {
    musicButton.hidden = true;
  }
})();
