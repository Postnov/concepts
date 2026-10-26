// Елена — моушн концепта «Прилавок с ценниками».
// Фирменная идея: на каждом ценнике старую цену перечёркивает бордовый штрих, а новая поднимается снизу на её место.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- раскрывашки «что входит»: работают и без GSAP, каждая сама по себе ---------- */
  function setOpen(more, open, instant) {
    const head = $('.more__head', more);
    const body = $('.more__body', more);
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
      gsap.from($$('li, p', body), { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.035, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.more').forEach(more => {
    const head = $('.more__head', more);
    head.addEventListener('click', () => setOpen(more, head.getAttribute('aria-expanded') !== 'true'));
  });

  /* ---------- полоса прогресса у слайдера отзывов ---------- */
  const slider = $('.slider');
  const bar = $('.slider__bar');
  if (slider && bar) {
    const update = () => {
      const max = slider.scrollWidth - slider.clientWidth;
      const seen = slider.clientWidth / slider.scrollWidth;
      const p = max > 0 ? seen + (1 - seen) * (slider.scrollLeft / max) : 1;
      bar.style.setProperty('--p', p.toFixed(3));
    };
    slider.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  if (!animate) return;

  // Заголовок секции строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: фото раскрывается, клетка-скатерть раскатывается, ценник повисает ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero .frame', { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut' }, 0.05)
      .from('.hero .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.25)
      .from('.gingham--hero', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.35)
      .from('.leaf', { scale: 0.2, rotation: -50, autoAlpha: 0, duration: 1.2, stagger: 0.15, ease: 'expo.out' }, 0.7)
      // ценник падает на ниточке и за ~1,4 с успокаивается — к 2,4 с кадр «стало» уже неподвижен
      .from('.hang', { y: -70, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 0.4)
      .fromTo('.hang', { rotation: -22 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.45)' }, 1.0)
      .from('.hero__hi', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.45)
      .from(name.chars, { yPercent: 115, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.regalia li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.0)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 1.2)
      .from('.chan-row', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.4);

    // Листья один раз качнулись и замерли: без бесконечных циклов, кадр в рилсе стоит спокойно.
    // Фото без параллакса — при прокрутке голова не уезжает за край рамки.
    gsap.to('.leaf--a', { rotation: 5, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 1, delay: 2 });
    gsap.to('.leaf--b', { rotation: -4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: 1, delay: 2.2 });

    /* ---------- 2. Витрина ---------- */
    gsap.from('.shop > .gingham', { scaleX: 0, duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.shop', start: 'top 92%' } });
    gsap.from('.shop .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.shop .sec-head', start: 'top 84%' } });

    $$('.tag').forEach(tag => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: tag, start: 'top 88%', once: true } });
      tl.from(tag, { y: 54, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from($('.tag__hole', tag), { scale: 0, duration: 0.5, ease: 'back.out(3)' }, 0.3);
      const ver = $('.ver', tag);
      if (ver) tl.from(ver, { scale: 0, rotation: -20, duration: 0.7, ease: 'back.out(2.2)' }, 0.5);
      const old = $('.price__old', tag);
      const val = $('.price__new', tag);
      if (old) {
        // Ценник: старая цена → бордовый штрих → новая поднимается снизу
        tl.from(old, { y: 10, autoAlpha: 0, duration: 0.5 }, 0.3)
          .fromTo($('path', old), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 0.75)
          .to(old, { opacity: 0.7, duration: 0.4 }, 1.1)
          .from(val, { yPercent: 115, duration: 1, ease: 'expo.out' }, 1.05);
      } else if (val) {
        // Без скидки цена просто проявляется
        tl.from(val, { yPercent: 115, duration: 1, ease: 'expo.out' }, 0.4)
          .from($('.price__per', tag), { autoAlpha: 0, x: -8, duration: 0.6 }, 0.7);
      }
    });

    // Одна раскрывашка открывается сама, чтобы было видно, что «что входит» живое
    const demoMore = $$('.more')[1];
    if (demoMore && matchMedia('(max-width: 899px)').matches) {
      ScrollTrigger.create({
        trigger: demoMore, start: 'top 72%', once: true,
        onEnter: () => gsap.delayedCall(0.5, () => setOpen(demoMore, true)),
      });
    }

    /* ---------- 3. Отзывы и каналы ---------- */
    revealLines('.reviews h2', '.reviews .sec-head');
    gsap.from(['.reviews .eyebrow', '.reviews .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.reviews .sec-head', start: 'top 84%' },
    });
    gsap.from('.shot', {
      x: 80, y: 20, autoAlpha: 0, duration: 1.1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.slider', start: 'top 84%' },
    });
    gsap.from('.chan', {
      y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.channels', start: 'top 90%' },
    });

    gsap.from('.all-reviews', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.all-reviews', start: 'top 95%' } });
    // Полоса «скатерти» перед финалом раскатывается от центра
    gsap.from('.gingham--end', { scaleX: 0, duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.gingham--end', start: 'top 95%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
