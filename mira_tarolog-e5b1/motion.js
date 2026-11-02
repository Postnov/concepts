// Мирослава — моушн концепта. Фирменная идея: карты таро переворачиваются.
// В hero из рубашки открывается её фото, в «раскладе» колода раздаётся на четыре карты и открывает её слова.
// По умолчанию все карты лежат лицом вверх: без GSAP или при reduced motion страница статичная и полностью читаемая.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, start = 'top 82%') {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: карта-портрет переворачивается ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => first.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.ring-wrap', { scale: 0.72, rotation: -50, autoAlpha: 0, duration: 2.4, ease: 'expo.out' }, 0.1)
      .from('.deck__back', { y: 70, rotation: -10, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.15)
      .from('.deck__card', { y: 90, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
      .fromTo('.deck__card .flip', { rotateY: 180 }, { rotateY: 0, duration: 1.5, ease: 'expo.inOut' }, 0.6)
      .from('.deck__card img', { scale: 1.35, duration: 2.1, ease: 'expo.out' }, 1.1)
      .from('.twinkle', { scale: 0, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'back.out(2)' }, 1.4)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(first.chars, { yPercent: 110, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.75)
      .from('.hero__last', { y: 26, autoAlpha: 0, duration: 1.2 }, 1.05)
      .from('.roles li', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.25)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.4);

    // Лунное кольцо вращается очень медленно, искры мерцают вразнобой
    gsap.to('.ring', { rotation: 360, duration: 180, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    $$('.twinkle').forEach((el, i) => {
      gsap.to(el, { autoAlpha: 0.15, scale: 0.55, duration: 1.6 + i * 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.2 + i * 0.5 });
    });

    // Блик на золотых кнопках раз в несколько секунд
    gsap.utils.toArray('.btn--gold').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 1.5 });
    });

    // При прокрутке колода чуть уходит вверх и доворачивается, кольцо отстаёт
    gsap.to('.deck', {
      yPercent: -7, rotation: -2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.ring-wrap', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Расклад: колода раздаётся и карты открываются по одной ---------- */
    gsap.from('.spread .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spread', start: 'top 80%' } });
    gsap.from('.spread__title', {
      yPercent: 30, autoAlpha: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.spread__title', start: 'top 85%' },
      onComplete() { gsap.set('.spread__title', { clearProps: 'filter' }); },
    });

    const grid = $('.spread__grid');
    const cards = $$('.spread__card');
    const cx = grid.clientWidth / 2;
    const cy = grid.clientHeight / 2;
    const tilt = [-9, 6, -4, 8];
    gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 78%', once: true } })
      // колода собрана в центре сетки рубашкой вверх → раздача по местам
      .from(cards, {
        x: (i, el) => cx - (el.offsetLeft + el.offsetWidth / 2) + i * 2,
        y: (i, el) => cy - (el.offsetTop + el.offsetHeight / 2) - i * 2,
        rotation: i => tilt[i], scale: 0.92,
        duration: 1.1, stagger: 0.09, ease: 'expo.inOut',
      })
      .fromTo(cards.map(c => $('.flip', c)), { rotateY: -180 }, {
        rotateY: 0, duration: 1.15, stagger: 0.22, ease: 'expo.inOut',
      }, '-=0.35')
      .from(cards.map(c => $('.card__text', c)), { y: 10, autoAlpha: 0, stagger: 0.22, duration: 0.7, ease: 'power2.out' }, '<0.55');

    revealLines('.spread__answer', '.spread__answer', 'top 85%');
    gsap.from('.spread .btn', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spread .btn', start: 'top 94%' } });

    /* ---------- 3. Связь ---------- */
    gsap.from('.contact .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.contact', start: 'top 80%' } });
    revealLines('.contact__title', '.contact__title');
    gsap.timeline({ scrollTrigger: { trigger: '.me', start: 'top 88%' } })
      .fromTo('.me__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.1, ease: 'expo.out' })
      .from('.me__photo img', { scale: 1.4, duration: 1.4, ease: 'expo.out' }, 0)
      .from('.me__name', { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.2);
    gsap.from('.dm', {
      y: 24, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.dms', start: 'top 90%' },
    });
    gsap.from(['.socials__title', '.socials__text'], {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.socials', start: 'top 85%' },
    });
    const rows = $$('.socials__list li');
    gsap.set(rows, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 94%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out' }),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
