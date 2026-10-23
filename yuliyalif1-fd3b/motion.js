// Юлия — моушн концепта. Фирменная идея «тонус»: имя и крупные цифры подтягиваются —
// из широких и тонких становятся узкими и плотными (оси wdth/wght вариативного Merriweather), как тело в тонусе.
// Обложка: имя за её головой, фигура поднимается из-под края, при прокрутке слои расходятся по глубине.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  // «Подтягивание»: ширина 112 → 87, вес 300 → 900 (через CSS-переменные font-variation-settings)
  const SOFT = { '--wd': 112, '--wg': 300 };
  const TONED = { '--wd': 87, '--wg': 900 };

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Обложка: вход ---------- */
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lead.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.cover', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.05)
      .from('.cover__mast', { yPercent: 35, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.45)
      // имя крупное — стартует не шире обложки (ширина 100 вместо 112), иначе края букв срезаются
      .fromTo('.cover__mast', { ...SOFT, '--wd': 100 }, { ...TONED, duration: 1.9, ease: 'expo.inOut' }, 0.45)
      .from('.cover__fig', { yPercent: 24, duration: 1.6, ease: 'expo.out' }, 0.6)
      .from('.cover__fig img', { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, 0.6)
      .from('.cover__top > *', { y: -10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.8)
      .from('.cover__lines > li', { x: -18, autoAlpha: 0, stagger: 0.12, duration: 0.85 }, 1.0)
      .fromTo('.cl .tone--num', SOFT, { ...TONED, duration: 1.6, ease: 'expo.inOut' }, 1.0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 1.1)
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1, ease: 'expo.out' }, 1.15)
      .from('.hero__body .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.45)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.55);

    /* Глубина обложки: имя отстаёт, фигура чуть поднимается.
       Интро двигает yPercent, параллакс — y в px (у имени) и картинку внутри фигуры: свойства не спорят */
    const depth = () => ({ trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true });
    gsap.to('.cover__mast', { y: () => document.querySelector('.cover').offsetHeight * 0.11, ease: 'none', scrollTrigger: depth() });
    gsap.to('.cover__fig img', { yPercent: -5, ease: 'none', scrollTrigger: depth() });

    /* ---------- 2. Тарифы ---------- */
    revealLines('.plans h2', '.plans .sec-head');
    gsap.from(['.plans .eyebrow', '.plans .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.plans .sec-head', start: 'top 84%' },
    });
    $$('.plan').forEach(card => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.from(card, { y: 46, autoAlpha: 0, duration: 0.95, ease: 'expo.out' }, 0);
      const day = card.querySelector('.tone--day');
      if (day) tl.fromTo(day, SOFT, { ...TONED, duration: 1.5, ease: 'expo.inOut' }, 0.15);
      // 21 день по делениям — слева направо, как дни марафона
      const ticks = card.querySelectorAll('.days i');
      if (ticks.length) tl.from(ticks, { scaleY: 0, duration: 0.5, stagger: 0.028, ease: 'power2.out' }, 0.3);
      // цена появляется целиком, без счётчика
      tl.from(card.querySelector('.plan__price'), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.45)
        .from(card.querySelectorAll('.plan__list li'), { x: -12, autoAlpha: 0, duration: 0.6, stagger: 0.07 }, 0.6);
    });
    gsap.from('.msg .btn', {
      y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.msg', start: 'top 90%' },
    });

    /* ---------- 3. Отзывы ---------- */
    revealLines('.reviews h2', '.reviews .sec-head');
    gsap.from('.reviews .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reviews .sec-head', start: 'top 84%' } });
    $$('.rev').forEach((rev, i) => {
      gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: rev, start: 'top 88%' } })
        .from(rev, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'expo.out', delay: (i % 3) * 0.06 }, 0)
        .from(rev.querySelectorAll('.stars svg'), { scale: 0.3, autoAlpha: 0, duration: 0.45, stagger: 0.07, transformOrigin: '50% 50%' }, 0.25)
        .from(rev.querySelector('.rev__head'), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.35)
        .from(rev.querySelector('.rev__body'), { y: 12, autoAlpha: 0, duration: 0.8 }, 0.5);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
