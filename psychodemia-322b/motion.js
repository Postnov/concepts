// Психодемия — моушн концепта. Знак «П» собирается из блоков, лента форматов едет сама, секции встают ступенями.
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
    /* ---------- Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.facts li', { y: 22, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.2)
      // знак «П» собирается из трёх блоков
      .from('.pm1', { y: -90, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.9)
      .from('.pm2', { x: -90, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 1.05)
      .from('.pm3', { x: 90, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 1.2);

    gsap.to('.hero__photo img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* ---------- Лента форматов ---------- */
    const track = $('.ticker__track');
    if (track) {
      track.append(...$$('span', track).map(s => s.cloneNode(true)));
      gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    }

    /* ---------- 01 Бесплатное ---------- */
    revealLines('.free h2', '.free .sec-head');
    gsap.from('.free .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.free .sec-head', start: 'top 84%' } });
    $$('.tile').forEach((el, i) => {
      gsap.from(el, { y: 60, rotate: i % 2 ? 1.4 : -1.4, autoAlpha: 0, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    gsap.from('.tile__img img', { scale: 1.25, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.tile--test', start: 'top 85%' } });

    /* ---------- 02 Магистратура ---------- */
    revealLines('.master h2', '.master h2');
    gsap.from('.master .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.master', start: 'top 80%' } });
    gsap.from('.master__body > *', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.master__body', start: 'top 88%' } });
    gsap.from('.feats li', { y: 36, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out', scrollTrigger: { trigger: '.feats', start: 'top 90%' } });
    gsap.from('.dod', { y: 36, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.dod', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
