// Татьяна Шилина · Nea Tarot — моушн концепта.
// Фирменная идея: страница — колода Таро. Портрет переворачивается с рубашки на лицо,
// фото «обо мне» ложатся веером, расклады раздаются из одной колоды и открываются по одному.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; split снимаем после анимации
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Рукописная подпись «пишется» слева направо
  function writeHand(el, trigger) {
    gsap.fromTo(el, { clipPath: 'inset(-20% 100% -30% 0%)' }, {
      clipPath: 'inset(-20% 0% -30% 0%)', duration: 1.6, ease: 'power2.inOut', delay: 0.35,
      scrollTrigger: { trigger, start: 'top 84%' },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name span', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const card = $('.hero__card .tcard__inner');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.3)
      // Карта выезжает рубашкой вверх и переворачивается лицом
      .fromTo(card,
        { rotateY: 180, rotateZ: -7, y: 70, scale: 0.86 },
        { rotateY: 0, rotateZ: 0, y: 0, scale: 1, duration: 1.7, ease: 'expo.inOut' }, 0.35)
      .from('.hero__card img', { scale: 1.25, duration: 2.1, ease: 'expo.out' }, 1.0)
      .from(['.hero__card .tcard__top', '.hero__card .tcard__bottom'], { autoAlpha: 0, y: 8, stagger: 0.1, duration: 0.7 }, 1.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 0.85)
      .from('.tags li', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.15)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    // Блик на главной кнопке раз в несколько секунд
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    // При прокрутке карта слегка поворачивается, как в руке
    gsap.to('.hero__card', {
      rotateZ: 3, y: -30, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне ---------- */
    revealLines('.about .script-title__main', '.about .sec-head');
    writeHand('.about .script-title__hand', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });

    $$('.fact').forEach(fact => {
      gsap.timeline({ scrollTrigger: { trigger: fact, start: 'top 86%' } })
        .from($('.fact__rule', fact), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' })
        .from($('.fact__num', fact), { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.25)
        .from($('.fact__text', fact), { y: 16, autoAlpha: 0, duration: 0.9 }, 0.45);
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(to >= 1000 ? Math.round(o.v / 100) * 100 : o.v); },
        onComplete: () => { el.textContent = MotionBase.money(to); },
      });
    });

    // Две карты-фото: переворот веером
    gsap.fromTo('.about__spread .tcard__inner',
      { rotateY: 180, y: 60 },
      { rotateY: 0, y: 0, duration: 1.5, stagger: 0.22, ease: 'expo.inOut', scrollTrigger: { trigger: '.about__spread', start: 'top 80%' } });

    /* ---------- 3. Расклады: раздача из колоды ---------- */
    revealLines('.spreads .script-title__main', '.spreads .sec-head');
    writeHand('.spreads .script-title__hand', '.spreads .sec-head');
    gsap.from(['.spreads .eyebrow', '.spreads .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.spreads .sec-head', start: 'top 84%' },
    });

    const deck = $('.deck');
    const items = $$('.deck__item');
    // Смещение каждой карты к центру колоды (считается при старте, после вёрстки)
    const toDeck = (i, el, axis) => {
      const d = deck.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return axis === 'x'
        ? d.left + d.width / 2 - (r.left + r.width / 2)
        : Math.min(d.top + d.height * 0.3, d.top + window.innerHeight * 0.35) - (r.top + r.height / 2);
    };
    gsap.timeline({ scrollTrigger: { trigger: deck, start: 'top 72%' } })
      .fromTo(items, {
        x: (i, el) => toDeck(i, el, 'x'),
        y: (i, el) => toDeck(i, el, 'y'),
        rotateZ: i => (i % 2 ? 4 : -4) + i * 0.6,
        rotateY: 180,
        transformPerspective: 1200,
      }, {
        x: 0, y: 0, rotateZ: 0, duration: 1.05, stagger: 0.09, ease: 'power3.inOut',
        immediateRender: true,
      })
      .to(items, { rotateY: 0, duration: 0.8, stagger: 0.09, ease: 'power2.inOut' }, 0.55);

    gsap.from('.note__title', { x: -20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.note', start: 'top 86%' } });
    gsap.from('.note__body p', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.note', start: 'top 86%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
