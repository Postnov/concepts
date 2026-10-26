// Лера Хасанова — моушн концепта.
// Фирменная идея — «нить»: винная линия от руки сама прорисовывается и отмечает главное
// («ориентиры», «исцеление», «с любовью»); в цитате слова проявляются по мере прокрутки, как мысль, которая доходит.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const mobile = () => matchMedia('(max-width: 899px)').matches;

  /* ---------- вкладки запросов: работают и без GSAP ---------- */
  const tabsWrap = $('.tabs');
  const tabs = $$('.tabs__btn');
  const panels = $$('.panel');
  $('.topics').classList.add('js-tabs');

  function select(i, focus) {
    if (panels[i].classList.contains('is-active')) return;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    tabsWrap.dataset.active = String(i);
    if (focus) tabs[i].focus();
    if (animate && mobile()) {
      gsap.fromTo($$('li', panels[i]), { y: 14, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.04, ease: 'power3.out', overwrite: true,
      });
    }
    refresh();
  }
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      select((i + 1) % tabs.length, true);
    });
  });

  if (!animate) return;

  // Прорисовка линии: путь с pathLength=1, по умолчанию виден целиком (dashoffset 0)
  const draw = (path, vars) => gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'power2.inOut', ...vars });

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines', linesClass: 'ln' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { reduceWhiteSpace: false, type: 'lines', mask: 'lines', linesClass: 'ln' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines', linesClass: 'ln', ignore: 'svg' });
    const frame = $('.hero__frame');
    const leadThread = $('.hero__lead .thread path');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame,
        { clipPath: mobile() ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0% round 30px)' },
        { clipPath: mobile() ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 0% round 30px)', duration: 1.35, ease: 'expo.inOut' }, 0.1)
      .from('.hero__frame img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.7)
      .from(first.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out' }, 0.75)
      .from('.hero__last', { letterSpacing: '0.04em', autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.95)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 1 }, 1.05)
      .add(draw(leadThread, { duration: 1.1 }), 1.55)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.4);

    // Лёгкий параллакс портрета
    gsap.to('.hero__frame img', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- обо мне ---------- */
    gsap.from(['.about .eyebrow', '.about__text'], {
      y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.12,
      scrollTrigger: { trigger: '.about', start: 'top 82%' },
    });
    gsap.from('.fact', {
      y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 86%' },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: to > 10 ? 1.8 : 1.1, ease: 'power2.out', snap: { v: to > 10 ? 1000 : 1 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    /* ---------- цитата: слова проявляются, нить обводит «исцеление» ---------- */
    const words = SplitText.create('.quote__text', { type: 'words', ignore: 'svg' });
    const ring = $('.quote .thread path');
    gsap.set(ring, { strokeDashoffset: 1 });
    const lit = gsap.timeline({
      scrollTrigger: {
        trigger: '.quote__text', start: 'top 80%', end: 'bottom 52%', scrub: 0.6,
        // Дочитали до конца: цитата остаётся проявленной, а нить обводит «исцеление»
        onLeave: self => {
          const smooth = self.getTween && self.getTween();
          if (smooth) smooth.kill();
          self.kill(false);
          lit.progress(1);
          draw(ring, { duration: 1.3, delay: 0.1 });
        },
      },
    }).fromTo(words.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.12, duration: 0.5, ease: 'none' });

    /* ---------- 2. Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 84%' } });
    gsap.from('.tabs', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });
    panels.forEach(p => {
      gsap.from([$('.panel__title', p), ...$$('li', p)], {
        y: 22, autoAlpha: 0, duration: 0.75, stagger: 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: p, start: 'top 86%' },
      });
    });

    /* ---------- 3. Услуги ---------- */
    gsap.from('.services', {
      borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: 'none',
      scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'top 40%', scrub: true },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.services', start: 'top 70%' } })
      .fromTo('.services__frame',
        { clipPath: 'inset(0% 0% 100% 0% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.services__frame img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.15);
    revealLines('.services h2', '.services .sec-head');
    gsap.from(['.services .eyebrow', '.services__motto'], {
      y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.12,
      scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' },
    });
    draw('.services__motto .thread path', { duration: 1.1, delay: 0.5, scrollTrigger: { trigger: '.services__motto', start: 'top 84%' } });
    gsap.from('.offer', {
      y: 34, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.offers', start: 'top 86%' },
    });
    gsap.from('.services .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .btn', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
