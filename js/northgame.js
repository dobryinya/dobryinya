(function() {
    "use strict";
  
    const GAME_DURATION = 30;
  
    const MIN_DEER = 4;
    const MAX_DEER = 10;
  
    const FRAME_INTERVAL = 240;
  
    const RESPAWN_MIN = 500;
    const RESPAWN_MAX = 3000;
  
    const DEER_IMAGES = ["images/deer1run.png", "images/deer2run.png"];
    const MUSIC = "music/northgame.mp3";

    const DEER_SIZE_MIN = 72;
    const DEER_SIZE_MAX = 132;
    const DEER_SIZE_FIELD_MIN = 0.09;
    const DEER_SIZE_FIELD_MAX = 0.14;
    const DEER_MOBILE_SCALE = 0.86;
    const DEER_MOBILE_SIZE_MIN = 66;
    const DEER_MOBILE_SIZE_MAX = 108;
  
    const DEER_SPEED_X_MIN = 2.0;
    const DEER_SPEED_X_MAX = 3.5;
    const DEER_SPEED_Y_MIN = 0.25;
    const DEER_SPEED_Y_MAX = 0.72;
  
    const DEER_RANDOM_TURN_X_MIN = -0.35;
    const DEER_RANDOM_TURN_X_MAX = 0.35;
    const DEER_RANDOM_TURN_Y_MIN = -0.28;
    const DEER_RANDOM_TURN_Y_MAX = 0.28;
  
    const DEER_SPEED_X_LIMIT = 1.4;
    const DEER_SPEED_Y_LIMIT = 0.9;
  
    const DEER_TURN_TIME_MIN = 700;
    const DEER_TURN_TIME_MAX = 2100;
    const DEER_START_TURN_TIME_MIN = 700;
    const DEER_START_TURN_TIME_MAX = 1900;
  
    const DEER_TOP_LIMIT = 38;
    const DEER_HEIGHT_RATIO = 0.72;
  
    const HINT_HIDE_TIME = 2200;
    const CATCH_REMOVE_TIME = 160;
    const CATCH_EFFECT_TIME = 460;
  
    const RESULT_SCORE_EXCELLENT = 30;
    const RESULT_SCORE_GOOD = 20;
  
    const state = {
      running: false,
      score: 0,
      timeLeft: GAME_DURATION,
      deer: new Map(),
      nextId: 1,
      animationFrame: 0,
      lastFrameSwitch: 0,
      currentFrame: 0,
      timerId: 0,
      spawnTimers: []
    };
  
    const startScreen = document.getElementById("game-start");
    const gameShell = document.getElementById("game-shell");
    const resultScreen = document.getElementById("game-result");
    const field = document.getElementById("game-field");
    const scoreEl = document.getElementById("game-score");
    const timeEl = document.getElementById("game-time");
    const countEl = document.getElementById("game-count");
    const progressBar = document.getElementById("game-progress-bar");
    const finalScoreEl = document.getElementById("final-score");
    const resultTextEl = document.getElementById("result-text");
    const startBtn = document.getElementById("game-start-btn");
    const restartBtn = document.getElementById("game-restart-btn");
    const resultRestartBtn = document.getElementById("result-restart-btn");
    const hintEl = document.getElementById("game-hint");
    const music = new Audio(MUSIC);
    music.loop = true;
    music.volume = 0.45;
    music.preload = "auto";
  
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    function randomInt(min, max) {
      return Math.floor(random(min, max + 1));
    }
  
    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
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
  
    function updateHud() {
      if (scoreEl) {
        scoreEl.textContent = String(state.score);
      }
  
      if (timeEl) {
        timeEl.textContent = String(Math.max(0, state.timeLeft));
      }
  
      if (countEl) {
        countEl.textContent = String(state.deer.size);
      }
  
      if (progressBar) {
        progressBar.style.width = (Math.max(0, state.timeLeft) / GAME_DURATION) * 100 + "%";
      }
    }
  
    function getFieldSize() {
      if (!(field instanceof HTMLElement)) {
        return {
          width: 0,
          height: 0
        };
      }
  
      const rect = field.getBoundingClientRect();
  
      return {
        width: rect.width,
        height: rect.height
      };
    }
  
    function createDeer() {
      if (!state.running || !(field instanceof HTMLElement) || state.deer.size >= MAX_DEER) {
        return;
      }
  
      const size = getFieldSize();
  
      if (size.width <= 0 || size.height <= 0) {
        return;
      }
  
      const deerSize = clamp(
        size.width * random(DEER_SIZE_FIELD_MIN, DEER_SIZE_FIELD_MAX),
        DEER_SIZE_MIN,
        DEER_SIZE_MAX
      );
  
      const maxX = Math.max(0, size.width - deerSize);
      const maxY = Math.max(0, size.height - deerSize * DEER_HEIGHT_RATIO);
  
      const img = document.createElement("img");
      const id = state.nextId++;
  
      img.className = "deer";
      img.src = DEER_IMAGES[state.currentFrame];
      img.alt = "Бегущий олень";
      img.draggable = false;
      img.dataset.id = String(id);
  
      img.style.setProperty("--deer-size", deerSize + "px");
      img.style.setProperty(
        "--deer-size-mobile",
        clamp(deerSize * DEER_MOBILE_SCALE, DEER_MOBILE_SIZE_MIN, DEER_MOBILE_SIZE_MAX) + "px"
      );
  
      const deer = {
        id,
        el: img,
        x: random(0, maxX),
        y: random(DEER_TOP_LIMIT, maxY),
        vx: random(DEER_SPEED_X_MIN, DEER_SPEED_X_MAX) * (Math.random() > 0.5 ? 1 : -1),
        vy: random(DEER_SPEED_Y_MIN, DEER_SPEED_Y_MAX) * (Math.random() > 0.5 ? 1 : -1),
        size: deerSize,
        turnAt: performance.now() + random(DEER_START_TURN_TIME_MIN, DEER_START_TURN_TIME_MAX)
      };
  
      img.addEventListener("click", function(event) {
        event.preventDefault();
        catchDeer(id);
      });
  
      img.addEventListener("touchstart", function(event) {
        event.preventDefault();
        catchDeer(id);
      }, { passive: false });
  
      state.deer.set(id, deer);
      field.appendChild(img);
      renderDeer(deer);
      updateHud();
    }
  
    function renderDeer(deer) {
      const directionScale = deer.vx < 0 ? -1 : 1;
  
      deer.el.style.left = deer.x + "px";
      deer.el.style.top = deer.y + "px";
      deer.el.style.transform = "scaleX(" + directionScale + ")";
    }
  
    function spawnDelayed() {
      if (!state.running) {
        return;
      }
  
      const delay = randomInt(RESPAWN_MIN, RESPAWN_MAX);
  
      const timerId = window.setTimeout(function() {
        state.spawnTimers = state.spawnTimers.filter(function(item) {
          return item !== timerId;
        });
  
        createDeer();
      }, delay);
  
      state.spawnTimers.push(timerId);
    }
  
    function addCatchEffect(x, y) {
      if (!(field instanceof HTMLElement)) {
        return;
      }
  
      const effect = document.createElement("span");
  
      effect.className = "catch-pop";
      effect.style.left = x + "px";
      effect.style.top = y + "px";
  
      field.appendChild(effect);
  
      window.setTimeout(function() {
        effect.remove();
      }, CATCH_EFFECT_TIME);
    }
  
    function catchDeer(id) {
      if (!state.running) {
        return;
      }
  
      const deer = state.deer.get(id);
  
      if (!deer) {
        return;
      }
  
      state.score += 1;
  
      deer.el.classList.add("is-caught");
  
      addCatchEffect(deer.x + deer.size / 2, deer.y + deer.size * 0.35);
  
      window.setTimeout(function() {
        deer.el.remove();
      }, CATCH_REMOVE_TIME);
  
      state.deer.delete(id);
  
      updateHud();
      spawnDelayed();
    }
  
    function moveDeer(now) {
      const size = getFieldSize();
  
      state.deer.forEach(function(deer) {
        const maxX = Math.max(0, size.width - deer.size);
        const maxY = Math.max(DEER_TOP_LIMIT, size.height - deer.size * DEER_HEIGHT_RATIO);
  
        if (now >= deer.turnAt) {
          deer.vx += random(DEER_RANDOM_TURN_X_MIN, DEER_RANDOM_TURN_X_MAX);
          deer.vy += random(DEER_RANDOM_TURN_Y_MIN, DEER_RANDOM_TURN_Y_MAX);
  
          deer.vx = clamp(deer.vx, -DEER_SPEED_X_LIMIT, DEER_SPEED_X_LIMIT);
          deer.vy = clamp(deer.vy, -DEER_SPEED_Y_LIMIT, DEER_SPEED_Y_LIMIT);
  
          deer.turnAt = now + random(DEER_TURN_TIME_MIN, DEER_TURN_TIME_MAX);
        }
  
        deer.x += deer.vx;
        deer.y += deer.vy;
  
        if (deer.x <= 0 || deer.x >= maxX) {
          deer.vx *= -1;
          deer.x = clamp(deer.x, 0, maxX);
        }
  
        if (deer.y <= DEER_TOP_LIMIT || deer.y >= maxY) {
          deer.vy *= -1;
          deer.y = clamp(deer.y, DEER_TOP_LIMIT, maxY);
        }
  
        renderDeer(deer);
      });
    }
  
    function gameLoop(now) {
      if (!state.running) {
        return;
      }
  
      moveDeer(now);
  
      if (now - state.lastFrameSwitch >= FRAME_INTERVAL) {
        state.currentFrame = state.currentFrame === 0 ? 1 : 0;
        state.lastFrameSwitch = now;
  
        state.deer.forEach(function(deer) {
          deer.el.src = DEER_IMAGES[state.currentFrame];
        });
      }
  
      state.animationFrame = window.requestAnimationFrame(gameLoop);
    }
  
    function clearGame() {
      music.pause();
      music.currentTime = 0;
      state.deer.forEach(function(deer) {
        deer.el.remove();
      });
  
      state.deer.clear();
  
      state.spawnTimers.forEach(function(timerId) {
        window.clearTimeout(timerId);
      });
  
      state.spawnTimers = [];
  
      if (state.animationFrame) {
        window.cancelAnimationFrame(state.animationFrame);
        state.animationFrame = 0;
      }
  
      if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = 0;
      }
    }
  
    function startGame() {
      if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
        return;
      }
  
      clearGame();
      music.currentTime = 0;
      music.play().catch(function() {});
  
      state.running = true;
      state.score = 0;
      state.timeLeft = GAME_DURATION;
      state.lastFrameSwitch = performance.now();
      state.currentFrame = 0;
  
      startScreen.hidden = true;
      resultScreen.hidden = true;
      gameShell.hidden = false;
  
      if (hintEl instanceof HTMLElement) {
        hintEl.hidden = false;
  
        window.setTimeout(function() {
          if (state.running) {
            hintEl.hidden = true;
          }
        }, HINT_HIDE_TIME);
      }
  
      updateHud();
  
      const initialCount = randomInt(MIN_DEER, MAX_DEER);
  
      for (let index = 0; index < initialCount; index += 1) {
        createDeer();
      }
  
      state.timerId = window.setInterval(function() {
        state.timeLeft -= 1;
        updateHud();
  
        if (state.timeLeft <= 0) {
          finishGame();
        }
      }, 1000);
  
      state.animationFrame = window.requestAnimationFrame(gameLoop);
    }
  
    function finishGame() {
      if (!state.running) {
        return;
      }
  
      state.running = false;
      clearGame();
  
      if (gameShell instanceof HTMLElement) {
        gameShell.hidden = true;
      }
  
      if (resultScreen instanceof HTMLElement) {
        resultScreen.hidden = false;
      }
  
      if (finalScoreEl instanceof HTMLElement) {
        finalScoreEl.textContent = String(state.score);
      }
  
      if (resultTextEl instanceof HTMLElement) {
        if (state.score >= RESULT_SCORE_EXCELLENT) {
          resultTextEl.textContent = "Отличный результат! Ты действовал быстро и внимательно.";
        } else if (state.score >= RESULT_SCORE_GOOD) {
          resultTextEl.textContent = "Хорошая охота! Попробуй ещё раз и улучши результат.";
        } else {
          resultTextEl.textContent = "Неплохое начало! Следи за движением оленей и нажимай быстрее.";
        }
      }
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
  
      window.addEventListener("resize", function() {
        const size = getFieldSize();
  
        state.deer.forEach(function(deer) {
          deer.x = clamp(deer.x, 0, Math.max(0, size.width - deer.size));
          deer.y = clamp(deer.y, DEER_TOP_LIMIT, Math.max(DEER_TOP_LIMIT, size.height - deer.size * DEER_HEIGHT_RATIO));
  
          renderDeer(deer);
        });
      });
    }
  
    function preloadImages() {
      DEER_IMAGES.concat(["images/iconnorthgame.png", "images/backgrnorthgame.png"]).forEach(function(src) {
        const img = new Image();
        img.src = src;
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