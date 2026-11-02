// Ангелина Акулова — моушн концепта. Фирменная идея «палитра образа»: веер образцов цвета, снятых с её фото
// (молоко, песок, тауп, карамель, шоколад, эспрессо), раскрывается из-под снимка и складывается при прокрутке;
// те же образцы метят пункты «кому подойдёт», а карточка курса собирается из полос палитры, как закрытый веер —
// «все вещи сочетаются между собой». Без GSAP и при reduced motion — статичная страница с раскрытым веером.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Строки заголовка из-под маски; после анимации нарезку снимаем, чтобы переносы жили при ресайзе
  function revealLines(targets, trigger, delay = 0) {
    gsap.utils.toArray(targets).forEach((el, i) => {
      const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.05, stagger: 0.1, delay: delay + i * 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход и веер палитры ---------- */
    const l1 = SplitText.create('.hero__l1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const l2 = SplitText.create('.hero__l2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const chips = $$('.fan__chip');

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { l1.revert(); l2.revert(); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__meta > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.2)
      .from(l1.chars, { yPercent: 112, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.25)
      .from(l2.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.42)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.hero__photo img', { scale: 1.26, duration: 2, ease: 'expo.out' }, 0.3)
      // Образцы лежат стопкой под фото и по одному выходят веером (без пружины — плавный expo)
      .from('.fan__rivet', { scale: 0, autoAlpha: 0, duration: 0.5 }, 0.85)
      .fromTo(chips, { '--open': 0 }, { '--open': 1, duration: 1.6, ease: 'expo.out', stagger: { each: 0.08, from: 'end' } }, 0.95)
      .from(chips, { autoAlpha: 0, duration: 0.35, ease: 'power1.out', stagger: { each: 0.08, from: 'end' } }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 }, 0.8)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.0)
      .from(['.hero__author', '.roles li'], { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.1)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.25);

    // При прокрутке веер складывается под снимок, фото чуть уходит вверх
    gsap.to('.fan', {
      '--fold': 0.3, ease: 'none',
      scrollTrigger: { trigger: '.hero__stage', start: 'center 45%', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero__stage', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Кому подойдёт ---------- */
    revealLines('.fit .title > span', '.fit__head');
    fadeUp('.fit .eyebrow', '.fit__head');
    gsap.timeline({ scrollTrigger: { trigger: '.fit__head', start: 'top 80%' } })
      .from('.fit__arrow', { rotate: -90, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.3)
      .from('.fit__arrow i', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.8, ease: 'power3.out' }, 0.55);

    // Каждый пункт вытягивается, как полоса образца, а цветной образец «прорастает» снизу
    const items = $$('.fit__item');
    gsap.set(items, { clipPath: 'inset(0% 100% 0% 0% round 8px)' });
    gsap.set($$('.chip', $('.fit__list')), { scaleY: 0 });
    gsap.set($$('.fit__item p'), { x: 14, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.1, stagger: 0.1, ease: 'expo.inOut' });
        gsap.to(els.map(el => $('.chip', el)), { scaleY: 1, duration: 0.8, stagger: 0.1, delay: 0.45, ease: 'power3.out' });
        gsap.to(els.map(el => $('p', el)), { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, delay: 0.4, ease: 'power3.out' });
      },
    });

    // «И главное»: тауповая полоса выезжает слева, фото проявляется
    const pointBody = SplitText.create('.point__body', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.timeline({ scrollTrigger: { trigger: '.point', start: 'top 80%' }, onComplete: () => pointBody.revert() })
      .fromTo('.point', { clipPath: 'inset(0% 100% 0% 0% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.point__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from('.point__title', { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.6)
      .from(pointBody.lines, { yPercent: 100, stagger: 0.07, duration: 0.9, ease: 'expo.out' }, 0.7);

    /* ---------- 3. Оплата ---------- */
    revealLines('.offer .title > span', '.offer .sec-head');
    fadeUp('.offer .sec-head .eyebrow', '.offer .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.offer__photo', start: 'top 82%' } })
      .fromTo('.offer__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.offer__photo img', { scale: 1.28, duration: 1.9, ease: 'expo.out' }, 0.15);

    // Карточка курса: полосы палитры заходят веером и складываются в одну карточку
    gsap.timeline({ scrollTrigger: { trigger: '.ticket', start: 'top 82%' } })
      .from('.ticket__band', {
        rotate: i => [-9, -5.5, -2.5][i], y: 46, autoAlpha: 0, transformOrigin: '0% 100%',
        duration: 1.25, stagger: 0.13, ease: 'expo.out',
      })
      .from('.inc li', { x: -12, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out' }, 0.35)
      .from('.gifts li', { x: -12, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.55);
    // Цена появляется целиком, без счётчика; старая — перечёркивается
    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 90%' } })
      .from('.price__old', { autoAlpha: 0, duration: 0.5 }, 0.3)
      .fromTo('.price__old', { '--strike': 0 }, { '--strike': 1, duration: 0.7, ease: 'power2.inOut' }, 0.55)
      .from('.price__now', { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.7)
      .from('.ticket .btn', { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.9);

    revealLines('.quote p', '.quote');
    fadeUp('.after .eyebrow', '.after');
    fadeUp('.after__list li', '.after__list', { stagger: 0.12 });
    fadeUp('.concept-end > *', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
