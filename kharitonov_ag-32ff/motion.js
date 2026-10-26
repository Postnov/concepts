// Андрей Харитонов — моушн концепта.
// Фирменная идея «путь капсулы»: тонкая линия-тракт, по которой едет капсула (как капсульная эндоскопия).
// В hero она облетает портрет-«линзу», дальше с прокруткой проходит петлями между секциями — путь пациента к диагнозу.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- пути: строятся в пикселях своего блока (viewBox = размер блока), без искажений ---------- */
  const tracts = $$('[data-tract]').map(el => ({
    el,
    kind: el.dataset.tract,
    flip: el.classList.contains('tract--flip'),
    svg: $('.tract__svg', el),
    line: $('.tract__line', el),
    flow: $('.tract__flow', el),
    cap: $('.capsule', el),
    L: 1, rest: 0, p: 0,
  }));
  const orbit = tracts.find(t => t.kind === 'orbit');
  const coils = tracts.filter(t => t.kind === 'coil');
  const f = n => n.toFixed(1);

  // Hero: заход слева сверху → полный облёт линзы против часовой → выход вправо вниз
  function orbitPath(t, W, H) {
    const lens = $('.lens', t.el);
    const r = lens.offsetWidth / 2;
    const cx = lens.offsetLeft + r, cy = lens.offsetTop + r;
    const R = r + Math.max(16, W * 0.045);
    const a0 = (160 * Math.PI) / 180;
    const P = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)];
    const dir = [Math.sin(a0), -Math.cos(a0)]; // касательная при движении против часовой
    const k = R * 0.9;
    const B = [cx, cy + R], T = [cx, cy - R];
    // Мобайл: заход с левого края экрана; десктоп: сверху, от края hero (линия «спускается» к линзе)
    const wide = window.innerWidth >= 900;
    const hero = t.el.closest('.hero');
    const dy = hero ? t.el.getBoundingClientRect().top - hero.getBoundingClientRect().top : 0;
    const S = wide ? [W * 0.08, -dy - 12] : [-30, H * 0.05];
    const C1 = wide ? [W * -0.02, H * 0.12] : [W * 0.16, H * 0.03];
    const prefix =
      `M ${f(S[0])} ${f(S[1])} C ${f(C1[0])} ${f(C1[1])} ${f(P[0] - dir[0] * k)} ${f(P[1] - dir[1] * k)} ${f(P[0])} ${f(P[1])}` +
      ` A ${f(R)} ${f(R)} 0 0 0 ${f(B[0])} ${f(B[1])}` +
      ` A ${f(R)} ${f(R)} 0 0 0 ${f(T[0])} ${f(T[1])}` +
      ` A ${f(R)} ${f(R)} 0 0 0 ${f(B[0])} ${f(B[1])}`;
    const exit = ` C ${f(cx + R * 0.8)} ${f(B[1])} ${f(W * 0.84)} ${f(H * 0.99)} ${f(W + 34)} ${f(H * 0.97)}`;
    return { prefix, d: prefix + exit };
  }

  // Разделитель: петли вытянутой трохоиды — спокойный «тракт» с неровными витками
  function coilPath(t, W, H) {
    const pad = 44;
    const span = W + pad * 2;
    const b = H * 0.33;                 // радиус витка
    const a = b / 1.85;                 // шаг: b > a даёт петли
    const tMax = span / a;
    const pts = [];
    for (let s = 0; s <= tMax + 0.001; s += 0.07) {
      const bb = b * (0.86 + 0.14 * Math.sin(s * 0.33 + 0.6)); // не меньше 1,4·a — всегда петля, без «изломов»
      let x = -pad + a * s - bb * Math.sin(s);
      const y = H / 2 + H * 0.07 * Math.sin(s * 0.19) - bb * Math.cos(s) * 0.92;
      if (t.flip) x = W - x;
      pts.push(`${f(x)} ${f(y)}`);
    }
    return { prefix: '', d: 'M ' + pts.join(' L ') };
  }

  function build(t) {
    const W = t.el.clientWidth, H = t.el.clientHeight;
    if (!W || !H) return;
    t.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const { prefix, d } = t.kind === 'orbit' ? orbitPath(t, W, H) : coilPath(t, W, H);
    if (prefix) {
      t.line.setAttribute('d', prefix);
      const Lp = t.line.getTotalLength();
      t.line.setAttribute('d', d);
      t.rest = Lp / t.line.getTotalLength();
    } else {
      t.line.setAttribute('d', d);
    }
    if (t.flow) t.flow.setAttribute('d', d);
    t.L = t.line.getTotalLength();
    t.line.style.strokeDasharray = `${t.L} ${t.L + 20}`;
    render(t, t.p);
  }

  // Прорисовка линии до капсулы и положение/поворот капсулы по касательной
  function render(t, p) {
    t.p = p;
    const s = Math.max(0, Math.min(1, p)) * t.L;
    t.line.style.strokeDashoffset = String(t.L - s);
    const pt = t.line.getPointAtLength(s);
    const a = t.line.getPointAtLength(Math.max(0, s - 1.5));
    const b = t.line.getPointAtLength(Math.min(t.L, s + 1.5));
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    t.cap.style.transform = `translate(${pt.x.toFixed(2)}px, ${pt.y.toFixed(2)}px) rotate(${ang.toFixed(2)}deg)`;
    t.cap.classList.add('is-on');
  }

  const buildAll = () => tracts.forEach(build);
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    buildAll();
    if (animate) ScrollTrigger.refresh();
  });

  if (!animate) {
    // Статичная версия: линия прорисована до капсулы, капсула стоит на пути
    const show = () => {
      orbit.p = 0; build(orbit); render(orbit, orbit.rest);
      coils.forEach(t => { t.p = 0.62; build(t); });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
    return;
  }

  // Заголовок секции строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...vars,
  });

  MotionBase.ready(() => {
    buildAll();

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const pop = { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.2)' };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        first.revert(); last.revert(); lead.revert();
        // После интро капсула продолжает путь с прокруткой и уходит вправо вниз
        gsap.fromTo(orbit, { p: orbit.rest }, {
          p: 1, ease: 'none', immediateRender: false,
          onUpdate: () => render(orbit, orbit.p),
          scrollTrigger: { trigger: orbit.el, start: 'top 12%', end: 'bottom top', scrub: 0.6 },
        });
      },
    });
    render(orbit, 0);
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(first.chars, { yPercent: 112, stagger: 0.045, duration: 1, ease: 'expo.out' }, 0.3)
      .from('.hero__mid', { x: -14, autoAlpha: 0, duration: 0.8 }, 0.6)
      .from(last.chars, { yPercent: 112, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.5)
      .from('.lens__halo', { scale: 0.55, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.35)
      .fromTo('.lens__frame', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.4)
      .from('.lens__frame img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.55)
      // Капсула проходит заход и полный облёт линзы
      .fromTo(orbit, { p: 0 }, { p: () => orbit.rest, duration: 2.8, ease: 'power2.inOut', onUpdate: () => render(orbit, orbit.p) }, 0.7)
      .from('.tag--a', pop, 2.0)
      .from('.tag--b', pop, 2.75)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.fact', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.55)
      .to('.tract__flow', { opacity: 0.55, duration: 1.2, ease: 'none' }, 3.3);

    // Лёгкий параллакс портрета внутри линзы
    gsap.to('.lens__frame img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero__art', start: 'top 30%', end: 'bottom top', scrub: true },
    });

    /* ---------- разделители: капсула проходит петли вместе с прокруткой ---------- */
    coils.forEach(t => {
      gsap.fromTo(t, { p: 0 }, {
        p: 1, ease: 'none',
        onUpdate: () => render(t, t.p),
        scrollTrigger: { trigger: t.el, start: 'top 94%', end: 'bottom 18%', scrub: 0.6 },
      });
    });

    /* ---------- 2. Очный приём ---------- */
    revealLines('.clinics h2', '.clinics .sec-head');
    fadeUp(['.clinics .eyebrow', '.clinics .sec-sub'], '.clinics .sec-head', { stagger: 0.15 });
    $$('.card').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } });
      tl.from(card, { y: 46, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: i * 0.08 })
        // Луч «сканера» проходит карточку сверху вниз
        .fromTo($('.card__scan', card), { yPercent: -100 }, { yPercent: 330, duration: 1.4, ease: 'power2.inOut' }, 0.2)
        .from($$('.card__city, .card__title, .card__addr', card), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.3)
        // Цены появляются целиком, без счётчика
        .from($$('.price__row', card), { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.75 }, 0.55)
        .from($('.btn', card), { y: 14, autoAlpha: 0, duration: 0.7 }, 0.85);
    });

    /* ---------- 3. Онлайн ---------- */
    revealLines('.online h2', '.online .sec-head');
    fadeUp(['.online .eyebrow', '.online .sec-sub'], '.online .sec-head', { stagger: 0.15 });
    fadeUp('.online__how', '.online__how');
    const quote = SplitText.create('.online__quote p', { type: 'lines', mask: 'lines' });
    // Цитата: акцентная черта растёт сверху вниз, строки поднимаются из-под маски
    gsap.timeline({ scrollTrigger: { trigger: '.online__quote', start: 'top 85%' }, onComplete: () => quote.revert() })
      .fromTo('.online__quote', { '--bar-scale': 0 }, { '--bar-scale': 1, duration: 1.1, ease: 'expo.inOut' }, 0)
      .from(quote.lines, { yPercent: 100, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.15);
    fadeUp('.format', '.format');
    gsap.from('.tile', {
      y: 40, rotateX: -14, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.tiles', start: 'top 88%' },
    });
    gsap.from('.note', { x: -16, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.note', start: 'top 92%' } });
    gsap.from('.note__mark', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: '.note', start: 'top 92%' } });
    fadeUp('.online .btn--wide', '.online .btn--wide');

    fadeUp('.concept-end > *', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
