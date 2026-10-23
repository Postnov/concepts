// Дана · director astrala — моушн концепта.
// Фирменная идея — «орбита»: вокруг каждого заголовка рисуется наклонный эллипс, по нему кружит жёлтая звезда —
// на задней дуге уходит за буквы, на передней выходит перед ними; жёлтое эхо-подпись дописывается «от руки».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон услуг: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.svc__head', item);
    const body = $('.svc__body', item);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('.d > *, .d__list li, .chips li', body), { y: 8, autoAlpha: 0, duration: 0.45, stagger: 0.025, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  const items = $$('.svc__item');
  items.forEach(item => {
    $('.svc__head', item).addEventListener('click', () => {
      const open = $('.svc__head', item).getAttribute('aria-expanded') !== 'true';
      items.forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen(items[0], true, true);
    return;
  }

  /* ---------- орбита: звезда бежит по эллипсу (rx 190, ry 60 в коробке 400×140) ---------- */
  function orbit(box, period, start) {
    const back = $('.orb--back', box);
    const sb = $('.orb--back .star--run', box);
    const sf = $('.orb--front .star--run', box);
    const RX = 190 / 400, RY = 60 / 140;
    let W = back.offsetWidth, H = back.offsetHeight, shown = false;
    window.addEventListener('resize', () => { W = back.offsetWidth; H = back.offsetHeight; });
    const st = { t: start };
    gsap.set([sb, sf], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const place = () => {
      const s = Math.sin(st.t);
      const behind = s < 0; // верхняя половина эллипса — за текстом
      gsap.set(behind ? sb : sf, {
        x: W * (0.5 + RX * Math.cos(st.t)), y: H * (0.5 + RY * s),
        scale: 0.62 + 0.38 * (s + 1) / 2, rotate: st.t * 57.3 * 0.5, autoAlpha: shown ? (behind ? 0.55 : 1) : 0,
      });
      gsap.set(behind ? sf : sb, { autoAlpha: 0 });
    };
    place();
    const loop = gsap.to(st, { t: start + Math.PI * 2, duration: period, ease: 'none', repeat: -1, paused: true, onUpdate: place });
    // крутится только на экране
    ScrollTrigger.create({ trigger: box, start: 'top bottom', end: 'bottom top', onToggle: self => (shown && (self.isActive ? loop.play() : loop.pause())) });
    return {
      start() { shown = true; place(); gsap.from([sb, sf], { scale: 0, duration: 0.8, ease: 'back.out(2.4)' }); loop.play(); },
    };
  }

  // Подпись «от руки»: многоугольник раскрывается слева направо (с запасом по краям — хвосты букв не режутся)
  const HIDE = 'polygon(-12% -60%, -12% -60%, -12% 160%, -12% 160%)';
  const SHOW = 'polygon(-12% -60%, 116% -60%, 116% 160%, -12% 160%)';
  const write = (el, vars = {}) => gsap.fromTo(el, { clipPath: HIDE, x: -6 }, {
    clipPath: SHOW, x: 0, duration: 1.3, ease: 'power2.inOut', ...vars,
    onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
  });
  const drawArcs = (box, vars = {}) => gsap.fromTo($$('.orb__arc', box), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.45, ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: кадр раскрывается как в кино, название набирается, орбита замыкается ---------- */
    const word = SplitText.create('.title__word', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const heroOrbit = orbit($('.title'), 16, -2.2);

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { word.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.frame--hero', { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.frame--hero img', { scale: 1.28, duration: 2.3, ease: 'expo.out' }, 0.25)
      .from('.hero__kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from('.hero__cap', { autoAlpha: 0, duration: 0.6 }, 1.3)
      .from('.title__name', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.6)
      .from(word.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.65)
      .add(drawArcs($('.title'), { duration: 1.3 }), 0.95)
      .add(write($('.echo--hero'), { duration: 1.25 }), 1.3)
      .from('.title .star--still', { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.4)' }, 1.95)
      .call(() => heroOrbit.start(), null, 2.1)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.45)
      .from('.hero__bio', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.7)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.8)
      .add(write($('.hero__motto'), { duration: 1.6 }), 2.05);

    /* ---------- заголовки секций: буквы из-под маски, дуги, эхо, звезда ---------- */
    $$('main section .head').forEach((box, i) => {
      const split = SplitText.create($('.head__word', box), { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
      const o = orbit(box, 18 + i * 3, -2.4 + i);
      gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 82%' }, onComplete: () => split.revert() })
        .from(split.chars, { yPercent: 112, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0)
        .add(drawArcs(box), 0.2)
        .add(write($('.echo', box)), 0.45)
        .from($('.star--still', box), { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.4)' }, 1)
        .call(() => o.start(), null, 1.2);
    });

    /* ---------- 2. Обо мне ---------- */
    // Солнце поднимается при прокрутке, орбита вокруг него медленно поворачивается
    gsap.fromTo('.sun__disc', { yPercent: 40 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top 15%', scrub: true } });
    gsap.fromTo('.sun__orbit', { rotate: -40 }, { rotate: 30, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });

    gsap.from('.stat__num', { y: 34, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 86%' } });
    gsap.from('.stat__label', { y: 10, autoAlpha: 0, duration: 0.8, stagger: 0.12, delay: 0.2, scrollTrigger: { trigger: '.stats', start: 'top 86%' } });

    gsap.timeline({ scrollTrigger: { trigger: '.about__grid', start: 'top 80%' } })
      .fromTo('.frame--arch', { clipPath: 'inset(100% 0% 0% 0% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from('.frame--arch img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.15)
      .from('.about__lead', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from('.about__note', { y: 12, autoAlpha: 0, duration: 0.8 }, 0.7);

    const body = SplitText.create('.about__body', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.timeline({ scrollTrigger: { trigger: '.about__more', start: 'top 84%' }, onComplete: () => body.revert() })
      .from(body.lines, { yPercent: 100, stagger: 0.08, duration: 0.95, ease: 'power3.out' }, 0)
      .add(write($('.about__sun'), { duration: 1.5 }), 0.5);

    // Карточка-«билет» ложится на место, дырочка пробивается следом
    gsap.timeline({ scrollTrigger: { trigger: '.ticket', start: 'top 88%' } })
      .from('.ticket', { y: 60, rotate: -4, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
      .from('.ticket__hole', { scale: 0, duration: 0.6, ease: 'back.out(2)' }, 0.45);

    /* ---------- 3. Услуги: линия прочерчивается, строка выезжает, цена появляется целиком ---------- */
    gsap.from(['.services__sub', '.services__btn--side'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.services__side', start: 'top 80%' } });
    const rows = items.map(it => [$('.svc__num', it), $('.svc__title', it), $('.svc__icon', it)]);
    const prices = items.map(it => $('.svc__price', it));
    gsap.set(items, { '--draw': 0 });
    gsap.set(rows.flat(), { x: -14, autoAlpha: 0 });
    gsap.set(prices, { autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => {
        const idx = els.map(el => items.indexOf(el));
        gsap.to(els, { '--draw': 1, duration: 0.9, stagger: 0.08, ease: 'power3.inOut' });
        gsap.to(idx.flatMap(i => rows[i]), { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.03, delay: 0.15, ease: 'power3.out' });
        gsap.to(idx.map(i => prices[i]), { autoAlpha: 1, duration: 0.7, stagger: 0.08, delay: 0.4 });
      },
    });
    // Первая услуга раскрывается сама — видно, что список живой
    ScrollTrigger.create({ trigger: '.svc', start: 'top 60%', once: true, onEnter: () => gsap.delayedCall(0.9, () => setOpen(items[0], true)) });
    gsap.from('.services__btn--end', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services__btn--end', start: 'top 94%' } });

    /* ---------- финал концепта ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } })
      .from(['.concept-end__title', '.concept-end__text', '.concept-end .btn'], { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0)
      .add(write($('.concept-end__echo'), { duration: 1.3 }), 0.3);

    window.addEventListener('load', refresh, { once: true });
  });
})();
