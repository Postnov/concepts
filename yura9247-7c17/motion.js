// Юрий Волденкин — моушн концепта. Идея: «лента-замер». Жёлтая сантиметровая лента разматывается там, где есть что измерить:
// стаж в годах, длительность каждой программы, минуты тренировки. Остальное — спокойные появления без лишних эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон программ: работает и без GSAP ---------- */
  const items = $$('.prog, .row').map(el => ({ el, head: $('.prog__toggle, .row__btn', el), body: $('.prog__body, .row__body', el) })).filter(i => i.head && i.body);
  function setOpen(it, open, instant) {
    const { head, body } = it;
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
      gsap.from($$('li, .blk, .prog__lead', body), { x: -12, autoAlpha: 0, duration: 0.45, stagger: 0.035, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  items.forEach(it => {
    it.head.addEventListener('click', () => {
      const open = it.head.getAttribute('aria-expanded') !== 'true';
      const group = it.el.closest('.progs, .rows');
      items.forEach(other => other !== it && other.el.closest('.progs, .rows') === group && setOpen(other, false));
      setOpen(it, open);
    });
  });

  if (!animate) {
    if (items[0]) setOpen(items[0], true, true);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    if (!$(selector)) return;
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: $(trigger || selector), start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const head = (sec) => {
    if (!$(sec)) return;
    gsap.from([`${sec} .eyebrow`, `${sec} .sec-sub`], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 84%' },
    });
  };
  // Лента разматывается слева направо; длительность пропорциональна длине ленты на шкале
  const unroll = (root, trigger, delay = 0) => {
    $$('.dur', root).forEach(d => {
      const bar = $('.dur__bar', d);
      const share = parseFloat(getComputedStyle(d).getPropertyValue('--len')) / parseFloat(getComputedStyle(d).getPropertyValue('--axis'));
      gsap.timeline({ scrollTrigger: { trigger: trigger || d, start: 'top 90%', once: true }, delay })
        .fromTo(bar, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 + share * 1.1, ease: 'power3.inOut', onComplete: () => gsap.set(bar, { clearProps: 'clipPath' }) }, 0)
        .from($('.dur__v', d), { x: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.35);
    });
  };

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const cutOff = 'polygon(0% 100%, 88% 100%, 100% 100%, 100% 100%, 12% 100%, 0% 100%)';
    const cutOn = 'polygon(0% 0%, 88% 0%, 100% 12%, 100% 100%, 12% 100%, 0% 88%)';

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); gsap.set(['.hero__photo', '.hero__slab'], { clearProps: 'clipPath' }); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.25)
      .from(first.chars, { yPercent: 115, stagger: 0.05, duration: 0.9, ease: 'expo.out' }, 0.3)
      .from(last.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.45)
      .fromTo('.hero__slab', { clipPath: cutOff }, { clipPath: cutOn, duration: 1.1, ease: 'expo.inOut' }, 0.4)
      .fromTo('.hero__photo', { clipPath: cutOff }, { clipPath: cutOn, duration: 1.3, ease: 'expo.inOut' }, 0.55)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.6)
      .fromTo('.hero__scan', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 1.15)
      .fromTo('.hero__scan', { y: 0 }, { y: () => $('.hero__photo').offsetHeight, duration: 1.1, ease: 'power2.inOut' }, 1.15)
      .to('.hero__scan', { autoAlpha: 0, duration: 0.25 }, 2.05)
      .from('.hero__br', { autoAlpha: 0, scale: 0.4, duration: 0.6, stagger: 0.12 }, 1.5)
      .from('.hero__ruler', { autoAlpha: 0, duration: 0.8 }, 1.2)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    /* Лента стажа: разматывается, когда попадает в экран */
    gsap.timeline({ scrollTrigger: { trigger: '.ytape', start: 'top 94%', once: true }, delay: 0.5 })
      .fromTo('.ytape__strip', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.2, ease: 'power3.inOut', onComplete: () => gsap.set('.ytape__strip', { clearProps: 'clipPath' }) }, 0)
      .from('.ytape__n', { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.42 }, 0.2)
      .from('.ytape__cap', { autoAlpha: 0, y: 8, duration: 0.7 }, 1.4);

    /* ---------- 2. Программы ---------- */
    revealLines('.programs h2', '.programs .sec-head');
    head('.programs');
    gsap.set('.programs .prog', { y: 44, autoAlpha: 0 });
    ScrollTrigger.batch('.programs .prog', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }),
    });
    $$('.programs .prog').forEach(card => {
      unroll(card, card);
      gsap.from($$('.prog__price, .chips li', card), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.25, scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    });
    // Первая программа раскрывается сама (на телефоне, где карточки в один столбец), чтобы было видно, что карточки живые
    if ($('.programs .prog') && matchMedia('(max-width: 899px)').matches) {
      ScrollTrigger.create({
        trigger: '.programs .progs', start: 'top 55%', once: true,
        onEnter: () => gsap.delayedCall(0.8, () => setOpen(items.find(i => i.el === $('.programs .prog')), true)),
      });
    }

    /* ---------- 3. Для дома: строки на общей шкале ---------- */
    if ($('.home')) {
      revealLines('.home h2', '.home .sec-head');
      head('.home');
      gsap.set('.row', { x: -26, autoAlpha: 0 });
      ScrollTrigger.batch('.row', {
        start: 'top 92%', once: true,
        onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' }),
      });
      $$('.row').forEach(r => unroll(r, r, 0.2));
      gsap.from('.axis', { autoAlpha: 0, y: 10, duration: 0.7, scrollTrigger: { trigger: '.axis', start: 'top 92%', once: true } });
    }

    /* ---------- 4. Индивидуальные ---------- */
    if ($('.individual')) {
      revealLines('.individual h2', '.individual .sec-head');
      head('.individual');
      gsap.from('.individual .prog', {
        scale: 0.94, y: 30, autoAlpha: 0, transformOrigin: '0% 0%', duration: 1, stagger: 0.14, ease: 'expo.out',
        scrollTrigger: { trigger: '.individual .progs', start: 'top 82%', once: true },
      });
      $$('.individual .prog').forEach(card => {
        unroll(card, card, 0.25);
        gsap.from($$('.prog__price, .chips li', card), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.3, scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
      });
    }

    /* ---------- 5. Зал и персональные ---------- */
    if ($('.gym')) {
      revealLines('.gym h2', '.gym .sec-head');
      head('.gym');
      gsap.from('.ticket', { y: 60, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: '.tickets', start: 'top 85%', once: true } });
      $$('.ticket').forEach(t => {
        unroll(t, t, 0.25);
        gsap.fromTo($('.ticket__price', t), { clipPath: 'inset(110% 0% 0% 0%)' }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: 0.9, ease: 'expo.out', delay: 0.2, scrollTrigger: { trigger: t, start: 'top 88%', once: true }, onComplete: function () { gsap.set(this.targets(), { clearProps: 'clipPath' }); } });
      });
    }

    /* ---------- 6. Обо мне ---------- */
    if ($('.about')) {
      gsap.fromTo('.about__big', { clipPath: 'inset(100% 0% -10% 0%)' }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.about__grid', start: 'top 80%', once: true }, onComplete: () => gsap.set('.about__big', { clearProps: 'clipPath' }) });
      gsap.from('.about__cap', { x: -16, autoAlpha: 0, duration: 0.9, delay: 0.5, scrollTrigger: { trigger: '.about__grid', start: 'top 80%', once: true } });
      revealLines('.about__hi', '.about__txt');
      gsap.from('.about__txt p', { y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.15, scrollTrigger: { trigger: '.about__txt', start: 'top 78%', once: true } });
    }

    /* ---------- 7. Видео ---------- */
    if ($('.video')) {
      revealLines('.video h2', '.video .sec-head');
      head('.video');
      gsap.timeline({ scrollTrigger: { trigger: '.video__card', start: 'top 88%', once: true } })
        .from('.video__card', { x: -40, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0)
        .from('.video__play', { scale: 0.5, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.25)
        .from('.video__body > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.35);
    }

    /* ---------- 8. Результаты ---------- */
    if ($('.results')) {
      gsap.from('.results__in > *', { y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.12, scrollTrigger: { trigger: '.results', start: 'top 82%', once: true } });
    }

    /* ---------- 9. Контакты ---------- */
    if ($('.contact')) {
      revealLines('.contact h2', '.contact h2');
      gsap.from('.contact .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.contact', start: 'top 80%', once: true } });
      gsap.from('.contact__btns .btn', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.contact__btns', start: 'top 90%', once: true } });
      gsap.from('.contact__rows > div', { y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.12, scrollTrigger: { trigger: '.contact__rows', start: 'top 88%', once: true } });
    }

    /* ---------- конец демо ---------- */
    if ($('.concept-end')) gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
