(function() {
  "use strict";

  const ASSETS = {
    images: {
      bg: "images/farfish/bg.png",
      icon: "images/farfish/icon.png",
      player: "images/farfish/player.png",
      left: ["images/farfish/left1.png", "images/farfish/left2.png"],
      right: ["images/farfish/right1.png", "images/farfish/right2.png"],
      win: "images/farfish/win.png",
      lose: "images/farfish/lose.png",
      netEmpty: "images/farfish/net_empty.png",
      netFull: "images/farfish/net.png",
      fishes: [
        "images/farfish/fish1.png",
        "images/farfish/fish2.png",
        "images/farfish/fish3.png"
      ]
    },
    audio: {
      music: "music/farfish.mp3",
      catch: "sounds/farfish-catch.mp3",
      drop: "sounds/farfish-drop.mp3",
      win: "sounds/farfish-win.mp3",
      lose: "sounds/farfish-lose.mp3",
      step: "sounds/farfish-step.mp3"
    }
  };

  const CONFIG = {
    gameDuration: 45,
    targetScore: 25,
    maxMissed: 5,
    startDelay: 700,
    resultDelay: 1200,
    overlayHideTime: 900,

    playerWidthPercent: 20,
    playerGroundBottomPercent: 2.5,
    playerSpeed: 540,
    playerHitboxScaleX: 0.72,
    playerHitboxScaleY: 0.38,
    playerHitboxOffsetY: 0.52,

    fishWidthPercent: 11,
    fishHitboxScaleX: 0.72,
    fishHitboxScaleY: 0.58,
    fishFallSpeed: 310,
    fishRotateSpeed: 18,

    netTopPercent: 5,
    netWidthPercent: 12,
    netPositionsPercent: [16, 38, 62, 84],
    netReadyMin: 420,
    netReadyMax: 780,
    spawnMinDelay: 760,
    spawnMaxDelay: 1280,

    speedStages: [
      { from: 0, multiplier: 1 },
      { from: 10, multiplier: 1.15 },
      { from: 20, multiplier: 1.3 },
      { from: 30, multiplier: 1.45 }
    ],

    walkFrameInterval: 120,
    inputStopDelay: 140,
    catchEffectTime: 260,

    musicVolume: 0.34,
    catchVolume: 0.66,
    dropVolume: 0.48,
    winVolume: 0.82,
    loseVolume: 0.78,
    stepVolume: 0.08
  };

  const state = {
    running: false,
    active: false,
    finished: false,
    won: false,
    elapsed: 0,
    timeLeft: CONFIG.gameDuration,
    score: 0,
    missed: 0,
    speedMultiplier: 1,
    playerX: 50,
    playerDirection: 0,
    lastInputTime: 0,
    walkFrame: 0,
    lastWalkSwitch: 0,
    lastFrameTime: 0,
    animationFrame: 0,
    startTimerId: 0,
    resultTimerId: 0,
    spawnTimerId: 0,
    catchTimerId: 0,
    nets: [],
    fishes: [],
    nextFishId: 1,
    keys: {
      left: false,
      right: false
    }
  };

  const startScreen = document.getElementById("farfish-start");
  const gameShell = document.getElementById("farfish-shell");
  const resultScreen = document.getElementById("farfish-result");
  const field = document.getElementById("farfish-field");
  const netsLayer = document.getElementById("farfish-nets");
  const fishesLayer = document.getElementById("farfish-fishes");
  const player = document.getElementById("farfish-player");
  const overlay = document.getElementById("farfish-overlay");
  const timeEl = document.getElementById("farfish-time");
  const scoreEl = document.getElementById("farfish-score");
  const missedEl = document.getElementById("farfish-missed");
  const progressBar = document.getElementById("farfish-progress-bar");
  const startBtn = document.getElementById("farfish-start-btn");
  const resultRestartBtn = document.getElementById("farfish-result-restart-btn");
  const resultLabel = document.getElementById("farfish-result-label");
  const resultTitle = document.getElementById("farfish-result-title");
  const resultText = document.getElementById("farfish-result-text");
  const resultImg = document.getElementById("farfish-result-img");
  const leftBtn = document.getElementById("farfish-left-btn");
  const rightBtn = document.getElementById("farfish-right-btn");

  const music = createAudio(ASSETS.audio.music, true, CONFIG.musicVolume);
  const catchSound = createAudio(ASSETS.audio.catch, false, CONFIG.catchVolume);
  const dropSound = createAudio(ASSETS.audio.drop, false, CONFIG.dropVolume);
  const winSound = createAudio(ASSETS.audio.win, false, CONFIG.winVolume);
  const loseSound = createAudio(ASSETS.audio.lose, false, CONFIG.loseVolume);
  const stepSound = createAudio(ASSETS.audio.step, true, CONFIG.stepVolume);

  function createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    return audio;
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
    stopAudio(catchSound);
    stopAudio(dropSound);
    stopAudio(winSound);
    stopAudio(loseSound);
    stopAudio(stepSound);
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

  function getSpeedMultiplier() {
    let multiplier = 1;
    CONFIG.speedStages.forEach(function(stage) {
      if (state.elapsed >= stage.from) {
        multiplier = stage.multiplier;
      }
    });
    return multiplier;
  }

  function updateHud() {
    if (timeEl instanceof HTMLElement) {
      timeEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
    }

    if (scoreEl instanceof HTMLElement) {
      scoreEl.textContent = state.score + "/" + CONFIG.targetScore;
    }

    if (missedEl instanceof HTMLElement) {
      missedEl.textContent = state.missed + "/" + CONFIG.maxMissed;
    }

    if (progressBar instanceof HTMLElement) {
      progressBar.style.width = (state.elapsed / CONFIG.gameDuration * 100) + "%";
    }
  }

  function createNets() {
    if (!(netsLayer instanceof HTMLElement)) {
      return;
    }

    netsLayer.innerHTML = "";
    state.nets = [];

    CONFIG.netPositionsPercent.forEach(function(left, index) {
      const img = document.createElement("img");
      img.className = "farfish-net";
      img.src = ASSETS.images.netEmpty;
      img.alt = "Рыболовный сачок";
      img.draggable = false;
      img.style.setProperty("--net-left", left + "%");
      img.style.setProperty("--net-top", CONFIG.netTopPercent + "%");
      img.style.setProperty("--net-width", CONFIG.netWidthPercent + "%");
      netsLayer.appendChild(img);

      state.nets.push({
        id: index,
        el: img,
        left: left,
        ready: false
      });
    });
  }

  function chooseFishSrc() {
    return ASSETS.images.fishes[randomInt(0, ASSETS.images.fishes.length - 1)];
  }

  function scheduleNextDrop() {
    window.clearTimeout(state.spawnTimerId);

    if (!state.running || !state.active || state.finished) {
      return;
    }

    const delay = random(CONFIG.spawnMinDelay, CONFIG.spawnMaxDelay) / state.speedMultiplier;
    state.spawnTimerId = window.setTimeout(prepareDrop, delay);
  }

  function prepareDrop() {
    if (!state.running || !state.active || state.finished || state.nets.length === 0) {
      return;
    }

    const available = state.nets.filter(function(net) {
      return !net.ready;
    });
    const net = available.length ? available[randomInt(0, available.length - 1)] : state.nets[randomInt(0, state.nets.length - 1)];

    net.ready = true;
    net.el.src = ASSETS.images.netFull;
    net.el.classList.add("is-ready");

    const readyDelay = random(CONFIG.netReadyMin, CONFIG.netReadyMax) / state.speedMultiplier;
    window.setTimeout(function() {
      dropFishFromNet(net);
    }, readyDelay);
  }

  function dropFishFromNet(net) {
    if (!state.running || !state.active || state.finished) {
      return;
    }

    net.ready = false;
    net.el.src = ASSETS.images.netEmpty;
    net.el.classList.remove("is-ready");

    const fieldRect = getFieldRect();
    const x = fieldRect.width * net.left / 100;
    const y = fieldRect.height * (CONFIG.netTopPercent + 12) / 100;

    createFish(x, y, chooseFishSrc());
    scheduleNextDrop();
  }

  function createFish(x, y, src) {
    if (!(fishesLayer instanceof HTMLElement)) {
      return;
    }

    const img = document.createElement("img");
    const id = state.nextFishId++;

    img.className = "farfish-fish";
    img.src = src;
    img.alt = "Падающая рыба";
    img.draggable = false;
    img.dataset.id = String(id);
    img.style.setProperty("--fish-width", CONFIG.fishWidthPercent + "%");
    fishesLayer.appendChild(img);

    const item = {
      id: id,
      el: img,
      x: x,
      y: y,
      rotation: random(-8, 8),
      rotateDirection: Math.random() > 0.5 ? 1 : -1,
      caught: false
    };

    state.fishes.push(item);
    renderFish(item);
  }

  function renderFish(item) {
    item.el.style.transform = "translate(" + item.x + "px, " + item.y + "px) translateX(-50%) rotate(" + item.rotation + "deg)";
  }

  function updateFishes(delta) {
    const rect = getFieldRect();
    const fallSpeed = CONFIG.fishFallSpeed * state.speedMultiplier;

    state.fishes.forEach(function(item) {
      item.y += fallSpeed * delta;
      item.rotation += CONFIG.fishRotateSpeed * item.rotateDirection * delta;
      renderFish(item);
    });

    state.fishes = state.fishes.filter(function(item) {
      if (item.caught) {
        item.el.remove();
        return false;
      }

      if (item.y > rect.height + 80) {
        item.el.remove();
        addMiss();
        return false;
      }

      return true;
    });
  }

  function addMiss() {
    if (state.finished) {
      return;
    }

    state.missed += 1;
    playAudio(dropSound, true);

    if (field instanceof HTMLElement) {
      field.classList.remove("is-shake");
      void field.offsetWidth;
      field.classList.add("is-shake");
    }

    if (state.missed >= CONFIG.maxMissed) {
      finishGame("lose");
    }
  }

  function updatePlayer(delta, now) {
    if (state.keys.left && !state.keys.right) {
      state.playerDirection = -1;
      state.lastInputTime = now;
    } else if (state.keys.right && !state.keys.left) {
      state.playerDirection = 1;
      state.lastInputTime = now;
    } else if (now - state.lastInputTime > CONFIG.inputStopDelay) {
      state.playerDirection = 0;
    }

    if (state.playerDirection !== 0) {
      const rect = getFieldRect();
      const playerWidth = rect.width * CONFIG.playerWidthPercent / 100;
      const minX = playerWidth * 0.5;
      const maxX = rect.width - playerWidth * 0.5;
      state.playerX += state.playerDirection * CONFIG.playerSpeed * delta;
      state.playerX = clamp(state.playerX, minX, maxX);

      if (now - state.lastWalkSwitch >= CONFIG.walkFrameInterval) {
        state.walkFrame = state.walkFrame === 0 ? 1 : 0;
        state.lastWalkSwitch = now;
      }

      playAudio(stepSound, false);
    } else {
      state.walkFrame = 0;
      stopAudio(stepSound);
    }
  }

  function renderPlayer() {
    if (!(player instanceof HTMLImageElement)) {
      return;
    }

    if (state.finished) {
      return;
    }

    player.style.transform = "translateX(-50%)";
    player.style.left = state.playerX + "px";
    player.style.setProperty("--farfish-player-width", CONFIG.playerWidthPercent + "%");
    player.style.setProperty("--farfish-ground-bottom", CONFIG.playerGroundBottomPercent + "%");

    if (state.playerDirection < 0) {
      player.src = ASSETS.images.left[state.walkFrame];
    } else if (state.playerDirection > 0) {
      player.src = ASSETS.images.right[state.walkFrame];
    } else {
      player.src = ASSETS.images.player;
    }
  }

  function getPlayerBox() {
    if (!(player instanceof HTMLElement)) {
      return null;
    }

    const fieldRect = getFieldRect();
    const rect = player.getBoundingClientRect();
    const width = rect.width * CONFIG.playerHitboxScaleX;
    const height = rect.height * CONFIG.playerHitboxScaleY;
    const left = rect.left - fieldRect.left + (rect.width - width) / 2;
    const top = rect.top - fieldRect.top + rect.height * CONFIG.playerHitboxOffsetY;

    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height
    };
  }

  function getFishBox(item) {
    const fieldRect = getFieldRect();
    const rect = item.el.getBoundingClientRect();
    const width = rect.width * CONFIG.fishHitboxScaleX;
    const height = rect.height * CONFIG.fishHitboxScaleY;
    const left = rect.left - fieldRect.left + (rect.width - width) / 2;
    const top = rect.top - fieldRect.top + (rect.height - height) / 2;

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

  function checkCatches() {
    const playerBox = getPlayerBox();
    if (!playerBox) {
      return;
    }

    state.fishes.forEach(function(item) {
      if (!item.caught && boxesOverlap(playerBox, getFishBox(item))) {
        catchFish(item);
      }
    });
  }

  function catchFish(item) {
    item.caught = true;
    state.score += 1;
    playAudio(catchSound, true);

    if (field instanceof HTMLElement) {
      field.classList.remove("is-catch");
      void field.offsetWidth;
      field.classList.add("is-catch");
    }

    window.clearTimeout(state.catchTimerId);
    state.catchTimerId = window.setTimeout(function() {
      if (field instanceof HTMLElement) {
        field.classList.remove("is-catch");
      }
    }, CONFIG.catchEffectTime);

    if (state.score >= CONFIG.targetScore) {
      finishGame("win");
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

      updatePlayer(delta, now);
      updateFishes(delta);
      renderPlayer();
      checkCatches();

      if (state.elapsed >= CONFIG.gameDuration) {
        finishGame(state.score >= CONFIG.targetScore ? "win" : "lose");
        return;
      }
    }

    updateHud();
    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function setPlayerFinalImage(type) {
    if (!(player instanceof HTMLImageElement)) {
      return;
    }
    player.src = type === "win" ? ASSETS.images.win : ASSETS.images.lose;
  }

  function finishGame(type) {
    if (!state.running || state.finished) {
      return;
    }

    state.finished = true;
    state.active = false;
    state.won = type === "win";

    window.clearTimeout(state.spawnTimerId);
    stopAudio(stepSound);
    stopAudio(music);

    setPlayerFinalImage(type);
    showOverlay(state.won ? "Большой улов!" : "Рыба уплыла!", false);

    if (state.won) {
      playAudio(winSound, true);
    } else {
      playAudio(loseSound, true);
      if (field instanceof HTMLElement) {
        field.classList.add("is-shake");
      }
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
      resultTitle.textContent = type === "win" ? "Ты собрал большой улов!" : "Улов оказался слишком быстрым";
    }

    if (resultText instanceof HTMLElement) {
      resultText.textContent = type === "win"
        ? "Отличная ловкость! Ты успел поймать рыбу из сачков и наполнил корзину."
        : "Попробуй ещё раз: следи за полными сачками и заранее двигайся под падающую рыбу.";
    }

    if (resultImg instanceof HTMLImageElement) {
      resultImg.src = type === "win" ? ASSETS.images.win : ASSETS.images.lose;
    }
  }

  function clearGame() {
    state.running = false;
    state.active = false;
    state.finished = false;
    state.won = false;
    state.elapsed = 0;
    state.timeLeft = CONFIG.gameDuration;
    state.score = 0;
    state.missed = 0;
    state.speedMultiplier = 1;
    state.playerX = getFieldRect().width / 2 || 50;
    state.playerDirection = 0;
    state.lastInputTime = 0;
    state.walkFrame = 0;
    state.lastWalkSwitch = 0;
    state.lastFrameTime = 0;
    state.nextFishId = 1;
    state.keys.left = false;
    state.keys.right = false;

    window.clearTimeout(state.startTimerId);
    window.clearTimeout(state.resultTimerId);
    window.clearTimeout(state.spawnTimerId);
    window.clearTimeout(state.catchTimerId);
    state.startTimerId = 0;
    state.resultTimerId = 0;
    state.spawnTimerId = 0;
    state.catchTimerId = 0;

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    state.fishes.forEach(function(item) {
      item.el.remove();
    });
    state.fishes = [];

    if (fishesLayer instanceof HTMLElement) {
      fishesLayer.innerHTML = "";
    }

    if (field instanceof HTMLElement) {
      field.classList.remove("is-shake", "is-catch");
    }

    stopAllAudio();
    createNets();
    showOverlay("", true);
    renderPlayer();
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
    state.lastWalkSwitch = performance.now();

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true });
    }

    showOverlay("Готовься!", false);
    playAudio(music, true);

    state.startTimerId = window.setTimeout(function() {
      if (!state.running || state.finished) {
        return;
      }

      state.active = true;
      showOverlay("Лови!", false);
      scheduleNextDrop();

      window.setTimeout(function() {
        if (state.running && state.active && !state.finished) {
          showOverlay("", true);
        }
      }, CONFIG.overlayHideTime);
    }, CONFIG.startDelay);

    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function setButtonDirection(direction, pressed) {
    if (direction < 0) {
      state.keys.left = pressed;
    } else {
      state.keys.right = pressed;
    }
    if (pressed) {
      state.lastInputTime = performance.now();
    }
  }

  function bindHoldButton(button, direction) {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener("pointerdown", function(event) {
      event.preventDefault();
      setButtonDirection(direction, true);
      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener("pointerup", function(event) {
      event.preventDefault();
      setButtonDirection(direction, false);
      if (button.hasPointerCapture(event.pointerId)) {
        button.releasePointerCapture(event.pointerId);
      }
    });

    button.addEventListener("pointercancel", function() {
      setButtonDirection(direction, false);
    });

    button.addEventListener("pointerleave", function() {
      setButtonDirection(direction, false);
    });
  }

  function bindEvents() {
    if (startBtn instanceof HTMLButtonElement) {
      startBtn.addEventListener("click", startGame);
    }

    if (resultRestartBtn instanceof HTMLButtonElement) {
      resultRestartBtn.addEventListener("click", startGame);
    }

    bindHoldButton(leftBtn, -1);
    bindHoldButton(rightBtn, 1);

    document.addEventListener("keydown", function(event) {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        event.preventDefault();
        state.keys.left = true;
        state.lastInputTime = performance.now();
      }

      if (event.code === "ArrowRight" || event.code === "KeyD") {
        event.preventDefault();
        state.keys.right = true;
        state.lastInputTime = performance.now();
      }
    });

    document.addEventListener("keyup", function(event) {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        state.keys.left = false;
      }

      if (event.code === "ArrowRight" || event.code === "KeyD") {
        state.keys.right = false;
      }
    });

    window.addEventListener("blur", function() {
      state.keys.left = false;
      state.keys.right = false;
      stopAudio(stepSound);
    });
  }

  function preloadAssets() {
    [
      ASSETS.images.bg,
      ASSETS.images.icon,
      ASSETS.images.player,
      ASSETS.images.left[0],
      ASSETS.images.left[1],
      ASSETS.images.right[0],
      ASSETS.images.right[1],
      ASSETS.images.win,
      ASSETS.images.lose,
      ASSETS.images.netEmpty,
      ASSETS.images.netFull,
      ASSETS.images.fishes[0],
      ASSETS.images.fishes[1],
      ASSETS.images.fishes[2]
    ].forEach(function(src) {
      const img = new Image();
      img.src = src;
    });
  }

  function init() {
    initNavigation();
    initYear();
    preloadAssets();
    createNets();
    bindEvents();
    state.playerX = getFieldRect().width / 2 || 50;
    renderPlayer();
    updateHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
