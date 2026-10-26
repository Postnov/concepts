// Доктор Гребешкова — моушн концепта. Фирменная идея: «экран УЗИ». Сектор датчика раскрывается,
// луч проходит по нему и проявляет портрет из серого эха в цвет; дальше луч изредка «досканирует» экран.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  const H = 27; // половина угла сектора, как в CSS

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    $$(selector).forEach(el => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: экран УЗИ и имя ---------- */
    const screen = $('.scan__screen');
    const beam = $('.scan__beam');
    const st = { h: 0, s: 0 };
    const paint = () => {
      screen.style.setProperty('--h', `${st.h}deg`);
      screen.style.setProperty('--s', `${st.s}deg`);
      screen.style.setProperty('--b', `${st.s - st.h}deg`);
    };
    paint();

    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(screen, { scale: 0.94, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.05)
      .from('.scan__hud', { autoAlpha: 0, y: -6, stagger: 0.1, duration: 0.5 }, 0.35)
      // сектор датчика раскрывается веером
      .to(st, { h: H, duration: 1.1, ease: 'expo.inOut', onUpdate: paint }, 0.3)
      .from('.scan__ticks', { scaleY: 0, transformOrigin: '50% 0', duration: 1, ease: 'expo.inOut' }, 0.5)
      // луч проходит и проявляет цвет
      .set(beam, { opacity: 1 }, 1.0)
      .to(st, { s: H * 2, duration: 1.3, ease: 'power2.inOut', onUpdate: paint }, 1.0)
      .to(beam, { opacity: 0, duration: 0.35 }, 2.1)
      .from(name.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from('.hero__role', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.95)
      .from('.fact', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    // Повторный проход луча раз в несколько секунд (цвет уже проявлен — только свет)
    const sweep = { b: -H };
    gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 6 })
      .set(beam, { opacity: 0 })
      .set(sweep, { b: -H })
      .to(beam, { opacity: 0.55, duration: 0.3 })
      .to(sweep, { b: H, duration: 2.4, ease: 'sine.inOut', onUpdate: () => screen.style.setProperty('--b', `${sweep.b}deg`) }, '<')
      .to(beam, { opacity: 0, duration: 0.4 }, '-=0.4');

    // Лёгкий параллакс портрета внутри сектора
    gsap.to('.scan__portrait', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Счётчик «250−300»
    $$('.fact [data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const from = 250;
      const o = { v: from };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
        delay: el.closest('.hero') ? 1.3 : 0,
        scrollTrigger: el.closest('.hero') ? undefined : { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(from); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    /* ---------- 2. Гайды ---------- */
    revealLines('.guides h2', '.guides .sec-head');
    gsap.from(['.guides .eyebrow', '.guides .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.guides .sec-head', start: 'top 84%' },
    });
    // Карточки комплектов: выезжают, обложки в них раскрываются веером (как сектор датчика)
    $$('.bundle').forEach(card => {
      const imgs = $$('.bundle__fan img', card);
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.from(card, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from(imgs, {
          // CSS rotate/translate задают итоговый веер; transform на старте их компенсирует — обложки стопкой
          rotation: i => -parseFloat(getComputedStyle(imgs[i]).rotate) || 0,
          y: 30, duration: 1.1, ease: 'expo.out', stagger: 0.06,
        }, 0.2)
        .from($$('.bundle__tag, .bundle__title, .bundle__incl, .bundle__price, .bundle__note, .btn', card), {
          y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out',
        }, 0.3);
    });
    gsap.from('.shelf-title i', { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.shelf-title', start: 'top 88%' } });
    // Обложки проявляются сверху вниз, как строки на экране
    const covers = $$('.cover');
    gsap.set($$('.cover__img', document), { clipPath: 'inset(0% 0% 100% 0% round 14px)' });
    gsap.set($$('.cover__title, .cover__sub'), { autoAlpha: 0, y: 10 });
    ScrollTrigger.batch(covers, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els.map(e => $('.cover__img', e)), { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.1, stagger: 0.09, ease: 'expo.inOut' });
        gsap.to(els.flatMap(e => $$('.cover__title, .cover__sub', e)), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, delay: 0.35, ease: 'power3.out' });
      },
    });

    /* ---------- 3. Книга ---------- */
    revealLines('.book h2', '.book__text');
    gsap.from('.book__cover img', {
      rotateY: -38, x: -30, autoAlpha: 0, duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: '.book__grid', start: 'top 78%' },
    });
    gsap.from(['.book .eyebrow', '.book .sec-sub', '.book__label'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.book__text', start: 'top 82%' },
    });
    gsap.from('.store', {
      x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.stores', start: 'top 90%' },
    });

    if ($('.concept-end')) {
      gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });
    }

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
