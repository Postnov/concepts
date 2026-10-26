// Симметрия — моушн концепта. Фирменная идея «ось симметрии»: искривлённый позвоночник после «скана» выравнивается на оси,
// дуги логотипа встают в замок, строки заголовков входят с наклоном и выравниваются; ниже карточки расходятся от оси,
// а лаймовая ось курса прорисовывается прокруткой и зажигает этапы.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: позвоночник ровный, все этапы курса подсвечены (.no-motion)

  // Строки заголовка входят снизу с лёгким наклоном и «выравниваются»
  function levelLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines' });
    gsap.from(split.lines, {
      y: 34, autoAlpha: 0, rotation: i => (i % 2 ? 2.2 : -2.2), transformOrigin: '0% 50%',
      duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const word = SplitText.create('.wordmark', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const title = SplitText.create('.hero__title', { type: 'lines' });
    const fig = $('.axis-fig');
    const vbs = $$('.vb');
    // Стартовая S-кривая (сколиоз): смещение по синусу, наклон позвонка — по касательной
    const A = 20, L = 500, n = vbs.length;
    const curve = vbs.map((g, i) => {
      const t = i / (n - 1);
      return {
        x: A * Math.sin(2 * Math.PI * t),
        r: -Math.atan((2 * Math.PI * A * Math.cos(2 * Math.PI * t)) / L) * 180 / Math.PI,
      };
    });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { word.revert(); title.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.axis-fig__ring', { rotation: -40, scale: 0.85, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.4)
      .from('.hero__brand .logo__top', { rotation: -110, svgOrigin: '50 50', duration: 1.5, ease: 'expo.out' }, 0.1)
      .from('.hero__brand .logo__bottom', { rotation: 110, svgOrigin: '50 50', duration: 1.5, ease: 'expo.out' }, 0.1)
      .from(word.chars, { yPercent: 110, duration: 0.9, stagger: { each: 0.045, from: 'center' }, ease: 'expo.out' }, 0.2)
      .from('.hero__tag', { autoAlpha: 0, x: 10, duration: 0.7 }, 0.5)
      // фигура: линейка и ось, позвонки проявляются уже в искривлённом положении
      .from('.ruler', { autoAlpha: 0, duration: 0.8 }, 0.2)
      .from('.axis-line', { scaleY: 0, transformOrigin: '50% 50%', duration: 1.2, ease: 'expo.inOut' }, 0.2)
      .from(vbs, {
        x: i => curve[i].x, rotation: i => curve[i].r, transformOrigin: '50% 50%',
        duration: 1.5, stagger: { each: 0.025, from: 'center' }, ease: 'expo.inOut',
      }, 1.1)
      .from(vbs, { autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'none' }, 0.3)
      .from('.sacrum', { autoAlpha: 0, duration: 0.6 }, 0.75)
      .from('.level--top', { rotation: -8, svgOrigin: '80 112', autoAlpha: 0, duration: 1.5, ease: 'expo.inOut' }, 1.15)
      .from('.level--bottom', { rotation: 8, svgOrigin: '80 556', autoAlpha: 0, duration: 1.5, ease: 'expo.inOut' }, 1.15)
      // «скан» проходит сверху вниз перед выравниванием
      .fromTo('.scan', { y: 0, autoAlpha: 0 }, { y: () => fig.clientHeight, autoAlpha: 1, duration: 1.1, ease: 'power1.inOut' }, 0.45)
      .to('.scan', { autoAlpha: 0, duration: 0.3 }, 1.4)
      .from(['.axis-fig__corner', '.axis-fig__chip'], { autoAlpha: 0, y: 8, duration: 0.7, stagger: 0.1 }, 2.2)
      // текст
      .from('.kicker', { autoAlpha: 0, x: -12, duration: 0.7 }, 0.35)
      .from(title.lines, {
        y: 34, autoAlpha: 0, rotation: i => (i % 2 ? 2.4 : -2.4), transformOrigin: '0% 50%',
        duration: 1.15, stagger: 0.1, ease: 'expo.out',
      }, 0.45)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.9)
      .from('.cities li', { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.07 }, 1.05)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.15)
      .from('.hero__about', { y: 20, autoAlpha: 0, duration: 0.8 }, 1.4);

    // Сигнал по оси: лаймовая точка раз в несколько секунд пробегает сверху вниз
    gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 3.2 })
      .fromTo('.pulse', { attr: { cy: 8 } }, { attr: { cy: 592 }, duration: 2.4, ease: 'power1.inOut' })
      .fromTo('.pulse', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0)
      .to('.pulse', { opacity: 0, duration: 0.4, ease: 'none' }, 2.0);

    // Лёгкий параллакс фигуры
    gsap.to('.spine', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Что мы лечим ---------- */
    levelLines('.cure h2', '.cure .sec-head');
    fadeUp(['.cure .eyebrow', '.cure .sec-sub'], '.cure .sec-head', { stagger: 0.15 });
    fadeUp('.cure__label', '.cure__label');
    gsap.from('.cure__axis', { scaleY: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.cure__grid', start: 'top 85%' } });
    // Карточки расходятся от оси: стартуют ближе к центру и разъезжаются по своим местам
    const tiles = $$('.tile');
    const fromAxis = el => {
      const g = $('.tiles').getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return (g.left + g.width / 2 - (r.left + r.width / 2)) * 0.4;
    };
    gsap.set(tiles, { autoAlpha: 0, x: (i, el) => fromAxis(el) });
    ScrollTrigger.batch(tiles, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, x: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }),
    });
    // Карточка «Восстанавливаем здоровье» раскрывается от центра к краям
    gsap.timeline({ scrollTrigger: { trigger: '.restore', start: 'top 85%' } })
      .fromTo('.restore', { clipPath: 'inset(0% 50% 0% 50% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.restore__title', { autoAlpha: 0, y: 10, duration: 0.6 }, 0.6)
      .from('.restore__list li', { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.7)
      .set('.restore', { clearProps: 'clipPath' });

    /* ---------- 3. Курс ---------- */
    levelLines('.course h2', '.course .sec-head');
    fadeUp(['.course .eyebrow', '.course .sec-sub', '.course__btn'], '.course .sec-head', { stagger: 0.12 });
    $$('.stage').forEach(stage => {
      gsap.from(stage, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: stage, start: 'top 88%' } });
    });
    // Ось этапов прорисовывается прокруткой и зажигает узлы-позвонки
    gsap.fromTo('.steps__line span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps-wrap', start: 'top 70%', end: 'bottom 70%', scrub: true },
    });
    $$('.step').forEach(step => {
      ScrollTrigger.create({
        trigger: step, start: 'top 70%',
        onEnter: () => step.classList.add('is-on'),
        onLeaveBack: () => step.classList.remove('is-on'),
      });
      gsap.from($('.step__t', step), { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 88%' } });
    });
    fadeUp('.stage__text', '.stage--2');
    gsap.from('.perk', {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.perks', start: 'top 88%' },
    });

    fadeUp('.concept-end > *', '.concept-end');
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
