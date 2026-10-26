// Наталия Петрова — моушн концепта «Белый кабинет». Спокойный врачебный ритм:
// бланк заполняется, портрет в оконном проёме открывается настоящими жалюзи (10 полос), а в «Порядке работы» по скроллу прорисовывается маршрут пациента.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- раскрывашки (аккордеон клуба и «Обо мне»): работают и без GSAP, открываются независимо ---------- */
  function setOpen(head, body, open, instant) {
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from(body.querySelectorAll('li, p, .tariff__row'), { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.035, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  const toggle = (head, body) => head.addEventListener('click', () => setOpen(head, body, head.getAttribute('aria-expanded') !== 'true'));
  $$('.acc__item').forEach(item => toggle($('.acc__head', item), $('.acc__body', item)));
  const aboutBtn = $('.hcard--about');
  if (aboutBtn) toggle(aboutBtn, document.getElementById(aboutBtn.getAttribute('aria-controls')));

  /* ---------- маршрут: линия идёт от центра первого узла до центра последнего ---------- */
  const route = $('.route');
  const track = $('.route__track');
  const steps = $$('.step');
  // offsetTop не зависит от transform, поэтому замер верен и во время анимаций входа
  function sizeTrack() {
    if (!steps.length) return;
    const half = steps[0].querySelector('.step__node').offsetHeight / 2;
    const first = steps[0].offsetTop;
    const last = steps[steps.length - 1].offsetTop;
    track.style.top = `${first + half}px`;
    track.style.height = `${last - first}px`;
  }
  sizeTrack();
  window.addEventListener('resize', sizeTrack);

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(target, trigger, extra) {
    const split = SplitText.create(target, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || target, start: 'top 84%' },
      onComplete: () => split.revert(),
      ...extra,
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
    scrollTrigger: { trigger: trigger || targets, start: 'top 88%' },
    ...vars,
  });

  MotionBase.ready(() => {
    ScrollTrigger.addEventListener('refreshInit', sizeTrack);

    /* ---------- 1. Первый экран: бланк заполняется ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const role = SplitText.create('.hero__role', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); role.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.blank-top span', { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.15)
      .from('.hero .rule', { scaleX: 0, duration: 1.2, stagger: 0.18, ease: 'expo.inOut' }, 0.2)
      .from('.field__label span', { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.2 }, 0.3)
      .from(name.chars, { yPercent: 112, duration: 1.1, stagger: 0.035, ease: 'expo.out' }, 0.35)
      .from(role.lines, { yPercent: 105, duration: 0.95, ease: 'expo.out' }, 0.85)
      .from('.hero__lead', { y: 12, autoAlpha: 0, duration: 0.8 }, 1.0)
      // окно кабинета: проступает с закрытыми жалюзи, затем полосы сворачиваются сверху вниз и открывают снимок
      .from('.win__frame', { autoAlpha: 0, scale: 0.975, duration: 0.8, ease: 'power2.out' }, 0.1)
      .fromTo('.blinds i', { scaleY: 1 }, { scaleY: 0, duration: 0.85, stagger: 0.05, ease: 'power2.inOut' }, 0.55)
      .from('.win__frame img', { scale: 1.16, duration: 2.2, ease: 'expo.out' }, 0.5)
      .from('.win__outline', { autoAlpha: 0, scale: 0.96, duration: 1.4, ease: 'expo.out' }, 0.8)
      .from('.hcard', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.15);

    // лёгкий параллакс портрета: −2.5 % ровно укладывается в запас scale 1.05
    gsap.to('.win__frame img', {
      yPercent: -2.5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- подписи разделов — поля бланка: линейка прочерчивается до края, подпись вписывается ---------- */
    $$('.sec-label').forEach(label => {
      gsap.timeline({ scrollTrigger: { trigger: label, start: 'top 88%' } })
        .from($('.rule', label), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0)
        .from($('span', label), { x: -10, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
    });

    /* ---------- 2. Клуб ---------- */
    fadeUp('.club__kicker', '.club__side');
    revealLines('.club__title em', '.club__side', { delay: 0.15 });
    gsap.timeline({ scrollTrigger: { trigger: '.club__intro', start: 'top 82%' } })
      .fromTo('.club__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.club__photo img', { scale: 1.25, duration: 1.9, ease: 'expo.out' }, 0.15)
      .from('.club__lead', { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.5);
    const accItems = $$('.acc__item');
    gsap.set(accItems, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(accItems, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }),
    });
    fadeUp('.tariff__row', '.tariff', { x: 14, y: 0 });
    fadeUp('.club .btn', '.club .btn');

    /* ---------- ссылки в Telegram ---------- */
    $$('.tgrow').forEach(row => fadeUp(row.children, row));

    /* ---------- 3. Онлайн-консультация: прейскурант ---------- */
    gsap.from('.notice', { x: -18, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.notice', start: 'top 88%' } });
    revealLines('#consult-title', '#consult-title');
    fadeUp('.consult .sec-sub', '.consult .sec-sub');
    fadeUp('.includes__title', '.includes');
    // строки «Услуга включает»: линейка прочерчивается, ставится точка, вписывается текст
    const incl = $$('.includes__list li');
    gsap.timeline({ scrollTrigger: { trigger: '.includes__list', start: 'top 86%' } })
      .fromTo(incl, { '--rule': 0 }, { '--rule': 1, duration: 0.9, stagger: 0.09, ease: 'expo.inOut' }, 0)
      .fromTo(incl, { '--dot': 0 }, { '--dot': 1, duration: 0.5, stagger: 0.09, ease: 'power3.out' }, 0.25)
      .from(incl, { color: 'rgba(34, 48, 47, 0)', duration: 0.6, stagger: 0.09, ease: 'power2.out' }, 0.3);

    gsap.from('.pricelist', {
      y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.pricelist', start: 'top 86%' },
    });
    gsap.from('.pricelist__head', { autoAlpha: 0, y: 10, duration: 0.7, scrollTrigger: { trigger: '.pricelist', start: 'top 86%' } });
    // отточия прорисовываются строка за строкой, затем проявляется цена — без счётчика, только её реальные суммы
    $$('.pl-row').forEach(row => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%', once: true } })
        .from($('.pl-name', row), { x: -10, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .from($('.pl-dots', row), { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.1)
        .from($('.pl-price', row), { y: 6, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
    });
    fadeUp('.pl-group__title', '.pl-group--urgent');

    /* ---------- 4. Маршрут пациента (фирменная идея) ----------
       Бирюзовая линия прорисовывается скроллом; каждый узел загорается мятным, когда линия до него дошла. */
    revealLines('#flow-title', '#flow-title');
    fadeUp('.flow__note', '.flow__note');
    const thresholds = () => {
      const first = steps[0].offsetTop;
      const span = steps[steps.length - 1].offsetTop - first || 1;
      return steps.map(s => (s.offsetTop - first) / span);
    };
    let marks = thresholds();
    ScrollTrigger.addEventListener('refresh', () => { marks = thresholds(); });
    const light = p => steps.forEach((s, i) => s.classList.toggle('is-lit', i === 0 ? p > 0.002 : p >= marks[i] - 0.004));
    // Линия идёт за скроллом, но пройденный путь не стирается при прокрутке назад
    const fillEl = $('.route__fill');
    let reached = 0;
    const drawTo = p => {
      if (p <= reached) return;
      reached = p;
      gsap.to(fillEl, {
        scaleY: p, duration: 0.55, ease: 'power2.out', overwrite: true,
        onUpdate: () => light(gsap.getProperty(fillEl, 'scaleY')),
      });
    };
    ScrollTrigger.create({
      trigger: track, start: 'top 62%', end: 'bottom 62%',
      onUpdate: self => drawTo(self.progress),
      onRefresh: self => drawTo(self.progress),
    });
    gsap.set('.step__text', { autoAlpha: 0, x: 16 });
    ScrollTrigger.batch('.step__text', {
      start: 'top 82%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }),
    });

    /* ---------- Условия ---------- */
    // сноски: сначала выдвигается стрелка ➤, следом проявляется текст
    const notes = $$('.terms__list li');
    gsap.timeline({ scrollTrigger: { trigger: '.terms__list', start: 'top 86%' } })
      .fromTo(notes, { '--ax': '-8px', '--ao': 0 }, { '--ax': '0px', '--ao': 1, duration: 0.55, stagger: 0.12, ease: 'power3.out' }, 0)
      .from(notes, { color: 'rgba(85, 98, 95, 0)', duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.18);
    // сроки: каждую следующую строку открывает линейка-разделитель, как строки прейскуранта
    const stats = gsap.timeline({ scrollTrigger: { trigger: '.terms__stats', start: 'top 86%' } })
      .from('.terms__stats', { y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0);
    $$('.terms__stats li').forEach((li, i) => {
      const at = 0.2 + i * 0.24;
      if (i) stats.fromTo(li, { '--rule': 0 }, { '--rule': 1, duration: 0.8, ease: 'expo.inOut' }, at - 0.12);
      stats.from(li.children, { y: 8, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, at + 0.12);
    });
    fadeUp('.important', '.important');
    fadeUp('.terms .btn', '.terms .btn');
    // десктоп: общая линейка над кнопкой и блогом прочерчивается слева направо (на мобильном её нет)
    gsap.fromTo('.terms', { '--trule': 0 }, { '--trule': 1, duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.terms .btn', start: 'top 94%' } });

    /* ---------- 5. Онлайн-продукты: карточка входит, старая цена зачёркивается, проявляется новая (без счётчиков) ---------- */
    const cards = $$('.prod');
    gsap.set(cards, { y: 40, autoAlpha: 0 });
    gsap.set($$('.prod__price s'), { '--strike': 0 });
    gsap.set($$('.prod__price b'), { y: 6, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 92%', once: true,
      onEnter: els => els.forEach((card, i) => {
        gsap.timeline({ delay: i * 0.1 })
          .to(card, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out' }, 0)
          .from(card.querySelectorAll('.cover > *'), { scale: 0.85, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.2)
          .to($('.prod__price s', card), { '--strike': 1, duration: 0.6, ease: 'power2.inOut' }, 0.5)
          .to($('.prod__price b', card), { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 0.95);
      }),
    });

    fadeUp('.concept-end > *', '.concept-end', { stagger: 0.1 });

    window.addEventListener('load', refresh, { once: true });
  });
})();
