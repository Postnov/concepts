// Стася Кульбацкая — моушн концепта. Фирменная идея: журнальная обложка в примерочной —
// шторка распахивается, логотип YES DRESS NO STRESS проезжает за её головой, при прокрутке слои обложки расходятся.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Строки из-под маски; после анимации нарезку снимаем
  function revealLines(target, trigger, vars = {}) {
    const split = SplitText.create(target, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || target, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Обложка: интро ---------- */
    const mast = SplitText.create('.cover__mast', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const name = SplitText.create('.cover__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const layers = ['.cover__photo', '.cover__figure'];

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { mast.revert(); name.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // Шторка: из закрытого положения разъезжается к краям, складки собираются
      .from('.curtain__panel', { scaleX: 1, duration: 1.55, ease: 'expo.inOut' }, 0.1)
      // Фото и вырезанная фигура — одинаково, чтобы слои совпадали пиксель в пиксель
      .from(layers, { scale: 1.12, transformOrigin: '50% 30%', duration: 2.3, ease: 'expo.out' }, 0.35)
      // Буквы логотипа поднимаются и проходят за её головой
      .from(mast.chars, { yPercent: 112, duration: 1.15, stagger: 0.035, ease: 'expo.out' }, 0.95)
      .from('.cover__meta > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.05)
      .from(name.chars, { yPercent: 112, duration: 1.05, stagger: 0.028, ease: 'expo.out' }, 1.2)
      .from('.cl', { x: -18, autoAlpha: 0, stagger: 0.1, duration: 0.85 }, 1.35)
      .from('.sticker', { scale: 0.5, rotation: -50, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 1.55);

    // Слои обложки расходятся: логотип отстаёт от фигуры и уходит за неё, имя — навстречу
    gsap.to('.cover__mast', {
      y: () => window.innerHeight * 0.11, ease: 'none',
      scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
    gsap.to('.sticker', {
      y: () => -window.innerHeight * 0.08, ease: 'none',
      scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });

    // Цитата и кнопки под обложкой (на десктопе они в кадре обложки — тогда сразу)
    const desk = matchMedia('(min-width: 900px)').matches;
    const quote = SplitText.create('.cover__quote', { type: 'lines', mask: 'lines' });
    gsap.from(quote.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      delay: desk ? 1.45 : 0,
      scrollTrigger: desk ? null : { trigger: '.cover__intro', start: 'top 88%' },
      onComplete: () => quote.revert(),
    });
    gsap.from('.cover__btns .btn', {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      delay: desk ? 1.75 : 0.25,
      scrollTrigger: desk ? null : { trigger: '.cover__btns', start: 'top 92%' },
    });

    /* Узкий блик по главным кнопкам, как свет по атласу */
    gsap.utils.toArray('.cover .btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-130%' }, { '--shine': '130%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* ---------- 2. Содержание: линейки прочерчиваются, номера встают на место ---------- */
    revealLines('.issue h2', '.issue .sec-head');
    gsap.from('.issue .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.issue .sec-head', start: 'top 84%' } });
    $$('.toc__row').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } });
      tl.from(row.querySelector('.toc__rule'), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0)
        .from(row.querySelector('.toc__num'), { y: 26, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.25)
        .from(row.querySelector('.toc__kicker'), { x: -10, autoAlpha: 0, duration: 0.7 }, 0.35)
        .from(row.querySelector('.toc__title'), { y: 20, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.4)
        .from(row.querySelector('.toc__go'), { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)' }, 0.55);
    });

    /* ---------- 3. Сотрудничество: бирки качнулись на нитке и замерли ---------- */
    revealLines('.collab h2', '.collab__head');
    gsap.from('.collab .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.collab__head', start: 'top 84%' } });
    gsap.fromTo('.collab__avatar',
      { clipPath: 'inset(100% 0% 0% 0% round 999px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.collab__head', start: 'top 84%' } });
    gsap.from('.collab__avatar img', { scale: 1.3, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.collab__head', start: 'top 84%' } });
    $$('.tag').forEach((tag, i) => {
      const card = tag.querySelector('.tag__card');
      const dir = i % 2 ? 1 : -1;
      gsap.timeline({ scrollTrigger: { trigger: tag, start: 'top 88%' } })
        .from(card, { y: -36, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, 0)
        // затухающее качание вокруг дырочки бирки
        .fromTo(card, { rotation: 9 * dir, transformOrigin: '50% 16px' },
          { keyframes: [{ rotation: -4.5 * dir, duration: 0.55 }, { rotation: 2 * dir, duration: 0.5 }, { rotation: -0.8 * dir, duration: 0.45 }, { rotation: 0, duration: 0.4 }], ease: 'sine.inOut' }, 0);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
