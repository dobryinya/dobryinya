const episodes = [
  // Для каждой серии можно указать свои watchUrl/workbookUrl/guideUrl.
  {
    id: 0,
    title: "Знакомство с Добрыней",
    playerUrl: "https://vkvideo.ru/video-1415705_456252206?sh=4",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 1,
    title: "1 серия — Что такое доброта",
    playerUrl: "https://vkvideo.ru/video-151774268_456240963?t=2h28m9s",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 2,
    title: "2 серия — Милосердие",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000002&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 3,
    title: "3 серия — Честность",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000003&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 4,
    title: "4 серия — Ответственность",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000004&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 5,
    title: "5 серия — Терпение",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000005&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 6,
    title: "6 серия — Совесть",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000006&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 7,
    title: "7 серия — Трудолюбие",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000007&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 8,
    title: "8 серия — Умение прощать",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000008&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 9,
    title: "9 серия — Самоконтроль. Гнев",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000009&hd=2&autoplay=0",
    watchUrl: "https://vkvideo.ru/",
    workbookUrl: "#",
    guideUrl: "#"
  },
  {
    id: 10,
    title: "10 серия — Россия начинается с любви",
    playerUrl: "https://vkvideo.ru/video_ext.php?oid=-00000000&id=000000010&hd=2&autoplay=0",
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
  const episodeNum = String(episode.id).padStart(2, "0");
  const vkVideoId = String(episode.id).padStart(9, "0");
  const fallbackWatchUrl = inferWatchUrl(episode.playerUrl) || inferWatchUrl(normalizedPlayerUrl) || `https://vkvideo.ru/video-00000000_${vkVideoId}`;
  const watchUrl = episode.watchUrl && episode.watchUrl !== "https://vkvideo.ru/" ? episode.watchUrl : fallbackWatchUrl;
  const workbookUrl = episode.workbookUrl && episode.workbookUrl !== "#" ? episode.workbookUrl : `materials/workbook-${episodeNum}.pdf`;
  const guideUrl = episode.guideUrl && episode.guideUrl !== "#" ? episode.guideUrl : `materials/guide-${episodeNum}.pdf`;

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

function initYear() {
  const yearEl = document.getElementById("year");
  yearEl.textContent = String(new Date().getFullYear());
}

initNavigation();
renderEpisodes();
setupRevealAnimation();
initAuthorPhoto();
initYear();
