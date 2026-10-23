// Лилия Геппа — моушн концепта.
// Фирменная идея: две «гормональные» волны проходят за её портретом и мягко колышутся;
// при прокрутке их размах гаснет, и линии сходятся в одну ровную — баланс. Тот же мотив — в метках и разделителе секций.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- волны: путь считается и без GSAP (статичная картинка при reduced motion) ---------- */
  const W = { svg: $('.waves'), a: $('.wave--a'), b: $('.wave--b'), w: 0, h: 0, phase: 0.6, amp: 1 };
  // y(t) — сумма двух синусоид; вторая линия — зеркальная и чуть сдвинута по фазе, поэтому линии переплетаются
  function wavePath(w, h, phase, amp, sign, shift) {
    const N = 80;
    let d = '';
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const s = Math.sin(t * Math.PI * 2 * 1.1 + phase + shift) + 0.2 * Math.sin(t * Math.PI * 2 * 2.4 + phase * 1.7 + 1.3 + shift);
      const y = h / 2 + sign * s * amp * h * 0.33;
      d += (i ? 'L' : 'M') + (t * w).toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }
  function drawWaves() {
    if (!W.svg) return;
    W.a.setAttribute('d', wavePath(W.w, W.h, W.phase, W.amp, 1, 0));
    W.b.setAttribute('d', wavePath(W.w, W.h, W.phase, W.amp, -1, 0.55));
  }
  function sizeWaves() {
    if (!W.svg) return;
    const r = W.svg.getBoundingClientRect();
    W.w = Math.max(1, Math.round(r.width));
    W.h = Math.max(1, Math.round(r.height));
    W.svg.setAttribute('viewBox', `0 0 ${W.w} ${W.h}`);
    drawWaves();
  }

  // Разделитель перед «Приёмом»: волна, которая к правому краю затухает в ровную линию
  const rule = $('.rule');
  function drawRule() {
    if (!rule) return;
    const r = rule.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    rule.setAttribute('viewBox', `0 0 ${w} ${h}`);
    let d = '';
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const y = h / 2 + Math.sin(t * Math.PI * 2 * 2.2) * h * 0.42 * Math.pow(1 - t, 1.6);
      d += (i ? 'L' : 'M') + (t * w).toFixed(1) + ' ' + y.toFixed(1);
    }
    $('.rule__path').setAttribute('d', d);
  }

  sizeWaves();
  drawRule();
  let rw = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === rw) return; // мобильная адресная строка меняет только высоту
    rw = window.innerWidth;
    sizeWaves();
    drawRule();
  });

  /* ---------- аккордеон запросов: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
    if (!body || head.getAttribute('aria-expanded') === String(open)) return;
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
      gsap.from($$('li, p', body), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.03, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  const accItems = $$('.acc__item').filter(i => $('.acc__body', i));
  accItems.forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      accItems.forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen(accItems[0], true, true);
    return;
  }

  // Строки из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(), ...vars,
    });
  }
  // Метка-волна у подзаголовка прорисовывается слева направо
  function drawMark(el, trigger) {
    gsap.fromTo($('path', el), { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut',
      scrollTrigger: { trigger, start: 'top 85%' },
    });
  }

  MotionBase.ready(() => {
    sizeWaves(); // шрифты загружены — размеры окончательные
    drawRule();

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const portrait = $('.hero__portrait');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => name.revert(),
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(portrait, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 6 },
        { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.5, ease: 'expo.out', clearProps: 'clipPath' }, 0.15)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.35)
      .fromTo('.wave', { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.4, stagger: 0.25, ease: 'power2.inOut', onComplete: function () { gsap.set(this.targets(), { strokeDasharray: 'none' }); } }, 0.55)
      .from('.hero__cta', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.05)
      .from('.hero__motto span', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0);

    // Волны дышат, пока hero на экране
    const tick = (time, delta) => { W.phase += delta * 0.00042; drawWaves(); };
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: self => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
    });
    gsap.ticker.add(tick);
    // При прокрутке размах гаснет — две линии сходятся в одну
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true,
      onUpdate: self => { W.amp = 1 - 0.94 * gsap.parseEase('power1.inOut')(self.progress); drawWaves(); },
    });
    // Портрет чуть отстаёт от прокрутки и уходит за бордовую ленту
    gsap.to(portrait, { y: 46, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__name', { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('main .btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    /* Факты: цифры появляются целиком, разделители прорастают сверху */
    gsap.timeline({ scrollTrigger: { trigger: '.facts', start: 'top 94%' } })
      .from('.fact', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
      .fromTo('.fact + .fact', { '--grow': 0 }, { '--grow': 1, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.2);

    /* ---------- цитата ---------- */
    revealLines('.statement__text', '.statement', { stagger: 0.12, duration: 1.2 });
    drawMark($('.statement .mark'), '.statement__sub');
    gsap.from('.statement__sub span', { y: 14, autoAlpha: 0, duration: 0.9, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: '.statement__sub', start: 'top 90%' } });

    /* ---------- 2. Запросы ---------- */
    drawMark($('.req .mark'), '.req .sec-head');
    gsap.from('.req .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.req .sec-head', start: 'top 85%' } });
    revealLines('.req h2', '.req .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.req__photo', start: 'top 88%' } })
      .fromTo('.frame--lens', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.frame--lens img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1);
    const rows = $$('.acc__item');
    gsap.set(rows, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.07, ease: 'power3.out' }),
    });
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 65%', once: true,
      onEnter: () => gsap.delayedCall(0.5, () => setOpen(accItems[0], true)),
    });

    /* ---------- 3. Приём ---------- */
    gsap.fromTo('.rule__path', { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.rule', start: 'top 90%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.visit__photo', start: 'top 85%' } })
      .fromTo('.frame--arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.frame--arch img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15)
      .from('.visit__badge', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.9);
    drawMark($('.visit .mark'), '.visit .sec-head');
    gsap.from('.visit .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.visit .sec-head', start: 'top 86%' } });
    revealLines('.visit h2', '.visit .sec-head');
    gsap.from('.services li', { x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.services', start: 'top 88%' } });
    gsap.from(['.address', '.visit__main .btn'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.address', start: 'top 92%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.online', start: 'top 88%' } })
      .from('.online', { y: 46, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.online > *', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.25);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => { sizeWaves(); drawRule(); refresh(); }, { once: true });
  });
})();
