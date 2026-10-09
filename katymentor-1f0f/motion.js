// Екатерина Семенова — моушн концепта.
// Фирменная идея — «раскрытие»: рамки-лепестки вокруг фото раскрываются, как цветок
// (её чек-лист — про пробуждение чувствительности), и дальше тихо «дышат»; сценарии «все САМА»
// и «похожа на маму» зачёркиваются — из них она и выводит. Тот же лепесток раскрывается в контактах.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  const LEAF = 'round 50% 18px 50% 18px / 40% 18px 40% 18px';
  const leafClip = (top, r = LEAF) => `inset(${top}% 0% 0% 0% ${r})`;

  // Стрелки-«путь» (мотив её бренда): путь нормирован pathLength=1, по умолчанию нарисован целиком
  const arrows = $$('.arrow path, .gift__arrow path');
  arrows.forEach(p => p.setAttribute('pathLength', '1'));
  const draw = (targets, vars) => gsap.fromTo(targets, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', ...vars });

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы переносы жили при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero__photo .frame');
    const petals = $$('.hero__photo .petal');
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.2)
      .from(name.chars, { yPercent: 112, duration: 1.15, stagger: 0.032, ease: 'expo.out' }, 0.3)
      .fromTo(frame, { clipPath: leafClip(101) }, { clipPath: leafClip(0), duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.25)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.45)
      // лепестки раскрываются из-под фото
      .from(petals, { rotation: 0, autoAlpha: 0, duration: 1.9, stagger: 0.12, ease: 'expo.out' }, 1.0)
      .from('.ring', { scale: 0.4, rotation: -60, autoAlpha: 0, duration: 1.3, ease: 'expo.out', transformOrigin: '50% 50%' }, 1.05)
      .from('.script', { y: 30, autoAlpha: 0, duration: 0.9 }, 1.1)
      // сценарии зачёркиваются по очереди
      .from('.strike', { scaleX: 0, duration: 0.7, stagger: 0.38, ease: 'power2.inOut' }, 1.6)
      .from('.script__word', { color: ink, duration: 0.6, stagger: 0.38 }, 1.85)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.35)
      .add(draw('.gift__arrow path', { duration: 1 }), 1.7)
      .from('.hero__tags li', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 1.6);

    // Лепестки тихо «дышат», кольцо с подписью медленно вращается
    petals.forEach((p, i) => gsap.to(p, {
      rotation: `+=${[1.8, -1.6, 2.4][i]}`, duration: 5 + i * 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3,
    }));
    gsap.to('.ring__spin', { rotation: 360, svgOrigin: '60 60', duration: 48, ease: 'none', repeat: -1 });

    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне ---------- */
    fadeUp('.about .eyebrow', '.about__head');
    revealLines('.about .title', '.about__head');
    revealLines('.about__lead');

    const facts = $$('.facts li');
    gsap.set(facts, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(facts, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' });
        draw(els.map(li => $('.arrow path', li)), { stagger: 0.09, delay: 0.15 });
      },
    });

    gsap.from('.stats', {
      y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.stats', start: 'top 86%' },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.stats', start: 'top 80%', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      });
    });

    /* ---------- девиз: лотос из лепестков раскрывается, слова проявляются ---------- */
    gsap.from('.motto__lotus span', {
      rotation: 0, autoAlpha: 0, duration: 2.2, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.motto', start: 'top 72%' },
    });
    fadeUp('.motto .eyebrow', '.motto');
    const words = SplitText.create('.motto__quote p', { type: 'words' });
    gsap.from(words.words, {
      opacity: 0.12, duration: 0.9, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: '.motto__quote', start: 'top 78%' },
      onComplete: () => words.revert(),
    });

    /* ---------- 3. Услуги ---------- */
    fadeUp('.services .eyebrow', '.services .sec-head');
    revealLines('.services .title', '.services .sec-head');

    const cards = $$('.svc');
    gsap.set(cards, { y: 40, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: 'expo.out' });
        draw(els.map(c => $('.svc__head .arrow path', c)), { stagger: 0.12, delay: 0.25 });
      },
    });
    gsap.from('.svc--lila .svc__row', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.svc--lila', start: 'top 78%' },
    });

    /* ---------- контакты: тот же лепесток раскрывается ---------- */
    const faceFrame = $('.frame--face');
    const FACE = 'round 50% 12px 50% 12px';
    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 80%' } })
      .from('.contact', { y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .fromTo(faceFrame, { clipPath: leafClip(101, FACE) }, { clipPath: leafClip(0, FACE), duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      .from('.frame--face img', { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 0.3)
      .from('.contact__photo .petal', { rotation: 0, autoAlpha: 0, duration: 1.6, stagger: 0.12, ease: 'expo.out' }, 0.8)
      .from(['.contact__title', '.contact__sub', '.contact__btns'], { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.45);

    fadeUp('.concept-end > *', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
