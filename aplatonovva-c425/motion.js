// Анастасия Платонова — моушн концепта.
// Фирменная идея «луна растёт»: все луны на странице (за портретом, в метках разделов, у пунктов разбора)
// выходят из новолуния и набирают фазу по мере прокрутки; в финале — полнолуние.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: фазы лун уже заданы в разметке

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const phase = el => parseFloat(el.style.getPropertyValue('--p')) || 0;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Луна выходит из новолуния до своей фазы
  function wax(el, trigger, opts = {}) {
    gsap.fromTo(el, { '--p': 0 }, {
      '--p': phase(el), duration: 1.6, ease: 'power2.inOut', ...opts,
      scrollTrigger: { trigger: trigger || el, start: 'top 88%' },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const moon = $('.moon--hero');
    const moonP = phase(moon);

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.frame--arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.frame--arch img', { scale: 1.3, duration: 2.1, ease: 'expo.out' }, 0.35)
      .from(moon, { autoAlpha: 0, scale: 0.86, duration: 1.4 }, 0.5)
      .fromTo(moon, { '--p': 0 }, { '--p': moonP, duration: 2.2, ease: 'power2.inOut' }, 0.6)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.7)
      .from(first.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.8)
      .from(last.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.hero__nav a', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35)
      .fromTo('.hero__nav .moon', { '--p': 0 }, { '--p': i => [0.3, 0.62][i], duration: 1.4, ease: 'power2.inOut', stagger: 0.15 }, 1.45)
      .from('.hero .actions .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.5);

    // Прокрутка: луна за портретом набирает фазу и всплывает, портрет — лёгкий параллакс
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.fromTo(moon, { y: 0 }, { y: -60, ease: 'none', scrollTrigger: heroST });
    gsap.to('.frame--arch img', { yPercent: -5, ease: 'none', scrollTrigger: { ...heroST } });
    ScrollTrigger.create({
      ...heroST,
      onUpdate: self => { if (self.progress > 0) gsap.set(moon, { '--p': moonP + (0.58 - moonP) * self.progress }); },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost):not(.btn--ghost-dark)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    /* ---------- 2. Консультации ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 84%' } });
    wax($('.consult .eyebrow .moon'), '.consult .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.consult__photo', start: 'top 82%' } })
      .fromTo('.frame--card', { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.frame--card img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.15)
      .from('.wait', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.8);
    // Карточки ложатся, как карты из колоды
    $$('.card').forEach((card, i) => {
      gsap.from(card, {
        y: 70, rotation: [-5, 4, -3][i] || 0, transformOrigin: '50% 100%', autoAlpha: 0,
        duration: 1.1, ease: 'expo.out', delay: (i % 2) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 92%' },
      });
    });
    // цены не «набегают»: число стоит в разметке, строка цены проявляется целиком (сумма «Предназначения» входит вместе с блоком .destiny__price)
    $$('.card__price').forEach(el => gsap.from(el, {
      y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    }));
    gsap.from('.terms__row', {
      x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.terms', start: 'top 86%' },
    });
    gsap.from('.order > *', {
      y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.order', start: 'top 88%' },
    });

    /* ---------- 3. Разбор предназначения ---------- */
    gsap.fromTo('.destiny__sky img', { scale: 1.25 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.destiny', start: 'top bottom', end: 'center center', scrub: true },
    });
    revealLines('.destiny h2', '.destiny .sec-head');
    gsap.from(['.destiny .eyebrow', '.destiny .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.destiny .sec-head', start: 'top 84%' },
    });
    wax($('.destiny .eyebrow .moon'), '.destiny .sec-head');
    // Пункты: строка проявляется, её луна прибывает до своей фазы — от тонкого серпа к полнолунию
    $$('.phase').forEach(item => {
      const m = $('.moon', item);
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 90%' } })
        .from(item.children[1], { x: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
        .from(m, { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0)
        .fromTo(m, { '--p': 0 }, { '--p': phase(m), duration: 1.5, ease: 'power2.inOut' }, 0.1);
    });
    gsap.from('.destiny__price', {
      y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.destiny__price', start: 'top 90%' },
    });

    /* ---------- финал: полнолуние ---------- */
    const endMoon = $('.moon--end');
    gsap.fromTo(endMoon, { '--p': 0 }, {
      '--p': 1, duration: 2.4, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.concept-end', start: 'top 85%' },
    });
    gsap.from('.concept-end > :not(.moon)', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.concept-end', start: 'top 85%' },
    });

    window.addEventListener('load', refresh, { once: true });
  });
})();
