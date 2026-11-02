// Василиса Володина — моушн концепта. Идея: натальная карта. Колесо с градусной шкалой вращается за портретом,
// линии аспектов прорисовываются, на прокрутке карта доворачивается; «40 сфер жизни» зажигаются звёздами.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / при reduced motion — статичная, полностью рабочая страница

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%' }, ...extra,
  });
  const ruler = (scope, trigger) => gsap.fromTo($('.ruler', scope), { clipPath: 'inset(0 100% 0 0)' }, {
    clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'power3.inOut',
    scrollTrigger: { trigger: trigger || scope, start: 'top 84%' },
  });

  MotionBase.ready(() => {
    /* ---------- I. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const aspects = $$('.hero .w-aspect');
    aspects.forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p._len = len; });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); gsap.set('.arch', { clearProps: 'clipPath' }); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero .wheel', { scale: 0.66, autoAlpha: 0, duration: 2.6, ease: 'expo.out' }, 0.05)
      .fromTo('.hero .w-ticks', { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 1.8 }, 0.2)
      .fromTo(aspects, { strokeDashoffset: (i, el) => el._len }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.3 }, 0.9)
      .from('.hero .w-planet', { scale: 0, duration: 0.8, stagger: 0.09, ease: 'back.out(2.6)' }, 1.0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.15)
      .from('.arch img', { scale: 1.34, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from('.seal', { scale: 0, rotation: -140, duration: 1.2, ease: 'back.out(1.6)' }, 1.1)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    // Карта живёт: колесо медленно вращается, кольцо печати тоже; на прокрутке карта доворачивается
    gsap.to('.hero .wheel__spin', { rotation: 360, duration: 260, ease: 'none', repeat: -1 });
    gsap.to('.hero .wheel__scroll', {
      rotation: 70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.seal__ring', { rotation: 360, svgOrigin: '60 60', duration: 28, ease: 'none', repeat: -1 });
    gsap.to('.arch img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- II. Прогнозы ---------- */
    revealLines('.forecast h2', '.forecast .sec-head');
    fadeUp('.forecast .eyebrow', '.forecast .sec-head');
    ruler($('.forecast .sec-head'));

    const fx = gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 82%' }, defaults: { ease: 'power3.out' } });
    fx.from('.feature', { y: 60, autoAlpha: 0, duration: 1.1 })
      .from('.feature__label', { x: -16, autoAlpha: 0, duration: 0.7 }, 0.25)
      .from('.feature__t1, .feature__year', { yPercent: 40, autoAlpha: 0, duration: 1.0, stagger: 0.14, ease: 'expo.out' }, 0.3)
      .from('.feature__lead, .feature__desc', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.6)
      .fromTo('.feature__photo .frame', { clipPath: 'inset(0% 0% 0% 100% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut' }, 0.35)
      .from('.feature__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.45)
      .from('.dots__cap', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from('.dots__grid i', { scale: 0, autoAlpha: 0, duration: 0.55, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(2.4)' }, 0.95)
      .from('.feature .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.5);

    // Обложки: широкие выезжают снизу, парные — навстречу друг другу
    $$('.cover').forEach((el, i) => {
      const wide = el.classList.contains('cover--wide');
      const from = wide ? 'inset(100% 0% 0% 0% round 24px)' : i % 2 ? 'inset(0% 0% 0% 100% round 24px)' : 'inset(0% 100% 0% 0% round 24px)';
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' }, defaults: { ease: 'power3.out' } });
      tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.2, ease: 'expo.inOut', onComplete: () => gsap.set(el, { clearProps: 'clipPath' }) })
        .from($('img', el), { scale: 1.28, duration: 1.7, ease: 'expo.out' }, 0.05)
        .from($$('.cover__label, .cover__title, .cover__desc', el), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.09 }, 0.5)
        .from($('.cover__go', el), { scale: 0, duration: 0.6, ease: 'back.out(2.2)' }, 0.8);
    });

    /* ---------- III. Консультации ---------- */
    gsap.to('.consult__spin', { rotation: 360, duration: 320, ease: 'none', repeat: -1 });
    gsap.to('.consult__wheel', {
      rotation: -50, ease: 'none',
      scrollTrigger: { trigger: '.consult', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    revealLines('.consult h2', '.consult .sec-head');
    fadeUp('.consult .eyebrow', '.consult .sec-head');
    ruler($('.consult .sec-head'));
    gsap.timeline({ scrollTrigger: { trigger: '.astro', start: 'top 86%' }, defaults: { ease: 'power3.out' } })
      .from('.astro', { y: 40, autoAlpha: 0, duration: 0.9 })
      .from('.astro__seal', { rotation: -200, scale: 0.5, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from('.astro__title, .astro__site', { x: -14, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.4);
    $$('.rows li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' }, defaults: { ease: 'power3.out' } });
      tl.fromTo($('.row__line', li), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' })
        .from($('.row__n', li), { autoAlpha: 0, y: 10, duration: 0.6 }, 0.25)
        .from($('.row__t', li), { x: -22, autoAlpha: 0, duration: 0.85 }, 0.2)
        .from($('.row__go', li), { scale: 0, rotation: -90, duration: 0.7, ease: 'back.out(2)' }, 0.45);
    });
    const phone = SplitText.create('.phone', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(phone.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.consult__foot', start: 'top 88%' }, onComplete: () => phone.revert() });
    gsap.from('.consult__foot .btn', { y: 16, autoAlpha: 0, duration: 0.8, delay: 0.15, scrollTrigger: { trigger: '.consult__foot', start: 'top 88%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
