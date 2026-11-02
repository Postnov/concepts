// Марианна Светлова — моушн концепта. Фирменная идея: натальный круг за портретом
// прорисовывается при входе, медленно вращается и подкручивается прокруткой; звёзды из её таплинка мерцают.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(target, trigger) {
    const els = gsap.utils.toArray(target);
    if (!els.length) return;
    els.forEach(el => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
    });
  }
  const eyebrow = (sel, trigger) => gsap.from(sel, { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: trigger || sel, start: 'top 86%' } });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const strokes = $$('.wheel__svg .w-ring, .wheel__svg .w-house, .wheel__svg .w-ticks, .wheel__svg .w-aspect');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(strokes, { strokeDashoffset: 1, duration: 2.2, stagger: 0.035, ease: 'power2.inOut' }, 0.1)
      .from('.w-planet', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.06, ease: 'back.out(3)' }, 1.3)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.4, ease: 'expo.inOut' }, 0.15)
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.35)
      .from('.hero__visual > .star', { scale: 0, rotation: -120, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'back.out(2)' }, 1.1)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.6)
      .from(first.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.7)
      .from(last.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.95)
      .from('.pills li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.35)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.5);

    /* Круг: бесконечное медленное вращение + доворот от прокрутки */
    gsap.to('.wheel__spin', { rotation: 360, duration: 160, repeat: -1, ease: 'none' });
    gsap.to('.wheel', {
      rotation: 70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Мерцание звёзд — у каждой свой ритм */
    $$('.hero__visual > .star').forEach((s, i) => {
      gsap.to(s, { scale: 0.55, autoAlpha: 0.45, rotation: 45, duration: 1.6 + i * 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 + i * 0.4 });
    });

    /* Блик на главных кнопках */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    /* Цифры: карточки и счётчики */
    gsap.from('.stat', {
      y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.stats', start: 'top 88%' },
    });
    gsap.from('.stat .star', {
      scale: 0, rotation: -90, duration: 0.9, stagger: 0.1, ease: 'back.out(2.4)', delay: 0.2,
      scrollTrigger: { trigger: '.stats', start: 'top 88%' },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const from = Number(el.dataset.from || 0);
      const o = { v: from };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      });
    });

    /* ---------- 2. Методы ---------- */
    eyebrow('.method .eyebrow');
    revealLines('.method h2', '.method .sec-head');
    // Два круга-системы сходятся в «натальную карту»
    gsap.timeline({ scrollTrigger: { trigger: '.venn', start: 'top 82%' } })
      .from('.venn__c--l', { xPercent: -40, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0)
      .from('.venn__c--r', { xPercent: 40, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0)
      .from('.venn__core', { scale: 0.3, rotation: -90, autoAlpha: 0, duration: 1, ease: 'back.out(2)' }, 0.8);
    gsap.from('.method__lead', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.method__lead', start: 'top 86%' } });
    gsap.from('.method__more', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.method__more', start: 'top 90%' } });

    /* Задачи: созвездие — линия тянется прокруткой, звёзды загораются */
    revealLines('.tasks__title', '.tasks');
    gsap.to('.tasks__line span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.tasks__wrap', start: 'top 70%', end: 'bottom 70%', scrub: true },
    });
    $$('.task').forEach(task => {
      gsap.timeline({ scrollTrigger: { trigger: task, start: 'top 82%' } })
        .from($('.star', task), { scale: 0, rotation: -135, duration: 0.9, ease: 'back.out(2.2)' })
        .from($('p', task), { x: 22, autoAlpha: 0, duration: 0.85, ease: 'power3.out' }, 0.12);
    });

    /* ---------- 3. Как помочь ---------- */
    eyebrow('.help .eyebrow');
    revealLines('.help h2', '.help .sec-head');
    gsap.from('.route', {
      clipPath: 'inset(0% 100% 0% 0%)', duration: 1.2, stagger: 0.12, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.routes', start: 'top 84%' },
      onComplete: () => gsap.set('.route', { clearProps: 'clipPath' }),
    });
    gsap.from('.route__go', {
      rotation: -180, scale: 0.4, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(1.8)', delay: 0.5,
      scrollTrigger: { trigger: '.routes', start: 'top 84%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 85%' } })
      .from('.contact', { y: 40, scale: 0.96, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.contact > *', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0.25);

    gsap.from('.concept-end > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.concept-end', start: 'top 85%' },
    });

    window.addEventListener('load', refresh, { once: true });
  });
})();
