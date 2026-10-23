// Вероника Бородина — моушн концепта. Фирменная идея: «танец Венеры».
// Земля и Венера кружат вокруг её портрета (13 оборотов Венеры на 8 земных лет) и оставляют нити между собой —
// за 8 «лет» нити складываются в пятилепестковую розу Венеры. Дальше в GIRL CODE знак ♀ рисуется и «включается».
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
      gsap.from($('.svc__inner', body).children, { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.04, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.svc').forEach(item => {
    $('.svc__head', item).addEventListener('click', () => {
      const list = item.parentElement;
      const open = $('.svc__head', item).getAttribute('aria-expanded') !== 'true';
      $$(':scope > .svc', list).forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  /* ---------- «танец Венеры»: нити на canvas, планеты и нить «сейчас» в SVG ---------- */
  const stage = $('.hero__stage');
  const canvas = $('.dance');
  const ctx = canvas && canvas.getContext('2d');
  const YEARS = 8;            // за 8 лет Земля делает 8 оборотов, Венера — 13: узор замыкается
  const LINES = 300;          // нитей за весь цикл: реже — кружево читается чётче
  const RE = 0.47, RV = 0.34; // радиусы орбит в долях сцены (как в SVG viewBox 0..100)
  const dance = { t: 0, drawn: 0, size: 0 };
  const angle = (t, k) => Math.PI * 2 * t * k - Math.PI / 2;
  const point = (t, r, k, s) => [s / 2 + Math.cos(angle(t, k)) * r * s, s / 2 + Math.sin(angle(t, k)) * r * s];

  function setupCanvas() {
    if (!ctx) return;
    const s = stage.clientWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dance.size = s;
    canvas.width = Math.round(s * dpr);
    canvas.height = Math.round(s * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(216, 66, 78, .24)';
    const upto = dance.drawn;
    dance.drawn = 0;
    drawLines(upto);
  }
  function drawLines(upto) {
    if (!ctx) return;
    const s = dance.size;
    ctx.beginPath();
    for (let i = dance.drawn; i < upto; i++) {
      const t = (i / LINES) * YEARS;
      const [ex, ey] = point(t, RE, 1, s);
      const [vx, vy] = point(t, RV, 13 / 8, s);
      ctx.moveTo(ex, ey);
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
    dance.drawn = Math.max(dance.drawn, upto);
  }
  // Планеты и нить между ними — в координатах viewBox 0..100
  const earth = $('.planet--earth'), venus = $('.planet--venus'), glow = $('.planet-glow'), thread = $('.thread');
  function placePlanets(t) {
    const [ex, ey] = point(t, RE, 1, 100);
    const [vx, vy] = point(t, RV, 13 / 8, 100);
    earth.setAttribute('cx', ex.toFixed(2)); earth.setAttribute('cy', ey.toFixed(2));
    venus.setAttribute('cx', vx.toFixed(2)); venus.setAttribute('cy', vy.toFixed(2));
    glow.setAttribute('cx', vx.toFixed(2)); glow.setAttribute('cy', vy.toFixed(2));
    thread.setAttribute('x1', ex.toFixed(2)); thread.setAttribute('y1', ey.toFixed(2));
    thread.setAttribute('x2', vx.toFixed(2)); thread.setAttribute('y2', vy.toFixed(2));
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (stage.clientWidth !== dance.size) setupCanvas(); }, 120);
  });

  if (!animate) {
    // Статичная страница: роза Венеры нарисована целиком, первая услуга открыта
    dance.drawn = LINES;
    setupCanvas();
    placePlanets(0.3);
    setOpen($('.svc'), true, true);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    setupCanvas();
    placePlanets(0);

    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__frame', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.hero__frame img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.orbit', { scale: 0.6, transformOrigin: '50% 50%', autoAlpha: 0, duration: 1.6, stagger: 0.12, ease: 'expo.out' }, 0.35)
      .from(['.planet', '.planet-glow', '.thread'], { autoAlpha: 0, duration: 0.6 }, 0.9)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45)
      .from(name.chars, { yPercent: 112, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1 }, 1.05)
      .from('.stats li', { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.25)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.4);

    // Танец: 8 «лет» за 11 секунд — нити ложатся одна за другой; потом планеты кружат медленно, без новых нитей
    gsap.to(dance, {
      t: YEARS, duration: 11, ease: 'power1.inOut', delay: 0.8,
      onUpdate: () => { drawLines(Math.round((dance.t / YEARS) * LINES)); placePlanets(dance.t); },
      onComplete: () => {
        drawLines(LINES);
        gsap.ticker.add((time, dt) => { dance.t += dt / 1000 / 45; placePlanets(dance.t); });
      },
    });
    // При прокрутке роза медленно поворачивается
    gsap.to(['.dance', '.orbits'], {
      rotation: 36, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    /* ---------- 2. GIRL CODE ---------- */
    const title = SplitText.create('.code__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.code__head', start: 'top 80%' }, onComplete: () => title.revert() })
      .from('.code .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7 }, 0)
      .from(title.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.1)
      .from('.code__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.5);
    revealLines('.code__quote');
    // Роза Венеры прорисовывается одной линией, как путь Венеры за 8 лет, и дальше медленно поворачивается с прокруткой
    const rose = $('.code__rose-path');
    const roseLen = rose.getTotalLength();
    gsap.fromTo(rose, { strokeDasharray: roseLen, strokeDashoffset: roseLen }, {
      strokeDashoffset: 0, duration: 4.2, ease: 'power1.inOut',
      scrollTrigger: { trigger: '.code__head', start: 'top 72%' },
    });
    gsap.from('.code__rose-earth', { scale: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(3)', scrollTrigger: { trigger: '.code__head', start: 'top 72%' } });
    gsap.to('.code__rose', { rotation: 72, ease: 'none', scrollTrigger: { trigger: '.code', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.code__body > p:not(.label)', {
      y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.code__body', start: 'top 85%' },
    });

    // ♀ рисуется линией, затем «включается»: ореол вспыхивает, слова подсвечиваются
    const path = $('.venus__path');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set('.venus__on', { '--hl': '0%' });
    gsap.timeline({ scrollTrigger: { trigger: '.venus', start: 'top 78%' } })
      .from('.venus', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
      .to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
      .fromTo('.venus__halo', { fill: 'rgba(242, 165, 157, 0)', scale: 0.4, transformOrigin: '50% 50%' },
        { fill: 'rgba(242, 165, 157, .2)', scale: 1, duration: 1.1, ease: 'expo.out' }, 1.6)
      .fromTo('.venus__sign', { filter: 'drop-shadow(0 0 0px rgba(242, 165, 157, 0))' },
        { filter: 'drop-shadow(0 0 18px rgba(242, 165, 157, .75))', duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.6)
      .to('.venus__on', { '--hl': '100%', duration: 0.9, ease: 'power2.inOut' }, 1.7);

    // Пункты «загораются» по одному, как Венера в hero
    gsap.from('.code .label', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.code .label', start: 'top 88%' } });
    const lis = $$('.code__list li');
    gsap.set(lis, { x: -14, autoAlpha: 0 });
    ScrollTrigger.batch(lis, {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, {
        x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        onStart() { els.forEach((el, i) => gsap.delayedCall(0.25 + i * 0.12, () => $('.code__dot', el).classList.add('is-on'))); },
      }),
    });
    gsap.timeline({ scrollTrigger: { trigger: '.code__buy', start: 'top 86%' } })
      .from('.code__buy', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from('.code__buy > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.2);

    /* ---------- 3. Консультации ---------- */
    revealLines('.astro h2', '.astro .sec-head');
    gsap.from(['.astro .eyebrow', '.sec-quote'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.18,
      scrollTrigger: { trigger: '.astro .sec-head', start: 'top 82%' },
    });
    const items = $$('.astro .svc');
    gsap.set(items, { y: 24, autoAlpha: 0, '--draw': 0, '--thread-o': 1 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.07, ease: 'power3.out' });
        // Розовая нить прочерчивает строку и растворяется в обычной линии
        gsap.timeline().to(els, { '--draw': 1, duration: 0.9, stagger: 0.07, ease: 'power2.inOut' })
          .to(els, { '--thread-o': 0, duration: 0.9, stagger: 0.07, ease: 'power1.out' }, 0.8);
      },
    });
    ScrollTrigger.create({
      trigger: '.svc-list', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.7, () => setOpen(items[0], true)),
    });
    gsap.fromTo('.forecast', { clipPath: 'inset(0% 100% 0% 0% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.forecast', start: 'top 90%' },
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
