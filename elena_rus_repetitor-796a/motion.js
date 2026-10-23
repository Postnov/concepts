// Елена Малышева — моушн концепта. Идея: правка пером. Золотая линия «полей тетради» дорисовывается за прокруткой,
// галочки и «пятёрка» выводятся одним росчерком, подчёркивания рисуются, как у учителя в тетради.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  const write = (tl, els, dur, pos, ease = 'power2.inOut') =>
    tl.fromTo(els, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease, stagger: 0.12 }, pos);

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- поля тетради: кончик пера идёт за прокруткой ---------- */
    const main = $('main');
    const margin = $('.margin');
    const pen = { k: 0 };
    const paint = () => {
      const tip = Math.min(main.offsetHeight, window.scrollY + window.innerHeight * 0.64 - main.offsetTop);
      margin.style.setProperty('--tip', (Math.max(0, tip) * pen.k).toFixed(1) + 'px');
    };
    ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: paint, onRefresh: paint });
    paint();

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .to(pen, { k: 1, duration: 2.0, ease: 'power3.inOut', onUpdate: paint }, 0.05)
      .from('.kicker i', { scaleX: 0, transformOrigin: 'left center', duration: 0.7 }, 0.25)
      .from('.kicker span', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.hero__photo img', { autoAlpha: 0, scale: 1.07, duration: 1.7, ease: 'power2.out' }, 0.3);
    write(intro, '.pen--name path', 0.9, 1.05);
    intro
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25)
      .from('.grade', { rotate: -26, scale: 0.86, duration: 1.1, ease: 'back.out(1.6)' }, 1.45);
    write(intro, '.grade__ring', 0.85, 1.45);
    write(intro, '.grade__five', 0.7, 1.95);

    /* Блик на главной кнопке */
    gsap.fromTo('.hero__cta .btn:not(.btn--ghost)', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.8 });

    /* Цифры стажа: единственное, что «набегает» (не цены) */
    $$('.stat__num').forEach(el => {
      const end = Number(el.dataset.count);
      const o = { v: 0 };
      const fmt = n => MotionBase.money(n).replace(/ /g, ' ');
      gsap.to(o, {
        v: end, duration: 1.6, ease: 'power3.out', paused: false,
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        onStart: () => { el.textContent = fmt(0); },
        onUpdate: () => { el.textContent = fmt(o.v); },
        onComplete: () => { el.textContent = fmt(end); },
      });
    });
    gsap.from('.stats', { y: 36, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 96%' } });

    /* ---------- 2. Для кого ---------- */
    revealLines('.who h2', '.who .sec-head');
    gsap.from('.who .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.who .sec-head', start: 'top 84%' } });
    $$('.who__item').forEach(item => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' } });
      tl.fromTo(item, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.out', clearProps: 'clipPath' })
        .from($('.who__body', item), { x: -16, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.12);
      write(tl, $('.tick path', item), 0.65, 0.3, 'power2.out');
    });

    /* ---------- 3. Продукты ---------- */
    revealLines('.products h2', '.products .sec-head');
    gsap.from('.products .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.products .sec-head', start: 'top 84%' } });
    gsap.fromTo('.pen--h2 path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut', scrollTrigger: { trigger: '.pen--h2', start: 'top 92%' } });
    const cards = $$('.pcard');
    gsap.set(cards, { autoAlpha: 0, y: 34, clipPath: 'inset(0% 100% 0% 0% round 12px)' });
    ScrollTrigger.batch(cards, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, {
        autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.1, stagger: 0.12, ease: 'expo.out', clearProps: 'clipPath',
      }),
    });
    $$('.pcard--book').forEach(card => {
      gsap.from($$('.spines i', card), {
        scaleY: 0, duration: 0.9, stagger: 0.09, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: card, start: 'top 80%' },
      });
    });
    gsap.from('.pcard__ten', { yPercent: 30, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.pcard--main', start: 'top 80%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
