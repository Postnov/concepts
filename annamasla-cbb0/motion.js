// Анна Малыгина — моушн концепта. Фирменная идея «капля»: капля масла набухает на кончике пипетки,
// падает к флаконам и расходится кругами, открывая фото; дальше по странице капля стекает по рельсу
// и пропитывает метки списка, а флаконы с ценами наполняются маслом. Без GSAP или при reduced motion — статичная страница.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: капля открывает фото ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const arch = $('.arch');
    const img = $('.arch img');
    const drop = $('.drop');
    const rings = $$('.ripples span');
    const IMPACT = 0.86; // точка падения — у флаконов, 86% высоты арки (как .ripples в CSS)

    // Сколько капле лететь от кончика пипетки до точки падения (считается в момент старта падения)
    const fall = () => {
      const a = arch.getBoundingClientRect();
      const d = drop.getBoundingClientRect();
      return a.top + a.height * IMPACT - (d.top - gsap.getProperty(drop, 'y')) - d.height + 4;
    };
    // Одна капля: набухает, падает, круги расходятся
    const drip = (tl, at, withReveal) => {
      tl.set(drop, { y: 0, transformOrigin: '50% 0%' }, at)
        .fromTo(drop, { scaleX: 0, scaleY: 0, autoAlpha: 1 }, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'back.out(1.8)' }, at)
        .set(drop, { transformOrigin: '50% 100%' }, at + 0.58)
        .to(drop, { y: fall, duration: 0.45, ease: 'power2.in' }, at + 0.62)
        .to(drop, { scaleX: 1.7, scaleY: 0.25, autoAlpha: 0, duration: 0.16, ease: 'power1.out' }, at + 1.07)
        .fromTo(rings, { scale: 0.06, autoAlpha: withReveal ? 0.95 : 0.7 }, { scale: 1.3, autoAlpha: 0, duration: 2.1, stagger: 0.3, ease: 'power2.out' }, at + 1.07);
      return at + 1.07;
    };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(first.chars, { yPercent: 112, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.25)
      .from(last.chars, { yPercent: 112, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.pipette', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.6 }, 0.2);
    const hit = drip(intro, 0.35, true);
    intro
      .fromTo(img, { clipPath: `circle(0% at 50% ${IMPACT * 100}%)` }, { clipPath: `circle(130% at 50% ${IMPACT * 100}%)`, duration: 1.8, ease: 'expo.out' }, hit - 0.02)
      .from(img, { scale: 1.16, duration: 2.3, ease: 'expo.out' }, hit - 0.02)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, hit + 0.1)
      .from('.hero__btn', { y: 18, autoAlpha: 0, duration: 0.7 }, hit + 0.35)
      .from('.feats li', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, hit + 0.45);

    // Дальше капля падает сама раз в несколько секунд
    const dripLoop = () => {
      const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(4.6, dripLoop) });
      drip(tl, 0, false);
    };
    gsap.delayedCall(intro.duration() + 3.2, dripLoop);

    /* Медовый блик на главной кнопке */
    gsap.fromTo('.hero__btn', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3.4 });

    /* ---------- 2. С чем приходят → что получите: капля стекает по рельсу ---------- */
    gsap.from('.needs > .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.needs', start: 'top 80%' } });
    revealLines('.flow--pains .flow__title');
    revealLines('.flow--gains .flow__title');

    $$('.flow').forEach(flow => {
      const body = $('.flow__body', flow);
      const rail = $('.flow__rail', flow);
      const runner = $('.flow__drop', flow);
      const items = $$('li', flow);

      // Строки появляются пачкой при входе в экран
      const texts = items.map(li => $('p', li));
      gsap.set(texts, { x: 14, autoAlpha: 0 });
      ScrollTrigger.batch(texts, {
        start: 'top 92%', once: true,
        onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }),
      });

      // Капля идёт по рельсу вместе с прокруткой; доходя до метки, пропитывает её маслом
      const railTop = rail.offsetTop;
      const railH = rail.offsetHeight || 1;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: body, start: 'top 72%', end: 'bottom 58%', scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.fromTo(rail, { '--p': 0 }, { '--p': 1, duration: 1 }, 0)
        .fromTo(runner, { y: 0 }, { y: () => rail.offsetHeight, duration: 1 }, 0);
      items.forEach(li => {
        const center = li.offsetTop + li.offsetHeight / 2;
        const at = Math.min(Math.max((center - railTop) / railH - 0.02, 0), 0.92);
        tl.fromTo($('.mark__oil', li), { scaleY: 0 }, { scaleY: 1, duration: 0.08, ease: 'power1.out' }, at)
          .fromTo($('.mark svg', li), { stroke: '#9b877a' }, { stroke: '#fff9f0', duration: 0.08 }, at);
      });
    });

    gsap.from('.task__label', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.task', start: 'top 84%' } });
    revealLines('.task__text', '.task');

    /* ---------- 3. Форматы: флаконы наполняются маслом ---------- */
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats', start: 'top 80%' } });
    revealLines('.formats h2', '.formats .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.formats__photo', start: 'top 82%' } })
      .fromTo('.formats__photo .frame',
        { clipPath: 'inset(100% 0% 0% 0% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.35, ease: 'expo.inOut' })
      .from('.formats__photo img', { scale: 1.25, duration: 1.9, ease: 'expo.out' }, 0.15);

    $$('.vial').forEach((vial, i) => {
      const tl = gsap.timeline({ delay: i * 0.14, scrollTrigger: { trigger: vial, start: 'top 86%' } });
      tl.from(vial, { y: 60, autoAlpha: 0, duration: 1.05, ease: 'expo.out' })
        .fromTo($('.vial__oil', vial), { yPercent: 100 }, { yPercent: 0, duration: 2.4, ease: 'power2.inOut' }, 0.15)
        // Цена появляется целиком вместе с остальным текстом этикетки — без счётчика
        .from($$('.vial__label > *', vial), { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.75, ease: 'power3.out' }, 0.3);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
