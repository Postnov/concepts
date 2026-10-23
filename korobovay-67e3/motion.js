// Яна Императрица — моушн концепта. Фирменная идея «живые портреты вне Хогвартса»:
// золотой багет с вырезанными углами прорисовывается сам, портрет «оживает» из выцветшей сепии в цвет
// и дальше живёт как рилс — три серии по 5 секунд с полосками сверху и медленной камерой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон модулей: работает и без GSAP ---------- */
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
      gsap.from($('p', body), { y: 10, autoAlpha: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
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

  // Выцветшая сепия → живой цвет
  const FADED = 'grayscale(1) sepia(0.45) contrast(0.88) brightness(1.08)';
  const ALIVE = 'grayscale(0) sepia(0) contrast(1) brightness(1)';

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы переносы жили при ресайзе
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
      ...vars,
    });
  }

  // Портрет в багете: линии рисуются, фото поднимается занавесом и оживает
  function framePortrait(fig, tl, at = 0, big = false) {
    const lines = $$('.ln--outer, .ln--inner', fig);
    const photo = $('.portrait__photo', fig);
    const img = $('img', fig);
    tl.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: big ? 1.8 : 1.4, stagger: 0.18, ease: 'power2.inOut' }, at)
      .fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: big ? 1.4 : 1.2, ease: 'expo.inOut' }, at + 0.25)
      .from(img, { scale: big ? 1.28 : 1.22, duration: 2, ease: 'expo.out' }, at + 0.45)
      .fromTo(img, { filter: FADED }, { filter: ALIVE, duration: big ? 2.2 : 1.8, ease: 'power2.inOut', clearProps: 'filter' }, at + 0.9);
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const hero = $('.portrait--hero');
    const heroImg = $('img', hero);
    const bars = $$('.reel b', hero);
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const role = SplitText.create('.hero__role', { type: 'lines', mask: 'lines' });

    gsap.set(bars, { scaleX: 0 });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); role.revert(); live(); },
    });
    intro.from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0);
    framePortrait(hero, intro, 0.1, true);
    intro
      .from('.crown__disc', { scale: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(1.6)' }, 1.0)
      .fromTo('.ln--crown', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 1.15)
      .from('.gem', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2)' }, 1.3)
      .from('.reel i', { autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.6)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 110, stagger: 0.035, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from(role.lines, { yPercent: 100, stagger: 0.1, duration: 1 }, 1.0)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, duration: 0.75, stagger: 0.1 }, 1.35);

    /* «Живой портрет»: три серии рилса, камера медленно дышит, полоски заполняются по очереди */
    function live() {
      const shots = [
        { scale: 1.15, xPercent: -1.6, yPercent: 2.2 },  // наезд к лицу
        { scale: 1.12, xPercent: 2, yPercent: 0.6 },     // проводка вбок
        { scale: 1.06, xPercent: 0, yPercent: 0 },       // отъезд в исходный кадр
      ];
      const tl = gsap.timeline({ repeat: -1, onRepeat: () => gsap.set(bars, { scaleX: 0 }) });
      shots.forEach((shot, i) => {
        tl.to(bars[i], { scaleX: 1, duration: 5, ease: 'none' }, i * 5)
          .to(heroImg, { ...shot, duration: 5, ease: 'sine.inOut' }, i * 5);
      });
    }

    /* Портрет чуть отстаёт при прокрутке */
    gsap.to(hero, {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Партнерство ---------- */
    revealLines('.partner h2', '.partner .sec-head');
    gsap.from('.partner .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.partner .sec-head', start: 'top 84%' } });
    $$('.diptych .portrait').forEach((fig, i) => {
      framePortrait(fig, gsap.timeline({ delay: i * 0.22, scrollTrigger: { trigger: '.diptych', start: 'top 82%' } }));
    });
    revealLines('.partner__lead', '.partner__lead');
    gsap.timeline({ scrollTrigger: { trigger: '.formula', start: 'top 88%' }, defaults: { ease: 'expo.out', duration: 1 } })
      .from('.formula__a', { x: -24, autoAlpha: 0 }, 0)
      .from('.formula__plus', { rotate: -180, scale: 0, transformOrigin: '50% 55%' }, 0.1)
      .from('.formula__b', { x: 24, autoAlpha: 0 }, 0.2);
    gsap.from('.partner__terms', { y: 18, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.partner__terms', start: 'top 90%' } });

    const items = $$('.acc__item');
    gsap.set(items, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });
    // Первый модуль раскрывается сам — видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 66%', once: true,
      onEnter: () => gsap.delayedCall(0.7, () => setOpen(items[0], true)),
    });
    gsap.from('.partner__main > .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.partner__main > .btn', start: 'top 94%' } });

    /* ---------- 3. Обучение ---------- */
    revealLines('.course h2', '.course .sec-head');
    gsap.from('.course .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.course .sec-head', start: 'top 84%' } });
    gsap.from('.course__label', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.course__label', start: 'top 90%' } });
    // Пункты программы: тонкая линия прочерчивается слева, текст поднимается следом
    const units = $$('.unit');
    gsap.set(units, { '--draw': 0 });
    gsap.set($$('.unit > *'), { y: 14, autoAlpha: 0 });
    ScrollTrigger.batch(units, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { '--draw': 1, duration: 1, stagger: 0.1, ease: 'power2.inOut' });
        gsap.to(els.flatMap(el => [...el.children]), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, delay: 0.15, ease: 'power3.out' });
      },
    });
    gsap.from('.course__list > .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.course__list > .btn', start: 'top 94%' } });

    // Отзыв: письмо поднимается, вопрос всплывает пузырём, «Ни капли!» пишется по буквам
    const big = SplitText.create('.letter__big', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const text = SplitText.create('.letter__text', { type: 'lines', mask: 'lines' });
    gsap.timeline({
      scrollTrigger: { trigger: '.letter', start: 'top 80%' },
      defaults: { ease: 'power3.out' },
      onComplete: () => { big.revert(); text.revert(); },
    })
      .from('.letter', { y: 40, autoAlpha: 0, duration: 1 }, 0)
      .from('.letter__label', { autoAlpha: 0, duration: 0.6 }, 0.3)
      .from('.letter__ask', { scale: 0.8, autoAlpha: 0, transformOrigin: '0% 100%', duration: 0.7, ease: 'back.out(1.8)' }, 0.4)
      .from(big.chars, { yPercent: 110, stagger: 0.04, duration: 0.9, ease: 'expo.out' }, 0.75)
      .from(text.lines, { yPercent: 100, stagger: 0.06, duration: 0.9, ease: 'expo.out' }, 1.0);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
