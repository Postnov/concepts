// Дмитрий Лубнин — моушн концепта. Фирменная идея «плюс» (его проект «Позитивная гинекология», «23+», «15+»):
// волосяное перекрестье прочерчивает экран, фото раскрывается из точки пересечения, по углам встают метки приводки;
// дальше тот же «плюс» прорисовывается у каждого принципа, а ключевые фразы выделяются, как маркером в книге.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  // reduced motion / нет GSAP: статичная страница, выделения уже прочерчены (CSS без .js-motion)
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // «Плюс» раскрывает фото: линии расходятся из центра, затем кадр открывается из точки пересечения
  function crossOpen(root, vars = {}) {
    const cross = $('.cross', root);
    const frame = $('.frame', root);
    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' }, ...vars });
    let at = 0;
    if (cross) {
      tl.fromTo($('.cross__x', cross), { scaleX: 0 }, { scaleX: 1, duration: 1.25 }, 0)
        .fromTo($('.cross__y', cross), { scaleY: 0 }, { scaleY: 1, duration: 1.25 }, 0.06);
      at = 0.55;
    }
    tl.fromTo(frame, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, clearProps: 'clipPath' }, at)
      .from($('img', frame), { scale: 1.3, duration: 2, ease: 'expo.out' }, at + 0.1);
    const regs = $$('.reg', root);
    if (regs.length) tl.from(regs, { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, at + 0.75);
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .add(crossOpen($('.hero__photo')), 0.1)
      // после раскрытия перекрестье остаётся едва заметной сеткой
      .to('.hero .cross > span', { opacity: 0.4, duration: 1.4, ease: 'power2.out' }, 2.1)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.3)
      .from(name.chars, { yPercent: 112, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 0.9)
      .from('.stat', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.15)
      .from('.stat__num .plus', { rotate: -90, scale: 0.3, duration: 1, ease: 'expo.out' }, 1.3)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.35)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.45);

    /* Метки приводки раз в несколько секунд делают четверть оборота — «плюс» живёт, форма не меняется */
    gsap.to('.hero__photo .reg', { rotate: '+=90', duration: 1.3, ease: 'expo.inOut', stagger: 0.12, repeat: -1, repeatDelay: 5, delay: 3.4 });

    /* Блик на главных кнопках */
    $$('.hero__cta .btn--light, .visit__cta .btn:not(.btn--line)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Принципы ---------- */
    revealLines('.principles h2', '.principles .sec-head');
    gsap.from(['.principles .eyebrow', '.principles .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.principles .sec-head', start: 'top 84%' },
    });
    // Фото открывается от вертикальной черты «плюса» в стороны
    gsap.timeline({ scrollTrigger: { trigger: '.principles__photo', start: 'top 82%' } })
      .fromTo('.principles__photo .frame', { clipPath: 'inset(0% 50% 0% 50%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.principles__photo img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.1)
      .from('.principles__photo .reg', { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0.8);

    $$('.pitem').forEach(item => {
      const [h, v] = $$('.pitem__mark i', item);
      gsap.timeline({
        scrollTrigger: { trigger: item, start: 'top 86%' },
        defaults: { ease: 'expo.out' },
      })
        .from(h, { scaleX: 0, duration: 0.8 }, 0)
        .from(v, { scaleY: 0, duration: 0.8 }, 0.12)
        .from($('.pitem__mark', item), { rotate: -90, duration: 1.1 }, 0)
        .from($('.pitem__num', item), { autoAlpha: 0, x: -8, duration: 0.7, ease: 'power3.out' }, 0.2)
        .from($('.pitem__text', item), { y: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.15)
        .call(() => $$('strong', item).forEach(s => s.classList.add('is-on')), null, 0.65);
    });

    /* ---------- 3. Очный приём ---------- */
    revealLines('.visit h2', '.visit .sec-head');
    gsap.from(['.visit .eyebrow', '.visit .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.visit .sec-head', start: 'top 84%' },
    });
    // Здание «вырастает» снизу, кабинет раскрывается тем же перекрестьем, что и портрет
    gsap.timeline({ scrollTrigger: { trigger: '.visit__photos', start: 'top 80%' } })
      .fromTo('.frame--clinic', { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.frame--clinic img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.1)
      .from('.visit__clinic .reg', { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0.9)
      .add(crossOpen($('.visit__cab')), 0.5)
      .to('.visit__cab .cross > span', { autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 2.2);

    gsap.from('.addr', { x: -14, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.addr', start: 'top 90%' } });

    const taskTitle = SplitText.create('.task__title', { type: 'lines', mask: 'lines' });
    gsap.timeline({
      scrollTrigger: { trigger: '.task', start: 'top 84%' },
      defaults: { ease: 'expo.out' },
      onComplete: () => taskTitle.revert(),
    })
      .from('.task', { y: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out' }, 0)
      .from(taskTitle.lines, { yPercent: 105, stagger: 0.1, duration: 1.1 }, 0.25)
      .from('.task__rule', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.5)
      .from('.task__text', { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.75);

    gsap.from('.visit__cta .btn', {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.visit__cta', start: 'top 92%' },
    });

    /* ---------- финал ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 85%' }, defaults: { ease: 'expo.out' } })
      .from('.concept-end__plus i:nth-of-type(1)', { scaleX: 0, duration: 0.9 }, 0)
      .from('.concept-end__plus i:nth-of-type(2)', { scaleY: 0, duration: 0.9 }, 0.1)
      .from('.concept-end__plus', { rotate: -90, duration: 1.2 }, 0)
      .from('.concept-end > :not(.concept-end__plus)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.3);

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
