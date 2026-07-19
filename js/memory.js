(function() {
  "use strict";

  const TOTAL_PAIRS = 8;
  const MAX_LIVES = 4;
  const POINTS_PER_PAIR = 100;

  const PREVIEW_TIME = 6700;
  const WAVE_CLOSE_STEP = 90;
  const WRONG_CLOSE_DELAY = 500;
  const RESULT_DELAY = 950;
  const CLICK_LOCK_TIME = 430;

  const MUSIC_VOLUME = 0.22;
  const FLIP_VOLUME = 0.62;
  const ERROR_VOLUME = 0.62;

  const ASSETS = {
    music: "music/memory.mp3",
    flipSound: "sounds/flip.mp3",
    errorSound: "sounds/err.mp3",
    fieldBackground: "images/memory/membg.png",
    cardBack: "images/memory/tail.png",
    icon: "images/memory/tail.png",
    cards: [
      "images/memory/1m.png",
      "images/memory/2m.png",
      "images/memory/3m.png",
      "images/memory/4m.png",
      "images/memory/5m.png",
      "images/memory/6m.png",
      "images/memory/7m.png",
      "images/memory/8m.png"
    ]
  };

  const state = {
    running: false,
    locked: false,
    score: 0,
    lives: MAX_LIVES,
    pairsFound: 0,
    opened: [],
    cards: [],
    timers: [],
    finishing: false
  };

  const startScreen = document.getElementById("memory-start");
  const gameShell = document.getElementById("memory-shell");
  const resultScreen = document.getElementById("memory-result");
  const field = document.getElementById("memory-field");
  const grid = document.getElementById("memory-grid");
  const messageEl = document.getElementById("memory-message");
  const scoreEl = document.getElementById("memory-score");
  const livesEl = document.getElementById("memory-lives");
  const pairsEl = document.getElementById("memory-pairs");
  const hintEl = document.getElementById("memory-hint");
  const finalScoreEl = document.getElementById("memory-final-score");
  const resultLabelEl = document.getElementById("memory-result-label");
  const resultTitleEl = document.getElementById("memory-result-title");
  const resultTextEl = document.getElementById("memory-result-text");
  const startBtn = document.getElementById("memory-start-btn");
  const restartBtn = document.getElementById("memory-restart-btn");
  const resultRestartBtn = document.getElementById("memory-result-restart-btn");

  const music = new Audio(ASSETS.music);
  music.loop = true;
  music.volume = MUSIC_VOLUME;
  music.preload = "auto";

  const flipSound = new Audio(ASSETS.flipSound);
  flipSound.volume = FLIP_VOLUME;
  flipSound.preload = "auto";

  const errorSound = new Audio(ASSETS.errorSound);
  errorSound.volume = ERROR_VOLUME;
  errorSound.preload = "auto";

  function initNavigation() {
    const navEl = document.querySelector(".top-nav");
    const burgerEl = document.getElementById("nav-burger");
    const menuEl = document.getElementById("nav-menu");

    if (!(navEl instanceof HTMLElement) || !(burgerEl instanceof HTMLButtonElement) || !(menuEl instanceof HTMLElement)) {
      return;
    }

    function isMobile() {
      return window.matchMedia("(max-width: 700px)").matches;
    }

    function closeMenu() {
      navEl.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      burgerEl.setAttribute("aria-expanded", "false");
      burgerEl.setAttribute("aria-label", "Открыть меню");
    }

    function openMenu() {
      navEl.classList.add("is-open");
      document.body.classList.add("nav-open");
      burgerEl.setAttribute("aria-expanded", "true");
      burgerEl.setAttribute("aria-label", "Закрыть меню");
    }

    burgerEl.addEventListener("click", function() {
      if (navEl.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuEl.addEventListener("click", function(event) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest(".top-nav__link") && isMobile()) {
        closeMenu();
      }
    });

    document.addEventListener("click", function(event) {
      if (!isMobile() || !navEl.classList.contains("is-open")) {
        return;
      }
      if (event.target instanceof Node && !navEl.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function() {
      if (!isMobile()) {
        closeMenu();
      }
    });
  }

  function initYear() {
    const yearEl = document.getElementById("year");
    if (yearEl instanceof HTMLElement) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function randomShuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function setTimer(callback, delay) {
    const id = window.setTimeout(function() {
      state.timers = state.timers.filter(function(timerId) {
        return timerId !== id;
      });
      callback();
    }, delay);
    state.timers.push(id);
    return id;
  }

  function clearTimers() {
    state.timers.forEach(function(id) {
      window.clearTimeout(id);
    });
    state.timers = [];
  }

  function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(function() {});
  }

  function startMusic() {
    music.pause();
    music.currentTime = 0;
    music.play().catch(function() {});
  }

  function stopMusic() {
    music.pause();
    music.currentTime = 0;
  }

  function updateHud() {
    if (scoreEl instanceof HTMLElement) {
      scoreEl.textContent = String(state.score);
    }

    if (livesEl instanceof HTMLElement) {
      const hearts = "❤️".repeat(Math.max(0, state.lives));
      const empty = "🤍".repeat(Math.max(0, MAX_LIVES - state.lives));
      livesEl.textContent = hearts + empty;
    }

    if (pairsEl instanceof HTMLElement) {
      pairsEl.textContent = String(state.pairsFound);
    }
  }

  function showMessage(text, hidden) {
    if (!(messageEl instanceof HTMLElement)) {
      return;
    }
    messageEl.textContent = text;
    messageEl.hidden = hidden;
  }

  function buildDeck() {
    const pairs = [];
    ASSETS.cards.forEach(function(src, index) {
      pairs.push({ pairId: index + 1, src: src });
      pairs.push({ pairId: index + 1, src: src });
    });
    return randomShuffle(pairs).map(function(card, index) {
      return {
        id: index + 1,
        pairId: card.pairId,
        src: card.src,
        matched: false,
        open: true,
        el: null
      };
    });
  }

  function renderCards() {
    if (!(grid instanceof HTMLElement)) {
      return;
    }

    grid.innerHTML = "";

    state.cards.forEach(function(card, index) {
      const button = document.createElement("button");
      button.className = "memory-card is-preview is-open";
      button.type = "button";
      button.dataset.id = String(card.id);
      button.style.animationDelay = Math.min(index * 28, 360) + "ms";
      button.setAttribute("aria-label", "Карточка ремесла");

      const inner = document.createElement("span");
      inner.className = "memory-card__inner";

      const back = document.createElement("span");
      back.className = "memory-card__side memory-card__back";

      const backImg = document.createElement("img");
      backImg.src = ASSETS.cardBack;
      backImg.alt = "Рубашка карточки";
      backImg.draggable = false;
      back.appendChild(backImg);

      const front = document.createElement("span");
      front.className = "memory-card__side memory-card__front";

      const frontImg = document.createElement("img");
      frontImg.src = card.src;
      frontImg.alt = "Предмет ремесла";
      frontImg.draggable = false;
      front.appendChild(frontImg);

      inner.append(back, front);
      button.appendChild(inner);
      button.addEventListener("click", function() {
        handleCardClick(card.id);
      });

      card.el = button;
      grid.appendChild(button);
    });
  }

  function setCardOpen(card, open) {
    card.open = open;
    if (!(card.el instanceof HTMLElement)) {
      return;
    }
    card.el.classList.toggle("is-open", open);
    card.el.classList.toggle("is-preview", false);
  }

  function lockField(locked) {
    state.locked = locked;
    if (field instanceof HTMLElement) {
      field.classList.toggle("is-locked", locked);
    }
  }

  function closePreviewWave() {
    showMessage("Ищи пары!", false);

    state.cards.forEach(function(card, index) {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const delay = (row * 4 + col) * WAVE_CLOSE_STEP;

      setTimer(function() {
        setCardOpen(card, false);
        if (index === state.cards.length - 1) {
          setTimer(function() {
            showMessage("", true);
            lockField(false);
            if (hintEl instanceof HTMLElement) {
              hintEl.textContent = "Открывай по две карточки и находи одинаковые пары.";
            }
          }, 420);
        }
      }, delay);
    });
  }

  function handleCardClick(id) {
    if (!state.running || state.locked || state.finishing) {
      return;
    }

    const card = state.cards.find(function(item) {
      return item.id === id;
    });

    if (!card || card.matched || card.open || state.opened.length >= 2) {
      return;
    }

    playSound(flipSound);
    setCardOpen(card, true);
    state.opened.push(card);

    if (state.opened.length === 2) {
      lockField(true);
      setTimer(checkOpenedCards, CLICK_LOCK_TIME);
    }
  }

  function checkOpenedCards() {
    if (state.opened.length !== 2) {
      lockField(false);
      return;
    }

    const first = state.opened[0];
    const second = state.opened[1];

    if (first.pairId === second.pairId) {
      handleMatch(first, second);
    } else {
      handleWrong(first, second);
    }
  }

  function handleMatch(first, second) {
    first.matched = true;
    second.matched = true;

    [first, second].forEach(function(card) {
      if (card.el instanceof HTMLElement) {
        card.el.classList.add("is-matched", "is-match-pop");
        setTimer(function() {
          card.el.classList.remove("is-match-pop");
        }, 520);
      }
    });

    state.score += POINTS_PER_PAIR;
    state.pairsFound += 1;
    state.opened = [];
    updateHud();

    if (state.pairsFound >= TOTAL_PAIRS) {
      finishWin();
      return;
    }

    lockField(false);
  }

  function handleWrong(first, second) {
    playSound(errorSound);

    state.lives = Math.max(0, state.lives - 1);
    state.score = Math.floor(state.score / 2);
    updateHud();

    [first, second].forEach(function(card) {
      if (card.el instanceof HTMLElement) {
        card.el.classList.add("is-wrong");
      }
    });

    setTimer(function() {
      [first, second].forEach(function(card) {
        if (card.el instanceof HTMLElement) {
          card.el.classList.remove("is-wrong");
        }
        setCardOpen(card, false);
      });

      state.opened = [];

      if (state.lives <= 0) {
        finishLose();
        return;
      }

      lockField(false);
    }, WRONG_CLOSE_DELAY);
  }

  function finishWin() {
    state.finishing = true;
    lockField(true);
    showMessage("Кладовая собрана!", false);

    state.cards.forEach(function(card, index) {
      if (!(card.el instanceof HTMLElement)) {
        return;
      }
      const row = Math.floor(index / 4);
      const col = index % 4;
      card.el.style.animationDelay = (row * 80 + col * 40) + "ms";
      card.el.classList.add("is-win-wave");
    });

    setTimer(function() {
      showResult("win");
    }, RESULT_DELAY);
  }

  function finishLose() {
    state.finishing = true;
    lockField(true);
    if (field instanceof HTMLElement) {
      field.classList.add("is-lost");
    }
    showMessage("Попытки закончились!", false);

    setTimer(function() {
      showResult("lose");
    }, RESULT_DELAY);
  }

  function showResult(type) {
    state.running = false;
    stopMusic();

    if (gameShell instanceof HTMLElement) {
      gameShell.hidden = true;
    }

    if (resultScreen instanceof HTMLElement) {
      resultScreen.hidden = false;
    }

    if (finalScoreEl instanceof HTMLElement) {
      finalScoreEl.textContent = String(state.score);
    }

    if (resultLabelEl instanceof HTMLElement) {
      resultLabelEl.textContent = type === "win" ? "Победа" : "Поражение";
    }

    if (resultTitleEl instanceof HTMLElement) {
      resultTitleEl.textContent = type === "win" ? "Отличная память!" : "Кладовая пока не открылась";
    }

    if (resultTextEl instanceof HTMLElement) {
      if (type === "win") {
        if (state.lives === MAX_LIVES) {
          resultTextEl.textContent = "Ты собрал всю кладовую ремёсел без единой ошибки. Великолепный результат!";
        } else {
          resultTextEl.textContent = "Ты собрал всю кладовую ремёсел. Ещё немного внимательности — и результат станет ещё выше.";
        }
      } else {
        resultTextEl.textContent = "Попробуй ещё раз: запоминай расположение карточек и открывай пары аккуратнее.";
      }
    }
  }

  function clearGame() {
    clearTimers();
    stopMusic();

    state.running = false;
    state.locked = false;
    state.score = 0;
    state.lives = MAX_LIVES;
    state.pairsFound = 0;
    state.opened = [];
    state.cards = [];
    state.finishing = false;

    if (grid instanceof HTMLElement) {
      grid.innerHTML = "";
    }

    if (field instanceof HTMLElement) {
      field.classList.remove("is-locked", "is-lost");
    }

    showMessage("", true);
    updateHud();
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    state.running = true;
    state.locked = true;
    state.cards = buildDeck();

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    renderCards();
    updateHud();
    showMessage("Запоминай карточки!", false);

    if (hintEl instanceof HTMLElement) {
      hintEl.textContent = "Запомни карточки: через 2 секунды они перевернутся.";
    }

    startMusic();

    setTimer(function() {
      if (!state.running) {
        return;
      }
      closePreviewWave();
    }, PREVIEW_TIME);
  }

  function bindEvents() {
    if (startBtn instanceof HTMLButtonElement) {
      startBtn.addEventListener("click", startGame);
    }

    if (restartBtn instanceof HTMLButtonElement) {
      restartBtn.addEventListener("click", startGame);
    }

    if (resultRestartBtn instanceof HTMLButtonElement) {
      resultRestartBtn.addEventListener("click", startGame);
    }
  }

  function preloadAssets() {
    [ASSETS.cardBack, ASSETS.fieldBackground, ASSETS.icon].concat(ASSETS.cards).forEach(function(src) {
      const img = new Image();
      img.src = src;
    });
  }

  function init() {
    initNavigation();
    initYear();
    preloadAssets();
    bindEvents();
    updateHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
