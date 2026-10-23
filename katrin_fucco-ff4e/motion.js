// Катрин — моушн концепта. Фирменная идея: «перевод состояния» — золотая черта зачёркивает «Надо», и из-под маски поднимается «Охуеть как Хочу».
// Рядом — астрологический круг вокруг портрета, который проворачивается при прокрутке, и «шатать», которое качнётся и встанет на якорь.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, черта уже нарисована
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Обложка ---------- */
    const mast = SplitText.create('.mast', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => mast.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.meta > span', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.15)
      .from('.meta i', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.15)
      .from(mast.chars, { yPercent: 105, stagger: 0.06, duration: 1.2, ease: 'expo.out' }, 0.25)
      .fromTo('.medal__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' }, 0.45)
      .from('.medal__photo img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.6)
      .from('.medal__ring', { rotation: -70, scale: 0.86, autoAlpha: 0, duration: 2, ease: 'expo.out', transformOrigin: '50% 50%' }, 0.55)
      // «перевод»: сначала «Из Надо», затем золотая черта, «Надо» гаснет, поднимается «Хочу»
      .from('.vow__line:nth-child(1) .vow__in', { yPercent: 105, duration: 1, ease: 'expo.out' }, 0.9)
      .from('.strike', { color: '#2b1a12', duration: 0.5, ease: 'power1.out' }, 1.75)
      .from('.strike__line path', { strokeDashoffset: 1, duration: 0.65, ease: 'power2.inOut' }, 1.6)
      .from('.vow__line:nth-child(2) .vow__in', { yPercent: 105, duration: 1.05, ease: 'expo.out' }, 1.95)
      .from('.vow em', { autoAlpha: 0, scale: 0.8, transformOrigin: '50% 70%', duration: 0.9, ease: 'back.out(2)' }, 2.25)
      .from('.traits li', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.3)
      .from('.hero__btns .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.45);

    /* Астрологический круг: медленный дрейф и поворот при прокрутке */
    gsap.to('.medal__ring', { rotation: '+=360', duration: 120, ease: 'none', repeat: -1, transformOrigin: '50% 50%', delay: 2.6 });
    gsap.to('.medal', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.medal__photo img', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3.2 + i });
    });

    /* ---------- 2. Прогноз и услуги ---------- */
    gsap.from('.offer', {
      borderRadius: '0px 0px 0 0', ease: 'none',
      scrollTrigger: { trigger: '.offer', start: 'top bottom', end: 'top 55%', scrub: true },
    });
    gsap.from('.offer .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 82%' } });
    revealLines('.offer h2', '.offer .sec-head');
    // «шатать» качается, как лодка, и встаёт на якорь
    gsap.timeline({ scrollTrigger: { trigger: '.offer .sec-head', start: 'top 70%' }, delay: 0.7 })
      .to('.sway', { rotation: -7, duration: 0.35, ease: 'sine.out' })
      .to('.sway', { rotation: 5, duration: 0.5, ease: 'sine.inOut' })
      .to('.sway', { rotation: -3, duration: 0.5, ease: 'sine.inOut' })
      .to('.sway', { rotation: 1.5, duration: 0.5, ease: 'sine.inOut' })
      .to('.sway', { rotation: 0, duration: 0.6, ease: 'sine.inOut' });

    gsap.from('.tile', {
      y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.offer__grid', start: 'top 85%' },
    });
    // созвездие на карточке прогноза прорисовывается
    const poly = $('.tile__sky polyline');
    if (poly) {
      const len = poly.getTotalLength();
      gsap.fromTo(poly, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 2, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.tile--gold', start: 'top 80%' },
      });
    }
    gsap.from('.tile__stars circle', {
      scale: 0, transformOrigin: '50% 50%', stagger: 0.18, duration: 0.6, ease: 'back.out(3)',
      scrollTrigger: { trigger: '.tile--gold', start: 'top 80%' },
    });
    gsap.from('.tile__sky circle:not(.tile__stars circle)', {
      scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.6, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.tile--gold', start: 'top 80%' },
    });

    gsap.from('.tile__moon', {
      rotation: -40, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: '.tile__moon', start: 'top 85%' },
    });

    /* ---------- 3. Каналы ---------- */
    gsap.from('.media .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.media .sec-head', start: 'top 82%' } });
    revealLines('.media h2', '.media .sec-head');
    $$('.rows li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } });
      tl.fromTo(li, { '--draw': 0 }, { '--draw': 1, duration: 1, ease: 'expo.inOut' })
        .from($('.row__num', li), { autoAlpha: 0, duration: 0.5 }, 0.3)
        .from($('.row__title', li), { x: -24, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.35)
        .from($('.row__handle', li), { x: -14, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.45)
        .from($('.row__arrow', li), { rotation: -90, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.5);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
