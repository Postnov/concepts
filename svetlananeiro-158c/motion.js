// Светлана Заболотная — моушн концепта. Фирменная идея: «нервный импульс» — серебряная искра бежит по линии
// с пиком потенциала действия, а в специализации импульс спускается по «аксону» и зажигает пункты по очереди.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, все пункты «горят»
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

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
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const goal = SplitText.create('.hero__goal', { type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { last.revert(); goal.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.25)
      .from('.hero__tag', { y: -10, autoAlpha: 0, duration: 0.6 }, 1.0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.55 }, 0.55)
      // Имя «пишется» слева направо, как каллиграфия её баннера
      .fromTo('.hero__first', { clipPath: 'inset(-10% 100% -20% 0%)' }, { clipPath: 'inset(-10% -5% -20% 0%)', duration: 1.7, ease: 'power2.inOut' }, 0.7)
      .from('.hero__first', { x: -14, duration: 1.7, ease: 'power2.out' }, 0.7)
      .from(last.chars, { yPercent: 110, stagger: 0.022, duration: 0.9, ease: 'expo.out' }, 1.25)
      .fromTo('.impulse__base', { strokeDasharray: '100 100', strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 1.45)
      .from(goal.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.7)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.95)
      .from('.fact', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 2.05);

    // Искра по линии: короткий яркий штрих бежит по пути каждые несколько секунд
    gsap.fromTo('.impulse__spark', { strokeDashoffset: 9 }, {
      strokeDashoffset: -101, duration: 1.6, ease: 'power1.inOut', repeat: -1, repeatDelay: 2.6, delay: 2.6,
    });

    // Блик по хромированным кнопкам
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 3 + i * 0.4 });
    });

    // Счётчики фактов
    $$('.fact__num [data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: to >= 1000 ? 100 : 1 },
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Специализация: импульс по аксону ---------- */
    revealLines('.spec h2', '.spec .sec-head');
    gsap.from('.spec .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spec .sec-head', start: 'top 84%' } });
    gsap.from('.spec__promise li', {
      clipPath: 'inset(-20% 100% -30% 0%)', duration: 1.2, stagger: 0.35, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.spec__promise', start: 'top 86%' },
      onComplete() { $$('.spec__promise li').forEach(li => (li.style.clipPath = '')); },
    });
    const spPhoto = $('.spec__photo');
    if (spPhoto && getComputedStyle(spPhoto).display !== 'none') {
      gsap.fromTo('.spec__photo .frame', { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: '.spec__photo', start: 'top 85%' },
      });
    }

    const list = $('.axon');
    list.classList.add('axon--live');
    gsap.fromTo('.axon__rail span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.axon', start: 'top 62%', end: 'bottom 62%', scrub: 0.6 },
    });
    $$('.axon__item').forEach(item => {
      ScrollTrigger.create({
        trigger: item, start: 'top 62%',
        onEnter: () => {
          item.classList.add('is-on');
          gsap.fromTo($('.axon__node', item), { scale: 2.2 }, { scale: 1, duration: 0.7, ease: 'expo.out' });
        },
        once: true,
      });
      gsap.from($('.axon__title', item), { x: 24, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 90%' } });
    });

    /* ---------- 3. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 84%' } });
    $$('.card').forEach((card, i) => {
      gsap.from(card, {
        y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: i * 0.08,
        scrollTrigger: { trigger: card, start: 'top 88%' },
      });
      gsap.from($$('.ticks li', card), {
        x: -14, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: $('.ticks', card), start: 'top 86%' },
      });
    });
    gsap.fromTo('.card__photo img', { scale: 1.25 }, { scale: 1.04, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.card__photo', start: 'top 85%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
