// Анастасия Грачева — моушн концепта.
// Фирменная идея — «нить пути» (её линия из блока контактов и слова «Давай пройдём этот путь вместе»):
// тонкая нить прорисовывается под именем, а в «Я могу помочь, если…» тянется по прокрутке через римские «бусины»,
// и каждая бусина загорается, когда нить до неё дошла.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- нить через бусины: путь строится по реальным позициям (и без GSAP) ---------- */
  const beads = $('[data-beads]');
  function buildBeadThread() {
    if (!beads) return;
    const svg = $('.thread--beads', beads);
    const path = $('path', svg);
    const box = beads.getBoundingClientRect();
    const pts = $$('.bead__num', beads).map(n => {
      const b = n.getBoundingClientRect();
      return { x: b.left - box.left + b.width / 2, y: b.top - box.top + b.height / 2 };
    });
    if (!pts.length) return;
    const w = Math.round(box.width), h = Math.round(box.height);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const x = pts[0].x;
    const amp = Math.min(26, w * 0.07);
    let d = `M ${x - amp} ${pts[0].y - 70} C ${x - amp} ${pts[0].y - 40}, ${x} ${pts[0].y - 30}, ${x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const y0 = pts[i - 1].y, y1 = pts[i].y, dy = y1 - y0, s = i % 2 ? 1 : -1;
      d += ` C ${x + amp * s} ${y0 + dy * 0.34}, ${x - amp * s} ${y1 - dy * 0.34}, ${x} ${y1}`;
    }
    const last = pts[pts.length - 1];
    d += ` C ${x} ${last.y + 50}, ${x + amp * 1.6} ${h - 10}, ${x + amp * 3} ${h + 30}`;
    path.setAttribute('d', d);
    path.setAttribute('pathLength', '1');
  }
  buildBeadThread();

  if (!animate) {
    window.addEventListener('resize', buildBeadThread);
    window.addEventListener('load', buildBeadThread, { once: true });
    return;
  }

  // Прорисовка нити: длина нормирована (pathLength=1), поэтому не зависит от размеров
  // штрих «1 2»: при offset 1 на пути нет ни одного края штриха, иначе круглый кончик даёт точку в конце
  const drawFrom = el => gsap.set(el, { strokeDasharray: '1 2', strokeDashoffset: 1 });

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
    buildBeadThread(); // шрифты загрузились — позиции бусин окончательные

    /* ---------- 1. Hero ---------- */
    const lines = $$('.hero__line').map(el => SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const heroThread = $('.thread--hero path');
    drawFrom(heroThread);

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { lines.forEach(s => s.revert()); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__img img', { scale: 1.16, duration: 2.4, ease: 'expo.out' }, 0)
      .from('.hero__media', { autoAlpha: 0, duration: 1.1, ease: 'power2.out' }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.35)
      .from(lines[0].chars, { yPercent: 110, duration: 1.1, stagger: 0.04, ease: 'expo.out' }, 0.45)
      .from(lines[1].chars, { yPercent: 110, duration: 1.1, stagger: 0.04, ease: 'expo.out' }, 0.62)
      .to(heroThread, { strokeDashoffset: 0, duration: 2.1, ease: 'power2.inOut' }, 0.95)
      .from('.hero__card', { y: 46, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.9)
      .from(lead.lines, { yPercent: 105, duration: 1, stagger: 0.08, ease: 'expo.out' }, 1.05)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.3);

    // Медленный параллакс фото: картинка с запасом снизу уезжает вверх
    gsap.to('.hero__img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- цифры ---------- */
    gsap.from('.fact__num', {
      yPercent: 50, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.facts', start: 'top 86%' },
    });
    gsap.from('.fact__text', {
      y: 14, autoAlpha: 0, duration: 0.9, stagger: 0.12, delay: 0.15,
      scrollTrigger: { trigger: '.facts', start: 'top 86%' },
    });

    /* ---------- 2. Запросы: нить через бусины ---------- */
    revealLines('.help h2', '.help .sec-head');
    gsap.from('.help .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help .sec-head', start: 'top 84%' } });

    const beadPath = $('.thread--beads path');
    drawFrom(beadPath);
    // Нить тянется вслед за прокруткой и назад не сматывается: пройденный путь остаётся
    let drawn = 0;
    ScrollTrigger.create({
      trigger: '.beads', start: 'top 74%', end: 'bottom 70%',
      onUpdate: self => {
        if (self.progress <= drawn) return;
        drawn = self.progress;
        gsap.to(beadPath, { strokeDashoffset: 1 - drawn, duration: 0.6, ease: 'power2.out', overwrite: true });
      },
    });
    // При ресайзе пересобираем путь до пересчёта позиций ScrollTrigger
    ScrollTrigger.addEventListener('refreshInit', buildBeadThread);

    $$('.bead').forEach(bead => {
      ScrollTrigger.create({
        trigger: $('.bead__num', bead), start: 'center 72%',
        once: true,
        onEnter: () => bead.classList.add('is-lit'),
      });
      gsap.timeline({ scrollTrigger: { trigger: bead, start: 'top 86%' } })
        .from($('.bead__num', bead), { scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' })
        .from($('.bead__title', bead), { x: 18, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.08)
        .from($$('.bead__points li', bead), { x: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 0.2);
    });
    gsap.from('.help__note', {
      y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.help__note', start: 'top 90%' },
    });

    /* ---------- 3. Услуги: карточки раскрываются снизу, как занавес ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    const desktop = matchMedia('(min-width: 900px)').matches;
    $$('.offer').forEach((card, i) => {
      const tl = gsap.timeline({
        delay: desktop ? i * 0.14 : 0,
        scrollTrigger: { trigger: desktop ? '.offers' : card, start: 'top 84%' },
      });
      tl.fromTo(card,
        { clipPath: 'inset(100% 0% 0% 0% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.25, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($('.offer__photo img', card), { scale: 1.4, duration: 1.6, ease: 'expo.out' }, 0.35)
        .from([$('.offer__no', card), $('.offer__title', card)], { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.5)
        .from($$('.offer__lead, .offer__sub, .arrows li, .tags li', card), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.05 }, 0.65)
        .from($$('.price', card), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.85)
        .from($$('.offer__cta .btn', card), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1);
    });

    /* ---------- финал ---------- */
    const endThread = $('.thread--end path');
    drawFrom(endThread);
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 82%' } })
      .to(endThread, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .from('.concept-end > :not(svg)', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.4);

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
