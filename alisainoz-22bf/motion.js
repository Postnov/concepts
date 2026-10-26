// Алиса Иноземцева — моушн концепта.
// Фирменная идея — «рефрейминг»: медные метки обреза перекадрируют реальность.
// На обложке рамка сходится к фото и время от времени берёт крупный план лица; в темах одна рамка
// ходит по оглавлению за прокруткой (тема в фокусе); в прайсе рамка защёлкивается на диагностике — первом шаге.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, рамки тем скрыты стилями .no-motion

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out', ...vars,
    scrollTrigger: { trigger, start: 'top 86%' },
  });

  MotionBase.ready(() => {
    /* ---------- 1. Обложка: вход ---------- */
    const first = SplitText.create('.cover__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.cover__last', { type: 'words,chars', wordsClass: 'sw' });
    const lines = SplitText.create('.cover__lines li', { type: 'lines', mask: 'lines' });
    const crop = $('.crop--hero');
    const rest = { top: -12, left: -12, right: -12, bottom: -12 };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lines.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.cover__top > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from('.cover__top i', { scaleX: 0, transformOrigin: 'left center', duration: 1, ease: 'expo.out' }, 0.3)
      .from(first.chars, { yPercent: 110, stagger: 0.06, duration: 1.2, ease: 'expo.out' }, 0.3)
      .from(last.chars, { autoAlpha: 0, y: 8, stagger: { each: 0.035, from: 'center' }, duration: 0.7 }, 0.85)
      // Фото открывается из центра, как кадр под обрез
      .fromTo('.cover__photo .frame', { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.45)
      .from('.cover__photo img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.6)
      // Метки обреза съезжаются с широкого кадра к фото
      .fromTo(crop, { top: -54, left: -54, right: -54, bottom: -54, autoAlpha: 0 }, { ...rest, autoAlpha: 1, duration: 1.4, ease: 'expo.inOut' }, 0.7)
      .from('.amp', { autoAlpha: 0, scale: 0.86, rotate: -8, duration: 1.8, ease: 'expo.out' }, 0.8)
      .from(lines.lines, { yPercent: 105, stagger: 0.1, duration: 1, ease: 'expo.out' }, 1.0)
      .from('.cover__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.25);

    // «Рефрейминг» портрета: рамка берёт крупный план лица и возвращается к целому кадру.
    // Координаты в процентах от фото — одинаково на телефоне и десктопе
    const pct = v => `${v}%`;
    gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 4.2 })
      .to(crop, { top: pct(14), left: pct(26), right: pct(24), bottom: pct(30), duration: 1.6, ease: 'expo.inOut' })
      .to(crop, { ...rest, duration: 1.6, ease: 'expo.inOut' }, '+=2.2');

    /* Лёгкий параллакс амперсанда при прокрутке */
    gsap.to('.amp', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Темы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    fadeUp(['.topics .eyebrow', '.topics .sec-sub'], '.topics .sec-head');
    const items = $$('.toc__item');
    // Пункты оглавления: номер выезжает слева, строка — снизу
    gsap.set(items, { autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { autoAlpha: 1, duration: 0.6, stagger: 0.07 });
        gsap.from(els.map(el => $('.toc__num', el)), { x: -16, duration: 0.8, stagger: 0.07, ease: 'expo.out' });
        gsap.from(els.map(el => $('.toc__text', el)), { y: 22, duration: 0.9, stagger: 0.07, ease: 'expo.out' });
      },
    });

    // Одна рамка на всё оглавление: переезжает к теме, которая сейчас на уровне взгляда
    const tcrop = $('.crop--topic');
    const now = $('.topics__now');
    let active = -1;
    const place = (i, duration) => {
      const el = items[i];
      gsap.to(tcrop, { top: el.offsetTop - 4, height: el.offsetHeight + 8, autoAlpha: 1, duration, ease: 'expo.out', overwrite: 'auto' });
    };
    const focus = i => {
      if (i === active) return;
      items.forEach((el, k) => el.classList.toggle('is-on', k === i));
      place(i, active < 0 ? 0.6 : 0.85);
      if (now && getComputedStyle(now.parentElement).display !== 'none') {
        // Номер темы меняется сменой кадра, без счётчика
        gsap.timeline()
          .to(now, { yPercent: -30, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
          .call(() => { now.textContent = String(i + 1).padStart(2, '0'); })
          .fromTo(now, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
      }
      active = i;
    };
    items.forEach((el, i) => ScrollTrigger.create({
      trigger: el, start: 'top 60%', end: 'bottom 60%',
      onToggle: self => self.isActive && focus(i),
    }));
    ScrollTrigger.addEventListener('refresh', () => active >= 0 && place(active, 0));

    /* ---------- 3. Консультации ---------- */
    revealLines('.prices h2', '.prices .sec-head');
    fadeUp(['.prices .eyebrow', '.prices .sec-sub'], '.prices .sec-head');
    $$('.prow').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
      tl.from($('.prow__rule', row), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' })
        .from([$('.prow__num', row), $('.prow__title', row)], { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0.25)
        // Цена появляется целиком, без счётчика
        .from($('.prow__price', row), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.4);
      const meta = $('.prow__meta', row);
      if (meta) tl.from(meta, { autoAlpha: 0, y: 10, duration: 0.7 }, 0.55);
    });
    // Рамка защёлкивается на диагностике
    gsap.fromTo('.crop--price', { top: -26, bottom: -26, left: -30, right: -30, autoAlpha: 0 }, {
      top: 8, bottom: 8, left: -10, right: -10, autoAlpha: 1, duration: 1.3, ease: 'expo.inOut', delay: 0.5,
      scrollTrigger: { trigger: '.prow--first', start: 'top 80%' },
    });
    fadeUp('.terms li', '.prices__side', { x: -12, y: 0 });
    fadeUp('.prices__cta .btn', '.prices__cta');

    /* ---------- финал ---------- */
    revealLines('.concept-end__title', '.concept-end');
    fadeUp(['.concept-end__text', '.concept-end .btn'], '.concept-end', { delay: 0.2 });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
