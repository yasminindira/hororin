/* ==========================================================================
   HORORMIN — main.js
   Handles: video data loading, carousel rendering + controls, lightbox
   player, live-viewer ticker, mobile nav, newsletter form, scroll reveals.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Fallback data (used if js/videos.json can't be fetched, e.g. when the
     page is opened directly from disk without a local server).
  --------------------------------------------------------------------- */
  const FALLBACK_VIDEOS = [
    { id: "p45midl1FbM", fallbackTitle: "Cerita Horor Malam #1", tag: "Kisah Nyata", fearLevel: 4 },
    { id: "9Z6qLIK1dZ4", fallbackTitle: "Cerita Horor Malam #2", tag: "Penampakan", fearLevel: 5 },
    { id: "RMJ4kvEf-ws", fallbackTitle: "Cerita Horor Malam #3", tag: "Misteri", fearLevel: 3 },
    { id: "8pn3u5Zir_I", fallbackTitle: "Cerita Horor Malam #4", tag: "Rumah Angker", fearLevel: 5 },
    { id: "iBc5WHGqwjE", fallbackTitle: "Cerita Horor Malam #5", tag: "Urban Legend", fearLevel: 4 }
  ];

  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const lightbox = document.getElementById("lightbox");
  const lightboxFrame = document.getElementById("lightboxFrame");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxBackdrop = document.getElementById("lightboxBackdrop");

  let lastFocusedEl = null;

  /* ---------------------------------------------------------------------
     Build a "blood drop" fear-level rating, e.g. 4/5
  --------------------------------------------------------------------- */
  function dropIcon(filled) {
    return (
      '<span class="drop' + (filled ? " is-full" : "") + '">' +
      '<svg viewBox="0 0 10 12"><path fill="currentColor" d="M5 0C3 4 0 6.5 0 8.8a5 5 0 0 0 10 0C10 6.5 7 4 5 0Z"/></svg>' +
      "</span>"
    );
  }
  function fearRatingHTML(level) {
    let html = '<span class="card__fear-label">Tingkat Serem</span>';
    for (let i = 1; i <= 5; i++) html += dropIcon(i <= level);
    return html;
  }

  /* ---------------------------------------------------------------------
     Render carousel cards
  --------------------------------------------------------------------- */
  function renderCards(videos) {
    track.innerHTML = videos
      .map(function (v, i) {
        const thumb = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";
        return (
          '<li class="card reveal" data-index="' + i + '" data-id="' + v.id + '">' +
            '<button class="card__media" data-open="' + v.id + '" aria-label="Putar: ' + v.fallbackTitle + '">' +
              '<span class="card__tag">' + v.tag + "</span>" +
              '<img src="' + thumb + '" alt="Thumbnail video: ' + v.fallbackTitle + '" loading="lazy" width="480" height="270">' +
              '<span class="card__play" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
              "</span>" +
            "</button>" +
            '<div class="card__body">' +
              '<h3 class="card__title" data-title-for="' + v.id + '">' + v.fallbackTitle + "</h3>" +
              '<p class="card__channel" data-channel-for="' + v.id + '">Horormin &middot; Arsip Malam</p>' +
              '<div class="card__fear">' + fearRatingHTML(v.fearLevel) + "</div>" +
            "</div>" +
          "</li>"
        );
      })
      .join("");

    // dots
    dotsWrap.innerHTML = videos
      .map(function (_, i) {
        return '<button data-dot="' + i + '" aria-label="Ke video ' + (i + 1) + '"></button>';
      })
      .join("");

    initReveal();
  }

  /* ---------------------------------------------------------------------
     Progressive enhancement: fetch real titles/authors via noembed
     (public CORS-friendly oEmbed proxy for YouTube). Falls back silently
     if offline or blocked.
  --------------------------------------------------------------------- */
  function upgradeMetadata(videos) {
    videos.forEach(function (v) {
      fetch("https://noembed.com/embed?url=https://www.youtube.com/watch?v=" + v.id + "&format=json")
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          if (!data || data.error) return;
          const titleEl = document.querySelector('[data-title-for="' + v.id + '"]');
          const channelEl = document.querySelector('[data-channel-for="' + v.id + '"]');
          if (titleEl && data.title) titleEl.textContent = data.title;
          if (channelEl && data.author_name) channelEl.textContent = data.author_name;
        })
        .catch(function () { /* silent fallback, keep placeholder text */ });
    });
  }

  /* ---------------------------------------------------------------------
     Carousel controls
  --------------------------------------------------------------------- */
  function cardWidth() {
    const card = track.querySelector(".card");
    if (!card) return 340;
    const style = getComputedStyle(track);
    return card.getBoundingClientRect().width + parseFloat(style.gap || 24);
  }

  function scrollByCards(n) {
    track.scrollBy({ left: n * cardWidth(), behavior: "smooth" });
  }

  function updateDots() {
    const cards = Array.from(track.children);
    if (!cards.length) return;
    const trackRect = track.getBoundingClientRect();
    let closest = 0;
    let minDist = Infinity;
    cards.forEach(function (card, i) {
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left - trackRect.left);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    Array.from(dotsWrap.children).forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === closest);
    });
  }

  function initCarouselControls() {
    prevBtn.addEventListener("click", function () { scrollByCards(-1); });
    nextBtn.addEventListener("click", function () { scrollByCards(1); });

    dotsWrap.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-dot]");
      if (!btn) return;
      const idx = Number(btn.getAttribute("data-dot"));
      const card = track.children[idx];
      if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    });

    let ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateDots(); ticking = false; });
    });

    // mouse-drag support (desktop trackpads/mice)
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      isDown = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      track.addEventListener(evt, function () { isDown = false; });
    });
    // suppress the click-to-open when the user was actually dragging
    track.addEventListener(
      "click",
      function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      },
      true
    );

    updateDots();
  }

  /* ---------------------------------------------------------------------
     Lightbox
  --------------------------------------------------------------------- */
  function openLightbox(videoId) {
    lastFocusedEl = document.activeElement;
    lightboxFrame.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0" ' +
      'title="Pemutar video Horormin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxFrame.innerHTML = ""; // stop playback
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function initLightbox() {
    track.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-open]");
      if (!trigger) return;
      openLightbox(trigger.getAttribute("data-open"));
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxBackdrop.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---------------------------------------------------------------------
     Live viewer ticker (atmospheric, client-side only — random walk)
  --------------------------------------------------------------------- */
  function initTicker() {
    const el = document.getElementById("tickerCount");
    if (!el) return;
    let count = 1284;
    setInterval(function () {
      count += Math.floor(Math.random() * 9) - 3;
      if (count < 900) count = 900;
      el.textContent = count.toLocaleString("id-ID");
    }, 2800);
  }

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  function initNav() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Newsletter form (front-end only demo)
  --------------------------------------------------------------------- */
  function initForm() {
    const form = document.getElementById("joinForm");
    const msg = document.getElementById("ctaMsg");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("emailInput").value.trim();
      if (!email) return;
      msg.textContent = "Kamu sudah masuk daftar, " + email.split("@")[0] + ". Sampai jumpa minggu depan — semoga bisa tidur nyenyak.";
      form.reset();
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Init
  --------------------------------------------------------------------- */
  function boot(videos) {
    renderCards(videos);
    initCarouselControls();
    initLightbox();
    upgradeMetadata(videos);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("year").textContent = new Date().getFullYear();
    initNav();
    initTicker();
    initForm();
    initReveal();

    fetch("js/videos.json")
      .then(function (res) { if (!res.ok) throw new Error("no json"); return res.json(); })
      .then(function (data) { boot(data); })
      .catch(function () { boot(FALLBACK_VIDEOS); });
  });
})();
