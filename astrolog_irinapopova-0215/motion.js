// Ирина Попова — моушн концепта. Фирменная идея: «источник света» (её тренинг «Я — источник счастья»):
// золотые лучи за фото вспыхивают из центра, медленно вращаются и «дышат»; тем же светом раскрываются карточки практик.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- лучи и световая пыль: рисуются всегда, и без GSAP ---------- */
  const set = $('.rays__set');
  const dust = $('.rays__dust');
  // Детерминированный «шум», чтобы лучи были одинаковыми при каждой загрузке
  const rnd = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const RAYS = 64;
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 2 + rnd(i) * 0.05;
    const r0 = 92 + rnd(i + 7) * 40;
    const r1 = r0 + 60 + rnd(i + 3) * (i % 3 === 0 ? 170 : 90);
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', (Math.cos(a) * r0).toFixed(1));
    l.setAttribute('y1', (Math.sin(a) * r0).toFixed(1));
    l.setAttribute('x2', (Math.cos(a) * r1).toFixed(1));
    l.setAttribute('y2', (Math.sin(a) * r1).toFixed(1));
    l.setAttribute('stroke', i % 4 === 0 ? '#d8b06c' : '#e6c992');
    l.setAttribute('stroke-width', (i % 3 === 0 ? 1.6 : 0.9).toFixed(1));
    l.setAttribute('stroke-opacity', (0.35 + rnd(i + 11) * 0.5).toFixed(2));
    set.appendChild(l);
  }
  for (let i = 0; i < 26; i++) {
    const a = rnd(i + 40) * Math.PI * 2;
    const r = 110 + rnd(i + 60) * 170;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (Math.cos(a) * r).toFixed(1));
    c.setAttribute('cy', (Math.sin(a) * r).toFixed(1));
    c.setAttribute('r', (0.8 + rnd(i + 80) * 2.2).toFixed(1));
    c.setAttribute('fill', '#fff4dc');
    c.setAttribute('fill-opacity', (0.5 + rnd(i + 90) * 0.5).toFixed(2));
    dust.appendChild(c);
  }

  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- практики: вкладки работают и без GSAP ---------- */
  const tabs = $$('.pr__tab');
  const stage = $('.pr__stage');
  function select(tab) {
    if (tab.getAttribute('aria-selected') === 'true') return;
    const next = document.getElementById(tab.getAttribute('aria-controls'));
    const prev = $$('.pr__panel').find(p => !p.hidden);
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    stage.style.setProperty('--c', next.dataset.c);
    if (!animate) {
      prev.hidden = true; next.hidden = false;
      return refresh();
    }
    const h0 = stage.offsetHeight;
    gsap.killTweensOf([stage, ...$$('.pr__panel > *')]);
    prev.hidden = true; next.hidden = false;
    const h1 = stage.offsetHeight;
    gsap.fromTo(stage, { height: h0 }, { height: h1, duration: 0.55, ease: 'power3.inOut', onComplete: () => { stage.style.height = ''; refresh(); } });
    gsap.from(next.children, { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.05 });
    // На телефоне карточка под вкладками: если её не видно — плавно подводим
    const top = stage.getBoundingClientRect().top;
    if (top > innerHeight * 0.7) window.scrollTo({ top: scrollY + top - 90, behavior: 'smooth' });
  }
  tabs.forEach(t => t.addEventListener('click', () => select(t)));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function countUp(el, delay = 0) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 1.8, delay, ease: 'power2.out',
      onStart: () => { el.textContent = MotionBase.money(0); },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      onComplete: () => { el.textContent = MotionBase.money(to); },
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вспышка «источника» ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.2)
      .from(name.chars, { yPercent: 110, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.3)
      .from('.roles li', { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.6 }, 0.9)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.4, ease: 'expo.inOut' }, 0.45)
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.7)
      // Лучи выстреливают из центра, свет разгорается
      .from('.rays__glow', { scale: 0.2, autoAlpha: 0, svgOrigin: '0 0', duration: 1.8, ease: 'expo.out' }, 0.9)
      .from('.rays__set line', { scale: 0, svgOrigin: '0 0', autoAlpha: 0, duration: 1.6, stagger: { each: 0.012, from: 'random' }, ease: 'expo.out' }, 1.0)
      .from('.rays__dust circle', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.9, stagger: { each: 0.03, from: 'random' } }, 1.3)
      .from('.training', { y: 40, autoAlpha: 0, duration: 1 }, 1.25)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45)
      .from('.stats > div', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.6);

    // Источник живёт: медленное вращение лучей, «дыхание» света, мерцание пыли
    gsap.to('.rays__set', { rotation: 360, svgOrigin: '0 0', duration: 220, repeat: -1, ease: 'none' });
    gsap.to('.rays__glow', { scale: 1.1, svgOrigin: '0 0', duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.6 });
    $$('.rays__dust circle').forEach((c, i) => {
      gsap.to(c, { y: -10 - (i % 5) * 4, opacity: 0.25, duration: 3 + (i % 4), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.2 + (i % 7) * 0.3 });
    });
    // Параллакс: свет уходит медленнее фото
    gsap.to('.rays', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.arch img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Блик на главных кнопках
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.4 });
    });
    $$('.stats [data-count]').forEach((el, i) => countUp(el, 1.7 + i * 0.1));

    /* ---------- 2. Практики: карточка раскрывается светом из угла ---------- */
    revealLines('.practices h2', '.practices .sec-head');
    gsap.from(['.practices .eyebrow', '.practices .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.practices .sec-head', start: 'top 84%' },
    });
    gsap.from('.pr__tab', {
      y: 22, autoAlpha: 0, duration: 0.7, stagger: { each: 0.06, grid: 'auto', from: 'start' }, ease: 'power3.out',
      scrollTrigger: { trigger: '.pr__tabs', start: 'top 86%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.pr__stage', start: 'top 82%' } })
      .fromTo('.pr__stage', { clipPath: 'circle(0% at 0% 0%)' }, { clipPath: 'circle(150% at 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from('.pr__panel:not([hidden]) > *', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.55);

    /* ---------- 3. Тарифы ---------- */
    revealLines('.tariffs h2', '.tariffs .sec-head');
    gsap.from(['.tariffs .eyebrow', '.offer'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.tariffs .sec-head', start: 'top 84%' },
    });
    $$('.plan').forEach(plan => {
      gsap.timeline({ scrollTrigger: { trigger: plan, start: 'top 86%' } })
        .from(plan, { y: 60, rotateX: -10, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($$('.plan__list li, .chips li', plan), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.03 }, 0.3)
        // Старая цена перечёркивается
        .fromTo($('.old', plan), { '--strike': 0 }, { '--strike': 1, duration: 0.6, ease: 'power2.inOut' }, 0.6);
    });
    // цены не «набегают»: число стоит в разметке, строка цены проявляется целиком
    $$('.plan .new').forEach(el => gsap.from(el, {
      y: 14, autoAlpha: 0, duration: 0.8, delay: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
    }));
    gsap.from('.fee', { autoAlpha: 0, y: 10, duration: 0.8, scrollTrigger: { trigger: '.fee', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
