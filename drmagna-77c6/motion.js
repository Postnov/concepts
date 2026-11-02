// Dr.MAGNA — моушн концепта. Идея «лифтинг»: линии контура провисают и подтягиваются, как кожа после RF-лифтинга.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  /* Линии контура: s = степень провисания (1 — висят, 0 — подтянуты) */
  const paths = $$('.lift path');
  const sag = { s: 1 };
  const draw = () => paths.forEach((p, i) => {
    const y = +p.dataset.y;
    const amp = 6 + i * 4.2;                    // нижние линии провисают сильнее
    const drift = (i % 2 ? -1 : 1) * 40 * sag.s; // и слегка «плывут» в стороны
    p.setAttribute('d', `M0 ${y + sag.s * amp * 0.35} Q${200 + drift} ${y + sag.s * amp * 2} 400 ${y + sag.s * amp * 0.35}`);
  });

  MotionBase.ready(() => {
    draw();
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .to(sag, { s: 0, duration: 2.6, ease: 'power3.inOut', onUpdate: draw }, 0.2)
      .from('.lift path', { autoAlpha: 0, stagger: 0.05, duration: 0.8 }, 0.1)
      .from('.medal', { scale: 0.7, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.3)
      .from('.medal img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.45)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.pills li', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.1)
      .from('.hero__btns .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    /* Лёгкий «подъём» линий при прокрутке героя */
    gsap.to('.lift', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--ghost-light):not(.btn--light)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* Заголовки секций строками из-под маски */
    $$('.sec-head').forEach(head => {
      const h = $('h2', head);
      const split = SplitText.create(h, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 84%' }, onComplete: () => split.revert() });
      tl.from($('.eyebrow', head), { y: 14, autoAlpha: 0, duration: 0.7 }, 0)
        .from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out' }, 0.05);
      const sub = $('.sec-sub', head);
      if (sub) tl.from(sub, { y: 14, autoAlpha: 0, duration: 0.7 }, 0.4);
    });

    /* Акции: строки подтягиваются снизу, зачёркнутая цена перечёркивается, новая появляется целиком */
    $$('.deal').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 92%' } });
      tl.from(row, { y: 34, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0);
      const old = $('s', row);
      if (old) {
        tl.fromTo(old, { '--strike': 0 }, { '--strike': 1, duration: 0.6, ease: 'power2.inOut' }, 0.45);
        tl.from($('b', row), { y: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
      }
    });
    gsap.from('.fine', { autoAlpha: 0, y: 10, duration: 0.8, scrollTrigger: { trigger: '.fine', start: 'top 94%' } });

    /* О клинике: пункты по очереди, номера чуть позже */
    const wi = $$('.why__item');
    if (wi.length) {
      gsap.set(wi, { x: -18, autoAlpha: 0 });
      ScrollTrigger.batch(wi, { start: 'top 90%', once: true, onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }) });
    }

    /* Консультация: тёмная карточка раскрывается из центра */
    gsap.fromTo('.consult__box', { clipPath: 'inset(8% 6% 8% 6% round 40px)', autoAlpha: 0 }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', autoAlpha: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.consult__box', start: 'top 86%' } });
    gsap.from('.consult__btns .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, scrollTrigger: { trigger: '.consult__btns', start: 'top 92%' } });

    /* Адрес */
    gsap.from('.addr', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.addr', start: 'top 90%' } });
    gsap.from('.addr__pin', { y: -30, autoAlpha: 0, duration: 0.9, ease: 'bounce.out', scrollTrigger: { trigger: '.addr', start: 'top 85%' } });
    gsap.from('.where__note', { autoAlpha: 0, y: 10, duration: 0.8, scrollTrigger: { trigger: '.where__note', start: 'top 94%' } });

    const end = $('.concept-end > *') ? '.concept-end > *' : null;
    if (end) gsap.from(end, { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    gsap.from('.foot > *', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.foot', start: 'top 92%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
