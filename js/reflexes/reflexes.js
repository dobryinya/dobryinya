/* Единый конфиг каталога. Для публикации игры установите enabled: true. */
const REFLEXES_CONFIG = {
  "site": {
    "brand": "Уроки с Добрыней",
    "home": "index.html",
    "title": "Мастерская рефлексии",
    "badge": "Завершаем урок с Добрыней",
    "description": "Пять волшебных способов заметить свои успехи, поделиться настроением и понять, чему научился сегодня.",
    "catalogTitle": "Выбери свою рефлексию",
    "catalogDescription": "Выбирай игру и рассказывай о своих открытиях. Здесь важны не только ответы, но и твои старания!"
  },
  "navigation": [
    {
      "title": "Тропа Добра",
      "href": "tropa.html"
    },
    {
      "title": "Большая игра с народами России",
      "href": "biggame.html"
    },
    {
      "title": "Добрыня-эрудит",
      "href": "erudit.html"
    },
    {
      "title": "Мастерская рефлексии",
      "href": "reflexes.html",
      "active": true
    }
  ],
  "assets": {
    "imageBase": "/images/reflexes/",
    "soundsBase": "/sounds/",
    "musicBase": "/music/"
  },
  "games": [
    {
      "id": "tree-success",
      "title": "Дерево успеха",
      "type": "Результат урока",
      "description": "Выбирай листочек: всё получилось, были трудности или нужна тренировка. Вместе вырастим дерево успеха класса!",
      "icon": "🌳",
      "theme": "forest",
      "href": "tree-success.html",
      "enabled": true
    },
    {
      "id": "achievement-chest",
      "title": "Сундук достижений",
      "type": "Личный прогресс",
      "description": "Положи в волшебный сундук то, чем гордишься: новые знания, старание, преодолённую трудность или помощь другу.",
      "icon": "🧰",
      "theme": "treasure",
      "href": "achievement-chest.html",
      "enabled": true
    },
    {
      "id": "mood-balloon",
      "title": "Воздушный шар настроения",
      "type": "Настроение",
      "description": "Выбери шар с подходящей эмоцией и отправь его в небо. Что сегодня тебя порадовало?",
      "icon": "🎈",
      "theme": "sky",
      "href": "mood-balloon.html",
      "enabled": true
    },
    {
      "id": "achievement-mountain",
      "title": "Гора достижений",
      "type": "Самооценка",
      "description": "Вместе с классом пройди путь к вершине: каждый выбор добавляет шаг и приближает всех к общей цели.",
      "icon": "🏔️",
      "theme": "mountain",
      "href": "achievement-mountain.html",
      "enabled": true
    },
    {
      "id": "energy-battery",
      "title": "Батарейка энергии",
      "type": "Самочувствие",
      "description": "Оцени свой уровень энергии после урока. Батарейка покажет заряд, а Добрыня подскажет, как поддержать себя.",
      "icon": "🔋",
      "theme": "energy",
      "href": "energy-battery.html",
      "enabled": true
    }
  ]
};

(() => {
  "use strict";
  const cfg = REFLEXES_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const el = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const setText = (selector, value) => { const node = $(selector); if (node) node.textContent = value; };
  setText("#brand", cfg.site.brand);
  $("#brand").href = cfg.site.home;
  setText("#hero-badge", cfg.site.badge);
  setText("#hero-title", cfg.site.title);
  setText("#hero-description", cfg.site.description);
  setText("#catalog-title", cfg.site.catalogTitle);
  setText("#catalog-description", cfg.site.catalogDescription);
  setText("#year", new Date().getFullYear());
  document.title = `${cfg.site.title} — ${cfg.site.brand}`;

  const menu = $("#nav-menu");
  for (const item of cfg.navigation) {
    const a = el("a", `top-nav__link${item.active ? " is-active" : ""}`, item.title);
    a.href = item.href;
    if (item.active) a.setAttribute("aria-current", "page");
    menu.append(a);
  }
  const nav = $(".top-nav"), burger = $("#nav-burger");
  function closeMenu() {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  const list = $("#games-list");
  for (const game of cfg.games) {
    const card = el("article", "reflexes-card");
    card.dataset.theme = game.theme;
    const icon = el("div", "reflexes-card__icon", game.icon);
    icon.setAttribute("aria-hidden", "true");
    const content = el("div", "reflexes-card__content");
    content.append(el("p", "reflexes-card__type", game.type));
    content.append(el("h3", "", game.title));
    content.append(el("p", "", game.description));
    const action = game.enabled
      ? el("a", "reflexes-card__button", "Начать →")
      : el("span", "reflexes-card__button is-upcoming", "Скоро появится");
    if (game.enabled) action.href = game.href;
    card.append(icon, content, action);
    list.append(card);
  }
  if (!cfg.games.length) list.append(el("p", "reflexes-empty", "Игры скоро появятся."));
})();
