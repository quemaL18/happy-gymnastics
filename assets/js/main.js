// ===== AUTO PRELOADER (min 0.8s) =====

(function () {
  const start = Date.now();
  const minDuration = 800; // 0.8 секунды

  const preloader = document.createElement('div');
  preloader.className = 'preloader';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  preloader.appendChild(spinner);
  document.documentElement.appendChild(preloader);

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(minDuration - elapsed, 0);

    setTimeout(() => {
      preloader.classList.add('hide');
      setTimeout(() => preloader.remove(), 500);
    }, remaining);
  });
})();


const prefersReducedMotion =
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const burger = document.querySelector('[data-burger]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (burger && mobileNav) {
  burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) mobileNav.classList.remove('open');
  });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;

  const id = a.getAttribute('href');
  const el = document.querySelector(id);

  if (el) {
    e.preventDefault();
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    history.pushState(null, '', id);
  }
});

document.querySelectorAll('.acc button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const acc = btn.closest('.acc');
    acc.classList.toggle('open');
  });
});

const modal = document.querySelector('[data-modal]');
const modalImg = document.querySelector('[data-modal-img]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalClose = document.querySelector('[data-modal-close]');

function openModal(src, title) {
  if (!modal || !modalImg) return;
  modalImg.src = src;
  if (modalTitle) modalTitle.textContent = title || 'Фото';
  modal.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.documentElement.style.overflow = '';
  if (modalImg) modalImg.src = '';
}

document.querySelectorAll('[data-g-item]').forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    const cap =
      card.getAttribute('data-title') ||
      (card.querySelector('.cap')?.textContent ?? 'Фото');

    if (img) openModal(img.src, cap);
  });
});

if (modalClose) modalClose.addEventListener('click', closeModal);

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('form[data-form]').forEach((form) => {
  let msg = form.querySelector('.formMsg');

  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'formMsg';
    form.appendChild(msg);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.classList.remove('show', 'ok', 'err');
    msg.textContent = '';

    const required = form.querySelectorAll('[required]');
    for (const el of required) {
      if (!String(el.value || '').trim()) {
        el.focus();
        msg.classList.add('show', 'err');
        msg.textContent = 'Заполни, пожалуйста, обязательные поля.';
        return;
      }
    }

    msg.classList.add('show', 'ok');
    msg.textContent = 'Спасибо! Заявка принята.';
    form.reset();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  /* ===== ГЛОБАЛЬНЫЕ ПУЗЫРЬКИ (РАБОЧАЯ ВЕРСИЯ) ===== */
  const wrap = document.createElement('div');
  wrap.className = 'global-bubbles';
  document.body.prepend(wrap);

  const bubbleCount = 18;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('span');

    const size = Math.random() * 30 + 15; // 15px – 45px
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15; // 15–35 секунд
    const delay = Math.random() * 10;

    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = left + '%';
    bubble.style.animationDuration = duration + 's';
    bubble.style.animationDelay = delay + 's';

    wrap.appendChild(bubble);
  }

  /* ===== compact header on scroll (shrink) ===== */
  const header = document.querySelector('.topbar');
  if (header) {
    window.addEventListener(
      'scroll',
      () => {
        const max = 120;
        const progress = Math.min(window.scrollY / max, 1);
        header.style.setProperty('--shrink', progress);
      },
      { passive: true }
    );
  }

  /* ===== topbar scrolled class ===== */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = () => {
      if (window.scrollY > 20) topbar.classList.add('topbar--scrolled');
      else topbar.classList.remove('topbar--scrolled');
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===== nav wheel horizontal scroll ===== */
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          nav.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  /* ===== auto active link ===== */
  const links = document.querySelectorAll('.nav a');
  const path = location.pathname.split('/').pop() || 'index.html';

  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });

  /* ===== reveal (единственный, без дубля) ===== */
  const revealTargets = [
    '.section__head',
    '.card',
    '.tile',
    '.person',
    '.g-item',
    '.tableWrap',
    '.accordion .acc'
  ].join(',');

  const nodes = Array.from(document.querySelectorAll(revealTargets));
  nodes.forEach((el) => el.classList.add('reveal'));

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    nodes.forEach((el) => io.observe(el));
  } else {
    nodes.forEach((el) => el.classList.add('in'));
  }
});
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.add('hide');
  }, 600);
})
(function(){
  const ribbon = document.querySelector('[data-br]');
  if(!ribbon) return;

  const prev = document.querySelector('[data-br-prev]');
  const next = document.querySelector('[data-br-next]');

  const step = () => Math.min(420, ribbon.clientWidth * 0.8);

  const upd = () => {
    if(prev) prev.disabled = ribbon.scrollLeft <= 2;
    const max = ribbon.scrollWidth - ribbon.clientWidth - 2;
    if(next) next.disabled = ribbon.scrollLeft >= max;
  };

  if(prev) prev.addEventListener('click', ()=> ribbon.scrollBy({ left: -step(), behavior:"smooth" }));
  if(next) next.addEventListener('click', ()=> ribbon.scrollBy({ left:  step(), behavior:"smooth" }));

  ribbon.addEventListener('scroll', upd);

  // колесико мыши -> горизонтальный скролл
  ribbon.addEventListener('wheel', (e)=>{
    if(Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    ribbon.scrollBy({ left: e.deltaY, behavior:"auto" });
  }, {passive:false});

  window.addEventListener('resize', upd);
  upd();
})();