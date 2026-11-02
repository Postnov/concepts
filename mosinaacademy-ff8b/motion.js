// Mosina Academy — моушн концепта. Идея: «точный разрез» — тонкая линия-скальпель проходит по логотипу и по заголовкам секций.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const disc = $('.disc');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.ring', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.8, stagger: 0.2, ease: 'power2.inOut', clearProps: 'strokeDashoffset' }, 0.1)
      .fromTo(disc, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' }, 0.2)
      .from('.disc img', { scale: 1.5, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.45)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2);

    // Линия-разрез проходит по логотипу раз в несколько секунд
    const cutH = () => document.querySelector('.disc__cut').parentElement.offsetHeight;   // сдвиг декора — только transform (cls)
    gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 2.2, repeatRefresh: true })
      .set('.disc__cut', { y: 0, autoAlpha: 0 })
      .to('.disc__cut', { autoAlpha: 1, duration: 0.2 })
      .to('.disc__cut', { y: cutH, duration: 1.6, ease: 'power2.inOut' }, '<')
      .to('.disc__cut', { autoAlpha: 0, duration: 0.25 }, '-=0.25');

    // Пунктирное кольцо медленно вращается
    gsap.to('.ring--2', { rotation: 360, duration: 60, ease: 'none', repeat: -1 });
    gsap.to('.hero__mark', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* ---------- Об академии ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 85%' } });
    $$('.fact').forEach(f => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 88%' } });
      tl.from(f.querySelector('.fact__num'), { autoAlpha: 0, x: -10, duration: 0.6 })
        .from(f.querySelector('.fact__text'), { y: 28, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.1);
    });
    gsap.from('.brands li', { scale: 0.7, autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.7, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.brands', start: 'top 90%' } });

    /* ---------- Ссылки ---------- */
    revealLines('.links h2', '.links .sec-head');
    gsap.from('.links .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.links .sec-head', start: 'top 85%' } });
    const rows = $$('.rows li');
    gsap.set(rows, { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
