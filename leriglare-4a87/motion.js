// Валерия Кулагина (leri.glare) — моушн концепта.
// Фирменная идея — «блик» (glare): тёплый солнечный блик, как в объективе на закате.
// В hero источник света медленно плывёт над её портретом, анаморфная полоса и «призраки» линзы
// честно лежат на оси «источник → центр кадра» и качаются в противофазе; при прокрутке солнце скатывается вниз.
// Интро — засветка: кадр проявляется из пересвета. Дальше тот же блик один раз проходит по заголовкам и карточкам.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- «развернуть описание» в карточках: работает и без GSAP ---------- */
  function setOpen(btn, open) {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'свернуть описание' : 'развернуть описание';
    if (!animate) { body.hidden = !open; return; }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.6, ease: 'power3.out', onComplete: () => { body.style.height = ''; refresh(); } });
      gsap.from(body.children, { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.06, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); } });
    }
  }
  $$('.card__toggle').forEach(btn => btn.addEventListener('click', () => setOpen(btn, btn.getAttribute('aria-expanded') !== 'true')));

  /* ---------- блик линзы ---------- */
  const media = $('.hero__media');
  const flare = $('.flare');
  const core = $('.flare__core');
  const streak = $('.flare__streak');
  const ghosts = $$('.flare__ghost');
  // k — где «призрак» на оси: G = C + k·(C − L), за центром кадра напротив источника
  const GK = [0.55, 0.95, 1.45];
  // lx, ly — положение источника в долях кадра (портрета); light — яркость 0..1
  function place(lx, ly, light = 1) {
    const W = media.offsetWidth, H = media.offsetHeight;
    // .flare на десктопе шире кадра: переводим координаты кадра в координаты слоя блика
    const fx = -flare.offsetLeft, fy = -flare.offsetTop;
    const Lx = lx * W + fx, Ly = ly * H + fy;
    const Cx = W / 2 + fx, Cy = H / 2 + fy;
    core.style.transform = `translate(${Lx}px, ${Ly}px)`;
    core.style.opacity = light;
    streak.style.transform = `translate(${Lx}px, ${Ly}px)`;
    streak.style.opacity = 0.55 + light * 0.45;
    ghosts.forEach((g, i) => {
      g.style.transform = `translate(${Cx + GK[i] * (Cx - Lx)}px, ${Cy + GK[i] * (Cy - Ly)}px)`;
    });
  }
  // Свет слева сверху, над полями шляпы — как на её фото
  const BASE = { x: 0.24, y: 0.17 };
  place(BASE.x, BASE.y);
  window.addEventListener('resize', () => place(BASE.x, BASE.y));

  if (!animate) return;

  // Заголовок строками из-под маски
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  // Блик-полоса проходит по элементу один раз
  function glint(el, trigger, delay = 0.25) {
    gsap.fromTo(el, { '--glint': '-130%' }, {
      '--glint': '330%', duration: 1.7, delay, ease: 'power2.inOut',
      scrollTrigger: { trigger: trigger || el.parentElement, start: 'top 78%' },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: засветка → проявление ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const drift = { x: BASE.x, y: BASE.y, light: 0 };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__flash', { opacity: 0.95 }, { opacity: 0, duration: 1.8, ease: 'power2.out' }, 0)
      .fromTo('.hero__photo img',
        { scale: 1.16, filter: 'brightness(1.9) saturate(.5) blur(6px)' },
        { scale: 1, filter: 'brightness(1) saturate(1) blur(0px)', duration: 2.4, ease: 'expo.out', clearProps: 'filter' }, 0)
      .fromTo(drift, { light: 0, x: 0.5, y: 0.32 }, { light: 1, x: BASE.x, y: BASE.y, duration: 2.2, ease: 'expo.out' }, 0.15)
      .from(streak, { scaleX: 0.15, duration: 1.8, ease: 'expo.out' }, 0.35)
      .from(ghosts, { autoAlpha: 0, scale: 0.4, duration: 1.2, stagger: 0.12 }, 0.9)
      .from('.hero__kicker > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.6)
      .from(first.chars, { yPercent: 115, stagger: 0.055, duration: 1.15, ease: 'expo.out' }, 0.55)
      .from(last.chars, { autoAlpha: 0, x: -6, stagger: 0.03, duration: 0.6 }, 1.05)
      .from('.hero__tag', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 1.25)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.5);

    /* Блик живёт: источник плывёт по маленькому эллипсу, яркость дышит; при прокрутке солнце скатывается вниз */
    let scrollP = 0;
    let t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const settle = Math.min(1, t / 2.4); // пока идёт интро, дрейф нарастает плавно
      const x = drift.x + settle * (Math.sin(t * 0.42) * 0.05 + Math.sin(t * 0.17) * 0.03) + scrollP * 0.22;
      const y = drift.y + settle * (Math.cos(t * 0.33) * 0.035) + scrollP * 0.48;
      const light = drift.light * (0.88 + 0.12 * Math.sin(t * 0.9)) * (1 - scrollP * 0.35);
      place(x, y, light);
    };
    let ticking = false;
    const run = on => {
      if (on === ticking) return;
      ticking = on;
      on ? gsap.ticker.add(tick) : gsap.ticker.remove(tick);
    };
    run(true);
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: self => { scrollP = self.progress; },
    });
    // за пределами экрана блик не считаем
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: self => run(self.isActive) });
    gsap.to('.hero__photo img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Солнечный блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    /* ---------- 2. Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' } });
    glint($('.topics .glint'), '.topics .sec-head', 0.45);
    const items = $$('.topics__list li');
    gsap.set(items, { autoAlpha: 0, y: 22 });
    ScrollTrigger.batch(items, {
      start: 'top 88%', once: true,
      onEnter: els => {
        gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' });
        // точка вспыхивает, как солнечный зайчик, и успокаивается
        gsap.fromTo(els.map(el => $('.dot', el)),
          { scale: 2.6, boxShadow: '0 0 0 10px rgba(240,168,104,0), 0 0 34px 12px rgba(255,214,170,.95)' },
          { scale: 1, boxShadow: '0 0 0 4px rgba(240,168,104,.18), 0 0 14px 2px rgba(240,168,104,.55)', duration: 1.2, stagger: 0.09, ease: 'power2.out', clearProps: 'boxShadow,scale' });
      },
    });
    revealLines('.topics__close');

    /* ---------- 3. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    glint($('.formats .sec-head .glint'), '.formats .sec-head', 0.45);
    $$('.card').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.fromTo(card, { clipPath: 'inset(18% 4% 0% 4% round 26px)', y: 40, autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', clearProps: 'clipPath' })
        .from(card.querySelectorAll('.card__top, .card__title, .card__lead, .card__toggle'), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.2)
        // цена появляется целиком, без счётчика
        .from(card.querySelectorAll('.card__foot, .card__prices, .card__note, .btn--wide'), { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.45)
        .fromTo($('.glint', card), { '--glint': '-130%' }, { '--glint': '330%', duration: 1.5, ease: 'power2.inOut' }, 0.5);
    });
    gsap.from('.formats__cta', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats__cta', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
