(function () {
  "use strict";

  /*
   * Весь текст, пути к файлам, координаты и игровые настройки находятся здесь.
   * HTML остаётся только каркасом страницы.
   */
  const CONFIG = {
    page: {
      title: "Мост примирения — Уроки с Добрыней",
      description: "Детская мини-игра о примирении и дружбе проекта Уроки с Добрыней.",
      language: "ru"
    },

    navigation: {
      ariaLabel: "Основная навигация",
      brand: {
        label: "Уроки с Добрыней",
        href: "index.html"
      },
      links: [
        { label: "Тропа Добра", href: "tropa.html" },
        { label: "Большая игра с народами России", href: "biggame.html" },
        { label: "Добрыня-эрудит", href: "erudit.html", active: true }
      ]
    },

    assets: {
      basePath: "images/tropa/bridge/",
      icon: "icon.png",
      background: "bg.png",
      completeBridge: "bridge.png",
      pieces: [
        "bridge1.png",
        "bridge2.png",
        "bridge3.png",
        "bridge4.png",
        "bridge5.png",
        "bridge6.png",
        "bridge7.png",
        "bridge8.png"
      ],
      dobrynya: {
        sad: "dobrinya_sad.png",
        happy: "dobrinya_happy.png"
      },
      friend: {
        sad: "friend_sad.png",
        happy: "friend_happy.png"
      },
      win: "win.png"
    },

    links: {
      map: "tropa.html"
    },

    game: {
      piecesGoal: 8,
      answerDelay: 760,
      finishDelay: 1500,
      feedbackDuration: 1100,
      shuffleChoices: true,
      lockAfterWrongAnswer: false
    },

    /*
     * Каждая часть накладывается поверх bg.png слева направо.
     * По умолчанию поле делится на 8 равных вертикальных полос.
     * При необходимости можно вручную изменить left/top/width/height любой части.
     */
    pieceLayout: [
      { left: 0, top: 0, width: 27.0, height: 100 },
      { left: 27.0, top: 0, width: 7.56, height: 100 },
      { left: 34.56, top: 0, width: 7.56, height: 100 },
      { left: 42.12, top: 0, width: 7.56, height: 100 },
      { left: 49.68, top: 0, width: 7.56, height: 100 },
      { left: 57.24, top: 0, width: 8.02, height: 100 },
      { left: 65.26, top: 0, width: 7.56, height: 100 },
      { left: 72.8, top: 0, width: 27.0, height: 100 }
    ],

    characterLayout: {
      start: {
        dobrynya: { left: "6%", bottom: "10%", width: "13.2%" },
        friend: { right: "6%", bottom: "10%", width: "13.2%" }
      },
      complete: {
        dobrynyaLeft: "42%",
        friendRight: "42%"
      }
    },

    texts: {
      start: {
        badge: "Станция примирения",
        title: "Мост примирения",
        text: "Добрыня поссорился с другом, и мост между ними исчез. Помоги выбрать шаги к примирению и восстановить мост.",
        startButton: "Начать игру",
        helpButton: "Как играть"
      },
      game: {
        progressLabel: "Построено",
        hintLabel: "Подсказка",
        defaultHint: "Выбери поступок, который поможет друзьям стать ближе.",
        restartButton: "Заново",
        fieldAriaLabel: "Игровое поле Мост примирения",
        stepTemplate: "Шаг {current} из {total}"
      },
      result: {
        badge: "Мост построен",
        title: "Друзья снова вместе!",
        text: "Ты помог Добрыне не убегать от ссоры, а спокойно пройти путь к примирению.",
        lesson: "Примирение начинается с желания услышать другого и сделать шаг навстречу.",
        againButton: "Сыграть ещё раз",
        mapButton: "Вернуться на карту",
        imageAlt: "Добрыня и его друг помирились на мосту"
      },
      help: {
        title: "Как играть",
        closeAriaLabel: "Закрыть правила",
        paragraphs: [
          "На каждом шаге выбери один из трёх поступков.",
          "Правильный выбор добавит новую часть моста слева направо.",
          "Неудачный вариант не разрушает прогресс: подумай и попробуй снова.",
          "Когда появятся все восемь частей, друзья встретятся на мосту."
        ]
      },
      feedback: {
        correct: [
          "Хороший шаг! Мост становится крепче.",
          "Верно! Так друзья становятся ближе.",
          "Отличный выбор — появилась новая часть моста."
        ],
        wrong: [
          "Этот поступок может усилить обиду. Попробуй другой вариант.",
          "Так помириться будет труднее. Подумай ещё.",
          "Сначала важно успокоиться и услышать друга."
        ]
      }
    },

    rounds: [
      {
        question: "Что лучше сделать сразу после ссоры?",
        choices: [
          { icon: "🌿", text: "Немного успокоиться и не говорить сгоряча", correct: true },
          { icon: "😠", text: "Сразу накричать ещё громче", correct: false },
          { icon: "🚪", text: "Уйти и решить больше никогда не дружить", correct: false }
        ]
      },
      {
        question: "Как начать разговор с другом?",
        choices: [
          { icon: "💬", text: "Спокойно предложить поговорить", correct: true },
          { icon: "👉", text: "Сразу обвинить его во всём", correct: false },
          { icon: "🙈", text: "Сделать вид, что друга не существует", correct: false }
        ]
      },
      {
        question: "Что поможет понять, почему друг расстроен?",
        choices: [
          { icon: "👂", text: "Выслушать его, не перебивая", correct: true },
          { icon: "📣", text: "Говорить только о своей обиде", correct: false },
          { icon: "😏", text: "Смеяться над его чувствами", correct: false }
        ]
      },
      {
        question: "Как рассказать о своей обиде?",
        choices: [
          { icon: "❤️", text: "Спокойно сказать: «Мне было обидно»", correct: true },
          { icon: "💥", text: "Сказать: «Ты всегда всё портишь!»", correct: false },
          { icon: "🤐", text: "Молчать, но продолжать сердиться", correct: false }
        ]
      },
      {
        question: "Что делать, если ты тоже был неправ?",
        choices: [
          { icon: "🙏", text: "Признать свою ошибку и извиниться", correct: true },
          { icon: "🎭", text: "Притвориться, что ничего не случилось", correct: false },
          { icon: "🛡️", text: "Придумать оправдание и спорить дальше", correct: false }
        ]
      },
      {
        question: "Друг извинился. Как можно ответить?",
        choices: [
          { icon: "🤍", text: "Принять извинение и сказать о своих чувствах", correct: true },
          { icon: "🧊", text: "Специально продолжать обижаться", correct: false },
          { icon: "📢", text: "Рассказать всем о его ошибке", correct: false }
        ]
      },
      {
        question: "Как найти решение, которое устроит обоих?",
        choices: [
          { icon: "⚖️", text: "Спокойно обсудить, как поступить в следующий раз", correct: true },
          { icon: "🏆", text: "Обязательно доказать, что прав только ты", correct: false },
          { icon: "🎲", text: "Оставить всё как есть и ждать новой ссоры", correct: false }
        ]
      },
      {
        question: "Как закончить разговор после примирения?",
        choices: [
          { icon: "🤝", text: "Предложить снова дружить и сделать шаг навстречу", correct: true },
          { icon: "🗯️", text: "Напомнить другу все старые ошибки", correct: false },
          { icon: "🔒", text: "Сказать, что больше никогда ему не поверишь", correct: false }
        ]
      }
    ]
  };

  const state = {
    roundIndex: 0,
    builtPieces: 0,
    locked: false,
    feedbackTimer: null
  };

  const nodes = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheNodes();
    applyPageConfig();
    buildNavigation();
    applyTexts();
    setImages();
    buildBridgePieces();
    bindEvents();
    resetGame(false);
  }

  function cacheNodes() {
    nodes.brand = document.querySelector("#bridgeBrand");
    nodes.navMenu = document.querySelector("#nav-menu");
    nodes.start = document.querySelector("#bridgeStart");
    nodes.game = document.querySelector("#bridgeGame");
    nodes.result = document.querySelector("#bridgeResult");
    nodes.startIcon = document.querySelector("#bridgeStartIcon");
    nodes.startBadge = document.querySelector("#bridgeStartBadge");
    nodes.startTitle = document.querySelector("#bridgeStartTitle");
    nodes.startText = document.querySelector("#bridgeStartText");
    nodes.startBtn = document.querySelector("#bridgeStartBtn");
    nodes.helpBtn = document.querySelector("#bridgeHelpBtn");
    nodes.progressLabel = document.querySelector("#bridgeProgressLabel");
    nodes.progress = document.querySelector("#bridgeProgress");
    nodes.goal = document.querySelector("#bridgeGoal");
    nodes.hintLabel = document.querySelector("#bridgeHintLabel");
    nodes.hint = document.querySelector("#bridgeHint");
    nodes.restartBtn = document.querySelector("#bridgeRestartBtn");
    nodes.field = document.querySelector("#bridgeField");
    nodes.background = document.querySelector("#bridgeBackground");
    nodes.pieces = document.querySelector("#bridgePieces");
    nodes.dobrynya = document.querySelector("#bridgeDobrynya");
    nodes.friend = document.querySelector("#bridgeFriend");
    nodes.sparkles = document.querySelector("#bridgeSparkles");
    nodes.feedback = document.querySelector("#bridgeFeedback");
    nodes.step = document.querySelector("#bridgeStep");
    nodes.question = document.querySelector("#bridgeQuestion");
    nodes.choices = document.querySelector("#bridgeChoices");
    nodes.resultImage = document.querySelector("#bridgeResultImage");
    nodes.resultBadge = document.querySelector("#bridgeResultBadge");
    nodes.resultTitle = document.querySelector("#bridgeResultTitle");
    nodes.resultText = document.querySelector("#bridgeResultText");
    nodes.lesson = document.querySelector("#bridgeLesson");
    nodes.againBtn = document.querySelector("#bridgeAgainBtn");
    nodes.mapLink = document.querySelector("#bridgeMapLink");
    nodes.helpModal = document.querySelector("#bridgeHelpModal");
    nodes.helpClose = document.querySelector("#bridgeHelpClose");
    nodes.helpTitle = document.querySelector("#bridgeHelpTitle");
    nodes.helpContent = document.querySelector("#bridgeHelpContent");
  }

  function applyPageConfig() {
    document.documentElement.lang = CONFIG.page.language;
    document.title = CONFIG.page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = CONFIG.page.description;
    const nav = document.querySelector(".top-nav");
    if (nav) nav.setAttribute("aria-label", CONFIG.navigation.ariaLabel);
  }

  function buildNavigation() {
    nodes.brand.textContent = CONFIG.navigation.brand.label;
    nodes.brand.href = CONFIG.navigation.brand.href;
    nodes.navMenu.innerHTML = "";

    CONFIG.navigation.links.forEach(function (link) {
      const anchor = document.createElement("a");
      anchor.className = "top-nav__link" + (link.active ? " is-active" : "");
      anchor.href = link.href;
      anchor.textContent = link.label;
      nodes.navMenu.appendChild(anchor);
    });
  }

  function applyTexts() {
    const t = CONFIG.texts;
    nodes.startBadge.textContent = t.start.badge;
    nodes.startTitle.textContent = t.start.title;
    nodes.startText.textContent = t.start.text;
    nodes.startBtn.textContent = t.start.startButton;
    nodes.helpBtn.textContent = t.start.helpButton;
    nodes.progressLabel.textContent = t.game.progressLabel;
    nodes.hintLabel.textContent = t.game.hintLabel;
    nodes.restartBtn.textContent = t.game.restartButton;
    nodes.field.setAttribute("aria-label", t.game.fieldAriaLabel);
    nodes.resultBadge.textContent = t.result.badge;
    nodes.resultTitle.textContent = t.result.title;
    nodes.resultText.textContent = t.result.text;
    nodes.lesson.textContent = t.result.lesson;
    nodes.againBtn.textContent = t.result.againButton;
    nodes.mapLink.textContent = t.result.mapButton;
    nodes.mapLink.href = CONFIG.links.map;
    nodes.helpTitle.textContent = t.help.title;
    nodes.helpClose.setAttribute("aria-label", t.help.closeAriaLabel);
    nodes.helpContent.innerHTML = "";

    t.help.paragraphs.forEach(function (text) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      nodes.helpContent.appendChild(paragraph);
    });
  }

  function setImages() {
    nodes.startIcon.src = asset(CONFIG.assets.icon);
    nodes.startIcon.alt = CONFIG.texts.start.title;
    nodes.background.src = asset(CONFIG.assets.background);
    nodes.background.alt = "";
    nodes.dobrynya.src = asset(CONFIG.assets.dobrynya.sad);
    nodes.dobrynya.alt = "Добрыня стоит на левом берегу";
    nodes.friend.src = asset(CONFIG.assets.friend.sad);
    nodes.friend.alt = "Друг Добрыни стоит на правом берегу";
    nodes.resultImage.src = asset(CONFIG.assets.win);
    nodes.resultImage.alt = CONFIG.texts.result.imageAlt;

    applyCharacterLayout();
  }

  function applyCharacterLayout() {
    const layout = CONFIG.characterLayout.start;
    nodes.dobrynya.style.left = layout.dobrynya.left;
    nodes.dobrynya.style.bottom = layout.dobrynya.bottom;
    nodes.dobrynya.style.width = layout.dobrynya.width;
    nodes.friend.style.right = layout.friend.right;
    nodes.friend.style.bottom = layout.friend.bottom;
    nodes.friend.style.width = layout.friend.width;
  }

  function buildBridgePieces() {
    nodes.pieces.innerHTML = "";

    CONFIG.assets.pieces.forEach(function (fileName, index) {
      const layout = CONFIG.pieceLayout[index] || {};
      const image = document.createElement("img");
      image.className = "bridge-piece";
      image.src = asset(fileName);
      image.alt = "";
      image.draggable = false;
      image.dataset.index = String(index);
      image.style.left = numberToPercent(layout.left, index * 12.5);
      image.style.top = numberToPercent(layout.top, 0);
      image.style.width = numberToPercent(layout.width, 12.5);
      image.style.height = numberToPercent(layout.height, 100);
      nodes.pieces.appendChild(image);
    });
  }

  function bindEvents() {
    nodes.startBtn.addEventListener("click", startGame);
    nodes.restartBtn.addEventListener("click", function () { resetGame(true); });
    nodes.againBtn.addEventListener("click", function () { resetGame(true); });
    nodes.helpBtn.addEventListener("click", openHelp);
    nodes.choices.addEventListener("click", handleChoiceClick);

    nodes.helpModal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-bridge-close")) closeHelp();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeHelp();
    });
  }

  function startGame() {
    resetGame(false);
    showScreen(nodes.game);
    renderRound();
  }

  function resetGame(showGame) {
    window.clearTimeout(state.feedbackTimer);
    state.roundIndex = 0;
    state.builtPieces = 0;
    state.locked = false;

    nodes.field.classList.remove("is-complete");
    nodes.feedback.className = "bridge-feedback";
    nodes.feedback.textContent = "";
    nodes.hint.textContent = CONFIG.texts.game.defaultHint;
    nodes.progress.textContent = "0";
    nodes.goal.textContent = String(CONFIG.game.piecesGoal);
    nodes.dobrynya.src = asset(CONFIG.assets.dobrynya.sad);
    nodes.friend.src = asset(CONFIG.assets.friend.sad);

    Array.from(nodes.pieces.children).forEach(function (piece) {
      piece.classList.remove("is-visible");
    });

    if (showGame) {
      showScreen(nodes.game);
      renderRound();
    } else {
      showScreen(nodes.start);
    }
  }

  function renderRound() {
    const round = CONFIG.rounds[state.roundIndex];
    if (!round) return finishGame();

    nodes.step.textContent = format(CONFIG.texts.game.stepTemplate, {
      current: state.roundIndex + 1,
      total: CONFIG.rounds.length
    });
    nodes.question.textContent = round.question;
    nodes.choices.innerHTML = "";

    const choices = round.choices.map(function (choice, originalIndex) {
      return Object.assign({ originalIndex: originalIndex }, choice);
    });

    if (CONFIG.game.shuffleChoices) shuffle(choices);

    choices.forEach(function (choice) {
      const button = document.createElement("button");
      button.className = "bridge-choice";
      button.type = "button";
      button.dataset.correct = String(choice.correct);
      button.innerHTML = "";

      const icon = document.createElement("span");
      icon.className = "bridge-choice__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = choice.icon;

      const label = document.createElement("span");
      label.className = "bridge-choice__text";
      label.textContent = choice.text;

      button.append(icon, label);
      nodes.choices.appendChild(button);
    });
  }

  function handleChoiceClick(event) {
    const button = event.target.closest(".bridge-choice");
    if (!button || state.locked || button.disabled) return;

    const isCorrect = button.dataset.correct === "true";
    if (isCorrect) {
      handleCorrectChoice(button);
    } else {
      handleWrongChoice(button);
    }
  }

  function handleCorrectChoice(button) {
    state.locked = true;
    button.classList.add("is-correct");
    disableChoices(button);
    revealNextPiece();
    showFeedback(randomItem(CONFIG.texts.feedback.correct), false);
    nodes.hint.textContent = randomItem(CONFIG.texts.feedback.correct);

    window.setTimeout(function () {
      state.roundIndex += 1;
      state.locked = false;

      if (state.roundIndex >= CONFIG.rounds.length || state.builtPieces >= CONFIG.game.piecesGoal) {
        finishGame();
      } else {
        renderRound();
      }
    }, CONFIG.game.answerDelay);
  }

  function handleWrongChoice(button) {
    button.classList.add("is-wrong");
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    showFeedback(randomItem(CONFIG.texts.feedback.wrong), true);
    nodes.hint.textContent = randomItem(CONFIG.texts.feedback.wrong);

    window.setTimeout(function () {
      button.classList.remove("is-wrong");
      if (!CONFIG.game.lockAfterWrongAnswer) {
        button.classList.add("is-muted");
      }
    }, 420);
  }

  function revealNextPiece() {
    const piece = nodes.pieces.querySelector('[data-index="' + state.builtPieces + '"]');
    if (!piece) return;

    piece.classList.add("is-visible");
    state.builtPieces += 1;
    nodes.progress.textContent = String(state.builtPieces);
    createSparkles(piece);
  }

  function createSparkles(piece) {
    const fieldRect = nodes.field.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const centerX = pieceRect.left - fieldRect.left + pieceRect.width / 2;
    const centerY = pieceRect.top - fieldRect.top + pieceRect.height * 0.56;

    for (let index = 0; index < 8; index += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "bridge-sparkle";
      sparkle.style.left = (centerX + (Math.random() - 0.5) * pieceRect.width * 0.75) + "px";
      sparkle.style.top = (centerY + (Math.random() - 0.5) * 50) + "px";
      sparkle.style.animationDelay = (Math.random() * 0.18) + "s";
      nodes.sparkles.appendChild(sparkle);
      window.setTimeout(function () { sparkle.remove(); }, 1100);
    }
  }

  function finishGame() {
    state.locked = true;
    nodes.field.classList.add("is-complete");
    nodes.dobrynya.src = asset(CONFIG.assets.dobrynya.happy);
    nodes.friend.src = asset(CONFIG.assets.friend.happy);
    nodes.hint.textContent = CONFIG.texts.result.title;

    window.setTimeout(function () {
      showScreen(nodes.result);
      state.locked = false;
    }, CONFIG.game.finishDelay);
  }

  function disableChoices(selected) {
    Array.from(nodes.choices.children).forEach(function (choice) {
      choice.disabled = true;
      if (choice !== selected) choice.classList.add("is-muted");
    });
  }

  function showFeedback(message, isWrong) {
    window.clearTimeout(state.feedbackTimer);
    nodes.feedback.textContent = message;
    nodes.feedback.className = "bridge-feedback is-visible" + (isWrong ? " is-wrong" : "");
    state.feedbackTimer = window.setTimeout(function () {
      nodes.feedback.className = "bridge-feedback";
    }, CONFIG.game.feedbackDuration);
  }

  function openHelp() {
    nodes.helpModal.classList.add("is-open");
    nodes.helpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    nodes.helpClose.focus();
  }

  function closeHelp() {
    if (!nodes.helpModal.classList.contains("is-open")) return;
    nodes.helpModal.classList.remove("is-open");
    nodes.helpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    nodes.helpBtn.focus();
  }

  function showScreen(screen) {
    [nodes.start, nodes.game, nodes.result].forEach(function (item) {
      item.classList.toggle("is-active", item === screen);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function asset(fileName) {
    return CONFIG.assets.basePath + fileName;
  }

  function numberToPercent(value, fallback) {
    const number = Number.isFinite(value) ? value : fallback;
    return number + "%";
  }

  function format(template, values) {
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : "";
    });
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporary = items[index];
      items[index] = items[randomIndex];
      items[randomIndex] = temporary;
    }
    return items;
  }
})();
