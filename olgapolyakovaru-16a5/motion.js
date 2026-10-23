// Ольга Полякова — моушн концепта «Записки на холодильнике».
// Фирменная идея: бумажные записки (регалии, ярлыки, история, продукты) по одной «прикрепляются» к странице —
// опускаются сверху с лёгким поворотом, плавно доходят до своего наклона без отскока, кружок-магнит появляется последним.
// Круглые магниты соцсетей не падают, а «прилипают»: приближаются к дверце (масштаб 1.18 → 1, тень из размытой в плотную).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Итоговый наклон записки задан CSS-свойством rotate (--tilt), GSAP крутит transform поверх него:
  // стартуем с разницы «начальный угол − наклон» и приходим к 0, поэтому в конце остаётся ровно её наклон.
  function pinTimeline(el, vars) {
    const tilt = parseFloat(getComputedStyle(el).getPropertyValue('--tilt')) || 0;
    const from = el.dataset.from != null ? parseFloat(el.dataset.from) : tilt - 3;
    const pin = $('.pin', el);
    const tl = gsap.timeline(vars);
    tl.from(el, {
      y: -64, rotation: from - tilt, autoAlpha: 0,
      duration: 0.95, ease: 'power3.out',
    });
    if (pin) tl.from(pin, { scale: 0, autoAlpha: 0, duration: 0.42, ease: 'power2.out' }, '-=0.18');
    return tl;
  }

  // «Прилипание» магнита: был ближе к зрителю (крупнее, тень большая и мягкая) — лёг на поверхность. Без отскока.
  const SHADOW_NEAR = 'rgba(30, 36, 32, 0.22) 0px 30px 40px -6px, rgba(0, 0, 0, 0.1) 0px -3px 5px 0px inset';
  const SHADOW_STUCK = 'rgba(30, 36, 32, 0.4) 0px 8px 14px -6px, rgba(0, 0, 0, 0.1) 0px -3px 5px 0px inset';
  function stick(targets, vars = {}) {
    return gsap.fromTo(targets,
      { scale: 1.18, autoAlpha: 0, boxShadow: SHADOW_NEAR },
      { scale: 1, autoAlpha: 1, boxShadow: SHADOW_STUCK, duration: 0.7, ease: 'power3.out', clearProps: 'boxShadow', ...vars });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: солнце, «восход» портрета, листья, записки с регалиями ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.sun__disc', { scale: 0.35, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.sun__rays', { scale: 0.75, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.3)
      // портрет «встаёт» из солнца, когда диск уже почти раскрылся
      .from('.portrait', { autoAlpha: 0, duration: 0.35, ease: 'none' }, 0.42)
      .from('.portrait img', { yPercent: 62, duration: 1.5, ease: 'power3.out' }, 0.42)
      .from('.hero .leaf', { scale: 0, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' }, 0.6)
      .from(name.chars, { yPercent: 110, stagger: 0.03, duration: 1, ease: 'expo.out' }, 0.5)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.1);
    $$('.hero .tag').forEach((tag, i) => intro.add(pinTimeline(tag), 1.05 + i * 0.22));

    // Листья покачиваются, лучи солнца медленно вращаются
    $$('.hero .leaf svg, .story .leaf svg, .fridge .leaf svg').forEach((svg, i) => {
      gsap.fromTo(svg, { rotation: -3 }, { rotation: 3, duration: 2.6 + i * 0.45, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.3 });
    });
    gsap.to('.sun__rays svg', { rotation: 360, duration: 90, ease: 'none', repeat: -1 });

    // Лёгкий параллакс сцены с портретом
    gsap.to('.hero__art', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. История: ярлык и записка прикрепляются, маркер проводит по «минус 20 кг» ---------- */
    // Верх истории выглядывает внизу первого экрана — тогда она собирается сразу после интро, а не ждёт прокрутки
    const storyInner = $('.story__inner');
    const inFold = ScrollTrigger.isInViewport(storyInner);
    const story = gsap.timeline(inFold ? { delay: 1.45 } : { scrollTrigger: { trigger: storyInner, start: 'top 82%' } });
    story
      .add(pinTimeline($('.story .label')), 0)
      .add(pinTimeline($('.memo')), 0.15)
      .from('.story__under', { y: -60, rotation: 10, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.27)
      .from('.memo__quote > span', { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.14, ease: 'power3.out' }, 0.7)
      .fromTo('.memo__quote mark', { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', duration: 0.8, ease: 'power2.inOut' }, 1.2)
      .fromTo('.memo .mark-soft', { backgroundSize: '0% 46%' }, { backgroundSize: '100% 46%', duration: 0.7, ease: 'power2.inOut' }, 1.5);
    if (getComputedStyle($('.leaf--s')).display !== 'none') story.from('.leaf--s', { scale: 0, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.5);

    /* ---------- 3. Продукты: записки по одной прикрепляются к дверце ---------- */
    gsap.from('.door', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.door', start: 'top 88%' } });
    const notes = $$('.note');
    const noteTl = new Map(notes.map(el => [el, pinTimeline(el, { paused: true })]));
    ScrollTrigger.batch(notes, {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((el, i) => gsap.delayedCall(i * 0.2, () => noteTl.get(el).play())),
    });

    /* ---------- 4. Соцсети: ярлык прикрепляется, плитки проявляются из-под маски, магниты на них «прилипают» ---------- */
    const socialLabel = pinTimeline($('.social .label'), { paused: true });
    ScrollTrigger.create({ trigger: '.social', start: 'top 86%', once: true, onEnter: () => socialLabel.play() });
    const tiles = $$('.tile');
    const tileTl = new Map(tiles.map(el => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(el, { clipPath: 'inset(0% 0% 100% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 0.9, ease: 'expo.out', clearProps: 'clipPath' })
        .from($('.tile__body', el), { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
        .add(stick($('.tile__icon', el)), 0.3)
        .from($('.tile__go', el), { scale: 0, autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, 0.5);
      const ghost = $('.tile__ghost', el);
      if (ghost) tl.from(ghost, { x: -40, y: 40, autoAlpha: 0, duration: 1.2, ease: 'power3.out' }, 0.3);
      return [el, tl];
    }));
    ScrollTrigger.batch(tiles, {
      start: 'top 90%', once: true,
      onEnter: els => els.forEach((el, i) => gsap.delayedCall(i * 0.14, () => tileTl.get(el).play())),
    });

    /* ---------- 5. Дверца с магнитами: магниты «прилипают» по одному ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.fridge', start: 'top 82%' } })
      .fromTo('.fridge', { clipPath: 'inset(8% 6% 8% 6% round 34px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', duration: 1.1, ease: 'expo.out', clearProps: 'clipPath' })
      .from('.fridge__title', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.15)
      .from('.fridge__text', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.3)
      .add(stick('.magnet', { stagger: 0.1 }), 0.5);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
