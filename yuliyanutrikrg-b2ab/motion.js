// Юлия Марквардт — моушн концепта.
// Фирменная идея — «кольцо факторов»: вокруг портрета по очереди рисуются шесть дуг (питание, образ жизни, сон,
// активность, симптомы, обследования), и по кольцу шагает точка, по одному подсвечивая каждый фактор, —
// её подход «смотрю не на отдельный показатель, а на всё в комплексе». В «Моём подходе» то же кольцо собирается прокруткой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, кольцо собрано

  const refresh = () => ScrollTrigger.refresh();

  // Точка обходит кольцо шагами: доезжает до середины дуги, задерживается, подсвечивает дугу и подпись
  function orbit(root) {
    const dot = $('.ring__orbit', root);
    const arcs = $$('.ring__arc', root);
    const labels = $$('.ring__label', root);
    let cur = -1;
    const mark = () => {
      const rot = ((gsap.getProperty(dot, 'rotation') % 360) + 360) % 360;
      const i = Math.floor(((rot + 30) % 360) / 60);
      if (i === cur) return;
      if (cur >= 0) { arcs[cur].classList.remove('is-on'); labels[cur].classList.remove('is-on'); }
      cur = i;
      arcs[i].classList.add('is-on');
      labels[i].classList.add('is-on');
    };
    const tl = gsap.timeline({ repeat: -1, paused: true, onUpdate: mark });
    for (let i = 1; i <= 6; i++) {
      tl.to(dot, { rotation: 60 * i, svgOrigin: '200 200', duration: 0.95, ease: 'power2.inOut' }).to({}, { duration: 1.15 });
    }
    gsap.set(dot, { rotation: 0, svgOrigin: '200 200' });
    mark();
    // Крутится, только когда кольцо собрано (start) и видно на экране
    let armed = false;
    const st = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: s => armed && (s.isActive ? tl.play() : tl.pause()) });
    return { start() { if (armed) return; armed = true; if (st.isActive) tl.play(); } };
  }

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: портрет раскрывается кругом, дуги рисуются по очереди ---------- */
    const hero = $('.orbit--hero');
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const heroOrbit = orbit(hero);

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert(); lead.revert();
        gsap.set('.orbit--hero .orbit__photo', { clearProps: 'clipPath' });
        heroOrbit.start();
      },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.orbit--hero .orbit__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.orbit--hero .orbit__photo img', { scale: 1.4, duration: 1.9, ease: 'expo.out' }, 0.25)
      .from('.orbit--hero .ring__track', { autoAlpha: 0, scale: 0.86, svgOrigin: '200 200', duration: 1.3, ease: 'expo.out' }, 0.3)
      .fromTo($$('.ring__arc', hero), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.85, stagger: 0.13, ease: 'power2.inOut' }, 0.45)
      .from($$('.ring__label', hero), { autoAlpha: 0, duration: 0.6, stagger: 0.13, ease: 'none' }, 0.75)
      .from('.orbit--hero .ring__orbit', { autoAlpha: 0, duration: 0.5 }, 1.5)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.tags li', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.2)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    /* Портрет чуть отстаёт при прокрутке */
    gsap.to('.orbit--hero .orbit__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: линия прочерчивается, пункт поднимается ---------- */
    revealLines('.needs h2', '.needs .sec-head');
    gsap.from('.needs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.needs .sec-head', start: 'top 85%' } });
    $$('.needs__list li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 92%' } })
        .from($('.needs__rule', li), { scaleX: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.needs__num', li), { x: -10, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.05)
        .from($('.needs__text', li), { y: 18, autoAlpha: 0, duration: 0.75, ease: 'power3.out' }, 0.1);
    });

    /* ---------- 3. Мой подход: кольцо собирается прокруткой ---------- */
    const ap = $('.orbit--approach');
    revealLines('.approach__title', '.approach__text');
    gsap.from(['.approach .eyebrow', '.approach__body'], {
      y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.2,
      scrollTrigger: { trigger: '.approach__text', start: 'top 82%' },
    });
    const apOrbit = orbit(ap);
    // Однократно при входе (не scrub): собранное кольцо остаётся и при прокрутке назад
    gsap.timeline({ scrollTrigger: { trigger: ap, start: 'top 72%' }, onComplete: () => apOrbit.start() })
      .from($('.ring__track', ap), { autoAlpha: 0, scale: 0.82, svgOrigin: '200 200', duration: 1.4, ease: 'expo.out' }, 0)
      .fromTo($$('.ring__arc', ap), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.22, ease: 'power2.inOut' }, 0.15)
      .from($$('.ring__label', ap), { autoAlpha: 0, duration: 0.6, stagger: 0.22, ease: 'none' }, 0.45)
      .from($('.orbit__center', ap), { scale: 0.75, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 1.2)
      .from($('.ring__orbit', ap), { autoAlpha: 0, duration: 0.4 }, 1.9);

    /* ---------- 4. Форматы: карточки поднимаются веером, полоса срока заполняется ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 85%' } });
    $$('.plan').forEach((plan, i) => {
      gsap.from(plan, {
        y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: matchMedia('(min-width: 900px)').matches ? i * 0.12 : 0,
        scrollTrigger: { trigger: plan, start: 'top 90%' },
      });
      gsap.from($('.plan__bar i', plan), { scaleX: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: $('.plan__span', plan), start: 'top 88%' } });
      gsap.from($$('.plan__list li', plan), {
        x: -10, autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out',
        scrollTrigger: { trigger: $('.plan__list', plan), start: 'top 88%' },
      });
      // Цена появляется целиком, без счётчика
      gsap.from($('.plan__price', plan), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: $('.plan__price', plan), start: 'top 94%' } });
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
