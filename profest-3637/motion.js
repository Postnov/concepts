// ПРОФЭСТ — моушн концепта. Фирменная идея: печать. На свидетельство с глухим «ударом» ставится печать, тип документа меняется.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.35)
      .from('.doc__sheet', { y: 60, rotate: -3, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.45)
      .from('.doc__gov, .doc__title, .doc__kind, .doc__lines i, .doc__sign', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3);

    /* Печать: падает сверху, тип документа переключается; цикл ~5.5 с */
    const seal = $('.seal svg');
    const kindA = $('.doc__kind-a'), kindB = $('.doc__kind-b');
    const stamp = (swapTo) => {
      const tl = gsap.timeline();
      if (swapTo) tl.to(swapTo.out, { autoAlpha: 0, y: -8, duration: 0.3 }, 0).fromTo(swapTo.in, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2);
      tl.fromTo(seal, { scale: 1.9, autoAlpha: 0, rotate: -22 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.34, ease: 'power4.in' }, 0.1)
        .to('.doc__sheet', { y: 4, duration: 0.07, ease: 'power2.out' })
        .to('.doc__sheet', { y: 0, duration: 0.5, ease: 'elastic.out(1, .5)' })
        .fromTo('.seal__o', { strokeWidth: 7 }, { strokeWidth: 2.2, duration: 0.5, ease: 'power2.out' }, '<');
      return tl;
    };
    intro.add(stamp(null), 1.45); // первый удар печати — внутри интро
    gsap.timeline({ repeat: -1, delay: 4.6 })
      .add(stamp({ out: kindA, in: kindB }))
      .to({}, { duration: 2.8 })
      .add(stamp({ out: kindB, in: kindA }))
      .to({}, { duration: 2.8 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* ---------- 2. Предложение ---------- */
    revealLines('.offer h2', '.offer .sec-head');
    gsap.from('.offer .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 84%' } });
    gsap.from('.offer__quote', { y: 26, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.offer__grid', start: 'top 82%' } });
    gsap.fromTo('.und', { '--u': '0%' }, { '--u': '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.5, scrollTrigger: { trigger: '.offer__grid', start: 'top 74%' } });
    gsap.from('.steps li', { x: 30, autoAlpha: 0, duration: 0.8, stagger: 0.16, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 88%' } });
    gsap.from('.offer__license', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer__license', start: 'top 94%' } });

    /* ---------- 3. Курсы ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' } });
    $$('.course').forEach((c, i) => {
      gsap.from(c, {
        y: 60, rotate: (i % 2 ? 1 : -1) * 2.2, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: c, start: 'top 90%' },
      });
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
