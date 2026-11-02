// Анастасия Боровинская — моушн концепта.
// Фирменная идея «тревога стихает»: нервная дрожащая линия (как запись пульса при тревоге) успокаивается
// и переходит в ровную дышащую волну. В hero — из линии раскрывается фото, в запросах — линия вдоль списка
// от дрожи к волне, в карточке услуги — снова вздрагивает и успокаивается.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  // Детерминированный генератор: форма линий одинакова при каждой загрузке
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  /* ---------- Пульс: горизонтальная линия «тревога → покой» ---------- */
  function Pulse(svg, o) {
    const paths = $$('path', svg);
    const st = { calm: animate ? 0 : 1 };
    const rand = rng(o.seed);
    // Резкие вздрагивания: в основном мелкие, иногда сильный пик
    const spike = () => {
      const r = rand() * 2 - 1;
      return Math.sign(r) * Math.pow(Math.abs(r), 1.5) * (rand() < 0.14 ? 1 : 0.42);
    };
    let W = 1, H = 1, N = 24, cur = [], next = [], last = 0, on = false;
    const fill = () => Array.from({ length: N + 1 }, spike);
    function size() {
      const r = svg.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      svg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
      N = Math.max(24, Math.round(W / o.step));
      cur = fill(); next = fill();
    }
    function draw(time) {
      const mid = H / 2, anx = 1 - st.calm;
      if (anx > 0.001 && time - last > 0.075) { cur = next; next = fill(); last = time; }
      const f = Math.min(1, (time - last) / 0.075);
      const breath = 0.7 + 0.3 * Math.sin(time * Math.PI / 4); // вдох-выдох по 4 с
      let d = '';
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const wave = Math.sin((x / o.wave) * Math.PI * 2 - time * o.speed) * o.calm * breath;
        const jag = ((cur[i] + (next[i] - cur[i]) * f) + Math.sin(x * 0.13 + time * 14) * 0.16) * o.amp;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (mid + wave * st.calm + jag * anx).toFixed(2);
      }
      paths.forEach(p => p.setAttribute('d', d));
    }
    const tick = () => draw(gsap.ticker.time);
    size();
    draw(0);
    new ResizeObserver(() => { size(); draw(animate ? gsap.ticker.time : 0); }).observe(svg);
    // Анимируем только на экране
    if (animate) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !on) { on = true; gsap.ticker.add(tick); }
        else if (!e.isIntersecting && on) { on = false; gsap.ticker.remove(tick); }
      }).observe(svg);
    }
    // Перерисовка вне экрана (тикер стоит): чтобы линия не замерла в «тревожном» кадре, пока успокаивается
    const sync = () => { if (!on) draw(gsap.ticker.time); };
    return { st, paths, sync };
  }

  /* ---------- Линия вдоль списка запросов: сверху дрожь, книзу ровная волна ---------- */
  const rail = $('.rail');
  const list = $('.req__list');
  const railDraw = $('.rail__draw');
  const pen = $('.rail__pen');
  let railLen = 0;
  function buildRail() {
    const W = 40, H = Math.max(1, list.offsetHeight);
    rail.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rand = rng(23);
    const step = 8, n = Math.ceil(H / step);
    let d = '';
    for (let i = 0; i <= n; i++) {
      const y = Math.min(H, i * step), p = y / H;
      const anx = Math.pow(Math.max(0, 1 - p * 1.12), 1.7);
      const r = rand() * 2 - 1;
      const s = Math.sign(r) * Math.pow(Math.abs(r), 1.4) * (rand() < 0.16 ? 1 : 0.45);
      const x = W / 2 + s * 17 * anx + Math.sin((y / 130) * Math.PI * 2) * 4.5 * (1 - anx);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    $$('path', rail).forEach(p => p.setAttribute('d', d));
    railLen = railDraw.getTotalLength();
  }
  function placePen(p) {
    if (!railLen) return;
    const pt = railDraw.getPointAtLength(Math.min(1, Math.max(0, p)) * railLen);
    pen.setAttribute('cx', pt.x.toFixed(1));
    pen.setAttribute('cy', pt.y.toFixed(1));
  }

  /* ---------- Положение линии в hero: на мобильном — на 74% высоты фото, на десктопе — ниже текста, на 94% ---------- */
  const hero = $('.hero');
  const heroLine = $('.pulse--hero');
  const heroFrame = $('.hero__photo');
  const wide = matchMedia('(min-width: 900px)');
  const lineAt = () => (wide.matches ? 0.94 : 0.74);
  function placeHeroLine() {
    // у svg нет offsetHeight — берём из getBoundingClientRect
    const top = heroFrame.offsetTop + heroFrame.offsetHeight * lineAt() - heroLine.getBoundingClientRect().height / 2;
    heroLine.style.top = `${top.toFixed(1)}px`;
  }

  const heroPulse = Pulse(heroLine, { step: 6, amp: 30, calm: 11, wave: 300, speed: 0.9, seed: 11 });
  const offerPulse = Pulse($('.pulse--offer'), { step: 5, amp: 13, calm: 5, wave: 150, speed: 1.3, seed: 5 });

  const layout = () => { placeHeroLine(); buildRail(); };
  layout();
  new ResizeObserver(layout).observe(hero);
  new ResizeObserver(() => { buildRail(); if (animate) ScrollTrigger.refresh(); }).observe(list);

  if (!animate) {
    placePen(1);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    layout();

    /* ---------- 1. Hero: линия дрожит → из неё раскрывается фото → линия успокаивается ---------- */
    const name = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');
    const R = 'round 30px';

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(heroPulse.paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.inOut' }, 0.05)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .fromTo(frame,
        { clipPath: `inset(${lineAt() * 100}% 0% ${(1 - lineAt()) * 100}% 0% ${R})` },
        { clipPath: `inset(0% 0% 0% 0% ${R})`, duration: 1.35, ease: 'expo.inOut' }, 0.45)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.6)
      .to(heroPulse.st, { calm: 1, duration: 1.9, ease: 'power2.inOut', onUpdate: heroPulse.sync }, 0.55)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.75)
      .from('.hero__last', { letterSpacing: '.7em', autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.05)
      .from('.hero .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.25)
      .from('.roles li', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 1.4);

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: линия рисуется прокруткой — дрожь стихает к концу списка ---------- */
    revealLines('.req h2', '.req .sec-head');
    gsap.from(['.req .eyebrow', '.req .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.req .sec-head', start: 'top 84%' },
    });
    const railProg = { p: 0 };
    gsap.set(railDraw, { strokeDashoffset: 1 });
    placePen(0);
    gsap.to(railProg, {
      p: 1, ease: 'none',
      onUpdate: () => { railDraw.style.strokeDashoffset = 1 - railProg.p; placePen(railProg.p); },
      // once: после конца списка линия остаётся нарисованной
      scrollTrigger: { trigger: '.req__body', start: 'top 72%', end: 'bottom 62%', scrub: true, once: true },
    });
    const items = $$('.req__item');
    gsap.set(items, { x: 18, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 86%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }),
    });

    /* ---------- 3. Услуга ---------- */
    revealLines('.service h2', '.service .sec-head');
    gsap.from('.service .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.service .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.service__grid', start: 'top 80%' } })
      .fromTo('.service__photo .frame',
        { clipPath: 'inset(0% 100% 0% 0% round 30px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.service__photo img', { scale: 1.25, duration: 1.9, ease: 'expo.out' }, 0.1);
    gsap.timeline({ scrollTrigger: { trigger: '.offer', start: 'top 82%' } })
      .from('.offer', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.offer__ava', { scale: 0.6, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.25)
      .from('.offer__meta span', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from('.offer__title', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.4)
      // Цена появляется целиком, без счётчика
      .from('.offer__price', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.5)
      .fromTo(offerPulse.paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 0.55)
      .to(offerPulse.st, { calm: 1, duration: 1.8, ease: 'power2.inOut', onUpdate: offerPulse.sync }, 0.8)
      .from('.offer__terms li', { x: -10, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.75)
      .from('.offer .btn', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.95);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
