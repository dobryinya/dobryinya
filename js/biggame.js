(function() {
  "use strict";

  const VK_PLACEHOLDER = " ";


  const INTRO_VIDEO = {
    video: "https://vkvideo.ru/video-236469097_456239054",
  
    label: "Большая игра с народами России",
  
    title: "Начало игры",
  
    text:
      "Добро пожаловать в большое путешествие по России! " +
      "Посмотри вступительное видео, а затем выбирай любой регион на карте. " +
      "Ты познакомишься с народными традициями и попробуешь свои силы в играх разных регионов нашей страны."
  };

  function normalizeVkPlayerUrl(rawUrl) {
    if (typeof rawUrl !== "string") return "";
  
    const source = rawUrl.trim();
    if (!source) return "";
  
    if (source.includes("video_ext.php")) return source;
  
    const pageMatch = source.match(/video(-?\d+)_(-?\d+)/i);
    if (!pageMatch) return source;
  
    return (
      "https://vkvideo.ru/video_ext.php?oid=" +
      pageMatch[1] +
      "&id=" +
      pageMatch[2] +
      "&hd=2&autoplay=0"
    );
  }



  const PEOPLES = [
    {
      id: "northwest",
      region: "Северо-Запад",
      peopleTitle: "Народы Северо-Запада",
      gameTitle: "Рюхи",
      gameUrl: "ruhie.html",
      photo: "images/gamez/severozapad.jpg",
      video: "https://vkvideo.ru/video-236469097_456239045",
      theme: "sea",
      x: 14,
      y: 30,
      theses: [
        "Знаешь ли ты, что рюхи раньше делали из небольших деревянных чурбачков? Эта простая дворовая игра сохранила связь со старинным бытом и мастерством работы с деревом."
      ]
    },
    {
      id: "european-north",
      region: "Европейский Север",
      peopleTitle: "Народы Европейского Севера",
      gameTitle: "Поймай оленя",
      gameUrl: "northgame.html",
      photo: "images/gamez/evrsever.jpg",
      video: "https://vkvideo.ru/video-236469097_456239044",
      theme: "frost",
      x: 25,
      y: 20,
      theses: [
        "Знаешь ли ты, что оленеводство для народов Европейского Севера — целая наука? Олень может резко сменить направление, поэтому пастуху особенно важны реакция, точность и внимательность."
      ]
    },
    {
      id: "central-russia",
      region: "Центральная Россия",
      peopleTitle: "Народы Центральной России",
      gameTitle: "Кладовая ремёсел",
      gameUrl: "memory.html",
      photo: "images/gamez/centr.jpg",
      video: "https://vkvideo.ru/video-236469097_456239046",
      theme: "field",
      x: 23,
      y: 47,
      theses: [
        "Знаешь ли ты, что золотой узор хохломы создавали без настоящего золота? А гжельские мастера использовали белую глину, чтобы делать знаменитую сине-белую керамику."
      ]
    },
    {
      id: "volga",
      region: "Поволжье",
      peopleTitle: "Народы Поволжья",
      gameTitle: "Сабантуй",
      gameUrl: "sabantuy.html",
      photo: "images/gamez/povoljie.jpg",
      video: "https://vkvideo.ru/video-236469097_456239047",
      theme: "sun",
      x: 20,
      y: 70,
      theses: [
        "Знаешь ли ты, что Сабантуй изначально был праздником плуга и будущего урожая? На нём устраивали весёлые состязания, которые показывали силу, ловкость и готовность к труду."
      ]
    },
    {
      id: "ural",
      region: "Урал",
      peopleTitle: "Народы Урала",
      gameTitle: "Куреш",
      gameUrl: "kuresh.html",
      photo: "images/gamez/ural.jpg",
      video: "https://vkvideo.ru/video-236469097_456239049",
      theme: "stone",
      x: 35,
      y: 66,
      theses: [
        "Знаешь ли ты, что куреш — древняя борьба, в которой важны не только сила, но и честность? Победить нужно достойно, без грубости и обмана."
      ]
    },
    {
      id: "caucasus",
      region: "Северный Кавказ",
      peopleTitle: "Народы Северного Кавказа",
      gameTitle: "Полёт орла",
      gameUrl: "eagle.html",
      photo: "images/gamez/kavkaz.jpg",
      video: "https://vkvideo.ru/video-236469097_456239048",
      theme: "mountain",
      x: 8,
      y: 70,
      theses: [
        "Знаешь ли ты, что у многих народов Северного Кавказа орёл считается символом чести, достоинства и смелости? Его образ часто встречается в легендах и орнаментах."
      ]
    },
    {
      id: "west-siberia",
      region: "Западная Сибирь",
      peopleTitle: "Народы Западной Сибири",
      gameTitle: "Таёжный путь",
      gameUrl: "taiga.html",
      photo: "images/gamez/zapadsibir.jpg",
      video: "https://vkvideo.ru/video-236469097_456239051",
      theme: "taiga",
      x: 54,
      y: 42,
      theses: [
        "Знаешь ли ты, что народы Западной Сибири умели «читать» тайгу по мху, следам и наклону деревьев? Эти приметы помогали находить дорогу, воду и следы животных."
      ]
    },
    {
      id: "east-siberia",
      region: "Восточная Сибирь",
      peopleTitle: "Народы Восточной Сибири",
      gameTitle: "Кладовая стойбища",
      gameUrl: "kladovka.html",
      photo: "images/gamez/vostsibir.jpg",
      video: "https://vkvideo.ru/video-236469097_456239052",
      theme: "wood",
      x: 70,
      y: 63,
      theses: [
        "Знаешь ли ты, что правильное хранение запасов в стойбище считалось настоящим мастерством? От порядка и выбора подходящего места зависело, сохранятся ли еда, одежда и меха зимой."
      ]
    },
    {
      id: "far-east",
      region: "Дальний Восток",
      peopleTitle: "Народы Дальнего Востока",
      gameTitle: "Большой улов",
      gameUrl: "farfish.html",
      photo: "images/gamez/dalniy.jpg",
      video: "https://vkvideo.ru/video-236469097_456239053",
      theme: "ocean",
      x: 90,
      y: 18,
      theses: [
        "Знаешь ли ты, что рыбаки Дальнего Востока определяли погоду по воде и ветру, а снасти часто делали сами? Успех зависел от терпения, опыта и внимательности."
      ]
    }
  ];

  const markers = document.getElementById("biggame-markers");
  const startButton = document.getElementById("biggame-start-button");
  const popup = document.getElementById("biggame-popup");
  const popupWindow = document.getElementById("biggame-popup-window");
  const popupVideo = document.getElementById("biggame-popup-video");
  const popupRegion = document.getElementById("biggame-popup-region");
  const popupTitle = document.getElementById("biggame-popup-title");
  const popupGame = document.getElementById("biggame-popup-game");
  const popupPhoto = document.getElementById("biggame-popup-photo");
  const popupTheses = document.getElementById("biggame-popup-theses");
  const popupPlay = document.getElementById("biggame-popup-play");
  const popupMethod = document.getElementById("biggame-popup-method");

  let activeVideo = "";

  function createMarkers() {
    if (!markers) return;

    markers.innerHTML = PEOPLES.map((item) => `
      <button class="biggame-marker biggame-marker--${item.theme}" type="button" data-id="${item.id}" style="--marker-x: ${item.x}%; --marker-y: ${item.y}%;">
        <span class="biggame-marker__pin"></span>
        <span class="biggame-marker__photo-wrap">
          <img class="biggame-marker__photo" src="${item.photo}" alt="${item.peopleTitle}" draggable="false" onerror="this.style.display='none'">
        </span>
        <span class="biggame-marker__name">${item.region}</span>
      </button>
    `).join("");
  }

  function openPopup(item) {
    popupWindow.className =
      `biggame-popup__window biggame-popup__window--${item.theme}`;
  
    popupRegion.textContent = item.region;
    popupTitle.textContent = item.peopleTitle;
    popupGame.textContent = item.gameTitle;
  
    popupPhoto.src = item.photo;
    popupPhoto.alt = item.peopleTitle;
  
    popupPlay.href = item.gameUrl;
    popupPlay.textContent = `Играть в «${item.gameTitle}»`;
  
    popupTheses.innerHTML = item.theses
      .map((text) => `<li>${text}</li>`)
      .join("");
  
    activeVideo = normalizeVkPlayerUrl(item.video);
    popupVideo.src = activeVideo;
    
    popupMethod.style.display = "none";

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function openIntroPopup() {
    popupWindow.className =
      "biggame-popup__window biggame-popup__window--sea is-video-only";
  
    popupRegion.textContent = INTRO_VIDEO.label;
    popupTitle.textContent = INTRO_VIDEO.title;
    popupGame.textContent = INTRO_VIDEO.text;
  
    popupMethod.style.display = "inline-flex";
    popupMethod.href = "/materials/metod-rek/11MP.pdf";

    popupPhoto.src = "";
    popupPhoto.alt = "";
  
    activeVideo = normalizeVkPlayerUrl(INTRO_VIDEO.video);
    popupVideo.src = activeVideo;
  
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closePopup() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    popupVideo.src = "";
  }

  createMarkers();

  startButton?.addEventListener("click", openIntroPopup);

  markers?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;

    const item = PEOPLES.find((current) => current.id === button.dataset.id);
    if (item) openPopup(item);
  });

  popup?.addEventListener("click", (event) => {
    if (event.target.closest("[data-biggame-close]")) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup?.classList.contains("is-open")) {
      closePopup();
    }
  });
})();
const nav = document.querySelector(".top-nav");

let lastScroll = 0;

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > lastScroll && current > 5) {
        nav.classList.add("is-hidden");
    } else {
        nav.classList.remove("is-hidden");
    }

    lastScroll = current;
});