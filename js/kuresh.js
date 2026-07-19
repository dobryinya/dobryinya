(function() {
  "use strict";

  const GAME_DURATION = 40;
  const START_DELAY = 850;

  const PLAYER_CLICK_MIN = 5.15;
  const PLAYER_CLICK_MAX = 9.65;
  const PLAYER_FORCE_DECAY = 10.5;

  const BOT_TICK_MIN = 70;
  const BOT_TICK_MAX = 125;
  const BOT_FORCE_MIN = 1.2;
  const BOT_FORCE_MAX = 3.15;
  const BOT_FORCE_DECAY = 12.5;
  const BOT_SURGE_MIN_TIME = 1700;
  const BOT_SURGE_MAX_TIME = 3600;
  const BOT_SURGE_MIN = 7.5;
  const BOT_SURGE_MAX = 13.5;

  const MAX_FORCE = 100;
  const SHIFT_LIMIT = 230;
  const SHIFT_SPEED = 0.58;
  const WIN_DELAY = 2200;
  const FRAME_INTERVAL = 230;
  const CLICK_POP_TIME = 440;

  const MUSIC = "music/fighters.mp3";
  const CROWD_SOUND = "sounds/tolpa.mp3";
  const BONK_SOUND = "sounds/bonk.mp3";

  const IMAGES = {
    player: "images/fighter1.png",
    playerStep: "images/fighter1f.png",
    playerWin: "images/win1.png",
    playerLose: "images/lose1.png",
    bot: "images/fighter2.png",
    botStep: "images/fighter2f.png",
    botWin: "images/win2.png",
    botLose: "images/lose2.png",
    rope: "images/tros.png",
    background: "images/fightersbg.png"
  };

  const state = {
    running: false,
    active: false,
    finished: false,
    timeLeft: GAME_DURATION,
    playerForce: 0,
    botForce: 0,
    shift: 0,
    timerId: 0,
    botTickId: 0,
    botSurgeId: 0,
    animationFrame: 0,
    lastFrameTime: 0,
    lastStepSwitch: 0,
    stepFrame: 0,
    finishDelayId: 0
  };

  const startScreen = document.getElementById("kuresh-start");
  const gameShell = document.getElementById("kuresh-shell");
  const resultScreen = document.getElementById("kuresh-result");
  const field = document.getElementById("kuresh-field");
  const tug = document.getElementById("kuresh-tug");
  const overlay = document.getElementById("kuresh-overlay");
  const playerImg = document.getElementById("kuresh-fighter-left");
  const botImg = document.getElementById("kuresh-fighter-right");
  const timeEl = document.getElementById("kuresh-time");
  const positionEl = document.getElementById("kuresh-position");
  const playerForceBar = document.getElementById("kuresh-player-force");
  const botForceBar = document.getElementById("kuresh-bot-force");
  const playerForceText = document.getElementById("kuresh-player-force-text");
  const botForceText = document.getElementById("kuresh-bot-force-text");
  const startBtn = document.getElementById("kuresh-start-btn");
  const restartBtn = document.getElementById("kuresh-restart-btn");
  const resultRestartBtn = document.getElementById("kuresh-result-restart-btn");
  const resultLabel = document.getElementById("kuresh-result-label");
  const resultTitle = document.getElementById("kuresh-result-title");
  const resultText = document.getElementById("kuresh-result-text");
  const hintEl = document.getElementById("kuresh-hint");

  const music = new Audio(MUSIC);
  music.loop = true;
  music.volume = 0.38;
  music.preload = "auto";

  const crowdSound = new Audio(CROWD_SOUND);
  crowdSound.loop = true;
  crowdSound.volume = 0.18;
  crowdSound.preload = "auto";

  const bonkSound = new Audio(BONK_SOUND);
  bonkSound.volume = 0.85;
  bonkSound.preload = "auto";

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const rest = safe % 60;
    return String(minutes).padStart(2, "0") + ":" + String(rest).padStart(2, "0");
  }

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

  function playLoopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(function() {});
  }

  function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  function updateHud() {
    if (timeEl) {
      timeEl.textContent = formatTime(state.timeLeft);
    }

    if (positionEl) {
      const percent = Math.round(state.shift / SHIFT_LIMIT * 100);
      positionEl.textContent = percent + "%";
    }

    const playerPercent = clamp(state.playerForce, 0, MAX_FORCE);
    const botPercent = clamp(state.botForce, 0, MAX_FORCE);

    if (playerForceBar) {
      playerForceBar.style.width = playerPercent + "%";
    }

    if (botForceBar) {
      botForceBar.style.width = botPercent + "%";
    }

    if (playerForceText) {
      playerForceText.textContent = String(Math.round(playerPercent));
    }

    if (botForceText) {
      botForceText.textContent = String(Math.round(botPercent));
    }
  }

  function renderScene() {
    if (tug instanceof HTMLElement) {
      tug.style.transform = "translateX(" + state.shift + "px)";
    }
  }

  function setOverlay(text, hidden) {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    overlay.textContent = text;
    overlay.hidden = hidden;
  }

  function setFighterImages(mode) {
    if (!(playerImg instanceof HTMLImageElement) || !(botImg instanceof HTMLImageElement)) {
      return;
    }

    if (mode === "playerWin") {
      playerImg.src = IMAGES.playerWin;
      botImg.src = IMAGES.botLose;
      return;
    }

    if (mode === "botWin") {
      playerImg.src = IMAGES.playerLose;
      botImg.src = IMAGES.botWin;
      return;
    }

    playerImg.src = state.stepFrame ? IMAGES.playerStep : IMAGES.player;
    botImg.src = state.stepFrame ? IMAGES.botStep : IMAGES.bot;
  }

  function addClickPop(x, y) {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    const pop = document.createElement("span");
    pop.className = "kuresh-click-pop";
    pop.textContent = "+сила";
    pop.style.left = x + "px";
    pop.style.top = y + "px";
    field.appendChild(pop);

    window.setTimeout(function() {
      pop.remove();
    }, CLICK_POP_TIME);
  }

  function handlePlayerAction(event) {
    if (!state.running || !state.active || state.finished) {
      return;
    }

    event.preventDefault();

    state.playerForce = clamp(state.playerForce + random(PLAYER_CLICK_MIN, PLAYER_CLICK_MAX), 0, MAX_FORCE);

    if (field instanceof HTMLElement) {
      const rect = field.getBoundingClientRect();
      addClickPop(event.clientX - rect.left, event.clientY - rect.top);
    }

    updateHud();
  }

  function scheduleBotTick() {
    if (!state.running || state.finished) {
      return;
    }

    state.botTickId = window.setTimeout(function() {
      if (state.running && state.active && !state.finished) {
        state.botForce = clamp(state.botForce + random(BOT_FORCE_MIN, BOT_FORCE_MAX), 0, MAX_FORCE);
        updateHud();
      }

      scheduleBotTick();
    }, randomInt(BOT_TICK_MIN, BOT_TICK_MAX));
  }

  function scheduleBotSurge() {
    if (!state.running || state.finished) {
      return;
    }

    state.botSurgeId = window.setTimeout(function() {
      if (state.running && state.active && !state.finished) {
        state.botForce = clamp(state.botForce + random(BOT_SURGE_MIN, BOT_SURGE_MAX), 0, MAX_FORCE);

        if (field instanceof HTMLElement) {
          field.classList.remove("is-bot-surge");
          void field.offsetWidth;
          field.classList.add("is-bot-surge");
        }

        setOverlay("Рывок соперника!", false);
        window.setTimeout(function() {
          if (state.running && state.active) {
            setOverlay("", true);
          }
        }, 520);

        updateHud();
      }

      scheduleBotSurge();
    }, randomInt(BOT_SURGE_MIN_TIME, BOT_SURGE_MAX_TIME));
  }

  function animationLoop(now) {
    if (!state.running) {
      return;
    }
  
    const delta = state.lastFrameTime ? Math.min(0.04, (now - state.lastFrameTime) / 1000) : 0;
    state.lastFrameTime = now;
  
    if (state.active && !state.finished) {
      state.playerForce = clamp(state.playerForce - PLAYER_FORCE_DECAY * delta, 0, MAX_FORCE);
      state.botForce = clamp(state.botForce - BOT_FORCE_DECAY * delta, 0, MAX_FORCE);
  
      const difference = state.playerForce - state.botForce;
      state.shift = clamp(state.shift - difference * SHIFT_SPEED * delta, -SHIFT_LIMIT, SHIFT_LIMIT);
  
      if (now - state.lastStepSwitch >= FRAME_INTERVAL) {
        state.stepFrame = state.stepFrame === 0 ? 1 : 0;
        state.lastStepSwitch = now;
        setFighterImages("walking");
      }
  
      if (state.shift <= -SHIFT_LIMIT) {
        finishGame("bot");
        return;
      }
  
      if (state.shift >= SHIFT_LIMIT) {
        finishGame("player");
        return;
      }
    }
  
    renderScene();
    updateHud();
    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function resolveWinnerByPosition() {
    if (state.shift < -18) {
      return "player";
    }

    if (state.shift > 18) {
      return "bot";
    }

    return state.playerForce >= state.botForce ? "player" : "bot";
  }

  function showResult(winner) {
    const playerWon = winner === "player";

    if (resultLabel) {
      resultLabel.textContent = playerWon ? "Победа" : "Поражение";
    }

    if (resultTitle) {
      resultTitle.textContent = playerWon ? "Ты вывел соперника из равновесия!" : "Соперник устоял";
    }

    if (resultText) {
      if (playerWon) {
        resultText.textContent = "Ты тянул мощнее и удержал темп до конца схватки.";
      } else {
        resultText.textContent = "Попробуй кликать чаще и не давать силе падать слишком низко.";
      }
    }

    if (gameShell instanceof HTMLElement) {
      gameShell.hidden = true;
    }

    if (resultScreen instanceof HTMLElement) {
      resultScreen.hidden = false;
    }
  }

  function finishGame(forcedWinner) {
    if (!state.running || state.finished) {
      return;
    }

    state.finished = true;
    state.active = false;

    const winner = forcedWinner || resolveWinnerByPosition();

    setOverlay(winner === "player" ? "Победа!" : "Соперник победил!", false);
    setFighterImages(winner === "player" ? "playerWin" : "botWin");
    const rope = document.getElementById("kuresh-rope");
    if (rope) {
      rope.style.display = "none";
}
    renderScene();

    window.clearInterval(state.timerId);
    window.clearTimeout(state.botTickId);
    window.clearTimeout(state.botSurgeId);
    state.timerId = 0;
    state.botTickId = 0;
    state.botSurgeId = 0;

    stopAudio(music);
    stopAudio(crowdSound);

    state.finishDelayId = window.setTimeout(function() {
      state.running = false;
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
      showResult(winner);
    }, WIN_DELAY);
  }

  function clearGame() {
    state.running = false;
    state.active = false;
    state.finished = false;
    state.playerForce = 0;
    state.botForce = 0;
    state.shift = 0;
    state.lastFrameTime = 0;
    state.lastStepSwitch = 0;
    state.stepFrame = 0;

    window.clearInterval(state.timerId);
    window.clearTimeout(state.botTickId);
    window.clearTimeout(state.botSurgeId);
    window.clearTimeout(state.finishDelayId);

    state.timerId = 0;
    state.botTickId = 0;
    state.botSurgeId = 0;
    state.finishDelayId = 0;

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    if (field instanceof HTMLElement) {
      field.classList.remove("is-bot-surge");
      field.querySelectorAll(".kuresh-click-pop").forEach(function(node) {
        node.remove();
      });
    }

    stopAudio(music);
    stopAudio(crowdSound);
    stopAudio(bonkSound);
    setOverlay("Жди гонга...", false);
    setFighterImages("walking");
    renderScene();
    updateHud();
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    state.running = true;
    state.active = false;
    state.finished = false;
    state.timeLeft = GAME_DURATION;
    state.playerForce = 0;
    state.botForce = 0;
    state.shift = 0;
    state.lastFrameTime = 0;
    state.lastStepSwitch = performance.now();
    state.stepFrame = 0;

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;
    const rope = document.getElementById("kuresh-rope");
    if (rope) {
      rope.style.display = "";
    }
    setFighterImages("walking");
    renderScene();
    updateHud();
    setOverlay("Готовься...", false);

    if (hintEl instanceof HTMLElement) {
      hintEl.hidden = false;
    }

    playLoopAudio(music);
    playLoopAudio(crowdSound);

    window.setTimeout(function() {
      if (!state.running || state.finished) {
        return;
      }

      bonkSound.currentTime = 0;
      bonkSound.play().catch(function() {});
      setOverlay("ТЯНИ!", false);

      window.setTimeout(function() {
        if (state.running && !state.finished) {
          setOverlay("", true);
        }
      }, 760);

      state.active = true;
      scheduleBotTick();
      scheduleBotSurge();

      state.timerId = window.setInterval(function() {
        state.timeLeft -= 1;
        updateHud();

        if (state.timeLeft <= 0) {
          finishGame();
        }
      }, 1000);
    }, START_DELAY);

    state.animationFrame = window.requestAnimationFrame(animationLoop);
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

    if (field instanceof HTMLElement) {
      field.addEventListener("pointerdown", handlePlayerAction);
      field.addEventListener("keydown", function(event) {
        if (event.key === " " || event.key === "Enter") {
          handlePlayerAction(event);
        }
      });
    }
  }

  function preloadImages() {
    Object.keys(IMAGES).forEach(function(key) {
      const img = new Image();
      img.src = IMAGES[key];
    });
  }

  function init() {
    initNavigation();
    initYear();
    preloadImages();
    bindEvents();
    updateHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
