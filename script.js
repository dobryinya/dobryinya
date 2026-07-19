const episodes = [
  {
    id: 0,
    title: "Знакомство с Добрыней",
    playerUrl: "https://vkvideo.ru/video-236469097_456239018",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 1,
    title: "1 серия — Что такое доброта",
    playerUrl: "https://vkvideo.ru/video-236469097_456239021",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 2,
    title: "2 серия — Сострадание",
    playerUrl: "https://vkvideo.ru/video-236469097_456239019",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 3,
    title: "3 серия — Честность",
    playerUrl: "https://vkvideo.ru/video-236469097_456239022",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 4,
    title: "4 серия — Ответственность",
    playerUrl: "https://vkvideo.ru/video-236469097_456239023",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 5,
    title: "5 серия — Терпение",
    playerUrl: "https://vkvideo.ru/video-236469097_456239024",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 6,
    title: "6 серия — Совесть",
    playerUrl: "https://vkvideo.ru/video-236469097_456239025",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 7,
    title: "7 серия — Трудолюбие",
    playerUrl: "https://vkvideo.ru/video-236469097_456239026",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 8,
    title: "8 серия — Умение прощать",
    playerUrl: "https://vkvideo.ru/video-236469097_456239027",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 9,
    title: "9 серия — Самоконтроль. Гнев",
    playerUrl: "https://vkvideo.ru/video-236469097_456239028",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 10,
    title: "10 серия — Россия начинается с любви",
    playerUrl: "https://vkvideo.ru/video-236469097_456239029",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  }
];

let activeEpisodeId = null;

function normalizeVkPlayerUrl(rawUrl) {
  if (typeof rawUrl !== "string") {
    return "";
  }

  const source = rawUrl.trim();

  if (!source) {
    return "";
  }

  if (source.includes("video_ext.php")) {
    return source;
  }

  const pageMatch = source.match(/video(-?\d+)_(-?\d+)/i);

  if (!pageMatch) {
    return source;
  }

  const ownerId = pageMatch[1];
  const videoId = pageMatch[2];

  return "https://vkvideo.ru/video_ext.php?oid=" + ownerId + "&id=" + videoId + "&hd=2&autoplay=0";
}

function inferWatchUrl(playerUrl) {
  if (typeof playerUrl !== "string" || !playerUrl.trim()) {
    return "";
  }

  const source = playerUrl.trim();
  const directPageMatch = source.match(/https?:\/\/vkvideo\.ru\/video-?\d+_-?\d+/i);

  if (directPageMatch) {
    return directPageMatch[0];
  }

  try {
    const parsedUrl = new URL(source);

    if (!parsedUrl.pathname.includes("video_ext.php")) {
      return "";
    }

    const ownerId = parsedUrl.searchParams.get("oid");
    const videoId = parsedUrl.searchParams.get("id");

    if (!ownerId || !videoId) {
      return "";
    }

    return "https://vkvideo.ru/video" + ownerId + "_" + videoId;
  } catch (error) {
    return "";
  }
}

function resolveEpisodeLinks(episode, normalizedPlayerUrl) {
  const episodeNum = String(episode.id);
  const vkVideoId = String(episode.id).padStart(9, "0");

  const fallbackWatchUrl =
    inferWatchUrl(episode.playerUrl) ||
    inferWatchUrl(normalizedPlayerUrl) ||
    "https://vkvideo.ru/video-00000000_" + vkVideoId;

  const watchUrl =
    episode.watchUrl && episode.watchUrl !== "https://vkvideo.ru/"
      ? episode.watchUrl
      : fallbackWatchUrl;

  const workbookUrl =
    episode.workbookUrl && episode.workbookUrl !== "#"
      ? episode.workbookUrl
      : "materials/work-list/" + episodeNum + ".pdf";

  const guideUrl =
    episode.guideUrl && episode.guideUrl !== "#"
      ? episode.guideUrl
      : "materials/metod-rek/" + episodeNum + "MP.pdf";

  return {
    watchUrl: watchUrl,
    workbookUrl: workbookUrl,
    guideUrl: guideUrl
  };
}

