// Джесси · КОРНИ — моушн концепта.
// Фирменная идея: линия-корень. Корни-нервы прорастают за портретом, схема КПТ рисуется линиями и «гоняет» цикл
// ситуация → мысли / поведение / тело / эмоции, список «может помочь» прорастает вдоль корня отростками.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    if (!$(selector)) return;
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Линии рисуются через pathLength=1 — длина не зависит от масштаба svg
  function prepDraw(els) {
    els.forEach(el => { el.setAttribute('pathLength', '1'); el.style.strokeDasharray = '1'; el.style.strokeDashoffset = '1'; });
    return els;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.brand__mark', { yPercent: 60, autoAlpha: 0, duration: 0.8 }, 0.1)
      .from('.brand__sub', { y: 10, autoAlpha: 0, duration: 0.7 }, 0.2)
      // корни прорастают сверху вниз
      .fromTo('.roots', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power2.inOut' }, 0.2)
      .fromTo(frame, { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.35, ease: 'expo.inOut' }, 0.3)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.45)
      .from(name.chars, { yPercent: 118, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.95)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.facts li', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45);

    // Корни медленно «дышат» — едва заметное покачивание
    gsap.to('.roots path', { x: (i) => (i % 2 ? 4 : -4), duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6 });

    // Блик на главных кнопках
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--line-light)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    // Параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Может помочь, если ---------- */
    revealLines('.helps h2', '.helps .sec-head');
    gsap.from('.helps .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.helps .sec-head', start: 'top 84%' } });

    // Схема КПТ: овал, затем стрелки по очереди, подписи проявляются
    const oval = prepDraw([$('.scheme__oval')]);
    const arrows = $$('.scheme__arrow');
    arrows.forEach(g => prepDraw($$('path', g)));
    const nodes = $$('.scheme__node');
    const scheme = gsap.timeline({ scrollTrigger: { trigger: '.scheme', start: 'top 78%' } });
    scheme
      .from('.scheme', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
      .to(oval, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .from('.scheme__core', { autoAlpha: 0, y: 8, duration: 0.7 }, 0.7);
    arrows.forEach((g, i) => {
      scheme
        .to($$('path', g), { strokeDashoffset: 0, duration: 0.55, stagger: 0.35, ease: 'power2.out' }, 1.0 + i * 0.32)
        .from(nodes[i], { autoAlpha: 0, y: 6, duration: 0.6 }, 1.25 + i * 0.32);
    });
    // Цикл: подсвечиваем по очереди «мысли → поведение → тело → эмоции»
    let k = 0;
    scheme.call(() => {
      gsap.timeline({ repeat: -1 }).call(() => {
        nodes.forEach((n, i) => n.classList.toggle('is-on', i === k % nodes.length));
        gsap.fromTo($$('path', arrows[k % arrows.length]), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' });
        k++;
      }).to({}, { duration: 1.6 });
    });

    // Корень прорастает вниз при появлении списка, у каждого пункта появляется отросток
    gsap.fromTo('.root-list__rail', { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'power1.inOut', duration: 2.6,
      scrollTrigger: { trigger: '.helps__list', start: 'top 75%', once: true },
    });
    $$('.helps__list li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 80%' } })
        .fromTo(li, { '--sprout': 0 }, { '--sprout': 1, duration: 0.6, ease: 'power2.out' })
        .from(li, { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.1);
    });

    /* ---------- 3. Онлайн беседа ---------- */
    revealLines('.book h2', '.book .sec-head');
    gsap.from('.book .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.book .sec-head', start: 'top 84%' } });
    gsap.from('.price', {
      y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.book__grid', start: 'top 84%' },
    });
    gsap.from('.steps li', {
      x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.steps', start: 'top 88%' },
    });
    gsap.from('.steps__n', {
      scale: 0.4, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.steps', start: 'top 88%' },
    });
    gsap.from('.book__legal', { autoAlpha: 0, y: 10, duration: 0.8, scrollTrigger: { trigger: '.book__legal', start: 'top 94%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
