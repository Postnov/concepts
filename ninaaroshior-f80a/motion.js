// Нина Рошиор — моушн концепта. Фирменная идея «связь»: две тонкие линии идут навстречу с краёв и сходятся в узел —
// о паре и семье, которые снова слышат друг друга. Остальное — спокойные журнальные раскрытия.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // «Связь»: линии с краёв к узлу, узел проявляется в момент встречи (один раз при появлении)
  function bond(el, opts = {}) {
    const tl = gsap.timeline(opts.scroll === false ? {} : {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    tl.fromTo($('.bond__l', el), { scaleX: 0 }, { scaleX: 1, ease: 'power3.inOut', duration: 1.2 }, 0)
      .fromTo($('.bond__r', el), { scaleX: 0 }, { scaleX: 1, ease: 'power3.inOut', duration: 1.2 }, 0)
      .fromTo($('.bond__knot', el), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: 'back.out(3)', duration: 0.5 }, 0.95);
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const lines = $$('.hero__line').map(l => SplitText.create(l, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const heroBond = bond($('.bond--hero'), { scroll: false }).pause();

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { lines.forEach(s => s.revert()); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .from('.hero__frame img', { scale: 1.25, duration: 2.1, ease: 'expo.out' }, 0.35)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      // «Нина» встаёт слева направо, «Рошиор» — справа налево: две строки навстречу друг другу
      .from(lines[0].chars, { yPercent: 115, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from(lines[1].chars, { yPercent: 115, stagger: { each: 0.05, from: 'end' }, duration: 1.1, ease: 'expo.out' }, 0.5)
      .add(heroBond.tweenFromTo(0, heroBond.duration(), { duration: 1.45, ease: 'none' }), 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.4)
      .from('.hero__cap', { autoAlpha: 0, duration: 0.8 }, 1.5);

    // Портрет чуть отстаёт при прокрутке
    gsap.to('.hero__frame img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы ---------- */
    revealLines('.reqs h2', '.reqs__head');
    gsap.from('.reqs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reqs__head', start: 'top 84%' } });
    gsap.from('.types__label', { autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.types', start: 'top 88%' } });
    gsap.from('.types__list li', {
      clipPath: 'inset(0% 50% 0% 50%)', duration: 1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.types', start: 'top 86%' },
    });
    // Номер приходит слева, фраза — справа: встречаются на строке
    $$('.reqs ol li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' }, defaults: { duration: 0.95, ease: 'expo.out' } })
        .from($('.reqs__num', li), { x: -26, autoAlpha: 0 }, 0)
        .from($('.reqs__txt', li), { x: 26, autoAlpha: 0 }, 0.06);
    });
    gsap.to('.reqs__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.reqs__list', start: 'top 75%', end: 'bottom 60%', scrub: true },
    });

    /* ---------- 3. Стоимость ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.price__photo', start: 'top 80%' } })
      .fromTo('.price__frame', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.price__frame img', { scale: 1.3, duration: 2, ease: 'expo.out', clearProps: 'transform' }, 0.1);
    revealLines('.price h2', '.price__head');
    gsap.from('.price .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.price__head', start: 'top 86%' } });
    gsap.from('.tariff', {
      y: 46, autoAlpha: 0, duration: 1.05, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.tariffs', start: 'top 86%' },
    });
    // Цены появляются целиком, без счётчика
    $$('.tariff__row dd').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    gsap.from('.terms li', {
      y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.terms', start: 'top 88%' },
    });
    gsap.from('.price .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.price .btn', start: 'top 95%' } });

    /* ---------- «связь» во всех разделителях, кроме hero ---------- */
    $$('.bond:not(.bond--hero)').forEach(el => bond(el));
    gsap.from('.concept-end > :not(.bond)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 80%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
