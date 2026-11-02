// Дина Кадис — моушн концепта. Фирменная идея: «кольца активности» — её цифры закрываются кольцами, как в фитнес-трекере,
// а 78 тренировок канала загораются отметками по кругу.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- 78 отметок по кругу счётчика (работают и без GSAP: просто горят все) ---------- */
  const ticksG = $('.meter__ticks');
  const TICKS = 78;
  for (let i = 0; i < TICKS; i++) {
    const a = (i / TICKS) * Math.PI * 2;
    const l = document.createElementNS(NS, 'line');
    const r1 = 86, r2 = 92;
    l.setAttribute('x1', 120 + Math.cos(a) * r1); l.setAttribute('y1', 120 + Math.sin(a) * r1);
    l.setAttribute('x2', 120 + Math.cos(a) * r2); l.setAttribute('y2', 120 + Math.sin(a) * r2);
    ticksG.appendChild(l);
  }

  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  if (!animate) {
    $$('.meter__ticks line').forEach(l => (l.style.stroke = 'rgba(238, 170, 140, .9)'));
    return;
  }

  // Число с пробелом по тысячам
  const fmt = MotionBase.money;
  function countUp(el, opts = {}) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = fmt(0);
    return gsap.to(o, {
      v: to, duration: opts.duration || 1.6, ease: opts.ease || 'power2.out', delay: opts.delay || 0,
      scrollTrigger: opts.trigger ? { trigger: opts.trigger, start: opts.start || 'top 88%', once: true } : undefined,
      onUpdate: () => { el.textContent = fmt(o.v); if (opts.onUpdate) opts.onUpdate(o.v / to); },
      onComplete: () => { el.textContent = fmt(to); },
    });
  }

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const lines = $$('.hero__line').map(el => SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { lines.forEach(s => s.revert()); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(lines[0].chars, { yPercent: 110, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.25)
      .from(lines[1].chars, { yPercent: 110, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.4)
      .fromTo('.hero__script', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0.9)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut' }, 0.3)
      .from('.hero__photo .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.45)
      .from('.rings', { scale: 0.6, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.9)
      // Кольца закрываются по очереди — как дневная активность
      .from('.ring', { strokeDashoffset: 100, duration: 1.8, stagger: 0.18, ease: 'power3.inOut' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.stat', { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);
    $$('.hero [data-count]').forEach((el, i) => intro.add(countUp(el, { duration: 1.6, delay: 0 }), 1.2 + i * 0.12));

    /* Кольца тихо «дышат» — пульс тренировки */
    gsap.to('.rings', { scale: 1.035, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });

    /* Блик на главных кнопках */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    /* Параллакс: фото уходит чуть медленнее, кольца — быстрее */
    gsap.to('.hero__photo .frame img', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.rings', { y: -40, ease: 'none', scrollTrigger: { trigger: '.hero__photo', start: 'top 40%', end: 'bottom top', scrub: true } });

    /* ---------- 2. Оффер: 78 отметок загораются по кругу вместе со счётчиком ---------- */
    revealLines('.offer h2', '.offer .sec-head');
    gsap.from('.offer .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 82%' } });
    gsap.from('.offer', { borderRadius: '0px 0px 0 0', duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.offer', start: 'top 95%' } });

    const ticks = $$('.meter__ticks line');
    const meterTl = gsap.timeline({ scrollTrigger: { trigger: '.meter', start: 'top 78%', once: true } });
    meterTl
      .from('.meter', { scale: 0.85, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0)
      .fromTo('.meter__bar', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.15)
      .to(ticks, { stroke: 'rgba(238, 170, 140, .95)', duration: 0.2, stagger: 2.2 / TICKS, ease: 'none' }, 0.15);
    const meterNum = $('.meter__num [data-count]');
    meterNum.textContent = '0';
    meterTl.add(countUp(meterNum, { duration: 2.2, ease: 'power2.inOut' }), 0.15);

    gsap.from('.deal', { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.deal', start: 'top 86%' } });
    gsap.from('.perks li', { x: -18, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.perks', start: 'top 88%' } });
    // Старая цена зачёркивается, новая проявляется целиком
    const priceTl = gsap.timeline({ scrollTrigger: { trigger: '.deal__buy', start: 'top 90%', once: true } });
    priceTl.fromTo('.deal .price__old', { '--strike': 0 }, { '--strike': 1, duration: 0.6, ease: 'power2.inOut' }, 0);
    priceTl.from('.deal .price__now', { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.2);

    /* ---------- 3. Идеальные ножки ---------- */
    revealLines('.legs h2', '.legs .sec-head');
    gsap.from('.legs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.legs .sec-head', start: 'top 82%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.legs__photo', start: 'top 82%' } })
      .fromTo('.legs__photo .frame', { clipPath: 'inset(0% 100% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.legs__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.stamp', { scale: 0, rotate: -40, duration: 1, ease: 'back.out(1.6)' }, 0.8);
    gsap.from('.legs__label', { clipPath: 'inset(0% 100% 0% 0%)', duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.legs__side', start: 'top 85%' } });
    // Пункты отмечаются как сделанные подходы: номер «прокручивается», строка выезжает
    $$('.helps li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } })
        .from(li, { x: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
        .from($('.helps__n', li), { yPercent: 100, autoAlpha: 0, duration: 0.6, ease: 'expo.out' }, 0.15);
    });
    gsap.from(['.legs__fit', '.gift'], { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.legs__fit', start: 'top 90%' } });
    gsap.from('.legs .price__now', { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.legs__buy', start: 'top 88%', once: true } });
    gsap.from('.legs__buy .btn', { y: 18, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.legs__buy', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
