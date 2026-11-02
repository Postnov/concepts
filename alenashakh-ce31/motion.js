// Дворец Души Алены Шах — моушн концепта.
// Фирменная идея: «двери в тонкий мир» — в интро распахиваются створки дворцовой арки и открывают её зеркало;
// дальше каждая «комната» (направление) проявляется аркой снизу вверх, а каллиграфия пишется слева направо.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // «Письмо пером»: каллиграфия проявляется слева направо
  const write = (el, vars) => gsap.fromTo(el,
    { clipPath: 'inset(-20% 100% -20% 0%)' },
    { clipPath: 'inset(-20% -5% -20% 0%)', duration: 1.6, ease: 'power2.inOut', ...vars, onComplete: () => gsap.set(el, { clearProps: 'clipPath' }) });

  // Заголовок строками из-под маски
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Арка проявляется снизу вверх
  const archReveal = (el, trigger, extra = {}) => gsap.fromTo(el,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: trigger || el, start: 'top 86%' }, ...extra,
      onComplete: () => gsap.set(el, { clearProps: 'clipPath' }) });

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__fleur', { scale: 0, rotate: -90, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.8)' }, 0.15)
      .add(write('.hero__script', { duration: 1.7 }), 0.3)
      .from(name.chars, { yPercent: 110, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.45)
      // Двери распахиваются, за ними — её зеркало
      .from('.hero__window', { y: 40, autoAlpha: 0, duration: 1 }, 0.2)
      .to('.door--l', { rotateY: -108, duration: 2, ease: 'power3.inOut' }, 0.9)
      .to('.door--r', { rotateY: 108, duration: 2, ease: 'power3.inOut' }, 0.9)
      .from('.hero__window img', { scale: 1.28, duration: 2.6, ease: 'expo.out' }, 1.0)
      .to('.doors', { autoAlpha: 0, duration: 0.5, onComplete: () => gsap.set('.doors', { display: 'none' }) }, 2.5);

    /* Отсвет свечи мерцает */
    gsap.to('.arch__glow', { opacity: 0.55, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 3 });

    /* Блик на главных кнопках */
    gsap.utils.toArray('.btn--wine, .hall .btn').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.8 + i });
    });

    /* Лёгкий параллакс зеркала */
    gsap.to('.hero__window img', {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Направления ---------- */
    revealLines('.paths h2', '.paths .sec-head');
    gsap.from('.paths .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.paths .sec-head', start: 'top 84%' } });

    archReveal('.hall', '.hall');
    gsap.timeline({ scrollTrigger: { trigger: '.hall', start: 'top 80%' } })
      .from('.hall .emblem', { scale: 0.4, rotate: -120, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.35)
      .from('.hall__body > *', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.6);

    const rooms = $$('.room');
    gsap.set(rooms, { clipPath: 'inset(100% 0% 0% 0%)' });
    ScrollTrigger.batch(rooms, {
      start: 'top 88%', once: true,
      onEnter: els => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, stagger: 0.14, ease: 'expo.inOut', onComplete() { gsap.set(this.targets(), { clearProps: 'clipPath' }); } });
        gsap.from(els.map(el => $('.emblem', el)), { scale: 0.4, rotate: -120, autoAlpha: 0, duration: 1.3, stagger: 0.14, delay: 0.35, ease: 'expo.out' });
        gsap.from(els.flatMap(el => $$('.emblem ~ *', el)), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.05, delay: 0.5, ease: 'power3.out' });
      },
    });

    /* ---------- 3. Обо мне ---------- */
    archReveal('.about__photo .arch', '.about__photo');
    gsap.from('.about__photo img', { scale: 1.25, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '.about__photo', start: 'top 86%' } });
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about__side', start: 'top 84%' } });
    write('.about__name', { scrollTrigger: { trigger: '.about__name', start: 'top 86%' } });
    gsap.from('.stat', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 90%' } });
    ScrollTrigger.batch('.regalia li', {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.from(els.map(el => $('.fleur', el)), { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(2)' });
        gsap.from(els.map(el => $('span', el)), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.1, ease: 'power3.out' });
      },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
