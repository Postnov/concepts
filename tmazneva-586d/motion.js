// Татьяна Мазнева — моушн концепта.
// Фирменная идея — «линия состояния»: в hero она нервная, как кардиограмма тревоги, и по мере прокрутки
// затихает, а в блоке канала «Из тревоги в спокойствие» превращается в ровное дыхание.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- линия состояния: работает и без GSAP (тогда рисуется один статичный кадр) ---------- */
  const pulses = $$('[data-pulse]').map(el => ({
    el,
    svg: $('.pulse__svg', el),
    path: $('.pulse__path', el),
    dot: $('.pulse__dot', el),
    from: Number(el.dataset.from),
    to: Number(el.dataset.to),
    k: animate ? Number(el.dataset.from) : Number(el.dataset.to), // напряжение 0..1
    t: Math.random() * 20, // «время» волны
    beat: 0,               // фаза удара точки
    W: 0, H: 0, dotAt: 0.8,
    visible: false,
  }));

  function measure(p) {
    p.W = p.el.clientWidth;
    p.H = p.el.clientHeight;
    p.dotAt = parseFloat(getComputedStyle(p.el).getPropertyValue('--dot')) || 0.8;
    p.svg.setAttribute('viewBox', `0 0 ${p.W} ${p.H}`);
  }

  // Смещение линии в точке x (в долях амплитуды): спокойная длинная волна + «нервы» — частые колебания
  // и всплески, как на кардиограмме; вес нервов задаёт напряжение k. К краям линия плавно гаснет.
  function offset(x, t, k, W) {
    const e = Math.min(1, (x / W) / 0.06, (1 - x / W) / 0.06);
    const env = e * e * (3 - 2 * e);
    const calm = Math.sin(x * 0.011 + t * 0.9) * 0.2 + Math.sin(x * 0.029 - t * 0.55) * 0.07;
    const nerve = Math.sin(x * 0.31 + t * 8.7) * 0.2 + Math.sin(x * 0.171 - t * 6.1) * 0.24 + Math.sin(x * 0.067 + t * 3.3) * 0.28;
    const burst = Math.pow(Math.max(0, Math.sin(x * 0.017 - t * 2.2)), 12) * Math.sin(x * 0.45 + t * 4) * 1.2;
    return env * (calm + k * nerve + k * k * burst);
  }

  function draw(p) {
    if (!p.W) return;
    const { W, H, k, t } = p;
    const mid = H / 2;
    const amp = H * 0.44;
    const n = Math.ceil(W / (W > 900 ? 5 : 4));
    let d = '';
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (mid + amp * offset(x, t, k, W)).toFixed(1);
    }
    p.path.setAttribute('d', d);
    if (p.dot) {
      const x = W * p.dotAt;
      p.dot.style.translate = `${x.toFixed(1)}px ${(mid + amp * offset(x, t, k, W)).toFixed(1)}px`;
      // Точка «бьётся»: при напряжении — двойной удар сердца, в покое — медленное дыхание
      const b = p.beat;
      const heart = Math.exp(-(((b - 0.08) / 0.045) ** 2)) + 0.6 * Math.exp(-(((b - 0.26) / 0.045) ** 2));
      const breath = 0.5 - 0.5 * Math.cos(b * Math.PI * 2);
      p.dot.style.scale = (1 + 0.55 * (k * heart + (1 - k) * breath * 0.7)).toFixed(3);
    }
  }

  const redrawAll = () => pulses.forEach(p => { measure(p); draw(p); });
  pulses.forEach(p => {
    if ('ResizeObserver' in window) new ResizeObserver(() => { measure(p); draw(p); }).observe(p.el);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      const p = pulses.find(q => q.el === en.target);
      if (p) p.visible = en.isIntersecting;
    }), { rootMargin: '120px 0px' });
    pulses.forEach(p => io.observe(p.el));
  } else {
    pulses.forEach(p => { p.visible = true; });
  }

  if (!animate) {
    // Статичная версия: линии нарисованы в конечном состоянии, всё видно сразу
    redrawAll();
    window.addEventListener('load', redrawAll, { once: true });
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function countUp(el, snap) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = MotionBase.money(0);
    return gsap.to(o, {
      v: to, duration: 1.6, ease: 'power2.out', snap: { v: snap || 1 },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
    });
  }

  MotionBase.ready(() => {
    redrawAll();
    gsap.ticker.add((time, deltaTime) => {
      const dt = Math.min(deltaTime, 50) / 1000;
      for (const p of pulses) {
        if (!p.visible) continue;
        p.t += dt * (0.35 + 0.95 * p.k);                  // в тревоге волна бежит быстрее
        p.beat = (p.beat + dt * (0.22 + 1.1 * p.k)) % 1;  // ≈80 ударов в минуту → вдох раз в 4,5 с
        draw(p);
      }
    });
    const [heroPulse, midPulse, calmPulse] = pulses;

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero .frame');
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.hero .frame img', { scale: 1.28, duration: 2.2, ease: 'expo.out' }, 0.3)
      .from('.hero__kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(first.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from(last.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.75)
      .fromTo(heroPulse.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.9)
      .from(heroPulse.dot, { autoAlpha: 0, duration: 0.5 }, 2.3);

    // Нижняя часть hero: на десктопе — в интро, на мобильном — при прокрутке
    const inFold = el => el.getBoundingClientRect().top < innerHeight * 0.92;
    [['.facts', 1.25], ['.hero__lead', 1.4], ['.motto', 1.55], ['.cta', 1.7]].forEach(([sel, at]) => {
      const el = $(sel);
      const vars = { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out' };
      if (inFold(el)) intro.from(el, vars, at);
      else gsap.from(el, { ...vars, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    const facts = $('.facts');
    const startFacts = () => $$('.fact__num [data-count]').forEach(el => countUp(el));
    if (inFold(facts)) intro.call(startFacts, null, 1.3);
    else ScrollTrigger.create({ trigger: facts, start: 'top 90%', once: true, onEnter: startFacts });

    // Напряжение линий падает с прокруткой
    gsap.fromTo(heroPulse, { k: heroPulse.from }, {
      k: heroPulse.to, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
    gsap.to('.hero .frame img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Услуги ---------- */
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 86%' } });
    revealLines('.services h2', '.services .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.services__photo', start: 'top 84%' } })
      .fromTo('.services__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.services__photo img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.15);

    gsap.fromTo(midPulse.path, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: midPulse.el, start: 'top 88%' },
    });
    gsap.fromTo(midPulse, { k: midPulse.from }, {
      k: midPulse.to, ease: 'none',
      scrollTrigger: { trigger: midPulse.el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });

    const rows = $$('.price li');
    gsap.set(rows, { y: 28, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' });
        els.forEach((li, i) => gsap.delayedCall(0.1 + i * 0.1, () => countUp($('[data-count]', li), 100)));
      },
    });
    gsap.from('.programs__label', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs', start: 'top 88%' } });
    const tiles = $$('.programs__grid li');
    gsap.set(tiles, { y: 36, autoAlpha: 0 });
    ScrollTrigger.batch(tiles, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.1, ease: 'expo.out' }),
    });

    /* ---------- 3. Канал: линия успокаивается ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.channel__photo', start: 'top 84%' } })
      .fromTo('.channel__photo .frame', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from('.channel__photo img', { scale: 1.25, duration: 2.1, ease: 'expo.out' }, 0.15);
    gsap.from('.channel .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.channel__text', start: 'top 86%' } });
    revealLines('.channel h2', '.channel h2');

    gsap.fromTo(calmPulse.path, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
      scrollTrigger: { trigger: calmPulse.el, start: 'top 90%' },
    });
    gsap.from(calmPulse.dot, { autoAlpha: 0, duration: 0.6, delay: 1.2, scrollTrigger: { trigger: calmPulse.el, start: 'top 90%' } });
    gsap.fromTo(calmPulse, { k: calmPulse.from }, {
      k: calmPulse.to, ease: 'none',
      scrollTrigger: { trigger: calmPulse.el, start: 'top 92%', end: 'top 32%', scrub: 1 },
    });
    gsap.from(['.channel__about', '.channel .btn'], {
      y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.channel__about', start: 'top 90%' },
    });
    gsap.from(['.contacts__reviews', '.contacts__list li'], {
      y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.contacts', start: 'top 92%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => { redrawAll(); ScrollTrigger.refresh(); }, { once: true });
  });
})();
