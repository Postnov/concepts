// Марианна Орлова — моушн концепта. Фирменная идея «оттепель»: холод уступает теплу.
// В hero холодное чёрно-белое фото прогревается кругом из центра её «прожектора»,
// в блоке болей на скролле разгорается тот же тёплый свет — и в его центре ответ «С тобой всё в порядке».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP или при reduced motion страница статичная и полностью рабочая

  const refresh = () => ScrollTrigger.refresh();

  // Строки заголовка выезжают из-под маски; после анимации split снимаем, чтобы перенос жил при ресайзе
  function revealLines(selector, trigger, start = 'top 82%') {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start },
      onComplete: () => split.revert(),
    });
  }

  // Счётчик числа (с неразрывным пробелом по тысячам)
  function counter(el, { from = 0, to = Number(el.dataset.count), snap = 1, duration = 1.6, delay = 0, trigger } = {}) {
    const o = { v: from };
    gsap.to(o, {
      v: to, duration, delay, ease: 'power2.out', snap: { v: snap },
      scrollTrigger: { trigger: trigger || el, start: 'top 90%', once: true },
      onStart: () => { el.textContent = MotionBase.money(from); },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход и «прогрев» фото ---------- */
    const title = SplitText.create('.cover__title h1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__top > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.15)
      .from('.cover__frame', { y: 46, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.1)
      .from('.cover__frame img', { scale: 1.14, duration: 2.4, ease: 'expo.out' }, 0.1)
      // тепло расходится из центра света на фото
      .fromTo('.cover__warm', { '--warm': 0 }, { '--warm': 100, duration: 1.9, ease: 'power2.inOut' }, 0.45)
      .from('.halo__glow', { scale: 0.45, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.8)
      .from('.halo__ring', { scale: 0.82, autoAlpha: 0, stagger: 0.14, duration: 1.6, ease: 'expo.out' }, 0.95)
      .from('.cover__kicker', { x: -14, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from(title.chars, { yPercent: 115, stagger: 0.035, duration: 1, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.without li', { x: -16, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.35)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.6);

    /* Ореол «дышит» теплом: медленно, без рывков */
    gsap.to('.halo__ring', { scale: 1.045, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6, delay: 2.4 });
    gsap.to('.halo__glow', { opacity: 0.7, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });
    // На скролле ореол отстаёт от фото
    gsap.to('.halo__glow', { y: 70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    gsap.from('.proof', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.proof', start: 'top 92%' } });
    counter($('.proof__num [data-count]'), { duration: 1.8, trigger: '.proof' });

    /* ---------- 2. Боли: холод → тепло ---------- */
    revealLines('.pains h2', '.pains .sec-head');
    gsap.from('.pains .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.pains .sec-head', start: 'top 82%' } });

    const pains = $$('.pains__list li');
    gsap.set(pains, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(pains, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });

    gsap.from('.pains__friends p', {
      y: 20, autoAlpha: 0, duration: 1, stagger: 0.18, ease: 'power2.out',
      scrollTrigger: { trigger: '.pains__friends', start: 'top 85%' },
    });
    revealLines('.pains__doubt', '.pains__doubt', 'top 86%');

    // Тёплый свет разгорается вместе со скроллом; ответ проявляется в его центре.
    // Когда свет разгорелся полностью, он фиксируется и больше не гаснет при прокрутке назад.
    const spot = $('.spot');
    gsap.set(spot, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
    const warmTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.pains__end', start: 'top 88%', endTrigger: '.pains__answer', end: 'center 55%', scrub: 0.8,
        onLeave: self => { self.kill(); warmTl.progress(1); },
      },
    })
      .fromTo(spot, { scale: 0.04, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, ease: 'power1.in', duration: 1 }, 0)
      .fromTo('.pains__answer', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.45 }, 0.55);

    /* ---------- Лента ролей едет вместе со скроллом ---------- */
    const track = $('.roles__track');
    gsap.fromTo(track, { x: () => Math.min(0, window.innerWidth * 0.25) }, {
      x: () => Math.min(0, window.innerWidth - track.scrollWidth),
      ease: 'none',
      scrollTrigger: { trigger: '.roles', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
    });

    /* ---------- 3. Что внутри + цена ---------- */
    revealLines('.offer h2', '.offer .sec-head');
    gsap.from('.offer .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 82%' } });

    // Иконки рисуются линией, пункты поднимаются
    $$('.inside li').forEach(li => {
      const shapes = $$('path, rect, circle', li.querySelector('svg'));
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } });
      tl.from(li, { y: 22, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0);
      shapes.forEach(s => {
        const len = s.getTotalLength();
        tl.fromTo(s, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut',
          onComplete: () => gsap.set(s, { clearProps: 'strokeDasharray,strokeDashoffset' }),
        }, 0.15);
      });
    });

    gsap.from('.safe', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.safe', start: 'top 88%' } });

    // Карточка цены: выезд, разгорающийся прожектор, зачёркивание старой цены и «спуск» к новой
    const old = $('.price__old s');
    const priceTl = gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 82%' } });
    priceTl
      .from('.price', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
      .from('.price__glow', { scale: 0.3, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.2)
      .from(['.price__label', '.price__title', '.price__old'], { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0.3)
      .fromTo(old, { '--strike': 0 }, { '--strike': 1, duration: 0.6, ease: 'power2.inOut' }, 0.8)
      .from(['.price__note', '.price .btn'], { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 1.0);
    counter($('.price__new [data-count]'), { from: 10900, snap: 100, duration: 1.4, delay: 0.9, trigger: '.price' });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
