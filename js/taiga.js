(function() {
  "use strict";

  const ASSETS = {
    images: {
      background: "images/taiga/bg.png",
      start: "images/taiga/start.png",
      finish: "images/taiga/finish.png",
      win: "images/taiga/win.png",
      lose: "images/taiga/lose.png",
      bog: "images/taiga/bog.png",
      rock: "images/taiga/rock.png",
      trees: [
        "images/taiga/tree1.png",
        "images/taiga/tree2.png",
        "images/taiga/tree4.png"
      ],
      bridges: {
        straight: "images/taiga/bridge_straight.png",
        corner: "images/taiga/bridge_corner.png",
        t: "images/taiga/bridge_t.png",
        cross: "images/taiga/bridge_cross.png",
        end: "images/taiga/bridge_end.png"
      }
    },
    audio: {
      music: "music/taiga.mp3",
      rotate: "sounds/taiga-rotate.mp3",
      win: "sounds/taiga-win.mp3"
    }
  };

  const CONFIG = {
    gridSize: 6,

    startCell: { row: 0, col: 0 },
    finishCell: { row: 5, col: 5 },

    // Домики НЕ вращаются игроком, но визуально стоят фиксированно:
    // start.png изначально смотрит вниз, 270deg поворачивает вход вправо.
    // finish.png изначально смотрит вниз, 90deg поворачивает вход влево.
    startFixedRotation: 270,
    finishFixedRotation: 90,

    solutionPathLength: 19,

    musicVolume: 0.3,
    rotateVolume: 0.55,
    winVolume: 0.78,

    walkerStepTime: 260,
    resultDelay: 900,
    pathGlowTime: 620
  };

  const DIRS = {
    up: { dr: -1, dc: 0, opposite: "down" },
    right: { dr: 0, dc: 1, opposite: "left" },
    down: { dr: 1, dc: 0, opposite: "up" },
    left: { dr: 0, dc: -1, opposite: "right" }
  };

  const ROTATION_STEPS = [0, 90, 180, 270];

  const BASE_CONNECTIONS = {
    straight: ["left", "right"],
    corner: ["left", "down"],
    t: ["left", "right", "down"],
    cross: ["up", "right", "down", "left"],
    end: ["down"],
    start: ["right"],
    finish: ["left"]
  };


  /*
    Правильный маршрут:
    старт → → ↓ → → ↓ ↓ ← ↓ ← ↑ ← ↓ ↓ → → → → финиш
  */
  const LEVEL = [
    ["start", "straight", "corner", "t", "bog", "tree"],
    ["bog", "tree", "corner", "straight", "corner", "rock"],
    ["tree", "rock", "t", "bog", "straight", "bog"],
    ["bog", "corner", "corner", "corner", "corner", "corner"],
    ["tree", "straight", "corner", "corner", "tree", "straight"],
    ["rock", "corner", "straight", "straight", "straight", "finish"]
  ];

  const SOLUTION_ROTATIONS = [
    [270, 0, 180, 0, 0, 0],
    [0, 0, 0, 0, 180, 0],
    [0, 0, 90, 0, 90, 0],
    [0, 90, 180, 90, 270, 180],
    [0, 90, 0, 270, 0, 90],
    [0, 0, 0, 0, 0, 90]
  ];
  const SOLUTION_PATH = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [3, 4],
    [3, 3],
    [4, 3],
    [4, 2],
    [3, 2],
    [3, 1],
    [4, 1],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4],
    [5, 5]
  ];
  const state = {
    running: false,
    finished: false,
    moves: 0,
    cells: [],
    path: [],
    timers: []
  };

  const startScreen = document.getElementById("taiga-start");
  const gameShell = document.getElementById("taiga-shell");
  const resultScreen = document.getElementById("taiga-result");
  const grid = document.getElementById("taiga-grid");
  const field = document.getElementById("taiga-field");
  const walker = document.getElementById("taiga-walker");
  const messageEl = document.getElementById("taiga-message");
  const movesEl = document.getElementById("taiga-moves");
  const connectedEl = document.getElementById("taiga-connected");
  const startBtn = document.getElementById("taiga-start-btn");
  const restartBtn = document.getElementById("taiga-restart-btn");
  const resultRestartBtn = document.getElementById("taiga-result-restart-btn");
  const resultText = document.getElementById("taiga-result-text");

  const music = createAudio(ASSETS.audio.music, true, CONFIG.musicVolume);
  const rotateSound = createAudio(ASSETS.audio.rotate, false, CONFIG.rotateVolume);
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

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomRotationExcept(solutionRotation) {
    const options = ROTATION_STEPS.filter(function(step) {
      return step !== solutionRotation;
    });

    return randomItem(options);
  }

  function rotateDirection(direction, rotation) {
    const order = ["up", "right", "down", "left"];
    const index = order.indexOf(direction);
    const steps = (((rotation % 360) + 360) % 360) / 90;
  
    return order[(index + steps) % 4];
  }

  function getConnections(cell) {
    if (cell.type === "start") {
      return ["right"];
    }
  
    if (cell.type === "finish") {
      return ["left"];
    }
  
    const base = BASE_CONNECTIONS[cell.type] || [];
  
    return base.map(function(direction) {
      return rotateDirection(direction, cell.rotation);
    });
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

  function getCellRotation(type, rowIndex, colIndex) {
    if (type === "start") {
      return CONFIG.startFixedRotation;
    }

    if (type === "finish") {
      return CONFIG.finishFixedRotation;
    }

    return SOLUTION_ROTATIONS[rowIndex][colIndex] || 0;
  }

  function buildLevel() {
    state.cells = LEVEL.map(function(row, rowIndex) {
      return row.map(function(type, colIndex) {
        const solutionRotation = getCellRotation(type, rowIndex, colIndex);
        const rotatable = ["straight", "corner", "t", "cross", "end"].includes(type);
        const decorative = ["tree", "bog", "rock"].includes(type);

        const rotation = rotatable
          ? randomRotationExcept(solutionRotation)
          : solutionRotation;

        return {
          row: rowIndex,
          col: colIndex,
          type: type,
          rotation: rotation,
          solutionRotation: solutionRotation,
          rotatable: rotatable,
          decorative: decorative,
          el: null,
          treeImage: type === "tree" ? randomItem(ASSETS.images.trees) : null
        };
      });
    });
  }

  function getImageForCell(cell) {
    if (cell.type === "start") return ASSETS.images.start;
    if (cell.type === "finish") return ASSETS.images.finish;
    if (cell.type === "bog") return ASSETS.images.bog;
    if (cell.type === "rock") return ASSETS.images.rock;
    if (cell.type === "tree") return cell.treeImage || ASSETS.images.trees[0];

    return ASSETS.images.bridges[cell.type] || ASSETS.images.bog;
  }

  function renderGrid() {
    if (!(grid instanceof HTMLElement)) {
      return;
    }

    grid.innerHTML = "";

    state.cells.flat().forEach(function(cell) {
      const button = document.createElement("button");
      const img = document.createElement("img");

      button.className = "taiga-cell taiga-cell--" + cell.type;
      button.type = "button";
      button.dataset.row = String(cell.row);
      button.dataset.col = String(cell.col);
      button.style.setProperty("--cell-rotation", cell.rotation + "deg");

      if (!cell.rotatable) {
        button.classList.add("is-fixed");
        button.disabled = true;
      }

      if (cell.decorative) {
        button.classList.add("is-decorative");
      }

      img.src = getImageForCell(cell);
      img.alt = "Клетка таёжного моста";
      img.draggable = false;

      button.appendChild(img);

      button.addEventListener("click", function() {
        rotateCell(cell);
      });

      cell.el = button;
      grid.appendChild(button);
    });
  }

  function rotateCell(cell) {
    if (!state.running || state.finished || !cell.rotatable) {
      return;
    }

    cell.rotation = (cell.rotation + 90) % 360;
    state.moves += 1;

    if (cell.el instanceof HTMLElement) {
      cell.el.style.setProperty("--cell-rotation", cell.rotation + "deg");
      cell.el.classList.remove("is-rotate-pop");
      void cell.el.offsetWidth;
      cell.el.classList.add("is-rotate-pop");
    }

    playAudio(rotateSound, true);
    updateHud();
    checkPath();
  }

  function getCell(row, col) {
    if (row < 0 || row >= CONFIG.gridSize || col < 0 || col >= CONFIG.gridSize) {
      return null;
    }

    return state.cells[row][col];
  }

  function findConnectedPath() {
    const start = getCell(CONFIG.startCell.row, CONFIG.startCell.col);
    const finishKey = CONFIG.finishCell.row + ":" + CONFIG.finishCell.col;

    if (!start) {
      return [];
    }

    const queue = [{ cell: start, path: [start] }];
    const visited = new Set([start.row + ":" + start.col]);

    while (queue.length) {
      const current = queue.shift();
      const currentKey = current.cell.row + ":" + current.cell.col;

      if (currentKey === finishKey) {
        return current.path;
      }

      const connections = getConnections(current.cell);

      connections.forEach(function(direction) {
        const dir = DIRS[direction];
        const next = getCell(current.cell.row + dir.dr, current.cell.col + dir.dc);

        if (!next || next.decorative) {
          return;
        }

        const nextConnections = getConnections(next);

        if (!nextConnections.includes(dir.opposite)) {
          return;
        }

        const nextKey = next.row + ":" + next.col;

        if (visited.has(nextKey)) {
          return;
        }

        visited.add(nextKey);
        queue.push({ cell: next, path: current.path.concat(next) });
      });
    }

    return [];
  }

  function updatePathHighlight(path) {
    state.cells.flat().forEach(function(cell) {
      if (cell.el instanceof HTMLElement) {
        cell.el.classList.remove("is-connected", "is-final-path");
      }
    });

    path.forEach(function(cell) {
      if (cell.el instanceof HTMLElement) {
        cell.el.classList.add("is-connected");
      }
    });
  }

  function isRotationCorrect(cell) {
    if (!cell.rotatable) {
      return true;
    }
  
    const current = ((cell.rotation % 360) + 360) % 360;
    const solution = ((cell.solutionRotation % 360) + 360) % 360;
  
    if (cell.type === "straight") {
      return current === solution || current === (solution + 180) % 360;
    }
  
    if (cell.type === "cross") {
      return true;
    }
  
    return current === solution;
  }
  
  function checkPath() {
    const path = [];
    let solved = true;
  
    SOLUTION_PATH.forEach(function(position) {
      const row = position[0];
      const col = position[1];
      const cell = getCell(row, col);
  
      if (!cell) {
        solved = false;
        return;
      }
  
      path.push(cell);
  
      if (!isRotationCorrect(cell)) {
        solved = false;
      }
    });
  
    state.path = path;
    updatePathHighlight(path);
  
    if (connectedEl instanceof HTMLElement) {
      let correctCount = 0;
  
      path.forEach(function(cell) {
        if (isRotationCorrect(cell)) {
          correctCount += 1;
        }
      });
  
      connectedEl.textContent = String(Math.round(correctCount / CONFIG.solutionPathLength * 100));
    }
  
    if (solved) {
      finishWin();
    }
  }
  function updateHud() {
    if (movesEl instanceof HTMLElement) {
      movesEl.textContent = String(state.moves);
    }
  }

  function showMessage(text, hidden) {
    if (!(messageEl instanceof HTMLElement)) {
      return;
    }

    messageEl.textContent = text;
    messageEl.hidden = hidden;
  }

  function finishWin() {
    if (state.finished) {
      return;
    }

    state.finished = true;

    showMessage("Путь найден!", false);
    playAudio(winSound, true);
    stopAudio(music);

    state.path.forEach(function(cell, index) {
      if (!(cell.el instanceof HTMLElement)) {
        return;
      }

      setTimer(function() {
        cell.el.classList.add("is-final-path");
      }, index * 65);
    });

    setTimer(animateWalker, CONFIG.pathGlowTime);
  }

  function animateWalker() {
    if (!(walker instanceof HTMLImageElement) || !(field instanceof HTMLElement)) {
      showResult();
      return;
    }

    walker.hidden = false;
    walker.style.opacity = "1";

    let index = 0;

    function step() {
      const cell = state.path[index];

      if (!cell) {
        setTimer(showResult, CONFIG.resultDelay);
        return;
      }

      const left = 5 + (cell.col + 0.5) * (90 / CONFIG.gridSize);
      const top = 5 + (cell.row + 0.5) * (90 / CONFIG.gridSize);

      walker.style.left = left + "%";
      walker.style.top = top + "%";
      walker.style.width = Math.min(12, 78 / CONFIG.gridSize) + "%";
      walker.style.transform = "translate(-50%, -50%)";

      index += 1;
      setTimer(step, CONFIG.walkerStepTime);
    }

    step();
  }

  function showResult() {
    state.running = false;

    if (gameShell instanceof HTMLElement) {
      gameShell.hidden = true;
    }

    if (resultScreen instanceof HTMLElement) {
      resultScreen.hidden = false;
    }

    if (resultText instanceof HTMLElement) {
      if (state.moves <= 24) {
        resultText.textContent = "Отлично! Ты быстро нашёл длинную тропу через болотистую тайгу.";
      } else if (state.moves <= 40) {
        resultText.textContent = "Хороший маршрут! Мост собран, охотник добрался до лабаза.";
      } else {
        resultText.textContent = "Путь найден! В тайге главное — терпение и внимательность.";
      }
    }
  }

  function clearGame() {
    clearTimers();
    stopAudio(music);
    stopAudio(rotateSound);
    stopAudio(winSound);

    state.running = false;
    state.finished = false;
    state.moves = 0;
    state.cells = [];
    state.path = [];

    if (grid instanceof HTMLElement) {
      grid.innerHTML = "";
    }

    if (walker instanceof HTMLImageElement) {
      walker.hidden = true;
      walker.style.opacity = "0";
    }

    showMessage("", true);
    updateHud();

    if (connectedEl instanceof HTMLElement) {
      connectedEl.textContent = "0";
    }
  }

  function startGame() {
    if (!(startScreen instanceof HTMLElement) || !(gameShell instanceof HTMLElement) || !(resultScreen instanceof HTMLElement)) {
      return;
    }

    clearGame();

    state.running = true;
    state.finished = false;

    startScreen.hidden = true;
    resultScreen.hidden = true;
    gameShell.hidden = false;

    buildLevel();
    renderGrid();
    updateHud();
    checkPath();
    playAudio(music, true);
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
    const imageList = [
      ASSETS.images.background,
      ASSETS.images.start,
      ASSETS.images.finish,
      ASSETS.images.win,
      ASSETS.images.lose,
      ASSETS.images.bog,
      ASSETS.images.rock,
      ASSETS.images.bridges.straight,
      ASSETS.images.bridges.corner,
      ASSETS.images.bridges.t,
      ASSETS.images.bridges.cross,
      ASSETS.images.bridges.end
    ].concat(ASSETS.images.trees);

    imageList.forEach(function(src) {
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