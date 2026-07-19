(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/balloons/",
      icon: "icon.png",
      success: "success.png",
      tube: "tube.png",
      balls: {
        white: "ball-white.png",
        blue: "ball-blue.png",
        red: "ball-red.png",
        green: "ball-green.png",
        yellow: "ball-yellow.png",
        purple: "ball-purple.png"
      }
    },

    game: {
      capacity: 4,
      colorsCount: 6,
      emptyTubes: 2,
      shuffleAttempts: 10,
      allowOnlySameColorMove: false,
      winDelay: 450
    },

    text: {
      selected: "Выбрана колба. Теперь нажми, куда переложить шарик.",
      empty: "В этой колбе нет шарика. Выбери другую колбу.",
      full: "Эта колба уже полная. Выбери другую.",
      noPlace: "Сюда пока нельзя положить шарик.",
      normal: "Нажми колбу с шариком, потом колбу, куда его переложить."
    },

    colors: {
      white: "Белый",
      blue: "Синий",
      red: "Красный",
      green: "Зелёный",
      yellow: "Жёлтый",
      purple: "Фиолетовый"
    },

    // Массивы идут снизу вверх: первый цвет — нижний шарик, последний — верхний.
    // Настраивать уровень можно только здесь.
    level: [
      ["red", "blue", "green", "yellow"],
      ["purple", "red", "yellow", "blue"],
      ["green", "yellow", "red", "purple"],
      ["blue", "green", "purple", "red"],
      ["white", "purple", "blue", "green"],
      ["yellow", "white", "white", "white"],
      [],
      []
    ]
  };

  const state = {
    tubes: [],
    selectedIndex: null,
    moves: 0,
    locked: false
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    nodes.start = document.querySelector("#balloonsStart");
    nodes.game = document.querySelector("#balloonsGame");
    nodes.result = document.querySelector("#balloonsResult");
    nodes.field = document.querySelector("#balloonsField");
    nodes.moves = document.querySelector("#balloonsMoves");
    nodes.hint = document.querySelector("#balloonsHint");

    nodes.startBtn = document.querySelector("#balloonsStartBtn");
    nodes.restartBtn = document.querySelector("#balloonsRestartBtn");
    nodes.againBtn = document.querySelector("#balloonsAgainBtn");
    nodes.helpBtn = document.querySelector("#balloonsHelpBtn");
    nodes.helpModal = document.querySelector("#balloonsHelpModal");

    nodes.startIcon = document.querySelector("#balloonsStartIcon");
    nodes.successImage = document.querySelector("#balloonsSuccessImage");

    setImages();
    bindEvents();
  }

  function setImages() {
    if (nodes.startIcon) {
      nodes.startIcon.src = asset(CONFIG.assets.icon);
      nodes.startIcon.alt = "Иконка игры Распредели шарики малышам";
    }

    if (nodes.successImage) {
      nodes.successImage.src = asset(CONFIG.assets.success);
      nodes.successImage.alt = "Победа в игре";
    }
  }

  function bindEvents() {
    nodes.startBtn.addEventListener("click", startGame);
    nodes.restartBtn.addEventListener("click", startGame);
    nodes.againBtn.addEventListener("click", startGame);
    nodes.helpBtn.addEventListener("click", openHelp);
    nodes.field.addEventListener("click", handleFieldClick);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-balloons-close")) {
        closeHelp();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeHelp();
      clearSelection();
      render();
    });
  }

  function asset(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function ballAsset(color) {
    return asset(CONFIG.assets.balls[color]);
  }

  function startGame() {
    state.tubes = createRandomLevel();
    state.selectedIndex = null;
    state.moves = 0;
    state.locked = false;

    updateMoves();
    setHint(CONFIG.text.normal);
    showScreen(nodes.game);
    render();
  }
  function createRandomLevel() {
    const availableColors = Object.keys(CONFIG.assets.balls).slice(0, CONFIG.game.colorsCount);
    const balls = [];
  
    availableColors.forEach(function (color) {
      for (let i = 0; i < CONFIG.game.capacity; i += 1) {
        balls.push(color);
      }
    });
  
    shuffle(balls);
  
    const tubes = [];
  
    for (let i = 0; i < availableColors.length; i += 1) {
      tubes.push(balls.splice(0, CONFIG.game.capacity));
    }
  
    for (let i = 0; i < CONFIG.game.emptyTubes; i += 1) {
      tubes.push([]);
    }
  
    // чтобы случайно не выпал уже собранный уровень
    for (let i = 0; i < CONFIG.game.shuffleAttempts; i += 1) {
      if (!isGeneratedLevelAlreadySolved(tubes)) break;
      return createRandomLevel();
    }
  
    return tubes;
  }
  
  function isGeneratedLevelAlreadySolved(tubes) {
    return tubes.every(function (tube) {
      if (tube.length === 0) return true;
      if (tube.length !== CONFIG.game.capacity) return false;
  
      return tube.every(function (color) {
        return color === tube[0];
      });
    });
  }
  
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[randomIndex];
      array[randomIndex] = temp;
    }
  
    return array;
  }

  function showScreen(screen) {
    nodes.start.classList.remove("is-active");
    nodes.game.classList.remove("is-active");
    nodes.result.classList.remove("is-active");
    screen.classList.add("is-active");
  }

  function handleFieldClick(event) {
    if (state.locked) return;

    const tubeButton = event.target.closest(".balloons-tube");
    if (!tubeButton) return;

    const tubeIndex = Number(tubeButton.dataset.index);
    handleTubeClick(tubeIndex);
  }

  function handleTubeClick(index) {
    if (state.selectedIndex === null) {
      selectTube(index);
      return;
    }

    if (state.selectedIndex === index) {
      clearSelection();
      setHint(CONFIG.text.normal);
      render();
      return;
    }

    moveBall(state.selectedIndex, index);
  }

  function selectTube(index) {
    if (!state.tubes[index] || state.tubes[index].length === 0) {
      setHint(CONFIG.text.empty);
      return;
    }

    state.selectedIndex = index;
    setHint(CONFIG.text.selected);
    render();
  }

  function moveBall(fromIndex, toIndex) {
    const fromTube = state.tubes[fromIndex];
    const toTube = state.tubes[toIndex];

    const validation = validateMove(fromTube, toTube);

    if (!validation.ok) {
      clearSelection();
      setHint(validation.message);
      render();
      return;
    }

    toTube.push(fromTube.pop());
    state.moves += 1;

    clearSelection();
    updateMoves();
    setHint(CONFIG.text.normal);
    render();

    if (isWin()) {
      state.locked = true;
      window.setTimeout(function () {
        showScreen(nodes.result);
      }, CONFIG.game.winDelay);
    }
  }

  function validateMove(fromTube, toTube) {
    if (!fromTube || fromTube.length === 0) {
      return { ok: false, message: CONFIG.text.empty };
    }

    if (!toTube || toTube.length >= CONFIG.game.capacity) {
      return { ok: false, message: CONFIG.text.full };
    }

    if (!CONFIG.game.allowOnlySameColorMove) {
      return { ok: true, message: "" };
    }

    if (toTube.length === 0 || getTopColor(fromTube) === getTopColor(toTube)) {
      return { ok: true, message: "" };
    }

    return { ok: false, message: CONFIG.text.noPlace };
  }

  function getTopColor(tube) {
    return tube[tube.length - 1];
  }

  function clearSelection() {
    state.selectedIndex = null;
  }

  function updateMoves() {
    nodes.moves.textContent = String(state.moves);
  }

  function setHint(text) {
    if (nodes.hint) {
      nodes.hint.textContent = text;
    }
  }

  function render() {
    nodes.field.innerHTML = "";

    state.tubes.forEach(function (tube, tubeIndex) {
      const button = document.createElement("button");
      button.className = "balloons-tube";
      button.type = "button";
      button.dataset.index = String(tubeIndex);
      button.setAttribute("aria-label", "Колба " + (tubeIndex + 1));

      if (state.selectedIndex === tubeIndex) {
        button.classList.add("is-selected");
      }

      if (tube.length > 0 && isCompleteTube(tube)) {
        button.classList.add("is-complete");
      }

      const ballsLayer = document.createElement("div");
      ballsLayer.className = "balloons-tube__balls";

      tube.forEach(function (color, slotIndex) {
        const ball = document.createElement("img");
        ball.className = "balloons-ball";
        ball.src = ballAsset(color);
        ball.alt = CONFIG.colors[color] || color;
        ball.draggable = false;
        ball.style.setProperty("--slot", String(slotIndex));
        ballsLayer.appendChild(ball);
      });

      const tubeImage = document.createElement("img");
      tubeImage.className = "balloons-tube__image";
      tubeImage.src = asset(CONFIG.assets.tube);
      tubeImage.alt = "";
      tubeImage.draggable = false;

      button.append(ballsLayer, tubeImage);
      nodes.field.appendChild(button);
    });
  }

  function isCompleteTube(tube) {
    if (tube.length !== CONFIG.game.capacity) return false;

    return tube.every(function (color) {
      return color === tube[0];
    });
  }

  function isWin() {
    return state.tubes.every(function (tube) {
      return tube.length === 0 || isCompleteTube(tube);
    });
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
