(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // ── аккордеон услуг ──
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
      gsap.from($$('.acc__inner > *', body), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.05, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.45, ease: 'power3.inOut',
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

  // ── фирменное: всё, что висит на штанге, раскачивается от скорости прокрутки и затихает ──
  const swaying = [];
  let settleTimer = 0;
  function swayOn(els, max = 3.6) {
    els.forEach((el, i) => swaying.push({ el, k: i % 2 ? -0.85 : 1, max }));
  }
  ScrollTrigger.create({
    onUpdate: self => {
      const v = self.getVelocity();
      if (Math.abs(v) < 120) return;
      swaying.forEach(({ el, k, max }) => {
        const deg = gsap.utils.clamp(-max, max, (v / -300) * k);
        gsap.to(el, { rotation: deg, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
      });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        swaying.forEach(({ el }) => gsap.to(el, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' }));
      }, 120);
    },
  });

  // подъём строк заголовка
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    // ── hero ──
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const hangs = $$('.rack .hang');

    gsap.set(hangs, { y: -90, autoAlpha: 0 });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); swayOn(hangs, 3.2); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.85)
      .from('.rack__rail', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.45)
      .to(hangs, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.16, ease: 'power3.out' }, 1.0)
      .fromTo(hangs, { rotation: i => (i % 2 ? -11 : 11) }, { rotation: 0, duration: 2.8, stagger: 0.16, ease: 'elastic.out(1, 0.26)' }, 1.0)
      .from('.hang__photo img', { scale: 1.3, duration: 1.8, stagger: 0.16, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.95 }, 1.5)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.75);

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    // ── услуги ──
    revealLines('.services h2', '.services .sec-head');
    gsap.from(['.services .eyebrow', '.services .sec-link'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' },
    });
    const items = $$('.acc__item');
    gsap.set(items, { y: 28, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.55, () => setOpen(items[0], true)),
    });

    // ── стоимость: бирки на штанге ──
    revealLines('.price h2', '.price .sec-head');
    gsap.from('.price .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.price .sec-head', start: 'top 84%' } });
    $$('.price__ph').forEach((ph, i) => {
      gsap.fromTo(ph, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', delay: i * 0.15,
        scrollTrigger: { trigger: '.price__photos', start: 'top 86%' },
      });
      gsap.from($('img', ph), { scale: 1.28, duration: 1.8, ease: 'expo.out', delay: i * 0.15, scrollTrigger: { trigger: '.price__photos', start: 'top 86%' } });
    });
    const tags = $$('.tag');
    gsap.set(tags, { autoAlpha: 0, y: -34 });
    ScrollTrigger.batch($$('.tag-cell'), {
      start: 'top 90%', once: true,
      onEnter: cells => {
        const els = cells.map(c => $('.tag', c));
        gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' });
        gsap.fromTo(els, { rotation: i => (i % 2 ? -9 : 9) }, { rotation: 0, duration: 2.6, stagger: 0.12, ease: 'elastic.out(1, 0.28)' });
      },
    });
    swayOn(tags, 3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
