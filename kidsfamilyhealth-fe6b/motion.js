// Ксения Иванова — моушн концепта. Фирменная идея «мыльный пузырь» (в био она — «фея-нутрициолог для ваших детей»):
// портрет надувается в радужном пузыре, который секунду дрожит, как только что выдутый, а потом живёт — плёнка
// переливается, пузырь чуть дышит и парит, вокруг висят маленькие пузыри. Дальше пузыри «приносят» на места
// темы теста (речь, сон, развитие, эмоции), скидку до 30% и названия лабораторий. Без GSAP и при reduced motion — статично.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Затухающая дрожь только что выдутого пузыря (scaleX/scaleY в противофазе).
  // На том же элементе — строго после надувания (scale), не внахлёст: иначе тот же scaleX/scaleY перебивается рывком
  const jiggle = (el, k = 1) => gsap.timeline()
    .to(el, { scaleX: 1 + .07 * k, scaleY: 1 - .06 * k, duration: .2, ease: 'sine.out' })
    .to(el, { scaleX: 1 - .045 * k, scaleY: 1 + .05 * k, duration: .26, ease: 'sine.inOut' })
    .to(el, { scaleX: 1 + .022 * k, scaleY: 1 - .02 * k, duration: .3, ease: 'sine.inOut' })
    .to(el, { scaleX: 1, scaleY: 1, duration: .42, ease: 'sine.out' });

  // Жизнь пузыря: плёнка переливается (вращение радужного кольца), тело дышит и парит
  const live = (orb, film, { breath = .016, float = 7, period = 2.6 } = {}) => {
    if (film) gsap.to(film, { rotation: 360, duration: 14, ease: 'none', repeat: -1 });
    gsap.to(orb, { scaleX: 1 + breath, scaleY: 1 - breath, duration: period, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(orb, { y: -float, duration: period * 1.35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  };

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: пузырь надувается ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const orb = $('.orb');
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert();
        live(orb, $('.orb__film'));
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: .6 }, 0)
      .from('.hero__bubble', { scale: .16, autoAlpha: 0, duration: 1, ease: 'expo.out' }, .1)
      .add(jiggle(orb), .62)
      .from('.orb__film', { rotation: -140, duration: 2, ease: 'expo.out' }, .1)
      .from('.orb__photo img', { scale: 1.3, filter: 'blur(8px)', duration: 1.5, ease: 'expo.out' }, .3)
      .from('.orb__glow', { scale: .4, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, .45)
      .from('.fly', { scale: 0, autoAlpha: 0, stagger: .07, duration: .9, ease: 'expo.out' }, .8)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: .08, duration: .6 }, .55)
      .from(name.chars, { yPercent: 112, stagger: .04, duration: 1, ease: 'expo.out' }, .6)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: .8 }, 1.05)
      .from('.facts li', { y: 16, autoAlpha: 0, stagger: .1, duration: .7 }, 1.15)
      .from('.chips li', { scale: .4, autoAlpha: 0, stagger: .06, duration: .6, ease: 'back.out(2.2)' }, 1.25)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: .1, duration: .7 }, 1.4);

    // Маленькие пузыри: каждый парит в своём ритме, при прокрутке уходят вверх быстрее страницы (глубина)
    $$('.fly').forEach((el, i) => {
      gsap.to(el, { y: gsap.utils.random(-26, -12), x: gsap.utils.random(-10, 10), duration: gsap.utils.random(2.8, 4.6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 + i * .2 });
      gsap.to(el, { yPercent: -(140 + i * 45), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero__bubble', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Полезное ---------- */
    revealLines('.useful h2', '.useful .sec-head');
    gsap.from('.useful .eyebrow', { y: 14, autoAlpha: 0, duration: .8, scrollTrigger: { trigger: '.useful .sec-head', start: 'top 84%' } });

    // Карточка теста раскрывается из круга-пузыря, затем темы теста всплывают пузырями со дна карточки
    const pops = $$('.pop').filter(p => getComputedStyle(p).display !== 'none');
    gsap.timeline({ scrollTrigger: { trigger: '.test', start: 'top 82%' } })
      .fromTo('.test', { clipPath: 'circle(14% at 50% 22%)' }, { clipPath: 'circle(150% at 50% 22%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from(pops, { y: 170, scale: .55, autoAlpha: 0, duration: 1.5, stagger: .14, ease: 'power3.out' }, .35)
      .from(pops, { x: i => (i % 2 ? 14 : -14), duration: 1.5, stagger: .14, ease: 'sine.inOut' }, .35)
      .from(['.test .tag', '.test__title', '.test__text', '.test .btn'], { y: 18, autoAlpha: 0, stagger: .09, duration: .8 }, .55)
      .add(() => pops.forEach((p, i) => gsap.to(p, { yPercent: -7, duration: 2.4 + i * .35, ease: 'sine.inOut', yoyo: true, repeat: -1 })));

    gsap.timeline({ scrollTrigger: { trigger: '.guide', start: 'top 84%' } })
      .from('.guide', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from(['.guide .tag', '.guide__title'], { y: 16, autoAlpha: 0, stagger: .1, duration: .8 }, .2)
      .from('.guide__list li', { x: -14, autoAlpha: 0, stagger: .1, duration: .7 }, .4)
      .from('.guide .btn', { y: 14, autoAlpha: 0, duration: .7 }, .6);

    $$('.channel').forEach((el, i) => gsap.from(el, {
      x: i % 2 ? 40 : -40, autoAlpha: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    }));

    /* ---------- 3. Анализы ---------- */
    revealLines('.labs h2', '.labs .sec-head');
    gsap.from('.labs .eyebrow', { y: 14, autoAlpha: 0, duration: .8, scrollTrigger: { trigger: '.labs .sec-head', start: 'top 84%' } });

    const disc = $('.disc');
    gsap.timeline({ scrollTrigger: { trigger: '.labs__offer', start: 'top 80%' } })
      .from('.labs__offer', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .from(disc, { scale: .2, autoAlpha: 0, duration: .6, ease: 'expo.out' }, .15)
      .add(jiggle(disc, .8), .75)
      .from('.disc__film', { rotation: -120, duration: 1.8, ease: 'expo.out' }, .15)
      // Скидка появляется целиком, без счётчика
      .from(['.disc__pre', '.disc__num', '.disc__post'], { yPercent: 40, autoAlpha: 0, stagger: .1, duration: .8 }, .5)
      .from('.labs__lead', { y: 12, autoAlpha: 0, duration: .6 }, .6)
      .from('.labnames li', { y: 40, scale: .7, autoAlpha: 0, stagger: .08, duration: .8, ease: 'back.out(1.8)' }, .7)
      .from(['.bonus', '.labs__only', '.labs__info .btn'], { y: 14, autoAlpha: 0, stagger: .1, duration: .7 }, 1)
      .add(() => live(disc, $('.disc__film'), { breath: .012, float: 5, period: 2.9 }));

    gsap.timeline({ scrollTrigger: { trigger: '.checkup', start: 'top 82%' } })
      .from('.checkup', { y: 50, autoAlpha: 0, duration: 1.05, ease: 'expo.out' })
      .from(['.checkup .tag', '.checkup__title', '.checkup__sub'], { y: 16, autoAlpha: 0, stagger: .1, duration: .8 }, .2)
      // Цена появляется целиком; старая цена зачёркивается штрихом
      .from('.price__now', { y: 16, autoAlpha: 0, duration: .8 }, .5)
      .from('.price__old', { autoAlpha: 0, duration: .6 }, .6)
      .fromTo('.price__old s', { '--strike': 0 }, { '--strike': 1, duration: .7, ease: 'power2.inOut' }, .9)
      .from(['.checkup .btn', '.checkup__note'], { y: 14, autoAlpha: 0, stagger: .1, duration: .7 }, .9);

    /* ---------- финал ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } })
      .from('.concept-end__bubble', { scale: .2, autoAlpha: 0, duration: .55, ease: 'expo.out' })
      .add(jiggle('.concept-end__bubble'), .55)
      .from(['.concept-end__title', '.concept-end__text', '.concept-end .btn'], { y: 18, autoAlpha: 0, stagger: .1, duration: .8 }, .2);

    window.addEventListener('load', refresh, { once: true });
  });
})();
