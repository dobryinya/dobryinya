(function() {
  "use strict";

  const ASSETS = {
    images: {
      bg1: "images/runner/bg1.png",
      bg2: "images/runner/bg2.png",
      bg3: "images/runner/bg3.png",
      run1: "images/runner/run1.png",
      run2: "images/runner/run2.png",
      jump: "images/runner/jump.png",
      fail: "images/runner/fail.png",
      win: "images/runner/win.png",
      icon: "images/runner/icon.png",
      obstacles: {
        log: "images/runner/log.png",
        stack: "images/runner/stack.png",
        rock: "images/runner/rock.png",
        bucket: "images/runner/bucket.png"
      }
    },
    audio: {
      music: "music/sabantuy.mp3",
      run: "sounds/sabantuy-run.mp3",
      jump: "sounds/ruhthrow.mp3",
      lose: "sounds/sabantuy-lose.mp3",
      win: "sounds/sabantuy-win.mp3"
    }
  };

  const CONFIG = {
    gameDuration: 45,
    startDelay: 700,
    resultDelay: 1250,

    heroLeftPercent: 9,
    heroGroundBottomPercent: 13,
    heroWidthPercent: 13.5,
    heroHitboxScaleX: 0.54,
    heroHitboxScaleY: 0.74,
    heroHitboxOffsetX: 0.06,
    heroHitboxOffsetY: 0.13,

    gravity: 2250,
    jumpVelocity: 850,
    maxFallSpeed: 1500,

    baseSpeed: 455,
    speedStages: [
      { from: 0, multiplier: 1.2 },
      { from: 10, multiplier: 1.3 },
      { from: 20, multiplier: 1.5 },
      { from: 30, multiplier: 1.8 }
    ],

    bg1Speed: 0.18,
    bg2Speed: 0.42,
    bg3Speed: 1.0,

    runFrameInterval: 110,
    spawnStartDelay: 950,
    jumpSafeDistance: 100,
    jumpExtraGapMin: 110,
    jumpExtraGapMax: 150,

    spawnMinDistance: 630,
    spawnMaxDistance: 820,

    spawnDoubleChance: 0.08,
    doubleJumpSafeMultiplier: 0.78,
    doubleExtraGapMin: 35,
    doubleExtraGapMax: 55,

    obstacleHitboxScaleX: 0.6,
    obstacleHitboxScaleY: 0.58,
    obstacleHitboxOffsetY: 0.18,

    musicVolume: 0.38,
    runVolume: 0.07,
    jumpVolume: 0.32,
    loseVolume: 0.78,
    winVolume: 0.82,

    overlayHideTime: 900
  };

  const OBSTACLES = [

    // Камень
  
    { type: "rock",   src: ASSETS.images.obstacles.rock,   widthPercent: 6.5, points: 1 },
  
    // Бревно
  
    { type: "log",    src: ASSETS.images.obstacles.log,    widthPercent: 12.5, points: 2 },
  
    // Стог сена (самый большой)
  
    { type: "stack",  src: ASSETS.images.obstacles.stack,  widthPercent: 13.8, points: 3 },
  
    // Ведро
  
    { type: "bucket", src: ASSETS.images.obstacles.bucket, widthPercent: 5.2, points: 1 }
  
  ];

  const state = {
    running: false,
    active: false,
    finished: false,
    won: false,
    timeLeft: CONFIG.gameDuration,
    elapsed: 0,
    speedMultiplier: 1,
    heroY: 0,
    heroVy: 0,
    isGrounded: true,
    runFrame: 0,
    lastFrameTime: 0,
    lastRunSwitch: 0,
    animationFrame: 0,
    timerId: 0,
    startTimerId: 0,
    resultTimerId: 0,
    nextSpawnDistance: 0,
    distanceSinceSpawn: 0,
    bg1Offset: 0,
    bg2Offset: 0,
    bg3Offset: 0,
    obstacles: [],
    nextObstacleId: 1
  };

  const startScreen = document.getElementById("runner-start");
  const gameShell = document.getElementById("runner-shell");
  const resultScreen = document.getElementById("runner-result");
  const field = document.getElementById("runner-field");
  const bgOne = document.getElementById("runner-bg-one");
  const bgTwo = document.getElementById("runner-bg-two");
  const bgRoad = document.getElementById("runner-bg-road");
  const objectsLayer = document.getElementById("runner-objects");
  const hero = document.getElementById("runner-hero");
  const overlay = document.getElementById("runner-overlay");
  const timeEl = document.getElementById("runner-time");
  const speedEl = document.getElementById("runner-speed");
  const progressBar = document.getElementById("runner-progress-bar");
  const startBtn = document.getElementById("runner-start-btn");
  const restartBtn = document.getElementById("runner-restart-btn");
  const resultRestartBtn = document.getElementById("runner-result-restart-btn");
  const resultLabel = document.getElementById("runner-result-label");
  const resultTitle = document.getElementById("runner-result-title");
  const resultText = document.getElementById("runner-result-text");
  const hintEl = document.getElementById("runner-hint");

  const music = createAudio(ASSETS.audio.music, true, CONFIG.musicVolume);
  const runSound = createAudio(ASSETS.audio.run, true, CONFIG.runVolume);
  const jumpSound = createAudio(ASSETS.audio.jump, false, CONFIG.jumpVolume);
  const loseSound = createAudio(ASSETS.audio.lose, false, CONFIG.loseVolume);
  const winSound = createAudio(ASSETS.audio.win, false, CONFIG.winVolume);

  function createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    return audio;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function playAudio(audio, restart) {
    if (restart) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.play().catch(function() {});
  }

  function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  function stopAllAudio() {
    stopAudio(music);
    stopAudio(runSound);
    stopAudio(jumpSound);
    stopAudio(loseSound);
    stopAudio(winSound);
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

  function getFieldRect() {
    if (!(field instanceof HTMLElement)) {
      return { width: 0, height: 0, left: 0, top: 0 };
    }
    return field.getBoundingClientRect();
  }

  function showOverlay(text, hidden) {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }
    overlay.textContent = text;
    overlay.hidden = hidden;
  }

  function getSpeedMultiplier() {
    let multiplier = 1;
    CONFIG.speedStages.forEach(function(stage) {
      if (state.elapsed >= stage.from) {
        multiplier = stage.multiplier;
      }
    });
    return multiplier;
  }

  function getCurrentSpeed() {
    return CONFIG.baseSpeed * state.speedMultiplier;
  }

  function updateHud() {
    if (timeEl instanceof HTMLElement) {
      timeEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
    }

    if (speedEl instanceof HTMLElement) {
      speedEl.textContent = state.speedMultiplier.toFixed(2).replace(/0$/, "") + "x";
    }

    if (progressBar instanceof HTMLElement) {
      progressBar.style.width = (state.elapsed / CONFIG.gameDuration * 100) + "%";
    }
  }

  function renderBackgrounds() {
    if (bgOne instanceof HTMLElement) {
      bgOne.style.backgroundPositionX = -state.bg1Offset + "px";
    }
    if (bgTwo instanceof HTMLElement) {
      bgTwo.style.backgroundPositionX = -state.bg2Offset + "px";
    }
    if (bgRoad instanceof HTMLElement) {
      bgRoad.style.backgroundPositionX = -state.bg3Offset + "px";
    }
  }

  function renderHero() {
    if (!(hero instanceof HTMLImageElement)) {
      return;
    }

    hero.style.transform = "translateY(" + (-state.heroY) + "px)";

    if (state.finished) {
      return;
    }

    if (!state.isGrounded) {
      hero.src = ASSETS.images.jump;
      return;
    }

    hero.src = state.runFrame === 0 ? ASSETS.images.run1 : ASSETS.images.run2;
  }

  function setHeroFinalImage(type) {
    if (!(hero instanceof HTMLImageElement)) {
      return;
    }
    hero.src = type === "win" ? ASSETS.images.win : ASSETS.images.fail;
  }

  function getHeroBox() {
    if (!(hero instanceof HTMLElement)) {
      return null;
    }

    const fieldRect = getFieldRect();
    const rect = hero.getBoundingClientRect();
    const width = rect.width * CONFIG.heroHitboxScaleX;
    const height = rect.height * CONFIG.heroHitboxScaleY;
    const left = rect.left - fieldRect.left + rect.width * (1 - CONFIG.heroHitboxScaleX) / 2 + rect.width * CONFIG.heroHitboxOffsetX;
    const top = rect.top - fieldRect.top + rect.height * CONFIG.heroHitboxOffsetY;

    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height
    };
  }

  function getObstacleBox(item) {
    const rect = item.el.getBoundingClientRect();
    const fieldRect = getFieldRect();
    const width = rect.width * CONFIG.obstacleHitboxScaleX;
    const height = rect.height * CONFIG.obstacleHitboxScaleY;
    const left = rect.left - fieldRect.left + rect.width * (1 - CONFIG.obstacleHitboxScaleX) / 2;
    const top = rect.top - fieldRect.top + rect.height * CONFIG.obstacleHitboxOffsetY;

    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height
    };
  }

  function boxesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function chooseObstacle() {
    return OBSTACLES[randomInt(0, OBSTACLES.length - 1)];
  }

  function createObstacle(config, xPosition) {
    if (!(objectsLayer instanceof HTMLElement)) {
      return;
    }

    const img = document.createElement("img");
    const id = state.nextObstacleId++;

    img.className = "runner-obstacle";
    img.src = config.src;
    img.alt = "Препятствие";
    img.draggable = false;
    img.dataset.id = String(id);
    img.dataset.type = config.type;
    img.style.setProperty("--obstacle-width", config.widthPercent + "%");

    objectsLayer.appendChild(img);

    const item = {
      id: id,
      type: config.type,
      el: img,
      x: xPosition,
      widthPercent: config.widthPercent
    };

    state.obstacles.push(item);
    renderObstacle(item);
  }

  function renderObstacle(item) {
    item.el.style.transform = "translateX(" + item.x + "px)";
  }

  function scheduleNextSpawn() {
    const safeGap = CONFIG.jumpSafeDistance + random(CONFIG.jumpExtraGapMin, CONFIG.jumpExtraGapMax);
    const normalGap = random(CONFIG.spawnMinDistance, CONFIG.spawnMaxDistance);
  
    state.nextSpawnDistance = Math.max(safeGap, normalGap);
    state.distanceSinceSpawn = 0;
  }
  

  function spawnObstaclePack() {
    const rect = getFieldRect();
    const startX = rect.width + random(40, 110);
    const first = chooseObstacle();

    createObstacle(first, startX);

    if (Math.random() < CONFIG.spawnDoubleChance) {
      const second = chooseObstacle();
      const doubleGap =
        CONFIG.jumpSafeDistance * CONFIG.doubleJumpSafeMultiplier +
        random(CONFIG.doubleExtraGapMin, CONFIG.doubleExtraGapMax);

      createObstacle(second, startX + doubleGap);
    }

    scheduleNextSpawn();
  }

  function updateObstacles(delta) {
    const speed = getCurrentSpeed();

    state.distanceSinceSpawn += speed * delta;

    if (state.distanceSinceSpawn >= state.nextSpawnDistance) {
      spawnObstaclePack();
    }

    state.obstacles.forEach(function(item) {
      item.x -= speed * delta;
      renderObstacle(item);
    });

    state.obstacles = state.obstacles.filter(function(item) {
      if (item.x < -220) {
        item.el.remove();
        return false;
      }
      return true;
    });
  }

  function checkCollision() {
    const heroBox = getHeroBox();
    if (!heroBox) {
      return false;
    }

    return state.obstacles.some(function(item) {
      return boxesOverlap(heroBox, getObstacleBox(item));
    });
  }

  function jump() {
    if (!state.running || !state.active || state.finished || !state.isGrounded) {
      return;
    }

    state.isGrounded = false;
    state.heroVy = CONFIG.jumpVelocity;
    playAudio(jumpSound, true);
    renderHero();
  }

  function updateHero(delta) {
    if (state.isGrounded) {
      return;
    }

    state.heroVy -= CONFIG.gravity * delta;
    state.heroVy = Math.max(state.heroVy, -CONFIG.maxFallSpeed);
    state.heroY += state.heroVy * delta;

    if (state.heroY <= 0) {
      state.heroY = 0;
      state.heroVy = 0;
      state.isGrounded = true;
    }
  }

  function animationLoop(now) {
    if (!state.running) {
      return;
    }

    const delta = state.lastFrameTime ? Math.min(0.035, (now - state.lastFrameTime) / 1000) : 0;
    state.lastFrameTime = now;

    if (state.active && !state.finished) {
      state.elapsed = Math.min(CONFIG.gameDuration, state.elapsed + delta);
      state.timeLeft = Math.max(0, CONFIG.gameDuration - state.elapsed);
      state.speedMultiplier = getSpeedMultiplier();

      const speed = getCurrentSpeed();
      state.bg1Offset += speed * CONFIG.bg1Speed * delta;
      state.bg2Offset += speed * CONFIG.bg2Speed * delta;
      state.bg3Offset += speed * CONFIG.bg3Speed * delta;

      updateHero(delta);
      updateObstacles(delta);
      renderBackgrounds();

      if (state.isGrounded && now - state.lastRunSwitch >= CONFIG.runFrameInterval) {
        state.runFrame = state.runFrame === 0 ? 1 : 0;
        state.lastRunSwitch = now;
      }

      renderHero();

      if (checkCollision()) {
        finishGame("lose");
        return;
      }

      if (state.elapsed >= CONFIG.gameDuration) {
        finishGame("win");
        return;
      }
    }

    updateHud();
    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function finishGame(type) {
    if (!state.running || state.finished) {
      return;
    }

    state.finished = true;
    state.active = false;
    state.won = type === "win";

    window.clearInterval(state.timerId);
    state.timerId = 0;

    stopAudio(runSound);
    stopAudio(music);

    if (field instanceof HTMLElement) {
      field.classList.toggle("is-win", state.won);
      field.classList.toggle("is-shake", !state.won);
    }

    setHeroFinalImage(type);
    showOverlay(state.won ? "Финиш!" : "Ой!", false);

    if (state.won) {
      playAudio(winSound, true);
    } else {
      playAudio(loseSound, true);
    }

    state.resultTimerId = window.setTimeout(function() {
      showResult(type);
    }, CONFIG.resultDelay);
  }

  function showResult(type) {
    state.running = false;

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    if (gameShell instanceof HTMLElement) {
      gameShell.hidden = true;
    }

    if (resultScreen instanceof HTMLElement) {
      resultScreen.hidden = false;
    }

    if (resultLabel instanceof HTMLElement) {
      resultLabel.textContent = type === "win" ? "Победа" : "Поражение";
    }

    if (resultTitle instanceof HTMLElement) {
      resultTitle.textContent = type === "win" ? "Ты добежал до финиша!" : "Препятствие оказалось слишком близко";
    }

    if (resultText instanceof HTMLElement) {
      resultText.textContent = type === "win"
        ? "Отличный забег! Ты ловко преодолел все препятствия Сабантуя."
        : "Попробуй ещё раз: прыгай чуть раньше и следи за следующими препятствиями.";
    }
  }

  function clearGame() {
    state.running = false;
    state.active = false;
    state.finished = false;
    state.won = false;
    state.timeLeft = CONFIG.gameDuration;
    state.elapsed = 0;
    state.speedMultiplier = 1;
    state.heroY = 0;
    state.heroVy = 0;
    state.isGrounded = true;
    state.runFrame = 0;
    state.lastFrameTime = 0;
    state.lastRunSwitch = 0;
    state.bg1Offset = 0;
    state.bg2Offset = 0;
    state.bg3Offset = 0;
    state.nextObstacleId = 1;
    state.distanceSinceSpawn = 0;
    state.obstacles.forEach(function(item) {
      item.el.remove();
    });
    state.obstacles = [];

    window.clearTimeout(state.startTimerId);
    window.clearTimeout(state.resultTimerId);
    window.clearInterval(state.timerId);

    state.startTimerId = 0;
    state.resultTimerId = 0;
    state.timerId = 0;

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    if (objectsLayer instanceof HTMLElement) {
      objectsLayer.innerHTML = "";
    }

    if (field instanceof HTMLElement) {
      field.classList.remove("is-win", "is-shake");
    }

    stopAllAudio();
    showOverlay("", true);
    scheduleNextSpawn();
    renderBackgrounds();
    renderHero();
    updateHud();
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    state.running = true;
    state.active = false;
    state.timeLeft = CONFIG.gameDuration;
    state.elapsed = 0;
    state.lastFrameTime = 0;
    state.lastRunSwitch = performance.now();

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true });
    }

    showOverlay("Готовься!", false);

    if (hintEl instanceof HTMLElement) {
      hintEl.textContent = "Прыжок: пробел, стрелка вверх, клик или тап по игровому полю.";
    }

    playAudio(music, true);
    playAudio(runSound, true);

    state.startTimerId = window.setTimeout(function() {
      if (!state.running || state.finished) {
        return;
      }

      state.active = true;
      showOverlay("Прыгай!", false);

      window.setTimeout(function() {
        if (state.running && state.active && !state.finished) {
          showOverlay("", true);
        }
      }, CONFIG.overlayHideTime);
    }, CONFIG.startDelay);

    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function handleJumpEvent(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    jump();
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
      field.addEventListener("pointerdown", handleJumpEvent);
    }

    document.addEventListener("keydown", function(event) {
      if (event.code === "Space" || event.code === "ArrowUp") {
        handleJumpEvent(event);
      }
    });
  }

  function preloadAssets() {
    [
      ASSETS.images.bg1,
      ASSETS.images.bg2,
      ASSETS.images.bg3,
      ASSETS.images.run1,
      ASSETS.images.run2,
      ASSETS.images.jump,
      ASSETS.images.fail,
      ASSETS.images.win,
      ASSETS.images.icon,
      ASSETS.images.obstacles.log,
      ASSETS.images.obstacles.stack,
      ASSETS.images.obstacles.rock,
      ASSETS.images.obstacles.bucket
    ].forEach(function(src) {
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
