// Алёна Курьянова — моушн концепта. Фирменная идея: магнолия из её Taplink распускается вокруг портрета,
// медленно кружится и доворачивается при прокрутке; бутоны магнолии отмечают секции, в «меню» форматов дорисовываются отточия.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- вкладки «ребёнок / вы»: работают и без GSAP ---------- */
  const tabs = $('.tabs');
  const panelOf = btn => document.getElementById(btn.getAttribute('aria-controls'));
  $$('.tabs__btn').forEach(btn => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-selected') === 'true') return;
    $$('.tabs__btn').forEach(b => {
      const on = b === btn;
      b.setAttribute('aria-selected', String(on));
      panelOf(b).hidden = !on;
    });
    tabs.dataset.active = btn.id === 'tab-you' ? 'you' : 'kid';
    if (animate) {
      gsap.fromTo($$('li', panelOf(btn)), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.035, ease: 'power3.out', overwrite: true });
    }
    refresh();
  }));

  /* ---------- чек-лист: отметки и счётчик отмеченного ---------- */
  const count = $('[data-count]');
  const recount = () => { count.textContent = String($$('.check[aria-pressed="true"]').length); };
  let touched = false;
  $$('.check').forEach(btn => btn.addEventListener('click', () => {
    touched = true;
    btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    recount();
  }));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  // Бутон магнолии в подписи секции раскрывается из точки
  function budIn(scope) {
    gsap.from($$('.eyebrow .bud', $(scope)), {
      scale: 0, rotation: -40, transformOrigin: '50% 90%', duration: 0.9, ease: 'back.out(2)',
      scrollTrigger: { trigger: scope, start: 'top 82%' },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: магнолия распускается ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // внешние лепестки: вырастают из сердцевины и разворачиваются по спирали
      .from('.petal-g', { scale: 0.18, rotation: -70, svgOrigin: '0 0', autoAlpha: 0, duration: 1.9, stagger: { each: 0.07, from: 'start' }, ease: 'expo.out' }, 0.15)
      .from('.petal--inner', { scale: 0.1, rotation: 50, svgOrigin: '0 0', autoAlpha: 0, duration: 1.7, stagger: 0.06, ease: 'expo.out' }, 0.35)
      .fromTo('.vein', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.05, ease: 'power2.inOut' }, 1.1)
      .from('.hero__photo', { scale: 0.7, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.15)
      .fromTo('.hero__photo img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.3)
      .from('.hero__photo img', { scale: 1.45, duration: 2, ease: 'expo.out' }, 0.4)
      .from('.hero__badge', { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'back.out(2.2)' }, 1.3)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.55)
      .from(first.chars, { yPercent: 110, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from('.hero__last', { y: 24, autoAlpha: 0, duration: 0.9 }, 0.85)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.facts li', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    // Спокойное кружение: кольца навстречу друг другу
    gsap.to('.bloom__ring--outer', { rotation: 360, svgOrigin: '0 0', duration: 150, ease: 'none', repeat: -1 });
    gsap.to('.bloom__ring--inner', { rotation: -360, svgOrigin: '0 0', duration: 190, ease: 'none', repeat: -1 });
    // При прокрутке цветок доворачивается и чуть раскрывается
    gsap.to('.bloom__spin', {
      rotation: 60, scale: 1.06, svgOrigin: '0 0', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    /* ---------- 2. Чем могу помочь ---------- */
    budIn('.help .sec-head');
    revealLines('.help h2', '.help .sec-head');
    gsap.from(['.help .eyebrow', '.help .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.help .sec-head', start: 'top 82%' },
    });
    // Контур магнолии на фоне секции медленно поворачивается при прокрутке
    gsap.fromTo('.help__bloom', { rotation: -30 }, {
      rotation: 40, ease: 'none',
      scrollTrigger: { trigger: '.help', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from('.tabs', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tabs', start: 'top 90%' } });
    const items = $$('#panel-kid li');
    gsap.set(items, { y: 18, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }),
    });
    // Один пункт отмечается сам, чтобы было видно, что список живой
    ScrollTrigger.create({
      trigger: '#panel-kid', start: 'top 60%', once: true,
      onEnter: () => gsap.delayedCall(0.9, () => {
        const demo = $$('#panel-kid .check')[2];
        if (!touched && demo) { demo.setAttribute('aria-pressed', 'true'); recount(); }
      }),
    });
    gsap.from('.help__foot > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.help__foot', start: 'top 88%' },
    });

    /* ---------- 3. Форматы: меню ---------- */
    budIn('.formats .sec-head');
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from(['.formats .eyebrow', '.formats .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' },
    });
    gsap.fromTo('.menu',
      { clipPath: 'inset(0% 0% 100% 0% round 28px)', y: 40 },
      { clipPath: 'inset(0% 0% 0% 0% round 28px)', y: 0, duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.menu', start: 'top 85%' } });
    // В каждой позиции: название → отточие дорисовывается → цена появляется целиком (без счётчика)
    $$('.dish').forEach(dish => {
      gsap.timeline({ scrollTrigger: { trigger: dish, start: 'top 86%' }, defaults: { ease: 'power3.out' } })
        .from($('.dish__title', dish), { y: 16, autoAlpha: 0, duration: 0.7 })
        .from($$('.dish__dots, .dish__sub i', dish), { scaleX: 0, duration: 0.8, stagger: 0.1, ease: 'power2.inOut' }, 0.2)
        .from($$('.dish__price, .dish__sub b', dish), { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.6)
        .from($$('.dish__desc, .dish__sub span, .dish__meta span, .dish__link', dish), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.05 }, 0.35);
    });
    gsap.from('.menu__cta .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1, scrollTrigger: { trigger: '.menu__cta', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
