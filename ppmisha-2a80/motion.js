// Алёна (@ppmisha) — моушн концепта «Шоколадный фуд-журнал».
// Фирменная идея «Открытая крышка»: фото рационов и обложки меню раскрываются снизу вверх —
// с контейнера снимают крышку, а сама еда слегка «садится» (scale 1.08 → 1).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- таблица цен: выбор строки меняет готовый текст в Telegram и кодовое слово (работает и без GSAP) ---------- */
  $$('[data-picker]').forEach(box => {
    const opts = $$('.opt', box);
    const word = $("span[data-word]", box);
    const tg = $("a[data-tg]", box);
    const pick = opt => {
      opts.forEach(o => o.setAttribute('aria-checked', String(o === opt)));
      word.textContent = opt.dataset.code;
      tg.href = 'https://t.me/ppmisha?text=' + encodeURIComponent(opt.dataset.text);
    };
    opts.forEach((opt, i) => {
      opt.addEventListener('click', () => pick(opt));
      // Стрелки переключают строки, как в обычной группе радиокнопок
      opt.addEventListener('keydown', e => {
        const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = opts[(i + step + opts.length) % opts.length];
        pick(next);
        next.focus();
      });
    });
  });

  /* ---------- ленты фото: полоска прогресса при листании (работает и без GSAP) ---------- */
  $$('.railbox').forEach(box => {
    const rail = $('.rail', box), bar = $('.rail__bar', box);
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const seen = rail.clientWidth / rail.scrollWidth;
      bar.style.setProperty('--p', (max > 0 ? seen + (1 - seen) * (rail.scrollLeft / max) : 1).toFixed(3));
    };
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  if (!animate) return;

  // «Крышка»: ставим её на фото и снимаем вверх с лёгким наклоном; фото под ней «садится»
  function lid(frame, opts = {}) {
    const { scale = 1.08, duration = 1.15, paused = true, start = 0 } = opts;
    const tl = gsap.timeline({ paused });
    tl.fromTo($('.lid', frame),
      { opacity: 1, yPercent: start, rotation: 0, transformOrigin: '50% 100%' },
      { yPercent: -106, rotation: -2.5, duration, ease: 'power3.inOut' }, 0)
      .fromTo($('img', frame), { scale }, { scale: 1, duration: duration + 0.6, ease: 'power3.out' }, 0.22);
    return tl;
  }

  // Раскрытие клипом — для фото, где «крышка» неуместна (до/после, результаты, программа): data-clip="center|left|right|up|down"
  const CLIPS = {
    center: 'inset(0% 50% 0% 50%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)',
    up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)',
  };
  function clip(frame) {
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(frame, { clipPath: CLIPS[frame.dataset.clip] || CLIPS.up },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
      .fromTo($('img', frame), { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0.05);
    return tl;
  }
  // Её числа (2016, 7000) не «набегают» — иначе кадр рилса ловит чужую цифру; цифры поднимаются из-под маски
  function revealDigits(el) {
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, stagger: 0.08, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onComplete: () => split.revert(),
    });
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(el, trigger, onDone) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', reduceWhiteSpace: false });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => { split.revert(); onDone && onDone(); },
    });
  }
  const fadeUp = (targets, trigger) => gsap.from(targets, {
    y: 22, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: trigger || targets, start: 'top 88%' },
  });
  // Каждый абзац длинного текста появляется сам, когда до него доходит прокрутка
  const fadeEach = selector => $$(selector).forEach(el => gsap.from(el, {
    y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%' },
  }));

  MotionBase.ready(() => {
    /* ---------- 1. Обложка: мастхед поднимается, с фото снимают крышку ---------- */
    const name = SplitText.create('.cover__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.cover__lead', { type: 'lines', mask: 'lines', reduceWhiteSpace: false });
    // Крышка обложки короткая и стартует уже приподнятой — лицо видно почти сразу (первые кадры рилса)
    const cover = lid($('.cover__photo .frame'), { scale: 1.12, duration: 0.85, start: -35, paused: false });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.cover__folio', { y: 10, autoAlpha: 0, duration: 0.7 }, 0.1)
      .from(name.chars, { yPercent: 108, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.15)
      .add(cover, 0.1)
      .from('.cover__line > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.15)
      .from('.cover__toc > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.8)
      .from('.cover__hello', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.07, duration: 0.85 }, 1.05)
      .from('.cover__actions .btn', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7, clearProps: 'transform' }, 1.3);

    // Лёгкий параллакс обложки
    gsap.to('.cover__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.cover__photo', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- крышка — только на еде и обложках меню; её до/после раскрываются клипом от центра ---------- */
    $$('.lidded').forEach(frame => {
      if (frame.closest('.cover')) return;
      const tl = lid(frame);
      ScrollTrigger.create({ trigger: frame, start: 'top 86%', once: true, onEnter: () => tl.play() });
    });
    $$('[data-clip]').forEach(frame => {
      const tl = clip(frame);
      ScrollTrigger.create({ trigger: frame, start: 'top 86%', once: true, onEnter: () => tl.play() });
    });

    /* ---------- 2. Личный опыт ---------- */
    fadeUp('.story .eyebrow', '.story__head');
    revealLines('.story__title', '.story__head');
    fadeUp('.story__text', '.story__text');

    /* Факты: карточки поднимаются, цифры встают из-под маски */
    gsap.from('.fact', {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 80%' },
    });
    $$('[data-digits]').forEach(revealDigits);

    /* ---------- 3. Услуги ---------- */
    fadeUp('.services .eyebrow', '.services__head');
    const svc = SplitText.create('.services__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(svc.chars, {
      yPercent: 108, stagger: 0.04, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.services__head', start: 'top 82%' },
      onComplete: () => svc.revert(),
    });

    $$('.dish__title').forEach(t => revealLines(t, t));
    fadeUp('.dish--dark .eyebrow', '.dish--dark .dish__head');
    fadeEach('.dish--channel .dish__body > p');
    gsap.from('.bullets li', {
      y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.bullets', start: 'top 86%' },
    });

    // Карточки цены поднимаются, кнопки — следом
    $$('.price').forEach(card => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 46, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from($$('.price__value, .opt', card), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.25)
        .from($$('.msg .btn', card), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.45);
    });

    /* ---------- 4. Меню-сушка: обложки расходятся веером при прокрутке ---------- */
    // «Сушка 5.0» выезжает из-под «6.0» и встаёт справа ниже — названия обеих видны целиком
    gsap.fromTo('.covers__back',
      { rotation: -1, xPercent: -18, yPercent: -6 },
      { rotation: 4, xPercent: 0, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.covers', start: 'top 85%', end: 'center 45%', scrub: 0.8 } });
    gsap.from('.versions__list li', {
      x: -16, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.versions', start: 'top 86%' },
    });
    fadeEach('.dish--dark .dish__body > p, .dish__sub');
    gsap.from('.cases li', {
      y: 20, autoAlpha: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.cases', start: 'top 86%' },
    });

    gsap.from('.concept-end > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, clearProps: 'transform',
      scrollTrigger: { trigger: '.concept-end', start: 'top 86%' },
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
