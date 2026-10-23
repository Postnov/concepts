// МИИН — моушн концепта. Фирменная идея: цветок МИИН раскрывается по лепесткам — «научно и по шагам»:
// в hero лепестки распускаются по одному вокруг логотипа, у каждой секции — свой маленький бутон, который раскрывается при входе.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- бутоны у заголовков: шесть лепестков (нужны и без анимации) ---------- */
  const PETAL = 'M20 19.6C16.8 16 14 9.6 16 5.2c1.4-3 6.6-3 8 0 2 4.4-1 10.8-4 14.4z';
  $$('.bud').forEach(bud => {
    const petals = [0, 60, 120, 180, 240, 300]
      .map(a => `<g transform="rotate(${a} 20 20)"><path class="bud__petal" d="${PETAL}"/></g>`).join('');
    bud.innerHTML = `<svg viewBox="0 0 40 40">${petals}<circle class="bud__core" cx="20" cy="20" r="3.6"/></svg>`;
  });

  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Бутон раскрывается по лепесткам
  function bloomBud(bud, trigger) {
    const tl = gsap.timeline({ scrollTrigger: trigger ? { trigger, start: 'top 86%' } : undefined });
    tl.from($$('.bud__petal', bud), { scale: 0, svgOrigin: '20 20', duration: 0.6, stagger: 0.09, ease: 'back.out(2)' })
      .from($('svg', bud), { rotation: -120, transformOrigin: '50% 50%', duration: 1.4, ease: 'expo.out' }, 0)
      .from($('.bud__core', bud), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, 0.1);
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const title = SplitText.create('.hero__title', { type: 'lines', mask: 'lines' });
    const num = $('.chip__num');
    const total = 38000;
    const counter = { v: 0 };

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.stage', { clipPath: 'inset(100% 0% 0% 0% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', duration: 1.2, ease: 'expo.inOut' }, 0.05)
      .from('.stage__leaf', { scale: 0.5, rotation: -18, transformOrigin: '0% 100%', autoAlpha: 0, duration: 1.8, stagger: 0.18, ease: 'expo.out' }, 0.4)
      // лепестки по одному — «по шагам»
      .from('.daisy .petal', { scale: 0, svgOrigin: '200 200', duration: 0.95, stagger: 0.13, ease: 'back.out(1.5)' }, 0.55)
      .from('.daisy', { rotation: -100, duration: 2.4, ease: 'expo.out' }, 0.55)
      .from('.bloom__logo', { scale: 0.3, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.7)' }, 1.15)
      .from('.chip', { y: 14, autoAlpha: 0, stagger: 0.14, duration: 0.7 }, 1.35)
      // выпускники — не цена, считаем от нуля
      .to(counter, {
        v: total, duration: 1.8, ease: 'power2.out',
        onStart: () => { num.textContent = '0+'; },
        onUpdate: () => { num.textContent = `${MotionBase.money(Math.round(counter.v / 100) * 100)}+`; },
        onComplete: () => { num.innerHTML = '38&nbsp;000+'; },
      }, 1.45)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45)
      .from(title.lines, { yPercent: 100, stagger: 0.1, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from('.grant', { y: 34, autoAlpha: 0, duration: 0.95 }, 1.1)
      .from('.grant__icon', { y: -24, rotation: -18, scale: 0.6, autoAlpha: 0, duration: 1, ease: 'back.out(1.8)' }, 1.4);

    // Цветок медленно дышит-вращается; при прокрутке логотип с цветком уходят вверх чуть медленнее страницы
    gsap.to('.daisy', { rotation: '+=360', duration: 140, ease: 'none', repeat: -1, delay: 3 });
    gsap.to('.bloom', {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.hero .btn, .mini .btn').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* ---------- 2. Профессии ---------- */
    bloomBud($('.programs .bud'), '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 86%' } });
    revealLines('.programs h2', '.programs .sec-head');

    gsap.timeline({ scrollTrigger: { trigger: '.course--feature', start: 'top 82%' } })
      .fromTo('.course--feature', { clipPath: 'inset(0% 0% 100% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.course--feature .course__icon', { y: -40, rotation: -25, scale: 0.5, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.55)
      .from('.course--feature > :not(.course__icon)', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.5);

    gsap.fromTo('.course__daisy', { rotation: -40 }, {
      rotation: 50, ease: 'none',
      scrollTrigger: { trigger: '.course--feature', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // Карточки профессий раскладываются, как листы программы
    $$('.course--apricot, .course--petal').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 70, rotation: i % 2 ? 4 : -4, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.course__num', card), { yPercent: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.2);
    });

    /* ---------- 3. Бесплатно ---------- */
    bloomBud($('.free .bud'), '.free .sec-head');
    gsap.from('.free .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.free .sec-head', start: 'top 86%' } });
    revealLines('.free h2', '.free .sec-head');

    gsap.timeline({ scrollTrigger: { trigger: '.mini', start: 'top 84%' } })
      .from('.mini', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from('.mini__img', { scale: 0.4, rotation: -30, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.3)
      .from(['.mini__label', '.mini__title'], { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.25);
    // Темы курса — по шагам: лист-номер распускается, текст подтягивается
    const topics = $$('.topic');
    gsap.set($$('.topic__num'), { scale: 0, rotation: -90 });
    gsap.set($$('.topic__text'), { x: -14, autoAlpha: 0 });
    ScrollTrigger.batch(topics, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els.map(el => $('.topic__num', el)), { scale: 1, rotation: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.8)' });
        gsap.to(els.map(el => $('.topic__text', el)), { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, delay: 0.1, ease: 'power3.out' });
      },
    });
    gsap.to('.mini__img', { y: -8, rotation: 4, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });

    gsap.timeline({ scrollTrigger: { trigger: '.guides', start: 'top 86%' } })
      .from('.guides', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from('.guides__count', { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.2)
      .from('.guides__img', { y: 30, rotation: 20, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)' }, 0.3);

    /* ---------- финал ---------- */
    bloomBud($('.bud--end'), '.concept-end');
    gsap.from('.concept-end > :not(.bud)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
