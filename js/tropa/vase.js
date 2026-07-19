(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/vase/",
      broken: "vase-broken.png",
      complete: "vase-complete.png",
      success: "success.png",
      puzzle: "vase-complete.png"
    },

    puzzle: {
      rows: 3,
      cols: 3,
      piecesCount: 9,
      winDelay: 650,
      wrongDelay: 420
    },

    text: {
      normal: "Перетащи кусочки на поле пазла.",
      correct: "Верно! Кусочек встал на место.",
      wrong: "Почти! Попробуй другое место.",
      complete: "Ваза собрана! Теперь выбери честный поступок."
    },

    choices: [
      {
        text: "Рассказать взрослым правду и помочь убрать осколки.",
        correct: true
      },
      {
        text: "Быстро спрятать осколки под шкаф.",
        correct: false
      },
      {
        text: "Сказать, что вазу разбил кто-то другой.",
        correct: false
      },
      {
        text: "Убежать и сделать вид, что ничего не случилось.",
        correct: false
      }
    ]
  };

  const state = {
    placed: new Set(),
    draggedPiece: null,
    locked: false
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    setImages();
    bindEvents();
    renderChoices();
  }

  function cacheNodes() {
    nodes.start = document.querySelector("#vaseStart");
    nodes.game = document.querySelector("#vaseGame");
    nodes.choice = document.querySelector("#vaseChoice");
    nodes.result = document.querySelector("#vaseResult");

    nodes.puzzle = document.querySelector("#vasePuzzle");
    nodes.tray = document.querySelector("#vaseTray");
    nodes.choices = document.querySelector("#vaseChoices");
    nodes.placedCount = document.querySelector("#vasePlacedCount");
    nodes.hint = document.querySelector("#vaseHint");

    nodes.startBtn = document.querySelector("#vaseStartBtn");
    nodes.restartBtn = document.querySelector("#vaseRestartBtn");
    nodes.againBtn = document.querySelector("#vaseAgainBtn");
    nodes.helpBtn = document.querySelector("#vaseHelpBtn");
    nodes.helpModal = document.querySelector("#vaseHelpModal");

    nodes.brokenImage = document.querySelector("#vaseBrokenImage");
    nodes.completeImage = document.querySelector("#vaseCompleteImage");
    nodes.successImage = document.querySelector("#vaseSuccessImage");
  }

  function bindEvents() {
    nodes.startBtn.addEventListener("click", startGame);
    nodes.restartBtn.addEventListener("click", startGame);
    nodes.againBtn.addEventListener("click", startGame);
    nodes.helpBtn.addEventListener("click", openHelp);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-vase-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeHelp();
    });
  }

  function setImages() {
    nodes.brokenImage.src = asset(CONFIG.assets.broken);
    nodes.completeImage.src = asset(CONFIG.assets.complete);
    nodes.successImage.src = asset(CONFIG.assets.success);
  }

  function asset(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function startGame() {
    state.placed = new Set();
    state.draggedPiece = null;
    state.locked = false;

    updateCount();
    setHint(CONFIG.text.normal);
    renderPuzzle();
    renderTray();
    showScreen(nodes.game);
  }

  function showScreen(screen) {
    [nodes.start, nodes.game, nodes.choice, nodes.result].forEach(function (item) {
      item.classList.remove("is-active");
    });
    screen.classList.add("is-active");
  }

  function renderPuzzle() {
    nodes.puzzle.innerHTML = "";
    nodes.puzzle.style.setProperty("--rows", CONFIG.puzzle.rows);
    nodes.puzzle.style.setProperty("--cols", CONFIG.puzzle.cols);

    for (let index = 0; index < CONFIG.puzzle.piecesCount; index += 1) {
      const slot = document.createElement("button");
      slot.className = "vase-slot";
      slot.type = "button";
      slot.dataset.index = String(index);
      slot.setAttribute("aria-label", "Место пазла " + (index + 1));

      slot.addEventListener("dragover", function (event) {
        event.preventDefault();
        slot.classList.add("is-over");
      });

      slot.addEventListener("dragleave", function () {
        slot.classList.remove("is-over");
      });

      slot.addEventListener("drop", function (event) {
        event.preventDefault();
        slot.classList.remove("is-over");
        handleDrop(index);
      });

      slot.addEventListener("click", function () {
        if (state.draggedPiece !== null) handleDrop(index);
      });

      nodes.puzzle.appendChild(slot);
    }
  }

  function renderTray() {
    nodes.tray.innerHTML = "";

    const pieces = shuffle(Array.from({ length: CONFIG.puzzle.piecesCount }, function (_, index) {
      return index;
    }));

    pieces.forEach(function (index) {
      if (state.placed.has(index)) return;
      nodes.tray.appendChild(createPiece(index));
    });
  }

  function createPiece(index) {
    const piece = document.createElement("button");
    piece.className = "vase-piece";
    piece.type = "button";
    piece.draggable = true;
    piece.dataset.index = String(index);
    piece.setAttribute("aria-label", "Кусочек пазла " + (index + 1));

    applyPieceBackground(piece, index);

    piece.addEventListener("dragstart", function (event) {
      state.draggedPiece = index;
      event.dataTransfer.setData("text/plain", String(index));
      piece.classList.add("is-dragging");
    });

    piece.addEventListener("dragend", function () {
      piece.classList.remove("is-dragging");
    });

    piece.addEventListener("click", function () {
      selectPiece(index, piece);
    });

    return piece;
  }

  function selectPiece(index, piece) {
    state.draggedPiece = index;
    document.querySelectorAll(".vase-piece.is-selected").forEach(function (item) {
      item.classList.remove("is-selected");
    });
    piece.classList.add("is-selected");
    setHint("Кусочек выбран. Теперь нажми на его место в пазле.");
  }

  function handleDrop(slotIndex) {
    if (state.locked || state.draggedPiece === null) return;

    const pieceIndex = state.draggedPiece;
    state.draggedPiece = null;

    if (pieceIndex !== slotIndex) {
      setHint(CONFIG.text.wrong);
      const wrongSlot = nodes.puzzle.querySelector(`[data-index="${slotIndex}"]`);
      if (wrongSlot) {
        wrongSlot.classList.add("is-wrong");
        window.setTimeout(function () {
          wrongSlot.classList.remove("is-wrong");
        }, CONFIG.puzzle.wrongDelay);
      }
      clearSelectedPieces();
      return;
    }

    placePiece(slotIndex);
  }

  function placePiece(index) {
    if (state.placed.has(index)) return;

    state.placed.add(index);
    const slot = nodes.puzzle.querySelector(`[data-index="${index}"]`);
    if (!slot) return;

    slot.classList.add("is-filled");
    applyPieceBackground(slot, index);
    clearSelectedPieces();
    removeTrayPiece(index);
    updateCount();
    setHint(CONFIG.text.correct);

    if (state.placed.size === CONFIG.puzzle.piecesCount) {
      state.locked = true;
      setHint(CONFIG.text.complete);
      window.setTimeout(function () {
        showScreen(nodes.choice);
      }, CONFIG.puzzle.winDelay);
    }
  }

  function removeTrayPiece(index) {
    const piece = nodes.tray.querySelector(`[data-index="${index}"]`);
    if (piece) piece.remove();
  }

  function applyPieceBackground(element, index) {
    const row = Math.floor(index / CONFIG.puzzle.cols);
    const col = index % CONFIG.puzzle.cols;

    element.style.backgroundImage = `url("${asset(CONFIG.assets.puzzle)}")`;
    element.style.backgroundSize = `${CONFIG.puzzle.cols * 100}% ${CONFIG.puzzle.rows * 100}%`;
    element.style.backgroundPosition = `${col * 100 / (CONFIG.puzzle.cols - 1)}% ${row * 100 / (CONFIG.puzzle.rows - 1)}%`;
  }

  function renderChoices() {
    nodes.choices.innerHTML = "";

    CONFIG.choices.forEach(function (choice) {
      const button = document.createElement("button");
      button.className = "vase-choice";
      button.type = "button";
      button.textContent = choice.text;

      button.addEventListener("click", function () {
        handleChoice(button, choice.correct);
      });

      nodes.choices.appendChild(button);
    });
  }

  function handleChoice(button, isCorrect) {
    document.querySelectorAll(".vase-choice").forEach(function (item) {
      item.classList.remove("is-wrong", "is-correct");
    });

    if (!isCorrect) {
      button.classList.add("is-wrong");
      return;
    }

    button.classList.add("is-correct");
    window.setTimeout(function () {
      showScreen(nodes.result);
    }, 500);
  }

  function updateCount() {
    nodes.placedCount.textContent = String(state.placed.size);
  }

  function setHint(text) {
    nodes.hint.textContent = text;
  }

  function clearSelectedPieces() {
    document.querySelectorAll(".vase-piece.is-selected").forEach(function (item) {
      item.classList.remove("is-selected");
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

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[randomIndex];
      array[randomIndex] = temp;
    }
    return array;
  }
})();
