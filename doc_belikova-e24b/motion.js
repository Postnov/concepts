// Вера Беликова — моушн концепта. Идея «наводка на резкость»: портрет сначала размыт, объектив-кольцо наводится и ловит фокус;
// запросы «отмечаются» галочками при прокрутке, как чек-лист скрининга.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: наводка на резкость ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.35, filter: 'blur(18px)', duration: 2.1, ease: 'expo.out' }, 0.3)
      .from('.lens', { scale: 1.35, rotation: -70, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.3)
      .from('.br', { scale: 1.7, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, 1.4)
      .from('.focus-chip', { x: -16, autoAlpha: 0, duration: 0.7 }, 1.9)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero__script', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.2)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.35);

    // Кольцо-объектив поворачивается вместе с прокруткой
    gsap.to('.lens', {
      rotation: 90, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* ---------- 2. Запросы: чек-лист ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' } });
    $$('.checks li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
      tl.from(li, { x: -18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
        .from($('.chk circle', li), { scale: 0.4, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.2)' }, 0.1)
        .from($('.chk path', li), { strokeDashoffset: 20, duration: 0.55, ease: 'power2.out' }, 0.38);
    });
    $$('.wants li').forEach((li, i) => {
      gsap.from(li, { y: 36, scale: 0.94, autoAlpha: 0, duration: 0.95, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 90%' } });
      gsap.from($('img', li), { scale: 0.6, rotation: -18, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 90%' } });
    });
    // Подпись «я знаю, как вам помочь» проявляется как рукописная: маска слева направо
    gsap.fromTo('.script-line', { clipPath: 'inset(-20% 100% -20% 0%)' }, {
      clipPath: 'inset(-20% -2% -20% 0%)', duration: 1.8, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.script-line', start: 'top 90%' },
    });

    /* ---------- 3. Цены ---------- */
    revealLines('.prices h2', '.prices .sec-head');
    gsap.from('.prices .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.prices .sec-head', start: 'top 82%' } });
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.cards', start: 'top 86%' },
    });
    $$('.card__price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    gsap.from('.pay-note', { x: -12, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.pay-note', start: 'top 92%' } });
    gsap.from('.prices .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.prices .btn', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
