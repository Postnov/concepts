// Екатерина — моушн концепта. Спокойный ритм: «дыхание» за фото, мягкие раскрытия, без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон запросов: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
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
        height: 'auto', duration: 0.55, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('li', body), { x: -12, autoAlpha: 0, duration: 0.45, stagger: 0.045, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.acc__item').forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.acc__item').forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen($('.acc__item'), true, true);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.32, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.breath', { scale: 0.6, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.6)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    /* «Дыхание»: 4 секунды вдох, 4 выдох; подпись меняется в такт */
    const label = $('.breath__label');
    const swap = text => gsap.to(label, {
      autoAlpha: 0, duration: 0.25,
      onComplete: () => { label.textContent = text; gsap.to(label, { autoAlpha: 1, duration: 0.35 }); },
    });
    gsap.timeline({ repeat: -1, delay: 1.8 })
      .call(() => swap('вдох'))
      .to('.breath__ring', { scale: 1.1, duration: 4, ease: 'sine.inOut', stagger: 0.25 })
      .call(() => swap('выдох'))
      .to('.breath__ring', { scale: 0.94, duration: 4, ease: 'sine.inOut', stagger: 0.25 });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from(['.topics .eyebrow', '.topics .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' },
    });
    const items = $$('.acc__item');
    gsap.set(items, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }),
    });
    gsap.to('.topics__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.topics__list', start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
    // Первый пункт раскрывается сам, чтобы было видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.6, () => setOpen(items[0], true)),
    });

    /* ---------- 3. Условия ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.formats__grid', start: 'top 80%' } })
      .fromTo('.formats__photo .frame',
        { clipPath: 'inset(0% 0% 100% 0% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.formats__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15);
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.cards', start: 'top 86%' },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: 100 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });
    gsap.from('.terms', { x: -12, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.terms', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