function setActionLink(linkEl, url) {
  if (!(linkEl instanceof HTMLAnchorElement)) {
    return;
  }

  const hasUrl = Boolean(url) && url !== "#";

  linkEl.href = hasUrl ? url : "#";
  linkEl.classList.toggle("is-disabled", !hasUrl);
}

function animateActionButtons() {
  const actionsEl = document.querySelector(".player-actions");

  if (!(actionsEl instanceof HTMLElement)) {
    return;
  }

  actionsEl.classList.remove("is-updating");
  void actionsEl.offsetWidth;
  actionsEl.classList.add("is-updating");

  window.setTimeout(function() {
    actionsEl.classList.remove("is-updating");
  }, 360);
}

function setEpisode(episodeId) {
  const listEl = document.getElementById("episodes-list");
  const titleEl = document.getElementById("episode-title");
  const playerEl = document.getElementById("vk-player");
  const watchEl = document.getElementById("watch-link");
  const workbookEl = document.getElementById("workbook-link");
  const guideEl = document.getElementById("guide-link");

  if (
    !(listEl instanceof HTMLElement) ||
    !(titleEl instanceof HTMLElement) ||
    !(playerEl instanceof HTMLIFrameElement) ||
    !(watchEl instanceof HTMLAnchorElement) ||
    !(workbookEl instanceof HTMLAnchorElement) ||
    !(guideEl instanceof HTMLAnchorElement)
  ) {
    return;
  }

  const selected = episodes.find(function(item) {
    return item.id === episodeId;
  });

  if (!selected) {
    return;
  }

  const normalizedPlayerUrl = normalizeVkPlayerUrl(selected.playerUrl);
  const links = resolveEpisodeLinks(selected, normalizedPlayerUrl);
  const shouldAnimate = activeEpisodeId !== null && activeEpisodeId !== episodeId;

  titleEl.textContent = selected.title;
  playerEl.src = normalizedPlayerUrl;

  setActionLink(watchEl, links.watchUrl);
  setActionLink(workbookEl, links.workbookUrl);
  setActionLink(guideEl, links.guideUrl);

  guideEl.hidden = selected.id === 0;

  if (shouldAnimate) {
    animateActionButtons();
  }

  activeEpisodeId = episodeId;

  const buttons = listEl.querySelectorAll(".episode-btn");

  buttons.forEach(function(btn) {
    const isActive = Number(btn.dataset.id) === episodeId;

    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function renderEpisodes() {
  const listEl = document.getElementById("episodes-list");

  if (!(listEl instanceof HTMLElement)) {
    return;
  }

  const markup = episodes
    .map(function(episode) {
      return (
        '<li>' +
        '<button class="episode-btn" data-id="' + episode.id + '" type="button">' +
        episode.title +
        "</button>" +
        "</li>"
      );
    })
    .join("");

  listEl.innerHTML = markup;

  listEl.addEventListener("click", function(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest(".episode-btn");

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    setEpisode(Number(button.dataset.id));
  });

  setEpisode(episodes[0].id);
}

function setupRevealAnimation() {
  const nodes = document.querySelectorAll(".card, .hero");

  if (!nodes.length) {
    return;
  }

  const isMobileScreen = window.matchMedia("(max-width: 700px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isMobileScreen || reducedMotion || !("IntersectionObserver" in window)) {
    nodes.forEach(function(node) {
      node.classList.add("is-visible");
    });

    return;
  }

  nodes.forEach(function(node) {
    node.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.02,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  nodes.forEach(function(node, index) {
    node.style.transitionDelay = Math.min(index * 70, 240) + "ms";
    observer.observe(node);
  });
}

function initAuthorPhoto() {
  const imageEl = document.querySelector(".author__image");
  const placeholderEl = document.querySelector(".author__photo-placeholder");

  if (!(imageEl instanceof HTMLImageElement) || !(placeholderEl instanceof HTMLElement)) {
    return;
  }

  function onImageLoaded() {
    imageEl.classList.add("is-loaded");
    placeholderEl.hidden = true;
  }

  function onImageError() {
    imageEl.remove();
    placeholderEl.hidden = false;
  }

  imageEl.addEventListener("load", onImageLoaded);
  imageEl.addEventListener("error", onImageError);

  if (imageEl.complete && imageEl.naturalWidth > 0) {
    onImageLoaded();
  }
}

function initNavigation() {
  const navEl = document.querySelector(".top-nav");
  const burgerEl = document.getElementById("nav-burger");
  const menuEl = document.getElementById("nav-menu");

  if (
    !(navEl instanceof HTMLElement) ||
    !(burgerEl instanceof HTMLButtonElement) ||
    !(menuEl instanceof HTMLElement)
  ) {
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

  function toggleMenu() {
    const opened = navEl.classList.contains("is-open");

    if (opened) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burgerEl.addEventListener("click", toggleMenu);

  menuEl.addEventListener("click", function(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const link = target.closest(".top-nav__link");

    if (link && isMobile()) {
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

function initCardsCarousel() {
  const carouselEl = document.getElementById("cards-carousel");
  const gridEl = document.getElementById("cards-grid");
  const prevBtnEl = document.getElementById("cards-prev");
  const nextBtnEl = document.getElementById("cards-next");

  if (
    !(carouselEl instanceof HTMLElement) ||
    !(gridEl instanceof HTMLElement) ||
    !(prevBtnEl instanceof HTMLButtonElement) ||
    !(nextBtnEl instanceof HTMLButtonElement)
  ) {
    return;
  }

  const cardPool = Array.from(gridEl.querySelectorAll(".project-card"))
    .map(function(cardEl) {
      const imageEl = cardEl.querySelector(".project-card__image");

      if (!(imageEl instanceof HTMLImageElement)) {
        return null;
      }

      return {
        src: imageEl.getAttribute("src") || "",
        alt: imageEl.getAttribute("alt") || "Карточка проекта"
      };
    })
    .filter(Boolean);

  if (cardPool.length < 2) {
    return;
  }

  let startIndex = 0;
  let autoPlayTimer = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getVisibleCards() {
    return 1;
  }

  function getStepSize() {
    return Math.min(getVisibleCards(), Math.max(cardPool.length - 1, 1));
  }

  function render(direction, animate) {
    const visibleCards = Math.min(getVisibleCards(), cardPool.length);
    const nodes = [];
    const animationClass = direction < 0 ? "project-card--enter-prev" : "project-card--enter-next";

    for (let offset = 0; offset < visibleCards; offset += 1) {
      const card = cardPool[(startIndex + offset) % cardPool.length];

      if (!card) {
        continue;
      }

      const cardEl = document.createElement("article");
      cardEl.className = "project-card";

      const imageEl = document.createElement("img");
      imageEl.className = "project-card__image";
      imageEl.src = card.src;
      imageEl.alt = card.alt;
      imageEl.loading = "lazy";

      cardEl.append(imageEl);

      if (animate) {
        cardEl.classList.add(animationClass);
      }

      nodes.push(cardEl);
    }

    gridEl.replaceChildren.apply(gridEl, nodes);
  }

  function shift(step, animate) {
    startIndex = (startIndex + step + cardPool.length) % cardPool.length;
    render(step, animate !== false);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = 0;
    }
  }

  function startAutoPlay() {
    if (reducedMotion) {
      return;
    }

    stopAutoPlay();

    autoPlayTimer = window.setInterval(function() {
      shift(getStepSize(), true);
    }, 6800);
  }

  prevBtnEl.addEventListener("click", function() {
    shift(-getStepSize(), true);
    startAutoPlay();
  });

  nextBtnEl.addEventListener("click", function() {
    shift(getStepSize(), true);
    startAutoPlay();
  });

  window.addEventListener("resize", function() {
    render(1, false);
  });

  carouselEl.addEventListener("mouseenter", stopAutoPlay);
  carouselEl.addEventListener("mouseleave", startAutoPlay);
  carouselEl.addEventListener("focusin", stopAutoPlay);

  carouselEl.addEventListener("focusout", function(event) {
    const nextFocusTarget = event.relatedTarget;

    if (!(nextFocusTarget instanceof Node) || !carouselEl.contains(nextFocusTarget)) {
      startAutoPlay();
    }
  });

  render(1, false);
  startAutoPlay();
}

function initIgrotekaCarousel() {
  const carouselEl = document.getElementById("igroteka-carousel");
  const trackEl = document.getElementById("igroteka-track");
  const dotsEl = document.getElementById("igroteka-dots");
  const prevBtnEl = document.getElementById("igroteka-prev");
  const nextBtnEl = document.getElementById("igroteka-next");

  if (
    !(carouselEl instanceof HTMLElement) ||
    !(trackEl instanceof HTMLElement) ||
    !(dotsEl instanceof HTMLElement) ||
    !(prevBtnEl instanceof HTMLButtonElement) ||
    !(nextBtnEl instanceof HTMLButtonElement)
  ) {
    return;
  }

  const slideEls = Array.from(trackEl.querySelectorAll(".igroteka-slide"));
  const viewportEl = carouselEl.querySelector(".igroteka-carousel__viewport");

  if (!slideEls.length || !(viewportEl instanceof HTMLElement)) {
    return;
  }

  let activeIndex = 0;
  let autoPlayTimer = 0;
  let motionClassTimer = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsEl.innerHTML = slideEls
    .map(function(_, index) {
      return (
        '<button class="igroteka-carousel__dot" type="button" data-index="' +
        index +
        '" aria-label="Карточка игротеки ' +
        (index + 1) +
        '"></button>'
      );
    })
    .join("");

  const dotEls = Array.from(dotsEl.querySelectorAll(".igroteka-carousel__dot"));

  function render() {
    const viewportWidth = viewportEl.getBoundingClientRect().width;
    const sideOffset = Math.max(120, Math.min(260, viewportWidth * 0.3));
    const totalSlides = slideEls.length;

    carouselEl.style.setProperty("--igroteka-side-shift", sideOffset + "px");

    slideEls.forEach(function(slide, index) {
      let offset = index - activeIndex;
      const half = totalSlides / 2;

      if (offset > half) {
        offset -= totalSlides;
      }

      if (offset < -half) {
        offset += totalSlides;
      }

      slide.style.removeProperty("transform");
      slide.style.removeProperty("opacity");
      slide.style.removeProperty("z-index");
      slide.style.removeProperty("pointer-events");
      slide.style.removeProperty("filter");

      slide.classList.remove(
        "is-center",
        "is-left",
        "is-right",
        "is-hidden-left",
        "is-hidden-right",
        "is-active"
      );

      if (offset === 0) {
        slide.classList.add("is-center", "is-active");
        slide.setAttribute("aria-hidden", "false");
        return;
      }

      if (offset === -1) {
        slide.classList.add("is-left");
        slide.setAttribute("aria-hidden", "true");
        return;
      }

      if (offset === 1) {
        slide.classList.add("is-right");
        slide.setAttribute("aria-hidden", "true");
        return;
      }

      slide.classList.add(offset < 0 ? "is-hidden-left" : "is-hidden-right");
      slide.setAttribute("aria-hidden", "true");
    });

    dotEls.forEach(function(dotEl, index) {
      const isActive = index === activeIndex;

      dotEl.classList.toggle("is-active", isActive);
      dotEl.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function getSlideDirection(currentIndex, nextIndex) {
    const total = slideEls.length;
    const forwardDistance = (nextIndex - currentIndex + total) % total;
    const backwardDistance = (currentIndex - nextIndex + total) % total;

    if (forwardDistance === backwardDistance) {
      return 1;
    }

    return forwardDistance < backwardDistance ? 1 : -1;
  }

  function markMotionDirection(direction) {
    carouselEl.classList.remove("is-shifting-next", "is-shifting-prev");

    if (motionClassTimer) {
      window.clearTimeout(motionClassTimer);
      motionClassTimer = 0;
    }

    const motionClass = direction < 0 ? "is-shifting-prev" : "is-shifting-next";

    carouselEl.classList.add(motionClass);

    motionClassTimer = window.setTimeout(function() {
      carouselEl.classList.remove("is-shifting-next", "is-shifting-prev");
      motionClassTimer = 0;
    }, 620);
  }

  function setSlide(nextIndex) {
    const targetIndex = (nextIndex + slideEls.length) % slideEls.length;

    if (targetIndex === activeIndex) {
      return;
    }

    const direction = getSlideDirection(activeIndex, targetIndex);

    markMotionDirection(direction);

    activeIndex = targetIndex;

    render();
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = 0;
    }
  }

  function startAutoPlay() {
    if (reducedMotion || slideEls.length < 2) {
      return;
    }

    stopAutoPlay();

    autoPlayTimer = window.setInterval(function() {
      setSlide(activeIndex + 1);
    }, 6500);
  }

  prevBtnEl.addEventListener("click", function() {
    setSlide(activeIndex - 1);
    startAutoPlay();
  });

  nextBtnEl.addEventListener("click", function() {
    setSlide(activeIndex + 1);
    startAutoPlay();
  });

  dotsEl.addEventListener("click", function(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest(".igroteka-carousel__dot");

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const index = Number(button.dataset.index);

    if (Number.isNaN(index)) {
      return;
    }

    setSlide(index);
    startAutoPlay();
  });

  carouselEl.addEventListener("mouseenter", stopAutoPlay);
  carouselEl.addEventListener("mouseleave", startAutoPlay);
  carouselEl.addEventListener("focusin", stopAutoPlay);

  carouselEl.addEventListener("focusout", function(event) {
    const nextFocusTarget = event.relatedTarget;

    if (!(nextFocusTarget instanceof Node) || !carouselEl.contains(nextFocusTarget)) {
      startAutoPlay();
    }
  });

  carouselEl.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSlide(activeIndex - 1);
      startAutoPlay();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSlide(activeIndex + 1);
      startAutoPlay();
    }
  });

  window.addEventListener("resize", render);

  render();
  startAutoPlay();
}

function initPdfPreview() {
  const modalEl = document.getElementById("pdf-modal");
  const frameEl = document.getElementById("pdf-frame");
  const closeBtnEl = document.getElementById("pdf-close-btn");
  const openLinkEl = document.getElementById("pdf-open-link");
  const downloadLinkEl = document.getElementById("pdf-download-link");
  const modalTitleEl = document.getElementById("pdf-modal-title");

  if (
    !(modalEl instanceof HTMLElement) ||
    !(frameEl instanceof HTMLIFrameElement) ||
    !(closeBtnEl instanceof HTMLButtonElement) ||
    !(openLinkEl instanceof HTMLAnchorElement) ||
    !(downloadLinkEl instanceof HTMLAnchorElement) ||
    !(modalTitleEl instanceof HTMLElement)
  ) {
    return;
  }

  function closeModal() {
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    frameEl.src = "about:blank";
  }

  function openModal(pdfUrl, label) {
    const cleanUrl = pdfUrl.trim();

    if (!cleanUrl || cleanUrl === "#") {
      return;
    }

    const previewUrl = cleanUrl.includes("#") ? cleanUrl : cleanUrl + "#view=FitH";

    modalTitleEl.textContent = label;
    openLinkEl.href = cleanUrl;
    downloadLinkEl.href = cleanUrl;
    frameEl.src = previewUrl;

    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function openPdfFromButton(event, label) {
    event.preventDefault();

    if (!(event.currentTarget instanceof HTMLAnchorElement)) {
      return;
    }

    const buttonEl = event.currentTarget;

    if (buttonEl.classList.contains("is-disabled")) {
      return;
    }

    const titleEl = document.getElementById("episode-title");
    const activeEpisodeTitle =
      titleEl instanceof HTMLElement && titleEl.textContent.trim()
        ? titleEl.textContent.trim()
        : "Материал";

    openModal(buttonEl.href, label + " — " + activeEpisodeTitle);
  }

  const workbookEl = document.getElementById("workbook-link");
  const guideEl = document.getElementById("guide-link");

  if (workbookEl instanceof HTMLAnchorElement) {
    workbookEl.addEventListener("click", function(event) {
      openPdfFromButton(event, "Рабочая тетрадь");
    });
  }

  if (guideEl instanceof HTMLAnchorElement) {
    guideEl.addEventListener("click", function(event) {
      openPdfFromButton(event, "Методические рекомендации");
    });
  }

  const staticPreviewLinks = document.querySelectorAll("[data-pdf-preview]");

  staticPreviewLinks.forEach(function(linkEl) {
    if (!(linkEl instanceof HTMLAnchorElement)) {
      return;
    }

    linkEl.addEventListener("click", function(event) {
      event.preventDefault();

      const pdfUrl = linkEl.dataset.pdfUrl || linkEl.getAttribute("href") || "";
      const label = linkEl.dataset.pdfLabel ? linkEl.dataset.pdfLabel.trim() : "Предпросмотр PDF";

      if (!pdfUrl || pdfUrl === "#") {
        return;
      }

      openModal(pdfUrl, label);
    });
  });

  closeBtnEl.addEventListener("click", closeModal);

  modalEl.addEventListener("click", function(event) {
    const target = event.target;

    if (target instanceof HTMLElement && target.hasAttribute("data-pdf-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && modalEl.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function initYear() {
  const yearEl = document.getElementById("year");

  if (!(yearEl instanceof HTMLElement)) {
    return;
  }

  yearEl.textContent = String(new Date().getFullYear());
}

function initViktorinePage() {
  const startBtn = document.getElementById("quiz-start");
  const hero = document.querySelector(".quiz-hero");
  const screen = document.getElementById("quiz-screen");
  const counter = document.getElementById("quiz-counter");
  const scoreText = document.getElementById("quiz-score");
  const meterBar = document.getElementById("quiz-meter-bar");
  const title = document.getElementById("quiz-title");
  const questionText = document.getElementById("quiz-question-text");
  const optionsBox = document.getElementById("quiz-options");
  const feedback = document.getElementById("quiz-feedback");
  const mainBtn = document.getElementById("quiz-main-btn");

  if (
    !(startBtn instanceof HTMLButtonElement) ||
    !(hero instanceof HTMLElement) ||
    !(screen instanceof HTMLElement) ||
    !(counter instanceof HTMLElement) ||
    !(scoreText instanceof HTMLElement) ||
    !(meterBar instanceof HTMLElement) ||
    !(title instanceof HTMLElement) ||
    !(questionText instanceof HTMLElement) ||
    !(optionsBox instanceof HTMLElement) ||
    !(feedback instanceof HTMLElement) ||
    !(mainBtn instanceof HTMLButtonElement)
  ) {
    return;
  }

  const questions = [
    {
      text: "Если твой друг упал и ушибся, что лучше всего сделать?",
      options: [
        "А) Засмеяться и сказать: «Какой ты неуклюжий!»",
        "Б) Пройти мимо, ведь он сам виноват",
        "В) Подойти, помочь встать и спросить: «Тебе больно? Чем помочь?»",
        "Г) Позвать других, чтобы вместе посмеяться"
      ],
      correct: 2,
      why: "Друзья познаются в беде. Поддержка и сочувствие в трудную минуту — это и есть настоящая дружба и доброта."
    },
    {
      text: "Ты нашёл на полу в школе красивую ручку. Что сделаешь?",
      options: [
        "А) Оставлю себе — повезло!",
        "Б) Спрошу у учителя или отнесу в «стол находок» — вдруг хозяин ищет",
        "В) Выброшу в мусорное ведро, раз она чужая",
        "Г) Поменяюсь с кем-нибудь на что-то другое"
      ],
      correct: 1,
      why: "Честность — это когда ты поступаешь с чужими вещами так, как хотел бы, чтобы поступали с твоими. Хозяину ручки будет очень приятно её вернуть."
    },
    {
      text: "Мама очень устала на работе. Что ты можешь сделать, чтобы проявить заботу?",
      options: [
        "А) Громко включить телевизор и позвать друзей играть",
        "Б) Попросить маму приготовить ужин побыстрее",
        "В) Тихо поиграть в своей комнате и предложить помощь: помыть посуду или накрыть на стол",
        "Г) Уйти гулять, чтобы мама отдохнула от меня"
      ],
      correct: 2,
      why: "Уважение и любовь к родным проявляются в маленьких делах: когда ты замечаешь, что близкому человеку тяжело, и помогаешь без напоминаний."
    },
    {
      text: "Кто поступает по совести?",
      options: [
        "А) Тот, кто делает добро, только когда его хвалят",
        "Б) Тот, кто старается поступать честно и хорошо, даже если никто не видит",
        "В) Тот, кто делает то, что велят старшие, без размышлений",
        "Г) Тот, кто всегда делает так, как выгодно ему"
      ],
      correct: 1,
      why: "Совесть живёт у нас внутри. Она как тихий голос, который подсказывает: «Это хорошо, а это плохо». Поступать по совести — значит слушать этот голос, даже когда никто за тобой не следит."
    },
    {
      text: "Ты случайно разбил мамину любимую чашку. Никто не видел. Что делать?",
      options: [
        "А) Спрятать осколки и сделать вид, что ничего не случилось",
        "Б) Сказать маме, извиниться и предложить что-то исправить, например помочь по хозяйству",
        "В) Свалить вину на кошку или младшего брата",
        "Г) Заплакать и убежать"
      ],
      correct: 1,
      why: "Честность — это смелость признать свою ошибку. Мама расстроится из-за чашки, но она будет гордиться тобой, потому что ты сказал правду. Ошибку можно исправить, а ложь остаётся."
    },
    {
      text: "В классе появился новенький мальчик, он стесняется и ни с кем не разговаривает. Как поступить по-дружески?",
      options: [
        "А) Не обращать на него внимания, пусть сам привыкает",
        "Б) Посмеиваться над ним с друзьями",
        "В) Подойти, улыбнуться, предложить вместе поиграть или показать школу",
        "Г) Сказать учительнице, что он странный"
      ],
      correct: 2,
      why: "Доброта — это когда ты замечаешь тех, кому трудно, и протягиваешь руку. Представь, как страшно быть новеньким. Твоя улыбка может стать для него первым лучом солнца."
    },
    {
      text: "Бабушка медленно идёт по улице с тяжёлой сумкой. Твои действия?",
      options: [
        "А) Побегу вперёд, не хочу ждать",
        "Б) Скажу: «Бабушка, давай я помогу донести сумку, а ты иди медленно»",
        "В) Попрошу бабушку идти быстрее",
        "Г) Сделаю вид, что меня здесь нет"
      ],
      correct: 1,
      why: "Уважение к старшим — это забота и внимание. Бабушке тяжело, а ты молодой и сильный. Помочь ей — это проявить любовь и благодарность за всё, что она для тебя сделала."
    },
    {
      text: "Что такое «прощение»?",
      options: [
        "А) Это когда ты делаешь вид, что ничего не случилось, но в душе злишься",
        "Б) Это когда ты решаешь больше никогда не разговаривать с обидчиком",
        "В) Это когда ты искренне перестаёшь злиться и даёшь человеку второй шанс",
        "Г) Это когда требуешь извинений и подарков"
      ],
      correct: 2,
      why: "Все люди ошибаются. Прощение — это не слабость, а сила. Оно освобождает твоё сердце от тяжёлой обиды и дарит мир. Простить — значит сказать: «Я не держу зла, давай дружить дальше»."
    },
    {
      text: "Ребята во дворе дразнят одного мальчика за то, что он носит очки. Ты...",
      options: [
        "А) Присоединюсь к ним, чтобы не быть белой вороной",
        "Б) Скажу обидчикам: «Прекратите! Это несправедливо. Очки — не повод для насмешек»",
        "В) Уйду подальше, это не моё дело",
        "Г) Тоже начну придумывать обидные прозвища"
      ],
      correct: 1,
      why: "Смелым бывает не тот, кто обижает слабого, а тот, кто защищает. Заступиться за того, кого обижают, — это поступок настоящего друга и человека с добрым сердцем."
    },
    {
      text: "Какое из этих правил лучше всего описывает «золотое правило нравственности»?",
      options: [
        "А) «Око за око, зуб за зуб» — обижай в ответ",
        "Б) «Поступай с другими так, как хочешь, чтобы поступали с тобой»",
        "В) «Моя хата с краю — ничего не знаю»",
        "Г) «Кто сильнее, тот и прав»"
      ],
      correct: 1,
      why: "Это самое главное правило доброты и справедливости. Прежде чем сделать что-то другому, представь себя на его месте. Хочешь, чтобы тебе помогали? Помогай сам. Хочешь уважения? Уважай других."
    }
  ];

  let current = 0;
  let score = 0;
  let selected = null;
  let answered = false;

  function renderQuestion() {
    const question = questions[current];

    selected = null;
    answered = false;

    counter.textContent = "Вопрос " + (current + 1) + " из " + questions.length;
    scoreText.textContent = "Правильных ответов: " + score;
    meterBar.style.width = ((current + 1) / questions.length) * 100 + "%";

    title.textContent = "Вопрос " + (current + 1);
    questionText.textContent = question.text;

    feedback.hidden = true;
    feedback.innerHTML = "";

    mainBtn.textContent = "Ответить";
    mainBtn.disabled = true;

    optionsBox.innerHTML = "";

    question.options.forEach(function(option, index) {
      const btn = document.createElement("button");

      btn.type = "button";
      btn.className = "quiz-option";
      btn.textContent = option;

      btn.addEventListener("click", function() {
        if (answered) {
          return;
        }

        selected = index;
        mainBtn.disabled = false;

        const allOptions = optionsBox.querySelectorAll(".quiz-option");

        allOptions.forEach(function(item) {
          item.classList.remove("is-selected");
        });

        btn.classList.add("is-selected");
      });

      optionsBox.appendChild(btn);
    });
  }

  function showAnswer() {
    if (selected === null) {
      return;
    }

    const question = questions[current];
    const optionButtons = optionsBox.querySelectorAll(".quiz-option");

    answered = true;

    optionButtons.forEach(function(btn, index) {
      btn.disabled = true;

      if (index === question.correct) {
        btn.classList.add("is-correct");
      }

      if (index === selected && selected !== question.correct) {
        btn.classList.add("is-wrong");
      }
    });

    if (selected === question.correct) {
      score++;
      feedback.innerHTML =
        "<h3>Правильно!</h3><p><strong>Почему?</strong> " + question.why + "</p>";
    } else {
      feedback.innerHTML =
        "<h3>Неправильно</h3><p><strong>Почему?</strong> " + question.why + "</p>";
    }

    scoreText.textContent = "Правильных ответов: " + score;
    feedback.hidden = false;

    if (current === questions.length - 1) {
      mainBtn.textContent = "Показать результат";
    } else {
      mainBtn.textContent = "Далее";
    }
  }

  function nextQuestion() {
    current++;

    if (current >= questions.length) {
      showResult();
      return;
    }

    renderQuestion();
  }

  function showResult() {
    title.textContent = "Викторина завершена!";
    questionText.textContent = "Твой результат: " + score + " из " + questions.length + ".";
    optionsBox.innerHTML = "";

    feedback.hidden = false;
    feedback.innerHTML =
      "<h3>Молодец!</h3><p>Главное — не только выбрать правильный ответ, но и помнить о доброте, честности и уважении в жизни.</p>";

    mainBtn.textContent = "Пройти ещё раз";
    mainBtn.disabled = false;

    counter.textContent = "Результат";
    scoreText.textContent = "Правильных ответов: " + score;
    meterBar.style.width = "100%";
  }

  startBtn.addEventListener("click", function() {
    hero.hidden = true;
    screen.hidden = false;
    renderQuestion();
  });

  mainBtn.addEventListener("click", function() {
    if (mainBtn.textContent === "Пройти ещё раз") {
      current = 0;
      score = 0;
      selected = null;
      answered = false;
      renderQuestion();
      return;
    }

    if (!answered) {
      showAnswer();
    } else {
      nextQuestion();
    }
  });
}

function initSite() {
  initNavigation();
  initYear();
  setupRevealAnimation();

  renderEpisodes();
  initPdfPreview();
  initCardsCarousel();
  initIgrotekaCarousel();
  initAuthorPhoto();

  initViktorinePage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}