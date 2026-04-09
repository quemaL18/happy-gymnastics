const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
(function () {
  const start = Date.now();
  const minDuration = 1800;

  const preloader = document.createElement('div');
  preloader.className = 'preloader';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  preloader.appendChild(spinner);
  document.body.prepend(preloader);

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(minDuration - elapsed, 0);

    setTimeout(() => {
      preloader.classList.add('hide');

      setTimeout(() => {
        preloader.remove();
      }, 1400);
    }, remaining);
  });
})();
const burger = document.querySelector('[data-burger]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
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
    if (acc) acc.classList.toggle('open');
  });
});
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
// ===== MODAL GALLERY =====
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
      card.querySelector('.cap')?.textContent ||
      'Фото';

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

function ensureFormMessage(form) {
  let msg = form.querySelector('.formMsg');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'formMsg';
    form.appendChild(msg);
  }
  return msg;
}

function showFormMessage(msg, type, text) {
  msg.classList.remove('show', 'ok', 'err');
  void msg.offsetWidth;
  msg.textContent = text;
  msg.classList.add('show', type);
}

function getValue(formData, ...names) {
  for (const name of names) {
    const value = formData.get(name);
    if (value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function validateRequiredFields(form) {
  const required = form.querySelectorAll('[required]');
  for (const el of required) {
    if (el.type === 'checkbox') {
      if (!el.checked) {
        el.focus();
        return false;
      }
    } else if (!String(el.value || '').trim()) {
      el.focus();
      return false;
    }
  }
  return true;
}

document.querySelectorAll('form[data-form]').forEach((form) => {
  const msg = ensureFormMessage(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateRequiredFields(form)) {
      showFormMessage(msg, 'err', 'Заполни, пожалуйста, обязательные поля.');
      return;
    }

    const raw = new FormData(form);

    const payload = new FormData();
    payload.append('parent_name', getValue(raw, 'parent_name', 'parent', 'name'));
    payload.append('phone', getValue(raw, 'phone'));
    payload.append('child_name', getValue(raw, 'child_name', 'child'));
    payload.append('child_age', getValue(raw, 'child_age', 'age'));
    payload.append('direction', getValue(raw, 'direction', 'interest', 'goal', 'format'));
    payload.append('comment', getValue(raw, 'comment'));

    if (!payload.get('parent_name') || !payload.get('phone')) {
      showFormMessage(msg, 'err', 'Не удалось определить обязательные поля формы.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const oldBtnText = submitBtn ? submitBtn.textContent : '';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
      }

      const response = await fetch('save_application.php', {
        method: 'POST',
        body: payload
      });

      const result = await response.json();

      if (result.success) {
        showFormMessage(msg, 'ok', 'Спасибо! Заявка сохранена.');
        form.reset();
      } else {
        showFormMessage(
          msg,
          'err',
          result.error || result.message || 'Не удалось сохранить заявку.'
        );
      }
    } catch (error) {
      showFormMessage(msg, 'err', 'Ошибка соединения с сервером.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldBtnText;
      }
    }
  });
});

const payForm = document.querySelector('[data-pay-form]');

if (payForm) {
  const payMsg = payForm.querySelector('[data-pay-msg]') || ensureFormMessage(payForm);
  const payBadge = document.querySelector('[data-pay-badge]');
  const fillDemoBtn = document.querySelector('[data-fill-demo]');
  const resetBtn = document.querySelector('[data-reset]');

  const fakePaymentBox = document.querySelector('#fake-payment-box');
  const fakePaymentAmount = document.querySelector('#fake-payment-amount');
  const fakePaymentId = document.querySelector('#fake-payment-id');
  const fakePaymentQr = document.querySelector('#fake-payment-qr');
  const fakePaymentStatusText = document.querySelector('#fake-payment-status-text');
  const fakePaymentStatusBadge = document.querySelector('#fake-payment-status-badge');
  const confirmPaymentBtn = document.querySelector('#confirm-payment-btn');
  const cancelPaymentBtn = document.querySelector('#cancel-payment-btn');

  let currentPayment = null;

  function resetFakePaymentBox() {
    currentPayment = null;

    if (fakePaymentBox) fakePaymentBox.style.display = 'none';
    if (fakePaymentAmount) fakePaymentAmount.textContent = '—';
    if (fakePaymentId) fakePaymentId.textContent = '—';
    if (fakePaymentQr) fakePaymentQr.src = '';
    if (fakePaymentStatusText) fakePaymentStatusText.textContent = 'Ожидание оплаты';
    if (fakePaymentStatusBadge) fakePaymentStatusBadge.textContent = 'ожидание оплаты';
    if (confirmPaymentBtn) confirmPaymentBtn.disabled = false;
  }

  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      const demo = {
        child_fio: 'Петрова Алиса Сергеевна',
        age: '8',
        parent_fio: 'Петров Сергей Иванович',
        plan: '8 занятий',
        amount: '2000',
        email: 'demo@mail.ru'
      };

      Object.entries(demo).forEach(([name, value]) => {
        const field = payForm.querySelector(`[name="${name}"]`);
        if (field) field.value = value;
      });

      const consent = payForm.querySelector('[name="consent"]');
      if (consent) consent.checked = true;

      if (payBadge) payBadge.textContent = 'форма заполнена';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      payForm.reset();
      resetFakePaymentBox();
      if (payBadge) payBadge.textContent = 'ожидает заполнения';
      payMsg.classList.remove('show', 'ok', 'err');
      payMsg.textContent = '';
    });
  }

  payForm.addEventListener('input', () => {
    if (!payBadge) return;

    const child = payForm.querySelector('[name="child_fio"]')?.value.trim();
    const parent = payForm.querySelector('[name="parent_fio"]')?.value.trim();
    const plan = payForm.querySelector('[name="plan"]')?.value.trim();
    const amount = payForm.querySelector('[name="amount"]')?.value.trim();

    if (child || parent || plan || amount) {
      payBadge.textContent = 'данные введены';
    } else {
      payBadge.textContent = 'ожидает заполнения';
    }
  });

  payForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateRequiredFields(payForm)) {
      showFormMessage(payMsg, 'err', 'Заполни, пожалуйста, обязательные поля.');
      return;
    }

    const raw = new FormData(payForm);
    const payload = new FormData();

    payload.append('child_fio', getValue(raw, 'child_fio'));
    payload.append('parent_fio', getValue(raw, 'parent_fio'));
    payload.append('plan', getValue(raw, 'plan'));
    payload.append('amount', getValue(raw, 'amount'));
    payload.append('email', getValue(raw, 'email'));

    const submitBtn =
      payForm.querySelector('[data-pay-submit]') ||
      payForm.querySelector('button[type="submit"]');

    const oldBtnText = submitBtn ? submitBtn.textContent : '';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Создание платежа...';
      }

      if (payBadge) payBadge.textContent = 'создание платежа';

      const response = await fetch('save_payment.php', {
        method: 'POST',
        body: payload
      });

      const result = await response.json();

      if (!result.success) {
        showFormMessage(
          payMsg,
          'err',
          result.error || result.message || 'Не удалось создать платёж.'
        );
        if (payBadge) payBadge.textContent = 'ошибка платежа';
        return;
      }

      currentPayment = {
        id: result.payment_id,
        token: result.payment_token,
        amount: result.amount
      };

      if (fakePaymentAmount) fakePaymentAmount.textContent = result.amount;
      if (fakePaymentId) fakePaymentId.textContent = result.payment_id;
      if (fakePaymentStatusText) fakePaymentStatusText.textContent = 'Ожидание оплаты';
      if (fakePaymentStatusBadge) fakePaymentStatusBadge.textContent = 'ожидание оплаты';

      if (fakePaymentQr) {
        fakePaymentQr.src =
          'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' +
          encodeURIComponent('DEMO_PAYMENT_' + result.payment_id + '_' + result.payment_token);
      }

      if (fakePaymentBox) fakePaymentBox.style.display = 'block';
      if (payBadge) payBadge.textContent = 'ожидание оплаты';

      showFormMessage(payMsg, 'ok', 'Платёж создан. Подтверди оплату ниже.');
    } catch (error) {
      showFormMessage(payMsg, 'err', 'Ошибка соединения с сервером.');
      if (payBadge) payBadge.textContent = 'ошибка платежа';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldBtnText;
      }
    }
  });

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', async () => {
      if (!currentPayment) return;

      try {
        confirmPaymentBtn.disabled = true;

        const confirmData = new FormData();
        confirmData.append('payment_id', currentPayment.id);
        confirmData.append('payment_token', currentPayment.token);

        const response = await fetch('confirm_payment.php', {
          method: 'POST',
          body: confirmData
        });

        const result = await response.json();

        if (result.success) {
          if (fakePaymentStatusText) fakePaymentStatusText.textContent = 'Оплачено';
          if (fakePaymentStatusBadge) fakePaymentStatusBadge.textContent = 'оплачено';
          if (payBadge) payBadge.textContent = 'оплачено';

          showFormMessage(payMsg, 'ok', 'Оплата успешно подтверждена.');
          payForm.reset();
        } else {
          showFormMessage(
            payMsg,
            'err',
            result.error || result.message || 'Не удалось подтвердить оплату.'
          );
          confirmPaymentBtn.disabled = false;
        }
      } catch (error) {
        showFormMessage(payMsg, 'err', 'Ошибка соединения с сервером.');
        confirmPaymentBtn.disabled = false;
      }
    });
  }

  if (cancelPaymentBtn) {
    cancelPaymentBtn.addEventListener('click', () => {
      resetFakePaymentBox();
      if (payBadge) payBadge.textContent = 'ожидает заполнения';
      showFormMessage(payMsg, 'err', 'Оплата отменена.');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.createElement('div');
  wrap.className = 'global-bubbles';
  document.body.prepend(wrap);

  const bubbleCount = 18;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('span');

    const size = Math.random() * 30 + 15;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 10;

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    wrap.appendChild(bubble);
  }

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

  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = () => {
      if (window.scrollY > 20) topbar.classList.add('topbar--scrolled');
      else topbar.classList.remove('topbar--scrolled');
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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

  const links = document.querySelectorAll('.nav a');
  const path = location.pathname.split('/').pop() || 'index.html';

  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });

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


(function () {
  const wrap = document.querySelector('.benefitWrap');
  if (!wrap) return;

  const ribbon = wrap.querySelector('[data-br]');
  if (!ribbon) return;

  const prev = wrap.querySelector('[data-br-prev]');
  const next = wrap.querySelector('[data-br-next]');

  const step = () => Math.min(420, ribbon.clientWidth * 0.85);

  const upd = () => {
    if (prev) prev.disabled = ribbon.scrollLeft <= 2;
    const max = ribbon.scrollWidth - ribbon.clientWidth - 2;
    if (next) next.disabled = ribbon.scrollLeft >= max;
  };

  if (prev) {
    prev.addEventListener('click', () => {
      ribbon.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      ribbon.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }

  ribbon.addEventListener('scroll', upd, { passive: true });

  ribbon.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      ribbon.scrollBy({ left: e.deltaY, behavior: 'auto' });
    },
    { passive: false }
  );

  window.addEventListener('resize', upd, { passive: true });
  upd();
})();