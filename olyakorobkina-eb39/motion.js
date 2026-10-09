// Ольга Коробкина — моушн. Фирменная идея: «снимок ауры».
// В интро фото проявляется из ч/б за световым лучом (как аура-камера), вокруг арки расцветает
// переливающаяся аура; дальше у каждой темы запросов и услуги свой цвет ауры.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const hueOf = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- Табы запросов (работают и без анимации) ---------- */
  const tabs = $$('.tab');
  const panels = $$('.panel');
  const stage = $('.stage');
  const inner = $('.stage__inner');
  let current = 0;
  panels.forEach((p, i) => { p.hidden = i !== 0; });
  tabs.forEach((t, i) => { t.tabIndex = i === 0 ? 0 : -1; });
  stage.style.setProperty('--stage-hue', hueOf(panels[0].dataset.hue));

  function select(i, focus) {
    if (i === current) return;
    const next = panels[i];
    const color = hueOf(next.dataset.hue);
    tabs[current].setAttribute('aria-selected', 'false');
    tabs[current].tabIndex = -1;
    tabs[i].setAttribute('aria-selected', 'true');
    tabs[i].tabIndex = 0;
    if (focus) tabs[i].focus();
    current = i;

    if (!animate) {
      panels.forEach(p => { p.hidden = p !== next; });
      stage.style.setProperty('--stage-hue', color);
      return refresh();
    }
    const parts = [$('.panel__num', next), $('.panel__title', next), $('.panel__sub', next)].filter(Boolean);
    const items = $$('li', next);
    gsap.killTweensOf([inner, ...parts, ...items]);
    const h0 = inner.offsetHeight;
    inner.style.height = '';
    panels.forEach(p => { p.hidden = p !== next; });
    const h1 = inner.offsetHeight;
    gsap.fromTo(inner, { height: h0 }, {
      height: h1, duration: 0.6, ease: 'power3.inOut',
      onComplete: () => { inner.style.height = ''; refresh(); },
    });
    // аура карточки перетекает в цвет темы
    gsap.to(stage, { '--stage-hue': color, duration: 0.9, ease: 'power2.out' });
    gsap.fromTo('.stage__glow', { scale: 0.7, opacity: 0.2 }, { scale: 1, opacity: 0.42, duration: 1.3, ease: 'expo.out' });
    gsap.fromTo(parts, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    gsap.fromTo(items, { x: -14, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.04, delay: 0.1, ease: 'power2.out' });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      select((current + d + tabs.length) % tabs.length, true);
    });
  });

  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function countUp(el, snap) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 1.6, ease: 'power2.out', snap: { v: snap },
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      onStart: () => { el.textContent = MotionBase.money(0); },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
    });
  }

  // перелив градиента в слове «энергия» (после revert SplitText — по свежим узлам)
  function shimmer(selector) {
    gsap.fromTo(selector, { backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%', duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  MotionBase.ready(() => {
    /* ---------- Интро: снимок ауры ---------- */
    const name = SplitText.create('.hero__name > span', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const halo = $$('.halo__line');
    const blobs = $$('.aura__blob');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => name.revert(),
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 112, stagger: 0.035, duration: 1.1, ease: 'expo.out' }, 0.3)
      .from('.frame', { y: 30, scale: 0.94, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.25)
      .from('.frame img', { scale: 1.25, duration: 2.2, ease: 'expo.out' }, 0.25)
      // ч/б слой уезжает вниз за лучом — фото «проявляется» в цвете
      .fromTo('.frame__scan', { top: '0%', autoAlpha: 1 }, { top: '100%', duration: 1.9, ease: 'power2.inOut' }, 0.55)
      .to('.frame__scan', { autoAlpha: 0, duration: 0.3 }, '>-0.1')
      .fromTo(halo, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, stagger: 0.25, ease: 'power2.inOut' }, 0.6)
      .from(blobs, { scale: 0.3, autoAlpha: 0, duration: 2.2, stagger: 0.14, ease: 'expo.out' }, 0.7)
      .from('.frame__tint', { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 1.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95, onComplete: () => { lead.revert(); shimmer('.hero .aura-text'); } }, 0.9)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15);

    /* ---------- Живая аура: пятна дрейфуют, ореол в кадре медленно вращается ---------- */
    blobs.forEach((b, i) => {
      gsap.to(b, {
        xPercent: [14, -12, 10, -14][i], yPercent: [-10, 12, -14, 10][i], scale: [1.12, 0.9, 1.1, 0.92][i],
        duration: 6 + i * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4,
      });
    });
    gsap.to('.frame__tint', { rotation: 360, duration: 36, ease: 'none', repeat: -1 });
    shimmer('.motto .aura-text');

    // при прокрутке аура разрастается, фото чуть уходит вверх
    gsap.to('.aura', { scale: 1.18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.frame img', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- Обо мне ---------- */
    gsap.from(['.about__label', '.stats', '.skills__title', '.chips-static li', '.skills__note'], {
      y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '.about', start: 'top 86%' },
    });
    $$('.stat [data-count]').forEach(el => countUp(el, 1));

    /* ---------- Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 84%' } });
    gsap.from('.tab', {
      y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: '.tabs', start: 'top 88%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.stage', start: 'top 86%' } })
      .from('.stage', { y: 46, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.stage__glow', { scale: 0.4, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.1)
      .from($$('.panel:not([hidden]) li'), { x: -14, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, 0.3);

    /* ---------- Слоган: слова «загораются» по очереди ---------- */
    const motto = SplitText.create('.motto__title', { type: 'words', wordsClass: 'sw' });
    gsap.timeline({ scrollTrigger: { trigger: '.motto', start: 'top 72%' }, onComplete: () => motto.revert() })
      .from(motto.words, { color: '#d9cdee', y: 22, duration: 1, stagger: 0.14, ease: 'power3.out' })
      .from('.motto__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.45)
      .from('.motto__aura', { scaleX: 0.4, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0);
    gsap.fromTo('.motto__aura', { xPercent: 12 }, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.motto', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------- Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    $$('.card').forEach(card => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 56, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.card__orb', card), { scale: 0.3, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
        .from($$('.card__list li', card), { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.3);
    });
    gsap.to('.card__orb', { scale: 1.18, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.8 });
    gsap.to('.card__ring', { rotation: 360, duration: 7, ease: 'none', repeat: -1 });
    $$('.card [data-count]').forEach(el => countUp(el, 100));

    gsap.from('.concept-end > :not(.concept-end__aura)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
