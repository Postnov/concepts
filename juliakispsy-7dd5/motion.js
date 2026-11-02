// Юлия Киселёва — моушн концепта.
// Фирменная идея: круги, которые находят друг друга и пересекаются — как диаграмма подходов на её Taplink
// и как двое в парной терапии. В hero круги вокруг портрета сходятся и тихо «дышат» относительно друг друга,
// в блоке подходов три круга при прокрутке съезжаются в диаграмму, в тарифах — один, два и пять кругов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name > span', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const quote = SplitText.create('.hero__quote p', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const num = $('.orbit__num');
    const count = { v: 0 };
    num.textContent = '0';

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); quote.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.3)
      // портрет раскрывается кругом из центра
      .fromTo('.orbit__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' }, 0.2)
      .from('.orbit__photo img', { scale: 1.35, duration: 2.1, ease: 'expo.out' }, 0.4)
      .from('.orbit__shade', { autoAlpha: 0, duration: 1.2, ease: 'power1.out' }, 0.9)
      // тонкая орбита и второй круг прорисовываются линией
      .fromTo('.orbit__guide circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.4)
      .fromTo('.orbit__ring circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.7)
      // второй круг подъезжает и ложится внахлёст на портрет
      .from('.orbit__ring', { x: 46, y: 26, duration: 1.9, ease: 'expo.out' }, 0.7)
      .from('.orbit__note', { y: 8, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.orbit__badge', { x: -56, scale: 0.6, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.9)
      .to(count, { v: 1500, duration: 1.8, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(count.v); } }, 1.0)
      .from(quote.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 0.8)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1)
      .from('.hero__bio li', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.3);

    // Круги не стоят на месте: медленно сближаются и расходятся, пересечение «дышит»
    gsap.to('.orbit__ring', { x: 9, y: -7, duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.7 });
    gsap.to('.orbit__badge', { x: 7, y: -5, duration: 4.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.5 });

    // Лёгкий параллакс портрета внутри круга
    gsap.to('.orbit__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. С чем я работаю ---------- */
    revealLines('.work h2', '.work .sec-head');
    fadeUp('.work .eyebrow', '.work .sec-head');

    $$('.topic').forEach(card => {
      gsap.from(card, {
        y: 56, autoAlpha: 0, duration: 1.15, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 90%' },
      });
      const silk = $('.topic__silk img', card);
      if (silk) gsap.from(silk, { scale: 1.3, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      // в метке «пара» два круга съезжаются внахлёст
      const marks = $$('.mark i', card);
      if (marks.length > 1) {
        gsap.from(marks, { x: i => (i ? 12 : -12), duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 80%' } });
      }
      const rows = $$('.topic__list li', card);
      gsap.set(rows, { y: 18, autoAlpha: 0 });
      ScrollTrigger.batch(rows, {
        start: 'top 93%', once: true,
        onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }),
      });
    });

    /* Подходы: три круга съезжаются в диаграмму вместе с прокруткой */
    revealLines('.approach__title', '.approach');
    fadeUp('.approach__text p', '.approach');
    // once: после схождения диаграмма остаётся собранной и не разъезжается при прокрутке назад
    gsap.timeline({ scrollTrigger: { trigger: '.venn', start: 'top 90%', end: 'center 55%', scrub: 0.8, once: true } })
      .from('.venn__c--top', { yPercent: -22, autoAlpha: 0.2, ease: 'none' }, 0)
      .from('.venn__c--left', { xPercent: -26, yPercent: 14, autoAlpha: 0.2, ease: 'none' }, 0)
      .from('.venn__c--right', { xPercent: 26, yPercent: 14, autoAlpha: 0.2, ease: 'none' }, 0)
      .from('.venn__dot', { scale: 0, autoAlpha: 0, duration: 0.2, ease: 'back.out(3)' }, 0.85);

    /* ---------- 3. Тарифы ---------- */
    revealLines('.prices h2', '.prices .sec-head');
    fadeUp('.prices .eyebrow', '.prices .sec-head');
    gsap.fromTo('.prices__silk img', { yPercent: -8 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.prices', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    $$('.card').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } });
      tl.from(card, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.card__price span', card), { yPercent: 100, duration: 1, ease: 'expo.out' }, 0.25);
      const marks = $$('.mark i', card);
      if (marks.length === 2) tl.from(marks, { x: i => (i ? 12 : -12), duration: 1.2, ease: 'expo.out' }, 0.2);
      else tl.from(marks, { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.09, ease: 'back.out(2.4)' }, 0.25);
    });
    fadeUp('.ask', '.ask', { y: 24 });
    gsap.from('.ask__photo img', { scale: 1.4, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.ask', start: 'top 88%' } });

    fadeUp('.concept-end > *', '.concept-end', { stagger: 0.1 });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
