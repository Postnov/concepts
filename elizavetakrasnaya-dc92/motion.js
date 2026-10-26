// Елизавета Красная — моушн концепта. Фирменная идея «красная нить»: нить спускается из-под плашки к медальону с портретом
// (фото «проявляется» из старого снимка), затем тянется вдоль всей страницы и завязывается узелками у каждого раздела.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / при reduced motion — статичная полностью рабочая страница

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(el, trigger, extra = {}) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 85%' },
      onComplete: () => split.revert(),
      ...extra,
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: нить → медальон → «проявление» фото ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert(); lead.revert();
        gsap.set('.medal__photo', { clearProps: 'clipPath' });
        gsap.set('.medal__photo img', { clearProps: 'filter,transform' });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.cord', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.15)
      .fromTo('.ring', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut', stagger: 0.12 }, 0.85)
      .from('.medal__knot', { scale: 0, svgOrigin: '195 74', duration: 0.7, ease: 'back.out(2.4)' }, 1.25)
      .fromTo('.medal__photo', { clipPath: 'ellipse(0% 0% at 50% 50%)' }, { clipPath: 'ellipse(74% 74% at 50% 50%)', duration: 1.6, ease: 'expo.inOut' }, 1.0)
      .fromTo('.medal__photo img',
        { filter: 'grayscale(1) sepia(.85) contrast(1.15) brightness(.92)', scale: 1.28 },
        { filter: 'grayscale(0) sepia(0) contrast(1) brightness(1)', scale: 1, duration: 2.6, ease: 'power2.out' }, 1.05)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 1.35)
      .from('.hero__titles', { y: 12, autoAlpha: 0, duration: 0.8 }, 1.75)
      .from('.hero__tag', { y: 16, autoAlpha: 0, duration: 0.9 }, 1.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 2.05)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.35);

    /* ---------- девиз: слова проявляются одно за другим, как строка в метрической книге ---------- */
    const q = SplitText.create('.quote__text', { type: 'words', wordsClass: 'sw' });
    gsap.from(q.words, {
      opacity: 0.12, stagger: 0.16, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.quote', start: 'top 72%' },
    });

    /* ---------- красная нить вдоль цепочки секций: тянется за прокруткой и уже не втягивается обратно ---------- */
    const fill = gsap.fromTo('.rail__fill', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', paused: true });
    let laid = 0;
    ScrollTrigger.create({
      trigger: '.chain', start: 'top 70%', end: 'bottom 72%',
      onUpdate: self => {
        if (self.progress <= laid) return;
        laid = self.progress;
        gsap.to(fill, { progress: laid, duration: 0.5, ease: 'power1.out', overwrite: true });
      },
    });
    const knot = (el, trigger, start = 'top 72%') => gsap.from(el, {
      scale: 0, duration: 0.7, ease: 'back.out(2.2)',
      scrollTrigger: { trigger, start },
    });

    /* ---------- 2. Вы хотите ---------- */
    const h2 = SplitText.create('.reasons h2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from('.reasons .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reasons .sec-head', start: 'top 86%' } });
    gsap.from(h2.chars, {
      yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out',
      scrollTrigger: { trigger: '.reasons h2', start: 'top 86%' },
      onComplete: () => h2.revert(),
    });

    $$('.reason').forEach(row => {
      const title = $('.reason__title', row);
      const split = SplitText.create(title, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 82%' }, defaults: { ease: 'power3.out' } });
      tl.from($('.reason__rule', row), { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 0)
        .from($('.node', row), { scale: 0, duration: 0.7, ease: 'back.out(2.2)' }, 0.1)
        .from($('.reason__num', row), { yPercent: 40, autoAlpha: 0, duration: 0.9 }, 0.1)
        .from(split.lines, { yPercent: 108, stagger: 0.08, duration: 0.95, ease: 'expo.out', onComplete: () => split.revert() }, 0.18)
        .from($('.reason__text', row), { y: 16, autoAlpha: 0, duration: 0.85 }, 0.4);
    });

    /* ---------- 3. Исследование ---------- */
    knot('.research > .node', '.research', 'top 62%');
    gsap.from('.research .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.research h2', start: 'top 86%' } });
    revealLines('.research h2');
    revealLines('.research__lead', null, { delay: 0.15 });

    const depth = gsap.timeline({ scrollTrigger: { trigger: '.depth', start: 'top 82%' }, defaults: { ease: 'power3.out' } });
    depth
      .from('.depth__pre', { autoAlpha: 0, y: 8, duration: 0.6 }, 0)
      .from('.depth__line', { scaleX: 0, duration: 1.8, ease: 'power2.inOut' }, 0.1)
      .from('.depth__list li', { y: 36, autoAlpha: 0, stagger: 0.38, duration: 0.9 }, 0.35)
      .from('.depth__cap', { autoAlpha: 0, y: 8, duration: 0.7 }, 1.5);

    gsap.from('.research__scope', { y: 16, autoAlpha: 0, duration: 0.85, scrollTrigger: { trigger: '.research__scope', start: 'top 90%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.bookline', start: 'top 86%' } })
      .from('.book', { y: 44, rotateY: -48, transformPerspective: 700, transformOrigin: '0% 50%', autoAlpha: 0, duration: 1.3, ease: 'expo.out' })
      .from('.bookline__text', { x: 14, autoAlpha: 0, duration: 0.85, ease: 'power3.out' }, 0.25);

    gsap.from('.research__price', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.research__price', start: 'top 90%' } });
    $$('.svc li').forEach(li => {
      gsap.from(li, {
        borderTopColor: 'rgba(240,230,210,0)', y: 18, autoAlpha: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: li, start: 'top 92%' },
      });
    });
    gsap.from('.svc__note', { autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.svc__note', start: 'top 94%' } });

    gsap.from('.term__text', { y: 16, autoAlpha: 0, duration: 0.85, scrollTrigger: { trigger: '.term', start: 'top 88%' } });
    gsap.from('.term__bar i', {
      '--fill': 0, stagger: 0.28, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.term__bar', start: 'top 92%' },
    });
    gsap.from('.research .btn--gold', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.research .btn--gold', start: 'top 94%' } });

    /* ---------- плашка концепта ---------- */
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
