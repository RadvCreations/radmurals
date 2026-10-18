/* Small, dependency-free behaviors. Everything degrades gracefully
   if JS fails to load: the gallery shows all pieces, images stay
   visible, nothing is hidden behind a script. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Gallery filtering ---------- */
  function initFilters() {
    var bar = document.querySelector("[data-filters]");
    if (!bar) return;
    var tiles = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));

    bar.addEventListener("click", function (event) {
      var button = event.target.closest(".filter");
      if (!button) return;

      var category = button.dataset.filter;

      bar.querySelectorAll(".filter").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });

      tiles.forEach(function (tile) {
        var match = category === "all" || tile.dataset.category === category;
        tile.hidden = !match;
      });
    });
  }

  /* ---------- Lightbox ----------
     data-full can hold one path or a comma-separated list.
     With more than one, prev/next arrows, arrow keys, and swipe
     step through them. */
  function initLightbox() {
    var tiles = document.querySelectorAll("button.tile");
    if (!tiles.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close image">&times;</button>' +
      '<button class="lightbox__full" type="button" aria-label="Toggle full screen">&#x26F6;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">&lsaquo;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">&rsaquo;</button>';
    document.body.appendChild(box);

    var image = box.querySelector("img");
    var caption = box.querySelector("figcaption");
    var closeButton = box.querySelector(".lightbox__close");
    var prevButton = box.querySelector(".lightbox__nav--prev");
    var nextButton = box.querySelector(".lightbox__nav--next");
    var fullButton = box.querySelector(".lightbox__full");

    /* Full screen: uses the browser's real fullscreen where it exists
       (desktop, Android, iPad). iPhone Safari doesn't allow it for
       anything but video, so there the CSS class alone fills the
       viewport and hides the chrome, which looks nearly the same. */
    function isFull() { return box.classList.contains("lightbox--full"); }

    function enterFull() {
      box.classList.add("lightbox--full");
      if (box.requestFullscreen) {
        box.requestFullscreen().catch(function () {});
      } else if (box.webkitRequestFullscreen) {
        box.webkitRequestFullscreen();
      }
    }

    function exitFull() {
      box.classList.remove("lightbox--full");
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) {
        if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }

    function toggleFull() { if (isFull()) exitFull(); else enterFull(); }

    // If the person leaves real fullscreen with Esc or a system gesture, drop the class too
    ["fullscreenchange", "webkitfullscreenchange"].forEach(function (evt) {
      document.addEventListener(evt, function () {
        if (!(document.fullscreenElement || document.webkitFullscreenElement)) {
          box.classList.remove("lightbox--full");
        }
      });
    });

    var lastFocused = null;
    var images = [];
    var index = 0;
    var baseCaption = "";

    function render() {
      image.src = images[index];
      var multi = images.length > 1;
      caption.textContent = multi
        ? baseCaption + "  (" + (index + 1) + " / " + images.length + ")"
        : baseCaption;
      prevButton.hidden = !multi;
      nextButton.hidden = !multi;

      // Warm the next image so stepping feels instant
      if (multi) {
        var preload = new Image();
        preload.src = images[(index + 1) % images.length];
      }
    }

    function step(delta) {
      if (images.length < 2) return;
      index = (index + delta + images.length) % images.length;
      render();
    }

    function open(tile) {
      var source = tile.querySelector("img");
      var list = (source.dataset.full || "")
        .split(",")
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      images = list.length ? list : [source.src];
      index = 0;
      baseCaption = tile.dataset.caption || source.alt;
      image.alt = source.alt;
      render();

      lastFocused = tile;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton.focus();
    }

    function close() {
      exitFull();
      box.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () { open(tile); });
    });

    closeButton.addEventListener("click", close);
    prevButton.addEventListener("click", function () { step(-1); });
    nextButton.addEventListener("click", function () { step(1); });
    fullButton.addEventListener("click", toggleFull);
    image.addEventListener("click", toggleFull);

    box.addEventListener("click", function (event) {
      if (event.target === box) close();
    });

    document.addEventListener("keydown", function (event) {
      if (box.hidden) return;
      if (event.key === "Escape") { if (isFull()) exitFull(); else close(); }
      else if (event.key === "f" || event.key === "F") toggleFull();
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    });

    // Swipe on touch screens
    var touchX = null;
    box.addEventListener("touchstart", function (event) {
      touchX = event.touches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (event) {
      if (touchX === null) return;
      var dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      touchX = null;
    });
  }

  /* ---------- Mark the current page in the nav ---------- */
  function initCurrentNav() {
    var page = document.body.dataset.page;
    if (!page) return;
    var link = document.querySelector('.nav a[data-nav="' + page + '"]');
    if (link) link.setAttribute("aria-current", "page");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCurrentNav();
    initReveal();
    initFilters();
    initLightbox();
  });
})();