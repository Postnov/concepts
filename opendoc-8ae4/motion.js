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
    /* ---------- интро: «открытая дверь» ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');
    const half = () => frame.offsetWidth / 2;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(0% 50% 0% 50% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .fromTo('.door--l', { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: () => -half(), duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .fromTo('.door--r', { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: () => half(), duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.chip', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3);

    // Пульс под заголовком: линия ЭКГ прорисовывается, гаснет и идёт снова
    const live = $('.pulse__live');
    gsap.set(live, { strokeDasharray: '1 1', strokeDashoffset: 1 });
    gsap.timeline({ repeat: -1, delay: 0.9 })
      .set(live, { strokeDashoffset: 1, autoAlpha: 1 })
      .to(live, { strokeDashoffset: 0, duration: 2.1, ease: 'power1.inOut' })
      .to(live, { autoAlpha: 0, duration: 0.7, delay: 1.3 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- «в сообществе вы найдёте» ---------- */
    revealLines('.find h2', '.find .sec-head');
    gsap.from('.find .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.find .sec-head', start: 'top 84%' } });
    const ecg = $('.find__ecg');
    if (ecg) gsap.to(ecg, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    $$('.find__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' }, defaults: { ease: 'power3.out' } })
        .from($('.find__num', item), { y: 24, autoAlpha: 0, duration: 0.8 }, 0)
        .from($('.find__title', item), { x: -26, autoAlpha: 0, duration: 0.85 }, 0.08)
        .from($('.find__text', item), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.22);
    });

    /* ---------- команда ---------- */
    revealLines('.team h2', '.team .sec-head');
    gsap.from('.team .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.team .sec-head', start: 'top 84%' } });
    $$('.doc').forEach(card => {
      const ph = $('.doc__photo', card);
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' }, defaults: { ease: 'power3.out' } });
      tl.from(card, { y: 56, autoAlpha: 0, duration: 0.95 }, 0)
        .fromTo(ph, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.1)
        .from($('img', ph), { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.1)
        .from($$('.doc__body > *', card), { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.45);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
