// Ирина Броскова — моушн концепта. Фирменная идея: долги «вычёркиваются» — по каждой строке списка проводится линия.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector) {
    $$(selector).forEach(el => {
      const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.0, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onComplete: () => split.revert(),
      });
    });
  }

  MotionBase.ready(() => {
    /* ---------- Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.25)
      .from(name.chars, { yPercent: 115, stagger: 0.03, duration: 1.0, ease: 'expo.out' }, 0.35)
      .from('.hero__glow', { scale: 0.6, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.3)
      .fromTo('.hero__img', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.2)
      .from('.hero__img img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.3)
      .fromTo('.hero__img', { '--sweep': '-130%' }, { '--sweep': '130%', duration: 1.8, ease: 'power2.inOut' }, 1.2)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__proof', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3);
    // число «1319» — не цена; один раз набегает при появлении
    const num = $('.hero__num');
    if (num) {
      const target = parseInt(num.textContent, 10), o = { v: 0 };
      num.textContent = '0';
      intro.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(o.v); }, onComplete: () => { num.textContent = target; } }, 1.15);
    }

    /* ---------- Вычёркивание долгов ---------- */
    revealLines('.debts .h2');
    $$('.debt').forEach(row => {
      const t = $('.debt__t', row);
      gsap.from(row, { autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 88%' } });
      gsap.to(t, { '--x': '100%', duration: 0.9, ease: 'power2.inOut', scrollTrigger: { trigger: row, start: 'top 72%' } });
      gsap.to(t, { opacity: 0.62, duration: 0.6, delay: 0.5, scrollTrigger: { trigger: row, start: 'top 72%' } });
    });

    /* ---------- Результаты ---------- */
    revealLines('.after .h2');
    $$('.grp').forEach(g => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: 'top 80%' }, defaults: { ease: 'power3.out' } });
      tl.from(g, { borderLeftColor: 'transparent', duration: 0.6 }, 0)
        .from($('.grp__ico', g), { scale: 0.5, rotate: -8, autoAlpha: 0, duration: 1.0, ease: 'back.out(1.6)' }, 0.1)
        .from($('.grp__title', g), { x: -20, autoAlpha: 0, duration: 0.7 }, 0.1)
        .from($$('li', g), { clipPath: 'inset(0 100% 0 0)', x: -14, duration: 0.9, stagger: 0.2, ease: 'power3.inOut' }, 0.3);
    });

    /* ---------- Преимущества ---------- */
    revealLines('.adv .h2');
    $$('.adv__item').forEach((it, i) => {
      gsap.from(it, { y: 34, autoAlpha: 0, duration: 0.9, delay: (i % 3) * 0.08, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 88%' } });
    });
    if ($('.adv__cta')) gsap.from('.adv__cta > *', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.adv__cta', start: 'top 90%' } });

    /* ---------- Рейтинг: звёзды зажигаются по очереди ---------- */
    revealLines('.rate .h2');
    $$('.rcard').forEach((c, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 88%' } });
      tl.from(c, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.05 }, 0)
        .from($$('.rcard__stars svg', c), { scale: 0, rotate: -60, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.09, duration: 0.5, ease: 'back.out(2.2)' }, 0.35)
        .from($('.rcard__score', c), { autoAlpha: 0, x: 16, duration: 0.7 }, 0.6);
    });

    /* ---------- Контакты ---------- */
    revealLines('.contact .h2');
    $$('.crow').forEach((r, i) => gsap.from(r, { x: -40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', delay: (i % 2) * 0.08, scrollTrigger: { trigger: r, start: 'top 92%' } }));

    /* ---------- Адрес, соцсети, подарки ---------- */
    revealLines('.where .h2');
    $$('.where__addr, .soc__t, .where .btn').forEach(el => gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    $$('.chip').forEach((c, i) => gsap.from(c, { scale: 0.8, autoAlpha: 0, duration: 0.6, delay: i * 0.08, ease: 'back.out(2)', scrollTrigger: { trigger: '.soc__row', start: 'top 92%' } }));
    revealLines('.gifts .h2');
    $$('.gift').forEach((g, i) => gsap.from(g, { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 92%' } }));

    /* ---------- Конец демо ---------- */
    const ce = $('.concept-end');
    if (ce) gsap.from('.concept-end > *', { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: ce, start: 'top 80%' } });
  });
})();
