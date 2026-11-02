// Юлия Савельева — моушн демо (тот же код, что в full/; в демо две строки дипломов и финальная плашка). Фирменная идея — «проявка»: фото входят в кадр как отпечаток
// в проявителе, из плоского мутного серого (как сейчас на Taplink) в контрастную ч/б печать.
// Проявка — по времени при входе в кадр (не по скроллу): в записи рилса «стало» резкое почти сразу.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Состояния «проявки»: одинаковый набор функций, чтобы GSAP интерполировал числа.
  // SHARP совпадает со статичным filter у .print img (styles.css) — после clearProps картинка не меняется.
  const FLAT = 'grayscale(1) contrast(0.35) brightness(1.3) blur(6px)';
  const SHARP = 'grayscale(1) contrast(1.12) brightness(1.02) blur(0px)';
  // Документы проявляются в приглушённый цвет — «архив отпечатков»: читаются, но не спорят с акцентом авокадо.
  // DOC_SHARP совпадает со статичным filter у .dip__paper img (styles.css)
  const DOC_FLAT = 'grayscale(1) contrast(0.4) brightness(1.25) blur(4px)';
  const DOC_SHARP = 'grayscale(0.7) contrast(1.05) brightness(1) blur(0px)';
  // «Проявка» текста: из мутного размытого следа в резкость
  const TEXT_FLAT = { filter: 'blur(4px)', autoAlpha: 0.15 };

  /* ---------- «Подробнее об образовании»: работает и без GSAP ---------- */
  const moreHead = $('.more__head');
  const moreBody = $('.more__body');
  function setMore(open) {
    moreHead.setAttribute('aria-expanded', String(open));
    if (!animate) { moreBody.hidden = !open; return; }
    gsap.killTweensOf(moreBody);
    if (open) {
      moreBody.hidden = false;
      gsap.fromTo(moreBody, { height: 0 }, {
        height: 'auto', duration: 0.7, ease: 'power3.out',
        onComplete: () => { moreBody.style.height = ''; refresh(); },
      });
      gsap.from($$('.years li', moreBody), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.035, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(moreBody, {
        height: 0, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => { moreBody.hidden = true; moreBody.style.height = ''; refresh(); },
      });
    }
  }
  moreHead.addEventListener('click', () => setMore(moreHead.getAttribute('aria-expanded') !== 'true'));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', reduceWhiteSpace: false });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.15, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Проявка один раз при входе в кадр, по времени
  function develop(img, trigger) {
    return gsap.fromTo(img, { filter: FLAT, scale: 1.1 }, {
      filter: SHARP, scale: 1, duration: 1.2, ease: 'power2.out', clearProps: 'filter',
      scrollTrigger: { trigger, start: 'top 80%' },
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ================= 1. Обложка: снимок проявляется ================= */
    const lines = $$('.hero__line').map(l => SplitText.create(l, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const heroImg = $('.hero__photo img');
    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => lines.forEach(s => s.revert()),
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(heroImg, { filter: FLAT, scale: 1.1 }, { filter: SHARP, scale: 1, duration: 1.55, ease: 'power2.inOut', clearProps: 'filter' }, 0.05)
      .from('.hero__mast .rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.2)
      .from('.hero__nick', { y: 10, autoAlpha: 0, duration: 0.7 }, 0.3)
      .from('.hero__kicker', { x: -14, autoAlpha: 0, duration: 0.8 }, 0.45)
      .from(lines[0].chars, { yPercent: 112, duration: 1.2, stagger: 0.07, ease: 'expo.out' }, 0.5)
      .from(lines[1].chars, { yPercent: 112, duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0.68)
      .from('.hero__cta .btn', { y: 22, autoAlpha: 0, duration: 0.9 }, 1.5);

    // Прокрутка: фото уходит медленнее страницы, строки имени чуть расходятся (±2%, «Ю» не уезжает за край)
    gsap.to(heroImg, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line--1', { xPercent: -2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__line--2', { xPercent: 2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ================= 2. Оглавление: линейка прорисовывается, номер въезжает справа налево отдельно от названия ================= */
    revealLines('.toc h2', '.toc__head');
    const rows = $$('.toc__row');
    rows.forEach(r => {
      gsap.set($('.toc__line', r), { scaleX: 0 });
      gsap.set($('.toc__num', r), { x: 34, autoAlpha: 0 });
      gsap.set($('.toc__body', r), { y: 16, autoAlpha: 0 });
      gsap.set($('.toc__arrow', r), { x: -12, autoAlpha: 0 });
    });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: batch => batch.forEach((r, i) => {
        gsap.timeline({ delay: i * 0.09 })
          .to($('.toc__line', r), { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
          .to($('.toc__num', r), { x: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out' }, 0.35)
          .to($('.toc__body', r), { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 0.2)
          .to($('.toc__arrow', r), { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, 0.55);
      }),
    });

    /* ================= 3. Обо мне: снимок и пункты «проявляются» — фирменная идея доходит до текста ================= */
    revealLines('.about h2', '.about .sec-head');
    develop('.about__photo img', '.about__photo');
    const facts = $$('.facts li');
    gsap.set(facts, TEXT_FLAT);
    ScrollTrigger.batch(facts, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { filter: 'blur(0px)', autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'power2.out', clearProps: 'filter' }),
    });

    /* ================= 4. Образование: строки дипломов едут при прокрутке навстречу друг другу ================= */
    revealLines('.edu h2', '.edu__head');
    const ribbon = $('.ribbon');
    const travel = row => Math.max(0, row.scrollWidth - ribbon.clientWidth);
    const drift = { trigger: ribbon, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true };
    $$('.ribbon__track').forEach((row, i) => {
      if (i % 2) gsap.fromTo(row, { x: () => -travel(row) }, { x: 0, ease: 'none', scrollTrigger: { ...drift } });
      else gsap.fromTo(row, { x: 0 }, { x: () => -travel(row), ease: 'none', scrollTrigger: { ...drift } });
    });
    gsap.fromTo('.dip__paper img', { filter: DOC_FLAT }, {
      filter: DOC_SHARP, duration: 1.3, stagger: 0.035, ease: 'power2.out', clearProps: 'filter',
      scrollTrigger: { trigger: ribbon, start: 'top 82%' },
    });
    fadeUp('.more', '.more', { y: 12 });

    /* ================= 5. Блог: слова проявляются по очереди при входе в кадр ================= */
    const words = $$('.blog__title .w');
    gsap.fromTo(words, { filter: 'blur(4px)', autoAlpha: 0.08, yPercent: 14 }, {
      filter: 'blur(0px)', autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
      clearProps: 'filter,transform',
      scrollTrigger: { trigger: '.blog__title', start: 'top 85%' },
    });
    gsap.from('.blog__meta > *', {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.blog__meta', start: 'top 92%' },
    });

    /* ================= 6. Академия: заголовок открывается шторкой, обложки поднимаются из «лотка» ================= */
    gsap.fromTo('.academy__title', { clipPath: 'inset(-12% 100% -12% 0%)' }, {
      clipPath: 'inset(-12% 0% -12% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath',
      scrollTrigger: { trigger: '.academy__head', start: 'top 82%' },
    });
    const covers = $$('.cover');
    covers.forEach(c => {
      gsap.set(c, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set($('.cover__icon', c), { y: 18, autoAlpha: 0 });
      gsap.set($('.cover__body', c), { y: 24, autoAlpha: 0 });
    });
    ScrollTrigger.batch(covers, {
      start: 'top 90%', once: true,
      onEnter: batch => batch.forEach((c, i) => {
        gsap.timeline({ delay: i * 0.12 })
          .to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to($('.cover__icon', c), { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' }, 0.4)
          .to($('.cover__body', c), { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 0.55);
      }),
    });

    /* ================= Подвал: «задняя обложка» собирается как обложка ================= */
    const footName = SplitText.create('.foot__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const foot = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.foot', start: 'top 80%' },
      onComplete: () => footName.revert(),
    })
      .from('.foot__mast .rule', { scaleX: 0, duration: 1.3, ease: 'expo.inOut' }, 0)
      .from('.foot__mast > span', { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.1)
      .from(footName.chars, { yPercent: 112, duration: 1.1, stagger: 0.04, ease: 'expo.out' }, 0.2)
      .from('.foot__grid > *', { y: 22, autoAlpha: 0, duration: 0.85, stagger: 0.1 }, 0.6);
    // строка концепта в подвале — в полной версии; в демо вместо неё финальная плашка .concept-end
    if ($('.foot__concept')) foot.from('.foot__concept', { autoAlpha: 0, duration: 0.8 }, 0.9);
    if ($('.concept-end')) fadeUp('.concept-end > *', '.concept-end');

    window.addEventListener('load', refresh, { once: true });
  });
})();
