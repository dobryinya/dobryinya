const episodes = [
  // Для каждой серии можно указать свои watchUrl/workbookUrl/guideUrl.
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

const listEl = document.getElementById("episodes-list");
const titleEl = document.getElementById("episode-title");
const playerEl = document.getElementById("vk-player");
const watchEl = document.getElementById("watch-link");
const workbookEl = document.getElementById("workbook-link");
const guideEl = document.getElementById("guide-link");
const actionsEl = document.querySelector(".player-actions");

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

  const [, ownerId, videoId] = pageMatch;
  return `https://vkvideo.ru/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2&autoplay=0`;
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

    return `https://vkvideo.ru/video${ownerId}_${videoId}`;
  } catch {
    return "";
  }
}

function resolveEpisodeLinks(episode, normalizedPlayerUrl) {
  const episodeNum = String(episode.id);
  const vkVideoId = String(episode.id).padStart(9, "0");
  const fallbackWatchUrl = inferWatchUrl(episode.playerUrl) || inferWatchUrl(normalizedPlayerUrl) || `https://vkvideo.ru/video-00000000_${vkVideoId}`;
  const watchUrl = episode.watchUrl && episode.watchUrl !== "https://vkvideo.ru/" ? episode.watchUrl : fallbackWatchUrl;
  const workbookUrl = episode.workbookUrl && episode.workbookUrl !== "#" ? episode.workbookUrl : `materials/work-list/${episodeNum}.pdf`;
  const guideUrl = episode.guideUrl && episode.guideUrl !== "#" ? episode.guideUrl : `materials/metod-rek/${episodeNum}MP.pdf`;

  return {
    watchUrl,
    workbookUrl,
    guideUrl
  };
}

function setActionLink(linkEl, url) {
  const hasUrl = Boolean(url) && url !== "#";
  linkEl.href = hasUrl ? url : "#";
  linkEl.classList.toggle("is-disabled", !hasUrl);
}

function animateActionButtons() {
  if (!(actionsEl instanceof HTMLElement)) {
    return;
  }

  actionsEl.classList.remove("is-updating");
  void actionsEl.offsetWidth;
  actionsEl.classList.add("is-updating");

  window.setTimeout(() => {
    actionsEl.classList.remove("is-updating");
  }, 360);
}

