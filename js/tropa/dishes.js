(function () {
  "use strict";

  /*
   * Все координаты ниже нормализованы:
   * x, y, width и height задаются в долях от размера игрового поля 16:9.
   *
   * Например:
   * x: 0.50 — середина ширины;
   * y: 0.50 — середина высоты.
   *
   * Поэтому игровое поле автоматически масштабируется на компьютере,
   * планшете и телефоне без пересчёта пиксельных координат.
   */

  const CONFIG = {
    assets: {
      basePath: "images/tropa/dishes/",
      images: {
        background: "bg.png",
        icon: "icon.png",
        success: "success.png",
        cup: "cup.png",
        plate: "plate.png",
        spoon: "spoon.png",
        fork: "fork.png",
        pot: "pot.png"
      },
      sounds: {
        pick: "sounds/tropa/pick.mp3",
        correct: "sounds/tropa/correct.mp3",
        wrong: "sounds/tropa/wrong.mp3",
        win: "sounds/tropa/win.mp3"
      },
      music: {
        background: "sounds/tropa/dishes-music.mp3"
      }
    },

    game: {
      startImmediately: false,
      shuffleItems: true,
      wrongReturnDelay: 80,
      winDelay: 600,
      messageDuration: 1050,
      dropUsesItemCenter: true,
      allowDropByOverlap: true,
      minimumDropOverlap: 0.20,
      debugDropZones: false
    },

    audio: {
      musicEnabled: true,
      soundsEnabled: true,
      musicVolume: 0.22,
      soundVolume: 0.72,
      restartMusicOnNewGame: false
    },

    texts: {
      remaining: "Осталось предметов: {count}",
      correct: "Отлично! Предмет на своём месте.",
      wrong: "Для этого предмета нужно другое место.",
      noFreeSlot: "Здесь пока нет свободного места.",
      winTitle: "Отличная работа!"
    },

    /*
     * Стартовые предметы в нижней свободной части изображения.
     * Все координаты являются центрами предметов.
     */
    items: [
      { id: "cup-1", type: "cup", x: 0.165, y: 0.865, width: 0.075 },
      { id: "plate-1", type: "plate", x: 0.255, y: 0.865, width: 0.086 },
      { id: "spoon-1", type: "spoon", x: 0.345, y: 0.865, width: 0.036 },
      { id: "fork-1", type: "fork", x: 0.420, y: 0.865, width: 0.036 },
      { id: "pot-1", type: "pot", x: 0.510, y: 0.855, width: 0.105 },

      { id: "cup-2", type: "cup", x: 0.615, y: 0.865, width: 0.075 },
      { id: "plate-2", type: "plate", x: 0.705, y: 0.865, width: 0.086 },
      { id: "spoon-2", type: "spoon", x: 0.790, y: 0.865, width: 0.036 },
      { id: "fork-2", type: "fork", x: 0.855, y: 0.865, width: 0.036 },
      { id: "pot-2", type: "pot", x: 0.925, y: 0.855, width: 0.105 }
    ],

    /*
     * Области, в которые разрешено бросать предметы.
     * Координаты подобраны под предоставленное изображение шкафа.
     */
    dropZones: {
      cup: {
        x: 0.232,
        y: 0.145,
        width: 0.545,
        height: 0.165
      },

      plate: {
        x: 0.232,
        y: 0.350,
        width: 0.545,
        height: 0.170
      },

      spoon: {
        x: 0.230,
        y: 0.555,
        width: 0.090,
        height: 0.235
      },

      fork: {
        x: 0.685,
        y: 0.555,
        width: 0.090,
        height: 0.235
      },

      pot: {
        x: 0.335,
        y: 0.590,
        width: 0.330,
        height: 0.205
      }
    },

    /*
     * Точки, куда предметы плавно ставятся после правильного ответа.
     * x и y — центр предмета.
     * width — итоговая ширина относительно ширины игрового поля.
     * rotation — небольшой поворот в градусах.
     */
    slots: {
      cup: [
        { x: 0.335, y: 0.245, width: 0.064, rotation: -2 },
        { x: 0.425, y: 0.245, width: 0.064, rotation: 1 },
        { x: 0.515, y: 0.245, width: 0.064, rotation: -1 },
        { x: 0.605, y: 0.245, width: 0.064, rotation: 2 }
      ],

      plate: [
        { x: 0.375, y: 0.455, width: 0.080, rotation: -2 },
        { x: 0.470, y: 0.455, width: 0.080, rotation: 1 },
        { x: 0.565, y: 0.455, width: 0.080, rotation: -1 },
        { x: 0.660, y: 0.455, width: 0.080, rotation: 2 }
      ],

      spoon: [
        { x: 0.257, y: 0.615, width: 0.032, rotation: -10 },
        { x: 0.274, y: 0.605, width: 0.032, rotation: 0 },
        { x: 0.291, y: 0.615, width: 0.032, rotation: 10 }
      ],

      fork: [
        { x: 0.708, y: 0.615, width: 0.032, rotation: -10 },
        { x: 0.725, y: 0.605, width: 0.032, rotation: 0 },
        { x: 0.742, y: 0.615, width: 0.032, rotation: 10 }
      ],

      pot: [
        { x: 0.420, y: 0.700, width: 0.100, rotation: -1 },
        { x: 0.575, y: 0.700, width: 0.100, rotation: 1 }
      ]
    },

    /*
     * Размеры перетаскиваемых предметов.
     * height рассчитывается браузером автоматически по пропорциям PNG.
     */
    itemSizes: {
      cup: 0.075,
      plate: 0.086,
      spoon: 0.036,
      fork: 0.036,
      pot: 0.105
    },

    drag: {
      pointerOffsetEnabled: true,
      clampToStage: true,
      liftScale: 1.08
    }
  };

  const state = {
    started: false,
    finished: false,
    placedCount: 0,
    activeDrag: null,
    usedSlots: {
      cup: 0,
      plate: 0,
      spoon: 0,
      fork: 0,
      pot: 0
    },
    itemElements: new Map(),
    messageTimer: null,
    audioUnlocked: false
  };

  const elements = {};

  const audio = {
    music: null,
    sounds: {}
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    applyConfiguredAssets();
    createDropZones();
    createAudio();
    bindInterface();
    updateProgress();

    if (CONFIG.game.debugDropZones) {
      elements.stage.classList.add("dishes-debug");
    }

    if (CONFIG.game.startImmediately) {
      startGame();
    }
  }

  function cacheElements() {
    elements.stage = document.getElementById("dishesStage");
    elements.background = document.getElementById("dishesBackground");
    elements.dropLayer = document.getElementById("dishesDropLayer");
    elements.placedLayer = document.getElementById("dishesPlacedLayer");
    elements.itemsLayer = document.getElementById("dishesItemsLayer");
    elements.message = document.getElementById("dishesMessage");
    elements.progressText = document.getElementById("dishesProgressText");
    elements.startScreen = document.getElementById("dishesStartScreen");
    elements.gameScreen = document.getElementById("dishesGameScreen");
    elements.startIcon = document.getElementById("dishesStartIcon");
    elements.startButton = document.getElementById("dishesStartButton");
    elements.successScreen = document.getElementById("dishesSuccessScreen");
    elements.successImage = document.getElementById("dishesSuccessImage");
    elements.restartButton = document.getElementById("dishesRestartButton");
    elements.againButton = document.getElementById("dishesAgainButton");
    elements.helpModal = document.getElementById("dishesHelpModal");
  }

  function applyConfiguredAssets() {
    elements.background.src = getImagePath(CONFIG.assets.images.background);
    elements.startIcon.src = getImagePath(CONFIG.assets.images.icon);
    elements.successImage.src = getImagePath(CONFIG.assets.images.success);
  }

  function bindInterface() {
    elements.startButton.addEventListener("click", startGame);
    elements.restartButton.addEventListener("click", restartGame);
    elements.againButton.addEventListener("click", restartGame);

    document.querySelectorAll("[data-help-open]").forEach(function (button) {
      button.addEventListener("click", openHelp);
    });

    document.querySelectorAll("[data-help-close]").forEach(function (button) {
      button.addEventListener("click", closeHelp);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && elements.helpModal.classList.contains("is-open")) {
        closeHelp();
      }
    });

    window.addEventListener("blur", cancelActiveDrag);
    window.addEventListener("resize", keepDraggedItemInsideStage);
  }

  function startGame() {
    if (state.started && !state.finished) {
      return;
    }

    unlockAudio();
    resetState();
    createItems();

    state.started = true;
    state.finished = false;
    showScreen(elements.gameScreen);

    startMusic();
    updateProgress();
  }

  function restartGame() {
    cancelActiveDrag();
    stopAllSounds();
    resetState();
    createItems();

    state.started = true;
    state.finished = false;

    showScreen(elements.gameScreen);
    startMusic();
    updateProgress();
  }

  function resetState() {
    state.started = false;
    state.finished = false;
    state.placedCount = 0;
    state.activeDrag = null;

    Object.keys(state.usedSlots).forEach(function (type) {
      state.usedSlots[type] = 0;
    });

    state.itemElements.clear();
    elements.itemsLayer.innerHTML = "";
    elements.placedLayer.innerHTML = "";
    clearActiveDropZone();
    hideMessage();
  }

  function createItems() {
    const itemDefinitions = CONFIG.game.shuffleItems
      ? shuffleArray(CONFIG.items.slice())
      : CONFIG.items.slice();

    /*
     * После перемешивания предметы получают позиции исходного ряда.
     * Так порядок меняется, но все предметы остаются в безопасной нижней зоне.
     */
    const startPositions = CONFIG.items.map(function (item) {
      return {
        x: item.x,
        y: item.y
      };
    });

    itemDefinitions.forEach(function (definition, index) {
      const item = Object.assign({}, definition, startPositions[index]);
      const element = document.createElement("img");

      element.className = "dishes-item";
      element.src = getImagePath(CONFIG.assets.images[item.type]);
      element.alt = getItemLabel(item.type);
      element.draggable = false;
      element.dataset.itemId = item.id;
      element.dataset.itemType = item.type;

      const width = item.width || CONFIG.itemSizes[item.type];

      setElementByCenter(element, item.x, item.y, width);
      saveHomePosition(element, item.x, item.y, width);

      element.addEventListener("pointerdown", onPointerDown);
      element.addEventListener("dragstart", preventDefault);

      elements.itemsLayer.appendChild(element);
      state.itemElements.set(item.id, element);
    });
  }

  function createDropZones() {
    elements.dropLayer.innerHTML = "";

    Object.keys(CONFIG.dropZones).forEach(function (type) {
      const zone = CONFIG.dropZones[type];
      const element = document.createElement("div");

      element.className = "dishes-drop-zone";
      element.dataset.dropType = type;
      setRect(element, zone);

      elements.dropLayer.appendChild(element);
    });
  }

  function onPointerDown(event) {
    if (!state.started || state.finished || state.activeDrag) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const item = event.currentTarget;
    const stageRect = elements.stage.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    unlockAudio();
    playSound("pick");

    item.classList.add("is-dragging");

    state.activeDrag = {
      element: item,
      pointerId: event.pointerId,
      type: item.dataset.itemType,
      itemWidth: itemRect.width,
      itemHeight: itemRect.height,
      offsetX: CONFIG.drag.pointerOffsetEnabled
        ? event.clientX - itemRect.left
        : itemRect.width / 2,
      offsetY: CONFIG.drag.pointerOffsetEnabled
        ? event.clientY - itemRect.top
        : itemRect.height / 2
    };

    try {
      item.setPointerCapture(event.pointerId);
    } catch (error) {
      // Глобальные обработчики ниже всё равно удержат перетаскивание.
    }

    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerCancel, true);

    event.preventDefault();
  }

  function onPointerMove(event) {
    const drag = state.activeDrag;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const stageRect = elements.stage.getBoundingClientRect();
    const item = drag.element;

    let left = event.clientX - stageRect.left - drag.offsetX;

    /*
     * В CSS top хранит вертикальный центр предмета, потому что предмет
     * выровнен через translateY(-50%). Поэтому здесь считаем именно центр,
     * а не верхнюю границу картинки.
     */
    let centerY =
      event.clientY -
      stageRect.top -
      drag.offsetY +
      drag.itemHeight / 2;

    if (CONFIG.drag.clampToStage) {
      left = clamp(left, 0, stageRect.width - drag.itemWidth);
      centerY = clamp(
        centerY,
        drag.itemHeight / 2,
        stageRect.height - drag.itemHeight / 2
      );
    }

    item.style.left = toPercent(left / stageRect.width);
    item.style.top = toPercent(centerY / stageRect.height);

    updateActiveDropZone(item, drag.type);
    event.preventDefault();
  }

  function onPointerUp(event) {
    const drag = state.activeDrag;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const item = drag.element;
    const itemType = drag.type;
    const accepted = isItemInsideCorrectZone(item, itemType);

    releaseDragListeners(item);

    if (accepted) {
      placeItem(item, itemType);
    } else {
      returnItemHome(item);
    }

    state.activeDrag = null;
    clearActiveDropZone();
    event.preventDefault();
  }

  function onPointerCancel(event) {
    const drag = state.activeDrag;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const item = drag.element;

    releaseDragListeners(item);
    returnItemHome(item);

    state.activeDrag = null;
    clearActiveDropZone();
  }

  function cancelActiveDrag() {
    if (!state.activeDrag) {
      return;
    }

    const item = state.activeDrag.element;

    releaseDragListeners(item);
    returnItemHome(item);

    state.activeDrag = null;
    clearActiveDropZone();
  }

  function releaseDragListeners(item) {
    const drag = state.activeDrag;

    item.classList.remove("is-dragging");

    window.removeEventListener("pointermove", onPointerMove, true);
    window.removeEventListener("pointerup", onPointerUp, true);
    window.removeEventListener("pointercancel", onPointerCancel, true);

    if (!drag) {
      return;
    }

    try {
      if (item.hasPointerCapture(drag.pointerId)) {
        item.releasePointerCapture(drag.pointerId);
      }
    } catch (error) {
      // Некоторые браузеры освобождают pointer capture автоматически.
    }
  }

  function isItemInsideCorrectZone(item, type) {
    const stageRect = elements.stage.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const zone = CONFIG.dropZones[type];

    const zoneRect = {
      left: stageRect.left + zone.x * stageRect.width,
      top: stageRect.top + zone.y * stageRect.height,
      right: stageRect.left + (zone.x + zone.width) * stageRect.width,
      bottom: stageRect.top + (zone.y + zone.height) * stageRect.height
    };

    if (CONFIG.game.dropUsesItemCenter) {
      const centerX = itemRect.left + itemRect.width / 2;
      const centerY = itemRect.top + itemRect.height / 2;

      if (
        centerX >= zoneRect.left &&
        centerX <= zoneRect.right &&
        centerY >= zoneRect.top &&
        centerY <= zoneRect.bottom
      ) {
        return true;
      }
    }

    if (!CONFIG.game.allowDropByOverlap) {
      return false;
    }

    const overlapWidth = Math.max(
      0,
      Math.min(itemRect.right, zoneRect.right) - Math.max(itemRect.left, zoneRect.left)
    );

    const overlapHeight = Math.max(
      0,
      Math.min(itemRect.bottom, zoneRect.bottom) - Math.max(itemRect.top, zoneRect.top)
    );

    const overlapArea = overlapWidth * overlapHeight;
    const itemArea = itemRect.width * itemRect.height;

    return itemArea > 0 && overlapArea / itemArea >= CONFIG.game.minimumDropOverlap;
  }

  function placeItem(item, type) {
    const slotIndex = state.usedSlots[type];
    const slots = CONFIG.slots[type];

    if (!slots || !slots[slotIndex]) {
      showMessage(CONFIG.texts.noFreeSlot, true);
      returnItemHome(item);
      return;
    }

    const slot = slots[slotIndex];

    state.usedSlots[type] += 1;
    state.placedCount += 1;

    item.classList.add("is-placed");
    setElementByCenter(item, slot.x, slot.y, slot.width);

    window.setTimeout(function () {
      const placedItem = document.createElement("img");

      placedItem.className = "dishes-placed-item";
      placedItem.src = item.src;
      placedItem.alt = "";
      placedItem.draggable = false;

      setElementByCenter(placedItem, slot.x, slot.y, slot.width);
      placedItem.style.transform = "rotate(" + (slot.rotation || 0) + "deg)";

      elements.placedLayer.appendChild(placedItem);
      item.remove();
    }, 190);

    playSound("correct");
    showMessage(CONFIG.texts.correct, false);
    updateProgress();

    if (state.placedCount >= CONFIG.items.length) {
      window.setTimeout(finishGame, CONFIG.game.winDelay);
    }
  }

  function returnItemHome(item) {
    item.classList.remove("is-dragging");
    item.classList.add("is-returning");

    item.style.left = item.dataset.homeLeft;
    item.style.top = item.dataset.homeTop;
    item.style.width = item.dataset.homeWidth;

    playSound("wrong");
    showMessage(CONFIG.texts.wrong, true);

    window.setTimeout(function () {
      item.classList.remove("is-returning");
    }, CONFIG.game.wrongReturnDelay + 260);
  }

  function finishGame() {
    if (state.finished) {
      return;
    }

    state.finished = true;
    stopMusic();
    playSound("win");

    showScreen(elements.successScreen);
  }

  function updateProgress() {
    const remaining = Math.max(0, CONFIG.items.length - state.placedCount);

    elements.progressText.textContent = CONFIG.texts.remaining.replace(
      "{count}",
      String(remaining)
    );
  }

  function updateActiveDropZone(item, type) {
    clearActiveDropZone();

    if (!isItemInsideCorrectZone(item, type)) {
      return;
    }

    const zone = elements.dropLayer.querySelector('[data-drop-type="' + type + '"]');

    if (zone) {
      zone.classList.add("is-active");
    }
  }

  function clearActiveDropZone() {
    elements.dropLayer.querySelectorAll(".is-active").forEach(function (zone) {
      zone.classList.remove("is-active");
    });
  }

  function showMessage(text, isError) {
    window.clearTimeout(state.messageTimer);

    elements.message.textContent = text;
    elements.message.classList.toggle("is-error", Boolean(isError));
    elements.message.classList.add("is-visible");

    state.messageTimer = window.setTimeout(
      hideMessage,
      CONFIG.game.messageDuration
    );
  }

  function hideMessage() {
    window.clearTimeout(state.messageTimer);
    elements.message.classList.remove("is-visible", "is-error");
  }

  function openHelp() {
    elements.helpModal.classList.add("is-open");
    elements.helpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeHelp() {
    elements.helpModal.classList.remove("is-open");
    elements.helpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function showScreen(screen) {
    [elements.startScreen, elements.gameScreen, elements.successScreen].forEach(function (item) {
      item.classList.toggle("is-active", item === screen);
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function createAudio() {
    audio.music = new Audio(CONFIG.assets.music.background);
    audio.music.loop = true;
    audio.music.preload = "auto";
    audio.music.volume = CONFIG.audio.musicVolume;

    Object.keys(CONFIG.assets.sounds).forEach(function (name) {
      const sound = new Audio(CONFIG.assets.sounds[name]);

      sound.preload = "auto";
      sound.volume = CONFIG.audio.soundVolume;
      audio.sounds[name] = sound;
    });
  }

  function unlockAudio() {
    if (state.audioUnlocked) {
      return;
    }

    state.audioUnlocked = true;

    /*
     * Реальное воспроизведение запускается только после действия пользователя,
     * чтобы не конфликтовать с мобильными ограничениями автозапуска.
     */
    if (CONFIG.audio.musicEnabled && state.started) {
      startMusic();
    }
  }

  function startMusic() {
    if (!CONFIG.audio.musicEnabled || !audio.music) {
      return;
    }

    if (CONFIG.audio.restartMusicOnNewGame) {
      audio.music.currentTime = 0;
    }

    const playPromise = audio.music.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Отсутствующий файл или запрет автозапуска не ломают игру.
      });
    }
  }

  function stopMusic() {
    if (!audio.music) {
      return;
    }

    audio.music.pause();
  }

  function playSound(name) {
    if (!CONFIG.audio.soundsEnabled || !audio.sounds[name]) {
      return;
    }

    const sound = audio.sounds[name];

    try {
      sound.currentTime = 0;
      const playPromise = sound.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Звуки являются необязательными и не влияют на механику.
        });
      }
    } catch (error) {
      // Игра продолжает работать даже без звукового файла.
    }
  }

  function stopAllSounds() {
    Object.keys(audio.sounds).forEach(function (name) {
      const sound = audio.sounds[name];

      sound.pause();
      sound.currentTime = 0;
    });

    stopMusic();
  }

  function getImagePath(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function getItemLabel(type) {
    const labels = {
      cup: "Кружка",
      plate: "Тарелка",
      spoon: "Ложка",
      fork: "Вилка",
      pot: "Кастрюля"
    };

    return labels[type] || "Предмет посуды";
  }

  function setElementByCenter(element, centerX, centerY, width) {
    element.style.width = toPercent(width);
    element.style.left = toPercent(centerX - width / 2);
    element.style.top = toPercent(centerY);

    /*
     * top задаётся по вертикальному центру через translateY,
     * чтобы PNG разной высоты правильно выравнивались по одной точке.
     */
    element.style.transform = "translateY(-50%)";
  }

  function saveHomePosition(element, centerX, centerY, width) {
    element.dataset.homeLeft = toPercent(centerX - width / 2);
    element.dataset.homeTop = toPercent(centerY);
    element.dataset.homeWidth = toPercent(width);
  }

  function setRect(element, rect) {
    element.style.left = toPercent(rect.x);
    element.style.top = toPercent(rect.y);
    element.style.width = toPercent(rect.width);
    element.style.height = toPercent(rect.height);
  }

  function keepDraggedItemInsideStage() {
    if (!state.activeDrag) {
      return;
    }

    const item = state.activeDrag.element;
    const stageRect = elements.stage.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    let left = parseFloat(item.style.left) / 100 * stageRect.width;
    let top = parseFloat(item.style.top) / 100 * stageRect.height;

    left = clamp(left, 0, stageRect.width - itemRect.width);
    top = clamp(top, 0, stageRect.height - itemRect.height);

    item.style.left = toPercent(left / stageRect.width);
    item.style.top = toPercent(top / stageRect.height);
  }

  function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporary = array[index];

      array[index] = array[randomIndex];
      array[randomIndex] = temporary;
    }

    return array;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function toPercent(value) {
    return (value * 100).toFixed(4) + "%";
  }

  function preventDefault(event) {
    event.preventDefault();
  }
})();
