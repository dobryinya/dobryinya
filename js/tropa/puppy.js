(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/puppy/",
      icon: "icon.png",
      backgrounds: {
        select: "bg-select.png",
        path: "bg-path.png"
      },
      puppy: {
        idle: "puppy-idle.png",
        walk1: "puppy-walk1.png",
        walk2: "puppy-walk2.png",
        happy: "puppy-happy.png"
      },
      items: {
        umbrella: "umbrella.png",
        towel: "towel.png",
        box: "box.png",
        bowl: "bowl.png",
        ball: "ball.png",
        candy: "candy.png",
        stick: "stick.png",
        bag: "bag.png"
      }
    },

    requiredItems: ["umbrella", "towel", "box", "bowl"],

    itemText: {
      umbrella: "Зонтик",
      towel: "Полотенце",
      box: "Коробка",
      bowl: "Миска с водой",
      ball: "Мяч",
      candy: "Конфета",
      stick: "Палка",
      bag: "Пакет"
    },

    itemPositions: {
      umbrella: { x: 63, y: 30 },
      towel: { x: 80, y: 34 },
      box: { x: 66, y: 58 },
      bowl: { x: 84, y: 60 },
      ball: { x: 50, y: 33 },
      candy: { x: 53, y: 62 },
      stick: { x: 72, y: 76 },
      bag: { x: 90, y: 78 }
    },

    selectDog: { x: 18, y: 55 },
    basket: { x: 31, y: 72 },

    path: {
      start: { x: 7, y: 78 },
      finish: { x: 82, y: 35, radius: 8 },
      speed: 0.46,
      bumpBack: 5,
      walkFrameMs: 180,
      // проценты относительно изображения bg-path.png
      puddles: [
        { x: 8, y: 42, r: 5 },
        { x: 17, y: 58, r: 5 },
        { x: 22, y: 78, r: 7 },
        { x: 34, y: 41, r: 5 },
        { x: 43, y: 56, r: 6 },
        { x: 45, y: 82, r: 5 },
        { x: 58, y: 30, r: 5 },
        { x: 66, y: 71, r: 6 },
        { x: 78, y: 55, r: 7 },
        { x: 88, y: 75, r: 7 }
      ]
    },

    text: {
      normal: "Нажимай только на предметы, которые помогут щенку.",
      good: "Правильно! Этот предмет действительно поможет.",
      bad: "Этот предмет сейчас не поможет щенку. Выбери что-то полезное.",
      ready: "Набор помощи готов. Теперь можно проводить щенка в укрытие.",
      puddle: "Ой, лужа! Попробуй обойти её.",
      path: "Кликай по безопасным местам на дорожке. Обходи лужи."
    }
  };

  const state = {
    collected: new Set(),
    puppy: { x: 0, y: 0, targetX: 0, targetY: 0, moving: false, frame: 0, lastFrameAt: 0 },
    locked: false,
    rafId: null
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    setStaticImages();
    bindEvents();
  }

  function cacheNodes() {
    nodes.start = document.querySelector("#puppyStart");
    nodes.select = document.querySelector("#puppySelect");
    nodes.path = document.querySelector("#puppyPath");
    nodes.result = document.querySelector("#puppyResult");

    nodes.startBtn = document.querySelector("#puppyStartBtn");
    nodes.helpBtn = document.querySelector("#puppyHelpBtn");
    nodes.helpModal = document.querySelector("#puppyHelpModal");
    nodes.againBtn = document.querySelector("#puppyAgainBtn");

    nodes.startIcon = document.querySelector("#puppyStartIcon");
    nodes.selectBg = document.querySelector("#puppySelectBg");
    nodes.pathBg = document.querySelector("#puppyPathBg");
    nodes.selectDog = document.querySelector("#puppySelectDog");
    nodes.resultDog = document.querySelector("#puppyResultDog");

    nodes.selectField = document.querySelector("#puppySelectField");
    nodes.items = document.querySelector("#puppyItems");
    nodes.basket = document.querySelector("#puppyBasket");
    nodes.collected = document.querySelector("#puppyCollected");
    nodes.selectHint = document.querySelector("#puppySelectHint");
    nodes.goPathBtn = document.querySelector("#puppyGoPathBtn");
    nodes.selectRestartBtn = document.querySelector("#puppySelectRestartBtn");

    nodes.pathField = document.querySelector("#puppyPathField");
    nodes.runner = document.querySelector("#puppyRunner");
    nodes.pathHint = document.querySelector("#puppyPathHint");
    nodes.pathRestartBtn = document.querySelector("#puppyPathRestartBtn");
  }

  function bindEvents() {
    nodes.startBtn.addEventListener("click", startSelectStage);
    nodes.againBtn.addEventListener("click", startSelectStage);
    nodes.selectRestartBtn.addEventListener("click", startSelectStage);
    nodes.pathRestartBtn.addEventListener("click", startPathStage);
    nodes.goPathBtn.addEventListener("click", startPathStage);
    nodes.helpBtn.addEventListener("click", openHelp);
    nodes.pathField.addEventListener("click", handlePathClick);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-puppy-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeHelp();
    });
  }

  function asset(file) {
    return CONFIG.assets.basePath + file;
  }

  function itemAsset(id) {
    return asset(CONFIG.assets.items[id]);
  }

  function puppyAsset(name) {
    return asset(CONFIG.assets.puppy[name]);
  }

  function setStaticImages() {
    nodes.startIcon.src = asset(CONFIG.assets.icon);
    nodes.selectBg.src = asset(CONFIG.assets.backgrounds.select);
    nodes.pathBg.src = asset(CONFIG.assets.backgrounds.path);
    nodes.selectDog.src = puppyAsset("idle");
    nodes.resultDog.src = puppyAsset("happy");

    nodes.selectDog.style.left = CONFIG.selectDog.x + "%";
    nodes.selectDog.style.top = CONFIG.selectDog.y + "%";
    nodes.basket.style.left = CONFIG.basket.x + "%";
    nodes.basket.style.top = CONFIG.basket.y + "%";
  }

  function showScreen(screen) {
    [nodes.start, nodes.select, nodes.path, nodes.result].forEach(function (node) {
      node.classList.remove("is-active");
    });
    screen.classList.add("is-active");
  }

  function startSelectStage() {
    stopLoop();
    state.collected = new Set();
    state.locked = false;
    nodes.goPathBtn.disabled = true;
    nodes.collected.textContent = "0";
    setSelectHint(CONFIG.text.normal);
    renderItems();
    showScreen(nodes.select);
  }

  function renderItems() {
    nodes.items.innerHTML = "";
    nodes.basket.innerHTML = "";

    Object.keys(CONFIG.assets.items).forEach(function (id) {
      const button = document.createElement("button");
      button.className = "puppy-item";
      button.type = "button";
      button.dataset.item = id;
      button.style.left = CONFIG.itemPositions[id].x + "%";
      button.style.top = CONFIG.itemPositions[id].y + "%";
      button.setAttribute("aria-label", CONFIG.itemText[id]);

      const img = document.createElement("img");
      img.src = itemAsset(id);
      img.alt = CONFIG.itemText[id];
      img.draggable = false;

      button.appendChild(img);
      button.addEventListener("click", function () { chooseItem(id, button); });
      nodes.items.appendChild(button);
    });
  }

  function chooseItem(id, button) {
    if (state.collected.has(id)) return;

    if (!CONFIG.requiredItems.includes(id)) {
      button.classList.remove("is-wrong");
      void button.offsetWidth;
      button.classList.add("is-wrong");
      setSelectHint(CONFIG.text.bad);
      return;
    }

    state.collected.add(id);
    button.classList.add("is-collected");
    button.disabled = true;
    addBasketItem(id);
    nodes.collected.textContent = String(state.collected.size);

    if (state.collected.size === CONFIG.requiredItems.length) {
      nodes.goPathBtn.disabled = false;
      setSelectHint(CONFIG.text.ready);
    } else {
      setSelectHint(CONFIG.text.good);
    }
  }

  function addBasketItem(id) {
    const img = document.createElement("img");
    img.src = itemAsset(id);
    img.alt = CONFIG.itemText[id];
    img.draggable = false;
    nodes.basket.appendChild(img);
  }

  function setSelectHint(text) {
    nodes.selectHint.textContent = text;
  }

  function startPathStage() {
    stopLoop();
    state.locked = false;
    state.puppy.x = CONFIG.path.start.x;
    state.puppy.y = CONFIG.path.start.y;
    state.puppy.targetX = CONFIG.path.start.x;
    state.puppy.targetY = CONFIG.path.start.y;
    state.puppy.moving = false;
    state.puppy.frame = 0;
    state.puppy.lastFrameAt = 0;

    nodes.pathHint.textContent = CONFIG.text.path;
    updateRunnerImage();
    updateRunnerPosition();
    showScreen(nodes.path);
    state.rafId = requestAnimationFrame(gameLoop);
  }

  function handlePathClick(event) {
    if (state.locked) return;

    const rect = nodes.pathField.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    state.puppy.targetX = clamp(x, 4, 96);
    state.puppy.targetY = clamp(y, 16, 90);
    state.puppy.moving = true;
  }

  function gameLoop(time) {
    movePuppy(time);
    state.rafId = requestAnimationFrame(gameLoop);
  }

  function movePuppy(time) {
    if (!state.puppy.moving) return;

    const dx = state.puppy.targetX - state.puppy.x;
    const dy = state.puppy.targetY - state.puppy.y;
    const distance = Math.hypot(dx, dy);

    if (distance < CONFIG.path.speed) {
      state.puppy.x = state.puppy.targetX;
      state.puppy.y = state.puppy.targetY;
      state.puppy.moving = false;
      updateRunnerImage();
      updateRunnerPosition();
      checkFinish();
      return;
    }

    state.puppy.x += (dx / distance) * CONFIG.path.speed;
    state.puppy.y += (dy / distance) * CONFIG.path.speed;

    animateWalk(time);
    updateRunnerPosition();

    if (isInPuddle(state.puppy.x, state.puppy.y)) {
      bumpFromPuddle(dx, dy);
      nodes.pathHint.textContent = CONFIG.text.puddle;
    }

    checkFinish();
  }

  function animateWalk(time) {
    if (time - state.puppy.lastFrameAt < CONFIG.path.walkFrameMs) return;
    state.puppy.frame = state.puppy.frame === 0 ? 1 : 0;
    state.puppy.lastFrameAt = time;
    updateRunnerImage();
  }

  function updateRunnerImage() {
    if (!state.puppy.moving) {
      nodes.runner.src = puppyAsset("idle");
      return;
    }
    nodes.runner.src = puppyAsset(state.puppy.frame === 0 ? "walk1" : "walk2");
  }

  function updateRunnerPosition() {
    nodes.runner.style.left = state.puppy.x + "%";
    nodes.runner.style.top = state.puppy.y + "%";
  }

  function isInPuddle(x, y) {
    return CONFIG.path.puddles.some(function (puddle) {
      return Math.hypot(x - puddle.x, y - puddle.y) < puddle.r;
    });
  }

  function bumpFromPuddle(dx, dy) {
    const distance = Math.max(Math.hypot(dx, dy), 1);
    state.puppy.x -= (dx / distance) * CONFIG.path.bumpBack;
    state.puppy.y -= (dy / distance) * CONFIG.path.bumpBack;
    state.puppy.targetX = state.puppy.x;
    state.puppy.targetY = state.puppy.y;
    state.puppy.moving = false;
    updateRunnerImage();
    updateRunnerPosition();
  }

  function checkFinish() {
    const finish = CONFIG.path.finish;
    if (Math.hypot(state.puppy.x - finish.x, state.puppy.y - finish.y) > finish.radius) return;

    state.locked = true;
    stopLoop();
    showScreen(nodes.result);
  }

  function stopLoop() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
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
})();
