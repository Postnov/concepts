// Айшат Агларова — моушн концепта.
// Фирменная идея «сведение»: её слова — «снятие глубоких напряжений в Теле и Психике, органы находят своё первоначальное положение».
// Каждое ключевое изображение и заголовок появляются «двоящимися» — коралловый и бирюзовый отпечатки смещены, —
// и мягко сходятся в одно чёткое изображение. Без резких эффектов: всё как будто встаёт на своё место.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Отпечатки фото: коралл уходит влево-вниз, бирюза вправо-вверх; затем сводятся в рамку и растворяются
  function converge(shot, tl, at) {
    const [coral, aqua] = $$('.echo', shot);
    tl.fromTo(coral, { x: -30, y: 18, rotation: -3.2, autoAlpha: 0 }, { autoAlpha: 0.78, duration: 0.5, ease: 'power2.out' }, at)
      .fromTo(aqua, { x: 28, y: -16, rotation: 2.8, autoAlpha: 0 }, { autoAlpha: 0.62, duration: 0.5, ease: 'power2.out' }, at + 0.08)
      .to([coral, aqua], { x: 0, y: 0, rotation: 0, duration: 1.6, ease: 'expo.inOut' }, at + 0.45)
      .to([coral, aqua], { autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, at + 1.45);
    return tl;
  }

  // Заголовок: строки поднимаются из-под маски, коралловое «эхо» заголовка сходится с ним и растворяется
  function revealHead(head) {
    const h = $('h2', head);
    const echo = $('.reg__echo', head);
    const split = SplitText.create(h, { type: 'lines', mask: 'lines' });
    gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 82%' }, onComplete: () => split.revert() })
      .from($('.eyebrow', head), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .fromTo(echo, { x: -18, y: 12, autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.4 }, 0.05)
      .from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out' }, 0.2)
      .to(echo, { x: 0, y: 0, duration: 1.3, ease: 'expo.inOut' }, 0.3)
      .to(echo, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 1.25);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('h1.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const nameEcho = $('.hero .reg__echo');
    const heroShot = $('.hero__photo');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo($('.frame', heroShot), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' }, 0.15)
      .from($('img', heroShot), { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.35)
      .from($('.shot__line', heroShot), { scale: 0.92, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 1.2);
    converge(heroShot, intro, 0.2);
    intro
      .from('.hero .kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.45)
      .fromTo(nameEcho, { x: -20, y: 12, autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.45 }, 0.45)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.6)
      .to(nameEcho, { x: 0, y: 0, duration: 1.5, ease: 'expo.inOut' }, 0.75)
      .to(nameEcho, { autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 1.85)
      .from('.hero__motto', { y: 18, autoAlpha: 0, duration: 0.9 }, 1.05)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.fact', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.reg-link', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.45)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.5);

    // Контур-«отпечаток» за фото медленно дышит (краниосакральный ритм — спокойно, едва заметно)
    gsap.to('.hero .shot__line', { scale: 1.022, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.6 });

    // Лёгкий параллакс фото
    gsap.to('.hero__photo img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- заголовки секций ---------- */
    $$('main section .sec-head').forEach(revealHead);

    /* ---------- 2. Направления ---------- */
    const dirsShot = $('.dirs__photo');
    const dirsTl = gsap.timeline({ scrollTrigger: { trigger: dirsShot, start: 'top 80%' } })
      .fromTo($('.frame', dirsShot), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0)
      .from($('img', dirsShot), { scale: 1.25, duration: 1.9, ease: 'expo.out' }, 0.1);
    converge(dirsShot, dirsTl, 0.05);

    gsap.from('.dirs__word', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.dirs__list', start: 'top 84%' } });
    // Пункты приходят чуть смещёнными в разные стороны и встают ровно в колонку
    $$('.dir').forEach((li, i) => {
      gsap.from(li, {
        x: i % 2 ? 26 : -26, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: li, start: 'top 92%' },
      });
    });

    /* ---------- 3. Стоимость ---------- */
    const cards = $$('.card');
    const cardsTl = gsap.timeline({ scrollTrigger: { trigger: '.cards', start: 'top 84%' } });
    cards.forEach((card, i) => {
      const at = i * 0.18;
      cardsTl
        .from(card, { y: 46, autoAlpha: 0, duration: 1.05, ease: 'expo.out' }, at)
        .fromTo($('.card__echo', card), { x: i ? 16 : -16, y: 14, rotation: i ? 2 : -2, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, at + 0.1)
        .to($('.card__echo', card), { x: 0, y: 0, rotation: 0, duration: 1.2, ease: 'expo.inOut' }, at + 0.35)
        .to($('.card__echo', card), { autoAlpha: 0, duration: 0.6 }, at + 1.25);
    });
    gsap.from('.price__foot > *', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.price__foot', start: 'top 92%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
