// Серафима Кудашева — моушн концепта. Фирменная идея — «лазер»: светящаяся точка проходит по извитой вене,
// и за ней линия становится ровной; та же лазерная линия ведёт по списку «С чем помогу» и проявляет снимки «после».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: вена уже ровная, все пункты подсвечены, снимки открыты

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, delay = 0) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out', delay,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Лазерная линия проходит по снимку «после» и проявляет его
  function laserReveal(half, opts = {}) {
    const img = $('img', half);
    const laser = $('.ba__laser', half);
    const chip = $('.chip', half);
    const d = opts.duration || 1.3;
    return gsap.timeline({ delay: opts.delay || 0 })
      .set(laser, { left: '0%', autoAlpha: 1 })
      .fromTo(img, { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: d, ease: 'power2.inOut', clearProps: 'clipPath,scale' }, 0)
      .to(laser, { left: '100%', duration: d, ease: 'power2.inOut' }, 0)
      .to(laser, { autoAlpha: 0, duration: 0.35 }, d - 0.1)
      .from(chip, { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.2)' }, d - 0.25);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const title = SplitText.create('.hero__title', { type: 'lines', mask: 'lines' });

    // Вена: начальное состояние — видна только извитая линия
    const twist = $('.vein__twist');
    const len = twist.getTotalLength();
    const cutBad = $('.vein__cut-bad');
    const cutGood = $('.vein__cut-good');
    const laser = $('.vein__laser');
    const pos = { x: 0 };
    const setLaser = () => {
      gsap.set(laser, { x: pos.x, y: 36 });
      cutBad.setAttribute('x', pos.x);
      cutBad.setAttribute('width', 400 - pos.x);
      cutGood.setAttribute('width', pos.x);
    };
    setLaser();
    gsap.set(twist, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set('.vein__knot', { scale: 0, transformOrigin: '50% 50%' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => title.revert(),
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(title.lines, { yPercent: 105, stagger: 0.12, duration: 1.15, ease: 'expo.out' }, 0.25)
      // извитая вена прорисовывается, узлы набухают
      .to(twist, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.6)
      .to('.vein__knot', { scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 1.0)
      // лазер проходит слева направо — за ним линия ровная
      .to(laser, { opacity: 1, duration: 0.25 }, 1.65)
      .to(pos, { x: 400, duration: 1.9, ease: 'power1.inOut', onUpdate: setLaser }, 1.7)
      .to(laser, { opacity: 0, duration: 0.4 }, 3.45)
      // портрет и имя
      .fromTo('.person__frame', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.7)
      .from('.person__frame img', { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 0.85)
      .from('.person__ring', { scale: 0.7, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 1.0)
      .from('.person__text > *', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1)
      .from('.award', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.actions .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.45);

    // Кольцо вокруг портрета медленно вращается — лазерная точка обходит фото
    gsap.to('.person__ring', { rotation: 360, duration: 16, repeat: -1, ease: 'none' });

    // После прохода лазера по ровной линии время от времени пробегает «кровоток»
    gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 3.9 })
      .set('.vein__flow', { opacity: 1, strokeDashoffset: 26 })
      .to('.vein__flow', { strokeDashoffset: -420, duration: 2.4, ease: 'power1.inOut' })
      .set('.vein__flow', { opacity: 0 });

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 3.2 + i });
    });

    /* ---------- 2. С чем помогу ---------- */
    revealLines('.help h2', '.help .sec-head');
    gsap.from('.help .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help .sec-head', start: 'top 84%' } });
    gsap.from('.help__item', {
      x: 26, autoAlpha: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: '.help__list', start: 'top 82%' },
    });
    // Лазерная точка идёт по рельсу вместе с прокруткой и «зажигает» пункты
    const rail = $('.help__rail');
    const items = $$('.help__item');
    const dot = $('.help__dot');
    // Пройденное лазером остаётся «вылеченным»: прогресс только растёт
    let reached = 0;
    const light = raw => {
      const p = (reached = Math.max(reached, raw));
      const h = rail.offsetHeight;
      const y = p * h;
      gsap.set(dot, { y, opacity: p > 0 ? 1 : 0 });
      gsap.set('.help__fill', { scaleY: p });
      const top = rail.getBoundingClientRect().top;
      items.forEach(it => {
        const node = $('.help__node', it).getBoundingClientRect();
        it.classList.toggle('is-lit', node.top + node.height / 2 - top <= y + 4);
      });
    };
    ScrollTrigger.create({
      trigger: '.help__body', start: 'top 72%', end: 'bottom 62%',
      onUpdate: self => light(self.progress),
      onRefresh: self => light(self.progress),
    });

    /* ---------- 3. До / После ---------- */
    revealLines('.results h2', '.results .sec-head');
    gsap.from('.results .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.results .sec-head', start: 'top 84%' } });

    const hero = $('.ba--hero');
    gsap.set($('.ba__half--posle img', hero), { clipPath: 'inset(0% 100% 0% 0%)' });
    ScrollTrigger.create({
      trigger: hero, start: 'top 72%', once: true,
      onEnter: () => {
        gsap.timeline()
          .from($('.ba__half--do', hero), { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
          .from($('.ba__half--do .chip', hero), { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.5)
          .add(laserReveal($('.ba__half--posle', hero), { duration: 1.5 }), 0.55);
      },
    });

    const cards = $$('.track .ba');
    cards.forEach(c => gsap.set($('.ba__half--posle img', c), { clipPath: 'inset(0% 100% 0% 0%)' }));
    gsap.from('.results__hint', { x: -10, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.results__more', start: 'top 88%' } });
    ScrollTrigger.batch(cards, {
      start: 'top 86%', once: true,
      onEnter: els => els.forEach((c, i) => {
        gsap.from(c, { y: 34, autoAlpha: 0, duration: 0.9, delay: i * 0.12, ease: 'power3.out' });
        laserReveal($('.ba__half--posle', c), { delay: 0.35 + i * 0.12, duration: 1.1 });
      }),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
