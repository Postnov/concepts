// Моушн концепта: фирменная идея — билатеральный ритм EMDR.
// Точка ходит слева направо, как при EMDR-терапии; за ней открывается портрет,
// а блоки страницы входят попеременно слева и справа.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница (точка стоит по центру)

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const desktop = matchMedia('(min-width: 900px)').matches;

  // Строки заголовка выезжают из-под маски; после анимации нарезка снимается
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', reduceWhiteSpace: false });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const hero = $('.hero');
    const emdr = $('.emdr', hero);
    const dot = $('.emdr__dot', emdr);
    const ends = $$('.emdr__end', emdr);

    const n1 = SplitText.create('.hero__name .n1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const n2 = SplitText.create('.hero__name .n2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    // reduceWhiteSpace: false — сохраняет неразрывные пробелы, строки совпадают с ненарезанным текстом
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines', reduceWhiteSpace: false });

    // Касание конца линии: короткая вспышка засечки
    const flash = i => gsap.fromTo(ends[i], { scaleY: 2.2, opacity: 1 }, { scaleY: 1, opacity: 0.45, duration: 0.7, ease: 'power2.out' });

    // Бесконечный ритм: туда-обратно, как движение взгляда в EMDR
    const loop = gsap.timeline({ repeat: -1, paused: true })
      .to(dot, { '--p': 0, duration: 1.9, ease: 'sine.inOut' })
      .call(() => flash(0))
      .to(dot, { '--p': 1, duration: 1.9, ease: 'sine.inOut' })
      .call(() => flash(1));

    let looping = false;
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        n1.revert(); n2.revert(); lead.revert();
        gsap.set('.arch', { clearProps: 'clipPath' });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.tagline > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.15)
      .from(n1.chars, { yPercent: 112, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, 0.25)
      .from(n2.chars, { yPercent: 112, duration: 1.15, stagger: { each: 0.045, from: 'edges' }, ease: 'expo.out' }, 0.35)
      // Первый проход точки: линия рисуется за ней, портрет открывается слева направо
      .fromTo('.emdr__line', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.7)
      .fromTo(dot, { '--p': 0, autoAlpha: 0 }, { '--p': 1, autoAlpha: 1, duration: 1.5, ease: 'power2.inOut' }, 0.7)
      .from('.emdr__label', { autoAlpha: 0, duration: 0.6 }, 0.9)
      .fromTo('.arch', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power2.inOut' }, 0.7)
      .from('.arch img', { scale: 1.28, duration: 2.1, ease: 'expo.out' }, 0.8)
      .call(() => { looping = true; flash(1); loop.play(); }, null, 2.2)
      // Обложечные строки — слева, текст — справа
      .from('.cover__lines li', { x: -28, autoAlpha: 0, stagger: 0.1, duration: 0.9 }, 1.0)
      .from('.cover__role', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 1 }, 1.05)
      .from('.hero__about', { x: 24, autoAlpha: 0, duration: 0.9 }, 1.2)
      .from('.hero__actions > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8, clearProps: 'transform' }, 1.35);

    // Ритм идёт только пока hero на экране
    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top',
      onToggle: self => { if (looping) self.isActive ? loop.play() : loop.pause(); },
    });

    // Линии с точкой у заголовков секций: точка ходит туда-обратно в такт прокрутке
    $$('.emdr--sec').forEach(line => {
      const section = line.closest('section');
      gsap.fromTo($('.emdr__line', line), { scaleX: 0 }, {
        scaleX: 1, duration: 1.3, ease: 'power2.inOut',
        scrollTrigger: { trigger: line, start: 'top 88%' },
      });
      gsap.fromTo($('.emdr__dot', line), { '--p': 0 }, {
        '--p': 1, ease: 'sine.inOut', repeat: 3, yoyo: true,
        scrollTrigger: { trigger: section, start: 'top 80%', end: 'bottom 20%', scrub: 0.8 },
      });
    });

    // Секция «Услуги»
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services', start: 'top 82%' } });
    revealLines('.services h2', '.services__head');
    gsap.from('.services__intro', { x: -24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.services__intro', start: 'top 88%' } });
    revealLines('.quote p', '.quote');

    gsap.timeline({ scrollTrigger: { trigger: '.intro-card', start: 'top 84%' } })
      .from('.intro-card', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from('.intro-card__price .mask > span', { yPercent: 110, duration: 1, ease: 'expo.out' }, 0.25)
      .from('.intro-card .btn', { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.45);

    gsap.from('.services__strategy', { autoAlpha: 0, y: 16, duration: 0.9, scrollTrigger: { trigger: '.services__strategy', start: 'top 90%' } });

    // Строки прайса — попеременно слева и справа
    $$('.price').forEach((row, i) => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 92%' } })
        .from(row, { x: i % 2 ? 36 : -36, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from($('.price__dots', row), { scaleX: 0, transformOrigin: i % 2 ? '100% 50%' : '0% 50%', duration: 0.9, ease: 'power2.out' }, 0.15)
        .from($('.mask > span', row), { yPercent: 110, duration: 0.9, ease: 'expo.out' }, 0.2);
    });

    gsap.timeline({ scrollTrigger: { trigger: '.vip', start: 'top 88%' } })
      .fromTo('.vip', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' })
      .from('.vip__label', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.9)
      .from('.vip__sum .mask > span', { yPercent: 110, duration: 1, ease: 'expo.out' }, 0.7);
    gsap.from('.services__note', { x: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.services__note', start: 'top 94%' } });

    // Секция «Программы»
    gsap.from('.programs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs', start: 'top 82%' } });
    revealLines('.programs h2', '.programs__head');
    gsap.from('.programs__intro', { x: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.programs__intro', start: 'top 90%' } });

    const offsets = desktop ? [[-40, 0], [0, 40], [40, 0]] : [[-36, 0], [36, 0], [-36, 0]];
    $$('.prog').forEach((card, i) => {
      const [x, y] = offsets[i % 3];
      gsap.from(card, {
        x, y, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: desktop ? i * 0.08 : 0, clearProps: 'transform',
        scrollTrigger: { trigger: desktop ? '.progs' : card, start: 'top 88%' },
      });
    });
    gsap.from('.more__item', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.more', start: 'top 92%' },
    });

    gsap.from('.concept-end > *', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, clearProps: 'transform',
      scrollTrigger: { trigger: '.concept-end', start: 'top 88%' },
    });

    window.addEventListener('load', refresh, { once: true });
  });
})();
