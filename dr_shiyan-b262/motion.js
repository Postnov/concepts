// Юлиана Шиян — моушн концепта. Идея: «чистая кожа» — красные пятна на фоне героя гаснут одно за другим, остаётся ровное сияние.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  MotionBase.ready(() => {
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const spots = $$('.spot');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.8)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__quote', { x: -14, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.25)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    // Пятна проступают, пульсируют и по очереди гаснут: кожа очищается, проявляется сияние
    gsap.from(spots, { scale: 0, autoAlpha: 0, duration: 0.7, stagger: { each: 0.06, from: 'random' }, ease: 'back.out(2)' });
    gsap.to(spots, { scale: 0, autoAlpha: 0, duration: 0.9, stagger: { each: 0.22, from: 'random' }, ease: 'power2.in', delay: 2.1 });
    gsap.to('.skin__glow', { opacity: 1, duration: 2.6, delay: 2.6, ease: 'sine.inOut' });

    gsap.utils.toArray('.hero .btn').forEach(btn => gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 }));

    const head = (sec) => {
      const split = SplitText.create(`${sec} h2`, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 82%' }, onComplete: () => split.revert() });
      gsap.from(`${sec} .eyebrow`, { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 82%' } });
    };
    head('.how'); head('.links');

    gsap.from('.step', { y: 50, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
    gsap.from('.row', { x: -24, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 85%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
