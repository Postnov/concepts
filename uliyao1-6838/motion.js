// Юлия Понятовская — моушн концепта. Идея: учитель проверяет тетрадь красной ручкой —
// линия полей, подчёркивание, кольцо вокруг фото, галочки у каждого материала рисуются на глазах.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Красная галочка рисуется поверх клеточки: stroke-dashoffset 1 → 0 (у путей pathLength=1)
  const drawTicks = (scope, delay = 0) => gsap.fromTo($$('.chk__tick', scope),
    { strokeDashoffset: 1, visibility: 'hidden' }, { strokeDashoffset: 0, visibility: 'visible', duration: 0.55, stagger: 0.1, delay, ease: 'power2.out' });

  /* ---------- аккордеон предметов: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.toc__head', item);
    const body = $('.toc__body', item);
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
      gsap.from($$('.mat', body), { x: -14, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.08, ease: 'power2.out' });
      drawTicks(body, 0.25);
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.toc__item').forEach(item => {
    $('.toc__head', item).addEventListener('click', () => {
      const open = $('.toc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.toc__item').forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen($('.toc__item'), true, true);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, opts = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 84%' }, ...opts,
  });
  // «Пишется от руки»: надпись открывается слева направо
  const write = (targets, vars = {}) => gsap.fromTo(targets,
    { clipPath: 'inset(-30% 100% -40% 0%)' },
    { clipPath: 'inset(-30% -12% -40% -10%)', duration: 0.9, ease: 'power2.inOut', onComplete: () => gsap.set(targets, { clearProps: 'clipPath' }), ...vars });
  const stroke = (targets, vars = {}) => gsap.fromTo(targets,
    { strokeDashoffset: 1, visibility: 'hidden' }, { strokeDashoffset: 0, visibility: 'visible', duration: 0.9, ease: 'power2.inOut', ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: тетрадь разлиновывается, имя пишется ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last-t', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__paper', { autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0.05)
      .from('.hero__margin', { scaleY: 0, duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(first.chars, { yPercent: 115, stagger: 0.03, duration: 0.95, ease: 'expo.out' }, 0.4)
      .from(last.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.55);
    stroke('.underline path', { duration: 0.8, stagger: 0.2, delay: 1.2 });
    intro
      .fromTo('.medal__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.5)
      .from('.medal__photo img', { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.55);
    stroke('.medal__ring path', { duration: 1.3, delay: 1.15 });
    write('.note--years .note__big', { delay: 1.35, duration: 0.8 });
    write('.note--years .note__sm', { delay: 1.8, duration: 0.7 });
    stroke('.note__arrow path', { delay: 2.1, duration: 0.7 });
    write('.note--kids .note__big', { delay: 1.6, duration: 0.8 });
    stroke('.note__loop path', { delay: 2.15, duration: 0.8 });
    write('.note--kids .note__sm', { delay: 2.4, duration: 0.8 });
    intro
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    /* Лёгкий параллакс медальона */
    gsap.to('.medal', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Материалы ---------- */
    revealLines('.materials h2', '.materials .sec-head');
    fadeUp(['.materials .eyebrow', '.materials .sec-sub'], '.materials .sec-head');
    const items = $$('.toc__item');
    gsap.set(items, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.09, ease: 'power3.out' }),
    });
    gsap.to('.toc__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.toc', start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
    // Первый предмет раскрывается сам, чтобы было видно: галочки ставятся на глазах
    ScrollTrigger.create({
      trigger: '.toc__list', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.7, () => setOpen(items[0], true)),
    });

    /* ---------- 3. Полка с пособиями ---------- */
    revealLines('.shelf h2', '.shelf .sec-head');
    fadeUp(['.shelf .eyebrow', '.shelf .sec-sub'], '.shelf .sec-head');
    gsap.from('.spines__li', {
      y: 80, autoAlpha: 0, duration: 1.1, stagger: 0.13, ease: 'expo.out',
      scrollTrigger: { trigger: '.spines', start: 'top 86%' },
    });
    gsap.from('.spines', { borderBottomColor: 'rgba(45,58,140,0)', duration: 1, scrollTrigger: { trigger: '.spines', start: 'top 86%' } });
    gsap.from('.book', { y: 30, autoAlpha: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: '.book', start: 'top 92%' } });
    gsap.from('.book__tag', { clipPath: 'inset(-30% 100% -40% 0%)', duration: 0.9, delay: 0.5, ease: 'power2.inOut', scrollTrigger: { trigger: '.book', start: 'top 90%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
