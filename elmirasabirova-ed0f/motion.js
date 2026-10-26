// Эльмира — моушн концепта. Фирменная идея «светило»: в hero золотые светила плывут по её орбитам вокруг портрета,
// в блоке «Если вы» знак-солнце с её карточек спускается по золотой нити и зажигает каждый запрос.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) {
    $$('.step').forEach(s => s.classList.add('is-lit'));
    return;
  }

  // Орбита на её фото (координаты viewBox 1080×1020): центр и радиус внешнего кольца
  const C = { x: 509.5, y: 627 }, R = 469;
  const at = deg => {
    const a = deg * Math.PI / 180;
    return `translate(${(C.x + R * Math.cos(a)).toFixed(1)} ${(C.y + R * Math.sin(a)).toFixed(1)})`;
  };
  // Светило идёт только по видимым дугам кольца (не поверх волос и плеч), в начале и в конце тает
  function orbit(planet, from, to, dur, delay) {
    const o = { a: from };
    gsap.set(planet, { attr: { transform: at(from) } });
    gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay })
      .to(o, { a: to, duration: dur, ease: 'sine.inOut', onUpdate: () => planet.setAttribute('transform', at(o.a)) }, 0)
      .fromTo(planet, { opacity: 0 }, { opacity: 1, duration: dur * 0.22, ease: 'sine.out' }, 0)
      .to(planet, { opacity: 0, duration: dur * 0.25, ease: 'sine.in' }, dur * 0.75);
  }

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function revealChars(selector, trigger) {
    const split = SplitText.create(selector, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1, stagger: 0.035, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: портрет открывается из центра её колец, как зрачок ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const arcs = $$('.orbits__arc');
    arcs.forEach(p => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__iris', { clipPath: 'circle(0% at 47% 61%)' }, { clipPath: 'circle(75% at 47% 61%)', duration: 1.8, ease: 'expo.inOut' }, 0.1)
      .from('.hero__iris img', { scale: 1.28, duration: 2.4, ease: 'expo.out' }, 0.2)
      .to(arcs, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.15 }, 1.0)
      .from('.orbits__twinkle', { autoAlpha: 0, duration: 1 }, 1.4)
      .from('.roles > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.9)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.35)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.55);

    // Светила по орбите и мерцание звёзд на её кольцах
    const planets = $$('.orbits__planet');
    orbit(planets[0], -50, 30, 7, 2.6);
    orbit(planets[1], 236, 140, 8, 4.2);
    $$('.orbits__twinkle circle').forEach((c, i) => {
      gsap.to(c, { opacity: 1, scale: 1.35, transformOrigin: '50% 50%', duration: 1.6 + i * 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 + i * 0.7 });
    });
    // Дуги после прорисовки чуть дышат
    gsap.to(arcs, { opacity: 0.25, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 3 });

    // Блик на главных кнопках раз в несколько секунд
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.8 + i * 0.6 });
    });

    // Портрет чуть отстаёт при прокрутке
    gsap.to('.hero__iris img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Если вы: светило спускается по нити ---------- */
    revealChars('.ifyou h2', '.ifyou__head');
    gsap.from('.ifyou .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.ifyou__head', start: 'top 84%' } });
    revealLines('.ifyou__call', '.ifyou__outro');
    gsap.from('.ifyou__outro .btn', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.ifyou__outro', start: 'top 86%' } });

    const steps = $$('.step');
    gsap.set(steps, { x: 28, autoAlpha: 0 });
    ScrollTrigger.batch(steps, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out' }),
    });
    // Нить заполняется, а солнце идёт по линии 60 % экрана — ровно туда, где читают
    const LINE = 'top 60%';
    gsap.to('.path__fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.path', start: LINE, end: 'bottom 60%', scrub: 0.4 } });
    gsap.fromTo('.path__sun', { y: 0 }, {
      y: () => $('.path').offsetHeight - $('.path__sun').offsetHeight, ease: 'none',
      scrollTrigger: { trigger: '.path', start: LINE, end: 'bottom 60%', scrub: 0.4, invalidateOnRefresh: true },
    });
    gsap.to('.path__sun', { rotate: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 53%' });
    steps.forEach(step => ScrollTrigger.create({
      trigger: step, start: 'top 62%',
      onEnter: () => step.classList.add('is-lit'),
      onLeaveBack: () => step.classList.remove('is-lit'),
    }));

    /* ---------- 3. Услуги: аркан прорисовывается, меню раскладывается ---------- */
    revealChars('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });

    // Пульс знака стартует только после его появления, иначе спорит с from() за scale
    const pulse = () => gsap.to('.arcana__sigil', { scale: 1.06, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.timeline({ scrollTrigger: { trigger: '.arcana', start: 'top 80%' }, onComplete: pulse })
      .fromTo('.arcana__frame rect', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.2 })
      .from('.arcana__label', { y: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
      .from('.arcana__sigil', { scale: 0.4, rotate: -90, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.5)
      .from('.arcana__title', { yPercent: 30, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.75)
      .from('.arcana__more', { y: 10, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 1.0);

    const rows = $$('.menu li');
    gsap.set(rows, { '--line': 0 });
    gsap.set($$('.menu a > *'), { x: -18, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 94%', once: true,
      onEnter: els => els.forEach((li, i) => {
        gsap.to(li, { '--line': 1, duration: 1.1, ease: 'expo.inOut', delay: i * 0.08 });
        gsap.to($$('a > *', li), { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: 0.15 + i * 0.08 });
      }),
    });
    gsap.from('.note', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.note', start: 'top 95%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
