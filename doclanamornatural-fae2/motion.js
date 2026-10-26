// Dr. Lana — моушн концепта. Фирменная идея: стероидное ядро (общий скелет гормонов) прорисовывается
// кольцо за кольцом, атомы загораются, дальше молекула медленно «дышит» и поворачивается при прокрутке.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, ссылки работают

  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Прорисовка линий: pathLength="1" у path, поэтому хватает dasharray 1
  const draw = (targets, vars) => gsap.fromTo(targets,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, ease: 'power2.inOut', ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const quote = SplitText.create('.hero__quote', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); quote.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero .frame',
        { clipPath: 'inset(0% 0% 100% 0% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3);
    // Кольца A → B → C → D, затем метильные «хвостики»
    $$('.steroid .ring').forEach((ring, i) => {
      intro.add(draw(ring, { duration: 0.9 }), 0.55 + i * 0.22);
    });
    intro
      .from('.steroid circle', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: { each: 0.04, from: 'start' }, ease: 'back.out(3)' }, 0.9)
      .from('.steroid text', { autoAlpha: 0, duration: 0.6, stagger: 0.12 }, 1.5)
      .from('.chip', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from('.hero__full', { autoAlpha: 0, y: 10, duration: 0.7 }, 0.95)
      .from('.tags li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.05)
      .from(quote.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 1.15)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    /* Молекула «дышит»: атомы по очереди мягко вспыхивают, вся фигура чуть плывёт */
    gsap.to('.steroid circle', {
      fill: '#a9542b', duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1,
      stagger: { each: 0.12, repeat: -1, repeatDelay: 2.6 }, delay: 2.4,
    });
    gsap.to('.steroid', { y: -8, rotate: -1.5, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

    /* Блик на главной кнопке */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--line)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.6 });
    });

    /* Параллакс: фото уходит медленнее, молекула поворачивается */
    gsap.to('.hero .frame img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.steroid__bonds, .steroid__atoms, .steroid__labels', {
      rotate: 8, svgOrigin: '206 150', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Ссылки: строки бланка проявляются, линейка прорисовывается ---------- */
    revealLines('.links h2', '.links .sec-head');
    gsap.from('.links .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.links .sec-head', start: 'top 84%' } });
    $$('.row').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } });
      tl.fromTo($$('.row__rule', row), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
        .from($$('.row__num', row), { autoAlpha: 0, x: -10, duration: 0.6 }, 0.15)
        .from($$('.row__title, .row__sub', row), { yPercent: 40, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.2)
        .from($$('.row__tag, .row__arrow', row), { autoAlpha: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2)' }, 0.4);
    });

    /* ---------- 3. MorNatural: карточка раскрывается, ядро-водяной знак рисуется по прокрутке ---------- */
    gsap.fromTo('.brand',
      { clipPath: 'inset(5% 3% 5% 3% round 44px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'power2.out', scrollTrigger: { trigger: '.brand', start: 'top 95%', end: 'top 45%', scrub: true } });
    draw('.brand__mark path', { ease: 'none', stagger: 0.25, scrollTrigger: { trigger: '.brand', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    const word = SplitText.create('.brand__word', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.brand__inner', start: 'top 78%' }, onComplete: () => word.revert() })
      .from('.brand .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7 }, 0)
      .from(word.chars, { yPercent: 115, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.1)
      .from('.brand__line', { autoAlpha: 0, x: -16, duration: 1, ease: 'expo.out' }, 0.5)
      .from('.brand__creator', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.7)
      .from('.brand__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.85);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
