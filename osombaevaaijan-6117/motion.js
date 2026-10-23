// Айжана Осомбаева — моушн концепта. Фирменная идея — «пульс»: линия кардиограммы проходит за портретом,
// по ней бежит розово-золотой импульс, и на каждом зубце арка с фото мягко «вздрагивает»; мини-кардиограммы рисуются у заголовков.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Доля длины пути, на которой линия доходит до x (для синхронизации «удара» с зубцом)
  function fractionAtX(path, x) {
    const total = path.getTotalLength();
    let lo = 0, hi = total;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid;
    }
    return lo / total;
  }

  // Заголовок «протягивается» слева направо, как запись кардиограммы
  function wipe(el, trigger) {
    gsap.fromTo(el, { clipPath: 'inset(-10% 100% -10% 0%)' }, {
      clipPath: 'inset(-10% 0% -10% 0%)', duration: 1.3, ease: 'expo.inOut',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
    });
  }
  function drawMini(el, trigger) {
    const p = $('path', el);
    gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
      scrollTrigger: { trigger: trigger || el, start: 'top 88%' },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const role = SplitText.create('.hero__role', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const base = $('.pulse__base');
    const beat = $('.pulse__beat');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); role.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(base, { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1)
      .fromTo('.arch__frame', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.25)
      .from('.arch__frame img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.45)
      .from('.arch__ring', { scale: 0.9, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.8)
      .from('.badge', { scale: 0.6, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.8)' }, 1.25)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.55)
      .from(name.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from(role.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 }, 0.95)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3)
      .add(() => gsap.set(base, { clearProps: 'strokeDasharray,strokeDashoffset' }));

    /* Импульс бежит по кардиограмме; на зубце арка и бейдж «вздрагивают» */
    const period = 2.8;
    const hit = fractionAtX(beat, 640) * period;
    const pulse = gsap.timeline({ repeat: -1, delay: 1.7, repeatDelay: 0.5 });
    pulse
      .fromTo(beat, { strokeDashoffset: 90 }, { strokeDashoffset: -1000, duration: period, ease: 'none' }, 0)
      .to('.arch', { scale: 1.022, duration: 0.14, ease: 'power2.out' }, hit)
      .to('.arch', { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, hit + 0.14)
      .to('.arch__ring', { borderColor: 'rgba(201, 150, 131, .9)', duration: 0.14 }, hit)
      .to('.arch__ring', { borderColor: 'rgba(169, 113, 92, .45)', duration: 0.8 }, hit + 0.14);

    /* Блик на главных кнопках */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--light)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    /* Параллакс портрета */
    gsap.to('.arch__frame img', {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- заголовки секций ---------- */
    $$('.sec-head').forEach(head => {
      drawMini($('.mini-pulse', head), head);
      wipe($('h2', head), head);
      gsap.from($('.eyebrow', head), { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: head, start: 'top 84%' } });
    });

    /* ---------- 2. Консультации: карточки поднимаются с раскрытием ---------- */
    $$('.card').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } })
        .fromTo(card, { clipPath: 'inset(18% 0% 0% 0% round 26px)', y: 40 },
          { clipPath: 'inset(0% 0% 0% 0% round 26px)', y: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.08,
            onComplete: () => gsap.set(card, { clearProps: 'clipPath' }) })
        .from($$('.card__num, .card__title, .btn', card), { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.25);
    });

    /* ---------- 3. Курсы ---------- */
    gsap.from('.rows li', {
      x: -24, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.rows', start: 'top 86%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.doctors', start: 'top 86%' } })
      .from('.doctors', { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from($$('.doctors__tag, .doctors__title, .doctors__note, .doctors .btn'), { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.25);
    gsap.fromTo('.dot', { scale: 1 }, { scale: 1.35, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    /* ---------- концовка ---------- */
    drawMini($('.mini-pulse--end'), '.concept-end');
    gsap.from('.concept-end > :not(svg)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
