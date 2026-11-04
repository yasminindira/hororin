/* Horormin Improved Script */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

let videos = [];
let jumpscareEnabled = localStorage.getItem('jumpscare') === 'on';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

async function loadVideos() {
  try {
    const res = await fetch('videos.json');
    videos = await res.json();
  } catch {
    videos = []; // fallback empty
  }
  renderCarousel();
  updateVideoCount();
}

function updateVideoCount() {
  const el = $('#videoCount');
  if (el) el.textContent = videos.length;
}

function renderCarousel() {
  const container = $('#carousel');
  if (!container) return;
  container.innerHTML = videos.map(v => `
    <article class="card" data-id="${v.id}">
      <div class="card__thumb">
        <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
        <button class="fav-btn" data-id="${v.id}">${favorites.includes(v.id) ? '♥' : '♡'}</button>
      </div>
      <div class="card__body">
        <p class="card__channel">${v.channel}</p>
        <h3>${v.title}</h3>
        <p>${v.description}</p>
        <small>Level: ${'★'.repeat(v.fearLevel || 3)} · ${v.category || 'Horor'}</small>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('fav-btn')) return;
      openModal(card.dataset.id);
    });
  });

  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.id, btn);
    });
  });
}

function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    btn.textContent = '♡';
  } else {
    favorites.push(id);
    btn.textContent = '♥';
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function openModal(id) {
  if (jumpscareEnabled) triggerJumpscare();
  const v = videos.find(x => x.id === id);
  if (!v) return;
  const frame = $('#lightboxFrame');
  frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#lightbox').hidden = true;
  $('#lightboxFrame').innerHTML = '';
  document.body.style.overflow = '';
}

function triggerJumpscare() {
  const scare = document.createElement('div');
  scare.className = 'jumpscare';
  scare.innerHTML = '<div class="jumpscare__text">!!!</div>';
  document.body.appendChild(scare);
  setTimeout(() => scare.remove(), 700);
}

function updateJumpscareBtn() {
  const btn = $('#jumpscareToggle');
  if (btn) btn.textContent = `Jumpscare: ${jumpscareEnabled ? 'ON' : 'OFF'}`;
}

function animateTicker() {
  const el = $('#tickerCount');
  if (!el) return;
  let n = parseInt(el.textContent.replace(/\./g, '')) || 1284;
  setInterval(() => {
    n += Math.floor(Math.random() * 3);
    el.textContent = n.toLocaleString('id-ID');
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Welcome
  const welcome = $('#welcome');
  const enterBtn = $('#enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      welcome.classList.add('hidden');
      setTimeout(() => welcome.remove(), 600);
    });
  }

  // Jumpscare toggle
  const jBtn = $('#jumpscareToggle');
  if (jBtn) {
    jBtn.addEventListener('click', () => {
      jumpscareEnabled = !jumpscareEnabled;
      localStorage.setItem('jumpscare', jumpscareEnabled ? 'on' : 'off');
      updateJumpscareBtn();
    });
  }
  updateJumpscareBtn();

  // Modal close
  $('#lightboxClose')?.addEventListener('click', closeModal);
  $('#lightboxBackdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  loadVideos();
  animateTicker();
});
