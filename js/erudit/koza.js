(() => {
  'use strict';

  /* =========================================================
     НАСТРОЙКИ ИГРЫ
     Всё, что обычно требуется менять, находится здесь.
  ========================================================= */

  const CONFIG = {
    assets: {
      root: '/images/erudit/koza/',
      boats: {
        empty: 'boat.png',
        wolf: 'wolfin.png',
        goat: 'kozain.png',
        cabbage: 'kapustain.png'
      }
    },

    sides: {
      start: 'left',
      finish: 'right',
      left: 'left',
      right: 'right'
    },

    items: {
      wolf: {
        id: 'wolf',
        accusative: 'волка',
        selector: '[data-item="wolf"]',
        startSide: 'left',

        positions: {
          left: {
            left: '8%',
            top: '56%'
          },
          right: {
            left: '80%',
            top: '56%'
          }
        }
      },

      goat: {
        id: 'goat',
        accusative: 'козу',
        selector: '[data-item="goat"]',
        startSide: 'left',

        positions: {
          left: {
            left: '21%',
            top: '57%'
          },
          right: {
            left: '78%',
            top: '57%'
          }
        }
      },

      cabbage: {
        id: 'cabbage',
        accusative: 'капусту',
        selector: '[data-item="cabbage"]',
        startSide: 'left',

        positions: {
          left: {
            left: '12%',
            top: '42%'
          },
          right: {
            left: '87%',
            top: '52%'
          }
        }
      }
    },

    boat: {
      positions: {
        left: '38.8%',
        right: '56.2%'
      },

      facingClasses: {
        left: 'is-facing-left',
        right: 'is-facing-right'
      },

      sailingClass: 'is-sailing',

      crossingDuration: 1900,

      allowEmptyCrossing: true
    },

    gameplay: {
      countEmptyCrossingsAsMoves: true,

      unsafePairs: [
        {
          items: ['wolf', 'goat'],
          title: 'Ой, так нельзя!',
          text: 'Волк остался с козой без присмотра. Попробуй другой порядок переправ.'
        },
        {
          items: ['goat', 'cabbage'],
          title: 'Коза добралась до капусты!',
          text: 'Коза осталась с капустой без присмотра. Нужно придумать другой ход.'
        }
      ]
    },

    text: {
      initialStatus: 'Можно плыть одному или выбрать пассажира щелкнув по нему.',
      passengerExited: 'Пассажир вышел из лодки.',
      passengerOtherSide: 'Этот пассажир находится на другом берегу.',
      crossing: 'Добрыня переправляется через реку…',

      passengerSelected(itemName) {
        return `В лодке ${itemName}. Можно отправляться.`;
      },

      crossButton: {
        left: 'Переплыть на правый берег →',
        right: '← Переплыть на левый берег'
      },

      modal: {
        winLabel: 'Победа',
        loseLabel: 'Попробуй ещё раз',
        winTitle: 'Отлично!',

        winText(moves, moveWord) {
          return `Ты перевёз всех на правый берег за ${moves} ${moveWord}.`;
        }
      }
    },

    selectors: {
      intro: '#koza-intro',
      shell: '#koza-shell',

      startButton: '#koza-start-btn',
      restartButton: '#koza-restart-btn',
      crossButton: '#koza-cross-btn',

      status: '#koza-status',
      moves: '#koza-moves',

      boat: '#koza-boat',
      boatImage: '#koza-boat-image',

      modal: '#koza-modal',
      modalLabel: '#koza-modal-label',
      modalTitle: '#koza-modal-title',
      modalText: '#koza-modal-text',
      modalRestart: '#koza-modal-restart',

      burger: '#nav-burger',
      navigation: '.top-nav'
    },

    classes: {
      selectedItem: 'is-selected',
      navigationOpen: 'is-open',
      bodyNavigationOpen: 'nav-open',
      bodyModalOpen: 'modal-open'
    },

    accessibility: {
      liveRegionEnabled: true
    },

    debug: {
      enabled: false
    }
  };

  /* =========================================================
     ПОДГОТОВКА ДАННЫХ
  ========================================================= */

  const ITEM_IDS = Object.keys(CONFIG.items);

  const DOM = {
    intro: query(CONFIG.selectors.intro),
    shell: query(CONFIG.selectors.shell),

    startButton: query(CONFIG.selectors.startButton),
    restartButton: query(CONFIG.selectors.restartButton),
    crossButton: query(CONFIG.selectors.crossButton),

    status: query(CONFIG.selectors.status),
    moves: query(CONFIG.selectors.moves),

    boat: query(CONFIG.selectors.boat),
    boatImage: query(CONFIG.selectors.boatImage),

    modal: query(CONFIG.selectors.modal),
    modalLabel: query(CONFIG.selectors.modalLabel),
    modalTitle: query(CONFIG.selectors.modalTitle),
    modalText: query(CONFIG.selectors.modalText),
    modalRestart: query(CONFIG.selectors.modalRestart),

    burger: query(CONFIG.selectors.burger, false),
    navigation: query(CONFIG.selectors.navigation, false),

    itemButtons: Object.fromEntries(
      ITEM_IDS.map(itemId => [
        itemId,
        query(CONFIG.items[itemId].selector)
      ])
    )
  };

  let state = createInitialState();
  let crossingTimer = null;

  /* =========================================================
     СОСТОЯНИЕ
  ========================================================= */

  function createInitialState() {
    return {
      boatSide: CONFIG.sides.start,
      passenger: null,

      positions: Object.fromEntries(
        ITEM_IDS.map(itemId => [
          itemId,
          CONFIG.items[itemId].startSide
        ])
      ),

      moves: 0,
      sailing: false,
      finished: false
    };
  }

  /* =========================================================
     ЗАПУСК И ПЕРЕЗАПУСК
  ========================================================= */

  function startGame() {
    clearCrossingTimer();

    state = createInitialState();

    DOM.intro.hidden = true;
    DOM.shell.hidden = false;
    DOM.modal.hidden = true;

    document.body.classList.remove(
      CONFIG.classes.bodyModalOpen
    );

    setStatus(CONFIG.text.initialStatus);
    render();

    debugLog('Игра запущена', state);
  }

  /* =========================================================
     ОТРИСОВКА
  ========================================================= */

  function render() {
    renderItems();
    renderBoat();
    renderCounters();
    renderCrossButton();
    renderStatus();
  }

  function renderItems() {
    ITEM_IDS.forEach(itemId => {
      const itemConfig = CONFIG.items[itemId];
      const button = DOM.itemButtons[itemId];

      const itemSide = state.positions[itemId];
      const itemPosition = itemConfig.positions[itemSide];
      const isPassenger = state.passenger === itemId;

      button.style.left = itemPosition.left;
      button.style.top = itemPosition.top;

      button.hidden = isPassenger;
      button.disabled = state.sailing || state.finished;

      button.classList.toggle(
        CONFIG.classes.selectedItem,
        isPassenger
      );

      button.setAttribute(
        'aria-pressed',
        String(isPassenger)
      );
    });
  }

  function renderBoat() {
    const boatPosition = CONFIG.boat.positions[state.boatSide];

    DOM.boat.style.left = boatPosition;

    setBoatDirection(state.boatSide);

    DOM.boat.classList.toggle(
      CONFIG.boat.sailingClass,
      state.sailing
    );

    const imageKey = state.passenger || 'empty';
    const imageName = CONFIG.assets.boats[imageKey];

    DOM.boatImage.src = CONFIG.assets.root + imageName;
  }

  function renderCounters() {
    DOM.moves.textContent = String(state.moves);
  }

  function renderCrossButton() {
    DOM.crossButton.disabled =
      state.sailing ||
      state.finished ||
      (
        !CONFIG.boat.allowEmptyCrossing &&
        !state.passenger
      );

    DOM.crossButton.textContent =
      CONFIG.text.crossButton[state.boatSide];
  }

  function renderStatus() {
    if (state.sailing || state.finished) {
      return;
    }

    if (state.passenger) {
      const itemName =
        CONFIG.items[state.passenger].accusative;

      setStatus(
        CONFIG.text.passengerSelected(itemName)
      );

      return;
    }

    setStatus(CONFIG.text.initialStatus);
  }

  /* =========================================================
     ПАССАЖИР
  ========================================================= */

  function togglePassenger(itemId) {
    if (!canInteract()) {
      return;
    }

    if (!CONFIG.items[itemId]) {
      debugLog(`Неизвестный предмет: ${itemId}`);
      return;
    }

    if (state.passenger === itemId) {
      removePassenger();
      return;
    }

    if (state.positions[itemId] !== state.boatSide) {
      setStatus(CONFIG.text.passengerOtherSide);
      return;
    }

    state.passenger = itemId;

    debugLog(`Выбран пассажир: ${itemId}`, state);
    render();
  }

  function removePassenger() {
    state.passenger = null;

    setStatus(CONFIG.text.passengerExited);
    render();

    debugLog('Пассажир вышел из лодки', state);
  }

  /* =========================================================
     ПЕРЕПРАВА
  ========================================================= */

  function crossRiver() {
    if (!canInteract()) {
      return;
    }

    if (
      !CONFIG.boat.allowEmptyCrossing &&
      !state.passenger
    ) {
      return;
    }

    const fromSide = state.boatSide;
    const targetSide = getOppositeSide(fromSide);

    state.sailing = true;

    DOM.crossButton.disabled = true;
    setStatus(CONFIG.text.crossing);

    setBoatDirection(targetSide);

    DOM.boat.classList.add(
      CONFIG.boat.sailingClass
    );

    DOM.boat.style.left =
      CONFIG.boat.positions[targetSide];

    debugLog(
      `Переправа: ${fromSide} → ${targetSide}`,
      state
    );

    clearCrossingTimer();

    crossingTimer = window.setTimeout(() => {
      finishCrossing(targetSide);
    }, CONFIG.boat.crossingDuration);
  }

  function finishCrossing(targetSide) {
    state.boatSide = targetSide;

    if (state.passenger) {
      state.positions[state.passenger] = targetSide;
    }

    if (
      CONFIG.gameplay.countEmptyCrossingsAsMoves ||
      state.passenger
    ) {
      state.moves += 1;
    }

    state.passenger = null;
    state.sailing = false;

    render();

    const result = evaluateGame();

    if (result) {
      showResult(result);
    }

    debugLog('Переправа завершена', state);
  }

  function clearCrossingTimer() {
    if (crossingTimer !== null) {
      window.clearTimeout(crossingTimer);
      crossingTimer = null;
    }
  }

  /* =========================================================
     НАПРАВЛЕНИЕ ЛОДКИ
  ========================================================= */

  function setBoatDirection(directionSide) {
    const leftClass =
      CONFIG.boat.facingClasses.left;

    const rightClass =
      CONFIG.boat.facingClasses.right;

    DOM.boat.classList.remove(
      leftClass,
      rightClass
    );

    if (directionSide === CONFIG.sides.right) {
      DOM.boat.classList.add(rightClass);
    } else {
      DOM.boat.classList.add(leftClass);
    }
  }

  /* =========================================================
     ПРОВЕРКА ПОРАЖЕНИЯ И ПОБЕДЫ
  ========================================================= */

  function evaluateGame() {
    const unattendedSide =
      getOppositeSide(state.boatSide);

    const unsafeResult =
      findUnsafeCombination(unattendedSide);

    if (unsafeResult) {
      return unsafeResult;
    }

    if (hasWon()) {
      return createWinResult();
    }

    return null;
  }

  function findUnsafeCombination(side) {
    for (const rule of CONFIG.gameplay.unsafePairs) {
      const allOnSameSide = rule.items.every(
        itemId => state.positions[itemId] === side
      );

      if (allOnSameSide) {
        return {
          type: 'lose',
          title: rule.title,
          text: rule.text
        };
      }
    }

    return null;
  }

  function hasWon() {
    const finishSide = CONFIG.sides.finish;

    const allItemsFinished = ITEM_IDS.every(
      itemId =>
        state.positions[itemId] === finishSide
    );

    return (
      allItemsFinished &&
      state.boatSide === finishSide
    );
  }

  function createWinResult() {
    return {
      type: 'win',
      title: CONFIG.text.modal.winTitle,
      text: CONFIG.text.modal.winText(
        state.moves,
        getMoveWord(state.moves)
      )
    };
  }

  /* =========================================================
     МОДАЛЬНОЕ ОКНО
  ========================================================= */

  function showResult(result) {
    state.finished = true;

    DOM.modalLabel.textContent =
      result.type === 'win'
        ? CONFIG.text.modal.winLabel
        : CONFIG.text.modal.loseLabel;

    DOM.modalTitle.textContent = result.title;
    DOM.modalText.textContent = result.text;

    DOM.modal.hidden = false;

    document.body.classList.add(
      CONFIG.classes.bodyModalOpen
    );

    render();

    debugLog('Результат игры', result);
  }

  /* =========================================================
     НАВИГАЦИЯ
  ========================================================= */

  function toggleNavigation() {
    if (!DOM.navigation || !DOM.burger) {
      return;
    }

    const isOpen = DOM.navigation.classList.toggle(
      CONFIG.classes.navigationOpen
    );

    DOM.burger.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

    document.body.classList.toggle(
      CONFIG.classes.bodyNavigationOpen,
      isOpen
    );
  }

  /* =========================================================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  ========================================================= */

  function getOppositeSide(side) {
    return side === CONFIG.sides.left
      ? CONFIG.sides.right
      : CONFIG.sides.left;
  }

  function canInteract() {
    return !state.sailing && !state.finished;
  }

  function setStatus(text) {
    DOM.status.textContent = text;
  }

  function getMoveWord(value) {
    const mod10 = value % 10;
    const mod100 = value % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 'ход';
    }

    if (
      mod10 >= 2 &&
      mod10 <= 4 &&
      (mod100 < 12 || mod100 > 14)
    ) {
      return 'хода';
    }

    return 'ходов';
  }

  function query(selector, required = true) {
    const element = document.querySelector(selector);

    if (!element && required) {
      throw new Error(
        `Не найден обязательный элемент: ${selector}`
      );
    }

    return element;
  }

  function debugLog(...args) {
    if (CONFIG.debug.enabled) {
      console.log('[Koza game]', ...args);
    }
  }

  /* =========================================================
     СОБЫТИЯ
  ========================================================= */

  ITEM_IDS.forEach(itemId => {
    DOM.itemButtons[itemId].addEventListener(
      'click',
      () => togglePassenger(itemId)
    );
  });

  DOM.startButton.addEventListener(
    'click',
    startGame
  );

  DOM.restartButton.addEventListener(
    'click',
    startGame
  );

  DOM.modalRestart.addEventListener(
    'click',
    startGame
  );

  DOM.crossButton.addEventListener(
    'click',
    crossRiver
  );

  DOM.burger?.addEventListener(
    'click',
    toggleNavigation
  );
})();