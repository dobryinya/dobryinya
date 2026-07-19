(function() {
  "use strict";

  const GAME_DURATION = 210;
  const MAX_ATTEMPTS = 5;
  const TRAJECTORY_VISIBLE_PART = 0.65;
  const TRAJECTORY_DOTS = 18;

  const GRAVITY = 900;
  const POWER = 6.15;
  const MAX_PULL = 155;
  const MIN_PULL_TO_THROW = 14;
  const PROJECTILE_SIZE_PERCENT = 5.6;
  const PROJECTILE_ROTATION_SPEED = 760;
  const PROJECTILE_REMOVE_DELAY = 80;
  const HERO_THROW_TIME = 320;
  const HELP_HIDE_TIME = 2600;

  const MISS_BOUNCE_ENABLED = true;
  const GROUND_LINE_PERCENT = 88;
  const BOUNCE_DAMPING_Y = 0.38;
  const BOUNCE_DAMPING_X = 0.72;
  const MAX_BOUNCES = 2;
  const MIN_BOUNCE_SPEED = 120;
  const MISS_REMOVE_DELAY = 420;

  const HIT_PARTICLE_COUNT = 12;
  const HIT_PARTICLE_TIME = 620;
  const FLOAT_SCORE_TIME = 760;
  const FIELD_SHAKE_TIME = 260;

  const FIELD_ASPECT_WIDTH = 16;
  const FIELD_ASPECT_HEIGHT = 9;
  const FINISH_AFTER_NO_ATTEMPTS_DELAY = 1500;

  const IMAGES = {
    heroReady: "images/ruhero1.png",
    heroThrow: "images/ruherothrow.png",
    heroEmpty: "images/ruhero0.png",
    dubine: "images/dubine.png",
    attempt: "images/icdubine.png",
    single: "images/ruha1.png",
    singleDestroyed: "images/ruhadest1.png",
    triple: "images/ruhie3.png",
    tripleDestroyed: "images/ruhiedest.png",
    background: "images/ruhiebg.png"
  };

  const MUSIC = "music/ruhiemus.mp3";

  const TARGETS = [
    { id: "t1", type: "single", x: 75.5, bottom: 15.2, w: 6.2, points: 1 },
    { id: "t2", type: "single", x: 77.5, bottom: 13.5, w: 6.2, points: 1 },
    { id: "t3", type: "single", x: 86.5, bottom: 13.5, w: 6.2, points: 1 },
    { id: "t4", type: "triple", x: 83.5, bottom: 39.5, w: 12.8, points: 5 },
    { id: "t5", type: "single", x: 91.5, bottom: 51.5, w: 5.7, points: 4 },
    { id: "t6", type: "triple", x: 47.5, bottom: 5.5, w: 11.5, points: 3 }
  ];

  const RESULT_SCORE_EXCELLENT = 9;
  const RESULT_SCORE_GOOD = 5;

  const state = {
    running: false,
    aiming: false,
    projectileFlying: false,
    score: 0,
    attemptsLeft: MAX_ATTEMPTS,
    timeLeft: GAME_DURATION,
    timerId: 0,
    animationFrame: 0,
    lastFrameTime: 0,
    aimStart: { x: 0, y: 0 },
    aimCurrent: { x: 0, y: 0 },
    projectile: null,
    targets: [],
    finishDelayId: 0
  };

  const startScreen = document.getElementById("ruhie-start");
  const gameShell = document.getElementById("ruhie-shell");
  const resultScreen = document.getElementById("ruhie-result");
  const field = document.getElementById("ruhie-field");
  const canvas = document.getElementById("ruhie-canvas");
  const hero = document.getElementById("ruhie-hero");
  const aimZone = document.getElementById("ruhie-aim-zone");
  const helpEl = document.getElementById("ruhie-help");
  const scoreEl = document.getElementById("ruhie-score");
  const timeEl = document.getElementById("ruhie-time");
  const attemptsEl = document.getElementById("ruhie-attempts");
  const progressBar = document.getElementById("ruhie-progress-bar");
  const finalScoreEl = document.getElementById("ruhie-final-score");
  const resultTextEl = document.getElementById("ruhie-result-text");
  const startBtn = document.getElementById("ruhie-start-btn");
  const restartBtn = document.getElementById("ruhie-restart-btn");
  const resultRestartBtn = document.getElementById("ruhie-result-restart-btn");

  const music = new Audio(MUSIC);

  music.loop = true;
  music.volume = 0.45; // можешь поставить от 0 до 1
  music.preload = "auto";

  const throwSound = new Audio("sounds/ruhthrow.mp3");

  throwSound.volume = 0.75;

  throwSound.preload = "auto";

  const destroySound = new Audio("sounds/ruhdest.mp3");

  destroySound.volume = 0.85;

  destroySound.preload = "auto";
  
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

  function getFieldRect() {
    if (!(field instanceof HTMLElement)) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    return field.getBoundingClientRect();
  }

  function percentToPx(point) {
    const rect = getFieldRect();
    return {
      x: rect.width * point.x / 100,
      y: rect.height * point.y / 100
    };
  }

  function pxToPercent(point) {
    const rect = getFieldRect();
    return {
      x: rect.width ? point.x / rect.width * 100 : 0,
      y: rect.height ? point.y / rect.height * 100 : 0
    };
  }

  function getLaunchPoint() {
    return percentToPx({ x: 17.3, y: 61.8 });
  }

  function getPointerInField(event) {
    const rect = getFieldRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function resizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const rect = getFieldRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  function clearTrajectory() {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const rect = getFieldRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  }

  function drawTrajectory(velocity) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    clearTrajectory();

    const launch = getLaunchPoint();
    const rect = getFieldRect();
    const totalTime = Math.max(0.6, rect.width / Math.max(80, Math.abs(velocity.x)));
    const visibleTime = totalTime * TRAJECTORY_VISIBLE_PART;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "rgba(47, 141, 246, 0.28)";
    ctx.lineWidth = 2;

    for (let index = 1; index <= TRAJECTORY_DOTS; index += 1) {
      const progress = index / TRAJECTORY_DOTS;
      const t = visibleTime * progress;
      const x = launch.x + velocity.x * t;
      const y = launch.y + velocity.y * t + 0.5 * GRAVITY * t * t;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        continue;
      }

      const radius = Math.max(2.4, 6 - progress * 3.4);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function getVelocityFromPull() {
    const launch = getLaunchPoint();
    let dx = state.aimCurrent.x - launch.x;
    let dy = state.aimCurrent.y - launch.y;
    const distance = Math.hypot(dx, dy);

    if (distance > MAX_PULL) {
      const scale = MAX_PULL / distance;
      dx *= scale;
      dy *= scale;
    }

    return {
      x: -dx * POWER,
      y: -dy * POWER,
      pull: Math.min(distance, MAX_PULL)
    };
  }

  function renderAttempts() {
    if (!(attemptsEl instanceof HTMLElement)) {
      return;
    }

    attemptsEl.innerHTML = "";

    for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
      const img = document.createElement("img");
      img.className = "ruhie-attempt";
      img.src = IMAGES.attempt;
      img.alt = index < state.attemptsLeft ? "Оставшаяся дубина" : "Использованная дубина";
      img.draggable = false;

      if (index >= state.attemptsLeft) {
        img.classList.add("is-used");
      }

      attemptsEl.appendChild(img);
    }
  }

  function updateHud() {
    if (scoreEl) {
      scoreEl.textContent = String(state.score);
    }

    if (timeEl) {
      timeEl.textContent = formatTime(state.timeLeft);
    }

    if (progressBar) {
      progressBar.style.width = Math.max(0, state.timeLeft) / GAME_DURATION * 100 + "%";
    }

    renderAttempts();
  }

  function setHeroState(mode) {
    if (!(hero instanceof HTMLImageElement)) {
      return;
    }
  
    hero.classList.toggle("is-aiming", mode === "aiming");
  
    if (mode === "empty") {
      hero.src = IMAGES.heroEmpty;
      hero.alt = "Герой без дубины";
      return;
    }
  
    // <<< ДОБАВИТЬ ЭТОТ БЛОК
    if (mode === "aiming") {
      hero.src = IMAGES.heroThrow;
      hero.alt = "Герой прицеливается";
      return;
    }
  
    if (mode === "throw") {
      hero.src = IMAGES.heroThrow;
      hero.alt = "Герой бросает дубину";
      return;
    }
  
    hero.src = IMAGES.heroReady;
    hero.alt = "Герой с дубиной";
  }

  function buildTargets() {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    field.querySelectorAll(".ruhie-target").forEach(function(node) {
      node.remove();
    });

    state.targets = TARGETS.map(function(target) {
      const img = document.createElement("img");
      const wholeImage = target.type === "triple" ? IMAGES.triple : IMAGES.single;

      img.className = "ruhie-target";
      img.src = wholeImage;
      img.alt = target.type === "triple" ? "Тройная рюха" : "Рюха";
      img.draggable = false;
      img.dataset.id = target.id;
      img.style.setProperty("--target-x", target.x + "%");
      img.style.setProperty("--target-bottom", target.bottom + "%");
      img.style.setProperty("--target-width", target.w + "%");

      field.appendChild(img);

      return {
        id: target.id,
        type: target.type,
        points: target.points,
        destroyed: false,
        el: img,
        x: target.x,
        bottom: target.bottom,
        w: target.w
      };
    });
  }

  function getTargetBox(target) {
    const rect = getFieldRect();
    const targetWidth = rect.width * target.w / 100;
    const targetHeight = target.el.getBoundingClientRect().height || targetWidth;
    const centerX = rect.width * target.x / 100;
    const bottomPx = rect.height * target.bottom / 100;

    return {
      left: centerX - targetWidth / 2,
      right: centerX + targetWidth / 2,
      top: rect.height - bottomPx - targetHeight,
      bottom: rect.height - bottomPx
    };
  }

  function hitTestProjectile(projectile) {
    const radius = projectile.size / 2;

    return state.targets.find(function(target) {
      if (target.destroyed) {
        return false;
      }

      const box = getTargetBox(target);

      return (
        projectile.x + radius >= box.left &&
        projectile.x - radius <= box.right &&
        projectile.y + radius >= box.top &&
        projectile.y - radius <= box.bottom
      );
    });
  }

  function shakeField() {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    field.classList.remove("is-impact");
    void field.offsetWidth;
    field.classList.add("is-impact");

    window.setTimeout(function() {
      if (field instanceof HTMLElement) {
        field.classList.remove("is-impact");
      }
    }, FIELD_SHAKE_TIME);
  }

  function addFloatingScore(target) {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    const box = getTargetBox(target);
    const score = document.createElement("span");

    score.className = "ruhie-float-score";
    score.textContent = "+" + target.points;
    score.style.left = (box.left + box.right) / 2 + "px";
    score.style.top = Math.max(12, box.top - 10) + "px";

    field.appendChild(score);

    window.setTimeout(function() {
      score.remove();
    }, FLOAT_SCORE_TIME);
  }

  function addHitParticles(x, y) {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    for (let index = 0; index < HIT_PARTICLE_COUNT; index += 1) {
      const particle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 18 + Math.random() * 36;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.className = "ruhie-particle";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.setProperty("--particle-x", dx + "px");
      particle.style.setProperty("--particle-y", dy + "px");
      particle.style.animationDuration = HIT_PARTICLE_TIME + "ms";

      field.appendChild(particle);

      window.setTimeout(function() {
        particle.remove();
      }, HIT_PARTICLE_TIME);
    }
  }

  function destroyTarget(target, hitX, hitY) {
    target.destroyed = true;
    target.el.src = target.type === "triple" ? IMAGES.tripleDestroyed : IMAGES.singleDestroyed;
    target.el.classList.add("is-hit");
    state.score += target.points;
    destroySound.currentTime = 0;
    destroySound.play().catch(function(){});

    addFloatingScore(target);
    addHitParticles(hitX, hitY);
    shakeField();
    updateHud();

    window.setTimeout(function() {
      target.el.classList.remove("is-hit");
    }, 420);
  }

  function removeProjectile() {
    if (!state.projectile) {
      return;
    }
  
    state.projectile.el.remove();
    state.projectile = null;
    state.projectileFlying = false;
  
    if (allTargetsDestroyed()) {
      finishGame();
      return;
    }
  
    if (state.attemptsLeft <= 0) {
      setHeroState("empty");
  
      if (!state.finishDelayId) {
        state.finishDelayId = window.setTimeout(function() {
          state.finishDelayId = 0;
  
          if (state.running && !state.projectileFlying) {
            finishGame();
          }
        }, FINISH_AFTER_NO_ATTEMPTS_DELAY);
      }
  
      return;
    }
  
    setHeroState("ready");
  }

  function allTargetsDestroyed() {
    return state.targets.length > 0 && state.targets.every(function(target) {
      return target.destroyed;
    });
  }

  function createProjectile(velocity) {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    const launch = getLaunchPoint();
    const rect = getFieldRect();
    const img = document.createElement("img");
    const projectileWidth = rect.width * PROJECTILE_SIZE_PERCENT / 100;

    img.className = "ruhie-projectile";
    img.src = IMAGES.dubine;
    img.alt = "Берёзовая дубина";
    img.draggable = false;
    img.style.setProperty("--projectile-width", PROJECTILE_SIZE_PERCENT + "%");

    field.appendChild(img);

    state.projectile = {
      el: img,
      x: launch.x,
      y: launch.y,
      vx: velocity.x,
      vy: velocity.y,
      rotation: 0,
      size: projectileWidth,
      bounces: 0,
      removing: false
    };

    renderProjectile();
  }

  function renderProjectile() {
    const projectile = state.projectile;
    if (!projectile) {
      return;
    }

    projectile.el.style.left = projectile.x + "px";
    projectile.el.style.top = projectile.y + "px";
    projectile.el.style.transform = "translate(-50%, -50%) rotate(" + projectile.rotation + "deg)";
  }

  function updateProjectile(delta) {
    const projectile = state.projectile;
    if (!projectile || projectile.removing) {
      return;
    }

    const rect = getFieldRect();

    projectile.vy += GRAVITY * delta;
    projectile.x += projectile.vx * delta;
    projectile.y += projectile.vy * delta;
    projectile.rotation += PROJECTILE_ROTATION_SPEED * delta;

    const hitTarget = hitTestProjectile(projectile);

    if (hitTarget) {
      projectile.removing = true;
      destroyTarget(hitTarget, projectile.x, projectile.y);
      window.setTimeout(removeProjectile, PROJECTILE_REMOVE_DELAY);
      return;
    }

    const groundY = rect.height * GROUND_LINE_PERCENT / 100;

    if (MISS_BOUNCE_ENABLED && projectile.y + projectile.size / 2 >= groundY && projectile.vy > 0) {
      projectile.y = groundY - projectile.size / 2;
      projectile.vy = -projectile.vy * BOUNCE_DAMPING_Y;
      projectile.vx *= BOUNCE_DAMPING_X;
      projectile.bounces += 1;
      projectile.el.classList.remove("is-bounce");
      void projectile.el.offsetWidth;
      projectile.el.classList.add("is-bounce");

      if (projectile.bounces > MAX_BOUNCES || Math.abs(projectile.vy) < MIN_BOUNCE_SPEED) {
        projectile.removing = true;
        window.setTimeout(removeProjectile, MISS_REMOVE_DELAY);
      }
    }

    if (
      projectile.x < -projectile.size ||
      projectile.x > rect.width + projectile.size ||
      projectile.y > rect.height + projectile.size ||
      projectile.y < -rect.height * 0.6
    ) {
      removeProjectile();
      return;
    }

    renderProjectile();
  }

  function animationLoop(now) {
    if (!state.running) {
      return;
    }

    const delta = state.lastFrameTime ? Math.min(0.034, (now - state.lastFrameTime) / 1000) : 0;
    state.lastFrameTime = now;

    if (state.projectileFlying) {
      updateProjectile(delta);
    }

    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function startAiming(event) {
    if (!state.running || state.projectileFlying || state.attemptsLeft <= 0) {
      return;
    }

    event.preventDefault();

    state.aiming = true;
    state.aimStart = getLaunchPoint();
    state.aimCurrent = getPointerInField(event);

    if (helpEl instanceof HTMLElement) {
      helpEl.hidden = true;
    }

    setHeroState("aiming");
    aimZone.setPointerCapture(event.pointerId);
    updateAiming(event);
  }

  function updateAiming(event) {
    if (!state.aiming) {
      return;
    }

    event.preventDefault();

    const launch = getLaunchPoint();
    const pointer = getPointerInField(event);
    const dx = pointer.x - launch.x;
    const dy = pointer.y - launch.y;
    const distance = Math.hypot(dx, dy);

    if (distance > MAX_PULL) {
      const scale = MAX_PULL / distance;
      state.aimCurrent = {
        x: launch.x + dx * scale,
        y: launch.y + dy * scale
      };
    } else {
      state.aimCurrent = pointer;
    }

    const velocity = getVelocityFromPull();
    drawTrajectory(velocity);
  }

  function endAiming(event) {
    if (!state.aiming) {
      return;
    }

    event.preventDefault();
    state.aiming = false;
    clearTrajectory();

    const velocity = getVelocityFromPull();

    try {
      aimZone.releasePointerCapture(event.pointerId);
    } catch (error) {}

    if (velocity.pull < MIN_PULL_TO_THROW) {
      setHeroState("ready");
      return;
    }

    state.attemptsLeft -= 1;
    state.projectileFlying = true;
    state.lastFrameTime = performance.now();

    setHeroState("throw");
    updateHud();
    createProjectile(velocity); 

    throwSound.currentTime = 0;
    throwSound.play().catch(function(){});

    window.setTimeout(function() {
      if (state.running && state.projectileFlying) {
        setHeroState(state.attemptsLeft > 0 ? "ready" : "empty");
      }
    }, HERO_THROW_TIME);
  }

  function clearGame() {
    state.running = false;
    state.aiming = false;
    state.projectileFlying = false;
    state.projectile = null;
    state.targets = [];

    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = 0;
    }

    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    if (state.finishDelayId) {
      window.clearTimeout(state.finishDelayId);
      state.finishDelayId = 0;
    }

    if (field instanceof HTMLElement) {
      field.querySelectorAll(".ruhie-target, .ruhie-projectile, .ruhie-particle, .ruhie-float-score").forEach(function(node) {
        node.remove();
      });
    }

    clearTrajectory();
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();
    music.pause();

    music.currentTime = 0;

    music.play().catch(function(){});

    state.running = true;
    state.score = 0;
    state.attemptsLeft = MAX_ATTEMPTS;
    state.timeLeft = GAME_DURATION;
    state.lastFrameTime = 0;

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    resizeCanvas();
    buildTargets();
    setHeroState("ready");
    updateHud();

    if (helpEl instanceof HTMLElement) {
      helpEl.hidden = false;
      window.setTimeout(function() {
        if (state.running && helpEl instanceof HTMLElement) {
          helpEl.hidden = true;
        }
      }, HELP_HIDE_TIME);
    }

    state.timerId = window.setInterval(function() {
      state.timeLeft -= 1;
      updateHud();

      if (state.timeLeft <= 0) {
        finishGame();
      }
    }, 1000);

    state.animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function finishGame() {
    if (!state.running) {
      return;
    }

    music.pause();
    music.currentTime = 0;

    const finalScore = state.score;

    clearGame();

    if (gameShell instanceof HTMLElement) {
      gameShell.hidden = true;
    }

    if (resultScreen instanceof HTMLElement) {
      resultScreen.hidden = false;
    }

    if (finalScoreEl instanceof HTMLElement) {
      finalScoreEl.textContent = String(finalScore);
    }

    if (resultTextEl instanceof HTMLElement) {
      if (finalScore >= RESULT_SCORE_EXCELLENT) {
        resultTextEl.textContent = "Отличный бросок! Ты сбил почти все рюхи.";
      } else if (finalScore >= RESULT_SCORE_GOOD) {
        resultTextEl.textContent = "Хороший результат! Попробуй подобрать угол и силу ещё точнее.";
      } else {
        resultTextEl.textContent = "Неплохое начало. Натягивай сильнее и целься чуть выше.";
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

    if (aimZone instanceof HTMLElement) {
      aimZone.addEventListener("pointerdown", startAiming);
      aimZone.addEventListener("pointermove", updateAiming);
      aimZone.addEventListener("pointerup", endAiming);
      aimZone.addEventListener("pointercancel", endAiming);
      aimZone.addEventListener("lostpointercapture", function() {
        if (state.aiming) {
          state.aiming = false;
          clearTrajectory();
          setHeroState(state.attemptsLeft > 0 ? "ready" : "empty");
        }
      });
    }

    window.addEventListener("resize", function() {
      resizeCanvas();
      clearTrajectory();
    });
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
