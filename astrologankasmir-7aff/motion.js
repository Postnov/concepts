// Анна Сапухова — моушн концепта. Фирменная идея: северо-индийская карта (кундали) чертит себя золотыми линиями,
// в центральном ромбе-доме открывается портрет, по ромбу карты медленно идёт «Луна».
// Дальше по странице всё раскрывается из ромба — как из центрального дома карты.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Ромб из центра: точка → ромб, накрывающий весь блок
  const DIA_0 = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)';
  const DIA_1 = 'polygon(50% -52%, 152% 50%, 50% 152%, -52% 50%)';
  const diamondIn = (els, vars = {}) => gsap.fromTo(els, { clipPath: DIA_0 }, {
    clipPath: DIA_1, duration: 1.25, ease: 'expo.inOut', ...vars,
    onComplete() { gsap.set(this.targets(), { clearProps: 'clipPath' }); },
  });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Шапка секции: ромбик-маркер поворачивается на место, подпись и заголовок поднимаются
  function head(sec) {
    const h = $('.sec-head', sec);
    const st = { trigger: h, start: 'top 84%' };
    gsap.from($('.dia', h), { rotate: -135, scale: 0, duration: 1, ease: 'expo.out', scrollTrigger: st });
    gsap.from($$('.eyebrow > :not(.dia)', h), { x: -10, autoAlpha: 0, duration: 0.7, stagger: 0.08, scrollTrigger: st });
    revealLines($('h2', h), h);
    const lead = $('.sec-lead', h);
    if (lead) gsap.from(lead, { y: 18, autoAlpha: 0, duration: 0.9, delay: 0.2, scrollTrigger: st });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: карта чертит себя ---------- */
    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); startSky(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.ln--frame', { strokeDashoffset: 1, duration: 1.5, ease: 'power2.inOut' }, 0.1)
      .from('.ln--rhomb', { strokeDashoffset: 1, duration: 1.3, ease: 'power2.inOut' }, 0.45)
      .from('.ln--diag', { strokeDashoffset: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, 0.9)
      .fromTo('.kundali__photo', { clipPath: DIA_0 }, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', duration: 1.4, ease: 'expo.inOut' }, 0.75)
      .from('.kundali__photo img', { scale: 1.45, duration: 2.2, ease: 'expo.out' }, 0.85)
      .from('.ln--inner', { strokeDashoffset: 1, duration: 1, stagger: 0.12, ease: 'power2.inOut' }, 1.5)
      .from('.kundali__glow', { autoAlpha: 0, scale: 0.6, duration: 2, ease: 'expo.out' }, 0.7)
      .from('.kundali__tick', { autoAlpha: 0, scale: 0.4, stagger: 0.1, duration: 0.6, ease: 'back.out(2)' }, 1.6)
      .from('.hero__hi', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.55)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.65)
      .from('.hero__role', { autoAlpha: 0, y: 10, duration: 0.7 }, 1.0)
      .from('.hero__role i', { rotate: -135, scale: 0, duration: 0.8, ease: 'expo.out' }, 1.05)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 1 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.35);

    /* «Луна» идёт по ромбу карты (полный круг — 28 секунд), свет за картой дышит */
    function startSky() {
      const path = $('#moon-path');
      const moon = $('.moon');
      const len = path.getTotalLength();
      const s = { p: 0.02 };
      const place = () => {
        const pt = path.getPointAtLength(s.p * len);
        moon.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
      };
      place();
      gsap.to(moon, { opacity: 1, duration: 1.2 });
      gsap.to(s, { p: 1.02, duration: 28, ease: 'none', repeat: -1, onUpdate: place });
      gsap.to('.moon__halo', { attr: { r: 4.4 }, opacity: 0.6, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.kundali__glow', { scale: 1.08, opacity: 0.7, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    /* Портрет чуть смещается при прокрутке */
    gsap.to('.kundali__photo img', {
      yPercent: 3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Годовой гороскоп ---------- */
    head($('.year'));
    // 12 ромбов-месяцев зажигаются по очереди по ходу прокрутки
    gsap.fromTo('.months i', { '--on': 0 }, {
      '--on': 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: '.months', start: 'top 88%', end: 'top 45%', scrub: 0.6 },
    });
    gsap.from('.months i', { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'back.out(2)', scrollTrigger: { trigger: '.months', start: 'top 90%' } });
    gsap.from('.year__label', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.year__label', start: 'top 90%' } });
    diamondIn('.plan', { stagger: 0.18, scrollTrigger: { trigger: '.plans', start: 'top 82%' } });
    $$('.plan').forEach(plan => {
      const st = { trigger: plan, start: 'top 75%' };
      gsap.from($$('.plan__name, .plan__inc, .plan__list li, .plan__vol', plan), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.07, delay: 0.35, scrollTrigger: st });
      const seal = $('.seal path', plan);
      if (seal) gsap.from(seal, { strokeDashoffset: 1, duration: 1.6, ease: 'power2.inOut', delay: 0.5, scrollTrigger: st });
    });
    // Цены появляются целиком, без счётчика
    $$('.price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } }));
    gsap.from('.plan__note', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.plan__note', start: 'top 94%' } });

    revealLines('.learn__title');
    gsap.from('.learn__intro', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.learn__intro', start: 'top 90%' } });
    const items = $$('.learn__list li');
    gsap.set(items, { x: -16, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }),
    });
    gsap.from(['.learn__foot', '.learn .btn'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.learn__foot', start: 'top 94%' } });

    /* ---------- 3. Консультации ---------- */
    head($('.consult'));
    const cards = $$('.svc');
    gsap.set(cards, { clipPath: DIA_0 });
    ScrollTrigger.batch(cards, {
      start: 'top 88%', once: true,
      onEnter: els => {
        diamondIn(els, { stagger: 0.14, immediateRender: false });
        gsap.from(els.flatMap(el => $$('.svc__num, .svc__name, .svc__text', el)), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.05, delay: 0.4 });
      },
    });

    /* ---------- финал ---------- */
    const endSt = { trigger: '.concept-end', start: 'top 86%' };
    gsap.from('.seal--end path', { strokeDashoffset: 1, duration: 1.8, ease: 'power2.inOut', scrollTrigger: endSt });
    gsap.from('.concept-end > :not(.seal)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, delay: 0.2, scrollTrigger: endSt });

    window.addEventListener('load', refresh, { once: true });
  });
})();
