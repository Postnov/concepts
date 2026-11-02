// Николай Варданян — моушн концепта.
// Фирменная идея — «перистальтика»: по тонкой линии бежит мягкий бугорок-волна и толкает мятную точку,
// как пищевой комок по ЖКТ. В hero волна бежит сама, в разделителе — от прокрутки, в «Как проходит?» точка идёт по шагам.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- Волна ---------- */
  // st.t — положение бугорка (0 — ещё за левым краем, 1 — уже за правым), st.reveal — доля прорисованной линии (интро),
  // st.follow — в интро бугорок идёт сразу за кончиком линии, st.phase — фаза лёгкой ряби, чтобы линия «дышала» и между волнами
  function makeWave(el) {
    const svg = $('svg', el);
    const path = $('path', el);
    const dot = $('.wave__dot', el);
    const st = { t: 0.6, reveal: 1, follow: false, phase: 0 };
    let w = 0, h = 0;
    const measure = () => {
      w = el.clientWidth; h = el.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    };
    const y = (x, c, sigma) => {
      const amp = h * 0.62;
      const bump = amp * Math.exp(-(((x - c) / sigma) ** 2));
      const ripple = 1.6 * Math.sin(x / 34 - st.phase) * (1 - bump / amp);
      return h * 0.82 - bump + ripple;
    };
    const smooth = v => Math.max(0, Math.min(1, v));
    const sigmaOf = () => Math.max(38, Math.min(96, w * 0.07));
    // Какое t соответствует бугорку, у которого точка на правом краю (конец интро)
    const tAtEnd = () => { const sg = sigmaOf(); return (w - sg * 0.95 + sg * 2.4) / (w + sg * 4.8); };
    function draw() {
      if (!w) measure();
      if (!w) return;
      const sigma = sigmaOf();
      const end = w * st.reveal;
      const c = st.follow ? end - sigma * 0.95 : -sigma * 2.4 + (w + sigma * 4.8) * st.t;
      const n = Math.max(2, Math.round(end / 5));
      let d = '';
      for (let i = 0; i <= n; i++) {
        const x = (end * i) / n;
        d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y(x, c, sigma).toFixed(1)}`;
      }
      path.setAttribute('d', d);
      // Точка — на склоне впереди бугорка (её «толкает» волна); в интро это и есть кончик линии; у краёв гаснет
      const dx = c + sigma * 0.95;
      dot.style.transform = `translate(${dx.toFixed(1)}px, ${y(dx, c, sigma).toFixed(1)}px)`;
      dot.style.opacity = (smooth(dx / 36) * smooth((w - dx) / 36)).toFixed(3);
    }
    return { el, st, draw, measure, tAtEnd };
  }
  const waves = $$('[data-wave]').map(makeWave);
  window.addEventListener('resize', () => waves.forEach(wv => { wv.measure(); wv.draw(); }));

  /* ---------- «Как проходит?»: заливка рельса и точка ---------- */
  const rail = $('.route__rail');
  const fill = $('.route__fill');
  const rdot = $('.route__dot');
  const steps = $$('.step');
  function setRoute(p) {
    const horiz = rail.clientWidth > rail.clientHeight;
    const len = horiz ? rail.clientWidth : rail.clientHeight;
    fill.style.transform = horiz ? `scaleX(${p})` : `scaleY(${p})`;
    rdot.style.transform = horiz ? `translate(${p * len}px, 0)` : `translate(0, ${p * len}px)`;
    // Метка шага загорается, когда точка до неё дошла
    const railBox = rail.getBoundingClientRect();
    const at = p * len;
    steps.forEach(s => {
      const b = s.getBoundingClientRect();
      const mark = horiz ? b.left - railBox.left : b.top - railBox.top;
      s.classList.toggle('is-on', at >= mark - 2);
    });
  }

  if (!animate) {
    // Статичная страница: волны в среднем положении, путь пройден целиком
    waves.forEach(wv => wv.draw());
    setRoute(1);
    window.addEventListener('resize', () => setRoute(1));
    return;
  }

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const hero = waves.find(wv => wv.el.dataset.wave === 'loop');
    waves.forEach(wv => { wv.measure(); wv.draw(); });

    /* ---------- 1. Hero: вход ---------- */
    const names = $$('.hero__line').map(el => SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    hero.st.reveal = 0;
    hero.st.follow = true;
    hero.draw();

    // Волна в hero: в интро линия прорисовывается, бугорок толкает точку на её кончике; дальше бугорок
    // уходит за край, пауза, и снова пробегает всю линию. Рисуем, только пока hero на экране
    let heroLive = true;
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true })
      .fromTo(hero.st, { t: 0 }, { t: 1, duration: 4.2, ease: 'sine.inOut' });
    const handOff = () => {
      hero.st.follow = false;
      const t0 = hero.tAtEnd();
      hero.st.t = t0;
      gsap.to(hero.st, { t: 1, duration: 0.5, ease: 'none', onComplete: () => gsap.delayedCall(0.8, () => loop.play(0)) });
    };
    gsap.ticker.add(() => {
      if (!heroLive) return;
      hero.st.phase += 0.035;
      hero.draw();
    });
    ScrollTrigger.create({ trigger: hero.el, start: 'top bottom', end: 'bottom top', onToggle: self => { heroLive = self.isActive; } });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { names.forEach(s => s.revert()); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__tags > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.2)
      .from(names[0].chars, { yPercent: 112, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.3)
      .from(names[1].chars, { yPercent: 112, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.48)
      .to(hero.st, { reveal: 1, duration: 2.1, ease: 'power1.inOut', onComplete: handOff }, 0.6)
      .fromTo('.hero__photo .capsule',
        { clipPath: 'inset(100% 0% 0% 0% round 999px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.3, ease: 'expo.inOut' }, 0.9)
      .from('.hero__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 1.1)
      .from('.hero__photo figcaption', { y: 10, autoAlpha: 0, duration: 0.6 }, 1.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 1.15)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.45)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.6);

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Онлайн-консультация ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 86%' } });

    // Карточка цены раскрывается капсулой снизу, внутри — по очереди; цена появляется целиком
    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 84%' } })
      .fromTo('.price', { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.price__label', { y: 12, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.55)
      .from('.price__sum', { y: 26, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.65)
      .from('.price__meta li', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, 0.85)
      .from('.price .btn', { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.95)
      .from('.price__repeat', { autoAlpha: 0, duration: 0.8 }, 1.1);

    // Пункты: номер встаёт, текст выезжает следом
    $$('.perk').forEach(perk => {
      gsap.timeline({ scrollTrigger: { trigger: perk, start: 'top 88%' }, defaults: { ease: 'power3.out' } })
        .from($('.perk__n', perk), { yPercent: 80, autoAlpha: 0, duration: 0.6 }, 0)
        .from($('p', perk), { x: 24, autoAlpha: 0, duration: 0.85 }, 0.08);
    });

    revealLines('.route__title', '.route');
    gsap.from('.step', {
      y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.route__track', start: 'top 82%' },
    });
    const route = { p: 0 };
    setRoute(0);
    gsap.to(route, {
      p: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.route__track', start: 'top 72%', end: () => (rail.clientWidth > rail.clientHeight ? 'top 30%' : 'bottom 62%'),
        scrub: 0.6, invalidateOnRefresh: true,
      },
      onUpdate: () => setRoute(route.p),
    });

    gsap.from('.signup', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.signup', start: 'top 88%' } });
    gsap.from('.msgr li', {
      y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.msgr', start: 'top 92%' },
    });

    /* ---------- Разделитель: бугорок бежит от прокрутки ---------- */
    waves.filter(wv => wv.el.dataset.wave === 'scroll').forEach(wv => {
      wv.st.t = 0;
      wv.draw();
      gsap.to(wv.st, {
        t: 1, ease: 'none',
        scrollTrigger: { trigger: wv.el, start: 'top 95%', end: 'bottom 20%', scrub: 0.8 },
        onUpdate: () => { wv.st.phase += 0.08; wv.draw(); },
      });
    });

    /* ---------- 3. Также обо мне ---------- */
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about', start: 'top 84%' } });
    revealLines('.about__lead', '.about__lead', { stagger: 0.12 });
    const facts = $$('.fact');
    gsap.set(facts, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(facts, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }),
    });
    gsap.from('.reviews__text', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reviews', start: 'top 86%' } });
    gsap.from('.rlink span', {
      yPercent: 40, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '.reviews__list', start: 'top 90%' },
    });
    gsap.from('.rlink i', {
      scale: 0.4, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'expo.out', delay: 0.15,
      scrollTrigger: { trigger: '.reviews__list', start: 'top 90%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
