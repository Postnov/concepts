// Люлеви — моушн концепта. Фирменная идея — колода: печать с портретом медленно вращает её слова,
// а расклады раздаются картами рубашкой вверх и переворачиваются лицом при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: карты лицом вверх, всё видно

  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: печать проявляется, имя поднимается по буквам ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.set(['.hero__arcs circle', '.seal__ring'], { transformOrigin: '50% 50%' });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__arcs circle', { scale: 0.7, autoAlpha: 0, rotation: -40, duration: 1.8, stagger: 0.1, ease: 'expo.out' }, 0.1)
      .fromTo('.seal__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.seal__photo img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.seal__ring', { rotation: -120, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.45)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 115, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1);

    // Печать вращается бесконечно и очень медленно — как карусель слов вокруг портрета
    gsap.to('.seal__ring', { rotation: '+=360', duration: 70, ease: 'none', repeat: -1, delay: 2.2 });
    // Дуги уходят чуть медленнее страницы
    gsap.to('.hero__arcs', {
      yPercent: 12, rotation: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Расклады: раздача карт ---------- */
    revealLines('.spreads h2', '.spreads .sec-head');
    gsap.from('.spreads .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spreads .sec-head', start: 'top 84%' } });

    const cards = $$('.tcard');
    const inners = cards.map(c => $('.tcard__inner', c));
    const mm = gsap.matchMedia();

    // Десктоп: три карты лежат стопкой в центре рубашкой вверх, разъезжаются веером и по очереди переворачиваются
    mm.add('(min-width: 900px)', () => {
      const mid = cards[1].getBoundingClientRect();
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.deck', start: 'top 72%' } });
      tl.from(cards, {
        x: i => mid.left - cards[i].getBoundingClientRect().left,
        y: 90, rotation: i => [-8, 3, 10][i], duration: 1.1, ease: 'expo.inOut', stagger: { each: 0.06, from: 'end' },
      })
        .from(inners, { rotationY: 180, duration: 1.1, ease: 'power3.inOut', stagger: 0.18 }, 0.75);
    });

    // Мобильный: каждая карта выезжает из-за края и переворачивается, когда доходит до экрана
    mm.add('(max-width: 899px)', () => {
      cards.forEach((card, i) => {
        gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } })
          .from(card, { y: 70, x: i % 2 ? 40 : -40, rotation: i % 2 ? 6 : -6, duration: 1, ease: 'expo.out' })
          .from(inners[i], { rotationY: 180, duration: 1, ease: 'power3.inOut' }, 0.2);
      });
    });

    /* ---------- 3. 15 лет ---------- */
    gsap.set('.years__orbit', { transformOrigin: '50% 50%' });
    gsap.timeline({ scrollTrigger: { trigger: '.years', start: 'top 75%' } })
      .from('.years__orbit circle', { scale: 0.6, autoAlpha: 0, rotation: 60, transformOrigin: '50% 50%', duration: 1.6, stagger: 0.12, ease: 'expo.out' })
      .from('.years__pre', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.1)
      .from('.years__post', { y: -20, autoAlpha: 0, duration: 0.8 }, 0.25);
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power3.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = String(o.v); },
      });
    });
    gsap.from('.gift', {
      y: 50, rotation: -3, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.gift', start: 'top 88%' },
    });
    gsap.from('.gift__icon', { scale: 0, rotation: -30, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: '.gift', start: 'top 80%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
