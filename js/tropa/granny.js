(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/granny/",
      icon: "image.png",
      bg1: "bg1.png",
      bg2: "bg2.png",
      bg3: "bg3.png",
      boyIdle: "boy-idle.png",
      boyWalk1: "boy-walk1.png",
      boyWalk2: "boy-walk2.png",
      boySuccess: "boy-success.png",
      drops: ["apple.png", "bread.png", "milk.png"],
      obstacles: {
        puddle: { image: "puddle.png", size: 92, impulse: 0.62 },
        stone: { image: "stone.png", size: 72, impulse: 0.72 },
        toy: { image: "toy.png", size: 82, impulse: 0.8 }
      }
    },

    game: {
      duration: 42,
      maxLostProducts: 3,
      playerX: 19,
      groundY: 72,
      obstacleY: 85,
      obstacleSpeed: 185,
      spawnMin: 1.6,
      spawnMax: 2.6,
      hitDistance: 82,
      hitCooldown: 0.85,
      finishDelay: 650
    },

    balance: {
      driftForce: 0.42,
      controlForce: 1.95,
      damping: 0.9,
      dangerLimit: 0.86,
      dropCooldown: 0.95,
      randomPushMin: 0.24,
      randomPushMax: 0.5,
      randomPushEveryMin: 1.15,
      randomPushEveryMax: 2.2
    },

    parallax: {
      bg1: 23,
      bg2: 80,
      bg3: 185
    },

    animation: {
      walkFrameTime: 0.18
    },

    text: {
      normal: "Удерживай сумки в равновесии: ← и →",
      hit: "Осторожно! Сумки качнулись!",
      dropped: "Ой! Один продукт выпал из сумки.",
      winTitle: "Сумки донесены!",
      winText: "Добрыня аккуратно донёс продукты и помог бабушке. Это настоящий добрый поступок.",
      loseBadge: "Попробуй ещё раз",
      loseTitle: "Продукты рассыпались",
      loseText: "Сумки сильно раскачались. Попробуй ещё раз и удерживай равновесие аккуратнее."
    }
  };

  const state = {
    running: false,
    ended: false,
    time: 0,
    distance: 0,
    balance: 0,
    velocity: 0,
    driftDirection: 1,
    lostProducts: 0,
    lastFrameTime: 0,
    nextSpawn: 0,
    nextRandomPush: 0,
    lastHitTime: -10,
    lastDropTime: -10,
    walkFrameTimer: 0,
    walkFrame: 0,
    obstacles: [],
    keys: {
      left: false,
      right: false
    }
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    setImages();
    bindEvents();
  }

  function cacheNodes() {
    nodes.start = document.querySelector("#grannyStart");
    nodes.game = document.querySelector("#grannyGame");
    nodes.result = document.querySelector("#grannyResult");
    nodes.startBtn = document.querySelector("#grannyStartBtn");
    nodes.againBtn = document.querySelector("#grannyAgainBtn");
    nodes.helpBtn = document.querySelector("#grannyHelpBtn");
    nodes.helpModal = document.querySelector("#grannyHelpModal");
    nodes.icon = document.querySelector("#grannyStartIcon");
    nodes.resultImage = document.querySelector("#grannyResultImage");
    nodes.resultBadge = document.querySelector("#grannyResultBadge");
    nodes.resultTitle = document.querySelector("#grannyResultTitle");
    nodes.resultText = document.querySelector("#grannyResultText");
    nodes.field = document.querySelector("#grannyField");
    nodes.bg1 = document.querySelector("#grannyBg1");
    nodes.bg2 = document.querySelector("#grannyBg2");
    nodes.bg3 = document.querySelector("#grannyBg3");
    nodes.obstacles = document.querySelector("#grannyObstacles");
    nodes.drops = document.querySelector("#grannyDrops");
    nodes.boy = document.querySelector("#grannyBoy");
    nodes.distance = document.querySelector("#grannyDistance");
    nodes.lives = document.querySelector("#grannyLives");
    nodes.needle = document.querySelector("#grannyBalanceNeedle");
    nodes.hint = document.querySelector("#grannyHint");
    nodes.leftBtn = document.querySelector("#grannyLeftBtn");
    nodes.rightBtn = document.querySelector("#grannyRightBtn");
  }

  function setImages() {
    nodes.icon.src = asset(CONFIG.assets.icon);
    nodes.icon.alt = "Иконка игры Перенеси бабушке сумки";
    nodes.resultImage.src = asset(CONFIG.assets.boySuccess);
    nodes.resultImage.alt = "Добрыня помог бабушке";

    nodes.bg1.style.backgroundImage = `url("${asset(CONFIG.assets.bg1)}")`;
    nodes.bg2.style.backgroundImage = `url("${asset(CONFIG.assets.bg2)}")`;
    nodes.bg3.style.backgroundImage = `url("${asset(CONFIG.assets.bg3)}")`;
    nodes.boy.src = asset(CONFIG.assets.boyIdle);
  }

  function bindEvents() {
    nodes.startBtn.addEventListener("click", startGame);
    nodes.againBtn.addEventListener("click", startGame);
    nodes.helpBtn.addEventListener("click", openHelp);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-granny-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeHelp();
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = true;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = true;
    });

    document.addEventListener("keyup", function (event) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = false;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = false;
    });

    bindHoldButton(nodes.leftBtn, "left");
    bindHoldButton(nodes.rightBtn, "right");
  }

  function bindHoldButton(button, key) {
    const start = function (event) {
      event.preventDefault();
      state.keys[key] = true;
    };

    const stop = function () {
      state.keys[key] = false;
    };

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointerleave", stop);
    button.addEventListener("pointercancel", stop);
  }

  function asset(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function startGame() {
    state.running = true;
    state.ended = false;
    state.time = 0;
    state.distance = 0;
    state.balance = 0;
    state.velocity = 0;
    state.driftDirection = Math.random() > 0.5 ? 1 : -1;
    state.lostProducts = 0;
    state.lastFrameTime = 0;
    state.nextSpawn = randomBetween(CONFIG.game.spawnMin, CONFIG.game.spawnMax);
    state.nextRandomPush = randomBetween(CONFIG.balance.randomPushEveryMin, CONFIG.balance.randomPushEveryMax);
    state.lastHitTime = -10;
    state.lastDropTime = -10;
    state.walkFrameTimer = 0;
    state.walkFrame = 0;
    state.obstacles = [];
    state.keys.left = false;
    state.keys.right = false;

    nodes.obstacles.innerHTML = "";
    nodes.drops.innerHTML = "";
    nodes.boy.src = asset(CONFIG.assets.boyWalk1);
    nodes.boy.classList.remove("is-hit");
    setHint(CONFIG.text.normal);
    updateLives();
    updateHud();
    showScreen(nodes.game);

    requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (!state.running) return;

    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const dt = Math.min((timestamp - state.lastFrameTime) / 1000, 0.04);
    state.lastFrameTime = timestamp;

    update(dt);
    render();

    if (state.running) requestAnimationFrame(loop);
  }

  function update(dt) {
    state.time += dt;
    state.distance = Math.min(100, (state.time / CONFIG.game.duration) * 100);

    updateParallax();
    updateBalance(dt);
    updateWalkAnimation(dt);
    updateSpawns(dt);
    updateObstacles(dt);
    checkDangerDrop();
    updateHud();

    if (state.distance >= 100) {
      endGame(true);
    }
  }

  function updateBalance(dt) {
    state.nextRandomPush -= dt;

    if (state.nextRandomPush <= 0) {
      state.driftDirection *= -1;
      state.velocity += state.driftDirection * randomBetween(CONFIG.balance.randomPushMin, CONFIG.balance.randomPushMax);
      state.nextRandomPush = randomBetween(CONFIG.balance.randomPushEveryMin, CONFIG.balance.randomPushEveryMax);
    }

    state.velocity += state.driftDirection * CONFIG.balance.driftForce * dt;

    if (state.keys.left) state.velocity -= CONFIG.balance.controlForce * dt;
    if (state.keys.right) state.velocity += CONFIG.balance.controlForce * dt;

    state.velocity *= Math.pow(CONFIG.balance.damping, dt * 8);
    state.balance += state.velocity * dt;
    state.balance = clamp(state.balance, -1.25, 1.25);
  }

  function updateWalkAnimation(dt) {
    state.walkFrameTimer += dt;
    if (state.walkFrameTimer < CONFIG.animation.walkFrameTime) return;

    state.walkFrameTimer = 0;
    state.walkFrame = state.walkFrame ? 0 : 1;
    nodes.boy.src = asset(state.walkFrame ? CONFIG.assets.boyWalk2 : CONFIG.assets.boyWalk1);
  }

  function updateSpawns(dt) {
    state.nextSpawn -= dt;
    if (state.nextSpawn > 0) return;

    spawnObstacle();
    state.nextSpawn = randomBetween(CONFIG.game.spawnMin, CONFIG.game.spawnMax);
  }

  function spawnObstacle() {
    const types = Object.keys(CONFIG.assets.obstacles);
    const type = types[Math.floor(Math.random() * types.length)];
    const data = CONFIG.assets.obstacles[type];

    const item = document.createElement("img");
    item.className = "granny-obstacle";
    item.src = asset(data.image);
    item.alt = "";
    item.draggable = false;
    item.style.setProperty("--size", data.size + "px");

    const obstacle = {
      type,
      element: item,
      x: 112,
      y: CONFIG.game.obstacleY + randomBetween(-3, 2),
      size: data.size,
      impulse: data.impulse,
      hit: false
    };

    state.obstacles.push(obstacle);
    nodes.obstacles.appendChild(item);
  }

  function updateObstacles(dt) {
    const speedPercent = (CONFIG.game.obstacleSpeed / fieldWidth()) * 100;

    state.obstacles.forEach(function (obstacle) {
      obstacle.x -= speedPercent * dt;

      if (!obstacle.hit && isNearPlayer(obstacle)) {
        hitObstacle(obstacle);
      }
    });

    state.obstacles = state.obstacles.filter(function (obstacle) {
      if (obstacle.x > -10) return true;
      obstacle.element.remove();
      return false;
    });
  }

  function isNearPlayer(obstacle) {
    const playerX = CONFIG.game.playerX;
    const distancePx = Math.abs(percentToPx(obstacle.x - playerX));
    return distancePx < CONFIG.game.hitDistance;
  }

  function hitObstacle(obstacle) {
    if (state.time - state.lastHitTime < CONFIG.game.hitCooldown) return;

    obstacle.hit = true;
    state.lastHitTime = state.time;
    state.velocity += (Math.random() > 0.5 ? 1 : -1) * obstacle.impulse;
    state.balance += (Math.random() > 0.5 ? 0.18 : -0.18);
    setHint(CONFIG.text.hit);

    nodes.boy.classList.remove("is-hit");
    void nodes.boy.offsetWidth;
    nodes.boy.classList.add("is-hit");
  }

  function checkDangerDrop() {
    if (Math.abs(state.balance) < CONFIG.balance.dangerLimit) return;
    if (state.time - state.lastDropTime < CONFIG.balance.dropCooldown) return;

    state.lastDropTime = state.time;
    state.lostProducts += 1;
    state.balance *= 0.35;
    state.velocity *= -0.25;
    setHint(CONFIG.text.dropped);
    spawnDrop();
    updateLives();

    if (state.lostProducts >= CONFIG.game.maxLostProducts) {
      endGame(false);
    }
  }

  function spawnDrop() {
    const remaining = CONFIG.assets.drops[Math.min(state.lostProducts - 1, CONFIG.assets.drops.length - 1)];
    const drop = document.createElement("img");
    drop.className = "granny-drop";
    drop.src = asset(remaining);
    drop.alt = "";
    drop.draggable = false;
    drop.style.left = (CONFIG.game.playerX + randomBetween(-2, 4)) + "%";
    drop.style.top = "66%";
    nodes.drops.appendChild(drop);

    window.setTimeout(function () {
      drop.remove();
    }, 850);
  }

  function render() {
    const tilt = clamp(state.balance * 11, -14, 14);
    nodes.boy.style.setProperty("--tilt", tilt + "deg");
    nodes.needle.style.left = (50 + clamp(state.balance, -1, 1) * 42) + "%";

    state.obstacles.forEach(function (obstacle) {
      obstacle.element.style.left = obstacle.x + "%";
      obstacle.element.style.top = obstacle.y + "%";
    });
  }

  function updateParallax() {
    nodes.bg1.style.backgroundPositionX = -state.time * CONFIG.parallax.bg1 + "px";
    nodes.bg2.style.backgroundPositionX = -state.time * CONFIG.parallax.bg2 + "px";
    nodes.bg3.style.backgroundPositionX = -state.time * CONFIG.parallax.bg3 + "px";
  }

  function updateHud() {
    nodes.distance.textContent = String(Math.floor(state.distance));
  }

  function updateLives() {
    const icons = ["🍎", "🥖", "🥛"];
    const left = icons.slice(state.lostProducts).join(" ");
    nodes.lives.textContent = left || "—";
  }

  function endGame(isWin) {
    if (state.ended) return;

    state.running = false;
    state.ended = true;
    nodes.boy.src = asset(CONFIG.assets.boyIdle);

    window.setTimeout(function () {
      if (isWin) {
        nodes.resultImage.src = asset(CONFIG.assets.boySuccess);
        nodes.resultBadge.textContent = "Победа";
        nodes.resultTitle.textContent = CONFIG.text.winTitle;
        nodes.resultText.textContent = CONFIG.text.winText;
      } else {
        nodes.resultImage.src = asset(CONFIG.assets.boyIdle);
        nodes.resultBadge.textContent = CONFIG.text.loseBadge;
        nodes.resultTitle.textContent = CONFIG.text.loseTitle;
        nodes.resultText.textContent = CONFIG.text.loseText;
      }

      showScreen(nodes.result);
    }, CONFIG.game.finishDelay);
  }

  function showScreen(screen) {
    nodes.start.classList.remove("is-active");
    nodes.game.classList.remove("is-active");
    nodes.result.classList.remove("is-active");
    screen.classList.add("is-active");
  }

  function setHint(text) {
    nodes.hint.textContent = text;
  }

  function openHelp() {
    nodes.helpModal.classList.add("is-open");
    nodes.helpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeHelp() {
    nodes.helpModal.classList.remove("is-open");
    nodes.helpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function fieldWidth() {
    return nodes.field.getBoundingClientRect().width || 1000;
  }

  function percentToPx(percent) {
    return fieldWidth() * percent / 100;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
