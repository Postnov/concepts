// Виктория Шошева — моушн концепта. Фирменная идея: «бланк анализов» — маркеры на шкалах
// выезжают из красной зоны и встают в зону нормы (олива), а графы бланка отмечаются галочками.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон услуг: работает и без GSAP ---------- */
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
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('.acc__cols > div, .acc__cta', body), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.07, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
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
    if ($('.acc__item')) setOpen($('.acc__item'), true, true);
    return;
  }

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Шкала: маркер из красной зоны слева въезжает в норму; потом слегка «дышит» внутри неё, как живой показатель
  const TOMATO = '#c9553c';
  const OLIVE = '#556622';
  function settle(track, i, at) {
    const dot = $('.scale__dot', track);
    const norm = $('.scale__norm', track);
    const target = [0.66, 0.73, 0.69][i % 3];
    const tl = gsap.timeline();
    tl.fromTo(norm, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, at)
      .fromTo(track, { '--p': 0.05 }, { '--p': target, duration: 1.5, ease: 'expo.inOut' }, at + 0.15)
      .fromTo(dot, { backgroundColor: TOMATO }, { backgroundColor: OLIVE, duration: 0.5, ease: 'power1.inOut' }, at + 0.9)
      .fromTo(dot, { scale: 1 }, { scale: 1.35, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 }, at + 1.45)
      .add(() => gsap.to(track, { '--p': target + (i % 2 ? -0.035 : 0.035), duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero__photo .frame');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__who', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.2)
      .from(title.chars, { yPercent: 112, duration: 1, stagger: 0.028, ease: 'expo.out' }, 0.3)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'expo.inOut' }, 0.35)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.5)
      .from('.tag', { y: -26, rotation: -10, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' }, 1.15)
      .from('.panel', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.95)
      .from('.panel__head > *, .scale__label', { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 1.1)
      .from('.hero__body > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.3)
      .from('.facts li', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.5);
    $$('.scale__track').forEach((track, i) => intro.add(settle(track, i, 0), 1.3 + i * 0.22));

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Проблемы: графы бланка с галочками ---------- */
    revealLines('.problems h2', '.problems .sec-head');
    gsap.from('.problems .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.problems .sec-head', start: 'top 84%' } });
    gsap.from('.sheet-wrap', { y: 36, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.sheet-wrap', start: 'top 88%' } });
    const rows = $$('.sheet li');
    rows.forEach(row => {
      const path = $('.tick path', row);
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(row, { '--ln': 0 });
      gsap.set($$('.sheet__n, .sheet__t', row), { x: -14, autoAlpha: 0 });
    });
    ScrollTrigger.batch(rows, {
      start: 'top 90%', once: true,
      onEnter: els => els.forEach((row, k) => {
        const d = k * 0.09;
        gsap.to(row, { '--ln': 1, duration: 0.9, delay: d, ease: 'power2.inOut' });
        gsap.to($$('.sheet__n, .sheet__t', row), { x: 0, autoAlpha: 1, duration: 0.7, delay: d, stagger: 0.05, ease: 'power3.out' });
        gsap.to($('.tick path', row), { strokeDashoffset: 0, duration: 0.45, delay: d + 0.35, ease: 'power2.out' });
      }),
    });
    gsap.timeline({ scrollTrigger: { trigger: '.helps', start: 'top 86%' } })
      .fromTo('.helps', { clipPath: 'inset(0% 0% 100% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.1, ease: 'expo.inOut' })
      .from('.helps__title', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.35)
      .from('.helps__list li', { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.45)
      .from('.q', { scale: 0.4, rotation: -30, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.5);

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.free', start: 'top 84%' } })
      .fromTo('.free', { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.free > *', { x: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.45);
    const items = $$('.acc__item');
    gsap.set(items, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.09, ease: 'power3.out' }),
    });
    // Первая услуга раскрывается сама — видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 64%', once: true,
      onEnter: () => gsap.delayedCall(0.5, () => setOpen(items[0], true)),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
