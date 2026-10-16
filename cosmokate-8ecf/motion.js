// Екатерина · Ритуал удачи — моушн концепта.
// Фирменная идея — «сборка поля»: сакральная геометрия вокруг портрета дорисовывается линия за линией
// (лепестки «семени жизни» раскрываются из центра), затем медленно вращается; ромбы ◇ клуба дорисовываются при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная, полностью рабочая страница

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  // Прорисовка линии: у фигур pathLength="1", поэтому длина штриха всегда 1
  const drawFrom = { strokeDasharray: 1, strokeDashoffset: 1 };
  const drawTo = vars => ({ strokeDashoffset: 0, clearProps: 'strokeDasharray,strokeDashoffset', ...vars });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: сборка поля ---------- */
    // charsClass нужен, чтобы маске (класс ch-mask) добавить запас под нижние выносные «у», «д»
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: startIdle,
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__rays', { scale: 0.4, autoAlpha: 0, duration: 2.4, ease: 'expo.out' }, 0.2)
      .fromTo('.hero__portrait', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.hero__portrait img', { scale: 1.4, duration: 2, ease: 'expo.out' }, 0.25)
      .fromTo('.geo__frame', drawFrom, drawTo({ duration: 1.2, ease: 'power2.inOut' }), 0.45)
      // лепестки выходят из-за портрета и раскрываются по кругу
      .fromTo('.geo__petal', drawFrom, drawTo({ duration: 1.6, stagger: 0.11, ease: 'power2.inOut' }), 0.6)
      .fromTo('.geo__ring', drawFrom, drawTo({ duration: 1.5, stagger: 0.15, ease: 'power2.inOut' }), 1.0)
      .fromTo('.geo__hex', drawFrom, drawTo({ duration: 1.3, ease: 'power2.inOut' }), 1.3)
      .from('.geo__dots circle', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.05, ease: 'power2.out' }, 1.9)
      .from('.geo__outer', { autoAlpha: 0, scale: 0.86, svgOrigin: '0 0', duration: 2.2, ease: 'expo.out' }, 1.5)
      .from('.geo__orbit', { autoAlpha: 0, rotation: -24, svgOrigin: '0 0', duration: 2, ease: 'expo.out' }, 1.7)
      .from('.hero__badge', { y: 12, autoAlpha: 0, duration: 0.8 }, 1.4)
      .from('.hero__eyebrow', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.5)
      .from(title.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out', onComplete: () => title.revert() }, 0.6)
      .from('.hero__plus', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95, onComplete: () => lead.revert() }, 1.15)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.35);

    // Медленное «дыхание» поля после сборки
    function startIdle() {
      gsap.to('.geo__core', { rotation: 360, svgOrigin: '0 0', duration: 220, repeat: -1, ease: 'none' });
      gsap.to('.geo__outer', { rotation: -360, svgOrigin: '0 0', duration: 320, repeat: -1, ease: 'none' });
      gsap.to('.geo__dots circle', {
        opacity: 0.25, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
        stagger: { each: 0.3, from: 'random' },
      });
      gsap.to('.hero__rays', { scale: 1.07, rotation: 8, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.fromTo('.btn--shine', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3 });

    /* Прокрутка: поле доворачивается, портрет чуть уходит вглубь */
    gsap.to('.geo__scroll', {
      rotation: 40, svgOrigin: '0 0', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__portrait img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 1½. Манифест: слова загораются по мере чтения ---------- */
    const words = SplitText.create('.manifest__text', { type: 'words', wordsClass: 'sw' });
    gsap.from('.manifest .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.manifest', start: 'top 80%' } });
    const lit = gsap.fromTo(words.words, { opacity: 0.2 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: {
        trigger: '.manifest__text', start: 'top 80%', end: 'bottom 52%', scrub: 0.6,
        // дочитали — текст остаётся светлым, split снимаем
        onLeave: self => { self.kill(); lit.progress(1).kill(); words.revert(); },
      },
    });

    gsap.fromTo('.manifest__seed', { rotation: -30 }, {
      rotation: 60, ease: 'none',
      scrollTrigger: { trigger: '.manifest', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Клуб ---------- */
    revealLines('.club h2', '.club .sec-head');
    gsap.from(['.club .sec-head .eyebrow', '.club .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.club .sec-head', start: 'top 84%' },
    });
    $$('.incl__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' } })
        .fromTo($('.rh path', item), drawFrom, drawTo({ duration: 0.9, ease: 'power2.inOut' }), 0)
        .from($('.rh b', item), { autoAlpha: 0, scale: 0.5, duration: 0.5, ease: 'power3.out' }, 0.4)
        .from($('p', item), { x: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.15);
    });
    gsap.fromTo('.incl__thread span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.incl', start: 'top 78%', end: 'bottom 72%', scrub: true },
    });
    gsap.from('.incl__note', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.incl__note', start: 'top 92%' } });

    gsap.from(['.fit .eyebrow', '.fit__lead', '.fit__list li'], {
      y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.fit', start: 'top 84%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 86%' } })
      .from('.price', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.price__seed', { rotation: -60, scale: 0.7, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.1)
      .from('.price > :not(.price__seed)', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.3);
    gsap.to('.price__seed', { rotation: 360, duration: 160, repeat: -1, ease: 'none' });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    /* ---------- 3. Заставки ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.wall', start: 'top 80%' } })
      .fromTo('.wall__img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.wall__img img', { scale: 1.5, duration: 2, ease: 'expo.out' }, 0.1)
      .from('.wall__rings', { rotation: -90, scale: 0.8, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.2);
    // «флюид» медленно дрейфует внутри круга
    gsap.to('.wall__img img', { xPercent: -5, yPercent: 4, rotation: 4, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
    gsap.to('.wall__rings', { rotation: 360, duration: 120, repeat: -1, ease: 'none', delay: 2 });
    revealLines('.wall__text h2', '.wall__text');
    gsap.from(['.wall__text .eyebrow', '.wall__sub', '.wall__text .btn', '.wall__hint'], {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.wall__text', start: 'top 84%' },
    });
    gsap.from('.author', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.author', start: 'top 88%' } });

    /* ---------- финал ---------- */
    gsap.from('.concept-end > :not(.concept-end__seed)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    gsap.to('.concept-end__seed', { rotation: 360, duration: 200, repeat: -1, ease: 'none' });

    window.addEventListener('load', refresh, { once: true });
  });
})();
