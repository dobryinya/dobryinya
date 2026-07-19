(function() {
  "use strict";

  const TROPA_CONFIG = {
    map: {
      image: "images/tropa/tropa-map.png"
    },

    ui: {
      defaultIconSize: 8.2,
      iconSizeUnit: "%",
      hoverScale: 1.1,
      pulse: true
    },

    selectors: {
      nav: ".top-nav",
      navBurger: "#nav-burger",
      navMenu: "#nav-menu",
      mapImage: ".tropa-map",
      stationPoint: ".station-point",
      modal: "#stationModal",
      modalIcon: "#modalIcon",
      modalTitle: "#modalTitle",
      modalDescription: "#modalDescription",
      modalLesson: "#modalLesson",
      modalPlayLink: "#modalPlayLink",
      closeModal: "[data-close-modal]",
      year: "#year"
    },

    classes: {
      navOpen: "nav-open",
      modalOpen: "modal-open",
      isOpen: "is-open",
      noPulse: "station-point--no-pulse"
    },

    stations: {
      balloons: {
        x: 22,
        y: 75,
        iconSize: 8.2,
        title: "Распредели шарики малышам",
        description: "Помоги малышам распределить шарики одинакового цвета по колбам.",
        lesson: "Будь добрым, внимательным к другим и справедливым.",
        icon: "images/tropa/icons/balloons.png",
        url: "balloons.html"
      },
      puppy: {
        x: 32,
        y: 22,
        iconSize: 8.2,
        title: "Спаси щенка от дождя",
        description: "Помоги промокшему щенку найти укрытие и выбери предметы, которые ему действительно нужны.",
        lesson: "Будь милосердным и заботься о слабом.",
        icon: "images/tropa/icons/puppy.png",
        url: "puppy.html"
      },
      wordsearch: {
        x: 54,
        y: 20,
        iconSize: 8.4,
        title: "Филворд «Добрые слова»",
        description: "Найди на поле слова, которые помогают человеку поступать по-доброму.",
        lesson: "Пониманию нравственных понятий: доброта, совесть, честь, помощь.",
        icon: "images/tropa/icons/wordsearch.png",
        url: "wordsearch.html"
      },
      vase: {
        x: 73,
        y: 20,
        iconSize: 7.8,
        title: "Собери разбитую вазу",
        description: "Собери осколки, наведи порядок и помоги Добрыне выбрать честный поступок.",
        lesson: "Учись быть ответственным и честным.",
        icon: "images/tropa/icons/vase.png",
        url: "vase.html"
      },
      granny: {
        x: 29,
        y: 45,
        iconSize: 8.6,
        title: "Перенеси бабушке сумки",
        description: "Помоги бабушке донести сумки до дома и аккуратно обойди препятствия на дороге.",
        lesson: "Помогай старшим, заботься и будь внимательным.",
        icon: "images/tropa/icons/granny.png",
        url: "granny.html"
      },
      tower: {
        x: 54,
        y: 45,
        iconSize: 8.6,
        title: "Башня дружбы",
        description: "Построй башню дружбы и выбирай спокойные действия вместо злых поступков.",
        lesson: "Будь терпеливым и учись справляться с гневом.",
        icon: "images/tropa/icons/tower.png",
        url: "tower.html"
      },
      dishes: {
        x: 81,
        y: 48,
        iconSize: 8.4,
        title: "Помоги маме рассортировать посуду",
        description: "Разложи посуду по местам после семейного обеда.",
        lesson: "Учись быть трудолюбивым и заботиться о семье.",
        icon: "images/tropa/icons/dishes.png",
        url: "dishes.html"
      },
      bridge: {
        x: 53,
        y: 75,
        iconSize: 8.2,
        title: "Мост примирения",
        description: "Выбери добрые слова и помоги двум друзьям снова помириться.",
        lesson: "Учись прощать и мириться.",
        icon: "images/tropa/icons/bridge.png",
        url: "bridge.html"
      },
      backpack: {
        x: 81,
        y: 82,
        iconSize: 8.4,
        title: "Собери рюкзак добрых дел",
        description: "Собери в рюкзак только те предметы, которые помогут сделать доброе дело.",
        lesson: "Будь готов помогать и неси ответственность за свой выбор.",
        icon: "images/tropa/icons/backpack.png",
        url: "backpack.html"
      }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    activeStationId: null,
    lastFocusedElement: null
  };

  function init() {
    initYear();
    initNavigation();
    initMap();
    initStationLinks();
    initModalClose();
    initPdfPreview();
  }

  function initYear() {
    const year = $(TROPA_CONFIG.selectors.year);
    if (year) year.textContent = new Date().getFullYear();
  }

  function initNavigation() {
    const nav = $(TROPA_CONFIG.selectors.nav);
    const burger = $(TROPA_CONFIG.selectors.navBurger);
    const menu = $(TROPA_CONFIG.selectors.navMenu);

    if (!nav || !burger || !menu) return;

    burger.addEventListener("click", () => {
      const isOpen = nav.classList.toggle(TROPA_CONFIG.classes.isOpen);
      document.body.classList.toggle(TROPA_CONFIG.classes.navOpen, isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    menu.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      nav.classList.remove(TROPA_CONFIG.classes.isOpen);
      document.body.classList.remove(TROPA_CONFIG.classes.navOpen);
      burger.setAttribute("aria-expanded", "false");
    });
  }

  function initMap() {
    const mapImage = $(TROPA_CONFIG.selectors.mapImage);
    if (mapImage) mapImage.src = TROPA_CONFIG.map.image;
  }

  function initStationLinks() {
    $$(TROPA_CONFIG.selectors.stationPoint).forEach((point) => {
      const stationId = point.dataset.station;
      const station = TROPA_CONFIG.stations[stationId];

      if (!station) return;

      applyStationPointSettings(point, station);

      point.addEventListener("click", (event) => {
        event.preventDefault();
        openStation(stationId, point);
      });
    });
  }

  function applyStationPointSettings(point, station) {
    const iconSize = station.iconSize || TROPA_CONFIG.ui.defaultIconSize;
    const unit = TROPA_CONFIG.ui.iconSizeUnit;

    point.href = station.url;
    point.setAttribute("aria-label", station.title);
    point.style.setProperty("--x", station.x + "%");
    point.style.setProperty("--y", station.y + "%");
    point.style.setProperty("--icon-size", iconSize + unit);
    point.style.setProperty("--hover-scale", TROPA_CONFIG.ui.hoverScale);

    point.classList.toggle(TROPA_CONFIG.classes.noPulse, !TROPA_CONFIG.ui.pulse);

    const icon = point.querySelector("img");
    if (icon) {
      icon.src = station.icon;
      icon.alt = "";
    }
  }

  function initModalClose() {
    $$(TROPA_CONFIG.selectors.closeModal).forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function openStation(stationId, triggerElement) {
    const station = TROPA_CONFIG.stations[stationId];
    const modal = $(TROPA_CONFIG.selectors.modal);

    if (!station || !modal) return;

    state.activeStationId = stationId;
    state.lastFocusedElement = triggerElement || document.activeElement;

    setModalData(station);

    modal.classList.add(TROPA_CONFIG.classes.isOpen);
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add(TROPA_CONFIG.classes.modalOpen);

    const playLink = $(TROPA_CONFIG.selectors.modalPlayLink);
    if (playLink) playLink.focus({ preventScroll: true });
  }

  function setModalData(station) {
    const icon = $(TROPA_CONFIG.selectors.modalIcon);
    const title = $(TROPA_CONFIG.selectors.modalTitle);
    const description = $(TROPA_CONFIG.selectors.modalDescription);
    const lesson = $(TROPA_CONFIG.selectors.modalLesson);
    const playLink = $(TROPA_CONFIG.selectors.modalPlayLink);

    if (icon) {
      icon.src = station.icon;
      icon.alt = station.title;
    }

    if (title) title.textContent = station.title;
    if (description) description.textContent = station.description;
    if (lesson) lesson.textContent = station.lesson;
    if (playLink) playLink.href = station.url;
  }

  function closeModal() {
    const modal = $(TROPA_CONFIG.selectors.modal);

    if (!modal || !modal.classList.contains(TROPA_CONFIG.classes.isOpen)) return;

    modal.classList.remove(TROPA_CONFIG.classes.isOpen);
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove(TROPA_CONFIG.classes.modalOpen);

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
      state.lastFocusedElement.focus({ preventScroll: true });
    }

    state.activeStationId = null;
  }

  document.addEventListener("DOMContentLoaded", init);



  /* =========================================================
  PDF-ПРЕДПРОСМОТР
========================================================= */

function initPdfPreview() {
  const modal = document.querySelector('#pdf-modal');
  const frame = document.querySelector('#pdf-frame');
  const title = document.querySelector('#pdf-modal-title');
  const openLink = document.querySelector('#pdf-open-link');
  const downloadLink = document.querySelector('#pdf-download-link');
  const closeButton = document.querySelector('#pdf-close-btn');

  const previewButtons = document.querySelectorAll(
    '[data-pdf-preview]'
  );

  const closeElements = document.querySelectorAll(
    '[data-pdf-close]'
  );

  if (
    !modal ||
    !frame ||
    !title ||
    !openLink ||
    !downloadLink ||
    !closeButton
  ) {
    return;
  }

  let lastFocusedElement = null;

  function openPdfModal(trigger) {
    const pdfUrl = trigger.getAttribute('href');

    if (!pdfUrl) {
      return;
    }

    const pdfLabel =
      trigger.dataset.pdfLabel || 'Предпросмотр PDF';

    lastFocusedElement = trigger;

    title.textContent = pdfLabel;
    frame.src = pdfUrl;
    openLink.href = pdfUrl;
    downloadLink.href = pdfUrl;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');

    closeButton.focus();
  }

  function closePdfModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    frame.removeAttribute('src');
    openLink.setAttribute('href', '#');
    downloadLink.setAttribute('href', '#');

    document.body.classList.remove('modal-open');

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  previewButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      openPdfModal(button);
    });
  });

  closeElements.forEach(element => {
    element.addEventListener('click', closePdfModal);
  });

  closeButton.addEventListener('click', closePdfModal);

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      modal.classList.contains('is-open')
    ) {
      closePdfModal();
    }
  });
  }
})();
