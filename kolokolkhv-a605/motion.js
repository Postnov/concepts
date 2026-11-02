// Гончарная школа «Колокол» — моушн концепта. Идея: колокол-ваза «вытачивается» на гончарном круге, флажки качаются, фото «вырастают» как глина.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.0, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }
  const rise = (el, opts = {}) => gsap.fromTo(el,
    { clipPath: 'inset(100% 0% 0% 0% round 22px)' },
    Object.assign({ clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'expo.inOut' }, opts));

  MotionBase.ready(() => {
    /* ---------- Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const flags = $$('.flag');
    flags.forEach(g => {
      const [x, y] = g.querySelector('polygon').getAttribute('points').split(' ')[0].split(',').map(Number);
      gsap.set(g, { svgOrigin: `${x + 14} ${y}` });
    });
    const clayTl = gsap.timeline({ delay: 0.5 });
    gsap.set('.bell__clay', { svgOrigin: '100 194' });
    clayTl
      .fromTo('.bell__clay', { scaleY: 0.04, scaleX: 1.06 }, { scaleY: 1, scaleX: 1, duration: 1.8, ease: 'power3.out' })
      .to('.bell__clay', { scaleX: 0.96, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.3)
      .to('.bell__clay', { scaleX: 1, duration: 0.3 }, '>');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(flags, { rotation: 38, yPercent: -40, autoAlpha: 0, duration: 1.1, stagger: 0.06, ease: 'elastic.out(1, .5)' }, 0.1)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 118, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.35)
      .from('.bell', { autoAlpha: 0, duration: 0.5 }, 0.4)
      .add(rise('.tile--a', { duration: 1.2 }), 0.55)
      .add(rise('.tile--b', { duration: 1.2 }), 0.75)
      .from('.tile img', { scale: 1.35, duration: 1.8, ease: 'expo.out', stagger: 0.2 }, 0.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__note', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2);

    /* Постоянно: круг крутится (бегущий пунктир на ободе и рёбрах), флажки покачиваются */
    gsap.to('.bell__wheel-rim', { strokeDashoffset: -72, duration: 2.4, ease: 'none', repeat: -1 });
    gsap.to('.bell__ribs path', { strokeDashoffset: -68, duration: 2.8, ease: 'none', repeat: -1, stagger: 0.3 });
    flags.forEach((g, i) => gsap.to(g, { rotation: i % 2 ? 5 : -5, duration: 1.6 + (i % 3) * 0.25, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 + i * 0.1 }));

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.4 + i });
    });

    /* ---------- Расписание ---------- */
    revealLines('.afisha h2', '.afisha .sec-head');
    gsap.from(['.afisha .eyebrow', '.afisha .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.afisha .sec-head', start: 'top 85%' } });
    $$('.day').forEach(day => {
      gsap.fromTo($('.day__pill', day), { clipPath: 'inset(0% 100% 0% 0% round 20px)' }, {
        clipPath: 'inset(-10% -4% -10% -4% round 20px)', duration: 1.0, ease: 'expo.inOut',
        scrollTrigger: { trigger: day, start: 'top 85%' },
      });
      const cards = $$('.item', day);
      ScrollTrigger.batch(cards, {
        start: 'top 92%', once: true,
        onEnter: els => {
          els.forEach((el, i) => {
            const tl = gsap.timeline({ delay: i * 0.08 });
            tl.add(rise($('.item__ph', el), { duration: 1.0 }), 0)
              .from($('img', el), { scale: 1.3, duration: 1.4, ease: 'expo.out' }, 0)
              .from($$('.item__t, .item__m, .item__p', el), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.35);
          });
        },
      });
      gsap.set($$('.item__ph', day), { clipPath: 'inset(100% 0% 0% 0% round 22px)' });
    });

    /* ---------- Контакты ---------- */
    revealLines('.contacts h2', '.contacts .sec-head');
    gsap.from('.contacts .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.contacts .sec-head', start: 'top 85%' } });
    gsap.from('.addr', { y: 40, autoAlpha: 0, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: '.addr', start: 'top 88%' } });
    gsap.from('.addr__pin', { y: -70, autoAlpha: 0, duration: 1.1, ease: 'bounce.out', scrollTrigger: { trigger: '.addr', start: 'top 80%' } });
    gsap.from('.link', { x: 30, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.links', start: 'top 88%' } });

    /* ---------- Только в демо ---------- */
    if ($('.concept-end')) gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    /* ---------- Только в полной версии ---------- */
    if ($('.siteband')) {
      gsap.from('.siteband', { y: 50, autoAlpha: 0, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: '.siteband', start: 'top 88%' } });
      gsap.fromTo('.siteband__bg img', { yPercent: -8, scale: 1.1 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.siteband', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.siteband__t', { letterSpacing: '0.3em', autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.siteband', start: 'top 75%' } });
      gsap.from(['.siteband__p', '.siteband .btn'], { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '.siteband', start: 'top 65%' } });
    }
    if ($('.holi')) {
      revealLines('.holi h2', '.holi .sec-head');
      gsap.from('.holi .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.holi .sec-head', start: 'top 85%' } });
      gsap.from('.hcard', { yPercent: 18, rotation: (i) => (i ? 2.5 : -2.5), autoAlpha: 0, duration: 1.1, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '.holi__grid', start: 'top 88%' } });
    }
    if ($('.cafe')) {
      gsap.from('.cafe__in > *', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.1, scrollTrigger: { trigger: '.cafe', start: 'top 78%' } });
      gsap.fromTo('.cafe__ph', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(-6% -6% -6% -6%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: '.cafe__ph', start: 'top 85%' } });
    }
    if ($('.foot')) gsap.from('.foot > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.foot', start: 'top 90%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
