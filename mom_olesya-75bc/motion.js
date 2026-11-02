// Олеся — моушн концепта «Отметь день». Галочки рисуются сами: календарь месяца и маркеры списков; печать на hero вращается.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, start = 'top 84%') {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.0, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const sub = SplitText.create('.hero__sub', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const card = $('.hero__card');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); sub.revert(); gsap.set(card, { clearProps: 'clipPath' }); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(card, { clipPath: 'inset(0% 0% 100% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.2, ease: 'expo.inOut' }, 0.05)
      .from('.hero__photo img', { yPercent: 7, scale: 1.14, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.45)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45)
      .from(title.chars, { yPercent: 118, stagger: 0.035, duration: 1.0, ease: 'expo.out' }, 0.5)
      .from(sub.lines, { yPercent: 105, stagger: 0.09, duration: 0.9 }, 0.95)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15)
      .from('.badge', { scale: 0.2, rotation: -140, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 1.0);

    // Печать медленно вращается; прокрутка добавляет ей оборотов
    const spin = gsap.to('.badge__ring', { rotation: 360, duration: 36, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: self => { spin.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 400, 7)); },
    });
    ScrollTrigger.addEventListener('scrollEnd', () => gsap.to(spin, { timeScale: 1, duration: 1 }));

    // Блик на главных кнопках
    $$('.hero .btn:not(.btn--ghost), .btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    // Лёгкий параллакс фото
    gsap.to('.hero__photo img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- вводное слово ---------- */
    revealLines('.intro__quote', '.intro', 'top 80%');
    fadeUp('.intro__lead', '.intro__lead', { delay: 0.2 });

    /* ---------- 2. История ---------- */
    revealLines('.story h2', '.story .sec-head');
    fadeUp('.story .eyebrow', '.story .sec-head');
    const ba = gsap.timeline({ scrollTrigger: { trigger: '.ba', start: 'top 78%' } });
    ba.from('.ba__card--before', { x: -40, rotation: -3, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.ba__card--after', { y: 70, rotation: 3, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.18)
      .from('.ba__card figcaption', { y: -8, autoAlpha: 0, duration: 0.6, stagger: 0.2 }, 0.8)
      .from('.ba__stamp', { scale: 0.6, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 0.9);
    // −33: число набирается один раз, не цена
    const num = $('.ba__stamp b');
    const counter = { v: 0 };
    gsap.to(counter, {
      v: 33, duration: 1.5, ease: 'power2.out', delay: 0.9,
      scrollTrigger: { trigger: '.ba', start: 'top 78%', once: true },
      onStart: () => { num.textContent = '−0'; },
      onUpdate: () => { num.textContent = '−' + Math.round(counter.v); },
      onComplete: () => { num.textContent = '−33'; },
    });
    // Фото «после» чуть отъезжает при прокрутке
    gsap.to('.ba__card--after', { y: 26, ease: 'none', scrollTrigger: { trigger: '.ba', start: 'top bottom', end: 'bottom top', scrub: true } });

    fadeUp('.story__lead', '.story__lead');
    $$('.story__text > p:not(.story__lead), .story__text > .mini').forEach(el => fadeUp(el, el));
    $$('.steps li').forEach(li => gsap.from(li, { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 90%' } }));
    $$('.steps__n').forEach(n => gsap.from(n, { yPercent: 80, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 92%' } }));

    // Маркеры-галочки: каждая «отмечается» по очереди
    $$('.ticks').forEach(list => {
      const items = $$('li', list);
      gsap.from(items, {
        x: -16, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: list, start: 'top 88%' },
      });
      gsap.from($$('.tick', list), {
        scale: 0, rotation: -90, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.12, delay: 0.1, ease: 'back.out(2.4)',
        scrollTrigger: { trigger: list, start: 'top 88%' },
      });
    });

    /* ---------- 3. Абонемент ---------- */
    revealLines('.club h2', '.club .sec-head');
    fadeUp('.club .eyebrow', '.club .sec-head');
    // Календарь месяца: ячейки появляются, отмеченные дни заливаются и ставят галочку
    gsap.timeline({ scrollTrigger: { trigger: '.cal', start: 'top 76%' } })
      .from('.cal__head b', { yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' })
      .from('.cal__cell', { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.016 }, 0.2)
      .from('.cal__tick circle', { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.12, ease: 'back.out(2.2)' }, 0.7)
      .from('.cal__tick path', { strokeDashoffset: 1, duration: 0.35, stagger: 0.12, ease: 'power2.out' }, 0.8);
    gsap.from('.mins', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.mins', start: 'top 90%' } });
    revealLines('.club__note', '.club__note', 'top 88%');

    /* ---------- 4. Тарифы ---------- */
    revealLines('.plans h2', '.plans .sec-head');
    fadeUp(['.plans .eyebrow', '.plans .sec-sub'], '.plans .sec-head', { stagger: 0.12 });
    $$('.plan').forEach(plan => {
      gsap.timeline({ scrollTrigger: { trigger: plan, start: 'top 90%' } })
        .fromTo(plan, { clipPath: 'inset(0% 100% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.0, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($('.plan__stub', plan), { scale: 0.85, autoAlpha: 0, duration: 0.7, ease: 'expo.out' }, 0.35)
        .from([$('.plan__title', plan), $('.plan__text', plan)], { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.45)
        .from($('.plan__price', plan), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.6);
    });
    $$('.plan__flag .tick').forEach(t => gsap.from(t, { scale: 0, rotation: -90, duration: 0.6, ease: 'back.out(2.4)', scrollTrigger: { trigger: t, start: 'top 92%' } }));
    fadeUp('.plans__notes > *', '.plans__notes', { stagger: 0.12 });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
