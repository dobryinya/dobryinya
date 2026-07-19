(function() {
  "use strict";

  const ASSETS = {
    images: {
      bg1: "images/eagle/bg1.png",
      bg2: "images/eagle/bg2.png",
      bg3: "images/eagle/bg3.png",
      eagleUp: "images/eagle/eagle1.png",
      eagleDown: "images/eagle/eagle2.png",
      dead: "images/eagle/dead.png",
      win: "images/eagle/win.png",
      rockTop: [
        "images/eagle/rocktop1.png",
        "images/eagle/rocktop2.png"
      ],
      rockBottom: [
        "images/eagle/rockbottom1.png",
        "images/eagle/rockbottom2.png"
      ]
    },
    audio: {
      music: "music/eagle.mp3",
      wing: "sounds/eagle-wing.mp3",
      hit: "sounds/eagle-hit.mp3",
      win: "sounds/eagle-win.mp3",
      wind: "sounds/eagle-wind.mp3"
    }
  };

  const CONFIG = {
    gameDuration: 30,
    startDelay: 700,
    resultDelayWin: 1250,
    resultDelayLose: 900,

    eagleLeftPercent: 22,
    eagleStartYPercent: 58,
    eagleWidthPercent: 10.5,
    eagleHitboxScaleX: 0.52,
    eagleHitboxScaleY: 0.42,
    eagleHitboxOffsetX: 0.02,
    eagleHitboxOffsetY: 0.18,

    gravity: 1050,
    flapVelocity: -520,
    maxFallSpeed: 980,
    topPadding: 10,
    bottomPadding: 10,

    baseSpeed: 245,
    speedStages: [
      { from: 0, multiplier: 1.0 },
      { from: 10, multiplier: 1.1 },
      { from: 20, multiplier: 1.22 },
      { from: 30, multiplier: 1.35 }
    ],

    bg1Speed: 0.12,
    bg2Speed: 0.26,
    bg3Speed: 0.48,

    gateWidthPercent: 15,
    gateMinGapPercent: 33,
    gateMaxGapPercent: 41,
    gateCenterMinPercent: 31,
    gateCenterMaxPercent: 68,
    gateSpawnDistanceMin: 260,
    gateSpawnDistanceMax: 340,
    gateStartOffset: 90,
    rockTopWidthScale: 1.0,
    rockBottomWidthScale: 1.0,
    rockHitboxScaleX: 0.66,
    rockHitboxScaleY: 0.72,

    flapFrameTime: 130,
    birdRotationUp: -24,
    birdRotationDown: 72,
    rotationLerp: 0.12,
    deadFallRotation: 92,

    musicVolume: 0.24,
    windVolume: 0.66,
    wingVolume: 0.62,
    hitVolume: 0.75,
    winVolume: 0.82,

    overlayHideTime: 850
  };

  const state = {
    running: false,
    active: false,
    finished: false,
    won: false,
    elapsed: 0,
    timeLeft: CONFIG.gameDuration,
    speedMultiplier: 1,
    eagleY: 0,
    eagleVy: 0,
    eagleRotation: 0,
    flapFrame: 0,
    flapTimer: 0,
    lastFrameTime: 0,
    animationFrame: 0,
    startTimerId: 0,
    resultTimerId: 0,
    bg1Offset: 0,
    bg2Offset: 0,
    bg3Offset: 0,
    gates: [],
    nextGateId: 1,
    nextGateDistance: 0,
    distanceSinceGate: 0
  };

  const startScreen = document.getElementById("eagle-start");
  const gameShell = document.getElementById("eagle-shell");
  const resultScreen = document.getElementById("eagle-result");
  const field = document.getElementById("eagle-field");
  const bgOne = document.getElementById("eagle-bg-one");
  const bgTwo = document.getElementById("eagle-bg-two");
  const bgThree = document.getElementById("eagle-bg-three");
  const gatesLayer = document.getElementById("eagle-gates");
  const bird = document.getElementById("eagle-bird");
  const overlay = document.getElementById("eagle-overlay");
  const timeEl = document.getElementById("eagle-time");
  const speedEl = document.getElementById("eagle-speed");
  const progressBar = document.getElementById("eagle-progress-bar");
  const startBtn = document.getElementById("eagle-start-btn");
  const restartBtn = document.getElementById("eagle-restart-btn");
  const resultRestartBtn = document.getElementById("eagle-result-restart-btn");
  const resultLabel = document.getElementById("eagle-result-label");
  const resultTitle = document.getElementById("eagle-result-title");
  const resultText = document.getElementById("eagle-result-text");
  const hintEl = document.getElementById("eagle-hint");

  const music = createAudio(ASSETS.audio.music, true, CONFIG.musicVolume);
  const windSound = createAudio(ASSETS.audio.wind, true, CONFIG.windVolume);
  const wingSound = createAudio(ASSETS.audio.wing, false, CONFIG.wingVolume);
  const hitSound = createAudio(ASSETS.audio.hit, false, CONFIG.hitVolume);
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

  function randomItem(items) {
    return items[randomInt(0, items.length - 1)];
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
    stopAudio(windSound);
    stopAudio(wingSound);
    stopAudio(hitSound);
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
    if (bgThree instanceof HTMLElement) {
      bgThree.style.backgroundPositionX = -state.bg3Offset + "px";
    }
  }

  function renderBird() {

    if (!(bird instanceof HTMLImageElement)) {
  
      return;
  
    }
  
    const rect = getFieldRect();
  
    if (rect.height <= 0) {
  
      return;
  
    }
  
    bird.style.top = state.eagleY + "px";
  
    bird.style.transform = "translate(-50%, -50%) rotate(" + state.eagleRotation + "deg)";

    if (state.finished) {
      return;
    }

    bird.src = state.flapFrame === 0 ? ASSETS.images.eagleUp : ASSETS.images.eagleDown;
  }

  function setBirdFinalImage(type) {
    if (!(bird instanceof HTMLImageElement)) {
      return;
    }
    bird.src = type === "win" ? ASSETS.images.win : ASSETS.images.dead;
  }

  function getBirdBox() {
    if (!(bird instanceof HTMLElement)) {
      return null;
    }

    const fieldRect = getFieldRect();
    const rect = bird.getBoundingClientRect();
    const width = rect.width * CONFIG.eagleHitboxScaleX;
    const height = rect.height * CONFIG.eagleHitboxScaleY;
    const left = rect.left - fieldRect.left + rect.width * (1 - CONFIG.eagleHitboxScaleX) / 2 + rect.width * CONFIG.eagleHitboxOffsetX;
    const top = rect.top - fieldRect.top + rect.height * (1 - CONFIG.eagleHitboxScaleY) / 2 + rect.height * CONFIG.eagleHitboxOffsetY;

    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height
    };
  }

  function getGateRockBox(rockEl) {
    const rect = rockEl.getBoundingClientRect();
    const fieldRect = getFieldRect();
    const width = rect.width * CONFIG.rockHitboxScaleX;
    const height = rect.height * CONFIG.rockHitboxScaleY;
    const left = rect.left - fieldRect.left + rect.width * (1 - CONFIG.rockHitboxScaleX) / 2;
    const top = rect.top - fieldRect.top + rect.height * (1 - CONFIG.rockHitboxScaleY) / 2;

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

  function scheduleNextGate() {
    state.nextGateDistance = random(CONFIG.gateSpawnDistanceMin, CONFIG.gateSpawnDistanceMax);
    state.distanceSinceGate = 0;
  }

  function createGate() {
    if (!(gatesLayer instanceof HTMLElement)) {
      return;
    }

    const rect = getFieldRect();
    const id = state.nextGateId++;
    const gate = document.createElement("div");
    const top = document.createElement("img");
    const bottom = document.createElement("img");

    const gapHeight = rect.height * random(CONFIG.gateMinGapPercent, CONFIG.gateMaxGapPercent) / 100;
    const center = rect.height * random(CONFIG.gateCenterMinPercent, CONFIG.gateCenterMaxPercent) / 100;
    const gapTop = clamp(center - gapHeight / 2, rect.height * 0.12, rect.height * 0.78 - gapHeight);
    const gapBottom = gapTop + gapHeight;
    const width = rect.width * CONFIG.gateWidthPercent / 100;

    gate.className = "eagle-gate";
    gate.dataset.id = String(id);
    gate.style.setProperty("--gate-width", width + "px");

    top.className = "eagle-rock eagle-rock--top";
    top.src = randomItem(ASSETS.images.rockTop);
    top.alt = "Верхняя скала";
    top.draggable = false;
    top.style.height = gapTop + "px";
    top.style.width = width * CONFIG.rockTopWidthScale + "px";

    bottom.className = "eagle-rock eagle-rock--bottom";
    bottom.src = randomItem(ASSETS.images.rockBottom);
    bottom.alt = "Нижняя скала";
    bottom.draggable = false;
    bottom.style.height = (rect.height - gapBottom) + "px";
    bottom.style.width = width * CONFIG.rockBottomWidthScale + "px";

    gate.append(top, bottom);
    gatesLayer.appendChild(gate);

    const item = {
      id: id,
      el: gate,
      topEl: top,
      bottomEl: bottom,
      x: rect.width + CONFIG.gateStartOffset,
      passed: false
    };

    state.gates.push(item);
    renderGate(item);
  }

  function renderGate(item) {
    item.el.style.transform = "translateX(" + item.x + "px)";
  }

  function updateGates(delta) {
    const speed = getCurrentSpeed();

    state.distanceSinceGate += speed * delta;

    if (state.distanceSinceGate >= state.nextGateDistance) {
      createGate();
      scheduleNextGate();
    }

    state.gates.forEach(function(item) {
      item.x -= speed * delta;
      renderGate(item);
    });

    state.gates = state.gates.filter(function(item) {
      if (item.x < -260) {
        item.el.remove();
        return false;
      }
      return true;
    });
  }

  function checkCollision() {
    const birdBox = getBirdBox();
    const rect = getFieldRect();

    if (!birdBox) {
      return false;
    }

    if (birdBox.top <= CONFIG.topPadding || birdBox.bottom >= rect.height - CONFIG.bottomPadding) {
      return true;
    }

    return state.gates.some(function(item) {
      return boxesOverlap(birdBox, getGateRockBox(item.topEl)) || boxesOverlap(birdBox, getGateRockBox(item.bottomEl));
    });
  }

  function flap() {
    if (!state.running || !state.active || state.finished) {
      return;
    }

    state.eagleVy = CONFIG.flapVelocity;
    state.eagleRotation = CONFIG.birdRotationUp;
    state.flapFrame = state.flapFrame === 0 ? 1 : 0;
    state.flapTimer = CONFIG.flapFrameTime;

    playAudio(wingSound, true);
    renderBird();
  }

  function updateBird(delta) {
    const rect = getFieldRect();

    state.eagleVy += CONFIG.gravity * delta;
    state.eagleVy = Math.min(state.eagleVy, CONFIG.maxFallSpeed);
    state.eagleY += state.eagleVy * delta;
    state.eagleY = clamp(state.eagleY, 0, rect.height);

    state.flapTimer -= delta * 1000;
    if (state.flapTimer <= 0) {
      state.flapFrame = state.flapFrame === 0 ? 1 : 0;
      state.flapTimer = CONFIG.flapFrameTime;
    }

    const fallRatio = clamp(state.eagleVy / CONFIG.maxFallSpeed, 0, 1);
    const targetRotation = CONFIG.birdRotationUp + (CONFIG.birdRotationDown - CONFIG.birdRotationUp) * fallRatio;
    state.eagleRotation += (targetRotation - state.eagleRotation) * CONFIG.rotationLerp;
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

      updateBird(delta);
      updateGates(delta);
      renderBackgrounds();
      renderBird();

      if (checkCollision()) {
        finishGame("lose");
        return;
      }

      if (state.elapsed >= CONFIG.gameDuration) {
        finishGame("win");
        return;
      }
    }

    if (state.finished && !state.won) {
      state.eagleVy += CONFIG.gravity * delta;
      state.eagleVy = Math.min(state.eagleVy, CONFIG.maxFallSpeed * 1.15);
      state.eagleY += state.eagleVy * delta;
      state.eagleRotation += (CONFIG.deadFallRotation - state.eagleRotation) * 0.08;
      renderBird();
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

    stopAudio(music);
    stopAudio(windSound);

    if (field instanceof HTMLElement) {
      field.classList.toggle("is-win", state.won);
      field.classList.toggle("is-shake", !state.won);
    }

    setBirdFinalImage(type);
    showOverlay(state.won ? "Свободный полёт!" : "Удар!", false);

    if (state.won) {
      state.eagleRotation = -8;
      playAudio(winSound, true);
    } else {
      playAudio(hitSound, true);
    }

    state.resultTimerId = window.setTimeout(function() {
      showResult(type);
    }, state.won ? CONFIG.resultDelayWin : CONFIG.resultDelayLose);
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
      resultTitle.textContent = type === "win" ? "Ты провёл орла через ущелья!" : "Орёл задел скалу";
    }

    if (resultText instanceof HTMLElement) {
      resultText.textContent = type === "win"
        ? "Отличный полёт! Ты удержал высоту и прошёл все горные препятствия."
        : "Попробуй ещё раз: делай взмахи чуть раньше и держись середины прохода.";
    }
  }

  function clearGame() {
    const rect = getFieldRect();

    state.running = false;
    state.active = false;
    state.finished = false;
    state.won = false;
    state.elapsed = 0;
    state.timeLeft = CONFIG.gameDuration;
    state.speedMultiplier = 1;
    state.eagleY = Math.max(180, rect.height * CONFIG.eagleStartYPercent / 100);
    state.eagleVy = 0;
    state.eagleRotation = 0;
    state.flapFrame = 0;
    state.flapTimer = CONFIG.flapFrameTime;
    state.lastFrameTime = 0;
    state.bg1Offset = 0;
    state.bg2Offset = 0;
    state.bg3Offset = 0;
    state.nextGateId = 1;
    state.distanceSinceGate = 0;

    window.clearTimeout(state.startTimerId);
    window.clearTimeout(state.resultTimerId);
    state.startTimerId = 0;
    state.resultTimerId = 0;

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    state.gates.forEach(function(item) {
      item.el.remove();
    });
    state.gates = [];

    if (gatesLayer instanceof HTMLElement) {
      gatesLayer.innerHTML = "";
    }

    if (field instanceof HTMLElement) {
      field.classList.remove("is-win", "is-shake");
    }

    stopAllAudio();
    showOverlay("", true);
    scheduleNextGate();
    renderBackgrounds();
    renderBird();
    updateHud();
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    state.running = true;
    state.active = false;
    state.lastFrameTime = 0;

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true });
    }

    showOverlay("Готовься!", false);

    if (hintEl instanceof HTMLElement) {
      hintEl.textContent = "Пробел, стрелка вверх, клик или тап — взмах крыльями.";
    }

    playAudio(music, true);
    playAudio(windSound, true);

    state.startTimerId = window.setTimeout(function() {
      if (!state.running || state.finished) {
        return;
      }

      state.active = true;
      showOverlay("Лети!", false);
      flap();

      window.setTimeout(function() {
        if (state.running && state.active && !state.finished) {
          showOverlay("", true);
        }
      }, CONFIG.overlayHideTime);
    }, CONFIG.startDelay);

    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function handleFlapEvent(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    flap();
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
      field.addEventListener("pointerdown", handleFlapEvent);
    }

    document.addEventListener("keydown", function(event) {
      if (event.code === "Space" || event.code === "ArrowUp") {
        handleFlapEvent(event);
      }
    });

    window.addEventListener("resize", function() {
      const rect = getFieldRect();
      state.eagleY = clamp(state.eagleY, 0, rect.height);
    });
  }

  function preloadAssets() {
    [
      ASSETS.images.bg1,
      ASSETS.images.bg2,
      ASSETS.images.bg3,
      ASSETS.images.eagleUp,
      ASSETS.images.eagleDown,
      ASSETS.images.dead,
      ASSETS.images.win
    ].concat(ASSETS.images.rockTop, ASSETS.images.rockBottom).forEach(function(src) {
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
