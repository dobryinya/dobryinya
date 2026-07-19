(function () {
  "use strict";

  const CONFIG = {
    assets: {
      basePath: "images/tropa/tower/",
      icon: "icon.png",
      success: "success.png",
      blocks: [
        "block-blue.png",
        "block-green.png",
        "block-orange.png",
        "block-purple.png",
        "block-red.png",
        "block-yellow.png"
      ]
    },

    game: {
      goodGoal: 8,
      maxMisses: 3,
      movingSpeed: 190,
      speedIncreasePerGood: 9,
      minOverlapRatio: 0.3,
      baseWidthRatio: 0.23,
      nextBlockDelay: 520,
      dropDuration: 280,
      swayBasePixels: 0,
      swayPerBadPixels: 18,
      swayHeightPixels: 3,
      swayStartHeight: 4,
      swaySpeed: 2.1,
      cameraStartBlocks: 3,
      cameraStep: 1.25,
      cameraMaxStageRatio: 1.42,
      backgroundParallax: 0.12
    },

    generation: {
      goodChance: 0.62,
      maxSameTypeInRow: 2
    },

    goodWords: [
      "ДОБРОТА",
      "ПОМОЩЬ",
      "ДРУЖБА",
      "ЗАБОТА",
      "ЧЕСТНОСТЬ",
      "УВАЖЕНИЕ",
      "МИЛОСЕРДИЕ",
      "ПОДДЕРЖКА",
      "ЩЕДРОСТЬ",
      "ВЕЖЛИВОСТЬ",
      "ТЕРПЕНИЕ",
      "СОЧУВСТВИЕ"
    ],

    badWords: [
      "ОБМАН",
      "ГРУБОСТЬ",
      "ЖАДНОСТЬ",
      "ЗЛОСТЬ",
      "ЭГОИЗМ",
      "ЗАВИСТЬ",
      "ЖЕСТОКОСТЬ",
      "НАСМЕШКА",
      "БЕЗРАЗЛИЧИЕ",
      "ПРЕДАТЕЛЬСТВО"
    ],

    text: {
      decide: "Доброе это качество или плохое?",
      goodRemoved: "Это доброе качество. Оно помогло бы укрепить башню.",
      badRemoved: "Верно! Плохому качеству не место в башне дружбы.",
      goodPlaced: "Отлично! Добрый блок укрепляет дружбу.",
      badPlaced: "Плохой блок остался в башне — теперь она шатается сильнее.",
      miss: "Блок упал мимо. Попробуй точнее.",
      drop: "Нажми на блок, игровое поле или пробел, чтобы опустить его."
    }
  };

  const state = {
    phase: "idle",
    currentBlock: null,
    placedBlocks: [],
    goodPlaced: 0,
    badPlaced: 0,
    misses: 0,
    movingDirection: 1,
    movingX: 0,
    lastFrameTime: 0,
    animationId: 0,
    lastGeneratedType: null,
    sameTypeCount: 0,
    usedGoodWords: [],
    usedBadWords: [],
    cameraOffset: 0,
    towerSwayX: 0,
    swayFrozen: false
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    setStaticImages();
    bindEvents();
  }

  function cacheNodes() {
    nodes.startScreen = document.querySelector("#towerStart");
    nodes.gameScreen = document.querySelector("#towerGame");
    nodes.resultScreen = document.querySelector("#towerResult");
    nodes.field = document.querySelector("#towerField");
    nodes.background = document.querySelector(".tower-bg");
    nodes.stage = document.querySelector("#towerStage");
    nodes.stack = document.querySelector("#towerStack");
    nodes.movingBlock = document.querySelector("#towerMovingBlock");
    nodes.movingImage = document.querySelector("#towerMovingImage");
    nodes.movingWord = document.querySelector("#towerMovingWord");
    nodes.feedback = document.querySelector("#towerFeedback");
    nodes.controls = document.querySelector(".tower-controls");
    nodes.goodCount = document.querySelector("#towerGoodCount");
    nodes.goal = document.querySelector("#towerGoal");
    nodes.misses = document.querySelector("#towerMisses");
    nodes.hint = document.querySelector("#towerHint");
    nodes.startButton = document.querySelector("#towerStartBtn");
    nodes.restartButton = document.querySelector("#towerRestartBtn");
    nodes.againButton = document.querySelector("#towerAgainBtn");
    nodes.helpButton = document.querySelector("#towerHelpBtn");
    nodes.placeButton = document.querySelector("#towerPlaceBtn");
    nodes.removeButton = document.querySelector("#towerRemoveBtn");
    nodes.helpModal = document.querySelector("#towerHelpModal");
    nodes.startIcon = document.querySelector("#towerStartIcon");
    nodes.resultImage = document.querySelector("#towerResultImage");
    nodes.resultBadge = document.querySelector("#towerResultBadge");
    nodes.resultTitle = document.querySelector("#towerResultTitle");
    nodes.resultText = document.querySelector("#towerResultText");
  }

  function setStaticImages() {
    nodes.startIcon.src = getAssetPath(CONFIG.assets.icon);
    nodes.startIcon.alt = "Иконка игры Башня дружбы";
    nodes.resultImage.src = getAssetPath(CONFIG.assets.success);
    nodes.resultImage.alt = "Башня дружбы";
    nodes.goal.textContent = String(CONFIG.game.goodGoal);
  }

  function bindEvents() {
    nodes.startButton.addEventListener("click", startGame);
    nodes.restartButton.addEventListener("click", startGame);
    nodes.againButton.addEventListener("click", startGame);
    nodes.helpButton.addEventListener("click", openHelp);
    nodes.placeButton.addEventListener("click", choosePlace);
    nodes.removeButton.addEventListener("click", chooseRemove);
    nodes.movingBlock.addEventListener("click", dropCurrentBlock);

    nodes.stage.addEventListener("pointerdown", function (event) {
      if (event.target.closest(".tower-choice")) return;
      if (state.phase === "moving") dropCurrentBlock();
    });

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-tower-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeHelp();
        return;
      }

      if (
        (event.key === " " || event.key === "Enter") &&
        state.phase === "moving"
      ) {
        event.preventDefault();
        dropCurrentBlock();
      }
    });

    window.addEventListener("resize", function () {
      if (state.phase === "idle" || state.phase === "finished") return;
      renderPlacedBlocks();
      updateCamera();
    });
  }

  function getAssetPath(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function startGame() {
    stopGameLoop();

    state.phase = "deciding";
    state.currentBlock = null;
    state.placedBlocks = [];
    state.goodPlaced = 0;
    state.badPlaced = 0;
    state.misses = 0;
    state.movingDirection = 1;
    state.movingX = 0;
    state.lastFrameTime = 0;
    state.lastGeneratedType = null;
    state.sameTypeCount = 0;
    state.usedGoodWords = [];
    state.usedBadWords = [];
    state.cameraOffset = 0;
    state.towerSwayX = 0;
    state.swayFrozen = false;

    clearPlacedBlocks();
    resetCamera();
    updateHud();
    showScreen(nodes.gameScreen);
    createNextBlock();
    startGameLoop();
  }

  function showScreen(screen) {
    nodes.startScreen.classList.remove("is-active");
    nodes.gameScreen.classList.remove("is-active");
    nodes.resultScreen.classList.remove("is-active");
    screen.classList.add("is-active");
  }

  function clearPlacedBlocks() {
    nodes.stack
      .querySelectorAll(".tower-placed-block")
      .forEach(function (block) {
        block.remove();
      });

    state.towerSwayX = 0;
    nodes.stack.style.setProperty("--tower-sway-x", "0px");
  }

  function createNextBlock() {
    if (state.goodPlaced >= CONFIG.game.goodGoal) {
      finishGame(true);
      return;
    }

    if (state.misses >= CONFIG.game.maxMisses) {
      finishGame(false);
      return;
    }

    state.phase = "deciding";
    state.currentBlock = generateBlock();
    state.swayFrozen = false;

    nodes.movingBlock.hidden = false;
    nodes.movingBlock.classList.add("is-deciding");
    nodes.movingBlock.classList.toggle("is-bad", !state.currentBlock.isGood);
    nodes.movingImage.src = getAssetPath(state.currentBlock.image);
    nodes.movingWord.textContent = state.currentBlock.word;
    nodes.controls.classList.remove("is-drop-mode");
    nodes.hint.textContent = CONFIG.text.decide;
    setFeedback("");
  }

  function generateBlock() {
    let type =
      Math.random() < CONFIG.generation.goodChance
        ? "good"
        : "bad";

    const tooManySameTypes =
      state.lastGeneratedType === type &&
      state.sameTypeCount >= CONFIG.generation.maxSameTypeInRow;

    if (tooManySameTypes) {
      type = type === "good" ? "bad" : "good";
    }

    if (type === state.lastGeneratedType) {
      state.sameTypeCount += 1;
    } else {
      state.lastGeneratedType = type;
      state.sameTypeCount = 1;
    }

    const isGood = type === "good";

    return {
      isGood: isGood,
      word: takeUnusedWord(
        isGood ? CONFIG.goodWords : CONFIG.badWords,
        isGood ? state.usedGoodWords : state.usedBadWords
      ),
      image:
        CONFIG.assets.blocks[
          Math.floor(Math.random() * CONFIG.assets.blocks.length)
        ]
    };
  }

  function takeUnusedWord(words, usedWords) {
    if (usedWords.length >= words.length) {
      usedWords.length = 0;
    }

    const availableWords = words.filter(function (word) {
      return !usedWords.includes(word);
    });

    const selectedWord =
      availableWords[
        Math.floor(Math.random() * availableWords.length)
      ];

    usedWords.push(selectedWord);
    return selectedWord;
  }

  function chooseRemove() {
    if (state.phase !== "deciding") return;

    const removedGoodBlock = state.currentBlock.isGood;

    nodes.movingBlock.hidden = true;
    state.phase = "transition";

    setFeedback(
      removedGoodBlock
        ? CONFIG.text.goodRemoved
        : CONFIG.text.badRemoved,
      true
    );

    window.setTimeout(createNextBlock, CONFIG.game.nextBlockDelay);
  }

  function choosePlace() {
    if (state.phase !== "deciding") return;

    state.phase = "moving";
    nodes.movingBlock.classList.remove("is-deciding");
    nodes.controls.classList.add("is-drop-mode");
    nodes.hint.textContent = CONFIG.text.drop;

    const stageWidth = nodes.stage.clientWidth;
    const blockWidth = nodes.movingBlock.offsetWidth;

    state.movingX = Math.max(8, (stageWidth - blockWidth) / 2);
    state.movingDirection = Math.random() > 0.5 ? 1 : -1;

    nodes.movingBlock.style.left = state.movingX + "px";
    nodes.movingBlock.style.top = "5%";
    nodes.movingBlock.style.transform = "none";
  }

  function startGameLoop() {
    stopGameLoop();
    state.lastFrameTime = performance.now();
    state.animationId = requestAnimationFrame(updateGame);
  }

  function stopGameLoop() {
    if (!state.animationId) return;
    cancelAnimationFrame(state.animationId);
    state.animationId = 0;
  }

  function updateGame(time) {
    const deltaTime = Math.min(
      (time - state.lastFrameTime) / 1000,
      0.04
    );

    state.lastFrameTime = time;

    if (!state.swayFrozen) {
      applyTowerSway(time / 1000);
    }

    if (state.phase === "moving") {
      updateMovingBlock(deltaTime);
    }

    if (state.phase !== "finished" && state.phase !== "idle") {
      state.animationId = requestAnimationFrame(updateGame);
    }
  }

  function updateMovingBlock(deltaTime) {
    const stageWidth = nodes.stage.clientWidth;
    const blockWidth = nodes.movingBlock.offsetWidth;
    const minX = 8;
    const maxX = stageWidth - blockWidth - 8;

    const currentSpeed =
      CONFIG.game.movingSpeed +
      state.goodPlaced * CONFIG.game.speedIncreasePerGood;

    state.movingX +=
      state.movingDirection *
      currentSpeed *
      deltaTime;

    if (state.movingX <= minX) {
      state.movingX = minX;
      state.movingDirection = 1;
    } else if (state.movingX >= maxX) {
      state.movingX = maxX;
      state.movingDirection = -1;
    }

    nodes.movingBlock.style.left = state.movingX + "px";
  }

  function applyTowerSway(seconds) {
    const badBlockSway =
      state.badPlaced *
      CONFIG.game.swayPerBadPixels;

    const heightSway =
      Math.max(
        0,
        state.placedBlocks.length -
          CONFIG.game.swayStartHeight
      ) *
      CONFIG.game.swayHeightPixels;

    const amplitude =
      CONFIG.game.swayBasePixels +
      badBlockSway +
      heightSway;

    state.towerSwayX =
      Math.sin(seconds * CONFIG.game.swaySpeed) *
      amplitude;

    nodes.stack.style.setProperty(
      "--tower-sway-x",
      state.towerSwayX.toFixed(2) + "px"
    );
  }

  function dropCurrentBlock() {
    if (state.phase !== "moving") return;

    state.phase = "dropping";
    state.swayFrozen = true;

    const geometry = getDropGeometry();
    const movingRect = nodes.movingBlock.getBoundingClientRect();
    const stageRect = nodes.stage.getBoundingClientRect();
    const startTop = movingRect.top - stageRect.top;
    const distance = Math.max(0, geometry.targetTop - startTop);

    const animation = nodes.movingBlock.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(" + distance + "px)" }
      ],
      {
        duration: CONFIG.game.dropDuration,
        easing: "cubic-bezier(.2,.75,.3,1)",
        fill: "forwards"
      }
    );

    animation.finished
      .then(function () {
        resolveDrop(geometry);
      })
      .catch(function () {
        resolveDrop(geometry);
      });
  }

  function getDropGeometry() {
    const stageRect = nodes.stage.getBoundingClientRect();
    const blockWidth = nodes.movingBlock.offsetWidth;
    const blockHeight = nodes.movingBlock.offsetHeight;
    const blockLeft = state.movingX;
    const blockRight = blockLeft + blockWidth;

    let supportLeft;
    let supportRight;
    let targetBottom;

    if (state.placedBlocks.length === 0) {
      const baseWidth =
        stageRect.width * CONFIG.game.baseWidthRatio;

      supportLeft =
        stageRect.width / 2 -
        baseWidth / 2 +
        state.towerSwayX;

      supportRight = supportLeft + baseWidth;
      targetBottom = stageRect.height * 0.04 + 22;
    } else {
      const topBlock =
        state.placedBlocks[state.placedBlocks.length - 1];

      supportLeft =
        topBlock.left + state.towerSwayX;

      supportRight =
        supportLeft + topBlock.width;

      targetBottom =
        topBlock.bottom + topBlock.height;
    }

    const overlapLeft = Math.max(blockLeft, supportLeft);
    const overlapRight = Math.min(blockRight, supportRight);
    const overlap = Math.max(0, overlapRight - overlapLeft);

    return {
      blockLeft: blockLeft,
      blockWidth: blockWidth,
      blockHeight: blockHeight,
      supportLeft: supportLeft,
      supportRight: supportRight,
      overlap: overlap,
      overlapRatio: overlap / blockWidth,
      targetBottom: targetBottom,
      targetTop:
        stageRect.height -
        targetBottom -
        blockHeight +
        state.cameraOffset,
      swayXAtDrop: state.towerSwayX
    };
  }

  function resolveDrop(geometry) {
    nodes.movingBlock
      .getAnimations()
      .forEach(function (animation) {
        animation.cancel();
      });

    nodes.movingBlock.hidden = true;
    nodes.movingBlock.style.transform = "none";

    if (
      geometry.overlapRatio <
      CONFIG.game.minOverlapRatio
    ) {
      state.misses += 1;
      state.phase = "transition";
      state.swayFrozen = false;

      updateHud();
      setFeedback(CONFIG.text.miss, true);

      window.setTimeout(createNextBlock, CONFIG.game.nextBlockDelay);
      return;
    }

    const placedLeft =
      geometry.blockLeft -
      geometry.swayXAtDrop;

    state.placedBlocks.push({
      left: placedLeft,
      width: geometry.blockWidth,
      height: geometry.blockHeight,
      bottom: geometry.targetBottom,
      word: state.currentBlock.word,
      image: state.currentBlock.image,
      isGood: state.currentBlock.isGood
    });

    if (state.currentBlock.isGood) {
      state.goodPlaced += 1;
      setFeedback(CONFIG.text.goodPlaced, true);
    } else {
      state.badPlaced += 1;
      setFeedback(CONFIG.text.badPlaced, true);
    }

    updateHud();
    renderPlacedBlocks();
    updateCamera();

    state.phase = "transition";
    state.swayFrozen = false;

    window.setTimeout(createNextBlock, CONFIG.game.nextBlockDelay);
  }

  function renderPlacedBlocks() {
    nodes.stack
      .querySelectorAll(".tower-placed-block")
      .forEach(function (block) {
        block.remove();
      });

    state.placedBlocks.forEach(function (data) {
      const block = document.createElement("div");

      block.className = "tower-placed-block";

      if (!data.isGood) {
        block.classList.add("is-bad");
      }

      block.style.left =
        data.left + data.width / 2 + "px";

      block.style.bottom =
        data.bottom + "px";

      block.style.width =
        data.width + "px";

      block.style.height =
        data.height + "px";

      const image = document.createElement("img");
      image.src = getAssetPath(data.image);
      image.alt = "";

      const word = document.createElement("span");
      word.textContent = data.word;

      block.append(image, word);
      nodes.stack.appendChild(block);
    });
  }

  function updateCamera() {
    const blocksAboveStart = Math.max(
      0,
      state.placedBlocks.length -
        CONFIG.game.cameraStartBlocks
    );

    const blockHeight =
      state.placedBlocks.length > 0
        ? state.placedBlocks[
            state.placedBlocks.length - 1
          ].height
        : nodes.movingBlock.offsetHeight;

    const desiredOffset =
      blocksAboveStart *
      blockHeight *
      CONFIG.game.cameraStep;

    const maximumOffset =
      nodes.stage.clientHeight *
      CONFIG.game.cameraMaxStageRatio;

    state.cameraOffset = Math.min(
      desiredOffset,
      maximumOffset
    );

    nodes.stack.style.setProperty(
      "--camera-y",
      state.cameraOffset + "px"
    );

    nodes.background.style.setProperty(
      "--camera-bg-y",
      state.cameraOffset *
        CONFIG.game.backgroundParallax +
        "px"
    );
  }

  function resetCamera() {
    state.cameraOffset = 0;

    nodes.stack.style.setProperty("--camera-y", "0px");
    nodes.background.style.setProperty("--camera-bg-y", "0px");
  }

  function updateHud() {
    nodes.goodCount.textContent = String(state.goodPlaced);
    nodes.misses.textContent =
      state.misses + "/" + CONFIG.game.maxMisses;
  }

  function setFeedback(text, isVisible) {
    nodes.feedback.textContent = text;
    nodes.feedback.classList.toggle(
      "is-visible",
      Boolean(isVisible && text)
    );
  }

  function finishGame(isWin) {
    state.phase = "finished";
    stopGameLoop();

    if (isWin) {
      nodes.resultBadge.textContent = "Победа";
      nodes.resultTitle.textContent = "Башня дружбы построена!";
      nodes.resultText.textContent =
        "Ты собрал башню из добрых качеств. Плохие слова делают дружбу неустойчивой, а добрые — укрепляют её.";
      nodes.resultImage.src = getAssetPath(CONFIG.assets.success);
    } else {
      nodes.resultBadge.textContent = "Попробуем ещё";
      nodes.resultTitle.textContent = "Башня пока не устояла";
      nodes.resultText.textContent =
        "Ничего страшного. Выбирай добрые качества и старайся опускать блоки точнее.";
      nodes.resultImage.src = getAssetPath(CONFIG.assets.icon);
    }

    showScreen(nodes.resultScreen);
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
