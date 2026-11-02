// Лена Третьякова — моушн концепта. «Каждая вещь на своём месте»: ячейки лотка прилетают вразнобой и встают в сетку.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Детерминированный «разброс» ячеек: откуда каждая прилетает и как повёрнута
  const SCATTER = [
    { x: -46, y: -90, r: -7 }, { x: 58, y: -120, r: 6 }, { x: -30, y: 110, r: 5 },
    { x: 70, y: 80, r: -6 }, { x: -64, y: 130, r: 8 },
  ];

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // «Сердечко» из логотипа рисуется слева направо
  const wipeHearts = (els, vars = {}) => gsap.from(els, { clipPath: 'inset(0 100% 0 0)', duration: 0.7, ease: 'power2.inOut', ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: ячейки встают на места ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const cells = $$('.hero .cell');
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__top > *', { y: -14, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.1);
    cells.forEach((cell, i) => {
      const s = SCATTER[i % SCATTER.length];
      intro.from(cell, { x: s.x, y: s.y, rotation: s.r, scale: 0.94, autoAlpha: 0, duration: 1.4 }, 0.2 + i * 0.1);
    });
    intro
      .from('.cell--photo img', { scale: 1.28, duration: 1.9 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1 }, 0.75)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.chips li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.2)
      .from('.hero__handle', { scaleX: 0, autoAlpha: 0, duration: 0.9 }, 1.4);

    // Ручка «ящика» чуть выдвигается и возвращается — подсказка, что страница продолжается
    gsap.to('.hero__handle', { y: 4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    // Лёгкий параллакс портрета
    gsap.to('.cell--photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Курс ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.course__grid', start: 'top 82%' } })
      .fromTo('.course__media', { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.course__img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.1);
    gsap.to('.course__img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.course__media', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    revealLines('.course h2', '.course__media');
    gsap.from(['.course .eyebrow', '.until'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.2, delay: 0.5,
      scrollTrigger: { trigger: '.course__media', start: 'top 70%' },
    });
    const offer = gsap.timeline({ scrollTrigger: { trigger: '.offer', start: 'top 82%' } });
    offer
      .from('.offer', { y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.ticks li', { x: -14, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, 0.35);
    wipeHearts('.ticks .heart', { scrollTrigger: { trigger: '.offer', start: 'top 82%' }, stagger: 0.12, delay: 0.5 });
    // Цена появляется целиком, без счётчика
    gsap.from(['.price', '.soldout'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.offer__foot', start: 'top 94%' } });

    /* ---------- 3. Для кого ---------- */
    revealLines('.for h2', '.for__head');
    gsap.from('.for .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.for__head', start: 'top 84%' } });
    // Плитки встают на места вразнобой: каждая с лёгким наклоном
    const slots = $$('.slot');
    slots.forEach((el, i) => {
      gsap.from(el, {
        x: i % 2 ? 40 : -40, y: 40, rotation: i % 2 ? 2.4 : -2.4, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
      wipeHearts($('.heart', el), { scrollTrigger: { trigger: el, start: 'top 90%' }, delay: 0.35 });
    });
    $$('.shot').forEach((el, i) => {
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
        .fromTo($('.frame', el), { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut', delay: i * 0.12 })
        .from($('img', el), { scale: 1.35, duration: 1.7, ease: 'expo.out' }, 0.1 + i * 0.12);
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
