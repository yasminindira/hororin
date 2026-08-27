/* Horormin — Interactive Script */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let videos = [];
let currentIndex = 0;

/* ---------- Load Data ---------- */
async function loadVideos() {
  try {
    const res = await fetch('videos.json');
    videos = await res.json();
    renderCarousel();
    renderGrid();
    renderDots();
  } catch (err) {
    console.error('Gagal memuat video:', err);
    // Fallback inline data if fetch fails (e.g. file://)
    videos = [
      {
        id: 'p45midl1FbM',
        title: 'BUKU2 TERKUTUK DI DUNIA!',
        channel: 'Nessie Judge',
        description: 'Kisah tentang buku-buku terkutuk paling berbahaya di dunia.',
        thumbnail: 'https://img.youtube.com/vi/p45midl1FbM/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=p45midl1FbM'
      },
      {
        id: '9Z6qLIK1dZ4',
        title: 'CAPEK KERJA DI INDONESIA MAU KABUR AJA DULU',
        channel: 'Hirotada Radifan',
        description: 'Cerita nyata penuh ketegangan tentang dilema kerja.',
        thumbnail: 'https://img.youtube.com/vi/9Z6qLIK1dZ4/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=9Z6qLIK1dZ4'
      },
      {
        id: 'RMJ4kvEf-ws',
        title: 'BEKAS RESTORAN - KHW PART 317',
        channel: 'Nadia Omara',
        description: 'Teror di rumah bekas restoran. Suara anjing & sosok misterius.',
        thumbnail: 'https://img.youtube.com/vi/RMJ4kvEf-ws/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=RMJ4kvEf-ws'
      },
      {
        id: '8pn3u5Zir_I',
        title: 'KISAH MAHASISWA TERSERAM?! NYARIS JADI TUMBAL',
        channel: 'RJL 5 - Fajar Aditya',
        description: 'Mahasiswa tinggal di rumah bekas pesugihan.',
        thumbnail: 'https://img.youtube.com/vi/8pn3u5Zir_I/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=8pn3u5Zir_I'
      },
      {
        id: 'iBc5WHGqwjE',
        title: 'KKN “DESA” ACEH | #NERROR CERITA HOROR #107',
        channel: 'Nessie Judge',
        description: 'Pengalaman KKN di desa terpencil Aceh yang penuh misteri.',
        thumbnail: 'https://img.youtube.com/vi/iBc5WHGqwjE/maxresdefault.jpg',
        url: 'https://www.youtube.com/watch?v=iBc5WHGqwjE'
      }
    ];
    renderCarousel();
    renderGrid();
    renderDots();
  }
}

/* ---------- Render Helpers ---------- */
function cardHTML(v, extraClass = '') {
  return `
    <article class="carousel-card ${extraClass}" data-id="${v.id}" role="button" tabindex="0">
      <div class="card-thumb">
        <img src="${v.thumbnail}" alt="${escapeHTML(v.title)}" loading="lazy" />
        <div class="card-play">
          <span>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </div>
      </div>
      <div class="card-body">
        <p class="card-channel">${escapeHTML(v.channel)}</p>
        <h3 class="card-title">${escapeHTML(v.title)}</h3>
        <p class="card-desc">${escapeHTML(v.description)}</p>
      </div>
    </article>
  `;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCarousel() {
  const carousel = $('#carousel');
  if (!carousel) return;
  carousel.innerHTML = videos.map(v => cardHTML(v)).join('');
  bindCardClicks(carousel);
}

function renderGrid() {
  const grid = $('#grid');
  if (!grid) return;
  grid.innerHTML = videos.map(v => cardHTML(v, 'grid-card')).join('');
  bindCardClicks(grid);
}

function bindCardClicks(container) {
  container.querySelectorAll('[data-id]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });
}

function renderDots() {
  const dots = $('#dots');
  if (!dots) return;
  dots.innerHTML = videos
    .map((_, i) => `<button class="dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`)
    .join('');
  dots.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = +dot.dataset.index;
      scrollToCard(idx);
    });
  });
}

/* ---------- Carousel Controls ---------- */
function scrollToCard(index) {
  const carousel = $('#carousel');
  const cards = carousel.querySelectorAll('.carousel-card');
  if (!cards[index]) return;
  currentIndex = index;
  cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  updateDots();
}

function updateDots() {
  $$('.dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
}

$('#prevBtn')?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + videos.length) % videos.length;
  scrollToCard(currentIndex);
});

$('#nextBtn')?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % videos.length;
  scrollToCard(currentIndex);
});

/* Observe which card is most visible */
function setupCarouselObserver() {
  const carousel = $('#carousel');
  if (!carousel) return;
  const cards = carousel.querySelectorAll('.carousel-card');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const idx = [...cards].indexOf(entry.target);
          if (idx !== -1) {
            currentIndex = idx;
            updateDots();
          }
        }
      });
    },
    { root: carousel, threshold: 0.6 }
  );
  cards.forEach(c => observer.observe(c));
}

/* ---------- Modal ---------- */
const modal = $('#modal');
const modalIframe = $('#modalIframe');
const modalTitle = $('#modalTitle');
const modalChannel = $('#modalChannel');

function openModal(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;
  modalTitle.textContent = v.title;
  modalChannel.textContent = v.channel;
  modalIframe.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.hidden = true;
  modalIframe.src = '';
  document.body.style.overflow = '';
}

$('#modalClose')?.addEventListener('click', closeModal);
$('#modalBackdrop')?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/* ---------- Header scroll ---------- */
const header = $('#header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- Mobile menu ---------- */
const menuToggle = $('#menuToggle');
const nav = $('#nav');

menuToggle?.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  nav?.classList.toggle('open');
});

$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle?.classList.remove('active');
    nav?.classList.remove('open');
  });
});

/* ---------- Active nav on scroll ---------- */
const sections = $$('section[id]');
const navLinks = $$('.nav-link');

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ---------- Counter animation ---------- */
function animateCounters() {
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + (target >= 10 ? '+' : '');
    }
    requestAnimationFrame(tick);
  });
}

const heroObserver = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      heroObserver.disconnect();
    }
  },
  { threshold: 0.4 }
);
const hero = $('.hero');
if (hero) heroObserver.observe(hero);

/* ---------- Contact form ---------- */
$('#contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  showToast(`Terima kasih, ${name}! Ceritamu sudah kami terima (demo).`);
  form.reset();
});

function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 3200);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  await loadVideos();
  // slight delay so cards exist for observer
  setTimeout(setupCarouselObserver, 100);
});
