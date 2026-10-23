// Анна Куликова — моушн концепта «марафон-приложение».
// Фирменная идея: «8 недель как сторис» — первый экран это сторис с её фото; 8 полосок поверх фото заполняются
// салатовым по одной (≈0,3 с на неделю), счётчик недель тикает 1 → 8 в такт, после восьмой кнопка группы марафона
// заливается салатовым и один раз мягко увеличивается.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- Карусель результатов: прогресс-сторис, стрелки, ленивые картинки, автолистание ----------
     Работает всегда (это интерфейс, а не украшение); автолистание — только когда моушн разрешён. */
  const reel = (() => {
    const track = $('.carousel');
    if (!track) return null;
    const slides = $$('.slide', track);
    const fills = $$('.reel-bar__segs i');
    const prev = $('.nav-btn[data-dir="-1"]');
    const next = $('.nav-btn[data-dir="1"]');
    const smooth = animate ? 'smooth' : 'auto';
    const max = () => Math.max(1, track.scrollWidth - track.clientWidth);
    // позиции «защёлкивания» каждого слайда
    const stops = () => slides.map(el => Math.min(el.offsetLeft - slides[0].offsetLeft, max()));

    // Прогресс: текущая позиция в «слайдах» 0…N-1, сегмент i заполнен, когда до него долистали
    const paint = () => {
      const f = (track.scrollLeft / max()) * (fills.length - 1);
      fills.forEach((el, i) => el.style.setProperty('--p', Math.min(1, Math.max(0, f - i + 1)).toFixed(3)));
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max() - 4;
    };
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
    window.addEventListener('resize', paint);
    track.addEventListener('load', paint, true);   // догрузились картинки — ширина ленты могла измениться
    paint();

    const go = dir => {
      const x = track.scrollLeft;
      const list = stops();
      let to;
      if (dir > 0) { to = list.find(v => v > x + 4); if (to === undefined) to = 0; }
      else { to = [...list].reverse().find(v => v < x - 4); if (to === undefined) to = 0; }
      track.scrollTo({ left: to, behavior: smooth });
    };

    // Пользователь сам листает — автолистание выключаем насовсем
    let user = false;
    const stopAuto = () => { user = true; };
    [prev, next].forEach(b => b.addEventListener('click', () => { stopAuto(); go(Number(b.dataset.dir)); }));
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(t => track.addEventListener(t, stopAuto, { passive: true }));

    // Слайды лежат в data-src: на медленной сети они отнимали канал у шрифтов и GSAP (текст прыгал при показе).
    // Ставим src, когда лента подъезжает к экрану
    let inView = false;
    let hover = false;
    track.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    track.addEventListener('pointerleave', () => { hover = false; });
    // …но только после load: шрифты и первый экран важнее, иначе на медленной сети шрифт приезжает поздно и текст прыгает
    const eager = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      $$('img', track).forEach(img => { img.loading = 'eager'; if (img.dataset.src) img.src = img.dataset.src; });
      eager.disconnect();
    }, { rootMargin: '600px 0px' });
    if (document.readyState === 'complete') eager.observe(track);
    else window.addEventListener('load', () => eager.observe(track), { once: true });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.6 }).observe(track);

    // Автолистание, как на её таплинке (там слайдер едет сам): шаг раз в 2,6 с, пока лента на экране
    if (animate) setInterval(() => { if (inView && !user && !hover && !document.hidden) go(1); }, 2600);
    return { paint };
  })();

  // Без GSAP / reduced motion — статичная страница: сегменты заполнены, кнопка залита, тумблеры включены
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(el, trigger) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const rise = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 24, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Первый экран ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const segs = $$('.story__seg i');
    const storyBtn = $('.btn--story');
    const weeks = $('[data-weeks]');
    const weeksWord = weeks.nextElementSibling;
    // пока недели тикают — «1 неделя, 2 недели… 5 недель»; в конце её текст «8 недель»
    const tick = n => {
      weeks.textContent = String(n);
      weeksWord.textContent = n === 1 ? 'неделя' : n < 5 ? 'недели' : 'недель';
    };

    gsap.set(segs, { scaleX: 0 });
    gsap.set(storyBtn, { '--fill': 0 });

    // Сначала фото и заголовок (0–1,2 с), потом сторис одна, без конкурентов: неделя за неделей
    const SEG = 0.3;                  // длительность одного сегмента-«недели»
    const STORY_AT = 1.25;            // сторис стартует, когда заголовок, лид и плитки уже на месте
    const STORY_END = STORY_AT + SEG * 8;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); lead.revert(); },
    });
    intro
      // счётчик недель начинается с первой недели (плитка ещё скрыта — без вспышки «8 → 1»)
      .call(() => tick(1), null, 0)
      .from('[data-concept]', { yPercent: -100, duration: 0.5 }, 0)
      .fromTo('.hero__card',
        { clipPath: 'inset(0% 0% 100% 0% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.05, ease: 'expo.inOut' }, 0.05)
      // фото почти не увеличиваем: исходник маленький, крупный зум показал бы мыло
      .from('.hero__photo', { scale: 1.06, duration: 1.6, ease: 'expo.out' }, 0.15)
      .from('.story-ui', { autoAlpha: 0, y: -8, duration: 0.6 }, 0.5)
      .from('.badge', { autoAlpha: 0, scale: 0.7, rotate: -8, duration: 0.7, ease: 'back.out(1.6)' }, 0.85)
      .from('.tag', { autoAlpha: 0, y: 14, duration: 0.55 }, 0.95)
      .from('.hero .eyebrow', { y: 10, autoAlpha: 0, duration: 0.5 }, 0.3)
      .from(title.chars, { yPercent: 112, stagger: 0.022, duration: 0.85, ease: 'expo.out' }, 0.34)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.75 }, 0.6)
      .from('.stat', { y: 20, autoAlpha: 0, stagger: 0.07, duration: 0.65 }, 0.7)
      .from(storyBtn, { y: 14, autoAlpha: 0, duration: 0.55 }, 0.85)
      // 8 недель как сторис: сегменты по одному, счётчик недель тикает в такт (1 → 8)
      .to(segs, { scaleX: 1, duration: SEG, ease: 'none', stagger: SEG }, STORY_AT);
    for (let i = 1; i < 8; i++) {
      intro.call(() => tick(i + 1), null, STORY_AT + SEG * i)
        .fromTo(weeks, { yPercent: 35 }, { yPercent: 0, duration: 0.24, ease: 'power2.out', immediateRender: false }, STORY_AT + SEG * i);
    }
    intro
      // после восьмой недели кнопка заливается салатовым и один раз мягко увеличивается
      .to(storyBtn, { '--fill': 1, duration: 0.45, ease: 'power2.inOut' }, STORY_END)
      .to(storyBtn, { scale: 1.04, duration: 0.32, ease: 'power2.out', yoyo: true, repeat: 1 }, STORY_END + 0.3);

    /* ---------- 2. Результаты ---------- */
    revealLines('.results h2', '.results .sec-head');
    rise('.results .sec-sub', '.results .sec-head', { delay: 0.15 });
    // сегменты прогресса «прорастают» слева направо, стрелки проявляются, слайды въезжают справа
    gsap.timeline({ scrollTrigger: { trigger: '.reel-bar', start: 'top 88%' } })
      .from('.reel-bar__segs span', { scaleX: 0, transformOrigin: 'left center', duration: 0.5, stagger: 0.035, ease: 'power2.out' })
      // анимируем обёртку, а не сами кнопки: у кнопок свой CSS (hover-scale, прозрачность disabled)
      .from('.reel-bar__nav', { x: 16, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.2);
    gsap.from('.slide', {
      x: 70, autoAlpha: 0, duration: 1.05, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.carousel', start: 'top 86%' },
    });
    gsap.from('.slide__cta', {
      y: 12, autoAlpha: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.carousel', start: 'top 70%' }, delay: 0.6,
    });

    /* ---------- 3. Что вас ждёт ---------- */
    rise('.program__lead', '.program__intro');
    rise('.program__text > *', '.program__text');
    revealLines('.program h2', '.program__main');

    // карточки «Что вас ждёт» приходят сверху, как пуш-уведомления в приложении
    const feats = $$('.feature');
    gsap.set(feats, { y: -16, scale: 0.96, autoAlpha: 0 });
    ScrollTrigger.batch(feats, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, scale: 1, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' });
        gsap.from(els.map(el => $('.feature__icon', el)), { scale: 0.4, rotate: -20, duration: 0.7, stagger: 0.08, delay: 0.15, ease: 'back.out(2.2)' });
      },
    });
    rise('.imagine', '.imagine');
    rise('.extra', '.extra');
    gsap.from('.extra__icon svg', { rotate: -35, scale: 0.5, duration: 0.9, ease: 'back.out(2)', scrollTrigger: { trigger: '.extra', start: 'top 85%' } });
    rise('.row-link', '.row-link');

    /* ---------- 4. Меню отдельно ---------- */
    revealLines('.shop h2', '.shop__side');
    gsap.timeline({ scrollTrigger: { trigger: '.shop__photo', start: 'top 85%' } })
      .fromTo('.shop__photo',
        { clipPath: 'inset(0% 0% 100% 0% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.shop__photo img', { scale: 1.3, duration: 1.7, ease: 'expo.out' }, 0.1);
    rise('.shop__hint', '.shop__hint');
    const rows = $$('.menu-row');
    gsap.set(rows, { y: 18, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
        gsap.from(els.map(el => $('.chip', el)), { scale: 0.7, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.12, ease: 'back.out(2)' });
      },
    });

    /* ---------- 5. Записаться: тумблеры выгод включаются по одному ---------- */
    revealLines('.join h2', '.join__main');
    rise('.join .btn', '.join .btn');
    const toggles = $$('.toggle');
    toggles.forEach(t => t.classList.remove('is-on'));
    rise(toggles, '.toggles', { stagger: 0.08, duration: 0.7 });
    ScrollTrigger.create({
      trigger: '.toggles', start: 'top 72%', once: true,
      onEnter: () => toggles.forEach((t, i) => gsap.delayedCall(0.45 + i * 0.32, () => t.classList.add('is-on'))),
    });
    rise('.treasure', '.treasure');
    // её список — как задачи в приложении: пункты отмечаются листиком по очереди и «загораются»
    const leafs = gsap.timeline({ scrollTrigger: { trigger: '.leaf-list', start: 'top 80%' } });
    $$('.leaf-list li').forEach((li, i) => {
      leafs
        .from(li, { opacity: 0.35, duration: 0.35, ease: 'power1.out' }, i * 0.26)
        .from($('svg', li), { scale: 0, rotate: -50, duration: 0.5, ease: 'back.out(2.2)' }, i * 0.26);
    });

    /* ---------- 6. Обо мне ---------- */
    rise('.profile', '.profile', { y: 40, duration: 1 });
    // кольцо вокруг фото прорисовывается, как кольцо непросмотренной сторис
    gsap.timeline({ scrollTrigger: { trigger: '.profile', start: 'top 78%' } })
      .from('.profile__ava', { scale: 0.85, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.15)
      .from('.profile__ring circle', { strokeDashoffset: 1, duration: 1.2, ease: 'power2.inOut' }, 0.3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
