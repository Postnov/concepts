// Елена Чурина — моушн концепта. Идея: «иммунные клетки» — кольца с клетками вращаются вокруг портрета,
// по рельсе программы катится клетка и зажигает путь, пока читаешь модули.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон модулей: работает и без GSAP ---------- */
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
      gsap.from($$('.acc__in > *', body), { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.08, delay: 0.08, ease: 'power2.out' });
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

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.4, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.orbit__ring', { scale: 0.5, autoAlpha: 0, duration: 1.4, stagger: 0.15, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__years', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.1)
      .from('.hero__btns .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2);

    /* Кольца с клетками вращаются в разные стороны с разной скоростью */
    [[1, 1, 46], [2, -1, 70], [3, 1, 110]].forEach(([n, dir, t]) => {
      gsap.to(`.orbit__ring--${n}`, { rotation: dir * 360, duration: t, ease: 'none', repeat: -1 });
    });
    gsap.to('.cell--a, .cell--d', { scale: 1.25, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--ghost-light):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    gsap.to('.hero__photo', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Программа ---------- */
    revealLines('.program h2', '.program .sec-head');
    gsap.from('.program .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.program .sec-head', start: 'top 82%' } });
    const items = $$('.acc__item');
    gsap.set(items, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }),
    });
    // Клетка катится по рельсе и зажигает путь
    const railTrig = { trigger: '.program__list', start: 'top 70%', end: 'bottom 60%', scrub: true };
    gsap.to('.program__rail > span', { scaleY: 1, ease: 'none', scrollTrigger: railTrig });
    gsap.fromTo('.cell--rail', { top: '0%' }, { top: '100%', ease: 'none', scrollTrigger: railTrig });
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.6, () => setOpen(items[0], true)),
    });
    gsap.from('.program__cta .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.program__cta', start: 'top 92%' } });

    /* ---------- 3. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.cards', start: 'top 86%' },
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
