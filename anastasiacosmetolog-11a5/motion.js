// Анастасия Коробейникова — моушн концепта. Идея: луч дерматоскопа проходит по портрету и «проявляет» резкое фото из мягкого.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const sharp = $('.arch__sharp');
    const scan = $('.scan');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 400px 400px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 400px 400px 26px 26px)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.arch__soft', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.2)
      .from('.chip', { x: -30, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 2.2);

    // Луч: сверху вниз, за ним проявляется резкий портрет
    gsap.set(sharp, { clipPath: 'inset(0% 0% 100% 0%)' });
    const scanH = () => scan.parentElement.offsetHeight;   // сдвиг декора — только transform (cls)
    gsap.set(scan, { y: 0, autoAlpha: 0 });
    gsap.timeline({ delay: 0.75 })
      .to(scan, { autoAlpha: 1, duration: 0.25 }, 0)
      .to(sharp, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'power2.inOut', onComplete: () => gsap.set(sharp, { clearProps: 'clipPath' }) }, 0.1)
      .to(scan, { y: scanH, duration: 1.7, ease: 'power2.inOut' }, 0.1)
      .to(scan, { autoAlpha: 0, duration: 0.3 }, 1.6);
    // Потом изредка — лёгкий блик луча
    gsap.timeline({ repeat: -1, repeatDelay: 6.5, delay: 6, repeatRefresh: true })
      .set(scan, { y: 0 })
      .to(scan, { autoAlpha: 0.55, duration: 0.3 })
      .to(scan, { y: scanH, duration: 2.4, ease: 'sine.inOut' }, '<')
      .to(scan, { autoAlpha: 0, duration: 0.4 }, '-=0.5');

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    gsap.to('.arch img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Приём ---------- */
    revealLines('.visit h2', '.visit .sec-head');
    gsap.from('.visit .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.visit .sec-head', start: 'top 82%' } });
    gsap.from('.price', {
      y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.visit__grid', start: 'top 86%' },
    });
    // Цена появляется целиком, без счётчика
    gsap.from('.price__sum', { y: 14, autoAlpha: 0, duration: 0.9, delay: 0.25, scrollTrigger: { trigger: '.price', start: 'top 80%' } });
    $$('.facts').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } });
      tl.from(card, { y: 44, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
        .from($$('li', card), { x: -16, autoAlpha: 0, stagger: 0.09, duration: 0.6, ease: 'power2.out' }, 0.25);
    });

    /* ---------- 3. Отзывы ---------- */
    revealLines('.reviews h2', '.reviews .sec-head');
    gsap.from('.reviews .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reviews .sec-head', start: 'top 82%' } });
    gsap.from('.rows', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.rows', start: 'top 88%' }, clearProps: 'clipPath' });
    gsap.from('.row', { y: 26, autoAlpha: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '.rows', start: 'top 88%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
