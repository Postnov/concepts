// ЕДАша — моушн концепта. Фирменная идея: «меню на каждый день» — доска сама листает дни недели, буквы дня щёлкают как табло, блюда переписываются.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- доска «Основное меню»: работает и без GSAP ---------- */
  const board = $('[data-board]');
  const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';
  let cur = 0;
  let auto = null;
  let touched = false;
  let showDay = () => {};
  if (board) {
    const tabs = $$('.tab', board);
    const panels = $$('.dishes', board);
    const dayEl = $('[data-day]', board);
    const names = tabs.map(t => t.getAttribute('aria-label'));
    const renderDay = (name, animated) => {
      dayEl.textContent = '';
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = name;
      const flaps = document.createElement('span');
      flaps.className = 'flaps';
      flaps.setAttribute('aria-hidden', 'true');
      [...name.toUpperCase()].forEach(ch => {
        const f = document.createElement('span');
        f.className = 'flap';
        const s = document.createElement('span');
        s.textContent = ch;
        f.append(s);
        flaps.append(f);
      });
      dayEl.append(sr, flaps);
      if (!animated) return;
      $$('.flap', dayEl).forEach((f, k) => {
        const span = f.firstElementChild;
        const final = span.textContent;
        const tl = gsap.timeline({ delay: k * 0.04, defaults: { duration: 0.15, ease: 'none' } });
        [ABC[Math.floor(Math.random() * ABC.length)], ABC[Math.floor(Math.random() * ABC.length)], final].forEach(ch => {
          tl.call(() => { span.textContent = ch; }).fromTo(f, { rotationX: 90, transformPerspective: 500 }, { rotationX: 0 });
        });
      });
    };
    // Высота доски — по самому длинному дню, чтобы страница не подпрыгивала при смене
    const measure = () => {
      let max = 0;
      panels.forEach(p => {
        const was = p.hidden;
        p.hidden = false;
        max = Math.max(max, p.offsetHeight);
        p.hidden = was;
      });
      board.style.setProperty('--dishes-h', max + 'px');
    };
    showDay = (i, instant) => {
      if (i === cur && !instant) return;
      const prev = cur;
      cur = i;
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach((p, k) => { p.hidden = k !== i; });
      if (!animate || instant) {
        renderDay(names[i], false);
        return;
      }
      gsap.killTweensOf($$('li', panels[prev]).concat($$('li', panels[i])));
      renderDay(names[i], true);
      gsap.fromTo($$('li', panels[i]), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.035, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
    };
    tabs.forEach((t, k) => {
      t.tabIndex = k === 0 ? 0 : -1;
      t.addEventListener('click', () => showDay(k));
      t.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const n = (k + d + 7) % 7;
        tabs[n].focus();
        showDay(n);
      });
    });
    ['pointerdown', 'keydown', 'focusin'].forEach(ev => board.addEventListener(ev, () => { touched = true; if (auto) { auto.kill(); auto = null; } }));
    renderDay(names[0], false);
    const fit = () => { measure(); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit, { once: true });
  }

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const lines = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        lines.revert();
        $$('.bk').forEach((b, i) => gsap.to(b, { y: -9, duration: 3.2 + i * 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.4 }));
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(lines.chars, { yPercent: 112, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.3)
      .fromTo('.hero__logo', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.75)
      .from('.cloth', { scale: 0.7, rotation: 8, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.4)
      .from('.bk', { yPercent: 70, rotation: i => [-16, 16, 0][i], autoAlpha: 0, stagger: 0.14, duration: 1.3, ease: 'expo.out' }, 0.7)
      .from('.sticker', { scale: 0, duration: 0.9, ease: 'expo.out' }, 1.55)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25)
      .from('.pills li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.45);

    // Скатерть чуть смещается при прокрутке
    gsap.to('.cloth', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__books', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.8 });
    });

    /* ---------- 2. Основное меню ---------- */
    revealLines('.menu h2', '.menu .sec-head');
    gsap.from(['.menu .eyebrow', '.menu .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.menu .sec-head', start: 'top 84%' } });
    gsap.from('.board', {
      clipPath: 'inset(0% 0% 100% 0% round 26px)', duration: 1.2, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.board', start: 'top 82%' },
    });
    // Табло и блюда понедельника появляются вместе с доской
    ScrollTrigger.create({
      trigger: '.board', start: 'top 78%', once: true,
      onEnter: () => {
        if (!board) return;
        showDay(cur, true);
        $$('.flap', board).forEach((f, k) => gsap.from(f, { rotationX: 90, transformPerspective: 500, duration: 0.4, delay: 0.5 + k * 0.045, ease: 'power2.out' }));
        gsap.from($$('li', $('.dishes:not([hidden])', board)), { autoAlpha: 0, x: -16, duration: 0.55, stagger: 0.04, delay: 0.7, ease: 'power2.out', clearProps: 'opacity,visibility,transform' });
      },
    });
    // Автолистание дней, пока доска на экране и её никто не трогал
    const startAuto = () => {
      if (touched || auto) return;
      auto = gsap.delayedCall(3.8, () => { auto = null; showDay((cur + 1) % 7); startAuto(); });
    };
    ScrollTrigger.create({
      trigger: '.board', start: 'top 70%', end: 'bottom 20%',
      onToggle: self => { if (self.isActive) startAuto(); else if (auto) { auto.kill(); auto = null; } },
    });
    gsap.from('.buy__cover', { yPercent: 18, rotation: -14, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.buy', start: 'top 88%' } });
    gsap.from('.buy__body > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.buy', start: 'top 86%' } });
    gsap.from('.buy .legal', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.buy', start: 'top 80%' } });

    /* ---------- 3. Все сборники: «выкладываем на прилавок» ---------- */
    revealLines('.shelf h2', '.shelf .sec-head');
    gsap.from(['.shelf .eyebrow', '.shelf .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.shelf .sec-head', start: 'top 84%' } });
    gsap.set('.cover-card', { autoAlpha: 0 });
    ScrollTrigger.batch('.cover-card', {
      start: 'top 92%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 70, rotation: i => (i % 2 ? 5 : -5), autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.05, stagger: 0.09, ease: 'expo.out' }),
    });

    if ($('.concept-end')) gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });


    window.addEventListener('load', refresh, { once: true });
  });
})();
