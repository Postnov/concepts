// Анна Рябцева — моушн концепта. Фирменное: «кривая роста» (как перцентили в карте малыша), которая вырисовывается
// на старте и ведёт взгляд по услугам линией сопровождения.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- точки на кривой роста: ставим по реальной длине пути (работает и без GSAP) ---------- */
  const path = $('.curve__line');
  const dotsG = $('.curve__dots');
  const NS = 'http://www.w3.org/2000/svg';
  const marks = [['1', .22], ['3', .45], ['6', .56], ['12', .97]];
  if (path && dotsG) {
    const len = path.getTotalLength();
    marks.forEach(([m, t]) => {
      const p = path.getPointAtLength(len * t);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'curve__dot');
      g.innerHTML = '<circle cx="' + p.x + '" cy="' + p.y + '" r="14" fill="#fff6ea" stroke="#f26b0f" stroke-width="2.5"/>' +
        '<text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle">' + m + '</text>';
      dotsG.appendChild(g);
    });
  }

  /* ---------- аккордеон: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) { body.hidden = !open; return refresh(); }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'power3.out', onComplete: () => { body.style.height = ''; refresh(); } });
      gsap.from($$('li, p', body), { x: -12, autoAlpha: 0, duration: 0.45, stagger: 0.04, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, { height: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); } });
    }
  }
  $$('.acc__item').forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.acc__item').forEach(o => o !== item && setOpen(o, false));
      setOpen(item, open);
    });
  });

  if (!animate) { setOpen($('.acc__item'), true, true); return; }

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.0, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 200px 200px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 200px 200px 26px 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__contact', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.0)
      .from('.hero__btns .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1);

    // кривая «вырастает» штрихами: проявляем пунктир маской-обрезкой справа налево
    gsap.fromTo('.curve', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(-10% -10% -10% -10%)', duration: 2.2, ease: 'power2.inOut', delay: 0.5 });
    $$('.curve__dot').forEach((d, i) => gsap.from(d, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', delay: 0.9 + i * 0.4 }));

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });
    gsap.to('.arch img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- услуги ---------- */
    revealLines('.svc h2', '.svc .sec-head');
    gsap.from('.svc .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.svc .sec-head', start: 'top 82%' } });
    gsap.to('.svc__rail span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.svc__list', start: 'top 70%', end: 'bottom 70%', scrub: true } });
    $$('.card').forEach(card => {
      gsap.from(card, { y: 44, autoAlpha: 0, duration: 0.95, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      gsap.from($$('.card__list li', card), { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.07, delay: 0.25, scrollTrigger: { trigger: card, start: 'top 88%' } });
      const price = $('.card__price', card);
      if (price) gsap.from(price, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', delay: 0.15, scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
    gsap.from('.svc__note, .svc .btn--wide', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.svc__note', start: 'top 92%' } });

    /* ---------- вопросы ---------- */
    revealLines('.faq h2', '.faq .sec-head');
    gsap.from('.faq .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.faq .sec-head', start: 'top 82%' } });
    const items = $$('.acc__item');
    gsap.set(items, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, { start: 'top 92%', once: true, onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.08, ease: 'power3.out' }) });
    ScrollTrigger.create({ trigger: '.acc', start: 'top 65%', once: true, onEnter: () => gsap.delayedCall(0.5, () => setOpen(items[0], true)) });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', refresh, { once: true });
  });
})();
