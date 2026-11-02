// Татьяна Анохина — моушн концепта.
// Фирменная идея «Раскукожка»: всё, что появляется, выпрямляет осанку. В hero позвоночник на фоне восходящего солнца
// из ссутуленного положения поднимается позвонок за позвонком (снизу вверх, как в «скручивании» на ЛФК);
// маркеры-«позвонки» в каждом списке так же собираются в ровный столбик, буквы заголовков распрямляются.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Ссутуленная поза: верхние (шейные) позвонки уходят вперёд и вниз сильнее всего — «холка»
  const slouch = (i, n, k = 1) => {
    const t = Math.pow(1 - i / Math.max(1, n - 1), 1.5); // 1 у верхнего, 0 у нижнего
    return { x: -36 * t * k, y: 26 * t * k, rotation: -26 * t };
  };

  // Буквы заголовка поднимаются из-под маски и распрямляются
  function straightenTitle(el, opts = {}) {
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    return gsap.from(split.chars, {
      yPercent: 115, rotation: 14, transformOrigin: '0% 100%',
      duration: 1.15, stagger: 0.045, ease: 'expo.out',
      ...opts,
      onComplete: () => split.revert(),
    });
  }
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Список с маркерами-позвонками: маркеры собираются в ровный столбик снизу вверх, текст проявляется сверху вниз
  function straightenList(list) {
    const items = $$(':scope > li', list);
    const bullets = items.map(li => $('.vb', li));
    const texts = items.map(li => li.lastElementChild);
    const n = items.length;
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 82%' } });
    tl.from(bullets, {
      x: i => slouch(i, n, .6).x, rotation: i => slouch(i, n).rotation, autoAlpha: 0,
      duration: 1.1, ease: 'power3.out', stagger: { each: 0.08, from: 'end' },
    }, 0)
      .from(texts, { x: 14, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.07 }, 0.1);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: рассвет и «раскукоживание» ---------- */
    const lines = $$('.hero__name .ln');
    const nameSplits = lines.map(l => SplitText.create(l, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const verts = $$('.spine i');
    const n = verts.length;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { nameSplits.forEach(s => s.revert()); lead.revert(); breathe(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.scene .sun', { yPercent: 62, duration: 2.6, ease: 'power2.out' }, 0.05)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.2)
      .from(nameSplits[0].chars, { yPercent: 115, rotation: 12, transformOrigin: '0% 100%', stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.3)
      .from(nameSplits[1].chars, { yPercent: 115, rotation: 12, transformOrigin: '0% 100%', stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from('.age__num', { y: 70, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.55)
      .from('.age__unit', { y: 20, autoAlpha: 0, duration: 0.9 }, 1.0)
      // позвоночник: сначала проявляется ссутуленным…
      .fromTo(verts, {
        x: i => slouch(i, n).x, y: i => slouch(i, n).y, rotation: i => slouch(i, n).rotation, autoAlpha: 0,
      }, { autoAlpha: 1, duration: 0.5, stagger: { each: 0.03, from: 'end' }, ease: 'none' }, 0.5)
      // …и выпрямляется позвонок за позвонком снизу вверх
      .to(verts, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: 'power3.inOut', stagger: { each: 0.09, from: 'end' } }, 1.25)
      // ось проходит через выстроенный столбик снизу вверх
      .fromTo('.spine', { '--axis': 0 }, { '--axis': 1, duration: 0.9, ease: 'power2.inOut' }, 2.55)
      .from('.scene__sea span', { scaleX: 0, transformOrigin: '50% 50%', duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 100, duration: 1, stagger: 0.1, ease: 'expo.out' }, 1.2)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.45);

    // После выпрямления позвоночник мягко «вытягивается» вверх и отпускает — дыхание
    function breathe() {
      gsap.to(verts, {
        y: i => -(n - 1 - i) * 1.1, duration: 2.8, ease: 'sine.inOut',
        repeat: -1, yoyo: true, repeatDelay: 0.4,
      });
      gsap.to('.arrow', { y: 6, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }

    /* ---------- 2. Курс «Раскукожка» ---------- */
    gsap.from('.course .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.course', start: 'top 84%' } });
    straightenTitle('#course-title', { scrollTrigger: { trigger: '#course-title', start: 'top 86%' } });
    revealLines('.course__lead');
    const rows = $$('.program__list li');
    gsap.timeline({ scrollTrigger: { trigger: '.program__list', start: 'top 84%' } })
      .from(rows, { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0)
      .from('.program__bar span', { scaleX: 0, duration: 1.3, stagger: 0.18, ease: 'power2.inOut' }, 0.3);
    gsap.from('.bonus', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.bonus', start: 'top 90%' } });
    gsap.from('.need .h3', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.need', start: 'top 84%' } });
    $$('.vlist').forEach(straightenList);

    // Карточка цены поднимается целиком; цена — без счётчика, просто проявляется
    gsap.timeline({ scrollTrigger: { trigger: '.course .price', start: 'top 86%' } })
      .from('.course .price', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.course .price__value', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.35)
      .from('.course .price__btns .btn', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.5);

    /* ---------- 3. Клуб «На рассвете»: солнце восходит по прокрутке ---------- */
    gsap.fromTo('.sun--club', { yPercent: 34 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.club', start: 'top 92%', end: 'top 10%', scrub: 0.6 },
    });
    gsap.from('.club__glint span', {
      scaleX: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.club__dawn', start: 'top 60%' },
    });
    gsap.from('.club .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.club', start: 'top 80%' } });
    straightenTitle('#club-title', { scrollTrigger: { trigger: '#club-title', start: 'top 86%' } });
    revealLines('.club__quote');
    gsap.from('.club .h3', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.club__body', start: 'top 84%' } });
    revealLines('.club__energy');
    gsap.from('.plan', {
      y: 40, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.plans__grid', start: 'top 88%' },
    });
    gsap.from(['.plans__title', '.club__important', '.club .price__btns .btn'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.08,
      scrollTrigger: { trigger: '.plans', start: 'top 86%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
