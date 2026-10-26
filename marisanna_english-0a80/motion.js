// МарьСанна — моушн концепта. Фирменная идея: красный маркер учителя.
// Пока страница листается, маркер сам обводит главное, подчёркивает и ставит галочки — как МарьСанна в тетради ученика.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!(window.MotionBase && MotionBase.init())) return; // reduced motion / нет GSAP — статичная страница, штрихи уже нарисованы

  // Штрих маркера: путь с pathLength="1" рисуется от 0 до конца
  const draw = (targets, vars = {}) => gsap.fromTo(targets, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', ...vars });
  // «Пишет от руки»: текст открывается слева направо
  const write = (targets, vars = {}) => gsap.fromTo(targets,
    { clipPath: 'inset(-20% 100% -20% 0%)' },
    { clipPath: 'inset(-20% 0% -20% 0%)', duration: 0.9, ease: 'power1.inOut', clearProps: 'clipPath', ...vars });

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const hello = SplitText.create('.hello', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { hello.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__tag', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.15)
      .from(hello.chars, { yPercent: 112, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, 0.2)
      .from('.hero__photo', { y: 90, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.45)
      .from('.hero__photo img', { scale: 1.06, transformOrigin: '50% 100%', duration: 1.6, ease: 'expo.out' }, 0.45)
      .from(lead.lines, { yPercent: 105, duration: 0.95, stagger: 0.08, ease: 'expo.out' }, 0.7)
      .from(['.hero__sub', '.hero__cta'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.85)
      .from('.hero__note', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.9)
      // маркер: подпись пишется от руки, обводит уровни и «20 лет»
      .add(write('.hero__sign-text', { duration: 0.95 }), 1.05)
      .add(draw('.mk--tag path', { duration: 0.75 }), 1.55)
      .add(draw('.mk--years path', { duration: 0.75 }), 2.15);

    // Глубина: огромное HELLO! уезжает медленнее фото
    gsap.to('.hero__hello', {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне: тетрадь ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });
    gsap.from('.sheet', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.sheet', start: 'top 88%' } });
    gsap.fromTo('.sheet__margin', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.sheet', start: 'top 80%', end: 'bottom 70%', scrub: true },
    });
    // Каждая строка: текст ложится на линейку, маркер ставит галочку
    $$('.fact').forEach(fact => {
      gsap.timeline({ scrollTrigger: { trigger: fact, start: 'top 84%' } })
        .from($('p', fact), { x: -14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .from($('.tick', fact), { scale: 0.5, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.05)
        .add(draw($$('.tick path', fact), { duration: 0.45, ease: 'power2.in' }), 0.3)
        .add($('.mk--num', fact) ? draw($$('.mk--num path', fact), { duration: 0.7 }) : gsap.timeline(), 0.55);
    });
    write('.sheet__sign', { duration: 1.1, scrollTrigger: { trigger: '.sheet__sign', start: 'top 92%' } });

    /* ---------- 3. English Camp ---------- */
    revealLines('.camp__title', '.camp__text');
    gsap.from('.camp .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.camp__text', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.camp__brand', start: 'top 88%' } })
      .add(write('.mk--brand', { duration: 0.9 }), 0.2)
      .add(draw('.mk--brand path', { duration: 0.7 }), 0.95);
    gsap.from('.tile', {
      y: 70, rotation: 7, autoAlpha: 0, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '.camp__photo', start: 'top 86%' },
    });
    gsap.from('.tile img', { scale: 1.25, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.camp__photo', start: 'top 86%' } });
    gsap.from('.cfact', {
      y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.camp__facts', start: 'top 86%' },
    });
    // Места в группе: три занято, ещё два — по желанию
    gsap.from('.seats i', {
      scale: 0, duration: 0.45, stagger: 0.08, ease: 'back.out(2.4)', delay: 0.35,
      scrollTrigger: { trigger: '.camp__facts', start: 'top 86%' },
    });
    gsap.from('.camp__cta > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.camp__cta', start: 'top 92%' } });

    /* ---------- концепт ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 82%' } })
      .from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
      .add(draw('.mk--end path', { duration: 0.7 }), 0.6);

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
