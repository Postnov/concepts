// Мария Зюкина — моушн концепта «Свет из окна».
// Фирменная идея: в первом экране по стене за ней проезжает тень оконного переплёта — и на самом фото
// (на светлой стене справа, где солнечное пятно), и мягко на кремовом фоне вокруг имени; фото «наливается» светом справа.
// Ниже по странице свет остаётся только пятном на тёмной карточке «Кето-интенсива».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон «Вопросы»: работает и без GSAP ---------- */
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
      gsap.from($$('.acc__in > *, .checks li, .rows li', body), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.04, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  const items = $$('.acc__item');
  items.forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      items.forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });
  // Раскрытый по умолчанию пункт — «Вы специализируетесь только на кето?»: нейтральный, без обещаний результата
  const featured = items[2];

  if (!animate) {
    setOpen(featured, true, true);
    return;
  }

  MotionBase.ready(() => {
    const wide = window.innerWidth >= 960;

    /* ---------- «Свет из окна» (только первый экран) ---------- */
    // Пока первый экран уходит вверх, тень переплёта на фоне едет справа налево и выпрямляется — «солнце» идёт по небу
    gsap.fromTo('.sun__win',
      { xPercent: 8, yPercent: 0, rotation: -6, skewX: -12 },
      { xPercent: -10, yPercent: 6, rotation: 3, skewX: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 } });
    // Медленное дыхание тени, как от занавески и листвы за окном
    gsap.to('.sun__drift', { x: 26, y: -16, rotation: 1.6, duration: 7.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    // Плотность по брифу: ≈4 % вокруг окна и ≈6–7 % под перекладинами
    const [lo, hi] = wide ? [0.08, 0.1] : [0.1, 0.13];
    gsap.fromTo('.sun', { opacity: lo }, { opacity: hi, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });
    // Тень на фото продолжает медленно ползти по стене, пока первый экран прокручивают
    gsap.to('.frame__win', {
      xPercent: -14, ease: 'none',
      scrollTrigger: { trigger: '.hero__photo', start: 'top 40%', end: 'bottom top', scrub: 1.2 },
    });
    // На телефоне у фото скруглён только низ (фото во всю ширину), на десктопе — все углы
    const round = wide ? '26px' : '0px 0px 26px 26px';

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const img = $('.hero__photo img');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.sun', { opacity: 0, duration: 2.2, ease: 'sine.inOut' }, 0.2)
      // Фото открывается справа налево — со стороны окна
      .fromTo('.hero__photo .frame',
        { clipPath: `inset(0% 0% 0% 100% round ${round})` },
        { clipPath: `inset(0% 0% 0% 0% round ${round})`, duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      // Конечный масштаб почти 1: кадр не растягивается сверх исходника (резкость в 4K-записи);
      // запас 3 % снизу как раз на параллакс
      .fromTo(img,
        { scale: 1.26, filter: 'brightness(0.55) saturate(0.6)' },
        { scale: 1.03, filter: 'brightness(1) saturate(1)', duration: 2.3, ease: 'expo.out', clearProps: 'filter' }, 0.35)
      .fromTo('.frame__light', { xPercent: 45, opacity: 1 }, { xPercent: -45, opacity: 0, duration: 2.1, ease: 'power2.inOut' }, 0.7)
      // Тень переплёта проезжает по светлой стене справа и ложится на солнечное пятно — «свет ползёт за ней»
      .fromTo('.frame__win-in',
        { xPercent: 70, skewX: -38, autoAlpha: 0 },
        { xPercent: 0, skewX: -22, autoAlpha: 1, duration: 2.4, ease: 'power2.out' }, 0.5)
      .from(first.chars, { yPercent: 115, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.35)
      .from(last.chars, { yPercent: 115, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.55)
      .from('.hero__role i', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.9)
      .from('.hero__role span', { x: 16, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from(lead.lines, { yPercent: 100, duration: 1, stagger: 0.08 }, 1.0)
      .from('.hero__down', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.4);

    // Стрелка вниз мягко «дышит»
    gsap.to('.hero__down span', { y: 5, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });

    // Лёгкий параллакс портрета внутри рамки
    gsap.to(img, {
      yPercent: -3, ease: 'none',
      scrollTrigger: { trigger: '.hero__photo', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Вводный текст: слова «загораются», когда по ним проходит свет ---------- */
    // reduceWhiteSpace: false — иначе SplitText превращает &nbsp; в пробелы и предлоги «к», «и» повисают в конце строк
    const big = SplitText.create('.intro__big', { reduceWhiteSpace: false, type: 'words', wordsClass: 'sw' });
    gsap.fromTo(big.words, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: {
        trigger: '.intro__big', start: 'top 82%', end: 'bottom 52%', scrub: 0.6,
        // Раз «загорелся» — остаётся светлым и при обратной прокрутке
        onLeave: self => { self.kill(true); gsap.set(big.words, { opacity: 1 }); },
      },
    });
    // «35+» уходит вверх медленнее текста — только вверх, чтобы цифра не наезжала на абзац под ней
    gsap.fromTo('.intro__num', { yPercent: 0 }, {
      yPercent: -16, ease: 'none',
      scrollTrigger: { trigger: '.intro__age', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from('.intro__num', { autoAlpha: 0, scale: 0.92, transformOrigin: '0% 100%', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.intro__age', start: 'top 86%' } });
    gsap.from('.intro__age .intro__p', { y: 26, autoAlpha: 0, duration: 0.95, scrollTrigger: { trigger: '.intro__age', start: 'top 82%' } });
    gsap.from('.intro__p--last', { y: 26, autoAlpha: 0, duration: 0.95, scrollTrigger: { trigger: '.intro__p--last', start: 'top 90%' } });

    /* ---------- 3. Сопровождение и курсы ---------- */
    // 3a. Панель сопровождения открывается справа налево — со стороны окна, как фото в первом экране
    const solo = $('.solo');
    gsap.timeline({ scrollTrigger: { trigger: solo, start: 'top 86%' } })
      .fromTo(solo,
        { clipPath: 'inset(0% 0% 0% 100% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from($$('.kicker, .solo__title, .solo__lead', solo), { x: 26, autoAlpha: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out' }, 0.55);
    gsap.from('.solo__list li', { x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.solo__list', start: 'top 88%' } });
    // Два «билета» ложатся на панель, как карточки на стол; цены статичные — её суммы без перебора чисел
    gsap.from('.ticket', {
      y: 46, rotation: i => (i ? 3 : -3), autoAlpha: 0, duration: 1.15, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.tickets', start: 'top 90%' },
    });
    gsap.from('.tickets__label', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tickets', start: 'top 90%' } });
    gsap.from('.solo__side .ask, .solo__side .btns', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.solo__side .ask', start: 'top 92%' } });

    // 3b. «Кето-интенсив»: тёмная панель поднимается, по ней со скроллом проходит пятно света из окна
    const dark = $('.course--dark');
    gsap.timeline({ scrollTrigger: { trigger: dark, start: 'top 86%' } })
      .from(dark, { y: 70, scale: 0.95, autoAlpha: 0, duration: 1.25, ease: 'expo.out' })
      .from($$('.kicker, .course__title, .course__desc, .course__span', dark), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.3);
    gsap.fromTo('.course__beam', { xPercent: -80 }, {
      xPercent: 70, ease: 'none',
      scrollTrigger: { trigger: dark, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
    // Тарифы проявляются вместе с ценами — статичные суммы, без счётчика
    gsap.from('.tariffs li', { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out', scrollTrigger: { trigger: '.tariffs', start: 'top 90%' } });

    // 3c. «Кето-старт»: панель выходит следом, пункты выстраиваются слева
    const light = $('.course--light');
    gsap.timeline({ scrollTrigger: { trigger: light, start: 'top 86%' } })
      .from(light, { y: 70, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: wide ? 0.14 : 0 })
      .from($$('.kicker, .course__title, .course__desc', light), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.3);
    gsap.from('.course--light .facts li', { x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.course--light .facts', start: 'top 90%' } });
    gsap.from('.course__note, .course__cost', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.course__note', start: 'top 92%' } });
    $$('.course').forEach(c => {
      const last = $$(':scope > .ask, :scope > .btns', c);
      gsap.from(last, { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, scrollTrigger: { trigger: last[0], start: 'top 94%' } });
    });

    /* ---------- 4. Instagram → «Вопросы» → Телеграм-канал → аккордеон ---------- */
    gsap.from('.social--ig', { y: 22, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: '.social--ig', start: 'top 90%' } });
    const q = SplitText.create('.faq h2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.faq .sec-head', start: 'top 84%' }, onComplete: () => q.revert() })
      .from(q.chars, { yPercent: 110, duration: 1.05, stagger: 0.045, ease: 'expo.out' })
      .from('.social--tg', { y: 18, autoAlpha: 0, duration: 0.85, ease: 'power3.out' }, 0.35);
    gsap.set(items, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.07, ease: 'power3.out' }),
    });
    // Один пункт раскрывается сам, чтобы было видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 64%', once: true,
      onEnter: () => gsap.delayedCall(0.6, () => setOpen(featured, true)),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
