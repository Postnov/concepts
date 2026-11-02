// Яна Александровна — моушн концепта. Фирменное: «побег» — стебель растёт и раскрывает листья вместе с фото и при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  if (!animate) {  return; }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const LEAF = { scale: 0, transformOrigin: '0% 50%', ease: 'back.out(1.7)' };

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.32, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.hero .sprig__stem', { strokeDashoffset: 1, duration: 1.7, ease: 'power2.inOut', stagger: 0.15 }, 0.45)
      .from('.hero .leaf', { ...LEAF, duration: 0.7, stagger: { each: 0.055, from: 'start' } }, 0.75)
      .from('.hero .label', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    /* Ветер: побеги чуть покачиваются */
    gsap.to('.hero .sprig', { rotation: 2.4, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.7, delay: 2.4, transformOrigin: '50% 100%' });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small):not(.btn--light)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Консультация ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from(['.consult .eyebrow', '.consult .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.consult .sec-head', start: 'top 82%' },
    });
    gsap.to('.steps__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 62%', scrub: true },
    });
    $$('.steps__list li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 86%', once: true } })
        .from($('.mark', li), { scale: 0, rotation: -50, transformOrigin: '10% 90%', duration: 0.8, ease: 'back.out(2)' })
        .from($('p', li), { x: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.08);
    });
    gsap.timeline({ scrollTrigger: { trigger: '.pcard', start: 'top 84%' } })
      .fromTo('.pcard', { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, ease: 'expo.inOut' })
      // Цена появляется целиком, без счётчика
      .from('.pcard__price', { y: 22, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.55)
      .from(['.pcard__meta', '.pcard__title', '.pcard__text p', '.pcard .btn'], { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.7);

    /* ---------- 3. Сопровождение: побег растёт по мере прокрутки ---------- */
    revealLines('.support h2', '.support .sec-head');
    gsap.from('.support .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.support .sec-head', start: 'top 82%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.support', start: 'top 70%', end: 'bottom 70%', scrub: 0.8 } })
      .from('.support .sprig__stem', { strokeDashoffset: 1, ease: 'none', duration: 1 }, 0)
      .from('.support .leaf', { ...LEAF, ease: 'back.out(1.7)', duration: 0.08, stagger: { each: 0.055 } }, 0.04);
    gsap.from('.facts li', {
      y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.facts', start: 'top 88%' },
    });
    gsap.from(['.support__text', '.support .btn'], { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.support__text', start: 'top 90%' } });

    if ($('.concept-end')) gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });


    window.addEventListener('load', refresh, { once: true });
  });
})();
