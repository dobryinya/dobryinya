(function () {
    "use strict";
  
    function initHelpModal() {
      const modal = document.querySelector("[data-help-modal]");
  
      if (!(modal instanceof HTMLElement)) {
        return;
      }
  
      function openModal() {
        modal.hidden = false;
        document.body.classList.add("game-modal-open");
      }
  
      function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("game-modal-open");
      }
  
      document.addEventListener("click", function (event) {
        const target = event.target;
  
        if (!(target instanceof HTMLElement)) {
          return;
        }
  
        if (target.closest("[data-help-open]")) {
          openModal();
          return;
        }
  
        if (target.closest("[data-help-close]")) {
          closeModal();
        }
      });
  
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
          closeModal();
        }
      });
    }
  
    function init() {
      initHelpModal();
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();(function () {
  "use strict";

  function initHelpModal() {
    const modal = document.querySelector("[data-help-modal]");

    if (!(modal instanceof HTMLElement)) {
      return;
    }

    function openModal() {
      modal.hidden = false;
      document.body.classList.add("game-modal-open");
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("game-modal-open");
    }

    document.addEventListener("click", function (event) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest("[data-help-open]")) {
        openModal();
        return;
      }

      if (target.closest("[data-help-close]")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function init() {
    initHelpModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();