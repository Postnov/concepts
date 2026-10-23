// Дарья Гречишкина — моушн концепта. Фирменная идея: «матрица судьбы» вычерчивается за портретом
// (октаграмма и кольцо из 22 чисел), потом медленно живёт и поворачивается вместе с прокруткой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон услуг: работает и без GSAP ---------- */
  function setOpen(item, open, instant, hold) {
    const head = $('.svc__head', item);
    const body = $('.svc__body', item);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('.svc__inner > *', body), { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.1, ease: 'power2.out' });
    } else {
      // Закрывающийся пункт выше нажатого сдвигает страницу — держим нажатый заголовок на месте
      const holdY = hold ? hold.getBoundingClientRect().top : 0;
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onUpdate: hold ? () => { const d = hold.getBoundingClientRect().top - holdY; if (d) window.scrollBy(0, d); } : undefined,
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.svc').forEach(item => {
    $('.svc__head', item).addEventListener('click', () => {
      const open = $('.svc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.svc').forEach(other => other !== item && setOpen(other, false, false, $('.svc__head', item)));
      setOpen(item, open);
    });
  });

  if (!animate) return;

  // Заголовок строками: подъём с проявлением (без маски — хвосты «Д», «Ц» не режутся)
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines' });
    gsap.from(split.lines, {
      yPercent: 55, autoAlpha: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const lines = $$('.mx-l:not(.mx-l--tick)');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.25)
      .from('.stage__glow', { scale: 0.45, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.2)
      // матрица вычерчивается линия за линией
      .from(lines, { strokeDashoffset: 1, duration: 2.4, stagger: 0.11, ease: 'power2.inOut' }, 0.25)
      .from('.mx-l--tick', { autoAlpha: 0, duration: 1.4 }, 1.1)
      .from('.mx-node', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 1.6)
      .from('.mx-n', { autoAlpha: 0, duration: 0.6, stagger: { each: 0.035, from: 'start' } }, 1.2)
      .from('.mx-t', { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.07 }, 1.5)
      // портрет поднимается из-под матрицы
      .fromTo('.portrait', { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.6, ease: 'expo.inOut', transformOrigin: '50% 100%' }, 0.45)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.75)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45);

    // Живая матрица: кольцо чисел и звезда медленно крутятся в разные стороны
    intro.call(() => {
      gsap.to('.mx-ring', { rotation: 360, svgOrigin: '0 0', duration: 170, ease: 'none', repeat: -1 });
      gsap.to('.mx-star', { rotation: -360, svgOrigin: '0 0', duration: 240, ease: 'none', repeat: -1 });
      gsap.to('.stage__glow', { scale: 1.07, autoAlpha: 0.78, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }, null, 2.6);

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-130%' }, { '--shine': '130%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 3 + i });
    });

    /* Прокрутка героя: матрица поворачивается, портрет чуть уходит вверх */
    gsap.to('.matrix', {
      rotation: 38, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
    gsap.to('.portrait', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Доверие ---------- */
    revealLines('.trust h2', '.trust .sec-head');
    fadeUp('.trust .eyebrow', '.trust .sec-head');
    $$('.tcard').forEach(card => {
      const r = '24px';
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      tl.fromTo(card, { clipPath: `inset(0% 100% 0% 0% round ${r})` }, { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.15, ease: 'expo.out' })
        .from($$('.sg', card), { strokeDashoffset: 1, duration: 1.3, stagger: 0.2, ease: 'power2.inOut' }, 0.15)
        .from($('.sg-n', card), { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%', duration: 0.7 }, 0.85)
        .from([$('.tcard__title', card), $('.tcard__text', card)], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.35);
      const count = $('.count', card);
      if (count) {
        const to = +count.dataset.to, o = { v: 0 };
        count.textContent = '0';
        tl.to(o, { v: to, duration: 1.9, ease: 'power2.out', onUpdate: () => { count.textContent = String(Math.round(o.v)); } }, 0.3);
      }
    });

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    fadeUp('.services .eyebrow', '.services .sec-head');
    $$('.svc-group').forEach(g => {
      gsap.fromTo(g, { clipPath: 'inset(0% 100% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: g, start: 'top 90%' },
      });
    });
    const rows = $$('.svc');
    gsap.set(rows, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' });
        gsap.fromTo(els.map(e => $('.svc__line', e)), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.09, ease: 'power3.inOut' });
        gsap.from(els.map(e => $('.svc__price', e)), { x: -10, autoAlpha: 0, duration: 0.7, stagger: 0.09, delay: 0.25, ease: 'power3.out' });
      },
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
