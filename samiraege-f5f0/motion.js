// Самира — моушн концепта. Идея: «проверка работы» — красная ручка обводит баллы, ставит галочки и пишет пометку.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Штрих ручки: путь «дорисовывается» (pathLength = 1)
  const draw = (paths, vars) => gsap.from(paths, Object.assign({ strokeDashoffset: 1, duration: 0.9, ease: 'power2.inOut' }, vars));

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.35)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(100% 0% 0% 0% round 130px 130px 28px 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 130px 130px 28px 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.2)
      .from('.hero__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from('.hero__lead', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.8)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.05)
      .from('.hero .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2)
      // Ручка обводит сердце, затем пометка
      .from('.pen--heart path', { strokeDashoffset: 1, duration: 1.0, ease: 'power2.inOut' }, 1.0)
      .from('.note--hero', { autoAlpha: 0, scale: 0.6, rotate: -20, duration: 0.5, ease: 'back.out(2)' }, 1.9);

    // Блик на главных кнопках
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* ---------- 2. Результаты ---------- */
    gsap.from('.results .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.results .sec-head', start: 'top 85%' } });
    gsap.from('.results h2', { y: 28, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.results .sec-head', start: 'top 85%' } });
    draw('.pen--num path', { duration: 1, delay: 0.6, scrollTrigger: { trigger: '.results .sec-head', start: 'top 80%' } });
    $$('.results__lead').forEach(el => gsap.from(el, { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.from('.scores span', { y: 24, autoAlpha: 0, stagger: 0.09, duration: 0.7, scrollTrigger: { trigger: '.scores', start: 'top 88%' } });
    $$('.scores .pen path').forEach((p, i) => draw(p, { duration: 0.8, delay: 0.5 + i * 0.28, scrollTrigger: { trigger: '.scores', start: 'top 88%' } }));
    gsap.from('.unis li', { y: 18, autoAlpha: 0, scale: 0.92, stagger: 0.07, duration: 0.6, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.unis', start: 'top 90%' } });
    $$('.facts li').forEach((li, i) => gsap.from(li, { x: -20, autoAlpha: 0, duration: 0.8, delay: i * 0.1, scrollTrigger: { trigger: '.facts', start: 'top 88%' } }));

    /* ---------- 3. Занятия ---------- */
    gsap.from('.fit .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.fit .sec-head', start: 'top 85%' } });
    gsap.from('.fit h2', { y: 28, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.fit .sec-head', start: 'top 85%' } });
    $$('.checks li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } });
      tl.from($('p', li), { x: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0)
        .from($('.tick path', li), { strokeDashoffset: 1, duration: 0.55, ease: 'power2.out' }, 0.2);
    });
    gsap.from('.fit .actions .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7, scrollTrigger: { trigger: '.fit .actions', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
