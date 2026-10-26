// Элина Давыдова — моушн концепта. Идея: «скан кожи». Линза-проба с пигментными пятнами: под лучом скана пятна растворяются,
// кожа становится ровной. Дальше ритм спокойный и чистый, как в клинике: раскрытие «диафрагмой», карточки из-под кромки, прицелы адресов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // Портрет открывается «диафрагмой» из центра лица
      .fromTo('.arch', { clipPath: 'circle(0% at 50% 56%)' }, { clipPath: 'circle(85% at 50% 56%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.arch img', { scale: 1.32, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.arch__line', { x: -16, y: -16, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.7)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.hero__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.hero__tag', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    /* Линза: появляется, затем скан проходит слева направо и пятна растворяются по ходу луча */
    const spots = $$('.lens .spot');
    intro
      .from('.lens', { scale: 0.55, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.95)
      .from('.lens__label', { x: -12, autoAlpha: 0, duration: 0.7 }, 1.5)
      .fromTo('.lens__sweep', { xPercent: 0 }, { xPercent: 300, duration: 1.9, ease: 'power2.inOut' }, 1.7);
    spots.forEach(el => {
      const x = parseFloat(el.style.getPropertyValue('--x')) / 100;
      intro.to(el, { scale: 0.15, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 1.9 + x * 1.2);
    });
    // Безель линзы медленно вращается
    gsap.to('.lens__ring', { rotation: 360, duration: 70, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.utils.toArray('.hero .btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3.2 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запись ---------- */
    revealLines('.book h2', '.book .sec-head');
    gsap.from('.book .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.book .sec-head', start: 'top 84%' } });
    const places = $$('.place');
    gsap.set(places, { clipPath: 'inset(100% 0% 0% 0% round 26px)' });
    ScrollTrigger.batch(places, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, stagger: 0.14, ease: 'expo.inOut', clearProps: 'clipPath' });
        els.forEach((card, i) => gsap.from($$('.place__meta, .place__city, .place__addr, .chip', card), {
          y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.06, delay: 0.35 + i * 0.14, ease: 'power3.out',
        }));
      },
    });

    /* ---------- 3. Маршрут ---------- */
    revealLines('.route h2', '.route .sec-head');
    gsap.from('.route .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.route .sec-head', start: 'top 84%' } });
    $$('.stop').forEach(stop => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: stop, start: 'top 84%' } });
      tl.from($$('.reticle__ring', stop), { scale: 0.2, autoAlpha: 0, duration: 1.2, stagger: 0.14, ease: 'expo.out' })
        .from($$('.reticle__h, .reticle__v', stop), { scale: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
        .from($('.reticle__pin', stop), { y: -26, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.7)
        .from($$('.stop__body > *', stop), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.35);
    });
    gsap.fromTo('.reticle__ripple', { scale: 0.6, autoAlpha: 0.75 }, { scale: 6.5, autoAlpha: 0, duration: 2.8, ease: 'power1.out', repeat: -1, stagger: 0.9 });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
