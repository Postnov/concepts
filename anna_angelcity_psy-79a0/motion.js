// Анна Федоровцева — моушн концепта. Идея: «вернуть себе себя»: несколько размытых «я» сходятся в одно чёткое портретное фото.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' }, onComplete: () => split.revert() });
  }

  MotionBase.ready(() => {
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.35)
      .from('.frame', { autoAlpha: 0, duration: 1.2 }, 0.2)
      .from('.frame img', { scale: 1.25, filter: 'blur(14px)', duration: 2, ease: 'expo.out' }, 0.2)
      // «я» сходятся: размытые копии разъезжаются из центра и растворяются в чётком
      .fromTo('.ghost--a', { xPercent: -26, rotation: -7, opacity: 0.75 }, { xPercent: 0, rotation: 0, opacity: 0, duration: 2.2, ease: 'expo.inOut' }, 0.3)
      .fromTo('.ghost--b', { xPercent: 26, rotation: 7, opacity: 0.75 }, { xPercent: 0, rotation: 0, opacity: 0, duration: 2.2, ease: 'expo.inOut' }, 0.3)
      .from('.portrait__tag', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.methods li', { y: 14, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.05)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.35);

    // при прокрутке «я» снова чуть расходятся — и сходятся обратно
    ['.ghost--a', '.ghost--b'].forEach((g, i) => gsap.to(g, {
      xPercent: i ? 14 : -14, opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true, immediateRender: false },
    }));

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small):not(.btn--light)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' } });
    const rows = $$('.asks li');
    gsap.set(rows, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(rows, { start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }) });

    revealLines('.therapy h2', '.therapy .sec-head');
    gsap.from('.therapy .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.therapy .sec-head', start: 'top 82%' } });
    gsap.from('.price-card', { y: 50, autoAlpha: 0, duration: 1.05, ease: 'expo.out', scrollTrigger: { trigger: '.price-card', start: 'top 86%' } });
    gsap.from('.price-card__price', { y: 14, autoAlpha: 0, duration: 0.8, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.price-card', start: 'top 86%' } });
    gsap.from('.note', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.therapy__side', start: 'top 88%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
