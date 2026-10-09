// Мария Русанова — моушн концепта.
// Фирменная идея — «завершённый гештальт»: тонкий круг вокруг арки с фото рисуется сам, по его краю идёт солнце,
// но круг остаётся незамкнутым; при прокрутке он замыкается и мягко вспыхивает. Тот же круг закрывается
// у каждого запроса клиентов и вокруг солнца на морском снимке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- FAQ-аккордеон: работает и без GSAP ---------- */
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
  const accItems = $$('.acc__item');
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

  // Длина линии нормирована pathLength=1: смещение 1 — пусто, 0 — круг замкнут
  const dash = (el, v) => el.setAttribute('stroke-dashoffset', String(v));

  // Заголовок строками из-под маски; split снимаем после анимации
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Рукописная подпись «пишется» слева направо
  const writeFrom = { clipPath: 'inset(-40% 100% -40% -6%)' };
  const writeTo = { clipPath: 'inset(-40% -6% -40% -6%)', duration: 1.7, ease: 'power2.inOut', clearProps: 'clipPath' };
  function writeOn(el, trigger) {
    gsap.fromTo(el, writeFrom, { ...writeTo, scrollTrigger: { trigger: trigger || el, start: 'top 86%' } });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const arch = $('.arch');
    const archImg = $('.arch img');

    // Круг-гештальт: прогресс = вступление (до 0.8) + прокрутка (оставшиеся 0.2)
    const line = $('.halo__line');
    const sun = $('.halo__sun');
    const pulse = $('.halo__pulse');
    const R = 49.4;
    const START = 200; // старт внизу слева (градусы от верха по часовой): солнце «восходит» над аркой, разрыв остаётся внизу
    const halo = { intro: 0, scroll: 0 };
    let closed = false;
    const drawHalo = () => {
      const p = Math.min(1, halo.intro + halo.scroll);
      dash(line, 1 - p);
      const a = (START + p * 360 - 90) * Math.PI / 180;
      sun.style.transform = `translate(${50 + R * Math.cos(a)}px, ${50 + R * Math.sin(a)}px)`;
      const now = p > 0.998;
      if (now === closed) return;
      closed = now;
      if (closed) {
        gsap.fromTo(pulse, { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.1, svgOrigin: '50 50', duration: 1.5, ease: 'power2.out', overwrite: true });
        gsap.fromTo(line, { stroke: '#efc47e' }, { stroke: '#c88a4c', duration: 1.6, ease: 'power1.out', overwrite: true });
      }
    };
    drawHalo();

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .fromTo(archImg, { scale: 1.35 }, { scale: 1.1, duration: 2.1, ease: 'expo.out' }, 0.3)
      .from('.halo__track', { opacity: 0, duration: 1.2, ease: 'power1.out' }, 0.7)
      .from(sun, { opacity: 0, duration: 0.6 }, 0.8)
      .to(halo, { intro: 0.8, duration: 2, ease: 'power2.inOut', onUpdate: drawHalo }, 0.8)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .fromTo('.hero__script', writeFrom, writeTo, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.35)
      .from('.stats li', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.5);

    // Прокрутка замыкает круг, пока его низ ещё на экране
    gsap.to(halo, {
      scroll: 0.2, ease: 'none', onUpdate: drawHalo,
      scrollTrigger: { start: 0, end: () => Math.round(window.innerHeight * 0.32), scrub: 0.6 },
    });
    // Солнце чуть «дышит»
    gsap.to('.halo__sun circle:first-child', { scale: 1.35, transformOrigin: '50% 50%', duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
    // Лёгкий параллакс портрета
    gsap.to(archImg, {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Счётчики: часы практики и цена
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: to > 1000 ? 1.6 : 1.8, ease: 'power2.out', snap: { v: to > 1000 ? 100 : 1 },
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    /* ---------- 2. Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 84%' } });
    writeOn('.topics .sec-script', '.topics .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.disc', start: 'top 82%' } })
      .fromTo('.disc__img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.disc__img img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.15)
      .fromTo('.disc', { rotate: -6 }, { rotate: 0, duration: 1.8, ease: 'expo.out' }, 0);
    revealLines('.topics__lead');
    gsap.from('.topics__text', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.topics__text', start: 'top 88%' } });

    // Каждый запрос: строка поднимается, кружок рисуется с разрывом и замыкается
    const rows = $$('.req__item');
    gsap.set(rows, { y: 22, autoAlpha: 0 });
    $$('.ring__line').forEach(l => dash(l, 1));
    ScrollTrigger.batch(rows, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' });
        els.forEach((row, i) => {
          const ring = $('.ring__line', row);
          const p = { v: 0 };
          gsap.timeline({ delay: 0.2 + i * 0.09 })
            .to(p, { v: 0.72, duration: 0.6, ease: 'power2.out', onUpdate: () => dash(ring, 1 - p.v) })
            .to(p, { v: 1, duration: 0.7, ease: 'power3.inOut', onUpdate: () => dash(ring, 1 - p.v) }, '+=0.25');
        });
      },
    });

    /* ---------- 3. Работа со мной ---------- */
    revealLines('.work h2', '.work .sec-head');
    gsap.from('.work .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.work .sec-head', start: 'top 84%' } });
    writeOn('.work .sec-script', '.work .sec-head');

    const sunLine = $('.sunring__line');
    dash(sunLine, 1);
    const sp = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '.work__photo', start: 'top 80%' } })
      .fromTo('.work__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
      .fromTo('.work__photo img', { scale: 1.3 }, { scale: 1.06, duration: 2, ease: 'expo.out' }, 0.15)
      .to(sp, { v: 0.78, duration: 1, ease: 'power2.out', onUpdate: () => dash(sunLine, 1 - sp.v) }, 1.0)
      .to(sp, { v: 1, duration: 0.8, ease: 'power3.inOut', onUpdate: () => dash(sunLine, 1 - sp.v) }, 2.3);

    gsap.from('.offer', {
      y: 46, rotateX: -10, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.offer', start: 'top 88%' },
    });
    gsap.from(['.contacts__title', '.chip'], {
      y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.contacts', start: 'top 92%' },
    });

    revealLines('.faq__title', '.faq__head');
    writeOn('.faq__script', '.faq__head');
    gsap.from('.faq .acc__item', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.faq .acc', start: 'top 88%' },
    });
    ScrollTrigger.create({
      trigger: '.faq .acc', start: 'top 64%', once: true,
      onEnter: () => gsap.delayedCall(0.5, () => setOpen(accItems[0], true)),
    });

    gsap.fromTo('.invest__bg img', { scale: 1.18 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.invest', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    revealLines('.invest__quote');
    writeOn('.invest__script');
    gsap.from('.invest .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.invest .btn', start: 'top 94%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
