// Анна — Altituda · «Мироздания Мир». Фирменная идея — орбиты: Анна в центре своей системы,
// планеты проходят за фото и перед ним; в блоке песен орбита превращается в кольцо «вибраций разных частот».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- орбиты: планеты по эллипсам, сзади фото и спереди ---------- */
  // rx/ry — как у эллипсов в разметке; period — секунды на круг; phase — стартовый угол
  const orbits = [
    { cls: 'planet--a', rx: 192, ry: 62, period: 22, phase: 0.7 },
    { cls: 'planet--b', rx: 168, ry: 44, period: 15, phase: 3.9 },
    { cls: 'planet--c', rx: 150, ry: 30, period: 10, phase: 2.1 },
  ].map(o => ({ ...o, back: $(`.orbit__svg--back .${o.cls}`), front: $(`.orbit__svg--front .${o.cls}`) }));

  function placePlanets(time) {
    orbits.forEach(o => {
      const t = o.phase + (time / o.period) * Math.PI * 2;
      const x = 200 + o.rx * Math.cos(t);
      const y = 200 + o.ry * Math.sin(t);
      const inFront = Math.sin(t) > 0; // нижняя половина эллипса — ближе к зрителю
      [o.back, o.front].forEach(p => { p.setAttribute('cx', x.toFixed(2)); p.setAttribute('cy', y.toFixed(2)); });
      o.front.style.visibility = inFront ? 'visible' : 'hidden';
      o.back.style.visibility = inFront ? 'hidden' : 'visible';
    });
  }
  placePlanets(0);

  /* ---------- кольцо частот в блоке песен ---------- */
  const freq = $('.freq');
  const N = 84, R0 = 132;
  const palette = ['#b9c6dd', '#f3c8a0', '#e9b66f', '#f3c8a0'];
  const ring = document.createElementNS(SVGNS, 'circle');
  ring.setAttribute('cx', 200); ring.setAttribute('cy', 200); ring.setAttribute('r', R0 - 8);
  freq.append(ring);
  const bars = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const l = document.createElementNS(SVGNS, 'line');
    l.setAttribute('stroke', palette[Math.floor((i / N) * palette.length * 2) % palette.length]);
    freq.append(l);
    return { l, cos: Math.cos(a), sin: Math.sin(a), i };
  });
  // Длина штриха — сумма волн разной частоты (многоголосье); env — общий «громкость» 0..1
  function drawFreq(time, env) {
    bars.forEach(b => {
      const v = Math.abs(
        0.55 * Math.sin(b.i * 0.36 + time * 1.4) +
        0.3 * Math.sin(b.i * 0.93 - time * 2.3) +
        0.15 * Math.sin(b.i * 2.1 + time * 3.7));
      const len = (6 + 46 * v) * env;
      b.l.setAttribute('x1', (200 + b.cos * R0).toFixed(2));
      b.l.setAttribute('y1', (200 + b.sin * R0).toFixed(2));
      b.l.setAttribute('x2', (200 + b.cos * (R0 + len)).toFixed(2));
      b.l.setAttribute('y2', (200 + b.sin * (R0 + len)).toFixed(2));
    });
  }
  drawFreq(1.2, 1);

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: система собирается вокруг Анны ---------- */
    const name = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const alias = SplitText.create('.hero__alias', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const rings = $$('.orbit__svg ellipse, .orbit__svg path');
    gsap.set(rings, { strokeDasharray: 1 });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); alias.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.orbit__glow', { scale: 0.3, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.1)
      .fromTo('.orbit__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.orbit__photo img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.35)
      .from(rings, { strokeDashoffset: 1, duration: 1.8, stagger: 0.12, ease: 'power2.inOut' }, 0.4)
      .from('.planet', { autoAlpha: 0, duration: 0.8 }, 1.4)
      .from('.sky i', { autoAlpha: 0, duration: 1.2, stagger: { each: 0.06, from: 'random' } }, 0.3)
      .from('.hello', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.55)
      .from(name.chars, { yPercent: 115, stagger: 0.07, duration: 1.1, ease: 'expo.out' }, 0.65)
      .from(alias.chars, { yPercent: 115, stagger: 0.03, duration: 0.9, ease: 'expo.out' }, 0.95)
      .from('.hero__fio', { autoAlpha: 0, duration: 0.8 }, 1.25)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.roles li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.45)
      .from('.hero__meet', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.65)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.75);

    // Планеты идут по орбитам всё время, пока hero на экране
    let orbitTime = 0;
    const orbitTick = (_, dt) => { orbitTime += dt / 1000; placePlanets(orbitTime); };
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: s => (s.isActive ? gsap.ticker.add(orbitTick) : gsap.ticker.remove(orbitTick)),
    });

    // Звёзды мерцают вразнобой
    $$('.sky i').forEach(star => {
      gsap.to(star, { opacity: 0.15, duration: gsap.utils.random(1.4, 3.2), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: gsap.utils.random(1.5, 4) });
    });

    // При прокрутке плоскость орбит наклоняется, фото чуть отстаёт
    gsap.to('.orbit__tilt', {
      rotateX: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.orbit__core', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Проекты: карточки заходят по дуге, как по орбите ---------- */
    revealLines('.offers h2', '.offers .sec-head');
    gsap.from('.offers .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offers .sec-head', start: 'top 84%' } });
    const offers = $$('.offer');
    gsap.set(offers, { rotation: -9, transformOrigin: '50% 900%', autoAlpha: 0 });
    ScrollTrigger.batch(offers, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { rotation: 0, autoAlpha: 1, duration: 1.3, stagger: 0.14, ease: 'expo.out' });
        gsap.from(els.map(el => $('.offer__planet', el)), { scale: 0, rotation: -90, duration: 1.2, stagger: 0.14, delay: 0.2, ease: 'expo.out' });
      },
    });

    /* ---------- 3. Песни: кольцо частот «звучит», пока блок на экране ---------- */
    revealLines('.songs h2', '.songs .sec-head');
    gsap.from('.songs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.songs .sec-head', start: 'top 84%' } });
    revealLines('.songs__lead', '.songs__lead', { duration: 0.95, stagger: 0.06 });
    gsap.from('.songs__credit', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.songs__credit', start: 'top 90%' } });
    gsap.from('.songs__btns .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: '.songs__btns', start: 'top 92%' } });

    const level = { env: 0 };
    let freqTime = 0;
    const freqTick = (_, dt) => { freqTime += dt / 1000; drawFreq(freqTime, level.env); };
    drawFreq(0, 0);
    gsap.from('.freq__center', { scale: 0.6, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.songs__visual', start: 'top 82%' } });
    ScrollTrigger.create({
      trigger: '.songs__visual', start: 'top 82%', once: true,
      onEnter: () => gsap.to(level, { env: 1, duration: 1.6, ease: 'power2.out' }),
    });
    ScrollTrigger.create({
      trigger: '.songs__visual', start: 'top bottom', end: 'bottom top',
      onToggle: s => (s.isActive ? gsap.ticker.add(freqTick) : gsap.ticker.remove(freqTick)),
    });
    $$('[data-count]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, {
        v: Number(el.dataset.count), duration: 1.8, ease: 'power2.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
