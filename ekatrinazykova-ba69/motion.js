// «Инкогнито» — моушн концепта. Фирменная идея: рассекречивание.
// Ключевые слова спрятаны под красными плашками цензуры и «открываются» по мере прокрутки,
// а портрет на обложке проявляется из размытия — выходит из инкогнито.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP: статичная страница, все слова уже открыты

  // Плашка: --rd 1 → 0, сходит слева направо (фон привязан к правому краю)
  const declassify = (targets, vars = {}) => gsap.fromTo(targets, { '--rd': 1 }, {
    '--rd': 0, duration: 0.85, ease: 'power3.inOut', ...vars,
  });

  // Заголовок секции строками из-под маски; после анимации split снимаем
  function revealHead(scope) {
    const head = $(`${scope} .h2`);
    const split = SplitText.create(head, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 84%' }, onComplete: () => split.revert() })
      .from($('.eyebrow', head.parentElement), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .from(split.lines, { yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 0.05);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Обложка ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo', { clipPath: 'inset(14% 10% 18% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.05)
      .fromTo('.hero__photo img', { scale: 1.22, filter: 'blur(16px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.9, ease: 'expo.out', clearProps: 'filter' }, 0.15)
      .from('.hero__top > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(title.chars, { yPercent: 108, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from('.hero__q', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.85)
      .add(declassify('.hero__q .rd', { duration: 0.9 }), 1.05)
      .from('.hero__lines p', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.45);

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Программа: каждый пункт рассекречивается ---------- */
    revealHead('.program');
    gsap.from('.goal > *', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.goal', start: 'top 86%' },
    });
    $$('.file__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 86%' } })
        .from(item, { y: 22, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .add(declassify($$('.rd', item)), 0.35);
    });

    gsap.timeline({ scrollTrigger: { trigger: '.bonus', start: 'top 82%' } })
      .from('.bonus', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
      .from('.bonus__img img', { y: 30, rotate: -6, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.15)
      .from('.bonus__text > *', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.3);

    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 84%' } })
      .from('.price__label', { y: 10, autoAlpha: 0, duration: 0.6 }, 0)
      .add(declassify('.price .rd', { duration: 1 }), 0.25)
      .from('.price .btn', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.6);

    /* ---------- 3. Обо мне ---------- */
    revealHead('.trust');
    $$('.fact').forEach(fact => {
      const num = $('[data-count]', fact);
      const to = Number(num.dataset.count);
      const o = { v: 0 };
      gsap.timeline({ scrollTrigger: { trigger: fact, start: 'top 84%' } })
        .fromTo($('.fact__photo', fact), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' }, 0)
        .from($('.fact__photo img', fact), { scale: 1.3, duration: 1.7, ease: 'expo.out' }, 0.1)
        .from($('.fact__num', fact), { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.35)
        .to(o, {
          v: to, duration: to > 100 ? 1.6 : 1.1, ease: 'power2.out',
          onStart: () => { num.textContent = '0'; },
          onUpdate: () => { num.textContent = String(Math.round(o.v)); },
        }, 0.35)
        .from($('.fact__text', fact), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.5);
    });

    // «Выбор за тобой»: первый вариант зачёркивается
    gsap.timeline({ scrollTrigger: { trigger: '.choice', start: 'top 80%' } })
      .from('.choice > .eyebrow', { y: 12, autoAlpha: 0, duration: 0.6 }, 0)
      .from('.choice__old', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.1)
      .fromTo('.choice__old span', { '--strike': 0 }, { '--strike': 1, duration: 0.7, ease: 'power2.inOut' }, 0.7)
      .from('.choice__new', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 1.0)
      .from('.choice__cta > *', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.3);

    gsap.from('.concept-end > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.concept-end', start: 'top 85%' },
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
