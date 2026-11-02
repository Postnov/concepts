// Школа речи «Глаголь» — моушн концепта.
// Фирменная идея — голосовая волна: за фигурой в hero «звучит» речь — полосы расходятся от неё в обе стороны,
// как звук; заголовок проявляется по словам, и каждое слово даёт всплеск волны, будто его произносят.
// Мини-волны в секциях — тот же мотив: строки клуба «произносятся» по очереди.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- полосы волн строятся всегда (и в статике) ---------- */
  // Застывшая «фраза»: высоты для статики и для мини-волн
  const still = (i, n) => {
    const c = Math.abs(i - (n - 1) / 2) / (n / 2);
    return Math.max(0.12, (0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.53))) * (1 - c * 0.6));
  };
  const fill = (el, n) => {
    el.textContent = '';
    const bars = [];
    for (let i = 0; i < n; i++) { const b = document.createElement('i'); el.appendChild(b); bars.push(b); }
    return bars;
  };
  $$('.mini-wave').forEach(el => {
    const n = Number(el.dataset.bars) || 9;
    fill(el, n).forEach((b, i) => { b.style.transform = `scaleY(${still(i, n).toFixed(3)})`; });
  });

  const waveEl = $('[data-wave]');
  let bars = [];
  const buildWave = () => {
    const step = parseFloat(getComputedStyle(waveEl).getPropertyValue('--step')) || 7;
    let n = Math.max(25, Math.floor(waveEl.clientWidth / step));
    if (n % 2 === 0) n -= 1; // нечётное число: центральная полоса одна
    bars = fill(waveEl, n);
    bars.forEach((b, i) => { b.style.transform = `scaleY(${still(i, n).toFixed(3)})`; });
  };
  buildWave();

  if (!animate) return;

  /* ---------- живая волна: история амплитуд расходится от центра ---------- */
  const voice = {
    buf: [], cur: [], half: 0, boost: 0, phrase: 0, pause: 0, syl: 0, calm: 0, energy: 0, on: true,
    reset() {
      this.half = Math.ceil(bars.length / 2);
      this.buf = new Array(this.half).fill(0.04);
      this.cur = bars.map(() => 0.06);
    },
    // Новый отсчёт раз в 60 мс: слоги внутри фраз, паузы между ними, всплески от слов заголовка
    sample() {
      if (this.boost > 0) { this.boost--; return 0.78 + Math.random() * 0.22; }
      if (this.pause > 0) { this.pause--; return 0.03 + Math.random() * 0.03; }
      if (this.phrase <= 0) { this.phrase = 16 + (Math.random() * 26 | 0); this.pause = 5 + (Math.random() * 9 | 0); }
      this.phrase--;
      this.syl += 0.85 + Math.random() * 0.6;
      const v = (0.16 + 0.55 * Math.abs(Math.sin(this.syl))) * (0.65 + Math.random() * 0.35);
      return v * (this.calm + this.energy);
    },
    say(n = 3) { this.boost = Math.max(this.boost, n); },
  };
  voice.reset();
  let acc = 0;
  const tick = (time, delta) => {
    if (!voice.on) return;
    acc += delta;
    while (acc > 60) { acc -= 60; voice.buf.unshift(voice.sample()); voice.buf.length = voice.half; }
    voice.energy *= 0.94;
    const mid = (bars.length - 1) / 2;
    for (let i = 0; i < bars.length; i++) {
      const k = Math.min(voice.half - 1, Math.round(Math.abs(i - mid)));
      const target = Math.max(0.05, voice.buf[k] * (1 - (k / voice.half) * 0.35));
      voice.cur[i] += (target - voice.cur[i]) * 0.28;
      bars[i].style.transform = `scaleY(${voice.cur[i].toFixed(3)})`;
    }
  };

  // Ресайз по ширине — пересобрать полосы
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - lastW) < 2) return;
    lastW = innerWidth;
    buildWave(); voice.reset();
  });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Мини-волна «произносит»: полосы вырастают от центра
  const speak = (el, scrollTrigger) => gsap.from($$('i', el), {
    scaleY: 0.04, duration: 0.8, ease: 'expo.out', stagger: { each: 0.03, from: 'center' },
    ...(scrollTrigger ? { scrollTrigger: { trigger: el, start: 'top 88%' } } : {}),
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const brand = SplitText.create('.brand__word', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const title = SplitText.create('.hero__title', { type: 'words', wordsClass: 'sw', mask: 'words' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    voice.calm = 0;
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { brand.revert(); title.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(brand.chars, { yPercent: 110, stagger: 0.04, duration: 0.9, ease: 'expo.out' }, 0.15)
      .from('.brand__word', { borderBottomColor: 'rgba(63,174,95,0)', duration: 0.8 }, 0.5)
      .from(['.brand__sub', '.brand__geo'], { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.45)
      .from('.hero__glow', { scale: 0.55, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.1)
      .from('.hero__photo', { yPercent: 9, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.25)
      .to(voice, { calm: 0.55, duration: 1.2, ease: 'sine.inOut' }, 0.4);
    // Слова заголовка «произносятся»: каждое — всплеск волны
    title.words.forEach((w, i) => {
      const at = 0.75 + i * 0.16;
      intro.from(w, { yPercent: 110, duration: 0.9, ease: 'expo.out' }, at).call(() => voice.say(4), null, at);
    });
    intro
      .from(lead.lines, { yPercent: 105, stagger: 0.08, duration: 0.9 }, 1.55)
      .from('.facts li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.7)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.8);

    gsap.ticker.add(tick);
    // Волна живёт, только пока hero на экране
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => { voice.on = s.isActive; } });
    // Прокрутка добавляет голосу силы
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: s => { voice.energy = Math.min(0.5, voice.energy + Math.abs(s.getVelocity()) / 9000); },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.hero .btn, .ticket .btn').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 1.3 });
    });

    /* Параллакс фигуры: чуть медленнее прокрутки */
    gsap.to('.hero__figure', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Клуб ---------- */
    revealLines('.club .sec-title', '.club .sec-head');
    gsap.from('.club .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.club .sec-head', start: 'top 84%' } });
    gsap.from('.club__lead', { y: 18, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.club__lead', start: 'top 88%' } });
    // Строки «произносятся» по очереди: сначала волна, потом слова
    const lines = $$('.spoken li');
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.spoken', start: 'top 80%' } });
    lines.forEach((li, i) => {
      const at = i * 0.45;
      tl.from(li, { borderBottomColor: 'rgba(106,51,180,0)', duration: 0.6 }, at)
        .add(speak($('.mini-wave', li)), at)
        .from($('.spoken__text', li), { x: -18, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, at + 0.15);
    });
    gsap.timeline({ scrollTrigger: { trigger: '.club__media', start: 'top 80%' } })
      .fromTo('.frame--club', { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.frame--club img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.ticket', { y: 60, rotate: -4, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from('.ticket > *', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.85);
    gsap.from('.dm > *', {
      y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.dm', start: 'top 90%' },
    });
    gsap.from('.dm__bubble', {
      scale: 0.6, transformOrigin: '0% 100%', duration: 0.9, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.dm', start: 'top 90%' },
    });

    /* ---------- 3. Индивидуальная работа ---------- */
    revealLines('.solo .sec-title', '.solo .sec-head');
    gsap.from(['.solo .eyebrow', '.solo .sec-sub'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '.solo .sec-head', start: 'top 84%' } });
    speak($('.mini-wave--line'), true);
    $$('.offer').forEach((card, i) => {
      const photo = $('.offer__photo', card);
      const img = $('img', card);
      const t = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' } });
      t.from(card, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .fromTo(card.classList.contains('offer--arch') ? img : photo,
          { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
        .from(img, { scale: 1.2, duration: 1.8, ease: 'expo.out' }, 0.2)
        .from($$('.offer__body > *, .ticks li', card), { y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, 0.45);
    });

    /* ---------- финал ---------- */
    speak($('.mini-wave--end'), true);
    gsap.from('.concept-end > :not(.mini-wave)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
