(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/wordsearch/",
      icon: "icon.png",
      success: "icon.png"
    },

    sounds: {
      enabled: true,
      select: "sounds/xx.mp3",
      volume: 0.38
    },

    game: {
      rows: 10,
      cols: 10,
      allowReverse: true,
      winDelay: 650,
      wrongFlashDelay: 360
    },

    text: {
      normal: "Проведи по буквам, чтобы собрать слово",
      found: "Отлично! Слово найдено.",
      wrong: "Такого слова нет. Попробуй ещё раз."
    },

    words: [
      { id: "dobro", label: "ДОБРО", value: "ДОБРО" },
      { id: "help", label: "ПОМОЩЬ", value: "ПОМОЩЬ" },
      { id: "honor", label: "ЧЕСТЬ", value: "ЧЕСТЬ" },
      { id: "conscience", label: "СОВЕСТЬ", value: "СОВЕСТЬ" },
      { id: "friendship", label: "ДРУЖБА", value: "ДРУЖБА" },
      { id: "peace", label: "МИР", value: "МИР" },
      { id: "care", label: "ЗАБОТА", value: "ЗАБОТА" },
      { id: "truth", label: "ПРАВДА", value: "ПРАВДА" }
    ],

    fillerLetters: "АБВГДЕЖЗИКЛМНОПРСТУХЦЧШЫЬЭЮЯ",

    directions: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: 0, col: -1 },
      { row: -1, col: 0 },
      { row: -1, col: -1 },
      { row: -1, col: 1 }
    ]
  };

  const state = {
    grid: [],
    placements: [],
    foundIds: new Set(),
    selectedCells: [],
    isDragging: false,
    activePointerId: null,
    locked: false
  };

  const nodes = {};
  let selectSound = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    setImages();
    bindEvents();
    prepareSound();
  }

  function cacheNodes() {
    nodes.start = document.querySelector("#wordsearchStart");
    nodes.game = document.querySelector("#wordsearchGame");
    nodes.result = document.querySelector("#wordsearchResult");
    nodes.board = document.querySelector("#wordsearchBoard");
    nodes.words = document.querySelector("#wordsearchWords");
    nodes.foundCount = document.querySelector("#wordsearchFoundCount");
    nodes.totalCount = document.querySelector("#wordsearchTotalCount");
    nodes.hint = document.querySelector("#wordsearchHint");

    nodes.startBtn = document.querySelector("#wordsearchStartBtn");
    nodes.restartBtn = document.querySelector("#wordsearchRestartBtn");
    nodes.againBtn = document.querySelector("#wordsearchAgainBtn");
    nodes.helpBtn = document.querySelector("#wordsearchHelpBtn");
    nodes.helpModal = document.querySelector("#wordsearchHelpModal");

    nodes.startIcon = document.querySelector("#wordsearchStartIcon");
    nodes.successImage = document.querySelector("#wordsearchSuccessImage");
  }

  function setImages() {
    if (nodes.startIcon) {
      nodes.startIcon.src = asset(CONFIG.assets.icon);
      nodes.startIcon.alt = "Иконка игры Филворд Добрые слова";
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

    nodes.board.addEventListener("pointerdown", onPointerDown);
    nodes.board.addEventListener("pointermove", onPointerMove);
    nodes.board.addEventListener("pointerup", onPointerUp);
    nodes.board.addEventListener("pointercancel", cancelSelection);
    nodes.board.addEventListener("lostpointercapture", onPointerUp);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-wordsearch-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeHelp();
      cancelSelection();
    });
  }

  function prepareSound() {
    if (!CONFIG.sounds.enabled) return;

    selectSound = new Audio(CONFIG.sounds.select);
    selectSound.volume = CONFIG.sounds.volume;
  }

  function playSelectSound() {
    if (!selectSound) return;

    try {
      selectSound.currentTime = 0;
      selectSound.play().catch(function () {});
    } catch (error) {}
  }

  function asset(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function startGame() {
    const generated = generateGrid();

    state.grid = generated.grid;
    state.placements = generated.placements;
    state.foundIds = new Set();
    state.selectedCells = [];
    state.isDragging = false;
    state.activePointerId = null;
    state.locked = false;

    showScreen(nodes.game);
    renderBoard();
    renderWords();
    updateHud();
    setHint(CONFIG.text.normal);
  }

  function showScreen(screen) {
    nodes.start.classList.remove("is-active");
    nodes.game.classList.remove("is-active");
    nodes.result.classList.remove("is-active");
    screen.classList.add("is-active");
  }

  function generateGrid() {
    const grid = createEmptyGrid();
    const placements = [];
    const shuffledWords = shuffle(CONFIG.words.slice());

    shuffledWords.forEach(function (word) {
      const placement = placeWord(grid, word);
      if (placement) placements.push(placement);
    });

    fillEmptyCells(grid);

    return { grid: grid, placements: placements };
  }

  function createEmptyGrid() {
    return Array.from({ length: CONFIG.game.rows }, function () {
      return Array.from({ length: CONFIG.game.cols }, function () {
        return "";
      });
    });
  }

  function placeWord(grid, word) {
    const variants = createPlacementVariants(word.value);

    for (let i = 0; i < variants.length; i += 1) {
      const variant = variants[i];
      if (!canPlaceWord(grid, variant)) continue;

      variant.cells.forEach(function (cell, index) {
        grid[cell.row][cell.col] = variant.text[index];
      });

      return {
        id: word.id,
        value: word.value,
        label: word.label,
        cells: variant.cells
      };
    }

    return null;
  }

  function createPlacementVariants(text) {
    const variants = [];
    const directionList = shuffle(CONFIG.directions.slice());
    const textVariants = CONFIG.game.allowReverse ? [text, reverseText(text)] : [text];

    textVariants.forEach(function (wordText) {
      directionList.forEach(function (direction) {
        for (let row = 0; row < CONFIG.game.rows; row += 1) {
          for (let col = 0; col < CONFIG.game.cols; col += 1) {
            variants.push({
              text: wordText,
              cells: buildCells(row, col, direction, wordText.length)
            });
          }
        }
      });
    });

    return shuffle(variants);
  }

  function buildCells(startRow, startCol, direction, length) {
    const cells = [];

    for (let i = 0; i < length; i += 1) {
      cells.push({
        row: startRow + direction.row * i,
        col: startCol + direction.col * i
      });
    }

    return cells;
  }

  function canPlaceWord(grid, variant) {
    for (let i = 0; i < variant.cells.length; i += 1) {
      const cell = variant.cells[i];

      if (!isInside(cell.row, cell.col)) return false;

      const existingLetter = grid[cell.row][cell.col];
      const newLetter = variant.text[i];

      if (existingLetter && existingLetter !== newLetter) return false;
    }

    return true;
  }

  function fillEmptyCells(grid) {
    for (let row = 0; row < CONFIG.game.rows; row += 1) {
      for (let col = 0; col < CONFIG.game.cols; col += 1) {
        if (!grid[row][col]) grid[row][col] = randomLetter();
      }
    }
  }

  function renderBoard() {
    nodes.board.innerHTML = "";
    nodes.board.style.setProperty("--rows", String(CONFIG.game.rows));
    nodes.board.style.setProperty("--cols", String(CONFIG.game.cols));

    for (let row = 0; row < CONFIG.game.rows; row += 1) {
      for (let col = 0; col < CONFIG.game.cols; col += 1) {
        const cell = document.createElement("div");
        cell.className = "wordsearch-cell";
        cell.textContent = state.grid[row][col];
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", "Буква " + state.grid[row][col]);
        nodes.board.appendChild(cell);
      }
    }
  }

  function renderWords() {
    nodes.words.innerHTML = "";

    CONFIG.words.forEach(function (word) {
      const item = document.createElement("li");
      item.className = "wordsearch-word";
      item.dataset.wordId = word.id;
      item.textContent = word.label;
      nodes.words.appendChild(item);
    });
  }

  function onPointerDown(event) {
    if (state.locked) return;

    const cell = getCellFromEvent(event);
    if (!cell) return;

    event.preventDefault();
    nodes.board.setPointerCapture(event.pointerId);

    state.isDragging = true;
    state.activePointerId = event.pointerId;
    state.selectedCells = [cell];

    playSelectSound();
    updateSelectionClasses();
  }

  function onPointerMove(event) {
    if (!state.isDragging || event.pointerId !== state.activePointerId) return;

    const cell = getCellFromPoint(event.clientX, event.clientY);
    if (!cell) return;

    const lastCell = state.selectedCells[state.selectedCells.length - 1];
    if (sameCell(cell, lastCell)) return;
    if (!isStraightValidSelection(state.selectedCells[0], cell)) return;

    state.selectedCells = getLineCells(state.selectedCells[0], cell);
    playSelectSound();
    updateSelectionClasses();
  }

  function onPointerUp(event) {
    if (!state.isDragging) return;
    if (event.pointerId && state.activePointerId !== event.pointerId) return;

    checkSelection();
  }

  function getCellFromEvent(event) {
    const target = event.target.closest(".wordsearch-cell");
    if (!target) return null;
    return readCell(target);
  }

  function getCellFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    const target = element.closest(".wordsearch-cell");
    if (!target || !nodes.board.contains(target)) return null;

    return readCell(target);
  }

  function readCell(element) {
    return {
      row: Number(element.dataset.row),
      col: Number(element.dataset.col)
    };
  }

  function isStraightValidSelection(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    return rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff);
  }

  function getLineCells(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);
    const cells = [];

    for (let i = 0; i <= steps; i += 1) {
      cells.push({
        row: start.row + rowStep * i,
        col: start.col + colStep * i
      });
    }

    return cells;
  }

  function updateSelectionClasses() {
    clearBoardClass("is-selected");

    state.selectedCells.forEach(function (cell) {
      const element = getCellElement(cell.row, cell.col);
      if (element && !element.classList.contains("is-found")) element.classList.add("is-selected");
    });
  }

  function checkSelection() {
    const selectedText = state.selectedCells.map(function (cell) {
      return state.grid[cell.row][cell.col];
    }).join("");

    const reversedText = reverseText(selectedText);
    const matchedWord = CONFIG.words.find(function (word) {
      if (state.foundIds.has(word.id)) return false;
      return word.value === selectedText || word.value === reversedText;
    });

    if (matchedWord) {
      markFound(matchedWord.id);
    } else {
      flashWrongSelection();
      setHint(CONFIG.text.wrong);
    }

    state.isDragging = false;
    state.activePointerId = null;
    state.selectedCells = [];
    clearBoardClass("is-selected");
  }

  function markFound(wordId) {
    state.foundIds.add(wordId);

    const placement = state.placements.find(function (item) {
      return item.id === wordId;
    });

    if (placement) {
      placement.cells.forEach(function (cell) {
        const element = getCellElement(cell.row, cell.col);
        if (element) element.classList.add("is-found");
      });
    }

    const wordItem = nodes.words.querySelector('[data-word-id="' + wordId + '"]');
    if (wordItem) wordItem.classList.add("is-found");

    updateHud();
    setHint(CONFIG.text.found);

    if (state.foundIds.size === CONFIG.words.length) {
      state.locked = true;
      window.setTimeout(function () {
        showScreen(nodes.result);
      }, CONFIG.game.winDelay);
    }
  }

  function flashWrongSelection() {
    const cells = state.selectedCells.slice();

    cells.forEach(function (cell) {
      const element = getCellElement(cell.row, cell.col);
      if (element) element.classList.add("is-wrong");
    });

    window.setTimeout(function () {
      cells.forEach(function (cell) {
        const element = getCellElement(cell.row, cell.col);
        if (element) element.classList.remove("is-wrong");
      });
    }, CONFIG.game.wrongFlashDelay);
  }

  function cancelSelection() {
    state.isDragging = false;
    state.activePointerId = null;
    state.selectedCells = [];
    clearBoardClass("is-selected");
  }

  function updateHud() {
    nodes.foundCount.textContent = String(state.foundIds.size);
    nodes.totalCount.textContent = String(CONFIG.words.length);
  }

  function setHint(text) {
    nodes.hint.textContent = text;
  }

  function clearBoardClass(className) {
    nodes.board.querySelectorAll("." + className).forEach(function (element) {
      element.classList.remove(className);
    });
  }

  function getCellElement(row, col) {
    return nodes.board.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
  }

  function isInside(row, col) {
    return row >= 0 && row < CONFIG.game.rows && col >= 0 && col < CONFIG.game.cols;
  }

  function sameCell(a, b) {
    return a && b && a.row === b.row && a.col === b.col;
  }

  function reverseText(text) {
    return text.split("").reverse().join("");
  }

  function randomLetter() {
    return CONFIG.fillerLetters[Math.floor(Math.random() * CONFIG.fillerLetters.length)];
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
