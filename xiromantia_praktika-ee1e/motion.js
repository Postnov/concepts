// Иван Громов — моушн концепта. Фирменный ход: лупа хироманта подплывает к его ладони,
// под стеклом рука увеличена и линии на ней прорисовываются светом; дальше по странице такие же «линии» прочерчиваются при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP или при reduced motion: лупа стоит над ладонью, линии прорисованы — всё статично

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(target, trigger, vars = {}) {
    const split = SplitText.create(target, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || target, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const photo = $('.hero__photo');
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    // Положение лупы — доли кадра; CSS по ним сам ставит линзу и сдвигает увеличенный снимок внутри
    const palm = { x: 0.285, y: 0.61 };
    const pos = { x: 0.12, y: 0.95 };
    const setPos = () => {
      photo.style.setProperty('--lx', pos.x.toFixed(4));
      photo.style.setProperty('--ly', pos.y.toFixed(4));
    };
    setPos();
    gsap.set('.ln', { strokeDasharray: 1, strokeDashoffset: 1 });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 112, stagger: 0.045, duration: 1.15, ease: 'expo.out' }, 0.25)
      .fromTo('.frame',
        { clipPath: 'inset(14% 10% 14% 10% round 26px)', autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', autoAlpha: 1, duration: 1.3, ease: 'expo.inOut' }, 0.3)
      .from('.frame__img', { scale: 1.22, duration: 1.8, ease: 'expo.out' }, 0.3)
      // лупа появляется у края кадра и плывёт к ладони
      .fromTo('.loupe', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, 0.95)
      .to(pos, { x: palm.x, y: palm.y, duration: 1.5, ease: 'power3.inOut', onUpdate: setPos }, 0.95)
      // линии ладони прорисовываются светом
      .to('.ln', { strokeDashoffset: 0, duration: 1.05, stagger: 0.1, ease: 'power2.inOut' }, 2.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 1 }, 0.85)
      .from('.vows span', { y: 16, autoAlpha: 0, stagger: 0.14, duration: 0.8 }, 1.15)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 1.35)
      .add(drift);

    // Лупа «дышит» над ладонью: чуть смещается и возвращается
    function drift() {
      gsap.to(pos, { x: palm.x + 0.02, y: palm.y - 0.014, duration: 4.2, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: setPos });
      gsap.to('.ln', { opacity: 0.6, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 });
    }
    // Гравировка по ободу лупы медленно вращается
    gsap.to('.loupe__ring', { rotation: 360, duration: 70, ease: 'none', repeat: -1 });

    // Лёгкий параллакс фото вместе с лупой
    gsap.to(photo, {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Факты: тонкие разделители и цифры по очереди
    gsap.from('.facts li', {
      y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 90%' },
    });

    /* ---------- 2. Анализ рук ---------- */
    revealLines('.analysis h2', '.analysis .sec-head');
    gsap.from(['.analysis .eyebrow', '.analysis .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.analysis .sec-head', start: 'top 84%' },
    });
    // Вопросы: под каждым прочерчивается своя «линия ладони», текст поднимается следом
    const qs = $$('.q');
    gsap.set($$('.q__crease'), { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set($$('.q p, .q__n'), { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(qs, {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((el, i) => {
        gsap.to($('.q__crease', el), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, delay: i * 0.12, ease: 'power2.inOut' });
        gsap.to([$('.q__n', el), $('p', el)], { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.06, delay: 0.1 + i * 0.12, ease: 'power3.out' });
      }),
    });
    // Тарифы: карточки поднимаются, фото открывается шторкой, цена появляется целиком
    gsap.from('.plan', {
      y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.plans', start: 'top 86%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.plan--video', start: 'top 80%' } })
      .fromTo('.plan__photo', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.plan__photo img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.25);
    gsap.from('.spheres li', {
      y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.spheres', start: 'top 90%' },
    });
    $$('.plan__price').forEach(el => gsap.from(el, {
      y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    }));
    gsap.from('.plans__note', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.plans__note', start: 'top 94%' } });

    /* ---------- 3. Как проходит ---------- */
    revealLines('.process h2', '.process .sec-head');
    // Большие линии ладони на фоне прочерчиваются, когда секция въезжает в кадр
    gsap.set('.process__lines path', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to('.process__lines path', {
      strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: 0.25,
      scrollTrigger: { trigger: '.process', start: 'top 70%' },
    });
    gsap.from('.process .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.process .sec-head', start: 'top 84%' } });
    // Линия между шагами прочерчивается при прокрутке (на телефоне вниз, на широком экране вправо)
    gsap.matchMedia().add({ wide: '(min-width: 720px)', narrow: '(max-width: 719.98px)' }, ctx => {
      const axis = ctx.conditions.wide ? 'scaleX' : 'scaleY';
      gsap.fromTo('.steps__line span', { [axis]: 0 }, {
        [axis]: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 78%', end: ctx.conditions.wide ? 'top 40%' : 'bottom 62%', scrub: true },
      });
    });
    $$('.step').forEach(step => {
      gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 86%' } })
        .from($('.step__n', step), { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' })
        .from([$('.step__title', step), $('p', step)], { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.15);
    });
    // Слова после консультации: каждая фраза выходит строками из-под маски
    gsap.from('.voices figcaption', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.voices', start: 'top 86%' } });
    $$('.voice p').forEach((p, i) => revealLines(p, p, { duration: 1.2, delay: i * 0.12 }));
    gsap.from('.process__cta > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.process__cta', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
