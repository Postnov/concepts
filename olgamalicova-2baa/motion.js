// Ольга Маликова — моушн концепта. Фирменная идея «Учу видеть, а не просто смотреть»:
// видоискатель куратора — уголки рамки сходятся с общего плана на главное, и снимок из серого и размытого
// («смотреть») становится резким и цветным («видеть»). Та же рамка ведёт по списку прогулок.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Буквы из-под маски (класс ch → маска ch-mask с запасом под выносные)
  const chars = sel => SplitText.create(sel, { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
  // Строки из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  const lines = sel => SplitText.create(sel, { reduceWhiteSpace: false, type: 'lines', linesClass: 'ln', mask: 'lines' });
  const onEnter = (trigger, start = 'top 82%') => ({ trigger, start });

  // Подпись на рамке: «смотреть» → «видеть»
  function swapTag(tag, text) {
    gsap.to(tag, {
      autoAlpha: 0, duration: 0.18,
      onComplete: () => {
        tag.textContent = text;
        gsap.fromTo(tag, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      },
    });
  }

  // Видоискатель: рамка во весь кадр → сходится на цель из CSS-переменных --fx/--fy/--fw/--fh, снимок наводится на резкость
  function focus(view, vars) {
    const img = $('img', view);
    const finder = $('.finder', view);
    const tag = $('.finder__tag', view);
    const cs = getComputedStyle(view);
    const [fx, fy, fw, fh] = ['--fx', '--fy', '--fw', '--fh'].map(k => cs.getPropertyValue(k).trim());
    tag.textContent = 'смотреть';
    return gsap.timeline(vars)
      .fromTo(finder,
        { left: '0%', top: '0%', width: '100%', height: '100%', '--dim': 0 },
        { left: fx, top: fy, width: fw, height: fh, '--dim': 0.42, duration: 1.15, ease: 'expo.inOut' }, 0)
      .fromTo(img,
        { filter: 'grayscale(1) blur(9px)', scale: 1.1 },
        { filter: 'grayscale(0) blur(0px)', scale: 1, duration: 1.0, ease: 'power2.out', clearProps: 'filter' }, 0.7)
      .call(() => swapTag(tag, 'видеть'), null, 0.9)
      .to(finder, {
        '--dim': 0.16, duration: 1.2, ease: 'power2.inOut',
        // дальше позицией рамки управляет CSS (переменные под мобайл/десктоп)
        onComplete: () => gsap.set(finder, { clearProps: 'left,top,width,height' }),
      }, 1.25);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: обложка ---------- */
    const first = chars('.hero__first');
    const last = chars('.hero__last');
    const motto = lines('.hero__motto');
    const heroView = $('.view--hero');

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { first.revert(); last.revert(); motto.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__meta > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(first.chars, { yPercent: 110, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.2)
      .from(last.chars, { yPercent: 110, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.3)
      // «двери» выставки: кадр раскрывается от центра
      .fromTo(heroView, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.2)
      .add(focus(heroView), 0.85)
      .from('.hero .label', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.1)
      .from(motto.lines, { yPercent: 105, stagger: 0.09, duration: 1.0, ease: 'expo.out' }, 1.1)
      // красная черта под «видеть» — в момент, когда снимок становится резким
      .fromTo('.hero__motto', { '--u': '0%' }, { '--u': '100%', duration: 0.8, ease: 'power2.inOut' }, 1.85)
      .from('.hero__sub', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.65);

    /* ---------- 2. Прогулки ---------- */
    const walksTitle = chars('.walks h2');
    gsap.timeline({ scrollTrigger: onEnter('.walks .sec-head'), onComplete: () => walksTitle.revert() })
      .from('.walks .eyebrow', { y: 12, autoAlpha: 0, duration: 0.7 })
      .from(walksTitle.chars, { yPercent: 110, stagger: 0.05, duration: 1.0, ease: 'expo.out' }, 0.1);
    gsap.timeline({ scrollTrigger: onEnter('.walks__photo', 'top 86%') })
      .fromTo('.walks__photo .view', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.walks__photo img', { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0.15)
      .from('.walks .cap', { y: 10, autoAlpha: 0, duration: 0.7 }, 0.7);

    const rows = $$('.walk');
    gsap.set(rows, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
    });
    // Видоискатель списка: красные уголки переезжают на прогулку у линии взгляда
    const pick = $('.walks__pick');
    let cur = -1;
    const place = (i, duration) => {
      const r = rows[i];
      gsap.to(pick, { y: r.offsetTop, height: r.offsetHeight, autoAlpha: 1, duration, ease: 'power3.out', overwrite: 'auto' });
    };
    const pickRow = i => {
      if (i === cur) return;
      cur = i;
      rows.forEach((r, k) => r.classList.toggle('is-on', k === i));
      place(i, 0.65);
    };
    rows.forEach((r, i) => ScrollTrigger.create({
      trigger: r, start: 'top 62%', end: 'bottom 62%',
      onToggle: s => s.isActive && pickRow(i),
    }));
    ScrollTrigger.addEventListener('refresh', () => cur >= 0 && place(cur, 0));

    // Личный бренд: фисташковый «зал» раздвигается, карточки встают по очереди
    const brandTitle = lines('.brand__title');
    gsap.timeline({ scrollTrigger: onEnter('.brand', 'top 85%'), onComplete: () => brandTitle.revert() })
      .fromTo('.brand', { clipPath: 'inset(6% 5% 6% 5%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.brand__photo img', { scale: 1.2, duration: 1.6, ease: 'expo.out' }, 0.1)
      .from(brandTitle.lines, { yPercent: 105, stagger: 0.08, duration: 1.0, ease: 'expo.out' }, 0.45);
    gsap.from('.consult', {
      y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: onEnter('.brand__cards', 'top 90%'),
    });

    /* ---------- 3. Обо мне ---------- */
    gsap.from('.about .eyebrow', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: onEnter('.about') });
    focus($('.view--about'), { scrollTrigger: onEnter('.view--about', 'top 72%') });
    const hello = chars('.about__hello');
    const lead = lines('.about__lead');
    gsap.timeline({ scrollTrigger: onEnter('.about__copy', 'top 84%'), onComplete: () => { hello.revert(); lead.revert(); } })
      .from(hello.chars, { yPercent: 110, stagger: 0.03, duration: 0.95, ease: 'expo.out' })
      .from(lead.lines, { yPercent: 105, stagger: 0.08, duration: 0.95, ease: 'expo.out' }, 0.3)
      .from('.about__text', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.5);
    gsap.from('.fact', {
      y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: onEnter('.facts', 'top 88%'),
    });
    gsap.timeline({ scrollTrigger: onEnter('.care', 'top 90%') })
      .fromTo('.care', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.care > *', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: onEnter('.concept-end', 'top 88%') });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
