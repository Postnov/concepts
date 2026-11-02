// Татьяна — моушн концепта. Фирменная идея — колода: в первом экране карты раскрываются веером из-за её фото,
// в раскладах каждая карта-тариф переворачивается рубашкой вниз, как вытянутая из колоды.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!(window.MotionBase && MotionBase.init())) return; // статичная страница полностью рабочая
  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const mm = gsap.matchMedia();

    /* ---------- 1. Hero: колода раскрывается веером ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const cards = $$('.fan__card');
    const mid = (cards.length - 1) / 2;

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.glow', { scale: 0.4, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.1)
      // колода лежит стопкой и поднимается
      .from(cards, { y: 70, autoAlpha: 0, duration: 0.8, stagger: { each: 0.05, from: 'center' } }, 0.15)
      // и раскрывается веером от центральной карты
      .from(cards, { rotation: 0, duration: 1.4, ease: 'expo.inOut', stagger: i => Math.abs(i - mid) * 0.05 }, 0.55)
      .fromTo('.medal__ring', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.2, ease: 'expo.inOut' }, 0.7)
      .from('.medal img', { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.85)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.9)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 1.0)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.3)
      .from('.facts li', { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.4)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.55);

    // Веер едва покачивается, как карты в руке
    gsap.to('.fan', { rotation: 2.2, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });

    // При уходе первого экрана колода чуть оседает
    gsap.to('.hero__stage', {
      yPercent: 8, scale: 0.94, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.hero .btn, .steps__cta .btn').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* ---------- 2. Расклады: карты переворачиваются ---------- */
    revealLines('.spreads h2', '.spreads .sec-head');
    gsap.from(['.spreads .eyebrow', '.spreads .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.spreads .sec-head', start: 'top 82%' },
    });

    const flip = els => {
      const tl = gsap.timeline();
      els.forEach((card, i) => {
        tl.fromTo(card, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, i * 0.16)
          .fromTo($('.tcard__inner', card), { rotateY: 180 }, { rotateY: 0, duration: 1.25, ease: 'power3.inOut' }, i * 0.16 + 0.35)
          .from($$('.tcard__face > *', card), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, i * 0.16 + 0.95);
      });
    };
    const tcards = $$('.tcard');
    // На мобильном карты переворачиваются по одной при прокрутке, на десктопе — раскладом, все четыре подряд
    mm.add('(max-width: 899px)', () => {
      tcards.forEach(card => {
        gsap.set(card, { autoAlpha: 0 });
        ScrollTrigger.create({ trigger: card, start: 'top 86%', once: true, onEnter: () => flip([card]) });
      });
    });
    mm.add('(min-width: 900px)', () => {
      gsap.set(tcards, { autoAlpha: 0 });
      ScrollTrigger.create({ trigger: '.deck', start: 'top 80%', once: true, onEnter: () => flip(tcards) });
    });

    /* ---------- 3. Как записаться ---------- */
    revealLines('.steps h2', '.steps .sec-head');
    gsap.from('.steps .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.steps .sec-head', start: 'top 82%' } });
    gsap.to('.steps__thread span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps__list', start: 'top 70%', end: 'bottom 65%', scrub: true },
    });
    const steps = $$('.step');
    gsap.set(steps, { autoAlpha: 0 });
    ScrollTrigger.batch(steps, {
      start: 'top 88%', once: true,
      onEnter: els => {
        gsap.to(els, { autoAlpha: 1, duration: 0.01, stagger: 0.12 });
        gsap.from(els.map(el => $('.step__num', el)), { rotateY: -180, transformPerspective: 600, duration: 1, stagger: 0.12, ease: 'power3.inOut' });
        gsap.from(els.map(el => $$('.step__text, .step__note', el)).flat(), { x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.25, ease: 'power3.out' });
      },
    });
    gsap.from('.steps__cta .btn', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.steps__cta', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
