// Екатерина Ларкина — моушн концепта. Фирменная идея: «уровень» (равновесие).
// Фото — пузырёк в стеклянной колбе: на входе колба наклонена и «плывёт», как при головокружении, затем
// выравнивается до 0,0°; при быстрой прокрутке колба качается по инерции и снова находит равновесие.
// Ниже маленькие колбы-маркеры: точка доезжает до центра, когда блок появляется.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: колба ровная, подпись «0,0°» уже в разметке

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  MotionBase.ready(() => {
    /* ---------- «Уровень»: пружина наклона + пузырёк ---------- */
    const level = $('.level');
    const tilt = $('.level__tilt');
    const vial = $('.level__vial');
    const bubble = $('.level__bubble');
    const deg = $('.level__deg');
    const setRot = gsap.quickSetter(tilt, 'rotation', 'deg');
    const setX = gsap.quickSetter(bubble, 'x', 'px');
    // a — угол (°), v — угловая скорость, target — куда тянет (прокрутка), bx — смещение пузырька
    const S = { a: -6.5, v: 0, target: 0, bx: 0, bv: 0, live: false, inView: true };
    let range = 0;
    const measure = () => { range = Math.max(0, (vial.clientWidth - bubble.clientWidth) / 2 - 14); };
    measure();
    window.addEventListener('resize', measure);
    let shown = '';
    const render = () => {
      setRot(S.a);
      setX(S.bx);
      const r = Math.round(S.a * 10) / 10;
      const txt = (Math.abs(r) < 0.05 ? '0,0' : (r < 0 ? '−' : '+') + Math.abs(r).toFixed(1).replace('.', ',')) + '°';
      if (txt !== shown) { shown = txt; deg.textContent = txt; }
      level.classList.toggle('is-level', Math.abs(r) < 0.05); // ровно, когда подпись показывает 0,0°
    };
    // Стартовый кадр: колба наклонена, пузырёк ушёл к поднятому краю
    S.bx = clamp(-S.a * range / 4, -range, range);
    render();

    gsap.ticker.add((time, dt) => {
      if (!S.live || !S.inView) return;
      const t = Math.min(dt, 50) / 1000;
      // Затухающая пружина: равновесие — 0°, прокрутка отклоняет цель, цель сама возвращается к нулю
      S.target *= Math.pow(0.04, t);
      S.v += (-38 * (S.a - S.target) - 4.2 * S.v) * t;
      S.a += S.v * t;
      // Пузырёк всплывает к поднятому краю и догоняет наклон с запаздыванием
      const goal = clamp(-S.a * range / 4, -range, range);
      S.bv += (-90 * (S.bx - goal) - 13 * S.bv) * t;
      S.bx = clamp(S.bx + S.bv * t, -range, range);
      if (Math.abs(S.a) < 0.004 && Math.abs(S.v) < 0.004 && Math.abs(S.target) < 0.004) { S.a = 0; S.v = 0; }
      render();
    });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: self => { S.inView = self.isActive; },
    });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => { if (S.live) S.target = clamp(-self.getVelocity() / 650, -4.5, 4.5); },
    });

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.level', { y: 26, autoAlpha: 0, duration: 0.9 }, 0.1)
      .call(() => { S.live = true; }, null, 0.55)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(first.chars, { yPercent: 115, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.38)
      .from(last.chars, { yPercent: 115, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.58)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.9 }, 0.85)
      .from('.facts li', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.95)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.15);

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.fromTo('.hero__cta > .btn', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 });

    /* ---------- маленькие колбы: точка от края к центру ---------- */
    const settle = (dots, trigger, opts = {}, from = -17) => gsap.fromTo(dots, { x: from }, {
      x: 0, duration: 1.5, ease: 'elastic.out(1, 0.5)', stagger: 0.12, ...opts,
      scrollTrigger: { trigger, start: 'top 85%' },
    });

    // Заголовок секции строками из-под маски
    function head(sec) {
      const h2 = $(`${sec} h2`);
      const split = SplitText.create(h2, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
      gsap.from(`${sec} .eyebrow`, { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 86%' } });
      settle(`${sec} .eyebrow .vial-mini i`, `${sec} .sec-head`, { delay: 0.2 });
    }

    /* ---------- 2. Чем могу помочь ---------- */
    head('.help');
    gsap.timeline({ scrollTrigger: { trigger: '.general', start: 'top 85%' } })
      .from('.general', { y: 34, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
      .from('.chips li', { scale: 0.82, autoAlpha: 0, duration: 0.55, stagger: 0.06, ease: 'back.out(1.8)' }, 0.35);
    gsap.from('.help__note', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help__note', start: 'top 90%' } });
    // Карточки направлений приходят с наклоном и «выравниваются по уровню»
    $$('.spec__card').forEach((card, i) => gsap.from(card, {
      y: 40, rotation: i % 2 ? 3 : -3, transformOrigin: i % 2 ? '100% 100%' : '0% 100%', autoAlpha: 0,
      duration: 1.2, delay: i * 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 90%' },
    }));
    gsap.timeline({ scrollTrigger: { trigger: '.psy', start: 'top 82%' } })
      .fromTo('.psy', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, ease: 'expo.inOut' })
      .from(['.psy__label', '.psy__title'], { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.5)
      .from('.psy__word', { x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.75)
      .fromTo('.psy__row .vial-mini i', { x: -17 }, { x: 0, duration: 1.5, stagger: 0.12, ease: 'elastic.out(1, 0.5)' }, 0.85)
      .from('.psy__foot', { autoAlpha: 0, duration: 0.8 }, 1.3);

    /* ---------- 3. Приём ---------- */
    head('.visit');
    const cards = $$('.fmt');
    gsap.set(cards, { y: 48, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.12, ease: 'expo.out' }),
    });
    // Шкала длительности заполняется; цена появляется целиком, без счётчика
    cards.forEach(card => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%' }, delay: 0.25 })
        .from($('.dur__fill', card), { scaleX: 0, duration: 1.3, ease: 'power2.inOut' })
        .from($('.fmt__price', card), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.35);
    });

    /* ---------- финал ---------- */
    gsap.from(['.concept-end__title', '.concept-end__text', '.concept-end .btn'], { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });
    settle('.concept-end .vial-mini i', '.concept-end', {}, -30);

    window.addEventListener('load', () => { measure(); ScrollTrigger.refresh(); }, { once: true });
  });
})();
