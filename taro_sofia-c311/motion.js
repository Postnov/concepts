// Sofya — моушн концепта. Фирменная идея — «чёрная луна»: в первом экране луна наползает на золотое солнце
// за её короной, на вершине вспыхивает «бриллиантовое кольцо», вокруг остаётся медленная корона лучей.
// В тарифах та же луна сходит с солнца: чем выше тариф, тем больше света (серп → почти полная → полная).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };
  // Псевдослучайность с зерном: лучи одинаковые при каждой загрузке
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- корона затмения: лучи (декор, рисуется и без GSAP) ---------- */
  const rays = $('.eclipse__rays');
  if (rays) {
    const N = 96;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.04;
      const r0 = 374 + rnd() * 14;
      const r1 = r0 + 50 + Math.pow(rnd(), 1.8) * (i % 4 === 0 ? 260 : 150);
      svgEl('line', {
        x1: (547 + Math.cos(a) * r0).toFixed(1), y1: (290 + Math.sin(a) * r0).toFixed(1),
        x2: (547 + Math.cos(a) * r1).toFixed(1), y2: (290 + Math.sin(a) * r1).toFixed(1),
        'stroke-opacity': (0.16 + rnd() * 0.42).toFixed(2), 'stroke-width': (0.5 + rnd() * 0.7).toFixed(2),
      }, rays);
    }
  }

  /* ---------- схема обучения: куб Метатрона из 13 центров ---------- */
  const cube = $('.cube__svg');
  if (cube) {
    const pts = [[200, 200]];
    for (const k of [1, 2]) for (let i = 0; i < 6; i++) {
      const a = (-90 + 60 * i) * Math.PI / 180;
      pts.push([200 + Math.cos(a) * 70 * k, 200 + Math.sin(a) * 70 * k]);
    }
    const circles = $('.cube__circles', cube), lines = $('.cube__lines', cube), dots = $('.cube__dots', cube);
    pts.forEach(([x, y]) => svgEl('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: 35 }, circles));
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      svgEl('line', { x1: pts[i][0].toFixed(2), y1: pts[i][1].toFixed(2), x2: pts[j][0].toFixed(2), y2: pts[j][1].toFixed(2), pathLength: 1 }, lines);
    }
    pts.forEach(([x, y], i) => i && svgEl('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: 2.4 }, dots));
  }

  /* ---------- тарифы: переключатель (работает и без GSAP) ---------- */
  const plans = $('.plans');
  const tabs = $$('[data-plan-tab]');
  const shade = $('.moon__shade');
  const SHADE = [58, 12, -34]; // cx тени луны для «Мастер», «Магистр», «VIP»
  let current = 0;
  let touched = false;
  function setPlan(i, instant) {
    if (i === current && !instant) return;
    const prev = current;
    current = i;
    plans.dataset.plan = String(i);
    tabs.forEach(t => {
      const on = +t.dataset.planTab === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    const show = [$(`[data-panel="${i}"]`), $(`[data-pay="${i}"]`)];
    const hide = prev === i ? [] : [$(`[data-panel="${prev}"]`), $(`[data-pay="${prev}"]`)];
    if (!animate || instant) {
      shade.setAttribute('cx', SHADE[i]);
      hide.forEach(p => { p.hidden = true; });
      show.forEach(p => { p.hidden = false; });
      return refresh();
    }
    gsap.to(shade, { attr: { cx: SHADE[i] }, duration: 1.2, ease: 'power3.inOut', overwrite: true });
    const all = $$('[data-panel], [data-pay]');
    gsap.killTweensOf(all);
    all.forEach(p => { if (!show.includes(p) && !hide.includes(p)) { p.hidden = true; gsap.set(p, { clearProps: 'opacity,visibility,transform' }); } });
    gsap.to(hide, {
      autoAlpha: 0, y: -10, duration: 0.28, ease: 'power2.in',
      onComplete: () => hide.forEach(p => { p.hidden = true; gsap.set(p, { clearProps: 'opacity,visibility,transform' }); }),
    });
    show.forEach(p => { p.hidden = false; });
    gsap.fromTo(show, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.65, delay: 0.2, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
    refresh();
  }
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => { touched = true; setPlan(+t.dataset.planTab); });
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(k + d + tabs.length) % tabs.length];
      n.focus(); n.click();
    });
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const st = (trigger, start = 'top 82%') => ({ trigger, start });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: затмение ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__img', { autoAlpha: 0, scale: 1.08, transformOrigin: '50% 30%', duration: 2.4, ease: 'expo.out' }, 0.05)
      .from('.eclipse__sun', { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, 0.1)
      // луна поднимается снизу и закрывает солнце; последний луч — на вершине короны
      .from('.eclipse__moon', { attr: { cy: 575 }, duration: 2, ease: 'power2.inOut' }, 0.2)
      .fromTo('.eclipse__glint', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' }, { scale: 1.3, autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 1.9)
      .to('.eclipse__glint', { scale: 0.55, duration: 1.4, ease: 'power2.inOut' }, 2.35)
      .from('.eclipse__corona', { autoAlpha: 0, duration: 1.5, ease: 'power2.out' }, 1.95)
      .from('.eclipse__glow', { attr: { r: 520 }, duration: 2.2, ease: 'expo.out' }, 1.95)
      .fromTo('.eclipse__ring', { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 1.95)
      .from('.brand > *', { y: 10, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 0.3)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.55)
      .from(title.chars, { yPercent: 112, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from('.hero__sub', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.hero__open', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.hero__links', { autoAlpha: 0, duration: 0.8 }, 1.55);

    // Корона живёт: лучи медленно вращаются, свечение дышит, искра на вершине мерцает
    gsap.to('.eclipse__rays', { rotation: 360, svgOrigin: '547 290', duration: 260, repeat: -1, ease: 'none' });
    gsap.to('.eclipse__glow', { opacity: 0.72, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3.4 });
    gsap.to('.eclipse__glint', { scale: 0.75, rotation: 45, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3.8 });
    // Лёгкий параллакс портрета вместе с короной
    gsap.to('.hero__visual', { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Редкий блик на главных кнопках
    gsap.utils.toArray('.hero .btn--gold, .path .btn--gold').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.6, delay: 2.8 + i * 0.8 });
    });

    /* ---------- 2. Схема: куб чертит себя, по треугольнику идёт свет 1 → 2 → 3 ---------- */
    revealLines('.path h2', '.path .sec-head');
    gsap.from(['.path .eyebrow', '.path .sec-sub'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.2, scrollTrigger: st('.path .sec-head') });
    const nodes = $$('.cube__node');
    const labels = $$('.cube__label');
    const draw = { strokeDasharray: '1 1', strokeDashoffset: 1 };
    const cubeTl = gsap.timeline({ scrollTrigger: st('.cube', 'top 78%') })
      .fromTo('.cube__outer', draw, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, 0)
      .from('.cube__circles circle', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.1, stagger: { each: 0.05, from: 'start' }, ease: 'expo.out' }, 0.15)
      .fromTo('.cube__lines line', draw, { strokeDashoffset: 0, duration: 1, stagger: { each: 0.01, from: 'random' }, ease: 'power2.out' }, 0.45)
      .from('.cube__dots circle', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.04, ease: 'expo.out' }, 1.1)
      .from('.cube__core', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.4, ease: 'expo.out' }, 1.3)
      .fromTo('.cube__route', draw, { strokeDashoffset: 0, duration: 2.1, ease: 'none' }, 1.7);
    nodes.forEach((n, i) => {
      cubeTl.from(n, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'expo.out' }, 1.6 + i * 0.7)
        .from(labels[i], { y: 10, autoAlpha: 0, duration: 0.7 }, 1.7 + i * 0.7);
    });
    // Сердцевина тихо пульсирует, когда схема собрана
    cubeTl.to('.cube__core', { scale: 1.35, autoAlpha: 0.6, transformOrigin: '50% 50%', duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 3.2);

    $$('.step').forEach(step => {
      gsap.timeline({ scrollTrigger: st(step, 'top 86%') })
        .from($('.step__num', step), { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0)
        .from([$('.step__title', step), $('.step__text', step)], { x: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out' }, 0.08);
    });
    gsap.from('.path__note', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: st('.path__note', 'top 90%') });
    gsap.timeline({ scrollTrigger: st('.forever', 'top 88%') })
      .from('.forever', { scale: 0.94, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from('.forever__plus', { rotation: -90, scale: 0.4, duration: 1, ease: 'expo.out' }, 0.1);
    gsap.from('.path__side > .btn', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: st('.path__side > .btn', 'top 94%') });

    /* ---------- 3. Тарифы: луна выходит из тени ---------- */
    const tWord = SplitText.create('.tariffs .h2-main', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: st('.tariffs .sec-head'), onComplete: () => tWord.revert() })
      .from('.tariffs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8 }, 0)
      .from(tWord.chars, { yPercent: 112, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.05)
      .from('.tariffs h2 small', { y: 10, autoAlpha: 0, duration: 0.8 }, 0.4);

    gsap.timeline({ scrollTrigger: st('.plans', 'top 84%') })
      .from('.plans', { y: 48, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
      .from('.tab', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.25)
      .from('.moon', { scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.2, ease: 'expo.out' }, 0.35)
      .fromTo('.moon__ring', draw, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.45)
      .fromTo(shade, { attr: { cx: 100 } }, { attr: { cx: () => SHADE[current] }, duration: 1.6, ease: 'power2.inOut', immediateRender: false }, 0.55)
      .from('.plans__panels', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.6)
      .from('.plans__pay', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.8);
    const feats = $$('.feat');
    gsap.set(feats, { x: -14, autoAlpha: 0 });
    ScrollTrigger.batch(feats, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out' }),
    });
    // Один раз показываем, что тарифы переключаются: луна «растёт» до «Магистра»
    ScrollTrigger.create({
      trigger: '.plans', start: 'top 45%', once: true,
      onEnter: () => gsap.delayedCall(1.6, () => { if (!touched) setPlan(1); }),
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: st('.concept-end', 'top 88%') });

    window.addEventListener('load', refresh, { once: true });
  });
})();
