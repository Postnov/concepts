// Ольга Алексеева — моушн концепта. Идея: «рама». Линии рамы рисуются вокруг портрета и под каждым разделом,
// по стеклу изредка проходит блик, как в музейном зале.
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
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const lines = $$('.hero .fr i');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.wall', { autoAlpha: 0, duration: 2.2, ease: 'sine.out' }, 0.1)
      .from(lines.filter((_, i) => i % 2 === 0), { scaleX: 0, duration: 1.2, stagger: 0.2, ease: 'expo.inOut' }, 0.15)
      .from(lines.filter((_, i) => i % 2 === 1), { scaleY: 0, duration: 1.2, stagger: 0.2, ease: 'expo.inOut' }, 0.25)
      .from('.frame', { backgroundColor: 'rgba(235,229,223,0)', duration: 1.2, ease: 'sine.inOut' }, 0.7)
      .from('.frame img', { autoAlpha: 0, scale: 1.18, duration: 1.8, ease: 'expo.out' }, 0.8)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.pills li', { scale: 0.8, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(1.8)' }, 1.1)
      .from('.hero__btns .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    /* Блик на стекле рамы раз в несколько секунд */
    gsap.fromTo('.glare', { '--g': '-130%' }, { '--g': '130%', duration: 1.8, ease: 'power2.inOut', repeat: -1, repeatDelay: 5.5, delay: 3 });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo .frame img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Разделы ---------- */
    revealLines('.rooms h2', '.rooms .sec-head');
    gsap.from('.rooms .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.rooms .sec-head', start: 'top 82%' } });
    const rooms = $$('.room');
    rooms.forEach(room => {
      gsap.set($$('a > *', room), { autoAlpha: 0, y: 22 });
      gsap.set($('.room__line', room), { scaleX: 0 });
      ScrollTrigger.create({
        trigger: room, start: 'top 90%', once: true,
        onEnter: () => {
          gsap.timeline()
            .to($('.room__line', room), { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
            .to($$('a > *', room), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.2);
        },
      });
    });

    /* ---------- 3. Связь ---------- */
    revealLines('.links h2', '.links .sec-head');
    gsap.from('.links .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.links .sec-head', start: 'top 82%' } });
    gsap.from('.soc', {
      y: 44, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.links__grid', start: 'top 88%' },
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
