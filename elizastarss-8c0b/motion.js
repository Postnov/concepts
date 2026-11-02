// Элиза — моушн концепта. Фирменная идея из её же текста «жашооңузду ачык түстүү боекко боеп»:
// серое окрашивается — капля цвета растекается по чёрно-белому фото, кисть прокрашивает заголовки, 14 дней марафона заливаются красками.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(el, trigger, delay = 0) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, delay, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Мазок кисти: прокрашивается слева направо
  const paint = (el, vars = {}) => gsap.fromTo(el,
    { clipPath: 'inset(0% 100% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut', clearProps: 'clipPath', ...vars });
  // Рукописная подпись «пишется» слева направо (запас по краям, чтобы не срезать хвосты букв)
  const write = (el, vars = {}) => gsap.fromTo(el,
    { clipPath: 'inset(-30% 100% -30% -6%)' },
    { clipPath: 'inset(-30% -6% -30% -6%)', duration: 1.1, ease: 'power1.inOut', clearProps: 'clipPath', ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: капля цвета растекается по серому фото ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.blob--sun', { scale: 0.35, rotate: -24, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.1)
      .fromTo('.portrait', { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(75% at 50% 55%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      .from('.portrait__grey', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.25)
      // цвет приходит с её жёлтой рубашки и растекается по всему кадру
      .fromTo('.portrait__color', { clipPath: 'circle(0% at 30% 86%)' }, { clipPath: 'circle(142% at 30% 86%)', duration: 1.9, ease: 'power2.inOut', clearProps: 'clipPath' }, 1.05)
      .from(['.blob--rose', '.blob--violet'], { scale: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(2.2)' }, 1.25)
      .from('.sticker', { y: 30, rotate: 40, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)' }, 1.5)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 110, stagger: 0.06, duration: 1.05, ease: 'expo.out' }, 0.45)
      .add(paint('.hero .stroke', { duration: 0.95 }), 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.facts', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.tags li', { x: -12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.2)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    // Краска «дышит»: пятна и рамка фото медленно меняют форму
    gsap.to('.blob--sun', { borderRadius: '44% 56% 40% 60% / 58% 42% 58% 42%', rotate: 6, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    gsap.to('.portrait', { borderRadius: '55% 45% 52% 48% / 46% 56% 44% 54%', duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    gsap.to('.blob--rose', { y: -8, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });
    gsap.to('.blob--violet', { y: 7, x: -4, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });
    // Лёгкий параллакс пятна при прокрутке
    gsap.to('.hero__art .blob--sun', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- заголовки секций: строки + мазок + рукописная подпись ---------- */
    $$('main section:not(.hero) .sec-head').forEach(head => {
      gsap.from(head.querySelector('.eyebrow'), { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: head, start: 'top 85%' } });
      revealLines(head.querySelector('.sec-title'), head);
      paint(head.querySelector('.stroke'), { delay: 0.55, scrollTrigger: { trigger: head, start: 'top 84%' } });
      write(head.querySelector('.note'), { delay: 0.85, scrollTrigger: { trigger: head, start: 'top 84%' } });
    });

    /* ---------- 2. Клуб: каждый пункт «окрашивается» каплей своей краски ---------- */
    gsap.from('.club__intro', { y: 18, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.club__intro', start: 'top 88%' } });
    const items = $$('.palette__item');
    gsap.set(items, { y: 30, autoAlpha: 0 });
    gsap.set('.swatch i', { scale: 0, rotate: -50 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
        gsap.to(els.map(el => el.querySelector('.swatch i')), { scale: 1, rotate: 0, duration: 0.9, stagger: 0.12, delay: 0.25, ease: 'back.out(1.7)' });
      },
    });
    // Маркер: методы выделяются по очереди
    gsap.fromTo('.mk', { backgroundSize: '0% 42%' }, {
      backgroundSize: '100% 42%', duration: 0.85, stagger: 0.38, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.methods', start: 'top 80%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.result', start: 'top 82%' } })
      .fromTo('.result__paint', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.result__text', { y: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.45)
      .from('.result .btn', { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.7);

    /* ---------- 3. Марафон: 14 дней заливаются красками один за другим ---------- */
    const days = $$('.day');
    gsap.timeline({ scrollTrigger: { trigger: '.days', start: 'top 82%' } })
      .from(days, { scale: 0.6, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: 'back.out(2)' })
      .from(days.map(d => d.querySelector('i')), { scale: 0, rotate: -60, duration: 0.7, stagger: 0.11, ease: 'power2.out' }, 0.35)
      .from(days.map(d => d.querySelector('b')), { color: 'rgba(246, 239, 227, .6)', duration: 0.4, stagger: 0.11 }, 0.45);
    gsap.from('.marathon__quote', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.marathon__quote', start: 'top 90%' } });
    revealLines('.marathon__invite', '.marathon__side');
    gsap.timeline({ scrollTrigger: { trigger: '.practice', start: 'top 86%' } })
      .from('.practice', { y: 26, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
      .fromTo('.practice__bar span', { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'expo.inOut' }, 0.3);
    gsap.from('.steps__lead', { y: 12, autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: '.steps__lead', start: 'top 92%' } });
    gsap.from('.steps li', { x: -18, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 90%' } });
    gsap.from('.steps li span', { scale: 0, duration: 0.6, stagger: 0.12, delay: 0.15, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.steps', start: 'top 90%' } });
    gsap.from('.marathon .btn', { y: 18, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.marathon .btn', start: 'top 95%' } });

    gsap.from('.concept-end__paint', { scale: 0.3, autoAlpha: 0, duration: 1.2, delay: 0.25, ease: 'expo.out', scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
