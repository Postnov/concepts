// Golden Charm — моушн концепта. Фирменная идея — «расклад»: эмблема-солнце в золотом циферблате,
// а карты услуг раздаются из колоды и переворачиваются рубашкой с эмблемой вниз.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Деления циферблата (нужны и без анимации) */
  const ticks = $('.dial-ticks');
  if (ticks) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = 188, r2 = long ? 172 : 180;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', 200 + Math.cos(a) * r1); l.setAttribute('y1', 200 + Math.sin(a) * r1);
      l.setAttribute('x2', 200 + Math.cos(a) * r2); l.setAttribute('y2', 200 + Math.sin(a) * r2);
      ticks.appendChild(l);
    }
  }

  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => ScrollTrigger.refresh();

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: солнце восходит, буквы поднимаются ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { title.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.sun__dial', { rotation: -120, scale: 0.7, autoAlpha: 0, duration: 2, ease: 'expo.out', transformOrigin: '50% 50%' }, 0.1)
      .from('.sun__orbit', { rotation: 90, scale: 0.5, autoAlpha: 0, duration: 1.8, ease: 'expo.out', transformOrigin: '50% 50%' }, 0.2)
      .from('.sun__halo', { scale: 0, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.3)
      .from('.sun__emblem', { scale: 0.35, rotation: -60, autoAlpha: 0, duration: 1.7, ease: 'expo.out' }, 0.35)
      .from('.brand', { y: 14, autoAlpha: 0, letterSpacing: '.6em', duration: 1.1 }, 0.6)
      .from(title.chars, { yPercent: 115, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.7)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__sign', { x: -14, autoAlpha: 0, duration: 0.7 }, 1.25)
      .from('.hero__list li', { y: 20, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.3)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.5)
      .from('.socials li', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 1.7);

    /* Циферблат медленно идёт по кругу, орбита — навстречу, свет за эмблемой дышит */
    gsap.to('.sun__dial', { rotation: 360, duration: 140, ease: 'none', repeat: -1, transformOrigin: '50% 50%', delay: 2 });
    gsap.to('.sun__orbit', { rotation: -360, duration: 70, ease: 'none', repeat: -1, transformOrigin: '50% 50%', delay: 2 });
    gsap.to('.sun__halo', { scale: 1.14, opacity: 0.8, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    /* При прокрутке всё солнце поворачивается, как стрелка */
    gsap.fromTo('.hero .sun', { rotation: 0 }, {
      rotation: 30, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    gsap.utils.toArray('.hero__cta .btn:not(.btn--ghost), .call .btn').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* ---------- 2. Расклад: карты летят из колоды в центре стола и переворачиваются ---------- */
    revealLines('.deck h2', '.deck .sec-head');
    gsap.from('.deck .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.deck .sec-head', start: 'top 82%' } });

    const table = $('.deck__table');
    const cards = $$('.tcard');
    const toPile = (card, axis) => {
      const t = table.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      return axis === 'x'
        ? (t.left + t.width / 2) - (c.left + c.width / 2)
        : (t.top + t.height / 2) - (c.top + c.height / 2) + 30;
    };
    const tilt = [-7, 4, -3, 6];
    gsap.timeline({ scrollTrigger: { trigger: table, start: 'top 72%', invalidateOnRefresh: true } })
      .from(cards, {
        x: (i, el) => toPile(el, 'x'), y: (i, el) => toPile(el, 'y'), rotation: i => tilt[i % 4],
        scale: 0.86, duration: 1.1, stagger: 0.14, ease: 'expo.out',
      })
      .from($$('.tcard__inner'), {
        rotateY: 180, duration: 1.1, stagger: 0.14, ease: 'power3.inOut',
      }, 0.55);

    gsap.timeline({ scrollTrigger: { trigger: '.call', start: 'top 88%' } })
      .fromTo('.call', { clipPath: 'inset(0% 50% 0% 50% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.call__text > *, .call .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.5);
    gsap.from('.deck__all', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.deck__all', start: 'top 94%' } });

    /* ---------- 3. Преимущества: золотые печати проявляются по одной ---------- */
    revealLines('.why h2', '.why .sec-head');
    gsap.from('.why .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.why .sec-head', start: 'top 82%' } });
    const items = $$('.why__item');
    gsap.set(items, { y: 30, autoAlpha: 0 });
    gsap.set($$('.why__mark'), { scale: 0.4, rotation: -90 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
        gsap.to(els.map(el => $('.why__mark', el)), { scale: 1, rotation: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.1 });
      },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out', snap: { v: 50 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      });
    });
    gsap.from('.reviews', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.reviews', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