function setEpisode(episodeId) {
  const selected = episodes.find((item) => item.id === episodeId);
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
  buttons.forEach((btn) => {
    const isActive = Number(btn.dataset.id) === episodeId;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function renderEpisodes() {
  const markup = episodes
    .map(
      (episode) => `
        <li>
          <button class="episode-btn" data-id="${episode.id}" type="button">
            ${episode.title}
          </button>
        </li>
      `
    )
    .join("");

  listEl.innerHTML = markup;
  listEl.addEventListener("click", (event) => {
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
  const isMobileScreen = window.matchMedia("(max-width: 700px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isMobileScreen || reducedMotion) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  nodes.forEach((node) => node.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
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

  nodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index * 70, 240)}ms`;
    observer.observe(node);
  });
}

function initAuthorPhoto() {
  const imageEl = document.querySelector(".author__image");
  const placeholderEl = document.querySelector(".author__photo-placeholder");
  if (!(imageEl instanceof HTMLImageElement) || !(placeholderEl instanceof HTMLElement)) {
    return;
  }

  const onImageLoaded = () => {
    imageEl.classList.add("is-loaded");
    placeholderEl.hidden = true;
  };

  const onImageError = () => {
    imageEl.remove();
    placeholderEl.hidden = false;
  };

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
  if (!(navEl instanceof HTMLElement) || !(burgerEl instanceof HTMLButtonElement) || !(menuEl instanceof HTMLElement)) {
    return;
  }

  const isMobile = () => window.matchMedia("(max-width: 700px)").matches;

  const closeMenu = () => {
    navEl.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    burgerEl.setAttribute("aria-expanded", "false");
    burgerEl.setAttribute("aria-label", "Открыть меню");
  };

  const openMenu = () => {
    navEl.classList.add("is-open");
    document.body.classList.add("nav-open");
    burgerEl.setAttribute("aria-expanded", "true");
    burgerEl.setAttribute("aria-label", "Закрыть меню");
  };

  const toggleMenu = () => {
    const opened = navEl.classList.contains("is-open");
    if (opened) {
      closeMenu();
      return;
    }
    openMenu();
  };

  burgerEl.addEventListener("click", toggleMenu);

  menuEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const link = target.closest(".top-nav__link");
    if (link && isMobile()) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMobile() || !navEl.classList.contains("is-open")) {
      return;
    }

    if (event.target instanceof Node && !navEl.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
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
    .map((cardEl) => {
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

  const getVisibleCards = () => {
    return 1;
  };

  const getStepSize = () => Math.min(getVisibleCards(), Math.max(cardPool.length - 1, 1));

  const render = (direction = 1, animate = true) => {
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

    gridEl.replaceChildren(...nodes);
  };

  const shift = (step, animate = true) => {
    startIndex = (startIndex + step + cardPool.length) % cardPool.length;
    render(step, animate);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = 0;
    }
  };

  const startAutoPlay = () => {
    if (reducedMotion) {
      return;
    }

    stopAutoPlay();
    autoPlayTimer = window.setInterval(() => {
      shift(getStepSize());
    }, 6800);
  };

  prevBtnEl.addEventListener("click", () => {
    shift(-getStepSize());
    startAutoPlay();
  });

  nextBtnEl.addEventListener("click", () => {
    shift(getStepSize());
    startAutoPlay();
  });

  window.addEventListener("resize", () => render(1, false));

  carouselEl.addEventListener("mouseenter", stopAutoPlay);
  carouselEl.addEventListener("mouseleave", startAutoPlay);
  carouselEl.addEventListener("focusin", stopAutoPlay);
  carouselEl.addEventListener("focusout", (event) => {
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
  if (!slideEls.length) {
    return;
  }
  if (!(viewportEl instanceof HTMLElement)) {
    return;
  }

  let activeIndex = 0;
  let autoPlayTimer = 0;
  let motionClassTimer = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsEl.innerHTML = slideEls
    .map(
      (_, index) => `
        <button
          class="igroteka-carousel__dot"
          type="button"
          data-index="${index}"
          aria-label="Карточка игротеки ${index + 1}"
        ></button>
      `
    )
    .join("");

  const dotEls = Array.from(dotsEl.querySelectorAll(".igroteka-carousel__dot"));

  const render = () => {
    const viewportWidth = viewportEl.getBoundingClientRect().width;
    const sideOffset = Math.max(120, Math.min(260, viewportWidth * 0.3));
    carouselEl.style.setProperty("--igroteka-side-shift", `${sideOffset}px`);
    const totalSlides = slideEls.length;

    slideEls.forEach((slide, index) => {
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

      slide.classList.remove("is-center", "is-left", "is-right", "is-hidden-left", "is-hidden-right", "is-active");

      const isActive = offset === 0;
      if (isActive) {
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

    dotEls.forEach((dotEl, index) => {
      const isActive = index === activeIndex;
      dotEl.classList.toggle("is-active", isActive);
      dotEl.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const getSlideDirection = (currentIndex, nextIndex) => {
    const total = slideEls.length;
    const forwardDistance = (nextIndex - currentIndex + total) % total;
    const backwardDistance = (currentIndex - nextIndex + total) % total;

    if (forwardDistance === backwardDistance) {
      return 1;
    }

    return forwardDistance < backwardDistance ? 1 : -1;
  };

  const markMotionDirection = (direction) => {
    carouselEl.classList.remove("is-shifting-next", "is-shifting-prev");
    if (motionClassTimer) {
      window.clearTimeout(motionClassTimer);
      motionClassTimer = 0;
    }

    const motionClass = direction < 0 ? "is-shifting-prev" : "is-shifting-next";
    carouselEl.classList.add(motionClass);

    motionClassTimer = window.setTimeout(() => {
      carouselEl.classList.remove("is-shifting-next", "is-shifting-prev");
      motionClassTimer = 0;
    }, 620);
  };

  const setSlide = (nextIndex) => {
    const targetIndex = (nextIndex + slideEls.length) % slideEls.length;
    if (targetIndex === activeIndex) {
      return;
    }

    const direction = getSlideDirection(activeIndex, targetIndex);
    markMotionDirection(direction);
    activeIndex = targetIndex;
    render();
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = 0;
    }
  };

  const startAutoPlay = () => {
    if (reducedMotion || slideEls.length < 2) {
      return;
    }

    stopAutoPlay();
    autoPlayTimer = window.setInterval(() => {
      setSlide(activeIndex + 1);
    }, 6500);
  };

  prevBtnEl.addEventListener("click", () => {
    setSlide(activeIndex - 1);
    startAutoPlay();
  });

  nextBtnEl.addEventListener("click", () => {
    setSlide(activeIndex + 1);
    startAutoPlay();
  });

  dotsEl.addEventListener("click", (event) => {
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
  carouselEl.addEventListener("focusout", (event) => {
    const nextFocusTarget = event.relatedTarget;
    if (!(nextFocusTarget instanceof Node) || !carouselEl.contains(nextFocusTarget)) {
      startAutoPlay();
    }
  });

  carouselEl.addEventListener("keydown", (event) => {
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

  const closeModal = () => {
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    frameEl.src = "about:blank";
  };

  const openModal = (pdfUrl, label) => {
    const cleanUrl = pdfUrl.trim();
    if (!cleanUrl || cleanUrl === "#") {
      return;
    }

    const previewUrl = cleanUrl.includes("#") ? cleanUrl : `${cleanUrl}#view=FitH`;
    modalTitleEl.textContent = label;
    openLinkEl.href = cleanUrl;
    downloadLinkEl.href = cleanUrl;
    frameEl.src = previewUrl;

    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const openPdfFromButton = (event, label) => {
    event.preventDefault();
    if (!(event.currentTarget instanceof HTMLAnchorElement)) {
      return;
    }

    const buttonEl = event.currentTarget;
    if (buttonEl.classList.contains("is-disabled")) {
      return;
    }

    const activeEpisodeTitle = titleEl.textContent.trim();
    openModal(buttonEl.href, `${label} — ${activeEpisodeTitle}`);
  };

  if (workbookEl instanceof HTMLAnchorElement) {
    workbookEl.addEventListener("click", (event) => openPdfFromButton(event, "Рабочая тетрадь"));
  }

  if (guideEl instanceof HTMLAnchorElement) {
    guideEl.addEventListener("click", (event) => openPdfFromButton(event, "Методические рекомендации"));
  }

  const staticPreviewLinks = document.querySelectorAll("[data-pdf-preview]");
  staticPreviewLinks.forEach((linkEl) => {
    if (!(linkEl instanceof HTMLAnchorElement)) {
      return;
    }

    linkEl.addEventListener("click", (event) => {
      event.preventDefault();

      const pdfUrl = linkEl.dataset.pdfUrl || linkEl.getAttribute("href") || "";
      const label = linkEl.dataset.pdfLabel?.trim() || "Предпросмотр PDF";
      if (!pdfUrl || pdfUrl === "#") {
        return;
      }

      openModal(pdfUrl, label);
    });
  });

  closeBtnEl.addEventListener("click", closeModal);
  modalEl.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.hasAttribute("data-pdf-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalEl.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function initYear() {
  const yearEl = document.getElementById("year");
  yearEl.textContent = String(new Date().getFullYear());
}

initNavigation();
initPdfPreview();
initCardsCarousel();
initIgrotekaCarousel();
renderEpisodes();
setupRevealAnimation();
initAuthorPhoto();
initYear();
