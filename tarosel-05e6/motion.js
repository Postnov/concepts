// Татьяна — моушн концепта. Фирменная идея «расклад»: карты сдаются рубашкой вверх и переворачиваются.
// В hero центральная карта открывает её портрет, в форматах карты переворачиваются и показывают услуги.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- кодовые слова: копирование по нажатию, работает и без GSAP ---------- */
  $$('[data-copy]').forEach(btn => {
    let timer;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
      } catch (e) {
        return; // буфер недоступен — слово и так видно, ничего не ломаем
      }
      $('.code__ok', btn).textContent = 'скопировано';
      btn.classList.add('is-copied');
      clearTimeout(timer);
      timer = setTimeout(() => btn.classList.remove('is-copied'), 1600);
    });
  });

  if (!animate) return;

  // Параметры веера берём из CSS, чтобы мобайл и десктоп раскладывались по-своему
  const spread = $('.spread');
  const fanX = parseFloat(getComputedStyle(spread).getPropertyValue('--fan-x')) || -28;
  const fanR = parseFloat(getComputedStyle(spread).getPropertyValue('--fan-r')) || -10;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Счётчик: 0 → значение, с неразрывным пробелом по тысячам
  function countUp(el, opts) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = MotionBase.money(0);
    return gsap.to(o, {
      v: to, duration: 1.4, ease: 'power2.out', snap: { v: to >= 1000 ? 100 : to >= 100 ? 10 : 1 },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      ...opts,
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: сдача карт и переворот ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const left = $('.tcard--l');
    const right = $('.tcard--r');
    const main = $('.tcard--main');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); afterIntro(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.spread .wheel', { scale: 0.75, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.1)
      // три карты поднимаются стопкой рубашкой вверх
      .fromTo([left, right], { x: 0, xPercent: 0, rotation: 0, y: 110, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.15)
      .fromTo(main, { y: 130, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.2)
      .fromTo('.tcard--main .flip', { rotateY: 180 }, { rotateY: 0, duration: 1.1, ease: 'power3.inOut' }, 0.8)
      // боковые раскрываются веером
      .to(left, { xPercent: fanX, rotation: fanR, duration: 1, ease: 'expo.inOut' }, 0.7)
      .to(right, { xPercent: -fanX, rotation: -fanR, duration: 1, ease: 'expo.inOut' }, 0.7)
      .from('.tface__window img', { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 1.25)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 110, stagger: 0.05, duration: 1, ease: 'expo.out' }, 0.35)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.9 }, 1.0)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.15)
      .from(['.hero__btn', '.hint'], { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    // Статистика: на десктопе видна сразу и идёт после интро, на мобайле — когда долистали
    const stats = $('.stats');
    const statsDelay = ScrollTrigger.isInViewport(stats, 0.2) ? 1.25 : 0;
    gsap.timeline({ scrollTrigger: { trigger: stats, start: 'top 92%' }, delay: statsDelay })
      .from('.stats li', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' })
      .add(() => $$('.stats [data-count]').forEach(el => countUp(el)), 0);

    // Медленное вращение круга за раскладом
    gsap.to('.wheel svg', { rotation: 360, duration: 160, repeat: -1, ease: 'none' });

    function afterIntro() {
      // «Фольга»: блик пробегает по портретной карте
      gsap.fromTo('.tface__sheen', { '--sheen': '-130%' }, { '--sheen': '130%', duration: 1.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.5, delay: 0.4 });
      gsap.to('.hint i', { y: 4, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true });
      // При прокрутке веер чуть шире, центральная карта уходит медленнее
      const scrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to(left, { xPercent: fanX * 1.25, rotation: fanR * 1.5, ease: 'none', scrollTrigger: scrub });
      gsap.to(right, { xPercent: -fanX * 1.25, rotation: -fanR * 1.5, ease: 'none', scrollTrigger: { ...scrub } });
      gsap.to(main, { yPercent: -6, ease: 'none', scrollTrigger: { ...scrub } });
    }

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--card)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* ---------- 2. Форматы: карты переворачиваются ---------- */
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 84%' } });
    revealLines('.formats h2', '.formats .sec-head');

    $$('.fcard').forEach((card, i) => {
      const face = $('.fcard__face', card);
      const price = $('[data-count]', card);
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%' }, delay: i * 0.12 })
        .fromTo(card, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' })
        .fromTo($('.fcard__inner', card), { rotateY: -180 }, { rotateY: 0, duration: 1.25, ease: 'power3.inOut' }, 0.2)
        .from($$(':scope > *', face), { y: 14, autoAlpha: 0, stagger: 0.05, duration: 0.6, ease: 'power2.out' }, 0.85)
        .add(countUp(price, { duration: 1.2 }), 0.95);
    });

    /* ---------- 3. Запись ---------- */
    gsap.from('.book .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.book', start: 'top 80%' } });
    revealLines('.book h2', '.book');
    gsap.timeline({ scrollTrigger: { trigger: '.book__lead', start: 'top 86%' } })
      .from('.book__lead', { y: 14, autoAlpha: 0, duration: 0.7 })
      .from('.code', { y: 18, scale: 0.94, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'expo.out' }, 0.15)
      .from(['.codes__or', '.codes__note'], { autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.35);
    gsap.timeline({ scrollTrigger: { trigger: '.sign', start: 'top 88%' } })
      .from('.sign img', { scale: 0.6, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .from('.sign p', { x: 14, autoAlpha: 0, duration: 0.7 }, 0.15)
      .from('.book .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.3);
    gsap.from(['.info', '.legal li'], { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.07, scrollTrigger: { trigger: '.info', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
