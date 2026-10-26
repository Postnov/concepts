// Академия доктора Маматова — моушн концепта.
// Фирменная идея «живая система»: шестигранник логотипа и ветви-сосуды прорастают за фигурой доктора,
// по ветвям бегут импульсы, а ниже тот же ствол растёт по прокрутке и зажигает узлы программ.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  // Ствол программ заканчивается ровно на последнем узле (высота карточек разная) — и со статикой, и с моушном
  const fitTrunk = () => {
    const trunk = $('.tree__trunk'), nodes = $$('.prog__node');
    if (!trunk || !nodes.length) return;
    const box = trunk.parentElement.getBoundingClientRect();
    const last = nodes[nodes.length - 1].getBoundingClientRect();
    trunk.style.bottom = `${Math.max(0, box.bottom - (last.top + last.height / 2))}px`;
  };
  fitTrunk();
  addEventListener('resize', fitTrunk);
  addEventListener('load', fitTrunk, { once: true });
  if (document.fonts) document.fonts.ready.then(fitTrunk);

  if (!animate) return;

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  // Рисование линии: pathLength="100", штрих 100 — от 100 к 0
  const draw = (targets, vars) => gsap.fromTo(targets, { strokeDasharray: 100, strokeDashoffset: 100 }, { strokeDashoffset: 0, ...vars });

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const t1 = SplitText.create('.hero__t1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => t1.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__who > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.15)
      .from(t1.chars, { yPercent: 112, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.25)
      .from(['.hero__t2', '.hero__t3'], { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.85 }, 0.62)
      .add(draw('.system__hex', { duration: 1.7, ease: 'power2.inOut', stagger: 0.25 }), 0.2)
      .add(draw('.system__veins path', { duration: 1.4, ease: 'power2.out', stagger: 0.07 }), 0.75)
      .from('.system__nodes circle', { scale: 0, transformOrigin: '50% 50%', stagger: 0.05, duration: 0.5, ease: 'back.out(3)' }, 1.45)
      .from('.hero__figure', { yPercent: 9, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.35)
      .from('.hero__mission', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15)
      .from('.hero__note', { autoAlpha: 0, duration: 0.6 }, 1.4);

    /* Импульсы: светлый штрих бежит от корня к кончику ветви, узел на кончике вспыхивает кораллом */
    const nodes = $$('.system__nodes circle');
    $$('.system__pulses path').forEach((p, i) => {
      gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 2.1 + i * 0.62 })
        .set(p, { strokeDasharray: '9 100', strokeDashoffset: 9, opacity: 1 })
        .to(p, { strokeDashoffset: -100, duration: 2.1, ease: 'sine.inOut' })
        .to(nodes[i], { scale: 2.1, fill: '#ff7a50', transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.out' }, '-=0.35')
        .to(nodes[i], { scale: 1, fill: '#74d3c8', duration: 0.7, ease: 'power2.inOut' })
        .set(p, { opacity: 0 });
    });

    /* Лёгкий параллакс фигуры и системы при уходе hero */
    gsap.to('.hero__figure', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.system', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Программы: ствол растёт по прокрутке, узлы зажигаются ---------- */
    revealLines('.progs h2', '.progs .sec-head');
    gsap.from('.progs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.progs .sec-head', start: 'top 84%' } });

    const trunk = $('.tree__trunk');
    const growST = { trigger: trunk, start: 'top 70%', end: 'bottom 70%', scrub: 0.6, invalidateOnRefresh: true };
    gsap.fromTo('.tree__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: growST });
    gsap.fromTo('.tree__tip', { y: 0 }, { y: () => trunk.offsetHeight, ease: 'none', scrollTrigger: { ...growST } });

    const wide = matchMedia('(min-width: 900px)').matches;
    $$('.prog').forEach((li, i) => {
      ScrollTrigger.create({
        trigger: $('.prog__node', li), start: 'top 70%',
        onEnter: () => li.classList.add('is-lit'), onLeaveBack: () => li.classList.remove('is-lit'),
      });
      const dir = wide && i % 2 === 0 ? -1 : 1;
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 86%' } })
        .from($('.prog__card', li), { x: 44 * dir, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from($$('.prog__num, .prog__title, .prog__desc, .prog__go', li), { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out' }, 0.15);
    });

    /* ---------- 3. Основатель ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.founder__photo', start: 'top 78%' } })
      .add(draw('.founder__ring path', { duration: 1.6, ease: 'power2.inOut', stagger: 0.2 }), 0)
      .from('.hexframe', { scale: 0.86, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.hexframe img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.founder__years', { y: 24, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.7);
    revealLines('.founder h2', '.founder .sec-head');
    gsap.from('.founder .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.founder .sec-head', start: 'top 84%' } });
    gsap.from('.founder__lead', { y: 18, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.founder__lead', start: 'top 88%' } });

    /* «Он поможет»: панель поднимается, ветви в углу прорастают, пункты по одному */
    gsap.from('.helps', { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.helps', start: 'top 86%' } });
    draw('.helps__veins path', { duration: 1.6, ease: 'power2.out', stagger: 0.08, scrollTrigger: { trigger: '.helps', start: 'top 70%' } });
    gsap.from('.helps__title', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.helps', start: 'top 76%' } });
    gsap.set('.helps__list li', { x: -18, autoAlpha: 0 });
    ScrollTrigger.batch('.helps__list li', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.75, stagger: 0.09, ease: 'power3.out' }),
    });
    revealLines('.helps__punch');

    /* Тест: доктор выходит слева и «показывает» на кнопку */
    gsap.timeline({ scrollTrigger: { trigger: '.test', start: 'top 80%' } })
      .from('.test__kicker', { y: 16, autoAlpha: 0, duration: 0.8 }, 0)
      .from('.test__photo img', { x: -40, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
      .from('.test__cta .btn', { x: -16, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.6);
    revealLines('.test__title', '.test');

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    fitTrunk();
    window.addEventListener('load', () => { fitTrunk(); refresh(); }, { once: true });
  });
})();
