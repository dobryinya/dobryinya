(function() {
  "use strict";

  const ASSETS = {
    images: {
      bg: "images/kladovka/bg.png",
      axe: "images/kladovka/axe.png",
      berries: "images/kladovka/berries.png",
      box: "images/kladovka/box.png",
      fire: "images/kladovka/fire.png",
      fish: "images/kladovka/fish.png",
      fur: "images/kladovka/fur.png",
      herbs: "images/kladovka/herbs.png",
      meat: "images/kladovka/meat.png",
      mushrooms: "images/kladovka/mushrooms.png",
      pot: "images/kladovka/pot.png",
      salt: "images/kladovka/salt.png",
      wood: "images/kladovka/wood.png"
    },
    audio: {
      music: "music/kladovka.mp3",
      place: "sounds/kladovka-place.mp3",
      check: "sounds/kladovka-check.mp3",
      error: "sounds/err.mp3",
      win: "sounds/win.mp3"
    }
  };

  const CONFIG = {
    gridSize: 4,
    minItems: 5,
    maxItems: 12,
    minRules: 8,
    maxRules: 16,
    generationAttempts: 80,
    solutionAttempts: 250,
    firstErrorSoftCount: 2,
    messageHideTime: 1250,
    resultDelay: 850,
    musicVolume: 0.32,
    placeVolume: 0.95,
    checkVolume: 0.42,
    errorVolume: 0.48,
    winVolume: 0.78
  };

  const ITEMS = [
    { id: "axe", name: "топор", label: "Топор", src: ASSETS.images.axe, group: "tool" },
    { id: "berries", name: "ягоды", label: "Ягоды", src: ASSETS.images.berries, group: "food" },
    { id: "box", name: "берестяной короб", label: "Короб", src: ASSETS.images.box, group: "storage" },
    { id: "fire", name: "костёр", label: "Костёр", src: ASSETS.images.fire, group: "fire" },
    { id: "fish", name: "рыба", label: "Рыба", src: ASSETS.images.fish, group: "food" },
    { id: "fur", name: "мех", label: "Мех", src: ASSETS.images.fur, group: "material" },
    { id: "herbs", name: "травы", label: "Травы", src: ASSETS.images.herbs, group: "food" },
    { id: "meat", name: "мясо", label: "Мясо", src: ASSETS.images.meat, group: "food" },
    { id: "mushrooms", name: "грибы", label: "Грибы", src: ASSETS.images.mushrooms, group: "food" },
    { id: "pot", name: "котелок", label: "Котелок", src: ASSETS.images.pot, group: "tool" },
    { id: "salt", name: "соль", label: "Соль", src: ASSETS.images.salt, group: "food" },
    { id: "wood", name: "дрова", label: "Дрова", src: ASSETS.images.wood, group: "wood" }
  ];

  const RULE_TEMPLATES = [
    { type: "near", a: "pot", b: "fire", text: "Котелок должен стоять рядом с костром." },
    { type: "near", a: "wood", b: "fire", text: "Дрова должны лежать рядом с костром." },
    { type: "near", a: "axe", b: "wood", text: "Топор должен лежать рядом с дровами." },
    { type: "near", a: "salt", b: "meat", text: "Соль должна лежать рядом с мясом." },
    { type: "near", a: "berries", b: "box", text: "Ягоды должны стоять рядом с берестяным коробом." },
    { type: "near", a: "mushrooms", b: "herbs", text: "Грибы должны лежать рядом с травами." },
    { type: "notNear", a: "meat", b: "fire", text: "Мясо нельзя класть рядом с костром." },
    { type: "notNear", a: "fur", b: "fire", text: "Мех нельзя хранить рядом с костром." },
    { type: "notNear", a: "herbs", b: "fire", text: "Травы нельзя держать рядом с костром." },
    { type: "notNear", a: "fish", b: "meat", text: "Рыбу нельзя класть рядом с мясом." },
    { type: "notNear", a: "fur", b: "fish", text: "Мех нельзя хранить рядом с рыбой." },
    { type: "notNear", a: "berries", b: "meat", text: "Ягоды нельзя класть рядом с мясом." },
    { type: "edge", a: "fish", text: "Рыба должна лежать у стены кладовой." },
    { type: "edge", a: "box", text: "Берестяной короб должен стоять у стены." },
    { type: "edge", a: "wood", text: "Дрова должны лежать у стены." },
    { type: "corner", a: "fur", text: "Мех нужно положить в угол." },
    { type: "corner", a: "box", text: "Берестяной короб нужно поставить в угол." },
    { type: "notEdge", a: "fire", text: "Костёр не должен стоять у стены." },
    { type: "notEdge", a: "meat", text: "Мясо не должно лежать у стены." },
    { type: "above", a: "herbs", b: "meat", text: "Травы должны лежать выше мяса." },
    { type: "below", a: "salt", b: "fish", text: "Соль должна лежать ниже рыбы." },
    { type: "leftOf", a: "axe", b: "pot", text: "Топор должен лежать левее котелка." },
    { type: "rightOf", a: "berries", b: "mushrooms", text: "Ягоды должны стоять правее грибов." }
  ];

  const state = {
    running: false,
    finished: false,
    items: [],
    rules: [],
    board: [],
    errors: 0,
    messageTimerId: 0,
    resultTimerId: 0,
    dragged: null,
    puzzleNumber: 1
  };

  const startScreen = document.getElementById("kladovka-start");
  const gameShell = document.getElementById("kladovka-shell");
  const resultScreen = document.getElementById("kladovka-result");
  const gridEl = document.getElementById("kladovka-grid");
  const trayEl = document.getElementById("kladovka-tray");
  const rulesPanel = document.getElementById("kladovka-rules");
  const rulesToggle = document.getElementById("kladovka-rules-toggle");
  const rulesList = document.getElementById("kladovka-rules-list");
  const messageEl = document.getElementById("kladovka-message");
  const itemsCountEl = document.getElementById("kladovka-items-count");
  const rulesCountEl = document.getElementById("kladovka-rules-count");
  const startBtn = document.getElementById("kladovka-start-btn");
  const checkBtn = document.getElementById("kladovka-check-btn");
  const resultRestartBtn = document.getElementById("kladovka-result-restart-btn");

  const music = createAudio(ASSETS.audio.music, true, CONFIG.musicVolume);
  const placeSound = createAudio(ASSETS.audio.place, false, CONFIG.placeVolume);
  const checkSound = createAudio(ASSETS.audio.check, false, CONFIG.checkVolume);
  const errorSound = createAudio(ASSETS.audio.error, false, CONFIG.errorVolume);
  const winSound = createAudio(ASSETS.audio.win, false, CONFIG.winVolume);

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
    stopAudio(placeSound);
    stopAudio(checkSound);
    stopAudio(errorSound);
    stopAudio(winSound);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(list) {
    const result = list.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
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

  function getItem(id) {
    return ITEMS.find(function(item) {
      return item.id === id;
    });
  }

  function indexToPos(index) {
    return {
      row: Math.floor(index / CONFIG.gridSize),
      col: index % CONFIG.gridSize
    };
  }

  function getItemIndex(board, itemId) {
    return board.indexOf(itemId);
  }

  function areNear(aIndex, bIndex) {
    const a = indexToPos(aIndex);
    const b = indexToPos(bIndex);
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  function isEdge(index) {
    const pos = indexToPos(index);
    return pos.row === 0 || pos.col === 0 || pos.row === CONFIG.gridSize - 1 || pos.col === CONFIG.gridSize - 1;
  }

  function isCorner(index) {
    const pos = indexToPos(index);
    return (pos.row === 0 || pos.row === CONFIG.gridSize - 1) && (pos.col === 0 || pos.col === CONFIG.gridSize - 1);
  }

  function isRuleApplicable(rule, itemIds) {
    if (rule.a && itemIds.indexOf(rule.a) === -1) {
      return false;
    }
    if (rule.b && itemIds.indexOf(rule.b) === -1) {
      return false;
    }
    return true;
  }

  function checkRule(rule, board) {
    const aIndex = getItemIndex(board, rule.a);
    const bIndex = rule.b ? getItemIndex(board, rule.b) : -1;

    if (aIndex === -1 || (rule.b && bIndex === -1)) {
      return false;
    }

    const a = indexToPos(aIndex);
    const b = rule.b ? indexToPos(bIndex) : null;

    switch (rule.type) {
      case "near":
        return areNear(aIndex, bIndex);
      case "notNear":
        return !areNear(aIndex, bIndex);
      case "edge":
        return isEdge(aIndex);
      case "notEdge":
        return !isEdge(aIndex);
      case "corner":
        return isCorner(aIndex);
      case "above":
        return b ? a.row < b.row : false;
      case "below":
        return b ? a.row > b.row : false;
      case "leftOf":
        return b ? a.col < b.col : false;
      case "rightOf":
        return b ? a.col > b.col : false;
      default:
        return false;
    }
  }

  function createEmptyBoard() {
    return new Array(CONFIG.gridSize * CONFIG.gridSize).fill(null);
  }

  function buildSolution(itemIds, rules) {
    const cells = Array.from({ length: CONFIG.gridSize * CONFIG.gridSize }, function(_, index) {
      return index;
    });

    for (let attempt = 0; attempt < CONFIG.solutionAttempts; attempt++) {
      const board = createEmptyBoard();
      const places = shuffle(cells).slice(0, itemIds.length);

      itemIds.forEach(function(itemId, index) {
        board[places[index]] = itemId;
      });

      if (rules.every(function(rule) { return checkRule(rule, board); })) {
        return board;
      }
    }

    return null;
  }

  function generatePuzzle() {
    for (let attempt = 0; attempt < CONFIG.generationAttempts; attempt++) {
      const count = randomInt(CONFIG.minItems, CONFIG.maxItems);
      const selectedItems = shuffle(ITEMS).slice(0, count);
      const itemIds = selectedItems.map(function(item) { return item.id; });
      const candidates = shuffle(RULE_TEMPLATES.filter(function(rule) {
        return isRuleApplicable(rule, itemIds);
      }));

      const targetRules = Math.min(randomInt(CONFIG.minRules, CONFIG.maxRules), candidates.length);
      if (targetRules < CONFIG.minRules) {
        continue;
      }

      const chosenRules = [];
      let solution = null;

      for (let i = 0; i < candidates.length && chosenRules.length < targetRules; i++) {
        const nextRules = chosenRules.concat([candidates[i]]);
        const nextSolution = buildSolution(itemIds, nextRules);
        if (nextSolution) {
          chosenRules.push(candidates[i]);
          solution = nextSolution;
        }
      }

      if (chosenRules.length >= CONFIG.minRules && solution) {
        return {
          items: selectedItems,
          rules: chosenRules,
          solution: solution
        };
      }
    }

    return createFallbackPuzzle();
  }

  function createFallbackPuzzle() {
    const items = ["fire", "pot", "wood", "axe", "meat"].map(getItem);
    const rules = [
      RULE_TEMPLATES.find(function(rule) { return rule.type === "near" && rule.a === "pot" && rule.b === "fire"; }),
      RULE_TEMPLATES.find(function(rule) { return rule.type === "near" && rule.a === "wood" && rule.b === "fire"; }),
      RULE_TEMPLATES.find(function(rule) { return rule.type === "near" && rule.a === "axe" && rule.b === "wood"; }),
      RULE_TEMPLATES.find(function(rule) { return rule.type === "notNear" && rule.a === "meat" && rule.b === "fire"; })
    ].filter(Boolean);
    const board = createEmptyBoard();

    board[5] = "fire";
    board[6] = "pot";
    board[9] = "wood";
    board[13] = "axe";
    board[15] = "meat";

    return { items: items, rules: rules, solution: board };
  }

  function clearTimers() {
    window.clearTimeout(state.messageTimerId);
    window.clearTimeout(state.resultTimerId);
    state.messageTimerId = 0;
    state.resultTimerId = 0;
  }

  function showMessage(text) {
    if (!(messageEl instanceof HTMLElement)) {
      return;
    }

    window.clearTimeout(state.messageTimerId);
    messageEl.textContent = text;
    messageEl.hidden = false;
    state.messageTimerId = window.setTimeout(function() {
      messageEl.hidden = true;
    }, CONFIG.messageHideTime);
  }

  function updateHud() {
    if (itemsCountEl instanceof HTMLElement) {
      itemsCountEl.textContent = String(state.items.length);
    }
    if (rulesCountEl instanceof HTMLElement) {
      rulesCountEl.textContent = String(state.rules.length);
    }
  }

  function createGrid() {
    if (!(gridEl instanceof HTMLElement)) {
      return;
    }

    gridEl.innerHTML = "";
    for (let i = 0; i < CONFIG.gridSize * CONFIG.gridSize; i++) {
      const cell = document.createElement("div");
      cell.className = "kladovka-cell";
      cell.dataset.index = String(i);
      gridEl.appendChild(cell);
    }
  }

  function renderRules(failedRules) {
    if (!(rulesList instanceof HTMLElement)) {
      return;
    }

    rulesList.innerHTML = "";
    state.rules.forEach(function(rule, index) {
      const li = document.createElement("li");
      li.className = "kladovka-rule";
      if (failedRules && failedRules.indexOf(rule) !== -1) {
        li.classList.add("is-failed");
      }
      li.textContent = rule.text;
      rulesList.appendChild(li);
    });
  }

  function createPiece(item) {
    const button = document.createElement("button");
    const img = document.createElement("img");

    button.className = "kladovka-piece";
    button.type = "button";
    button.dataset.item = item.id;
    button.setAttribute("aria-label", item.label);

    img.src = item.src;
    img.alt = item.label;
    img.draggable = false;

    button.appendChild(img);
    return button;
  }

  function renderBoard() {
    if (!(gridEl instanceof HTMLElement) || !(trayEl instanceof HTMLElement)) {
      return;
    }

    Array.from(gridEl.children).forEach(function(cell) {
      cell.innerHTML = "";
      cell.classList.remove("is-over", "is-wrong");
    });
    trayEl.innerHTML = "";

    state.board.forEach(function(itemId, index) {
      if (!itemId) {
        return;
      }
      const item = getItem(itemId);
      const cell = gridEl.children[index];
      if (item && cell instanceof HTMLElement) {
        const piece = createPiece(item);
        piece.classList.add("is-placed");
        cell.appendChild(piece);
      }
    });

    state.items.forEach(function(item) {
      if (state.board.indexOf(item.id) === -1) {
        trayEl.appendChild(createPiece(item));
      }
    });
  }

  function clearGame() {
    state.running = false;
    state.finished = false;
    state.items = [];
    state.rules = [];
    state.board = createEmptyBoard();
    state.errors = 0;
    state.dragged = null;
    clearTimers();
    stopAllAudio();

    if (messageEl instanceof HTMLElement) {
      messageEl.hidden = true;
      messageEl.textContent = "";
    }
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    const puzzle = generatePuzzle();
    state.running = true;
    state.items = puzzle.items;
    state.rules = puzzle.rules;
    state.board = createEmptyBoard();

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    createGrid();
    renderRules(null);
    renderBoard();
    updateHud();
    playAudio(music, true);
  }

  function getCellFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    return element.closest(".kladovka-cell");
  }

  function getTrayFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    return element.closest(".kladovka-tray");
  }

  function getPieceIndex(piece) {
    const parentCell = piece.closest(".kladovka-cell");
    if (parentCell instanceof HTMLElement) {
      return Number(parentCell.dataset.index);
    }
    return -1;
  }

  function moveDraggedTo(x, y) {
    if (!state.dragged) {
      return;
    }

    state.dragged.el.style.left = x - state.dragged.offsetX + "px";
    state.dragged.el.style.top = y - state.dragged.offsetY + "px";
  }

  function setHoverCell(cell) {
    if (!(gridEl instanceof HTMLElement)) {
      return;
    }

    Array.from(gridEl.children).forEach(function(item) {
      item.classList.toggle("is-over", item === cell);
    });
  }

  function startDrag(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !state.running || state.finished) {
      return;
    }

    const piece = target.closest(".kladovka-piece");
    if (!(piece instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    const rect = piece.getBoundingClientRect();
    const itemId = piece.dataset.item || "";
    const fromIndex = getPieceIndex(piece);

    state.dragged = {
      el: piece,
      itemId: itemId,
      fromIndex: fromIndex,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };

    piece.classList.remove("is-placed");
    piece.classList.add("is-dragging");
    piece.style.width = rect.width + "px";
    piece.style.height = rect.height + "px";
    piece.style.left = rect.left + "px";
    piece.style.top = rect.top + "px";
    document.body.appendChild(piece);
    moveDraggedTo(event.clientX, event.clientY);

    if (fromIndex !== -1) {
      state.board[fromIndex] = null;
    }

    piece.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!state.dragged) {
      return;
    }

    event.preventDefault();
    moveDraggedTo(event.clientX, event.clientY);
    setHoverCell(getCellFromPoint(event.clientX, event.clientY));
  }

  function finishDrag(event) {
    if (!state.dragged) {
      return;
    }

    event.preventDefault();

    const itemId = state.dragged.itemId;
    const cell = getCellFromPoint(event.clientX, event.clientY);
    const tray = getTrayFromPoint(event.clientX, event.clientY);
    let placed = false;

    if (cell instanceof HTMLElement) {
      const targetIndex = Number(cell.dataset.index);
      const existing = state.board[targetIndex];

      if (existing && existing !== itemId) {
        const oldIndex = state.dragged.fromIndex;
        if (oldIndex !== -1) {
          state.board[oldIndex] = existing;
        }
      }

      state.board[targetIndex] = itemId;
      placed = true;
    } else if (tray instanceof HTMLElement) {
      placed = true;
    } else if (state.dragged.fromIndex !== -1) {
      state.board[state.dragged.fromIndex] = itemId;
    }

    state.dragged.el.classList.remove("is-dragging");
    state.dragged.el.removeAttribute("style");
    state.dragged = null;
    setHoverCell(null);
    renderBoard();

    if (placed) {
      playAudio(placeSound, true);
    }
  }

  function getFailedRules() {
    return state.rules.filter(function(rule) {
      return !checkRule(rule, state.board);
    });
  }

  function getWrongCells(failedRules) {
    const indexes = [];
    failedRules.forEach(function(rule) {
      const aIndex = getItemIndex(state.board, rule.a);
      const bIndex = rule.b ? getItemIndex(state.board, rule.b) : -1;
      if (aIndex !== -1 && indexes.indexOf(aIndex) === -1) {
        indexes.push(aIndex);
      }
      if (bIndex !== -1 && indexes.indexOf(bIndex) === -1) {
        indexes.push(bIndex);
      }
    });
    return indexes;
  }

  function markWrongCells(indexes) {
    if (!(gridEl instanceof HTMLElement)) {
      return;
    }

    indexes.forEach(function(index) {
      const cell = gridEl.children[index];
      if (cell instanceof HTMLElement) {
        cell.classList.remove("is-wrong");
        window.setTimeout(function() {
          cell.classList.add("is-wrong");
        }, 0);
      }
    });
  }

  function checkPuzzle() {
    if (!state.running || state.finished) {
      return;
    }

    playAudio(checkSound, true);

    const placedCount = state.board.filter(Boolean).length;
    if (placedCount < state.items.length) {
      showMessage("Сначала разложи все предметы");
      return;
    }

    const failedRules = getFailedRules();
    if (failedRules.length === 0) {
      finishGame();
      return;
    }

    state.errors += 1;
    playAudio(errorSound, true);

    if (state.errors <= CONFIG.firstErrorSoftCount) {
      renderRules(null);
      showMessage("Пока не всё правильно");
      return;
    }

    renderRules(failedRules);
    markWrongCells(getWrongCells(failedRules));
    showMessage("Проверь подсвеченные правила");
  }

  function finishGame() {
    state.finished = true;
    state.running = false;
    stopAudio(music);
    playAudio(winSound, true);
    showMessage("Готово!");

    state.resultTimerId = window.setTimeout(function() {
      if (gameShell instanceof HTMLElement) {
        gameShell.hidden = true;
      }
      if (resultScreen instanceof HTMLElement) {
        resultScreen.hidden = false;
      }
    }, CONFIG.resultDelay);
  }

  function toggleRules() {
    if (!(rulesPanel instanceof HTMLElement) || !(rulesToggle instanceof HTMLButtonElement)) {
      return;
    }

    const collapsed = rulesPanel.classList.toggle("is-collapsed");
    rulesToggle.setAttribute("aria-expanded", String(!collapsed));
  }

  function bindEvents() {
    if (startBtn instanceof HTMLButtonElement) {
      startBtn.addEventListener("click", startGame);
    }

    if (checkBtn instanceof HTMLButtonElement) {
      checkBtn.addEventListener("click", checkPuzzle);
    }

    if (resultRestartBtn instanceof HTMLButtonElement) {
      resultRestartBtn.addEventListener("click", function() {
        state.puzzleNumber += 1;
        startGame();
      });
    }

    if (rulesToggle instanceof HTMLButtonElement) {
      rulesToggle.addEventListener("click", toggleRules);
    }

    document.addEventListener("pointerdown", startDrag);
    document.addEventListener("pointermove", moveDrag);
    document.addEventListener("pointerup", finishDrag);
    document.addEventListener("pointercancel", finishDrag);
  }

  function preloadAssets() {
    Object.keys(ASSETS.images).forEach(function(key) {
      const img = new Image();
      img.src = ASSETS.images[key];
    });
  }

  function init() {
    initNavigation();
    initYear();
    preloadAssets();
    bindEvents();
    createGrid();
    updateHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
