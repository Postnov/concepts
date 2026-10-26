// Элина Григорьевна — моушн концепта. Фирменная идея: разбор красной ручкой.
// В заголовке над гласными «падают» ударения, в блоке диагностики предложение разбирается по членам
// (основа, затем определения), пункты тарифов отмечаются тем же штрихом. Цены появляются целиком.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная страница, все пометки уже нарисованы

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы переносы жили при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const hero = $('.hero');
    hero.classList.add('is-masked'); // маски строк заголовка — только на время входа (иначе срезали бы ударения)
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const stress = $$('.hero__title .st');
    gsap.set(stress, { '--st': 0 });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lead.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 16px 16px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 16px 16px)', duration: 1.25, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.32, duration: 1.8, ease: 'expo.out' }, 0.3)
      .fromTo('.arch__pen path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.75)
      .from('.hero__who > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.45)
      .from('.hero__title .ln__i', { yPercent: 112, stagger: 0.1, duration: 1.1, ease: 'expo.out' }, 0.5)
      .call(() => hero.classList.remove('is-masked'), null, 1.5)
      // ударения ставятся по одному, как рукой
      .to(stress, { '--st': 1, duration: 0.55, stagger: 0.24, ease: 'back.out(2.4)' }, 1.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 }, 1.05)
      .from('.hero__body .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.3)
      .from('.facts li', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.4);

    // Лёгкий параллакс портрета
    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Диагностика: разбор предложения ---------- */
    gsap.from(['.diag .eyebrow', '.diag__title'], {
      y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.12,
      scrollTrigger: { trigger: '.diag .sec-head', start: 'top 82%' },
    });
    const pm = $$('.diag__title .pm');           // Первое, занятие, глубокая, диагностика
    const legend = $$('.legend li');               // подлежащее, сказуемое, определение
    gsap.set(pm, { '--pm': '0%' });
    gsap.set(legend, { autoAlpha: 0, y: 8 });
    const draw = (el, d) => ({ targets: el, vars: { '--pm': '100%', duration: d, ease: 'power2.inOut' } });
    const parse = gsap.timeline({ delay: 0.35, scrollTrigger: { trigger: '.diag__title', start: 'top 72%' } });
    // сначала основа: подлежащее, сказуемое; потом определения
    [[draw(pm[1], 0.55), legend[0]], [draw(pm[3], 0.75), legend[1]], [draw([pm[0], pm[2]], 0.6), legend[2]]]
      .forEach(([d, lg], i) => {
        parse.to(d.targets, { ...d.vars, stagger: 0.2 }, i ? '+=0.12' : 0)
          .to(lg, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '<0.15');
      });

    gsap.from('.step', {
      x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: '.steps', start: 'top 84%' },
    });
    gsap.from('.step__n', {
      scale: 0.4, duration: 0.7, stagger: 0.14, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.steps', start: 'top 84%' },
    });
    gsap.fromTo('.steps__rail span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 78%', end: 'bottom 62%', scrub: true },
    });
    gsap.from('.diag__side .btn', {
      y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.diag__side .btn', start: 'top 94%' },
    });

    /* ---------- 3. Услуги и тарифы ---------- */
    revealLines('.plans .sec-title', '.plans .sec-head');
    gsap.from('.plans .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.plans .sec-head', start: 'top 84%' } });

    const plans = $$('.plan');
    const ticks = $$('.plan__list li');
    gsap.set(plans, { y: 56, autoAlpha: 0 });
    gsap.set(ticks, { '--st': 0 });
    ScrollTrigger.batch(plans, {
      start: 'top 88%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: 'expo.out' });
        // цена — целиком, лёгким подъёмом
        gsap.from(els.map(el => $('.plan__price', el)), { y: 12, autoAlpha: 0, duration: 0.8, stagger: 0.12, delay: 0.25, ease: 'power3.out' });
        // пункты отмечаются штрихом красной ручки
        els.forEach((el, i) => gsap.to($$('.plan__list li', el), {
          '--st': 1, duration: 0.45, stagger: 0.14, delay: 0.55 + i * 0.12, ease: 'back.out(2.2)',
        }));
      },
    });
    gsap.from('.plans__cta .btn', {
      y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.plans__cta', start: 'top 94%' },
    });

    gsap.from('.concept-end > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.concept-end', start: 'top 88%' },
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
