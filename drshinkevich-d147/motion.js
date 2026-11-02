// Анна Шинкевич — моушн концепта. Фирменная идея — её же фраза «Со мной понятно и нестрашно», рассказанная движением:
// «понятно» собирается из разлетевшихся букв в ясное слово, а «страшно» мелко дрожит, пока мягко не придёт «не» —
// тогда дрожь стихает, слово теплеет и подчёркивается. Сердечки её Taplink рисуются двумя половинками навстречу друг другу.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон «кому подойдёт»: работает и без GSAP ---------- */
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
      gsap.from($$('li', body), { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.04, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
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

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  // Сердце из двух половинок: штрихи идут от нижнего кончика навстречу, потом заливка
  function heartTimeline(svg) {
    const halves = $$('.heart__half', svg);
    halves.forEach(p => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
    return gsap.timeline()
      .to(halves, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
      .fromTo($('.heart__fill', svg), { opacity: 0, scale: 0.6, transformOrigin: '50% 60%' }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, '-=0.15');
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const clear = SplitText.create('.tg-clear', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const scary = $('.tg-scary');
    const petal = $('.petal');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); clear.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 0.1)
      .from(name.chars, { yPercent: 112, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.15)
      .from('.hero__role', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.55)
      // Фото открывается мягким кругом из точки у её лица
      .fromTo(petal, { clipPath: 'circle(0% at 66% 38%)' }, { clipPath: 'circle(120% at 66% 38%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.petal img', { scale: 1.28, duration: 2, ease: 'expo.out' }, 0.25)
      .from('.hero__chip', { y: 14, autoAlpha: 0, duration: 0.6 }, 1.15)
      // «Со мной понятно»: буквы приходят сверху и снизу вразнобой и встают в ясное слово
      .from('.tg-a', { y: 16, autoAlpha: 0, duration: 0.6 }, 0.55)
      .from(clear.chars, {
        yPercent: i => (i % 2 ? -115 : 115), duration: 0.85, ease: 'expo.out',
        stagger: { each: 0.06, from: 'random' },
      }, 0.65)
      // «и страшно» → «и нестрашно»
      .from('.tg-b', { y: 16, autoAlpha: 0, duration: 0.5 }, 0.9)
      .fromTo(scary, { autoAlpha: 0, color: '#8d8a94' }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, 0.95);

    // Дрожь: короткие случайные сдвиги, после прихода «не» размах гаснет до нуля
    const rnd = () => Math.random() * 2 - 1;
    const steps = 20;
    const tremble = gsap.timeline();
    for (let i = 0; i < steps; i++) {
      const amp = i < 11 ? 1 : Math.max(0, 1 - (i - 10) / 9);
      tremble.to(scary, { x: rnd() * 1.7 * amp, y: rnd() * 1.1 * amp, rotation: rnd() * 1.6 * amp, duration: 0.05, ease: 'none' });
    }
    tremble.to(scary, { x: 0, y: 0, rotation: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
    intro
      .add(tremble, 0.98)
      .from('.tg-ne', { x: -18, autoAlpha: 0, duration: 0.55, ease: 'power3.out' }, 1.52)
      .to(scary, { color: '#7c5872', duration: 0.7, ease: 'power1.out', clearProps: 'color' }, 1.6)
      .from('.tg-line', { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, 1.85)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.2)
      .from('.hero__lead', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.35)
      .from('.pills li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.55 }, 1.45);

    /* ---------- 2. Что вы получите ---------- */
    revealLines('.gain h2', '.gain .sec-head');
    gsap.from('.gain .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.gain .sec-head', start: 'top 84%' } });
    gsap.from('.gain__title .ava', {
      scale: 0.6, autoAlpha: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.gain .sec-head', start: 'top 84%' },
    });
    $$('.gain__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 86%' } })
        .from(item, { y: 40, autoAlpha: 0, duration: 0.95, ease: 'expo.out' })
        .from($('p', item), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.15)
        .add(heartTimeline($('.heart', item)), 0.2);
    });
    gsap.from('.fit__note', { x: -16, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.fit', start: 'top 86%' } });
    gsap.from('.acc__item', {
      y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.acc', start: 'top 88%' },
    });
    gsap.from('.acc__mark', { scale: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(2)', scrollTrigger: { trigger: '.acc', start: 'top 86%' } });
    // Первый пункт раскрывается сам, чтобы было видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 64%', once: true,
      onEnter: () => gsap.delayedCall(0.5, () => setOpen($('.acc__item'), true)),
    });
    gsap.from('.fit__disclaimer', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.fit__disclaimer', start: 'top 92%' } });

    /* ---------- 3. Стоимость ---------- */
    revealLines('.price h2', '.price .sec-head');
    gsap.from('.price .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.price .sec-head', start: 'top 84%' } });
    // Строки прайса: название, затем точки-отточие тянутся к цене; цена появляется целиком
    $$('.row').forEach(row => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } })
        .from($('.row__name', row), { x: -14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
        .from($('.row__dots', row), { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15)
        .from($('.row__price', row), { y: 10, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.6);
    });
    gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 86%' } })
      .fromTo('.feature', { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.feature__halo', { scale: 0.3, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.4)
      .from(['.feature__meta', '.feature__title'], { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.55)
      .from('.feature__price', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.8);
    gsap.from('.price__cta .btn', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.price__cta', start: 'top 92%' } });
    gsap.from('.terms p', { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1, scrollTrigger: { trigger: '.terms', start: 'top 94%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
