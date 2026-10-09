// Юлия Федорченко — моушн концепта.
// Фирменная идея — «погружение»: золотая нить со светящейся точкой опускается по уровням подсознания
// и зажигает каждый уровень, когда свет до него доходит. Остальное — тихие раскрытия из-под маски.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон вопросов: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
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
      gsap.from(body.children, { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.06, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.acc__item').forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.acc__item').forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen($('.acc__item'), true, true);
    return;
  }

  // Строки из-под маски; после анимации split снимаем, чтобы переносы жили при ресайзе
  function revealLines(selector, trigger, opts = {}) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out', ...opts,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', ...extra,
    scrollTrigger: { trigger: trigger || targets, start: 'top 86%' },
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: портрет проявляется из арки, золотой контур дорисовывается ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const motto = SplitText.create('.hero__motto', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const archPath = $('.hero__arch-line path');

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); motto.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.arch img', { scale: 1.3, duration: 2.1, ease: 'expo.out' }, 0.35)
      .fromTo(archPath, { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.5)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.45)
      .from(first.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from(last.chars, { yPercent: 110, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.8)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from(motto.lines, { yPercent: 100, stagger: 0.1, duration: 0.9 }, 1.2)
      .from('.hero__orn', { scaleX: 0, duration: 1, ease: 'expo.out' }, 1.3)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.35)
      .from('.dive-cue', { autoAlpha: 0, duration: 0.8 }, 1.7);

    // Капля света скатывается по нити вниз — приглашение «погрузиться»
    gsap.fromTo('.dive-cue__line b', { y: -22 }, { y: 64, duration: 1.8, ease: 'power2.in', repeat: -1, repeatDelay: 0.5, delay: 2 });

    // Лёгкий параллакс портрета и контура
    gsap.to('.arch img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__arch-line', { y: -24, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Метод: погружение ---------- */
    gsap.from('.method .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.method__head', start: 'top 84%' } });
    revealLines('.method h2', '.method__head');
    revealLines('.method__lead', '.method__lead', { delay: 0.15 });
    fadeUp('.method .sec-sub', '.method .sec-sub');

    // Нить и точка-свет: идут вместе со скроллом, точка всегда на линии 62% экрана
    const LINE = 'top 62%';
    gsap.timeline({ scrollTrigger: { trigger: '.depth__list', start: LINE, end: 'bottom 62%', scrub: 0.6 } })
      .to('.depth__fill', { scaleY: 1, ease: 'none' }, 0)
      .fromTo('.depth__orb', { top: '0%' }, { top: '100%', ease: 'none' }, 0);
    gsap.from('.depth__orb', { scale: 0, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: '.depth', start: 'top 75%' } });
    // Уровень загорается, когда свет до него доходит, и гаснет при прокрутке назад
    $$('.depth__item').forEach(item => {
      ScrollTrigger.create({
        trigger: item, start: 'center 62%',
        onEnter: () => item.classList.add('is-lit'),
        onLeaveBack: () => item.classList.remove('is-lit'),
      });
    });

    const roots = SplitText.create('.roots__big', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(roots.lines, {
      yPercent: 105, duration: 1.15, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: '.roots', start: 'top 82%' },
      onComplete: () => roots.revert(),
    });
    fadeUp('.roots__list', '.roots__list', { delay: 0.2 });

    gsap.from('.asks__label', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.asks', start: 'top 84%' } });
    $$('.asks__list li').forEach(li => {
      const split = SplitText.create(li, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' }, onComplete: () => split.revert() })
        .from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 0);
    });

    const results = $$('.result');
    gsap.set(results, { y: 28, autoAlpha: 0 });
    ScrollTrigger.batch(results, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }),
    });
    fadeUp('.method__outro', '.method__outro');

    /* ---------- 3. Услуга ---------- */
    gsap.from('.service .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.service .sec-head', start: 'top 84%' } });
    revealLines('.service h2', '.service .sec-head');

    gsap.timeline({ scrollTrigger: { trigger: '.offer', start: 'top 82%' } })
      // clearProps: иначе clip-path обрезает тень карточки прямоугольником
      .fromTo('.offer', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.offer > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.6);
    // Свет внутри арки-карточки тихо «дышит»
    gsap.to('.offer__sigil i', { scale: 1.35, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });

    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: 100 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });
    fadeUp('.reviews', '.reviews');

    gsap.from('.faq__title', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.faq', start: 'top 86%' } });
    const items = $$('.acc__item');
    gsap.set(items, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
    });
    // Первый вопрос раскрывается сам — видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.6, () => setOpen(items[0], true)),
    });

    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 88%' } })
      .from('.contact', { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
      .from('.contact__avatar', { scale: 0.6, duration: 0.9, ease: 'back.out(2)' }, 0.15)
      .from('.msg', { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
